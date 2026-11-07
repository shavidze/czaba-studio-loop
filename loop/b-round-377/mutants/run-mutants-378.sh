#!/usr/bin/env bash
# usage: TREE=<abs tree with the c2a change> OUT=<abs out dir> bash run-mutants-378.sh
set -u
: "${TREE:?}"; : "${OUT:?}"
mkdir -p "$OUT"
LB=app/components/arrangement/ArrangementLoopBrace.tsx
W=app/components/arrangement/StudioWorkspace.tsx
T=app/lib/arrangement/__tests__/render-budget.test.tsx
cd "$TREE" || exit 2
cp -p "$LB" "$OUT/LoopBrace.orig"
cp -p "$W" "$OUT/StudioWorkspace.orig"
run() {
  id=$1
  timeout 600 npx vitest run "$T" -t "RB-LEAF" > "$OUT/mutant-$id.full.log" 2>&1
  echo "rc $?" >> "$OUT/mutant-$id.full.log"
  grep -E "×|✗|FAIL|Tests " "$OUT/mutant-$id.full.log" | sed 's/\x1b\[[0-9;]*m//g' > "$OUT/mutant-$id.log"
  cp -p "$OUT/LoopBrace.orig" "$LB"
  cp -p "$OUT/StudioWorkspace.orig" "$W"
  echo "== $id"; cat "$OUT/mutant-$id.log"
}
python3 -I - "$LB" <<'P'
import sys;p=sys.argv[1];s=open(p).read()
o='export const ArrangementLoopBraceView = memo(ArrangementLoopBraceViewInner);'
assert s.count(o)==1;s=s.replace(o,'export const ArrangementLoopBraceView = ArrangementLoopBraceViewInner;\nvoid memo;');open(p,'w').write(s)
P
run MU-LB-NO-MEMO
python3 -I - "$LB" <<'P'
import re,sys;p=sys.argv[1];s=open(p).read()
m=re.search(r"  return useMemo\(\n    \(\) => \((\{.*?\})\),\n    \[[^\]]*\],\n  \);\n",s,re.S)
assert m and s.count('return useMemo(')==1
s=s[:m.start()]+'  return '+m.group(1)+';\n'+s[m.end():]
open(p,'w').write(s)
P
run MU-LB-ACTIONS-FRESH
# MU-LB-SITE-REVERT: the workspace mounts the HEAD wrapper again (StudioWorkspace.tsx of 79ed8a9)
git -C /home/runner/czaba-project/store show 79ed8a9:app/components/arrangement/StudioWorkspace.tsx > "$W"
run MU-LB-SITE-REVERT
cmp "$OUT/LoopBrace.orig" "$LB" && cmp "$OUT/StudioWorkspace.orig" "$W" && echo restored
