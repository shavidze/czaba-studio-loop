#!/usr/bin/env bash
# Usage: TREE=<copy of A's store tree, node_modules symlinked> OUT=<abs dir> [MODE=unit|browser|all] bash run-mutants-381.sh
# Each mutant edits one anchored text on the copy, runs its covering command, records the red evidence, restores.
# unit:    MU-13A-SUM-NO-CHANNELS -> perf lib vitest (scratch config); expected red: PL1.
# browser: MU-13A-NO-DECODE-WRAP, MU-13A-NO-CTOR-WRAP -> PERF-RES (playwright perf, builds; run alone);
#          expected problem strings are grepped from test-results/perf/latest-resources.json.
set -u
: "${TREE:?}"; : "${OUT:?}"; MODE="${MODE:-all}"; mkdir -p "$OUT"
LOOP="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$TREE" || exit 1
UNIT_CMD="npx vitest run --config $LOOP/b-round-334/vitest.perf-lib.config.mjs"
PERF_CMD="npx playwright test --config playwright.perf.config.ts perf/studio-lab-resources.perf.spec.ts"
REPORT="test-results/perf/latest-resources.json"
FILE=perf/lib/pcm-live.ts
apply() {
  python3 -I - "$FILE" "$2" "$3" <<'PY'
import sys
p,a,b=sys.argv[1:4]
s=open(p).read()
n=s.count(a)
if n!=1:
    print(f"ANCHOR COUNT {n}"); sys.exit(3)
open(p,'w').write(s.replace(a,b))
PY
}
run_unit() {
  id=$1
  cp "$FILE" "$OUT/$id.orig"
  if ! apply "$id" "$2" "$3"; then echo "$id anchor-missing" | tee -a "$OUT/summary.txt"; cp "$OUT/$id.orig" "$FILE"; return; fi
  $UNIT_CMD > "$OUT/$id.log" 2>&1; vrc=$?
  red=$(sed 's/\x1b\[[0-9;]*m//g' "$OUT/$id.log" | grep -E '^ +(×|✗|FAIL) ' | sed 's/^ *//' | sort -u | tr '\n' '|')
  echo "$id rc=$vrc red=[$red]" | tee -a "$OUT/summary.txt"
  cp "$OUT/$id.orig" "$FILE"
}
run_browser() {
  id=$1 expect1=$4 expect2=${5:-}
  cp "$FILE" "$OUT/$id.orig"
  if ! apply "$id" "$2" "$3"; then echo "$id anchor-missing" | tee -a "$OUT/summary.txt"; cp "$OUT/$id.orig" "$FILE"; return; fi
  rm -f "$REPORT"
  $PERF_CMD > "$OUT/$id.log" 2>&1; prc=$?
  [ -f "$REPORT" ] && cp "$REPORT" "$OUT/$id.latest-resources.json"
  found1=$(grep -c -F "$expect1" "$OUT/$id.latest-resources.json" 2>/dev/null || echo 0)
  log1=$(grep -c -F "$expect1" "$OUT/$id.log" 2>/dev/null || echo 0)
  line="$id rc=$prc expect1='$expect1' json-hits=$found1 log-hits=$log1"
  if [ -n "$expect2" ]; then
    found2=$(grep -c -F "$expect2" "$OUT/$id.latest-resources.json" 2>/dev/null || echo 0)
    log2=$(grep -c -F "$expect2" "$OUT/$id.log" 2>/dev/null || echo 0)
    line="$line expect2='$expect2' json-hits=$found2 log-hits=$log2"
  fi
  echo "$line" | tee -a "$OUT/summary.txt"
  cp "$OUT/$id.orig" "$FILE"
}
: > "$OUT/summary.txt"
cp "$FILE" "$OUT/pristine.pcm-live.ts"
if [ "$MODE" = unit ] || [ "$MODE" = all ]; then
  run_unit MU-13A-SUM-NO-CHANNELS \
    'const bytes = entry.length * entry.numberOfChannels * 4;' \
    'const bytes = entry.length * 4;'
fi
if [ "$MODE" = browser ] || [ "$MODE" = all ]; then
  run_browser MU-13A-NO-DECODE-WRAP \
    '  proto.decodeAudioData = trackedDecode;
' '' \
    'pcm live count 7 ≠ 9 library sources'
  run_browser MU-13A-NO-CTOR-WRAP \
    '  window.AudioBuffer = TrackedAudioBuffer;
' '' \
    'pcm registry did not count its probe buffer' \
    'pcm live count 2 ≠ 9 library sources'
fi
if cmp -s "$FILE" "$OUT/pristine.pcm-live.ts"; then echo restored | tee -a "$OUT/summary.txt"; else echo "NOT RESTORED" | tee -a "$OUT/summary.txt"; fi
