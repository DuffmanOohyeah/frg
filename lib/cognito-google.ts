import * as cdk from '@aws-cdk/core';
import * as cognito from '@aws-cdk/aws-cognito';

export interface CognitoGoogleConfig {
    readonly clientId: string;
    readonly clientSecret: string;
    readonly name: string;
}

export interface CognitoGoogleProps {
    readonly userPool: cognito.UserPool;
    readonly config: CognitoGoogleConfig;
}

export class CognitoGoogle extends cdk.Construct {
    public readonly userPoolIdentityProvider: cognito.CfnUserPoolIdentityProvider;

    constructor(scope: cdk.Construct, id: string, props: CognitoGoogleProps) {
        super(scope, id);

        const tags = cdk.Tags.of(this);
        tags.add('Subcomponent', 'CognitoGoogle');

        this.userPoolIdentityProvider = new cognito.CfnUserPoolIdentityProvider(this, 'GoogleIdenity', {
            userPoolId: props.userPool.userPoolId,
            providerName: props.config.name,
            providerType: 'Google',
            providerDetails: {
                /* eslint-disable @typescript-eslint/naming-convention */
                client_id: props.config.clientId,
                client_secret: props.config.clientSecret,
                authorize_scopes: 'profile email openid',
                // attributes_request_method: 'GET',
                attributes_url: 'https://people.googleapis.com/v1/people/me?personFields=',
                attributes_url_add_attributes: 'true',
                authorize_url: 'https://accounts.google.com/o/oauth2/v2/auth',
                oidc_issuer: 'https://accounts.google.com',
                token_request_method: 'POST',
                token_url: 'https://www.googleapis.com/oauth2/v4/token',
                /* eslint-enable @typescript-eslint/naming-convention */
            },
            attributeMapping: {
                /* eslint-disable @typescript-eslint/naming-convention */
                email: 'email',
                email_verified: 'email_verified',
                username: 'sub',
                given_name: 'given_name', // Only used for user to complete signup process
                family_name: 'family_name', // Only used for user to complete signup process
                picture: 'picture',
                /* eslint-enable @typescript-eslint/naming-convention */
            },
        });
    }
}
