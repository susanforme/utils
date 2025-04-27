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

### postcss-rem-to-css-vars

A PostCSS plugin that converts rem units to calculations using CSS variables.

#### Features

- ✨ Converts rem units to CSS variable calculations
- 🚀 Lightweight implementation
- 🔄 Seamless integration with modern frontend build tools

#### Usage

```js
// postcss.config.js
const { postcssRemToCssVars } = require('@cherrywind/postcss');

module.exports = {
  plugins: [
    postcssRemToCssVars({
      // Optional: customize CSS variable name
      varName: '--local-scope-rem'
    })
  ]
};
```

#### CSS Transformation Examples

##### Before

```css
.element {
  margin: 1rem;
  padding: 0.5rem 1.5rem;
  font-size: 0.875rem;
  border: 0.0625rem solid #ccc;
  width: calc(100% - 2rem);
}
```

##### After

```css
.element {
  margin: calc(var(--local-scope-rem, 1rem) * 1);
  padding: calc(var(--local-scope-rem, 1rem) * 0.5) calc(var(--local-scope-rem, 1rem) * 1.5);
  font-size: calc(var(--local-scope-rem, 1rem) * 0.875);
  border: calc(var(--local-scope-rem, 1rem) * 0.0625) solid #ccc;
  width: calc(100% - calc(var(--local-scope-rem, 1rem) * 2));
}
```

#### Options

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `varName` | `string` | `'--local-scope-rem'` | CSS variable name for the base rem value |

## License

MIT
