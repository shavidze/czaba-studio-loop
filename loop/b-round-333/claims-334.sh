#!/usr/bin/env bash
# Round 334 claims (L29 + L56). Run from the loop root. CLAIMS_STORE may override the store path.
L=$(pwd); S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
CL=$S/app/components/arrangement/ArrangementClip.tsx
DPANEL=$S/app/components/arrangement/ArrangementDetailPanel.tsx
WZ=$S/app/lib/arrangement/waveform-zoom.ts
MO=$S/app/lib/arrangement/model.ts
DP=$S/app/lib/arrangement/__tests__/drag-preview-render.test.tsx
WG=$S/app/lib/arrangement/__tests__/clip-gain-waveform.test.tsx
BUD=$S/perf/budgets.interactions.json
D232=$S/docs/implementation/2026/quarter-IV/232-perf-drag-preview.md
echo "K1 $(python3 -I -c "import json;a=json.load(open('gates/gate-round-333.json'));print(a['status'],a['commit'][:7])")"
echo "K2 $(git -C $S rev-parse --short HEAD 2>/dev/null || echo no-git) $(git -C $S status --short --untracked-files=all 2>/dev/null | wc -l)"
echo "K3 $(sed -n '/^interface ArrangementPeakPathProps {/,/^}/p' $CL | grep -c -F '  clip: ArrangementClip;') $(sed -n '/^interface ArrangementPeakPathProps {/,/^}/p' $CL | grep -c -E '^  (clipId: string|sourceOffset: number|duration: number|gainDb: number \| undefined);') $(grep -c -F 'waveformScaleForGainDb(draftGainDb ?? gainDb, isVideo, zoom)' $CL) $(grep -c -F 'export function waveformScaleForGainDb(' $WZ) $(grep -c -F 'export function gainDbLinearGain(gainDb: number | undefined): number {' $MO)"
echo "K4 $(grep -c -F '<ArrangementPeakPath clip={clip} peaks={peaks} columns={DETAIL_PEAK_COLUMNS} />' $DPANEL) $(grep -c -F 'clipId={clip.id}' $CL) $(grep -c -F 'clipId={clip.id}' $DPANEL)"
echo "K5 $(grep -c -F 'export const ArrangementPeakPath = memo(ArrangementPeakPathInner);' $CL) $(grep -c -F 'const draftGainDb = useMixDraftValue(clipGainDraftKey(' $CL)"
echo "K6 $(grep -rl 'clipWaveformScale' $S/app --include=*.ts --include=*.tsx | grep -v __tests__ | sed "s#$S/##" | tr '\n' ' ')"
echo "K7 $(grep -c 'expect(' $DP) $(grep -c -E "^\s+it\('DP" $DP) $(grep -c -E "it\('DP4[3-8] " $DP) $(grep -c 'expect(' $WG) $(grep -c -E "it\('WG(9|10): " $WG)"
echo "K8 $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K9 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K10 $(cd $S && npx biome lint --max-diagnostics=500 app/lib/arrangement app/contexts app/components/arrangement 2>&1 | grep -cE '^app/.* lint/')"
echo "K11 $(sed -n 4p $D232)"
echo "K12 $(sed -n 1p $D232 | grep -c 'c2b-iii') $(sed -n 5p $D232 | grep -c 'waveform-zoom.ts') $(grep -c -F '### ეტაპი c2b-iii' $D232) $(grep -c '^## ' $D232)"
echo "K13 $(python3 -I -c "import json,sys;b=[r for r in json.load(open(sys.argv[1])) if r['id']=='interact.harness.hook-live'][0];print(b['mode'],b['budget']['op'],b['budget']['value'])" $BUD)"
echo "K14 $(for f in tasks/round-333.md c-round-333.json c-round-333.md a-round-333.md gates/gate-round-333.json gates/round-333/review.md b-round-333/sketch/sketch.patch.txt b-round-333/run-mutants.py b-round-333/mutants-summary.txt b-round-333/sketch-typecheck.log b-round-333/biome-sketch.log b-round-333/covering-files.txt b-round-333/covering-unit.log b-round-333/new-rows-durations.txt b-round-333/perf-sketch-results/latest-interactions.json b-round-333/perf-rowcmp-vs-c333.txt b-round-333/names-sketch.json b-round-333/names-compare.txt b-round-333/names-warmup.log b-round-333/waveform-d-probe.mjs b-round-333/wd-compare.py b-round-333/wd-compare.txt b-round-333/wd-head-1440.json b-round-333/wd-head-1280.json b-round-333/wd-sketch-1440.json b-round-333/wd-sketch-1280.json b-round-329/perf-rowcmp.py b-round-328/names-probe.mjs b-round-328/rows.mjs b-round-328/rows-diff.py b-round-318/protected-sha256.txt c-round-333/perf-interactions-atree-results/latest-interactions.json c-round-333/names-a.json c-round-330/g330-auth.cjs; do test -f $f || echo MISSING:$f; done; echo checked)"
echo "K15 $(sed 's/\x1b\[[0-9;]*m//g' b-round-333/covering-unit.log 2>/dev/null | grep -E '^\s+Tests ' | tr -s ' ') $(wc -l < b-round-333/covering-files.txt)"
echo "K16 $(grep -c '"restored": true' b-round-333/mutants-summary.txt) $(grep -c '"red": \[\]' b-round-333/mutants-summary.txt)"
echo "K17 $(grep -c '^EQUAL' b-round-333/perf-rowcmp-vs-c333.txt) $(grep -c '^DIFF' b-round-333/perf-rowcmp-vs-c333.txt)"
echo "K18 $(grep -rn '<ArrangementPeakPath$\|<ArrangementPeakPath ' $S/app --include=*.tsx | grep -v __tests__ | wc -l) $(git -C $S diff --quiet -- app/components/arrangement/StudioWorkspace.tsx app/contexts/ArrangementContext.tsx app/components/arrangement/ArrangementLane.tsx perf && echo untouched || echo changed)"
echo "K19 $(grep -c 'DIFFS 0' b-round-333/wd-compare.txt) $(grep -c 'EQUAL$' b-round-333/wd-compare.txt)"
