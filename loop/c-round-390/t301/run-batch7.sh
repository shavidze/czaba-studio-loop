#!/bin/bash
L=/home/runner/czaba-project/tmp/studio-real-loop; C=$L/c-round-390; T=$C/t301; B=http://127.0.0.1:5173
while ! grep -q DONE $T/status6.txt 2>/dev/null; do sleep 5; done
r(){ n=$1; shift; timeout 500 "$@" > $T/$n.log 2>&1; echo "$n rc=$?" >> $T/status7.txt; }
cd $T/perf3
for vp in "1440 900" "1280 720"; do set -- $vp
 r p3-ruler-in-$1 node ruler-probe.cjs $B $T/perf3/out/ruler-in-$1.json in $1 $2
 r p3-ruler-out-$1 node ruler-probe.cjs $B $T/perf3/out/ruler-out-$1.json out $1 $2
 r p3-flip-$1 node flip-probe.cjs $B $T/perf3/out/flip-$1.json $1 $2
 r p3-flip120-$1 node flip-probe.cjs $B $T/perf3/out/flip120-$1.json $1 $2 120
done
cd $T/smoke; r smoke306 node smoke306.cjs
cd $C/t258/tools; for w in 1440 1280; do r rp-$w node rp.cjs $w; done
echo DONE >> $T/status7.txt
