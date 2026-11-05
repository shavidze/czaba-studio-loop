#!/bin/bash
cd /home/runner/czaba-project/store
C=/home/runner/czaba-project/tmp/studio-real-loop/c-round-341; B=http://127.0.0.1:5173; T=$C/tools; O=$C/out/b2
timeout 900 node $T/c324-rows.mjs $B n > $O/c324-rows.log 2>&1; echo "c324-rows rc=$?" >> $O/status.txt
timeout 600 node $T/c324-group.mjs $B n > $O/c324-group.log 2>&1; echo "c324-group rc=$?" >> $O/status.txt
timeout 900 node $T/c320-rows.mjs $B n 1440x900 > $O/c320-1440.log 2>&1; echo "c320-1440 rc=$?" >> $O/status.txt
timeout 900 node $T/c320-rows.mjs $B n 1280x720 > $O/c320-1280.log 2>&1; echo "c320-1280 rc=$?" >> $O/status.txt
RELOAD_BEFORE_SPLIT=1 timeout 900 node $T/c320-rows.mjs $B n 1280x720 > $O/c320-1280r.log 2>&1; echo "c320-1280r rc=$?" >> $O/status.txt
timeout 600 node $T/c320-wave.mjs $B n > $O/c320-wave.log 2>&1; echo "c320-wave rc=$?" >> $O/status.txt
echo DONE >> $O/status.txt
