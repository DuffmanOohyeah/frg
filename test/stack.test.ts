import { ABSENT, expect as expectCDK, haveOutput, haveResource, haveResourceLike, ResourcePart, countResources } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import { SecurityPolicyProtocol } from '@aws-cdk/aws-cloudfront';
import { execSync } from 'child_process';
import * as mockfs from 'mock-fs';
import { OAUTH_FLOWS, OAUTH_SCOPES } from '../lib/cognito';
import { FrgStack, FrgStackConfig } from '../lib/frg-stack';
import { FrgBrand } from '../lib/utils/FrgBrand';
import { defaultMockFs } from './defaultMockFs';

// Copied from https://github.com/aws/aws-cdk/blob/v1.85.0/packages/@aws-cdk/aws-lambda-nodejs/test/function.test.ts#L11
jest.mock('@aws-cdk/aws-lambda-nodejs/lib/bundling', () => {
    return {
        Bundling: {
            bundle: jest.fn().mockReturnValue({
                bind: () => {
                    return { inlineCode: 'code' };
                },
                bindToResource: () => {
                    return;
                },
            }),
        },
    };
});
// Edited from https://github.com/aws/aws-cdk/blob/v1.85.0/packages/@aws-cdk/aws-lambda-python/test/function.test.ts
jest.mock('@aws-cdk/aws-lambda-python/lib/bundling', () => {
    return {
        bundle: jest.fn().mockReturnValue({
            bind: () => {
                return { s3Location: 'code' };
            },
            bindToResource: () => {
                return;
            },
        }),
        hasDependencies: jest.fn().mockReturnValue(false),
    };
});

jest.mock('../lib/utils/FrgBrand', () => {
    const moduleMock = jest.requireActual('../lib/utils/FrgBrand');

    return {
        ...moduleMock,
        getBrandLocaleSubpaths: jest.fn(() => []),
    };
});

jest.mock('child_process', () => {
    const original = jest.requireActual('child_process');
    return {
        ...original,
        execSync: jest.fn(),
    };
});

const DEFAULT_STACK_ARGS: FrgStackConfig = {
    brand: FrgBrand.Jefferson,
    wordpress: {
        cacheVersion: 1,
    },
    ips: {
        enabled: true,
    },
    secretsFile: './secrets/stage.yaml',
    doNotEnforceAssetBuilds: true,
    emailAlerts: {
        domainName: {
            useHostingDomain: true,
        },
        cron: {
            enabled: false,
        },
    },
    pardotUrl: 'pardotUrl',
    environmentType: 'dev',
};

const CODEBUILD_VERSION = 'test';
beforeEach(() => {
    mockfs(defaultMockFs);
    jest.resetModules();
    process.env.CODEBUILD_RESOLVED_SOURCE_VERSION = CODEBUILD_VERSION;
    ((execSync as unknown) as jest.Mock).mockReturnValue('GitSha');
});

afterEach(() => {
    mockfs.restore();
});

describe('setup', () => {
    test('can create cdk stack construct', () => {
        const app = new cdk.App();
        new FrgStack(app, 'TestStack', DEFAULT_STACK_ARGS);
    });

    test('use releasesha from codebuild env var', () => {
        // delete process.env.CODEBUILD_RESOLVED_SOURCE_VERSION;
        process.env.CODEBUILD_RESOLVED_SOURCE_VERSION = 'FOOBAR';

        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', DEFAULT_STACK_ARGS);
        expectCDK(stack).to(haveOutput({ outputName: 'ReleaseSha', outputValue: 'FOOBAR' }));
    });

    test('use releasesha from github if no releasesha from codebuild env var', () => {
        delete process.env.CODEBUILD_RESOLVED_SOURCE_VERSION;

        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', DEFAULT_STACK_ARGS);

        const releaseSha = execSync('git rev-parse HEAD')
            .toString()
            .trim();
        expectCDK(stack).to(haveOutput({ outputName: 'ReleaseSha', outputValue: releaseSha }));
    });

    test('throw error if no release sha found at all', () => {
        delete process.env.CODEBUILD_RESOLVED_SOURCE_VERSION;
        ((execSync as unknown) as jest.Mock).mockReturnValue('');

        const app = new cdk.App();
        expect(() => new FrgStack(app, 'TestStack', DEFAULT_STACK_ARGS)).toThrow('No release sha found');
    });

    test('names resources after stack id', () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'Foo', DEFAULT_STACK_ARGS);
        expectCDK(stack).to(
            haveResource('AWS::Cognito::UserPool', {
                UserPoolName: 'Foo',
            }),
        );
    });

    test('names resources after stack trimming Stack', () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'FooStack', DEFAULT_STACK_ARGS);
        expectCDK(stack).to(
            haveResource('AWS::Cognito::UserPool', {
                UserPoolName: 'Foo',
            }),
        );
    });

    test('requires environmentType', () => {
        const app = new cdk.App();
        expect(() => {
            new FrgStack(app, 'TestStack', {
                ...DEFAULT_STACK_ARGS,
                environmentType: undefined,
            });
        }).toThrow('Must select and set environmentType');
    });
});

describe('ssr', () => {
    test('use prod pardot endpoints', () => {
        const app = new cdk.App();
        new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            web: {
                useProdPardotEndpoints: true,
            },
        });
    });

    test('use employerContactPreferencesUrl', () => {
        const app = new cdk.App();
        new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            web: {
                employerContactPreferencesUrl: 'employerContactPreferencesUrl',
            },
        });
    });

    test('basic auth on', () => {
        const app = new cdk.App();
        new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            web: {
                basicAuth: {
                    disabled: false,
                    username: 'myuser',
                    password: 'mypass',
                },
            },
        });
    });

    test('basic auth off', () => {
        const app = new cdk.App();
        new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            web: {
                basicAuth: {
                    disabled: true,
                },
            },
        });
    });

    test('does not set desired count', () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            web: {
                basicAuth: {
                    disabled: true,
                },
            },
        });

        // See https://github.com/aws/aws-cdk/commit/a9caa455b708e08f1cf2d366ac32892d4faa59b4
        expectCDK(stack).to(
            haveResource('AWS::ECS::Service', {
                DesiredCount: ABSENT,
            }),
        );
    });
});

describe('stateful resource protection', () => {
    test('defaults to protected', () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
        });

        // Has protected resources
        expectCDK(stack).to(
            haveResource(
                'AWS::S3::Bucket',
                {
                    DeletionPolicy: 'Retain',
                },
                ResourcePart.CompleteDefinition,
            ),
        );
        expectCDK(stack).to(
            haveResource(
                'AWS::DynamoDB::Table',
                {
                    DeletionPolicy: 'Retain',
                },
                ResourcePart.CompleteDefinition,
            ),
        );

        // Has no unprotected resources
        expectCDK(stack).notTo(
            haveResource(
                'AWS::S3::Bucket',
                {
                    DeletionPolicy: 'Delete',
                },
                ResourcePart.CompleteDefinition,
            ),
        );
        expectCDK(stack).notTo(
            haveResource(
                'AWS::DynamoDB::Table',
                {
                    DeletionPolicy: 'Delete',
                },
                ResourcePart.CompleteDefinition,
            ),
        );
    });

    test('can set to detroy', () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            doNotProtectStatefulResources: true,
        });

        // Has unprotected resources
        expectCDK(stack).to(
            haveResource(
                'AWS::S3::Bucket',
                {
                    DeletionPolicy: 'Delete',
                },
                ResourcePart.CompleteDefinition,
            ),
        );
        expectCDK(stack).to(
            haveResource(
                'AWS::DynamoDB::Table',
                {
                    DeletionPolicy: 'Delete',
                },
                ResourcePart.CompleteDefinition,
            ),
        );

        // Has no protected resources
        expectCDK(stack).notTo(
            haveResource(
                'AWS::S3::Bucket',
                {
                    DeletionPolicy: 'Retain',
                },
                ResourcePart.CompleteDefinition,
            ),
        );
        expectCDK(stack).notTo(
            haveResource(
                'AWS::DynamoDB::Table',
                {
                    DeletionPolicy: 'Retain',
                },
                ResourcePart.CompleteDefinition,
            ),
        );
    });
});

describe('vpc', () => {
    test('vpc enabled', () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            ips: {
                enabled: true,
            },
        });

        expectCDK(stack).to(
            haveResource('AWS::EC2::VPC', {
                CidrBlock: '10.90.0.0/16',
            }),
        );
        // One public subnet, one private
        expectCDK(stack).to(
            haveResource('AWS::EC2::Subnet', {
                AvailabilityZone: {
                    'Fn::Select': [
                        0,
                        {
                            'Fn::GetAZs': '',
                        },
                    ],
                },
                MapPublicIpOnLaunch: true,
            }),
        );
        expectCDK(stack).to(
            haveResource('AWS::EC2::Subnet', {
                AvailabilityZone: {
                    'Fn::Select': [
                        0,
                        {
                            'Fn::GetAZs': '',
                        },
                    ],
                },
                MapPublicIpOnLaunch: false,
            }),
        );
        expectCDK(stack).to(
            haveResource('AWS::EC2::NatGateway', {
                AllocationId: {
                    'Fn::GetAtt': ['EipVpcPublicSubnet1EIP555821A7', 'AllocationId'],
                },
            }),
        );
    });

    test('allocations', () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            ips: {
                enabled: true,
                allocations: ['abc'],
            },
        });

        expectCDK(stack).to(
            haveResource('AWS::EC2::NatGateway', {
                AllocationId: 'abc',
            }),
        );
    });

    test('vpclookup', () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            vpcLookup: {
                vpcId: 'myvpcid',
                availabilityZones: ['az1', 'az2'],
                publicSubnetIds: ['subnetid1', 'subnetid2'],
                publicSubnetRouteTableIds: ['subnetrt1', 'subnetrt2'],
                privateSubnetIds: ['privatesubnetid1', 'privatesubnetid2'],
                privateSubnetRouteTableIds: ['privatesubnetrt1', 'privatesubnetrt2'],
            },
            ips: undefined,
            mainVpc: 'lookup',
        });

        expectCDK(stack).notTo(haveResource('AWS::EC2::VPC', {}));
    });

    test('errors if selected main vpc is not enabled', () => {
        const app = new cdk.App();
        expect(() => {
            new FrgStack(app, 'TestStack', {
                ...DEFAULT_STACK_ARGS,
                ips: {
                    enabled: false,
                },
            });
        }).toThrow('Main VPC selected to be "own", but it is not enabled');
    });

    test('errors if selected main vpc is not enabled', () => {
        const app = new cdk.App();
        expect(() => {
            new FrgStack(app, 'TestStack', {
                ...DEFAULT_STACK_ARGS,
                mainVpc: 'lookup',
            });
        }).toThrow('Main VPC selected to be "lookup", but it is not enabled');
    });

    test('allows both vpc and vpc lookup', () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            vpcLookup: {
                vpcId: 'vpcId',
                availabilityZones: ['availabilityZones'],
                publicSubnetIds: ['publicSubnetIds'],
                publicSubnetRouteTableIds: ['publicSubnetRouteTableIds'],
                privateSubnetIds: ['privateSubnetIds'],
                privateSubnetRouteTableIds: ['privateSubnetRouteTableIds'],
            },
            ips: {
                enabled: true,
            },
        });
        expectCDK(stack).to(
            haveResource('AWS::EC2::VPC', {
                CidrBlock: '10.90.0.0/16',
            }),
        );
    });

    test('allows setting main vpc', () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            vpcLookup: {
                vpcId: 'vpcId',
                availabilityZones: ['availabilityZones'],
                publicSubnetIds: ['publicSubnetIds'],
                publicSubnetRouteTableIds: ['publicSubnetRouteTableIds'],
                privateSubnetIds: ['privateSubnetIds'],
                privateSubnetRouteTableIds: ['privateSubnetRouteTableIds'],
            },
            ips: {
                enabled: true,
            },
            mainVpc: 'lookup',
        });
        expectCDK(stack).to(
            haveResource('AWS::EC2::VPC', {
                CidrBlock: '10.90.0.0/16',
            }),
        );
    });

    test('allows setting main vpc as lookup without ips', () => {
        const app = new cdk.App();
        new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            vpcLookup: {
                vpcId: 'vpcId',
                availabilityZones: ['availabilityZones'],
                publicSubnetIds: ['publicSubnetIds'],
                publicSubnetRouteTableIds: ['publicSubnetRouteTableIds'],
                privateSubnetIds: ['privateSubnetIds'],
                privateSubnetRouteTableIds: ['privateSubnetRouteTableIds'],
            },
            ips: {
                enabled: false,
            },
            mainVpc: 'lookup',
        });
    });

    test('allows using lookup vpc and hosting config', () => {
        const app = new cdk.App();
        new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            vpcLookup: {
                vpcId: 'vpcId',
                availabilityZones: ['availabilityZones'],
                publicSubnetIds: ['publicSubnetIds'],
                publicSubnetRouteTableIds: ['publicSubnetRouteTableIds'],
                privateSubnetIds: ['privateSubnetIds'],
                privateSubnetRouteTableIds: ['privateSubnetRouteTableIds'],
            },
            hosting: {
                domains: {
                    enabled: true,
                    hostedZoneDomainName: 'my.domain.name.com',
                    hostedZoneId: 'zoneid123',
                    subdomainsToCreate: ['test'],
                    sslCertificateArn: 'mycertarn',
                },
            },
        });
    });
});

describe('cognito', () => {
    test('no OAuth', async () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', DEFAULT_STACK_ARGS);
        expectCDK(stack).to(
            haveResourceLike('AWS::Cognito::UserPoolClient', {
                CallbackURLs: ABSENT,
                LogoutURLs: ABSENT,
                AllowedOAuthFlows: ABSENT,
                AllowedOAuthScopes: ABSENT,
                AllowedOAuthFlowsUserPoolClient: ABSENT,
            }),
        );
    });

    test('github', async () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            cognito: {
                callbackUrls: ['test.com'],
                logoutUrls: ['test.com'],
                github: {
                    name: 'Github',
                    clientId: 'myclientid',
                    clientSecret: 'myclientsecret',
                },
            },
        });
        expectCDK(stack).to(
            haveResourceLike('AWS::CloudFormation::Stack', {
                Parameters: { referencetoTestStackCognitoUsers78CFCC63Ref: { Ref: 'CognitoUsersAB0CCC32' } },
            }),
        );
        expectCDK(stack).to(
            haveResourceLike('AWS::Cognito::UserPoolClient', {
                CallbackURLs: ['test.com'],
                LogoutURLs: ['test.com'],
                AllowedOAuthFlows: OAUTH_FLOWS,
                AllowedOAuthScopes: OAUTH_SCOPES,
                AllowedOAuthFlowsUserPoolClient: true,
            }),
        );
    });

    test('linkedin', async () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            cognito: {
                callbackUrls: ['test.com'],
                logoutUrls: ['test.com'],
                linkedin: {
                    name: 'LinkedIn',
                    clientId: 'myclientid',
                    clientSecret: 'myclientsecret',
                },
            },
        });
        expectCDK(stack).to(
            haveResourceLike('AWS::CloudFormation::Stack', {
                Parameters: { referencetoTestStackCognitoUsers78CFCC63Ref: { Ref: 'CognitoUsersAB0CCC32' } },
            }),
        );
        expectCDK(stack).to(
            haveResourceLike('AWS::Cognito::UserPoolClient', {
                CallbackURLs: ['test.com'],
                LogoutURLs: ['test.com'],
                AllowedOAuthFlows: OAUTH_FLOWS,
                AllowedOAuthScopes: OAUTH_SCOPES,
                AllowedOAuthFlowsUserPoolClient: true,
            }),
        );
    });

    test('facebook', async () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            cognito: {
                callbackUrls: ['test.com'],
                logoutUrls: ['test.com'],
                facebook: {
                    name: 'Facebook',
                    clientId: 'myclientid',
                    clientSecret: 'myclientsecret',
                },
            },
        });
        expectCDK(stack).to(
            haveResource('AWS::Cognito::UserPoolIdentityProvider', {
                ProviderName: 'Facebook',
                ProviderType: 'Facebook',
            }),
        );
        expectCDK(stack).to(
            haveResourceLike('AWS::Cognito::UserPoolClient', {
                CallbackURLs: ['test.com'],
                LogoutURLs: ['test.com'],
                AllowedOAuthFlows: OAUTH_FLOWS,
                AllowedOAuthScopes: OAUTH_SCOPES,
                AllowedOAuthFlowsUserPoolClient: true,
            }),
        );
    });

    test('google', async () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            cognito: {
                callbackUrls: ['test.com'],
                logoutUrls: ['test.com'],
                google: {
                    name: 'Google',
                    clientId: 'myclientid',
                    clientSecret: 'myclientsecret',
                },
            },
        });
        expectCDK(stack).to(
            haveResource('AWS::Cognito::UserPoolIdentityProvider', {
                ProviderName: 'Google',
                ProviderType: 'Google',
            }),
        );
        expectCDK(stack).to(
            haveResourceLike('AWS::Cognito::UserPoolClient', {
                CallbackURLs: ['test.com'],
                LogoutURLs: ['test.com'],
                AllowedOAuthFlows: OAUTH_FLOWS,
                AllowedOAuthScopes: OAUTH_SCOPES,
                AllowedOAuthFlowsUserPoolClient: true,
            }),
        );
    });

    test('frg AD', async () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            cognito: {
                frg: {
                    name: 'FRGSSO',
                    xmlMetadata: 'myxmlmetadata',
                    ssoRedirectBindingUri: 'myssoredirect',
                    sloRedirectBindingUri: 'mysloredirect',
                },
            },
        });
        expectCDK(stack).to(
            haveResource('AWS::Cognito::UserPoolIdentityProvider', {
                ProviderName: 'FRGSSO',
                ProviderType: 'SAML',
            }),
        );
    });

    test('dev callback and logout urls with sso', async () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            cognito: {
                devAuthUrls: true,
                callbackUrls: ['test.com'],
                logoutUrls: ['test.com'],
                google: {
                    name: 'Google',
                    clientId: 'myclientid',
                    clientSecret: 'myclientsecret',
                },
            },
        });
        expectCDK(stack).to(
            haveResourceLike('AWS::Cognito::UserPoolClient', {
                CallbackURLs: ['test.com', 'http://localhost:3000'],
                LogoutURLs: ['test.com', 'http://localhost:3000'],
            }),
        );
    });

    test('callback and logout urls should contain sso redirect urls', async () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            cognito: {
                callbackUrls: ['test.com'],
                logoutUrls: ['test.com'],
                ssoAuthLoginRedirectUrl: 'boop.com',
                ssoAuthLogoutRedirectUrl: 'doop.com',
                google: {
                    name: 'Google',
                    clientId: 'myclientid',
                    clientSecret: 'myclientsecret',
                },
            },
        });
        expectCDK(stack).to(
            haveResourceLike('AWS::Cognito::UserPoolClient', {
                CallbackURLs: ['test.com', 'boop.com'],
                LogoutURLs: ['test.com', 'doop.com'],
            }),
        );
    });
});

describe('domains', () => {
    test('enabled with no additional domains', () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            hosting: {
                domains: {
                    enabled: true,
                    hostedZoneDomainName: 'my.domain.name.com',
                    hostedZoneId: 'zoneid123',
                    subdomainsToCreate: ['test'],
                    sslCertificateArn: 'mycertarn',
                },
            },
        });
        expectCDK(stack).to(
            haveResourceLike('AWS::CloudFront::Distribution', {
                DistributionConfig: {
                    Aliases: ['test.my.domain.name.com'],
                    ViewerCertificate: {
                        AcmCertificateArn: 'mycertarn',
                    },
                },
            }),
        );
        expectCDK(stack).to(
            haveResource('AWS::Route53::RecordSet', {
                AliasTarget: {
                    DNSName: {
                        'Fn::GetAtt': ['HostingDistCFDistributionBBE7C4E3', 'DomainName'],
                    },
                    // CloudFront Hosted Zone ID
                    HostedZoneId: {
                        'Fn::FindInMap': [
                            'AWSCloudFrontPartitionHostedZoneIdMap',
                            {
                                Ref: 'AWS::Partition',
                            },
                            'zoneId',
                        ],
                    },
                },
                HostedZoneId: 'zoneid123',
                Name: 'test.my.domain.name.com.',
                Type: 'A',
            }),
        );
    });

    test('enabled with one additional domain', () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            hosting: {
                domains: {
                    enabled: true,
                    hostedZoneDomainName: 'my.domain.name.com',
                    hostedZoneId: 'zoneid123',
                    subdomainsToCreate: ['test'],
                    additionalDomains: ['test.other.domain.com'],
                    sslCertificateArn: 'mycertarn',
                },
            },
        });
        expectCDK(stack).to(
            haveResourceLike('AWS::CloudFront::Distribution', {
                DistributionConfig: {
                    Aliases: ['test.my.domain.name.com', 'test.other.domain.com'],
                    ViewerCertificate: {
                        AcmCertificateArn: 'mycertarn',
                    },
                },
            }),
        );
    });

    test('no subdomains to create uses the top level of the hosted zone', () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            hosting: {
                domains: {
                    enabled: true,
                    hostedZoneDomainName: 'my.domain.name.com',
                    hostedZoneId: 'zoneid123',
                    sslCertificateArn: 'mycertarn',
                },
            },
        });
        expectCDK(stack).to(
            haveResourceLike('AWS::CloudFront::Distribution', {
                DistributionConfig: {
                    Aliases: ['my.domain.name.com'],
                    ViewerCertificate: {
                        AcmCertificateArn: 'mycertarn',
                    },
                },
            }),
        );
    });

    test('distribution enables logging', () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            hosting: {
                domains: {
                    enabled: true,
                    hostedZoneDomainName: 'my.domain.name.com',
                    hostedZoneId: 'zoneid123',
                    subdomainsToCreate: ['test'],
                    sslCertificateArn: 'mycertarn',
                },
            },
        });
        expectCDK(stack).to(
            haveResourceLike('AWS::CloudFront::Distribution', {
                DistributionConfig: {
                    Logging: {
                        Bucket: {
                            'Fn::GetAtt': ['HostingCloudfrontLogging116BB155', 'RegionalDomainName'],
                        },
                        IncludeCookies: false,
                        Prefix: 'main/',
                    },
                },
            }),
        );
    });

    test('Hosting with a minimum protocol version enabled', () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            hosting: {
                domains: {
                    enabled: true,
                    hostedZoneDomainName: 'my.domain.name.com',
                    hostedZoneId: 'zoneid123',
                    subdomainsToCreate: ['test'],
                    sslCertificateArn: 'mycertarn',
                    minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2019,
                },
            },
        });
        expectCDK(stack).to(
            haveResourceLike('AWS::CloudFront::Distribution', {
                DistributionConfig: {
                    Aliases: ['test.my.domain.name.com'],
                    ViewerCertificate: {
                        AcmCertificateArn: 'mycertarn',
                        MinimumProtocolVersion: 'TLSv1.2_2019',
                    },
                },
            }),
        );
    });
});

describe('wordpress cache timeout', () => {
    test('can set cache timeout', () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            wordpress: {
                ...DEFAULT_STACK_ARGS.wordpress,
                cacheTimeoutSeconds: 10,
            },
        });

        expectCDK(stack).to(
            haveResourceLike('AWS::Lambda::Function', {
                Environment: {
                    Variables: {
                        CACHE_TIMEOUT: '10000',
                    },
                },
            }),
        );
    });

    test('defaults to 5 minute timeout', () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', DEFAULT_STACK_ARGS);

        expectCDK(stack).to(
            haveResourceLike('AWS::Lambda::Function', {
                Environment: {
                    Variables: {
                        CACHE_TIMEOUT: '300000',
                    },
                },
            }),
        );
    });
});

describe('broadbean api', () => {
    test('defaults to disabled', () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', DEFAULT_STACK_ARGS);

        expectCDK(stack).notTo(
            haveResourceLike('AWS::ApiGateway::RestApi', {
                Name: 'TestBroadbean',
            }),
        );
    });

    test('can be enabled', () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            broadbeanApi: {
                enabled: true,
                domain: 'domainName',
            },
        });

        expectCDK(stack).to(
            haveResourceLike('AWS::ApiGateway::RestApi', {
                Name: 'TestBroadbean',
            }),
        );
    });

    test('is always disabled if search engine is disabled', () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            searchEngine: {
                disabled: true,
            },
            broadbeanApi: {
                enabled: true,
                domain: 'domainName',
            },
        });

        expectCDK(stack).notTo(
            haveResourceLike('AWS::ApiGateway::RestApi', {
                Name: 'TestBroadbean',
            }),
        );
    });
});

describe('search engine', () => {
    test('defaults to small', () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', DEFAULT_STACK_ARGS);

        expectCDK(stack).to(
            haveResourceLike('AWS::Elasticsearch::Domain', {
                ElasticsearchClusterConfig: {
                    InstanceType: 't3.small.elasticsearch',
                    InstanceCount: 1,
                    ZoneAwarenessEnabled: false,
                },
            }),
        );
    });

    test('can make big', () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            searchEngine: {
                instanceCount: 2,
                instanceType: 't3.medium.elasticsearch',
            },
        });

        expectCDK(stack).to(
            haveResourceLike('AWS::Elasticsearch::Domain', {
                ElasticsearchClusterConfig: {
                    InstanceType: 't3.medium.elasticsearch',
                    InstanceCount: 2,
                    ZoneAwarenessEnabled: true,
                },
            }),
        );
    });

    test('can disable', () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            searchEngine: {
                disabled: true,
            },
        });

        expectCDK(stack).notTo(haveResourceLike('AWS::Elasticsearch::Domain', {}));
    });

    test('can enable job reindex cron', () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            searchEngine: {
                jobReindex: {
                    enabled: true,
                    cron: {
                        minute: '*/5',
                    },
                },
            },
        });

        expectCDK(stack).to(
            haveResourceLike('AWS::Events::Rule', {
                ScheduleExpression: 'cron(*/5 * * * ? *)',
            }),
        );
    });

    test('can enable candidate reindex cron', () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            searchEngine: {
                candidateReindex: {
                    enabled: true,
                    cron: {
                        minute: '*/5',
                    },
                },
            },
        });

        expectCDK(stack).to(
            haveResourceLike('AWS::Events::Rule', {
                ScheduleExpression: 'cron(*/5 * * * ? *)',
            }),
        );
    });

    test('can enable delete older than cron', () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            searchEngine: {
                deleteOlderThan: {
                    enabled: true,
                    olderThanMonths: 12,
                    schedule: {
                        minute: '*/5',
                    },
                },
            },
        });

        expectCDK(stack).to(
            haveResourceLike('AWS::Events::Rule', {
                ScheduleExpression: 'cron(*/5 * * * ? *)',
            }),
        );
    });

    test('still has a domain if using alternate', () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            searchEngine: {
                useAlternateEsDomain: true,
            },
        });

        expectCDK(stack).to(
            haveResourceLike('AWS::Elasticsearch::Domain', {
                ElasticsearchClusterConfig: {
                    InstanceCount: 1,
                },
            }),
        );

        expectCDK(stack).to(countResources('AWS::Elasticsearch::Domain', 1));
    });
});

describe('search', () => {
    test('with no config', async () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            searchApi: {
                dummyData: undefined,
            },
        });
        expectCDK(stack).to(
            haveResourceLike('AWS::Lambda::Function', {
                Handler: 'index.handler',
                Environment: { Variables: { DUMMY_DATA: '' } },
            }),
        );
    });
    test('with dummy data', async () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            searchApi: {
                dummyData: true,
            },
        });
        expectCDK(stack).to(
            haveResourceLike('AWS::Lambda::Function', {
                Handler: 'index.handler',
                Environment: { Variables: { DUMMY_DATA: 'true' } },
            }),
        );
    });
    test('without dummy data', async () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            searchApi: {
                dummyData: false,
            },
        });
        expectCDK(stack).to(
            haveResourceLike('AWS::Lambda::Function', {
                Handler: 'index.handler',
                Environment: { Variables: { DUMMY_DATA: '' } },
            }),
        );
    });
});

describe('email alerts', () => {
    test('with cron config', async () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            emailAlerts: {
                domainName: {
                    useHostingDomain: true,
                },
                cron: {
                    enabled: true,
                    schedule: {
                        minute: '*/5',
                    },
                },
            },
        });
        expectCDK(stack).to(
            haveResourceLike('AWS::Events::Rule', {
                ScheduleExpression: 'cron(*/5 * * * ? *)',
            }),
        );
    });

    test('with domain config', async () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            emailAlerts: {
                domainName: {
                    useHostingDomain: false,
                    customDomainName: 'testDomain',
                },
            },
        });
        expectCDK(stack).to(
            haveResourceLike('AWS::Lambda::Function', {
                Environment: {
                    Variables: {
                        DOMAIN_NAME: 'testDomain',
                    },
                },
            }),
        );
    });
});

describe('deny robots', () => {
    test('with config', async () => {
        const app = new cdk.App();
        new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            hosting: {
                denyRobots: true,
            },
        });
    });
});

describe('candidate profile', () => {
    test('with defaults', async () => {
        const app = new cdk.App();
        new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            candidateProfile: undefined,
        });
    });

    test('with defaults2', async () => {
        const app = new cdk.App();
        new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            candidateProfile: {},
        });
    });

    test('with dev cors origins', async () => {
        const app = new cdk.App();
        new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            candidateProfile: {
                devCorsOrigins: true,
            },
        });
    });

    test('with custom timeout', async () => {
        const app = new cdk.App();
        new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            candidateProfile: {
                cacheTimeoutSeconds: 123,
            },
        });
    });

    test('without phoenix login URL', async () => {
        const app = new cdk.App();
        new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            candidateProfile: {
                cacheVersion: 99,
            },
        });
    });

    test('with sendJobApplicationsToApplitrak', async () => {
        const app = new cdk.App();
        new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            candidateProfile: {
                sendJobApplicationsToApplitrak: { enabled: true, sendFrom: 'test@test.com' },
            },
        });
    });

    test('with disableSendCvToPhoenix', async () => {
        const app = new cdk.App();
        new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            candidateProfile: {
                disableSendCvToPhoenix: true,
            },
        });
    });
});

describe('candidate search redirector', () => {
    test('enabled', async () => {
        const app = new cdk.App();
        new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            candidateSearchRedirector: {
                enabled: true,
                domain: 'testdomain',
            },
        });
    });

    test('hosting with additional names', async () => {
        const app = new cdk.App();
        new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            candidateSearchRedirector: {
                enabled: true,
                domain: 'testdomain',
            },
            hosting: {
                domains: {
                    enabled: true,
                    hostedZoneDomainName: 'my.domain.name.com',
                    hostedZoneId: 'zoneid123',
                    subdomainsToCreate: ['test'],
                    sslCertificateArn: 'mycertarn',
                    candidateSearch: {
                        sslCertificateArn: 'mycandsearchcertarn',
                        subdomainsToCreate: ['candidate-search-test'],
                        additionalDomains: ['candidate-search.other.domain.com'],
                    },
                },
            },
        });
    });

    test('hosting with additional names', async () => {
        const app = new cdk.App();
        new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            candidateSearchRedirector: {
                enabled: true,
                domain: 'testdomain',
            },
            hosting: {
                domains: {
                    enabled: true,
                    hostedZoneDomainName: 'my.domain.name.com',
                    hostedZoneId: 'zoneid123',
                    subdomainsToCreate: ['test'],
                    sslCertificateArn: 'mycertarn',
                    candidateSearch: {
                        sslCertificateArn: 'mycandsearchcertarn',
                        subdomainsToCreate: ['candidate-search-test'],
                        additionalDomains: ['candidate-search.other.domain.com'],
                    },
                },
            },
        });
    });

    test('hosting without additional names', async () => {
        const app = new cdk.App();
        new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            candidateSearchRedirector: {
                enabled: true,
                domain: 'testdomain',
            },
            hosting: {
                domains: {
                    enabled: true,
                    hostedZoneDomainName: 'my.domain.name.com',
                    hostedZoneId: 'zoneid123',
                    subdomainsToCreate: ['test'],
                    sslCertificateArn: 'mycertarn',
                    candidateSearch: {
                        sslCertificateArn: 'mycandsearchcertarn',
                        subdomainsToCreate: ['candidate-search-test'],
                    },
                },
            },
        });
    });

    test('hosting without names to create', async () => {
        const app = new cdk.App();
        new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            candidateSearchRedirector: {
                enabled: true,
                domain: 'testdomain',
            },
            hosting: {
                domains: {
                    enabled: true,
                    hostedZoneDomainName: 'my.domain.name.com',
                    hostedZoneId: 'zoneid123',
                    subdomainsToCreate: ['test'],
                    sslCertificateArn: 'mycertarn',
                    candidateSearch: {
                        sslCertificateArn: 'mycandsearchcertarn',
                    },
                },
            },
        });
    });

    test('hosting with minimum protocol version set ', async () => {
        const app = new cdk.App();
        new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            candidateSearchRedirector: {
                enabled: true,
                domain: 'testdomain',
            },
            hosting: {
                domains: {
                    enabled: true,
                    hostedZoneDomainName: 'my.domain.name.com',
                    hostedZoneId: 'zoneid123',
                    subdomainsToCreate: ['test'],
                    sslCertificateArn: 'mycertarn',
                    minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2019,
                    candidateSearch: {
                        sslCertificateArn: 'mycandsearchcertarn',
                        subdomainsToCreate: ['candidate-search-test'],
                        additionalDomains: ['candidate-search.other.domain.com'],
                        minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2019,
                    },
                },
            },
        });
    });
});

describe('s3', () => {
    test('no s3 buckets allowed public objects', async () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            hosting: {
                denyRobots: true,
            },
        });

        // Ensure that S3 buckets always have some properties defined
        expectCDK(stack).notTo(
            haveResourceLike(
                'AWS::S3::Bucket',
                {
                    Properties: ABSENT,
                },
                ResourcePart.CompleteDefinition,
            ),
        );

        // Ensure that the PublicAccessBlockConfiguration is never absent
        expectCDK(stack).notTo(
            haveResourceLike('AWS::S3::Bucket', {
                PublicAccessBlockConfiguration: ABSENT,
            }),
        );

        // Ensure that PublicAccessBlockConfiguration always blocks public ACLs
        expectCDK(stack).notTo(
            haveResourceLike('AWS::S3::Bucket', {
                PublicAccessBlockConfiguration: {
                    BlockPublicAcls: false,
                },
            }),
        );

        // Ensure that PublicAccessBlockConfiguration always blocks public policies
        expectCDK(stack).notTo(
            haveResourceLike('AWS::S3::Bucket', {
                PublicAccessBlockConfiguration: {
                    BlockPublicPolicy: false,
                },
            }),
        );

        // Ensure that PublicAccessBlockConfiguration always ignores public acls
        expectCDK(stack).notTo(
            haveResourceLike('AWS::S3::Bucket', {
                PublicAccessBlockConfiguration: {
                    IgnorePublicAcls: false,
                },
            }),
        );

        // Ensure that PublicAccessBlockConfiguration always restricts public buckets
        expectCDK(stack).notTo(
            haveResourceLike('AWS::S3::Bucket', {
                PublicAccessBlockConfiguration: {
                    RestrictPublicBuckets: false,
                },
            }),
        );

        // Ensure that we have at least one bucket with the expected
        // configuration (this is just a check to confirm the above
        // assertions are checking for the right thing).
        expectCDK(stack).to(
            haveResourceLike('AWS::S3::Bucket', {
                PublicAccessBlockConfiguration: {
                    BlockPublicAcls: true,
                    BlockPublicPolicy: true,
                    IgnorePublicAcls: true,
                    RestrictPublicBuckets: true,
                },
            }),
        );
    });
});

describe('emailConfiguration', () => {
    test('emailConfiguration', async () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            cognito: {
                fromEmailAddress: 'from@emailaddress',
            },
        });
        // Ensure that S3 buckets always have some properties defined
        expectCDK(stack).to(
            haveResourceLike(
                'AWS::Cognito::UserPool',
                {
                    Properties: {
                        EmailConfiguration: {
                            EmailSendingAccount: 'DEVELOPER',
                            From: 'Jefferson Frank <from@emailaddress>',
                            SourceArn: {
                                'Fn::Join': [
                                    '',
                                    [
                                        'arn:aws:ses:eu-west-1:',
                                        {
                                            Ref: 'AWS::AccountId',
                                        },
                                        ':identity/from@emailaddress',
                                    ],
                                ],
                            },
                        },
                    },
                },
                ResourcePart.CompleteDefinition,
            ),
        );
    });
});

describe('dynamodb', () => {
    test('default creates table', () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', DEFAULT_STACK_ARGS);

        expectCDK(stack).to(haveResource('AWS::DynamoDB::Table', {}));
    });

    test('can pass in table to use', () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            dynamoDb: {
                fromExistingTable: 'mytable',
            },
        });

        expectCDK(stack).notTo(haveResource('AWS::DynamoDB::Table', {}));
    });
});

describe('pardotTrackingCode', () => {
    test('with defaults', async () => {
        const app = new cdk.App();
        new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
        });
    });

    test('with values', async () => {
        const app = new cdk.App();
        const stack = new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            pardotTrackingCode: {
                piAId: 'piAId',
                piCId: 'piCId',
            },
        });
        expectCDK(stack).to(haveOutput({ outputName: 'PardotTrackingCodepiAId', outputValue: 'piAId' }));
        expectCDK(stack).to(haveOutput({ outputName: 'PardotTrackingCodepiCId', outputValue: 'piCId' }));
    });
});

describe('search expiry', () => {
    test('search expiry', async () => {
        const app = new cdk.App();
        new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            searchApi: {
                ignoreExpiryDate: true,
            },
        });
    });
});

describe('indeed sitemap', () => {
    test('indeed sitemap with no cron config', async () => {
        const app = new cdk.App();
        new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            searchEngine: {
                disabled: false,
            },
            indeedSitemap: {
                enabled: true,
                domain: 'https://test-domain.co.uk',
            },
        });
    });
    test('indeed sitemap with cron disabled', async () => {
        const app = new cdk.App();
        new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            searchEngine: {
                disabled: false,
            },
            indeedSitemap: {
                enabled: true,
                domain: 'https://test-domain.co.uk',
                cron: {
                    enabled: false,
                },
            },
        });
    });
    test('indeed sitemap with cron enabled', async () => {
        const app = new cdk.App();
        new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            searchEngine: {
                disabled: false,
            },
            indeedSitemap: {
                enabled: true,
                domain: 'https://test-domain.co.uk',
                cron: {
                    enabled: true,
                    schedule: {
                        minute: '*/5',
                    },
                },
            },
        });
    });
});

describe('Additional hosting domains only', () => {
    test('Additional hosting domains only', async () => {
        const app = new cdk.App();
        new FrgStack(app, 'TestStack', {
            ...DEFAULT_STACK_ARGS,
            candidateSearchRedirector: {
                enabled: true,
                domain: 'testdomain',
            },
            hosting: {
                domains: {
                    enabled: true,
                    hostedZoneDomainName: 'my.domain.name.com',
                    hostedZoneId: 'zoneid123',
                    subdomainsToCreate: ['test'],
                    sslCertificateArn: 'mycertarn',
                    additionalDomainsOnly: true,
                    additionalDomains: ['test2'],
                    minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2019,
                    candidateSearch: {
                        sslCertificateArn: 'mycandsearchcertarn',
                        subdomainsToCreate: ['candidate-search-test'],
                        additionalDomains: ['candidate-search.other.domain.com'],
                        minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2019,
                    },
                },
            },
        });
    });
});
