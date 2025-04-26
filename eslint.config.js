const { defineConfig } = require('eslint/config');

module.exports = defineConfig({
  ignores: ['**/node_modules/**', '**/dist/**'],
});
