#!/usr/bin/env bash
# Round 337 claims (L29 + L56). Run from the loop root. CLAIMS_STORE may point at another tree (e.g. B's scratch).
L=$(pwd); S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
SP=$S/perf/studio-lab-interactions.perf.spec.ts
BUD=$S/perf/budgets.interactions.json
D168=$S/docs/implementation/2026/quarter-IV/168-perf-interactions-baseline.md
echo "K1 $(python3 -I -c "import json;a=json.load(open('gates/gate-round-335.json'));b=json.load(open('gates/gate-round-336.json'));print(a['status'],a['commit'][:7],b['status'],b['head'][:7])")"
echo "K2 $(git -C $S rev-parse --short HEAD 2>/dev/null || echo no-git) $(git -C $S status --short --untracked-files=all 2>/dev/null | wc -l)"
echo "K3 $(grep -c -F 'const dragSteps = 60;' $SP) $(grep -c -F 'const dragDistancePx = 120;' $SP) $(grep -o -F 'dragSteps / 6' $SP | wc -l) $(grep -o -F 'dragDistancePx / 3' $SP | wc -l) $(grep -c -F 'const laneSegmentSteps = 10;' $SP) $(grep -c -F 'const laneSegmentPx = 40;' $SP)"
echo "K4 $(grep -c -F 'const downAt = whole.downs.at(-1);' $SP) $(grep -c -F 'await page.mouse.down();' $SP) $(grep -c -F 'await page.mouse.up();' $SP) $(grep -c -F 'function dragWindow(' $SP) $(grep -c -F 'async function pressedGesture<T>(' $SP) $(grep -c -F 'const rowWriter =' $SP)"
echo "K5 $(grep -c '^  try {$' $SP) $(grep -c '^  } catch (error) {$' $SP) $(grep -c -F 'result.abortedAt = step;' $SP) $(grep -c -F 'await context.close();' $SP)"
echo "K6 $(grep -c -F 'and Ctrl+wheel out-first (5 x deltaY +100, 5 x -100) with the zoom probe (interact.zoom.30.*, interact.zoom.30.in/out/wheel.*), Space, Home' $SP) $(grep -c -F 'Space, then Ctrl+wheel out-first (5 x deltaY +100, 5 x -100) with the zoom probe (interact.zoom.30.wheel.*)' $SP)"
echo "K7 $(python3 -I -c "
import json,sys
rows=json.load(open(sys.argv[1]))
g='Gesture: press on the first clip name bar, 10 steps +40 px on its own lane'
print(len(rows), sum(1 for r in rows if r['note'].startswith(g)), sum(1 for r in rows if 'pointermoves in that window' in r['note'] or 'pointermoves in the whole window' in r['note']), sum(1 for r in rows if 'the first one included' in r['note']))" $BUD)"
echo "K8 $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K9 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K10 $(python3 -I -c "
import json,sys
d=json.load(open(sys.argv[1]));rows=d['rows']
print(len(rows), d['complete'], len(d['failures']), sum(1 for r in rows if r.get('kind')!='wallclock'))" c-round-335/perf-results/latest-interactions.json)"
echo "K11 $(python3 -I -c "
import json,sys
d=json.load(open(sys.argv[1]));rows={r['id']:r for r in d['rows']}
print(len(rows), d['complete'], len(d['failures']), rows['interact.harness.drag-lane-live']['samples'], rows['interact.harness.drag-lane-live.6x']['samples'], rows['interact.harness.hook-live']['samples'])" b-round-336/perf-sketch-results/latest-interactions.json)"
echo "K12 $(grep -c '^EQUAL' b-round-336/perf-rowcmp-sketch-vs-c335.txt) $(grep -c '^DIFF' b-round-336/perf-rowcmp-sketch-vs-c335.txt) $(grep -c '^NEW' b-round-336/perf-rowcmp-sketch-vs-c335.txt) $(python3 -I b-round-336/rowids-equal.py c-round-335/perf-results/latest-interactions.json b-round-336/perf-sketch-results/latest-interactions.json)"
echo "K13 $(grep -h 'MU-PROBE' b-round-336/mutant-P/latest-interactions.json | tr -d ' ",' | sort -u | tr '\n' ' ')| $(grep -h 'MU-PROBE' b-round-336/mutant-M/latest-interactions.json | tr -d ' ",' | sort -u | tr '\n' ' ')"
echo "K14 $(sed 's/\x1b\[[0-9;]*m//g' b-round-336/perf-lib-sketch.log | grep -E '^\s+Tests ' | tr -s ' ') $(test -f b-round-334/vitest.perf-lib.config.mjs && echo config-ok)"
echo "K15 $(git -C $S diff --quiet HEAD -- app && echo app-untouched || echo app-changed) $(git -C $S diff --quiet HEAD -- perf/lib && echo lib-untouched || echo lib-changed)"
echo "K16 $(ls $S/docs/implementation/2026/quarter-IV/ | grep -c '^233-') $(grep -c '^## ' $D168) $(grep -c -E '÷ (ფანჯრის pointermove-ები|move-ები)' $D168) $(grep -c '^## ' $S/docs/implementation/TEMPLATE.md)"
echo "K17 $(for f in tasks/round-336.md c-round-336.json c-round-336.md a-round-336.md gates/gate-round-336.json gates/gate-round-335.json gates/round-335/review.md b-round-318/protected-sha256.txt b-round-329/perf-rowcmp.py b-round-334/vitest.perf-lib.config.mjs c-round-335/perf-results/latest-interactions.json c-round-335/lane-rows.txt c-round-330/g330-auth.cjs b-round-336/apply-sketch.py b-round-336/make-mutant.py b-round-336/rowids-equal.py b-round-336/sketch/sketch.patch.txt b-round-336/sketch/budgets.patch.txt b-round-336/notes-changed-ids.txt b-round-336/perf-sketch.log b-round-336/perf-sketch-results/latest-interactions.json b-round-336/perf-rowcmp-sketch-vs-c335.txt b-round-336/mutant-P/latest-interactions.json b-round-336/mutant-M/latest-interactions.json b-round-336/perf-lib-sketch.log b-round-336/sketch-typecheck.log b-round-336/sketch-review.md b-round-336/notes-only-check.py b-round-336/notes-only-check.txt b-round-336/run-mutants.sh b-round-336/rowcmp-1x.py b-round-336/mutant-D-rowcmp.txt b-round-336/sketch/sketch-v1.patch.txt b-round-336/perf-sketch-v1.log b-round-336/perf-rowcmp-sketch-v1-vs-c335.txt b-round-336/claims-337-planning-output.txt b-round-336/claims-337-sketch-output.txt; do test -f $f || echo MISSING:$f; done; echo checked)"
echo "K18 $(grep -rl 'budgets.interactions' $S/app $S/perf $S/e2e 2>/dev/null | sed "s#$S/##" | sort | tr '\n' ' ')"
echo "K19 $(grep -c -F 'state.ups.push(performance.now());' $S/perf/lib/instrumentation.ts) $(grep -c -F 'export const snapshot = (page: Page, from: number, to: number)' $S/perf/lib/page.ts)"
echo "K20 $(grep -rn 'in/out/wheel\|dragSteps / 6\|dragDistancePx / 3' $S/docs/implementation $S/perf/lib 2>/dev/null | wc -l)"
