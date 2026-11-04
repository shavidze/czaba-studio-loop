# B round 325 → 326 planning report

**Date:** 2026-11-04. **Decision:** CONTINUE. **Advisor:** available and used twice. Before writing, it confirmed the plan and added: move the evidence out of /tmp, supersede D-29z914, rule on Low 4c, and refresh the K22 list. Before finishing, it found three wordings that could false-FAIL a correct fix: B-IM24 depended on the demo's markers, the CPU-load run had no ruling for timeouts or sibling drift, and the K11 list was not saved. All three were fixed; `b-round-325/app-perf-changed-files.txt` was added.

## 1. What I read
- **Round 325:** `current-task.md` (archived unchanged as `tasks/round-325.md`, K16 `archive-equal`), `a-round-325.md`, `c-round-325.md`, `c-round-325.json`, `gates/gate-round-325.json` (`failed`) and `gates/round-325/verify.log`.
- **Context:** `context/active-summary.md` (head), `lessons.md`, `regression-last.json`, `env-status.json`, `b-round-324.md`, `b-round-324/claims-325.sh`.
- **Lookups only:** specific ids in `backlog.json` and `feature-status.md` (B-R299-IM24-LOAD-SIGNAL, GATE148-S2-VDS3-WALLCLOCK, GATE77-S4-EN10-CLOCK, ROOT-R70-L4-BW5-WALLCLOCK, B-R184-FAKECLOCK-UNASSERTED, PERF-DRAG-PREVIEW, SYS-R2-FAKE-FIDELITY).
- **Store source (read-only):** `insert-marker-ui.test.tsx`, `helpers/workspace-test-environment.ts`, `ArrangementContext.tsx` (`livePosition`, `PLAYBACK_LOOKAHEAD`), and the app's `Date.now`/`performance.now` uses.
- **Before-copies:** `b-round-325/before-{current-task.md,backlog.json,feature-status.md,lessons.md,b-next.json}`.

## 2. Round 325 result
**C's evidence:**
- C PASS, with `browserVerified` and `realVerified` both true and 0 bugs.
- Trim: 106.2 → 24.583 components per move. The DRAG-NAMES row holds.
- All 9 browser behaviour rows show 0 differences from HEAD at both viewports.
- The 4 WAV exports are sha-identical.
- 7 + 2 mutants turned red.
- G325-AUTH PASS.

**Gate 325:**
- **Gate 325 failed.** verify exit 1. The full vitest was 3544/3545; the only failure was IM24 (`16.001`). Nothing was published.
- **Stage a is therefore `c_pass_unpublished`, not done** (D-29z920). `feature-status.md` shows it as მოწმდება with the gate note, never მზადაა.

## 3. IM24 diagnosis (B, on a scratch copy of the current tree)
- **Mechanism.** The fake `currentTime` follows `Date.now()` (K5), and the position holds 50 ms after a seek (K6). The 5th playing read comes after a no-op Ctrl+Right. Under load, more than 50 ms passed, so the read drifted.
  - Running IM24 alone passed 3/3 in this job.
- **Reproduced.** MU-DELAY-60 (a 60 ms `performance.now()` spin before the 5th read) makes the read `16.021`, and the test goes red.
  - My first attempts used a 3 ms delay and a `Date.now` spin. Both were invalid: the first was inside the 50 ms hold, and the second never ends under a frozen clock. Neither counts.
- **Fix.** One line freezes `Date.now` at IM24 start. With it, MU-DELAY-60 is green and the file passes 29/29 three times.
- **Claims on the sketch:** `b-round-325/claims-326-sketch-output.txt` differs from planning only in K2, K3 and the first K11 value. K12 is unchanged, as the task requires.
- **Evidence:** `b-round-325/sketch/` (`im24-fix.patch.txt`, `mu-delay-60.patch.txt`, 6 run logs and `summary.txt`).
- **Not attributed to round 325.** The same test failed under load at round 299, before round 325's code existed. Round 325's extra render cost may make the race slightly more likely. That is an inference, not measured.

## 4. Decisions D-29z920…D-29z927 (`backlog.json` v285)
- **D-29z920:** round 325 is closed from C's evidence; the gate failed and nothing was published.
- **D-29z921:** GATE325-IM24-WALLCLOCK is Medium and gate-blocking, and it is round 326. It supersedes B-R299-IM24-LOAD-SIGNAL.
- **D-29z922:** D-29z914 is superseded. REGRESSION is not due today (2026-11-04; regression-last is 2026-11-02), so it becomes the first round planned on or after 2026-11-05. The stage-a assert conversion moves to stage b's planning.
- **D-29z923:** A-R325-REVIEW-L4C (Low) → `deferred_low_polish`, to be re-examined in stage c (L10 ruling).
- **D-29z924:** SYS-CLOCK-DETERMINISM is recorded as a systemic task. It closes VDS3, EN10 and BW5 when it runs, and goes at the end of STUDIO-PERFORMANCE.
- **D-29z925:** the info rulings.
  - INFO-C325-MOVE-COMMITS: re-measured in stage c. Doc 168 states only measured numbers, so it does not change.
  - A-R325-REVIEW-RESTART-LOOP: recorded as a harness signal.
  - A-R325-ARCH-PREVIEW-OWNER: added to `architecture_signals` and to the open checkpoint request D-29z915. It is not a task.
  - The K22 list is refreshed to `b-round-325/pointer-move-test-files.txt` (51).
- **D-29z926:** the doc for the fix is one bullet in doc 232; l.4 is unchanged.
- **D-29z927:** *Why we missed it.* The round-299 watch condition ("a failure in a run alone") could never fire for a load-only flake. L48 gains a jsdom-clock clause. `lessons.md` stays at 59 lines.

## 5. Round 326 in short
- **What A changes:** one test line plus one doc bullet.
- **What C checks:**
  - CLAIMS, with K12 proving that round 325's tree is untouched;
  - the file 3 times, then 3 more times under CPU load;
  - MU-DELAY-60 red to green, plus one mutant of C's own;
  - DOCS;
  - the real IM24 behaviour in the browser (B-IM24, both viewports) and G326-AUTH.
- **Round 325's evidence carries** while K12 stays equal.
- **The gate** then re-runs verify on the combined tree and publishes rounds 325 + 326.

## 6. Scope kept
- **Nothing is shrunk or deferred without authority.** The full PERF-DRAG-PREVIEW target (fade, trim and move; ≤ 15 per move) stays, with stages b and c queued.
- **The other wall-clock rows** are queued as a systemic task, not dropped.
- **No Saba question arises.**
- **No frontend-architect checkpoint is newly requested:** D-29z915 is still open, and the new Architecture note was added to it.

## 7. Commit readiness
- Round 325's tree is C-verified. It is ready to publish together with round 326 once round 326 passes C and the gate's verify is green.
- No loop artifact needs a source change from root.
