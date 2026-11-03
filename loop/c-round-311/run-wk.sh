#!/bin/bash
# usage: run-wk.sh <tag> <probe 311|309> <workerPath> <port> ; env R2_* passed through
C=/home/runner/czaba-project/tmp/studio-real-loop/c-round-311; cd $C
tag=$1; pr=$2; wp=$3; port=$4
rm -f $tag-server.log
node worker-server.mjs $wp $port $C/$tag-server.log > $tag-server.out 2>&1 & sp=$!
for i in $(seq 1 50); do curl -s -o /dev/null http://127.0.0.1:$port/ && break; sleep 0.2; done
if [ "$pr" = 311 ]; then node browser-probe-311.cjs http://127.0.0.1:$port $C/$tag-server.log $C/$tag-1440.json 1440x900 "$(cat /home/runner/czaba-project/tmp/studio-real-loop/b-round-310/probe/swap-etag.txt)" > $tag-probe.out 2>&1
else node browser-probe-309.cjs http://127.0.0.1:$port $C/$tag-server.log $C/$tag-1440.json 1440x900 > $tag-probe.out 2>&1; fi
echo "$tag probe rc $?"
kill $sp; wait $sp 2>/dev/null
