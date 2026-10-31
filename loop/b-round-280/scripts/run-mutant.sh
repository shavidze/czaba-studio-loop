#!/usr/bin/env bash
# Usage: run-mutant.sh <ID> [<base-commit>] [<diff>] [<out-root>]
# Builds /tmp/r281-mut/<ID> = git archive <base> (default 145f6c1) + <diff> (default b-round-280/sketch.diff) + the mutant;
# runs only PERF-1a (perf/studio-lab.perf.spec.ts), alone (L38). Copies latest.json into <out-root>/<ID>/.
set -u
ID="$1"; BASE="${2:-145f6c1}"
STORE=/home/runner/czaba-project/store
LOOP=/home/runner/czaba-project/tmp/studio-real-loop
DIFF="${3:-$LOOP/b-round-280/sketch.diff}"
OUTROOT="${4:-$LOOP/b-round-280/mutants}"
OUT="$OUTROOT/$ID"; DIR="/tmp/r281-mut/$ID"
rm -rf "$DIR"; mkdir -p "$DIR" "$OUT"
git -C "$STORE" archive "$BASE" | tar -x -C "$DIR"
ln -s "$STORE/node_modules" "$DIR/node_modules"
cd "$DIR"
patch -p1 < "$DIFF" > "$OUT/apply.log" 2>&1 || { echo "apply failed"; exit 3; }
cp -r perf "$OUT/.perf-before" 2>/dev/null
SPEC=perf/studio-lab.perf.spec.ts
PAGE=perf/lib/page.ts
case "$ID" in
  SKETCH) ;;
  MU-FAILED-SOURCE)
    # the selected demo source fails in every pass: the request for /middle-east.mp3 is aborted
    sed -i "s|^  const context = await browser.newContext();|  const context = await browser.newContext();\n  await context.route('**/middle-east.mp3', (route) => route.abort());|" "$SPEC" ;;
  MU-FAILED-OTHER)
    # a non-selected demo source fails in every pass: /videos/hero/hero-music.mp3 is aborted
    sed -i "s|^  const context = await browser.newContext();|  const context = await browser.newContext();\n  await context.route('**/hero-music.mp3', (route) => route.abort());|" "$SPEC" ;;
  MU-STATUS-WAIT)
    # the library-ready wait ignores the failed status (HEAD condition only); a non-selected source fails,
    # so only the status wait (waitForCollectionReady) can catch it
    sed -i "s|^  await context.route('\*\*/hero-music.mp3'.*||" "$SPEC"
    sed -i "s|^  const context = await browser.newContext();|  const context = await browser.newContext();\n  await context.route('**/hero-music.mp3', (route) => route.abort());|" "$SPEC"
    sed -i "s|      if (new RegExp(failedSource).test(status)) return { readyMs: null, failedStatus: status };|      if (failedSource === '' \&\& status === '') return { readyMs: null, failedStatus: status };|" "$PAGE" ;;
  *) echo "unknown mutant $ID"; exit 2 ;;
esac
diff -ru "$OUT/.perf-before" perf > "$OUT/mutant.diff"; rm -rf "$OUT/.perf-before"
echo "mutant diff lines: $(wc -l < "$OUT/mutant.diff")" > "$OUT/run.log"
( time CI=true npx playwright test --config playwright.perf.config.ts studio-lab.perf ) >> "$OUT/run.log" 2>&1
echo "rc $?" >> "$OUT/run.log"
cp -f test-results/perf/latest.json "$OUT/" 2>/dev/null
echo "done $ID"
