# B round 308 → 309 planning

**Date:** 2026-11-03 · **Baseline:** gate 308 published `738df73` (both remotes). HEAD `738df73`, clean tree.
**Decisions:** D-29z820…D-29z823 (`backlog.json` v268).
**Advisor:** used twice, before writing and before hand-off.

## 1. Round 308 result (from evidence)
- **C round 308:** PASS. `browserVerified`/`realVerified` true, 10 rows, 0 bugs.
  - CONT-1 and CONT-30: 6/6 valid runs each on a production build, no click.
  - ENDED: passed.
  - NO-CHANGE: 1440 and 1280.
  - PLAY-SMOKE-308: export WAV 16.000 s, peak 0.217.
  - G308-AUTH: both viewports.
  
  B checked `c-round-308.json` against A's report and the gate.
- **Gate 308:** published `738df73`. The review says "COMMIT: OK", and verify ran 3,478 tests.
- **Backlog, evidence-based only:**
  - PERF-COMMIT-RESCHEDULE → `closed_on_evidence_c308`;
  - b-close → done;
  - b → closed (not needed).
- **Findings:**
  - GATE308-L1 and GATE308-S3 → `deferred_low_polish`.
  - GATE308-S2 and A's reviewer Low → note on the PERF-RESCHEDULE-UNUSED-CODE signal.
  - C's INFO notes are recorded. SAME-WHEN and POSCTL become retro candidate RC-R308-SPLICE-PROBE.
  - A's Architecture note repeats A-R307-ARCH-SOURCE-REGISTRY (now 2×).
- `tasks/round-308.md` is archived (a copy, identical to the old `current-task.md`; K16).

## 2. Next task: round 309 = PERF-4a
`current-task.md`. The R2 worker's public routes get:
- ETag → 304;
- single byte ranges → 206, and unsatisfiable ranges → 416;
- `Access-Control-Expose-Headers`.

The change goes into both worker copies with a byte-identical helper block. The protected routes stay frozen.
- **Premise at HEAD**, measured in real Chromium against a Node adapter: no ETag; revalidation and every `<audio>` seek re-download 5,760,044 bytes; Range ignored; an unsatisfiable range returns 200.
- **Sketch:** 304 with 0 bytes; 206 with 1,000 bytes; 416; the seek returns 206 with 975,916 bytes; cover 304. `node --test` 57/57, and all 8 mutants are red.
- **Consults:** performance-optimizer and tech-lead, recorded in the task §0.4. The disagreement on `/studio/` caching is ruled: keep `no-store` and ask Saba.
- **C rows:**
  - WK-BROWSER-PROXY, WK-BROWSER-ALT and WK-HEAD-CONTROL (the server log is the oracle);
  - G309-AUTH on both viewports;
  - WK-UNIT, PROTECTED-UNCHANGED, SOURCE-SCOPE, CLAIMS, TESTS-READ and DOC.
- **Scope kept, not shrunk:**
  - PERF-4b (Studio stem caching / auth outside the URL) is `awaiting_user`. Its client half lives in the protected `studio.$productId.tsx` and goes into SRW-21-PLAN.
  - PERF-4c (immutable versioned keys) is a backend/upload handoff.

## 3. For Saba
- **SABA-Q-PERF4-STUDIO-CACHE:** for purchased Studio stems, choose between:
  - letting the buyer's browser keep them on disk, re-authorized on every reuse, so re-opens are faster;
  - keeping `no-store`, so they re-download on every open and nothing stays on a shared computer.
- **SABA-Q-WORKER-DEPLOYED:** which worker copy is live, `workers/r2-proxy.js` or `cloudflare/r2-worker.js`?
- **Deploy:** deploying the worker is outside the loop. Doc 225 will list the checks to run after deploy (304, a 206 seek in Chrome and Safari).

## 4. For root
- **ROOT-REQ-VERIFY-WORKER-TESTS** (non-blocking): add `node --test workers/r2-proxy.test.mjs` to `npm run verify`. It is not in the gate today (gate-308 `verify.log`: 0 mentions).
- **Still open:** ROOT-REQ-VITEST-PERF-INCLUDE (= GATE304-M1).
- **Checkpoint requests:** ARCH-CHECKPOINT-STUDIO-LINK, D-29z811 and `b-round-306-checkpoint-request.md` are unanswered and non-blocking. No new request: PERF-4a is one bounded server-side change. New architecture signal: R2-WORKER-TWO-COPIES.
- **Commit readiness:** after C PASS and the gate, publish the 3 modified paths and the new doc 225.

## 5. Artifacts (`b-round-308/`)
- **Backups before this planning:**
  - `backlog-before-309.json`, `b-next-before-309.json`, `feature-status-before-309.md`, `lessons-before-309.md`;
  - `round-308-task-copy.md`, `head-at-planning.txt`, `git-status-at-planning.txt` (empty);
  - `update-backlog.py` (one-shot).
- **Probe:** `probe/worker-server.mjs` and `probe/browser-probe.cjs`, with outputs `probe/head-{proxy,alt}-1440.json` and `probe/sketch-{proxy,alt}-1440.json`.
- **Sketch:** `sketch.patch.txt`, `sketch-r2-proxy.js.txt`, `sketch-r2-worker.js.txt`, `sketch-public.sketch.test.mjs.txt` and `sketch-mutants.txt`.
- **Claims:** `claims-309.sh` and `claims-309-head-output.txt`.
- **Frozen list:** `../b-round-308-r309-tree-sha256.txt` (1,181 entries).
- **Lessons:** `lessons.md` is unchanged. No new lesson; the RETRO candidate waits for 320.
- **Regression:** `regression-last.json` is unchanged (2026-11-02, round 301). The next one is due on or after 2026-11-05.

## 6. Decision
CONTINUE. The scope is not complete:
- STUDIO-PERFORMANCE is unfinished: PERF-4a in progress, PERF-4b/4c, PERF-5…15, PERF-DRAG-PREVIEW.
- Still queued: STEM-LANES, SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED and the phase-2 entries.
- Also open: the deferred Lows and the items that wait for Saba.

No Critical, High or Medium finding is open on the Studio. The round is not BLOCKED, because nothing external is missing for 4a.
