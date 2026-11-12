# B round 457 → 458 planning (2026-11-12)

**Decision: CONTINUE.** Round 458 is the STORE-2b-3c-2a re-dispatch v3, the walker ruling on A-R457-REVIEW-M1. It is test-only.

## Inputs read
- context: `active-summary.md` and the sections of `active-backlog.json` I needed;
- round 457: `current-task.md` (now archived as `tasks/round-457.md`, `cmp` OK), `a-round-457.md` (STOP), `c-round-457.md` and `c-round-457.json`;
- `gates/gate-round-457.json`: `skipped` (C FAIL), so the baseline stays at gate 455's commit `db95f40`;
- `regression-last.json`: next due on or after 2026-11-13. Today is 11-12, so this is not a regression round;
- `lessons.md`, the B part.

## Round 457 outcome (from evidence only)
- **C FAIL** (STOPPED, routed to B, L22 short route). C4 was 4/27 green; C7 browser passed (`browserVerified` true); C5, C6, C8, C9 and C10 were not run.
- **Bug:** A-R457-REVIEW-M1, Medium, origin B spec. C reproduced it independently.
- **Nothing becomes done.** A-R456-REVIEW-M1 and A-R454-REVIEW-M-DEAD-UNCHECKED stay `in_progress`.

## What B did
1. **Measured Vite on a scratch** (`b-round-457/probe/vite-resolution.txt`):
   - relative `'./u/'` → the file;
   - alias `'~/…/u/'` → the index;
   - `'./u/index'` → the index.

   tsc, measured by A, gives the index for `'./u/'`. The two resolvers disagree, so the walker follows both files for a trailing slash.
2. **Built `sketch-458`** on `/tmp/b458`:
   - three-form resolution;
   - a string-aware comment arm;
   - a clause-grammar fallback on that arm only. On every arm it over-reached by 2 files, because of `// Barrel export …` comments (`probe/grammar-fallback-hits.txt`);
   - the LT7 lookahead fix;
   - LT9 rows and the new LT10.
3. **Pinned the sketch.** All runs are on the sketch:
   - reached set identical to round 456 (294);
   - A's probe: P1, P2, P4b and P5 fixed;
   - mutants: 42 lines (M33–M38 and the single-arm M21a/M22a are new; M21, M22, M28 and M30 are re-anchored; all red). M21a first survived, so B added one LT9 fixture (a regex literal with a backtick);
   - covering 4/28, full 284/4152 rc 0, lint 205, tsc and Biome rc 0;
   - `apply --check` OK on the store tree;
   - claims K1–K14 saved for the HEAD clone, the planning tree, the sketch and the expected after-A state.
4. **tech-lead:** APPROVE on sha `20a2cd7e`, then a re-review APPROVE on the dispatched sha `39839288`, which adds only the fixture (`b-round-457/sketch-review.md`). Its four Lows, TL-R458-L1..L4, have zero occurrences in `app/`.
5. **Stop-loss adopted, decided mechanically (advisor):**
   - round 458 STOPs only on a count above 0 in non-test `app/` or a named verdict flip; any other new walker form is a Low;
   - a third Medium-class form makes B plan a parser-based walker as a separate task at the next planning. It never stops round 458.
6. **Bounded `frontend-architect` checkpoint requested from root** (`b-round-457/checkpoint-request-addendum.md`). This is the third consecutive round on one owner. It is non-blocking.
7. **Backlog** version 449 → 450 (D-29z1622, D-29z1623; script `b-round-457/update-backlog-458.py`):
   - new open Medium A-R457-REVIEW-M1, with `confirmedBy` C 457;
   - `deferred_low_polish`: A-R457-REVIEW-L4/L5, TL-R458-L1..L4 and TL-R458-TRIPWIRE-GUARD;
   - retro candidate RETRO465-B-WALKER-STOP-LOSS.

   `feature-status.md` is updated.

## Why this is not BLOCKED or COMPLETE
- **Not COMPLETE:**
  - STORE-REDESIGN (2b-3c-2a … STORE-5), ARCH-SPLIT, REVIEW-RECOMMENDATIONS, T12-ADVANCED, STEM-LANES and the phase-2 entries remain;
  - open Medium findings exist;
  - `deferred_low_polish` must be cleared before final acceptance.
- **Not BLOCKED:** no external input is needed. Saba questions and Tech Lead manual checks run in parallel and do not stop the loop.

## Ready for commit?
No. Round 457 failed C; nothing new is publishable until round 458 passes C and the root gate.

## Next after round 458
REGRESSION-2026-11-13 (due when round 459 is planned on or after 11-13), then SABA-B-13 entrance, 2b-3c-2b, 2b-3d, 2b-4, STORE-2c…5, DP-GATE, ARCH-SPLIT, REVIEW-RECOMMENDATIONS, T12-ADVANCED, phase 2.
