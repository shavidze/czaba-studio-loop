#!/usr/bin/env bash
# usage: run-mutant.sh <scratch> <name> <file-rel> <python-old> <python-new>
set -u
S=$1; N=$2; F=$3; OLD=$4; NEW=$5
OUT=/home/runner/czaba-project/tmp/studio-real-loop/b-round-299/mutants/mutant-$N.log
cp "$S/$F" /tmp/b300-mut-snap
python3 - "$S/$F" "$OLD" "$NEW" <<'PY'
import sys
p,old,new=sys.argv[1:4]
s=open(p).read()
assert s.count(old)==1,('count',s.count(old))
open(p,'w').write(s.replace(old,new))
PY
(cd "$S" && timeout 600 npx vitest run app/lib/arrangement/__tests__/studio-link-view-in-store-ui.test.tsx > "$OUT" 2>&1)
cp /tmp/b300-mut-snap "$S/$F"
cmp -s /tmp/b300-mut-snap "$S/$F" && echo "restore cmp-equal" >> "$OUT"
echo "== $N: $(grep -E 'Tests ' "$OUT" | sed 's/\x1b\[[0-9;]*m//g')"
grep -E '^\s+(×|✗)|FAIL .*>' "$OUT" | sed 's/\x1b\[[0-9;]*m//g' | sed 's/^ *//' | cut -c1-110 | sort -u | head -12
