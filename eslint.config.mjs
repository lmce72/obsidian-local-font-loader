import { defineConfig, globalIgnores } from 'eslint/config';
import obsidianmd from 'eslint-plugin-obsidianmd';

export default defineConfig([
    globalIgnores(['node_modules/**', '.runtime-tools/**', 'tests/**', 'scripts/**', '.github/**', 'main.js']),
    ...obsidianmd.configs.recommended,
    { languageOptions: { parserOptions: { projectService: { allowDefaultProject: ['eslint.config.mjs', 'eslint.review.mjs'] } } } },
]);
