#!/usr/bin/env bash
# B round 408 -> 409 claims (L29/L56). Run from anywhere: bash b-round-408/claims-409.sh
# Env ROOT = repository to check (default the real store); LOOP = loop folder.
LOOP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
ROOT=${ROOT:-/home/runner/czaba-project/store}
B=$LOOP/b-round-408
cd "$ROOT" || exit 2
LANE=app/components/arrangement/ArrangementLane.tsx
RB=app/lib/arrangement/__tests__/render-budget.test.tsx
CTX=app/contexts/ArrangementContext.tsx
SW=app/components/arrangement/StudioWorkspace.tsx
D261=docs/implementation/2026/quarter-IV/261-perf-lane-actions.md
D262=docs/implementation/2026/quarter-IV/262-perf-lane-memo.md
echo "K1 head $(git rev-parse HEAD)"
echo "K2 status-lines $(git status --short --untracked-files=all | wc -l)"
echo "K3 frozen-entries $(wc -l < $B/r409-frozen-sha256.txt) rc $(sha256sum -c --quiet $B/r409-frozen-sha256.txt >/dev/null 2>&1; echo $?)"
echo "K4 protected rc $(sha256sum -c --quiet $LOOP/b-round-318/protected-sha256.txt >/dev/null 2>&1; echo $?) granted-protected $(awk '{print $2}' $LOOP/b-round-318/protected-sha256.txt | grep -cxF -f $B/grants-409.txt)"
echo "K5 applies-on-tree $(git apply --check $B/sketch-409.patch.txt >/dev/null 2>&1 && echo yes || echo no)"
echo "K6 doc262-exists $(test -f $D262 && echo 1 || echo 0) l4 $(test -f $D262 && sed -n 4p $D262)"
echo "K6a doc261-l4 $(sed -n 4p $D261)"
echo "K6b in-progress-stage-docs $(grep -rln 'In Progress (stage' docs/implementation | wc -l) pending-form $(grep -rn 'C round [0-9]* pending' docs/implementation | wc -l)"
echo "K7 lane-shape inner-fn $(grep -c '^function ArrangementLaneViewInner(' $LANE) memo-with-comparator $(grep -c '^const ArrangementLaneView = memo(ArrangementLaneViewInner, areArrangementLaneViewPropsEqual);$' $LANE) shell $(grep -c '^export function ArrangementLane(props: ArrangementLaneProps) {$' $LANE) old-export $(grep -c '^export function ArrangementLane({$' $LANE)"
echo "K8 lane-hooks useArrangement-calls $(grep -c 'useArrangement();' $LANE) useArrangementActions-calls $(grep -c 'useArrangementActions();' $LANE) preview-lane-clips-calls $(grep -c 'useArrangementPreviewLaneClips(arrangement, ' $LANE)"
echo "K9 tests RB-LEAF7 $(grep -c "it('RB-LEAF7 " $RB) RB-LEAF8 $(grep -c "it('RB-LEAF8 " $RB) RB-LEAF9 $(grep -c "it('RB-LEAF9 " $RB) inner-key $(grep -c "'ArrangementLaneViewInner'" $RB)"
echo "K10 track-fields interface $(sed -n '/^export interface ArrangementTrack {/,/^}/p' app/types/arrangement.ts | grep -c ';') solo-rebuilds-every-track $(grep -c '    tracks: arrangement.tracks.map((track) => ({' app/lib/arrangement/model.ts) lane-field-table $(grep -c '^const LANE_TRACK_FIELD_COMPARES: {$' $LANE) table-entries $(sed -n '/^const LANE_TRACK_FIELD_COMPARES: {$/,/^};$/p' $LANE | grep -cE '^  [a-zA-Z]+: \(a, b\) => a\.')"
echo "K11 lane-callbacks-stable $(for n in toggleTrackFold changeTrackHeight snapshotTrackLaneLayout selectTrackRow handleGridMenuRequest handleLaneBackgroundPointerDown; do echo -n "$n:$(grep -c "const $n = useCallback(" $SW) "; done) timelineWindow-useMemo $(grep -c 'const timelineWindow = useMemo(' $SW) lane-call-sites $(grep -c '<ArrangementLane$' $SW)"
echo "K12 peaks-with-ready $(grep -A1 'storeSourcePeaks(source.id, peaks);' $CTX | grep -c 'patchSourceState(source.id, {') video $(grep -A1 'storeSourcePeaks(sourceId, peaks);' $CTX | grep -c "settle({ audio: 'ready', audioNote: null });")"
echo "K13 SWEEP render-log-ArrangementLane $(grep -rln "'ArrangementLane'" app perf 2>/dev/null | sort | tr '\n' ' ')"
echo "K14 sketch-sha $(sha256sum < $B/sketch-409.patch.txt | cut -c1-16) review-names-sha $(grep -c "$(cut -c1-64 $B/sketch-dispatched.sha256)" $B/sketch-review.md 2>/dev/null)"
for f in sketch-409.patch.txt sketch-dispatched.sha256 grants-409.txt r409-frozen-sha256.txt mutants/run.py mutants/summary.txt mutants/tsc-mutant-NEW-TRACK-FIELD.log precheck-full.log sketch-review.md consult-performance-optimizer.md root-request-arch-checkpoint-perf11c-iii.md tools/make-sketch.py tools/make-sketch-tests.py probe/leaf-probe-409.mjs probe/leaf-head-409.json probe/leaf-sketch-409.json probe/leaf-sketch-409-loaded.json probe/leaf-mutant-PLAIN-MEMO-409.json probe/leaf-sketch-vs-head-409.txt lane/lane-actions-probe.mjs lane/head-1440x900.json lane/head-1280x720.json lane/sketch-1440x900.json lane/sketch-1280x720.json lane/mutant-DROP-SOLO-FIELD-1440x900.json sketch-logs/covering.txt sketch-logs/slowest.txt sketch-logs/rc.txt current-task-before-409.md; do echo "K15 exists $f $(test -f $B/$f && echo 1 || echo 0)"; done
echo "K16 mutants red $(grep -c ' RED rc' $B/mutants/summary.txt) tsc-guard $(grep -c 'MU-409-TSC-NEW-TRACK-FIELD .*tsc rc 2, error names colour in ArrangementLane.tsx: 1' $B/mutants/summary.txt) survived $(grep -c 'SURVIVED' $B/mutants/summary.txt) site $(grep -c 'SITE-COUNT' $B/mutants/summary.txt) pristine $(grep -c 'PRISTINE-.* rc 0' $B/mutants/summary.txt)"
echo "K17 gate408 $(python3 -I -c "import json;d=json.load(open('$LOOP/gates/gate-round-408.json'));print(d['status'],d['commit'][:7])")"
echo "K18 regression-last $(python3 -I -c "import json;print(json.load(open('$LOOP/regression-last.json'))['date'])")"
echo "K19 archive-equal $(cmp -s $LOOP/tasks/round-408.md $B/current-task-before-409.md && echo 1 || echo 0)"
echo "K20 precheck-full $(tr '\n' ' ' < $B/precheck-full.log | sed 's/\x1b\[[0-9;]*m//g')"
echo "K21 leaf inner-sketch-both $(grep -c 'ArrangementLaneViewInner: head \[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0\] sketch \[0, 8, 4, 4, 0, 0, 0, 1, 1, 4, 4, 0, 0, 1, 1\] loaded \[0, 8, 4, 4, 0, 0, 0, 1, 1, 4, 4, 0, 0, 1, 1\]' $B/probe/leaf-sketch-vs-head-409.txt) shell-equal-both $(grep -c 'ArrangementLane: head \[0, 12, 4, 4, 0, 0, 0, 4, 4, 4, 4, 4, 8, 4, 4\] sketch \[0, 12, 4, 4, 0, 0, 0, 4, 4, 4, 4, 4, 8, 4, 4\] loaded' $B/probe/leaf-sketch-vs-head-409.txt) diff-vs-head-lines $(grep -c 'DIFF-vs-head' $B/probe/leaf-sketch-vs-head-409.txt) plain-memo-mutant $(grep -c 'PLAIN-MEMO mutant ArrangementLaneViewInner \[0, 8, 4, 4, 0, 0, 0, 1, 1, 4, 4, 0, 0, 4, 4\]' $B/probe/leaf-sketch-vs-head-409.txt)"
echo "K22 lane-probe $(for f in head-1440x900 head-1280x720 sketch-1440x900 sketch-1280x720 mutant-DROP-SOLO-FIELD-1440x900; do python3 -I -c "import json;d=json.load(open('$B/lane/$f.json'));print('$f', d['ok'], 'failed', [k for k,v in d['steps'].items() if not v['pass']], end=' ')"; echo -n '; '; done)"
echo "K23 covering $(python3 -I -c "import json;d=json.load(open('$B/sketch-logs/covering.json'));print(len(d['testResults']), d['numPassedTests'], d['numTotalTests'], d['numFailedTests'])")"
