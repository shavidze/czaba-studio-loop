#!/usr/bin/env bash
cd "$(dirname "$0")"
S=matrix/summary.txt; : > $S
curl -s http://127.0.0.1:5190/ >/dev/null; curl -s http://127.0.0.1:5191/ >/dev/null
for port in 5190 5191; do
  if [ $port = 5190 ]; then modes="fresh reload arrive"; tag=HEAD; else modes="fresh reload rm clientnav arrive blockjs delayjs esc50 tab50 click50"; tag=TREE; fi
  for vp in "1440 900" "1280 720"; do for cpu in 1 4; do for m in $modes; do
    set -- $vp
    out=$(node frames.mjs http://127.0.0.1:$port $1 $2 $cpu $m matrix/$tag-$1-cpu$cpu-$m.json 2>&1 | tail -1)
    echo "$tag $1x$2 cpu$cpu $m $out" >> $S
  done; done; done
done
echo DONE >> $S
