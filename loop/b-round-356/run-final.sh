#!/usr/bin/env bash
# B round 356 -> 357: final sketch perf (alone), then full vitest on the final sketch.
set -u
L=/home/runner/czaba-project/tmp/studio-real-loop/b-round-356
cd /home/runner/b356-scratch/sc || exit 1
rm -rf test-results/perf build
date -u +%FT%TZ > "$L/perf-sketch-final.start"
sha256sum app/contexts/ArrangementContext.tsx app/components/arrangement/StudioWorkspace.tsx perf/budgets.interactions.json > "$L/perf-sketch-final.sha256"
npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts > "$L/perf-sketch-final.log" 2>&1
echo "rc $?" >> "$L/perf-sketch-final.log"
mkdir -p "$L/perf-sketch-final-results" && cp -r test-results/perf/. "$L/perf-sketch-final-results/" 2>/dev/null
rm -rf build
npx vitest run > "$L/precheck-full-final.log" 2>&1
echo "rc $?" >> "$L/precheck-full-final.log"
echo done > "$L/final-runs.done"
