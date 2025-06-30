# @cherrywind/postcss

A collection of PostCSS plugins for modern CSS development.

## Installation

```bash
# npm
npm install @cherrywind/postcss --save-dev

# yarn
yarn add @cherrywind/postcss --dev

# pnpm
pnpm add @cherrywind/postcss --save-dev
```

## Plugins

### `postcss-px-to-local-var`

A PostCSS plugin that converts `px` units to a value calculated with a CSS variable. This allows you to create scoped components where the scale can be controlled by simply changing the CSS variable's value on the root element.

**Example:**

**Input:**

```css
.foo {
  font-size: 16px;
  border: 1px solid black;
  margin-bottom: 10px;
}
```

**Output (with default options):**

```css
.foo {
  font-size: calc(var(--local-scope-rem, 1rem) * 1);
  border: calc(var(--local-scope-rem, 1rem) * 0.0625) solid black;
  margin-bottom: calc(var(--local-scope-rem, 1rem) * 0.625);
}
```

By changing the `--local-scope-rem` variable on a parent element, you can scale all the child elements.

```html
<div style="--local-scope-rem: 1.2rem;">
  <div class="foo">...</div>
</div>
```

**Usage**

Install the plugin and add it to your PostCSS configuration:

```javascript
// postcss.config.js
const { postcssPxToLocalVar } = require('@cherrywind/postcss');

module.exports = {
  plugins: [
    postcssPxToLocalVar({
      // Your options here
    }),
  ],
};
```

**Options**

| Option              | Type                  | Default                 | Description                                                                          |
| ------------------- | --------------------- | ----------------------- | ------------------------------------------------------------------------------------ |
| `rootValue`         | `number`              | `16`                    | The root element font size.                                                          |
| `unitPrecision`     | `number`              | `5`                     | The number of decimal places for the calculated value.                               |
| `selectorBlackList` | `(string | RegExp)[]` | `[]`                    | An array of selectors to ignore.                                                     |
| `propList`          | `string[]`            | `['*']`                 | The list of properties to convert.                                                   |
| `replace`           | `boolean`             | `true`                  | Whether to replace the original `px` declaration or add a fallback.                  |
| `mediaQuery`        | `boolean`             | `false`                 | Whether to convert `px` in media queries.                                            |
| `minPixelValue`     | `number`              | `0`                     | The minimum pixel value to replace.                                                  |
| `exclude`           | `RegExp \| Function`  | `null`                  | A regex or function to exclude files from processing.                                |
| `varName`           | `string`              | `'--local-scope-rem'`   | The name of the CSS custom property.                                                 |

### `postcss-rem-to-local-var`

> [!WARNING]
> **Deprecated**
>
> Please use [`postcss-px-to-local-var`](#postcss-px-to-local-var) instead.

This plugin converts `rem` units to `calc(var(...) * value)`. It is succeeded by `postcss-px-to-local-var` which offers more features and flexibility.
