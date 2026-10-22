#!/usr/bin/env bash
set -u
LOOP=$(realpath /home/runner/czaba-project/tmp/studio-real-loop/a-round-90)
STORE=/home/runner/czaba-project/store
id=$1; shift
dir=$LOOP/mut/$id
rm -rf "$dir"; mkdir -p "$dir"
cp -r "$STORE/app" "$dir/app"
cp "$STORE/tsconfig.json" "$STORE/package.json" "$dir/"
ln -s "$STORE/node_modules" "$dir/node_modules"
cat > "$dir/vitest.config.ts" <<CFG
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
export default defineConfig({
  cacheDir: resolve(__dirname, '.vite-cache'),
  test: { globals: true, environment: 'jsdom', maxWorkers: 4, include: ['app/**/*.test.{ts,tsx}'], exclude: ['node_modules', 'build'] },
  resolve: { alias: { '~': resolve(__dirname, './app') } },
});
CFG
node "$LOOP/scripts/mutate.mjs" "$dir" "$id" || exit 2
cd "$dir" && timeout 400 npx vitest run --root "$dir" "$@" > "$LOOP/mut-$id.txt" 2>&1
grep -E "✓|×|Test Files|Tests " "$LOOP/mut-$id.txt" | grep -E "×|Test Files|Tests " | sed 's/\x1b\[[0-9;]*m//g' | head -30
