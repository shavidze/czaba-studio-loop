#!/bin/bash
O=/home/runner/czaba-project/tmp/studio-real-loop/c-round-316
cd /tmp/c316a; rm -rf test-results/perf
if pgrep -f "playwright test" >/dev/null; then echo OVERLAP-BEFORE >> $O/perf-driver.status; fi
node /home/runner/czaba-project/tmp/studio-real-loop/c-round-314/warm.cjs > $O/warm-perf.log 2>&1
echo "start $(date -u +%T)" >> $O/perf-driver.status
npx playwright test --config playwright.perf.config.ts perf/studio-lab.perf.spec.ts > $O/perf-harness.log 2>&1; rc=$?
cp test-results/perf/latest.json $O/perf-harness.json 2>/dev/null
echo "end $(date -u +%T) rc=$rc" >> $O/perf-driver.status
