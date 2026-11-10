cd /home/runner/czaba-project/tmp/studio-real-loop
timeout 1500 node c-round-425/t258/tools/c249-s9.cjs http://127.0.0.1:5173 c-round-425/t258/r249 '^(restart|shift|clickPlaying|home)$' > c-round-425/t258/logs/r249.log 2>&1
timeout 1500 node c-round-425/t258/tools/c250-s9.cjs http://127.0.0.1:5173 c-round-425/t258/r250 '^(paste|splitPlaying|splitStopped|addStopped|markerM|pastEnd)$' > c-round-425/t258/logs/r250.log 2>&1
timeout 1500 node c-round-425/t258/tools/c251-s9.cjs http://127.0.0.1:5173 c-round-425/t258/r251 '^(caption|captionPlaying|addEnter)$' > c-round-425/t258/logs/r251.log 2>&1
timeout 1500 node c-round-425/t258/tools/c252-s9.cjs http://127.0.0.1:5173 c-round-425/t258/r252 '^(followPause|followResume|navOrigin|titles)$' > c-round-425/t258/logs/r252.log 2>&1
timeout 1500 node c-round-425/t258/tools/c253-s9.cjs http://127.0.0.1:5173 c-round-425/t258/r253 '^(followStop|stopPlain|unrelated|titles|navOrigin|stopScroll)$' > c-round-425/t258/logs/r253.log 2>&1
echo DONE > c-round-425/t258/logs/marker.done
