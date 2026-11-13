#!/usr/bin/env bash
# usage: run-matrix.sh <base> <outdir>   (sequential; L38)
B=$1; O=$2; mkdir -p "$O"; D=$(dirname "$0")
node "$D/frames489.mjs" "$B" 1440 900 1 fresh /tmp/warm489.json >/dev/null 2>&1
for row in "1440 900 1 fresh" "1280 720 1 fresh" "1440 900 4 fresh" "1280 720 4 fresh" "1440 900 1 net4g" "1440 900 4 net4g" "1440 900 1 net3g" "1440 900 1 delayjs" "1440 900 1 blockjs" "1440 900 1 wheel" "1280 720 1 wheel" "1440 900 1 wheel50" "1440 900 1 reload" "1440 900 1 rm" "1440 900 1 clientnav" "1440 900 1 arrive" "1440 900 1 esc50" "1440 900 1 tab50" "1440 900 1 click50" "1440 900 1 esc1500" "1440 900 1 tab1500" "1440 900 1 click1500" "1440 900 1 delay800" "1440 900 1 delay3000" "1280 720 1 delay3000"; do
  set -- $row
  node "$D/frames489.mjs" "$B" $1 $2 $3 $4 "$O/f-$1-cpu$3-$4.json" >> "$O/summary.jsonl" 2>>"$O/err.log"
done
echo done
