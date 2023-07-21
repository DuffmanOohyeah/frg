import * as cdk from '@aws-cdk/core';
import * as cognito from '@aws-cdk/aws-cognito';
import * as apiGateway from '@aws-cdk/aws-apigateway';
import * as lambda from '@aws-cdk/aws-lambda';

export interface CognitoGithubConfig {
    readonly clientId: string;
    readonly clientSecret: string;
    readonly name: string;
}

interface CognitoGithubProps {
    readonly userPoolId: string;
    readonly cognitoDomain: string;
    readonly config: CognitoGithubConfig;
}

const getIntegration = (fn: lambda.Function): apiGateway.LambdaIntegration => {
    return new apiGateway.LambdaIntegration(fn, {
        requestTemplates: {
            'application/json': '{ "statusCode": "200" }',
        },
    });
};

export class CognitoGithub extends cdk.Construct {
    public readonly userPoolIdentityProvider: cognito.CfnUserPoolIdentityProvider;

    constructor(scope: cdk.Construct, id: string, props: CognitoGithubProps) {
        super(scope, id);

        const tags = cdk.Tags.of(this);
        tags.add('Subcomponent', 'CognitoGithub');

        const stageName = 'Stage';

        const api = new apiGateway.RestApi(this, 'GithubOAuthApi', {
            deploy: true,
            deployOptions: {
                stageName,
            },
        });

        const apiDomainNameUrl = api.url; // `https://${api.restApiId}.execute-api.${cdk.Stack.of(this).region}.amazonaws.com/${stageName}`;

        const commonEnvironment = {
            GITHUB_CLIENT_ID: props.config.clientId,
            GITHUB_CLIENT_SECRET: props.config.clientSecret,
            COGNITO_REDIRECT_URI: `${props.cognitoDomain}/oauth2/idpresponse`,
            GITHUB_API_URL: 'https://api.github.com',
            GITHUB_LOGIN_URL: 'https://github.com',
        };
        const commonOptions = {
            runtime: lambda.Runtime.NODEJS_14_X,
            code: lambda.Code.asset('./extra_assets/github-cognito-openid-wrapper-assets/'),
            timeout: cdk.Duration.seconds(30),
            environment: commonEnvironment,
        };

        const discover = new lambda.Function(this, 'OpenIdDiscovery', {
            ...commonOptions,
            handler: 'openIdConfiguration.handler',
        });

        const authorize = new lambda.Function(this, 'Authorize', {
            ...commonOptions,
            handler: 'authorize.handler',
        });

        const token = new lambda.Function(this, 'Token', {
            ...commonOptions,
            handler: 'token.handler',
        });

        const userInfo = new lambda.Function(this, 'UserInfo', {
            ...commonOptions,
            handler: 'userinfo.handler',
        });

        const jwks = new lambda.Function(this, 'Jwks', {
            ...commonOptions,
            handler: 'jwks.handler',
        });

        const wellKnownPath = api.root.addResource('.well-known');
        const tokenPath = api.root.addResource('token');
        const userInfoPath = api.root.addResource('userinfo');
        const openIdConfigurationPath = wellKnownPath.addResource('openid-configuration');
        const authorizePath = api.root.addResource('authorize');
        const jwksPath = wellKnownPath.addResource('jwks.json');

        const discoverIntegration = getIntegration(discover);
        openIdConfigurationPath.addMethod('GET', discoverIntegration);
        const authorizeIntegration = getIntegration(authorize);
        authorizePath.addMethod('GET', authorizeIntegration);
        const tokenIntegration = getIntegration(token);
        tokenPath.addMethod('GET', tokenIntegration);
        tokenPath.addMethod('POST', tokenIntegration);
        const userInfoIntegration = getIntegration(userInfo);
        userInfoPath.addMethod('GET', userInfoIntegration);
        userInfoPath.addMethod('POST', userInfoIntegration);
        const jwksIntegration = getIntegration(jwks);
        jwksPath.addMethod('GET', jwksIntegration);

        this.userPoolIdentityProvider = new cognito.CfnUserPoolIdentityProvider(this, 'GithubIdenity', {
            userPoolId: props.userPoolId,
            providerName: props.config.name,
            providerType: 'OIDC',
            providerDetails: {
                /* eslint-disable @typescript-eslint/naming-convention */
                client_id: props.config.clientId,
                client_secret: props.config.clientSecret,
                authorize_scopes: 'openid read:user user:email',
                attributes_request_method: 'GET',

                oidc_issuer: apiDomainNameUrl,
                authorize_url: `${apiDomainNameUrl}/authorize`,
                token_url: `${apiDomainNameUrl}/token`,
                attributes_url: `${apiDomainNameUrl}/userinfo`,
                jwks_uri: `${apiDomainNameUrl}/.well-known/jwks.json`,
                /* eslint-enable @typescript-eslint/naming-convention */
            },
            attributeMapping: {
                /* eslint-disable @typescript-eslint/naming-convention */
                email: 'email',
                email_verified: 'email_verified',
                username: 'sub',
                given_name: 'given_name', // Only used for user to complete signup process
                family_name: 'family_name', // Only used for user to complete signup process
                /* eslint-enable @typescript-eslint/naming-convention */
            },
        });
    }
}

export class CognitoGithubNestedStack extends cdk.NestedStack {
    public readonly userPoolIdentityProvider: cognito.CfnUserPoolIdentityProvider;

    constructor(scope: cdk.Construct, id: string, props: CognitoGithubProps) {
        super(scope, id);
        const cognitoGithub = new CognitoGithub(this, id, props);
        this.userPoolIdentityProvider = cognitoGithub.userPoolIdentityProvider;
    }
}
