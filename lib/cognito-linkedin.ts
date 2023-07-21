import * as cdk from '@aws-cdk/core';
import * as cognito from '@aws-cdk/aws-cognito';
import * as apiGateway from '@aws-cdk/aws-apigateway';
import * as lambda from '@aws-cdk/aws-lambda';

export interface CognitoLinkedInConfig {
    readonly clientId: string;
    readonly clientSecret: string;
    readonly name: string;
}

export interface CognitoLinkedInProps {
    readonly userPoolId: string;
    readonly cognitoDomain: string;
    readonly config: CognitoLinkedInConfig;
}

const getIntegration = (fn: lambda.Function): apiGateway.LambdaIntegration => {
    return new apiGateway.LambdaIntegration(fn, {
        requestTemplates: {
            'application/json': '{ "statusCode": "200" }',
        },
    });
};

export class CognitoLinkedIn extends cdk.Construct {
    public readonly userPoolIdentityProvider: cognito.CfnUserPoolIdentityProvider;

    constructor(scope: cdk.Construct, id: string, props: CognitoLinkedInProps) {
        super(scope, id);
        const tags = cdk.Tags.of(this);
        tags.add('Subcomponent', 'CognitoLinkedIn');

        const stageName = 'Stage';

        const api = new apiGateway.RestApi(this, 'LinkedInOAuthApi', {
            deploy: true,
            deployOptions: {
                stageName,
            },
        });

        const apiDomainNameUrl = api.url;
        const linkedinScope = 'openid r_liteprofile r_emailaddress';

        const commonEnvironment = {
            LINKEDIN_CLIENT_ID: props.config.clientId,
            LINKEDIN_CLIENT_SECRET: props.config.clientSecret,
            COGNITO_REDIRECT_URI: `${props.cognitoDomain}/oauth2/idpresponse`,
            LINKEDIN_API_URL: 'https://api.linkedin.com',
            LINKEDIN_LOGIN_URL: 'https://www.linkedin.com',
            LINKEDIN_SCOPE: linkedinScope,
        };
        const commonOptions = {
            runtime: lambda.Runtime.NODEJS_14_X,
            code: lambda.Code.asset('./extra_assets/linkedin-cognito-openid-wrapper-assets/'),
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

        // /token
        const tokenIntegration = getIntegration(token);
        const tokenPath = api.root.addResource('token');
        tokenPath.addMethod('GET', tokenIntegration);
        tokenPath.addMethod('POST', tokenIntegration);

        // /authorize
        const authorizePath = api.root.addResource('authorize');
        const authorizeIntegration = getIntegration(authorize);
        authorizePath.addMethod('GET', authorizeIntegration);

        // /userinfo
        const userInfoIntegration = getIntegration(userInfo);
        const userInfoPath = api.root.addResource('userinfo');
        userInfoPath.addMethod('GET', userInfoIntegration);
        userInfoPath.addMethod('POST', userInfoIntegration);

        // /.well-known
        const wellKnownPath = api.root.addResource('.well-known');
        const discoverIntegration = getIntegration(discover);
        // /.well-known/openid-configuration
        const openIdConfigurationPath = wellKnownPath.addResource('openid-configuration');
        openIdConfigurationPath.addMethod('GET', discoverIntegration);
        // /.well-known/jwks.json
        const jwksPath = wellKnownPath.addResource('jwks.json');
        const jwksIntegration = getIntegration(jwks);
        jwksPath.addMethod('GET', jwksIntegration);

        this.userPoolIdentityProvider = new cognito.CfnUserPoolIdentityProvider(this, 'LinkedInIdentity', {
            userPoolId: props.userPoolId,
            providerName: props.config.name,
            providerType: 'OIDC',
            providerDetails: {
                /* eslint-disable @typescript-eslint/naming-convention */
                client_id: props.config.clientId,
                client_secret: props.config.clientSecret,
                authorize_scopes: linkedinScope,
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
                given_name: 'firstName', // Only used for user to complete signup process
                family_name: 'lastName', // Only used for user to complete signup process
                picture: 'picture',
                /* eslint-enable @typescript-eslint/naming-convention */
            },
        });
    }
}

export class CognitoLinkedInNestedStack extends cdk.NestedStack {
    public readonly userPoolIdentityProvider: cognito.CfnUserPoolIdentityProvider;

    constructor(scope: cdk.Construct, id: string, props: CognitoLinkedInProps) {
        super(scope, id);
        const cognitoGithub = new CognitoLinkedIn(this, id, props);
        this.userPoolIdentityProvider = cognitoGithub.userPoolIdentityProvider;
    }
}
