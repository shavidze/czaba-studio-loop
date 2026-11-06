#!/usr/bin/env bash
# B round 361 -> 362 claims (PERF-10b-ii-a). Run from the loop root. CLAIMS_STORE overrides the store path (scratch).
L=/home/runner/czaba-project/tmp/studio-real-loop
S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
BJ=$S/perf/budgets.interactions.json
CTX=$S/app/contexts/ArrangementContext.tsx
TR=$S/app/components/arrangement/ArrangementTransport.tsx
MR=$S/app/components/arrangement/ArrangementMarkerRow.tsx
RB=$S/app/lib/arrangement/__tests__/render-budget.test.tsx
PS=$S/app/lib/arrangement/__tests__/playback-store.test.ts
D4=$S/docs/implementation/2026/quarter-IV/234-perf-playback-store.md
echo "K1 $(python3 -I -c "import json;g=json.load(open('$L/gates/gate-round-361.json'));print(g['status'],g['commit'][:7])")"
if [ -d "$S/.git" ] && [ -z "${CLAIMS_STORE:-}" ]; then
  echo "K2 $(git -C $S rev-parse --short HEAD) $(git -C $S status --short --untracked-files=all | wc -l)"
else echo "K2 scratch n/a"; fi
echo "K3 $(python3 -I -c "
import json
d=json.load(open('$BJ'));m={r['id']:r for r in d}
ids=['interact.play.start-components','interact.play.stop-components','interact.click.components','interact.play.start-components.6x','interact.play.stop-components.6x','interact.click.components.6x']
print('rows',len(d),'asserted',sum(r['mode']=='assert' for r in d),' '.join(m[i]['mode'][0]+(m[i]['budget']['op']+str(m[i]['budget']['value']) if m[i]['budget'] else '-')+':'+m[i]['owner'] for i in ids))
")"
echo "K4 budgets-sha $(sha256sum $BJ | cut -c1-12)"
echo "K5 transport isPlaying-reads $(grep -c 'useArrangementIsPlaying()' $TR) leaf-fn $(grep -c '^function ArrangementTransportPlayStopInner(' $TR) leaf-memo $(grep -c '^const ArrangementTransportPlayStop = memo(ArrangementTransportPlayStopInner);$' $TR) transport-isPlaying-words $(grep -c 'isPlaying' $TR)"
echo "K6 $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K7 SWEEP(app/**,perf/**) playbackStore-hook $(grep -rn 'useArrangementPlaybackStore' $S/app $S/perf --include=*.ts --include=*.tsx | wc -l) reader-hook $(grep -rn 'useArrangementIsPlayingReader' $S/app $S/perf --include=*.ts --include=*.tsx | wc -l) markerrow-store-reads $(grep -c 'playbackStore' $MR) setPlaying-outside-ctx-and-store $(grep -rln 'setPlaying(' $S/app/components/arrangement $S/app/contexts $S/app/lib/arrangement --include=*.ts --include=*.tsx | grep -v __tests__ | grep -vE 'ArrangementContext.tsx|playback-store.ts' | wc -l)"
echo "K8 package.json-sha $(sha256sum $S/package.json | cut -c1-12)"
echo "K9 perf-harness-sha $(cd $S && find perf/lib perf/*.spec.ts -type f | sort | xargs sha256sum | sha256sum | cut -c1-12)"
echo "K10 cited $(for f in b-round-361/sketch.patch.txt b-round-361/budgets.patch.txt b-round-361/sketch-dispatched.sha256 b-round-361/apply-budgets.py b-round-361/checkpoint.md b-round-361/covering-files.txt b-round-361/sketch-typecheck.log b-round-361/sketch-biome.log b-round-361/sketch-lint.log b-round-361/sketch-covering-final.log b-round-361/perf-sketch.log b-round-361/perf-sketch-latest-interactions.json b-round-361/perf-sketch-rowcmp.txt b-round-361/perf-final.log b-round-361/perf-final-results/latest-interactions.json b-round-361/perf-final-rowcmp.txt b-round-361/perf-mu-b.log b-round-361/perf-mu-b-results/latest-interactions.json b-round-361/mutants/MU-A-transport-reads-playing.diff.txt b-round-361/mutants/MU-A-render-budget.log b-round-361/mutants/MU-B-leaf-not-memo.diff.txt b-round-361/mutants/MU-B-render-budget.log b-round-361/mutants/MU-C-ps4.log b-round-361/ghr1-old.log b-round-361/ghr1-sc.log b-round-361/ghr1-stable-props.log b-round-361/precheck-full.log c-round-361/latest-interactions.json b-round-329/perf-rowcmp.py b-round-334/vitest.perf-lib.config.mjs c-round-358/behaviour-probe.mjs c-round-358/auth.mjs tools/l57-check.py b-round-318/protected-sha256.txt; do [ -f $L/$f ] || echo MISSING:$f; done | wc -l) missing"
echo "K11 rb-transport-positive $(grep -c "renderLog.counts.get('ArrangementTransport') ?? 0).toBeGreaterThan(0)" $RB) rb-leaf-positive $(grep -c "renderLog.counts.get('ArrangementTransportPlayStopInner') ?? 0).toBeGreaterThan(0)" $RB) rb-transport-zero $(grep -c "renderLog.counts.get('ArrangementTransport') ?? 0).toBe(0)" $RB) ps-rows $(grep -cE "it\('PS[0-9]+ " $PS)"
echo "K12 names(app/**,perf/**) transport $(grep -rn "'ArrangementTransport'" $S/app $S/perf --include=*.ts --include=*.tsx | wc -l) leaf $(grep -rn "'ArrangementTransportPlayStopInner'" $S/app $S/perf --include=*.ts --include=*.tsx | wc -l)"
echo "K13 doc-q4-files $(ls $S/docs/implementation/2026/quarter-IV/ | wc -l) pending $(grep -rl 'C round [0-9]* pending' $S/docs/implementation | wc -l)"
echo "K14 doc234-l4 $(sed -n 4p $D4 | md5sum | cut -c1-8) doc234-h2 $(grep -c '^## ' $D4) doc234-stage4 $(grep -c '^### ეტაპი 4: PERF-10b-ii-a (round 362, D-29z1177)$' $D4) doc234-uc7-existing $(grep -c 'UC7 (არსებული' $D4)"
echo "K15 sketch-files-sha $(cd $S && sha256sum app/components/arrangement/ArrangementTransport.tsx app/contexts/ArrangementContext.tsx app/components/arrangement/ArrangementMarkerRow.tsx app/lib/arrangement/__tests__/playback-store.test.ts app/lib/arrangement/__tests__/render-budget.test.tsx | cut -c1-64 | sha256sum | cut -c1-12)"
echo "K16 marker-none-playing-test $(grep -c "it('IM24 stopped Ctrl+Right steps from the insert marker; the none text names the origin by state'" $S/app/lib/arrangement/__tests__/insert-marker-ui.test.tsx) playback-state-span $(grep -c 'data-testid="arrangement-playback-state"' $TR)"
