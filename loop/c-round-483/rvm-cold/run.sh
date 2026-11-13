#!/bin/bash
C=/home/runner/czaba-project/tmp/studio-real-loop/c-round-483; R=$C/rvm-cold
until grep -q FINAL-DONE $C/b423b.status 2>/dev/null; do sleep 5; done
for i in 1 2 3 4 5; do
  S=/tmp/rvm-cold-$i; PORT=520$i; rm -rf $S; mkdir -p $S; (cd /home/runner/czaba-project/store && git archive HEAD | tar -x -C $S); ln -s /home/runner/czaba-project/store/node_modules $S/node_modules
  sed -i "s#export default defineConfig({#export default defineConfig({\n  cacheDir: '$S/.vite-cache',#" $S/vite.config.ts
  (cd $S && nohup npx remix vite:dev --host 127.0.0.1 --port $PORT > $R/vite-$i.log 2>&1 & echo $! > $R/pid-$i)
  for k in $(seq 1 90); do curl -s -o /dev/null http://127.0.0.1:$PORT/ && break; sleep 1; done
  timeout 200 node $R/probe.cjs http://127.0.0.1:$PORT > $R/load-$i.json 2> $R/load-$i.err
  sleep 2; grep -E "optimiz|reload|new dependencies|\?v=" $R/vite-$i.log | head -n 8 > $R/vite-deps-$i.txt
  pkill -f "vite:dev --host 127.0.0.1 --port $PORT" ; sleep 2; ls $S/.vite-cache/deps 2>/dev/null | head -n 3 > $R/cache-$i.txt
  echo "start $i done $(date -u +%T)" >> $R/status.txt
done
echo RVM-COLD-DONE >> $R/status.txt
