L=/home/runner/czaba-project/tmp/studio-real-loop/c-round-334
cd /tmp/c334s && rm -rf test-results/perf build && timeout 2400 npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts > $L/perf-interactions-atree.log 2>&1
echo "rc=$?" > $L/perf.status
mkdir -p $L/perf-results; cp /tmp/c334s/test-results/perf/*.json $L/perf-results/ 2>/dev/null
