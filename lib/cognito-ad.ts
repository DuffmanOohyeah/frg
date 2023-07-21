import * as cdk from '@aws-cdk/core';
import * as cognito from '@aws-cdk/aws-cognito';

export interface CognitoADConfig {
    readonly xmlMetadata: string;
    readonly sloRedirectBindingUri: string;
    readonly ssoRedirectBindingUri: string;
    readonly name: string;
}

export interface CognitoADProps {
    readonly userPool: cognito.UserPool;
    readonly config: CognitoADConfig;
}

export class CognitoAD extends cdk.Construct {
    public readonly userPoolIdentityProvider: cognito.CfnUserPoolIdentityProvider;

    constructor(scope: cdk.Construct, id: string, props: CognitoADProps) {
        super(scope, id);

        const tags = cdk.Tags.of(this);
        tags.add('Subcomponent', 'CognitoAD');

        this.userPoolIdentityProvider = new cognito.CfnUserPoolIdentityProvider(this, 'ADIdenity', {
            userPoolId: props.userPool.userPoolId,
            providerName: props.config.name,
            providerType: 'SAML',
            providerDetails: {
                MetadataFile: props.config.xmlMetadata,
                SSORedirectBindingURI: props.config.ssoRedirectBindingUri,
                SLORedirectBindingURI: props.config.sloRedirectBindingUri,
                IDPSignout: 'true',
            },
        });
    }
}
