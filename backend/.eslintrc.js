module.exports = {
    root: true,
    // Specifies the ESLint parser
    parser: '@typescript-eslint/parser',
    extends: [
        // Uses the recommended rules from @typescript-eslint/eslint-plugin
        'plugin:@typescript-eslint/recommended',
        // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
        'prettier/@typescript-eslint',
        // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors.
        // Make sure this is always the last configuration in the extends array.
        'plugin:prettier/recommended',
    ],
    parserOptions: {
        ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
        sourceType: 'module', // Allows for the use of imports
    },
    rules: {
        // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
        // e.g. "@typescript-eslint/explicit-function-return-type": "off",
        '@typescript-eslint/naming-convention': [
            2,
            {
                selector: 'default',
                format: ['camelCase'],
                leadingUnderscore: 'allowSingleOrDouble',
                trailingUnderscore: 'allow',
            },
            {
                selector: 'variable',
                format: ['camelCase', 'UPPER_CASE', 'PascalCase'], // The pascal case is because of our io-ts types
                leadingUnderscore: 'allowSingleOrDouble',
                trailingUnderscore: 'allow',
            },
            {
                selector: 'typeLike',
                format: ['PascalCase'],
            },
            {
                selector: ['enumMember'],
                format: ['PascalCase', 'UPPER_CASE'],
            },
            {
                selector: ['objectLiteralProperty'], // old camelcase rule allowed this
                format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
                leadingUnderscore: 'allowSingleOrDouble',
            },
        ],
    },
};
