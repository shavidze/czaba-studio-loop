#!/usr/bin/env bash
# Round 332 claims (L29 + L56). Run from the loop root. CLAIMS_STORE may override the store path.
L=$(pwd); S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
WS=$S/app/components/arrangement/StudioWorkspace.tsx
PS=$S/app/lib/arrangement/preview-store.ts
CL=$S/app/components/arrangement/ArrangementClip.tsx
TM=$S/app/components/arrangement/ArrangementTrackMeter.tsx
LANE=$S/app/components/arrangement/ArrangementLane.tsx
OV=$S/app/components/arrangement/ArrangementOverview.tsx
DPANEL=$S/app/components/arrangement/ArrangementDetailPanel.tsx
DP=$S/app/lib/arrangement/__tests__/drag-preview-render.test.tsx
PST=$S/app/lib/arrangement/__tests__/preview-store.test.ts
TMT=$S/app/lib/arrangement/__tests__/track-meter-ui.test.tsx
CTX=$S/app/contexts/ArrangementContext.tsx
TY=$S/app/types/arrangement.ts
D232=$S/docs/implementation/2026/quarter-IV/232-perf-drag-preview.md
echo "K1 $(python3 -I -c "import json;a=json.load(open('gates/gate-round-331.json'));print(a['status'],a['commit'][:7])")"
echo "K2 $(git -C $S rev-parse --short HEAD 2>/dev/null || echo no-git) $(git -C $S status --short --untracked-files=all 2>/dev/null | wc -l)"
echo "K3 $(grep -c -F '  const shownArrangement = useArrangementPreview((state) =>' $WS) $(grep -c -F '      sameOverviewArrangementShownFields,' $WS) $(grep -c -F 'function useEqualityStableSelector<State, Selected>(' $WS)"
echo "K4 $(grep -c -F 'export function ArrangementTrackMeter({ trackId, trackName }: ArrangementTrackMeterProps) {' $TM) $(grep -c -F 'export const ArrangementTrackMeter = memo(ArrangementTrackMeterInner);' $TM) $(grep -c -F '<ArrangementTrackMeter trackId={track.id} trackName={track.name} />' $LANE)"
echo "K5 $(grep -c -F 'export const ArrangementPeakPath = memo(ArrangementPeakPathInner);' $CL) $(cat $CL $PS | grep -c 'samePeakPathProps\|PEAK_PATH_CLIP_FIELD_ROLES') $(grep -c -F '<ArrangementPeakPath' $CL) $(grep -c -F '<ArrangementPeakPath' $DPANEL)"
echo "K6 $(grep -c -F 'buildPeakShape(peaks, clip.sourceOffset, clip.duration, columns, scale)' $CL) $(grep -c -F 'useMixDraftValue(clipGainDraftKey(clip.id))' $CL) $(grep -c -F "return clip.gainDb === undefined ? 1 : 10 ** (clip.gainDb / 20);" $S/app/lib/arrangement/model.ts)"
echo "K7 $(grep -c -E 'fadeIn|fadeOut|envelope|gainDb|sourceOffset|sourceId' $OV) $(grep -c -F '.filter((clip) => clip.trackId === track.id)' $OV) $(grep -c -F 'left: `${(clip.start / extent) * 100}%`,' $OV) $(grep -c -F 'width: `max(2px, ${(clip.duration / extent) * 100}%)`,' $OV)"
echo "K8 $(grep -c -F 'return useStore(useArrangementPreviewStore(), selector);' $CTX)"
echo "K9 $(grep -c -F 'setStartText(rangeInputText(onClipStart ?? clipStart));' $DPANEL) $(grep -c 'useIsomorphicLayoutEffect' $DPANEL)"
echo "K10 $(sed -n '/^export interface ArrangementClip {/,/^}/p' $TY | grep -c -E '^  [a-zA-Z]+\??:')"
echo "K11 $(grep -c 'expect(' $DP) $(grep -c -E "^\s+it\('DP" $DP) $(grep -c -E "it\('DP(29|3[0-2]) " $DP) $(grep -c 'expect(' $PST) $(grep -c -E "it\('PS-(OVR-ROLES|OVR-ARR) " $PST) $(grep -c 'expect(' $TMT)"
echo "K12 $(grep -c -F "renderLog.counts.get('ArrangementTrackMeter')" $TMT) $(grep -c -F "renderLog.counts.get('ArrangementTrackMeterInner')" $TMT)"
echo "K13 $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K14 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K15 $(cd $S && npx biome lint --max-diagnostics=500 app/lib/arrangement app/contexts app/components/arrangement 2>&1 | grep -cE '^app/.* lint/')"
echo "K16 $(sed -n 4p $D232)"
echo "K17 $(sed -n 1p $D232 | grep -c 'c2b-i') $(grep -c -F 'დარჩენილია c2 (' $D232) $(grep -c -F '(`id`, `trackId`, `start`, `duration`, `gainDb`)' $D232) $(grep -c -F '### ეტაპი c2b-i' $D232)"
echo "K18 $(for f in tasks/round-331.md c-round-331.json c-round-331.md a-round-331.md gates/gate-round-331.json gates/round-331/review.md b-round-331/sketch/sketch.patch.txt b-round-331/run-mutants.py b-round-331/mutants-summary.txt b-round-331/sketch-typecheck.log b-round-331/covering-files.txt b-round-331/covering-unit.log b-round-331/meter-name-probe.txt b-round-331/new-rows-durations.txt b-round-331/perf-sketch-results/latest-interactions.json b-round-331/perf-sketch-results-v1-comparator/latest-interactions.json b-round-331/perf-rowcmp-vs-c331-v1-comparator.txt b-round-331/names-sketch-v1-comparator.json b-round-331/sketch/sketch-v1-comparator.patch.txt b-round-331/mutants-summary-v1-comparator.txt b-round-331-checkpoint-addendum.md b-round-331/perf-rowcmp-vs-c331.txt b-round-331/names-sketch.json b-round-331/names-compare.txt b-round-329/perf-rowcmp.py b-round-328/names-probe.mjs b-round-328/rows.mjs b-round-328/rows-diff.py b-round-318/protected-sha256.txt c-round-331/perf-interactions-atree-results/latest-interactions.json c-round-331/names-a.json c-round-330/g330-auth.cjs; do test -f $f || echo MISSING:$f; done; echo checked)"
echo "K19 $(sed 's/\x1b\[[0-9;]*m//g' b-round-331/covering-unit.log 2>/dev/null | grep -E '^\s+Tests ' | tr -s ' ') $(wc -l < b-round-331/covering-files.txt)"
echo "K20 $(grep -c '"killed": true' b-round-331/mutants-summary.txt) $(grep -c '"restored": true, "all_killed": true' b-round-331/mutants-summary.txt)"
echo "K21 $(grep -c '^EQUAL' b-round-331/perf-rowcmp-vs-c331.txt 2>/dev/null) $(grep -c '^DIFF' b-round-331/perf-rowcmp-vs-c331.txt 2>/dev/null)"
echo "K22 $(grep -c '^DBG ArrangementTrackMeter2 ' b-round-331/meter-name-probe.txt)"
