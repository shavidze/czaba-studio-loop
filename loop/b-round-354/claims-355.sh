#!/usr/bin/env bash
# Round 355 claims: SYS-R353-DP-TEST-POLISH (DP69/DP70/DP72 test-only + doc 232). Run from the loop root.
# CLAIMS_STORE may point at another tree (B's sketch /home/runner/b354-scratch/sc; K2/K7 read no-git there).
L=$(pwd); S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
T=$S/app/lib/arrangement/__tests__/drag-preview-render.test.tsx
DOCK=$S/app/components/arrangement/ArrangementVideoDock.tsx
CTX=$S/app/contexts/ArrangementContext.tsx
CLIP=$S/app/components/arrangement/ArrangementClip.tsx
SFX=$S/app/lib/sfx-video.client.ts
D232=$S/docs/implementation/2026/quarter-IV/232-perf-drag-preview.md
c() { local n; n=$(grep -c -- "$1" "$2" 2>/dev/null); echo "${n:-0}"; }
echo "K1 $(python3 -I -c "import json;a=json.load(open('gates/gate-round-354.json'));print(a['status'],a['commit'][:7])")"
echo "K2 $(git -C $S rev-parse --short HEAD 2>/dev/null || echo no-git) $(git -C $S status --short --untracked-files=all 2>/dev/null | wc -l) outside-root-lanes-since-7219291 $(git -C $S diff --name-only 7219291 HEAD 2>/dev/null | grep -v '^app/components/studio/export/\|^app/components/studio/StudioToolbar.tsx$\|^docs/' | wc -l)"
echo "K3 its $(grep -c "^  it('" $T) dp69-title $(c "it('DP69 the fade release writes nothing to the overlay, so the pre-drag opacity never returns'" $T) dp70-title $(c "it('DP70 Undo and Redo of a committed video fade and trim rewrite the overlay and the gap with no preview'" $T) writtenValues $(c 'writtenValues' $T) committedCaption $(c 'committedCaption' $T) sleep20 $(c 'setTimeout(resolve, 20)' $T) runAllTimersAsync $(c 'await vi.runAllTimersAsync();' $T) dist $(c 'expect(shownStart - imported.start).toBeGreaterThan(0.01);' $T) closeTo6 $(c 'toBeCloseTo(shownStart, 6)' $T) toBe-shown $(c 'start).toBe(shownStart);' $T) raf-stub $(c "vi.stubGlobal('requestAnimationFrame', () => 1);" $T) test-sha $(sha256sum $T | cut -c1-16)"
echo "K4 dock-sha $(sha256sum $DOCK | cut -c1-16) ctx-sha $(sha256sum $CTX | cut -c1-16) gap-hook $(c '  const sourceId = useVideoSourceIdAtPlayhead(videoLane);' $DOCK) stopped-chain $(c '      waitForVideoSeekIdle(video, controller.signal)' $DOCK) sfx-sync-write $(c '    video.currentTime = time;' $SFX)"
echo "K5 doc232 h2 $(c '^## ' $D232) pass-355 $(c 'video-trim-fade-cost-2, dp-test-polish; C round 355 PASS)' $D232) pass-354-left $(c 'video-trim-fade-cost-2; C round 354 PASS)' $D232) section $(c '^### ეტაპი dp-test-polish' $D232) d1142 $(c 'D-29z1142' $D232) settle20-text $(c '20 ms settle' $D232) pending-any-impl-docs $(grep -rl 'C round [0-9]* pending' $S/docs/implementation 2>/dev/null | wc -l)"
echo "K6 $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K7 diff-lines-outside-2 $(git -C $S diff --stat HEAD -- app perf e2e docs scripts 2>/dev/null | grep -v 'drag-preview-render.test.tsx\|232-perf-drag-preview.md\|files changed\|file changed' | wc -l) untracked $(git -C $S status --short --untracked-files=all 2>/dev/null | grep -c '^??')"
echo "K8 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K9 fade-labels-private $(c '^const VIDEO_FADE_LABELS' $CLIP) exported $(c 'export const VIDEO_FADE_LABELS' $CLIP) literal-uses $(c "'Video Fade In'" $T)"
echo "K10 test.patch-sha $(sha256sum $L/b-round-354/sketch/test.patch.txt | cut -c1-16) doc-patch-sha $(sha256sum $L/b-round-354/sketch/doc232.patch.txt | cut -c1-16)"
echo "K11 cited $(n=0; m=0; while read -r f; do n=$((n+1)); [ -f "$L/$f" ] || { m=$((m+1)); echo -n "MISSING:$f "; }; done < $L/b-round-354/cited-artifacts.txt; echo "$n listed, $m missing")"
