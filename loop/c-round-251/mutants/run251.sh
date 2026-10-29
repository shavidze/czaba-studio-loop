#!/usr/bin/env bash
# Usage: run251.sh <fixed-scratch> <logdir>; MUTANTS="..." to subset. Copies the scratch per mutant (node_modules symlinked).
set -u
FIX="$1"; LOG="$2"; mkdir -p "$LOG"
HERE="$(cd "$(dirname "$0")" && pwd)"
MUTANTS="${MUTANTS:-FIX-CONTROL MU-CAPTION-POSITION MU-CAPTION-REACT-STATE MU-CAPTION-STATIC MU-PASTE-SPLIT-LOCATOR MU-PASTE-LOCATOR MU-SPLIT-LOCATOR MU-M-NO-RANGE MU-GESTURE-CS-NO-PREVENT MU-GESTURE-HOME-NO-PREVENT}"
FILES="app/lib/arrangement/__tests__/insert-marker-ui.test.tsx app/lib/arrangement/__tests__/library-preview.test.tsx app/lib/arrangement/__tests__/render-budget.test.tsx app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx app/lib/arrangement/__tests__/strings.test.ts"
: > "$LOG/summary.txt"
for M in $MUTANTS; do
  D="/tmp/b251-mut-$M"; rm -rf "$D"; mkdir -p "$D"
  (cd "$FIX" && tar --exclude=./node_modules -cf - .) | tar -xf - -C "$D"; ln -s "$(readlink -f "$FIX/node_modules")" "$D/node_modules"
  python3 -I "$HERE/mutate251.py" "$D" "$M" > "$LOG/$M.mutate.log" 2>&1 || { echo "$M: MUTATE-FAILED" >> "$LOG/summary.txt"; continue; }
  (cd "$D" && npx vitest run $FILES --reporter=json --outputFile="$LOG/$M.json" > "$LOG/$M.log" 2>&1)
  RED=$(python3 -I -c "
import json,sys,re
d=json.load(open(sys.argv[1]))
ids=[]
for f in d['testResults']:
  for a in f['assertionResults']:
    if a['status']!='passed':
      t=a['title']; mm=re.match(r'(IM\d+|ST\d+|TH\d+|LP\w*)',t); ids.append(mm.group(1) if mm else t[:70])
print(', '.join(ids) if ids else 'none')" "$LOG/$M.json")
  echo "$M: $RED" >> "$LOG/summary.txt"; rm -rf "$D"
done
cat "$LOG/summary.txt"
