import CatchAllPage from '../pages/[...path]';
import { getConfigServer, Config, getClient } from '../client';
import { assertIsDefined, MockQueryClient } from './testUtils';
import { isEmpty } from 'ramda';

jest.mock('../client');

const defaultConfig = {
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

describe('pages/[...path]', () => {
    // Nothing to test for render because we should be reusing the render from other pages/components
});

describe('pages/[...path] getInitialProps', () => {
    beforeEach(() => {
        (getConfigServer as jest.Mock<Promise<Config>>).mockImplementation(
            (): Promise<Config> => Promise.resolve(defaultConfig),
        );
        ((getClient as unknown) as jest.Mock<MockQueryClient>).mockImplementation(
            (): MockQueryClient => ({
                query: jest.fn().mockImplementation(() => Promise.resolve({})),
            }),
        );
    });

    test('Should return empty object when it doesn\'t match any "dynamic page" conditions', async () => {
        assertIsDefined(CatchAllPage.getInitialProps);

        const initialProps = await CatchAllPage.getInitialProps({
            pathname: '/doopdeepdop',
            asPath: '/doopdeepdop',
            query: {},
            AppTree: jest.fn(),
        });
        expect(initialProps).toEqual({});
    });

    test('Should return non empty object when it matches any "dynamic page" conditions', async () => {
        assertIsDefined(CatchAllPage.getInitialProps);

        const initialProps = await CatchAllPage.getInitialProps({
            pathname: '/aws-jobs', // matches Jefferson getJobSearchUrl
            asPath: '/aws-jobs',
            query: {},
            AppTree: jest.fn(),
        });
        expect(isEmpty(initialProps)).toBeFalsy();
    });
});
