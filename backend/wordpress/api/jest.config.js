module.exports = {
    roots: ['<rootDir>/tests'],
    testMatch: ['**/*.test.ts'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    collectCoverage: true,
    collectCoverageFrom: ['**/*.{ts,js}', '!**/*.d.{ts,js}', '!**/*.test.{ts,js}', '!**/node_modules/**', '!**/vendor/**'],
    coverageThreshold: {
        global: {
            statements: 94,
            branches: 88,
            functions: 97,
            lines: 95,
        },
    },
    testResultsProcessor: '../../../util/testResultsProcessor.js',
};
