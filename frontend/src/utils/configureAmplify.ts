import { Amplify } from 'aws-amplify';
import { AmplifyConfig } from '@aws-amplify/core/lib-esm/types';
import { replace } from 'ramda';

const configureAmplfy = config => {
    const amplifyConfig: AmplifyConfig = {
        Auth: {
            region: config.awsRegion,
            userPoolId: config.userPoolId,
            userPoolWebClientId: config.userPoolClientId,
            oauth: {
                domain: replace('https://', '', config.userPoolOAuthDomain),
                scope: ['aws.cognito.signin.user.admin', 'email', 'openid', 'phone', 'profile'],
                redirectSignIn: config.redirectSignInUrl,
                redirectSignOut: config.redirectSignOutUrl,
                // or 'token', note that REFRESH token will only be generated when the responseType is code
                responseType: 'code',
            },
        },
        ssr: true,
    };
    Amplify.configure(amplifyConfig);
};

export default configureAmplfy;
