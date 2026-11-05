#!/usr/bin/env bash
# Round 358 claims: PERF-10a re-dispatch with the C-R357-01 ruling (D-29z1156). Run from the loop root.
# K1-K15 are the round-357 claims (b-round-356/claims-357.sh); K16-K20 are new. CLAIMS_STORE may point at another tree.
L=$(pwd); S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
bash "$L/b-round-356/claims-357.sh"
WS=$S/app/components/arrangement/StudioWorkspace.tsx
RM=$S/app/lib/arrangement/__tests__/follow-remount-ui.test.tsx
c() { local n; n=$(grep -c -E -- "$1" "$2" 2>/dev/null); echo "${n:-0}"; }
echo "K16 gate357 $(python3 -I -c "import json;a=json.load(open('gates/gate-round-357.json'));print(a['status'])")"
echo "K17 leaf-transition-guard $(c 'if \(syncedRef\.current === isPlaying\) \{' $WS) at-mount-param $(c 'isPlaying: boolean, atMount = false' $WS) at-mount-string-branch $(c 'if \(previewText !== null \|\| atMount\) \{' $WS) mount-effect $(c 'syncFollowWithPlayback\(committedIsPlayingRef\.current, true\);' $WS)"
T=$(grep -n 'if (!collectionHasTempoSource || !tempoSeedOpenRef.current' $WS | head -1 | cut -d: -f1); M=$(grep -n 'syncFollowWithPlayback(committedIsPlayingRef.current, true);' $WS | head -1 | cut -d: -f1)
echo "K18 tempo-seed-line ${T:-none} mount-sync-line ${M:-none} order $([ -n "$T" ] && [ -n "$M" ] && [ "$T" -lt "$M" ] && echo seed-first || echo n/a)"
echo "K19 rm-rows $(c "it\('RM[12] " $RM) strict-mode-in-entry $(c 'StrictMode' $S/app/entry.client.tsx)"
echo "K20 b357-cited $(n=0; m=0; for f in b-round-357/sketch/source-delta.patch.txt b-round-357/sketch/tests-delta.patch.txt b-round-357/rm-on-atree.log b-round-357/rm-on-head.log b-round-357/mutants/mutant-m-b5.log b-round-357/mutants/mutant-m-b6.log b-round-357/cover-sketch.log b-round-357/remount3-sketch.json b-round-357/remount-probe3.mjs c-round-357/remount3-head.json c-round-357/remount3-atree.json b-round-357/mutants/sketch-m-b1-red.txt b-round-357/mutants/sketch-m-b2-red.txt b-round-357/mutants/sketch-m-b3-red.txt b-round-357/mutants/sketch-m-b4-red.txt; do n=$((n+1)); [ -f "$L/$f" ] || { m=$((m+1)); echo -n "MISSING:$f "; }; done; echo "$n listed, $m missing") delta-patches $(cd $L/b-round-357/sketch && sha256sum -c patches.sha256 2>/dev/null | grep -c ': OK$')"
