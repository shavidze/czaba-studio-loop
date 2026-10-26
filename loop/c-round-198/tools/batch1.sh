cd /home/runner/czaba-project/tmp/studio-real-loop/c-round-198/tools
timeout 900 node focus198.cjs 5184 1280 rich > ../logs/focus-ref-1280-rich.log 2>&1
for W in 1440 1280; do for S in rich default; do
 [ "$W$S" = "1280rich" ] || timeout 900 node focus198.cjs 5173 $W $S > ../logs/focus-tree-$W-$S.log 2>&1
 [ "$W$S" = "1280rich" ] || timeout 900 node focus198.cjs 5184 $W $S > ../logs/focus-ref-$W-$S.log 2>&1
done; done
echo DONE > ../logs/batch1.done
