L=/home/runner/czaba-project/tmp/studio-real-loop; C=$L/c-round-390/t258; cd $C/tools
timeout 900 node c257.cjs '^(layout|a11y|keys)$' > $C/logs/c257b.log 2>&1; echo c257 $? >> $C/logs/fix.progress
timeout 900 node $L/c-round-246/c246.cjs http://127.0.0.1:5173 $C/r246b '^(renameUndo|moveUndo|focusStability)$' > $C/logs/r246b2.log 2>&1; echo c246b $? >> $C/logs/fix.progress
bash run-store.sh > $C/logs/store.out 2>&1; echo store >> $C/logs/fix.progress
bash run-store2.sh > $C/logs/store2.out 2>&1; echo store2 >> $C/logs/fix.progress
echo DONE >> $C/logs/fix.progress
