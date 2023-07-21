import SitemapPage from '../pages/sitemap.xml';
import { getClient, getConfigServer, Config } from '../client';
import { assertIsDefined, MockQueryClient } from './testUtils';
import { IncomingMessage, ServerResponse } from 'http';

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

describe('pages/sitemap.xml getInitialProps', () => {
    beforeEach(() => {
        (getConfigServer as jest.Mock<Promise<Config>>).mockImplementation(
            (): Promise<Config> => Promise.resolve(defaultConfig),
        );
    });

    test('getInitialProps should return undefined when no request or response', async () => {
        assertIsDefined(SitemapPage.getInitialProps);

        const initialProps = await SitemapPage.getInitialProps({
            pathname: '/sitemap.xml',
            query: {},
            AppTree: jest.fn(),
        });
        expect(initialProps).toEqual(undefined);
    });

    test('getInitialProps should return the right props', async () => {
        const mockQuery = jest.fn().mockImplementation(() =>
            Promise.resolve({
                data: {
                    getSitemapBlogList: [],
                },
            }),
        );

        ((getClient as unknown) as jest.Mock<MockQueryClient>).mockImplementation(
            (): MockQueryClient => ({
                query: mockQuery,
            }),
        );

        assertIsDefined(SitemapPage.getInitialProps);

        const mockedSetHeader = jest.fn();
        const mockedWrite = jest.fn();
        const mockedEnd = jest.fn();
        const mockReq = { headers: { host: 'testHost' } } as IncomingMessage;
        const mockRes = { setHeader: mockedSetHeader, write: mockedWrite, end: mockedEnd } as unknown;

        await SitemapPage.getInitialProps({
            pathname: '/sitemap.xml',
            query: {},
            AppTree: jest.fn(),
            req: mockReq,
            res: mockRes as ServerResponse,
        });

        expect(mockedSetHeader).toBeCalledWith('Content-Type', 'text/xml');
        expect(mockedWrite).toBeCalledTimes(1);
        expect(mockedEnd).toBeCalledTimes(1);
    });
});
