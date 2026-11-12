#!/usr/bin/env bash
# b-round-459 matrix: v2 sketch :5192 all modes; HEAD :5190 fresh/reload/arrive/inject; replicates. One run at a time.
cd "$(dirname "$0")/.." || exit 1
run() { port=$1 w=$2 h=$3 cpu=$4 mode=$5 tag=$6; out=matrix/$port-$w-cpu$cpu-$mode$tag.json; line=$(node frames.mjs http://127.0.0.1:$port $w $h $cpu $mode $out 2>&1 | tail -1); echo "$port $w cpu$cpu $mode$tag $line" >> matrix/summary.txt; }
for vp in "1440 900" "1280 720"; do set -- $vp; for cpu in 1 4; do
  for m in fresh reload rm blockjs delayjs esc50 tab50 click50 clientnav arrive inject delayinject; do run 5192 $1 $2 $cpu $m ""; done
  for m in fresh reload arrive inject delayinject; do run 5190 $1 $2 $cpu $m ""; done
done; done
for i in 2 3; do run 5192 1440 900 4 fresh "-r$i"; run 5192 1440 900 4 clientnav "-r$i"; run 5192 1440 900 1 click50 "-r$i"; run 5192 1440 900 1 inject "-r$i"; run 5192 1440 900 4 inject "-r$i"; done
echo DONE >> matrix/summary.txt
