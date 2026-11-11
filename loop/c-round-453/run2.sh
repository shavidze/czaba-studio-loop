set -x
for p in "5178 head" "5173 tree"; do set -- $p; B=http://127.0.0.1:$1; T=$2
node added-probe.cjs $B added-$T.json shots-added-$T
node store-card-probe.cjs $B store-card-$T.json
node ../../../tmp/studio-real-loop/b-round-448/probe/warm.cjs $B /studio/middle-east >/dev/null 2>&1
for vp in "1440 900" "1280 720"; do set -- $vp; node legacy-playhead-probe.cjs $B legacy-$T-$1.json $1 $2 shots-legacy-$T; done
mkdir -p shots; node c12-run/c12-from-c448.cjs $B $T > c12-$T.json
done
echo ALLDONE
