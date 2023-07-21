import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as nodeJsLambda from '@aws-cdk/aws-lambda-nodejs';
import * as pythonLambda from '@aws-cdk/aws-lambda-python';
import * as s3 from '@aws-cdk/aws-s3';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as sns from '@aws-cdk/aws-sns';
import * as lambdaEventSources from '@aws-cdk/aws-lambda-event-sources';
import { getWpApiUrl, FrgBrand, getWpHttpAuth } from './utils/FrgBrand';

export interface WPConfig {
    // This is used as part of caching to keep track of what vesrion of
    // our cache data structure we expect to be working with
    readonly cacheVersion: number;
    readonly cacheTimeoutSeconds?: number;
}

export interface WPProps {
    readonly config: WPConfig;
    readonly removalPolicy: cdk.RemovalPolicy;
    readonly releaseSha: string;
    readonly enforceAssetBuilds: boolean;
    readonly brand: FrgBrand;
}

const DEFAULT_CACHE_TIMEOUT_SECONDS = 5 * 60; // 5 minutes

export class WPApi extends cdk.Construct {
    readonly handler: lambda.Function;
    readonly imagesOriginConfig: cloudfront.SourceConfiguration;

    constructor(scope: cdk.Construct, id: string, props: WPProps) {
        super(scope, id);

        const tags = cdk.Tags.of(this);
        tags.add('Component', 'WordpressAPI');

        const config = props.config;
        const apiUrl = getWpApiUrl(props.brand);
        const apiBasicAuthDetails = getWpHttpAuth(props.brand);

        const bucket = new s3.Bucket(this, 'WordpressCache', {
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: props.removalPolicy,
        });

        const fetcher = new pythonLambda.PythonFunction(this, 'Fetcher', {
            entry: './backend/wordpress/fetcher',
            index: 'fetcher/__init__.py',
            handler: 'handler',

            runtime: lambda.Runtime.PYTHON_3_8,
            timeout: cdk.Duration.seconds(30),
            environment: {
                API_URL: apiUrl,
                HTTP_BASIC_AUTH_USERNAME: apiBasicAuthDetails.username,
                HTTP_BASIC_AUTH_PASSWORD: apiBasicAuthDetails.password,
                LOG_LEVEL: 'warn',
            },
        });

        const topic = new sns.Topic(this, 'Async');

        const cacheTimeoutSeconds = typeof config.cacheTimeoutSeconds === 'number' ? config.cacheTimeoutSeconds : DEFAULT_CACHE_TIMEOUT_SECONDS;
        const handler = new nodeJsLambda.NodejsFunction(this, 'Handler', {
            entry: './backend/wordpress/api/main.ts',
            handler: 'handler',
            depsLockFilePath: './backend/package-lock.json',
            runtime: lambda.Runtime.NODEJS_14_X,
            timeout: cdk.Duration.seconds(60),
            environment: {
                BUCKET_NAME: bucket.bucketName,
                RERUN_SNS_TOPIC: topic.topicArn,
                FETCHER_LAMBDA: fetcher.functionName,
                CACHE_TIMEOUT: String(cacheTimeoutSeconds * 1000),
                CACHE_VERSION: config.cacheVersion.toString(),
                LOG_LEVEL: 'warn',
                API_URL: apiUrl,
                HTTP_BASIC_AUTH_USERNAME: apiBasicAuthDetails.username,
                HTTP_BASIC_AUTH_PASSWORD: apiBasicAuthDetails.password,
            },
        });

        const oai = new cloudfront.OriginAccessIdentity(this, 'OAI');
        bucket.grantRead(oai, 'images/*');

        this.imagesOriginConfig = {
            s3OriginSource: {
                s3BucketSource: bucket,
                originAccessIdentity: oai,
            },
            behaviors: [
                {
                    defaultTtl: cdk.Duration.seconds(0),
                    pathPattern: 'images/*',
                },
            ],
        };

        handler.addEventSource(new lambdaEventSources.SnsEventSource(topic));

        this.handler = handler;
        topic.grantPublish(handler);
        bucket.grantReadWrite(handler);
        fetcher.grantInvoke(handler);
    }
}
