#!/usr/bin/env bash
# B round 363 -> 364 claims (PERF-10b-ii-b re-dispatch; C-R363-01/02). Run from the loop root. CLAIMS_STORE overrides the store path (scratch).
L=/home/runner/czaba-project/tmp/studio-real-loop
S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
BJ=$S/perf/budgets.interactions.json
SP=$S/perf/studio-lab-interactions.perf.spec.ts
RB=$S/app/lib/arrangement/__tests__/render-budget.test.tsx
DP=$S/app/lib/arrangement/__tests__/drag-preview-render.test.tsx
DPN=$S/app/components/arrangement/ArrangementDetailPanel.tsx
SW=$S/app/components/arrangement/StudioWorkspace.tsx
AC=$S/app/components/arrangement/ArrangementClip.tsx
CTX=$S/app/contexts/ArrangementContext.tsx
RS=$S/app/lib/arrangement/range-store.ts
D4=$S/docs/implementation/2026/quarter-IV/234-perf-playback-store.md
D168=$S/docs/implementation/2026/quarter-IV/168-perf-interactions-baseline.md
echo "K1 $(python3 -I -c "import json;g=json.load(open('$L/gates/gate-round-362.json'));h=json.load(open('$L/gates/gate-round-363.json'));print('g362',g['status'],g['commit'][:7],'g363',h['status'],h['reason'].replace(' ','_'))")"
if [ -d "$S/.git" ] && [ -z "${CLAIMS_STORE:-}" ]; then
  echo "K2 $(git -C $S rev-parse --short HEAD) $(git -C $S status --short --untracked-files=all | wc -l)"
else echo "K2 scratch n/a"; fi
echo "K3 $(python3 -I -c "
import json
d=json.load(open('$BJ'))
bg=[r for r in d if 'background-range' in r['id']]
print('rows',len(d),'asserted',sum(r['mode']=='assert' for r in d),'bg-rows',len(bg),'bg-record',sum(r['mode']=='record' and r['budget'] is None for r in bg),'bg-owner',len({r['owner'] for r in bg}) and ','.join(sorted({r['owner'] for r in bg})) or '-')
")"
echo "K4 budgets-sha $(sha256sum $BJ | cut -c1-12)"
echo "K5 memo playhead $(grep -c '^const ArrangementDetailPlayhead = memo(ArrangementDetailPlayheadInner);$' $DPN) waveform $(grep -c '^const ArrangementDetailWaveform = memo(ArrangementDetailWaveformInner);$' $DPN) readout $(grep -c '^const ArrangementRangeReadout = memo(ArrangementRangeReadoutInner);$' $SW) peakpath $(grep -c '^export const ArrangementPeakPath = memo(ArrangementPeakPathInner);$' $AC)"
echo "K6 $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K7 rb-memo-rows $(grep -cE "it\('RB-MEMO[123] " $RB) rb-tests $(grep -cE "^  it\(" $RB) rb-sha $(sha256sum $RB | cut -c1-12)"
echo "K8 package.json-sha $(sha256sum $S/package.json | cut -c1-12)"
echo "K9 perf-lib-sha $(cd $S && find perf/lib -type f | sort | xargs sha256sum | sha256sum | cut -c1-12) other-specs-sha $(cd $S && sha256sum perf/studio-lab.perf.spec.ts perf/studio-lab-resources.perf.spec.ts perf/budgets.json perf/budgets.resources.json | sha256sum | cut -c1-12) perf-lib-files $(cd $S && find perf/lib -type f | wc -l)"
echo "K10 cited $(for f in b-round-362/sketch.patch.txt b-round-362/mutate.py b-round-362/mutants/MU-P-render-budget.log b-round-362/mutants/MU-W-render-budget.log b-round-362/mutants/MU-R-render-budget.log b-round-362/sketch-render-budget.log b-round-362/sketch-biome.log b-round-362/sketch-typecheck.log b-round-363/sketch-perflib.patch.txt b-round-363/sketch-perflib-dispatched.sha256 b-round-363/sketch-perf-lib.log b-round-363/mutants/MU-K-perf-lib.log b-round-363/mutants/MU-N-perf-lib.log b-round-363/mutants/summary.txt b-round-363/sketch-typecheck.log b-round-363/im-probe.mjs b-round-363/im-probe-1440x900.json b-round-363/im-probe-1280x720.json b-round-363/im-probe2.mjs b-round-363/im-probe2-1440x900.json b-round-363/im-probe2-1280x720.json c-round-363/latest-interactions.json c-round-363/perf-lib.log c-round-363/bg.mjs a-round-363/latest-interactions.json a-round-363/claims-final.txt b-round-329/perf-rowcmp.py b-round-334/vitest.perf-lib.config.mjs c-round-358/auth.mjs tools/l57-check.py b-round-318/protected-sha256.txt; do [ -f $L/$f ] || echo MISSING:$f; done | wc -l) missing"
echo "K11 all-tracks-writers ctx $(grep -c 'allTracks: true' $CTX) workspace-bg-range-sets-allTracks $(sed -n '/const updateRange = (clientX: number, altKey: boolean)/,/^      };$/p' $SW | grep -c 'allTracks') lane-selector-allTracks-branch $(grep -c 'if (range.allTracks === true) {' $RS)"
echo "K12 spec bg-mentions $(grep -c 'background-range' $SP) dragNames $(grep -c "^const dragNames: DragName\[\] = \['range', 'fade', 'trim', 'move'\];$" $SP) lane-drag-stopped-step $(grep -c "step = 'drag lane stopped';" $SP) spec-sha $(sha256sum $SP | cut -c1-12)"
echo "K13 doc-q4-files $(ls $S/docs/implementation/2026/quarter-IV/ | wc -l) pending $(grep -rl 'C round [0-9]* pending' $S/docs/implementation | wc -l)"
echo "K14 doc234-l4 $(sed -n 4p $D4 | md5sum | cut -c1-8) doc234-h2 $(grep -c '^## ' $D4) doc234-stage5 $(grep -c '^### ეტაპი 5: PERF-10b-ii-b (rounds 363–364, D-29z1182, D-29z1187)$' $D4) mermaid-old-T-edge $(grep -c 'S -->|useArrangementIsPlaying| T\[ArrangementTransport\]' $D4) mermaid-old-M-edge $(grep -c 'S -->|getState, event time| M\[ArrangementMarkerRow callback\]' $D4) dc-kinds-mention $(grep -c 'DC-KINDS' $D4)"
echo "K15 dp-peakpath-guards $(grep -cE "it\('DP4[3-8] " $DP) dp-waveform-positive $(grep -c "expect(rendersOf('ArrangementDetailWaveformInner')).toBeGreaterThan(0);" $DP)"
echo "K16 doc168-seq-heading $(grep -c '^### Pass-ის თანმიმდევრობა$' $D168) doc168-l4 $(sed -n 4p $D168 | md5sum | cut -c1-8) doc168-bg $(grep -c 'background-range' $D168)"
echo "K17 detail-start-testid $(grep -c 'data-testid="arrangement-detail-start"' $DPN) detail-range-testid $(grep -c 'data-testid="arrangement-detail-range"' $DPN) range-readout-testid $(grep -c 'data-testid="arrangement-range"' $SW)"
AL=$S/app/components/arrangement/ArrangementLane.tsx
MK=$S/app/lib/arrangement/markers.ts
echo "K18 lane-range-testid $(grep -c 'data-testid="arrangement-lane-range"' $AL) clip-nonrange-clears-range $(grep -c "if (kind !== 'range') {" $AC) clip-seekTo-calls $(grep -c '          seekTo($' $AC) clip-setInsertMarker $(grep -c 'setInsertMarker' $AC) empty-lane-callers $(grep -c 'await emptyLanePointAfterClip(' $SP) marker-eps $(grep -c '^export const MARKER_TIME_EPS = 0.0005;$' $MK) marker-back-null $(grep -c 'return position > MARKER_TIME_EPS ? { time: 0, marker: null } : null;' $MK)"
RT=$S/perf/lib/report.test.ts
echo "K19 dc-kinds-regex-new $(grep -cF '/^interact\.drag\.(range|fade|trim|move|background-range)\.(stopped|playing)\.commits-per-move(\.6x)?$/;' $RT) dc-kinds-regex-old $(grep -cF '/^interact\.drag\.(range|fade|trim|move)\.(stopped|playing)\.commits-per-move(\.6x)?$/;' $RT) drag-len-18 $(grep -c 'expect(drag).toHaveLength(18);' $RT) drag-len-16 $(grep -c 'expect(drag).toHaveLength(16);' $RT) report-test-sha $(sha256sum $RT | cut -c1-12)"
echo "K20 spec insert-marker-reads $(grep -c 'data-insert-marker' $SP) bg-fn $(grep -c '^async function measureBackgroundRangeDrag(' $SP) bg-grab-fn $(grep -c '^async function backgroundRangeGrabPoint(' $SP) selected-before $(grep -c 'selectedBefore' $SP) im-testid $(grep -c 'data-testid="arrangement-insert-marker"' $SW) im-attr $(grep -c 'data-insert-marker={position.toFixed(3)}' $SW)"
