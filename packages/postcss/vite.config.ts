import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: ['src/index.ts'],
      formats: ['es', 'cjs'],
    },
    sourcemap: true,
  },
  plugins: [
    dts({
      rollupTypes: true,
      staticImport: true,
      entryRoot: 'src',
      tsconfigPath: path.resolve(__dirname, '../../tsconfig.node.json'),
    }),
  ],
});
