#!/usr/bin/env bash
# Usage: bash b-round-336/run-mutants.sh <dir-with-muP-muM-muD> <out-dir>   (run from the loop root; each run alone, L38)
B=$(realpath $1); mkdir -p $2; O=$(realpath $2)
for m in P M D; do
  (cd $B/mu$m && rm -rf test-results/perf && npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts > $O/mutant-$m.log 2>&1; echo "rc $?" >> $O/mutant-$m.log)
  mkdir -p $O/mutant-$m; cp $B/mu$m/test-results/perf/latest-interactions.json $O/mutant-$m/ 2>/dev/null || echo "no result for $m" >> $O/mutant-$m.log
done
python3 -I b-round-336/rowcmp-1x.py c-round-335/perf-results/latest-interactions.json $O/mutant-D/latest-interactions.json > $O/mutant-D-rowcmp.txt
