# B round 389 → 390 planning (2026-11-07)

**Decision:** CONTINUE. **Next:** round 390 = REGRESSION-2026-11-08 part 2 (C-only; A changes nothing). Backlog v356 → v357, D-29z1316 … D-29z1321.

## 1. Round 389 result (evidence read by B)
- `c-round-389.json`: PASS, 20 rows passed, 0 failed, 0 bugs, `browserVerified` true, `realVerified` true. The fake-Bearer row is BLOCKED (backend unavailable in cloud), which is not a failure.
- B read `c-round-389.md` and `c-round-389/export-det.json` directly: 3 clips, sha equal twice.
- `a-round-389.md`: baseline `11ca746` clean, no change.
- `gates/gate-round-389.json`: `skipped` (no real changes). The baseline stays gate 388's commit `11ca746` (published on both remotes). The store tree is clean at `11ca746`.
- Nothing to close or defer: C reported no bug, and A had no reviewer notes because there was no change (D-29z1316).

## 2. C's open questions, answered
1. **Esc does not cancel a clip drag.**
   - This is the existing signal ESCAPE-CANCEL-GESTURE / C-R85-L1. There is no CZABA contract for it; it needs a Live source and a Saba decision.
   - The round-389 observation is appended as evidence. It is not a finding and not scheduled (D-29z1319).
   - Part 2 records it again as R390-ESC-DRAG.
2. **Video sound after the move was not re-asserted.** That half of R389-VIDEO-DRAG did not run, so it is carried as a named row, **R390-VIDEO-SOUND** (L6, V2; D-29z1318). It uses an audible level assertion; a silent moved clip is Medium.
3. **Lookups.** All were accepted and promoted to "Changed UI facts since round 342" in the task.
4. **Journey without export:** accepted as a labelled deviation for part 1. R340-JOURNEY in part 2 must run as one flow with the export.
5. **The 3-clip export:** its length and format were not parsed. This is carried as **R390-WAV-3CLIP-LEN**.

## 3. Round 390 shape (D-29z1317, D-29z1320)
- **Rows:** the round-340 template (§4d, §4c, §4b, §3, §4/§4.S, §5), as rounds 341–342 actually ran it. The B rulings that closed traps there are bound into the task: D-29z1062 (hint once per load), D-29z1063/1068 (no "press L"; FONT-PIXEL retired, baseline `c-round-341/out/fonts/`; woff2 from `/assets/`), the POSCTL oracle from round 342, and the PRICE mock-swap procedure as the last store row.
- **The mock API starts first.** Its absence is why round 340 went BLOCKED.
- **Carried from round 389 on the same HEAD, not re-run:** RR-PERF (17 min; both named group/lane rows present) and PERF-LIB. RG-SMOKE (about 1 min) is run again, alone, before G390-AUTH, because the regression-round rule names it.
- **Frozen tree:** the round-389 manifest is reused. Claims: `b-round-389/claims-390.sh`; planning output `claims-390-planning-output.txt` (K1 published 11ca746 / 389 skipped, K2 0, K3 11, K4 0/1284, K6 000 200, K7 PASS 20 0, K10 all files exist).
- **Size risk:** this is the scope that took rounds 340–342. The task has a resume order, `progress.json`, per-row reports, and an outcome row for PARTIAL. `regression-last.json` is untouched until part 2 closes.

## 4. Not applicable this round
- Reference-first, `product-designer`, YouTube and screen budget do not apply: there is no new behaviour and nothing new on screen.
- No consult agent was called. A regression round adds nothing to design.

## 5. Order after the regression (unchanged from D-29z1298)
PERF-13b-ii → PERF-13c → PERF-13d → PERF-14 → PERF-15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 (direction gate) → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase 2 entries under the skip rule.
- PERF-11c-iii-d/e still wait for Saba (the RETRO 400 default).
- The next RETRO is due by count at round 400.

## 6. Root notes
- **ARCH-CHECKPOINT-DECODE-REGION** is still wanted before PERF-13b-ii, with addendum `b-round-388/root-request-arch-addendum-389.md`. It is non-blocking for round 390.
- **Still open for root:** ROOT-REQ-VITEST-PERF-INCLUDE (GATE304-M1), ROOT-REQ-L57-CHECK-PROGRESS.

## 7. Ready for commit
- Nothing to publish from round 389 or round 390 (no source change).
- The loop-state commit records the planning artifacts.

## 8. Files written by B
- `tasks/round-389.md` (copy of the round-389 task);
- `current-task.md`;
- `backlog.json` (v357; backup `b-round-389/backlog-before-390.json`);
- `feature-status.md` (backup in `b-round-389/`);
- `b-next.json` (backup in `b-round-389/`);
- `b-round-389/` (claims, planning output, update scripts with `.done` markers).

## 9. Advisor
- **Available, and used** after orientation, before writing. Its effects:
  - the two carried rows;
  - the mock goes first;
  - the round-341/342 rulings are bound into the task;
  - RR-PERF and PERF-LIB are carried instead of re-run (at close: RG-SMOKE is run again);
  - the round-389 tree manifest is reused.
- These are recorded in `backlog.json` `advisor_used_by_B`.
