#!/bin/bash
cd /tmp/c272-new; T=app/lib/arrangement/__tests__; OUT=/home/runner/czaba-project/tmp/studio-real-loop/c-round-272/mutants
FILES="app/contexts/ArrangementContext.tsx app/components/arrangement/StudioWorkspace.tsx app/lib/arrangement/playback-start.ts"
mkdir -p /tmp/c272-bak; for f in $FILES; do cp $f /tmp/c272-bak/$(basename $f); done
: > $OUT/results.txt
for m in M-STOP-EXACT M-NO-W M-W-ALWAYS-STOPPED M-DESCRIBE-MARKER-ONLY M-PRED-COPY M-KIND-LOOSE M-SEQ-BUMP M-ORIGIN MC-S-NO-FOLLOWPAUSED MC-W-IGNORE-PLAYING MC-S-REMOVED; do
  if [[ $m == MC-* ]]; then python3 -I $OUT/mutate-c.py $m; else python3 -I $OUT/mutate-a.py $m; fi || { echo "$m APPLY-FAIL" >> $OUT/results.txt; continue; }
  timeout 600 npx vitest run $T/playback-start.test.ts $T/status-lifetime.test.tsx $T/bars-ruler-ui.test.tsx $T/insert-marker-ui.test.tsx --reporter=json --outputFile=$OUT/$m.json > $OUT/$m.log 2>&1
  red=$(python3 -c "import json;d=json.load(open('$OUT/$m.json'));print(' '.join(sorted(set(t['title'].split(' ')[0] for f in d['testResults'] for t in f['assertionResults'] if t['status']=='failed'))))")
  echo "$m red: ${red:-NONE}" >> $OUT/results.txt
  for f in $FILES; do cp /tmp/c272-bak/$(basename $f) $f; done
done
for f in $FILES; do cmp $f /home/runner/czaba-project/store/$f || echo RESTORE-MISMATCH $f >> $OUT/results.txt; done
