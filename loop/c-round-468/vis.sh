#!/usr/bin/env bash
C=/home/runner/czaba-project/tmp/studio-real-loop/c-round-468
mkdir -p $C/shots
cd $C/head && PORT=3471 npx remix-serve build/server/index.js > $C/serve-v-head.log 2>&1 &
cd $C/fix && PORT=3472 npx remix-serve build/server/index.js > $C/serve-v-fix.log 2>&1 &
sleep 7
cd $C && node visual.cjs 2>&1 | tee visual.log
for p in 3471 3472; do
  pid=$(ss -ltnp | grep ":$p " | grep -o "pid=[0-9]*" | cut -d= -f2)
  if [ -n "$pid" ]; then kill $pid; fi
done
