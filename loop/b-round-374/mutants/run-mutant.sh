#!/usr/bin/env bash
# usage: TREE=<cp -a copy of A's tree> OUT=<abs dir> run-mutant.sh <id> <file> <old> <new> [<file2> <old2> <new2>]
# B ran it with TREE=b-round-374/scratch (the sketch copy). Run mutants one at a time; never with a perf run.
# Files are restored from backup copies (not git checkout: the tree's changes are uncommitted).
# Based on b-round-373/mutants/run-mutant.sh; adds an optional second replacement (site reverts need import + JSX).
set -u
id=$1; f=$2; old=$3; new=$4
f2=${5:-}; old2=${6:-}; new2=${7:-}
L=$(cd "$(dirname "$0")/.." && pwd)
OUT=${OUT:-$L/mutants}
cd "${TREE:-$L/scratch}" || exit 2
BK=$(mktemp) && cp -p "$f" "$BK" || exit 3
BK2=""
if [ -n "$f2" ] && [ "$f2" != "$f" ]; then BK2=$(mktemp) && cp -p "$f2" "$BK2" || exit 3; fi
apply() {
python3 -I - "$1" "$2" "$3" <<'PY'
import sys
p,o,n=sys.argv[1:4]
s=open(p).read(); assert s.count(o)==1,(p,s.count(o)); open(p,'w').write(s.replace(o,n))
PY
}
ok=0
apply "$f" "$old" "$new" || ok=1
if [ $ok -eq 0 ] && [ -n "$f2" ]; then apply "$f2" "$old2" "$new2" || ok=1; fi
if [ $ok -ne 0 ]; then
  echo "MUTANT-NOT-APPLIED rc 4" > "$OUT/mutant-$id.log"
else
  xargs -a "$L/covering-375.txt" timeout 1500 npx vitest run > "$OUT/mutant-$id.log" 2>&1
  echo "rc $?" >> "$OUT/mutant-$id.log"
fi
cp -p "$BK" "$f" && rm -f "$BK"
if [ -n "$BK2" ]; then cp -p "$BK2" "$f2" && rm -f "$BK2"; fi
sed 's/\x1b\[[0-9;]*m//g' "$OUT/mutant-$id.log" | grep -E "^ FAIL|Tests  |MUTANT-NOT-APPLIED" | sort -u | head -40
