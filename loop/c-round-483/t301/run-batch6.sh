#!/bin/bash
L=/home/runner/czaba-project/tmp/studio-real-loop; C=$L/c-round-483; T=$C/t301; B=http://127.0.0.1:5173
r(){ d=$1; n=$2; shift 2; (cd $T/$d && timeout 500 "$@" > $T/$d/$n.log 2>&1; echo "$d/$n rc=$?" >> $T/status6.txt); }
r r264 cc node cc.mjs
r hgbg hgbg node hgbg.cjs
r hgbg hgbgm node hgbg-music.cjs
r r269 ui node c269-ui.mjs $B $T/r269/out
r r268 br node c268-browser.mjs $B $T/r268
r r288 probe node probe.cjs $B n
echo DONE >> $T/status6.txt
