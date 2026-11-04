set -u
L=/home/runner/czaba-project/tmp/studio-real-loop/c-round-324
for t in head atree; do
  cd /tmp/c324/$t && rm -rf test-results/perf && timeout 2400 npx playwright test -c playwright.perf.config.ts perf/studio-lab.perf.spec.ts > $L/perfload-$t.log 2>&1; echo "$t rc=$?" >> $L/perf-load-driver.status
  mkdir -p $L/perfload-$t-results && cp /tmp/c324/$t/test-results/perf/*.json $L/perfload-$t-results/ 2>/dev/null
done
echo done >> $L/perf-load-driver.status
