import * as ec2 from '@aws-cdk/aws-ec2';
import * as cdk from '@aws-cdk/core';
import * as cxapi from '@aws-cdk/cx-api';
import { execSync } from 'child_process';
import { SopsSecretsManager } from 'sops-secretsmanager-cdk';
import { AppSyncNestedStack } from './appsync';
import AppSyncApiKeys from './appsync-apikeys';
import { BroadbeanApi, BroadbeanApiConfig } from './broadbean-api';
import { CandidateProfile, CandidateProfileConfig } from './candidate-profile';
import { CandidateSearchRedirector, CandidateSearchRedirectorConfig } from './candidate-search-redirector';
import { Cognito, CognitoConfig } from './cognito';
import Deliveries from './deliveries';
import { DynamoDB, DynamoDBConfig } from './dynamodb';
import { EipVpc, EipVpcConfig } from './eip-vpc';
import { EmailAlerts, EmailAlertsConfig } from './email-alerts';
import EmployerProfile from './employer-profile';
import { Hosting, HostingConfig } from './hosting';
import { IndeedSitemap, IndeedSitemapConfig } from './indeed-sitemap';
import { LinkSiteVisitorToPardotAccount } from './link-site-visitor-to-pardot-account';
import { SearchConfig, SearchLambda } from './search';
import { SearchEngine, SearchEngineConfig } from './search-engine';
import { SSRApi, SSRApiConfig, SSRApiProps } from './ssr-api';
import { filterNils } from './utils';
import { FrgBrand } from './utils/FrgBrand';
import { WPApi, WPConfig } from './wp-api';

export interface FrgStackConfig {
    readonly stackNameOverride?: string;
    readonly cognito?: CognitoConfig;
    readonly dynamoDb?: DynamoDBConfig;
    readonly wordpress: WPConfig;
    readonly ips?: EipVpcConfig;
    readonly secretsFile: string;
    readonly web?: SSRApiConfig;
    readonly hosting?: HostingConfig;
    readonly searchEngine?: SearchEngineConfig;
    readonly broadbeanApi?: BroadbeanApiConfig;
    readonly indeedSitemap?: IndeedSitemapConfig;
    readonly doNotProtectStatefulResources?: boolean;
    readonly doNotEnforceAssetBuilds?: boolean;
    readonly brand: FrgBrand;
    readonly searchApi?: SearchConfig;
    readonly candidateProfile?: CandidateProfileConfig;
    readonly emailAlerts: EmailAlertsConfig;
    readonly candidateSearchRedirector?: CandidateSearchRedirectorConfig;
    readonly vpcLookup?: {
        vpcId: string;
        availabilityZones: string[];
        publicSubnetIds: string[];
        publicSubnetRouteTableIds: string[];
        privateSubnetIds: string[];
        privateSubnetRouteTableIds: string[];
    };
    readonly mainVpc?: 'own' | 'lookup';
    readonly pardotTrackingCode?: {
        piAId: string;
        piCId: string;
    };
    readonly googleTagManagerCode?: string;
    readonly pardotUrl: string;
    readonly environmentType?: 'production' | 'stage' | 'sandbox' | 'dev';
}

export class FrgStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, config: FrgStackConfig, props?: cdk.StackProps) {
        super(scope, id, props);
        // See
        // https://github.com/aws/aws-cdk/commit/a9caa455b708e08f1cf2d366ac32892d4faa59b4
        // and https://isotoma.atlassian.net/browse/DEVOPS-791. This
        // resolves the following issue: if the desired count is set,
        // it is reset to the default (of 1) when a deploy happens. If
        // autoscaling has a min of 2 (as it does for the production
        // sites) it will stay at 1 until thep service happens to
        // scale up due to load. Autoscaling will then not take it
        // down below 2, but it won't proactively push the number of
        // replicas up if desired is below the autoscaling minimum.
        this.node.setContext(cxapi.ECS_REMOVE_DEFAULT_DESIRED_COUNT, true);

        // Use git sha for deploying in a terminal (eg when changing pipeline things that cause a sadness (enabling privilege),
        // or when deploying pipeline for the first time)
        const releaseSha =
            process.env.CODEBUILD_RESOLVED_SOURCE_VERSION ||
            execSync('git rev-parse HEAD')
                .toString()
                .trim();
        if (!releaseSha) {
            throw new Error('No release sha found');
        }

        const doNotProtectStatefulResources = !!config.doNotProtectStatefulResources;
        const enforceAssetBuilds = !config.doNotEnforceAssetBuilds;
        const removalPolicy = doNotProtectStatefulResources ? cdk.RemovalPolicy.DESTROY : cdk.RemovalPolicy.RETAIN;

        const stackIdentifier = id.endsWith('Stack') ? id.substring(0, id.length - 'Stack'.length) : id;

        if (typeof config.environmentType === 'undefined') {
            throw new Error('Must select and set environmentType');
        }

        this.tags.setTag('EnvironmentType', config.environmentType);
        this.tags.setTag('BrandName', String(config.brand));
        this.tags.setTag('StackIdentifier', stackIdentifier);

        new SopsSecretsManager(this, 'Secrets', {
            path: config.secretsFile,
            secretName: stackIdentifier,
            mappings: {},
            fileType: 'yaml',
        });

        const wpApi = new WPApi(this, 'WPApi', {
            config: config.wordpress,
            removalPolicy,
            releaseSha,
            enforceAssetBuilds,
            brand: config.brand,
        });

        const searchEngine = new SearchEngine(this, 'SearchEngine', {
            removalPolicy,
            config: config && config.searchEngine,
            brand: config.brand,
        });

        const eipVpc = new EipVpc(this, 'EipVpc', {
            config: (config && config.ips) || {},
        }).vpc;

        const lookupVpc = config.vpcLookup ? ec2.Vpc.fromVpcAttributes(this, 'Vpc', config.vpcLookup) : undefined;

        const selectedMainVpc = config.mainVpc || 'own';

        const vpcs: Record<string, ec2.IVpc | undefined> = {
            own: eipVpc,
            lookup: lookupVpc,
        };

        const vpc: ec2.IVpc | undefined = vpcs[selectedMainVpc] || undefined;

        if (typeof vpc === 'undefined') {
            throw new Error(`Main VPC selected to be "${selectedMainVpc}", but it is not enabled`);
        }

        const dynamoDB = new DynamoDB(this, 'DynamoDB', {
            removalPolicy,
            config: config.dynamoDb || {},
        });

        const cognito = new Cognito(this, 'Cognito', {
            userPoolName: stackIdentifier,
            domainPrefix: stackIdentifier,
            config: (config && config.cognito) || {},
            account: this.account,
            dbTable: dynamoDB.userStateTable,
            brand: config.brand,
        });

        const search = new SearchLambda(this, 'Search', {
            config: config && config.searchApi,
            searchEngineOutputs: searchEngine.outputs,
            brand: config.brand,
        });
        let indeedApiOriginConfig = undefined;
        if (searchEngine.outputs.enabled) {
            const indeed = new IndeedSitemap(this, 'IndeedSitemap', {
                search,
                brand: config.brand,
                searchEngineOutputs: searchEngine.outputs,
                apiName: stackIdentifier + 'IndeedSitemap',
                config: config.indeedSitemap,
            });
            indeedApiOriginConfig = indeed.apiOriginConfig;
        }

        let broadbeanApiOriginConfig = undefined;
        if (searchEngine.outputs.enabled) {
            const broadbeanApi = new BroadbeanApi(this, 'BroadbeanApi', {
                apiName: stackIdentifier + 'Broadbean',
                bucket: searchEngine.outputs.bucket,
                secretName: stackIdentifier + 'Broadbean',
                secretsPath: config.secretsFile,
                config: config && config.broadbeanApi,
                brand: config.brand,
                searchLambda: search.searchLambda,
            });
            broadbeanApiOriginConfig = broadbeanApi.apiOriginConfig;
        }

        const candidateProfile = new CandidateProfile(this, 'CandidateProfile', {
            removalPolicy,
            secretName: stackIdentifier + 'CandidateProfile',
            secretsPath: config.secretsFile,
            hostingConfig: config.hosting || {},
            userStateTable: dynamoDB.userStateTable,
            // Here just use the main VPC, as we can handle VPC changes with Lambdas
            vpc,
            config: (config && config.candidateProfile) || {},
            searchLambda: search.searchLambda,
            brand: config.brand,
        });

        new Deliveries(this, 'Deliveries', {
            removalPolicy,
            dynamoDB,
            userPool: cognito.pool,
            cvBucket: candidateProfile.cvBucket,
        });

        const employerProfile = new EmployerProfile(this, 'Employer', {
            removalPolicy,
            secretName: stackIdentifier + 'Employer',
            secretsPath: config.secretsFile,
            userStateTable: dynamoDB.userStateTable,
        });

        const linkSiteVisitorToPardotAccount = new LinkSiteVisitorToPardotAccount(this, 'LinkSiteVisitorToPardotAccount', {
            removalPolicy,
            secretName: stackIdentifier + 'LinkSiteVisitorToPardotAccount',
            secretsPath: config.secretsFile,
            pardotUrl: config.pardotUrl,
        });

        const appSync = new AppSyncNestedStack(this, 'AppSync', {
            wordpressLambda: wpApi.handler,
            apiName: stackIdentifier,
            userPool: cognito.pool,
            searchLambda: search.searchLambda,
            candidateLambda: candidateProfile.candidateLambda,
            employerLambda: employerProfile.employerLambda,
            linkSiteVisitorToPardotAccountLambda: linkSiteVisitorToPardotAccount.linkSiteVisitorToPardotAccountLambda,
        });

        const apiKeys = new AppSyncApiKeys(this, 'AppSyncApiKeys', {
            apiId: appSync.api.apiId,
            apiArn: appSync.api.arn,
        });

        const ssrApiProps: Omit<SSRApiProps, 'vpc'> = {
            apiName: stackIdentifier,
            graphqlURL: appSync.api.graphqlUrl,
            apiKeyLambda: apiKeys.lambda,
            removalPolicy,
            config: (config && config.web) || {},
            cognito,
            brand: config.brand,
            albHosting: config.hosting?.domains?.enabled
                ? {
                      enabled: true,
                      hostedZoneDomainName: config.hosting.domains.hostedZoneDomainName,
                      hostedZoneId: config.hosting.domains.hostedZoneId,
                      albSubdomain: config.hosting.domains.subdomainsToCreate && config.hosting.domains.subdomainsToCreate[0] ? `${config.hosting.domains.subdomainsToCreate[0]}-appalb` : 'appalb',
                  }
                : {
                      enabled: false,
                  },
            denyRobots: !!config.hosting?.denyRobots,
            pardotTrackingCode: { piAId: config.pardotTrackingCode?.piAId || '', piCId: config.pardotTrackingCode?.piCId || '' },
            googleTagManagerCode: config.googleTagManagerCode || '',
        };

        let eipSsrApi: SSRApi | undefined;
        let lookupSsrApi: SSRApi | undefined;

        if (eipVpc) {
            eipSsrApi = new SSRApi(this, 'SSRApi', {
                ...ssrApiProps,
                vpc: eipVpc,
            });
        }

        if (lookupVpc) {
            lookupSsrApi = new SSRApi(this, 'SSRApiLookup', {
                ...ssrApiProps,
                createCluster: true,
                vpc: lookupVpc,
                albHosting: {
                    ...ssrApiProps.albHosting,
                    ...(ssrApiProps.albHosting.enabled
                        ? {
                              albSubdomain: `${ssrApiProps.albHosting.albSubdomain}-lookup`,
                          }
                        : {}),
                },
            });
        }

        const ssrApis: Record<string, SSRApi | undefined> = {
            own: eipSsrApi,
            lookup: lookupSsrApi,
        };

        const ssrApi = ssrApis[selectedMainVpc];

        // Ignoring because this should never happen
        /* istanbul ignore next */
        if (!ssrApi) {
            throw new Error('There is no SSR API for the selected VPC. This should not happen.');
        }

        const primaryDomainName =
            (config.hosting?.domains?.enabled && config.hosting.domains.additionalDomains && config.hosting.domains.additionalDomains[0]) ||
            (config.hosting?.domains?.enabled && config.hosting.domains.subdomainsToCreate && config.hosting.domains.subdomainsToCreate[0]) ||
            '';

        const candidateSearchRedirector = new CandidateSearchRedirector(this, 'CSRedirector', {
            apiName: stackIdentifier + 'CSRedirector',
            targetDomain: primaryDomainName,
            config: (config && config.candidateSearchRedirector) || {},
            brand: config.brand,
        });

        const hosting = new Hosting(this, 'Hosting', {
            originConfigs: filterNils([ssrApi.appOriginConfig, ssrApi.staticAssetsOriginConfig, wpApi.imagesOriginConfig, broadbeanApiOriginConfig, indeedApiOriginConfig]),
            candidateSearchOriginConfig: candidateSearchRedirector.redirectorOriginConfig,
            removalPolicy,
            config: (config && config.hosting) || {},
        });

        new EmailAlerts(this, 'EmailAlerts', {
            userdataDb: dynamoDB.userStateTable,
            secretName: stackIdentifier + 'EmailAlerts',
            secretsPath: config.secretsFile,
            config: config.emailAlerts,
            searchLambda: search.searchLambda,
            hostingDomain: hosting.domainName,
            brand: config.brand,
            vpc,
        });

        new cdk.CfnOutput(this, 'GraphQLURL', {
            value: appSync.api.graphqlUrl,
        });
        new cdk.CfnOutput(this, 'ContentDomain', {
            value: `https://${hosting.domainName}/images`,
        });
        new cdk.CfnOutput(this, 'SSRDistribution', {
            value: `https://${hosting.domainName}`,
        });
        new cdk.CfnOutput(this, 'CSDistribution', {
            value: hosting.candidateSearchDomainName ? `https://${hosting.candidateSearchDomainName}` : '',
        });
        new cdk.CfnOutput(this, 'ApiKeyLambda', {
            value: apiKeys.lambda.functionName,
        });
        new cdk.CfnOutput(this, 'ReleaseSha', {
            value: releaseSha,
        });
        new cdk.CfnOutput(this, 'CognitoUserPoolId', {
            value: cognito.pool.userPoolId,
        });
        new cdk.CfnOutput(this, 'CognitoUserPoolClientId', {
            value: cognito.userPoolClient.ref,
        });
        new cdk.CfnOutput(this, 'CognitoUserPoolOAuthDomain', {
            value: cognito.cognitoDomain,
        });
        new cdk.CfnOutput(this, 'GoogleAuth', {
            value: config.cognito?.google ? 'true' : '',
        });
        new cdk.CfnOutput(this, 'LinkedInAuth', {
            value: config.cognito?.linkedin ? 'true' : '',
        });
        new cdk.CfnOutput(this, 'GithubAuth', {
            value: config.cognito?.github ? 'true' : '',
        });
        new cdk.CfnOutput(this, 'FacebookAuth', {
            value: config.cognito?.facebook ? 'true' : '',
        });
        new cdk.CfnOutput(this, 'PardotTrackingCodepiAId', {
            value: config.pardotTrackingCode?.piAId || '',
        });
        new cdk.CfnOutput(this, 'PardotTrackingCodepiCId', {
            value: config.pardotTrackingCode?.piCId || '',
        });
        new cdk.CfnOutput(this, 'GoogleTagManagerCode', {
            value: config.googleTagManagerCode || '',
        });
        new cdk.CfnOutput(this, 'VpcInUse', {
            value: selectedMainVpc,
        });
        new cdk.CfnOutput(this, 'VpcInUseId', {
            value: vpc.vpcId,
        });
    }
}
