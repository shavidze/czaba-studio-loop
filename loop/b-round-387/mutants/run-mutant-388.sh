#!/usr/bin/env bash
# usage: TREE=<abs copy of store> OUT=<abs dir> bash run-mutant-388.sh
# MU-388-TICK-NO-GUARD: removes the isPlayingRef guard after pumpPlaybackAudio() in tick; SF11 must turn red. Run on a copy only.
set -u
: "${TREE:?}"; : "${OUT:?}"
mkdir -p "$OUT"
F="$TREE/app/contexts/ArrangementContext.tsx"
cp "$F" "$OUT/ArrangementContext.tsx.orig"
python3 -I - "$F" <<'PY'
import sys
p=sys.argv[1]; s=open(p).read()
g="""    pumpPlaybackAudio();
    if (!isPlayingRef.current) {
      frameRef.current = null;
      return;
    }
    sampleMasterMeter();"""
if s.count(g)!=1:
    print("MUTANT-NOT-APPLIED"); sys.exit(2)
open(p,'w').write(s.replace(g,"""    pumpPlaybackAudio();
    sampleMasterMeter();"""))
print("MUTANT-APPLIED MU-388-TICK-NO-GUARD")
PY
rc=$?
if [ $rc -eq 0 ]; then
  (cd "$TREE" && timeout 300 npx vitest run app/lib/arrangement/__tests__/schedule-failure-ui.test.tsx -t 'SF11' > "$OUT/MU-388-TICK-NO-GUARD.log" 2>&1); echo "vitest rc $?" | tee -a "$OUT/MU-388-TICK-NO-GUARD.log"
  grep -E "×|✓" "$OUT/MU-388-TICK-NO-GUARD.log" | sed 's/\x1b\[[0-9;]*m//g' | head
fi
cp "$OUT/ArrangementContext.tsx.orig" "$F"
cmp -s "$OUT/ArrangementContext.tsx.orig" "$F" && echo restored
