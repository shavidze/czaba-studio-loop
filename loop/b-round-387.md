# B: planning from round 387 to round 388 (2026-11-07)

## Inputs read
- `context/active-summary.md`; `tasks/round-387.md`, an archived copy of the round-387 `current-task.md`; `a-round-387.md` (STOP on A-R387-REVIEW-M1); `c-round-387.md` and `c-round-387.json`.
- `gates/gate-round-387.json`: `skipped` (C taskStatus FAIL). Nothing was published, so the baseline stays `5312260` plus the uncommitted round-387 tree (5 lines).
- `regression-last.json`: the next regression is due 2026-11-08, and today is 2026-11-07.
- Code read: `tick`, `stopPlayback`, `stopForScheduleFailure` and `pumpPlaybackAudio` in `ArrangementContext.tsx`; `schedule-failure-ui.test.tsx`; `master-hold-tick.test.tsx`, for its meter fake.
- `lessons.md` (60 lines).
- Advisor: **available and used** once before writing. Its advice was followed: build a captured-rAF row and verify the mutant myself, copy the probes with parameterized paths, close nothing, keep the Medium at Medium, and open the regression unconditionally next.
- Project consult agents: none called. This round re-dispatches the code-reviewer's own one-line fix, and B verified it directly with a sketch, a mutant and the browser.

## 1. Acceptance (only from C's evidence) — D-29z1306
- **C round 387: FAIL**, with `browserVerified` and `realVerified` true.
  - Rows that passed with evidence: SOURCE-SCOPE, PATCH-EQUAL, CLAIMS, BROWSER-M2-FLOW, BROWSER-M1-NEIGHBOUR, EXPORT-EQUAL, G387-AUTH and STUDIO-SMOKE.
  - Rows C did not complete: UNIT (2 of 65 files) and MUTANTS (not run). A's 65/1022 and 15/15 are not independent evidence.
- **Nothing closes.** GATE-B385-M2, A-R386-REVIEW-M1, B-R386-UNGUARDED-GRAPH-CALLERS, TL-R387-M1 and A-R386-REVIEW-L1 stay `dispatched`, and the board shows them as **ბაგია**. They close on C round 388 PASS, with UNIT and MUTANTS run by C.
- **The bug, C-R387-01 (Medium, = A-R387-REVIEW-M1):** after the loop pump fails inside a rAF frame, the meters freeze at −19.8 dB.
  - B reproduced it on the round-387 tree at 1440 and 1280 (`b-round-387/probe/meter-head-*.json`).
  - **Kept Medium** (D-29z1307).

## 2. Round 388 — D-29z1307, D-29z1308
- **Ruling on A's STOP (L10):** the round grants the reviewer's guard in `tick` after `pumpPlaybackAudio()`, row SF11 and mutant MU-388-TICK-NO-GUARD.
- **The reviewed sketch** is `b-round-387/sketch-388.patch.txt` (sha `494afafc…4c71`). `git apply --check` gives rc 0 on the round-387 tree.
- **What B checked on the sketch:**
  - `tsc` rc 0; Biome clean.
  - The file passes 11/11, 3 times; SF11 takes 0.64 s.
  - The 66 covering files: 1,026 tests pass. That is the 65 round-387 files, 1,023 tests, plus `master-hold-tick`, 3 tests, added after the advisor's second review because it drives `tick` with an analyser fake.
  - MU-388 turns SF11 red (`-20.0` vs `-inf`).
  - The 15 round-387 mutants give the same red rows, except PUMP-NO-CATCH, which is now red on SF6 and SF11.
  - Browser, on a scratch server: the meters read `-inf` at both viewports, and the m2-flow result at 1440 equals the round-387 contract.
- **Grants:** 3 paths. Frozen: 1,281 entries.
- **C repeats the two rows it skipped in round 387**, UNIT (all 66 files) and MUTANTS (16), and adds the meter rows in the browser.

## 3. Recorded, not scheduled — D-29z1309
- **Deferred to `deferred_low_polish`:** A-R387-REVIEW-L-a, L-b, L-d, L-e and L-f. They are not fixed now because of L58: the sketch is re-dispatched byte for byte.
- **Closed as accepted:** L-c.
- **SIG-R387-SCHEDULING-REGION:** the Architecture note, signal 3. It was attached to ARCH-CHECKPOINT-DECODE-REGION (requested from root before PERF-13b-ii).
- **ROOT-NOTE-R387-STOP-NOT-HONOURED:** the runner sent the round to C after A's STOP. It also records C's overwrite of `c-round-386/auth-smoke.json` as information.
- **Lesson:** L52 now also covers stop paths that run inside a callback: drive the captured rAF and fake the caller's side effects. The file stays at 60 lines.

## 4. Architecture checkpoint
- No new request. The keep decision D-29z1303 holds, and the reviewer itself calls C-R387-01 a lifecycle gap.
- The existing request, ARCH-CHECKPOINT-DECODE-REGION, now also carries signal 3 from round 387. It should be answered before PERF-13b-ii.

## 5. Backlog and board
- `backlog.json` v354 → v355: round 387 marked `c_fail`, round 388 dispatched, C-R387-01 open, 5 Lows deferred, the signal recorded, the root note added, and the regression status updated.
- `feature-status.md`: the header line, the round 387/388 entries, the STUDIO-PERFORMANCE row and the GATE-B385-M2 row (**ბაგია**), plus a new C-R387-01 row.
- Backups are in `b-round-387/` (`backlog-before-388.json`, `feature-status-before-388.md`, `b-next-before-388.json`, `lessons-before-388.md`).

## 6. Commit readiness
Not ready. Gate 387 was skipped, and the round-387 tree waits for round 388 C PASS. Root then publishes rounds 387 and 388 together.

## 7. Not COMPLETE
- C-R387-01 is open, along with three Medium bugs that are still dispatched.
- REGRESSION-2026-11-08 is due.
- PERF-13b-ii…PERF-15, STEM-LANES, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED and phase 2 have not started.
- 889 Lows and info items are open, and the deferred Lows must be fixed before the final acceptance.
- Nothing external blocks the loop.
