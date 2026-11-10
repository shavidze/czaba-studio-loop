#!/bin/bash
L=/home/runner/czaba-project/tmp/studio-real-loop; C=$L/c-round-425; T=$C/tools; O=$C/out
until grep -q DEV-DONE $C/chain3.status 2>/dev/null; do sleep 5; done
cd $L
st(){ echo "$1 $(date -u +%H:%M:%S)" >> $C/chain4.status; }
SRC=/tmp/r425-src; rm -rf $SRC; mkdir -p $SRC
cd /home/runner/czaba-project/store && tar --exclude=./node_modules --exclude=./build --exclude=./.git -cf - . | tar -C $SRC -xf -
ln -s /home/runner/czaba-project/store/node_modules $SRC/node_modules
cd $SRC && timeout 900 npx remix vite:build > $O/prod-build.log 2>&1; echo "build rc=$?" >> $C/chain4.status
cd $SRC && (PORT=5189 nohup npx remix-serve ./build/server/index.js > $O/prod-serve.log 2>&1 & echo $! > $C/prod.pid)
for i in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5189/studio-lab | grep -q 200 && break; sleep 2; done; st prod-up
cd $L
PB=http://127.0.0.1:5189
sed "s#127.0.0.1:5173#127.0.0.1:5189#" $T/mepage.cjs > $T/mepage-prod-1440.cjs; sed "s#127.0.0.1:5173#127.0.0.1:5189#" $T/mepage-1280.cjs > $T/mepage-prod-1280.cjs
for v in 1440 1280; do timeout 300 node $T/mepage-prod-$v.cjs > $O/rvm-prod-$v.json 2>$O/rvm-prod-$v.err; st rvm-prod-$v; done
for vp in 1440x900 1280x720; do timeout 600 node $T/fontnet.cjs $PB /studio-lab,/,/store 3 $vp > $O/fonts/prod-fontnet-$vp.json 2>$O/fonts/prod-fontnet-$vp.err; st fontnet-prod-$vp; done
timeout 300 node $T/font-bytes.cjs $PB $O/fonts/prod-font-bytes.json > $O/fonts/prod-font-bytes.log 2>&1; st fontbytes-prod
(cd $C && timeout 300 node $T/preload-warn-prod.cjs > $O/fonts/prod-preload-warn.log 2>&1); st preload-prod
(cd $C/t389/out && timeout 600 node ../tools/heap.mjs $PB heap-1440.json > ../logs/heap.log 2>&1); st heap-prod
(cd $C/t389/out && timeout 600 node ../tools/export-trunc.mjs > ../logs/export-trunc.log 2>&1); st export-trunc-prod
kill $(cat $C/prod.pid) 2>/dev/null; pkill -f "remix-serve ./build/server" 2>/dev/null
st PROD-DONE
