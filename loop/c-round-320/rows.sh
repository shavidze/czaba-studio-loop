#!/bin/bash
O=/home/runner/czaba-project/tmp/studio-real-loop/c-round-320; cd /home/runner/czaba-project/store; : > $O/rows-status.txt
for t in h a; do if [ $t = h ]; then B=http://127.0.0.1:5291; else B=http://127.0.0.1:5292; fi
  timeout 900 node $O/c320-rows.mjs $B $t 1440x900 > $O/rows-$t-1440x900.log 2>&1; echo "$t 1440 rc=$?" >> $O/rows-status.txt
  timeout 900 node $O/c320-rows.mjs $B $t 1280x720 > $O/rows-$t-1280x720.log 2>&1; echo "$t 1280 rc=$?" >> $O/rows-status.txt
  RELOAD_BEFORE_SPLIT=1 timeout 900 node $O/c320-rows.mjs $B $t 1280x720 > $O/rows-$t-1280r.log 2>&1; echo "$t 1280r rc=$?" >> $O/rows-status.txt
  timeout 600 node $O/c320-wave.mjs $B $t > $O/wave-$t.log 2>&1; echo "$t wave rc=$?" >> $O/rows-status.txt
done
echo DONE >> $O/rows-status.txt
