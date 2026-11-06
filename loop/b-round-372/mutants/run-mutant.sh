#!/usr/bin/env bash
# usage: TREE=<copy of A's tree> run-mutant.sh <id> <file> <old> <new>
# Run from the loop root's b-round-372/ (B) or set OUT=<dir> (C). TREE must be a git work tree (cp -a of store/).
# B ran it with TREE=scratch (the sketch copy, removed after planning).
set -u
id=$1; f=$2; old=$3; new=$4
L=$(cd "$(dirname "$0")/.." && pwd)
OUT=${OUT:-$L/mutants}
cd "${TREE:-scratch}"
python3 -I - "$f" "$old" "$new" <<'PY'
import sys
p,o,n=sys.argv[1:4]
s=open(p).read(); assert s.count(o)==1,(p,s.count(o)); open(p,'w').write(s.replace(o,n))
PY
xargs -a "$L/covering-373.txt" timeout 1500 npx vitest run > "$OUT/mutant-$id.log" 2>&1
echo "rc $?" >> "$OUT/mutant-$id.log"
git checkout -q -- "$f"
sed 's/\x1b\[[0-9;]*m//g' "$OUT/mutant-$id.log" | grep -E "^ FAIL|Tests  " | sort -u | head -40
