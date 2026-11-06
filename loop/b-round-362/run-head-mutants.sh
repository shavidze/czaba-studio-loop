#!/bin/bash
L=/home/runner/czaba-project/tmp/studio-real-loop/b-round-362
SC=/home/runner/b363-scratch/sc
T="app/lib/arrangement/__tests__/render-budget.test.tsx app/lib/arrangement/__tests__/clip-gain-pointer-preview.test.tsx app/lib/arrangement/__tests__/range-store.test.tsx app/lib/arrangement/__tests__/detail-panel.test.tsx app/lib/arrangement/__tests__/track-layout.test.tsx app/lib/arrangement/__tests__/drag-preview-render.test.tsx"
cd $SC || exit 1
npx vitest run $T > $L/mutants-head/base.log 2>&1; echo "base rc $?" >> $L/mutants-head/summary.txt
for spec in "app/components/arrangement/ArrangementClip.tsx ArrangementPeakPath" "app/components/arrangement/ArrangementDetailPanel.tsx ArrangementDetailPlayhead" "app/components/arrangement/ArrangementDetailPanel.tsx ArrangementDetailWaveform" "app/components/arrangement/StudioWorkspace.tsx ArrangementRangeReadout"; do
  set -- $spec; f=$1; n=$2
  cp $f /tmp/orig.tsx && python3 -I $L/mutate.py $f $n && npx vitest run $T > $L/mutants-head/$n.log 2>&1; rc=$?
  cp /tmp/orig.tsx $f
  echo "$n rc $rc $(grep -E 'Tests +[0-9]' $L/mutants-head/$n.log | tail -1)" >> $L/mutants-head/summary.txt
done
echo DONE >> $L/mutants-head/summary.txt
