L=/home/runner/czaba-project/tmp/studio-real-loop; C=$L/c-round-390/t258; cd $C/tools
log() { echo "$(date -u +%H:%M:%S) $*" >> $C/logs/run-s4.progress; }
bash run4.sh; log run4
timeout 900 node rvm258.cjs > ../logs/rvm258.log 2>&1; log rvm258 $?
timeout 900 node ov258.cjs > ../logs/ov258.log 2>&1; log ov258 $?
timeout 900 node iw.cjs > ../logs/iw.log 2>&1; log iw $?
timeout 900 node narrow.cjs > ../logs/narrow.log 2>&1; log narrow $?
timeout 900 node $L/c-round-246/c246.cjs http://127.0.0.1:5173 $C/r246b '^(renameUndo|moveUndo|focusStability)$' > ../logs/r246b.log 2>&1; log c246b $?
bash run-store.sh; log store
bash run-store2.sh; log store2
timeout 600 node mousering.cjs > ../logs/mousering.log 2>&1; log mousering $?
log DONE
