# B round 372 → 373 planning

## 1. Round 372 result (D-29z1231)
- **C round 372 PASS** (`c-round-372.json`):
  - 10 rows passed: SOURCE-SCOPE, CLAIMS, SKETCH-EQUAL, ASSERT-COUNT, MIGRATION-COMPLETE, UNIT (62 files / 1,153 tests), MUTANTS-TREE, G372-AUTH, STUDIO-SMOKE-372 and DOCS.
  - `browserVerified` and `realVerified` are true, with 0 bugs. The gate rows were left to the gate.
- **Gate 372 published `4900b83`** on both remotes (`gates/gate-round-372.json`, status `published`). This is the new baseline. **PERF-11c-ii-a is done.**
- `tasks/round-372.md` is a copy of the dispatched `current-task.md` (sha256 `a92dc9f8…`, identical). Nothing was deleted.

## 2. Findings recorded (D-29z1232)
- **A-R372-REVIEW-ALIAS-BETWEEN-IMPORTS** (= gate 372 finding 3) → `deferred_low_polish`.
- **A-R372-REVIEW-HANDWRITTEN-STATUS-TYPE** → closed by design (round 373 removes the fields).
- **A-R372-REVIEW-SEQ-KEY-MUTANT-GAP** → covered in round 373 by MU-ADOPT-KEY-SEQUENCE (3 red on the sketch).
- **GATE372-L1-DOUBLE-USEARRANGEMENT** → resolved by the round-373 sketch (the helper reads the store).
- **GATE372-L2-SPREAD-ORDER** → info, kept.
- **Architecture signal GATE372-ARCH-STATUS-HELPER-SEAM:** keep. Its risk conditions (RS4, PV1–PV4, parent totals) are round-373 rows.
- No C bug, and no open Critical or High finding. The 5 open Mediums are root-only, manual or awaiting_user (`context/active-summary.md`); under the 2026-10-23 clarification they do not block.

## 3. Round 373 = PERF-11c-ii-b, the status store (D-29z1233, D-29z1234)
- **No root answer** to ARCH-CHECKPOINT-PERF11C-STATUS-STORE: there is no answer file in the loop folder. Option A applies, and B ruled the reducer and ordering questions:
  - the gesture flag is an argument, read at call time;
  - `lastNonRefusalStatusRef` stays a provider ref, written in `setStatus`;
  - the stop-effect string compare stays.
- **Sketch** (`b-round-372/sketch.patch.txt`, sha `dddd2145…49b1`, 7 code files):
  - `commitStatus` does adopt + reduce + clear in one `set`;
  - the provider's `useReducer` and its two layout effects are gone;
  - a new `getStatus()` getter;
  - `ArrangementStatusText` subscribes itself;
  - the helper subscribes to `state.committed`.
- **Pre-check:**
  - tsc and Biome rc 0. The full suite passes 252 files / 3,703 tests.
  - The first sketch version had 6 red: 5 positive controls that used a status write as their trigger (now `resetExportState()`, with new not-rendered asserts) and LT12, a call-time updater (fixed by the `playFrom` reorder).
  - **Perf on a production build of the sketch:** 95 PASS, 0 FAIL. Play start/stop components 11/11, fade release-commits 2, the others 1.
  - **The SIG-R360 win, measured:** with the round-359 MU-B mutant re-applied, start-components is **12** (round 359 HEAD: 99).
  - **Mutants:** 6/6 red (2, 3, 1, 16, 1 and 11 tests).
- **Review** (`b-round-372/sketch-review.md`, tech-lead; reviewed sha = dispatched sha):
  - The High was a hash manifest written while a mutant was applied. It was regenerated and verified against a fresh patch apply.
  - Medium TL-R372-M1 is ruled an accepted delta: a same-batch refusal restore matches S5b's contract and has no production path. Its rows are inputs to PERF-11c-iii.
  - The 25-cell ordering matrix has 12 covered cells and 13 ruled cells.
- **Harness lesson (B's own error, kept as a process note):** a copy made with `git archive` + `git add -A` drops `public/middle-east.mp3` (tracked, but it matches `.gitignore`). Two MU-B runs were invalid for that reason. The task tells C to copy with `cp -a`. If it recurs, it is a candidate for `lessons.md` at RETRO 384; it is not added now, because the file is at 60 lines.

## 4. Regression, RETRO and the checkpoint
- `regression-last.json` = 2026-11-05. REGRESSION is due at the first planning on or after 2026-11-08.
- RETRO is due at about round 384, or at the end of STUDIO-PERFORMANCE.
- The feature-boundary checkpoint ARCH-CHECKPOINT-PERF11C-STATUS-STORE stays filed (non-blocking). New signal: SIG-R373-STATUS-STORE-NAME (a rename candidate; not scheduled).

## 5. Decision
**CONTINUE.** Much scoped work remains:
- PERF-11c-ii-b/iii and PERF-12…15;
- STEM-LANES, SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS and T12-ADVANCED;
- the phase-2 entries and the deferred Lows.

Nothing external blocks round 373. PERF-11b stays awaiting_user (non-blocking).

## 6. Ready for commit
Round 372 is published. Round 373 is ready for A. After C PASS it is one gate-ready unit: 7 code files and 2 docs.

## Advisor
The configured advisor was used: once before the sketch and once before hand-off.
