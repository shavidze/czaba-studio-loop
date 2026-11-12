# B round 458 → 459 planning (2026-11-12)

**Decision: CONTINUE.** Round 459 is SABA-B-13 (STORE-2b-ENTRANCE), a user-visible Store fix (Medium, seen by Saba).

## Inputs read
- **Context:** `context/active-summary.md` and the needed `active-backlog`/`backlog.json` ids (grep only).
- **Round 458:** `current-task.md` (archived as `tasks/round-458.md`, `cmp` OK), `a-round-458.md`, `c-round-458.md` and `c-round-458.json`.
- **Gate 458:** `gates/gate-round-458.json` is `published` at `891dc0f`, so that is the baseline for round 459. `gates/round-458/review.md`: COMMIT OK 8/10, Lows only, plus an Architecture note.
- **Other loop files:**
  - `regression-last.json`: next due on or after 2026-11-13, so not this planning.
  - `lessons.md`, the B part.
  - `root-pre-push-review.md` and `publication-checkpoint.json` date from 2026-10-07 and hold nothing new.
- **Advisor:** available, consulted after orientation; its points were applied.

## Round 458 outcome (from independent evidence only)
- **C PASS** on C1–C10, with `browserVerified` and `realVerified` true. Gate 458 published `891dc0f`.
- **Done (D-29z1624):**
  - STORE-2b-3c-2a;
  - the Mediums A-R457-REVIEW-M1, A-R456-REVIEW-M1 and A-R454-REVIEW-M-DEAD-UNCHECKED;
  - the riders TL-R454-L-BRACE-PREFIX-HEADER, A-R454-REVIEW-L3/L4, A-R453-REVIEW-L-GS-TEST-GAPS and B-R455-DOC298-STATUS-LINE.
- **C-R458-L1** confirms TL-R458-L1, so it is recorded as `confirmedBy` on that id (L7). **C-R458-L2** goes to `deferred_low_polish`.
- **Gate reviewer Lows:** GATE458-L1..L3 and I4 are deferred. Item 5 is recorded as `confirmedBy_gate458` on TL-R455-WALKER-LIMITS.
- **Architecture notes** from the gate reviewer and A's reviewer become the signal **SIG-R458-STYLE-SCAN-SPLIT**. It is not scheduled: extract only when 2b-3c-2b adds forms. It feeds the pending, non-blocking ARCH-CHECKPOINT-STYLE-SCAN.

## What B did for round 459
1. **Measured HEAD on a production build** (Chromium, mock API; `b-round-458/probe/`).
   - The page paints 140–380 ms before the overlay, which is the "flash".
   - The logo is legible for 433–446 ms and the tagline for 138–172 ms.
2. **Tried a route-local cover first.** It still showed the header for about 45 ms, because `PageTransition` server-renders `opacity: 0`.
   - The result is a head cover, which needs a narrow `root.tsx` grant (2 lines; precedent D-29z166).
3. **`product-designer` consult** (`pd-consult.md`):
   - the clock starts at the first painted cover frame;
   - 1450 ms minimum and a 1000 ms failsafe;
   - skip before hydration;
   - reduced motion unchanged.

   Three Saba questions are recorded as `awaiting_user`, each with its default (SABA-Q-ENTRANCE-WORDMARK, ARRIVE, HERO).
4. **Reference:** the official Android SplashScreen page. The deviation is the minimum longer than 1000 ms, which is Saba's decision. Saba's Ableton/Logic/Splice claim is quoted as his statement, unsourced.
5. **Sketch, reviewed by `tech-lead`:**
   - Review 1 was REQUEST CHANGES. The High: the cap was broken at 4× CPU. The Medium: an SSR `useLayoutEffect` warning.
   - Both were fixed, plus the Lows and a click race that B's own probe found.
   - Review 2 is APPROVE on sha `f499b724`.
6. **Pre-checks on the dispatched sketch:**
   - covering 11 files / 201 tests;
   - full suite 284 files / 4171 tests, rc 0;
   - tsc rc 0;
   - lint 207 (HEAD 205);
   - e2e smoke 2/2;
   - production build rc 0;
   - mutants BASE green and M1–M19 red;
   - a 40-run frame matrix on HEAD and the sketch (both viewports, CPU 1× and 4×, 10 modes);
   - dev console: 0 hydration warnings when warm.
7. **Claims K1–K20:** the planning output and the expected after-A output (from a clean clone, patch plus placeholder doc). They differ in exactly K2, K3, K4, K6, K8 and K9, and both stderr files are empty.
8. **Lesson:** L18 gains the "first painted frame" clause. The file stays at 60 lines; `lessons-before-459.md` is kept.
9. **Records:**
   - backlog v450 → v451 (`update-backlog-459.py`, D-29z1624/D-29z1625), keeping the original JSON format;
   - `feature-status.md` updated;
   - Saba's questions file gets an addendum ("verify in a fresh tab").

## Why not COMPLETE or BLOCKED
- **Not COMPLETE:**
  - SABA-B-13 is not yet verified by C;
  - STORE-REDESIGN (2b-3c-2b … STORE-5), DP-GATE, ARCH-SPLIT, REVIEW-RECOMMENDATIONS, T12-ADVANCED, STEM-LANES and the phase-2 entries remain;
  - open Medium findings exist;
  - `deferred_low_polish` must be cleared before final acceptance.
- **Not BLOCKED:** nothing external is needed. The Saba questions have defaults and do not block.

## Architecture checkpoint
- **No new request.** The pending, non-blocking ARCH-CHECKPOINT-STYLE-SCAN (with the round-457 addendum) covers the style-scan owner.
- **The new `root.tsx` head component** is a one-element narrow grant, not a structural risk.

## Ready for commit?
- **Round 458:** already published by root (`891dc0f`).
- **Round 459:** nothing until C PASS and the root gate.

## Next after round 459
1. REGRESSION-2026-11-13: due when round 460 is planned on or after 11-13.
2. Then 2b-3c-2b, 2b-3d, 2b-4 and STORE-2c…5.
3. DP-GATE (root).
4. ARCH-SPLIT, REVIEW-RECOMMENDATIONS and T12-ADVANCED, then phase 2.
5. RETRO at round 465.
