#!/usr/bin/env bash
# B round 451 copy (sketch v5). usage: SRC=<repo at the sketch commit> OUT=<dir> [IDS="id ..."] bash run-mutants.sh
# Each mutant (table in mutants.py) edits a fresh checkout of a shared clone of $SRC, runs the two scan suites, logs the red rows.
set -u
: "${SRC:?}"; : "${OUT:?}"
HERE=$(cd "$(dirname "$0")" && pwd)
M=/tmp/b452-mut-$$
mkdir -p "$OUT"
rm -rf "$M"; git clone -q --shared "$SRC" "$M" && ln -s /home/runner/czaba-project/store/node_modules "$M/node_modules" || exit 1
IDS=${IDS:-$(python3 -I "$HERE/mutants.py" --list)}
: > "$OUT/mutants.txt"
for id in $IDS; do
  (cd "$M" && git checkout -q -- . && python3 -I "$HERE/mutants.py" "$id") >/dev/null 2>&1 || { echo "$id EDIT-FAILED" | tee -a "$OUT/mutants.txt"; continue; }
  (cd "$M" && npx vitest run app/lib/__tests__/store-gradient-text.test.ts app/lib/__tests__/store-teal-sweep.test.ts > "$OUT/mutant-$id.log" 2>&1)
  red=$(sed 's/\x1b\[[0-9;]*m//g' "$OUT/mutant-$id.log" | grep -aoE '(×|FAIL) .*> (GT[0-9]+b?|TS[0-9]+):' | grep -oE '(GT[0-9]+b?|TS[0-9]+):' | tr -d ':' | sort -u | tr '\n' ' ')
  echo "$id red: ${red:-none}" | tee -a "$OUT/mutants.txt"
done
rm -rf "$M"
