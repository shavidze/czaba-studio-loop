# B round 309 → 310 planning

**Date:** 2026-11-03 · **Baseline:** gate 309 published `b65febe` (both remotes); HEAD `b65febe`, clean tree.
**Decisions:** D-29z824…D-29z827 (`backlog.json` v269).
**Advisor:** used twice before writing. The second call reversed my first plan (§2).
**Consults:** tech-lead and performance-optimizer (both read-only).

## 1. Round 309 result (from evidence)
- **C round 309:** PASS. `browserVerified`/`realVerified` are true. 10 rows, 0 bugs, 4 INFO notes.
  - **WK-BROWSER-PROXY/ALT:** 304 with 0 bytes, a 206 range, 416, and a 206 seek of 975,916 bytes that plays.
  - **WK-HEAD-CONTROL:** separates the trees.
  - **G309-AUTH:** passes at both viewports.
  - **C's own 3 mutants:** all red.
  
  B checked `c-round-309.json` against A's report and the gate.
- **Gate 309:** published `b65febe`. The review says "COMMIT: OK", score 8.5. verify passed 234 files and 3,478 tests.
- **Backlog, evidence only:** PERF-4a → **done**. C has no unresolved Critical, High or Medium finding.
- `tasks/round-309.md` was archived as a copy, identical to the old `current-task.md` [K15].

## 2. Ruling on the gate-309 review (D-29z825)
The gate reviewer's **Medium #1** (GATE309-M1) is a different finding from A's pre-ruled race Medium. Every public 200 and 206 makes two R2 calls, and so does each `<audio>` seek.

Under the 2026-10-23 bug gate it is fixed now, together with **L2** (head/get race) and **L3** (a 416 publicly cacheable for a day). That is three tightly related findings in one helper block, so it becomes the new stage **PERF-4d**, round 310.

- **Rejected first plan:** keep `head` first whenever a Range header is present. Chromium's `<audio>` always sends Range (C's evidence: every seek line was a 206). That plan would leave the flagged path at two operations.
- **Why the full fix can run without live R2:**
  - The R2 doc documents that `length` may overflow.
  - Only an offset ≥ size is undocumented. The contract handles both possible behaviours (throw, or a short object), and the tests run both.
  - What remains open is which branch fires on real R2, and that is a post-deploy observation.

## 3. Next task: round 310 = PERF-4d (`current-task.md`)
- **What changes:**
  - one `get` per public GET;
  - a 304 compares the ETag in the worker's own code and cancels the body;
  - Content-Range is built from `object.size`;
  - a 416 is `no-store` in both R2 modes;
  - in the throw path, If-None-Match → 304 and an If-Range mismatch → a full 200;
  - an If-Range re-read takes everything from the second object;
  - HEAD and the protected routes are unchanged.
- **Premise:** a real Chromium probe with per-request R2 operation counts. On HEAD, every seek is h1g1; on the sketch, every seek is h0g1. Streamed bytes equal Content-Length on every 206 (`b-round-309/probe/summary.txt`).
- **Pre-check:**
  - the sketch passes 69/69;
  - the same tests on the HEAD workers give 15 red;
  - 13/13 mutants are red;
  - B's first sketch fails PR14/PR15. Those rows capture the two Low defects tech-lead found in it, which are now fixed.
- **Last pre-dispatch edits** (advisor review):
  - the throw path's If-Range re-read takes 3 R2 calls, is pinned only by PR14, and sets `Accept-Ranges` explicitly;
  - `handleProtected` builds Content-Range from `object.range` (l.127–130), while the public helper computes it from `object.size`; this asymmetry is acknowledged in task §0.4;
  - an oversized `suffix` is undocumented in R2 and not toggled by the probe, so it goes on the post-deploy list.
- **Consult disagreement:** performance-optimizer suggested `onlyIf` for the 304; tech-lead preferred the cancel path. The ruling keeps the cancel path, because R2's weak/list semantics are undocumented and the operation count is the same. `onlyIf` goes on the post-deploy list.
- **C rows:**
  - WK-OPS-PROXY-THROW/SHORT, WK-OPS-ALT and WK-HEAD-CONTROL, judged from the server log;
  - G310-AUTH at both viewports;
  - WK-UNIT, RED-ON-HEAD, PROTECTED-UNCHANGED, SOURCE-SCOPE, CLAIMS, TESTS-READ and DOC.

## 4. Bookkeeping
- **New findings:**
  - `open_findings`: GATE309-M1, L2 and L3, scheduled for round 310.
  - `deferred_low_polish`:
    - B-R309-PREVIEW-SAFE-NAME. It is pre-existing; the 404 is text/plain, and R2 keys are literal, so `..` cannot reach another prefix.
    - A-R309-REVIEW-TEST-GAPS.
    - B-R309-REFETCH-INM-WINDOW.
  - The 4 C INFO notes are recorded.
- **Lessons:** L38's warm-up clause now says "in a browser, not curl" (INFO-C309-AUTH-COLD). `lessons.md` is 59 lines.
- **Architecture:** R2-WORKER-TWO-COPIES is now a 3× signal. The bounded dedupe waits for SABA-Q-WORKER-DEPLOYED. No new checkpoint request: three are open and non-blocking, and this round is one bounded fix-up.
- **For root:**
  - ROOT-REQ-VERIFY-WORKER-TESTS should land "before or with the next worker change"; both the gate reviewer and tech-lead ask for it. It is non-blocking, and C's WK-UNIT runs the tests until then.
  - ROOT-REQ-VITEST-PERF-INCLUDE is still open.
- **For Saba (unchanged):** SABA-Q-WORKER-DEPLOYED and SABA-Q-PERF4-STUDIO-CACHE. Deploying the worker is outside the loop.
- **Regression:** due on or after 2026-11-05 (`regression-last.json` 2026-11-02), so the round-311 planning checks the date first. RETRO is at round 320.
- **Commit readiness:** after C PASS and the gate, publish the 3 modified paths and the new doc 226.

## 5. Artifacts (`b-round-309/`)
- **Backups:** `backlog-before-310.json`, `b-next-before-310.json`, `feature-status-before-310.md`, `lessons-before-310.md`, `round-309-task-copy.md`, `head-at-planning.txt`, `git-status-at-planning.txt` (empty), `update-backlog.py`.
- **Sketch** (`sketch/`): `helper-block.js.txt` (plus `-v1`), `sketch-r2-proxy.js.txt`, `sketch-r2-worker.js.txt`, `sketch-r2-proxy.test.mjs.txt` (plus `-v1`), `sketch-tests-on-head.txt`, `sketch-tests-on-v1.txt`, `mutants.py` (plus `-v1`), `sketch-mutants.txt` and `mutant-logs/`.
- **Probe** (`probe/`): `worker-server.mjs` (with op counts and `R2_OOB`), `browser-probe.cjs`, `head-proxy-throw-1440.json`, `sketch-{proxy,alt}-{throw,short}-1440.json`, the `*-server.log` files, `summary.txt` and `v1/`.
- **Claims:** `claims-310.sh`, `claims-310-head-output.txt` and `claims-310-sketch-output.txt`.
- **Frozen list:** `../b-round-309-r310-tree-sha256.txt` (1,182 entries).

## 6. Decision
**CONTINUE.** The scope is not complete. Still open:
- STUDIO-PERFORMANCE: PERF-4d, PERF-4b/4c, PERF-5…15 and PERF-DRAG-PREVIEW;
- STEM-LANES, SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED and the phase-2 entries;
- the deferred Lows and the Saba-owned items.

There are no open Critical or High findings. One Medium (GATE309-M1) is open and scheduled now.

Not BLOCKED: round 310 needs nothing external. Live R2 and the deploy are post-deploy evidence only.
