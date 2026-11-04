#!/usr/bin/env bash
# Round 327 claims (L29 + L56). Run from the loop root. CLAIMS_STORE may override the store path.
L=$(pwd); S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
CTX=$S/app/contexts/ArrangementContext.tsx
CLIP=$S/app/components/arrangement/ArrangementClip.tsx
LANE=$S/app/components/arrangement/ArrangementLane.tsx
WS=$S/app/components/arrangement/StudioWorkspace.tsx
DP=$S/app/lib/arrangement/__tests__/drag-preview-render.test.tsx
BUD=$S/perf/budgets.interactions.json
D232=$S/docs/implementation/2026/quarter-IV/232-perf-drag-preview.md
D168=$S/docs/implementation/2026/quarter-IV/168-perf-interactions-baseline.md
echo "K1 $(python3 -I -c "import json;a=json.load(open('gates/gate-round-326.json'));print(a['status'],a['commit'][:7])")"
echo "K2 $(git -C $S rev-parse --short HEAD) $(git -C $S status --short --untracked-files=all | wc -l)"
echo "K3 $(grep -c -F '      previewArrangement(next);' $CLIP) $(grep -c -F 'studioClipStrings.fadePreview(' $CLIP)"
echo "K4 $(grep -c -F '<span key={statusSequence}>{status}</span>' $WS) $(grep -c -F 'const [statusEntry, setStatus] = useReducer(' $CTX)"
echo "K5 $(test -f $S/app/lib/arrangement/status-preview-store.ts && echo present || echo absent)"
echo "K6 $(grep -c -F 'previewClipGeometry={previewClipGeometry}' $LANE) $(grep -c -F 'previewStatus' $LANE)"
echo "K7 $(grep -n -F 'if (gestureCountRef.current === 0) {' $CTX | wc -l) $(grep -c -F 'rewriteStoppedTruth(statusAfterGestureRelease(current, lastNonRefusalStatusRef.current)),' $CTX)"
echo "K8 $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K9 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K10 $(grep -c 'expect(' $DP) $(grep -c -E "^\s+it\('DP" $DP)"
echo "K11 $(python3 -I -c "
import json,sys
b=json.load(open(sys.argv[1]))
print(sum(1 for r in b if r['id'].startswith('interact.drag.fade.') and r['mode']=='assert'), sum(1 for r in b if r['id'].startswith('interact.drag.') and r['mode']=='assert'))" $BUD)"
echo "K12 $(cd $S && npx biome lint --max-diagnostics=500 app/contexts/ArrangementContext.tsx 2>&1 | grep -c 'useExhaustiveDependencies')"
echo "K13 $(sed -n 4p $D232)"
echo "K14 $(for f in tasks/round-326.md b-round-326/sketch/sketch.patch.txt b-round-326/sketch/apply-sketch.py b-round-326/sketch/mutants-summary.txt b-round-326/sketch/run-mutants.sh b-round-326/sketch/run-mutants-2.sh b-round-326/precheck-full.log b-round-326/precheck-full-v3.log b-round-326/sketch/apply-sketch-getter.py b-round-326/sketch/apply-budgets.py b-round-326/sketch/head-parity-dp10-14.log b-round-326/sketch/sketch-dp-file-v3.log b-round-326/sketch/sp-unit.log b-round-326/perf-sketch.log b-round-326/perf-sketch-results/latest-interactions.json b-round-326/perf-sketch-probe-results/latest-interactions.json b-round-326/perf-mutant-results/latest-interactions.json b-round-326/perf-rowcmp.txt b-round-326/sweep-fade-files.txt b-round-326/sweep-statusseq-files.txt c-round-325/perf-interactions-atree-results/latest-interactions.json c-round-326.json gates/gate-round-326.json; do test -f $f || echo MISSING:$f; done; echo checked)"
echo "K15 $(cmp -s tasks/round-326.md b-round-326/before-current-task.md && echo archive-equal)"
echo "K16 $(cd $S && grep -rlE 'fadePreview|Fade In: |Fade Out: |fade-in-handle|fade-out-handle|data-fade-|fadeIn\b.*handle' app perf e2e --include=*.ts --include=*.tsx | grep -E '__tests__|^perf/|^e2e/' | wc -l) $(cd $S && grep -rlE 'statusSequence' app perf e2e --include=*.ts --include=*.tsx | wc -l)"
echo "K17 $(grep -c -F "it('DP9 a fade-in drag and a video clip move keep the provider path and status'" $DP) $(grep -c -E "it\('DP(9a|9b|10|11|12|13) " $DP)"
echo "K18 $(grep -c -F '**PERF-DRAG-PREVIEW-ის ეტაპ a-დან' $D168) $(grep -c -F 'ეტაპ b' $D168)"
echo "K19 $(python3 -I -c "
import json
d=json.load(open('c-round-325/perf-interactions-atree-results/latest-interactions.json'))
r={x['id']:x['samples'] for x in d['rows']}
print(r['interact.drag.fade.stopped.move-components-per-move'][0], r['interact.drag.fade.stopped.move-components-max'][0], r['interact.drag.fade.playing.move-restarts'][0], r['interact.drag.fade.stopped.release-commits'][0])")"
echo "K20 $(python3 -I -c "
import json
d=json.load(open('b-round-326/perf-sketch-results/latest-interactions.json'))
r={x['id']:x['samples'] for x in d['rows']}
print(r['interact.drag.fade.stopped.move-components-per-move'][0], r['interact.drag.fade.playing.move-components-per-move'][0], r['interact.drag.fade.stopped.move-components-max'][0], r['interact.drag.fade.playing.move-components-max'][0], r['interact.drag.fade.playing.move-restarts'][0], r['interact.drag.fade.stopped.release-commits'][0])")"
echo "K21 $(python3 -I -c "
import json
d=json.load(open('b-round-326/perf-mutant-results/latest-interactions.json'))
r={x['id']:x['samples'] for x in d['rows']}
print(r['interact.drag.fade.stopped.move-components-per-move'][0], r['interact.drag.fade.playing.move-restarts'][0])")"
echo "K22 $(grep -c ' rc=1 ' b-round-326/sketch/mutants-summary.txt) $(grep -c '^sketch rc=0\|^restored rc=0' b-round-326/sketch/mutants-summary.txt)"
echo "K23 $(sed 's/\x1b\[[0-9;]*m//g' b-round-326/precheck-full-v3.log | grep -E '^\s+Tests ' | tr -s ' ')"
echo "K24 $(grep -c -F 'getStatusPreviewText() ?? ' $S/app/components/arrangement/ArrangementMarkerRow.tsx) $(grep -c -F 'getStatusPreviewText() ?? ' $WS)"
echo "K25 $(grep -c -F 'insertMarkerStatusKind(current.status) !== null ||' $WS) $(grep -c -F "current.status !== NUDGE_AT_TIME_START_MESSAGE" $WS) $(grep -c -F 'status !== message' $S/app/components/arrangement/ArrangementMarkerRow.tsx) $(grep -c -F 'status !== MARKER_AT_TIME_START_MESSAGE' $S/app/components/arrangement/ArrangementMarkerRow.tsx)"
