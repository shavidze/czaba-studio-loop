cd /home/runner/czaba-project/tmp/studio-real-loop/c-round-258/tools
for w in 1440 1280; do timeout 900 node rvstatic.cjs $w > ../logs/rvstatic-$w.log 2>&1; done
for w in 1440 1280; do timeout 900 node rvm.cjs $w > ../logs/rvm-$w.log 2>&1; done
for w in 1440 1280; do timeout 900 node rvfader.cjs $w > ../logs/rvfader-$w.log 2>&1; done
for w in 1440 1280; do timeout 900 node rvmarker.cjs $w > ../logs/rvmarker-$w.log 2>&1; done
for w in 1440 1280; do timeout 900 node c164-env.cjs $w > ../logs/env-$w.log 2>&1; done
for w in 1440 1280; do timeout 900 node focus198.cjs 5173 $w rich > ../logs/focus-$w.log 2>&1; done
for w in 1440 1280; do timeout 900 node chrome198.cjs 5173 $w > ../logs/chrome-$w.log 2>&1; done
echo DONE > ../logs/s4.done
