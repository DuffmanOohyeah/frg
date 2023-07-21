import FRGApp from '../pages/_app';
import { Config } from '../client';

interface GetInitialProps {
    componentProps: {
        context: string;
    };
}

export const defaultConfig = {
    graphqlUrl: 'graphqlUrl',
    apiKey: 'apiKey',
    awsRegion: 'awsRegion',
    contentDomain: 'contentDomain',
    userPoolId: 'userPoolId',
    userPoolClientId: 'userPoolClientId',
    userPoolOAuthDomain: 'userPoolOAuthDomain',
    redirectSignInUrl: 'redirectSignInUrl',
    redirectSignOutUrl: 'redirectSignOutUrl',
    brand: 'Jefferson',
};

jest.mock('../client', () => ({
    getConfigServer: (): Config => defaultConfig,
    isBrowser: () => true,
}));

describe('pages/_app getInitialProps', () => {
    test('getInitialProps should return the right props when the component has no initial props', async () => {
        const initialProps = await FRGApp.getInitialProps({ Component: {}, ctx: { query: {} } });

        expect(initialProps.pageProps.config).toEqual(defaultConfig);
    });

    test('getInitialProps should return the right props when the component has a initial props function', async () => {
        const initialProps = await FRGApp.getInitialProps({
            Component: { getInitialProps: (ctx): GetInitialProps => ({ componentProps: ctx }) },
            ctx: { context: 'context', query: {} },
        });
        expect(initialProps.pageProps.componentProps).toEqual({ context: 'context', query: {} });
        expect(initialProps.pageProps.config).toEqual(defaultConfig);
        expect(initialProps.pageProps.i18nResourceData).toBeTruthy();
        expect(initialProps.pageProps.brandData).toBeTruthy();
    });
});
