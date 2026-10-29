#!/usr/bin/env bash
# usage: run-mutants.sh <fixed-scratch-copy> <logdir>  (scratch outside store/; the store repo is never edited)
set -u
SCR="$1"; LOG="$2"; HERE="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$LOG"; LOG="$(cd "$LOG" && pwd)"
W=app/components/arrangement/StudioWorkspace.tsx; G=app/components/arrangement/ArrangementGroupHeader.tsx
cp "$SCR/$W" "$LOG/ws.fixed"; cp "$SCR/$G" "$LOG/gh.fixed"
for M in FIX-CONTROL MU-PREVIOUS-FIRST MU-NO-CONTAINS MU-NAME-ONLY MU-VISIBLE-ORDER MU-RENDER-ORDER MU-PRECEDENCE-INVERTED MU-BODY-BASED; do
  cp "$LOG/ws.fixed" "$SCR/$W"; cp "$LOG/gh.fixed" "$SCR/$G"
  python3 -I "$HERE/mutate.py" "$SCR" "$M" || { echo "$M apply failed"; continue; }
  (cd "$SCR" && timeout 600 npx vitest run app/lib/arrangement/__tests__/track-group-collapse-ui.test.tsx > "$LOG/$M.log" 2>&1)
  RED=$(grep -oE "(×|FAIL).*(GF[0-9]+|UC[0-9]+[a-z]?|LGH[0-9]+)" "$LOG/$M.log" | grep -oE "GF[0-9]+|UC[0-9]+[a-z]?|LGH[0-9]+" | sort -u | tr '\n' ' ')
  echo "$M: ${RED:-none} | $(grep -E 'Tests ' "$LOG/$M.log" | sed 's/\x1b\[[0-9;]*m//g' | tr -s ' ')"
done
cp "$LOG/ws.fixed" "$SCR/$W"; cp "$LOG/gh.fixed" "$SCR/$G"
