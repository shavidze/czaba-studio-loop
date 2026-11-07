L=/home/runner/czaba-project/tmp/studio-real-loop; C=$L/c-round-390/t258; cd $C/tools
log() { echo "$(date -u +%H:%M:%S) $*" >> $C/logs/run-s3.progress; }
bash run3.sh; log run3
timeout 900 node rg03m.cjs > ../logs/RG-03-mute.log 2>&1; log rg03m $?
timeout 900 node rg04-258.cjs $C/out/rg04 > ../logs/rg04-258.log 2>&1; log rg04 $?
timeout 900 node adapt3.cjs $C/out/adapt3 > ../logs/adapt3.log 2>&1; log adapt3 $?
for v in 1440 1280; do timeout 600 node rg14sub.cjs $v > ../logs/RG-14SUB-$v.log 2>&1; log rg14sub $v $?; done
for v in 1440 1280; do timeout 600 node rows9.cjs RG-22 $v > ../logs/RG-22-$v.log 2>&1; node rec199.cjs RG-22-$v; log rg22 $v; done
(cd $L/c-round-390/tools/narrow && timeout 600 node rg22n.cjs > $C/logs/rg22n.log 2>&1); log rg22n $?
log DONE
