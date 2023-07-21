import * as apiGateway from '@aws-cdk/aws-apigateway';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as lambda from '@aws-cdk/aws-lambda';
import * as nodeJsLambda from '@aws-cdk/aws-lambda-nodejs';
import * as s3 from '@aws-cdk/aws-s3';
import * as secretsManager from '@aws-cdk/aws-secretsmanager';
import * as cdk from '@aws-cdk/core';
import { SopsSecretsManager } from 'sops-secretsmanager-cdk';
import { FrgBrand } from './utils/FrgBrand';

export interface BroadbeanApiConfig {
    readonly enabled?: boolean;
    readonly domain: string;
}

interface BroadbeanApiProps {
    readonly apiName: string;
    readonly secretName: string;
    readonly secretsPath: string;
    readonly bucket: s3.Bucket;
    readonly config?: BroadbeanApiConfig;
    readonly searchLambda: lambda.Function;
    readonly brand: FrgBrand;
}

export class BroadbeanApi extends cdk.Construct {
    readonly apiOriginConfig: cloudfront.SourceConfiguration | undefined;

    constructor(scope: cdk.Construct, id: string, props: BroadbeanApiProps) {
        super(scope, id);

        const tags = cdk.Tags.of(this);
        tags.add('Component', 'BroadbeanAPI');

        if (props.config && props.config.enabled) {
            const secret = new secretsManager.Secret(this, 'Secret', {
                secretName: props.secretName,
                description: 'Broadbean API username and password',
            });

            // This takes secrets from the sops file at
            // props.secretsPath and puts them into the SecretsManager
            // secret. See
            // https://github.com/isotoma/sops-secretsmanager-cdk.
            new SopsSecretsManager(this, 'Secrets', {
                path: props.secretsPath,
                secret,
                mappings: {
                    username: {
                        path: ['broadbean', 'username'],
                    },
                    password: {
                        path: ['broadbean', 'password'],
                    },
                },
                fileType: 'yaml',
            });

            const fn = new nodeJsLambda.NodejsFunction(this, 'Fn', {
                entry: './backend/search-ingestion/broadbean-api/main.ts',
                handler: 'handler',
                depsLockFilePath: './backend/package-lock.json',
                runtime: lambda.Runtime.NODEJS_14_X,
                timeout: cdk.Duration.seconds(30),
                environment: {
                    BROADBEAN_CREDENTIALS_SECRET_ARN: secret.secretArn,
                    BROADBEAN_CREDENTIALS_MAX_CACHE_AGE: '600',
                    S3_PREFIX: 'jobs',
                    S3_BUCKET: props.bucket.bucketName,
                    BRAND: props.brand,
                    DOMAIN_NAME: props.config.domain,
                    SEARCH_LAMBDA_NAME: props.searchLambda.functionArn,
                },
            });

            props.searchLambda.grantInvoke(fn);
            secret.grantRead(fn);
            props.bucket.grantWrite(fn, 'jobs/*');

            const api = new apiGateway.LambdaRestApi(this, 'API', {
                handler: fn,
                restApiName: props.apiName,
            });

            this.apiOriginConfig = {
                customOriginSource: {
                    domainName: `${api.restApiId}.execute-api.${cdk.Stack.of(this).region}.${cdk.Stack.of(this).urlSuffix}`,
                },
                originPath: `/${api.deploymentStage.stageName}/ingest`,
                behaviors: [
                    {
                        allowedMethods: cloudfront.CloudFrontAllowedMethods.ALL,
                        defaultTtl: cdk.Duration.seconds(0),
                        pathPattern: '_broadbean/',
                    },
                ],
            };
        }
    }
}
