#!/usr/bin/env bash
# Usage: run252.sh <fixed-scratch> <logdir>; MUTANTS="..." to subset.
set -u
FIX="$1"; LOG="$2"; mkdir -p "$LOG"
HERE="$(cd "$(dirname "$0")" && pwd)"
MUTANTS="${MUTANTS:-FIX-CONTROL MU-IM22-REDPROOF MU-IM22-REDPROOF-HEAD-ROW MU-FW-NO-PAUSE MU-FW-NO-SETMARKER MU-FW-SECONDS-RAW MU-FW-NO-RESUME MU-FW-RESUME-ANY MU-FW-PAUSE-STOPPED MU-FW-NO-STOP-RESUME MU-NAV-LIVE-ORIGIN MU-NONE-PLAYHEAD-STOPPED MU-PASTEND-ALWAYS-PAST}"
FILES="app/lib/arrangement/__tests__/insert-marker-ui.test.tsx app/lib/arrangement/__tests__/bars-ruler-ui.test.tsx app/lib/arrangement/__tests__/strings.test.ts"
: > "$LOG/summary.txt"
for M in $MUTANTS; do
  D="/tmp/a252-mut-$M"; rm -rf "$D"; mkdir -p "$D"
  (cd "$FIX" && tar --exclude=./node_modules -cf - .) | tar -xf - -C "$D"; ln -s "$(readlink -f "$FIX/node_modules")" "$D/node_modules"
  python3 -I "$HERE/mutate252.py" "$D" "$M" > "$LOG/$M.mutate.log" 2>&1 || { echo "$M: MUTATE-FAILED" >> "$LOG/summary.txt"; continue; }
  (cd "$D" && npx tsc --noEmit -p . > "$LOG/$M.tsc.log" 2>&1; echo "tsc rc $?" >> "$LOG/$M.tsc.log")
  (cd "$D" && npx vitest run $FILES --reporter=json --outputFile="$LOG/$M.json" > "$LOG/$M.log" 2>&1)
  RED=$(python3 -I -c "
import json,sys,re
d=json.load(open(sys.argv[1]))
ids=[]
for f in d['testResults']:
  for a in f['assertionResults']:
    if a['status']!='passed':
      t=a['title']; mm=re.match(r'(IM\d+|ST\d+|FW\d+|BR\d+\w?)',t); fm=(a.get('failureMessages') or [''])[0].split('\n')[0][:110]; ids.append((mm.group(1) if mm else t[:60])+' ['+fm+']')
print('; '.join(ids) if ids else 'none')" "$LOG/$M.json")
  echo "$M: $(tail -1 $LOG/$M.tsc.log) | red: $RED" >> "$LOG/summary.txt"; rm -rf "$D"
done
cat "$LOG/summary.txt"
