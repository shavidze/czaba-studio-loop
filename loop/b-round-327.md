# B round 327 → 328 planning (2026-11-04)

**Decision: CONTINUE.** Round 328 is a fix-up of PERF-DRAG-PREVIEW stage b, applied on A's uncommitted round-327 tree. The task is in `current-task.md` (D-29z937…D-29z944, backlog v287).

## 1. Inputs read
- `c-round-327.md` and `c-round-327.json`: **FAIL** on C-R327-01 (Medium), plus C-R327-02 (Low). `browserVerified`/`realVerified` are true, and 13 rows passed.
- `a-round-327.md`: STOP on A-R327-REVIEW-SAME-TEXT-REMOUNT, with the Architecture note.
- `gates/gate-round-327.json`: **skipped** ("C taskStatus FAIL"). It is not published, so the baseline HEAD stays `234ccdd` (gate 326's commit).
- `env-status.json`: store 200.
- `regression-last.json`: 2026-11-02, so a REGRESSION round is not due today (2026-11-04).
- `lessons.md`, `tasks/round-327.md` (the archived copy of the previous `current-task.md`; byte-equal, K15), and `backlog.json` (by id only).

## 2. Backlog changes (only from evidence)
- **PERF-DRAG-PREVIEW** stays `in_progress`.
  - Stage b is **not** done: C failed it, and the gate skipped it.
  - Stage b's measured perf win (fade 103.25 → 21.633 per move) is real C evidence on A's tree. It will be re-measured after the fix.
- **New open findings:**
  - C-R327-01 (Medium): fix it now, as the bug gate requires.
  - C-R327-02 (Low): fixed in the same round, because the round already owns the code and the fix is cheap.
  - A-R327-REVIEW-SAME-TEXT-REMOUNT: merged into C-R327-02.
  - A-R327-REVIEW-SETTLE-ORDER (Low): moved to `deferred_low_polish`.
  - SIG-R327-NOBPM-RULER-CLICK and SIG-R327-HARNESS-PER-COMMIT: recorded as signals.
- **Architecture signal** A-R327-ARCH-STATUS-ONE-SOURCE is written into `b-round-327-checkpoint-addendum.md`, under the open frontend-architect checkpoint D-29z915. It does not block anything.
- **Nothing is marked done this round.**

## 3. Ruling on A's STOP (D-29z938)
C-R327-01 and C-R327-02 share one root, and that root is B's round-327 spec (§1.2.3).
- `flushStatusPreview` cleared the store synchronously, which triggered a uSES sync render while the `adoptPreview` dispatch was still pending. That produced the stale frame.
- A's option (b) alone fixes only 02.

The contract has three guards:
1. **The flush never writes the store.** It adopts each preview sequence only once.
2. **A provider layout effect clears an adopted preview after the commit.**
3. **`previewStatus` skips a same-text write** when the store is empty. This mirrors HEAD's same-text rule while a gesture is active.

The footer does not change.

## 4. B's evidence (`b-round-327/`)
- **Sketch:** `sketch/sketch.patch.txt`, 2 files, applied to the scratch copy `/home/runner/b327-scratch`.
- **C's settle probe, run on three trees at both viewports:**
  - sketch: equals HEAD (0 mutations, same node, both before and after the same-value move);
  - A's tree: reproduces both findings (the control).

  The first 1440 run on the sketch timed out on the cold compile. That run was environment-invalid, and the re-run passed.
- **New refusal-mid-drag probe:** sketch, HEAD and A's tree are identical.
- **Full vitest 3559/3559** and typecheck rc 0 on the sketch.
- **DP17–DP19** pass on a HEAD copy.
- **Mutants:**
  - MU-NO-SAME-TEXT-GUARD → red on DP17;
  - MU-READOPT → red on DP19;
  - MU-NO-LAYOUT-CLEAR → red on 8 rows;
  - **MU-SYNC-CLEAR (the bug itself) stays green in jsdom.** The bug's acceptance row is therefore the browser probe; this is stated in the task, not hidden.
- B ran no perf for the sketch. The per-move path is unchanged apart from one store read in `previewStatus`, so C's PERF row re-measures it. No new assert rows were added, so L58 is not triggered.

## 5. Consults and advisor
- **Advisor:** available and used before the ruling. I followed its direction: the deferred clear plus option (b), the probe-gated sketch, and the checkpoint addendum. I diverged in one place: I dropped the footer key check after the mutants showed that no row needs it.
- **No project subagent was consulted.** This is a perf fix-up that holds behaviour to HEAD. Its contract was decided by measurement on the sketch, and no reference or product question is open.

## 6. Candidate lesson (for the next RETRO; `lessons.md` not edited)
"A change that moves a status or announcement write between a store and a reducer gets a browser probe with an async writer in B's sketch before dispatch. jsdom does not reproduce the React lane split (C-R327-01: MU-SYNC-CLEAR stays green in jsdom)."

## 7. Next
- **After C PASS** on round 328, the gate publishes rounds 327 and 328 together.
- **Round 329 planning is expected on or after 2026-11-05,** so round 329 = **REGRESSION**. It carries C-R318-06, CAND-R323-FOLD-CLEARS-SELECTION and SIG-R327-NOBPM-RULER-CLICK.
- **Then:** PERF-DRAG-PREVIEW stage c → PERF-9…15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → the rest of the queue.
- **Commit readiness:** nothing is ready to publish until C passes round 328.
