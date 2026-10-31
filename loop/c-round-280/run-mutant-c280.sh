#!/usr/bin/env bash
# C round 280: mutant runner. /tmp/c280-mut/<ID> = git archive 1dbf3af + A's two working-tree perf files (copied, not A's diff) + the mutant sed.
# Fails loudly when the sed did not change the file. Runs only PERF-1b-ii, alone (L38).
set -u
ID="$1"
STORE=/home/runner/czaba-project/store
C=/home/runner/czaba-project/tmp/studio-real-loop/c-round-280
OUT="$C/mutants/$ID"; DIR="/tmp/c280-mut/$ID"
rm -rf "$DIR"; mkdir -p "$DIR" "$OUT"
git -C "$STORE" archive 1dbf3af | tar -x -C "$DIR"
ln -s "$STORE/node_modules" "$DIR/node_modules"
RES=perf/studio-lab-resources.perf.spec.ts
cp "$STORE/$RES" "$DIR/$RES"
cp "$STORE/perf/budgets.resources.json" "$DIR/perf/budgets.resources.json"
cd "$DIR"
case "$ID" in
  MU-SIGN) sed -i 's|const midpoint = (sample.sentAt + sample.receivedAt) / 2 - offsetMs;|const midpoint = (sample.sentAt + sample.receivedAt) / 2 + offsetMs;|' "$RES" ;;
  MU-ENDPOINT) sed -i 's|const inWindow = heapSamplesInWindow(heapSamples, clock.offsetMs, t0, windowEnd);|const inWindow = heapSamples.filter((sample) => sample.sentAt >= windowStartEpoch \&\& sample.receivedAt <= windowEndEpoch);|' "$RES" ;;
  MU-ORIGIN) sed -i 's|const inWindow = heapSamplesInWindow(heapSamples, clock.offsetMs, t0, windowEnd);|const inWindow = heapSamplesInWindow(heapSamples, timeOrigin, t0, windowEnd);|' "$RES" ;;
  MU-PROBE-THROW) sed -i "s|^  let best: PageClock \| null = null;|  let best: PageClock \| null = null;\n  throw new Error('MU-PROBE-THROW');|" "$RES" ;;
  *) echo "unknown mutant $ID"; exit 2 ;;
esac
diff -u "$STORE/$RES" "$RES" > "$OUT/mutant.diff"
N=$(wc -l < "$OUT/mutant.diff")
echo "mutant diff lines: $N" > "$OUT/run.log"
if [ "$N" -eq 0 ]; then echo "MUTANT NOT APPLIED" >> "$OUT/run.log"; exit 4; fi
npx tsc --noEmit -p . > "$OUT/tsc.log" 2>&1; echo "tsc rc $?" >> "$OUT/run.log"
( time CI=true npx playwright test --config playwright.perf.config.ts studio-lab-resources ) >> "$OUT/run.log" 2>&1
echo "rc $?" >> "$OUT/run.log"
cp -f test-results/perf/latest-resources.json "$OUT/" 2>/dev/null
echo "done $ID"
