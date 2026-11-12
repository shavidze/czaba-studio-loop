#!/bin/bash
# usage: screen.sh <name> <css>
L=/home/runner/czaba-project/tmp/studio-real-loop; A=$L/a-round-468
HIDE_CSS="$2" node $L/b-round-467/probe/store-scroll-floor-probe.cjs http://127.0.0.1:3468 $A/screens/$1.json 1 > $A/screens/$1.log 2>&1
echo "== $1 :: $2" >> $A/screens/summary.txt
node $A/summ.cjs $A/screens/$1.json y >> $A/screens/summary.txt
