C=/home/runner/czaba-project/tmp/studio-real-loop/c-round-258
cd $C/t203/tools; for W in 1440 1280; do timeout 900 node sweep.cjs 5173 $W > ../logs/sweep-$W.log 2>&1; timeout 900 node errborder.cjs 5173 $W > ../logs/eb-$W.log 2>&1; done
cd $C/t204/tools; timeout 900 node mobile.cjs 5173 tree > ../logs/mobile-tree.log 2>&1
for W in 1440 1280; do timeout 900 node hidden.cjs 5173 $W tree > ../logs/hidden-tree-$W.log 2>&1; timeout 900 node showcase.cjs 5173 $W tree > ../logs/sc-tree-$W.log 2>&1; timeout 900 node usermenu.cjs 5173 $W tree > ../logs/um-tree-$W.log 2>&1; done
cd $C/t205/tools; for W in 1440 1280; do timeout 900 node opentab.cjs 5173 $W tree > ../logs/ot-tree-$W.log 2>&1; for m in esc click enter; do timeout 900 node close.cjs 5173 $W $m tree > ../logs/close-$m-tree-$W.log 2>&1; done; timeout 900 node scrolllock.cjs 5173 $W tree > ../logs/sl-tree-$W.log 2>&1; done
echo DONE > $C/logs/store2.done
