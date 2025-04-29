# Flexible

一个轻量级且灵活的响应式布局系统，灵感来源于流行的 flexible.js。

[English Documentation](./README.md)

## 特性

- 🚀 轻量级且快速
- 📱 支持响应式设计
- 🔄 自动视口适配
- 🎯 可自定义断点
- 🎨 支持 CSS 变量
- 🧹 提供清理函数的简洁 API
- ⚡ 支持立即应用布局
- 📐 支持屏幕方向变化

## 安装

```bash
npm install @cherrywind/flexible
# 或
yarn add @cherrywind/flexible
# 或
pnpm add @cherrywind/flexible
```

## 使用方法

### 基础用法

```typescript
import { flexible } from '@cherrywind/flexible';

// 使用默认设置初始化
const cleanup = flexible();

// 需要时清理
cleanup();
```

### 自定义配置

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

### 配置选项

```typescript
interface FlexibleOptions {
  /**
   * 断点数组（像素单位），从大到小排序。
   * 默认为 [768]。
   */
  breakpoints?: number[];
  /**
   * 与断点对应的布局宽度数组。
   * 数组长度必须比断点数组多一个。
   * 例如，如果断点是 [768]，布局可以是 [375, 1920]，
   * 其中 375 是视口宽度 <= 768px 时的宽度，1920 是视口宽度 > 768px 时的宽度。
   */
  layouts?: number[];
  /**
   * 用于计算的基础布局宽度。
   * 仅在提供 layouts 时有效。
   * 用作比例计算的基础布局宽度。
   * 默认为 layouts 数组的最后一项（layouts?.at(-1)），
   * 通常代表最大的视口宽度。
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
   * 是否在特定作用域元素上设置 CSS 变量。
   * 默认为 false，表示在文档元素上设置字体大小。
   * 如果提供对象，可以指定元素和 CSS 变量名。
   */
  scope?:
    | false
    | {
        /**
         * 设置 CSS 变量的作用域元素。
         * 默认为 document.documentElement。
         */
        element?: HTMLElement;
        /**
         * 用于基础 rem 值的 CSS 变量名。
         * 默认为 "--local-scope-rem"。
         */
        cssVarName?: string;
      };
}
```

### 返回值

`flexible` 函数返回一个清理函数，用于移除所有事件监听器：

```typescript
const cleanup = flexible();
// 之后...
cleanup();
```

## 示例

### 基础示例

```typescript
import { flexible } from '@cherrywind/flexible';

// 使用默认设置初始化
const cleanup = flexible();

// 字体大小将根据视口宽度自动调整
// 100rem = 100vw = 设计宽度
```

### 自定义断点示例

```typescript
import { flexible } from '@cherrywind/flexible';

const cleanup = flexible({
  breakpoints: [1024, 768],
  layouts: [375, 1024, 1920],
  basicLayout: 1920
});
```

### 自定义作用域示例

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

### 立即应用布局示例

```typescript
import { flexible } from '@cherrywind/flexible';

// 立即应用布局，不等待 load 事件
const cleanup = flexible({
  immediate: true
});
```

### 禁用屏幕方向变化示例

```typescript
import { flexible } from '@cherrywind/flexible';

// 禁用屏幕方向变化处理
const cleanup = flexible({
  orientationchange: false
});
```

## 许可证

MIT
