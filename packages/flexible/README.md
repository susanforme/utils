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
- ⚡ Immediate layout application
- 📐 Orientation change support

## Installation

```bash
npm install @cherrywind/flexible
# or
yarn add @cherrywind/flexible
# or
pnpm add @cherrywind/flexible
```

## Usage

### Basic Usage

```typescript
import { flexible } from '@cherrywind/flexible';

// Initialize with default settings
const cleanup = flexible();

// Clean up when needed
cleanup();
```

### With Custom Options

```typescript
import { flexible } from '@cherrywind/flexible';

const cleanup = flexible({
  breakpoints: [1024, 768],
  layouts: [375, 1024, 1920],
  basicLayout: 1920,
  immediate: true,
  orientationchange: false,
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
        element?: HTMLElement;
        /**
         * The CSS variable name to use for the base rem value.
         * Defaults to "--local-scope-rem".
         */
        cssVarName?: string;
      };
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
import { flexible } from '@cherrywind/flexible';

// Initialize with default settings
const cleanup = flexible();

// The font size will be automatically adjusted based on viewport width
// 100rem = 100vw = design width
```

### Custom Breakpoints Example

```typescript
import { flexible } from '@cherrywind/flexible';

const cleanup = flexible({
  breakpoints: [1024, 768],
  layouts: [375, 1024, 1920],
  basicLayout: 1920
});
```

### Custom Scope Example

```typescript
import { flexible } from '@cherrywind/flexible';

const container = document.querySelector('.container');
const cleanup = flexible({
  scope: {
    element: container,
    cssVarName: '--container-rem'
  }
});
```

### Immediate Layout Example

```typescript
import { flexible } from '@cherrywind/flexible';

// Apply layout immediately without waiting for load event
const cleanup = flexible({
  immediate: true
});
```

### Disable Orientation Change Example

```typescript
import { flexible } from '@cherrywind/flexible';

// Disable orientation change handling
const cleanup = flexible({
  orientationchange: false
});
```

## License

MIT
