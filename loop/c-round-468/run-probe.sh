#!/usr/bin/env bash
# usage: run-probe.sh <name> <port>
L=/home/runner/czaba-project/tmp/studio-real-loop; C=$L/c-round-468; n=$1; port=$2
cd $C/$n && PORT=$port npx remix-serve build/server/index.js > $C/serve-$n.log 2>&1 &
SP=$!
sleep 6
curl -s -o /dev/null -w "$n %{http_code}\n" 127.0.0.1:$port/
node $L/b-round-467/probe/store-scroll-probe.cjs http://127.0.0.1:$port $C/scroll-$n.json 1 > $C/scroll-$n.log 2>&1
kill $SP 2>/dev/null; sleep 1; ss -ltnp | grep ":$port " | grep -o "pid=[0-9]*" | cut -d= -f2 | xargs -r kill
