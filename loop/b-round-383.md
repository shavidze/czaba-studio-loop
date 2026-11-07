# B round 383 → 384 planning

**Date:** 2026-11-07 · **Backlog:** v349 → v350 · **Decisions:** D-29z1280 … D-29z1284 · **Next task:** `current-task.md` (round 384, finishing PERF-13b-i's checks) · **Archive:** `tasks/round-383.md` (byte-equal copy, checked with `cmp`) · **Baseline:** HEAD `5745526`. `gates/gate-round-383.json` is `skipped` (C taskStatus BLOCKED), so there is no new published commit.

## 1. Round 383 result (D-29z1280)
- **C BLOCKED (incomplete):** 0 bugs. `browserVerified` and `realVerified` are false.
- **What passed in round 383:**
  - SOURCE-SCOPE and SWEEP;
  - the decoded-buffer unit tests, 23/23;
  - the dev heap at 1440: live `[2,5,16,16,16,16,16]`, 0 `baseQueue` paths;
  - HEAP-MUTANT (red);
  - EVICT and EVICT-B2 at both viewports;
  - EXPORT: the sha matches;
  - the browser part of auth;
  - DOCS.
- **Not run (time):**
  - the production heap and PERF-RES;
  - PLAY-REFUSE;
  - the unit mutants;
  - the covering tests, C-DEMO and the perf lib;
  - the 1280 live list, CLAIMS and L57.
- **Not marked done:** PERF-13b-i. It is მოწმდება.
- **The rows that passed carry over:**
  - `r383-frozen` is still rc 0;
  - the new `r384-frozen` manifest (1,279 entries, every file except the one grant) is rc 0.
- **Process gaps (RETRO inputs):**
  - C-R383-L59-EARLY-STOP: C had no `progress.json`, no L57 fields and no named stop signal.
  - C-R382-AUTH-CLAIM-MISMATCH: see §2.

## 2. Rulings
| Item | Ruling |
|---|---|
| C-R382-02 (Medium) | **Closed (D-29z1281)** on C's own `c-round-383/b2.json`, at both viewports. With the library Stop the buffer is released, Add makes it live, Undo removes it and Redo restores it. With the transport Stop the buffer stays live, which matches HEAD. The `stop()` count is only corroboration (row 10) |
| C-R382-01 (Medium) | Stays open, `fixed_pending_C`. The dev evidence is good. It closes on the production heap row plus PERF-RES in round 384 |
| Token API 400 vs 401 | **Test-step issue (D-29z1282).** The route validates `product`/`file` (400, l.19) before Authorization (401, l.23). C's `auth.mjs` used the bare URL in rounds 382 and 383 (both `auth.json` files show 400), yet round 382's report said "401 verified". So the 401 branch is **not yet browser-verified**; G384-AUTH uses valid parameters. Recorded as B-R383-AUTH-ROW-BARE-URL (Low, process). Not a bypass, and the product does not change |
| code-reviewer L1 (a stale `ensureDecoded` across a collection change) | A-R383-REVIEW-L1-STALE-ENSURE-DECODED, Low, assigned to the PERF-13b-ii scope (D-29z1283). It is not reachable today |
| Architecture note (extract source-load orchestration, or use `useReducer`) | SIG-R383-SOURCE-LOAD-ORCHESTRATION, joined to ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING. Rounds 381–383 changed the same region, so this is accumulated risk on one owner. B wrote a bounded root request, `b-round-383/root-request-arch-checkpoint-decode-region.md` (ARCH-CHECKPOINT-DECODE-REGION). It is wanted before PERF-13b-ii and does not block |
| RETRO cadence | Due by count (last 369, window 353–368). Closing the open Medium comes first (bug gate). Order (D-29z1284): round 384 → REGRESSION-2026-11-08 → RETRO → PERF-13b-ii. The deadlines tied to "RETRO 384" move to that RETRO round |

## 3. Next round
- **Round 384 is verification only** for PERF-13b-i: 12 C rows ordered by weight of evidence, with the production build made once.
- **A changes only doc 248 l.4**, to "C round 384 PASS" (L28). The grant is `b-round-383/grants-384.txt`.
- **No new scope.** REGRESSION is not due today (2026-11-07; the last run was 2026-11-05).
- **Claims:** `b-round-383/claims-384.sh`, with its output saved; 0 `MISSING`.

## 4. Status and completion
- **Decision: CONTINUE.**
- **Why not COMPLETE:**
  - PERF-13b-i is unverified, and C-R382-01 is open;
  - 13b-ii, 13c, 13d, 14 and 15 remain, as do 12b and 11b (awaiting_user), 11c-iii-d/e, 9c/d, 4b/c and DRAG-PREVIEW;
  - STEM-LANES, SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS and T12-ADVANCED;
  - the phase-2 entries;
  - `deferred_low_polish`.
- **Not BLOCKED:** nothing external is needed.
- **Purchase protection:** the protected sha is rc 0, and `/studio/middle-east` shows "Sign in required" with 0 audio sources. The 401 branch is re-checked in round 384.
- **Anonymous workspace:** `/studio-lab` opens with `auth_user` null (C round 383, both viewports).
- **Commit readiness:** nothing is ready. Rounds 382, 383 and 384 publish together after a C PASS.

## 5. Advisor and agents
- **Advisor:** available and consulted before writing. It confirmed:
  - a C-only completion round with a doc-only change for A;
  - ordering the rows by weight of evidence;
  - the auth URL finding, including the round-382 report mismatch;
  - closing C-R382-02 on C's evidence;
  - the L1 ruling and the RETRO D-ID.

  A final review follows.
- **Project agents:** none consulted. This is verification only; nothing is designed or measured anew.
