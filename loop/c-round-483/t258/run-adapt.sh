cd /home/runner/czaba-project/tmp/studio-real-loop/c-round-483/t258/tools
for v in 1440 1280; do timeout 600 node rows1c.cjs RG-06 $v > ../logs/RG-06c-$v.log 2>&1; done
for v in 1440 1280; do STEM=demo-stem-pad timeout 600 node rows5.cjs RG-18 $v > ../logs/RG-18pad-$v.log 2>&1; done
for v in 1440 1280; do timeout 600 node rg04-258.cjs ../out/rg04-$v > ../logs/rg04-258-$v.log 2>&1; done
timeout 600 node rg03.cjs 1440 > ../logs/rg03-1440.log 2>&1
timeout 600 node rg03m.cjs > ../logs/rg03m.log 2>&1
for v in 1440 1280; do timeout 600 node rg14sub.cjs $v > ../logs/rg14sub-$v.log 2>&1; done
echo DONE > ../logs/adapt.done
