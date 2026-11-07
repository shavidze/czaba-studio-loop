#!/bin/bash
T=/home/runner/czaba-project/tmp/studio-real-loop/c-round-390/tools
cd /home/runner/czaba-project/tmp/studio-real-loop
bash $T/run-batch1.sh; bash $T/run-batch2.sh; bash $T/run-batch3.sh; bash $T/run-batch4.sh
touch c-round-390/out/chain.done
