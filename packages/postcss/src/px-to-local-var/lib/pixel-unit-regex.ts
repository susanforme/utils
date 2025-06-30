// 匹配 px 单位，跳过字符串和 url，支持负数
const pixelUnitRegex = /"[^"]+"|'[^']+'|url\([^)]+\)|(-?\d*\.?\d+)px/g;
export default pixelUnitRegex;
