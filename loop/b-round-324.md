# B round 324 → 325 planning report

**Date:** 2026-11-04. **Decision:** CONTINUE. **Advisor:** available and used (before writing, and before finishing).

## 1. What I read
- **Round 324:** `current-task.md` (archived unchanged as `tasks/round-324.md`, K19 `archive-equal`), `a-round-324.md` (header), `c-round-324.md`, `c-round-324.json`, `gates/gate-round-324.json` (published, commit `b925434`) and `gates/round-324/review.md`.
- **Context:** `context/active-summary.md`, `lessons.md`, `b-round-323.md`, `regression-last.json`, `env-status.json`.
- **Lookups only:** specific ids in `backlog.json`, `feature-status.md` and `tasks/round-322.md`.
- **Before-copies:** `b-round-324/before-{current-task.md,backlog.json,feature-status.md,lessons.md,b-next.json}`. Checkpoint: `b-round-324/checkpoint.md`.

## 2. Round 324 result (C's evidence only)
- **C PASS**, `browserVerified` and `realVerified` both true.
  - PERF-SELECT: same-lane 107 → 25 components; reclick 92 → 0 (1 commit).
  - PERF-LOAD: 164 deterministic rows equal.
  - 52/52 S-* states equal to HEAD at both viewports; S-GROUP PNGs byte-identical; 4 WAV exports byte-identical.
  - 6 mutants red, plus C's own group-header mutant red; G324-AUTH PASS.
- **Gate 324 published `b925434`** on both remotes. This is the new baseline.
- **Backlog changes (D-29z911):**
  - PERF-8b and PERF-8 are done.
  - Closed exactly as `c-round-324.json` `closes` lists them: C-R322-01, C-R322-02, C-R323-01, C-R323-02, INFO-C323-S-GROUP-PREMISE.
- **C-R324-01 (Low, origin B spec) → ruled (a), D-29z912.** K19 = 4 is the correct output of the round-324 command, and the five ids are present.
  - *Why we missed it:* the K19 grep was written before the row ids were fixed, and it was never run on a sketch holding them.
  - L56 gains that clause (D-29z918). `lessons.md` stays at 59 lines.
- **Gate-324 review (D-29z913):**
  - S1, S2 (doc half), S4 and S6 are cheap doc Lows → round 325 §5.
  - S3 and S5 → PERF-10 signals.
  - The Architecture note joins A-R322-ARCH-SELECTION-WRAPPERS.
  - Recorded as GATE324-S1…S6.

## 3. Consults (PERF rule: `performance-optimizer` + `tech-lead` before each PERF dispatch)
- **tech-lead:**
  - **Contract A.** Keep `historyRef.current.present` tracking the preview (about 60 direct ref readers, loop-wrap resync, the video-import wait), and only move the React publication. Contract B (a separate store read through `getArrangement`) would make a loop wrap during a drag schedule the pre-drag audio.
  - **Conditions:**
    - `updateHistory` clears the store;
    - `previewActiveRef` is still set;
    - history converges at gesture count 0 (an unmount mid-drag releases without reverting).
  - **Subscriber set:** lane clips (shallow; `replaceClip` keeps untouched clips as the same objects), the selected-clip readout, the overview, `projectEnd` (timeline, extent, transport readout) and the detail panel (live at HEAD).
  - **Video clips:** the VideoDock effects read the React arrangement, so video stays on the old path.
  - **Function vs flag:** a separate function, not a flag (the prop is passed down to the envelope).
- **performance-optimizer:**
  - **Row ids:** confirmed. All are `record`. The harness drags only trimStart.
  - **Estimate:** ≤ 15 is reachable (about 9–15) only if `StudioWorkspace` does not render. Lanes are not memoised, so a `projectEnd` change re-renders everything. The harness move (one clip, dragged right) moves the end on every move.
  - **Assert/record split:** keep budgets `record`; assert `move-restarts == 0`.
- **How I used them:**
  - The task keeps the project end **live** (no visible change without Saba).
  - The end-extending move goes to stage c, together with lane memo or an extent store and the arch-checkpoint answer.
  - The pass criterion is the names row on `trim-moves` (HEAD-measured, non-vacuous).

## 4. Decisions D-29z911…D-29z919
They are in `backlog.json` (v284), and the task's header repeats them. In short:
- PERF-DRAG-PREVIEW is split into stages a, b and c. The full target is unchanged.
- The budgets ship as `record` this round (L58; precedent D-29z891/D-29z893), and become asserts at round 327 planning.
- Contract A applies.
- REGRESSION is not due today; it is due for round 326.
- The architecture checkpoint was requested.

## 5. Scope kept, nothing deferred without authority
- **The whole PERF-DRAG-PREVIEW target stays**: fade, trim and move, ≤ 15 per move. Stages b and c are queued with their reasons.
- **Marker, envelope and loop-brace previews** are outside the item's written scope. They are recorded as SIG-R324-OTHER-PREVIEW-CALLERS, not scheduled.
- **No feature is labelled deferred.** No Saba question arises: the behaviour is unchanged.

## 6. Architecture
- `b-round-324-checkpoint-request.md` went to root (D-29z915). The trigger is the PERF-8 feature boundary.
- It asks three bounded questions: store count and shape, the in-file selection wrappers, and async commit ordering.
- It is non-blocking. The deadline is before PERF-10 planning.

## 7. Claims
- Script: `b-round-324/claims-325.sh`.
- Planning output: `b-round-324/claims-325-planning-output.txt`, re-run after the last edit; it was identical.
- Kept artifacts:
  - `b-round-324/head-drag-names.txt`
  - `b-round-324/head-drag-perf-rows.txt`
  - `b-round-324/pointer-move-test-files.txt` (50 entries: 44 test files + 6 source files; the sweep was widened to `userEvent.pointer` and `'pointermove'` after the advisor review)

## 8. Next
- **Round 325:** PERF-DRAG-PREVIEW stage a.
- **Round 326:** REGRESSION (due on or after 2026-11-05). It carries C-R318-06 and CAND-R323-FOLD-CLEARS-SELECTION.
- **Then:** stages b and c, PERF-9 … PERF-15, SYS-R2-FAKE-FIDELITY, STEM-LANES, SYS-1…3, STORE-2b…5, and the rest of the queue (unchanged).
- **Next RETRO:** round 336.

## 9. Ready to commit
Round 324 is already published by root (`b925434`). Nothing new is ready; round 325 is not implemented yet.
