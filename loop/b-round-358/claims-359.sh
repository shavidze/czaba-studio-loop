#!/usr/bin/env bash
# B round 358 -> 359 claims. Run from the loop root. CLAIMS_STORE overrides the store path (scratch).
L=/home/runner/czaba-project/tmp/studio-real-loop
S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
W=$S/app/components/arrangement/StudioWorkspace.tsx
C=$S/app/contexts/ArrangementContext.tsx
echo "K1 $(python3 -I -c "import json;g=json.load(open('$L/gates/gate-round-358.json'));print(g['status'],g['reason'].split()[1][:7])")"
if [ -d "$S/.git" ] && [ -z "${CLAIMS_STORE:-}" ]; then
  echo "K2 $(git -C $S rev-parse --short HEAD) $(git -C $S status --short --untracked-files=all | wc -l)"
else echo "K2 scratch n/a"; fi
echo "K6 $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K9 package.json-sha $(sha256sum $S/package.json | cut -c1-12)"
echo "K21 tempo-grid-literal-defaults $(grep -cE "useState\((false|null|0|'adaptive')\);|useState<number \| null>\(null\);|useRef\((true|false)\);" $W) restored-reads $(grep -c 'restoredTempoGrid?\.' $W)"
echo "K22 session-store-file $( [ -f $S/app/lib/arrangement/workspace-session-store.ts ] && echo 1 || echo 0) provider-context $(grep -c 'ArrangementWorkspaceSessionContext' $C) hook-export $(grep -c 'export function useArrangementWorkspaceSessionStore' $C)"
echo "K23 seed-guard $(grep -c 'tempoBpmRef.current !== null' $W) seed-effect-line $(grep -n 'collectionHasTempoSource || !tempoSeedOpenRef.current' $W | cut -d: -f1)"
echo "K24 ws-rows $(grep -cE "it\('WS[1-5] " $S/app/lib/arrangement/__tests__/workspace-session-remount-ui.test.tsx 2>/dev/null || echo 0) rm-rows $(grep -cE "it\('RM[12] " $S/app/lib/arrangement/__tests__/follow-remount-ui.test.tsx)"
echo "K25 cited $(for f in b-round-358/sketch/source-delta.patch.txt b-round-358/sketch/workspace-session-remount-ui.test.tsx b-round-358/sketch/patches.sha256 b-round-358/ws-on-head.log b-round-358/cover-sketch.log b-round-358/cover-paths-359.txt b-round-358/beh-sketch-1440x900.json b-round-358/beh-sketch-1280x720.json b-round-358/remount3-sketch.json b-round-358/behaviour-probe.mjs b-round-358/mutants/m-s1-seed-open.log b-round-358/mutants/m-s2-tempo.log b-round-358/mutants/m-s3-singleton.log b-round-358/mutants/m-s4-metronome.log b-round-358/mutants/m-s5-no-save.log c-round-358/beh-head-1440x900.json c-round-358/beh-head-1280x720.json c-round-358/auth.mjs c-round-357/remount-probe3.mjs c-round-358/remount3-tree.json; do [ -f $L/$f ] || echo MISSING:$f; done | wc -l) missing; patches $(cd $L/b-round-358/sketch && sha256sum -c patches.sha256 2>/dev/null | grep -c ': OK$')"
