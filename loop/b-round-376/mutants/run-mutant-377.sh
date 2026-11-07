#!/usr/bin/env bash
# Round 377 extra mutant MU-T-UNDO-FRESH-PER-EDIT (A-R376-REVIEW-M1). Usage, from the loop root:
#   TREE=<abs copy of A's tree> OUT=<abs out dir> bash b-round-376/mutants/run-mutant-377.sh
# Applies: undo useCallback deps gain `history` (undo changes identity on every edit), runs RB-LEAF4*, restores.
set -u
: "${TREE:?TREE required}"; : "${OUT:?OUT required}"
mkdir -p "$OUT"
F="$TREE/app/contexts/ArrangementContext.tsx"
cp "$F" "$OUT/ArrangementContext.orig.txt"
python3 -I - "$F" <<'PY' || { echo MUTANT-NOT-APPLIED; exit 4; }
import sys
p=sys.argv[1]; s=open(p).read()
old='  }, [flushPendingClipGain, flushPendingMaster, flushPendingVolume, restoreHistory, setStatus]);'
i=s.index('  const undo = useCallback(() => {'); j=s.index(old,i)
assert j-i<1500
s=s[:j]+'  }, [flushPendingClipGain, flushPendingMaster, flushPendingVolume, restoreHistory, setStatus, history]);'+s[j+len(old):]
open(p,'w').write(s)
PY
(cd "$TREE" && npx vitest run app/lib/arrangement/__tests__/render-budget.test.tsx -t "RB-LEAF4" > "$OUT/mutant-MU-T-UNDO-FRESH-PER-EDIT.full.log" 2>&1; echo "rc $?" >> "$OUT/mutant-MU-T-UNDO-FRESH-PER-EDIT.full.log")
cp "$OUT/ArrangementContext.orig.txt" "$F"
cmp -s "$F" "$OUT/ArrangementContext.orig.txt" && echo restored
sed 's/\x1b\[[0-9;]*m//g' "$OUT/mutant-MU-T-UNDO-FRESH-PER-EDIT.full.log" | grep -E '×|Tests |^rc'
