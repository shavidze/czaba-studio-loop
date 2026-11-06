# B round 368 → 369 planning

**Date:** 2026-11-06 · **Decisions:** D-29z1210…D-29z1217 (`backlog.json` v331 → v334; v334 = the RT-IDS inventory fix after the advisor check: B-R363-PRECHECK-PERFLIB adopted into L30, L58 byte history recorded) · **Advisor:** used (before the work, and at the end).

## 1. Round 368 result (from evidence only)
- `c-round-368.json`: taskStatus PASS, `browserVerified` true, `realVerified` true. 11 rows passed, including INTEGRITY and VALIDATOR at 1440×900 and 1280×720, and G368-AUTH at both viewports. The only blocked item is the fake-bearer 500 that fails closed.
- `gates/gate-round-368.json`: published `29f4b4d` on both remotes. `gates/round-368/verify.log`: 250 files / 3688 tests, lint 205 warnings (0 headroom on the ≤ 205 row).
- **Backlog (D-29z1210):**
  - PERF-9b-ii and SYS-R365-STEM-CACHE-HARDENING are done.
  - Closed: C-R367-DEDUP-CANCELLED-WRITE (Medium), C-R367-STATUS-LINE-PREMATURE, C-R367-MUTANT-DELETE-SKIPS-PENDING-GREEN, A-R367-REVIEW-L-ABF, A-R365-REVIEW-L3…L6 and C-R365-OBS-INTEGRITY.
  - PERF-9's cloud part (9a, 9b-i, 9b-ii) is complete. 9c is awaiting_user and 9d is with root.

## 2. Rulings (D-29z1211)
- **A-R368-REVIEW-L1 is Low**, so it is not a STOP. C-R367 (Medium) was reachable through a StrictMode re-run plus an abort. L1 needs the server to answer 200 → 404 → 200 for one static path inside one write window, which is a deploy race. The effect is one lost cache entry, and the next load restores it. It is the same item as the gate-368 review's Low #2, so it was deduped.
  - It falsifies the claim in `b-round-367/sketch-review.md`; an annotation was appended there.
- Routed to `deferred_low_polish`: A-R368-REVIEW-L3, GATE368-L1-REMOVEFILE-SAME-NAME and GATE368-L3-QUEUED-BUFFER-RETENTION.
- A-R368-REVIEW-L2 and L4 are closed; A fixed them inside the round.
- **Architecture note:** recorded as signal GATE368-ARCH-STEM-CACHE-ADAPTER-SPLIT. The verdict is keep; split only on a fourth change.
- **ARCH-CHECKPOINT-PERF9-STEM-CACHE is now due to root** (`b-round-368/root-request-arch-checkpoint.md`). It is non-blocking.

## 3. Next task: round 369 = RETRO 369 (D-29z1209 order, kept)
**Why RETRO now:**
- `retro_policy.next_due` was round 368, and it slipped one round so the Medium could close first.
- REGRESSION is not due: `regression-last.json` is 2026-11-05, so the next is due on or after 2026-11-08.
- No Critical or High is open. The open Mediums are manual, root-only or awaiting_user.

**What B produced:**
- **`retros/retro-369.md`:** window 353–368.
  - C 13/3/0 and gate 12/4/0.
  - Cost $287.91 (B 60.2 %).
  - All three FAILs are B origin. 357 and 367: the sketch missed a behaviour. 363: a pre-check coverage gap (`perf/lib`).
  - L57 fields are present in 16/16 C JSONs.
- **`lessons.md`:** still 60 lines.
  - L58: reviewed sha = dispatched sha, plus an event × event matrix for ordering contracts.
  - L30: every test root is pre-run.
  - No evidence id was lost.
- **`user-review/screen-review-369.md`:** no new candidates. Rows 138/168/118/144 are unchanged since retro 353. SR-353-4 is a duplicate of SR-290-1/2.
- **Systemic task SYS-R369-STEM-CACHE-WRITE-COORDINATOR** (closes 9 Lows). It runs only if root's architecture checkpoint approves it. Otherwise PERF-11 goes ahead.
- **ROOT-REQ-B-RETRO-CONSULTS:** a proposal to root.
- **Data:** `b-round-368/data/` and `retro-numbers-369.txt`. Claims: `b-round-368/claims-369.sh`; the output is `claims-369-output.txt`, all as expected, with empty stderr.

**Consults (real calls):**
- `tech-lead`: causes, lessons, the systemic task and a cost rule.
- `product-designer`: the screen and journey review on fresh captures, made with the mock API, which B started and then stopped.

**Not available to B this round:** `qa-engineer`, `consequence-tester`, `design-philosopher` and `first-visit-host`, which are not on the consult list. Their opinions were not synthesised.

## 4. Scope and completion
- Nothing was shrunk or deferred without authorization. The full queue is unchanged (`execution_order_d29z1216`).
- **Not COMPLETE:**
  - PERF-11…15, SYS-*, STEM-LANES, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED, the phase-2 entries and `deferred_low_polish` all remain.
  - SRW-21 is deferred by the user.
- **Not BLOCKED:** nothing external is needed for round 369.

## 5. Ready for commit
Round 368 was already published by root (`29f4b4d`). Round 369 changes no `store/` file; only the loop state changes.
