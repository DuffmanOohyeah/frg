module.exports = {
    // The root of your source code, typically /src
    // `<rootDir>` is a token Jest substitutes
    roots: ['<rootDir>/src'],
    globals: {
        'ts-jest': {
            tsConfig: 'tsconfig.test.json',
        },
    },

    // Jest transformations -- this adds support for TypeScript
    // using ts-jest
    preset: 'ts-jest',
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },

    // Runs special logic, such as cleaning up components
    // when using React Testing Library and adds special
    // extended assertions to Jest
    setupFilesAfterEnv: [
        '@testing-library/jest-dom/extend-expect',
        './src/testUtils/mockNextRouter.js',
        './src/testUtils/mockReact-i18next.js',
    ],

    // Test spec file resolution pattern
    // Matches parent folder `__tests__` and filename
    // should end with `test.tsx` or `test.ts`.
    testRegex: '/__(pages)?tests__/.*.test.tsx?$',

    // Module file extensions for importing
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

    moduleNameMapper: {
        // Mock files to match the files we load via the webpack config
        '\\.(jpg)$': '<rootDir>/src/__pagestests__/mockFile.ts',
        '\\.(png)$': '<rootDir>/src/__pagestests__/mockFile.ts',
        '\\.(ico)$': '<rootDir>/src/__pagestests__/mockFile.ts',
        '\\.(svg)$': '<rootDir>/src/__pagestests__/mockFile.ts',
    },

    collectCoverage: true,
    collectCoverageFrom: [
        // Ignore js dot files
        '!**/.*.js',
        // Ignore json files
        '!**/*.json',
        // Ignore the styled components
        '!src/components/{bits,brands,patterns,templates,utils}/**/*.{ts,tsx}',
        // Ignore the themes
        '!src/themes/**/*.{ts,tsx}',
        // Tests are ignored by default, but also ignore any util files in these directories
        '!src/__(pages)?tests__/**/*.{ts,tsx}',
        // Ignore the pardot endpoint definitions
        '!src/pardot/formHandlerEndpoints/**/*.{ts,tsx}',
        // Ignore the vanity url definitions
        '!src/brands/getVanityUrls/candidates/*.tsx',
        '!src/brands/getVanityUrls/jobs/*.tsx',
        // Ignore the meta definitions for each page
        '!src/brands/getHtmlMeta/*.tsx',
        // Ignore the old job id -> new job id mappings for each brand
        '!src/brands/getOldJobUrlMapping/*.ts',
        // Ignore list of vanity urls for each brand
        '!src/brands/getSitemapLandingPages/**/*.ts',
        // Ignore map of redirects for each brand
        '!src/utils/pageRedirects/**/*.ts',
    ],
    coverageThreshold: {
        global: {
            branches: 54,
            functions: 41,
            statements: 57,
            lines: 60,
        },
    },
    testResultsProcessor: '../util/testResultsProcessor.js',
};
