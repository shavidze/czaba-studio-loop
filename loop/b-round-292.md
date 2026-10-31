# B round 292 → 293 planning (2026-10-31)

**Decision: CONTINUE.** The next task is round 293, FIX-PD-1c2. It is the fix-up of C-R292-01 (Medium): narrowing the window must also stop the library preview. The baseline is HEAD `88b23dd` plus A's round-292 working tree (9 paths), which is kept.

## 1. Round 292 closure (D-29z727), from independent evidence only
- **C:** `c-round-292.json` reports `taskStatus` FAIL, with `browserVerified` and `realVerified` both true.
  - All 20 specified rows passed, including B-DESK-SAME at 0 px, UNIT-MUTANTS 9/9, the narrow load at 390/768/899, Send link, the audio-error state, the journey and the auth guard.
  - C's extra probe X-LIBRARY-PREVIEW failed: **C-R292-01, Medium, caused by round 292.** The library preview keeps sounding behind the narrow screen and nothing stops it.
- **Gate:** `gates/gate-round-292.json` is `skipped` ("C taskStatus FAIL"), so nothing was published and HEAD stays `88b23dd`.
- **Backlog:**
  - FIX-PD-1c stays **ბაგია**. It is not done, even though `browserVerified` is true, because the round failed.
  - Round 292 is now `c_fail`, and C-R292-01 is in `open_findings`, scheduled for round 293.
- `tasks/round-292.md` is a copy of the round-292 task (`cmp` identical, created with no-clobber). Nothing was deleted.

## 2. Rulings (D-29z728)
- **A's deviations, all accepted:**
  - D1: `<output>` as the status region;
  - D2: the snapshot mutant maps to NG9c;
  - D3: the K14 delta;
  - D4: NG9's jsdom `muted` tolerance (Chromium showed 0 warnings).
- **C's INFO items:**
  - The vacuous B-RESIZE-KEEP recipe was a B spec error. It is rewritten in round 293 as separate sound and state clauses.
  - Doc 218 l.4 is granted for rewriting to `C round 293 PASS`.
- **A's "known gap" note** was a Medium regression, so under L11 it was a STOP. No new A lesson is needed.
- **Reviewer Lows → `deferred_low_polish`:**
  - A-R292-REVIEW-L-NARROW-REMOUNT;
  - A-R292-REVIEW-L-TH4-TITLE;
  - A-R292-REVIEW-L-ERROR-NOT-ANNOUNCED.
- **Info:** A-R292-REVIEW-SAFARI-LEGACY-MQ.
- **Architecture signals** (recorded, not scheduled):
  - A-R292-ARCH-DEFER-SOURCE-LOAD, which extends the deferred B-R291-NARROW-PREFETCH;
  - A-R292-REVIEW-RENDER-REF (watch).

## 3. Why round 293 is this fix-up
- **Bug gate:** a Medium caused by the current round is fixed first.
- **Regression round:** `regression-last.json` is from 2026-10-30, round 258. A regression round is due on or after 2026-11-02, so not today. The file was not touched.
- **RETRO:** the next one is due at round 305.
- **No frontend-architect checkpoint.** This is a three-path fix-up of a new route-level owner. The reviewer's architecture verdict was "keep", and there is no repeated structural risk on one owner.

## 4. How the task was built
- **Source:** checked against the current tree, with the claims re-run after the last edit (`b-round-292/claims-293.sh`, output identical; K1–K16).
  - The cause is `StopPlaybackOnNarrow`, which calls only `togglePlayback`.
  - The never-wide branch is safe, because the provider's unmount cleanup already stops the preview (`ArrangementContext.tsx` l.3937).
  - The sound-source sweep (K9) found three sources under the provider: the graph, the preview and the video dock. Each one has its stop path named in the task.
- **Scratch pre-run** on a copy of the tree in `/tmp`, with the store left untouched (`b-round-292/sketch-*.diff`, `sketch-tests.log`):
  - NG5c is green with the fix (16/16 tests in the file).
  - With the new effect removed, NG5c is red.
  - The preview really starts before narrowing (`demo-soft-impact` is `ready`). This rules out the L52 vacuous-row trap, which Bass and Music would hit because their synth worker is mocked.
- **Frozen list:** `b-round-292-r293-tree-sha256.txt`, 1162 entries (the current tree, including the 4 untracked round-292 files).
- **Grants:** 3 paths. Root publishes rounds 292 and 293 together; the union is still the 9 paths.
- **Advisor:** available and consulted before writing. It added the vacuous-row check, a fresh frozen list, the split of the B-RESIZE-KEEP recipe, the mix row, and the "never-wide is already covered" note. Product consults were not needed: this is a bug-gate fix-up with no new user-visible design. Reference-first is not in scope.
- **Lesson (D-29z730):** L49 gains the clause "an unmount that keeps the provider → sweep and stop what the subtree ran". lessons.md stays at 59 lines.

## 5. Ready for commit?
No. Round 292 failed C. Root publishes rounds 292 and 293 together after the round-293 C PASS and the gate.

## 6. Order after 293 (D-29z731, unchanged from D-29z726)
REGRESSION if the round-294 planning falls on or after 2026-11-02. Otherwise:
1. SYS-VACUOUS-ROWS
2. STUDIO-LINK
3. NAME-AND-HINT
4. PERF-3c and the rest of STUDIO-PERFORMANCE
5. STEM-LANES
6. SYS-1…3
7. STORE-2b…5 (direction gate)
8. REVIEW-RECOMMENDATIONS
9. T12-ADVANCED
10. The phase-2 entries (skip rule)

SRW-21-PLAN stays a parallel planning task.

## 7. Why not COMPLETE or BLOCKED
- **Not COMPLETE:**
  - C-R292-01 (Medium) is open.
  - FIX-PD-1c is not done.
  - Most of the queued scope is not done: STUDIO-LINK, NAME-AND-HINT, STUDIO-PERFORMANCE, STEM-LANES, SYS-*, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED and phase 2.
  - The deferred Lows are still open.
- **Not BLOCKED:** nothing external is missing. The Saba questions are non-blocking.
