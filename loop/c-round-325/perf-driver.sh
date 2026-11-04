set -u
L=/home/runner/czaba-project/tmp/studio-real-loop/c-round-325
declare -A D=([head]=/tmp/c325h [atree]=/tmp/c325s)
for spec in interactions load; do
 for t in head atree; do
  f=perf/studio-lab-interactions.perf.spec.ts; [ $spec = load ] && f=perf/studio-lab.perf.spec.ts
  cd ${D[$t]} && rm -rf test-results/perf && timeout 2400 npx playwright test -c playwright.perf.config.ts $f > $L/perf-$spec-$t.log 2>&1; echo "$spec $t rc=$?" >> $L/perf-driver.status
  mkdir -p $L/perf-$spec-$t-results && cp ${D[$t]}/test-results/perf/*.json $L/perf-$spec-$t-results/ 2>/dev/null
 done
done
echo done >> $L/perf-driver.status
