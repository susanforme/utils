# @cherrywind/postcss

## 简介 | Introduction

这个包提供了一个 PostCSS 插件，可以将 CSS 中的 rem 单位转换为使用 CSS 变量的动态计算值，同时还提供了一个灵活的布局系统来管理视口大小和响应式设计。

This package provides a PostCSS plugin that converts rem units in CSS to dynamic calculations using CSS variables, along with a flexible layout system to manage viewport sizes and responsive designs.

## 特性 | Features

- ✨ 将 rem 单位转换为 CSS 变量计算
- 📱 支持响应式布局和断点设置
- 🚀 轻量级实现，易于集成
- 🔄 与现代前端构建工具无缝集成

---

- ✨ Converts rem units to CSS variable calculations
- 📱 Supports responsive layouts and breakpoints
- 🚀 Lightweight implementation, easy to integrate
- 🔄 Seamlessly integrates with modern frontend build tools

## 安装 | Installation

```bash
# npm
npm install @cherrywind/postcss --save-dev

# yarn
yarn add @cherrywind/postcss --dev

# pnpm
pnpm add @cherrywind/postcss --save-dev
```

## 使用方法 | Usage

### PostCSS 配置 | PostCSS Configuration

```js
// postcss.config.js
const { postcssRemToCssVars } = require('@cherrywind/postcss');

module.exports = {
  plugins: [
    postcssRemToCssVars({
      // 可选：自定义 CSS 变量名
      // Optional: customize CSS variable name
      varName: '--local-scope-rem'
    })
  ]
};
```

### 客户端 JavaScript | Client-side JavaScript

```js
import { flexible } from '@cherrywind/postcss';

// 初始化灵活布局系统
// Initialize the flexible layout system
const cleanup = flexible({
  // 可选参数
  // Optional parameters
  scopeElement: document.documentElement,
  cssVarName: '--local-scope-rem',
  breakpoints: [768], // 断点（像素）| Breakpoints (pixels)
  containers: [375, 1920], // 容器宽度 | Container widths
});

// 清理函数 (移除事件监听器)
// Cleanup function (removes event listeners)
// cleanup();
```

## CSS 转换示例 | CSS Transformation Examples

### 转换前 | Before

```css
.element {
  margin: 1rem;
  padding: 0.5rem 1.5rem;
  font-size: 0.875rem;
  border: 0.0625rem solid #ccc;
  width: calc(100% - 2rem);
}
```

### 转换后 | After

```css
.element {
  margin: calc(var(--local-scope-rem, 1rem) * 1);
  padding: calc(var(--local-scope-rem, 1rem) * 0.5) calc(var(--local-scope-rem, 1rem) * 1.5);
  font-size: calc(var(--local-scope-rem, 1rem) * 0.875);
  border: calc(var(--local-scope-rem, 1rem) * 0.0625) solid #ccc;
  width: calc(100% - calc(var(--local-scope-rem, 1rem) * 2));
}
```

## API 文档 | API Documentation

### postcssRemToCssVars(options)

一个 PostCSS 插件，用于将 rem 单位转换为使用 CSS 变量的计算值。

A PostCSS plugin that converts rem units to calculations using CSS variables.

#### 选项 | Options

| 参数 | 类型 | 默认值 | 描述 |
|------|------|---------|-------------|
| `varName` | `string` | `'--local-scope-rem'` | 用于 rem 基础值的 CSS 变量名 |

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `varName` | `string` | `'--local-scope-rem'` | CSS variable name for the base rem value |

### flexible(options)

初始化一个灵活的布局系统，根据视口宽度设置 CSS 变量，并根据断点自适应缩放。

Initializes a flexible layout system that sets a CSS variable for rem units based on viewport width and adaptively scales according to breakpoints.

#### 选项 | Options

| 参数 | 类型 | 默认值 | 描述 |
|------|------|---------|-------------|
| `scopeElement` | `HTMLElement` | `document.documentElement` | 设置 CSS 变量的作用域元素 |
| `cssVarName` | `string` | `'--local-scope-rem'` | 用于 rem 基础值的 CSS 变量名 |
| `breakpoints` | `number[]` | `[768]` | 断点数组（像素，从大到小排序） |
| `containers` | `number[]` | - | 与断点对应的容器宽度数组，必须比断点数组多一项 |
| `basicContainer` | `number` | `containers?.at(-1)` | 用作参考计算的基础容器宽度 |

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `scopeElement` | `HTMLElement` | `document.documentElement` | Scope element to set the CSS variable on |
| `cssVarName` | `string` | `'--local-scope-rem'` | CSS variable name for the base rem value |
| `breakpoints` | `number[]` | `[768]` | Array of breakpoints in pixels, from largest to smallest |
| `containers` | `number[]` | - | Array of container widths corresponding to breakpoints, must have one more item than breakpoints |
| `basicContainer` | `number` | `containers?.at(-1)` | Base container width used as reference for calculations |

## 许可证 | License

MIT
