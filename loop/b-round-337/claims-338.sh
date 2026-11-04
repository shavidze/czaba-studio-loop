#!/usr/bin/env bash
# Round 338 claims (L29 + L56). Run from the loop root. CLAIMS_STORE may point at another tree (e.g. B's scratch).
L=$(pwd); S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
CTX=$S/app/contexts/ArrangementContext.tsx
CLIP=$S/app/components/arrangement/ArrangementClip.tsx
LANE=$S/app/components/arrangement/ArrangementLane.tsx
WS=$S/app/components/arrangement/StudioWorkspace.tsx
STORE=$S/app/lib/arrangement/clip-lane-drag-store.ts
T=$S/app/lib/arrangement/__tests__
SP=$S/perf/studio-lab-interactions.perf.spec.ts
BUD=$S/perf/budgets.interactions.json
D232=$S/docs/implementation/2026/quarter-IV/232-perf-drag-preview.md
D168=$S/docs/implementation/2026/quarter-IV/168-perf-interactions-baseline.md
echo "K1 $(python3 -I -c "import json;a=json.load(open('gates/gate-round-337.json'));print(a['status'],a['commit'][:7])")"
echo "K2 $(git -C $S rev-parse --short HEAD 2>/dev/null || echo no-git) $(git -C $S status --short --untracked-files=all 2>/dev/null | wc -l)"
echo "K3 $(grep -c -F 'const [clipLaneDrag, setClipLaneDrag] = useState<ClipLaneDragState | null>(null);' $CTX) $(grep -c -F '  clipLaneDrag: ClipLaneDragState | null;' $CTX) $(grep -c -F 'const [clipLaneDragStore] = useState(() => createArrangementClipLaneDragStore());' $CTX) $(grep -c -F 'export function useArrangementClipLaneDrag<Selected>(' $CTX) $(grep -c -F 'export interface ClipLaneDragState {' $CTX) $(grep -c -F 'export type { ClipLaneDragState' $CTX)"
echo "K4 $(grep -c -F 'previewArrangement(gesture.before);' $CLIP) $(grep -c -F 'previewGeometry(gesture.before);' $CLIP) $(grep -c -F 'if (getArrangement() !== gesture.before) {' $CLIP) $(grep -c -F 'const previewGeometry = isVideo' $CLIP)"
echo "K5 $(grep -c -F '      setHistory(next);' $CTX) $(grep -c -F '      if (next === publishedHistoryRef.current.present) {' $CTX) $(grep -c -F 'previewActiveRef.current && !signal.aborted && waited < GESTURE_WAIT_LIMIT_MS;' $CTX)"
echo "K6 $(test -f $STORE && echo store-file || echo no-store-file) $(grep -c -F 'useArrangementClipLaneDrag(' $LANE) $(grep -c -F 'useArrangementClipLaneDrag(' $WS) $(grep -c -E '^  const laneMoveRefusal =$' $WS) $(grep -c -F 'clipLaneDrag={clipLaneDrag}' $WS)"
echo "K7 $(for f in drag-preview-render gesture-guard shortcut-sheet-ui track-groups-ui workspace-strings-ui; do printf '%s:%s ' $f $(grep -c -F '  api.current = useArrangement();' $T/$f.test.tsx); done)track-group-collapse-ui:$(grep -c -F '  api.current = { ...useArrangement(), range: useArrangementRange((state) => state.range) };' $T/track-group-collapse-ui.test.tsx) probes:$(grep -l -F 'clipLaneDrag: useArrangementClipLaneDrag((state) => state.drag)' $T/*.test.tsx 2>/dev/null | wc -l)"
echo "K8 $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K9 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K10 $(python3 -I -c "
import json,sys
d=json.load(open(sys.argv[1]));rows=d['rows']
print(len(rows), d['complete'], len(d['failures']), sum(1 for r in rows if r.get('kind')!='wallclock'))" c-round-337/perf-results/latest-interactions.json)"
echo "K11 $(python3 -I -c "
import json,sys
d=json.load(open(sys.argv[1]));rows={r['id']:r for r in d['rows']}
k=['interact.drag.lane.stopped.move-components-per-move','interact.drag.lane.playing.move-components-per-move','interact.drag.lane.stopped.move-components-per-move.6x','interact.drag.lane.stopped.release-commits','interact.drag.lane.playing.move-restarts','interact.harness.drag-lane-live','interact.harness.drag-lane-live.6x']
print(len(rows), d['complete'], len(d['failures']), ' '.join(str(rows[i]['samples']) for i in k))" b-round-337/perf-sketch3-results/latest-interactions.json)"
echo "K12 $(grep -c '^EQUAL' b-round-337/perf-rowcmp-sketch3-vs-c337.txt) $(grep -c '^DIFF' b-round-337/perf-rowcmp-sketch3-vs-c337.txt) $(grep -c '^NEW' b-round-337/perf-rowcmp-sketch3-vs-c337.txt) $(grep -h '^asserted' b-round-337/perf-rowcmp-sketch3-vs-c337.txt)"
echo "K13 $(cut -d'|' -f1 b-round-337/unit-mutants/summary.txt | tr -s ' ' | tr '\n' ';')"
echo "K14 $(sed 's/\x1b\[[0-9;]*m//g' b-round-337/covering-unit.log | grep -E '^\s+(Test Files|Tests) ' | tr -s ' ' | tr '\n' ' ') $(wc -l < b-round-337/covering-files.txt)"
echo "K15 SWEEP $(grep -rlE 'clipLaneDrag|ClipLaneDragState|ClipLaneGhost' $S/app $S/perf $S/e2e 2>/dev/null | sed "s#$S/##" | sort | tr '\n' ' ')"
echo "K16 $(ls $S/docs/implementation/2026/quarter-IV/ | grep -c '^234-') $(grep -c '^### ეტაპი c3-' $D232) $(grep -c '^## ' $D232) $(grep -c '^## ' $D168) $(grep -c -F 'pointerdown-ის შემდეგ პირველი move-ის შემდეგ' $D168)"
echo "K17 $(python3 -I -c "
import json,sys
rows=json.load(open(sys.argv[1]))
lane=[r for r in rows if r['id'].startswith('interact.drag.lane.') or r['id'].startswith('interact.harness.drag-lane-live')]
print(len(rows), len(lane), sum(1 for r in lane if r.get('mode')=='assert'), sum(1 for r in rows if r.get('mode')=='assert'))" $BUD)"
echo "K18 $(grep -c -F "it('DP49 " $T/drag-preview-render.test.tsx) $(grep -c -F "it('DP50 " $T/drag-preview-render.test.tsx) $(grep -c -F "it('DP5b " $T/drag-preview-render.test.tsx) $(test -f $T/clip-lane-drag-store.test.ts && grep -c -E "^  it\('CL[1-4] " $T/clip-lane-drag-store.test.ts || echo 0)"
echo "K19 $(grep -c -F 'targetStart: number | null;' $SP) $(grep -c -F 'const entry = await readLaneGhosts(page, target.trackId);' $SP) $(grep -c -F '(e) target-lane ghost start' $SP) $(grep -c -F 'const { t1, crossGhosts, t2, backGhosts, t3 } = await pressedGesture(page, grab, async () => {' $SP)"
echo "K20 $(python3 -I -c "
import json,sys
p=json.load(open(sys.argv[1]));print(' '.join(f\"{k}={p[k]}\" for k in ('ownTrack','emptyTrack','trackAfterRelease','startAfterRelease','trackAfterUndo','sourceDimmedCross','trackAfterEsc')), p['undoTitle'])" b-round-337/probe/head-1440.json) | $(grep -h BEHAVIOUR-DIFFS b-round-337/probe/compare-1440.txt b-round-337/probe/compare-1280.txt | tr '\n' ' ')"
echo "K21 $(grep -c '^DIFF' b-round-337/perf-rowcmp-mutantAE-vs-sketch2.txt) $(grep -h '^asserted' b-round-337/perf-rowcmp-mutantAE-vs-sketch2.txt) $(grep -h 'interact.drag.lane.stopped.move-components-per-move ' b-round-337/perf-rowcmp-mutantAE-vs-sketch2.txt | awk '{print $3,$4,$5}')"
echo "K22 $(for f in tasks/round-337.md c-round-337.json c-round-337.md a-round-337.md gates/gate-round-337.json gates/round-337/review.md b-round-318/protected-sha256.txt b-round-329/perf-rowcmp.py b-round-336/rowids-equal.py c-round-337/perf-results/latest-interactions.json c-round-335/lane-rows.txt b-round-334/cross-head-1440-summary.txt b-round-337/apply-sketch.py b-round-337/apply-sketch-v3.py b-round-337/apply-sketch-v4-rename.py b-round-337/sketch-files/clip-lane-drag-store.test.ts b-round-337/sketch/sketch.patch.txt b-round-337/sketch/spec.patch.txt b-round-337/sketch/budgets.patch.txt b-round-337/sketch-typecheck.log b-round-337/biome-sketch.log b-round-337/covering-files.txt b-round-337/covering-unit.log b-round-337/unit-mutants/run-unit-mutants.py b-round-337/unit-mutants/summary.txt b-round-337/perf-sketch.log b-round-337/perf-sketch-results/latest-interactions.json b-round-337/perf-rowcmp-sketch-vs-c337.txt b-round-337/perf-sketch2.log b-round-337/perf-sketch2-results/latest-interactions.json b-round-337/perf-rowcmp-sketch2-vs-c337.txt b-round-337/perf-sketch3.log b-round-337/perf-sketch3-results/latest-interactions.json b-round-337/perf-rowcmp-sketch3-vs-c337.txt b-round-337/perf-mutant-AE.log b-round-337/perf-mutant-AE/latest-interactions.json b-round-337/perf-mutant-AE.patch.txt b-round-337/perf-rowcmp-mutantAE-vs-sketch2.txt b-round-337/cross-lane-probe.mjs b-round-337/probe/compare.py b-round-337/probe/head-1440.json b-round-337/probe/head-1280.json b-round-337/probe/sketch-1440.json b-round-337/probe/sketch-1280.json b-round-337/probe/compare-1440.txt b-round-337/probe/compare-1280.txt b-round-337/sketch-review.md b-round-337/claims-338-planning-output.txt b-round-337/claims-338-sketch-output.txt; do test -f $f || echo MISSING:$f; done; echo checked)"
echo "K23 $(grep -c -F 'clipLaneDrag' $S/docs/implementation/2026/quarter-IV/014-studio-lab-edit-clipboard.md) $(grep -c -F 'clipLaneDrag' $S/docs/implementation/2026/quarter-IV/233-sys-r336-perf-drag-window.md) $(grep -c -F 'ყველა `record`, `budget: null`' $D168) $(grep -c -F '(preview store)' $D232)"
