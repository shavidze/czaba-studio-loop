#!/usr/bin/env bash
# B round 406 -> 407 claims (L29/L56). Run from anywhere: bash b-round-406/claims-407.sh
# Env ROOT = repository to check (default the real store); LOOP = loop folder.
LOOP=${LOOP:-/home/runner/czaba-project/tmp/studio-real-loop}
ROOT=${ROOT:-/home/runner/czaba-project/store}
B=$LOOP/b-round-406
cd "$ROOT" || exit 2
T=app/lib/arrangement/__tests__
VD=app/components/arrangement/ArrangementVideoDock.tsx
DP=$T/drag-preview-render.test.tsx
D259=docs/implementation/2026/quarter-IV/259-perf-video-dock-actions.md
D260=docs/implementation/2026/quarter-IV/260-perf-video-dock-memo.md
echo "K1 head $(git rev-parse HEAD)"
echo "K2 status-lines $(git status --short --untracked-files=all | wc -l)"
echo "K3 frozen-entries $(wc -l < $B/r407-frozen-sha256.txt) rc $(sha256sum -c --quiet $B/r407-frozen-sha256.txt >/dev/null 2>&1; echo $?)"
echo "K4 protected rc $(sha256sum -c --quiet $LOOP/b-round-318/protected-sha256.txt >/dev/null 2>&1; echo $?) granted-protected $(awk '{print $2}' $LOOP/b-round-318/protected-sha256.txt | grep -cxF -f $B/grants-407.txt)"
echo "K5 applies-on-tree $(git apply --check $B/sketch-407.patch.txt >/dev/null 2>&1 && echo yes || echo no)"
echo "K6 doc259-l4 $(sed -n 4p $D259)"
echo "K6a doc260-exists $(test -f $D260 && echo 1 || echo 0) l4 $(test -f $D260 && sed -n 4p $D260)"
echo "K6b in-progress-stage-docs $(grep -rln 'In Progress (stage' docs/implementation | wc -l) pending-form $(grep -rn 'C round [0-9]* pending' docs/implementation | wc -l)"
echo "K7 inner-memo $(grep -c '^const ArrangementVideoDockView = memo(ArrangementVideoDockViewInner);$' $VD) caption-memo $(grep -c '^const ArrangementVideoCaptionView = memo(ArrangementVideoCaption);$' $VD)"
echo "K8 reader-key $(grep -c '  }, \[videoTrackId, getArrangement, previewStore\]);' $VD) reader-arrangement-dep $(grep -c '}, \[arrangement, getArrangement, previewStore\]);' $VD)"
echo "K9 publish-effect $(grep -c '    videoLane.publishCommittedVideoClips(videoClips);' $VD) committed-clips-hook $(grep -c 'function useCommittedVideoLaneClips(' $VD)"
echo "K10 shell-use-arrangement $(grep -c 'const { arrangement, videoSources, pausePlaybackWithStatus } = useArrangement();' $VD) pause-ref $(grep -c 'pauseWithStatusRef.current = pausePlaybackWithStatus;' $VD) rounded-panel $(grep -o 'rounded-panel' $VD | wc -l)"
echo "K11 tests DP73 $(grep -c "it('DP73 " $DP) DP74 $(grep -c "it('DP74 " $DP) DP75 $(grep -c "it('DP75 " $DP) inner-in-list $(grep -c "^  'ArrangementVideoDockViewInner',$" $DP)"
echo "K12 SWEEP dock-name-consumers $(grep -rln 'ArrangementVideoDock\|ArrangementVideoCaption' app perf e2e 2>/dev/null --include=*.ts --include=*.tsx | grep -v "^$VD$" | sort | tr '\n' ' ')"
echo "K13 SWEEP video-lane-subscribers $(grep -c 'subscribeVideoLanePreview(' $VD) readers $(grep -c 'readVideoLaneArrangement()' $VD)"
echo "K14 sketch-sha $(sha256sum < $B/sketch-407.patch.txt | cut -c1-16) review-names-sha $(grep -c "$(cut -c1-64 $B/sketch-dispatched.sha256)" $B/sketch-review.md)"
for f in sketch-407.patch.txt grants-407.txt r407-frozen-sha256.txt mutants/run.py mutants/summary.txt precheck-full.log sketch-review.md current-task-before-407.md probe/leaf-probe-407.mjs probe/leaf-head-407.json probe/leaf-sketch-407.json probe/leaf-sketch-vs-head-407.txt video/drift-summary.txt video/video-stopped-seek-probe.mjs video/stopped-sketch-1440x900.json video/stopped-mutant-NO-COMMIT-NOTIFY-1440x900.json sketch-logs/covering.txt; do echo "K15 exists $f $(test -f $B/$f && echo 1 || echo 0)"; done
echo "K16 mutants red $(grep -c ' RED rc' $B/mutants/summary.txt) survived $(grep -c 'SURVIVED' $B/mutants/summary.txt) site $(grep -c 'SITE-COUNT' $B/mutants/summary.txt) pristine $(grep -c 'PRISTINE-.* rc 0' $B/mutants/summary.txt)"
echo "K17 gate406 $(python3 -I -c "import json;d=json.load(open('$LOOP/gates/gate-round-406.json'));print(d['status'],d['commit'][:7])")"
echo "K18 regression-last $(python3 -I -c "import json;print(json.load(open('$LOOP/regression-last.json'))['date'])")"
echo "K19 archive-equal $(cmp -s $LOOP/tasks/round-406.md $B/current-task-before-407.md && echo 1 || echo 0)"
echo "K20 precheck-full $(tr '\n' ' ' < $B/precheck-full.log)"
echo "K21 leaf-caption $(grep -c 'ArrangementVideoCaption: head \[0, 3, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 2\] sketch \[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0\]' $B/probe/leaf-sketch-vs-head-407.txt) dock-shell-equal $(grep -c 'ArrangementVideoDock: head \[0, 3, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 2\] sketch \[0, 3, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 2\]' $B/probe/leaf-sketch-vs-head-407.txt)"
echo "K22 video-drift $(tr '\n' ';' < $B/video/drift-summary.txt)"
echo "K23 stopped-seek $(for f in head-1440x900 head-1280x720 sketch-1440x900 sketch-1280x720 mutant-NO-COMMIT-NOTIFY-1440x900; do python3 -I -c "import json;d=json.load(open('$B/video/stopped-$f.json'));print('$f', d['maxError'], d['moved'], end=' ')"; echo -n '; '; done)"
