import postcss from 'postcss';
import { describe, expect, it } from 'vitest';
import { postcssPxToRem } from '.';

describe('postcssPxToRem 插件', () => {
  it('默认应将 px 转为 calc(var(--local-scope-rem, 1rem) * n)', async () => {
    const input = `.a { margin: 16px; padding: 8px 4px; }`;
    const output = await postcss([postcssPxToRem()]).process(input, { from: undefined });
    expect(output.css).toBe(
      `.a { margin: calc(var(--local-scope-rem, 1rem) * 1); padding: calc(var(--local-scope-rem, 1rem) * 0.5) calc(var(--local-scope-rem, 1rem) * 0.25); }`,
    );
  });

  it('支持自定义 varName', async () => {
    const input = `.a { font-size: 32px; }`;
    const output = await postcss([postcssPxToRem({ varName: '--custom-rem' })]).process(input, { from: undefined });
    expect(output.css).toBe(`.a { font-size: calc(var(--custom-rem, 1rem) * 2); }`);
  });

  it('replace: false 时应保留原始 px', async () => {
    const input = `.a { margin: 20px; }`;
    const output = await postcss([postcssPxToRem({ replace: false })]).process(input, { from: undefined });
    expect(output.css).toBe(`.a { margin: 20px; margin: calc(var(--local-scope-rem, 1rem) * 1.25); }`);
  });

  it('小于等于 minPixelValue 的 px 不应被转换', async () => {
    const input = `.a { border-width: 1px; }`;
    const output = await postcss([postcssPxToRem({ minPixelValue: 2 })]).process(input, { from: undefined });
    expect(output.css).toBe(input);
  });

  it('只转换 propList 指定的属性', async () => {
    const input = `.a { font-size: 24px; margin: 24px; }`;
    const output = await postcss([postcssPxToRem({ propList: ['font-size'] })]).process(input, { from: undefined });
    expect(output.css).toBe(`.a { font-size: calc(var(--local-scope-rem, 1rem) * 1.5); margin: 24px; }`);
  });

  it('selectorBlackList 指定的选择器不应被转换', async () => {
    const input = `.ignore { margin: 40px; } .a { margin: 40px; }`;
    const output = await postcss([postcssPxToRem({ selectorBlackList: ['.ignore'] })]).process(input, {
      from: undefined,
    });
    expect(output.css).toBe(`.ignore { margin: 40px; } .a { margin: calc(var(--local-scope-rem, 1rem) * 2.5); }`);
  });

  it('exclude 配置命中的文件不应被转换', async () => {
    const input = `.a { margin: 16px; }`;
    const output = await postcss([postcssPxToRem({ exclude: /test\.css$/ })]).process(input, { from: 'test.css' });
    expect(output.css).toBe(input);
  });

  it('mediaQuery: true 时应转换媒体查询中的 px', async () => {
    const input = `@media (min-width: 320px) { .a { margin: 16px; } }`;
    const output = await postcss([postcssPxToRem({ mediaQuery: true })]).process(input, { from: undefined });
    expect(output.css).toBe(
      `@media (min-width: calc(var(--local-scope-rem, 1rem) * 20)) { .a { margin: calc(var(--local-scope-rem, 1rem) * 1); } }`,
    );
  });

  it('遇到 /* pxtorem-disable-next-line */ 注释应跳过转换', async () => {
    const input = `/* pxtorem-disable-next-line */\n.a { margin: 16px; }\n.b { margin: 16px; }`;
    const output = await postcss([postcssPxToRem()]).process(input, { from: undefined });
    expect(output.css).toBe(
      `/* pxtorem-disable-next-line */\n.a { margin: 16px; }\n.b { margin: calc(var(--local-scope-rem, 1rem) * 1); }`,
    );
  });

  it('应正确处理负数和小数 px', async () => {
    const input = `.a { margin: -8px; padding: 2.5px; }`;
    const output = await postcss([postcssPxToRem()]).process(input, { from: undefined });
    expect(output.css).toBe(
      `.a { margin: calc(var(--local-scope-rem, 1rem) * -0.5); padding: calc(var(--local-scope-rem, 1rem) * 0.15625); }`,
    );
  });

  it('非 px 单位不应被转换', async () => {
    const input = `.a { margin: 1em; padding: 10%; }`;
    const output = await postcss([postcssPxToRem()]).process(input, { from: undefined });
    expect(output.css).toBe(input);
  });
});
