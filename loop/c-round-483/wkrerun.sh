#!/bin/bash
C=/home/runner/czaba-project/tmp/studio-real-loop/c-round-483
until grep -q B423-DONE $C/b423.status 2>/dev/null; do sleep 5; done
cd $C/wk && export R2_STRICT=1 R2_SWAP=1
R2_OOB=throw ./run-wk.sh proxy-throw 311 /home/runner/czaba-project/store/workers/r2-proxy.js 5390 > run-proxy-throw.out 2>&1
R2_OOB=short ./run-wk.sh proxy-short 311 /home/runner/czaba-project/store/workers/r2-proxy.js 5391 > run-proxy-short.out 2>&1
R2_OOB=throw ./run-wk.sh headctl-throw 311 $C/wk/head-r2-proxy.mjs 5392 > run-headctl.out 2>&1
cd $C/t258/tools && timeout 1500 node c250-split.cjs http://127.0.0.1:5173 $C/t258/rsplit '^(splitPlayingMax|noSplitPlayingMax|splitPlaying)$' > $C/423out/c250-split.log 2>&1
echo WK-SPLIT-DONE >> $C/b423.status
