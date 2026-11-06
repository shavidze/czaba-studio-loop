#!/usr/bin/env bash
# B round 360 -> 361: MU-7 perf run with the asserting budgets, alone (L38).
set -u
L=/home/runner/czaba-project/tmp/studio-real-loop/b-round-360
cd /home/runner/b360-scratch/mu-7 || exit 1
rm -rf ./test-results/perf ./build
date -u +%FT%TZ > "$L/perf-mu-7-b.start"
sha256sum perf/budgets.interactions.json app/contexts/ArrangementContext.tsx > "$L/perf-mu-7-b.sha256"
npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts > "$L/perf-mu-7-b.log" 2>&1
echo "rc $?" >> "$L/perf-mu-7-b.log"
mkdir -p "$L/perf-mu-7-b-results" && cp -r test-results/perf/. "$L/perf-mu-7-b-results/" 2>/dev/null
echo done > "$L/perf-mu-7.done"
