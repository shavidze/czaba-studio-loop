#!/usr/bin/env bash
# Usage: run-mutant.sh <ID> [<base-commit>] [<diff>]
# Builds /tmp/b279-mut/<ID> = git archive <base> (default 1dbf3af) + <diff> (default b-round-279/sketch.diff) + the mutant; runs only PERF-1b-ii, alone (L38).
set -u
ID="$1"; BASE="${2:-1dbf3af}"
STORE=/home/runner/czaba-project/store
LOOP=/home/runner/czaba-project/tmp/studio-real-loop
DIFF="${3:-$LOOP/a-round-280/a-round-280.diff}"
OUT="$LOOP/a-round-280/mutants/$ID"; DIR="/tmp/a280-mut/$ID"
rm -rf "$DIR"; mkdir -p "$DIR" "$OUT"
git -C "$STORE" archive "$BASE" | tar -x -C "$DIR"
ln -s "$STORE/node_modules" "$DIR/node_modules"
cd "$DIR"
patch -p1 < "$DIFF" > "$OUT/apply.log" 2>&1 || { echo "apply failed"; exit 3; }
RES=perf/studio-lab-resources.perf.spec.ts
case "$ID" in
  SKETCH) ;;
  MU-SIGN) sed -i 's|const midpoint = (sample.sentAt + sample.receivedAt) / 2 - offsetMs;|const midpoint = (sample.sentAt + sample.receivedAt) / 2 + offsetMs;|' "$RES" ;;
  MU-RTT) sed -i 's|^const clockProbeMaxRttMs = 20;|const clockProbeMaxRttMs = -1;|' "$RES" ;;
  MU-ENDPOINT) sed -i 's|const inWindow = heapSamplesInWindow(heapSamples, clock.offsetMs, t0, windowEnd);|const inWindow = heapSamples.filter((sample) => sample.sentAt >= windowStartEpoch \&\& sample.receivedAt <= windowEndEpoch);|' "$RES" ;;
  MU-ORIGIN) sed -i 's|const inWindow = heapSamplesInWindow(heapSamples, clock.offsetMs, t0, windowEnd);|const inWindow = heapSamplesInWindow(heapSamples, timeOrigin, t0, windowEnd);|' "$RES" ;;
  MU-PROBE-THROW) sed -i "s|^  let best: PageClock \| null = null;|  let best: PageClock \| null = null;\n  throw new Error('MU-PROBE-THROW');|" "$RES" ;;
  *) echo "unknown mutant $ID"; exit 2 ;;
esac
diff -u "/tmp/a280-ref/$RES" "$RES" > "$OUT/mutant.diff"
echo "mutant diff lines: $(wc -l < "$OUT/mutant.diff")" > "$OUT/run.log"
( time CI=true npx playwright test --config playwright.perf.config.ts studio-lab-resources ) >> "$OUT/run.log" 2>&1
echo "rc $?" >> "$OUT/run.log"
cp -f test-results/perf/latest-resources.json "$OUT/" 2>/dev/null
echo "done $ID"
