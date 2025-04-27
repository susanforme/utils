import type { Plugin } from 'postcss';

/**
 * Options for the PostCSS rem-to-css-vars plugin.
 */
export interface PostcssRemToCssVarsOptions {
  /**
   * The CSS variable name to use for the base rem value.
   * Defaults to "--local-scope-rem".
   */
  varName?: string;
}

/**
 * A PostCSS plugin that converts rem units to CSS variables via calc().
 *
 * @param opts - Plugin options.
 * @returns A PostCSS plugin instance.
 */
export const postcssRemToCssVars = (opts: PostcssRemToCssVarsOptions = {}): Plugin => {
  const { varName = '--local-scope-rem' } = opts;

  return {
    postcssPlugin: 'postcss-rem-to-local-var',
    Declaration(decl) {
      if ((decl as any)._remToVarProcessed) return;
      // If the value has already been converted to calc(var(--local-scope-rem, 1rem) * 1), it should not be converted again
      if (decl.value.includes(`calc(var(${varName}, 1rem) * `)) return;
      const regex = /(-?(?:\d+|\d*\.\d+))rem\b/g;
      decl.value = decl.value.replace(regex, (_, n) => `calc(var(${varName}, 1rem) * ${n})`);
      // Mark as processed
      (decl as any)._remToVarProcessed = true;
    },
  };
};

// Mark the plugin as a PostCSS plugin
postcssRemToCssVars.postcss = true;
