#!/bin/bash
OUT=/home/runner/czaba-project/tmp/studio-real-loop/c-round-313
run(){ name=$1; dir=$2; cd $dir; rm -rf build test-results/perf; 
  if pgrep -f "remix-serve build/server" >/dev/null || pgrep -f "playwright test" >/dev/null; then echo "$name OVERLAP-BEFORE" >> $OUT/perf-driver.status; fi
  echo "$name start $(date -u +%T)" >> $OUT/perf-driver.status
  npx playwright test --config playwright.perf.config.ts perf/studio-lab.perf.spec.ts > $OUT/perf-$name.log 2>&1; rc=$?
  cp test-results/perf/latest.json $OUT/perf-$name.json 2>/dev/null
  echo "$name end $(date -u +%T) rc=$rc" >> $OUT/perf-driver.status; }
S=/home/runner/czaba-project/store
run sketch-store-1 $S
run headharness-1 /tmp/c313h
run sketch-store-2 $S
run headharness-2 /tmp/c313h
run mu-live-busy0 /tmp/c313m
run head-app-control /tmp/c313hc
echo ALLDONE >> $OUT/perf-driver.status
