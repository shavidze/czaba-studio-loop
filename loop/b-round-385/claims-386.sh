#!/usr/bin/env bash
# Round 386 claims. Run from the loop root: bash b-round-385/claims-386.sh
L=/home/runner/czaba-project/tmp/studio-real-loop
S=/home/runner/czaba-project/store
F=app/contexts/ArrangementContext.tsx
cd "$S" || exit 1
echo "K1 HEAD"; git rev-parse HEAD
echo "K2 status lines"; git status --short --untracked-files=all | wc -l
echo "K3 post-decode resync calls (expect 3: ensureDecoded, video audio, load effect)"; grep -n "syncPlayback(present, undefined, true);" $F
echo "K4 void ensureDecoded sites"; grep -n "void ensureDecoded" $F
echo "K5 deferred preview click-time stop"; sed -n '1722,1725p' $F
echo "K6 controller ref type and set"; grep -n "const collectionControllerRef = useRef<AbortController | null>(null);\|collectionControllerRef.current = controller;\|collectionControllerRef.current === controller" $F
echo "K7 startPlaybackAt status updater"; sed -n '1659,1663p' $F
echo "K8 scheduleFailed hits in app (expect 0)"; grep -rn "scheduleFailed" app | wc -l
echo "K9 rows"; grep -c "it('EV" app/lib/arrangement/__tests__/decoded-buffer-eviction-ui.test.tsx; grep -c "it('PW" app/lib/arrangement/__tests__/peaks-worker-video.test.tsx; grep -o "it('EV1[1-5]\|it('PW20" app/lib/arrangement/__tests__/*.test.tsx | wc -l
echo "K10 ST10 literal map neighbour"; grep -n "    nothingToPlay: 'Nothing to play — add a clip from the library first.'," app/lib/arrangement/__tests__/strings.test.ts
echo "K11 applySchedule import in context"; grep -n "^  applySchedule,$" $F
echo "K12 gate-384 file times"; sed 's/\x1b\[[0-9;]*m//g' $L/gates/round-384/verify.log | grep -E "decoded-buffer-eviction-ui|peaks-worker-video|__tests__/strings.test.ts" | sed 's/^ *//'
echo "K13 sketch patch sha"; sha256sum $L/b-round-385/sketch-386.patch.txt | cut -c1-64
echo "K14 patch applies to HEAD"; git apply --check $L/b-round-385/sketch-386.patch.txt && echo apply-ok
echo "K15 protected manifest"; sha256sum -c --quiet $L/b-round-318/protected-sha256.txt; echo rc $?
echo "K16 frozen manifest"; wc -l < $L/b-round-385/r386-frozen-sha256.txt; sha256sum -c --quiet $L/b-round-385/r386-frozen-sha256.txt; echo rc $?
echo "K17 cited artifacts"; for p in sketch-386.patch.txt sketch-386.sha256 sketch-review.md grants-386.txt covering-386-full.txt covering-386-full-sketch.log mutants/mutate.py mutants/run-mutants-386.sh probe/resync-throw.mjs probe/preview-while-playing.mjs probe/head-1440.json probe/sketch-1440.json probe/head-1280.json probe/sketch-1280.json probe/pv-head-ok-1440.json probe/pv-sketch-ok-1440.json probe/pv-head-fail-1440.json probe/pv-sketch-fail-1440.json probe/pv-head-ok-1280.json probe/pv-sketch-ok-1280.json probe/pv-head-fail-1280.json probe/pv-sketch-fail-1280.json probe/join-while-playing.mjs probe/join-head-1440.json probe/join-head-1280.json; do test -f $L/b-round-385/$p && echo "ok $p" || echo "MISSING $p"; done
echo "K18 mutant logs red rows"; for m in NO-CATCH NO-OWNER-GUARD CLICK-STOP LOAD-PATH-DIRECT VIDEO-PATH-DIRECT REPLAY-STATUS UNSTABLE-RESYNC; do f=$L/b-round-385/mutants/mutant-MU-386-$m.log; test -f $f || { echo "MISSING $f"; continue; }; echo "$m: $(grep -cE '^ FAIL .*(EV1[1-5]|PW20)' $f) target-fails; $(grep -E 'Tests ' $f | sed 's/^ *//')"; done
echo "K19 next doc number free"; ls docs/implementation/2026/quarter-IV/ | sort | tail -1; test -e docs/implementation/2026/quarter-IV/249-decode-resync-errors.md && echo exists || echo free
echo "K20 doc 248 status line"; sed -n '4p' docs/implementation/2026/quarter-IV/248-perf-decoded-buffer-cache.md
echo "K21 load effect deps include syncPlayback"; sed -n '4334,4343p' $F
echo "K22 video audio deps"; sed -n '2853,2862p' $F
echo "K24 direct preview stops playback"; sed -n '1757,1763p' $F
