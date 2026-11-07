#!/bin/bash
L=/home/runner/czaba-project/tmp/studio-real-loop; C=$L/c-round-390; T=$C/t301; B=http://127.0.0.1:5173
while ! grep -q DONE $C/out/b4/status.txt 2>/dev/null; do sleep 5; done
r(){ d=$1; n=$2; shift 2; (cd $T/$d && timeout 600 "$@" > $T/$d/$n.log 2>&1; echo "$d/$n rc=$?" >> $T/status.txt); }
r r300 rows node rows.cjs $B
r r300 audio node audio.cjs
r r296 c296 node c296.mjs $B n
r r295 c295 node c295.cjs
r r293 c293 node c293.cjs
r r289 probe node probe.mjs $B n
r r283 lib node library-probe.cjs $B $T/r283/library-n.json
r r282 worker node worker-probe.cjs $B $T/r282/worker-n.json
r r282 export node export-probe-c282.cjs $B n $T/r282/export-n.json
r r276 c276 node c276.cjs $B n
r r278 c278 node c278.cjs $B n
r r274 c274 node c274.cjs $B new
r r271 c271 node c271-ui.mjs $B n
r r262 layout node layout.mjs $T/r262/layout-n.json after
r r262 audio node audio-keys.mjs $T/r262/audio-n.json after
echo DONE >> $T/status.txt
