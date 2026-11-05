#!/usr/bin/env bash
# Round 345 claims: PERF-DRAG-PREVIEW c5-ii (video clip preview through the store) (L29 + L56). Run from the loop root.
# CLAIMS_STORE may point at another tree (e.g. B's scratch /home/runner/b344-scratch/sc).
L=$(pwd); S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
CLIP=$S/app/components/arrangement/ArrangementClip.tsx
DOCK=$S/app/components/arrangement/ArrangementVideoDock.tsx
CTX=$S/app/contexts/ArrangementContext.tsx
TEST=$S/app/lib/arrangement/__tests__/drag-preview-render.test.tsx
BUD=$S/perf/budgets.interactions.json
REP=$S/perf/lib/report.test.ts
D232=$S/docs/implementation/2026/quarter-IV/232-perf-drag-preview.md
D168=$S/docs/implementation/2026/quarter-IV/168-perf-interactions-baseline.md
R=b-round-344
echo "K1 $(python3 -I -c "import json;a=json.load(open('gates/gate-round-344.json'));print(a['status'],a['commit'][:7])")"
echo "K2 $(git -C $S rev-parse --short HEAD 2>/dev/null || echo no-git) $(git -C $S status --short --untracked-files=all 2>/dev/null | wc -l)"
echo "K3 $(grep -c -F 'const previewGeometry = isVideo' $CLIP) $(grep -c -F 'const previewGeometry = previewClipGeometry ?? previewArrangement;' $CLIP) $(grep -c -F 'if (previewStatus && !isVideo) {' $CLIP) $(grep -c -F 'if (previewStatus) {' $CLIP) $(grep -c 'groupHasVideoClip' $CLIP) $(grep -c 'hasVideo' $CLIP) $(grep -c 'previewGroup' $CLIP) $(grep -c -F 'previewArrangement(gesture.before);' $CLIP)"
echo "K4 $(grep -c -F '}, [arrangement, isPlaying, positionStore, videoSources]);' $DOCK) $(grep -c -F '}, [videoLaneArrangement, isPlaying, positionStore, videoSources]);' $DOCK) $(grep -c -F 'resolveVideoTarget(arrangement, positionStore.getPosition())' $DOCK) $(grep -c 'useVideoLaneArrangement' $DOCK) $(grep -c -F 'arrangement={videoLaneArrangement}' $DOCK) $(grep -c -F 'const current = getArrangement();' $DOCK) $(grep -c -F 'useArrangementPreviewLaneClips' $DOCK)"
echo "K5 $(grep -c -F 'const previewClipGeometry = useCallback(' $CTX) $(grep -c -F 'historyRef.current = { ...historyRef.current, present: next };' $CTX) $(grep -c -F 'export function useArrangementPreviewLaneClips(' $CTX) $(grep -c -F 'useShallow((state) => selectPreviewLaneClips(state.preview, committed, trackId)),' $CTX)"
echo "K6 $(grep -c -F "it('DP9b a video clip move keeps the provider path'" $TEST) $(grep -c -F "it('DP13 a video fade drag keeps the provider path and the committed status'" $TEST) $(grep -c -F "it('DP53 a group with a video clip keeps the history preview, as at HEAD'" $TEST) $(for i in 57 58 59 60 61 62; do echo -n "$(grep -c "it('DP$i " $TEST)"; done) $(grep -c "^  it('DP" $TEST)"
echo "K7 $(python3 -I -c "
import json,sys
rows=json.load(open(sys.argv[1]))
vid=[r for r in rows if r['id'].startswith('interact.drag.video.') or r['id']=='interact.harness.drag-video-live']
print(len(rows), len(vid), sum(1 for r in vid if r.get('mode')=='assert'), sum(1 for r in rows if r.get('mode')=='assert'), sum(1 for r in rows if r.get('metric')=='commits-per-move'), sorted(set(r.get('owner') for r in vid)))" $BUD)"
echo "K8 $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K9 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K10 $(grep -c -F 'DC-KINDS' $REP) $(grep -c -F 'expect(drag).toHaveLength(16);' $REP)"
echo "K11 $(git -C $S diff --stat HEAD -- app perf e2e docs 2>/dev/null | grep -vE 'ArrangementClip.tsx|ArrangementVideoDock.tsx|drag-preview-render.test.tsx|budgets.interactions.json|232-perf-drag-preview.md|168-perf-interactions-baseline.md|files? changed' | wc -l)"
echo "K12 $(sed -n 4p $D232 | grep -oE 'stage c[0-9a-z-]+ of' | head -1) $(grep -c '^## ' $D232) $(grep -c '^### ეტაპი c5-ii' $D232) $(grep -c '^## ' $D168)"
echo "K13 $(python3 -I -c "
import json
p=json.load(open('c-round-344/perf-results/latest-interactions.json'))
r={x['id']:x['median'] for x in p['rows']}
print(p['complete'], len(p['failures']), len(p['rows']), r['interact.drag.video.stopped.move-components-per-move'], r['interact.drag.move.stopped.move-components-per-move'])")"
echo "K14 $(python3 -I -c "
import json
p=json.load(open('$R/perf-sketch-results/latest-interactions.json'))
r={x['id']:x for x in p['rows']}
print(p['complete'], len(p['failures']), len(p['rows']), r['interact.drag.video.stopped.move-components-per-move']['samples'], r['interact.drag.video.stopped.move-components-max']['median'], r['interact.harness.drag-video-live']['samples'], p.get('durationMs'))")"
echo "K15 $(head -1 $R/perf-rowcmp-sketch-vs-c344.txt | cut -c1-60) | $(grep -c '^EQUAL' $R/perf-rowcmp-sketch-vs-c344.txt) $(grep -c '^DIFF' $R/perf-rowcmp-sketch-vs-c344.txt) $(grep -c '^NEW' $R/perf-rowcmp-sketch-vs-c344.txt)"
echo "K16 $(for f in tasks/round-344.md c-round-344.json c-round-344.md a-round-344.md gates/gate-round-344.json b-round-318/protected-sha256.txt b-round-329/perf-rowcmp.py b-round-334/vitest.perf-lib.config.mjs c-round-344/perf-results/latest-interactions.json c-round-344/video-rows.txt b-round-343/video-probe.mjs b-round-343/probe/head-1440.json b-round-343/probe/head-1280.json $R/dock-probe.mjs $R/probe/dock-head-1440.json $R/probe/dock-head-1280.json $R/probe/dock-sketch-1440.json $R/probe/dock-sketch-1280.json $R/probe/video-sketch-1440.json $R/probe/video-sketch-1280.json $R/probe/video-sketch-summary.txt $R/sketch/apply-source.py $R/sketch/apply-tests.py $R/sketch/apply-budgets.py $R/sketch/run-unit-mutants.sh $R/sketch/source.patch.txt $R/sketch/tests.patch.txt $R/sketch/budgets.patch.txt $R/sketch/source-perf-run.patch.txt $R/sketch/source-perf-run-vs-final.diff $R/perf-sketch.log $R/perf-sketch-results/latest-interactions.json $R/perf-rowcmp-sketch-vs-c344.txt $R/budget-eval.txt $R/sketch-typecheck.log $R/sketch-biome.log $R/sketch-targeted-vitest.log $R/sketch-targeted-files.txt $R/perf-lib-sketch.log $R/unit-mut-head-source.log $R/unit-mut-dock-committed.log $R/unit-mut-dock-whole-preview.log $R/unit-mut-fade-status-committed.log; do test -f "$f" && echo -n 1 || echo -n "0($f)"; done)"
