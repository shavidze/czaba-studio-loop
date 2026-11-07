#!/usr/bin/env bash
# Claims for round 398 (PERF-14a). Run from the loop root: bash b-round-397/claims-398.sh
# Each line: K<n> <fact>. A runs it before editing; C runs it at SOURCE-SCOPE start (must equal
# b-round-397/claims-398-planning-output.txt) and at the end (only the facts in task section 7 may differ).
L=/home/runner/czaba-project/tmp/studio-real-loop
S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
B=$L/b-round-397
cd "$L" || exit 1
echo "K1 $(python3 -I -c "import json;g=json.load(open('gates/gate-round-397.json'));print(g['status'],g['commit'][:7])")"
echo "K2 $(git -C $S rev-parse --short HEAD) $(git -C $S status --porcelain | wc -l)"
echo "K3 $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K4 entries $(grep -c '' $B/r398-frozen-sha256.txt) failures $(cd $S && sha256sum -c --quiet $B/r398-frozen-sha256.txt 2>/dev/null | wc -l)"
echo "K5 $(python3 -I -c "import json;r=json.load(open('regression-last.json'));print(r['date'],r['round'])")"
echo "K6 doc254 $(test -e $S/docs/implementation/2026/quarter-IV/254-perf-scale-harness.md && echo exists || echo absent) last $(ls $S/docs/implementation/2026/quarter-IV | sort | tail -1)"
if test -e $S/docs/implementation/2026/quarter-IV/254-perf-scale-harness.md; then
  echo "K6b doc254 l4 $(sed -n 4p $S/docs/implementation/2026/quarter-IV/254-perf-scale-harness.md) headings $(grep -c '^## ' $S/docs/implementation/2026/quarter-IV/254-perf-scale-harness.md)"
fi
echo "K7 in-progress-docs $(grep -rln 'In Progress (stage' $S/docs/implementation | wc -l) pending $(grep -rn 'C round [0-9]* pending' $S/docs/implementation | wc -l)"
echo "K8 track-id-line $(grep -c 'data-track-id={track.id}' $S/app/components/arrangement/ArrangementLane.tsx) clip-count-attr $(grep -c 'data-clip-count={clips.length}' $S/app/components/arrangement/ArrangementLane.tsx) clip-count-sweep $(grep -rln 'data-clip-count' $S/app $S/perf $S/e2e 2>/dev/null | wc -l)"
echo "K9 lane-clips $(grep -c 'const clips = useArrangementPreviewLaneClips(arrangement, track.id);' $S/app/components/arrangement/ArrangementLane.tsx) lane-map $(grep -c '{clips.map((clip) => {' $S/app/components/arrangement/ArrangementLane.tsx)"
echo "K10 $(grep -n "testMatch\|workers\|baseURL" $S/playwright.perf.config.ts | tr -s ' ' | tr '\n' ' ')"
echo "K11 biome $(grep -o '"includes": \[[^]]*\]' $S/biome.json | tail -1) vitest $(grep -o "include: \[[^]]*\]" $S/vitest.config.ts)"
echo "K12 zoom-label $(grep -c "zoomSliderLabel: 'Zoom (px/s)'," $S/app/lib/arrangement/strings.ts) add-label $(grep -c "  add: 'Add'," $S/app/lib/arrangement/strings.ts) move-title $(grep -c 'moveTitle: (title: string): string => `${title} — drag to move`,' $S/app/lib/arrangement/strings.ts) audio-kind $(grep -c "data-clip-kind={isVideo ? 'video' : 'audio'}" $S/app/components/arrangement/ArrangementClip.tsx) ruler-testid $(grep -c 'data-testid="arrangement-ruler"' $S/app/components/arrangement/ArrangementRuler.tsx)"
echo "K13 perf-lib $(for e in 'export function installPerfInstrumentation' 'export const snapshot' 'export async function waitForQuiet' 'export const nowIn' 'export const blurActive' 'export async function waitForCollectionReady' 'export function percentile' 'export function buildPerfReportCore' 'export function loadPerfBudgets' 'export function rateRowId' 'export const perfZoomSliderLabel' 'export const perfLibraryAddLabel' 'export const perfMoveTitlePattern'; do printf '%s ' "$(grep -rc "$e" $S/perf/lib | awk -F: '{s+=$2} END {print s}')"; done)"
echo "K14 dom-locator-sweep $(cd $S && grep -rlE 'data-clip-kind|data-clip-id|audioClips\(|getAllByTestId\(.arrangement-clip|querySelectorAll\(.\[data-clip' app perf e2e --include=*.ts --include=*.tsx 2>/dev/null | grep -E '__tests__|^perf/|^e2e/' | wc -l)"
for f in probe/clips200.cjs probe/groups-drag.cjs probe/head-groups-drag-1440x900.json probe/head-groups-drag-1280x720.json probe/warm-30.json probe/head-200-1x-1440x900.json probe/head-200-6x-1440x900.json probe/head-200-1x-1280x720.json probe/head-200-6x-1280x720.json sweep-clip-dom-locators.txt covering-files.txt covering-vitest.txt gate397-slow-tests.txt mutants/run.py mutants/summary.txt mutants/mutant-MU-398-NO-ATTR.log mutants/mutant-MU-398-TOTAL.log mutants/mutant-MU-398-STALE.log precheck-full.log precheck-full-raw.log sketch-tsc.log sketch-biome.log sketch-398.patch.txt sketch-review.md grants-398.txt r398-frozen-sha256.txt consults.md l57-check-c397.txt; do test -f "$B/$f" || echo "K15 MISSING $f"; done; echo "K15 artifacts checked"
echo "K16 $(python3 -I -c "
import json
for vp in ('1440x900','1280x720'):
    for r in ('1','6'):
        d=json.load(open('$B/probe/head-200-'+r+'x-'+vp+'.json'))
        f=d['full']; m=d['minZoom']
        print(vp, r+'x', 'page', f['page'], 'mounted', f['clipsInDom'], 'subtree', f['clipSubtreeTotal'], 'inWin', f['clipsIntersectingWindow'], 'minZoomPage', m['page'], 'minZoomInWin', m['clipsIntersectingWindow'], 'keydownMax', d['keydownMax'], 'buildMs', d['ctrlDWallMs'], end='; ')
")"
echo "K17 sketch-sha $(sha256sum $B/sketch-398.patch.txt | cut -c1-16) applies-to-tree $(cd $S && git apply --check $B/sketch-398.patch.txt 2>/dev/null && echo yes || echo no) review-sha $(grep -o 'sha256 [0-9a-f]\{16\}' $B/sketch-review.md | head -1 | cut -d' ' -f2)"
echo "K18 new-files $(for f in app/lib/arrangement/__tests__/lane-clip-count.test.tsx perf/studio-lab-scale.perf.spec.ts perf/budgets.scale.json; do test -e $S/$f && printf 'exists ' || printf 'absent '; done)"
echo "K19 report-test-budget-refs $(grep -o "budgets[a-z.-]*\.json" $S/perf/lib/report.test.ts | sort -u | tr '\n' ' ')"
echo "K20 covering-vitest $(grep -c '' $B/covering-vitest.txt) slowest $(head -1 $B/gate397-slow-tests.txt | cut -d' ' -f1-2)"
echo "K21 mutants $(grep -c ' RED ' $B/mutants/summary.txt)/5 $(grep -c 'pristine' $B/mutants/summary.txt) pristine-lines"
echo "K22 ruler-windowed $(python3 -I -c "
import json
d=json.load(open('$L/c-round-396/perf-results/latest-resources.json'))
rows=d.get('rows') or d.get('results') or d
rows=list(rows.values()) if isinstance(rows,dict) else rows
v={r['id']:r.get('median') for r in rows if r.get('id','').startswith('res.dom.ruler')}
print(v)
")"
echo "K23 scale-ids $(test -e $S/perf/budgets.scale.json && python3 -I -c "import json;print(len(json.load(open('$S/perf/budgets.scale.json'))))" || echo none)"
echo "K24 sketch-precheck $(grep -E 'Test Files|Tests ' $B/precheck-full.log | tr -s ' ' | tr '\n' ' ')"
echo "K25 group-attrs $(grep -c 'data-group-id={group.id}' $S/app/components/arrangement/ArrangementGroupHeader.tsx) $(grep -c "data-group-collapsed={collapsed ? 'true' : undefined}" $S/app/components/arrangement/ArrangementGroupHeader.tsx) probe $(python3 -I -c "
import json
for vp in ('1440x900','1280x720'):
    d=json.load(open('$B/probe/head-groups-drag-'+vp+'.json'))
    b=lambda ls: '/'.join(str(l['clips']) for l in ls if l['id'] in ('music','stems'))
    print(vp,'groups',d['groupsAtReady']['groups'],'added',d['addedLane'],'target',d['target'],'dup',b(d['afterDup']),'held',b(d['held']),'released',b(d['released']),'undo',b(d['undone']),end='; ')
")"
