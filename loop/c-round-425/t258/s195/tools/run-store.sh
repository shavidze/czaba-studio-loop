cd /home/runner/czaba-project/tmp/studio-real-loop/c-round-195/tools
for W in 1440 1280 375; do for T in tree ref; do timeout 900 node store194.cjs $T $W > ../logs/store-$T-$W.log 2>&1; done; timeout 600 node popup194.cjs $W > ../logs/popup-$W.log 2>&1; done
node analyze194.cjs > ../logs/analyze.log 2>&1; echo DONE >> ../logs/analyze.log
