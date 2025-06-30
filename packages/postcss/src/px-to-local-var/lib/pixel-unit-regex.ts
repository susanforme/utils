// 匹配 px 单位，跳过字符串和 url
const pixelUnitRegex = /"[^"]+"|'[^']+'|url\([^)]+\)|(\d*\.?\d+)px/g;
export default pixelUnitRegex;
