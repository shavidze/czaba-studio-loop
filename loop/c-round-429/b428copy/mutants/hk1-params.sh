#!/usr/bin/env bash
# Usage: bash hk1-params.sh <mutants dir>. Prints which HK1 button each MU-ADD/PREV/NEXT log turned red.
M=${1:?mutants dir}
for m in ADD PREV NEXT; do echo "MU-$m: $(grep -oE '× HK1: a repeated Enter on arrangement-marker-[a-z]+' "$M/mutant-MU-$m.log" | sort -u | tr '\n' ' ')"; done
