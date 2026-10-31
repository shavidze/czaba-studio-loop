#!/usr/bin/env bash
# Usage: run-1a.sh <srcdir> <outdir> ; runs PERF-1a only, alone, in a fresh copy of <srcdir> (no build/ or test-results/)
set -u; SRC="$1"; OUT="$2"; DIR="/tmp/r282-run-$(basename $OUT)"
rm -rf "$DIR"; mkdir -p "$DIR" "$OUT"
(cd "$SRC" && tar --exclude=./node_modules --exclude=./build --exclude=./test-results --exclude=./.git -cf - .) | tar -xf - -C "$DIR"
ln -s /home/runner/czaba-project/store/node_modules "$DIR/node_modules"
cd "$DIR"
( time CI=true npx playwright test --config playwright.perf.config.ts studio-lab.perf ) > "$OUT/run.log" 2>&1
echo "rc $?" >> "$OUT/run.log"
cp -f test-results/perf/latest.json "$OUT/" 2>/dev/null
