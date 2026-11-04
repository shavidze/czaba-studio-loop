#!/usr/bin/env bash
# Round 335 claims (L29 + L56). Run from the loop root. CLAIMS_STORE may override the store path.
L=$(pwd); S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
SP=$S/perf/studio-lab-interactions.perf.spec.ts
BUD=$S/perf/budgets.interactions.json
INS=$S/perf/lib/instrumentation.ts
LANE=$S/app/components/arrangement/ArrangementLane.tsx
CTX=$S/app/contexts/ArrangementContext.tsx
CLIP=$S/app/components/arrangement/ArrangementClip.tsx
D232=$S/docs/implementation/2026/quarter-IV/232-perf-drag-preview.md
D168=$S/docs/implementation/2026/quarter-IV/168-perf-interactions-baseline.md
echo "K1 $(python3 -I -c "import json;a=json.load(open('gates/gate-round-334.json'));print(a['status'],a['commit'][:7])")"
echo "K2 $(git -C $S rev-parse --short HEAD 2>/dev/null || echo no-git) $(git -C $S status --short --untracked-files=all 2>/dev/null | wc -l)"
echo "K3 $(grep -c -F "type DragName = 'range' | 'fade' | 'trim' | 'move';" $SP) $(grep -c -F "const dragNames: DragName[] = ['range', 'fade', 'trim', 'move'];" $SP) $(grep -c -F 'const dragSteps = 60;' $SP) $(grep -c -F 'const dragDistancePx = 120;' $SP)"
echo "K4 $(grep -c -F 'async function emptyLanePointAfterClip(clip: Locator): Promise<EmptyLanePoint> {' $SP) $(grep -c -F 'async function measureDrag(' $SP) $(grep -c -F 'const inWindow = whole.commits.filter((commit) => commit.t > firstMove && commit.t < up);' $SP)"
echo "K5 $(python3 -I -c "import json,sys;print(len(json.load(open(sys.argv[1]))))" $BUD) $(grep -rn 'interact\.drag\.lane\|drag-lane-live\|measureLaneDrag' $S/perf $S/app 2>/dev/null | wc -l)"
echo "K6 $(grep -c -F 'data-testid="arrangement-lane-move-ghost"' $LANE) $(grep -c -F "data-blocked={ghost.blocked ? 'true' : 'false'}" $LANE)"
echo "K7 $(grep -c -F 'const [clipLaneDrag, setClipLaneDrag] = useState<ClipLaneDragState | null>(null);' $CTX) $(grep -c -F 'setClipLaneDrag({ ghosts, timeLocked });' $CLIP)"
echo "K8 $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K9 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K10 $(sed -n '/^export interface PerfCommitRecord {/,/^}/p' $INS | grep -c ':')"
echo "K11 $(sed -n 4p $D232)"
echo "K12 $(sed -n 1p $D232 | grep -c 'c3-i') $(sed -n 5p $D232 | grep -c 'studio-lab-interactions.perf.spec.ts') $(grep -c -F '### ეტაპი c3-i' $D232) $(grep -c '^## ' $D232) $(grep -c '^## ' $D168) $(grep -c 'drag-lane-live' $D168)"
echo "K13 $(python3 -I -c "import json,sys;r={x['id']:x for x in json.load(open(sys.argv[1]))};print(*[r[i]['kind']+'/'+r[i]['mode'] for i in ['interact.drag.move.stopped.move-components-per-move','interact.drag.move.stopped.move-components-max','interact.drag.move.stopped.release-commits','interact.harness.drag-move-live']])" $BUD)"
echo "K14 $(for f in tasks/round-334.md c-round-334.json c-round-334.md a-round-334.md gates/gate-round-334.json gates/round-334/review.md b-round-334/cross-lane-probe.mjs b-round-334/cross-head-1440.json b-round-334/cross-head-1440-run2.json b-round-334/cross-head-1440-summary.txt b-round-334/cross-head-stability.txt b-round-318/protected-sha256.txt b-round-329/perf-rowcmp.py c-round-334/perf-results/latest-interactions.json c-round-330/g330-auth.cjs; do test -f $f || echo MISSING:$f; done; echo checked)"
echo "K15 $(git -C $S diff --quiet HEAD -- app && echo app-untouched || echo app-changed) $(git -C $S diff --quiet HEAD -- perf/lib && echo lib-untouched || echo lib-changed)"
echo "K16 $(python3 -I -c "import json,sys;d=json.load(open(sys.argv[1]));rows=d.get('rows',[]);print(len(rows), d.get('complete'), len(d.get('failures',[])))" c-round-334/perf-results/latest-interactions.json 2>&1 | tail -1)"
echo "K17 $(grep -c -F 'pass.problems.map((problem) =>' $S/perf/lib/report.ts)"
echo "K18 $(grep -c -F '/^interact\.drag\.(range|fade|trim|move)\.(stopped|playing)\.commits-per-move(\.6x)?$/;' $S/perf/lib/report.test.ts) $(grep -c -F 'expect(drag).toHaveLength(16);' $S/perf/lib/report.test.ts)"
echo "K19 $(sed 's/\x1b\[[0-9;]*m//g' b-round-334/perf-lib-report-head.log | grep -E '^\s+Tests ' | tr -s ' ') $(test -f b-round-334/vitest.perf-lib.config.mjs && echo config-ok)"
echo "K20 $(grep -rl 'budgets.interactions' $S/app $S/perf $S/e2e 2>/dev/null | sed "s#$S/##" | sort | tr '\n' ' ')"
