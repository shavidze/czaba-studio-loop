import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  cacheDir: './.vitest-cache',
  test: {
    globals: true,
    environment: 'jsdom',
    maxWorkers: 4,
    include: ['app/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'build'],
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, './app'),
    },
  },
});
