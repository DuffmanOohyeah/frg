import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as nodeJsLambda from '@aws-cdk/aws-lambda-nodejs';
import { FrgBrand } from './utils/FrgBrand';
import { SearchLambda } from './search';
import { SearchEngineOutputs } from './search-engine';
import * as events from '@aws-cdk/aws-events';
import * as lambda from '@aws-cdk/aws-lambda';
import * as eventsTargets from '@aws-cdk/aws-events-targets';

interface IndeedCronEnabled {
    readonly enabled: true;
    readonly schedule: events.CronOptions;
}

interface IndeedCronDisabled {
    readonly enabled: false;
}

export interface IndeedSitemapConfig {
    enabled: boolean;
    domain: string;
    readonly cron?: IndeedCronEnabled | IndeedCronDisabled;
}

interface IndeedSitemapProps {
    readonly search: SearchLambda;
    readonly searchEngineOutputs: SearchEngineOutputs;
    readonly brand: FrgBrand;
    readonly apiName: string;
    readonly config?: IndeedSitemapConfig;
}

export class IndeedSitemap extends cdk.Construct {
    readonly apiOriginConfig: cloudfront.SourceConfiguration | undefined;
    readonly indeedSitemapLambda: lambda.Function;

    constructor(scope: cdk.Construct, id: string, props: IndeedSitemapProps) {
        super(scope, id);
        if (props.searchEngineOutputs.enabled && props.config?.enabled) {
            // indeed sitemap builder

            const indeedSitemapBucket = new s3.Bucket(this, 'indeedSitemapBucket');

            const indeedSitemapLambda = new nodeJsLambda.NodejsFunction(this, 'IndeedSitemap', {
                timeout: cdk.Duration.minutes(15),
                depsLockFilePath: './backend/package-lock.json',
                runtime: lambda.Runtime.NODEJS_14_X,
                entry: './backend/indeed-sitemap/main.ts',
                memorySize: 1024,
                environment: {
                    LOG_LEVEL: 'info',
                    S3_BUCKET: indeedSitemapBucket.bucketName,
                    BRAND: props.brand,
                    SEARCH_LAMBDA_NAME: props.search.searchLambda.functionName,
                    HOSTING_DOMAIN: props.config.domain,
                },
                handler: 'main',
            });
            indeedSitemapBucket.grantReadWrite(indeedSitemapLambda);
            props.search.searchLambda.grantInvoke(indeedSitemapLambda);

            const oai = new cloudfront.OriginAccessIdentity(this, 'indeedOAI');
            indeedSitemapBucket.grantRead(oai, 'indeed');

            if (props.config.cron?.enabled) {
                const emailAlertsRule = new events.Rule(this, 'IndeedCron', {
                    schedule: events.Schedule.cron(props.config.cron.schedule),
                });
                emailAlertsRule.addTarget(new eventsTargets.LambdaFunction(indeedSitemapLambda));
            }

            this.apiOriginConfig = {
                s3OriginSource: {
                    s3BucketSource: indeedSitemapBucket,
                    originAccessIdentity: oai,
                },
                behaviors: [
                    {
                        defaultTtl: cdk.Duration.seconds(0),
                        pathPattern: 'indeed',
                    },
                ],
            };
        }
    }
}
