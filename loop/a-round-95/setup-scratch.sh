#!/usr/bin/env bash
# Recreates the A round-95 scratch copy (never touches store/). Arg "baseline" overlays B's snapshot of studio-lab-demo.ts for fail-before.
set -euo pipefail
L=/home/runner/czaba-project/tmp/studio-real-loop
M=$L/a-round-95/mut
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
if [ "${1:-}" = "baseline" ]; then
  cp "$L/b-round-94-r95-snapshots/studio-lab-demo.ts" "$M/app/data/studio-lab-demo.ts"
  echo "baseline overlay applied; run: cd $M && npx vitest run app/data/__tests__/studio-lab-demo.test.ts"
fi
