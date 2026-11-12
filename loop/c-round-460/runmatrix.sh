#!/usr/bin/env bash
cd "$(dirname "$0")" || exit 1
S=matrix/summary.txt; : > $S
run() { port=$1 w=$2 h=$3 cpu=$4 mode=$5 tag=$6; out=matrix/$port-$w-cpu$cpu-$mode$tag.json; line=$(node frames.mjs http://127.0.0.1:$port $w $h $cpu $mode $out 2>&1 | tail -1); echo "$port $w cpu$cpu $mode$tag $line" >> $S; }
curl -s http://127.0.0.1:5190/ >/dev/null; curl -s http://127.0.0.1:5191/ >/dev/null
for vp in "1440 900" "1280 720"; do set -- $vp; for cpu in 1 4; do
  for m in fresh reload rm blockjs delayjs esc50 tab50 click50 clientnav arrive inject delayinject; do run 5191 $1 $2 $cpu $m ""; done
  for m in fresh reload arrive inject delayinject; do run 5190 $1 $2 $cpu $m ""; done
done; done
for i in 2 3; do run 5191 1440 900 4 fresh "-r$i"; run 5191 1440 900 4 clientnav "-r$i"; run 5191 1440 900 1 click50 "-r$i"; run 5191 1440 900 1 inject "-r$i"; run 5191 1440 900 4 inject "-r$i"; run 5191 1440 900 1 delayinject "-r$i"; done
echo DONE >> $S
