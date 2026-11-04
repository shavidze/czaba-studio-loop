#!/usr/bin/env bash
# C round 337 serial chain (L38: each perf run alone)
set -u
L=/home/runner/czaba-project/tmp/studio-real-loop; S=/home/runner/czaba-project/store; M=/home/runner/c337-mu; O=$L/c-round-337
cd $L
rm -rf $M; mkdir -p $M
for X in P M D W; do
  rsync -a --exclude node_modules --exclude build --exclude test-results $S/ $M/mu$X/ && ln -s $S/node_modules $M/mu$X/node_modules
done
for X in P M D; do python3 -I b-round-336/make-mutant.py $M/mu$X $X; done
# W: own mutant inside dragWindow: release commits only from up+500ms
python3 -I c-round-337/make-own-mutant.py $M/muW > $O/own-mutant-apply.txt 2>&1
# real perf of A's tree
(cd $S && rm -rf test-results/perf && npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts > $O/perf.log 2>&1; echo "rc $?" >> $O/perf.log)
mkdir -p $O/perf-results; cp $S/test-results/perf/latest-interactions.json $O/perf-results/ 2>&1
python3 -I b-round-329/perf-rowcmp.py c-round-335/perf-results/latest-interactions.json $O/perf-results/latest-interactions.json > $O/perf-rowcmp.txt 2>&1
python3 -I b-round-336/rowids-equal.py c-round-335/perf-results/latest-interactions.json $O/perf-results/latest-interactions.json > $O/rowids-equal.txt 2>&1
echo PERF-DONE > $O/perf.done
bash b-round-336/run-mutants.sh $M c-round-337/mutants
for X in W; do
  (cd $M/mu$X && rm -rf test-results/perf && npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts > $O/mutant-$X.log 2>&1; echo "rc $?" >> $O/mutant-$X.log)
  mkdir -p $O/mutants/mutant-$X; cp $M/mu$X/test-results/perf/latest-interactions.json $O/mutants/mutant-$X/
  python3 -I b-round-336/rowcmp-1x.py c-round-335/perf-results/latest-interactions.json $O/mutants/mutant-$X/latest-interactions.json > $O/mutants/mutant-W-rowcmp.txt 2>&1
done
echo ALL-DONE > $O/all.done
