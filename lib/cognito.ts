import * as cdk from '@aws-cdk/core';
import * as cognito from '@aws-cdk/aws-cognito';
import * as lambda from '@aws-cdk/aws-lambda';
import * as nodeJsLambda from '@aws-cdk/aws-lambda-nodejs';
import { CognitoFacebook, CognitoFacebookConfig } from './cognito-facebook';
import { CognitoGithubNestedStack, CognitoGithubConfig } from './cognito-github';
import { CognitoLinkedInNestedStack, CognitoLinkedInConfig } from './cognito-linkedin';
import { CognitoGoogle, CognitoGoogleConfig } from './cognito-google';
import { CognitoAD, CognitoADConfig } from './cognito-ad';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { FrgBrand } from './utils/FrgBrand';
import { always, cond, equals } from 'ramda';
import * as iam from '@aws-cdk/aws-iam';
import { Policy } from '@aws-cdk/aws-iam';

export interface CognitoConfig {
    readonly facebook?: CognitoFacebookConfig;
    readonly github?: CognitoGithubConfig;
    readonly linkedin?: CognitoLinkedInConfig;
    readonly google?: CognitoGoogleConfig;
    readonly frg?: CognitoADConfig;
    readonly callbackUrls?: string[];
    readonly logoutUrls?: string[];
    readonly ssoAuthLoginRedirectUrl?: string;
    readonly ssoAuthLogoutRedirectUrl?: string;
    readonly devAuthUrls?: boolean;
    readonly fromEmailAddress?: string;
}

export interface CognitoProps {
    readonly userPoolName: string;
    readonly domainPrefix: string;
    readonly config: CognitoConfig;
    readonly account: string;
    readonly dbTable: dynamodb.ITable;
    readonly brand: FrgBrand;
}

export const OAUTH_FLOWS = ['code', 'implicit'];
export const OAUTH_SCOPES = ['aws.cognito.signin.user.admin', 'email', 'openid', 'phone', 'profile'];

const buildFromEmail = (brand: FrgBrand): string =>
    cond<FrgBrand, string>([
        [equals<FrgBrand>(FrgBrand.Anderson), always('Anderson Frank')],
        [equals<FrgBrand>(FrgBrand.Mason), always('Mason Frank')],
        [equals<FrgBrand>(FrgBrand.Nelson), always('Nelson Frank')],
        [equals<FrgBrand>(FrgBrand.Nigel), always('Nigel Frank')],
        [equals<FrgBrand>(FrgBrand.Jefferson), always('Jefferson Frank')],
        [equals<FrgBrand>(FrgBrand.Washington), always('Washington Frank')],
        [equals<FrgBrand>(FrgBrand.FrgTech), always('FrgTech')],
    ])(brand);

export class Cognito extends cdk.Construct {
    public readonly userPoolClient: cognito.CfnUserPoolClient;
    public readonly pool: cognito.UserPool;
    public readonly cognitoDomain: string;
    public readonly config: CognitoConfig;

    constructor(scope: cdk.Construct, id: string, props: CognitoProps) {
        super(scope, id);

        const tags = cdk.Tags.of(this);
        tags.add('Component', 'Cognito');

        this.config = props.config;
        const config = props.config;
        const cognitoDomainPrefix = props.domainPrefix.toLowerCase();

        const presignUpLambda = new nodeJsLambda.NodejsFunction(this, 'ConfirmSignup', {
            entry: './backend/confirmsignup/main.ts',
            handler: 'handler',
            depsLockFilePath: './backend/package-lock.json',
            runtime: lambda.Runtime.NODEJS_14_X,
            timeout: cdk.Duration.seconds(20),
        });

        // post auth for facebook users, has to be run on every auth
        // see https://bobbyhadz.com/blog/aws-cognito-verify-facebook-email
        const postAuthPostConfirmLambda = new nodeJsLambda.NodejsFunction(this, 'PostAuthPostConfirm', {
            entry: './backend/postauthpostconfirm/main.ts',
            handler: 'handler',
            depsLockFilePath: './backend/package-lock.json',
            runtime: lambda.Runtime.NODEJS_14_X,
            timeout: cdk.Duration.seconds(20),
        });

        const customMessageLambda = new nodeJsLambda.NodejsFunction(this, 'CustomMessage', {
            entry: './backend/custommessage/main.ts',
            handler: 'handler',
            depsLockFilePath: './backend/package-lock.json',
            runtime: lambda.Runtime.NODEJS_14_X,
            timeout: cdk.Duration.seconds(20),
            environment: {
                LOG_LEVEL: 'warn',
                DYNAMODB_TABLE_NAME: props.dbTable.tableName,
                BRAND: props.brand,
            },
        });
        props.dbTable.grantFullAccess(customMessageLambda);

        const pool = new cognito.UserPool(this as cdk.Construct, 'Users', {
            userPoolName: props.userPoolName,
            selfSignUpEnabled: true,
            autoVerify: { email: true },
            lambdaTriggers: {
                preSignUp: presignUpLambda,
                customMessage: customMessageLambda,
                postAuthentication: postAuthPostConfirmLambda,
                // also has to be called on confirmation otherwise it is no ran on first registraion
                postConfirmation: postAuthPostConfirmLambda,
            },
            customAttributes: {
                userType: new cognito.StringAttribute(),
                ssoUserType: new cognito.StringAttribute({ mutable: true }),
            },
        });

        /* istanbul ignore next */
        postAuthPostConfirmLambda.role?.attachInlinePolicy(
            new Policy(this, 'userpool-policy', {
                statements: [
                    new iam.PolicyStatement({
                        actions: ['cognito-idp:AdminUpdateUserAttributes'],
                        effect: iam.Effect.ALLOW,
                        resources: [pool.userPoolArn],
                    }),
                ],
            }),
        );

        // for prod to enable ses
        if (config && config.fromEmailAddress) {
            const cfnUserPool = pool.node.defaultChild as cognito.CfnUserPool;

            cfnUserPool.emailConfiguration = {
                emailSendingAccount: 'DEVELOPER',
                from: `${buildFromEmail(props.brand)} <${config.fromEmailAddress}>`,
                sourceArn: `arn:aws:ses:eu-west-1:${props.account}:identity/${config.fromEmailAddress}`, // SES integration is only available in us-east-1, us-west-2, eu-west-1
            };
        }

        new cognito.CfnUserPoolDomain(this, 'Domain', {
            domain: cognitoDomainPrefix,
            userPoolId: pool.userPoolId,
        });

        const cognitoDomain = `https://${cognitoDomainPrefix}.auth.${cdk.Stack.of(this).region}.amazoncognito.com`;

        // TODO: add SSO providers here
        // Google
        // Facebook
        // LinkedIn
        // Github
        // FRG SSO

        const providers = [];

        if (config && config.facebook) {
            const facebookCognito = new CognitoFacebook(this, 'CognitoFacebook', {
                userPool: pool,
                config: config.facebook,
            });

            providers.push(facebookCognito.userPoolIdentityProvider);
        }

        if (config && config.github) {
            const githubCognito = new CognitoGithubNestedStack(this, 'CognitoGithub', {
                userPoolId: pool.userPoolId,
                cognitoDomain,
                config: config.github,
            });

            providers.push(githubCognito.userPoolIdentityProvider);
        }

        if (config && config.linkedin) {
            const linkedinCognito = new CognitoLinkedInNestedStack(this, 'CognitoLinkedIn', {
                userPoolId: pool.userPoolId,
                cognitoDomain,
                config: config.linkedin,
            });

            providers.push(linkedinCognito.userPoolIdentityProvider);
        }

        if (config && config.google) {
            const googleCognito = new CognitoGoogle(this, 'CognitoGoogle', {
                userPool: pool,
                config: config.google,
            });

            providers.push(googleCognito.userPoolIdentityProvider);
        }

        if (config && config.frg) {
            const frgCognito = new CognitoAD(this, 'CognitoFRG', {
                userPool: pool,
                config: config.frg,
            });

            providers.push(frgCognito.userPoolIdentityProvider);
        }

        const hasOAuthProviders = providers.length > 0;

        let callbackUrls: string[] = [];
        if (hasOAuthProviders) {
            if (config && config.callbackUrls) {
                callbackUrls = [...callbackUrls, ...config.callbackUrls];
            }
            if (config.ssoAuthLoginRedirectUrl && !callbackUrls.includes(config.ssoAuthLoginRedirectUrl)) {
                callbackUrls = [...callbackUrls, config.ssoAuthLoginRedirectUrl];
            }
            if (config && config.devAuthUrls) {
                callbackUrls = [...callbackUrls, 'http://localhost:3000'];
            }
        }

        let logoutUrls: string[] = [];
        if (hasOAuthProviders) {
            if (config && config.logoutUrls) {
                logoutUrls = [...logoutUrls, ...config.logoutUrls];
            }
            if (config.ssoAuthLogoutRedirectUrl && !callbackUrls.includes(config.ssoAuthLogoutRedirectUrl)) {
                logoutUrls = [...logoutUrls, config.ssoAuthLogoutRedirectUrl];
            }
            if (config && config.devAuthUrls) {
                logoutUrls = [...logoutUrls, 'http://localhost:3000'];
            }
        }

        const userPoolClient = new cognito.CfnUserPoolClient(this, 'Client', {
            userPoolId: pool.userPoolId,
            supportedIdentityProviders: ['COGNITO'].concat(providers.map(provider => provider.providerName)),
            callbackUrLs: callbackUrls.length ? callbackUrls : undefined,
            logoutUrLs: logoutUrls.length ? logoutUrls : undefined,
            allowedOAuthFlows: hasOAuthProviders ? OAUTH_FLOWS : undefined,
            allowedOAuthScopes: hasOAuthProviders ? OAUTH_SCOPES : undefined,
            allowedOAuthFlowsUserPoolClient: hasOAuthProviders || undefined,
        });

        providers.forEach(provider => {
            userPoolClient.addDependsOn(provider);
        });

        this.pool = pool;
        this.userPoolClient = userPoolClient;
        this.cognitoDomain = cognitoDomain;
    }
}
