#!/bin/bash
L=/home/runner/czaba-project/tmp/studio-real-loop; C=$L/c-round-483; B=http://127.0.0.1:5173
until grep -q CHAIN6-DONE $C/chain6.status 2>/dev/null; do sleep 5; done
cd $L
st(){ echo "$1 $(date -u +%H:%M:%S)" >> $C/b423.status; }
r(){ n=$1; shift; timeout ${TMO:-900} "$@" > $C/423out/$n.log 2>&1; echo "$n rc=$? $(date -u +%H:%M:%S)" >> $C/b423.status; }
mkdir -p $C/probe/sketch $C/probe-418/sketch $C/probe-421/sketch
(cd $C/probe && BASE=$B OUT=$C/probe/sketch r held-enter node held-enter.mjs); python3 -I $C/probe/compare.py $C/probe > $C/423out/held-enter-compare.txt 2>&1; st held-compare
for R in R1 R5 R6 R7 R9; do (cd $C/probe-418 && BASE=$B OUT=$C/probe-418/sketch r p418-$R node rows-418.mjs $R); done
python3 -I $C/probe-418/compare.py $C/probe-418 > $C/423out/p418-compare.txt 2>&1; st p418-compare
for R in R1 R5 R6 R7 R9; do (cd $C/probe-421 && BASE=$B OUT=$C/probe-421/sketch r p421-$R node rows-421.mjs $R); done
python3 -I $C/probe-421/compare.py $C/probe-421 > $C/423out/p421-compare.txt 2>&1; st p421-compare
(cd $C/marker && BASE=$B OUT=$C/marker r marker node marker-seek.cjs; NOMARKER=1 BASE=$B OUT=$C/marker r marker-nomarker node marker-seek.cjs)
for vp in "1440 900" "1280 720"; do set -- $vp; (cd $C/meter && r meter-$1 node meter-probe.mjs $1 $2); done
for vp in 1440x900 1280x720; do r lane-actions-$vp node $C/lane/lane-actions-probe.mjs $B $C/lane/lane-$vp.json $vp; done
for vp in 1440 1280; do r leaf-$vp node $C/lane/leaf-probe-409.mjs $B $C/lane/leaf-probe-$vp.json $vp; done
r scale-export node $C/export/scale-export.mjs
r leaf-cjs node $C/s423/leaf.cjs
r name-rerun node $C/tools/main.cjs
(cd $C/t258/tools && timeout 600 bash run.sh rows6.cjs RG-20 1440 > $C/423out/rg20-rerun.log 2>&1; echo "rg20 rc=$?" >> $C/b423.status)
(cd $C/t301/r295 && timeout 600 node c295.cjs > $C/423out/c295-rerun.log 2>&1; echo "c295 rc=$?" >> $C/b423.status)
st B423-DONE
