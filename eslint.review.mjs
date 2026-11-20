import tseslint from 'typescript-eslint';
import obsidianmd from 'eslint-plugin-obsidianmd';

// 本轮报告中的源码规则；Reproduce the requested typed source-review checks without suppressions.
export default tseslint.config(
    { ignores: ['node_modules/**', '.runtime-tools/**', 'tests/**', 'scripts/**', '.github/**', 'main.js', 'eslint.config.mjs', 'eslint.review.mjs'] },
    {
        files: ['src/**/*.ts'],
        languageOptions: { parser: tseslint.parser, parserOptions: { projectService: true } },
        plugins: { '@typescript-eslint': tseslint.plugin, obsidianmd },
        rules: {
            '@typescript-eslint/no-unsafe-assignment': 'error',
            '@typescript-eslint/no-unsafe-argument': 'error',
            '@typescript-eslint/no-unsafe-member-access': 'error',
            '@typescript-eslint/no-unsafe-call': 'error',
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/no-misused-promises': 'error',
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true }],
            'obsidianmd/prefer-create-el': 'error',
            'obsidianmd/no-forbidden-elements': 'error',
            'obsidianmd/no-unsupported-api': 'error',
            'obsidianmd/prefer-get-language': 'error',
            'no-console': ['error', { allow: ['warn', 'error', 'debug'] }],
        },
    },
);
