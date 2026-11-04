L=/home/runner/czaba-project/tmp/studio-real-loop/c-round-335
cd /tmp/c335s && rm -rf test-results/perf build && timeout 2400 npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts > $L/perf-interactions-atree.log 2>&1
echo "rc=$?" > $L/perf.status
mkdir -p $L/perf-results; cp /tmp/c335s/test-results/perf/*.json $L/perf-results/ 2>/dev/null
