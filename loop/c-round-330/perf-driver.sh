set -u
L=/home/runner/czaba-project/tmp/studio-real-loop/c-round-330
node /home/runner/czaba-project/tmp/studio-real-loop/c-round-329/warm.cjs http://127.0.0.1:5173 >> $L/perf-driver.status 2>&1
cd /tmp/c330s && rm -rf test-results/perf build && timeout 2400 npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts > $L/perf-interactions-atree.log 2>&1; echo "interactions atree rc=$?" >> $L/perf-driver.status
mkdir -p $L/perf-interactions-atree-results && cp /tmp/c330s/test-results/perf/*.json $L/perf-interactions-atree-results/ 2>/dev/null
echo done >> $L/perf-driver.status
