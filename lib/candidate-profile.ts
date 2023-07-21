import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as lambdaEventSources from '@aws-cdk/aws-lambda-event-sources';
import * as nodeJsLambda from '@aws-cdk/aws-lambda-nodejs';
import * as s3 from '@aws-cdk/aws-s3';
import * as secretsManager from '@aws-cdk/aws-secretsmanager';
import * as sns from '@aws-cdk/aws-sns';
import * as cdk from '@aws-cdk/core';
import * as R from 'ramda';
import { SopsSecretsManager } from 'sops-secretsmanager-cdk';
import { HostingConfig, HostingDomainsBaseConfig } from './hosting';

export interface CandidateProfileConfig {
    readonly cacheTimeoutSeconds?: number;
    readonly phoenixLoginUrl?: string;
    readonly cacheVersion?: number;
    readonly daxtraUrl?: string;
    readonly devCorsOrigins?: boolean;
    readonly disableSendCvToPhoenix?: boolean;
    readonly sendJobApplicationsToApplitrak?:
        | {
              enabled: true;
              sendFrom: string; // ses verified email address to send applications from
              sendTo?: string; // send all job applications to an email address instead of using the job email address
          }
        | { enabled: false; sendFrom?: undefined; sendTo?: undefined };
}

interface CandidateProfileProps {
    readonly removalPolicy: cdk.RemovalPolicy;
    readonly secretName: string;
    readonly secretsPath: string;
    readonly hostingConfig: HostingConfig;
    readonly userStateTable: dynamodb.ITable;
    readonly vpc: ec2.IVpc;
    readonly config: CandidateProfileConfig;
    readonly searchLambda: lambda.Function;
    readonly brand: string;
}

const DEFAULT_CACHE_TIMEOUT_SECONDS = 60 * 60 * 24; // 1 day
const DEFAULT_CACHE_VERSION = 1;
const DEV_CORS_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000'];

export class CandidateProfile extends cdk.Construct {
    public readonly candidateLambda: lambda.Function;
    public readonly cvBucket: s3.Bucket;
    constructor(scope: cdk.Construct, id: string, props: CandidateProfileProps) {
        super(scope, id);

        const tags = cdk.Tags.of(this);
        tags.add('Component', 'CandidateProfile');

        let domainsConfig;
        if (props.hostingConfig.domains && props.hostingConfig.domains.enabled) {
            domainsConfig = {
                ...R.omit(['enabled'], props.hostingConfig.domains),
            } as HostingDomainsBaseConfig;
        }

        let aliasNames;

        if (typeof domainsConfig !== 'undefined') {
            aliasNames = this.getAllowedOrigins(domainsConfig);
        }

        const secret = new secretsManager.Secret(this, 'Secret', {
            secretName: props.secretName,
            description: 'Daxtra API username and password',
        });

        // This takes secrets from the sops file at
        // props.secretsPath and puts them into the SecretsManager
        // secret. See
        // https://github.com/isotoma/sops-secretsmanager-cdk.
        new SopsSecretsManager(this, 'Secrets', {
            path: props.secretsPath,
            secret,
            mappings: {
                daxtraUsername: {
                    path: ['candidateProfile', 'daxtraUsername'],
                },
                daxtraPassword: {
                    path: ['candidateProfile', 'daxtraPassword'],
                },
                phoenixLoginUrl: {
                    path: ['candidateProfile', 'phoenixLoginUrl'],
                },
                phoenixUsername: {
                    path: ['candidateProfile', 'phoenixUsername'],
                },
                phoenixPassword: {
                    path: ['candidateProfile', 'phoenixPassword'],
                },
            },
            fileType: 'yaml',
        });

        const allowDevCorsOrigins = !!props.config.devCorsOrigins;

        const bucket = new s3.Bucket(this, 'CvStorageBucket', {
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: props.removalPolicy,
            cors: [
                {
                    allowedMethods: [s3.HttpMethods.PUT],
                    allowedOrigins: [...(aliasNames || []), ...(allowDevCorsOrigins ? DEV_CORS_ORIGINS : [])],
                    allowedHeaders: [
                        'Accept',
                        'Accept-Encoding',
                        'Accept-Language',
                        'Connection',
                        'Content-Length',
                        'Content-Type',
                        'Host',
                        'Origin',
                        'Referer',
                        'Sec-Fetch-Dest',
                        'Sec-Fetch-Mode',
                        'Sec-Fetch-Site',
                        'User-Agent',
                        'Access-Control-Request-Headers',
                        'Access-Control-Request-Method',
                        'Sec-Fetch-Site',
                        'Sec-Fetch-Dest',
                        'Sec-Fetch-Mode',
                    ],
                },
            ],
        });

        bucket.addLifecycleRule({ expiration: cdk.Duration.days(1), prefix: 'temp/' });

        this.cvBucket = bucket;

        const phoenixCacheBucket = new s3.Bucket(this, 'PhoenixCacheBucket', {
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: props.removalPolicy,
        });

        const topic = new sns.Topic(this, 'Async');

        const cacheTimeoutSeconds = typeof props.config.cacheTimeoutSeconds === 'number' ? props.config.cacheTimeoutSeconds : DEFAULT_CACHE_TIMEOUT_SECONDS;
        const candidateProfileLambda = new nodeJsLambda.NodejsFunction(this, 'CandidateProfile', {
            entry: './backend/candidate-profile/main.ts',
            handler: 'handler',
            depsLockFilePath: './backend/package-lock.json',
            runtime: lambda.Runtime.NODEJS_14_X,
            timeout: cdk.Duration.seconds(30),
            environment: {
                LOG_LEVEL: 'warn',
                BRAND: props.brand,
                BUCKET_NAME: bucket.bucketName,
                DAXTRA_CREDENTIALS_SECRET_ARN: secret.secretArn,
                DAXTRA_URL: (props.config && props.config.daxtraUrl) || '',
                PHOENIX_CREDENTIALS_SECRET_ARN: secret.secretArn,
                DYNAMODB_ARN: props.userStateTable.tableArn,
                DYNAMODB_TABLE_NAME: props.userStateTable.tableName,
                CACHE_TIMEOUT: String(cacheTimeoutSeconds * 1000),
                PHOENIX_URL: props.config.phoenixLoginUrl || '',
                RERUN_SNS_TOPIC: topic.topicArn,
                CACHE_VERSION: String(props.config.cacheVersion || DEFAULT_CACHE_VERSION),
                PHOENIX_CACHE_BUCKET: phoenixCacheBucket.bucketName,
                SEARCH_LAMBDA_NAME: props.config.sendJobApplicationsToApplitrak?.enabled ? props.searchLambda.functionName : '',
                SEND_JOB_APPLICATION_FROM: props.config.sendJobApplicationsToApplitrak?.sendFrom || '',
                SEND_JOB_APPLICATION_TO: props.config.sendJobApplicationsToApplitrak?.sendTo || '',
                DISABLE_SEND_CV_TO_PHOENIX: props.config.disableSendCvToPhoenix ? 'TRUE' : '',
            },
            vpc: props.vpc,
        });
        this.candidateLambda = candidateProfileLambda;

        props.searchLambda.grantInvoke(candidateProfileLambda);

        props.userStateTable.grantFullAccess(candidateProfileLambda);
        candidateProfileLambda.addEventSource(new lambdaEventSources.SnsEventSource(topic));
        topic.grantPublish(candidateProfileLambda);

        secret.grantRead(candidateProfileLambda);
        bucket.grantReadWrite(candidateProfileLambda);
        phoenixCacheBucket.grantReadWrite(candidateProfileLambda);

        candidateProfileLambda.addToRolePolicy(
            new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                resources: ['*'],
                actions: ['ses:SendRawEmail'],
            }),
        );
    }

    getAllowedOrigins(domainsConfig: HostingDomainsBaseConfig): string[] | undefined {
        let namesToCreate;
        if (!domainsConfig.subdomainsToCreate || domainsConfig.subdomainsToCreate.length === 0) {
            namesToCreate = ['https://' + domainsConfig.hostedZoneDomainName];
        } else {
            namesToCreate = domainsConfig.subdomainsToCreate.map((subdomain: string): string => `https://${subdomain}.${domainsConfig.hostedZoneDomainName}`);
        }

        const additionalNames = (domainsConfig.additionalDomains || []).map((additionalDomain: string): string => `https://${additionalDomain}`);

        const names = domainsConfig.additionalDomainsOnly ? additionalNames : namesToCreate.concat(additionalNames);

        // Ignoring because this should never happen
        /* istanbul ignore next */
        if (names.length === 0) {
            throw new Error('Tried to get alias configuration with no alias domains');
        }
        return names;
    }
}
