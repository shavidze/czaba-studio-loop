#!/usr/bin/env bash
# A round 289 mutants M1-M5, run on a scratch copy of the live tree.
set -u
LIVE=/home/runner/czaba-project/store
S=/tmp/a289scratch
OUT=$(cd "$(dirname "$0")" && pwd)
FILES="app/data/studio-lab-demo.ts app/components/arrangement/ArrangementLibrary.tsx app/lib/arrangement/__tests__/strings.test.ts app/data/__tests__/studio-lab-demo.test.ts app/lib/arrangement/__tests__/library-group-heading-ui.test.tsx"
(cd $LIVE && sha256sum $FILES) > "$OUT/live-sha-before.txt"
rm -rf $S && mkdir -p $S
rsync -a --exclude node_modules --exclude .git --exclude build $LIVE/ $S/
ln -s $LIVE/node_modules $S/node_modules
LIB=app/components/arrangement/ArrangementLibrary.tsx
DEMO=app/data/studio-lab-demo.ts
LG=app/lib/arrangement/__tests__/library-group-heading-ui.test.tsx
DL=app/data/__tests__/studio-lab-demo.test.ts
run() { # name file test
  name=$1; shift
  (cd $S && npx vitest run "$@" 2>&1 | sed 's/\x1b\[[0-9;]*m//g') > "$OUT/$name.log"
  echo "== $name"; grep -E '^\s+(×|✓) (LG|DL-EN)' "$OUT/$name.log" | sed 's/ [0-9]*ms$//' | cut -c1-60; grep -E 'Tests ' "$OUT/$name.log"
}
reset() { cp $LIVE/$LIB $S/$LIB; cp $LIVE/$DEMO $S/$DEMO; }
python3 "$OUT/mutate.py" M1 $S/$LIB; run M1 $LG; reset
python3 "$OUT/mutate.py" M2 $S/$LIB; run M2 $LG; reset
python3 "$OUT/mutate.py" M3 $S/$LIB; run M3 $LG; reset
python3 "$OUT/mutate.py" M4 $S/$LIB; run M4 $LG; reset
python3 "$OUT/mutate.py" M5 $S/$DEMO; run M5 $DL; reset
(cd $LIVE && sha256sum $FILES) > "$OUT/live-sha-after.txt"
diff "$OUT/live-sha-before.txt" "$OUT/live-sha-after.txt" && echo LIVE-UNCHANGED
