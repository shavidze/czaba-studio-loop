#!/bin/bash
L=/home/runner/czaba-project/tmp/studio-real-loop; C=$L/c-round-483; cd $L
st(){ echo "$1 $(date -u +%H:%M:%S)" >> $C/chain.status; }
bash $C/t389/batch1.sh; st t389-b1
bash $C/t389/batch2.sh; st t389-b2
for b in 1 2 3 4; do bash $C/tools/run-batch$b.sh; st batch$b; done
for s in run-s3 run-s4 run-4b; do bash $C/t258/tools/$s.sh > $C/out/$s.out 2>&1; st $s; done
for b in 5 6 7; do bash $C/t301/run-batch$b.sh > $C/out/t301-b$b.out 2>&1; st t301-b$b; done
st CHAIN-DONE
