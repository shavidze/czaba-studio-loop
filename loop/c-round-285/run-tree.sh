#!/bin/bash
# C round 285: start one production server alone, warm up, run the listed probes sequentially, stop it.
# usage: run-tree.sh <tree> <port> <tag> <job...>   job = probe:mode:W:H:run[:shots] | flip:W:H:run[:bpm] | nb:W:H | auth
T=$1; PORT=$2; TAG=$3; shift 3
L=/home/runner/czaba-project/tmp/studio-real-loop; B=$L/b-round-284; C=$L/c-round-285; P=$C/probe; mkdir -p $P $C/shots
BASE=http://127.0.0.1:$PORT
cd /tmp/c285/$T && PORT=$PORT nohup npx remix-serve build/server/index.js > /tmp/c285/serve-$TAG.log 2>&1 &
SPID=$!
for i in $(seq 1 60); do curl -s -o /dev/null -w '%{http_code}' $BASE/studio-lab 2>/dev/null | grep -q 200 && break; sleep 1; done
echo "[$TAG] up $(date -u +%T)"
# warm-up (untimed, result kept but not a row)
node $B/ruler-probe.cjs $BASE $P/$TAG-warmup.json in 1440 900 > /dev/null 2>&1; echo "[$TAG] warmup rc=$?"
for job in "$@"; do
  IFS=: read -r kind a b c d e <<< "$job"
  case $kind in
    probe) mode=$a; W=$b; H=$c; run=$d; sd=""; if [ "$e" = shots ]; then sd=$C/shots/$TAG-$W; mkdir -p $sd; fi
      node $B/ruler-probe.cjs $BASE $P/$TAG-$mode-$W-$run.json $mode $W $H $sd > /dev/null 2>/tmp/c285/err-$TAG-$mode-$W-$run.txt; echo "[$TAG] $job rc=$?";;
    flip) W=$a; H=$b; run=$c; bpm=$d
      node $B/flip-probe.cjs $BASE $P/$TAG-flip$bpm-$W-$run.json $W $H $bpm > /dev/null 2>/tmp/c285/err-$TAG-flip-$W-$run.txt; echo "[$TAG] $job rc=$?";;
    nb) W=$a; H=$b
      node $C/neighbour-probe.cjs $BASE $W $H $P/$TAG-nb-$W.json /tmp/c285/$TAG-nb-$W.wav > /dev/null 2>/tmp/c285/err-$TAG-nb-$W.txt; echo "[$TAG] $job rc=$?";;
    auth) mkdir -p $C/shots/auth-$TAG
      node $L/c-round-284/auth-probe.cjs $BASE $P/auth-$TAG.json $C/shots/auth-$TAG > /dev/null 2>/tmp/c285/err-auth-$TAG.txt; echo "[$TAG] auth rc=$?";;
  esac
done
kill $SPID 2>/dev/null; pkill -f "remix-serve build/server/index.js" -P $SPID 2>/dev/null
sleep 1; fuser -k $PORT/tcp 2>/dev/null
echo "[$TAG] done $(date -u +%T)"
