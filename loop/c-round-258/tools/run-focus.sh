cd /home/runner/czaba-project/tmp/studio-real-loop
timeout 1800 node c-round-243/c243.cjs c-round-258/r243 '^(origins|braceLeft)$' > c-round-258/logs/r243.log 2>&1
timeout 1800 node c-round-244/c244.cjs c-round-258/r244 '^(editorOrigins)$' > c-round-258/logs/r244.log 2>&1
timeout 1500 node c-round-246/c246.cjs http://127.0.0.1:5173 c-round-258/r246 '^(addUndo|addUndoNeighbour|deleteRedoZ)$' > c-round-258/logs/r246.log 2>&1
timeout 1500 node c-round-247/c247.cjs http://127.0.0.1:5173 c-round-258/r247 '^(groupUndo|groupUndoTab)$' > c-round-258/logs/r247.log 2>&1
echo DONE > c-round-258/logs/focus.done
