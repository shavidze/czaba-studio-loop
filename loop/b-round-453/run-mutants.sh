#!/usr/bin/env bash
# usage: SRC=<scratch repo with the round-454 change COMMITTED> OUT=<absolute dir> bash run-mutants.sh
# Applies each mutant from mutants.py on SRC, runs store-live-teal.test.ts, records the red rows, restores with git checkout/clean.
set -u
D=$(cd "$(dirname "$0")" && pwd)
: "${SRC:?}" "${OUT:?}"
mkdir -p "$OUT"; : > "$OUT/mutants.txt"
cd "$SRC" || exit 1
test -z "$(git status --porcelain)" || { echo "SRC not clean (commit the change first)"; exit 2; }
ids=$(python3 -I -c "import sys;sys.path.insert(0,'$D');import mutants;print(' '.join(['BASE']+[m[0] for m in mutants.M]))")
for id in $ids; do
  if [ "$id" = M15-NEW-CSS-FILE-TEAL ]; then mkdir -p app/styles/extra && printf '.x {\n  color: #14b8a6;\n}\n' > app/styles/extra/new.css
  elif [ "$id" != BASE ]; then python3 -I -c "
import sys;sys.path.insert(0,'$D');import mutants
m=[x for x in mutants.M if x[0]=='$id'][0];s=open(m[1]).read();pairs=m[2] if isinstance(m[2],list) else [(m[2],m[3])]
for a,b in pairs:
    assert s.count(a)==m[4],('$id',s.count(a));s=s.replace(a,b)
open(m[1],'w').write(s)" || { echo "$id APPLY-FAIL" >> "$OUT/mutants.txt"; continue; }
  fi
  npx vitest run app/lib/__tests__/store-live-teal.test.ts > "$OUT/mutant-$id.log" 2>&1
  red=$(sed 's/\x1b\[[0-9;]*m//g' "$OUT/mutant-$id.log" | grep -E '^ *FAIL ' | grep -oE 'LT[0-9]+' | sort -u | tr '\n' ' ')
  echo "$id -> ${red:-none}" >> "$OUT/mutants.txt"
  git checkout -q -- . && git clean -qfd app/styles
done
cat "$OUT/mutants.txt"
