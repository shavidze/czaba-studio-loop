#!/usr/bin/env bash
# A round 348: A-PERF on store, then mutant runs in scratch, sequential, alone (L38).
set -u
L=/home/runner/czaba-project/tmp/studio-real-loop/a-round-348
for spec in "/home/runner/czaba-project/store:store" "/home/runner/a348-scratch/mu/mu-gross-preview:mu-gross-preview" "/home/runner/a348-scratch/mu/mu-combo:mu-combo" "/home/runner/a348-scratch/mu/mu-fine-clipgain:mu-fine-clipgain"; do
  dir=${spec%%:*}; name=${spec##*:}
  cd "$dir" || exit 1
  rm -rf test-results/perf
  date -u +%FT%TZ > "$L/perf-$name.start"
  npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts > "$L/perf-$name.log" 2>&1
  echo "rc $?" >> "$L/perf-$name.log"
  mkdir -p "$L/perf-$name-results" && cp -r test-results/perf/. "$L/perf-$name-results/" 2>/dev/null
done
echo done > "$L/perf-runs.done"
