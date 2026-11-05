C=/home/runner/czaba-project/tmp/studio-real-loop/c-round-342/t258
W=1280
(cd $C/s187/tools && timeout 900 node c187-main.cjs $W > ../logs/s187-$W.log 2>&1; echo s187 $?)
(cd $C/s188/tools && timeout 900 node c188-main.cjs $W > ../logs/s188-$W.log 2>&1; echo s188 $?)
(cd $C/s190/tools && for s in dur skip cls; do timeout 900 node $s.cjs $W > ../logs/$s-$W.log 2>&1; echo $s $?; done)
(cd $C/s190/tools && timeout 900 node session.cjs > ../logs/session.log 2>&1; echo session $?)
echo DONE > $C/logs-rs1.done
