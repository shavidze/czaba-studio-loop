#!/bin/bash
cd /home/runner/czaba-project/tmp/studio-real-loop/c-round-425/t389/out
T=../tools; B=http://127.0.0.1:5173
r() { name=$1; shift; echo "START $name $(date +%T)" >> ../logs/batch2.status; timeout 400 "$@" > ../logs/$name.log 2>&1; echo "END $name rc=$? $(date +%T)" >> ../logs/batch2.status; }
r export-wav node $T/export-wav.mjs
r export-wav1280 node $T/export-wav-1280.mjs
r export-det node $T/export-det.mjs
r flow1440 node $T/flow.cjs 1440 900
r flow1280 node $T/flow.cjs 1280 720
r video350 node $T/video-behaviour-probe.mjs $B video350.json
r visual node $T/visual.mjs $B after vis
r browser node $T/browser.mjs
r cache1440 node $T/cache.mjs $B 1440 900 /tmp/c425-prof-1440 cache-1440x900.json
r cache1280 node $T/cache.mjs $B 1280 720 /tmp/c425-prof-1280 cache-1280x720.json
echo ALLDONE >> ../logs/batch2.status
