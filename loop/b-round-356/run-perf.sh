#!/usr/bin/env bash
# B round 356 -> 357: sketch + M-B1 perf runs, sequential, alone (L38).
set -u
L=/home/runner/czaba-project/tmp/studio-real-loop/b-round-356
for spec in "sc:sketch" "mu/m-b1:mu-b1"; do
  dir=/home/runner/b356-scratch/${spec%%:*}; name=${spec##*:}
  cd "$dir" || exit 1
  rm -rf test-results/perf build
  date -u +%FT%TZ > "$L/perf-$name.start"
  sha256sum app/contexts/ArrangementContext.tsx app/components/arrangement/StudioWorkspace.tsx perf/budgets.interactions.json > "$L/perf-$name.sha256"
  npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts > "$L/perf-$name.log" 2>&1
  echo "rc $?" >> "$L/perf-$name.log"
  mkdir -p "$L/perf-$name-results" && cp -r test-results/perf/. "$L/perf-$name-results/" 2>/dev/null
done
echo done > "$L/perf-runs.done"
