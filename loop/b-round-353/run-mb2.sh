#!/usr/bin/env bash
set -u
L=/home/runner/czaba-project/tmp/studio-real-loop/b-round-353
cd /home/runner/b353-scratch/mu/m-b2 || exit 1
rm -rf test-results/perf
date -u +%FT%TZ > "$L/perf-mu-b2.start"
sha256sum perf/budgets.interactions.json app/components/arrangement/ArrangementVideoDock.tsx > "$L/perf-mu-b2.sha256"
npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts > "$L/perf-mu-b2.log" 2>&1
echo "rc $?" >> "$L/perf-mu-b2.log"
mkdir -p "$L/perf-mu-b2-results" && cp -r test-results/perf/. "$L/perf-mu-b2-results/" 2>/dev/null
echo done > "$L/perf-mb2.done"
