#!/usr/bin/env bash
set -u
S=/home/runner/b367-scratch; P=/home/runner/czaba-project/tmp/studio-real-loop/b-round-367/probe; Q=/home/runner/czaba-project/tmp/studio-real-loop/b-round-366/probe; PORT=5191
(cd $S && npm run build > $P/sketch-build.log 2>&1); echo "build=$?"
cd $S && PORT=$PORT nohup npx remix-serve build/server/index.js > /tmp/b367-serve.log 2>&1 &
SPID=$!
for i in $(seq 1 60); do curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:$PORT/studio-lab | grep -q 200 && break; sleep 1; done
cd $Q && node stem-integrity-probe.mjs http://127.0.0.1:$PORT 1440x900 /tmp/b367-warm.json 0 > /dev/null 2>&1
for VP in 1440x900 1280x720; do
  node stem-integrity-probe.mjs http://127.0.0.1:$PORT $VP $P/sketch-$VP.json 1 2> $P/sketch-$VP.err; echo "probe-$VP=$?"
  python3 -I summarize.py $P/sketch-$VP.json > $P/sketch-$VP.summary.txt 2>&1
done
kill $SPID 2>/dev/null; pkill -P $SPID 2>/dev/null
for pid in $(ss -ltnp 2>/dev/null | grep ":$PORT " | grep -oE 'pid=[0-9]+' | cut -d= -f2); do kill $pid; done
echo done
