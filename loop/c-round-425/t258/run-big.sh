L=/home/runner/czaba-project/tmp/studio-real-loop; C=$L/c-round-425/t258; cd $C/tools
for v in 1440 1280; do timeout 600 node rows9.cjs RG-22 $v > ../logs/RG-22-$v.log 2>&1; done
timeout 900 node adapt3.cjs $C/out/adapt3 > ../logs/adapt3.log 2>&1
bash run-s4.sh > ../logs/run-s4.out 2>&1
bash run-4b.sh > ../logs/run-4b.out 2>&1
echo DONE > ../logs/big.done
