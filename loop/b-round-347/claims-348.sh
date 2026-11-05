#!/usr/bin/env bash
# Round 348 claims: PERF-DRAG-PREVIEW conversions (trim/move/fade 1x rows -> assert; DP63/DP65 finally) (L29 + L56). Run from the loop root.
# CLAIMS_STORE may point at another tree (B's sketch /home/runner/b347-scratch/td; K2 shows no-git and K8 10 there).
L=$(pwd); S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
CLIP=$S/app/components/arrangement/ArrangementClip.tsx
MF=$S/app/components/arrangement/ArrangementMixFader.tsx
DET=$S/app/components/arrangement/ArrangementDetailPanel.tsx
CTX=$S/app/contexts/ArrangementContext.tsx
TEST=$S/app/lib/arrangement/__tests__/drag-preview-render.test.tsx
BUD=$S/perf/budgets.interactions.json
D232=$S/docs/implementation/2026/quarter-IV/232-perf-drag-preview.md
c() { local n; n=$(grep -c -- "$1" "$2" 2>/dev/null); echo "${n:-0}"; }
echo "K1 $(python3 -I -c "import json;a=json.load(open('gates/gate-round-347.json'));print(a['status'],a['commit'][:7])")"
echo "K2 $(git -C $S rev-parse --short HEAD 2>/dev/null || echo no-git) $(git -C $S status --short --untracked-files=all 2>/dev/null | wc -l)"
echo "K3 $(python3 -I - "$BUD" <<'EOF'
import json, sys
d = json.load(open(sys.argv[1]))
conv = [r for r in d if r['owner'] == 'PERF-DRAG-PREVIEW-conv']
print(len(d), sum(r['mode'] == 'assert' for r in d), 'conv', len(conv),
      ' '.join(sorted(r['id'].replace('interact.drag.', '') + '=' + r['budget']['op'] + str(r['budget']['value']) for r in conv)))
EOF
)"
echo "K4 $(python3 -I - "$BUD" <<'EOF'
import json, re, sys
d = {r['id']: r for r in json.load(open(sys.argv[1]))}
fade_rel = [d[f'interact.drag.fade.{s}.release-commits']['mode'] for s in ('stopped', 'playing')]
move_max = [d[f'interact.drag.move.{s}.move-components-max']['mode'] for s in ('stopped', 'playing')]
six = [r for i, r in d.items() if re.match(r'interact\.drag\.(trim|move|fade)\..*\.6x$', i)]
print('fade-release', *fade_rel, 'move-max', *move_max, '6x', len(six), 'assert6x', sum(r['mode'] == 'assert' for r in six))
EOF
)"
echo "K5 clip previewGeometry $(c 'const previewGeometry = previewClipGeometry ?? previewArrangement;' $CLIP) release-commit $(c 'const committed = commitArrangement(getArrangement(), label, gesture.before);' $CLIP) lucide-import $(c "^import { Film, GripVertical } from 'lucide-react';" $CLIP) flushSync $(c 'flushSync' $CLIP)"
echo "K6 mixfader memo $(c '^const ArrangementMixFader = memo(ArrangementMixFaderInner);' $MF) clipgain memo $(c '^const ArrangementDetailClipGain = memo(ArrangementDetailClipGainInner);' $DET)"
echo "K7 test DP it( $(c "it('DP" $TEST) finally $(c '} finally {' $TEST) released-flag $(c 'let released = false;' $TEST)"
echo "K8 $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K9 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K10 diff-lines-outside-3 $(git -C $S diff --stat HEAD -- app perf e2e docs 2>/dev/null | grep -v 'budgets.interactions.json\|drag-preview-render.test.tsx\|232-perf-drag-preview.md\|files changed\|file changed' | wc -l) untracked $(git -C $S status --short --untracked-files=all 2>/dev/null | grep -c '^??')"
echo "K11 doc232 h2 $(c '^## ' $D232) conversions-section $(c '^### ეტაპი conversions' $D232) pending-347 $(c 'C round 347 pending' $D232) pending-348 $(c 'C round 348 pending' $D232)"
echo "K12 setTrackPan-deps $(grep -n -A13 '^  const setTrackPan = useCallback(' $CTX | grep -c '\[applyEdit, refuseEditDuringGesture\],')"
echo "K13 kept $(for f in sketch/apply-budgets.py sketch/budgets.patch.txt sketch/apply-tests.py sketch/tests.patch.txt sketch/make-mutants.py perf-sketch-results/latest-interactions.json perf-mu-fine-clipgain-results/latest-interactions.json perf-mu-gross-preview-results/latest-interactions.json perf-mu-combo-results/latest-interactions.json; do [ -f $L/b-round-347/$f ] && echo -n 1 || echo -n 0; done)"
