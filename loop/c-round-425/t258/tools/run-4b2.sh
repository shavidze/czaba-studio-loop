L=/home/runner/czaba-project/tmp/studio-real-loop; C=$L/c-round-425/t258; cd $L; B=http://127.0.0.1:5173
log() { echo "$(date -u +%H:%M:%S) $*" >> $C/logs/run-4b2.progress; }
timeout 1200 node c-round-218/c218-mp3.cjs $B real 1440 900 $C/mp3 > $C/logs/mp3-real.log 2>&1; log mp3 $?
timeout 900 node c-round-220/facade.cjs 1440 900 $C/facade > $C/logs/facade.log 2>&1; log facade $?
for w in 1440 1280; do (cd $C/t207/tools && timeout 900 node c207.cjs $w > $C/logs/c207-$w.log 2>&1); log c207 $w $?; done
(cd $C/t210/tools && timeout 1200 node c210export.cjs $B r301-1440 1440 900 > $C/logs/c210-1440.log 2>&1); log c210 1440 $?
timeout 900 node $C/tools/c252-s9.cjs $B $C/r252b '^(followPause)$' 1280 > $C/logs/r252b.log 2>&1; log r252b $?
log DONE
