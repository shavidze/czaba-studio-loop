#!/usr/bin/env bash
# usage: TREE=<cp -a copy of A's tree (a git work tree)> OUT=<abs dir> run-mutant.sh <id> <file> <old> <new>
# B ran it with TREE=b-round-373/scratch (the sketch copy). Run mutants one at a time; never with a perf run.
# The file is restored from a backup copy (not git checkout: the tree's changes are uncommitted).
set -u
id=$1; f=$2; old=$3; new=$4
L=$(cd "$(dirname "$0")/.." && pwd)
OUT=${OUT:-$L/mutants}
cd "${TREE:-$L/scratch}" || exit 2
BK=$(mktemp) && cp -p "$f" "$BK" || exit 3
python3 -I - "$f" "$old" "$new" <<'PY'
import sys
p,o,n=sys.argv[1:4]
s=open(p).read(); assert s.count(o)==1,(p,s.count(o)); open(p,'w').write(s.replace(o,n))
PY
if [ $? -ne 0 ]; then echo "MUTANT-NOT-APPLIED rc 4" > "$OUT/mutant-$id.log"; rm -f "$BK"; exit 4; fi
xargs -a "$L/covering-374.txt" timeout 1500 npx vitest run > "$OUT/mutant-$id.log" 2>&1
echo "rc $?" >> "$OUT/mutant-$id.log"
cp -p "$BK" "$f" && rm -f "$BK"
sed 's/\x1b\[[0-9;]*m//g' "$OUT/mutant-$id.log" | grep -E "^ FAIL|Tests  " | sort -u | head -40
