# B round 312 → 313 planning

**Date:** 2026-11-03 · **Baseline:** HEAD `dfa4502` (gate 312 `skipped`, "C taskStatus FAIL") + A's round-312 tree, uncommitted (7 entries) · **Decision:** CONTINUE → round 313 = PERF-5a fix-up (C-R312-01)

## 1. Round 312 ruled on evidence (D-29z837)

**C round 312: FAIL.** 13 rows passed and 1 failed. `browserVerified` and `realVerified` are true.

- **App-code rows (all passed):** PK-MAIN-THREAD, PK-IDENTITY, PK-CLIP-PATHS (both viewports, plus zoom), PK-READY-ORDER, PK-VIDEO, PK-COPY-BOUND, PK-ABORT, G312-AUTH (both viewports), PK-UNIT 119/119, and TESTS-READ (17/17 mutants red).
- **The only failure: PK-PERF-HARNESS → C-R312-01** (Medium; origin: B's spec and B's pre-check).
  - In the PERF-1a harness, the `harness.loaf-scripts` self-check fires because the settled load window no longer contains any long-animation-frame entry with script timings.
  - The app is correct. Its improvement starved the guard.
- **The app work is not re-dispatched.** `b-round-312/a312-app-code-sha256.txt` freezes the 6 code paths, so round 312's PASS rows carry over while those paths stay byte-equal (C row CARRY-312).
- **A-R312-REVIEW-M1 and M2** were fixed inside round 312 (PW12, PW13) and are closed.
- **`tasks/round-312.md`** is a byte copy of the old `current-task.md` (`cmp` equal; claim K15).

## 2. Findings ruled
| Id | Severity | Ruling |
|---|---|---|
| C-R312-01 | Medium | Round 313 (D-29z838) |
| Doc 228 l.4 says "C round 312 PASS" | — | Rewritten in round 313 (L28 re-dispatch) |
| A-R312-REVIEW-L1, L2, L3, L4, L5 | Low | `deferred_low_polish`, as one PERF-5 batch that closes in PERF-5b (D-29z839). L4 carries C's surviving mutants C-MU-VIDEO-GUARD-REMOVED and C-MU-STALL-ONLY-AT-BEGIN as evidence |
| A-R312-REVIEW-L6, C-MU-POOL-NOT-CLEARED, C-MU-LAST-CHUNK-DROPPED | info | Recorded |
| Reviewer Architecture note: keep; a `useSourcePeaksComputer` hook if a second consumer appears | signal | Recorded, not scheduled |

No Critical or High finding is open. C-R312-01 is the only open Medium, and it is scheduled now. **REGRESSION is not due:** the last one was 2026-11-02, so the next falls on or after 2026-11-05.

## 3. Harness ruling (D-29z838)
- **What changes:**
  - The guard moves off the measured load window. In the 1× pass only, right after settled, the harness injects one 80 ms `setTimeout` callback, which stamps its own start and end.
  - A new pure function, `injectedLoafEntries` (in `report.ts`, with a 1 ms edge tolerance), keeps only the LoAF entries that **contain** the callback.
  - The spec applies `loafScriptsProblem` to those entries and requires exactly 1 of them.
  - A new budget row, `harness.loaf-scripts-live`, asserts a value of at least 50.
  - `load.script-max` stays on `[0, settled]`, gains a `loafEntries` detail, and may honestly read 0.
- **What stays:**
  - `loafScriptsProblem` and LOAF1 are unchanged.
  - New unit rows: LOAF2.
- **Rejected:**
  - dropping the guard (A-R283 returns);
  - a warning only;
  - injecting inside the measured window;
  - the start-inside filter (it missed 2 of 3 passes);
  - the overlap filter (tech-lead's app-frame hole).

## 4. B's pre-check (L23/L37; this time on the perf spec)
The pre-check ran on scratch `/tmp/b312s`: A's real tree plus the sketch, with its own `cacheDir`. Every run ran alone.

| Run | Rule | Result |
|---|---|---|
| 1 | start-inside | live samples `[79, 0, 0]`; the frame starts before the stamp |
| 2 | overlap | pass, `[79, 79, 80]` |
| 3 | final containment | **pass, 0 failures**, live `[79, 79, 80]`, exactly 1 containing entry with `scriptCount` 1 in each pass; `load.script-max` `[37, 0, 0]` |
| MU-LIVE-BUSY0 | busy time 0, on the final sketch | **fails**, 7 failures |

- **Static and unit checks:**
  - `tsc` rc 0.
  - `report.test.ts` passes 29/29 through the scratch config.
  - Unit mutants MU-OVERLAP-ONLY, MU-START-INSIDE and MU-NO-TOLERANCE turn red on 1, 3 and 1 tests; the restored code passes 29.
- **The patch:** `git apply --check` passes on A's tree.
- **Claims K1–K26:** run on A's tree and on the sketch (`b-round-312/claims-313-*-output.txt`).
- **Not run:** the full vitest suite. This round changes no `app/**` file, and `perf/**` is outside the vitest include (K26).

## 5. Consults (read-only)
**tech-lead's verdict: "change (small)". Adopted in full.**
- **Found:** the overlap filter could accept an app LoAF.
- **Asked for:**
  - containment, using start and end stamps taken inside the callback;
  - a pure selector in `report.ts` with unit rows;
  - exactly 1 containing entry;
  - `loafScriptsProblem` kept unchanged;
  - a note on the 1×/6× history difference.
- **Said:** the effect on later rows is negligible, because their windows start fresh.

**Not consulted:** performance-optimizer. This is not a new perf task.

## 6. Bookkeeping (D-29z840)
- **`backlog.json`** goes from v271 to v272 (re-serialised in the original format; the diff is local):
  - D-29z837…D-29z840;
  - `open_findings`: C-R312-01, the M1/M2 closures, and the info items;
  - `deferred_low_polish`: +5;
  - `rounds`: 311 closed, 312 `c_fail`, 313 dispatched;
  - STUDIO-PERFORMANCE: status, the PERF-5a stage, and `consults_round_313`.
- **`feature-status.md`:** PERF-5a is **ბაგია** (bug) and round 313 is **მუშავდება** (in progress). PERF-5a stays not done until C PASS and the gate.
- **`lessons.md`:** L37 gains the vacuity-guard clause (C-R312-01). The file is still 59 lines; the pre-edit copy is `b-round-312/lessons-before-313.md`.
- **Backups:** `b-round-312/backlog-before-313.json` and `feature-status-before-313.md`.

## 7. Requests and signals
- **Saba (unchanged):** SABA-Q-WORKER-DEPLOYED and SABA-Q-PERF4-STUDIO-CACHE.
- **Root:**
  - **ROOT-REQ-VITEST-PERF-INCLUDE.** This is the second time it has cost a round. `perf/lib/*.test.ts` and `npm run test:perf` are outside every gate, so a broken harness self-check is invisible to the gate.
  - **ROOT-REQ-VERIFY-WORKER-TESTS** is still open.
- **Architecture:** no new checkpoint request. Three are open and non-blocking, and this round touches only harness files.
- **Signals (unchanged, not scheduled):** PERF2-REMAINDER-SFX-SYNTH and SOURCE-PEAKS-NEVER-PRUNED.

## 8. Commit readiness
- Nothing is publishable yet: round 312's 7 paths wait for round 313's C PASS.
- After C PASS and the gate, root publishes:
  - round 312: 2 modified + 5 new paths;
  - round 313: the modified spec, `budgets.json`, `report.ts`, `report.test.ts` and doc 163.

## 9. Next
- **REGRESSION**, if the round-314 planning falls on or after 2026-11-05.
- **Otherwise PERF-5b**, with its own premise measurement and the PERF-5 Low batch.
- **Then** PERF-7 → PERF-8 → …
- **RETRO** at round 320.
