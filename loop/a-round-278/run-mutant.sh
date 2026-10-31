#!/usr/bin/env bash
# usage: run-mutant.sh NAME FILE OLD NEW TESTFILES... ; restores FILE after
set -u
L=/home/runner/czaba-project/tmp/studio-real-loop/a-round-278
cd /home/runner/czaba-project/store
name=$1; file=$2; old=$3; new=$4; shift 4
cp "$file" "$L/mutants/backup.$name"
python3 -I "$L/mutate.py" "$file" "$old" "$new" || { cp "$L/mutants/backup.$name" "$file"; exit 2; }
npx vitest run "$@" > "$L/mutants/mutant-$name.log" 2>&1; rc=$?
cp "$L/mutants/backup.$name" "$file"; rm "$L/mutants/backup.$name"
echo "mutant $name rc=$rc"; grep -E "✗|×|FAIL| failed|Tests " "$L/mutants/mutant-$name.log" | sed 's/\x1b\[[0-9;]*m//g' | head -12
