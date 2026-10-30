C=/home/runner/czaba-project/tmp/studio-real-loop/c-round-258
for W in 1440 1280; do
 (cd $C/s186/tools && timeout 900 node c186-store.cjs $W > ../logs/s186-$W.log 2>&1)
 (cd $C/s187/tools && timeout 900 node c187-main.cjs $W > ../logs/s187-$W.log 2>&1)
 (cd $C/s188/tools && timeout 900 node c188-main.cjs $W > ../logs/s188-$W.log 2>&1)
 (cd $C/s190/tools && for s in dur skip cls; do timeout 900 node $s.cjs $W > ../logs/$s-$W.log 2>&1; done)
 (cd $C/s195/tools && timeout 900 node rs2a.cjs $W > ../logs/rs2a-$W.log 2>&1)
done
(cd $C/s190/tools && timeout 900 node session.cjs > ../logs/session.log 2>&1)
echo DONE > $C/logs/store.done
