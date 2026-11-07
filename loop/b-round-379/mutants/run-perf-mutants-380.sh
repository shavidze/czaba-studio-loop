#!/usr/bin/env bash
# Usage: TREE=<copy of A's store tree> OUT=<abs dir> bash run-perf-mutants-380.sh  (run alone, L38)
set -u
: "${TREE:?}"; : "${OUT:?}"; mkdir -p "$OUT"; cd "$TREE" || exit 1
pm() {
  id=$1 file=$2 from=$3 to=$4
  cp "$file" "$OUT/$id.orig"
  python3 -I - "$file" "$from" "$to" <<'PY' || { echo "$id anchor-missing" | tee -a "$OUT/perf-summary.txt"; cp "$OUT/$id.orig" "$file"; return; }
import sys
p,a,b=sys.argv[1:4]; s=open(p).read()
if s.count(a)!=1: sys.exit(3)
open(p,'w').write(s.replace(a,b))
PY
  timeout 1500 npx playwright test --config playwright.perf.config.ts perf/studio-lab-resources.perf.spec.ts > "$OUT/$id.perf.log" 2>&1
  echo "$id rc=$? $(grep -E '^res\.export\.[12]\.(peak-backing-delta-mib|longtask-max\.6x) ' "$OUT/$id.perf.log" | awk '{print $1"="$4}' | tr '\n' ' ')" | tee -a "$OUT/perf-summary.txt"
  cp "$OUT/$id.orig" "$file"
}
: > "$OUT/perf-summary.txt"
pm MU-12A-PERF-GCD app/lib/arrangement/graph.client.ts '  return encodeArrangementWavStreamOffMainThread(' '  rendered.getChannelData(0);
  rendered.getChannelData(1);
  return encodeArrangementWavStreamOffMainThread('
pm MU-12A-PERF-FALLBACK app/lib/arrangement/export-wav.client.ts "  if (typeof Worker === 'undefined') {
    try {" "  if (typeof Worker === 'undefined' || length > 0) {
    try {"
echo restored | tee -a "$OUT/perf-summary.txt"
