import * as cdk from '@aws-cdk/core';
import * as cognito from '@aws-cdk/aws-cognito';

export interface CognitoFacebookConfig {
    readonly clientId: string;
    readonly clientSecret: string;
    readonly name: string;
}

export interface CognitoFacebookProps {
    readonly userPool: cognito.UserPool;
    readonly config: CognitoFacebookConfig;
}

export class CognitoFacebook extends cdk.Construct {
    public readonly userPoolIdentityProvider: cognito.CfnUserPoolIdentityProvider;

    constructor(scope: cdk.Construct, id: string, props: CognitoFacebookProps) {
        super(scope, id);

        const tags = cdk.Tags.of(this);
        tags.add('Subcomponent', 'CognitoFacebook');

        this.userPoolIdentityProvider = new cognito.CfnUserPoolIdentityProvider(this, 'FacebookIdentity', {
            userPoolId: props.userPool.userPoolId,
            providerName: props.config.name,
            providerType: 'Facebook',
            providerDetails: {
                /* eslint-disable @typescript-eslint/naming-convention */
                client_id: props.config.clientId,
                client_secret: props.config.clientSecret,
                authorize_scopes: 'public_profile, email',
                api_version: 'v6.0',
                /* eslint-enable @typescript-eslint/naming-convention */
            },
            attributeMapping: {
                /* eslint-disable @typescript-eslint/naming-convention */
                email: 'email',
                username: 'id',
                given_name: 'first_name', // Only used for user to complete signup process
                family_name: 'last_name', // Only used for user to complete signup process
                picture: 'picture',
                /* eslint-enable @typescript-eslint/naming-convention */
            },
        });
    }
}
