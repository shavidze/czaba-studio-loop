#!/usr/bin/env bash
# Round 313 claims (B round 312 -> 313 planning). Run from the loop root: bash b-round-312/claims-313.sh
# Sketch run: CLAIMS_STORE=/tmp/b312s bash b-round-312/claims-313.sh (K2 is empty there: scratch has no git).
S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
P=$S/perf; D=$S/docs/implementation/2026/quarter-IV
L=$(pwd)
echo "K1 $(python3 -I -c "import json;g=json.load(open('gates/gate-round-312.json'));print(g['status'],g['reason'])")"
if [ -z "$CLAIMS_STORE" ]; then echo "K2 $(git -C $S status --short --untracked-files=all | wc -l) $(git -C $S rev-parse --short=7 HEAD)"; else echo "K2"; fi
echo "K3 $(cd $S && sha256sum -c $L/b-round-312/a312-app-code-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K4 $(cd $S && sha256sum -c $L/b-round-312/head-perf-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K5 $(grep -n 'const loafProblem = loafScriptsProblem(settled.loafs);' $P/studio-lab.perf.spec.ts | cut -d: -f1)"
echo "K6 $(grep -n "result.samples.set('load.script-max'" $P/studio-lab.perf.spec.ts | cut -d: -f1)"
echo "K7 $(cd $S && grep -rlE 'harness\.loaf-scripts-live' app perf e2e 2>/dev/null | sort | tr '\n' ' ')"
echo "K8 $(grep -c '"id":' $P/budgets.json)"
echo "K9 $(sed -n 4p $D/228-perf-peaks-worker.md)"
echo "K10 $(grep -c 'harness.loaf-scripts' $D/163-studio-perf-harness.md) $(grep -n '^## მეტრიკების განმარტება და ზღვრები' $D/163-studio-perf-harness.md | cut -d: -f1) $(grep -n '^## შეცვლილი ფაილები' $D/163-studio-perf-harness.md | cut -d: -f1) $(grep -n '^### Pass-ის თანმიმდევრობა' $D/163-studio-perf-harness.md | cut -d: -f1) $(grep -n '^## არქიტექტურა' $D/163-studio-perf-harness.md | cut -d: -f1)"
echo "K11 $(sed 's/\x1b\[[0-9;]*m//g' b-round-312/precheck-loaf1.log | grep -oE 'Tests +[0-9]+ passed' | grep -oE '[0-9]+')"
echo "K12 $(python3 -I -c "
import json;r=json.load(open('b-round-312/precheck-perf-run3.json'))
row=[x for x in r['rows'] if x['id']=='harness.loaf-scripts-live'][0]
print(len(r['failures']), row['samples'], [d['loafEntries'] for d in row['details']], [d['scriptCount'] for d in row['details']], [d['frameStartedBeforeCallback'] for d in row['details']])")"
echo "K13 $(python3 -I -c "
import json;r=json.load(open('b-round-312/precheck-perf-run1.json'))
row=[x for x in r['rows'] if x['id']=='harness.loaf-scripts-live'][0]
print(row['samples'], [d['loafEntries'] for d in row['details']])")"
echo "K13b $(python3 -I -c "
import json;r=json.load(open('b-round-312/precheck-perf-run2.json'))
row=[x for x in r['rows'] if x['id']=='harness.loaf-scripts-live'][0]
print(len(r['failures']), row['samples'], [d['startedBeforeInjection'] for d in row['details']])")"
echo "K14 $(python3 -I -c "
import json;r=json.load(open('b-round-312/precheck-mutant-busy0.json'))
f=r['failures'];print(sum('harness.loaf-scripts: no long-animation-frame' in x for x in f), sum(x.startswith('assert failed harness.loaf-scripts-live') for x in f), len(f))")"
echo "K15 $(cmp -s tasks/round-312.md b-round-312/round-312-task-copy.md && echo archive-equal-312)"
echo "K16 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K17 $(grep -c 'harness.loaf-scripts: no long-animation-frame entry carried script timings' c-round-312/perf-run.log) $(python3 -I -c "
import json;r=json.load(open('c-round-312/perf-head.json'));print(len(r['failures']))")"
echo "K18 $(for f in b-round-312/sketch.patch.txt b-round-312/sketch-studio-lab.perf.spec.ts.txt b-round-312/sketch-budgets.json.txt b-round-312/sketch-report.ts.txt b-round-312/sketch-report.test.ts.txt b-round-312/precheck-unit-mutants.txt b-round-312/unit-mutants.sh b-round-312/precheck-unit-mutants-script.txt b-round-312/precheck-perf-run3.log b-round-312/precheck-perf-run3.json b-round-312/precheck-tsc.log b-round-312/precheck-loaf1.log b-round-312/precheck-perf-run1.log b-round-312/precheck-perf-run1.json b-round-312/precheck-perf-run2.log b-round-312/precheck-perf-run2.json b-round-312/precheck-mutant-busy0.log b-round-312/precheck-mutant-busy0.json b-round-312/a312-app-code-sha256.txt b-round-312/head-perf-sha256.txt b-round-312/protected-sha256.txt b-round-312/round-312-task-copy.md b-round-312/claims-313-head-output.txt b-round-312/claims-313-sketch-output.txt; do test -f $f || echo MISSING $f; done; echo done)"
echo "K19 $(grep -rn 'In Progress (stage' $D 2>/dev/null | wc -l)"
echo "K20 $(cd $S && grep -rlE 'loafScriptsProblem|LOAF_SCRIPTS_PROBLEM|harness\.loaf-scripts' app perf e2e 2>/dev/null | sort | tr '\n' ' ')"
echo "K21 $(cd $S && sha256sum -c $L/b-round-312/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K22 $(ls $D | tail -1)"
echo "K23 $(cd $S && grep -rlE 'injectedLoafEntries|LOAF_EDGE_TOLERANCE_MS' app perf e2e 2>/dev/null | sort | tr '\n' ' ')"
echo "K24 $(grep -c ' -> 0 red' b-round-312/precheck-unit-mutants.txt) $(grep -c ' red$' b-round-312/precheck-unit-mutants.txt) $(grep -oE 'restored: [0-9]+ passed' b-round-312/precheck-unit-mutants.txt)"
echo "K25 $(grep -c "it.each\|it(" $P/lib/report.test.ts) $(grep -c 'LOAF1:\|LOAF2:' $P/lib/report.test.ts)"
echo "K26 $(grep -c "include: \['app/\*\*/\*.test.{ts,tsx}'\]" $S/vitest.config.ts)"
