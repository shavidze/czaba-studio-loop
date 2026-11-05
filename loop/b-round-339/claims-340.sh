#!/usr/bin/env bash
# Round 340 claims (L29 + L56). Run from the loop root. CLAIMS_STORE may point at another tree (e.g. B's scratch).
L=$(pwd); S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
CLIP=$S/app/components/arrangement/ArrangementClip.tsx
WS=$S/app/components/arrangement/StudioWorkspace.tsx
CTX=$S/app/contexts/ArrangementContext.tsx
BUD=$S/perf/budgets.interactions.json
DP=$S/app/lib/arrangement/__tests__/drag-preview-render.test.tsx
GS=$S/app/lib/arrangement/__tests__/grid-snap-ui.test.tsx
D232=$S/docs/implementation/2026/quarter-IV/232-perf-drag-preview.md
R=b-round-339
echo "K1 $(python3 -I -c "import json;a=json.load(open('gates/gate-round-339.json'));print(a['status'],a['commit'][:7])")"
echo "K2 $(git -C $S rev-parse --short HEAD 2>/dev/null || echo no-git) $(git -C $S status --short --untracked-files=all 2>/dev/null | wc -l)"
echo "K3 $(grep -c -F 'previewArrangement(gesture.before);' $CLIP) $(grep -c -F '        previewArrangement(next);' $CLIP) $(grep -c -F 'const previewGroup = gesture.group.hasVideo ? previewArrangement : previewGeometry;' $CLIP) $(grep -c -F 'previewGroup(' $CLIP) $(grep -c -F 'function groupHasVideoClip(' $CLIP) $(grep -c -F 'setStatus(GROUP_MOVE_BLOCKED_MESSAGE);' $CLIP)"
echo "K4 $(grep -c -F 'overviews.set(row.id, trackGroupOverviewClips(arrangement, row.id));' $WS) $(grep -c -F 'overviewGroupId' $WS) $(grep -c -F 'function sameTrackGroupOverviewClips(' $WS) $(grep -c -F 'trackGroupOverviewClips(state.preview, overviewGroupId)' $WS)"
echo "K5 $(grep -c -F 'if (next === publishedHistoryRef.current.present) {' $CTX) $(grep -c -F 'previewStore.getState().clearPreview();' $CTX) $(grep -c -F 'const selectAllClips = useCallback(() => {' $CTX)"
echo "K6 $(python3 -I -c "
import json,sys
rows=json.load(open(sys.argv[1]))
grp=[r for r in rows if r['id'].startswith('interact.drag.group.') or r['id'].startswith('interact.harness.drag-group-live')]
c4=[r for r in rows if r.get('owner')=='PERF-DRAG-PREVIEW-c4-ii']
print(len(rows), len(grp), sum(1 for r in grp if r.get('mode')=='assert'), sum(1 for r in rows if r.get('mode')=='assert'), len(c4), sorted(set(json.dumps(r.get('budget'),sort_keys=True) for r in c4)))" $BUD)"
echo "K7 $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K8 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K9 $(grep -cE "it\('DP5[1-6] " $DP) $(grep -c -F 'function shownClipOf(' $GS) $(grep -c -F "expect(clipOf(api, 's1').start).toBe(4.3);" $GS)"
echo "K10 $(sed -n 4p $D232 | grep -oE 'stage c[0-9a-z-]+ of' | head -1) $(grep -c '^## ' $D232) $(grep -c '^### ეტაპი c4-ii' $D232)"
echo "K11 $(git -C $S diff --stat HEAD -- perf/studio-lab-interactions.perf.spec.ts perf/lib app/contexts 2>/dev/null | wc -l)"
echo "K12 $(for f in tasks/round-339.md c-round-339.json c-round-339.md a-round-339.md gates/gate-round-339.json b-round-318/protected-sha256.txt b-round-329/perf-rowcmp.py b-round-334/vitest.perf-lib.config.mjs c-round-339/perf-results/latest-interactions.json c-round-339/group-rows.txt c-round-339/g339-auth.cjs b-round-338/group-probe.mjs $R/sketch/source.patch.txt $R/sketch/tests.patch.txt $R/sketch/budgets.patch.txt $R/sketch-typecheck.log $R/perf-sketch.log $R/perf-sketch-results/latest-interactions.json $R/perf-rowcmp-sketch-vs-c339.txt $R/perf-sketch-assert.log $R/perf-sketch-assert-results/latest-interactions.json $R/perf-sketch-final.log $R/perf-sketch-final-results/latest-interactions.json $R/perf-rowcmp-sketch-final-vs-c339.txt $R/perf-mutant-head-source.log $R/perf-mutant-head-source/latest-interactions.json $R/sketch-targeted-vitest-final.log $R/sketch-unit-mutants.md $R/unit-head-new-tests.log $R/unit-mut-ws.log $R/unit-mut-video.log $R/overview-probe.mjs $R/probe/head-1440.json $R/probe/head-1280.json $R/probe/sketch-1440.json $R/probe/sketch-1280.json $R/sketch-review.md b-round-338/probe/head-1440.json b-round-338/probe/head-1280.json; do test -f $f || echo MISSING:$f; done; echo checked)"
