# B round 406 -> 407 checkpoint
1. DONE: tasks/round-406.md archived (cp -p, cmp equal); copy b-round-406/current-task-before-407.md.
2. Baseline for 407 = 8ac5bfb (gate 406 published both remotes).
3. NEXT: backlog update from C 406 PASS; d-ii scoping/sketch.
4. DONE: backlog v378 (D-29z1408/1409). NEXT: d-ii scoping (sameClipList, data-video attrs, positive controls), sketch in /tmp/b407-sketch
5. DONE: sketch /tmp/b407-sketch (VideoDock + drag-preview-render DP73-75), tools/make-sketch*.py reproduce it; covering 16 files 357/357 (pre-tests); mutants 7/7 RED. NEXT: covering re-run with new tests, full vitest, leaf probe + video sync probe (HEAD vs sketch), stopped-seek recipe, tech-lead review, task.
6. DONE: patch b-round-406/sketch-407.patch.txt sha 4ec62e31...; full vitest 262/3881 rc0; covering 16 files 360/360; tsc/biome rc0; mutants 7/7 red (unit); browser: leaf probe (caption 0 on all 13 steps, shell unchanged), stopped-seek probe HEAD/sketch err 0 both viewports, mutant NO-COMMIT-NOTIFY err 1.5 (red); playsync sketch 0.008/0.012. NEXT: tech-lead review on sha, then claims/grants/frozen, task, feature-status, b-round-406.md, b-next.json
7. DONE: current-task.md round 407 written. NEXT: backlog part 2, feature-status, b-round-406.md, b-next.json, kill :5174
8. DONE: backlog v379, feature-status, b-round-406.md, b-next.json; :5174 stopped; store clean.
9. DONE: advisor hand-off items applied (line labels, render-budget controls, root-patch note, advisor line). Phase complete.
