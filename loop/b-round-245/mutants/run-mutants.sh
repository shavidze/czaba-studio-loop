#!/usr/bin/env bash
# Round-246 red proofs. Run inside a SCRATCH copy (git archive of the fixed tree, node_modules symlinked), never in store/.
# usage: bash run-mutants.sh <scratch-root> <log-dir>
set -u
cd "$1"; OUT="$2"; mkdir -p "$OUT"
F=app/components/arrangement/ArrangementMarkerRow.tsx; T=app/lib/arrangement/__tests__/markers-ui.test.tsx
cp "$F" /tmp/r246-fix.tsx
red(){ sed 's/\x1b\[[0-9;]*m//g' "$1" | grep -E '^ FAIL ' | grep -oE 'MU[0-9]+[a-z]?' | sort -u | tr '\n' ' '; sed 's/\x1b\[[0-9;]*m//g' "$1" | grep -E '^\s+Tests '; }
run(){ npx vitest run "$T" > "$OUT/$1.log" 2>&1; echo "$1: $(red "$OUT/$1.log")"; cp /tmp/r246-fix.tsx "$F"; }
sub(){ python3 -I -c "import sys;p,a,b=sys.argv[1:];s=open(p).read();assert s.count(a)==1,a;open(p,'w').write(s.replace(a,b))" "$F" "$1" "$2"; }
run FIX-CONTROL
sub 'return after ?? before ?? MARKER_ADD_FOCUS;' 'return MARKER_ADD_FOCUS;'; run MU-ALWAYS-ADD
sub 'return after ?? before ?? MARKER_ADD_FOCUS;' 'return before ?? after ?? MARKER_ADD_FOCUS;'; run MU-PREVIOUS-FIRST
sub 'if (detachedNode !== undefined && detachedNode === document.activeElement) {' 'if (detachedNode !== undefined) {'; run MU-STEAL
sub 'if (detached === null || markers.some((marker) => marker.id === detached.markerId)) {' 'if (detached === null) {'; run MU-NO-ID-CHECK
sub 'const after = detached.order.slice(index + 1).find((id) => remaining.has(id));' 'const after = detached.order[index + 1];'; run MU-NEXT-NOT-SURVIVOR
python3 -I - "$F" <<'PY'
import sys
p=sys.argv[1]; s=open(p).read()
old='''    const detached = detachedFocusRef.current;
    detachedFocusRef.current = null;
    if (detached === null || markers.some((marker) => marker.id === detached.markerId)) {
      return;
    }'''
new='''    const previous = previousOrderRef.current;
    previousOrderRef.current = markers.map((marker) => marker.id);
    const missing = previous.find((id) => !markers.some((marker) => marker.id === id));
    if (missing === undefined || document.activeElement !== document.body) {
      return;
    }
    const detached = { markerId: missing, order: previous };'''
assert s.count(old)==1
s=s.replace(old,new).replace('  const detachedFocusRef = useRef<','  const previousOrderRef = useRef<readonly string[]>([]);\n  const detachedFocusRef = useRef<',1)
open(p,'w').write(s)
PY
run MU-BODY-BASED
git -C . show HEAD:"$F" > /dev/null 2>&1 && echo "(MU-HEAD: replace $F with the e9fb805 version and run the same test file)"
cmp -s /tmp/r246-fix.tsx "$F" && echo restored
