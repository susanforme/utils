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
  /**
   * Whether to recalibrate the layout when the window is resized.
   * 因为宽度变化,但是css var没来得及变化导致出现滚动条,clientWidth和innerWidth不一致
   * Defaults to true.
   */
  recalibrate?: boolean;
  /**
   * An option to control the resize behavior.
   */
  resizeOption?:
    | {
        type: 'debounce' | 'throttle';
        delay?: number;
      }
    | false;
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
    recalibrate = true,
    resizeOption,
  } = options;
  const breakpoints = propBreakpoints;
  const layouts = propLayouts;
  const basicLayout = propBasicLayout ?? layouts?.at(-1);
  const defaultScopeCssVarName = '--local-scope-rem';
  // 对于相同设备来说,滚动条要么永远占据宽度,要么永远不占据宽度
  const isScrollbarPresent = getScrollbarWidth() > 0;

  // Ensure ratio array matches layouts length, default to 1
  let ratio = propRatio;
  if (ratio) {
    if (layouts?.length !== ratio.length && layouts) {
      ratio = [...ratio, ...Array.from({ length: layouts.length - ratio.length }, () => 1)];
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
    // 内部核心计算逻辑，可以被重复调用
    const recalculate = () => {
      const width = window.innerWidth; // 用于断点匹配
      const effectiveWidth = document.documentElement.clientWidth; // 用于rem计算

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
          vw = vw * getBreakpointRatio(layouts.length - 1) * (ratio?.[layouts.length - 1] ?? 1);
          matchedIndex = layouts.length - 1;
        }
      }
      if (scope) {
        if (Array.isArray(scope)) {
          scope.forEach((item) => {
            const { element = document.documentElement, cssVarName = defaultScopeCssVarName, ratio: scopeRatio } = item;
            const computedRatio = scopeRatio?.[matchedIndex] ?? ratio?.[matchedIndex] ?? 1;
            element.style.setProperty(cssVarName, vw * computedRatio + 'px');
          });
        } else {
          const { element = document.documentElement, cssVarName = defaultScopeCssVarName } = scope;
          element.style.setProperty(cssVarName, vw + 'px');
        }
      } else {
        document.documentElement.style.fontSize = vw + 'px';
      }
    };

    // 第一次计算：使用当前的clientWidth值，这会触发浏览器的重绘
    recalculate();
    // 第二次计算：请求在浏览器下一次重绘前再次计算。
    // 此时，clientWidth已经是重排后的稳定值。
    if (recalibrate && isScrollbarPresent) {
      requestAnimationFrame(recalculate);
    }
  };

  let resizeHandler: () => void = responsive;
  if (resizeOption) {
    // 默认延迟150ms
    const { type, delay = 150 } = resizeOption;
    if (type === 'debounce') {
      resizeHandler = debounce(responsive, delay);
    } else if (type === 'throttle') {
      resizeHandler = throttle(responsive, delay);
    }
  }
  if (immediate) {
    responsive();
  } else {
    window.addEventListener('load', responsive);
  }
  window.addEventListener('resize', resizeHandler);
  if (orientationchange) {
    screen.orientation.addEventListener('change', resizeHandler);
  }
  // Return cleanup function
  return () => {
    if (!immediate) {
      window.removeEventListener('load', responsive);
    }
    window.removeEventListener('resize', resizeHandler);
    if (orientationchange) {
      screen.orientation.removeEventListener('change', resizeHandler);
    }
  };
};

function debounce<F extends (...args: any[]) => any>(func: F, wait: number): F {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<F>) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const context = this;
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      timeout = null;
      func.apply(context, args);
    }, wait);
  } as F;
}

/**
 * 节流函数：限制 func 在 delay 时间内只执行一次，确保最后一次也能被执行
 * @param func 要执行的函数
 * @param delay 节流间隔（毫秒）
 * @returns 节流后的函数
 */
function throttle<T extends (...args: any[]) => void>(func: T, delay: number): (...args: Parameters<T>) => void {
  let lastCallTime = 0;
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;

  return function (...args: Parameters<T>) {
    const now = Date.now();
    const remaining = delay - (now - lastCallTime);
    lastArgs = args;

    if (remaining <= 0) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      lastCallTime = now;
      //@ts-ignore
      func.apply(this, args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        timeout = null;
        lastCallTime = Date.now();
        if (lastArgs) {
          //@ts-ignore
          func.apply(this, lastArgs);
          lastArgs = null;
        }
      }, remaining);
    }
  };
}

function getScrollbarWidth(): number {
  const scrollDiv = document.createElement('div');
  scrollDiv.style.width = '100px';
  scrollDiv.style.height = '100px';
  scrollDiv.style.overflow = 'scroll';
  scrollDiv.style.position = 'absolute';
  scrollDiv.style.top = '-9999px';
  document.body.appendChild(scrollDiv);
  const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
  document.body.removeChild(scrollDiv);
  return scrollbarWidth;
}
