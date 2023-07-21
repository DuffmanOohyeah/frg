import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3notifications from '@aws-cdk/aws-s3-notifications';
import * as iam from '@aws-cdk/aws-iam';
import * as events from '@aws-cdk/aws-events';
import * as eventsTargets from '@aws-cdk/aws-events-targets';
import * as lambda from '@aws-cdk/aws-lambda';
import * as nodeJsLambda from '@aws-cdk/aws-lambda-nodejs';
import * as elasticsearch from '@aws-cdk/aws-elasticsearch';
import { ElasticsearchSettings } from 'es-settings-cdk';
import { FrgBrand } from './utils/FrgBrand';
import { RuleTargetInput } from '@aws-cdk/aws-events';

interface ReindexConfigEnabled {
    readonly enabled: true;
    readonly cron: events.CronOptions;
}

interface ReindexConfigDisabled {
    readonly enabled: false;
}

type ReindexConfig = ReindexConfigEnabled | ReindexConfigDisabled;

interface SearchEngineDisabledConfig {
    readonly disabled: true;
}

interface DeleteOlderThanDisabledConfig {
    readonly enabled: false;
}

interface DeleteOlderThanEnabledConfig {
    readonly olderThanMonths: number;
    readonly enabled: true;
    readonly schedule: events.CronOptions;
}

export type DeleteOlderThanConfig = DeleteOlderThanDisabledConfig | DeleteOlderThanEnabledConfig;

interface SearchEngineEnabledConfig {
    readonly disabled?: false;
    readonly instanceCount?: number;
    readonly instanceType?: string;
    readonly jobReindex?: ReindexConfig;
    readonly candidateReindex?: ReindexConfig;
    readonly deleteOlderThan?: DeleteOlderThanConfig;
    // If the ES domain breaks in an unrecoverable way (see
    // https://isotoma.atlassian.net/browse/DEVOPS-644), we might just
    // want to throw it away and reindex into a new domain. Set or
    // unset this to force recreation of a new domain. The old one
    // will go away.
    readonly useAlternateEsDomain?: boolean;
}

type SearchEngineEnabledConfigKeysWithDefaults = 'instanceCount' | 'instanceType';
type SearchEngineEnabledConfigResolved = Omit<SearchEngineEnabledConfig, SearchEngineEnabledConfigKeysWithDefaults> &
    Required<Pick<SearchEngineEnabledConfig, SearchEngineEnabledConfigKeysWithDefaults>>;

export type SearchEngineConfig = SearchEngineDisabledConfig | SearchEngineEnabledConfig;

interface SearchEngineProps {
    readonly removalPolicy: cdk.RemovalPolicy;
    readonly config?: SearchEngineConfig;
    readonly brand: FrgBrand;
}

const defaultSettings = {
    instanceCount: 1,
    instanceType: 't3.small.elasticsearch',
};

interface SearchEngineEnabledOutputs {
    readonly enabled: true;
    readonly bucket: s3.Bucket;
    readonly esDomain: elasticsearch.CfnDomain;
}

interface SearchEngineDisabledOutputs {
    readonly enabled: false;
    readonly bucket: undefined;
    readonly esDomain: undefined;
}

export type SearchEngineOutputs = SearchEngineEnabledOutputs | SearchEngineDisabledOutputs;

export class SearchEngine extends cdk.Construct {
    readonly outputs: SearchEngineOutputs;

    constructor(scope: cdk.Construct, id: string, props: SearchEngineProps) {
        super(scope, id);

        const tags = cdk.Tags.of(this);
        tags.add('Component', 'SearchEngine');

        if (props.config && props.config.disabled) {
            this.outputs = {
                bucket: undefined,
                esDomain: undefined,
                enabled: false,
            };
            return;
        }

        const conf: SearchEngineEnabledConfigResolved = {
            ...defaultSettings,
            ...(props.config || { disabled: false }),
        };

        const bucket = new s3.Bucket(this, 'SearchEngineStorage', {
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: props.removalPolicy,
            versioned: true,
        });

        const esDomain = new elasticsearch.CfnDomain(this, `Search${conf.useAlternateEsDomain ? 'Alt' : ''}`, {
            encryptionAtRestOptions: {
                // Because all data is public anyway, no value in
                // storing encrypted at rest, especially as this would
                // mean not using t2 instances, so not using smaller
                // than a large instance.
                enabled: false,
            },
            ebsOptions: {
                ebsEnabled: true,
                volumeSize: 10,
            },
            elasticsearchVersion: '7.4',
            elasticsearchClusterConfig: {
                instanceType: conf.instanceType,
                instanceCount: conf.instanceCount,
                zoneAwarenessEnabled: conf.instanceCount > 1,
            },
        });

        this.outputs = {
            enabled: true,
            bucket,
            esDomain,
        };

        new ElasticsearchSettings(this, 'ESConfig', {
            esDomain: esDomain,
            clusterSettings: {
                // Do not automatically create a new index when a
                // document is indexed - this means that we can catch
                // the error and create the index *with the right
                // settings*, then retry indexing.
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'action.auto_create_index': 'false',
            },
        });

        const lambdaShared = {
            depsLockFilePath: './backend/package-lock.json',
            runtime: lambda.Runtime.NODEJS_14_X,
            timeout: cdk.Duration.seconds(30),
            LOG_LEVEL: 'warn',
        };

        const lambdaSharedEnvironment = {
            S3_BUCKET: bucket.bucketName,
            JOBS_S3_PREFIX: 'jobs/',
            JOBS_S3_FILENAME: 'job.xml',
            CANDIDATES_S3_PREFIX: 'candidates/',
            CANDIDATES_S3_FILENAME: 'advert.json',
        };

        /* istanbul ignore next */
        const emptyCommandsFunction = () => [];

        const indexShared = {
            ...lambdaShared,
            entry: './backend/search-ingestion/s3-to-es/main.ts',
            environment: {
                ...lambdaSharedEnvironment,
                ES_HOST: esDomain.attrDomainEndpoint,
                JOBS_INDEX_NAME: 'jobs',
                CANDIDATES_INDEX_NAME: 'candidates',
                BRAND: props.brand,
            },
            bundling: {
                commandHooks: {
                    beforeBundling: emptyCommandsFunction,
                    beforeInstall: emptyCommandsFunction,
                    /* istanbul ignore next */
                    afterBundling(inputDir: string, outputDir: string): string[] {
                        return [`cp -R ${inputDir}/search-ingestion/s3-to-es/synonyms ${outputDir}/synonyms`];
                    },
                },
                nodeModules: ['@elastic/elasticsearch'],
            },
        };

        const jobIndex = new nodeJsLambda.NodejsFunction(this, 'JobIndex', {
            ...indexShared,
            handler: 'jobHandler',
        });

        jobIndex.addToRolePolicy(
            new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                resources: [`${esDomain.attrArn}/jobs*`],
                actions: ['es:ESHttp*'],
            }),
        );
        bucket.grantRead(jobIndex, 'jobs/*');
        bucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3notifications.LambdaDestination(jobIndex), {
            prefix: 'jobs/',
            suffix: '/job.xml',
        });
        bucket.addEventNotification(s3.EventType.OBJECT_REMOVED, new s3notifications.LambdaDestination(jobIndex), {
            prefix: 'jobs/',
            suffix: '/job.xml',
        });

        const candidateIndex = new nodeJsLambda.NodejsFunction(this, 'CandidateIndex', {
            ...indexShared,
            handler: 'candidateHandler',
        });

        candidateIndex.addToRolePolicy(
            new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                resources: [`${esDomain.attrArn}/candidates*`],
                actions: ['es:ESHttp*'],
            }),
        );
        bucket.grantRead(candidateIndex, 'candidates/*');
        bucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3notifications.LambdaDestination(candidateIndex), {
            prefix: 'candidates/',
            suffix: '/advert.json',
        });
        bucket.addEventNotification(s3.EventType.OBJECT_REMOVED, new s3notifications.LambdaDestination(candidateIndex), {
            prefix: 'candidates/',
            suffix: '/advert.json',
        });

        const candidateAdvertsUser = new iam.User(this, 'CandidateAdverts');
        bucket.grantWrite(candidateAdvertsUser, 'candidates/*');

        // Deleters
        const deleteOlderThanShared = {
            ...lambdaShared,
            entry: './backend/search-ingestion/delete-older-than/main.ts',
            environment: {
                ES_HOST: esDomain.attrDomainEndpoint,
                JOBS_INDEX_NAME: 'jobs',
                CANDIDATES_INDEX_NAME: 'candidates',
            },
            bundling: {
                nodeModules: ['@elastic/elasticsearch'],
            },
        };

        const jobsDeleteOlderThan = new nodeJsLambda.NodejsFunction(this, 'JobsDeleteOlderThan', {
            ...deleteOlderThanShared,
            handler: 'jobHandler',
        });
        jobsDeleteOlderThan.addToRolePolicy(
            new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                resources: [`${esDomain.attrArn}/jobs*`],
                actions: ['es:ESHttp*'],
            }),
        );

        const candidatesDeleteOlderThan = new nodeJsLambda.NodejsFunction(this, 'CandidatesDeleteOlderThan', {
            ...deleteOlderThanShared,
            handler: 'candidateHandler',
        });
        candidatesDeleteOlderThan.addToRolePolicy(
            new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                resources: [`${esDomain.attrArn}/candidates*`],
                actions: ['es:ESHttp*'],
            }),
        );

        // Delete old than cron
        if (conf.deleteOlderThan?.enabled) {
            const deleteOlderThanRule = new events.Rule(this, 'DeleteOlderThanCron', {
                schedule: events.Schedule.cron(conf.deleteOlderThan.schedule),
            });
            deleteOlderThanRule.addTarget(new eventsTargets.LambdaFunction(jobsDeleteOlderThan, { event: RuleTargetInput.fromObject({ olderThanMonths: conf.deleteOlderThan.olderThanMonths }) }));
        }

        // Reindexers
        const reindexShared = {
            ...lambdaShared,
            // reindex takes longer than 30s
            timeout: cdk.Duration.minutes(15),
            entry: './backend/search-ingestion/reindex/main.ts',
            environment: {
                ...lambdaSharedEnvironment,
                CANDIDATES_INDEX_LAMBDA_ARN: candidateIndex.functionArn,
                JOBS_INDEX_LAMBDA_ARN: jobIndex.functionArn,
                CANDIDATES_DELETE_LAMBDA_ARN: candidatesDeleteOlderThan.functionArn,
                JOBS_DELETE_LAMBDA_ARN: jobsDeleteOlderThan.functionArn,
            },
        };

        const jobReindexAll = new nodeJsLambda.NodejsFunction(this, 'JobReindexAll', {
            ...reindexShared,
            environment: {
                ...reindexShared.environment,
                ...(conf.deleteOlderThan?.enabled && { OLDER_THAN_MONTHS: String(conf.deleteOlderThan.olderThanMonths) }),
            },
            handler: 'jobHandler',
        });
        jobIndex.grantInvoke(jobReindexAll);
        jobsDeleteOlderThan.grantInvoke(jobReindexAll);
        bucket.grantRead(jobReindexAll, 'jobs/*');

        if (conf.jobReindex && conf.jobReindex.enabled) {
            const jobReindexRule = new events.Rule(this, 'JobsReindexRule', {
                schedule: events.Schedule.cron(conf.jobReindex.cron),
            });
            jobReindexRule.addTarget(new eventsTargets.LambdaFunction(jobReindexAll));
        }

        const candidateReindexAll = new nodeJsLambda.NodejsFunction(this, 'CandidateReindexAll', {
            ...reindexShared,
            handler: 'candidateHandler',
        });
        candidateIndex.grantInvoke(candidateReindexAll);
        candidatesDeleteOlderThan.grantInvoke(candidateReindexAll);
        bucket.grantRead(candidateReindexAll, 'candidates/*');

        if (conf.candidateReindex && conf.candidateReindex.enabled) {
            const candidateReindexRule = new events.Rule(this, 'CandidatesReindexRule', {
                schedule: events.Schedule.cron(conf.candidateReindex.cron),
            });
            candidateReindexRule.addTarget(new eventsTargets.LambdaFunction(candidateReindexAll));
        }
    }
}
