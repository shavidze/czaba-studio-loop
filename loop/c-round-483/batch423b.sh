#!/bin/bash
L=/home/runner/czaba-project/tmp/studio-real-loop; C=$L/c-round-483; B=http://127.0.0.1:5173
until grep -q WK-SPLIT-DONE $C/b423.status 2>/dev/null; do sleep 5; done
cd $L
st(){ echo "$1 $(date -u +%H:%M:%S)" >> $C/b423b.status; }
r(){ n=$1; shift; timeout ${TMO:-900} "$@" > $C/423out/$n.log 2>&1; echo "$n rc=$? $(date -u +%H:%M:%S)" >> $C/b423b.status; }
for vp in 1440x900 1280x720; do
  r p410-$vp node $C/pk/peaks-probe-410.mjs $B $C/pk/p410-$vp.json $vp
  r real-$vp node $C/pk/peaks-before-ready-413.mjs $B $C/pk/real-$vp.json $vp real
  r p404-$vp node $C/pk/peaks-before-ready-413.mjs $B $C/pk/404-$vp.json $vp 404
  for m in none failing normal; do r fb-$m-$vp node $C/sc/peaks-fallback.cjs $B $m $C/sc/fb-$m-$vp.json $vp; done
  r minzoom-$vp node $C/sc/minzoom200.cjs $B 1 $C/sc/minzoom-$vp.json $vp
  r frames-$vp node $C/sc/frames200.cjs $B $C/sc/frames-$vp.json $vp
  r pin-$vp node $C/sc/pin-blur-group.cjs $B $C/sc/pin-$vp.json $vp
  r synth-$vp node $C/r397/rows.cjs $B 1 $C/r397/rows-$vp.json $vp
  r video406-$vp node $C/vid/video-probe-c406.mjs $B $C/vid/playsync-$vp.json $vp
  r video407-$vp node $C/vid/video-extra-c407.mjs $C/vid/extra-$vp.json $vp
done
for w in "1440 900" "1280 720"; do set -- $w; r r393-$1 node $C/r393/probe.mjs $B $1 $2; done
r r395 node $C/r395/rows.mjs; r r396 node $C/r396/rows.mjs
r r392 node $C/r392/probe.mjs; r r392nb node $C/r392/nb.mjs
st OTHER-DONE
# R423-STEM-CACHE production probe on a scratch copy
SRC=/tmp/r483-419; rm -rf $SRC; mkdir -p $SRC; (cd /home/runner/czaba-project/store && git archive HEAD | tar -x -C $SRC); ln -s /home/runner/czaba-project/store/node_modules $SRC/node_modules
bash $C/probe-419/run-probe.sh $SRC sketch 5391 $C/probe-419/out > $C/423out/probe419.log 2>&1; st probe419
python3 -I $C/probe-419/compare.py $C/probe-419/out > $C/423out/probe419-compare.txt 2>&1
pkill -f "remix-serve build/server" 2>/dev/null
st B423B-DONE
