import { defineConfig, globalIgnores } from 'eslint/config';
import pluginJs from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default defineConfig([
  pluginJs.configs.recommended,
  globalIgnores(['dist/*', 'docs/.next/*', 'docs/public/*']),
  {
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'warn',
      complexity: ['warn', { max: 7 }]
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'no-redeclare': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-unused-vars': 'warn'
    }
  },
  {
    files: ['tests/**/*.ts', 'tests-d/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off'
    }
  },
  {
    files: ['tests-d/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off'
    }
  }
]);
