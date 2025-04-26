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
 * Options for the flexible layout function.
 */
export interface FlexibleOptions {
  /**
   * The scope element to set the CSS variable on.
   * Defaults to document.documentElement.
   */
  scopeElement?: HTMLElement;
  /**
   * The CSS variable name to use for the base rem value.
   * Defaults to "--local-scope-rem".
   */
  cssVarName?: string;
  /**
   * An array of breakpoints in pixels, from largest to smallest.
   * Defaults to [768].
   */
  breakpoints?: number[];
  /**
   * An array of container widths that corresponds to breakpoints.
   * Must have exactly one more item than breakpoints array.
   * For example, if breakpoints is [768], containers could be [375, 1920],
   * where 375 is the width for viewport <= 768px and 1920 is for viewport > 768px.
   */
  containers?: number[];
  /**
   * The base container width used as reference for calculations.
   * Only effective when containers is provided.
   * Used as the baseline container width for ratio calculations.
   * Defaults to the last item in containers array (containers?.at(-1)),
   * which typically represents the largest viewport width.
   */
  basicContainer?: number;
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

/**
 * Initializes a flexible layout system that sets a CSS variable for rem units
 * based on the viewport width and adaptively scales according to breakpoints.
 *
 * @param options - Configuration options for the flexible layout
 * @returns A cleanup function to remove event listeners
 */
export const flexible = (options: FlexibleOptions = {}): (() => void) => {
  const {
    scopeElement = document.documentElement,
    cssVarName = '--local-scope-rem',
    breakpoints = [768],
    // For example, [375, 1920] must have one more item than breakpoints array.
    // If breakpoint is 768, then widths <= 768px use 375 as the container width,
    // and widths > 768px use 1920 as the container width.
    containers,
    basicContainer = containers?.at(-1),
  } = options;

  /**
   * Calculate the ratio factor for a specific breakpoint
   * @param index - Breakpoint index
   * @returns The ratio factor, defaults to 1
   */
  const getBreakpointRatio = (index: number): number => {
    if (!containers || !basicContainer) return 1;
    if (containers.length - 1 === breakpoints.length) {
      return basicContainer / containers[index];
    }
    return 1; // Default to ratio factor of 1
  };

  /**
   * Respond to window size changes and update CSS variable
   */
  const responsive = (): void => {
    const html = document.documentElement;
    const width = html.clientWidth;
    // 100rem = 100vw = design width
    let vw = width / 100;

    for (let i = 0; i < breakpoints.length; i++) {
      if (width <= breakpoints[i]) {
        // Should use containers[i] as the base
        vw = width * getBreakpointRatio(i);
        break;
      }
    }

    // Set the CSS variable --local-scope-rem for the container
    scopeElement.style.setProperty(cssVarName, vw + 'px');
  };

  // Register event listeners
  window.addEventListener('load', responsive);
  window.addEventListener('resize', responsive);
  window.addEventListener('orientationchange', responsive);

  // Return cleanup function
  return () => {
    window.removeEventListener('load', responsive);
    window.removeEventListener('resize', responsive);
    window.removeEventListener('orientationchange', responsive);
  };
};
