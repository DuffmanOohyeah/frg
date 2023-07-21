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
            statements: 99,
            branches: 90,
            functions: 100,
            lines: 100,
        },
    },
    testResultsProcessor: '../../util/testResultsProcessor.js',
};
