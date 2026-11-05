#!/usr/bin/env bash
# Round 351 claims: fix-up of C-R350-01 (mutant ruling) + A-R350-REVIEW-SEEK-TEST (DP72). Run from the loop root.
# CLAIMS_STORE may point at another tree (B's sketch /home/runner/b350-scratch/sk; K2 reads no-git there).
L=$(pwd); S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
DOCK=$S/app/components/arrangement/ArrangementVideoDock.tsx
DPT=$S/app/lib/arrangement/__tests__/drag-preview-render.test.tsx
D232=$S/docs/implementation/2026/quarter-IV/232-perf-drag-preview.md
c() { local n; n=$(grep -c -- "$1" "$2" 2>/dev/null); echo "${n:-0}"; }
echo "K1 $(python3 -I -c "import json;a=json.load(open('gates/gate-round-349.json'));b=json.load(open('gates/gate-round-350.json'));print(a['status'],a['commit'][:7],'g350',b['status'])")"
echo "K2 $(git -C $S rev-parse --short HEAD 2>/dev/null || echo no-git) $(git -C $S status --short --untracked-files=all 2>/dev/null | wc -l)"
echo "K3 dock-sha $(sha256sum $DOCK | cut -c1-16) c350-sketch-sha $(sha256sum $L/b-round-349/sketch-ArrangementVideoDock.tsx | cut -c1-16) seek-preview-sub $(c 'const stopPreview = videoLane.subscribeVideoLanePreview(syncStoppedVideo);' $DOCK) equal-skip $(c 'if (pictureOpacity === writtenOpacityRef.current) {' $DOCK)"
echo "K4 tests DP66-71 $(grep -cE "it\('DP(6[6-9]|7[01]) " $DPT) DP72 $(grep -cE "it\('DP72 " $DPT) dp72-title $(c "it('DP72 a stopped video move drag seeks the frame to the previewed clip before release'" $DPT) currentTime-setter-spy $(c "vi.spyOn(HTMLMediaElement.prototype, 'currentTime', 'set')" $DPT) restoreAllMocks $(c 'vi.restoreAllMocks();' $DPT)"
K5=$(cd $S && git diff --no-index --numstat $L/b-round-350/drag-preview-render.test.r350.tsx $DPT 2>/dev/null | awk '{print $1"+"$2"-"}'); echo "K5 test-diff-vs-350 ${K5:-0+0-}"
echo "K6 doc232 h2 $(c '^## ' $D232) pending-350 $(c 'C round 350 pending' $D232) pending-351 $(c 'C round 351 pending' $D232) awaiting-ruling $(c 'B-ის ruling-ს ელოდება' $D232) ruling-d1119 $(c 'D-29z1119' $D232) dp72 $(c 'DP72' $D232) m-b5 $(c 'M-B5' $D232)"
echo "K7 $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K8 diff-lines-outside-3 $(git -C $S diff --stat HEAD -- app perf e2e docs 2>/dev/null | grep -v 'ArrangementVideoDock.tsx\|drag-preview-render.test.tsx\|232-perf-drag-preview.md\|files changed\|file changed' | wc -l) untracked $(git -C $S status --short --untracked-files=all 2>/dev/null | grep -c '^??')"
echo "K9 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K10 kept $(for f in mutant-control.log mutant-M-B2.log mutant-M-B2.diff.txt mutant-M-B2prime.log mutant-M-B2prime.diff.txt mutant-A-M5.log mutant-A-M5.diff.txt mutant-M-B5.log mutant-M-B5.diff.txt sketch-dp72.patch.txt sketch-dp72-file.log dp72-on-head-dock.log drag-preview-render.test.r350.tsx claims-351.sh; do [ -f $L/b-round-350/$f ] && echo -n 1 || echo -n 0; done)"
echo "K11 lane-hook-shallow $(c 'useShallow((state) => selectPreviewLaneClips(state.preview, committed, trackId)),' $S/app/contexts/ArrangementContext.tsx) px-per-second-40 $(c '^const PX_PER_SECOND = 40;' $DPT) dp64-import $(c "it('DP64 the dock caption follows a stopped video move from the store'" $DPT)"
