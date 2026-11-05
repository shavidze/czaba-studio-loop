#!/usr/bin/env bash
# Round 347 claims: PERF-DRAG-PREVIEW c6-ii (MixFader + DetailClipGain memo, stable handlers) (L29 + L56). Run from the loop root.
# CLAIMS_STORE may point at another tree (e.g. B's scratch /home/runner/b346-scratch/sc; K8 shows 10 there, vite.config.ts differs).
L=$(pwd); S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
MF=$S/app/components/arrangement/ArrangementMixFader.tsx
LANE=$S/app/components/arrangement/ArrangementLane.tsx
DET=$S/app/components/arrangement/ArrangementDetailPanel.tsx
HOOK=$S/app/hooks/useStableHandler.ts
HOOKT=$S/app/hooks/__tests__/useStableHandler.test.ts
TEST=$S/app/lib/arrangement/__tests__/drag-preview-render.test.tsx
BUD=$S/perf/budgets.interactions.json
D232=$S/docs/implementation/2026/quarter-IV/232-perf-drag-preview.md
c() { local n; n=$(grep -c -- "$1" "$2" 2>/dev/null); echo "${n:-0}"; }
echo "K1 $(python3 -I -c "import json;a=json.load(open('gates/gate-round-346.json'));print(a['status'],a['commit'][:7])")"
echo "K2 $(git -C $S rev-parse --short HEAD 2>/dev/null || echo no-git) $(git -C $S status --short --untracked-files=all 2>/dev/null | wc -l)"
echo "K3 mixfader memo $(c '^const ArrangementMixFader = memo(ArrangementMixFaderInner);' $MF) inner-displayName $(c "^ArrangementMixFaderInner.displayName = 'ArrangementMixFader';" $MF) plain-forwardRef-export $(c '^const ArrangementMixFader = forwardRef' $MF)"
echo "K4 lane useStableHandler( $(c 'useStableHandler(' $LANE) renderPanReadout-useCallback $(c 'const renderPanReadout = useCallback(' $LANE) inline-pan-dblclick $(c 'onDoubleClick={() => setTrackPan(track.id, 0)}' $LANE) inline-volume-pointerup $(c 'onPointerUp={() => commitTrackVolume(track.id)}' $LANE) inline-volume-blur $(c 'onBlur={() => blurTrackVolume(track.id)}' $LANE)"
echo "K5 detail clipgain memo $(c '^const ArrangementDetailClipGain = memo(ArrangementDetailClipGainInner);' $DET) inner-displayName $(c "^ArrangementDetailClipGainInner.displayName = 'ArrangementDetailClipGain';" $DET) useStableHandler( $(c 'useStableHandler(' $DET) stored-prop $(c 'storedClipGainsDb={storedClipGainsDb}' $DET) inline-array $(c 'storedClipGainsDb={clipGainGroup ? clipGainGroup.clipGainsDb : \[clipGainDb ?? 0\]}' $DET) inline-field-change $(c 'onFieldChange={(event) =>' $DET) inline-reset-click $(c 'onResetClick={(event) =>' $DET)"
echo "K6 hook $( [ -f $HOOK ] && echo present || echo absent ) export $(c '^export function useStableHandler<' $HOOK) test $( [ -f $HOOKT ] && echo present || echo absent ) SH-it $(c "it('SH" $HOOKT)"
echo "K7 test DP it( $(c "it('DP" $TEST) DP64 $(c "it('DP64" $TEST) DP65 $(c "it('DP65" $TEST) tick-loop $(c 'for (let tick = 0; tick < 5; tick++)' $TEST) waitFor $(c 'waitFor(' $TEST)"
echo "K8 $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K9 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K10 diff-lines-outside-7 $(git -C $S diff --stat HEAD -- app perf e2e docs 2>/dev/null | grep -v 'ArrangementMixFader.tsx\|ArrangementLane.tsx\|ArrangementDetailPanel.tsx\|drag-preview-render.test.tsx\|232-perf-drag-preview.md\|files changed\|file changed' | wc -l) untracked $(git -C $S status --short --untracked-files=all 2>/dev/null | grep '^??' | grep -v 'useStableHandler' | wc -l)"
echo "K11 doc232 h2 $(c '^## ' $D232) c6-ii-section $(c '^### ეტაპი c6-ii' $D232) pending-346 $(c 'C round 346 pending' $D232)"
echo "K12 budgets $(python3 -I -c "
import json
d=json.load(open('$BUD'))
print(len(d), sum(r['mode']=='assert' for r in d))
")"
