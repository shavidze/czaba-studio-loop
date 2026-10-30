cd /home/runner/czaba-project/tmp/studio-real-loop/c-round-258/tools
bash run.sh rg01.cjs RG-01 1440 1280
for r in RG-02 RG-04 RG-05 RG-06 RG-07 RG-08; do bash run.sh rows1.cjs $r 1440 1280; done
for r in RG-09 RG-10 RG-11A RG-11B RG-12; do bash run.sh rows2.cjs $r 1440 1280; done
bash run.sh rows3.cjs RG-13 1440 1280
for r in RG-14 RG-16 RG-24; do bash run.sh rows4.cjs $r 1440 1280; done
for r in RG-15 RG-18 RG-T3A; do bash run.sh rows5.cjs $r 1440 1280; done
for r in RG-19 RG-20; do bash run.sh rows6.cjs $r 1440 1280; done
for r in RG-17 RG-T3B; do bash run.sh rows7.cjs $r 1440 1280; done
for r in RG-T1 RG-T2 RG-T4A RG-T4B; do bash run.sh rows8.cjs $r 1440 1280; done
bash run.sh rg03.cjs RG-03 1440
for r in RG-23; do bash run.sh rows9.cjs $r 1440 1280; done
echo DONE > ../logs/s3.done
