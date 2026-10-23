#!/usr/bin/env bash
set -euo pipefail
L=/home/runner/czaba-project/tmp/studio-real-loop
M=$L/a-round-101/mut
S=/home/runner/czaba-project/store
mkdir -p "$M"
cp -r "$S/app" "$S/package.json" "$S/tsconfig.json" "$M/"
ln -sfn "$S/node_modules" "$M/node_modules"
cat > "$M/vitest.config.ts" <<'CFG'
import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  cacheDir: resolve(__dirname, './.vite-cache'),
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
CFG
