#!/bin/bash
O=/home/runner/czaba-project/tmp/studio-real-loop/c-round-318
for pair in "h interactions" "a interactions" "h studio-lab" "a studio-lab"; do set -- $pair; d=/tmp/c318$1; spec=$2
  cd $d; rm -rf test-results/perf
  if pgrep -f "playwright test" >/dev/null; then echo "OVERLAP-BEFORE $1 $spec" >> $O/perf-driver.status; fi
  echo "start $1 $spec $(date -u +%T)" >> $O/perf-driver.status
  if [ $spec = interactions ]; then f=perf/studio-lab-interactions.perf.spec.ts; else f=perf/studio-lab.perf.spec.ts; fi
  npx playwright test --config playwright.perf.config.ts $f > $O/perf-$1-$spec.log 2>&1; rc=$?
  echo "end $1 $spec $(date -u +%T) rc=$rc" >> $O/perf-driver.status
done
echo DONE >> $O/perf-driver.status
