import eslint from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import angular from 'angular-eslint';
import importPlugin from 'eslint-plugin-import';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  globalIgnores([
    'node_modules/**',
    '.vscode/**',
    '.dist/**',
    '.husky/**',
    '**/*.yml',
    'coverage/**',
    'documentation/**',
    'dist/**',
    '.angular/**',
    'projects/**',
  ]),
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
    ],
    processor: angular.processInlineTemplates,
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jest,
      },
      parserOptions: {
        projectService: {
          // Arquivos de tooling na raiz que não pertencem a nenhum tsconfig
          // (app/spec). Sem isso o typed linting falha com "not found by the
          // project service".
          allowDefaultProject: ['jest.config.ts', 'jest.config.integration.ts'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: 'tsconfig.json',
        },
      },
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      'no-empty-function': 'off',
      '@typescript-eslint/no-empty-function': [
        'error',
        { allow: ['constructors'] },
      ],
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        { allowExpressions: true },
      ],
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^@angular'],
            ['^date-fns$', '^date-fns/.*$'],
            ['^@?\\w'],
            [
              '^@environments',
              '^@core',
              '^@shared',
              '^@assets',
              '^@app',
              '^@src',
              '^src',
              '^app',
              '^\\.\\.',
              '^\\.',
              '^.+\\.d\\.ts$',
            ],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
      'import/order': 'off',
      'import/no-unresolved': 'off',
    },
  },
  {
    files: ['**/*.html'],
    ignores: ['**/*inline-template-*.component.html'],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {},
  },
  prettierRecommended,
  {
    files: ['**/*.html'],
    rules: {
      'prettier/prettier': ['error', { parser: 'angular' }],
    },
  },
);
