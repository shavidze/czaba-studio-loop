set -u
L=/home/runner/czaba-project/tmp/studio-real-loop/c-round-324
for t in head atree; do
  cd /tmp/c324/$t && rm -rf test-results/perf && timeout 2400 npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts > $L/perf-$t.log 2>&1; echo "$t rc=$?" >> $L/perf-driver.status
  mkdir -p $L/perf-$t-results && cp /tmp/c324/$t/test-results/perf/latest-interactions.json $L/perf-$t-results/ 2>/dev/null
done
echo done >> $L/perf-driver.status
