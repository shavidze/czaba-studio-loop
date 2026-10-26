cd /home/runner/czaba-project/tmp/studio-real-loop/c-round-196/tools
for W in 1440 1280 375; do for P in 5173 5174; do timeout 600 node store.cjs $P $W > ../logs/store-$P-$W.log 2>&1; done; done
echo DONE > ../logs/batch2.done
