# B — round 364 → 365 planning

Advisor: available and consulted twice: after orientation, and before declaring done. Consults: `performance-optimizer` and `tech-lead` on the PERF-9a design, then `tech-lead` as the sketch reviewer (`code-reviewer` is not on B's list).

## 1. Round 364 result (from C's evidence only)
- `c-round-364.json`: **taskStatus PASS**, browserVerified true, realVerified true. 9 rows passed: CLAIMS, SOURCE-SCOPE, PERF-LIB 40/40, C's own perf-lib mutant (red on DC-KINDS), RB-MEMO 13/13, PERF (264 rows, 95/95, 0 DIFF), BG-RANGE + Insert Marker at both viewports, G364-AUTH, DOCS.
- Blocked: the fake-bearer 500. It fails closed, and it is backend-only in the cloud.
- Gate rows were left to the gate. Gate 364: **published `df4e5b1`** on both remotes. That commit is the baseline for round 365.
- `l57-check` shows nothing absent (C wrote every field).

## 2. Backlog changes (v327 → v328)
- **D-29z1189:**
  - Closed: C-R363-01, C-R363-02, C-R320-01 (with its A-R320-REVIEW-WAVEFORM-NAME-POSITIVE and GATE320-S3 rows) and A-R362-DOC-STALE-MERMAID.
  - **PERF-10 is done** (5 stages).
  - B-R363-PRECHECK-PERFLIB stays a RETRO 368 input.
- **D-29z1190:**
  - Into `deferred_low_polish`: C-R364-01 (doc 168 stale "16"), A-R364-REVIEW-SELECTED-BEFORE and A-R364-REVIEW-MARKER-PRE-DRAG. Their fix home is PERF-9b, which owns doc 168 and the interactions spec.
  - SIG-R363-DRAG-ROW-WRITER stays a signal.
  - **Feature boundary:** the open request `b-round-362/root-request-arch-checkpoint.md` is now actionable for root. B wrote no second request.
- **D-29z1191: the PERF-9 harness decision.** It uses the two same-origin public previews that `/studio-lab` already fetches. A mock-api collection and SRW-21-PLAN were rejected.
  - B's HEAD dev probe: on a warm reopen, middle-east was downloaded again in full (4,054,380 B).
  - New info finding **B-R364-DEMO-DOUBLE-FETCH:** an extra `audio`-initiator entry, not a second loader fetch. The probable source is the `StudioNarrowScreen` `<audio preload="metadata">`; this is not proven.
- **D-29z1192: PERF-9 is split** into 9a (this round), 9b (production perf rows and the throttled ratio), 9c (purchased stems, **awaiting_user**) and 9d (legacy cache and skill doc, **ROOT-REQ-PERF9D-LEGACY-CACHE**, protected files).
  - SABA-Q-PERF4-STUDIO-CACHE now also names PERF-9c.
  - Four plan deviations are recorded: 0 stem *body* bytes; the ratio is measured under a throttle; no `persist()`; path + validator keys.
  - No plan item was dropped.
- **D-29z1193:** the scope of round 365.
- **D-29z1194:** the order (§4).
- Recorded in STUDIO-PERFORMANCE: `consults_round_365`, `harness_decision_d29z1191`, `split_d29z1192` and `plan_deviations_d29z1192`.

## 3. Next task: round 365 = PERF-9a (`current-task.md`)
- **Files:** 8 in total (2 modified, 6 new). The root-lanes clause carries over: COPY-PD or doc-only root commits are allowed HEAD deltas, and doc 236 takes the next free number if it is taken.
  - New: `source-fetch.ts`, `stem-cache.ts` and `stem-cache.client.ts`.
  - Changed: `collection.ts` (purchased; it shares `fetchAndDecodeSource` but never the cache) and `studio-lab-demo.ts`.
  - New tests: `stem-cache.test.ts` (SC1–SC21) and `source-fetch.test.ts` (SF1–SF6).
  - New doc 236.
- **B's sketch** (`b-round-364/sketch.patch.txt` v3, sha in `sketch-dispatched.sha256`):
  - v1 → tech-lead review: 4 Medium + 4 Low fixed in the sketch and 1 Info adopted. A second tech-lead pass on the v1→v2 delta found 2 more Mediums (the sweep could delete in-flight files; a stale entry survived an unstorable 200), both fixed in v3 (`sketch-review.md`).
  - v3: tsc 0, Biome clean, 10 covering files 165/165, full suite in `precheck-full.log` (v1 and v2 runs: 248 files 3647/3647).
  - Browser probe at both viewports (`probe/sketch-cache-*.json` = v3; `probe/v2/` and `probe/sketch-v1-*` kept): cold → 2 entries; reopen → 304 with 0 body bytes, HTTP cache on or off; mp3 blocked → ready from the cache; cleared → cold again.
- **C rows:** CLAIMS, SOURCE-SCOPE, UNIT, C's own mutant, CS-COLD, CS-WARM, CS-AUDIO (real playback from the cache), CS-BLOCKED, CS-CLEAR, CS-LEGACY, ONE-FETCH, SSR, G365-AUTH and DOCS.
- **Mutants:** M1–M12 run by A. B did not run them, because B wrote no unit tests (`record — not run on sketch`).
- **Not applicable:** reference-first, product-designer and the screen budget. This is a performance round and nothing on screen changes.

## 4. Status and order
- No Critical or High is open. The five other open Mediums are tech-lead-manual, awaiting_user or open_root, and none of them blocks.
- REGRESSION is due at any planning on or after 2026-11-08; RETRO is at 368.
- **Order (D-29z1194):** PERF-9a → PERF-9b → REGRESSION (when due) → PERF-11 → PERF-12…15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → the phase-2 entries (skip rule).
- **Commit readiness:** gate 364 already published rounds 363–364. Nothing new is ready to commit until round 365 passes C.

**Archive:** `tasks/round-364.md`.
**Backups:**
- `b-round-364/backlog-before-365.json`
- `b-round-364/feature-status-before-365.md`
- `b-round-364/b-next-before-365.json`

**Scratch:** `/home/runner/b364-scratch` (does not survive the job).
