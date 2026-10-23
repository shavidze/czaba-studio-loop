#!/usr/bin/env bash
# Recreates the A round-94 scratch copy (never touches store/). Arg "baseline" overlays B's snapshots for fail-before.
set -euo pipefail
L=/home/runner/czaba-project/tmp/studio-real-loop
M=$L/c-round-94/mut
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
  cp "$L/b-round-93-r94-snapshots/ArrangementContext.tsx" "$M/app/contexts/ArrangementContext.tsx"
  cp "$L/b-round-93-r94-snapshots/collection.ts" "$M/app/lib/arrangement/collection.ts"
  echo "baseline overlay applied; run: cd $M && npx vitest run app/lib/arrangement/__tests__/collection-load-status.test.tsx"
fi
