# B round 323 → 324 planning report

**Date:** 2026-11-03. **Decision:** CONTINUE. **Advisor:** available and used (before writing, and before finishing).

## What I read
- `current-task.md` (round 323), archived unchanged as `tasks/round-323.md`. It equals `b-round-323/before-current-task.md` [K34].
- `a-round-323.md`, `c-round-323.md`, `c-round-323.json`, `gates/gate-round-323.json` (status `skipped`, "C taskStatus FAIL"). The gate is not published, so the baseline stays `53c5c79`.
- I looked up only the specific IDs in `backlog.json`, `feature-status.md`, `lessons.md` and `tasks/round-322.md`.
- `regression-last.json`: 2026-11-02, round 301; the next one is due on or after 2026-11-05.
- Before-copies: `b-round-323/before-{current-task.md,backlog.json,feature-status.md,lessons.md,b-next.json}`.

## Round 323 result (from C's evidence only)
- **A STOPped** at a consistent tree. The round-323 detail-wrapper `memo` works, and because of that the R11-P1e positive control of `render-budget.test.tsx` became false. That line was outside the round-323 grant.
- **C FAIL, with no app bug:**
  - SOURCE-SCOPE and G323-AUTH PASS.
  - Every browser row C could run (DUP-NAMES, SELECT-NAMES clause, S2-VIDEO, S-CLICK across 2 lanes, S-EDIT, S-DETAIL, S-TRANSPORT, S-RANGE, S-GROUP) equals HEAD at both viewports.
  - The project WAV export is byte-identical.
  - `browserVerified`/`realVerified` are false because PERF-SELECT and PERF-LOAD could not run on the incomplete tree.
- **Backlog changes:**
  - Nothing is marked done.
  - New findings: C-R323-01 (Medium, origin B) and C-R323-02 (Low, origin B/A).
  - C-R322-01 and C-R322-02 stay open. Their closing conditions (UNIT PASS, SELECT-NAMES PASS) were not met. The R9-L2 edit is green in C's own run.
  - INFO-C322-SHIFT is resolved. The C-R322-SHIFT-ADD candidate is dropped.
  - Two new records: INFO-C323-S-GROUP-PREMISE and the candidate CAND-R323-FOLD-CLEARS-SELECTION.

## Rulings (D-29z903…D-29z910)
- **C-R323-01 → A's option (a), exactly.**
  - `render-budget.test.tsx` has exactly 92 `expect(`.
  - The expect rule is reworded so it can be checked: a subject or matcher flip that pins the new contract, with a positive control kept in the same `it`, is not a 10a removal. This answers A's question.
- **The seven consumer-count positive controls [K43 = 7] are pre-ruled.**
  - If an in-grant change (for example a code-reviewer fix) flips one, A moves the control and adds a `toBe(0)` row on the old subject. The mutant must be red. There is no STOP.
  - Any other test change still STOPs.
  - This ends the STOP class that came from B's spec gaps three times in a row (rounds 322 and 323).
- **C-R323-02 is fixed now.**
  - New test file `selection-wrappers-render.test.tsx` with SS8a (pins the memo) and SS8b (the subscription stays live).
  - The mutant MU-GROUP-HEADER-NO-MEMO must turn SS8a red.
  - If a group cannot be built in jsdom within the grants, the Low goes to `deferred_low_polish`, with no STOP.
- **S-GROUP redefined** on a recipe I checked in the browser on A's tree (`b-round-323/fold-select-probe*.{mjs,json,png}`):
  - after a fold, 0 of the 2 overview blocks are selected;
  - after Ctrl+A in the folded group, 2 of 2 are selected and the group stays folded.
  - C compares HEAD with A at both viewports.
- **Signal SIG-R323-R9L2-CONTROL-SOURCE** (fact + inference): the R9-L2 consumer loop counts the renders of both `selectClip` and `setStatus` [K39]. `ArrangementDetailPanel.tsx` calls no `useArrangement()` [K40]. The signal goes to PERF-9/PERF-10 and is not scheduled.
- **L58** gets one sentence: re-check the consumer-count controls against every memo or subscription the task adds. The file is still 59 lines.

## Scope kept
Nothing was thinned. Round 324 still carries:
- SS1–SS7 and SS8a/b;
- six mutants;
- the §2.5 harness rows;
- A-PERF with the HEAD control;
- docs 168, 230 and 231, with l.4 `Completed (C round 324 PASS)`;
- the code-reviewer;
- all of C's browser rows, re-run on A's final tree.

## Claims
- Script: `b-round-323/claims-324.sh`. Planning output: `b-round-323/claims-324-planning-output.txt`.
- K1–K27 equal `a-round-323/claims-after-stop.txt` (`b-round-323/a-stop-k1-k27.txt`).
- K28, K29, K32, K36 and K37 equal `c-round-323/claims-c.txt`.
- New claims K38–K44.

## Architecture
- ARCH-CHECKPOINT-PERF8-STORE-PATTERN stays open and non-blocking. It becomes answerable at the PERF-8 boundary, after round 324 PASS.
- I sent no new request. The three STOPs were B-origin spec gaps, not a structural risk on the owner.
- A-R322-ARCH-SELECTION-WRAPPERS stays a PERF-10 signal.

## Next
- **Round 324:** PERF-8b resumed again (`current-task.md`).
- **Round 325:** most likely REGRESSION, because its planning falls on or after 2026-11-05. It carries the C-R318-06 repro and the fold-clears-selection question, with a Live 12 source. Otherwise round 325 is PERF-DRAG-PREVIEW.
- **Queue after that:** unchanged.

## Ready to commit
Nothing new. PERF-8b is not complete, and gate 323 was skipped.
