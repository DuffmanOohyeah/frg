import FRGDocument from '../pages/_document';
import { assertIsDefined } from './testUtils';
import * as ReactIs from 'react-is';
import { Config } from '../client';
import { defaultConfig } from './_app.test';

jest.mock('../client', () => ({
    getConfigServer: (): Config => defaultConfig,
    isBrowser: () => true,
}));

describe('pages/_document getInitialProps', () => {
    test('getInitialProps should return the right props', async () => {
        assertIsDefined(FRGDocument.getInitialProps);

        const initialProps = await FRGDocument.getInitialProps({
            pathname: '/pages/_document',
            query: {},
            AppTree: jest.fn(),
            // normal render page returns undefined head and html fields
            renderPage: () => ({
                html: '',
            }),
        });

        // FRGDocument initialProps output is an object where the key styles is a react.fragment
        expect(initialProps.styles).not.toBeUndefined();
        expect(ReactIs.isFragment(initialProps.styles)).toBe(true);
    });
});
