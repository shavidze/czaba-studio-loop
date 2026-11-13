#!/bin/bash
L=/home/runner/czaba-project/tmp/studio-real-loop; C=$L/c-round-483
while [ ! -f $C/out/chain.done ]; do sleep 5; done
cd $L
for s in run-s3 run-s4 run-4b; do bash $C/t258/tools/$s.sh > $C/out/$s.out 2>&1; echo "$s done $(date -u +%H:%M)" >> $C/out/chain2.status; done
for b in 5 6 7; do bash $C/t301/run-batch$b.sh > $C/out/t301-b$b.out 2>&1; echo "t301-b$b done $(date -u +%H:%M)" >> $C/out/chain2.status; done
touch $C/out/chain2.done
