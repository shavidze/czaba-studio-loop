#!/bin/bash
cd /home/runner/czaba-project/store
L=/home/runner/czaba-project/tmp/studio-real-loop; C=$L/c-round-341; B=http://127.0.0.1:5173; T=$C/tools; O=$C/out/b4
r(){ n=$1; shift; timeout 900 "$@" > $O/$n.log 2>&1; echo "$n rc=$?" >> $O/status.txt; }
for vp in 1440x900 1280x720; do r latch-$vp node $T/latch.mjs $B $vp $O/latch-$vp.json; done
r cold-1440 node $T/cold-start.cjs $B 4000 $O/cold-1440.json 1440x900
r c325 node $T/c325-rows.mjs $B n
r c328 node $T/c328-rows.mjs $B n
r mp3 node $L/c-round-218/c218-mp3.cjs $B real 1440 900 $O/mp3-real.json
r oss env CI=true npx vitest run app/lib/__tests__/third-party-licenses.test.ts
echo DONE >> $O/status.txt
