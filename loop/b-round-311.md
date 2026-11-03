# B round 311 → 312 planning

**Date:** 2026-11-03 · **Baseline:** HEAD `dfa4502` (gate 311 `published`) · **Decision:** CONTINUE → round 312 = PERF-5a

## 1. Round 311 closed on evidence (D-29z832)
- **C round 311:** PASS. 12/12 rows. `browserVerified`/`realVerified` are true: WK-GUARD-PROXY/ALT, WK-OPS-REGRESSION, WK-HEAD-CONTROL, G311-AUTH at both viewports, WK-UNIT 75/75 + 32/32, RED-ON-HEAD 4, TESTS-READ 25/25 (C's own mutants 3/5).
- **Gate 311:** COMMIT OK, 8.5/10. `dfa4502` is on both remotes.
- **PERF-4e → done.** Closed: GATE310-M1, GATE310-L3 (= B-R309-REFETCH-INM-WINDOW), C-R310-01 and A-R310-REVIEW-L1.
- **`tasks/round-311.md`:** a byte copy of the old `current-task.md` (`cmp` equal; K15).

## 2. Findings ruled
| Id | Severity | Ruling |
|---|---|---|
| C-R311-01 (= A-R311-REVIEW-L2/L3) | Low | `deferred_low_polish` (D-29z833). Two worker-test mutants survive; the code is correct |
| A-R311-REVIEW-L4 | Low | Same batch. PR15 `every(cancelled)` is vacuous in throw mode |
| GATE311-L1 (gate #1) | Low | Same batch. The fake's TypeError comes before the `short` check |
| GATE311-I2, GATE311-I3 | info | Recorded |
| INFO-C311-ASSERT-MINUS-LINE | info | B wording. L4 covers it, and round 312 uses L4's wording |
| INFO-C311-WARM-STATUS-NULL, INFO-C311-AUDIOSEEK-LINES | info | Environment |

The batch closes with the next worker round that owns `r2-proxy.test.mjs`, the R2-WORKER-TWO-COPIES dedupe after SABA-Q-WORKER-DEPLOYED. No fourth consecutive worker round is opened for Lows.

**Architecture signal:** R2-WORKER-TWO-COPIES is now ×5 (A's note and the gate-311 reviewer). It is recorded, not scheduled. No new checkpoint request is made, because three are open and non-blocking.

## 3. Next scope choice
- **REGRESSION is not due:** `regression-last` is 2026-11-02, so it falls due on or after 2026-11-05.
- **No open Critical, High or Medium** finding is unscheduled.
- **The next dependency-ordered item** in STUDIO-PERFORMANCE (`execution_order_d29z817`) is **PERF-5**.

## 4. PERF-5 premise and mechanism (L37; D-29z834, D-29z835)
- **HEAD probe** (`b-round-311/probe/`, dev server, CPU profile at 100 µs):
  - main-thread `computePeaks` takes **55–86 ms** per demo load (5 loads); single calls take up to 25.9 ms;
  - no peaks worker exists.
- **Chromium microbenchmark** on a 5-min 48 kHz stereo buffer (`browser-copy.txt`):

  | Main-thread work | Total |
  |---|---|
  | `computePeaks` | 29.6–32.6 ms |
  | `copyFromChannel` into **fresh** arrays | **58–82 ms** |
  | `copyFromChannel` into **recycled** arrays | **5.6–9.3 ms** |

  So a worker only helps when the chunk arrays are recycled.
- **Split** (nothing dropped):
  - **5a:** the worker + identical output.
  - **5b:** batching, with its own premise measurement.
  - **The pyramid** goes to PERF-14.
  - **The long-stem scenario** and the pruning hypothesis go to PERF-13.

## 5. Consults (read-only)
- **performance-optimizer:** stream chunks to one shared worker; bounded in flight; pyramid → PERF-14.
  - It proposed "ready first". **Rejected.**
  - It called recycling optional. **Corrected by measurement.**
- **tech-lead:** the client/worker split in the demo-synth pattern; "ready" stays after the peaks; a 3 s stall timeout; abort guards; defer batching and the pyramid; keep the orchestration out of the context.
  - It warned about the 2-microtask tests. **Solved** with a synchronous callback when there is no `Worker`, so no test edits are needed.
- **The disagreement** (ready order) is ruled for tech-lead: it is the smallest observable change and it keeps the harness and test contracts.

## 6. B's pre-check (L23)
**Scratch** `/tmp/b311s` (HEAD + sketch). Artifacts are in `b-round-311/sketch/`.
- `tsc` rc 0, and Biome is clean.
- **The full suite passed: 235 files / 3490 tests** (gate 311 had 234 / 3478).
- **12 named mutants are all red**, and the restored code passes 13/13. One equivalent mutant is dropped, with its reason.
- **Browser on the sketch** (a second dev server with its own `cacheDir`):
  - main-thread peaks take 0 ms;
  - `peaks.worker.ts` is created;
  - 9/9 library preview waves are byte-identical to HEAD;
  - 0 page errors.
- **Claims K1–K23:** run on HEAD and on the sketch (`claims-312-*-output.txt`).
- **Not sketched:** PW11, the context row. A writes it, with MU-CONTEXT-BYPASS as its red-proof.

## 7. Requests and signals (D-29z836)
- **Saba** (unchanged): SABA-Q-WORKER-DEPLOYED and SABA-Q-PERF4-STUDIO-CACHE.
- **Root** (unchanged, non-blocking): ROOT-REQ-VERIFY-WORKER-TESTS and ROOT-REQ-VITEST-PERF-INCLUDE.
- **New signals** (not scheduled):
  - PERF2-REMAINDER-SFX-SYNTH: the SFX synth still runs on the main thread (~20 ms), and the synth `onmessage` handler is a 65–78 ms long task.
  - SOURCE-PEAKS-NEVER-PRUNED: a hypothesis from tech-lead.
- **Advisor:** consulted before the approach and before hand-off.

## 8. Commit readiness
- **Round 311** is published (`dfa4502`). Nothing is pending from it.
- **Round 312:** root publishes it after C PASS and the gate (2 modified files + 5 new).

## 9. Final advisor check (applied to the task)
- **PK-COPY-BOUND:** the "≤ 8 distinct arrays" clause is removed. Transferred arrays come back as new objects, so an in-page identity count would fail correct code. The identity proof of recycling stays with PW4 + MU-FRESH-BUFFERS.
- **CLAIMS:** the values that change on A's real tree are now listed: K2 `7 dfa4502`, K16 `1 228-perf-peaks-worker.md` and K17 `1`.
- **HEAD side:** C is given B's scratch-server recipe (own `cacheDir`, port ≠ 5173).
