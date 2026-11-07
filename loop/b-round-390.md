# B round 390 → 391 planning (2026-11-07)

**Decision:** CONTINUE. **Next:** round 391 = PERF-13b-ii. Backlog v357 → v358, D-29z1322 … D-29z1329.

## 1. Round 390 result (evidence read by B)
- **C.** `c-round-390.json` is PASS: 0 failed, 0 inconclusive, 0 blocked, 0 bugs, and `browserVerified` and `realVerified` are true. B read `c-round-390.json` directly, and `c-round-390.md` for the observations.
- **A.** `a-round-390.md`: the baseline `11ca746` was clean, and A made no change by design.
- **Gate.** `gates/gate-round-390.json` is `skipped` (no real changes). The baseline stays gate 388's commit `11ca746`. The store tree is clean.
- **REGRESSION-2026-11-08 is closed** (D-29z1322). Part 1 was round 389 and part 2 was round 390; both passed with 0 bugs.
  - `regression-last.json` is now `{"date":"2026-11-07","round":390}`. The next regression is due on or after 2026-11-10.
  - The old file is kept in `b-round-390/regression-last-before-391.json`.
- Nothing to close or defer from the round: C reported no bug, and A had nothing for the reviewer.

## 2. C's observations, ruled (D-29z1323)
| Observation | Ruling |
|---|---|
| INFO-C390-ESC-DRAG | Appended to ESCAPE-CANCEL-GESTURE as evidence. It still waits for a Live source and Saba, and is not scheduled |
| INFO-C390-HARNESS-DRIFT (4 probes) | Carried to the next regression as `carry_to_next_regression_d29z1323`: RG-06 uses Ctrl+drag, RG-18 uses STEM=demo-stem-pad, c250-s9 uses the series max, c218-mp3 waits for ready |
| INFO-C390-RV-M-HYDRATION-GLITCH | Not reproduced (4 fresh loads plus a second attempt were clean). Carried as a one-time re-check, with no finding |
| NO-SHIFT-203 (carried, not run) | Carried as a named row to the next regression |
| INFO-C390-VIDEO-SNAP, LOAF, C341-02 | Notes only. C-R341-02 is already an open Low |

## 3. Round 391 = PERF-13b-ii (the next item in the D-29z1298 order)
| Ruling | What |
|---|---|
| D-29z1324 | `pcm-live-mib-ready` becomes `assert ≤ 60` MiB, and `decode-mib-ready` becomes `assert ≤ 0` |
| D-29z1325 | The decode wait text: `Loading “X”…` → `“X” is ready.` |
| D-29z1326 | A clip whose source is in `error`: export refuses, and Play plays with a warning |
| D-29z1327 | A-R383-REVIEW-L1 is closed with no code |
| D-29z1329 | The purchased reload question goes to SRW-21-PLAN |

**D-29z1324: the memory flip, with B's L58 evidence.**
- **The sketch.** It is `b-round-390/sketch-391.patch.txt`, applied to a scratch copy of `11ca746` (`/tmp/r391-scratch`, now removed).
- **The run.** C's exact command gave 31.9 and 0, three samples each, both PASS (`perf-sketch-391.log`).
- **The mutant.** MU-391-NOTHING-EVICTABLE gave 124 and 92.2, and both rows FAIL (`mutants/`).
- **What stays `record`:** the count and after-add rows.

**D-29z1325: the decode wait text.**
- **The texts.** While a source decodes, the status reads `Loading “X”…`. When it settles, the status becomes `“X” is ready.` or the existing failed text.
- **The swap.** It happens only if the line still shows that loading text. It runs at the Play and preview call sites, and adds no React state (`tech-lead`).
- **Rejected:** `product-designer`'s "clear the text when the preview starts". The reason is in the task.

**D-29z1326: a clip whose source is `error` (the data-honesty case).**
- **Export** refuses, with the existing failed text. Only clips inside the export window count.
- **Play** plays and writes the warning after `playingFrom` (Live 12 manual 5.6).
- **Live has no reference for export.** This is our own decision.
- **The "Offline" mark** is a question for Saba: `user-review/questions-perf13b-ii.md` Q1, recorded as SABA-Q-PERF13B-OFFLINE-MARK (`awaiting_user`, L44).

**D-29z1327: A-R383-REVIEW-L1 is closed with no code.** It cannot be reached, and no mutant could separate the guard from `signal.aborted` (L52, `tech-lead`).

**D-29z1329: the purchased reload.** The question goes to SRW-21-PLAN.

**Size.** Six grants:
- 3 source and test pairs;
- the budgets file;
- the new doc 251.

The jsdom rows (EV3, EV9, EV16–EV22) each name a mutant. C has B1–B6 and PERF-RES at both viewports.

**Pre-checks run by B:**
- **L23 pre-apply on the scratch.** ST12 and EV3 turn red; both are granted (`l23-preapply-391.log`). EV9 will also change with the settle rule, and is granted.
- **L31.** Every covering file is far below its timeout. The slowest is `name-bar-hint-ui.test.tsx`, at 2.6 s for 10 tests at gate 388.
- **L29/L56.** `claims-391.sh` K1–K26 were run after the last edit; all cited files exist (K25).

**Not run as an assert by B:** the jsdom rows. They are new behaviour, and A must show each one red with its mutant. B wrote no source sketch for the context change. EV22 (a settle during a gesture) is `record` for that reason.

## 4. Consults
- **`tech-lead`:**
  - derive the state;
  - put the swap at the call sites;
  - the L1 guard has no testable path;
  - make the export check window-limited;
  - write the warning after `playingFrom`;
  - watch the risk when a settle lands during a gesture (EV22).
- **`product-designer`:**
  - the Live 12 manual 5.6 reference;
  - no Live reference for a decode wait or for export;
  - no auto-start;
  - export refuses;
  - the "Offline" mark is a question for Saba;
  - the acceptance rows.
- **`ableton-arrangement-expert` and `performance-optimizer`:** not called. Product-designer cited the manual. The performance numbers come from B's own runs.

## 5. Architecture
- **ARCH-CHECKPOINT-DECODE-REGION** is still unanswered, at the seventh planning since it was requested.
- **D-29z1328:** B dispatched PERF-13b-ii anyway, under the D-29z1321 rule. The round adds no React state or context field, and it does not touch `ensureDecoded`, the cache, the pins or the collection effect.
- **New signal:** SIG-R391-DECODE-REGION-NINTH-ROUND. Rounds 381–391 all touched this region.
- **Request to root:** please answer the checkpoint before PERF-13c, which works in the same region. The existing files are `b-round-383/root-request-arch-checkpoint-decode-region.md` and the addendum `b-round-388/root-request-arch-addendum-389.md`.

## 6. Order after round 391 (unchanged)
1. PERF-13c → PERF-13d → PERF-14 → PERF-15;
2. SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM;
3. STEM-LANES → SYS-1…3;
4. STORE-2b…5. `direction-decision.md` now exists, so the direction gate is open;
5. REVIEW-RECOMMENDATIONS → T12-ADVANCED;
6. the phase-2 entries, under the skip rule.

Other timing:
- PERF-11c-iii-d/e still wait for Saba (the RETRO 400 default).
- The next RETRO is due by count at round 400.
- The next regression is due on or after 2026-11-10.

## 7. Root notes
- **Still open for root:**
  - ROOT-REQ-VITEST-PERF-INCLUDE (GATE304-M1);
  - ROOT-REQ-L57-CHECK-PROGRESS;
  - ARCH-CHECKPOINT-DECODE-REGION.
- **Ready for commit:** nothing; there is no source change in rounds 389–390. The loop-state commit records the planning artifacts.

## 8. Files written by B
- `tasks/round-390.md`: a copy of the round-390 task.
- `current-task.md`: round 391.
- `regression-last.json`.
- `backlog.json` v358 (backup in `b-round-390/backlog-before-391.json`).
- `feature-status.md` (backup in `b-round-390/`).
- `b-next.json` (backup in `b-round-390/`).
- `user-review/questions-perf13b-ii.md`.
- In `b-round-390/`:
  - the checkpoint;
  - the grants (6);
  - the frozen manifest (1279);
  - the claims script and its output;
  - the sketch patch and the budgets file;
  - the perf log and its results;
  - the mutant log;
  - the L23 log;
  - the update scripts, with `.done` markers.

No file in `store/` was changed: `git status` is empty after B's work (K2).

## 9. Advisor
**Available, and used** after orientation and before writing. Its effects:
- `regression-last.json` was updated;
- L58 was honoured by actually running the sketch and the mutant before the flip;
- the count rows stay `record`;
- the L1 guard was ruled no-assert;
- the error-source ruling is explicit;
- the L51 lifetime for the decode text is ruled.

It is called again before close. Its use is recorded in `backlog.json` `advisor_used_by_B`.

**Advisor at close.** Three changes went into the task:
- the failure write is unconditional (the EV16 failure variant and MU-391-CONDITIONAL-FAILURE), so EV13 is not weakened;
- a MOCK-START row comes before B6;
- the order for injecting the decode delay or failure is now explicit.

The sketch patch was checked: it has 2 hunks and 22 changed lines, all of them the flip. Claims were re-run after the last edit; all 26 are present, and `store/` is clean.
