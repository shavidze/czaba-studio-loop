#!/bin/bash
cd /home/runner/czaba-project/store
O=/home/runner/czaba-project/tmp/studio-real-loop/c-round-212/out
for i in 1 2; do
  s=$(date +%s)
  npm run test:perf > $O/perf-run$i.log 2>&1
  echo "run$i exit=$? secs=$(( $(date +%s)-s ))" >> $O/perf-status.txt
  cp test-results/perf/latest.json $O/perf-run$i.json
done
