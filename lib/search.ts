import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as nodeJsLambda from '@aws-cdk/aws-lambda-nodejs';
import * as iam from '@aws-cdk/aws-iam';
import { SearchEngineOutputs } from './search-engine';
import { FrgBrand } from './utils/FrgBrand';

export interface SearchConfig {
    readonly dummyData?: boolean;
    readonly ignoreExpiryDate?: boolean;
}

export interface SearchLambdaProps {
    readonly config?: SearchConfig;
    readonly searchEngineOutputs: SearchEngineOutputs;
    readonly brand: FrgBrand;
}

export class SearchLambda extends cdk.Construct {
    readonly searchLambda: lambda.Function;

    constructor(scope: cdk.Construct, id: string, props: SearchLambdaProps) {
        super(scope, id);

        const tags = cdk.Tags.of(this);
        tags.add('Component', 'Search');

        const config = props.config;

        const { enabled, esDomain } = props.searchEngineOutputs;

        this.searchLambda = new nodeJsLambda.NodejsFunction(this, 'SearchLambda', {
            entry: './backend/search/main.ts',
            handler: 'handler',
            depsLockFilePath: './backend/package-lock.json',
            runtime: lambda.Runtime.NODEJS_14_X,
            timeout: cdk.Duration.seconds(60),
            memorySize: 512,
            environment: {
                LOG_LEVEL: 'warn',
                DUMMY_DATA: config?.dummyData ? 'true' : '',
                IGNORE_EXPIRY_DATE: config?.ignoreExpiryDate ? 'true' : '',
                ES_ENDPOINT: esDomain ? esDomain.attrDomainEndpoint : '',
                BRAND: props.brand,
            },
            bundling: {
                nodeModules: ['@elastic/elasticsearch'],
            },
        });

        if (enabled && esDomain)
            this.searchLambda.addToRolePolicy(
                new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    resources: [`${esDomain.attrArn}/*`],
                    actions: ['es:ESHttp*'],
                }),
            );
    }
}
