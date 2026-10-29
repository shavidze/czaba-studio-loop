#!/usr/bin/env bash
# usage: run-mutants.sh <fixed-scratch-dir> <logdir>   (fixed scratch = HEAD 0e862be + precheck diff + test grants)
set -u
SRC="$1"; LOG="$2"; HERE="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$LOG"; : > "$LOG/summary.txt"
TESTS="app/lib/arrangement/__tests__/insert-marker-ui.test.tsx app/lib/arrangement/__tests__/bars-ruler-ui.test.tsx app/lib/arrangement/__tests__/strings.test.ts"
for m in FIX-CONTROL MU-SPACE-FROM-POSITION MU-NO-RANGE-START MU-SHIFT-SAME-AS-SPACE MU-CLICK-SEEKS-PLAYING MU-NO-STATUS-PLAYING MU-NO-RANGE-CLEAR MU-CTRL-SHIFT-NOOP MU-HOME-MARKER-ONLY MU-SEEKTO-NO-MARKER MU-SCRUBEND-NO-MARKER MU-HANDLE-ONSEEK MU-CUT-NO-REMAP MU-KEYUP-OLD MU-MARKER-PLAY-TOGGLE; do
  W="/tmp/b249-mut-$m"; rm -rf "$W"; mkdir -p "$W"
  (cd "$SRC" && tar --exclude=node_modules -cf - .) | tar -xf - -C "$W"
  ln -s /home/runner/czaba-project/store/node_modules "$W/node_modules"
  python3 "$HERE/mutate.py" "$W" "$m" > "$LOG/$m.apply.txt" 2>&1 || { echo "$m APPLY-FAILED" >> "$LOG/summary.txt"; continue; }
  (cd "$W" && timeout 400 npx vitest run $TESTS --reporter=json --outputFile="$LOG/$m.json" > "$LOG/$m.log" 2>&1)
  red=$(python3 -c "
import json,re,sys
d=json.load(open('$LOG/$m.json'))
ids=[]
for f in d['testResults']:
  for a in f['assertionResults']:
    if a['status']=='failed':
      m=re.search(r'\b(IM\d+|BR\d+b?|ST\d+)\b',a['title']); ids.append(m.group(1) if m else a['title'][:30])
print(' '.join(sorted(set(ids))) or 'none')")
  echo "$m: $red" >> "$LOG/summary.txt"
  rm -rf "$W"
done
cat "$LOG/summary.txt"
