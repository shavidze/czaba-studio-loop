P='current-task.md'
s=open(P).read()
R=[]
R.append(('''- **Ghost read** (in-page). Count `[data-testid="arrangement-lane-move-ghost"]` [K6] inside the lane element whose `data-track-id` equals `target.trackId` and whose `data-blocked` is `false`. Also count every lane-move ghost in the document.
- **Windows.**
  - The **whole** window is the same as in `measureDrag` [K4]: from the first in-page pointermove after the down to the up.
  - The **cross** window is the commits and pointermoves with `t1 < t < t2`.
  - The **lane** window is `t0 < t < t1` together with `t2 < t < up`.''',
'''- **Ghost read** (in-page).
  - **Settle first.** Before each read, settle with one double-`requestAnimationFrame` `page.evaluate`, or with a `locator.waitFor` on the ghost with a timeout of 2 s or less. This keeps a ghost commit that lands late at 6× from becoming a false problem.
  - Do **not** use `waitForQuiet` here. It can pull a Follow page turn into the whole window (L37).
  - Then count `[data-testid="arrangement-lane-move-ghost"]` [K6] inside the lane element whose `data-track-id` equals `target.trackId` and whose `data-blocked` is `false`. Also count every lane-move ghost in the document.
- **Windows.** `firstMove` is the first in-page pointermove after the down, as in `measureDrag`.
  - The **whole** window is the same as in `measureDrag` [K4]: `firstMove < t < up`.
  - The **cross** window is the commits and pointermoves with `t1 < t < t2`.
  - The **lane** window is `firstMove < t < t1` together with `t2 < t < up`. It starts at `firstMove`, not `t0`, so the pointerdown commit (select, active track, range clear) is excluded.
- **Metric names.** No new row may use the metric `commits-per-move`. DC-KINDS in `perf/lib/report.test.ts` requires every `commits-per-move` row to match `interact.drag.(range|fade|trim|move)…` [K18].'''))
R.append(('''- **Liveness: `interact.harness.drag-lane-live`.** Use `setLive`, which merges the two states. The value is 1 only when all four hold:
  - (a) at the cross read, the target-lane non-blocked ghost count is ≥ 1;
  - (b) at the back read, the document ghost count is 0;
  - (c) after the release, the clip's closest `[data-track-id]` equals `target.clipTrackId`, and its `data-clip-start` differs from `before.start`;
  - (d) the reset below restores it.

  When any of these fails, push a problem that names the failed letter and the values.''',
'''- **Liveness: `interact.harness.drag-lane-live`.** Use `setLive`, which merges the two states. Call it **after** the reset. (`measureDrag` calls `setLive` before `resetAfterDrag`; the lane drag does not.) The value is 1 only when all four hold:
  - (a) at the cross read, the target-lane non-blocked ghost count is ≥ 1;
  - (b) at the back read, the document ghost count is 0;
  - (c) after the release, the clip's closest `[data-track-id]` equals `target.clipTrackId`, and its `data-clip-start` differs from `before.start`;
  - (d) after the reset, a re-read gives a clip state equal to `before` (start, fade-in, width, no range) and a lane equal to `target.clipTrackId`. (d) is this re-read. It is not a check of the `problems` array.

  When any of these fails, push a problem that names the failed letter and the values.
  - Every pushed problem becomes a run failure: `buildPerfReport` copies each pass's `problems` into `failures` [K17].
  - So a correct run has `failures` [], and a mutant run has a non-empty `failures` that names the condition.'''))
R.append(('''| A-PREMISE | From A's results | <ul><li>At 1×, stopped and playing, `cross-components-per-move` > `lane-components-per-move`.</li><li>`interact.drag.lane.<state>.move-components-max` ≥ `interact.drag.move.<state>.move-components-max`.</li><li>Report all values.</li></ul> If either fails, write a STOP with the numbers. That means the harness is not seeing the cross-lane cost B measured in §0 |''',
'''| A-PREMISE | From A's results | <ul><li>**STOP row:** at 1×, stopped and playing, `cross-components-per-move` > `lane-components-per-move`. If this fails, write a STOP with the numbers: the harness is not seeing the cross-lane cost B measured in §0.</li><li>**Report only:** `interact.drag.lane.<state>.move-components-max` against `interact.drag.move.<state>.move-components-max`. B did not map the dev probe's 101-component enter commit, so this is not a STOP.</li><li>Report all values.</li></ul> |
| A-PERF-LIB | `npx vitest run --root /home/runner/czaba-project/store --config /home/runner/czaba-project/tmp/studio-real-loop/b-round-334/vitest.perf-lib.config.mjs perf/lib/report.test.ts`. This is the scratch config outside `store/` (GATE304-M1) | 34/34 pass, as at HEAD (`b-round-334/perf-lib-report-head.log`) [K19]. DC-KINDS must stay green with the 26 new rows |'''))
R.append(('''| A-REVIEW | — | Not required: fewer than 3 changed source files. A may ask the `code-reviewer` |''',
'''| A-REVIEW | The real `code-reviewer` subagent on the 4 changed files (the 3+ files rule) | <ul><li>Report its score and findings.</li><li>A Medium+ finding inside the grants is fixed and then re-reviewed.</li><li>Code changed after the review goes back to the reviewer (L11).</li></ul> |'''))
R.append(('''| HARNESS-READ | Read the new function against §1.1 | <ul><li>The gesture, all three windows and the four liveness conditions are present as specified.</li><li>The reset checks the lane.</li><li>The other drags' code paths are unchanged in the diff.</li></ul> |''',
'''| HARNESS-READ | Read the new function against §1.1 | <ul><li>The gesture, all three windows (lane from `firstMove`) and the four liveness conditions are present as specified.</li><li>The ghost reads settle with rAF or `waitFor`, not `waitForQuiet`.</li><li>`setLive` comes after the reset, and (d) is a re-read.</li><li>The reset checks the lane.</li><li>The other drags' code paths are unchanged in the diff.</li></ul> |
| PERF-LIB | The A-PERF-LIB command | 34/34 pass; DC-KINDS green |'''))
R.append(('''| PREMISE | From C's results | <ul><li>At 1× and 6×, stopped and playing: `cross-components-per-move` > `lane-components-per-move`.</li>''',
'''| PREMISE | From C's results | <ul><li>At 1× and 6×, stopped and playing: `cross-components-per-move` > `lane-components-per-move`.</li><li>`move-components-max`, lane against move: record only.</li>'''))
R.append(('''- **K16:** C round 334's perf result: 167 rows, `complete` True, 0 failures.''',
'''- **K16:** C round 334's perf result: 167 rows, `complete` True, 0 failures.
- **K17:** `perf/lib/report.ts` puts each pass's `problems` into `failures` (the `pass.problems.map(` line, 1).
- **K18:** `perf/lib/report.test.ts`:
  - the DC-KINDS regex line for `interact\\.drag\\.(range|fade|trim|move)\\.(stopped|playing)\\.commits-per-move`, 1;
  - its `toHaveLength(16)`, 1.
- **K19:** the perf/lib report test at HEAD through the scratch config: `Tests 34 passed (34)` in `b-round-334/perf-lib-report-head.log`.
- **Budget consumers (L23 sweep):** `budgets.interactions` is referenced only by the spec and `perf/lib/report.test.ts` in `app/`, `perf/` and `e2e/` (K18 covers the latter). `owner` is read in `perf/lib/budgets.ts`, which takes any non-empty string; no test enumerates owners.'''))
for a,bb in R:
  assert s.count(a)==1, a[:80]
  s=s.replace(a,bb,1)
s=s.replace("| A-CLAIMS | `bash b-round-334/claims-335.sh` before any edit |","| A-CLAIMS | `bash b-round-334/claims-335.sh` before any edit |",1)
open(P,'w').write(s); print('ok')
