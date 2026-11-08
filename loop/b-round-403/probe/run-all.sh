#!/bin/bash
L=/home/runner/czaba-project/tmp/studio-real-loop/b-round-403/probe
port=5201
for v in head mutA mutB; do
  cd /tmp/b404-$v && PORT=$port npx remix-serve build/server/index.js > $L/serve-$v.log 2>&1 &
  pid=$!
  for i in $(seq 1 60); do curl -s -o /dev/null http://127.0.0.1:$port/studio-lab && break; sleep 1; done
  for vp in 1440x900 1280x720; do
    node $L/minzoom200.cjs http://127.0.0.1:$port 6 $L/$v-6x-$vp.json $vp 200 >> $L/run-all.log 2>&1 || echo "FAIL $v $vp" >> $L/run-all.log
  done
  kill $pid; wait $pid 2>/dev/null
  port=$((port+1))
done
echo DONE >> $L/run-all.log
