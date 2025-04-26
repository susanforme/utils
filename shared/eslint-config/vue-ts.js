import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import { config as vueConfig } from './vue.js';
/**
 * A custom ESLint configuration for libraries that use Next.js.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [...vueConfig, defineConfigWithVueTs(vueTsConfigs.recommended)];
