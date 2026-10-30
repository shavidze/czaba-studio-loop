#!/bin/bash
cd /tmp/c273-new; T=app/lib/arrangement/__tests__; OUT=/home/runner/czaba-project/tmp/studio-real-loop/c-round-273/mutants
FILES="app/contexts/ArrangementContext.tsx app/components/arrangement/StudioWorkspace.tsx app/lib/arrangement/playback-start.ts"
mkdir -p /tmp/c273-new-bak; for f in $FILES; do cp $f /tmp/c273-new-bak/$(basename $f); done
: > $OUT/results.txt
for m in M-NO-R M-R-NO-GUARD M-NO-G M-NO-P M-P-ALWAYS M-NO-KIND-FROM M-NO-SEL-PASTEND M-SNAPSHOT M-STOP-EXACT M-C-R-ANYTEXT; do
  python3 -I $OUT/mutate.py $m || { echo "$m APPLY-FAIL" >> $OUT/results.txt; continue; }
  timeout 600 npx vitest run $T/playback-start.test.ts $T/status-lifetime.test.tsx --reporter=json --outputFile=$OUT/$m.json > $OUT/$m.log 2>&1
  red=$(python3 -c "import json;d=json.load(open('$OUT/$m.json'));print(' '.join(sorted(set(t['title'].split(' ')[0] for f in d['testResults'] for t in f['assertionResults'] if t['status']=='failed'))))")
  echo "$m red: ${red:-NONE}" >> $OUT/results.txt
  for f in $FILES; do cp /tmp/c273-new-bak/$(basename $f) $f; done
done
for f in $FILES; do cmp $f /home/runner/czaba-project/store/$f || echo RESTORE-MISMATCH $f >> $OUT/results.txt; done
echo DONE >> $OUT/results.txt
