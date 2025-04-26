import oxlint from 'eslint-plugin-oxlint';
import { defineConfig } from 'eslint/config';
import { config as tsConfig } from '../../shared/eslint-config/ts.js';

/** @type {import("eslint").Linter.Config} */
export default defineConfig([
  {
    extends: [tsConfig],
  },
  ...oxlint.configs['flat/recommended'], // oxlint should be the last one
]);
