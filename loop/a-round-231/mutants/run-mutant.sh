#!/usr/bin/env bash
# usage: run-mutant.sh NAME FILE OLD NEW TESTFILES...
set -u
cd /home/runner/czaba-project/store
name=$1; file=$2; old=$3; new=$4; shift 4
out=/home/runner/czaba-project/tmp/studio-real-loop/a-round-231/mutants
before=$(sha256sum "$file" | cut -d' ' -f1)
cp "$file" "$out/$name.orig"
python3 -I -c '
import sys,pathlib
p=pathlib.Path(sys.argv[1]); s=p.read_text(); o=sys.argv[2]; n=sys.argv[3]
c=s.count(o)
if c!=1: sys.exit(f"mutant anchor count {c}")
p.write_text(s.replace(o,n))' "$file" "$old" "$new" || { echo "$name ANCHOR-FAIL"; exit 1; }
npx vitest run "$@" > "$out/$name.log" 2>&1; rc=$?
cp "$out/$name.orig" "$file"; rm "$out/$name.orig"
after=$(sha256sum "$file" | cut -d' ' -f1)
fails=$(grep -E "^\s+(×|✗)|FAIL " "$out/$name.log" | sed 's/\x1b\[[0-9;]*m//g' | head -8)
echo "$name rc=$rc restored=$([ "$before" = "$after" ] && echo ok || echo MISMATCH)"
echo "$fails"
