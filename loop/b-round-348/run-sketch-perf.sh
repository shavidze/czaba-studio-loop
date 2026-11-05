#!/usr/bin/env bash
# B round 348 -> 349: sketch then HEAD perf runs, sequential, alone (L38).
set -u
L=/home/runner/czaba-project/tmp/studio-real-loop/b-round-348
for spec in "sk:sketch" "head:head"; do
  dir=/home/runner/b348-scratch/${spec%%:*}; name=${spec##*:}
  cd "$dir" || exit 1
  rm -rf test-results/perf
  date -u +%FT%TZ > "$L/perf-$name.start"
  npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts > "$L/perf-$name.log" 2>&1
  echo "rc $?" >> "$L/perf-$name.log"
  mkdir -p "$L/perf-$name-results" && cp -r test-results/perf/. "$L/perf-$name-results/" 2>/dev/null
done
echo done > "$L/perf-runs.done"
