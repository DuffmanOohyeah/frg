import * as cdk from '@aws-cdk/core';
import { expect as expectCDK, haveResourceLike } from '@aws-cdk/assert';
import * as mockfs from 'mock-fs';
import { CognitoLinkedInNestedStack } from '../lib/cognito-linkedin';
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
        getCandidateSearchRedirectorDomain: jest.fn(() => 'testDomain'),
    };
});

const DEFAULT_STACK_ARGS: FrgStackConfig = {
    brand: FrgBrand.Jefferson,
    environmentType: 'dev',
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
};

beforeEach(() => {
    mockfs(defaultMockFs);
    jest.resetModules();
    process.env.CODEBUILD_RESOLVED_SOURCE_VERSION = 'test';
});

afterEach(() => {
    mockfs.restore();
});

describe('cognito-linkedin', () => {
    test('linkedin', async () => {
        const app = new cdk.App();
        const parentStack = new FrgStack(app, 'TestStack', {
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
        const stack = new CognitoLinkedInNestedStack(parentStack, 'TestStack', {
            userPoolId: 'userPoolId',
            cognitoDomain: 'cognitoDomain',
            config: {
                name: 'LinkedIn',
                clientId: 'myclientid',
                clientSecret: 'myclientsecret',
            },
        });
        expectCDK(stack).to(
            haveResourceLike('AWS::Cognito::UserPoolIdentityProvider', {
                ProviderName: 'LinkedIn',
                ProviderType: 'OIDC',
            }),
        );
    });
});
