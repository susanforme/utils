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

## 安装

```bash
npm install @your-scope/flexible
# 或
yarn add @your-scope/flexible
# 或
pnpm add @your-scope/flexible
```

## 使用方法

### 基础用法

```typescript
import { flexible } from '@your-scope/flexible';

// 使用默认设置初始化
const cleanup = flexible();

// 需要时清理
cleanup();
```

### 自定义配置

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

### 配置选项

```typescript
interface FlexibleOptions {
  /**
   * 断点数组（像素单位），从大到小排序。
   * 默认为 [768]。
   */
  breakpoints?: number[];
  /**
   * 与断点对应的容器宽度数组。
   * 数组长度必须比断点数组多一个。
   */
  containers?: number[];
  /**
   * 用于计算的基础容器宽度。
   * 默认为 containers 数组的最后一项。
   */
  basicContainer?: number;
  /**
   * 是否在特定作用域元素上设置 CSS 变量。
   */
  scope?: {
    element?: HTMLElement;
    cssVarName?: string;
  } | false;
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
import { flexible } from '@your-scope/flexible';

// 使用默认设置初始化
const cleanup = flexible();

// 字体大小将根据视口宽度自动调整
// 100rem = 100vw = 设计宽度
```

### 自定义断点示例

```typescript
import { flexible } from '@your-scope/flexible';

const cleanup = flexible({
  breakpoints: [1024, 768],
  containers: [1920, 1024, 768],
  basicContainer: 1920
});
```

### 自定义作用域示例

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

## 许可证

MIT 