#!/usr/bin/env bash
# Usage: TREE=<copy of A's store tree, node_modules symlinked> OUT=<abs dir> bash run-mutants-380.sh
# Each mutant edits one anchored line on the copy, runs the export unit files, records red tests, restores.
set -u
: "${TREE:?}"; : "${OUT:?}"; mkdir -p "$OUT"
cd "$TREE" || exit 1
FILES="app/lib/arrangement/__tests__/export-wav-stream.test.ts app/lib/arrangement/__tests__/export-wav.test.ts app/lib/arrangement/__tests__/export-cancel.test.ts app/lib/arrangement/__tests__/export-wav-in-place.test.ts"
run() {
  id=$1 file=$2 from=$3 to=$4
  cp "$file" "$OUT/$id.orig"
  python3 -I - "$file" "$from" "$to" <<'PY'
import sys
p,a,b=sys.argv[1:4]
s=open(p).read()
n=s.count(a)
if n!=1:
    print(f"ANCHOR COUNT {n}"); sys.exit(3)
open(p,'w').write(s.replace(a,b))
PY
  rc=$?
  if [ $rc -ne 0 ]; then echo "$id anchor-missing" | tee -a "$OUT/summary.txt"; cp "$OUT/$id.orig" "$file"; return; fi
  npx vitest run $FILES > "$OUT/$id.full.log" 2>&1; vrc=$?
  red=$(sed 's/\x1b\[[0-9;]*m//g' "$OUT/$id.full.log" | grep -E '^ FAIL ' | sort -u | sed 's/^ FAIL  //' | tr '\n' '|')
  echo "$id rc=$vrc red=[$red]" | tee -a "$OUT/summary.txt"
  cp "$OUT/$id.orig" "$file"
}
: > "$OUT/summary.txt"
run MU-12A-NO-CLAMP app/lib/arrangement/export-wav.ts 'Math.min(MAX_24BIT_SAMPLE, Math.max(-1, channels[channel][i]))' 'channels[channel][i]'
run MU-12A-OFFSET app/lib/arrangement/export-wav.ts '((written + i) * channelCount + channel) * 3' '(i * channelCount + channel) * 3'
run MU-12A-PEAK-LAST app/lib/arrangement/export-wav.ts 'peak = Math.max(peak, report.peak);' 'peak = report.peak;'
run MU-12A-CLIPPED-LAST app/lib/arrangement/export-wav.ts 'clippedSamples += report.clippedSamples;' 'clippedSamples = report.clippedSamples;'
run MU-12A-ALL-IN-FLIGHT app/lib/arrangement/export-wav.client.ts '      postNextChunk();
      reportProgress(0);' '      while (offset < length) postNextChunk();
      reportProgress(0);'
run MU-12A-NO-ABORT app/lib/arrangement/export-wav.client.ts "    signal?.addEventListener('abort', handleAbort);
    const fail" "    const fail"
run MU-12A-NO-REARM app/lib/arrangement/export-wav.client.ts "      if (message.type === 'ack') {
        armStallTimer();" "      if (message.type === 'ack') {"
run MU-12A-NO-FINISH-CHECK app/lib/arrangement/export-wav.ts '      if (written !== length) {' '      if (written > length) {'
echo restored | tee -a "$OUT/summary.txt"
