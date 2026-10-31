# B round 279 → 280 planning (2026-10-31)

**Advisor:** available and consulted before the approach. A second call follows before finishing.
**Consults (read-only, told not to run jobs during B's perf runs):**
- `tech-lead`: round shape (280 = b-ii-2 only; three harness-diagnostics bugs → 281), doc 209, grants, hard limits inside `measureExport`, mutants;
- `performance-optimizer`: the probe and midpoint predicate, `heapPollMs`, expected movement, mutants, fold-in.

## 1. Inputs and evidence
| Input | Result |
|---|---|
| `c-round-279.json` | **PASS**: 12 rows, `browserVerified: true`, `realVerified: true`, 0 bugs, 0 failed, 0 blocked. Gate rows not claimed. Info: INFO-C279-LANE-PROBE-TIMEOUT, INFO-C279-TASK-2.4-OVERSTATED, INFO-C279-REVIEWER-LOWS |
| `a-round-279.md` | done within the grants, no STOP; perf 3/3 (1a 6.4 min); EQUIV 0 problems ×3; 7 mutants with their signals; code-reviewer 9/10, 8 Lows, one Architecture note |
| `gates/gate-round-279.json` | **published**, commit `1dbf3af` on both remotes. New baseline |
| `gates/round-279/review.md` | COMMIT OK, 9/10. Suggestion 1 is **Medium** (GATE279-S1), 2 watch, 3–5 Low, Architecture note signal 2 |
| env-status | store 200 (round 279). :5173 answered 200 throughout B's runs (perf runs use their own :5188 server) |
| regression-last.json | round 258, 2026-10-30 → next REGRESSION due on/after 2026-11-02; not due today (2026-10-31) |
| `tasks/round-279.md` | archived (a copy of the round-279 `current-task.md`; it did not exist before) |

## 2. Backlog changes (only from evidence)
**Closed (D-29z642)**, by C round 279 PASS + gate 279 published: GATE214-S1, GATE214-S2, GATE223-S2 (`deferred_low_polish`), C-R223-01-GATE214-S2-PREMISE. Stage PERF-HARNESS-SHARED-LIB-b-ii-1 → **done / მზადაა** (browser rows PERF-RUN, MUTANTS, LANE-BROWSER, G279-AUTH all ran).

**New (D-29z643):**
- **Medium:** GATE279-S1 (`waitForCollectionReady` cannot tell a failed demo source from a slow wait) → round 281.
- **Scheduled with it (281):** B-R280-CLICK-LIVE-LANE-ID (the D-29z254 leftover A could not do under round 279's equivalence contract), A-R279-REVIEW-LANE-NULL (Low, same function, merged with gate suggestion 3).
- **Lows → `deferred_low_polish`:** A-R279-REVIEW-PAGE-STYLE, A-R279-REVIEW-LIB-EXPORTS, A-R279-REVIEW-DOC175-STALE, GATE279-S4.
- **Watch:** GATE279-S2 (cap hit while playing on a slow runner).
- **Info:** INFO-C279-LANE-PROBE-TIMEOUT (cause unconfirmed; the round-280 auth row now warms or waits ≥ 150 s), **B-R280-TASK-2.4-OVERSTATED** (origin B: round 279's §2.4 overstated the poll-loop leak; counted at RETRO 290).
- **Architecture signals (recorded, not scheduled):** A-R279-ARCH-IDLESETTLE-ROLES, GATE279-ARCH-COPY-STRINGS.

**Timeout data (D-29z644):** PERF-1a 6.4 (A) / 6.5 (C) min = 43 % of 15 min, appended to ROOT-REQ-PERF-TIMEOUT and PERF-1A-TIMEOUT-HEADROOM. Not closed: the limit did not change.

**Also updated:** `decisions_log_b` (D-29z642…D-29z649); STUDIO-PERFORMANCE: stage statuses, new stage PERF-HARNESS-DIAG-281, `consults_round_280`, `execution_order_d29z645`; R216-MEM-POLLS-HEADROOM status; `rounds` 279 done + 280 dispatched; `feature-status.md` (header, round bullets, STUDIO-PERFORMANCE row). `lessons.md` unchanged (no new lesson class; L29 already covers B-R280-TASK-2.4-OVERSTATED). `product-designer` is recorded in `backlog.json` (21 mentions; L42 check).

**Backups:** `b-round-279/*-before-280.*`. **Script:** `b-round-279/backlog-update.py`.

## 3. Rulings
| D-ID | Ruling |
|---|---|
| D-29z645 | Round 280 = b-ii-2 only. `page.ts` stays frozen, so PERF-1a/1b-i are byte-identical to `1dbf3af` and need no re-run. Round 281 = PERF-HARNESS-DIAG-281 (GATE279-S1 + B-R280-CLICK-LIVE-LANE-ID + A-R279-REVIEW-LANE-NULL) |
| D-29z646 | Page-clock probe (5×, best RTT, limit 20 ms → named problem) + midpoint rule; `heapPollMs` 50 and `>= 5` kept. **R216's headroom is measured, not claimed:** +0…+2 per export. After PASS R216 is a watch (reopen if `mem-polls-1` < 7) |
| D-29z647 | EQUIV-B2 against B's HEAD oracle; named exceptions: the 8 notes and the two 1× peak rows ±0.1 (measured 65 → 65.1) |
| D-29z648 | New doc 209; L28 final stage: docs 208 and 176 l.4 → `Completed (C round 280 PASS)` |
| D-29z649 | The outcome table |

**Consult disagreements, settled by measurement:** headroom (`tech-lead` expected some; `performance-optimizer` about +1; measured +0…+2, so `performance-optimizer` was right); the ±0.1 (`performance-optimizer` proposed dropping it; measured 65.1, so it stays); `tech-lead`'s offset-0 control is replaced by MU-ORIGIN, because the offset is an epoch value.

## 4. Pre-check (the sketch pre-applied and measured)
All runs alone (L38), on `git archive 1dbf3af` copies with node_modules symlinked.
- **HEAD 1b-ii:** 1 passed (1.3 min) → oracle `b-round-279/head-results-1/`.
- **Experiment v1 ×2** (`sketch-v1-experiment.diff`): offset vs `timeOrigin` −0.5…−1.5 ms, RTT 1–2 ms, +0…+2 samples per export; run 2's 1× export-1 peak was 65.1 ×3 (`windowPeakMib` 65.1).
- **Final sketch** (`sketch.diff`): tsc rc 0; 1 passed; EQUIV-B2 0 problems, 1 tolerated (65 → 65.1); strict check without exceptions shows 9 problems (the 8 notes + 65.1), so the exceptions are exactly what moves.
- **Mutants** (`mutants/`): MU-SIGN red (mem-polls 0, 32 failures), MU-RTT red (named problem in every export), MU-ENDPOINT Σ(value − endpointRule) = 0 against 11 on the sketch, MU-ORIGIN control green (Σ 12), MU-PROBE-THROW red (aborted, observer released).
- **Claims:** `b-round-279/claims.sh` → `claims-output-at-1dbf3af.txt` (K1–K17, SW-B, SW-C), identical on `store/` and on the archive.
- **Grants:** `b-round-279-r280-grants.txt` (8 paths: 2 code/data, 1 new doc, sections of 5 docs). **Frozen:** `b-round-279-r280-tree-sha256.txt`, 1136 files, `sha256sum -c` rc 0 at planning.

## 5. Architecture checkpoint
No new request: test-only harness round. When b-ii-2 passes, PERF-HARNESS-SHARED-LIB-b is complete (a feature boundary). Its two new signals (A-R279-ARCH-IDLESETTLE-ROLES, GATE279-ARCH-COPY-STRINGS) plus B-R279-PERF-READY-WAIT-DUP are small test-harness items; they do not justify a frontend-architect checkpoint before the PERF-2 app work. ARCH-CHECKPOINT-SYS5-SOFT-DISABLED (`b-round-277.md` §5) stays optional and non-blocking.

## 6. Next
- **If C passes and the gate publishes:** round 281 = PERF-HARNESS-DIAG-281 (consults first), unless the round-281 planning falls on or after 2026-11-02: then REGRESSION first.
- **After 281:** PERF-2 → … per `execution_order_d29z645`. RETRO at round 290.

## 7. Commit readiness
Rounds through 279 are published (`1dbf3af`). Round 280 becomes ready for the gate after C PASS; it is test-only.
