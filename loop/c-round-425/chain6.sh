#!/bin/bash
L=/home/runner/czaba-project/tmp/studio-real-loop; C=$L/c-round-425; T=$C/tools; B=http://127.0.0.1:5173
until grep -q CHAIN5-DONE $C/chain5.status 2>/dev/null; do sleep 5; done
cd $L
st(){ echo "$1 $(date -u +%H:%M:%S)" >> $C/chain6.status; }
for W in 1440 1280; do (cd $C/t258/s195/tools && timeout 600 node guest195.cjs $W > ../logs/guest195-$W.log 2>&1; timeout 900 node rs2a.cjs $W > ../logs/rs2a-$W.log 2>&1); st rs2a-$W; done
for vp in 1440x900 1280x720; do timeout 900 node $T/loaf-attr.cjs $B $vp 3 $C/out/loaf-attr-$vp.json > $C/out/loaf-attr-$vp.log 2>&1; st loaf-$vp; done
st CHAIN6-DONE
