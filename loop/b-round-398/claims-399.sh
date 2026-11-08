#!/usr/bin/env bash
# Claims for round 399 (PERF-14b-i: harness readiness; lane sketch facts K21/K22/K25 are 14b-ii evidence). Run from the loop root: bash b-round-398/claims-399.sh
# Each line: K<n> <fact>. A runs it before editing; C runs it at SOURCE-SCOPE start (must equal
# b-round-398/claims-399-planning-output.txt) and at the end (only the facts in task section 7 may differ).
L=/home/runner/czaba-project/tmp/studio-real-loop
S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
B=$L/b-round-398
LANE=$S/app/components/arrangement/ArrangementLane.tsx
cd "$L" || exit 1
echo "K1 $(python3 -I -c "import json;g=json.load(open('gates/gate-round-398.json'));print(g['status'],g['commit'][:7])")"
echo "K2 $(git -C $S rev-parse --short HEAD) $(git -C $S status --porcelain | wc -l)"
echo "K3 $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K4 entries $(grep -c '' $B/r399-frozen-sha256.txt) failures $(cd $S && sha256sum -c --quiet $B/r399-frozen-sha256.txt 2>/dev/null | wc -l)"
echo "K5 $(python3 -I -c "import json;r=json.load(open('regression-last.json'));print(r['date'],r['round'])")"
echo "K6 doc255 $(test -e $S/docs/implementation/2026/quarter-IV/255-perf-harness-model-count.md && echo exists || echo absent) last $(ls $S/docs/implementation/2026/quarter-IV | sort | tail -1)"
if test -e $S/docs/implementation/2026/quarter-IV/255-perf-harness-model-count.md; then
  echo "K6b doc255 l4 $(sed -n 4p $S/docs/implementation/2026/quarter-IV/255-perf-harness-model-count.md) headings $(grep -c '^## ' $S/docs/implementation/2026/quarter-IV/255-perf-harness-model-count.md)"
fi
echo "K7 in-progress-docs $(grep -rln 'In Progress (stage' $S/docs/implementation | wc -l) pending $(grep -rn 'C round [0-9]* pending' $S/docs/implementation | wc -l) doc254-l4 $(sed -n 4p $S/docs/implementation/2026/quarter-IV/254-perf-scale-harness.md)"
echo "K8 lane clip-count-attr $(grep -c 'data-clip-count={clips.length}' $LANE) clips-map $(grep -c '{clips.map((clip) => {' $LANE) mounted-map $(grep -c '{mountedClips.map((clip) => {' $LANE) lane-uSES $(grep -c 'useSyncExternalStore' $LANE) capture $(grep -c 'onPointerDownCapture' $LANE) lane-move-key $(grep -c 'const laneMoveSourceKey = useArrangementClipLaneDrag' $LANE) body-bg-pointerdown $(grep -c 'onPointerDown={(event) => onBackgroundPointerDown(event, track.id)}' $LANE)"
echo "K9 view-exports $(for e in 'export function readTimelinePage' 'export function timelinePageKey' 'export function getServerTimelinePageKey' 'export function parseTimelinePageKey' 'export function spanInTimelineWindow' 'export function timelinePageWindow'; do printf '%s ' "$(grep -c "$e" $S/app/lib/arrangement/view.ts)"; done) window-pages $(grep -c 'fromPx: (timelinePage.page - 1) \* timelinePage.viewportPx' $S/app/lib/arrangement/view.ts)/$(grep -c 'toPx: (timelinePage.page + 2) \* timelinePage.viewportPx' $S/app/lib/arrangement/view.ts) clip-window-sub $(grep -c 'timelineWindow?.subscribeTimelineScroll ?? noWindowSubscription' $S/app/components/arrangement/ArrangementClip.tsx)"
echo "K10 clip-focusables $(cat $S/app/components/arrangement/ArrangementClip.tsx $S/app/components/arrangement/ArrangementClipEnvelope.tsx | grep -cE '<button|tabIndex|<input|<select|<a |contentEditable|role=\"(button|slider|checkbox)\"')"
echo "K11 app-clip-dom-reach $(cd $S && grep -rnE "querySelector(All)?\([^)]*data-clip-(id|kind)|closest[^(]*\([^)]*data-clip-id" app --include=*.ts --include=*.tsx | grep -v __tests__ | cut -d: -f1 | sort | uniq -c | tr -s ' ' | tr '\n' ';')"
echo "K12 header-testid $(grep -c 'data-testid="arrangement-track-header"' $LANE) sticky-left0 $(grep -c "'sticky left-0 z-20 flex min-h-0 shrink-0 flex-col" $LANE) scroller-testid $(grep -rc 'data-testid="arrangement-timeline-scroller"' $S/app/components/arrangement/StudioWorkspace.tsx)"
echo "K13 ctx setClipLaneDrag $(grep -c '  setClipLaneDrag: (next: ClipLaneDragState | null) => void;' $S/app/contexts/ArrangementContext.tsx) selectAllClips $(grep -c '  selectAllClips: () => void;' $S/app/contexts/ArrangementContext.tsx) move-source-filter $(grep -c 'drag.ghosts.some((ghost) => ghost.clipId === clipId && !ghost.blocked)' $S/app/lib/arrangement/clip-lane-drag-store.ts)"
echo "K14 dom-locator-sweep $(cd $S && grep -rlE 'data-clip-kind|data-clip-id|audioClips\(|getAllByTestId\(.arrangement-clip|querySelectorAll\(.\[data-clip' app perf e2e --include=*.ts --include=*.tsx 2>/dev/null | grep -E '__tests__|^perf/|^e2e/' | wc -l)"
for f in sketch-399-harness.patch.txt sketch-14bii-lane.patch.txt sketch-14bii-budget-flips.patch.txt sketch-14b-combined.patch.txt sketch-review.md sketch-tsc.log sketch-biome.log grants-399.txt r399-frozen-sha256.txt mutants/run.py mutants/summary.txt precheck-full-v1.log perf-sketch-scale-run1.log perf-sketch-scale-run2.log perf-sketch-scale-run2.json perf-sketch-scale-mutant-no-filter.log perf-sketch-scale-mutant-shifted-window.log perf-sketch-others.txt perf-sketch-studio-lab-resources.log perf-sketch-studio-lab-interactions.log perf-head-interactions.log perf-head-interactions.json perf-head-harness-scale.log perf-head-harness-scale.json head-interactions-deterministic.txt head-resources-deterministic.txt head-scale-deterministic.txt perf-dom-clip-grep.txt probe/frames200.cjs probe/sketch-frames-1440x900.json probe/sketch-frames-1280x720.json covering-vitest-14bii.txt head-perf-lib-vitest.log consults.md perf-head-interactions-run2.log perf-head-interactions-run2.json interactions-run-control.txt resources-run-control.txt l57-check-c398.txt; do test -f "$B/$f" || echo "K15 MISSING $f"; done; echo "K15 artifacts checked"
echo "K16 head-baselines interactions $(python3 -I -c "import json;d=json.load(open('$B/perf-head-interactions.json'));r=d['rows'];print(d['complete'],len(r),sum(1 for x in r if x['kind']=='deterministic'))") resources $(python3 -I -c "import json;d=json.load(open('$L/c-round-398/perf-results/latest-resources.json'));r=d['rows'];print(d['complete'],len(r),sum(1 for x in r if x['kind']=='deterministic'))") head-harness-scale $(python3 -I -c "import json;d=json.load(open('$B/perf-head-harness-scale.json'));print(d['failures'],[p['problems'] for p in d['passes']],{x['id']:x['median'] for x in d['rows'] if x['id'] in ('scale.dom.page','scale.clips.mounted','scale.clips.in-window.min-zoom-mid')})") sketch-scale-run2 $(python3 -I -c "
import re
t=open('$B/perf-sketch-scale-run2.log').read()
for i in ('scale.dom.page ','scale.dom.page.min-zoom ','scale.dom.page.min-zoom-mid ','scale.zoom.components-per-key ','scale.scroll.components-per-step '):
    m=re.search(re.escape(i)+r'\s+(\w+) median\s+(\S+)',t)
    print(i.strip(),m.group(2),end='; ')
")"
echo "K16b nofilter-fails $(grep -c 'FAIL$' $B/perf-sketch-scale-mutant-no-filter.log) shifted-gap $(grep -cE 'no clip in the lane area|left edge|right edge|hole between' $B/perf-sketch-scale-mutant-shifted-window.log)"
echo "K17 harness-sha $(sha256sum $B/sketch-399-harness.patch.txt | cut -c1-16) applies-to-tree $(cd $S && git apply --check $B/sketch-399-harness.patch.txt 2>/dev/null && echo yes || echo no) lane-sha $(sha256sum $B/sketch-14bii-lane.patch.txt | cut -c1-16) lane-applies $(cd $S && git apply --check $B/sketch-14bii-lane.patch.txt 2>/dev/null && echo yes || echo no) review-sha $(grep -o 'sha256 [0-9a-f]\{16\}' $B/sketch-review.md | head -1 | cut -d' ' -f2)"
echo "K18 new-files $(for f in docs/implementation/2026/quarter-IV/255-perf-harness-model-count.md; do test -e $S/$f && printf 'exists ' || printf 'absent '; done)"
echo "K19 percentile $(grep -c 'return sorted\[Math.min(sorted.length - 1, Math.floor(sorted.length \* fraction))\];' $S/perf/lib/stats.ts) zoom-keys $(grep -c 'const zoomKeyCount = 5;' $S/perf/studio-lab-scale.perf.spec.ts)"
echo "K20 perf-dom-clip-grep $(cd $S && grep -rnE 'audioClips\(|videoClips\(|toHaveCount\(|data-clip-start|data-clip-kind|data-clip-id|\[data-clip' perf --include=*.ts | wc -l) per-file $(cd $S && grep -rnE 'audioClips\(|videoClips\(|toHaveCount\(|data-clip-start|data-clip-kind|data-clip-id|\[data-clip' perf --include=*.ts | cut -d: -f1 | sort | uniq -c | tr -s ' ' | tr '\n' ';') page-audioClips $(grep -c "export const audioClips = (page: Page): Locator => page.locator('\[data-clip-kind=\"audio\"\]');" $S/perf/lib/page.ts) model-helper $(grep -c 'modelClipCount' $S/perf/lib/page.ts)"
echo "K21 mutants $(grep -c ' RED ' $B/mutants/summary.txt)/7 $(grep -c 'pristine' $B/mutants/summary.txt) pristine-lines"
echo "K22 frames $(python3 -I -c "
import json
for vp in ('1440x900','1280x720'):
    d=json.load(open('$B/probe/sketch-frames-'+vp+'.json'))
    print(vp,'frames',d['frames']['n'],'gapFrames',d['frames']['gapFrames'],'selectAllMounted',d['selectAll']['mounted'],'heldMounted',d['heldMounted'],'model',d['modelAfter'],'errors',len(d['pageErrors']),end='; ')
")"
echo "K23 scale-asserts $(test -e $S/perf/budgets.scale.json && python3 -I -c "import json;r=json.load(open('$S/perf/budgets.scale.json'));print(len(r),sum(1 for x in r if x['mode']=='assert'))" || echo none)"
echo "K24 lane-sketch-precheck-v1 $(grep -E 'Test Files|Tests ' $B/precheck-full-v1.log | tr -s ' ' | tr '\n' ' ') failing $(grep -c ' FAIL ' $B/precheck-full-v1.log)"
echo "K25 lane-sketch-other-perf $(grep -v done $B/perf-sketch-others.txt | tr '\n' ' ') head-interactions $(cat $B/perf-head-interactions.rc)"
echo "K26 rb-patterns clipById-after-id $(grep -c "const clipId = await audioClips(page).first().getAttribute('data-clip-id');" $S/perf/studio-lab-interactions.perf.spec.ts) start-candidate-loop $(grep -c "const start = Number(await candidate.getAttribute('data-clip-start'));" $S/perf/studio-lab-interactions.perf.spec.ts)"
echo "K27 superseded-docs $(grep -rlE 'studio-lab-interactions\.perf|studio-lab-resources\.perf' $S/docs/implementation | wc -l)"
echo "K28 budgets-note-string $(grep -c "note: typeof value.note === 'string' ? value.note : ''," $S/perf/lib/budgets.ts)"
echo "K29 run-controls resources-differing $(head -1 $B/resources-run-control.txt | grep -o 'differing: [0-9]*') interactions-run2 $(cat $B/perf-head-interactions-run2.rc 2>/dev/null || echo pending) differing $(head -1 $B/interactions-run-control.txt 2>/dev/null | grep -o 'differing: [0-9]*' || echo pending)"
echo "K17b delta-reviewed-dispatched $(grep -o 'dispatched sha256 [0-9a-f]\{16\}' $B/sketch-review.md | head -1 | cut -d' ' -f3) equals-harness $(test "$(grep -o 'dispatched sha256 [0-9a-f]\{16\}' $B/sketch-review.md | head -1 | cut -d' ' -f3)" = "$(sha256sum $B/sketch-399-harness.patch.txt | cut -c1-16)" && echo yes || echo no)"
