import { Config } from '../client';

export function assertIsDefined(value: unknown): asserts value {
    if (typeof value === 'undefined') {
        throw new Error('Must be defined');
    }
}

export interface MockQueryClient {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query: (props: any) => Promise<any>;
}

export const mockConfig = {
    apiKey: 'mockApiKey',
    graphqlUrl: 'mockGraphqlUrl',
    awsRegion: 'mockAwsRegion',
    contentDomain: 'mockContentDomain',
    brand: 'Jefferson',
} as Config;
