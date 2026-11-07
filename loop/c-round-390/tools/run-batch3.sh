#!/bin/bash
cd /home/runner/czaba-project/store
C=/home/runner/czaba-project/tmp/studio-real-loop/c-round-390; B=http://127.0.0.1:5173; T=$C/tools; O=$C/out/b3
while ! grep -q DONE $C/out/b2/status.txt 2>/dev/null; do sleep 5; done
r(){ n=$1; shift; timeout 900 "$@" > $O/$n.log 2>&1; echo "$n rc=$?" >> $O/status.txt; }
r detail node $T/detail-text.mjs $B n
r journey node $T/journey/journey301.cjs
r name node $T/main.cjs
r budget node $T/budget.cjs
r budget2 node $T/budget2.cjs
for vp in "1440 900" "1280 720"; do set -- $vp
 r scroll-$1 node $T/scroll-after-crossing.cjs $B $O/scroll-$1.json $1 $2
 r visd-$1 node $T/visible-d.cjs $B $O/visd-$1.json $1 $2 3
 r pkload-$1 node $T/pk-load.cjs $B $1x$2 3 $O/pkload-$1.json
 r pkvid-$1 node $T/pk-video-sound.cjs $B $1x$2 $O/pkvid-$1.json
 r release-$1 node $T/release-probe.cjs $B $O/release-$1.json $1 $2
done
r cont1 node $T/continuity-probe.cjs $B $O/cont-1.json 3 1
r cont30 node $T/continuity-probe.cjs $B $O/cont-30.json 3 30
r posctl node $T/posctl-probe.cjs $B $O/posctl.json 3 1
r onended node $T/onended-probe.cjs
echo DONE >> $O/status.txt
