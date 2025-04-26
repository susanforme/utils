import postcss from 'postcss';
import { describe, expect, it } from 'vitest';
import { postcssRemToCssVars } from '.';

describe('postcssRemToCssVars', () => {
  // Test default configuration
  it('should convert rem units to CSS variables with default configuration', async () => {
    const input = `.element {
      margin: 1rem;
      padding: 0.5rem 1.5rem;
      font-size: 0.875rem;
      border: 0.0625rem solid #ccc;
      width: calc(100% - 2rem);
    }`;

    const output = await postcss([postcssRemToCssVars()]).process(input, { from: undefined });

    expect(output.css).toEqual(`.element {
      margin: calc(var(--local-scope-rem, 1rem) * 1);
      padding: calc(var(--local-scope-rem, 1rem) * 0.5) calc(var(--local-scope-rem, 1rem) * 1.5);
      font-size: calc(var(--local-scope-rem, 1rem) * 0.875);
      border: calc(var(--local-scope-rem, 1rem) * 0.0625) solid #ccc;
      width: calc(100% - calc(var(--local-scope-rem, 1rem) * 2));
    }`);
  });

  // Test custom variable name
  it('should use custom CSS variable name', async () => {
    const input = `.element {
      margin: 1rem;
      font-size: 0.875rem;
    }`;

    const output = await postcss([
      postcssRemToCssVars({
        varName: '--custom-rem-unit',
      }),
    ]).process(input, { from: undefined });

    expect(output.css).toEqual(`.element {
      margin: calc(var(--custom-rem-unit, 1rem) * 1);
      font-size: calc(var(--custom-rem-unit, 1rem) * 0.875);
    }`);
  });

  // Test negative rem values
  it('should handle negative rem values', async () => {
    const input = `.element {
      margin-top: -1rem;
      text-indent: -0.5rem;
    }`;

    const output = await postcss([postcssRemToCssVars()]).process(input, { from: undefined });

    expect(output.css).toEqual(`.element {
      margin-top: calc(var(--local-scope-rem, 1rem) * -1);
      text-indent: calc(var(--local-scope-rem, 1rem) * -0.5);
    }`);
  });

  // Test non-rem values
  it('should not process non-rem values', async () => {
    const input = `.element {
      margin: 1px;
      padding: 0.5em 1.5%;
      width: calc(100% - 20px);
    }`;

    const output = await postcss([postcssRemToCssVars()]).process(input, { from: undefined });

    expect(output.css).toEqual(input);
  });

  // Test reprocessing
  it('should not reprocess already converted declarations', async () => {
    const input = `.element {
      margin: 1rem;
    }`;

    // Create processor
    const processor = postcss([postcssRemToCssVars()]);

    // First processing
    const firstOutput = await processor.process(input, { from: undefined });

    // Second processing of the same result
    const secondOutput = await processor.process(firstOutput.css, { from: undefined });

    // Both processing results should be identical
    expect(secondOutput.css).toEqual(firstOutput.css);
  });

  // Test complex calc expressions
  it('should handle complex calc expressions containing rem', async () => {
    const input = `.element {
      margin: calc(1rem + 10px);
      padding: calc(0.5rem * 2 + 5px);
    }`;

    const output = await postcss([postcssRemToCssVars()]).process(input, { from: undefined });

    expect(output.css).toEqual(`.element {
      margin: calc(calc(var(--local-scope-rem, 1rem) * 1) + 10px);
      padding: calc(calc(var(--local-scope-rem, 1rem) * 0.5) * 2 + 5px);
    }`);
  });
});
