```typescript
flexible({
  layouts: [375, 1920],
  breakpoints: [768],
  immediate: true,
  ratio: [1, 1],
  scope: {
    element: document.querySelector("#private-container"),
    cssVarName: "--local-scope-rem",
  },
  scopes: [
    // 新增的数组字段
    {
      element: document.querySelector("#container1"),
      cssVarName: "--scope1-rem",
    },
    {
      element: document.querySelector("#container2"),
      cssVarName: "--scope2-rem",
    },
  ],
});
```

support multiple scope if ratio not specified, use the ratio of the scope element

```typescript
flexible({
  layouts: [375, 1920],
  breakpoints: [768],
  immediate: true,
  ratio: [1, 1],
  cssVarName: "--scope1-rem",
  scope: [
    // 新增的数组字段
    {
      element: document.querySelector("#container1"),
    },
    {
      element: document.querySelector("#container2"),
      ratio: [1, 2],
    },
  ],
});
```
