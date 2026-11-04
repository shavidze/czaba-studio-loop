# C's own mutant W (written BEFORE running)
Mutation: dragWindow `commits: ...filter(inWhole).slice(1)` (drops the first whole-window commit).
Prediction: rows derived from `DragWindow.commits` change: whole-window `move-components-per-move` (and any whole-window commit-count/component row) for range/fade/trim/move stopped+playing and the 30-clip fade; plus lane whole-window `move-components-per-move`. Rows that must NOT change: zoom, keys, release-window rows, liveness rows, `commits-per-move` if it uses its own formula in measureDrag (K4 says it stays).
