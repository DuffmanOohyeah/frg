import * as apiGateway from '@aws-cdk/aws-apigateway';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as lambda from '@aws-cdk/aws-lambda';
import * as nodeJsLambda from '@aws-cdk/aws-lambda-nodejs';
import * as cdk from '@aws-cdk/core';
import { FrgBrand } from './utils/FrgBrand';

interface CandidateSearchRedirectorConfigDisabled {
    readonly enabled?: false;
}

interface CandidateSearchRedirectorConfigEnabled {
    readonly enabled: true;
    readonly domain: string;
}

export type CandidateSearchRedirectorConfig = CandidateSearchRedirectorConfigDisabled | CandidateSearchRedirectorConfigEnabled;

interface CandidateSearchRedirectorProps {
    readonly apiName: string;
    readonly targetDomain?: string;
    readonly config?: CandidateSearchRedirectorConfig;
    readonly brand: FrgBrand;
}

export class CandidateSearchRedirector extends cdk.Construct {
    readonly redirectorOriginConfig: cloudfront.SourceConfiguration | undefined;

    constructor(scope: cdk.Construct, id: string, props: CandidateSearchRedirectorProps) {
        super(scope, id);

        const tags = cdk.Tags.of(this);
        tags.add('Component', 'CandidateSearchRedirector');

        if (props.config && props.config.enabled) {
            const redirectToDomain = props.config.domain;

            const fn = new nodeJsLambda.NodejsFunction(this, 'Fn', {
                entry: './backend/candidate-search-redirector/main.ts',
                handler: 'handler',
                depsLockFilePath: './backend/package-lock.json',
                runtime: lambda.Runtime.NODEJS_14_X,
                timeout: cdk.Duration.seconds(10),
                environment: {
                    LOG_LEVEL: 'warn',
                    DOMAIN_REMAPPING_DEFAULT: redirectToDomain,
                    BRAND: props.brand,
                    // TODO: make this work so we can redirect multiple domains, using lambda@edge
                    // DOMAIN_REMAPPING_0_FROM: 'candidate-search.jeffersonfrank.com',
                    // DOMAIN_REMAPPING_0_TO: 'jeffersonfrank.com',
                    // DOMAIN_REMAPPING_1_FROM: 'candidate-search-plumdog.stage.frg-nextgen.co.uk',
                    // DOMAIN_REMAPPING_1_TO: 'plumdog.stage.frg-nextgen.co.uk',
                },
            });

            const api = new apiGateway.LambdaRestApi(this, 'Redirector', {
                handler: fn,
                restApiName: props.apiName,
            });

            this.redirectorOriginConfig = {
                customOriginSource: {
                    domainName: `${api.restApiId}.execute-api.${cdk.Stack.of(this).region}.${cdk.Stack.of(this).urlSuffix}`,
                },
                originPath: `/${api.deploymentStage.stageName}`,
                behaviors: [
                    {
                        isDefaultBehavior: true,
                        allowedMethods: cloudfront.CloudFrontAllowedMethods.ALL,
                        defaultTtl: cdk.Duration.seconds(0),
                        forwardedValues: {
                            queryString: true,
                        },
                    },
                ],
            };
        }
    }
}
