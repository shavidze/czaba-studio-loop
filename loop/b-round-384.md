# B round 384 → 385 planning (2026-11-07)

## Inputs read
`context/active-summary.md`, `current-task.md` (archived as `tasks/round-384.md`, cmp equal), `a-round-384.md`, `c-round-384.md`/`.json`, `gates/gate-round-384.json` (published `7295618`; baseline for round 385), `gates/round-384/review.md`, `regression-last.json` (2026-11-05 → not due until 2026-11-08), `lessons.md`. Root files `root-pre-push-review.md` and `publication-checkpoint.json` date from 2026-10-07 and carry nothing new (D-29z1292).

## Acceptance (only from C's evidence)
- **Round 384: C PASS.** 13 rows, `browserVerified` true, `realVerified` true, 0 bugs. Gate 384 published `7295618`.
- **PERF-13b-i → done.** Closed findings:
  - C-R382-01, on `c-round-384/heap-prod-1440.json`, `heap-prod-1280x720.json` and `perfres.log`;
  - B-R383-AUTH-ROW-BARE-URL, on G384-AUTH (401);
  - TL-R376-M1, a stale-open entry: it was fixed and passed in round 377 (`c-round-377.json` FL11).

  The fake-bearer row stays open as backend-blocked evidence (D-29z1285, D-29z1286).
- **Gate-384 review routed:**
  - suggestion 1 → **GATE384-M1-ENSURE-DECODED-UNHANDLED-REJECTION (Medium)**, scheduled for round 386;
  - L2 is a round-386 candidate (same function); L3 and L4 → `deferred_low_polish`;
  - the architecture note → SIG-R384-USE-DECODED-SOURCES-HOOK (a signal only).

## Round 385 = RETRO 385 (window 369–384)
- **Why now:** `retro_policy.next_due` was round 384. The regression is not due yet. GATE384-M1 is not a security or data-loss bug, and a RETRO round changes no code, so the Medium is fixed in round 386, before the regression (D-29z1287, D-29z1291).
- **Outputs:**
  - `retros/retro-385.md`;
  - `lessons.md` (60 lines; l.3, L29, L31, L58 and L59 each gain a clause);
  - `user-review/screen-review-385.md` (no new candidates; one question, Q-SR-385-1);
  - `user-review/questions-arch-leaf-plumbing.md` (L46);
  - the data in `b-round-384/data/`.
- **Consults (really called):** `tech-lead` for the retro and `product-designer` for the screen and journey. The advisor was available and used. `consequence-tester`, `qa-engineer`, `design-philosopher` and `first-visit-host` are not on B's list and were not called.
- **Headline:**
  - C: 13 PASS / 1 FAIL / 2 BLOCKED;
  - gate: 12 published / 4 skipped / 0 failed;
  - cost $320.36; B median $12.505 (stop line $13.94);
  - the screen is unchanged since 369.
- **Dispositions:**
  - ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING → Saba. PERF-11c-iii-d/e hold. If there is no answer by RETRO 400, the default is SYS-R385-LEAF-ACTIONS-CONTEXT, which closes 8 Lows.
  - SYS-R369 gets the same RETRO 400 default.
  - ROOT-REQ-L57-CHECK-PROGRESS → root.

## Architecture checkpoint
A frontend-architect checkpoint is already requested and overdue: ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING, plus the decode-region request at `b-round-383/root-request-arch-checkpoint-decode-region.md`. The question now also goes to Saba. Core PERF-13 work does not wait for it.

## Backlog
- **v350 → v352:** `update-backlog-part1.py` and `part2.py`. Decisions D-29z1285…D-29z1292.
- **`feature-status.md`:** updated.
- **Claims:** `b-round-384/claims-385.sh` → `claims-385-output.txt`, 0 MISSING.
- **Frozen:** `b-round-384/r385-tree-sha256.txt`, 1,280 entries, rc 0; protected rc 0.

## Commit readiness
- No source changes this round, so nothing to publish.
- The stable stage is PERF-13b-i, already published by root at `7295618`.
- Open: GATE384-M1 (round 386). The Tech Lead manual Mediums are unchanged.

## Not COMPLETE
- STUDIO-PERFORMANCE stages 13b-ii…15 remain, along with STEM-LANES, SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED, the phase-2 entries (skip rule) and the deferred Lows.
- No external blocker stops the loop.
