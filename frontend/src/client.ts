import Lambda from 'aws-sdk/clients/lambda';
import { createAppSyncLink, AUTH_TYPE } from 'aws-appsync';
import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { CognitoUser } from '@aws-amplify/auth';
import { AuthOptions } from 'aws-appsync-auth-link';
import { getApolloContext } from '@apollo/react-common';
import { useContext } from 'react';
require('isomorphic-fetch');

export interface Config {
    graphqlUrl: string;
    apiKey: string;
    awsRegion: string;
    contentDomain?: string;
    userPoolId: string;
    userPoolClientId: string;
    userPoolOAuthDomain: string;
    redirectSignInUrl?: string;
    redirectSignOutUrl?: string;
    brand: string;
    useProdPardotEndpoints?: boolean;
    employerContactPreferencesUrl?: string;
    googleAuth?: boolean;
    linkedInAuth?: boolean;
    githubAuth?: boolean;
    facebookAuth?: boolean;
    pardotTrackingCodepiAId?: string;
    pardotTrackingCodepiCId?: string;
    googleTagManagerCode?: string;
}

export const isBrowser = (): boolean => {
    return typeof window !== 'undefined';
};

// TODO: find a better way of doing this, see https://github.com/isotoma/frg/issues/108
export const browserPersistConfig = (config: Config): void => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).appConfig = config;
};

// TODO: find a better way of doing this, see https://github.com/isotoma/frg/issues/108
export const browserRetrieveConfig = (): Config => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window as any).appConfig;
};

interface ApiKey {
    apiKey: string;
    useUntil: string; // ISO datetime
}

let apiKey: ApiKey | undefined;

export const getConfigServer = async (): Promise<Config> => {
    if (isBrowser()) {
        return Promise.resolve(browserRetrieveConfig());
    }

    const apiKeyLambda = process.env.API_KEY_LAMBDA_FUNCTION_NAME || process.env.REACT_APP_API_KEY_LAMBDA_FUNCTION_NAME;
    const graphqlUrl = process.env.GRAPHQL_URL || process.env.REACT_APP_GRAPHQL_URL;
    const awsRegion = process.env.AWS_REGION || process.env.REACT_APP_AWS_REGION;
    const contentDomain = process.env.CONTENT_DOMAIN || process.env.REACT_APP_CONTENT_DOMAIN || undefined;
    const userPoolId = process.env.USER_POOL_ID || process.env.REACT_APP_USER_POOL_ID || undefined;
    const userPoolClientId = process.env.USER_POOL_CLIENT_ID || process.env.REACT_APP_USER_POOL_CLIENT_ID || undefined;
    const userPoolOAuthDomain =
        process.env.USER_POOL_OAUTH_DOMAIN || process.env.REACT_APP_USER_POOL_OAUTH_DOMAIN || undefined;
    const redirectSignInUrl =
        process.env.SIGN_IN_REDIRECT_URL || process.env.REACT_APP_SIGN_IN_REDIRECT_URL || undefined;
    const redirectSignOutUrl =
        process.env.SIGN_OUT_REDIRECT_URL || process.env.REACT_APP_SIGN_OUT_REDIRECT_URL || undefined;
    const brand = process.env.BRAND || process.env.REACT_APP_BRAND || undefined;
    const useProdPardotEndpoints =
        process.env.USE_PROD_PARDOT_ENDPOINTS || process.env.REACT_APP_USE_PROD_PARDOT_ENDPOINTS || undefined;
    const employerContactPreferencesUrl =
        process.env.EMPLOYER_CONTACT_PREFERENCES_URL || process.env.REACT_APP_EMPLOYER_CONTACT_PREFERENCES_URL || '';
    const googleAuth = process.env.GOOGLE_AUTH || process.env.REACT_APP_GOOGLE_AUTH || undefined;
    const linkedInAuth = process.env.LINKEDIN_AUTH || process.env.REACT_APP_LINKEDIN_AUTH || undefined;
    const githubAuth = process.env.GITHUB_AUTH || process.env.REACT_APP_GITHUB_AUTH || undefined;
    const facebookAuth = process.env.FACEBOOK_AUTH || process.env.REACT_APP_FACEBOOK_AUTH || undefined;
    const pardotTrackingCodepiAId =
        process.env.PARDOT_TRACKING_CODE_PIAID || process.env.REACT_APP_PARDOT_TRACKING_CODE_PIAID || undefined;
    const pardotTrackingCodepiCId =
        process.env.PARDOT_TRACKING_CODE_PICID || process.env.REACT_APP_PARDOT_TRACKING_CODE_PICID || undefined;
    const googleTagManagerCode =
        process.env.GOOGLE_TAG_MANAGER_CODE || process.env.REACT_APP_GOOGLE_TAG_MANAGER_CODE || undefined;

    if (!apiKeyLambda) throw new Error('Improperly configured, no API_KEY_LAMBDA_FUNCTION_NAME set');
    if (!graphqlUrl) throw new Error('Improperly configured, no GRAPHQL_URL set');
    if (!awsRegion) throw new Error('Improperly configured, no AWS_REGION set');
    if (!userPoolId) throw new Error('Improperly configured, no USER_POOL_ID set');
    if (!userPoolClientId) throw new Error('Improperly configured, no USER_POOL_CLIENT_ID set');
    if (!userPoolOAuthDomain) throw new Error('Improperly configured, no USER_POOL_OAUTH_DOMAIN set');
    if (!brand) throw new Error('Improperly configured, no BRAND set');

    let validApiKey: ApiKey | undefined = undefined;
    if (apiKey) {
        const keyFromCache = apiKey;
        const sufficientlyValid = new Date() < new Date(keyFromCache.useUntil);
        if (sufficientlyValid) {
            validApiKey = keyFromCache;
        }
    }

    if (!validApiKey) {
        const lambdaClient = new Lambda({ region: awsRegion });
        const lambdaResponse = await lambdaClient
            .invoke({
                FunctionName: apiKeyLambda,
            })
            .promise();
        const payloadResponseJson = lambdaResponse.Payload;

        if (lambdaResponse.FunctionError) {
            console.error(`Error from API key Lambda: ${lambdaResponse.FunctionError}`);
            return Promise.reject('Unable to retrieve API key');
        }

        if (typeof payloadResponseJson === 'undefined') {
            console.error('No payload returned from API key Lambda');
            return Promise.reject('No API key in response');
        }

        const payloadResponseJsonString = String(payloadResponseJson);

        try {
            const apiKeyFromLambda: ApiKey = JSON.parse(payloadResponseJsonString);
            validApiKey = apiKeyFromLambda;
            apiKey = validApiKey;
        } catch (err) {
            console.error('Unable to load API key from Lambda response');
            return Promise.reject('Unable to parse API key');
        }
    }

    return {
        apiKey: validApiKey.apiKey,
        graphqlUrl,
        awsRegion,
        contentDomain,
        userPoolId,
        userPoolClientId,
        userPoolOAuthDomain,
        redirectSignInUrl,
        redirectSignOutUrl,
        brand,
        useProdPardotEndpoints: !!useProdPardotEndpoints,
        employerContactPreferencesUrl,
        googleAuth: !!googleAuth,
        linkedInAuth: !!linkedInAuth,
        githubAuth: !!githubAuth,
        facebookAuth: !!facebookAuth,
        pardotTrackingCodepiAId,
        pardotTrackingCodepiCId,
        googleTagManagerCode,
    };
};
/* eslint-disable max-len */
/*
technically ApolloClient<NormalizedCacheObject> is correct Old apollo react hooks allowed passing of types:
https://github.com/trojanowski/react-apollo-hooks/blob/0ba17aa8ccb70f858c05600bc023869ec4c332a7/src/ApolloContext.tsx#L22
This library was absorbed into the main library which does not allow passing of type
https://github.com/apollographql/apollo-client/blob/7993a778ef5a9e61bfee72b956f4c179fce691f4/src/react/hooks/useApolloClient.ts#L7
hopefully this will be fixed at some point
*/
/* eslint-enable max-len */

// eslint-disable-next-line @typescript-eslint/ban-types
export type Client = ApolloClient<object>;

// See https://github.com/awslabs/aws-mobile-appsync-sdk-js/issues/450#issuecomment-529521768
export const getClient = (config: Config, user?: CognitoUser): Client => {
    const httpLink = createHttpLink({
        uri: config.graphqlUrl,
    });

    const makeAuthOptions = (user?: CognitoUser): AuthOptions => {
        if (user) {
            // user from server doesnt work here as it doesnt have getSignInUserSession
            const session = user.getSignInUserSession && user.getSignInUserSession();
            if (session)
                return {
                    type: AUTH_TYPE.AMAZON_COGNITO_USER_POOLS,
                    jwtToken: session.getIdToken().getJwtToken(),
                };
        }
        return {
            type: AUTH_TYPE.API_KEY,
            apiKey: config.apiKey,
        };
    };
    const awsLink = createAppSyncLink({
        url: config.graphqlUrl,
        region: config.awsRegion,
        auth: makeAuthOptions(user),
        complexObjectsCredentials: () => null,
    });

    return new ApolloClient({
        link: awsLink.concat(httpLink),
        cache: new InMemoryCache(),
    });
};

/*
this is a replacemment for useApolloClient, useApolloClient throws an error
if an Apollo provider isn't found which will always be the case on the server side.
This is exactly what useApolloClient is doing under the hood except the error throwing
*/
// eslint-disable-next-line @typescript-eslint/ban-types
export const useClientFromContext = (): ApolloClient<object> | undefined => {
    const { client } = useContext(getApolloContext());
    return client;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export const dummyClient = (): ApolloClient<object> => {
    const httpLink = createHttpLink();
    return new ApolloClient({ cache: new InMemoryCache(), link: httpLink });
};
