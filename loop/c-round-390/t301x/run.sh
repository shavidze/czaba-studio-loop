cd /home/runner/czaba-project/tmp/studio-real-loop/c-round-390/t301x; B=http://127.0.0.1:5173
r(){ d=$1; n=$2; shift 2; (cd $d && timeout 700 "$@" > $n.log 2>&1; echo "$d/$n rc=$?" >> status.txt); }
r r266 c266 node c266-browser.mjs
r r265 browser node c265-browser.mjs $B after
r r265 split2 node c265-split2.mjs
r r265 nb node c265-nb.mjs $B after
mkdir -p r270/out; r r270 ui node c270-ui.mjs $B $PWD/r270/out $B
r r270 split node split-sel.mjs
r r272 stale node probe-stale-status.cjs $B new
r r273 p273 node probe-r273.cjs $B new
r r297 c297 node c297.mjs
r r298 c298 node c298.mjs
r r299 c299 node c299.mjs
r r291 probe node probe.mjs $B n
echo DONE >> status.txt
