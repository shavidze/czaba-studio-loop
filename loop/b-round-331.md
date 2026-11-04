# B round 331 → 332 planning

**Decision: CONTINUE.** Round 332 is PERF-DRAG-PREVIEW stage c2b-i, specified in `current-task.md` (D-29z972…D-29z983, backlog v291).
- **Baseline:** `c1d3fbf`, the published gate-331 commit, with a clean tree.
- **Archive:** the round-331 task is saved as `tasks/round-331.md`, a byte-equal copy of the old `current-task.md`. No archive existed before this planning.

## 1. Round 331 result (from C's evidence)
- **C round 331:** PASS, `browserVerified`/`realVerified` true, 14/14 rows, no blocked row (`c-round-331.json`).
- **Gate 331:** published `c1d3fbf` on both remotes (`gates/gate-round-331.json`).
  - Review: COMMIT OK, no Critical issue.
  - Verify: 243 files and 3570 tests (`gates/round-331/review.md`, `verify.log`).
- **Stage c2a → done** (D-29z972). Fade went from 21.633 to 13.767 components per move (max 14), so the item's fade target of ≤ 15 (D-29z935) is met. Move went from 30.367 to 29.4.
- **Closed:** SIG-R326-DETAIL-IGNORES-FADE, SIG-R326-READOUT-PRIMITIVE, GATE330-S1, GATE330-S2.
- **Rulings:**
  - **A-R331-REVIEW-STALE-CLIP** is re-rated from a latent Medium to an info design signal, merged into SIG-R331-DETAIL-PICK with an L46 deadline (D-29z973). Three independent traces found no failure path, so it does not hold the Medium bug gate.
  - **C-R331-01** → `deferred_low_polish` (D-29z974).
  - **Gate Lows S1–S4** (D-29z975):
    - S1 is kept as written, and the reason is added to the doc;
    - S2 and S3 are fixed in round 332;
    - S4 is kept.
  - **NOTE-C331-OFFSET-ONLY-GUARD** is closed as accepted (D-29z978).
  - **Architecture notes** from the gate and from A → signals ARCH-R331-PREVIEW-READERS and ARCH-R331-PREVIEW-ISEQUAL (D-29z979).
  - **C's GROUP-SHOWN observation** → SIG-C331-FADE-COLLAPSES-GROUP (D-29z980).
- **Root files:** `root-pre-push-review.md` and `publication-checkpoint.json` hold only old checkpoints, with no new open finding ids for this stream.

## 2. Why stage c2b-i, and not REGRESSION
`regression-last` is 2026-11-02 and today is 2026-11-04 (2 days), so REGRESSION is not due yet. Round 333 will be planned on or after 2026-11-05, so it is the REGRESSION round (D-29z982). Its scope additions now include one c2b-i row and the C-R331-01 record. No Critical, High or Medium finding is open in this stream.

## 3. Consults (read-only)
- **`performance-optimizer`:**
  - **Overview:** it draws only the clip id, trackId, start and duration, plus the track order and kind.
  - **Meter:** memo is safe.
  - **Peak path:** it reads id, sourceOffset, duration and gainDb.
  - **Detail text:** it is a layout effect that copies props into editable state, with no DOM read.
  - **Recommendation:** split c2b into c2b-i and c2b-ii.
  - **Rejected:** its named-function-expression idea for the meter (D-29z977, measured).
- **`tech-lead`:**
  - **Advice:**
    - one record per reader;
    - keep the hook in `StudioWorkspace.tsx`;
    - split c2b;
    - c2b-ii must use the sentinel pattern keyed on raw numbers;
    - the meter memo needs a row that turns red without it (DP29, DP30 and DP31 do);
    - the PeakPath comparator is low value (D-29z983 confirmed it by measurement).
  - **Not followed:** holding the overview until D-29z915. B keeps D-29z966 (D-29z976).
- **Not consulted:** `product-designer` and `ableton-arrangement-expert`. This is a perf round with no visible change, so reference-first, the screen budget and the YouTube request do not apply.

## 4. B's sketch and what it caught (all under `b-round-331/`)
- **Final sketch (v2):**
  - **Patch:** `sketch/sketch.patch.txt`, 6 files; `git apply --check` is clean on `store/`.
  - **Tests:** the 30 covering files pass 438/438 (`covering-unit.log`). Typecheck rc 0. Biome is clean.
  - **Mutants:** 6/6 red, and the files are restored (`mutants-summary.txt`).
  - **Perf** (production build, spec alone; `perf-rowcmp-vs-c331.txt`): 83 rows EQUAL to C round 331 and 38 DIFF, every one of them lower:
    - fade 13.767 → 10.817 per move, max 14 → 11;
    - trim 24.583 → 23.6, max 23 → 22;
    - move 29.4 → 28.2, max 107 → 103;
    - click, play and zoom each −4;
    - 36/36 asserted rows pass, and each 1× value equals its 6× value.
  - **Names** (`names-sketch.json`, `names-compare.txt`): fade [11×4], trim [22, 2 …], move [21, 2, 21, 2, 103, 2, 21, 2], click [100, 2, 0]. Names are only lost, never gained.
- **Four planning errors caught before dispatch (L58 and L23 worked):**
  1. **Meter memo vs the name-keyed probe.** The memo broke `track-meter-ui.test.tsx` l.590–602. The named function expression B tried next is renamed `ArrangementTrackMeter2` by esbuild (`meter-name-probe.txt`). The task therefore uses `ArrangementTrackMeterInner` with a 4-string grant.
  2. **The comparator inflated trim (D-29z983).** The v1 sketch carried an `ArrangementPeakPath` comparator. A custom memo comparator turns the simple memo into a wrapper fiber plus the inner fiber, and both probes count both. Trim rose 24.583 → 25.567 (`perf-rowcmp-vs-c331-v1-comparator.txt`, `names-sketch-v1-comparator.json`). B dropped it, after an advisor call. Successor: PERF-CAND-PEAK-PRIMITIVE-PROPS, decided at c2b-ii. The v1 artifacts are kept: `sketch/sketch-v1-comparator.patch.txt`, `mutants-summary-v1-comparator.txt`, `perf-sketch-results-v1-comparator/`, `perf-sketch-v1-comparator.log`.
  3. **DP33's v1 fixture could not fail.** It was periodic, so its column maxima were all equal and could not show a `sourceOffset` shift; MU-PEAK-IGNORES-ZOOM survived. The fixture was fixed to a monotonic ramp in v1 and now moves with the candidate.
  4. **DP32's `duration` control was vacuous,** because the clip is clamped to its source length. It was dropped.
- **Environment-invalid attempt (kept):** the first v1 names warm-up crashed on a cold compile (`names-sketch-v1-warmup-envinvalid.log`). The v2 run had a clean warm-up first (`names-warmup.json`).
- **Claims:** `claims-332.sh` → `claims-332-planning-output.txt` (HEAD) and `claims-332-sketch-output.txt` (sketch). The scratch's K13 is 10 only because of B's private `cacheDir` in `vite.config.ts`.
- **Lessons:** unchanged. Two candidates for RETRO 336, each seen once:
  - a name-keyed render probe needs the runtime function name;
  - a custom `memo` comparator is itself a counted fiber, so measure the gesture where it cannot skip before adopting one.

## 5. Architecture checkpoint (accumulated risk on one owner)
Signal 3 has recurred on `StudioWorkspace.tsx` l.637–864 in rounds 328, 329, 330 and 331, and round 332 is the fifth consecutive edit of that region.
- **Request:** B asks root to run the bounded frontend-architect checkpoint D-29z915 after round 332 publishes and before stage c3 (`b-round-331-checkpoint-addendum.md`).
- **Non-blocking:** REGRESSION and c2b-ii do not wait for it.

## 6. Order after round 332
1. Round 333: REGRESSION.
2. Stage c2b-ii: the detail Start/End text in render, plus the PERF-CAND-PEAK-PRIMITIVE-PROPS decision.
3. c3 (cross-lane ghosts; after the checkpoint, if it is answered by then), c4 (group move), c5 (video).
4. The record → assert conversions, including PERF-CAND-FADE-BUDGET.
5. PERF-9…15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → the phase-2 entries (skip rule).

The next RETRO is at round 336 or at the end of STUDIO-PERFORMANCE, whichever comes first.

## 7. Commit readiness
Nothing new is ready. Round 331 is already published (`c1d3fbf`). Round 332 is ready only after C PASS and the root gate.

## 8. Advisor
The configured advisor was available and was used three times:
1. **Before the approach.** It led to:
   - the ruling on the stale-clip Medium;
   - reading the overview, the peak path and the detail effect before sketching;
   - the c2b-i / c2b-ii split;
   - the checkpoint nudge.
2. **At the comparator fork.** It led to dropping the comparator rather than footnoting a reversed DIFF, keeping the v1 artifacts, and the consistency sweep.
3. **The final review,** before declaring the round done.
4. **Attempt 2 (resume, verification only).** Attempt 1 stopped after writing every artifact but before returning its summary. Attempt 2 changed no planning content. It checked that the archive is byte-equal, that `sketch.patch.txt` still applies cleanly on `c1d3fbf`, that HEAD's tree is clean, that the claims run to K22, that every promised C row is present in `current-task.md`, and that the §0–3 + §7 heading layout matches `tasks/round-331.md`. The advisor was consulted once more for this check.

## 9. Housekeeping
- **Scratch:** `/home/runner/b331-scratch`, with the v2 sketch applied. Vite cache: `/tmp/b331-vite-cache`. Neither touches `store/`. `/home/runner/a331-scratch` was left alone.
- **Dev server:** `:5198` was used for the names probes and is stopped.
- **Store:** unchanged; `git status` shows 0 entries.
- **Backups:** `b-round-331/backlog-before.json`, `b-next-before.json`, `feature-status-before.md`. The update scripts are `update-backlog.py` and `update-feature-status.py`.
