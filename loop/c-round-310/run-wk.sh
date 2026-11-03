#!/bin/bash
# usage: run-wk.sh <tag> <oob> <workerPath> <port>
C=/home/runner/czaba-project/tmp/studio-real-loop/c-round-310; cd $C
tag=$1; oob=$2; wp=$3; port=$4
rm -f $tag-server.log
R2_OOB=$oob node worker-server.mjs $wp $port $C/$tag-server.log > $tag-server.out 2>&1 & sp=$!
for i in $(seq 1 50); do curl -s -o /dev/null http://127.0.0.1:$port/ && break; sleep 0.2; done
node browser-probe.cjs http://127.0.0.1:$port $C/$tag-server.log $C/$tag-1440.json 1440x900 > $tag-probe.out 2>&1; echo "probe rc $?"
kill $sp; wait $sp 2>/dev/null
