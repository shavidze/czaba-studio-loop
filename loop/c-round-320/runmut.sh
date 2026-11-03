#!/bin/bash
O=/home/runner/czaba-project/tmp/studio-real-loop/c-round-320; M=/tmp/c320m; A=/tmp/c320a
RS="app/lib/arrangement/__tests__/range-store.test.tsx app/lib/arrangement/__tests__/detail-panel.test.tsx app/lib/arrangement/__tests__/track-layout.test.tsx"
NB="app/lib/arrangement/__tests__/render-budget.test.tsx app/lib/arrangement/__tests__/clip-gain-pointer-preview.test.tsx"
restore(){ for f in app/contexts/ArrangementContext.tsx app/lib/arrangement/range-store.ts app/components/arrangement/ArrangementDetailPanel.tsx app/components/arrangement/ArrangementClip.tsx app/components/arrangement/StudioWorkspace.tsx; do cp $A/$f $M/$f; done; }
cd $M; : > $O/mutants.txt
for m in MU-RANGE-IN-VALUE MU-LANE-NEW-OBJECT MU-NO-STATUS-REWRITE MU-STALE-LATESTREF C-MU-DETAIL-IGNORE-PROP MU-DETAIL-IGNORE-STORE; do restore
  python3 -I /home/runner/czaba-project/tmp/studio-real-loop/a-round-320/mutants.py $M $m >> $O/mutants.txt 2>&1
  timeout 600 npx vitest run $RS > $O/mut-$m.log 2>&1; echo "$m rc=$? $(sed 's/\x1b\[[0-9;]*m//g' $O/mut-$m.log | grep -E '^ +Tests ' | tr -s ' ') FAILED: $(sed 's/\x1b\[[0-9;]*m//g' $O/mut-$m.log | grep -oE '(×|FAIL) .*(RS[0-9][^>]*)' | grep -oE 'RS[0-9]+[a-z(]*[^ ]*' | sort -u | tr '\n' ' ')" >> $O/mutants.txt; done
for m in C-MU-PLAYHEAD-NO-MEMO C-MU-PEAKPATH-NO-MEMO C-MU-WAVEFORM-NO-MEMO C-MU-READOUT-NO-MEMO; do restore
  python3 -I /tmp/c320-scripts/cmut.py $M $m >> $O/mutants.txt 2>&1
  timeout 600 npx vitest run $NB $RS > $O/mut-$m.log 2>&1; echo "$m rc=$? $(sed 's/\x1b\[[0-9;]*m//g' $O/mut-$m.log | grep -E '^ +Tests ' | tr -s ' ') FAILED: $(sed 's/\x1b\[[0-9;]*m//g' $O/mut-$m.log | grep -E '^ +(×|FAIL)' | head -8 | tr -s ' ' | tr '\n' ';')" >> $O/mutants.txt; done
restore; timeout 600 npx vitest run $NB $RS > $O/mut-restored.log 2>&1; echo "RESTORED rc=$? $(sed 's/\x1b\[[0-9;]*m//g' $O/mut-restored.log | grep -E '^ +Tests ' | tr -s ' ')" >> $O/mutants.txt
python3 -I /tmp/c320-scripts/namelive.py $M >> $O/mutants.txt; timeout 600 npx vitest run $NB > $O/namelive.log 2>&1; echo "NAMELIVE rc=$?" >> $O/mutants.txt
for f in app/lib/arrangement/__tests__/render-budget.test.tsx app/lib/arrangement/__tests__/clip-gain-pointer-preview.test.tsx; do cp $A/$f $M/$f; done
echo DONE >> $O/mutants.txt
