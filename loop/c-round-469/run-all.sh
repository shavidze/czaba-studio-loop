L=/home/runner/czaba-project/tmp/studio-real-loop; C=$L/c-round-469
cd $C/head && PORT=3471 npx remix-serve build/server/index.js > $C/serve-head.log 2>&1 &
cd $C/tree && PORT=3472 npx remix-serve build/server/index.js > $C/serve-tree.log 2>&1 &
sleep 8
for v in 1440x900 1280x720; do :; done
echo start > $C/run-rc.txt
node $L/b-round-467/probe/store-scroll-probe.cjs http://127.0.0.1:3471 $C/data/c1-head-frozen.json 1 > $C/data/c1.log 2>&1; echo c1 $? >> $C/run-rc.txt
node $L/b-round-467/probe/store-scroll-probe.cjs http://127.0.0.1:3472 $C/data/c2-tree-frozen-p1.json 1 > $C/data/c2-p1.log 2>&1; echo c2p1 $? >> $C/run-rc.txt
node $L/b-round-467/probe/store-scroll-probe.cjs http://127.0.0.1:3472 $C/data/c2-tree-frozen-p2.json 1 > $C/data/c2-p2.log 2>&1; echo c2p2 $? >> $C/run-rc.txt
node $L/b-round-467/probe/store-scroll-probe.cjs http://127.0.0.1:3472 $C/data/c2-tree-frozen-p3.json 1 > $C/data/c2-p3.log 2>&1; echo c2p3 $? >> $C/run-rc.txt
for i in 1 2 3; do PATHS=/,/gift-cards node $L/b-round-468/store-scroll-probe-full.cjs http://127.0.0.1:3472 $C/data/c3-tree-full-p$i.json 1 > $C/data/c3-p$i.log 2>&1; echo c3p$i $? >> $C/run-rc.txt; done
PATHS=/,/gift-cards node $L/b-round-468/store-scroll-probe-full.cjs http://127.0.0.1:3471 $C/data/c3-head-full.json 1 > $C/data/c3-head.log 2>&1; echo c3head $? >> $C/run-rc.txt
echo done >> $C/run-rc.txt
