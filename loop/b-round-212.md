# B: Round 212 → 213 planning (D-29z200 … D-29z203)

Date: 2026-10-27.
- **Advisor:** available, used once before writing. All 8 points were applied:
  - archive before revising;
  - rulings first;
  - the conditional SABA-B-5 status;
  - a single-purpose split with no timeout raise;
  - a scratch run before dispatch;
  - minimal C rows with real browser rows;
  - a doc decision;
  - housekeeping.

  It is used again at the end.
- **Consults:** none. This is a test-only gate fix. The PERF consult rule (`performance-optimizer` + `tech-lead`) applies to PERF tasks, and resumes at PERF-1b.

## 1. Inputs read
- **Round 212 task:** `current-task.md` (round 212), archived as `tasks/round-212.md`. `cmp` shows it identical; no archive existed before.
- **Round 212 reports:**
  - `a-round-212.md`;
  - `c-round-212.md` and `c-round-212.json`;
  - `gates/gate-round-212.json`: **failed**, "verify exit 1". **Not published**, so the baseline stays `28a274c` plus the round-212 worktree;
  - `gates/round-212/verify.log`.
- **Loop state:** `context/active-summary.md`, `lessons.md`, `backlog.json` (by id), and `regression-last.json` (round 199, next due on or after 2026-10-30).
- **Snapshots before editing:** `b-round-212/{backlog-before-213.json, b-next-before-213.json, feature-status-before-213.md}`.

## 2. Acceptance results used (independently evidenced by C)
- **C round 212: PASS.** `browserVerified: true`, `realVerified: true`. 11 rows passed; PERF-RUN-212 is accepted by the ruling in §3.
  - **LATENCY-212:** single Clip Gain move-to-paint p95 at 1×.
    - Harness: 6.2 / 6.3 ms stopped, 7.5 / 7.6 ms playing.
    - C's probe, as medians: 5.4–6.1 ms stopped and 7.1–7.3 ms playing, at both viewports.
    - Baseline control: 23.9 / 41.4 ms.
  - **RELEASE-212:** a release now commits once, so C-R211-01 is fixed.
  - **PIX-212:** 28 cases, 0 pixels with a delta > 8, max delta 5.
  - **SYNC-212:** identical to the baseline, apart from the UUIDs.
  - **EXPORT-212:** bit-identical to C round 211.
  - **G212-3:** purchase protection holds.
- **Not "მზადაა" yet.** Gate 212 failed, so the code is not on master.
  - **SABA-B-5** becomes `c_pass_pending_publication`. It closes when rounds 212 and 213 are published (D-29z202).
  - **PERF-FADER-c** is shown as "მოწმდება" on the board.
- **Gate 212 failure.** The only failure is `CP12` timing out at 33.3 s against the 30 s limit; it took 25.4 s in gate 211.
  - A had already flagged this risk (a-round-212 gap 3). A's start-copy control also timed out (33.8 s), so the failure predates the round-212 code.
  - Recorded as **GATE212-B1** (Medium, because it blocks publication).

## 3. Rulings
- **C-R212-01 → D-29z200.**
  - **Row 1, accepted.** `fader.clipgain.stopped.commits-per-move` (1× and 6×) went from 0.926 to 0.917, because whole-gesture commits went from 112 to 111 at 121 moves. That is exactly the release commit removed under D-29z198. **General rule:** a derived row whose numerator includes an excluded row is excluded with it.
  - **Row 2, accepted as harness or machine variance.** `load.longtasks-over-50` went from 1 to 2. C's own probe gives 1 long task in 8/8 loads on both builds, and the round's code does not run at load. Signal for PERF-1b: make the row a median of N runs, or a record row.
  - **Outcome:** PERF-RUN-212 is accepted by ruling. C does not re-run it.
- **C-R212-02** (info): signal for PERF-1b.
- **C-R212-03** (info): under 6× CPU throttle the drag is still 45–60 ms, on both builds. This is a slow-CPU budget question for Saba and an input to PERF-1b. Not scheduled.
- **C-R212-04** (Low): `docs/` prose leaks into the shipped CSS through Tailwind's source scan. Moved to `deferred_low_polish`. The fix (`@source not`) needs a grant for the protected `app/styles/**`.
- **PO1–PO4 id collision** (`C-R212-PO-ID-COLLISION`) and the code-reviewer's group→group pending carry-over (`A-R212-REVIEW-GROUP-PENDING-CARRY`): both are pre-existing Lows, moved to `deferred_low_polish` (now 318).
- **A's Architecture note** (keep; the ~28-prop leaf is not new): recorded as `A-R212-ARCH-NOTE` in `architecture_signals`. It is context for the pending D-29z195 checkpoint and is not scheduled.

## 4. Planning measurement (B scratch run; L23)
**Setup:**
- `git archive HEAD` into `/tmp/b213scratch`;
- the 7 M + 2 ?? round-212 files copied over it;
- `node_modules` symlinked;
- the store tree was not touched.

**Change applied:** exactly the split of task §1, at `b-round-212/scratch/cp12-split.diff`. `tsc` is clean; Biome is clean after formatting.

| Run | CP12 (before) | CP12a | CP12b | CP12c | CP12d | CP12e | CP12-COVER |
|---|---|---|---|---|---|---|---|
| file alone, run 1 | 15,589 ms | 4,112 | 3,778 | 3,704 | 3,736 | 274 | 1 |
| file alone, run 2 | — | 3,986 | 3,723 | 3,559 | 3,669 | 229 | 2 |
| covering run `app/lib/arrangement app/components app/hooks` | (A: 31.8–32.8 s) | 8,768 | 8,041 | 8,313 | 8,407 | 551 | 2 |

- **Covering run:** 155 files and 2,236 tests green (`b-round-212/scratch/covering-run.log`).
- **Next slowest single test:** 3.5 s (`track-group-mix-ui`). No other test is near the timeout.
- **Load factor:** about 2.1–2.2×, the same as gate 212's (33.3 / 15.6). Projected gate time per chunk is about 9 s against 30 s.
- **Rejected options:**
  - **Raising the timeout:** it hides the trend. The file went from 29 s to 39 s as rows were added.
  - **Coarsening the step:** it loses coverage.

## 5. Decisions
- **D-29z200:** round 212 accepted on C's evidence; C-R212-01 ruled.
- **D-29z201:** GATE212-B1 is round 213, a test-only CP12 split. It has 2 grants: the CP file and doc 167's CP12 lines.
- **D-29z202:** SABA-B-5 becomes `c_pass_pending_publication`. C-R212-02 and C-R212-03 are signals. Three Lows are deferred.
- **D-29z203:** doc 167 is granted for the CP12 Problem → Solution lines only; l.4 stays conditional (L28). Root publishes rounds 212 and 213 together. The queue is unchanged.

## 6. Round 213 summary
- **Scope:**
  - 2 grants and 0 new files;
  - 1,057 frozen files (rc 0), including every round-212 change;
  - baseline `28a274c` plus the round-212 worktree.
- **C rows:**
  - SCOPE-213, COVERAGE-213, LOAD-213, DOC-213 and AN-REVIEW-213;
  - **G213-3** and **STUDIO-SMOKE-213** in the real browser;
  - the gate rows are not claimed.

## 7. Not scheduled / unchanged
- **Architecture checkpoint** (D-29z195): still pending with root; no result file exists. It is non-blocking. This is not a new feature boundary; the next one is the end of STUDIO-PERFORMANCE.
- **Regression:** due on or after 2026-10-30 (`regression-last.json` unchanged).
- **RETRO:** round 215 or the end of STUDIO-PERFORMANCE. New signal: **B-R212-TIMEOUT-HEADROOM** — "a test above ~50 % of its timeout in the last gate log is split before more rows land in its file". It is recorded in `open_findings`; `lessons.md` belongs to RETRO.
- **Saba questions:** unchanged, plus C-R212-03 (6× slow-CPU budget).
- **Commit-ready:** after C PASS on round 213, root gates and publishes the combined rounds 212+213.

## 8. Completion check
Not COMPLETE: large scoped work remains (PERF-1b…16, SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED, the phase-2 entries and the deferred Lows). Not BLOCKED: nothing external is missing.
