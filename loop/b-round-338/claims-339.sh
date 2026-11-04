#!/usr/bin/env bash
# Round 339 claims (L29 + L56). Run from the loop root. CLAIMS_STORE may point at another tree (e.g. B's scratch).
L=$(pwd); S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
CLIP=$S/app/components/arrangement/ArrangementClip.tsx
WS=$S/app/components/arrangement/StudioWorkspace.tsx
SP=$S/perf/studio-lab-interactions.perf.spec.ts
BUD=$S/perf/budgets.interactions.json
D232=$S/docs/implementation/2026/quarter-IV/232-perf-drag-preview.md
D168=$S/docs/implementation/2026/quarter-IV/168-perf-interactions-baseline.md
R=b-round-338
echo "K1 $(python3 -I -c "import json;a=json.load(open('gates/gate-round-338.json'));print(a['status'],a['commit'][:7])")"
echo "K2 $(git -C $S rev-parse --short HEAD 2>/dev/null || echo no-git) $(git -C $S status --short --untracked-files=all 2>/dev/null | wc -l)"
echo "K3 $(grep -c -F "type DragName = 'range' | 'fade' | 'trim' | 'move';" $SP) $(grep -c -F "const dragNames: DragName[] = ['range', 'fade', 'trim', 'move'];" $SP) $(grep -c -F 'const laneSegmentSteps = 10;' $SP) $(grep -c -F 'const laneSegmentPx = 40;' $SP) $(grep -c -F 'async function measureLaneDrag(' $SP) $(grep -c -F "    step = 'pause';" $SP)"
echo "K4 SWEEP $(grep -rlE 'measureGroupDrag|setupGroupClips|teardownGroupClips|drag-group-live|interact\.drag\.group' $S/app $S/perf $S/e2e 2>/dev/null | sed "s#$S/##" | sort | tr '\n' ' ')count=$(grep -rlE 'measureGroupDrag|setupGroupClips|teardownGroupClips|drag-group-live|interact\.drag\.group' $S/app $S/perf $S/e2e 2>/dev/null | wc -l)"
echo "K5 $(grep -c -F "kind === 'move' && selection.length >= 2 && selection.includes(clip.id) ? selection : null;" $CLIP) $(grep -c -F "toggleClipSelection(clip.id, isToggle ? 'toggle' : 'add');" $CLIP) $(grep -c -F 'previewArrangement(gesture.before);' $CLIP) $(grep -c -F 'const next = moveClips(gesture.before, gesture.group.ids, allowed);' $CLIP) $(grep -c -F '        previewArrangement(next);' $CLIP) $(grep -c -F 'setStatus(GROUP_MOVE_BLOCKED_MESSAGE);' $CLIP)"
echo "K6 $(grep -c -F 'overviews.set(row.id, trackGroupOverviewClips(arrangement, row.id));' $WS)"
echo "K7 $(python3 -I -c "
import json,sys
rows=json.load(open(sys.argv[1]))
lane=[r for r in rows if r['id'].startswith('interact.drag.lane.') or r['id'].startswith('interact.harness.drag-lane-live')]
grp=[r for r in rows if r['id'].startswith('interact.drag.group.') or r['id'].startswith('interact.harness.drag-group-live')]
stale=sum(r['note'].count('Record until C measures it (L58). ') for r in rows if r['id'].startswith('interact.harness.drag-lane-live'))
print(len(rows), len(lane), len(grp), sum(1 for r in grp if r.get('mode')=='assert'), sum(1 for r in rows if r.get('mode')=='assert'), stale)" $BUD)"
echo "K8 $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K9 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K10 $(python3 -I -c "
import json,sys
d=json.load(open(sys.argv[1]));rows=d['rows']
print(len(rows), d['complete'], len(d['failures']), sum(1 for r in rows if r.get('kind')!='wallclock'))" c-round-338/perf-results/latest-interactions.json)"
echo "K11 $(python3 -I -c "
import json,sys
d=json.load(open(sys.argv[1]));rows={r['id']:r for r in d['rows']}
k=['interact.drag.group.stopped.move-components-per-move','interact.drag.group.playing.move-components-per-move.6x','interact.drag.group.stopped.move-components-max','interact.drag.group.playing.move-restarts','interact.drag.group.playing.release-restarts','interact.drag.group.stopped.lane-components-per-move','interact.drag.group.stopped.cross-components-per-move','interact.harness.drag-group-live','interact.harness.drag-group-live.6x','interact.drag.lane.stopped.move-components-per-move']
print(len(rows), d['complete'], len(d['failures']), ' '.join(str(rows[i]['samples']) for i in k))" $R/perf-sketch-results/latest-interactions.json)"
echo "K12 $(grep -c '^EQUAL' $R/perf-rowcmp-sketch-vs-c338.txt) $(grep -c '^DIFF' $R/perf-rowcmp-sketch-vs-c338.txt) $(grep -c '^NEW' $R/perf-rowcmp-sketch-vs-c338.txt) $(grep -h '^asserted' $R/perf-rowcmp-sketch-vs-c338.txt)"
echo "K13 $(python3 -I -c "
import json,sys
d=json.load(open(sys.argv[1]));rows={r['id']:r for r in d['rows']}
f=d['failures']
print(len(f), rows['interact.harness.drag-group-live']['samples'], rows['interact.harness.drag-group-live.6x']['samples'], sum(1 for x in f if 'group-drag liveness (f)' in x), sum(1 for x in f if 'group-drag liveness (a)' in x), sum(1 for x in f if 'group-drag liveness (b)' in x), sum(1 for x in f if 'group-drag liveness (c)' in x), sum(1 for x in f if 'group-drag liveness (d)' in x or 'group-drag liveness (e)' in x or 'teardown' in x))" $R/perf-mutant-group-single/latest-interactions.json)"
echo "K14 $(python3 -I -c "
import json,sys
p=json.load(open(sys.argv[1]))
print([c['rendered'] for c in p['same-lane-moves']], [c['providerRendered'] for c in p['same-lane-moves']], [c['workspaceRendered'] for c in p['same-lane-moves']], [c['rendered'] for c in p['cross-lane-moves']], [c['rendered'] for c in p['blocked-moves']], [c['rendered'] for c in p['release']], p['undoTitle'])" $R/probe/head-1440.json) | 1280 $(python3 -I -c "
import json,sys
p=json.load(open(sys.argv[1]));print([c['rendered'] for c in p['same-lane-moves']], p['undoTitle'])" $R/probe/head-1280.json)"
echo "K15 $(git -C $S diff --stat HEAD -- app perf/lib 2>/dev/null | wc -l)"
echo "K16 $(grep -c -F 'pass.problems.map(' $S/perf/lib/report.ts) $(grep -c -F 'interact\.drag\.(range|fade|trim|move)\.(stopped|playing)\.commits-per-move' $S/perf/lib/report.test.ts) $(grep -c -F 'toHaveLength(16)' $S/perf/lib/report.test.ts)"
echo "K17 $(sed 's/\x1b\[[0-9;]*m//g' $R/perf-lib-report-sketch.log | grep -E '^\s+Tests ' | tr -s ' ')"
echo "K18 SWEEP $(grep -rlF 'budgets.interactions' $S/app $S/perf $S/e2e 2>/dev/null | sed "s#$S/##" | sort | tr '\n' ' ')"
echo "K19 $(sed -n 4p $D232 | grep -oE 'stage [a-z0-9-]+ of') $(grep -c '^## ' $D232) $(grep -c '^### ეტაპი c4-' $D232) $(grep -c '^## ' $D168) $(grep -c -F 'drag-group-live' $D168) $(grep -c -F 'Record until C measures it' $D168)"
echo "K20 $(grep -c -F 'if (next === publishedHistoryRef.current.present) {' $S/app/contexts/ArrangementContext.tsx) $(grep -c -F 'const previewGeometry = isVideo' $CLIP)"
echo "K21 $(for f in tasks/round-338.md c-round-338.json c-round-338.md a-round-338.md gates/gate-round-338.json gates/round-338/review.md b-round-318/protected-sha256.txt b-round-329/perf-rowcmp.py b-round-336/rowids-equal.py b-round-334/vitest.perf-lib.config.mjs c-round-338/perf-results/latest-interactions.json c-round-338/g338-auth.cjs $R/group-probe.mjs $R/probe/head-1440.json $R/probe/head-1280.json $R/probe/head-1440-collapse.json $R/apply-sketch.py $R/apply-sketch-v2.py $R/apply-sketch-v3.py $R/apply-budgets.py $R/make-mutant.py $R/back-lane-probe.mjs $R/probe/back-lane-1440-sel0.json $R/probe/back-lane-1440-sel1.json $R/biome-sketch-stdin.log $R/perf-sketch-v1.log $R/perf-sketch-v1-results/latest-interactions.json $R/perf-rowcmp-sketch-v1-vs-c338.txt $R/perf-mutant-group-single-v1.log $R/perf-mutant-group-single-v1/latest-interactions.json $R/rowids-added-sketch-vs-c338.txt $R/sketch/spec.patch.txt $R/sketch/budgets.patch.txt $R/sketch-typecheck.log $R/perf-lib-report-sketch.log $R/perf-sketch.log $R/perf-sketch-results/latest-interactions.json $R/perf-rowcmp-sketch-vs-c338.txt $R/perf-mutant-group-single.patch.txt $R/perf-mutant-group-single.log $R/perf-mutant-group-single/latest-interactions.json $R/sketch-review.md $R/claims-339-planning-output.txt $R/claims-339-sketch-output.txt; do test -f $f || echo MISSING:$f; done; echo checked)"
echo "K22 $(cat $R/rowids-added-sketch-vs-c338.txt)"
echo "K23 $(cd $S && npx biome format --stdin-file-path=app/x.perf.spec.ts < perf/studio-lab-interactions.perf.spec.ts 2>/dev/null | cmp -s - perf/studio-lab-interactions.perf.spec.ts && echo format-equal || echo format-differs)"
