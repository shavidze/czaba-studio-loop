#!/usr/bin/env bash
# B round 360 -> 361 claims (PERF-10b-i). Run from the loop root. CLAIMS_STORE overrides the store path (scratch).
L=/home/runner/czaba-project/tmp/studio-real-loop
S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
BJ=$S/perf/budgets.interactions.json
CTX=$S/app/contexts/ArrangementContext.tsx
SW=$S/app/components/arrangement/StudioWorkspace.tsx
echo "K1 $(python3 -I -c "import json;g=json.load(open('$L/gates/gate-round-360.json'));print(g['status'],g['commit'][:7])")"
if [ -d "$S/.git" ] && [ -z "${CLAIMS_STORE:-}" ]; then
  echo "K2 $(git -C $S rev-parse --short HEAD) $(git -C $S status --short --untracked-files=all | wc -l)"
else echo "K2 scratch n/a"; fi
echo "K3 $(python3 -I -c "
import json
d=json.load(open('$BJ'));m={r['id']:r for r in d}
ids=['interact.click.commits','interact.click.components','interact.click.commits.6x','interact.click.components.6x']
print('rows',len(d),'asserted',sum(r['mode']=='assert' for r in d),'click',' '.join(m[i]['mode'][0]+(m[i]['budget']['op']+str(m[i]['budget']['value']) if m[i]['budget'] else '-') for i in ids),'stale-notes',sum(('Record until C measures it' in m[i]['note']) or ('intermittent' in m[i]['note']) for i in ['interact.drag.fade.playing.release-commits','interact.drag.video-fade.stopped.release-commits','interact.drag.video-fade.playing.release-commits']))
")"
echo "K4 budgets-sha $(sha256sum $BJ | cut -c1-12)"
echo "K5 ctx-field $(grep -c '^  activeTrackId: string | null;$' $CTX) ctx-usestate $(grep -c 'setActiveTrackIdState' $CTX) store-field $(grep -c 'activeTrackId: string | null;' $S/app/lib/arrangement/selection-store.ts) hook $(grep -c 'export function useArrangementActiveTrackId' $CTX)"
echo "K6 $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K7 SWEEP(app/**,perf/**) activeTrackId-nontest $(grep -rn 'activeTrackId' $S/app $S/perf --include=*.ts --include=*.tsx | grep -v __tests__ | wc -l) activeTrackId-test $(grep -rn 'activeTrackId' $S/app $S/perf --include=*.ts --include=*.tsx | grep __tests__ | wc -l) latestRef-reads $(grep -cE 'latestRef\.current\.activeTrackId|latest\.activeTrackId' $CTX) workspace-reads $(grep -cE '(workspace|current)\.activeTrackId' $SW)"
echo "K8 package.json-sha $(sha256sum $S/package.json | cut -c1-12)"
echo "K9 perf-harness-sha $(cd $S && find perf/lib perf/*.spec.ts -type f | sort | xargs sha256sum | sha256sum | cut -c1-12)"
echo "K10 cited $(for f in b-round-360/sketch.patch.txt b-round-360/sketch-dispatched.sha256 b-round-360/apply-sketch.py b-round-360/ss-rows.py b-round-360/mutants/apply-mutant.py b-round-360/checkpoint.md b-round-360/precheck-full.log b-round-360/sketch-typecheck.log b-round-360/sketch-lint.log b-round-360/ss-sketch.log b-round-360/perf-sketch.log b-round-360/perf-sketch-results/latest-interactions.json b-round-360/perf-mu-1.log b-round-360/perf-mu-1-results/latest-interactions.json b-round-360/perf-sketch-b.log b-round-360/perf-sketch-b-results/latest-interactions.json b-round-360/perf-mu-1-b.log b-round-360/perf-mu-1-b-results/latest-interactions.json b-round-360/mutant-MU-2.log b-round-360/mutant-MU-3.log b-round-360/mutant-MU-4.log b-round-360/mutant-MU-5.log b-round-360/mutant-MU-6.log b-round-360/ss-rows.patch.txt b-round-360/perf-summary.txt b-round-360/precheck-full-final.log b-round-360/sketch-perf-lib.log b-round-360/lane-probe.mjs b-round-360/lane-probe.sha256 b-round-360/lane-probe/head-1440x900.json b-round-360/lane-probe/head-1280x720.json b-round-360/mutants/mu-7.diff.txt b-round-360/perf-mu-7-b.log b-round-360/perf-mu-7-b-results/latest-interactions.json b-round-360/sketch-review.md b-round-360/budgets.patch.txt b-round-360/budgets-dispatched.sha256 c-round-360/latest-interactions.json b-round-329/perf-rowcmp.py b-round-334/vitest.perf-lib.config.mjs c-round-358/behaviour-probe.mjs c-round-358/auth.mjs tools/l57-check.py; do [ -f $L/$f ] || echo MISSING:$f; done | wc -l) missing"
echo "K11 ss-rows $(grep -cE "it\('SS[0-9]+:" $S/app/lib/arrangement/__tests__/selection-store.test.tsx) uc7 $(grep -c "it('UC7 a hidden active lane marks its collapsed group" $S/app/lib/arrangement/__tests__/track-group-collapse-ui.test.tsx) probe-helper $(grep -c 'activeTrackId: useArrangementActiveTrackId()' $S/app/lib/arrangement/__tests__/helpers/workspace-probe.ts)"
echo "K12 names(app/**/__tests__,perf/**) lane $(grep -rn "'ArrangementLane'" $S/app $S/perf --include=*.ts --include=*.tsx | wc -l) libpreview $(grep -rn "'ArrangementLibraryPreview'" $S/app $S/perf --include=*.ts --include=*.tsx | wc -l) groupheader $(grep -rn "'ArrangementGroupHeaderWithSelectionInner'" $S/app $S/perf --include=*.ts --include=*.tsx | wc -l)"
echo "K13 doc-next-free $(ls $S/docs/implementation/2026/quarter-IV/ | grep -c '^236-') pending $(grep -rl 'C round [0-9]* pending' $S/docs/implementation | wc -l)"
D4=$S/docs/implementation/2026/quarter-IV/234-perf-playback-store.md
echo "K14 doc234-l4 $(sed -n 4p $D4 | md5sum | cut -c1-8) doc234-h2 $(grep -c '^## ' $D4) doc234-stage3 $(grep -c '^### ეტაპი 3: PERF-10b-i (round 361, D-29z1170)$' $D4) doc234-10b-bullet $(grep -c '^- \*\*PERF-10b:\*\* `activeTrackId` და selection store' $D4)"
echo "K15 sketch-files-sha $(cd $S && sha256sum app/components/arrangement/ArrangementLane.tsx app/components/arrangement/ArrangementLibraryPreview.tsx app/components/arrangement/StudioWorkspace.tsx app/contexts/ArrangementContext.tsx app/lib/arrangement/__tests__/grid-snap-position.test.tsx app/lib/arrangement/__tests__/helpers/workspace-probe.ts app/lib/arrangement/__tests__/marker-time-snap-ui.test.tsx app/lib/arrangement/__tests__/selection-store.test.tsx app/lib/arrangement/selection-store.ts | cut -c1-64 | sha256sum | cut -c1-12)"
echo "K16 contains-active-attr $(grep -c "data-contains-active={containsActive ? 'true' : undefined}" $S/app/components/arrangement/ArrangementGroupHeader.tsx)"
echo "K17 lane-aria-pressed $(grep -c 'aria-pressed={isActive}' $S/app/components/arrangement/ArrangementLane.tsx) harness-active-reader $(grep -c "document.querySelectorAll('\[data-track-id\] button\[aria-pressed=\"true\"\]')" $S/perf/studio-lab-interactions.perf.spec.ts)"
echo "K18 group-chord $(grep -c "commandChord \&\& key === 'g' \&\& !event.altKey" $SW)"
echo "K19 audio-seed $(grep -c "history.present.tracks.find((track) => track.kind === 'audio')?.id ?? null" $CTX)"
echo "K20 group-fold-label $(grep -c 'foldLabel: (name: string): string => `Fold or unfold group — ${name}`' $S/app/lib/arrangement/strings.ts)"
