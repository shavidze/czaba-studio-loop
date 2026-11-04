set -u
L=/home/runner/czaba-project/tmp/studio-real-loop
which=$1; dir=$2
cd $dir && timeout 2400 npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts > $L/a-round-327/perf-$which-interactions.log 2>&1; echo "$which rc=$?" >> $L/a-round-327/perf-driver.status
mkdir -p $L/a-round-327/perf-$which-results && cp $dir/test-results/perf/latest-interactions.json $L/a-round-327/perf-$which-results/ 2>/dev/null
echo "$which done" >> $L/a-round-327/perf-driver.status
