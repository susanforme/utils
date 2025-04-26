import path from 'path';
import tseslint from 'typescript-eslint';
import { config as baseConfig } from './base.js';
/**
 * A custom ESLint configuration for libraries that use Next.js.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = tseslint.config(
  ...baseConfig,
  ...tseslint.configs.recommendedTypeCheckedOnly,
  {
    languageOptions: {
      parserOptions: {
        projectService: {},
        tsconfigRootDir: path.resolve(import.meta.dirname, '../../'),
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
    },
  },
);
