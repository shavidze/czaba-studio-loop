# B 361->362 checkpoint
- Sketch v1 (Transport leaf only) perf: b-round-361/perf-sketch.log rc 0, 95/95, play start/stop 28->11 x3 (1x, 6x), click 42->38, 44 DIFF rows all decreases (perf-sketch-rowcmp.txt).
- Sketch v2 adds B-R356 reader (ArrangementContext, MarkerRow, PS4) + render-budget grant; typecheck rc0, biome rc0, lint 205, covering 15 files: render-budget 3 rows needed grant (positive control name) -> granted, 10/10.
- MU-A (Transport body reads isPlaying again): jsdom red, 3 render-budget rows (mutants/MU-A-render-budget.log). Perf prediction (= C361 HEAD measurement): play start/stop 28.
- MU-B (leaf not memo) PREDICTION before run: jsdom green (confirmed); perf interact.click.components back to 42 (> 38, red with asserting budgets), play start/stop stay 11, group/lane move-components-max back to 83/82 (record). Only asserted failure expected: interact.click.components.
- Next: perf MU-B with asserting budgets, then perf final sketch v2 with asserting budgets.
- FINAL: perf-final.log rc 0, 95/95, failures [], play start/stop 11 x3 (1x,6x), click 38 x3 (1x,6x), 44 DIFF rows identical to v1, all decreases; durationMs 503995. MU-B measured 43 (predicted 42). MU-C PS4 red.
- covering final: 15 files 284 tests (verbose); slowest TC10 4487ms / 15000 (gate361 HEAD 4511).
