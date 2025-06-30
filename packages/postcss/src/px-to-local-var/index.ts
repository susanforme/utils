import type { AtRule, Declaration, Plugin, Root } from 'postcss';
import { createSelectorBlackList } from './lib/black-list';
import { DISABLE_COMMENT_REG } from './lib/constant';
import { createPropListMatcher } from './lib/filter-prop-list';
import pixelUnitRegex from './lib/pixel-unit-regex';

export interface PxToLocalVarOptions {
  /**
   *  scope rem的根元素字体大小，计算 scope rem 值的基准 (vw = px / rootValue)。
   * @default 16
   */
  rootValue?: number;
  /**
   * 转换后 scope rem 值的小数点位数。
   * @default 5
   */
  unitPrecision?: number;
  /**
   * 选择器黑名单，数组内的选择器不会被转换。支持字符串和正则。
   * @default []
   */
  selectorBlackList?: (string | RegExp)[];
  /**
   * 要转换的 CSS 属性列表，['*'] 表示所有属性。支持通配符和排除（如 '!margin'）。
   * @default ['*']
   */
  propList?: string[];
  /**
   * 是否直接替换 px 值，true 为直接替换，false 为在 px 声明后添加 rem 声明作为回退。
   * 也可以在开发模式传入 'replace'，为false,便于调试
   * @default true
   */
  replace?: boolean;
  /**
   * 是否转换媒体查询中的 px。
   * @default false
   */
  mediaQuery?: boolean;
  /**
   * 小于或等于这个值的 px 不会被转换。
   * @default 0
   */
  minPixelValue?: number;
  /**
   * 排除某些文件或文件夹，支持正则或函数。
   * @default null
   */
  exclude?: RegExp | ((file: string) => boolean) | null;
  /**
   *  自定义生成的 rem 变量名，默认为 --local-scope-rem
   */
  varName?: string;
}

const defaults: Required<PxToLocalVarOptions> = {
  rootValue: 16,
  unitPrecision: 5,
  selectorBlackList: [],
  propList: ['*'],
  replace: true,
  mediaQuery: false,
  minPixelValue: 0,
  exclude: null,
  varName: '--local-scope-rem',
};

function shouldExclude(exclude: PxToLocalVarOptions['exclude'], file?: string) {
  if (!exclude || !file) return false;
  if (typeof exclude === 'function') return exclude(file);
  if (exclude instanceof RegExp) return exclude.test(file);
  return false;
}

function toFixed(number: number, precision: number) {
  return parseFloat(number.toFixed(precision)).toString();
}

function createPxReplace(opts: Required<PxToLocalVarOptions>) {
  return function (m: string, $1: string) {
    if (!$1) return m;
    const pixels = parseFloat($1);
    if (Math.abs(pixels) <= opts.minPixelValue) return m;
    const remValue = toFixed(pixels / opts.rootValue, opts.unitPrecision);
    return `calc(var(${opts.varName}, 1rem) * ${remValue})`;
  };
}

function hasDisableNextLineComment(decl: Declaration): boolean {
  let node = decl;
  while (node) {
    const parent = node.parent;
    if (!parent || !Array.isArray(parent.nodes)) break;
    const idx = parent.nodes.indexOf(node);
    if (idx > 0) {
      // 查找前一个兄弟节点
      const prev = parent.nodes[idx - 1];
      if (prev.type === 'comment' && DISABLE_COMMENT_REG.test(prev.text)) {
        return true;
      }
    }
    //@ts-ignore
    node = parent;
  }
  // 兼容 raws.before
  if (decl.raws && typeof decl.raws.before === 'string') {
    return DISABLE_COMMENT_REG.test(decl.raws.before);
  }
  return false;
}

export const postcssPxToLocalVar = (options: PxToLocalVarOptions = {}): Plugin => {
  const opts = { ...defaults, ...options };
  const propListMatch = createPropListMatcher(opts.propList);
  const isBlackSelector = createSelectorBlackList(opts.selectorBlackList);

  return {
    postcssPlugin: 'postcss-px-to-local-var',
    Once(root: Root) {
      const file = root.source?.input.file;
      if (shouldExclude(opts.exclude, file)) return;

      root.walkDecls((decl: Declaration) => {
        if (hasDisableNextLineComment(decl)) return;
        if (!propListMatch(decl.prop)) return;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        if (isBlackSelector((decl.parent as any)?.selector || '')) return;
        if (decl.value.indexOf('px') === -1) return;

        const newValue = decl.value.replace(pixelUnitRegex, createPxReplace(opts));
        if (newValue === decl.value) return;

        if (opts.replace) {
          decl.value = newValue;
        } else {
          decl.cloneAfter({ value: newValue });
        }
      });

      if (opts.mediaQuery) {
        root.walkAtRules('media', (rule: AtRule) => {
          if (rule.params.indexOf('px') === -1) return;
          rule.params = rule.params.replace(pixelUnitRegex, createPxReplace(opts));
        });
      }
    },
  };
};
postcssPxToLocalVar.postcss = true;
