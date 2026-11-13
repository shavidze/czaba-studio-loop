cd /home/runner/czaba-project/tmp/studio-real-loop/c-round-482
for pair in 426:held-enter-2a.mjs 427:held-enter-2bi.mjs 428:held-enter-2bii.mjs 429:held-enter-s5.mjs; do r=${pair%%:*}; f=${pair#*:}
  (cd p$r && OUT=/home/runner/czaba-project/tmp/studio-real-loop/c-round-482/p$r/sketch BASE=http://127.0.0.1:5173 node $f > /home/runner/czaba-project/tmp/studio-real-loop/c-round-482/held-$r.log 2>&1; echo "probe rc $?" >> /home/runner/czaba-project/tmp/studio-real-loop/c-round-482/held-$r.log)
  (cd /home/runner/czaba-project/tmp/studio-real-loop/c-round-482/.. && python3 -I c-round-482/p$r/compare.py c-round-482/p$r > /home/runner/czaba-project/tmp/studio-real-loop/c-round-482/held-$r.compare.txt 2>&1; echo "cmp rc $?" >> /home/runner/czaba-project/tmp/studio-real-loop/c-round-482/held-$r.compare.txt)
done
echo ALLDONE > /home/runner/czaba-project/tmp/studio-real-loop/c-round-482/held-done.txt
