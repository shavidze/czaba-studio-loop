#!/usr/bin/env bash
# Round 314 claims (B round 313 -> 314 planning). Run from the loop root: bash b-round-313/claims-314.sh
# Sketch run: CLAIMS_STORE=/tmp/b314k bash b-round-313/claims-314.sh (K2 is empty there: scratch has no git).
S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
P=$S/perf; D=$S/docs/implementation/2026/quarter-IV
L=$(pwd)
echo "K1 $(python3 -I -c "import json;g=json.load(open('gates/gate-round-313.json'));print(g['status'],g['reason'])")"
if [ -z "$CLAIMS_STORE" ]; then echo "K2 $(git -C $S status --short --untracked-files=all | wc -l) $(git -C $S rev-parse --short=7 HEAD)"; else echo "K2"; fi
echo "K3 $(cd $S && sha256sum -c $L/b-round-312/a312-app-code-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K4 $(cd $S && sha256sum -c $L/b-round-313/a313-tree-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K5 $(cd $S && grep -rlE 'timelineScrollProblem' app perf e2e 2>/dev/null | sort | tr '\n' ' ')"
echo "K6 $(grep -c 'setFollowOff(' $P/studio-lab.perf.spec.ts) $(grep -c 'timelineScrollLeft(page)' $P/studio-lab.perf.spec.ts)"
echo "K7 $(cd $S && grep -rl 'data-testid="arrangement-follow"' app | sort | tr '\n' ' ')$(cd $S && grep -rl 'data-testid="arrangement-timeline-scroller"' app | sort | tr '\n' ' ')"
echo "K8 $(grep -c "useState<TimelineFollowMode>('on')" $S/app/components/arrangement/StudioWorkspace.tsx) $(grep -c '          current.isPointerGestureActive()$' $S/app/components/arrangement/StudioWorkspace.tsx)"
echo "K9 $(sed -n 4p $D/228-perf-peaks-worker.md)"
echo "K10 $(grep -c 'arrangement-follow\|timelineScrollProblem' $D/163-studio-perf-harness.md) $(grep -n '^### Pass-ის თანმიმდევრობა' $D/163-studio-perf-harness.md | cut -d: -f1) $(grep -n '^## არქიტექტურა' $D/163-studio-perf-harness.md | cut -d: -f1) $(grep -n '^## მეტრიკების განმარტება და ზღვრები' $D/163-studio-perf-harness.md | cut -d: -f1) $(grep -n '^## შეცვლილი ფაილები' $D/163-studio-perf-harness.md | cut -d: -f1) $(grep -n '^## პრობლემები და გადაწყვეტები' $D/163-studio-perf-harness.md | cut -d: -f1) $(grep -n '^## ტესტირება' $D/163-studio-perf-harness.md | cut -d: -f1)"
echo "K11 $(sed 's/\x1b\[[0-9;]*m//g' b-round-313/precheck-unit.log | grep -oE 'Tests +[0-9]+ passed' | grep -oE '[0-9]+')"
echo "K12 $(python3 -I -c "
import json
out=[]
for n in ('k1','k2','k3'):
    r=json.load(open('b-round-313/precheck-perf-'+n+'.json'))
    rows={x['id']:x for x in r['rows']}
    c=rows['fader.clipgain.playing.commits-per-move.6x']['details']
    out.append(n+':'+str(len(r['failures']))+'/'+','.join(str(d['commits']) for d in c)+'/'+','.join(str(v) for v in rows['fader.clipgain.playing.release-commits.6x']['samples']))
print(' '.join(out))")"
echo "K13 $(python3 -I -c "
import json;f=json.load(open('b-round-313/precheck-perf-mu.json'))['failures']
print(sum('timeline scrolled during' in x for x in f), sum('Follow is on before' in x for x in f), sum('Follow is paused before' in x for x in f), len(f))")"
echo "K14 $(python3 -I -c "
import json;r=json.load(open('b-round-313/probe/b314-probe-run2.json'))
row=[x for x in r['rows'] if x['id']=='fader.clipgain.playing.release-commits.6x'][0]
p=json.loads(row['details'][0]['probe']);print(row['samples'], [(c['dt'],','.join(c['n'])) for c in p['release']])")"
echo "K15 $(cmp -s tasks/round-313.md b-round-313/round-313-task-copy.md && echo archive-equal-313)"
echo "K16 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K17 $(grep -c ' -> 0 red' b-round-313/precheck-unit-mutants.txt) $(grep -c ' red$' b-round-313/precheck-unit-mutants.txt) $(grep -oE 'restored: [0-9]+ passed' b-round-313/precheck-unit-mutants.txt)"
echo "K18 $(for f in b-round-313/sketch.patch.txt b-round-313/sketch-studio-lab.perf.spec.ts.txt b-round-313/sketch-report.ts.txt b-round-313/sketch-report.test.ts.txt b-round-313/unit-mutants.sh b-round-313/precheck-unit-mutants.txt b-round-313/precheck-unit.log b-round-313/precheck-tsc.log b-round-313/precheck-perf-k1.json b-round-313/precheck-perf-k1.log b-round-313/precheck-perf-k2.json b-round-313/precheck-perf-k2.log b-round-313/precheck-perf-k3.json b-round-313/precheck-perf-k3.log b-round-313/precheck-perf-mu.json b-round-313/precheck-perf-mu.log b-round-313/precheck-row-compare.txt b-round-313/precheck-runs.status b-round-313/a313-tree-sha256.txt b-round-313/round-313-task-copy.md b-round-313/probe/b314-probe-run1.json b-round-313/probe/b314-probe-run2.json b-round-313/probe/probe.patch.txt b-round-313/probe/minified-names.txt b-round-313/claims-314-head-output.txt b-round-313/claims-314-sketch-output.txt b-round-312/a312-app-code-sha256.txt b-round-312/protected-sha256.txt b-round-312/sketch-budgets.json.txt; do test -f $f || echo MISSING $f; done; echo done)"
echo "K19 $(cd $S && sha256sum -c $L/b-round-312/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K20 $(ls $D | tail -1)"
echo "K21 $(cmp -s $P/budgets.json b-round-312/sketch-budgets.json.txt && echo budgets-equal-313-sketch)"
echo "K22 $(grep -c "it.each\|it(" $P/lib/report.test.ts) $(grep -c 'LOAF1:\|LOAF2:\|SCROLL1:' $P/lib/report.test.ts)"
echo "K23 $(python3 -I -c "
import json
for l in open('b-round-313/precheck-row-compare.txt'): print(l.split(':')[-1].strip().replace(' differ',''), end=' ')")"
