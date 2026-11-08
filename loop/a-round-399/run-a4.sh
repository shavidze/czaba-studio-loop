#!/bin/bash
cd /home/runner/czaba-project/store || exit 1
L=/home/runner/czaba-project/tmp/studio-real-loop/a-round-399
for spec in scale resources interactions; do
  start=$(date +%s)
  npx playwright test --config playwright.perf.config.ts perf/studio-lab-$spec.perf.spec.ts > $L/a4-$spec.log 2>&1
  echo "$spec rc=$? seconds=$(( $(date +%s) - start ))" >> $L/a4-rc.txt
  cp test-results/perf/latest-$spec.json $L/a4-$spec.json
done
echo DONE >> $L/a4-rc.txt
