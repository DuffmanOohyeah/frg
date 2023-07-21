import { includeConfig, getSingleQueryParam } from '../pagesUtil';
import { mockConfig } from './testUtils';

describe('includeConfig', () => {
    test('includes config', () => {
        expect(includeConfig(mockConfig)({ foo: 'bar' })).toEqual({
            config: mockConfig,
            foo: 'bar',
        });
    });
});

describe('getSingleQueryParam', () => {
    test('handles string', () => {
        expect(getSingleQueryParam({ foo: 'bar' }, 'foo')).toEqual('bar');
    });

    test('handles list of strings', () => {
        expect(getSingleQueryParam({ foo: ['bar', 'baz'] }, 'foo')).toEqual('bar');
    });

    test('errors if not found', () => {
        expect(() => getSingleQueryParam({}, 'foo')).toThrow('Missing query param foo');
    });
});
