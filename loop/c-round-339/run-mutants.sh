#!/bin/bash
for m in a b; do
  cd /tmp/c339-scratch/$m && npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts > /home/runner/czaba-project/tmp/studio-real-loop/c-round-339/mutant-$m.log 2>&1; echo $? > /home/runner/czaba-project/tmp/studio-real-loop/c-round-339/mutant-$m.rc
  mkdir -p /home/runner/czaba-project/tmp/studio-real-loop/c-round-339/mutant-$m-results; cp /tmp/c339-scratch/$m/test-results/perf/latest-interactions.json /home/runner/czaba-project/tmp/studio-real-loop/c-round-339/mutant-$m-results/ 
done
touch /home/runner/czaba-project/tmp/studio-real-loop/c-round-339/mutants.done
