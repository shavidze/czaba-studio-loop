#!/usr/bin/env bash
# usage: TREE=<abs sketch-or-copy> OUT=<abs dir> bash run-mutants-387.sh [ids...]
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
IDS="${*:-MU-387-NO-ROLLBACK-STOP MU-387-NO-RELEASE MU-387-REPLACE-ERROR MU-387-NO-ITEM-DETACH MU-387-PLAY-NO-GUARD MU-387-PLAY-NO-STOPAT MU-387-SYNC-DIRECT MU-387-SEEK-DIRECT MU-387-SCRUB-DIRECT MU-387-ENDSCRUB-DIRECT MU-387-PUMP-NO-CATCH MU-387-STATUS-SYNC MU-387-SYNC-NO-STOPAT MU-387-MICROTASK-NO-PLAYING-GUARD MU-387-CLICK-NO-DETACH}"
FILES="app/contexts/ArrangementContext.tsx app/lib/arrangement/graph.client.ts"
mkdir -p "$OUT/.orig"
for f in $FILES; do cp "$TREE/$f" "$OUT/.orig/$(basename "$f")"; done
for id in $IDS; do
  python3 -I "$HERE/mutate.py" "$TREE" "$id" > "$OUT/mutant-$id.log" 2>&1
  (cd "$TREE" && timeout 300 npx vitest run app/lib/arrangement/__tests__/apply-schedule-rollback.test.ts app/lib/arrangement/__tests__/schedule-failure-ui.test.tsx 2>&1 | sed 's/\x1b\[[0-9;]*m//g' | grep -E "^ +(✓|×)|FAIL .*>|Tests  ") >> "$OUT/mutant-$id.log"
  for f in $FILES; do cp "$OUT/.orig/$(basename "$f")" "$TREE/$f"; done
  echo "restored" >> "$OUT/mutant-$id.log"
done
rm -rf "$OUT/.orig"
