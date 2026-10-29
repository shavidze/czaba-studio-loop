#!/usr/bin/env bash
# usage: run-mutants.sh <fixed-scratch-dir> <logdir>   (fixed scratch = HEAD dcb7eb1 + round-250 precheck diff)
set -u
SRC="$1"; LOG="$2"; HERE="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$LOG"; : > "$LOG/summary.txt"
TESTS="app/lib/arrangement/__tests__/insert-marker-ui.test.tsx app/lib/arrangement/__tests__/bars-ruler-ui.test.tsx app/lib/arrangement/__tests__/strings.test.ts app/lib/arrangement/__tests__/ArrangementContext.test.ts app/lib/arrangement/__tests__/navigation-strings-ui.test.tsx app/lib/arrangement/__tests__/marker-strings-ui.test.tsx"
for m in ${MUTANTS:-FIX-CONTROL MU-PASTE-LIVE MU-ADD-LIVE MU-SPLIT-MULTI-LIVE MU-SPLIT-ONE-LIVE MU-M-LIVE MU-M-MARKER MU-STARTAT-PLAYHEAD-SUBJECT MU-PLAYFROM-PLAYHEAD-SUBJECT MU-SHIFT-AS-MARKER MU-SELECTION-AS-MARKER MU-NO-GESTURE-GUARD-CS MU-NO-GESTURE-GUARD-HOME A-MU-CTRL-ONLY C-MU-LEAK-CS C-MU-LEAK-SHIFT MU-SCRUBEND-NO-RANGE-CLEAR}; do
  W="/tmp/b250-mut-$m"; rm -rf "$W"; mkdir -p "$W"
  (cd "$SRC" && tar --exclude=node_modules -cf - .) | tar -xf - -C "$W"
  ln -s /home/runner/czaba-project/store/node_modules "$W/node_modules"
  python3 -I "$HERE/mutate.py" "$W" "$m" > "$LOG/$m.apply.txt" 2>&1 || { echo "$m APPLY-FAILED" >> "$LOG/summary.txt"; rm -rf "$W"; continue; }
  (cd "$W" && timeout 600 npx vitest run $TESTS --reporter=json --outputFile="$LOG/$m.json" > "$LOG/$m.log" 2>&1)
  red=$(python3 -I -c "
import json,re
d=json.load(open('$LOG/$m.json'))
ids=[]
for f in d['testResults']:
  for a in f['assertionResults']:
    if a['status']=='failed':
      mm=re.search(r'\b(IM\d+|BR\d+b?|ST\d+|MS\d+|NS\d+)\b',a['title']); ids.append(mm.group(1) if mm else 'AC:'+a['title'][:40])
print(' '.join(sorted(set(ids))) or 'none')")
  echo "$m: $red" >> "$LOG/summary.txt"
  rm -rf "$W"
done
cat "$LOG/summary.txt"
