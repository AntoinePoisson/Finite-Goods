import js from '@eslint/js';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import eslintConfigPrettier from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import { resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');

export default [
  {
    // wasm_exec.js is generated, dont lint it
    ignores: ['dist/**', 'coverage/**', 'node_modules/**', 'public/wasm/wasm_exec.js', 'reports/**']
  },
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: { project: true, tsconfigRootDir: projectRoot },
      globals: { ...globals.browser, ...globals.node }
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      'jsx-a11y': jsxA11y,
      'react-hooks': reactHooks
    },
    rules: {
      ...typescriptPlugin.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      ...reactHooks.configs.flat.recommended.rules,
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
    }
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } }
  },
  {
    files: ['public/**/*.js'],
    languageOptions: {
      // Go comes from wasm_exec.js
      globals: { ...globals.browser, ...globals.worker, Go: 'readonly' }
    }
  },
  {
    files: ['**/*.cjs'],
    languageOptions: { globals: globals.node }
  },
  {
    files: ['tests/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.vitest }
  },
  eslintConfigPrettier
];
