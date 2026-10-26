cd /home/runner/czaba-project/tmp/studio-real-loop/c-round-197/tools
for W in 1440 1280; do
timeout 900 node ringkey.cjs 5173 $W > ../logs/ringkey-tree-$W.log 2>&1
timeout 900 node ringkey.cjs 5184 $W noshots > ../logs/ringkey-ref-$W.log 2>&1
timeout 1200 node rich.cjs 5173 $W > ../logs/rich-tree-$W.log 2>&1
timeout 1200 node rich.cjs 5184 $W > ../logs/rich-ref-$W.log 2>&1
done
echo DONE > ../logs/batch1.done
