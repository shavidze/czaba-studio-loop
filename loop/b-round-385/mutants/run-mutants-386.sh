#!/usr/bin/env bash
# usage: TREE=<abs sketch-or-copy> OUT=<abs dir> bash run-mutants-386.sh [ids...]
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
IDS="${*:-MU-386-NO-CATCH MU-386-NO-OWNER-GUARD MU-386-CLICK-STOP MU-386-LOAD-PATH-DIRECT MU-386-VIDEO-PATH-DIRECT MU-386-REPLAY-STATUS MU-386-UNSTABLE-RESYNC}"
F=app/contexts/ArrangementContext.tsx
mkdir -p "$OUT"
cp "$TREE/$F" "$OUT/.orig.tsx"
for id in $IDS; do
  python3 -I "$HERE/mutate.py" "$TREE" "$id" > "$OUT/mutant-$id.log" 2>&1
  (cd "$TREE" && timeout 300 npx vitest run app/lib/arrangement/__tests__/decoded-buffer-eviction-ui.test.tsx app/lib/arrangement/__tests__/peaks-worker-video.test.tsx 2>&1 | sed 's/\x1b\[[0-9;]*m//g' | grep -E "^ +(✓|×)|FAIL .*>|Tests  ") >> "$OUT/mutant-$id.log"
  cp "$OUT/.orig.tsx" "$TREE/$F"
  echo "restored" >> "$OUT/mutant-$id.log"
done
rm -f "$OUT/.orig.tsx"
