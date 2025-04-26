/**@type {import('prettier').Options} */
module.exports = {
  semi: true,
  tabWidth: 2,
  singleQuote: true,
  printWidth: 120,
  proseWrap: 'always',
  trailingComma: 'all',
  plugins: ['prettier-plugin-organize-imports', 'prettier-plugin-packagejson'],
};
