#!/bin/bash
OUT=/home/runner/czaba-project/tmp/studio-real-loop/c-round-314
run(){ name=$1; dir=$2; cd $dir; rm -rf build test-results/perf;
  if pgrep -f "remix-serve build/server" >/dev/null || pgrep -f "playwright test" >/dev/null; then echo "$name OVERLAP-BEFORE" >> $OUT/perf-driver.status; fi
  node $OUT/warm.cjs > $OUT/warm-$name.log 2>&1
  echo "$name start $(date -u +%T)" >> $OUT/perf-driver.status
  npx playwright test --config playwright.perf.config.ts perf/studio-lab.perf.spec.ts > $OUT/perf-$name.log 2>&1; rc=$?
  cp test-results/perf/latest.json $OUT/perf-$name.json 2>/dev/null
  echo "$name end $(date -u +%T) rc=$rc" >> $OUT/perf-driver.status; }
S=/home/runner/czaba-project/store
run harness-1 $S
run harness-2 $S
run mu-follow-scroll /tmp/c314m
echo ALLDONE >> $OUT/perf-driver.status
