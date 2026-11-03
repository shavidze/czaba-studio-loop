# B round 310 → 311 planning

**Date:** 2026-11-03 · **Baseline:** gate 310 published `8946431` on both remotes. HEAD is `8946431` and the tree is clean.
**Decisions:** D-29z828…D-29z831 (`backlog.json` v270).
**Advisor:** available and used twice.
- **Before writing:** it confirmed the plan: rule on gate-310 #1 with the primary source, fix the non-safe-integer residual, and bundle at most three related items.
- **At the end:** its review found that the PR13/PR15/PR18 red-proof was unchecked. B's grep showed that MU-HEAD-FIRST does not turn PR18 red, so 4 targeted mutants were added (25/25 red). It also flagged the missing performance-optimizer note (now in task §0.4) and K18 gaps (fixed).
**Consult:** tech-lead (read-only) reviewed B's sketch. It found no blocking defect; its rulings are in task §0.4. performance-optimizer was not consulted: no R2 call count or byte path changes (task §0.4).

## 1. Round 310 result (from evidence)
- **C round 310:** PASS. 12 rows passed. `browserVerified`/`realVerified` are true. 1 Low (C-R310-01) and 3 INFO notes. B checked `c-round-310.json` against A's report and the gate.
- **Gate 310:** published `8946431`. The review says "COMMIT: OK", score 8/10. It raised 1 Medium, 2 Lows and 1 Info, and an architecture note.
- **Backlog, evidence only:**
  - PERF-4d → **done**.
  - GATE309-M1/L2/L3 → closed.
  - No Critical or High finding is open.
- **Archive:** `tasks/round-310.md` is a copy, identical to the old `current-task.md` [K15].

## 2. Ruling on gate-310 review #1 (D-29z829)
- **Reviewer's claim:** "R2's docs only promise that a too-long `length` returns fewer bytes", so a suffix larger than the file could now give a 500.
- **The primary source contradicts that premise.** The R2 Workers API reference (fetched 2026-11-03, kept in `b-round-310/r2-workers-api-reference-2026-11-03.md.txt`) says at l.231 (`length`) and l.233 (`suffix`): "fewer bytes than this number may be returned" [K20]. The WebFetch summary was not used as the citation; the raw grep is.
- **The residual is real.** A valid header with a value that is not a safe integer still reaches R2 unclamped: `bytes=0-<400 nines>` gives `length: Infinity`, and `bytes=-<huge>` gives the same for `suffix`. At `b65febe` the same request was clamped through `head` and served as a 206.
- **Measurement.** B ran a real Chromium probe against an R2 fake that rejects non-safe integers. That rejection is an **inference** about R2, not observed behaviour:
  - HEAD gives **500 h1g1**;
  - the sketch gives **206 h0g1** with the whole object, bytes = CL.
- **Ruling:** it stays **Medium** and is fixed now under the 2026-10-23 bug gate. It goes together with GATE310-L3 (If-None-Match after the If-Range re-read, = B-R309-REFETCH-INM-WINDOW) and C-R310-01 (the throw-path re-read ETag is not pinned). The three findings are in one helper block, so this is the new stage **PERF-4e**, round 311.
- **Rejected:** the reviewer's retry in the catch with a range clamped from `head`. It costs 3 R2 calls and a race, and it is not needed for documented overflow. tech-lead agrees.

## 3. Next task: round 311 = PERF-4e (`current-task.md`)
- **Fix:**
  - `r2RangeOf` sends `{offset:0}` for a suffix that is not a safe integer, and `{offset:start}` for a length that is not one. Safe values are unchanged.
  - After both If-Range re-reads, ETag is taken from the second object, then a matching If-None-Match → 304, with no Content-Type or Accept-Ranges.
- **Tests:**
  - the strict fake;
  - PR16 (the guard, both modes) and PR17 (both re-read paths, both modes, the C-R310-01 ETag);
  - PR18 (HEAD + If-None-Match → 304);
  - one assert added to PR13 and two to PR15.

  No assert is removed.
- **Pre-check:**
  - sketch 75/75;
  - 4 red on the HEAD workers;
  - **25/25 mutants red**, including C's surviving mutant from round 310 (MU-THROW-REREAD-KEEPS-HEAD-ETAG);
  - the probe tells HEAD from the sketch on every new step;
  - round 310's regression steps are unchanged on the sketch.
- **Method finding:** If-Range and If-None-Match fail the CORS preflight in a cross-origin page `fetch`. The re-read probe rows use Playwright's `APIRequestContext` and are labelled `via: 'request'`.
- **tech-lead rulings:**
  - The HEAD + Range RFC point is pre-existing and pinned by PR6. B dropped the 416 half of PR18 rather than newly pin a disputed behaviour (→ B-R310-HEAD-RANGE-RFC, deferred Low).
  - The PR16 title and the far-read assert are fixed in the sketch.
  - `Number()` precision is pre-existing (→ B-R310-RANGE-PRECISION, deferred Low).
- **C rows:**
  - browser: WK-GUARD-PROXY, WK-GUARD-ALT, WK-OPS-REGRESSION, WK-HEAD-CONTROL and G311-AUTH (both viewports);
  - offline: WK-UNIT, RED-ON-HEAD, PROTECTED-UNCHANGED, SOURCE-SCOPE, CLAIMS, TESTS-READ and DOC.

## 4. Bookkeeping
- **New findings:**
  - `open_findings`:
    - GATE310-M1, GATE310-L3 and C-R310-01, scheduled;
    - GATE310-S4 and GATE310-S5, recorded;
    - the 3 C INFO notes.
  - `deferred_low_polish`: B-R310-HEAD-RANGE-RFC and B-R310-RANGE-PRECISION. B-R309-REFETCH-INM-WINDOW is marked scheduled. A-R309-REVIEW-TEST-GAPS is annotated: the PR14 `opened.every` gap in throw mode stays open.
- **Lessons:** no change. C-R310-01 (a B spec gap) is already covered by L52, "an assert must be able to fail; name a mutant". This round shows the lesson applied: C's mutant is in the list. `lessons.md` stays at 59 lines.
- **Architecture:** R2-WORKER-TWO-COPIES is now a 4× signal. The dedupe still waits for SABA-Q-WORKER-DEPLOYED. No new checkpoint request: three are open and non-blocking, and this is a bounded fix-up.
- **For root:**
  - **ROOT-REQ-VERIFY-WORKER-TESTS** is re-raised "with this worker change". Gate 310 review #2 confirms the worker test file is absent from `verify.log`. It is non-blocking, and C's WK-UNIT runs it meanwhile.
  - ROOT-REQ-VITEST-PERF-INCLUDE is still open.
- **For Saba** (unchanged): SABA-Q-WORKER-DEPLOYED and SABA-Q-PERF4-STUDIO-CACHE.
- **Regression:** the last one was on 2026-11-02, so the next is due on or after 2026-11-05. Today is 2026-11-03, so it is not due. RETRO is at round 320.
- **Before PERF-5:** PERF-16 is done and OSS-LIC is done (round 219), so the order holds. PERF-5 needs the performance-optimizer and tech-lead consults, `oss-adoption.md` read first, and an L37 re-measure.
- **Commit readiness:** after C PASS and the gate, root publishes the 3 modified paths and the new doc 227.

## 5. Artifacts (`b-round-310/`)
- **Backups:** `backlog-before-311.json`, `b-next-before-311.json`, `feature-status-before-311.md`, `lessons-before-311.md`, `regression-last-before-311.json`, `round-310-task-copy.md`, `head-at-planning.txt`, `git-status-at-planning.txt` (empty) and `update-backlog.py`.
- **Sources:** `r2-workers-api-reference-2026-11-03.md.txt` and `rfc9110-2026-11-03.txt`.
- **Sketch** (`sketch/`):
  - `head-helper-block.js.txt`, `helper-block.js.txt` and `helper-block.patch.txt`;
  - `sketch-r2-proxy.js.txt` and `sketch-r2-worker.js.txt`;
  - `sketch-r2-proxy.test.mjs.txt`, plus `-v1` before the tech-lead fixes, and `sketch-r2-proxy.test.patch.txt`;
  - `make-sketch.py` and `make-test-sketch.py`;
  - `mutants.py`, `sketch-mutants.txt` and `mutant-logs/`;
  - `sketch-tests-on-head.txt` and `sketch-tests-on-sketch.txt`.
- **Probe** (`probe/`):
  - `worker-server.mjs` (`R2_STRICT`, `R2_SWAP`), `browser-probe-311.cjs` and `summarize.py`;
  - `swap-etag.txt`;
  - the `{head,sketch}-*-1440.json` files, the server logs and `summary.txt`;
  - `reg-sketch-proxy-throw-1440.json`.
- **Claims:** `claims-311.sh`, `claims-311-head-output.txt` and `claims-311-sketch-output.txt`.
- **Frozen list:** `../b-round-310-r311-tree-sha256.txt` (1,183 entries).

## 6. Decision
**CONTINUE.** The scope is not complete. Still open:
- STUDIO-PERFORMANCE: PERF-4e, 4b and 4c, PERF-5…15 and PERF-DRAG-PREVIEW;
- STEM-LANES, SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED and the phase-2 entries;
- the deferred Lows and the Saba-owned items.

One Medium (GATE310-M1) is open and scheduled now. There are no open Critical or High findings.

**Not BLOCKED:** round 311 needs nothing external. Real-R2 behaviour stays post-deploy evidence.
