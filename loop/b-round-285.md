# B round 285 → 286 planning

**Date:** 2026-10-31. **Baseline:** gate 285 `published`, commit `60bfb38` (both remotes); store tree clean. **Advisor:** available and consulted (1 call before writing, 1 at completion). **Consult:** `product-designer` (FIX-PD-1a unknown-price state).

## 1. Round 285 result (evidence only from C)
- `c-round-285.json`: **PASS**, `browserVerified: true`, `realVerified: true`, 14 rows passed, 0 bugs, gate rows not claimed. One backend sub-item (real backend 401/403 for a forged bearer) is BLOCKED: backend unavailable in cloud.
- **PERF-3b → მზადაა** (D-29z690): the seconds ruler went from 6143 elements to 94 at 1440 and 78 at 1280; 28/28 ruler pixels are identical to HEAD; Follow flips show no gap (the W7 control shows it).
- **B-R284-FOLLOW-FLIP-GAP → closed.**
- **A-R285-REVIEW-NAN-PAGE** (Low, not reproducible in the browser) → `deferred_low_polish` (D-29z691).
- **ZOOM-TIMING note on PERF-3c:** out-path key 8 takes 88 ms. PERF-3c's exit decision must measure it.

## 2. Saba's 2026-10-31 decisions: recorded now (L42)
The PD-REVIEW decisions first appeared in this planning's prompt; they were absent from the round 283 and 284 prompts. They are recorded in this planning:
- **New queue entry `PD-REVIEW-2026-10-31`** (D-29z692), placed before STUDIO-PERFORMANCE in `post_current_stage_queue`. Its stages:

  | Stage | Scope |
  |---|---|
  | FIX-PD-1a | F9 |
  | FIX-PD-1b | F7 + SR-230-6 |
  | FIX-PD-1c | F8 |
  | STUDIO-LINK | — |
  | NAME-AND-HINT | — |
  | STEM-LANES | after STUDIO-PERFORMANCE, before SYS-1..3 |
  | SRW-21-PLAN | plan doc only, parallel |
  | COPY-PD | after STORE-5 or in REVIEW-RECOMMENDATIONS |
  | SR-BEHAVIOUR | SR-230-9, SR-260-5 |

  The entry also records Saba's Q1–Q5, the acceptance additions to STORE-2b/3/4 (F3, F4, F5, F6, F10, F1) and the RETRO journey review.
- **FIX-PD-1 is split into 1a/1b/1c.** The round rule allows one feature or at most 3 *tightly related* bugs. F9 is Store purchase code, F7 is Studio demo data plus a library heading, and F8 is a Studio route state. Nothing is dropped.
- **SR candidates** (D-29z693):
  - endorse/modify → COPY-PD, FIX-PD-1b, SR-BEHAVIOUR or `deferred_low_polish`;
  - drop → `wontfix (Saba 2026-10-31)`;
  - SR-245-2 is closed as info;
  - SR-275-4/6/8/Q1/Q2 stay `awaiting_user`; the review does not name them.
- **F12** → four Lows `PD-F12-*` in `deferred_low_polish`.
- **SRW-21** stays `deferred_user` for the protected mount; the Q1 note is added.
- **Lessons (D-29z698):**
  - **L54** (test the journey, not just the screen) and **L55** (check the product promise against the model) are added. The policy calls them L47/L48, but those ids are taken.
  - **L21 is merged into L20**, a RETRO-275 deferred candidate. The file stays at 60 lines.
- **LIVE-MEAS-STEM-DROP** is already in `user-review/live-checks.md` (written by root), so it is not duplicated.

## 3. Next task: round 286 = FIX-PD-1a (F9, Medium)
- **Why now:**
  - Saba placed FIX-PD-1 "next, between PERF tasks"; the bug gate fixes Medium findings first;
  - PERF-3b has just closed, so this is a clean point between PERF tasks;
  - no Critical or High finding is open;
  - REGRESSION is not due (the last one was 2026-10-30; due on/after 2026-11-02);
  - RETRO is at round 290.
- **Reproduced on HEAD `60bfb38`** in Chromium at both viewports (`b-round-285/probe/head-f9.json` and screenshots): `/products/door-slams` shows `$0.00USD` with enabled Buy Now and Add to Cart, while its card shows $9.
- **The design:**
  - two pure helpers in `product-utils.ts` (`createDisplayVersions` is untouched);
  - an unknown price flows as `undefined`, never as 0 (0 stays the existing "free" state);
  - the unknown-price state per `product-designer`: "Price unavailable", `aria-disabled` buttons that do nothing, and a visible reason line linking to `/support`;
  - the neighbour fix: the Sidebar shows "Complimentary Download" only for an explicit 0.
- **Rejected:**
  - inventing an SFX variant (it breaks the pinned test);
  - collapsing an unknown price to 0;
  - a contact-only panel (it contradicts Saba's "Buy disabled with a reason");
  - the designer's "isn't open yet" copy (its cause is unknown from the data).
- **The browser contract:**
  - the product page is SSR-loaded, so C runs its own scratch copy of the mock with a priceless fixture;
  - `mock-api/server.mjs` is not edited;
  - signed-in and owner states are unit-only (BLOCKED in the browser: backend unavailable in cloud).
- **Purchase protection:** the cart, checkout, auth and protected Studio routes are frozen. With a known price, the cart call arguments are unchanged (PU6, B-REGRESS). The G286-AUTH row is kept.
- **Not a pure-perf round:** a reference section (no Store reference found; recorded), the `product-designer` rows and an L54 journey row (card price = page price for all 7 active fixtures) apply.
- **Signal:** `PD-FREE-HEADER` (info). The UX for a free product (explicit 0) is undefined; it goes to STORE-4.

## 4. Order after 286
1. FIX-PD-1b
2. FIX-PD-1c
3. STUDIO-LINK
4. NAME-AND-HINT
5. PERF-3c
6. The rest of STUDIO-PERFORMANCE
7. STEM-LANES
8. SYS-1..3
9. STORE-2b..5 (the direction gate)
10. COPY-PD and REVIEW-RECOMMENDATIONS
11. SR-BEHAVIOUR
12. T12-ADVANCED
13. The phase-2 entries

REGRESSION (on or after 2026-11-02) and RETRO-290 take precedence when they fall due.

## 5. Architecture checkpoint
None requested. This is a small Store fix-up on one owner; no feature boundary and no accumulated structural risk.

## 6. Ready for commit
Nothing new from B. Round 285 is already published (`60bfb38`). Changed loop files:
- `backlog.json`
- `feature-status.md`
- `lessons.md`
- `current-task.md`
- `tasks/round-285.md` (archive)
- `b-round-285/`
- `b-next.json`
