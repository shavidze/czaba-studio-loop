#!/bin/bash
S=/home/runner/czaba-project/tmp/studio-real-loop/c-round-399/scratch-virt
L=/home/runner/czaba-project/tmp/studio-real-loop/c-round-399
cd $S || exit 1
start=$(date +%s)
npx playwright test --config playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts > $L/virt-interactions.log 2>&1
echo "rc=$? seconds=$(( $(date +%s) - start ))" > $L/virt-rc.txt
cp test-results/perf/latest-interactions.json $L/virt-interactions.json
