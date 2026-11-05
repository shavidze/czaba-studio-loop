#!/usr/bin/env bash
# Round 350 claims: PERF-CAND-VIDEO-TRIM-FADE-COST stage 1 (the video dock stops rendering per drag move). Run from the loop root.
# CLAIMS_STORE may point at another tree (B's sketch /home/runner/b349-scratch/sk; K2 reads no-git there).
L=$(pwd); S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
DOCK=$S/app/components/arrangement/ArrangementVideoDock.tsx
CTX=$S/app/contexts/ArrangementContext.tsx
DPT=$S/app/lib/arrangement/__tests__/drag-preview-render.test.tsx
BUD=$S/perf/budgets.interactions.json
CFG=$S/playwright.perf.config.ts
D232=$S/docs/implementation/2026/quarter-IV/232-perf-drag-preview.md
c() { local n; n=$(grep -c -- "$1" "$2" 2>/dev/null); echo "${n:-0}"; }
echo "K1 $(python3 -I -c "import json;a=json.load(open('gates/gate-round-349.json'));print(a['status'],a['commit'][:7])")"
echo "K2 $(git -C $S rev-parse --short HEAD 2>/dev/null || echo no-git) $(git -C $S status --short --untracked-files=all 2>/dev/null | wc -l)"
echo "K3 dock body-preview-sub $(c 'useArrangementPreviewLaneClips' $DOCK) useVideoLaneArrangement $(c 'useVideoLaneArrangement' $DOCK) videoLaneArrangement $(c 'videoLaneArrangement' $DOCK) preview-store-import $(c "useArrangementPreviewStore" $DOCK) getArrangement $(c 'getArrangement' $DOCK)"
echo "K4 ctx getArrangement-ref $(c 'const getArrangement = useCallback(() => historyRef.current.present, \[\]);' $CTX) clearPreview-calls $(c 'previewStore.getState().clearPreview();' $CTX) lane-hook-export $(c '^export function useArrangementPreviewLaneClips(' $CTX)"
echo "K5 tests DP58 $(c "it('DP58 the video gap caption follows a stopped video move from the store'" $DPT) DP59 $(c "it('DP59 the video fade overlay follows a stopped video fade drag from the store'" $DPT) DP60 $(c "it('DP60 an audio move with a video clip present renders no video dock'" $DPT) DP65 $(c "it('DP65" $DPT) DP66+ $(grep -cE "it\('DP(6[6-9]|7[0-9])" $DPT)"
echo "K6 $(python3 -I - "$BUD" <<'PY'
import json, sys
d = json.load(open(sys.argv[1]))
own = [r for r in d if r['owner'] == 'PERF-CAND-VIDEO-TRIM-FADE-ROWS']
print(len(d), 'assert', sum(r['mode'] == 'assert' for r in d), 'owned', len(own), 'owned-assert', sum(r['mode'] == 'assert' for r in own))
PY
)"
echo "K7 perf-config timeout $(c '  timeout: 15 \* 60 \* 1000,' $CFG)"
echo "K8 $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K9 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K10 diff-lines-outside-3 $(git -C $S diff --stat HEAD -- app perf e2e docs 2>/dev/null | grep -v 'ArrangementVideoDock.tsx\|drag-preview-render.test.tsx\|232-perf-drag-preview.md\|files changed\|file changed' | wc -l) untracked $(git -C $S status --short --untracked-files=all 2>/dev/null | grep -c '^??')"
echo "K11 doc232 h2 $(c '^## ' $D232) cost-section $(c '^### ეტაპი video-trim-fade-cost' $D232) pending-349 $(c 'C round 349 pending' $D232) pending-350 $(c 'C round 350 pending' $D232)"
echo "K12 lane-hook-users $(grep -rl 'useArrangementPreviewLaneClips(' $S/app --include=*.tsx 2>/dev/null | grep -v __tests__ | sed "s#$S/##" | sort | tr '\n' ' ')"
echo "K13 kept $(for f in sketch-dock.diff.txt video-names-probe.mjs video-behaviour-probe.mjs video-release-probe.mjs video-names-dev.json video-names-sketch.json video-behaviour-dev.json video-behaviour-sketch.json video-release-head.json video-release-sketch2.json video-release-sketch1-mutant.json mutant-sketch1-read-render-arrangement.tsx perf-sketch-results/latest-interactions.json sketch/dock.patch.txt video-playsync-probe.mjs; do [ -f $L/b-round-349/$f ] && echo -n 1 || echo -n 0; done)"
