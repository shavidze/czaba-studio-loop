#!/bin/bash
R=/home/runner/czaba-project/tmp/studio-real-loop
O=$R/c-round-400/perf-results
S=/home/runner/czaba-project/tmp/c400-scratch-virt
ST=/home/runner/czaba-project/store
prog(){ echo "$(date -u +%T) $1" >> $O/progress.log; }
run(){ # name dir spec latest
  prog "START $1"; cd $2; s=$(date +%s)
  npx playwright test --config playwright.perf.config.ts perf/$3 > $O/$1.log 2>&1; rc=$?
  cp test-results/perf/$4 $O/$1.json 2>/dev/null
  echo "rc $rc seconds $(( $(date +%s)-s ))" > $O/$1.rc; prog "DONE $1 rc $rc"; }
run interact-head $ST studio-lab-interactions.perf.spec.ts latest-interactions.json
mkdir -p $S && rsync -a --exclude node_modules --exclude test-results --exclude build --exclude .git $ST/ $S/ && ln -s $ST/node_modules $S/node_modules && (cd $S && git init -q 2>/dev/null; patch -p1 < $R/b-round-398/sketch-14bii-lane.patch.txt > $O/virt-patch.log 2>&1; echo patch rc $? >> $O/virt-patch.log)
run interact-virt $S studio-lab-interactions.perf.spec.ts latest-interactions.json
run res-head $ST studio-lab-resources.perf.spec.ts latest-resources.json
run res-virt $S studio-lab-resources.perf.spec.ts latest-resources.json
run scale-head $ST studio-lab-scale.perf.spec.ts latest-scale.json
run scale-virt $S studio-lab-scale.perf.spec.ts latest-scale.json
rm -f $S/node_modules; rm -rf $S; prog "ALLDONE"
