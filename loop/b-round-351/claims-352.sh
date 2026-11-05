#!/usr/bin/env bash
# Round 352 claims: C-R351-01 fix-up (DP72 release/Undo half). Run from the loop root.
# CLAIMS_STORE may point at another tree (B's sketch /home/runner/b352-scratch/sk; K2/K8 read no-git there).
L=$(pwd); S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
DOCK=$S/app/components/arrangement/ArrangementVideoDock.tsx
CTX=$S/app/contexts/ArrangementContext.tsx
DPT=$S/app/lib/arrangement/__tests__/drag-preview-render.test.tsx
D232=$S/docs/implementation/2026/quarter-IV/232-perf-drag-preview.md
c() { local n; n=$(grep -c -- "$1" "$2" 2>/dev/null); echo "${n:-0}"; }
echo "K1 $(python3 -I -c "import json;g=lambda n:json.load(open('gates/gate-round-%d.json'%n));a=g(349);print(a['status'],a['commit'][:7],'g350',g(350)['status'],'g351',g(351)['status'])")"
echo "K2 $(git -C $S rev-parse --short HEAD 2>/dev/null || echo no-git) $(git -C $S status --short --untracked-files=all 2>/dev/null | wc -l)"
echo "K3 dock-sha $(sha256sum $DOCK | cut -c1-16) c350-sketch-sha $(sha256sum $L/b-round-349/sketch-ArrangementVideoDock.tsx | cut -c1-16) ctx-sha $(sha256sum $CTX | cut -c1-16) seek-preview-sub $(c 'const stopPreview = videoLane.subscribeVideoLanePreview(syncStoppedVideo);' $DOCK) seek-deps $(c '  }, \[videoLane, isPlaying, positionStore, videoSources\]);' $DOCK) commit-next $(c '      return applyEdit(next, label, before);' $CTX)"
echo "K4 tests DP66-71 $(grep -cE "it\('DP(6[6-9]|7[01]) " $DPT) DP72 $(grep -cE "it\('DP72 " $DPT) dp72-title $(c "it('DP72 a stopped video move drag seeks the frame to the previewed clip before release'" $DPT) currentTime-setter-spy $(c "vi.spyOn(HTMLMediaElement.prototype, 'currentTime', 'set')" $DPT) video-filter $(c 'if (this instanceof HTMLVideoElement) {' $DPT) writes-before-release $(c 'const writesBeforeRelease = seeks.length;' $DPT) release-no-write $(c 'expect(seeks).toHaveLength(writesBeforeRelease);' $DPT) undo-writes $(c 'expect(seeks.length).toBeGreaterThan(writesBeforeRelease)' $DPT) restoreAllMocks $(c 'vi.restoreAllMocks();' $DPT)"
K5=$(cd $S && git diff --no-index --numstat $L/b-round-350/drag-preview-render.test.r350.tsx $DPT 2>/dev/null | awk '{print $1"+"$2"-"}')
K5S=$(cmp -s $L/b-round-351/drag-preview-render.test.sketch352.tsx $DPT && echo equal || echo differs)
echo "K5 test-diff-vs-350 ${K5:-0+0-} vs-sketch352 $K5S"
echo "K6 doc232 h2 $(c '^## ' $D232) pending-351 $(c 'C round 351 pending' $D232) pending-352 $(c 'C round 352 pending' $D232) rounds-351-352 $(c 'rounds 351–352' $D232) d1124 $(c 'D-29z1124' $D232) m-b5 $(c 'M-B5' $D232) m-b6 $(c 'M-B6' $D232) m-b7 $(c 'M-B7' $D232)"
echo "K7 $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K8 diff-lines-outside-3 $(git -C $S diff --stat HEAD -- app perf e2e docs 2>/dev/null | grep -v 'ArrangementVideoDock.tsx\|drag-preview-render.test.tsx\|232-perf-drag-preview.md\|files changed\|file changed' | wc -l) untracked $(git -C $S status --short --untracked-files=all 2>/dev/null | grep -c '^??')"
echo "K9 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K10 kept $(for f in claims-352.sh sketch-dp72-release.patch.txt drag-preview-render.test.sketch352.tsx sketch-file.log sketch-tsc.log sketch-biome.log sketch-dp72-replicates.log mutant-control.log mutant-M-B2.log mutant-M-B2prime.log mutant-A-M5.log mutant-M-B5.log mutant-M-B6.diff.txt mutant-M-B6.log mutant-M-B7.diff.txt mutant-M-B7.log mutant-M-B7-on-dp72-r351.log mutant-M-B1.log mutant-M-B1.diff.txt sketch-review.md sketch-doc232.patch.txt mutant-M-B1-on-dp72-r351.log mutant-M-B6-on-dp72-r351.log; do [ -f $L/b-round-351/$f ] && echo -n 1 || echo -n 0; done)"
echo "K11 lane-hook-shallow $(c 'useShallow((state) => selectPreviewLaneClips(state.preview, committed, trackId)),' $CTX) px-per-second-40 $(c '^const PX_PER_SECOND = 40;' $DPT) dp64-import $(c "it('DP64 the dock caption follows a stopped video move from the store'" $DPT)"
