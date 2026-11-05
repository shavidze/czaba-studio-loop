#!/usr/bin/env bash
# B round 353 -> 354: sketch + M-B2prime perf runs, sequential, alone (L38).
set -u
L=/home/runner/czaba-project/tmp/studio-real-loop/b-round-353
for spec in "sc:sketch" "mu/m-b2p:mu-b2prime"; do
  dir=/home/runner/b353-scratch/${spec%%:*}; name=${spec##*:}
  cd "$dir" || exit 1
  rm -rf test-results/perf
  date -u +%FT%TZ > "$L/perf-$name.start"
  sha256sum perf/budgets.interactions.json app/components/arrangement/ArrangementVideoDock.tsx > "$L/perf-$name.sha256"
  npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts > "$L/perf-$name.log" 2>&1
  echo "rc $?" >> "$L/perf-$name.log"
  mkdir -p "$L/perf-$name-results" && cp -r test-results/perf/. "$L/perf-$name-results/" 2>/dev/null
done
echo done > "$L/perf-runs.done"
