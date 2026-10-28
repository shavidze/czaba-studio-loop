# C round 225: independent check (PERF-HARNESS-SHARED-LIB-b-i fix-up)

**Verdict: PASS.** Every C row in task §5 passed on valid measurements. `browserVerified` = `realVerified` = true. No new bug.
The isolated real-Chromium run was attempt 1 of the budget. No replacement was needed. Gate rows are not claimed: full suite, build, Biome/lint, verify and e2e smoke.
Policy order: C's perf run ran alone (L38), from 11:50:50Z to 11:57:09Z. Before the run: vitest, mutants and replays. During the run: only file reads, `git diff`, grep and small Python reads (no vitest, tsc, build or browser). The browser smoke ran only after it finished.

| Row | Result | Evidence |
|---|---|---|
| SCOPE-225 | **PASS.** HEAD is `bbaea50`. The frozen 1,072-file `sha256sum -c` gives rc 0 at start (11:49) and at end (11:58). `git status` shows exactly the 5 granted files as `M`, with no `??`. The 4 root files are OK and equal HEAD. There is no `root-grant-r225-vitest.json` and no include in HEAD, so §0.3 case 3 applies. The 5 changed files hash to A's `changed-end-sha256.txt` at C's start, and equal C's start hashes at C's end. `test-results/` is ignored by git (`.gitignore:20`). | `c-round-225/scope-start.txt`, `scope-end.txt`, `changed-start-sha256.txt` |
| BUDGETS-DIFF-225 | **PASS.** C's own script, HEAD vs tree: `budgets.json` and `budgets.resources.json` are byte-equal to HEAD. `budgets.interactions.json` has the same ids, order and keys. Exactly 16 `kind` changes from deterministic to wallclock, and they are exactly the 16 rows that fully match RECLASS. 0 other field changes. Applying the 16 flips to HEAD and dumping with `indent=2, ensure_ascii=False` + `\n` gives the tree file byte for byte. No other `commits-per-move` row is in the file. | `c-round-225/scripts/budgets_diff_225.py`, `budgets-diff.log` |
| CODE-225 | **PASS.** The `report.ts` diff is +3/−0: the §2.2 guard, byte-exact, directly after `if (values.length === 0) return null;` in `case 'tenths'`. The spread line and the "spread over 0.1" text are unchanged. `determinism.ts` equals HEAD. | `c-round-225/code-diff.txt` |
| UNIT-225 | **PASS.** 19/19 green under C's own §0.3 scratch config. All 3 new ids are present (DC-MIB-EDGE, DC-MIB-NONFINITE, DC-KINDS). DC-KINDS resolves paths from `import.meta.url` (no `cwd`). C ran its own mutants on whole-`perf/` scratch copies: 15 of 15 targeted mutants were killed (results below). | `c-round-225/unit.log`, `mutants.log`, `mutants/result.json` |
| REPLAY-225 | **PASS.** Final core + final budgets: (a) the 3 `c-round-224/reports/*` give 0 failures each, all complete. (b) `run1-contaminated/latest-interactions.json` gives 0 failures. (c) A NaN in `res.mem.backing-ready-mib` gives exactly `nondeterministic MiB res.mem.backing-ready-mib: [140.3, NaN, 140.3] (non-finite sample)`. Controls use the HEAD core + HEAD budgets from `git archive HEAD`. On (b) they still give the 1 failure `nondeterministic ratio interact.drag.fade.playing.commits-per-move: numerators [60, 59, 60], denominators [60, 60, 60]`. On (c) they give 0 failures, which reproduces the old fail-open. | `c-round-225/replay/*.json` |
| EQUIV-225 | **PASS.** Command: `CI=true npx playwright test --config playwright.perf.config.ts studio-lab-interactions studio-lab-resources`, run isolated. Result: rc 0, 2 passed, 6.3 min. PERF-1b-i `durationMs` 304848; PERF-1b-ii 59544; Chromium 143.0.7499.4. `equiv-check-b2.py` against `c-round-224/reports/*`: 1b-i rc 0 (144 rows, 106 deterministic compared, 16 reclassified, 0 problems); 1b-ii rc 0 (61, 37, 0, 0). Both reports have `complete` true and `failures` []. All 6 passes in each report have `abortedAt` null, `problems` [] and `pageErrors` 0. | `c-round-225/perf-run.log`, `latest-*.json`, `equiv-*.log` |
| DET-REMAINING-225 | **PASS.** 106 deterministic rows in 1b-i and 37 in 1b-ii. **None** has varying raw samples (`len(set(samples)) > 1`: 0 rows). Watch item R224-WINDOW-BOUNDARY-WATCH: every drag `release-commits` row is [1,1,1]. `move-components-per-move` is constant: range/trim 101.283, move 101.383, fade 96.367, at 1× and 6×. | `c-round-225/det-remaining.log` |
| LAB-SMOKE-225 | **PASS.** Fresh anonymous contexts at 1440×900 and 1280×720. `/studio-lab` returns 200, shows the demo badge and the workspace, and `auth_user` is null. Add gives 1 clip. Export WAV shows "WAV created: 01:41.352, 24-bit · 48 kHz · stereo." The file is RIFF/WAVE PCM (format 1), 24-bit, 48 kHz, stereo, 4,864,896 frames = 101.352 s (frame diff 0). Peak 1.0, RMS −15.29 dBFS, non-zero fraction 0.9977, 30 full-scale samples, 10 s segment RMS [0.0753 … 0.0001]. All of these are identical to round 224 at both viewports. 0 page errors in both smoke runs. The dialog closes with Done. | `c-round-225/g225.json`, `smoke-*.png` |
| G225-3 | **PASS.** `/studio/middle-east`, unstubbed, at both viewports: "Sign in required", 0 `audio[src]`, 0 `audio`, no workspace. `/api/studio-token` with no header returns 401 `{"error":"Please sign in to access Studio."}`. A fake Bearer returns 500 "Unable to prepare Studio access" with no token, the same as in round 224 (the backend is not available in the cloud). No token was issued. | `c-round-225/g225.json`, `g-*-guard.png` |
| AN-REVIEW-225 | **PASS.** Doc 176 l.4 is byte-exact: `**სტატუსი:** In Progress (stage 1 of 2; C round 225 PASS)`. All 19 DC ids it cites exist as `it('<id>:` in `report.test.ts`. MU-1…6 (`a-round-224/mutants/`) and MU-7…10 (`a-round-225/mutants/`) exist as logs. The cited numbers are traced: A's clean run gave fade.playing 1× [59,59,59]/[60,60,60] in `a-round-225/latest-interactions.json`; the 224 numbers come from `run1-contaminated`; the boundary examples are covered by DC-MIB-OK and DC-MIB-EDGE. Doc 168 has 2 hunks: l.96–98, inside §მეტრიკები (l.81–99), and l.251–252, inside §TODO (l.246+). Its l.4 is unchanged. | `git diff` |
| gate | Not claimed. | `gates/gate-round-225.json` (root) |

## C mutants (UNIT-225)
The baseline is unmutated: 19/19 green.

**Killed (15):**
- CM-1 exact uses tolerance: DC-INT, DC-ORDER.
- CM-2 ratio ignores denominators: DC-DENOM.
- **CM-3 `spread > 2`: DC-MIB-EDGE.** This mutant survived in round 224 and is now killed.
- CM-3b `spread > 0`: DC-MIB-OK.
- CM-8 wallclock rows checked too: DC-WALL.
- G-1 guard removed: DC-MIB-NONFINITE.
- G-2 guard checks only `values[0]`: DC-MIB-NONFINITE.
- G-3 guard checks only NaN, not Infinity: DC-MIB-NONFINITE.
- G-4 guard checks only the last value: DC-MIB-NONFINITE.
- G-5 guard text changed: DC-MIB-NONFINITE.
- G-6 guard returns null: DC-MIB-NONFINITE.
- K-1 `interact.drag.fade.playing.commits-per-move` flipped back to deterministic: DC-KINDS.
- K-1b `interact.drag.move.stopped.commits-per-move.6x` flipped back: DC-KINDS.
- K-2 `fader.track.stopped.commits-per-move` set to wallclock: DC-KINDS.

**Survived (informative, 1):** K-3 sets the unrelated row `interact.harness.hook-live` to wallclock. DC-KINDS does not claim this row, and `equiv-check-b2` catches it. It is outside the contract, so it is not a bug.

## Observations for B (info, no bug)
- **C-R225-OBS-01: supports D-29z259.** In C's clean, isolated run, `interact.drag.fade.playing.commits-per-move` at 1× gave `windowCommits` [60,60,60]. A's clean run gave [59,59,59]. The windowed count differs between clean runs, while the render work (`move-components-per-move` 96.367) is constant. The wallclock ruling holds. The watch rows were stable in this run.
- **C-R225-OBS-02:** see K-3 above. If B wants every other `kind` pinned, that is new scope.
- **C-R223-OBS-01 recurred.** The first 1440 dev load of `/studio-lab` logged `Cannot read properties of null (reading 'useState')` ×3 plus a hydration error. Two fresh 1440 contexts were clean (`recheck-1440.json`), and the smoke runs had 0 page errors. This belongs to the open root request `b-round-220-root-request-vite.md`, not to round 225.
- The export dialog shows "Overload: … 14 samples clipped". The demo mix is unchanged from round 224 (30 full-scale sample values), so this is pre-existing and out of scope.

## Ableton conformance
Not applicable (test-only round; there is no user-visible behaviour).

## For B (task §7)
- C PASS. Planning is on 2026-10-28, before 2026-10-30, so per §7 row 1: b-i is done, and C-R224-01, A-R224-REVIEW-TENTHS-NAN and C-R224-02 can close. Round 226 is CALM-1.
- PERF-REPORT-TEST-INCLUDE (Low) is still open: `report.test.ts` is not in the gate suite until root adds the include.
