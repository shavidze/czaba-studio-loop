#!/usr/bin/env bash
# usage: TREE=<abs tree with the c2b change> OUT=<abs out dir> bash run-mutants-379.sh
set -u
: "${TREE:?}"; : "${OUT:?}"
mkdir -p "$OUT"
MR=app/components/arrangement/ArrangementMarkerRow.tsx
W=app/components/arrangement/StudioWorkspace.tsx
T=app/lib/arrangement/__tests__/render-budget.test.tsx
cd "$TREE" || exit 2
cp -p "$MR" "$OUT/MarkerRow.orig"
cp -p "$W" "$OUT/StudioWorkspace.orig"
run() {
  id=$1
  timeout 600 npx vitest run "$T" -t "RB-LEAF" > "$OUT/mutant-$id.full.log" 2>&1
  echo "rc $?" >> "$OUT/mutant-$id.full.log"
  sed 's/\x1b\[[0-9;]*m//g' "$OUT/mutant-$id.full.log" | grep -E "×|✗|FAIL|Tests |rc " > "$OUT/mutant-$id.log"
  cp -p "$OUT/MarkerRow.orig" "$MR"
  cp -p "$OUT/StudioWorkspace.orig" "$W"
  echo "== $id"; cat "$OUT/mutant-$id.log"
}
python3 -I - "$MR" <<'P'
import sys;p=sys.argv[1];s=open(p).read()
o='export const ArrangementMarkerRowView = memo(ArrangementMarkerRowViewInner);'
assert s.count(o)==1;s=s.replace(o,'export const ArrangementMarkerRowView = ArrangementMarkerRowViewInner;\nvoid memo;');open(p,'w').write(s)
P
run MU-MR-NO-MEMO
python3 -I - "$MR" <<'P'
import re,sys;p=sys.argv[1];s=open(p).read()
m=re.search(r"  return useMemo\(\n    \(\) => \((\{.*?\})\),\n    \[[^\]]*\],\n  \);\n",s,re.S)
assert m and s.count('return useMemo(')==1
s=s[:m.start()]+'  return '+m.group(1)+';\n'+s[m.end():]
open(p,'w').write(s)
P
run MU-MR-ACTIONS-FRESH
python3 -I - "$W" <<'P'
import sys;p=sys.argv[1];s=open(p).read()
o='markers={arrangementMarkers(arrangement)}'
assert s.count(o)==1;open(p,'w').write(s.replace(o,'markers={[...arrangementMarkers(arrangement)]}'))
P
run MU-MR-MARKERS-FRESH
# MU-MR-HEAD-REVERT: both source files at the round-379 baseline (3ae2885), test file keeps RB-LEAF6
git -C /home/runner/czaba-project/store show 3ae2885:"$MR" > "$MR"
git -C /home/runner/czaba-project/store show 3ae2885:"$W" > "$W"
run MU-MR-HEAD-REVERT
cmp "$OUT/MarkerRow.orig" "$MR" && cmp "$OUT/StudioWorkspace.orig" "$W" && echo restored
