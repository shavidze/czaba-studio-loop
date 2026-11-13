#!/bin/bash
L=/home/runner/czaba-project/tmp/studio-real-loop; C=$L/c-round-483; T=$C/tools; O=$C/out; B=http://127.0.0.1:5173
until grep -q CHAIN-DONE $C/chain.status 2>/dev/null; do sleep 5; done
cd $L
st(){ echo "$1 $(date -u +%H:%M:%S)" >> $C/chain3.status; }
r(){ n=$1; shift; timeout ${TMO:-600} "$@" > $O/c3-$n.log 2>&1; echo "$n rc=$? $(date -u +%H:%M:%S)" >> $C/chain3.status; }
# reruns of env-invalid rows (dev dep re-optimisation at 03:57 / missing out dirs)
(cd $C/t258/tools && timeout 600 node rows9.cjs RG-20 1440 > ../logs/RG-20-1440.rerun.log 2>&1; node rec199.cjs RG-20-1440 >/dev/null 2>&1); st rg20rerun
for w in 1440 1280; do (cd $C/t258/t207/tools && timeout 900 node c207.cjs $w > $C/t258/logs/c207-$w.log 2>&1); st c207-$w; done
for W in 1440 1280; do (cd $C/t258/s195/tools && timeout 900 node rs2a.cjs $W > ../logs/rs2a-$W.log 2>&1); st rs2a-$W; done
# tone video fixture via pk-video-sound (vp8), then vsound with the real tone
for vp in 1440x900 1280x720; do r pkvid-$vp node $T/pk-video-sound.cjs $B $vp $O/b3/pkvid-${vp%%x*}.json; done
for vp in 1440x900 1280x720; do r vsound-$vp node $T/vsound.cjs $B $vp $O/vsound-tone-$vp.json; done
for vp in "1440 900" "1280 720"; do set -- $vp
 r cross-playing-$1 node $T/cross-playing.mjs $B $O/cross-playing-$1.json $1 $2
 r cross-stopped-$1 node $T/cross-stopped.mjs $B $O/cross-stopped-$1.json $1 $2
 r group-$1 node $T/group-probe.mjs $B $O/group-$1.json $1 $2 0
 r escdrag-$1 node $T/escdrag.cjs $1 $2
done
r loaf node $T/loaf.cjs
(cd $T/hint && r hint node hint-main.cjs)
for s in rp-c301-01 rp-c331-01 rp-fold-selection rp-status-race; do r $s node $T/rp/$s.cjs; done
(cd $T/rp301 && r rp301 node rp301.cjs)
r journey-full node $T/journey-full.cjs
r g390-auth node $T/g390-auth.cjs
for vp in 1440x900 1280x720; do r fontnet-dev-$vp node $T/fontnet.cjs $B /studio-lab 3 $vp; done
r font-bytes-dev node $T/font-bytes.cjs $B $O/fonts/dev-font-bytes.json
(mkdir -p $C/out; cd $C && r preload-warn node $T/preload-warn.cjs)
r mp3ready node $T/c218-mp3-ready.cjs $B real 1440 900 $O/mp3
# STEM-CACHE with the base the oracle used
for vp in "1440 900" "1280 720"; do set -- $vp
 r cache-$1 node $C/t389/tools/cache.mjs $B/studio-lab $1 $2 /tmp/c425-prof-$1 $O/cache-$1x$2.json
done
st DEV-DONE
