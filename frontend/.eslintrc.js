module.exports = {
    root: true,
    // Specifies the ESLint parser
    parser: '@typescript-eslint/parser',
    env: {
        browser: true,
    },
    extends: [
        // Uses the recommended rules from @eslint-plugin-react
        // Uncomment for React projects
        'plugin:react/recommended',
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
        ecmaFeatures: {
            jsx: true,
        },
    },
    rules: {
        // ignore indent sadness in template literals because this happens mostly in
        // our styled components. Let prettier decide how those should indent
        indent: ['error', 4, { ignoredNodes: ['TemplateLiteral > *'] }],
        'react/jsx-indent': ['error', 4],
        'react/jsx-indent-props': ['error', 4],
        'max-len': ['warn', { code: 120 }],
        '@typescript-eslint/no-unused-vars': 'error',
        'prefer-arrow-callback': 'error',
        'react/prop-types': 'off', // we have typescript so don't need to use propTypes
        // This seems not to be a thing before we upgraded eslint and it requires too many fixes atm so just
        // turn it off for now :/
        '@typescript-eslint/explicit-module-boundary-types': 'off',
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
    settings: {
        // Uncomment for React projects
        react: {
            // Tells eslint-plugin-react to automatically detect the version of React to use
            version: 'detect',
        },
        // "react/jsx-uses-vars": 1,
    },
    plugins: ['react', '@typescript-eslint', 'prettier', 'eslint-plugin-react'],
};
