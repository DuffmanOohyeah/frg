import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as ecsPatterns from '@aws-cdk/aws-ecs-patterns';
import * as ecs from '@aws-cdk/aws-ecs';
import * as elb from '@aws-cdk/aws-elasticloadbalancingv2';
import * as route53 from '@aws-cdk/aws-route53';
import * as ec2 from '@aws-cdk/aws-ec2';
import { Cognito } from './cognito';
import { FrgBrand } from './utils/FrgBrand';

// These aren't really secrets, they're just they're to make the site be clearly non-public.
const DEFAULT_BASIC_AUTH_USERNAME = 'isotoma';
const DEFAULT_BASIC_AUTH_PASSWORD = 'penguin55';
const DEFAULT_BASIC_AUTH_CONFIG: SSRApiBasicAuthPropsEnabled = {
    disabled: false,
    username: DEFAULT_BASIC_AUTH_USERNAME,
    password: DEFAULT_BASIC_AUTH_PASSWORD,
};

interface SSRApiBasicAuthPropsEnabled {
    readonly disabled: false;
    // These are just treated as strings rather than loaded into KMS
    // as they really only exist to stop someone stumbling across the
    // site before it is ready, not because they absolutely must
    // remain secret forever
    readonly username: string;
    readonly password: string;
}

interface SSRApiBasicAuthPropsDisabled {
    readonly disabled: true;
}

type SSRApiBasicAuthProps = SSRApiBasicAuthPropsEnabled | SSRApiBasicAuthPropsDisabled;

interface FargateScalingConfig {
    readonly minCapacity?: number;
    readonly maxCapacity?: number;
    readonly targetCpuUtilization?: number;
    readonly cpuScaleOutCooldownSeconds?: number;
    readonly cpuScaleInCooldownSeconds?: number;
    readonly requestsPerTargetPerMinute?: number;
    readonly requestsScaleOutCooldownSeconds?: number;
    readonly requestsScaleInCooldownSeconds?: number;
}

type FargateScalingConfigRequired = Required<FargateScalingConfig>;

const DEFAULT_SCALING_CONFIG: FargateScalingConfigRequired = {
    minCapacity: 1,
    maxCapacity: 1,
    targetCpuUtilization: 60,
    cpuScaleOutCooldownSeconds: 30,
    cpuScaleInCooldownSeconds: 30,
    requestsPerTargetPerMinute: 120,
    requestsScaleOutCooldownSeconds: 30,
    requestsScaleInCooldownSeconds: 30,
};

export interface SSRApiConfig {
    readonly basicAuth?: SSRApiBasicAuthProps;
    readonly useProdPardotEndpoints?: boolean;
    readonly employerContactPreferencesUrl?: string;
    readonly scaling?: FargateScalingConfig;
}

interface AlbHostingEnabled {
    readonly enabled: true;
    readonly hostedZoneDomainName: string;
    readonly hostedZoneId: string;
    readonly albSubdomain: string;
}

interface AlbHostingDisabled {
    readonly enabled: false;
}

interface PardotTrackingCodeProps {
    readonly piAId: string;
    readonly piCId: string;
}

export interface SSRApiProps {
    readonly apiName: string;
    readonly graphqlURL: string;
    readonly apiKeyLambda: lambda.Function;
    readonly removalPolicy: cdk.RemovalPolicy;
    readonly config: SSRApiConfig;
    readonly cognito: Cognito;
    readonly brand: FrgBrand;
    readonly albHosting: AlbHostingEnabled | AlbHostingDisabled;
    readonly denyRobots: boolean;
    readonly vpc: ec2.IVpc;
    readonly createCluster?: boolean;
    readonly pardotTrackingCode: PardotTrackingCodeProps;
    readonly googleTagManagerCode: string;
}

export class SSRApi extends cdk.Construct {
    readonly props: SSRApiProps;
    readonly staticAssetsOriginConfig: cloudfront.SourceConfiguration;
    readonly appOriginConfig: cloudfront.SourceConfiguration;

    constructor(scope: cdk.Construct, id: string, props: SSRApiProps) {
        super(scope, id);

        const tags = cdk.Tags.of(this);
        tags.add('Component', 'SSRApi');

        this.props = props;

        const basicAuthConfig = props.config.basicAuth || DEFAULT_BASIC_AUTH_CONFIG;

        const fargateAlbHosting = props.albHosting.enabled
            ? {
                  domainName: `${props.albHosting.albSubdomain}.${props.albHosting.hostedZoneDomainName}`,
                  domainZone: route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
                      hostedZoneId: props.albHosting.hostedZoneId,
                      zoneName: props.albHosting.hostedZoneDomainName,
                  }),
                  protocol: elb.ApplicationProtocol.HTTPS,
              }
            : {};

        const basicAuthEnv: Record<string, string> = basicAuthConfig.disabled
            ? {
                  ENABLE_HTTP_BASIC_AUTH: '',
              }
            : {
                  ENABLE_HTTP_BASIC_AUTH: 'true',
                  HTTP_BASIC_AUTH_USERNAME: basicAuthConfig.username,
                  HTTP_BASIC_AUTH_PASSWORD: basicAuthConfig.password,
              };

        const fargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'SSRApp', {
            ...(props.createCluster
                ? {
                      cluster: new ecs.Cluster(this, 'Cluster', {
                          vpc: props.vpc,
                      }),
                  }
                : {
                      vpc: props.vpc,
                  }),
            taskImageOptions: {
                image: ecs.ContainerImage.fromAsset('./frontend'),
                containerPort: 3000,
                environment: {
                    GRAPHQL_URL: this.props.graphqlURL,
                    API_KEY_LAMBDA_FUNCTION_NAME: this.props.apiKeyLambda.functionName,
                    USER_POOL_ID: this.props.cognito.pool.userPoolId,
                    USER_POOL_CLIENT_ID: this.props.cognito.userPoolClient.ref,
                    USER_POOL_OAUTH_DOMAIN: this.props.cognito.cognitoDomain,
                    SIGN_IN_REDIRECT_URL: this.props.cognito.config.ssoAuthLoginRedirectUrl || '',
                    SIGN_OUT_REDIRECT_URL: this.props.cognito.config.ssoAuthLogoutRedirectUrl || '',
                    BRAND: this.props.brand,
                    USE_PROD_PARDOT_ENDPOINTS: this.props.config.useProdPardotEndpoints ? 'true' : '',
                    EMPLOYER_CONTACT_PREFERENCES_URL: this.props.config.employerContactPreferencesUrl || '',
                    GOOGLE_AUTH: this.props.cognito.config.google ? 'true' : '',
                    LINKEDIN_AUTH: this.props.cognito.config.linkedin ? 'true' : '',
                    GITHUB_AUTH: this.props.cognito.config.github ? 'true' : '',
                    FACEBOOK_AUTH: this.props.cognito.config.facebook ? 'true' : '',
                    DENY_ROBOTS: this.props.denyRobots ? 'true' : '',
                    PARDOT_TRACKING_CODE_PIAID: this.props.pardotTrackingCode.piAId,
                    PARDOT_TRACKING_CODE_PICID: this.props.pardotTrackingCode.piCId,
                    GOOGLE_TAG_MANAGER_CODE: this.props.googleTagManagerCode,
                    ...basicAuthEnv,
                },
            },
            ...fargateAlbHosting,
        });

        fargateService.targetGroup.configureHealthCheck({
            path: '/_healthz',
        });

        fargateService.taskDefinition.addToTaskRolePolicy(
            new iam.PolicyStatement({
                actions: ['lambda:InvokeFunction'],
                effect: iam.Effect.ALLOW,
                resources: [this.props.apiKeyLambda.functionArn],
            }),
        );

        const scalingConfig: FargateScalingConfigRequired = {
            ...DEFAULT_SCALING_CONFIG,
            ...(props.config.scaling || {}),
        };

        const fargateScaling = fargateService.service.autoScaleTaskCount({
            minCapacity: scalingConfig.minCapacity,
            maxCapacity: scalingConfig.maxCapacity,
        });

        fargateScaling.scaleOnCpuUtilization('CpuScaling', {
            targetUtilizationPercent: scalingConfig.targetCpuUtilization,
            scaleOutCooldown: cdk.Duration.seconds(scalingConfig.cpuScaleOutCooldownSeconds),
            scaleInCooldown: cdk.Duration.seconds(scalingConfig.cpuScaleInCooldownSeconds),
        });

        fargateScaling.scaleOnRequestCount('RequestScaling', {
            requestsPerTarget: scalingConfig.requestsPerTargetPerMinute,
            scaleOutCooldown: cdk.Duration.seconds(scalingConfig.requestsScaleOutCooldownSeconds),
            scaleInCooldown: cdk.Duration.seconds(scalingConfig.requestsScaleInCooldownSeconds),
            targetGroup: fargateService.targetGroup,
        });

        const cfnOriginConfig = props.albHosting.enabled
            ? {
                  domainName: `${props.albHosting.albSubdomain}.${props.albHosting.hostedZoneDomainName}`,
                  originProtocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
              }
            : {
                  domainName: fargateService.loadBalancer.loadBalancerDnsName,
                  originProtocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
              };

        this.staticAssetsOriginConfig = {
            customOriginSource: cfnOriginConfig,
            originPath: '', // Just route to the origin since it already knows how to deal with "_next/static" paths
            behaviors: [
                {
                    pathPattern: '_next/static/*',
                    defaultTtl: cdk.Duration.seconds(0),
                    forwardedValues: {
                        queryString: false,
                        headers: ['Authorization'],
                    },
                },
            ],
        };

        this.appOriginConfig = {
            customOriginSource: cfnOriginConfig,
            behaviors: [
                {
                    isDefaultBehavior: true,
                    defaultTtl: cdk.Duration.seconds(0),
                    forwardedValues: {
                        queryString: true,
                        headers: ['Authorization', 'Host'],
                        cookies: {
                            forward: 'all',
                        },
                    },
                },
            ],
        };
    }
}
