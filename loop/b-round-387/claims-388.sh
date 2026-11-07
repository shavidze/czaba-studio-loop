#!/usr/bin/env bash
# usage: bash b-round-387/claims-388.sh [store-root]   (run from the loop root)
HERE="$(cd "$(dirname "$0")" && pwd)"
S="${1:-/home/runner/czaba-project/store}"
S="$(cd "$S" && pwd)" || exit 1
[ -n "$S" ] || exit 1
C=app/contexts/ArrangementContext.tsx
T=app/lib/arrangement/__tests__/schedule-failure-ui.test.tsx
D=docs/implementation/2026/quarter-IV/250-schedule-failure-rollback.md
cd "$S" || exit 1
echo "K1 HEAD: $(git rev-parse --short HEAD 2>/dev/null || echo n/a)"
echo "K2 status lines: $(git status --short --untracked-files=all 2>/dev/null | wc -l)"
echo "K3 tick guard after pump: $(grep -A1 '^    pumpPlaybackAudio();$' $C | grep -c 'if (!isPlayingRef.current) {')"
echo "K4 SF11 rows: $(grep -c "it('SF11:" $T); SF rows total: $(grep -cE "it\('SF[0-9]+:" $T)"
echo "K5 sketch sha: $(sha256sum $HERE/sketch-388.patch.txt | cut -c1-16) (expect 494afafcf79a8aa0)"
for f in $C $T; do cmp -s "$f" "$HERE/sketch-files/$f" && echo "K7 PATCH-EQUAL $f same" || echo "K7 PATCH-EQUAL $f DIFFERS"; done
sha256sum -c --quiet "$HERE/r388-frozen-sha256.txt" >/dev/null 2>&1; echo "K8 frozen manifest (1281) rc $?"
sha256sum -c --quiet "$HERE/../b-round-318/protected-sha256.txt" >/dev/null 2>&1; echo "K9 protected manifest rc $?"
echo "K10 doc 250 l.4: $(sed -n 4p $D)"
echo "K11 doc 250 names C-R387-01: $(grep -c 'C-R387-01' $D); SF11: $(grep -c 'SF11' $D); MU-388-TICK-NO-GUARD: $(grep -c 'MU-388-TICK-NO-GUARD' $D)"
echo "K12 round-387 files vs 387 sketch: $(for f in app/lib/arrangement/graph.client.ts app/lib/arrangement/__tests__/apply-schedule-rollback.test.ts; do cmp -s $f $HERE/../b-round-386/sketch-files/$f && echo -n 'same ' || echo -n 'DIFF '; done)"
