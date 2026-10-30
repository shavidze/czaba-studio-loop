# B: round 267 → 268 planning (2026-10-30, D-29z571…D-29z575)

**Decision: CONTINUE.** Round 268 = **GATE264-S2 fix-up for C-R267-01** (Medium). Task: `current-task.md`.

## 1. Inputs read
- `context/active-summary.md` (head) and specific ids grepped in `backlog.json` and `feature-status.md`; `lessons.md` in full.
- `tasks/round-266.md` → the round-267 `current-task.md` (archived now as `tasks/round-267.md`, `cmp` identical), `a-round-267.md`, `c-round-267.md`, `c-round-267.json`.
- `gates/gate-round-267.json`: **skipped** ("C taskStatus FAIL"). Nothing was published, so the baseline stays HEAD `7ba7cd2` plus the round-267 tree diff on the 3 grant paths.
- `regression-last.json`: the next REGRESSION is due on or after 2026-11-02. Not due.
- Saba's answers of 2026-10-30 (policy section "Saba's answers, 2026-10-30"; `user-review/questions-11c.md` is marked answered).
- `context/active-*` are built by root (`loop-v2/build-context.mjs`); B did not edit them.
- **Advisor:** available and consulted twice: before the ruling and at the done-check. The done-check led B to run the AG7/AG8 recipe in jsdom on the scratch (`b-round-267/recipe-ag7-ag8-*.txt`: green on the sketch, red on the tree exactly at the AltGraph-only rows), add claims K7 and K13, and merge the duplicate mutant into M-GESTURE. Its advice was followed: option (a), a gesture row in the pre-check, the non-clean baseline, and the L42 recording of Saba's answers. One placement differs from its suggestion; see §4.

## 2. Round 267 result (D-29z571)
- **C: FAIL**, with `browserVerified` true and `realVerified` true. Every listed row passed at both viewports, and the 14 mutants were all red. The round failed only on **C-R267-01** (Medium): during a pointer gesture, Ctrl+AltGraph without altKey plus Arrow moves the insert marker (7.500 → 101.352). C measured it against a HEAD control.
- A handed the round over as a **STOP** (A-R267-REVIEW-GESTURE-ARROW). That was the correct move under L11. A's Lows from its code review were fixed in the round.
- The spec conflict was B's: §2.1.2 against §2.1.3. It is recorded as B-R267-GESTURE-ARROW-SPEC-CONFLICT (Low, closed as planning) with an L4 evidence clause. It is the second instance of RETRO-275 candidate RC-R265-AT-RISK-NO-ROW.

## 3. Ruling (L10, D-29z572)
- **Fix (a):** the Ctrl arm of the Ctrl+Arrow branch also requires `!event.getModifierState('AltGraph')` (or the equivalent `commandChord`).
- **The rule:** a chord with Alt or AltGraph is never a command chord. It is not run, not gesture-blocked and not prevented.
- **Accepted change from HEAD:** during a gesture, Ctrl+Alt, Meta+Alt or Ctrl+Alt+AltGraph plus Arrow is now silent. At HEAD it showed the blocked message, which would claim that an edit was refused.
- **Option (b) is rejected.** It would leave the no-gesture Ctrl+AltGraph+Arrow step open.
- **Medium kept.** The bug is reachable only in the contract state, as in AG6.
- **Pre-check:** 54 files, 1065/1065 tests; tsc rc 0. The browser sketch matches the ruled table at both viewports with 0 page errors (`b-round-267/probe-arrow-sketch.json`). The current tree reproduces the bug as the control (`probe-arrow-tree.json`). The macOS Alt+Arrow recipe was run on the tree (`probe-mac-alt-tree.json`).

## 4. Saba's answers and the order (D-29z573, D-29z574)
- **Recorded in `backlog.json` and `feature-status.md` (L42):**
  - **SABA-B-7 is agreed:** option A taper, dB readout as a listed deviation, and saved projects change shape between points. This D-ID records that last consequence.
  - **SABA-B-11c stage 2 is unblocked:** option (a), relative snap. R49-T and F1-ABSOLUTE-SNAP close when it passes C.
  - SABA-Q-11C-MARQUEE, SABA-Q-11C-MULTILANE, SABA-Q-11C-SPLIT-SPAN and SABA-Q-ENVELOPE-TAPER are answered.
  - Five later candidates are recorded and not queued.
- **Deviation from Saba's literal order.** He said "SABA-B-7 next, before GATE264-S2", but GATE264-S2 had already been dispatched before his answer. Its diff, with an open Medium, sits uncommitted in the tree, so nothing can publish until it is fixed. The fix is one condition. Therefore:
  - 268: the fix-up;
  - 269: SABA-B-7;
  - 270: GATE266-S1, a Medium regression in published stage-1 code, which goes before new scope. The advisor suggested placing it after stage 2. B keeps the bugs-first order because stage 2 builds on the same range and clip code.
  - 271: SABA-B-11c stage 2;
  - then SYS-6.
- REGRESSION goes first whenever it is due (from 2026-11-02).

## 5. Signals (D-29z575)
- **A-R267-ARCH-CHORD-CLASSIFIER** (pure chord classifier with mount-free tests) is appended as evidence to ARCH-CHECKPOINT-STUDIOWORKSPACE-FOCUS-STATUS, question 10. It is non-blocking and not scheduled.
- `handleKeyDown` has now had the same owner for 4 consecutive rounds (265–268). The bounded frontend-architect checkpoint request stands with root, and independent work does not wait for it.

## 6. Not COMPLETE, not BLOCKED
- **Not COMPLETE:**
  - C-R267-01, GATE264-S2 and GATE266-S1 are open Mediums.
  - Not yet done: SABA-B-7, SABA-B-11c stage 2, SYS-5/6, STUDIO-PERFORMANCE, SYS-1..3, STORE-REDESIGN 2b–5, REVIEW-RECOMMENDATIONS, T12-ADVANCED and the phase-2 entries.
  - 443 deferred Lows remain.
- **Not BLOCKED:** no credentials or approval are missing.
- **Ready for commit:** nothing new this round. Root publishes after C PASS on round 268 and the gate.
