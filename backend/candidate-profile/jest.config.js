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
            statements: 91,
            branches: 83,
            functions: 94,
            lines: 91,
        },
    },
    testResultsProcessor: '../../util/testResultsProcessor.js',
};
