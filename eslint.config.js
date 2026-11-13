// ESLint 9 flat config (optimization item 10 — engineering baseline).
//
// Scope is deliberately incremental: `npm run lint` lints `src/` only.
// The rule set is the recommended base plus a hard ban on direct
// `console.*` in src/ (use src/utils/logger.js). Noisy legacy rules are
// warnings, not errors, so the baseline passes while new code is held to
// the error-level rules. Do NOT reformat the whole repo to satisfy style
// rules — fix incrementally, file by file.
import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';

export default [
  {
    ignores: ['dist/**', 'dist_extension/**', 'extension/**', 'node_modules/**', 'Wechatsync/**'],
  },
  js.configs.recommended,
  ...pluginVue.configs['flat/base'],
  {
    files: ['src/**/*.{js,vue}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2022,
      },
    },
    rules: {
      // All logging in src/ goes through the unified logger.
      'no-console': 'error',
      'no-debugger': 'error',
      // Empty catch blocks are the codebase's intentional swallow-and-
      // continue pattern (config loading, best-effort sync); allow them.
      'no-empty': ['error', { allowEmptyCatch: true }],
      // Material templates legitimately contain non-breaking spaces and
      // other special whitespace inside string/template content.
      'no-irregular-whitespace': [
        'error',
        { skipStrings: true, skipTemplates: true, skipComments: true, skipRegExps: true },
      ],
      // Legacy code has many unused locals; warn so the baseline passes
      // and new code can be cleaned up incrementally.
      'no-unused-vars': [
        'warn',
        { args: 'after-used', argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    // The logger itself is the one place allowed to call console.
    files: ['src/utils/logger.js'],
    rules: {
      'no-console': 'off',
    },
  },
];
