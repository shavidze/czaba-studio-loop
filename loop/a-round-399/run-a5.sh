#!/bin/bash
S=/home/runner/czaba-project/tmp/studio-real-loop/a-round-399/scratch-virt
L=/home/runner/czaba-project/tmp/studio-real-loop/a-round-399
cd $S || exit 1
for spec in scale resources interactions; do
  start=$(date +%s)
  npx playwright test --config playwright.perf.config.ts perf/studio-lab-$spec.perf.spec.ts > $L/a5-$spec.log 2>&1
  echo "$spec rc=$? seconds=$(( $(date +%s) - start ))" >> $L/a5-rc.txt
  cp test-results/perf/latest-$spec.json $L/a5-$spec.json
done
echo DONE >> $L/a5-rc.txt
