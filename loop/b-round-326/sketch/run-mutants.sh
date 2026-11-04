#!/bin/bash
set -u
S=/home/runner/b326-scratch
OUT=/home/runner/czaba-project/tmp/studio-real-loop/b-round-326/sketch
T=app/lib/arrangement/__tests__/drag-preview-render.test.tsx
cd $S
mut() {
  name=$1; file=$2; old=$3; new=$4
  cp $file /tmp/mut-backup
  python3 -I -c "
import sys,pathlib
p=pathlib.Path(sys.argv[1]); s=p.read_text(); o=sys.argv[2]; n=sys.argv[3]
assert s.count(o)==1, ('count', s.count(o)); p.write_text(s.replace(o,n))" "$file" "$old" "$new" || { echo "$name APPLY-FAILED" >> $OUT/mutants-summary.txt; return; }
  npx vitest run $T > $OUT/mutant-$name.log 2>&1; rc=$?
  cp /tmp/mut-backup $file
  echo "$name rc=$rc $(sed 's/\x1b\[[0-9;]*m//g' $OUT/mutant-$name.log | grep -E '^\s+Tests ' | tr -s ' ') failed:$(sed 's/\x1b\[[0-9;]*m//g' $OUT/mutant-$name.log | grep -oE '× DP[0-9a-z]+' | sort -u | tr '\n' ' ')" >> $OUT/mutants-summary.txt
}
: > $OUT/mutants-summary.txt
npx vitest run $T > $OUT/sketch-dp-file-1.log 2>&1; echo "sketch rc=$?" >> $OUT/mutants-summary.txt
mut MU-FADE-PROVIDER app/components/arrangement/ArrangementClip.tsx "      previewGeometry(next);
      const faded" "      previewArrangement(next);
      const faded"
mut MU-STATUS-IN-PROVIDER app/components/arrangement/ArrangementClip.tsx "        previewStatus(text);" "        setStatus(text);"
mut MU-NO-FLUSH app/contexts/ArrangementContext.tsx "      flushStatusPreview();
      dispatchStatus(update);" "      dispatchStatus(update);"
mut MU-ADOPT-REMOUNT app/contexts/ArrangementContext.tsx "          previewKey: statusPreviewKey(action.adoptPreview)," "          previewKey: null,"
mut MU-NO-LASTNONREFUSAL app/contexts/ArrangementContext.tsx "      lastNonRefusalStatusRef.current = pending.text;" "      void pending;"
npx vitest run $T > $OUT/sketch-dp-file-restored.log 2>&1; echo "restored rc=$?" >> $OUT/mutants-summary.txt
