#!/usr/bin/env bash
# Round 346 claims: PERF-DRAG-PREVIEW c6-i (lucide icon hoists + three round-345 Lows) (L29 + L56). Run from the loop root.
# CLAIMS_STORE may point at another tree (e.g. B's scratch /home/runner/b345-scratch/sc2).
L=$(pwd); S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
LANE=$S/app/components/arrangement/ArrangementLane.tsx
CLIP=$S/app/components/arrangement/ArrangementClip.tsx
DOCK=$S/app/components/arrangement/ArrangementVideoDock.tsx
TEST=$S/app/lib/arrangement/__tests__/drag-preview-render.test.tsx
BUD=$S/perf/budgets.interactions.json
D232=$S/docs/implementation/2026/quarter-IV/232-perf-drag-preview.md
echo "K1 $(python3 -I -c "import json;a=json.load(open('gates/gate-round-345.json'));print(a['status'],a['commit'][:7])")"
echo "K2 $(git -C $S rev-parse --short HEAD 2>/dev/null || echo no-git) $(git -C $S status --short --untracked-files=all 2>/dev/null | wc -l)"
echo "K3 lane inline <ChevronRight $(grep -c '<ChevronRight className' $LANE) <ChevronDown $(grep -c '<ChevronDown className' $LANE) <Plus $(grep -c '<Plus className' $LANE) consts $(grep -c '^const LANE_FOLD_CHEVRON_RIGHT = (\|^const LANE_FOLD_CHEVRON_DOWN = (\|^const LANE_ADD_PLUS_ICON = (' $LANE) uses-fold $(grep -c '{folded ? LANE_FOLD_CHEVRON_RIGHT : LANE_FOLD_CHEVRON_DOWN}' $LANE) uses-plus $(grep -c '{LANE_ADD_PLUS_ICON}' $LANE)"
echo "K4 clip inline <Film $(grep -c '<Film className' $CLIP) <GripVertical $(grep -c '<GripVertical className' $CLIP) consts $(grep -c '^const CLIP_HEADER_VIDEO_ICON = (\|^const CLIP_HEADER_GRIP_ICON = (' $CLIP) uses $(grep -c '{isVideo ? CLIP_HEADER_VIDEO_ICON : CLIP_HEADER_GRIP_ICON}' $CLIP)"
echo "K5 dock caption prop $(grep -c 'ArrangementVideoCaption arrangement={videoLaneArrangement}' $DOCK)"
echo "K6 test DP it( $(grep -c "it('DP" $TEST) DP62 $(grep -c "it('DP62" $TEST) DP63 $(grep -c "it('DP63" $TEST) DP64 $(grep -c "it('DP64" $TEST) componentName-function-only $(grep -c "typeof type === 'function' && 'name' in type" $TEST) video.client-mock $(grep -c "vi.mock('~/lib/arrangement/video.client'" $TEST) finally $(grep -c 'finally {' $TEST)"
echo "K7 budgets $(python3 -I -c "
import json,sys
d=json.load(open('$BUD'))
a=sum(r['mode']=='assert' for r in d)
st=[r['id'] for r in d if 'Record until c5-ii' in (r.get('note') or '') and 'round 345' not in (r.get('note') or '')]
print(len(d), a, 'stale', len(st))
")"
# K8: a scratch tree with a private Vite cacheDir shows 10 (vite.config.ts differs); the store shows 11.
echo "K8 $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K9 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K10 diff-lines-outside-5 $(git -C $S diff --stat HEAD -- app perf e2e docs 2>/dev/null | grep -v 'ArrangementLane.tsx\|ArrangementClip.tsx\|drag-preview-render.test.tsx\|budgets.interactions.json\|232-perf-drag-preview.md\|files changed\|file changed' | wc -l)"
echo "K11 doc232 h2 $(grep -c '^## ' $D232) c6-i-section $(grep -c '^### ეტაპი c6-i' $D232)"
