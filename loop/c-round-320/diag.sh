#!/bin/bash
O=/home/runner/czaba-project/tmp/studio-real-loop/c-round-320; S=$O/c320-diag.mjs; cd /home/runner/czaba-project/store
for t in h a; do if [ $t = h ]; then B=http://127.0.0.1:5197; else B=http://127.0.0.1:5173; fi
  timeout 300 node $S $B /tmp/c320-warm-$t.json range > $O/diag/warm-$t.log 2>&1; echo "warm $t rc=$?" >> $O/diag/status.txt
  for sc in click move zoom30 range; do timeout 300 node $S $B $O/diag/$t-$sc.json $sc > /dev/null 2> $O/diag/$t-$sc.err; echo "$t $sc rc=$?" >> $O/diag/status.txt; done
done
python3 -I $O/diag/namediff.py > $O/diag/namediff.txt 2>&1; echo DONE >> $O/diag/status.txt
