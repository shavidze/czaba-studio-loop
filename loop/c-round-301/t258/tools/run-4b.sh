L=/home/runner/czaba-project/tmp/studio-real-loop; C=$L/c-round-301/t258; cd $L
log() { echo "$(date -u +%H:%M:%S) $*" >> $C/logs/run-4b.progress; }
B=http://127.0.0.1:5173
log start
curl -s -o /dev/null $B/studio-lab
(cd $C/tools && timeout 900 node c257.cjs '^(layout|a11y|keys)$' > $C/logs/c257.log 2>&1); log c257 $?
(cd $C/tools && timeout 900 node c256-nohead.cjs '^(stop|sheet)$' > $C/logs/c256.log 2>&1); log c256 $?
(cd $C/tools && timeout 900 node c254-nohead.cjs $B $C/r254 > $C/logs/c254.log 2>&1); log c254 $?
(cd $C/tools && timeout 900 node c255-nohead.cjs $B $C/r255 > $C/logs/c255.log 2>&1); log c255 $?
bash $C/tools/run-marker.sh; log marker
(cd $C/tools && timeout 900 node homedrag.cjs $C/out/homedrag > $C/logs/homedrag.log 2>&1); log homedrag $?
(cd $C/tools && timeout 900 node rrsheet.cjs $C/out/rrsheet > $C/logs/rrsheet.log 2>&1); log rrsheet $?
(cd $C/tools && timeout 900 node titles2.cjs > $C/logs/titles2.log 2>&1); log titles2 $?
(cd $C/tools && timeout 900 node rroverview.cjs $C/out/rroverview > $C/logs/rroverview.log 2>&1); log rroverview $?
(cd $C/tools && timeout 1500 node grid258.cjs $C/out/grid258 > $C/logs/grid258.log 2>&1); log grid258 $?
(cd $C/tools && timeout 900 node hs2.cjs > $C/logs/hs2.log 2>&1); log hs2 $?
(timeout 1500 node c-round-241/c241.cjs $C/r241 '^(menuGroups|menuCheck|menuChoose|key4|s4ax)$' > $C/logs/c241.log 2>&1); log c241 $?
for m in delay fail idle refusal placement; do timeout 600 node c-round-238/race238.cjs $B $C/out/race238-$m.json $m > $C/logs/race238-$m.log 2>&1; log race $m $?; done
bash $C/tools/run-focus.sh; log focus
(cd $C/tools && timeout 900 node bracearrow.cjs > $C/logs/bracearrow.log 2>&1); log bracearrow $?
for w in 1440 1280; do (cd $C/t207/tools && timeout 900 node c207.cjs $w > $C/logs/c207-$w.log 2>&1); log c207 $w $?; done
for vp in "1440 900" "1280 720"; do set -- $vp; (cd $C/t210/tools && timeout 1200 node c210export.cjs $B r301 $1 $2 > $C/logs/c210-$1.log 2>&1); log c210 $1 $?; (cd $C/t211/tools && timeout 1200 node c211export.cjs $B r301-$1 $1 $2 > $C/logs/c211-$1.log 2>&1); log c211 $1 $?; done
timeout 1200 node c-round-218/c218-mp3.cjs $B real 1440 900 $C/mp3 > $C/logs/mp3-real.log 2>&1; log mp3 $?
timeout 900 node c-round-220/facade.cjs 1440 900 $C/facade > $C/logs/facade.log 2>&1; log facade $?
timeout 1200 node c-round-222/c222-legacy.cjs main 1440 900 $C/legacy > $C/logs/legacy-main.log 2>&1; log legacy-main $?
timeout 1200 node c-round-222/c222-legacy.cjs persist 1280 720 $C/legacy > $C/logs/legacy-persist.log 2>&1; log legacy-persist $?
log DONE
