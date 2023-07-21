import i18nNextAs from '../i18n/i18nNextAs';

jest.mock('i18next', () => ({
    language: 'en',
}));
jest.mock('../i18n/frgI18n', () => ({
    __esModule: true,
    default: {
        languages: ['en', 'de', 'fr'],
    },
}));

beforeEach(() => {
    jest.resetModules();
});

describe('i18nNextAs/as is root', () => {
    test('should return for root when "as" matches href', async () => {
        const as = i18nNextAs('/', '/');
        expect(as).toEqual('/');
    });

    test('should return for root when "as" does not match href', async () => {
        const as = i18nNextAs('/root', '/');
        expect(as).toEqual('/root');
    });

    test('should return for root when no "as" supplied', async () => {
        const as = i18nNextAs(undefined, '/');
        expect(as).toEqual('/');
    });

    test('should return for root when "as" with wrong locale prefix is used', async () => {
        const as = i18nNextAs('/de', '/');
        expect(as).toEqual('/');
    });
});

describe('i18nNextAs/as is not root', () => {
    test('should return when "as" matches href', async () => {
        const as = i18nNextAs('/blog/post', '/blog/post');
        expect(as).toEqual('/blog/post');
    });

    test('should return when "as" does not match href', async () => {
        const as = i18nNextAs('/vip-blog-post', '/blog/post');
        expect(as).toEqual('/vip-blog-post');
    });

    test('should return when no "as" supplied', async () => {
        const as = i18nNextAs(undefined, '/blog/post');
        expect(as).toEqual('/blog/post');
    });
});

describe('i18nNextAs/href is dynamic', () => {
    test('should return when "as" matches href', async () => {
        const as = i18nNextAs('/blog/BestPost', { pathname: '/blog/[post]', query: { post: 'BestPost' } });
        expect(as).toEqual('/blog/BestPost');
    });

    test('should return when "as" does not match href', async () => {
        const as = i18nNextAs('/vip-blog-post', { pathname: '/blog/[post]', query: { post: 'BestPost' } });
        expect(as).toEqual('/vip-blog-post');
    });

    // Honestly I'm testing for this for completeness but if you are doing
    // a dynamic route you should be providing an 'as' for a clean url!
    test('should return when no "as" supplied', async () => {
        const as = i18nNextAs(undefined, { pathname: '/blog/[post]', query: { post: 'BestPost' } });
        expect(as).toEqual('/blog/[post]?post=BestPost');
    });
});

describe('i18nNextAs/when not default language', () => {
    beforeEach(() => {
        // Mock the current language and the languages constants
        // to pretend that we are using the function when we have set up i18n
        // and set a language that is not the 'default language'
        jest.mock('i18next', () => ({
            language: 'de',
        }));
    });

    test('should return when "as" matches href', async () => {
        // We mocked i18next and languages in beforeEach so we need to reimport the
        // i18nNextHref module so that it uses our mocked values
        return import('../i18n/i18nNextAs').then(mockedI18nNextAs => {
            const as = mockedI18nNextAs.default('/blog/post', '/blog/post');
            expect(as).toEqual('/de/blog/post');
        });
    });

    test('should return when "as" does not match href', async () => {
        // We mocked i18next and languages in beforeEach so we need to reimport the
        // i18nNextHref module so that it uses our mocked values
        return import('../i18n/i18nNextAs').then(mockedI18nNextAs => {
            const as = mockedI18nNextAs.default('/vip-blog-post', '/blog/post');
            expect(as).toEqual('/de/vip-blog-post');
        });
    });

    test('should return when no "as" supplied', async () => {
        // We mocked i18next and languages in beforeEach so we need to reimport the
        // i18nNextHref module so that it uses our mocked values
        return import('../i18n/i18nNextAs').then(mockedI18nNextAs => {
            const as = mockedI18nNextAs.default(undefined, '/blog/post');
            expect(as).toEqual('/de/blog/post');
        });
    });

    test('should return when "href" is dynamic', async () => {
        // We mocked i18next and languages in beforeEach so we need to reimport the
        // i18nNextHref module so that it uses our mocked values
        return import('../i18n/i18nNextAs').then(mockedI18nNextAs => {
            const as = mockedI18nNextAs.default(undefined, {
                pathname: '/blog/[post]',
                query: { post: 'BestPost' },
            });

            // Honestly I'm testing for this for completeness but if you are doing
            // a dynamic route you should be providing an 'as' for a clean url!
            expect(as).toEqual('/de/blog/[post]?post=BestPost');
        });
    });

    test('should return for root when "as" matches href', async () => {
        // We mocked i18next and languages in beforeEach so we need to reimport the
        // i18nNextHref module so that it uses our mocked values
        return import('../i18n/i18nNextAs').then(mockedI18nNextAs => {
            const as = mockedI18nNextAs.default('/', '/');
            expect(as).toEqual('/de');
        });
    });

    test('should return correct prefix if wrong prefix provided for "as"', async () => {
        // We mocked i18next and languages in beforeEach so we need to reimport the
        // i18nNextHref module so that it uses our mocked values
        return import('../i18n/i18nNextAs').then(mockedI18nNextAs => {
            const as = mockedI18nNextAs.default('/en', '/');
            expect(as).toEqual('/de');
        });
    });

    test('should return correct prefix if wrong prefix provided for "href"', async () => {
        // We mocked i18next and languages in beforeEach so we need to reimport the
        // i18nNextHref module so that it uses our mocked values
        return import('../i18n/i18nNextAs').then(mockedI18nNextAs => {
            const as = mockedI18nNextAs.default(undefined, '/en');
            expect(as).toEqual('/de');
        });
    });
});
