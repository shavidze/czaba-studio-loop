#!/usr/bin/env bash
cd /home/runner/czaba-project/store || exit 1
OUT=/home/runner/czaba-project/tmp/studio-real-loop/a-round-210
for n in 1 2; do
  npm run test:perf > "$OUT/run$n.log" 2>&1
  echo "exit=$?" >> "$OUT/run$n.log"
  cp test-results/perf/latest.json "$OUT/run$n.json" 2>/dev/null
done
touch "$OUT/perf.done"
