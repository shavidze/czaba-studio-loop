#!/bin/bash
cd /home/runner/czaba-project/tmp/studio-real-loop
C=$PWD/c-round-390; B=http://127.0.0.1:5173
for vp in "1440 900" "1280 720"; do set -- $vp; w=$1; h=$2
 node b-round-333/waveform-d-probe.mjs $B $C/out/wd-$w.json $w $h > $C/out/wd-$w.log 2>&1
 node c-round-334/trim-end.mjs $B $C/out/trimend-$w.json $w $h > $C/out/trimend-$w.log 2>&1
 node c-round-334/video-wave.mjs $B $C/out/video-$w.json $w $h > $C/out/video-$w.log 2>&1
 node c-round-332/ovr-probe.mjs $B ${w}x${h} $C/out/ovr-$w.json > $C/out/ovr-$w.log 2>&1
 node c-round-331/shown-probe.mjs $B ${w}x${h} $C/out/shown-$w.json > $C/out/shown-$w.log 2>&1
done
node b-round-328/end-bound-probe.mjs $B $C/out/end-bound.json > $C/out/end-bound.log 2>&1
ROWS_DIR=$C/rows node b-round-328/rows.mjs $B head390 > $C/out/rows.log 2>&1
touch $C/out/batch1.done
