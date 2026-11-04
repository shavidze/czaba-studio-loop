#!/usr/bin/env bash
# Round 333 claims (L29 + L56). Run from the loop root. CLAIMS_STORE may override the store path.
L=$(pwd); S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
DPANEL=$S/app/components/arrangement/ArrangementDetailPanel.tsx
CL=$S/app/components/arrangement/ArrangementClip.tsx
WS=$S/app/components/arrangement/StudioWorkspace.tsx
DP=$S/app/lib/arrangement/__tests__/drag-preview-render.test.tsx
BUD=$S/perf/budgets.interactions.json
D232=$S/docs/implementation/2026/quarter-IV/232-perf-drag-preview.md
echo "K1 $(python3 -I -c "import json;a=json.load(open('gates/gate-round-332.json'));print(a['status'],a['commit'][:7])")"
echo "K2 $(git -C $S rev-parse --short HEAD 2>/dev/null || echo no-git) $(git -C $S status --short --untracked-files=all 2>/dev/null | wc -l)"
echo "K3 $(grep -c -F '    setStartText(rangeInputText(onClipStart ?? clipStart));' $DPANEL) $(grep -c 'useIsomorphicLayoutEffect' $DPANEL) $(grep -c -F 'if (!isSameDetailRangeTextSource(syncedRangeTextSource, rangeTextSource)) {' $DPANEL) $(grep -c -F 'function detailRangeTexts(source: DetailRangeTextSource)' $DPANEL)"
echo "K4 $(grep -c -F '  if (syncedClipGainText !== displayedClipGainText) {' $DPANEL) $(grep -c -F "          key={selection?.clip.id ?? (group ? 'group' : 'none')}" $DPANEL)"
echo "K5 $(grep -c -F '  return String(Math.round(value * 1000) / 1000);' $DPANEL) $(grep -c -F 'const ArrangementDetailContent = memo(ArrangementDetailContentInner);' $DPANEL)"
echo "K6 $(grep -c -F 'export const ArrangementPeakPath = memo(ArrangementPeakPathInner);' $CL) $(grep -c -F '<ArrangementPeakPath clip={clip} peaks={peaks} columns={DETAIL_PEAK_COLUMNS} />' $DPANEL)"
echo "K7 $(grep -c 'expect(' $DP) $(grep -c -E "^\s+it\('DP" $DP) $(grep -c -E "it\('DP(3[3-9]|4[0-2]) " $DP)"
echo "K8 $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K9 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K10 $(cd $S && npx biome lint --max-diagnostics=500 app/lib/arrangement app/contexts app/components/arrangement 2>&1 | grep -cE '^app/.* lint/')"
echo "K11 $(sed -n 4p $D232)"
echo "K12 $(sed -n 1p $D232 | grep -c 'c2b-ii') $(sed -n 5p $D232 | grep -c 'ArrangementDetailPanel.tsx') $(grep -c -F '### ეტაპი c2b-ii' $D232) $(grep -c '^## ' $D232)"
echo "K13 $(python3 -I -c "import json,sys;b=[r for r in json.load(open(sys.argv[1])) if r['id']=='interact.harness.hook-live'][0];print(b['mode'],b['budget']['op'],b['budget']['value'])" $BUD)"
echo "K14 $(for f in tasks/round-332.md c-round-332.json c-round-332.md a-round-332.md gates/gate-round-332.json gates/round-332/review.md b-round-332/sketch/sketch.patch.txt b-round-332/sketch/sketch-v1.patch.txt b-round-332/run-mutants.py b-round-332/mutants-summary.txt b-round-332/mutants-summary-v1.txt b-round-332/sketch-typecheck.log b-round-332/biome-sketch.log b-round-332/covering-files.txt b-round-332/covering-unit.log b-round-332/new-rows-durations.txt b-round-332/perf-sketch-results/latest-interactions.json b-round-332/perf-sketch-results-v1/latest-interactions.json b-round-332/perf-rowcmp-vs-c332.txt b-round-332/perf-rowcmp-vs-c332-v1.txt b-round-332/names-sketch.json b-round-332/names-compare.txt b-round-329/perf-rowcmp.py b-round-328/names-probe.mjs b-round-328/rows.mjs b-round-328/rows-diff.py b-round-318/protected-sha256.txt c-round-332/perf-interactions-atree-results/latest-interactions.json c-round-332/names-a.json c-round-330/g330-auth.cjs; do test -f $f || echo MISSING:$f; done; echo checked)"
echo "K15 $(sed 's/\x1b\[[0-9;]*m//g' b-round-332/covering-unit.log 2>/dev/null | grep -E '^\s+Tests ' | tr -s ' ') $(wc -l < b-round-332/covering-files.txt)"
echo "K16 $(grep -c '"restored": true' b-round-332/mutants-summary.txt) $(grep -c '"red": \[\]' b-round-332/mutants-summary.txt)"
echo "K17 $(grep -c '^EQUAL' b-round-332/perf-rowcmp-vs-c332.txt 2>/dev/null) $(grep -c '^DIFF' b-round-332/perf-rowcmp-vs-c332.txt 2>/dev/null)"
echo "K18 $(grep -c -F 'ArrangementDetailContentInner' $WS) $(git -C $S diff --quiet -- app/components/arrangement/StudioWorkspace.tsx app/components/arrangement/ArrangementClip.tsx app/contexts/ArrangementContext.tsx && echo untouched || echo changed)"
