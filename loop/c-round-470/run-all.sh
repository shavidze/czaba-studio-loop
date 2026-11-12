L=/home/runner/czaba-project/tmp/studio-real-loop; C=/home/runner/czaba-project/tmp/studio-real-loop/c-round-470
echo start > $C/run-rc.txt
node $L/b-round-467/probe/store-scroll-probe.cjs http://127.0.0.1:3471 $C/data/c1-head-1.json 1 > $C/data/c1-1.log 2>&1; echo c1-1 $? >> $C/run-rc.txt
for i in 1 2 3; do node $L/b-round-467/probe/store-scroll-probe.cjs http://127.0.0.1:3472 $C/data/c2-tree-p$i.json 1 > $C/data/c2-p$i.log 2>&1; echo c2p$i $? >> $C/run-rc.txt; done
for i in 1 2 3; do PATHS=/,/gift-cards node $L/b-round-468/store-scroll-probe-full.cjs http://127.0.0.1:3472 $C/data/c3-tree-p$i.json 1 > $C/data/c3-p$i.log 2>&1; echo c3p$i $? >> $C/run-rc.txt; done
node $L/b-round-467/probe/store-scroll-probe.cjs http://127.0.0.1:3475 $C/data/c4-mut.json 1 > $C/data/c4.log 2>&1; echo c4 $? >> $C/run-rc.txt
echo done >> $C/run-rc.txt
