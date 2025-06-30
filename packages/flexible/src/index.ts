/**
 * Options for the flexible layout function.
 */
export interface FlexibleOptions {
  /**
   * An array of breakpoints in pixels, from largest to smallest.
   * Defaults to [768].
   */
  breakpoints?: number[];
  /**
   * An array of layout widths that corresponds to breakpoints.
   * Must have exactly one more item than breakpoints array.
   * For example, if breakpoints is [768], layouts could be [375, 1920],
   * where 375 is the width for viewport <= 768px and 1920 is for viewport > 768px.
   */
  layouts?: number[];
  /**
   * The base layout width used as reference for calculations.
   * Only effective when layouts is provided.
   * Used as the baseline layout width for ratio calculations.
   * Defaults to the last item in layouts array (layouts?.at(-1)),
   * which typically represents the largest viewport width.
   */
  basicLayout?: number;
  /**
   * Whether to apply the layout immediately on initialization.
   * Defaults to false.
   */
  immediate?: boolean;
  /**
   * Whether to listen for orientation change events.
   * Defaults to true.
   */
  orientationchange?: boolean;

  /**
   * Whether to set the CSS variable on a specific scope element.
   * Defaults to false, which means setting the font size on the document element.
   * If an object is provided, it can specify the element and CSS variable name.
   */
  scope?:
    | false
    | {
        /**
         * The scope element to set the CSS variable on.
         * Defaults to document.documentElement.
         */
        element: HTMLElement;
        /**
         * The CSS variable name to use for the base rem value.
         * Defaults to "--local-scope-rem".
         */
        cssVarName?: string;
      }
    | {
        /**
         * The scope element to set the CSS variable on.
         * Defaults to document.documentElement.
         */
        element: HTMLElement;
        /**
         * An array of ratio factors for each layout, used for poster mode or custom scaling.
         * Must have the same length as layouts.
         * Defaults to [1, 1, ...] (no extra scaling).
         */
        ratio?: number[];
        /**
         * The CSS variable name to use for the base rem value.
         * Defaults to "--local-scope-rem".
         */
        cssVarName?: string;
      }[];

  /**
   * An array of ratio factors for each layout, used for poster mode or custom scaling.
   * Must have the same length as layouts.
   * Defaults to [1, 1, ...] (no extra scaling).
   */
  ratio?: number[];
}
function getScrollbarWidth(): number {
  const scrollDiv = document.createElement('div');
  scrollDiv.style.width = '100px';
  scrollDiv.style.height = '100px';
  scrollDiv.style.overflow = 'scroll';
  scrollDiv.style.position = 'absolute';
  scrollDiv.style.top = '-9999px';
  scrollDiv.style.opacity = '0';
  document.body.appendChild(scrollDiv);
  const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
  document.body.removeChild(scrollDiv);
  return scrollbarWidth;
}

/**
 * Initializes a flexible layout system that sets a CSS variable for rem units
 * based on the viewport width and adaptively scales according to breakpoints.
 *
 * @param options - Configuration options for the flexible layout
 * @returns A cleanup function to remove event listeners
 */
export const flexible = (options: FlexibleOptions = {}): (() => void) => {
  const {
    breakpoints: propBreakpoints = [768],
    layouts: propLayouts,
    basicLayout: propBasicLayout,
    scope,
    immediate = false,
    orientationchange = true,
    ratio: propRatio,
  } = options;
  const breakpoints = propBreakpoints;
  const layouts = propLayouts;
  const basicLayout = propBasicLayout ?? layouts?.at(-1);
  const scrollbarWidth = getScrollbarWidth();
  const defaultScopeCssVarName = '--local-scope-rem';

  // Ensure ratio array matches layouts length, default to 1
  let ratio = propRatio;
  if (ratio) {
    if (layouts?.length !== ratio.length && layouts) {
      ratio = [...ratio, ...new Array<number>(layouts.length - ratio.length).fill(1)];
    }
  }

  /**
   * Calculate the ratio factor for a specific breakpoint
   * @param index - Breakpoint index
   * @returns The ratio factor, defaults to 1
   */
  const getBreakpointRatio = (index: number): number => {
    if (!layouts || !basicLayout) return 1;
    if (layouts.length - 1 === breakpoints.length) {
      return basicLayout / layouts[index];
    }
    return 1; // Default to ratio factor of 1
  };

  /**
   * Respond to window size changes and update CSS variable
   */
  const responsive = (): void => {
    const width = window.innerWidth;
    /**
     * Calculate the effective width by subtracting the scrollbar width from the window width
     */
    const effectiveWidth = window.innerWidth - scrollbarWidth;
    // 100rem = 100vw = design width
    let vw = effectiveWidth / 100;
    let matched = false;
    let matchedIndex = 0;
    if (layouts) {
      for (let i = 0; i < breakpoints.length; i++) {
        if (width <= breakpoints[i]) {
          vw = vw * getBreakpointRatio(i) * (ratio?.[i] ?? 1);
          matched = true;
          matchedIndex = i;
          break;
        }
      }
      if (!matched) {
        // If no breakpoint is matched, use the last layout
        vw = vw * getBreakpointRatio(layouts.length - 1) * (ratio?.[layouts.length - 1] ?? 1);
        matchedIndex = layouts.length - 1;
      }
    }
    if (scope) {
      if (Array.isArray(scope)) {
        // Set the CSS variable --local-scope-rem for every element
        scope.forEach((item) => {
          const { element = document.documentElement, cssVarName = defaultScopeCssVarName, ratio: scopeRatio } = item;
          const computedRatio = scopeRatio?.[matchedIndex] ?? ratio?.[matchedIndex] ?? 1;
          element.style.setProperty(cssVarName, vw * computedRatio + 'px');
        });
      } else {
        const { element = document.documentElement, cssVarName = defaultScopeCssVarName } = scope;
        // Set the CSS variable --local-scope-rem for the element
        element.style.setProperty(cssVarName, vw + 'px');
      }
    } else {
      document.documentElement.style.fontSize = vw + 'px';
    }
  };

  if (immediate) {
    responsive();
  } else {
    window.addEventListener('load', responsive);
  }
  window.addEventListener('resize', responsive);
  if (orientationchange) {
    screen.orientation.addEventListener('change', responsive);
  }
  // Return cleanup function
  return () => {
    if (!immediate) {
      window.removeEventListener('load', responsive);
    }
    window.removeEventListener('resize', responsive);
    if (orientationchange) {
      screen.orientation.removeEventListener('change', responsive);
    }
  };
};
