/**
 * 弹性布局函数的配置选项。
 */
export interface FlexibleOptions {
  /**
   * 一个以像素为单位的断点数组，从大到小排列。
   * 默认为 [768]。
   */
  breakpoints?: number[];
  /**
   * 一个与断点相对应的布局宽度数组。
   * 其项目数量必须比断点数组多一个。
   * 例如，如果 breakpoints 是 [768]，则 layouts 可以是 [375, 1920]，
   * 其中 375 是视口宽度 <= 768px 时的布局宽度，1920 是视口宽度 > 768px 时的布局宽度。
   */
  layouts?: number[];
  /**
   * 用作计算参考的基础布局宽度。
   * 仅在提供了 layouts 时有效。
   * 用作比例计算的基准布局宽度。
   * 默认为 layouts 数组中的最后一项 (layouts?.at(-1))，
   * 这通常代表最大的视口宽度。
   */
  basicLayout?: number;
  /**
   * 是否在初始化时立即应用布局。
   * 默认为 false。
   */
  immediate?: boolean;
  /**
   * 是否监听屏幕方向变化事件。
   * 默认为 true。
   */
  orientationchange?: boolean;

  /**
   * 是否在特定的作用域元素上设置 CSS 变量。
   * 默认为 false，表示在 document 元素上设置字体大小。
   * 如果提供一个对象，可以指定元素和 CSS 变量名。
   */
  scope?:
    | false
    | {
        /**
         * 设置 CSS 变量的作用域元素。
         * 默认为 document.documentElement。
         */
        element: HTMLElement;
        /**
         * 用于 rem 基础值的 CSS 变量名。
         * 默认为 "--local-scope-rem"。
         */
        cssVarName?: string;
      }
    | {
        /**
         * 设置 CSS 变量的作用域元素。
         * 默认为 document.documentElement。
         */
        element: HTMLElement;
        /**
         * 每个布局的比例因子数组，用于海报模式或自定义缩放。
         * 长度必须与 layouts 数组相同。
         * 默认为 [1, 1, ...] (无额外缩放)。
         */
        ratio?: number[];
        /**
         * 用于 rem 基础值的 CSS 变量名。
         * 默认为 "--local-scope-rem"。
         */
        cssVarName?: string;
      }[];

  /**
   * 每个布局的比例因子数组，用于海报模式或自定义缩放。
   * 长度必须与 layouts 数组相同。
   * 默认为 [1, 1, ...] (无额外缩放)。
   */
  ratio?: number[];
  /**
   * 是否在窗口大小调整时重新校准布局。
   * 因为宽度变化,但是css var没来得及变化导致出现滚动条,clientWidth和innerWidth不一致
   * 默认为 true。
   */
  recalibrate?: boolean;
  /**
   * 用于控制 resize 行为的选项。
   */
  resizeOption?:
    | {
        type: 'debounce' | 'throttle';
        delay?: number;
      }
    | false;
  onInitialized?: () => void;
}

/**
 * 初始化一个弹性布局系统，该系统会根据视口宽度设置一个用于 rem 单位的 CSS 变量，
 * 并根据断点自适应缩放。
 *
 * @param options - 弹性布局的配置选项
 * @returns 一个用于移除事件监听器的清理函数
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
    onInitialized,
  } = options;
  const breakpoints = propBreakpoints;
  const layouts = propLayouts;
  const basicLayout = propBasicLayout ?? layouts?.at(-1);
  const defaultScopeCssVarName = '--local-scope-rem';
  // 对于相同设备来说,滚动条要么永远占据宽度,要么永远不占据宽度
  const isScrollbarPresent = getScrollbarWidth() > 0;

  // 确保 ratio 数组的长度与 layouts 匹配，默认为 1
  let ratio = propRatio;
  if (ratio) {
    if (layouts?.length !== ratio.length && layouts) {
      ratio = [...ratio, ...Array.from({ length: layouts.length - ratio.length }, () => 1)];
    }
  }

  /**
   * 计算特定断点的比例因子
   * @param index - 断点索引
   * @returns 比例因子，默认为 1
   */
  const getBreakpointRatio = (index: number): number => {
    if (!layouts || !basicLayout) return 1;
    if (layouts.length - 1 === breakpoints.length) {
      return basicLayout / layouts[index];
    }
    return 1; // 默认为 1 的比例因子
  };

  /**
   * 响应窗口大小变化并更新 CSS 变量
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
    requestAnimationFrame(() => {
      onInitialized?.();
    });
  } else {
    window.addEventListener('load', () => {
      responsive();
      requestAnimationFrame(() => {
        onInitialized?.();
      });
    });
  }
  window.addEventListener('resize', resizeHandler);
  if (orientationchange) {
    screen.orientation.addEventListener('change', resizeHandler);
  }
  // 返回清理函数
  return () => {
    window.removeEventListener('resize', resizeHandler);
    if (orientationchange) {
      screen.orientation.removeEventListener('change', resizeHandler);
    }
  };
};

/**
 * 防抖函数：在事件被触发n秒后再执行回调，如果在这n秒内又被触发，则重新计时。
 * @param func 要执行的函数
 * @param wait 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
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

/**
 * 计算浏览器滚动条的宽度。
 * @returns {number} 滚动条的宽度（像素）
 */
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
