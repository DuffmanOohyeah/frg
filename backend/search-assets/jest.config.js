module.exports = {
    "roots": [
        "<rootDir>/tests"
    ],
    testMatch: [ '**/*.test.ts'],
    "transform": {
        "^.+\\.tsx?$": "ts-jest"
    },
    collectCoverage: true,
    collectCoverageFrom: [
        "**/*.{ts,js}",
        "!**/*.d.{ts,js}",
        "!**/*.test.{ts,js}",
        "!**/node_modules/**",
        "!**/vendor/**"
    ],
    coverageThreshold: {
        global: {
            statements: 47,
            branches: 20,
            functions: 35,
            lines: 46,
        }
    },
    testResultsProcessor: '../../util/testResultsProcessor.js',
}
