#!/bin/bash
# C327 mutants on scratch /tmp/c327s (copy of A's tree), never in store/
set -u
S=/tmp/c327s
OUT=/home/runner/czaba-project/tmp/studio-real-loop/c-round-327/mutants
T="app/lib/arrangement/__tests__/drag-preview-render.test.tsx app/lib/arrangement/__tests__/status-preview-store.test.ts"
cd $S
mut() {
  name=$1; file=$2; old=$3; new=$4
  cp $file /tmp/c327-mut-backup
  python3 -I -c "
import sys,pathlib
p=pathlib.Path(sys.argv[1]); s=p.read_text(); o=sys.argv[2]; n=sys.argv[3]
assert s.count(o)==1, ('count', s.count(o)); p.write_text(s.replace(o,n))" "$file" "$old" "$new" || { echo "$name APPLY-FAILED" >> $OUT/summary.txt; return; }
  npx vitest run $T > $OUT/mut-$name.log 2>&1; rc=$?
  cp /tmp/c327-mut-backup $file
  echo "$name rc=$rc $(sed 's/\x1b\[[0-9;]*m//g' $OUT/mut-$name.log | grep -E '^\s+Tests ' | tr -s ' ') failed:$(sed 's/\x1b\[[0-9;]*m//g' $OUT/mut-$name.log | grep -oE '× (DP|SP)[0-9a-z]+' | sort -u | tr '\n' ' ')" >> $OUT/summary.txt
}
: > $OUT/summary.txt
mut MU-FADE-PROVIDER app/components/arrangement/ArrangementClip.tsx "      previewGeometry(next);
      const faded" "      previewArrangement(next);
      const faded"
mut MU-NO-FLUSH app/contexts/ArrangementContext.tsx "      flushStatusPreview();
      dispatchStatus(update);" "      dispatchStatus(update);"
mut C-MU-FOOTER-IGNORES-PREVIEW app/components/arrangement/StudioWorkspace.tsx "<span key={statusPreviewKey(preview)}>{preview.text}</span>" "<span key={statusPreviewKey(preview)}>{status}</span>"
mut C-MU-STORE-NO-DEDUPE app/lib/arrangement/status-preview-store.ts "        state.preview?.text === text" "        false"
npx vitest run $T > $OUT/restored.log 2>&1; echo "restored rc=$? $(sed 's/\x1b\[[0-9;]*m//g' $OUT/restored.log | grep -E '^\s+Tests ' | tr -s ' ')" >> $OUT/summary.txt
diff -r -q $S/app /home/runner/czaba-project/store/app >> $OUT/summary.txt && echo "scratch app == store app" >> $OUT/summary.txt
