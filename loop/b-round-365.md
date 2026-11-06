# B — round 365 → 366 planning

Advisor: available and consulted twice: after orientation, and before declaring done. Consults: `performance-optimizer` (row design, throttle, headers) and `tech-lead` (sketch review); both read-only.

## 1. Round 365 result (from C's evidence only)
- `c-round-365.json`: **taskStatus PASS**, browserVerified true, realVerified true. Passed: CLAIMS (K11 12 vs 10 noted), SOURCE-SCOPE, UNIT 12 files 194/194, C's two own mutants (red on SC6 and SC3), CS-COLD/WARM/BLOCKED/CLEAR at 1440×900 and 1280×720, CS-AUDIO (same clip width, playhead advances, analyser signal, export WAV sha256 identical for cold, warm and blocked), CS-LEGACY, ONE-FETCH, G365-AUTH at both viewports, DOCS.
- Blocked (not claimed): the SSR dev-log half (server stdout unreadable) and the fake-bearer 500 (fails closed, backend-only).
- Gate 365: **published `413218e`** on both remotes. That commit is the baseline for round 366.
- **PERF-9a is done** (მზადაა). Doc 236 stays "stage 1 of 2" at HEAD until 9b-i rewrites it.

## 2. Rulings and backlog changes (v328 → v329)
- **D-29z1195 (A STOPs, L10):** K11 final = 12 accepted (C-R365-INFO-01 closed). Sweep error is ignored: task 365 l.127 wins over the l.143 listing (C-R365-INFO-02 closed; B spec error, no code change). The SSR dev-log half is dropped from future rows (BLOCKED twice). RETRO 368 input: B-R365-COUNT-CLAIM-PLANNING-VS-FINAL.
- **D-29z1196:** A-R365-REVIEW-L3…L6 and C-R365-OBS-INTEGRITY → `deferred_low_polish`, closed together by the systemic task **SYS-R365-STEM-CACHE-HARDENING (= PERF-9b-ii)**: one file, one root cause (storage write and commit discipline).
- **D-29z1197:** PERF-9b split into 9b-i (perf rows, round 366) and 9b-ii (hardening). The stem rows are documented in doc 236, not doc 168; C-R364-01, A-R364-REVIEW-SELECTED-BEFORE and A-R364-REVIEW-MARKER-PRE-DRAG are re-routed to the next task that owns the interactions spec / doc 168, else the polish pass. Plan scope is unchanged: every PERF-9 plan item still has a stage.
- **D-29z1198 (production pre-check):** see §3. New info findings B-R365-DEVTOOLS-NOCACHE-200 and B-R365-HARNESS-HOST-HEADERS; root question ROOT-Q-R365-VERCEL-STATIC-HEADERS (non-blocking); candidate stage PERF-CAND-STEM-BACKGROUND-REVALIDATE (Low, not scheduled). B-R364-DEMO-DOUBLE-FETCH updated (seen in production: a Media request, `Range: bytes=0-`, 206, aborted after about 130 KB).
- **D-29z1199:** the scope of round 366. **D-29z1200:** the order (§5).
- Recorded in STUDIO-PERFORMANCE: `split_d29z1197` on PERF-9, `consults_round_366`, `execution_order_d29z1200`.

## 3. B's production pre-check (scratch `git archive 413218e`, `/home/runner/b365-scratch`, does not survive the job)
- The harness host (remix-serve) serves both previews with `Cache-Control: public, max-age=31536000, immutable` and a weak size+mtime ETag that changes on every build (`curl -sI` at planning; `perf-sketch/headers-prod.json`).
- **DevTools cache-disabled mode → 200 full body** (Chromium adds `Cache-Control: no-cache`; express `fresh` ignores `If-None-Match`). First sketch run measured exactly that (`perf-sketch/run1.log`). Real reopen paths (HTTP cache evicted or kept) get 304. So the harness's primary warm scenario is `Network.clearBrowserCache`, and the DevTools case is record only.
- Under the CDP throttle (40 ms, 1,250,000 B/s down): cold ready ~7.42 s, warm (evicted) ~1.28 s, ratio 0.166–0.177 over 12 samples; loaded replicate 0.220–0.252; warm network body 0, 2 × 304.
- Production is **Vercel** (`vercel.json`), so the immutable/mtime headers are a harness-host fact only. performance-optimizer rated them Medium *if* they were production; that premise does not hold. Vercel's headers were not measured.
- A false alarm during the pre-check (cache seemingly not storing) came from probing a server still running the last mutant build; resolved by rebuilding; not recorded as a finding.

## 4. Next task: round 366 = PERF-9b-i (`current-task.md`)
- **Files (3):** new `perf/studio-lab-stem-cache.perf.spec.ts` and `perf/budgets.stem-cache.json` (B's sketch v3 verbatim, `b-round-365/sketch.patch.txt`, sha in `sketch-dispatched.sha256`), and doc 236 (l.4 `In Progress (stage 2 of 3; C round 366 PASS)` + stage-2 content). No `app/`, `perf/lib/` or existing spec/budgets change.
- **7 asserts**, each red under a mutant run by B on the production build: cold-body-live (counter-zero), cold.entries-stored, warm.body-bytes 0, warm.status-304 2, warm-ready-ratio ≤ 0.5, blocked.ready, blocked.entries (cache-off). 39 record rows.
- **Sketch history:** v1 (cache-disabled warm, wrong scenario) → v2 (evicted cache, network body bytes) → v3 (performance-optimizer additions + tech-lead fixes) → v4 (4 plain-fetch byte record rows re-kinded to wallclock after the final advisor check; `sketch-review.md`). v3/v4: typecheck 0, Biome clean on an `app/` copy, run-v3 and run-v4 PASS, both mutants as designed on v3 (same spec as v4).
- **C rows:** CLAIMS, SOURCE-SCOPE, PERF (production, 1440×900), C's own mutant, PROBE at 1440×900 and 1280×720 (B's `probe/stem-prod-probe.mjs` on a production server C starts), AUDIO (real playback from the cache on the production build), G366-AUTH, DOCS.
- **Not applicable:** reference-first, product-designer, screen budget (performance harness; nothing on screen changes).

## 5. Status and order
- No Critical or High is open. The five open Mediums are tech-lead-manual, awaiting_user or open_root; none blocks.
- REGRESSION is due at any planning on or after 2026-11-08 (`regression-last.json` = 2026-11-05); RETRO at 368.
- **Order (D-29z1200):** 366 PERF-9b-i → REGRESSION if the round-367 planning is on or after 2026-11-08, else PERF-9b-ii → RETRO 368 → PERF-9b-ii if not yet run → PERF-11 → PERF-12…15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase-2 entries (skip rule). PERF-9c awaiting_user; PERF-9d root.
- **Architecture:** no new checkpoint request; `b-round-362/root-request-arch-checkpoint.md` stays with root (PERF-10 closed that boundary). Round 365's architecture notes (keep `stem-cache.client.ts` as one owner; Cache Storage API as a later alternative) are recorded as signals in `a-round-365.md`, not scheduled.
- **For root:** ROOT-Q-R365-VERCEL-STATIC-HEADERS (non-blocking question). **Commit readiness:** gate 365 already published round 365; nothing new is ready until round 366 passes C.

**Archive:** `tasks/round-365.md`.
**Backups:** `b-round-365/backlog-before-366.json`, `b-round-365/feature-status-before-366.md`, `b-round-365/b-next-before-366.json`.
**Claims:** `b-round-365/claims-366.sh`, outputs `claims-366-planning-output.txt` (HEAD) and `claims-366-sketch-output.txt` (scratch).
