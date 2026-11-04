#!/usr/bin/env bash
# Round 331 claims (L29 + L56). Run from the loop root. CLAIMS_STORE may override the store path.
L=$(pwd); S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
WS=$S/app/components/arrangement/StudioWorkspace.tsx
PS=$S/app/lib/arrangement/preview-store.ts
DPANEL=$S/app/components/arrangement/ArrangementDetailPanel.tsx
DP=$S/app/lib/arrangement/__tests__/drag-preview-render.test.tsx
PST=$S/app/lib/arrangement/__tests__/preview-store.test.ts
CTX=$S/app/contexts/ArrangementContext.tsx
TY=$S/app/types/arrangement.ts
D232=$S/docs/implementation/2026/quarter-IV/232-perf-drag-preview.md
echo "K1 $(python3 -I -c "import json;a=json.load(open('gates/gate-round-330.json'));print(a['status'],a['commit'][:7])")"
echo "K2 $(git -C $S rev-parse --short HEAD 2>/dev/null || echo no-git) $(git -C $S status --short --untracked-files=all 2>/dev/null | wc -l)"
echo "K3 $(grep -c 'useShallow' $WS) $(grep -c -F "import { useShallow } from 'zustand/react/shallow';" $WS)"
echo "K4 $(grep -c -F 'selectPreviewClip(state.preview, arrangement, primaryClipId),' $WS) $(grep -c -F 'selectPreviewClip(state.preview, arrangement, clipLaneDrag ? null : primaryClipId),' $WS) $(grep -c -F 'useShallow((state) => selectPreviewClipsAmong(state.preview, arrangement, selectedClipIds)),' $WS)"
echo "K5 $(grep -c -F '  return clipLaneDrag ? (' $WS) $(grep -c -F 'data-testid="arrangement-lane-move-hint"' $WS)"
echo "K6 $(grep -c -E 'fadeIn|fadeOut|envelope' $DPANEL) $(grep -c -F '{formatArrangementTime(selection.clip.sourceOffset)}' $DPANEL)"
echo "K7 $(sed -n '/^export interface ArrangementClip {/,/^}/p' $TY | grep -c -E '^  [a-zA-Z]+\??:')"
echo "K8 $(grep -c -F 'return useStore(useArrangementPreviewStore(), selector);' $CTX)"
echo "K9 $(grep -c -F 'export const SELECTED_CLIP_FIELD_ROLES' $PS) $(grep -c -F 'export function sameSelectedClipShownFields(' $PS) $(grep -c -F 'export function sameSelectedClipsShownFields(' $PS) $(grep -c -F 'function useEqualityStableSelector<State, Selected>(' $WS)"
echo "K10 $(grep -c 'expect(' $DP) $(grep -c -E "^\s+it\('DP" $DP) $(grep -c -E "it\('DP2[5-7] " $DP) $(grep -c 'expect(' $PST) $(grep -c -E "it\('PS-(ROLES|LIST) " $PST)"
echo "K11 $(sed -n 4p $D232)"
echo "K12 $(grep -c -F 'round 329-ში DP20–DP22' $D232) $(grep -c -E '^22\. .*memo` არ დაემატა' $D232) $(grep -c -F 'round 330-ში DP23–DP24, fixture/mount `loop` პარამეტრი' $D232) $(grep -c -F '(round 330-ში შეიცვალა, იხ. item 23)' $D232)"
echo "K13 $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K14 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K15 $(cd $S && npx biome lint --max-diagnostics=500 app/lib/arrangement app/contexts app/components/arrangement 2>&1 | grep -cE '^app/.* lint/')"
echo "K16 $(grep -rnE "(ArrangementSelectedClipReadout|ArrangementDetailPanelWithSelection|ArrangementDetailContent|ArrangementDetailWaveform|ArrangementTimeText)[A-Za-z]*'\)( \?\? 0\))?\)?\.toBeGreaterThan" $S/app --include=*.test.tsx 2>/dev/null | wc -l)"
echo "K17 $(for f in tasks/round-330.md c-round-330.json c-round-330.md a-round-330.md gates/gate-round-330.json gates/round-330/review.md b-round-330/sketch/sketch.patch.txt b-round-330/run-mutants.py b-round-330/mutants-summary.txt b-round-330/precheck-full.log b-round-330/sketch-typecheck.log b-round-330/new-rows-durations.txt b-round-330/perf-sketch-results/latest-interactions.json b-round-330/perf-rowcmp-vs-c330.txt b-round-330/names-sketch.json b-round-330/names-compare.txt b-round-330/covering-files.txt b-round-330/covering-unit.log b-round-329/perf-rowcmp.py b-round-328/names-probe.mjs b-round-318/protected-sha256.txt c-round-330/perf-interactions-atree-results/latest-interactions.json c-round-330/names-a.json; do test -f $f || echo MISSING:$f; done; echo checked)"
echo "K18 $(sed 's/\x1b\[[0-9;]*m//g' b-round-330/precheck-full.log 2>/dev/null | grep -E '^\s+Tests ' | tr -s ' ') $(grep -c '^rc=0' b-round-330/precheck-full.log) $(grep -c '^rc=0' b-round-330/sketch-typecheck.log)"
echo "K19 $(grep -c '"killed": true' b-round-330/mutants-summary.txt) $(grep -c '"restored": true, "all_killed": true' b-round-330/mutants-summary.txt)"
echo "K20 $(grep -c '^EQUAL' b-round-330/perf-rowcmp-vs-c330.txt 2>/dev/null) $(grep -c '^DIFF' b-round-330/perf-rowcmp-vs-c330.txt 2>/dev/null)"
echo "K21 $(grep -c -F '  clip: ArrangementClip;' $S/app/components/arrangement/ArrangementClip.tsx) $(grep -c -F 'export function clipLinearGain(clip: ArrangementClip): number {' $S/app/lib/arrangement/model.ts) $(grep -c -F 'export function clipWaveformScale(clip: ArrangementClip, isVideo: boolean, zoom: number): number {' $S/app/lib/arrangement/waveform-zoom.ts)"
echo "K22 $(grep -c 'useRef' $S/node_modules/zustand/esm/react/shallow.mjs)"
echo "K23 $(grep -c -F "toggleClipSelection(clip.id, isToggle ? 'toggle' : 'add');" $S/app/components/arrangement/ArrangementClip.tsx) $(grep -c -F 'const isToggle = event.ctrlKey || event.metaKey;' $S/app/components/arrangement/ArrangementClip.tsx)"
