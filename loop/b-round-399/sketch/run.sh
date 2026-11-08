#!/bin/bash
L=/home/runner/czaba-project/tmp/studio-real-loop/b-round-399
for n in virt head; do
  cd $L/scratch-$n || exit 1
  start=$(date +%s)
  npx playwright test --config playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts > $L/sketch/interactions-$n.log 2>&1
  echo "$n rc=$? seconds=$(( $(date +%s) - start ))" >> $L/sketch/rc.txt
  cp test-results/perf/latest-interactions.json $L/sketch/interactions-$n.json
done
echo DONE >> $L/sketch/rc.txt
