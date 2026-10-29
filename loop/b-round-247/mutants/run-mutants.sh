#!/usr/bin/env bash
# usage: run-mutants.sh <fixed-scratch> <logdir>; copies each file back after each run
set -u
S="$1"; mkdir -p "$2"; L="$(cd "$2" && pwd)"
HERE="$(cd "$(dirname "$0")" && pwd)"
TESTS="app/lib/arrangement/__tests__/grid-snap-ui.test.tsx app/lib/arrangement/__tests__/grid-snap-position.test.tsx app/lib/arrangement/__tests__/strings.test.ts app/lib/arrangement/__tests__/grid-musical.test.ts app/lib/arrangement/__tests__/grid-musical-ui.test.tsx"
SW=app/components/arrangement/StudioWorkspace.tsx; LN=app/components/arrangement/ArrangementLane.tsx
cp "$S/$SW" /tmp/b248-mut-SW.bak; cp "$S/$LN" /tmp/b248-mut-LN.bak
run() { (cd "$S" && timeout 900 npx vitest run $TESTS > "$L/$1.log" 2>&1); red=$(sed 's/\x1b\[[0-9;]*m//g' "$L/$1.log" | grep -oE '^ FAIL .* > ([A-Z]+[0-9]+[a-z]?)' | grep -oE '[A-Z]+[0-9]+[a-z]?$' | sort -u | tr '\n' ' '); echo "$1: ${red:-none}" | tee -a "$L/summary.txt"; }
: > "$L/summary.txt"
run FIX-CONTROL
for m in MU-ACTIVE-IGNORES-LINES MU-ALT-ENABLES-HIDDEN MU-LANE-FORWARDS-DRAW-GRID MU-SEEK-REF-IGNORES-LINES MU-NUDGE-HIDDEN MU-NO-NOTE MU-TITLE-NOT-PAUSED MU-PAUSED-ATTR; do
  python3 -I "$HERE/mutate.py" "$S" "$m" || { echo "$m: APPLY FAILED" | tee -a "$L/summary.txt"; continue; }
  run "$m"
  cp /tmp/b248-mut-SW.bak "$S/$SW"; cp /tmp/b248-mut-LN.bak "$S/$LN"
done
