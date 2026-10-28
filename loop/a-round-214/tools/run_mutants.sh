#!/usr/bin/env bash
set -u
A=/home/runner/czaba-project/tmp/studio-real-loop/a-round-214
SRC=/home/runner/czaba-project/store
SC=/tmp/r214-scratch/store
reset_scratch() {
  cp $SRC/perf/studio-lab-interactions.perf.spec.ts $SRC/perf/studio-lab.perf.spec.ts $SRC/perf/budgets.json $SRC/perf/budgets.interactions.json $SC/perf/
  cp $SRC/perf/lib/instrumentation.ts $SC/perf/lib/
}
cd $SC
# M1
reset_scratch
python3 - <<'PY'
p='/tmp/r214-scratch/store/perf/studio-lab-interactions.perf.spec.ts'
s=open(p).read()
a="""  await page.mouse.move(grab.x, grab.y);
  await page.mouse.down();
  await page.mouse.move(grab.x + dragDistancePx / 2, grab.y, { steps: dragSteps / 2 });"""
assert s.count(a)==1
s=s.replace(a, a.replace("  await page.mouse.down();", "  if (baseId !== 'interact.drag.fade.stopped') await page.mouse.down();"))
open(p,'w').write(s)
PY
diff $SRC/perf/studio-lab-interactions.perf.spec.ts perf/studio-lab-interactions.perf.spec.ts > $A/mutant-M1.diff
npx playwright test --config playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts > $A/mutant-M1.log 2>&1; echo "exit=$?" >> $A/mutant-M1.log
cp test-results/perf/latest-interactions.json $A/mutant-M1.json
# M2 + M3 (instrumentation: no start() records; renderer version 17.0.2)
reset_scratch
python3 - <<'PY'
p='/tmp/r214-scratch/store/perf/lib/instrumentation.ts'
s=open(p).read()
a="      state.starts.push({ t: performance.now(), task: startTask });\n"
assert s.count(a)==1
s=s.replace(a,"")
b="        rendererVersions.push(renderer.version);"
assert s.count(b)==1
s=s.replace(b,"        rendererVersions.push('17.0.2');")
open(p,'w').write(s)
PY
diff $SRC/perf/lib/instrumentation.ts perf/lib/instrumentation.ts > $A/mutant-M2M3.diff
npx playwright test --config playwright.perf.config.ts > $A/mutant-M2M3.log 2>&1; echo "exit=$?" >> $A/mutant-M2M3.log
cp test-results/perf/latest.json $A/mutant-M2M3-perf1a.json
cp test-results/perf/latest-interactions.json $A/mutant-M2M3-interactions.json
# M4 (budgets file override)
reset_scratch
python3 - <<'PY'
import json
rows=json.load(open('/tmp/r214-scratch/store/perf/budgets.interactions.json'))
for r in rows:
    if r['id']=='interact.harness.clips-30':
        r['budget']={'op':'==','value':31}
json.dump(rows, open('/tmp/r214-m4-budgets.json','w'), indent=2, ensure_ascii=False)
PY
cp /tmp/r214-m4-budgets.json $A/mutant-M4-budgets.json
PERF_BUDGETS_INTERACTIONS=/tmp/r214-m4-budgets.json npx playwright test --config playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts > $A/mutant-M4.log 2>&1; echo "exit=$?" >> $A/mutant-M4.log
cp test-results/perf/latest-interactions.json $A/mutant-M4.json
reset_scratch
echo DONE > $A/mutants.done
