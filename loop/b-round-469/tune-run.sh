#!/bin/bash
# B round 469->470 tuning: tune-run.sh <name> "<PS line38 classes>" "<PS line39 classes>" "<SS line75 classes>"
set -u
L=/home/runner/czaba-project/tmp/studio-real-loop; B=$L/b-round-469; T=$B/tune; N=$1
cd $T
sed -i "38s#className=\"[^\"]*\"#className=\"$2\"#" app/components/home/ProductSection.tsx
sed -i "39s#className=\"[^\"]*\"#className=\"$3\"#" app/components/home/ProductSection.tsx
sed -i "75s#className=\"[^\"]*\"#className=\"$4\"#" app/components/home/StudioShowcase.tsx
git -C /home/runner/czaba-project/store diff --no-index /home/runner/czaba-project/store/app/components/home/ProductSection.tsx $T/app/components/home/ProductSection.tsx > $B/cand-$N.diff.txt
git -C /home/runner/czaba-project/store diff --no-index /home/runner/czaba-project/store/app/components/home/StudioShowcase.tsx $T/app/components/home/StudioShowcase.tsx >> $B/cand-$N.diff.txt
npm run build > $B/cand-$N-build.log 2>&1 || { echo BUILD FAIL; exit 1; }
for p in $(ss -ltnp | grep ":3473 " | grep -o "pid=[0-9]*" | cut -d= -f2); do kill $p; done; sleep 1; for i in 1 2 3 4 5; do ss -ltn | grep -q ":3473 " || break; sleep 1; done
(PORT=3473 nohup npx remix-serve build/server/index.js > $B/cand-$N-serve.log 2>&1 &); for i in $(seq 1 30); do curl -s http://127.0.0.1:3473/ | grep -q "$(ls build/client/assets | grep "^app-.*css$")" && break; sleep 1; done; curl -s http://127.0.0.1:3473/ | grep -q "$(ls build/client/assets | grep "^app-.*css$")" || { echo SERVER STALE; exit 1; }
mkdir -p $B/look-$N
node $L/b-round-468/look-probe2.cjs $B/look-$N.json $B/look-$N head=http://127.0.0.1:3471 $N=http://127.0.0.1:3473 hidden=http://127.0.0.1:3471,hide > $B/look-$N.log 2>&1
node $L/b-round-468/look-profile.cjs $B/look-$N.json $B/look-$N-profile.txt $N > /dev/null 2>&1
node $B/patches2.cjs $B/look-$N $N $B/patches-$N.json > $B/patches-$N.txt 2>&1
grep -i ratio $B/look-$N-profile.txt | head -8
python3 -I -c "
import json;d=json.load(open('$B/patches-$N.json'))
for k,r in d.items():
  h=r['head']['pts'];t=r['$N']['pts'];x=r['hidden']['pts']
  dd=[t[i][2]-h[i][2] for i in range(len(h))]
  pk=max(range(len(h)),key=lambda i:h[i][2]-x[i][2])
  print(k,'max|dHT|',round(max(abs(v) for v in dd),2),'meanAbs',round(sum(abs(v) for v in dd)/len(dd),2),'peakPatch',h[pk][:2],'glowHead',round(h[pk][2]-x[pk][2],2),'glowCand',round(t[pk][2]-x[pk][2],2))
"
