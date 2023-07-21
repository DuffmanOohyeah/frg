import i18nNextHref from '../i18n/i18nNextHref';

beforeEach(() => {
    jest.resetModules();
});

describe('i18nNextAs/href is a string', () => {
    test('should return Nextjs UrlObject for root', async () => {
        const rootHref = i18nNextHref('/');
        expect(rootHref).toEqual(
            expect.objectContaining({
                href: '/',
                pathname: '/',
                query: {},
            }),
        );
    });

    test('should return Nextjs UrlObject for not root', async () => {
        const levelOneHref = i18nNextHref('/foo');
        expect(levelOneHref).toEqual(
            expect.objectContaining({
                href: '/foo',
                pathname: '/foo',
                query: {},
            }),
        );

        const levelTwoHref = i18nNextHref('/foo/bar');
        expect(levelTwoHref).toEqual(
            expect.objectContaining({
                href: '/foo/bar',
                pathname: '/foo/bar',
                query: {},
            }),
        );
    });

    test('should preserve query params', async () => {
        const queryHref = i18nNextHref('/foo?test=foo');
        expect(queryHref).toEqual(
            expect.objectContaining({
                href: '/foo?test=foo',
                pathname: '/foo',
                query: { test: 'foo' },
            }),
        );
    });
});

describe('i18nNextAs/href is a object', () => {
    test('should return Nextjs UrlObject for root', async () => {
        const rootHref = i18nNextHref({ pathname: '/' });
        expect(rootHref).toEqual(
            expect.objectContaining({
                pathname: '/',
                query: {},
            }),
        );
    });

    test('should return Nextjs UrlObject for not root', async () => {
        const levelOneHref = i18nNextHref({ pathname: '/foo' });
        expect(levelOneHref).toEqual(
            expect.objectContaining({
                pathname: '/foo',
                query: {},
            }),
        );

        const levelTwoHref = i18nNextHref({ pathname: '/foo/bar' });
        expect(levelTwoHref).toEqual(
            expect.objectContaining({
                pathname: '/foo/bar',
                query: {},
            }),
        );
    });

    test('should preserve query params', async () => {
        const queryHref = i18nNextHref({ pathname: '/foo/bar', query: { test: 'foo' } });
        expect(queryHref).toEqual(
            expect.objectContaining({
                pathname: '/foo/bar',
                query: { test: 'foo' },
            }),
        );
    });
});

describe('i18nNextAs/with nondefault language', () => {
    beforeEach(() => {
        // Mock the current language to pretend that we are using the function when we have set up i18n
        // and set a language that is not the 'default language'
        jest.mock('i18next', () => ({
            language: 'de',
        }));
    });

    test('should return Nextjs UrlObject for root', async () => {
        // We mocked i18next in beforeEach so we need to reimport the
        // i18nNextHref module so that it uses our mocked values
        return import('../i18n/i18nNextHref').then(mockedI18nNextHref => {
            const rootHref = mockedI18nNextHref.default({ pathname: '/' });
            expect(rootHref).toEqual(
                expect.objectContaining({
                    pathname: '/',
                    query: { lang: 'de' },
                }),
            );
        });
    });

    test('should return Nextjs UrlObject for not root', async () => {
        // We mocked i18next in beforeEach so we need to reimport the
        // i18nNextHref module so that it uses our mocked values
        return import('../i18n/i18nNextHref').then(mockedI18nNextHref => {
            const levelOneHref = mockedI18nNextHref.default({ pathname: '/foo' });
            expect(levelOneHref).toEqual(
                expect.objectContaining({
                    pathname: '/foo',
                    query: { lang: 'de' },
                }),
            );

            const levelTwoHref = mockedI18nNextHref.default({ pathname: '/foo/bar' });
            expect(levelTwoHref).toEqual(
                expect.objectContaining({
                    pathname: '/foo/bar',
                    query: { lang: 'de' },
                }),
            );
        });
    });

    test('should preserve query params', async () => {
        // We mocked i18next in beforeEach so we need to reimport the
        // i18nNextHref module so that it uses our mocked values
        return import('../i18n/i18nNextHref').then(mockedI18nNextHref => {
            const queryHref = mockedI18nNextHref.default({ pathname: '/foo/bar', query: { test: 'foo' } });
            expect(queryHref).toEqual(
                expect.objectContaining({
                    pathname: '/foo/bar',
                    query: { test: 'foo', lang: 'de' },
                }),
            );
        });
    });
});
