#!/bin/bash
cd /home/runner/czaba-project/tmp/studio-real-loop/c-round-425/t389/out
T=../tools; B=http://127.0.0.1:5173
r() { name=$1; shift; echo "START $name $(date +%T)" >> ../logs/batch1.status; timeout 400 "$@" > ../logs/$name.log 2>&1; echo "END $name rc=$? $(date +%T)" >> ../logs/batch1.status; }
for vp in "1440 900" "1280 720"; do set -- $vp; w=$1; h=$2
  r meter-$w node $T/meter-freeze.mjs $w $h meter-$w.json
  r mc-$w node $T/meter-control.mjs $w $h mc-$w.json
  r resync-$w node $T/resync-meter.mjs $w $h resync-$w.json
  r m1-$w node $T/resync-throw.mjs $B m1-$w.json $w $h
  r m1b-$w node $T/resync-throw2.mjs $B m1b-$w.json $w $h
  r pwp-ok-$w node $T/pwp.mjs $B pwp-ok-$w.json ok $w $h
  r pwp-fail-$w node $T/pwp.mjs $B pwp-fail-$w.json fail $w $h
  r bg-$w node $T/bg.mjs ${w}x$h
  r playstop-$w node $T/playstop.mjs ${w}x$h
  r follow-$w node $T/follow-probe.mjs $B follow-${w}x$h.json ${w}x$h
  r marker-$w node $T/marker-probe.mjs $B marker-${w}x$h.json ${w}x$h
  r group-$w node $T/group-probe.mjs $B group-$w.json $w $h 0
  r groupc-$w node $T/group-probe.mjs $B group-collapsed-$w.json $w $h 1
done
r m2-1440 node $T/m2-flow.mjs $B m2-1440.json 1440 900
r playrefuse node $T/playrefuse.mjs $B
r evict node $T/evict.mjs
r narrow node $T/narrow-probe.mjs $B narrow.json
r settings node $T/settings-probe.mjs
r leaves node $T/leaves.mjs
r brace node $T/brace.mjs
r misc node $T/misc.mjs
r faders node $T/faders.mjs
echo ALLDONE >> ../logs/batch1.status
