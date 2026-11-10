#!/bin/bash
L=/home/runner/czaba-project/tmp/studio-real-loop; C=$L/c-round-425; T=$C/tools; B=http://127.0.0.1:5173
until grep -q PROD-DONE $C/chain4.status 2>/dev/null; do sleep 5; done
cd $L
st(){ echo "$1 $(date -u +%H:%M:%S)" >> $C/chain5.status; }
(cd $C/t301/r269 && timeout 900 node c269-export.mjs $B 1440 900 $C/t301/r269/exp > exp.log 2>&1; timeout 300 node analyze.mjs $C/t301/r269/exp 1440x900 > analyze.log 2>&1); st taper
(cd $C/t258/tools && timeout 900 node c250-series.cjs $B $C/t258/r250series > ../logs/c250-series.log 2>&1); st r250series
bash $C/t301x/run.sh; st t301x
(cd $C/wk && R2_OOB=throw ./run-wk.sh proxy-throw 311 /home/runner/czaba-project/store/workers/r2-proxy.js 5390 > run-proxy-throw.out 2>&1; R2_OOB=short ./run-wk.sh proxy-short 311 /home/runner/czaba-project/store/workers/r2-proxy.js 5391 > run-proxy-short.out 2>&1; R2_OOB=throw ./run-wk.sh headctl-throw 311 $C/wk/head-r2-proxy.mjs 5392 > run-headctl.out 2>&1); st wk
st CHAIN5-DONE
