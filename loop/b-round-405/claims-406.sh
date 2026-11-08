#!/usr/bin/env bash
# B round 405 -> 406 claims (L29/L56). Run from anywhere: bash b-round-405/claims-406.sh
# Env ROOT = repository to check (default the real store); LOOP = loop folder.
LOOP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
ROOT=${ROOT:-/home/runner/czaba-project/store}
B=$LOOP/b-round-405
cd "$ROOT" || exit 2
T=app/lib/arrangement/__tests__
CTX=app/contexts/ArrangementContext.tsx
VD=app/components/arrangement/ArrangementVideoDock.tsx
D259=docs/implementation/2026/quarter-IV/259-perf-video-dock-actions.md
echo "K1 head $(git rev-parse HEAD)"
echo "K2 status-lines $(git status --short --untracked-files=all | wc -l)"
echo "K3 frozen-entries $(wc -l < $B/r406-frozen-sha256.txt) rc $(sha256sum -c --quiet $B/r406-frozen-sha256.txt >/dev/null 2>&1; echo $?)"
echo "K4 protected rc $(sha256sum -c --quiet $LOOP/b-round-318/protected-sha256.txt >/dev/null 2>&1; echo $?) granted-protected $(awk '{print $2}' $LOOP/b-round-318/protected-sha256.txt | grep -cxF -f $B/grants-406.txt)"
echo "K5 applies-on-tree $(git apply --check $B/sketch-406.patch.txt >/dev/null 2>&1 && echo yes || echo no)"
echo "K6 doc259-exists $(test -f $D259 && echo 1 || echo 0) l4 $(test -f $D259 && sed -n 4p $D259)"
echo "K6b in-progress-stage-docs $(grep -rln 'In Progress (stage' docs/implementation | wc -l) pending-form $(grep -rn 'C round [0-9]* pending' docs/implementation | wc -l)"
echo "K7 pick-keys $(awk '/^type ArrangementActions = Pick</,/^>;/' $CTX | grep -c "^  | '")"
echo "K7b pick-new $(awk '/^type ArrangementActions = Pick</,/^>;/' $CTX | grep -cE "'getLivePosition'|'getPlaybackClock'")"
echo "K8 actions-memo-new $(awk '/const actions = useMemo<ArrangementActions>\(/,/const value = useMemo<ArrangementContextValue>/' $CTX | grep -cE '^      getLivePosition: livePosition,$|^      getPlaybackClock,$|^      livePosition,$')"
echo "K9 ac7-count $(grep -c 'const ACTION_KEY_COUNT = 36;' $T/actions-context.test.tsx) title36 $(grep -c 'hands out all 36 provider callbacks' $T/actions-context.test.tsx)"
echo "K10 dock-actions-read $(grep -c 'const { getLivePosition, getPlaybackClock, getArrangement } = useArrangementActions();' $VD) dock-use-arrangement $(grep -c 'const { arrangement, videoSources, pausePlaybackWithStatus } = useArrangement();' $VD)"
echo "K11 SWEEP useArrangementActions-consumers $(grep -rln 'useArrangementActions()' app --include=*.tsx | grep -v __tests__ | sort | tr '\n' ' ')"
echo "K12 SWEEP action-count-pins $(grep -rln 'ACTION_KEY_COUNT' app perf e2e 2>/dev/null | tr '\n' ' ')"
echo "K13 getters-stable $(grep -cE 'const livePosition = useCallback|const getPlaybackClock = useCallback' $CTX)"
echo "K14 sketch-sha $(sha256sum < $B/sketch-406.patch.txt | cut -c1-16) review-names-sha $(grep -c "$(cut -c1-64 $B/sketch-dispatched.sha256)" $B/sketch-review.md)"
for f in sketch-406.patch.txt grants-406.txt r406-frozen-sha256.txt mutants/run.py mutants/summary.txt precheck-full.log sketch-review.md consult-tech-lead.md consult-performance-optimizer.md current-task-before-406.md probe/leaf-head-406.json probe/leaf-sketch-406.json probe/leaf-sketch-vs-head-406.txt video/drift-summary.txt; do echo "K15 exists $f $(test -f $B/$f && echo 1 || echo 0)"; done
echo "K16 mutants red $(grep -c ' RED rc' $B/mutants/summary.txt) survived $(grep -c 'SURVIVED' $B/mutants/summary.txt) site $(grep -c 'SITE-COUNT' $B/mutants/summary.txt) pristine $(grep -c 'PRISTINE-.* rc 0' $B/mutants/summary.txt)"
echo "K17 gate405 $(python3 -I -c "import json;d=json.load(open('$LOOP/gates/gate-round-405.json'));print(d['status'],d['commit'][:7])")"
echo "K18 regression-last $(python3 -I -c "import json;print(json.load(open('$LOOP/regression-last.json'))['date'])")"
echo "K19 archive-equal $(cmp -s $LOOP/tasks/round-405.md $B/current-task-before-406.md && echo 1 || echo 0)"
echo "K20 precheck-full $(tr '\n' ' ' < $B/precheck-full.log)"
echo "K21 leaf-probe-differences $(grep -c 'head .* sketch' $B/probe/leaf-sketch-vs-head-406.txt) $(tail -1 $B/probe/leaf-sketch-vs-head-406.txt)"
echo "K22 video-drift $(tr '\n' ';' < $B/video/drift-summary.txt)"
