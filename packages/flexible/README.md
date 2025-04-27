# Flexible

A lightweight and flexible layout system for responsive web design, inspired by the popular flexible.js.

[中文文档](./README.zh-CN.md)

## Features

- 🚀 Lightweight and fast
- 📱 Responsive design support
- 🔄 Automatic viewport adaptation
- 🎯 Customizable breakpoints
- 🎨 CSS variable support
- 🧹 Clean API with cleanup function

## Installation

```bash
npm install @your-scope/flexible
# or
yarn add @your-scope/flexible
# or
pnpm add @your-scope/flexible
```

## Usage

### Basic Usage

```typescript
import { flexible } from '@your-scope/flexible';

// Initialize with default settings
const cleanup = flexible();

// Clean up when needed
cleanup();
```

### With Custom Options

```typescript
import { flexible } from '@your-scope/flexible';

const cleanup = flexible({
  breakpoints: [1024, 768],
  containers: [1920, 1024, 768],
  basicContainer: 1920,
  scope: {
    element: document.querySelector('.container'),
    cssVarName: '--custom-rem'
  }
});
```

## API

### Options

```typescript
interface FlexibleOptions {
  /**
   * An array of breakpoints in pixels, from largest to smallest.
   * Defaults to [768].
   */
  breakpoints?: number[];
  /**
   * An array of container widths that corresponds to breakpoints.
   * Must have exactly one more item than breakpoints array.
   */
  containers?: number[];
  /**
   * The base container width used as reference for calculations.
   * Defaults to the last item in containers array.
   */
  basicContainer?: number;
  /**
   * Whether to set the CSS variable on a specific scope element.
   */
  scope?: {
    element?: HTMLElement;
    cssVarName?: string;
  } | false;
}
```

### Return Value

The `flexible` function returns a cleanup function that removes all event listeners:

```typescript
const cleanup = flexible();
// Later...
cleanup();
```

## Examples

### Basic Example

```typescript
import { flexible } from '@your-scope/flexible';

// Initialize with default settings
const cleanup = flexible();

// The font size will be automatically adjusted based on viewport width
// 100rem = 100vw = design width
```

### Custom Breakpoints Example

```typescript
import { flexible } from '@your-scope/flexible';

const cleanup = flexible({
  breakpoints: [1024, 768],
  containers: [1920, 1024, 768],
  basicContainer: 1920
});
```

### Custom Scope Example

```typescript
import { flexible } from '@your-scope/flexible';

const container = document.querySelector('.container');
const cleanup = flexible({
  scope: {
    element: container,
    cssVarName: '--container-rem'
  }
});
```

## License

MIT
