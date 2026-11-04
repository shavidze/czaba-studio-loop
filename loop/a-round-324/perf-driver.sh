set -u
cd /tmp/a324h && timeout 1800 npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts > /home/runner/czaba-project/tmp/studio-real-loop/a-round-324/perf-h-interactions.log 2>&1; echo "head rc=$?" >> /home/runner/czaba-project/tmp/studio-real-loop/a-round-324/perf-driver.status
mkdir -p /home/runner/czaba-project/tmp/studio-real-loop/a-round-324/perf-h-results && cp /tmp/a324h/test-results/perf/latest-interactions.json /home/runner/czaba-project/tmp/studio-real-loop/a-round-324/perf-h-results/ 2>/dev/null
cd /tmp/a324s && timeout 1800 npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts > /home/runner/czaba-project/tmp/studio-real-loop/a-round-324/perf-a-interactions.log 2>&1; echo "a rc=$?" >> /home/runner/czaba-project/tmp/studio-real-loop/a-round-324/perf-driver.status
mkdir -p /home/runner/czaba-project/tmp/studio-real-loop/a-round-324/perf-a-results && cp /tmp/a324s/test-results/perf/latest-interactions.json /home/runner/czaba-project/tmp/studio-real-loop/a-round-324/perf-a-results/ 2>/dev/null
echo done >> /home/runner/czaba-project/tmp/studio-real-loop/a-round-324/perf-driver.status
