cd /home/runner/czaba-project/tmp/studio-real-loop/c-round-196/tools
timeout 900 node ringkey.cjs 5174 1440 noshots > ../logs/ringkey-ref-1440.log 2>&1
timeout 1200 node rich.cjs 5174 1440 > ../logs/rich-ref-1440.log 2>&1
timeout 900 node ringkey.cjs 5173 1280 > ../logs/ringkey-tree-1280.log 2>&1
timeout 900 node ringkey.cjs 5174 1280 noshots > ../logs/ringkey-ref-1280.log 2>&1
timeout 1200 node rich.cjs 5173 1280 > ../logs/rich-tree-1280.log 2>&1
timeout 1200 node pointer.cjs 5173 1280 > ../logs/pointer-tree-1280.log 2>&1
timeout 1200 node pointer.cjs 5174 1440 > ../logs/pointer-ref-1440.log 2>&1
echo BATCH1DONE > ../logs/batch1.done
