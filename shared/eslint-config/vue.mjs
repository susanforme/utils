import pluginVue from 'eslint-plugin-vue';
import { config as baseConfig } from './base.mjs';
/**
 * A custom ESLint configuration for libraries that use Next.js.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [
  ...baseConfig,
  ...pluginVue.configs['flat/recommended'],
  {
    rules: {
      'vue/multi-word-component-names': [
        'error',
        {
          ignores: ['index'],
        },
      ],
    },
  },
];
