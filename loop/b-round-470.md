# B round 470 → 471 planning (2026-11-12)

**Advisor:** available and consulted once after orientation. Its points were applied: archive first, the baseline is `5cd9645` (`context/head-sha.txt` is stale at 9ba13ac), check the date, the C-R470-F1 ruling, the split order, and a test-collision grant.
**Consults:** `product-designer` (`b-round-470/pd-2c.md`).
**Archive:** `tasks/round-470.md` is a copy of the round-470 `current-task.md`.

## Inputs read
- **`c-round-470.md` / `.json`:** PASS. `browserVerified` and `realVerified` are true. The fake-bearer path is BLOCKED (backend unavailable in cloud).
- **`a-round-470.md`:** implemented as dispatched; code-reviewer 9/10, with no architecture signals.
- **`gates/gate-round-470.json`:** published, commit `5cd9645`, pushed to both remotes. `gates/round-470/review.md`: COMMIT OK 9/10.
- **`regression-last.json`:** 2026-11-10, so not due until 2026-11-13. `date -u` = 2026-11-12.
- **`lessons.md`:** 60 lines, unchanged this planning.

## Backlog updates (from C's evidence only)
- **D-29z1656: round 470 → `c_pass_published`.**
  - C-R469-01 is closed (C6b/C6c PASS, mutant red).
  - SABA-B-15 is "home cause fixed in cloud". It is **not done**: it stays open until TLM-R468-SABA-SCROLL-DEVICE (RETRO 480 deadline).
- **D-29z1657: C-R470-F1 ruling.** C asked for it. "Cluster" = ≥ 2 slow frames in one band in one pass, recurring in ≥ 2 passes. C2 PASS stands. C-R470-F1 goes to `deferred_low_polish` (Low, pre-existing). REG-SCROLL-HOME-FRAMES now carries the p95 control and this wording.
- **Signals, not tasks:**
  - SIG-R470-GLOWORB (gate review Architecture note);
  - SIG-R470-BLUR-GUARD-NAMED (gate suggestion 1);
  - SIG-R470-GRADIENT-V3-NAME (A's reviewer info).
- **Root request:** ROOT-REQ-ACTIVE-VIEW-STORE-REDESIGN. `context/active-backlog.json` lists STORE-REDESIGN as `done`, but `backlog.json` has it `in_progress` with 2c–5 not started. B planned from `backlog.json`.
- **Saba question:** SABA-Q-LEGACY-STUDIO-FONT (`awaiting_user`), in `user-review/questions-round-470.md` Q1.

## Next scope choice
- **Order** (current-task round 470 §4, backlog D-29z1651): REGRESSION-2026-11-13 only from a planning dated 2026-11-13. Otherwise STORE-2c, then 2d, then STORE-3…5. No open Critical or High findings. The open Mediums are root, manual or Saba items, and they do not block (2026-10-23 class). SABA-B-16 is the DP-GATE's input (root).
- **STORE-2c no longer needs root.** PERF-7 (round 316) self-hosts every face, and `root.tsx` already links `fonts.css`. The old "needs root.tsx" note is corrected in `feature-status.md` §7.
- **D-29z1658: split into 2c-1…2c-4.** The scope is unchanged. Facts that set the order:
  - Instrument Sans ships 400/500/600 only, and Plex Mono ships 400 only [K9].
  - HEAD's FN4 collides with any token swap (L23). It is granted and rewritten in the sketch, and a new FN6 guards the swap. The mutant (HEAD's `app.css`) turns FN4 and FN6 red.
- **product-designer:**
  - 2c-1 may publish alone, with `--font-mono` included.
  - 2c-2 must land within 3 rounds.
  - Rejected: family plus scale in one round; keeping Playfair.
  - Legacy `/studio/<handle>` inherits through the cascade, and accepting that is the default. It went to Saba once (L44).

## Sketch and measurements (L58)
- `b-round-470/sketch-471.patch.txt`: `app.css` gets 3 changed lines and 1 added line; `self-hosted-fonts.test.ts` gets FN4 and FN6.
- Production builds of HEAD and the sketch served on :3481 and :3482. `type-probe.cjs` ran on 8 pages × 3 viewports. Results:
  - 0 horizontal overflow;
  - fonts requested: `instrument-sans-latin` and `ibm-plex-mono-latin`, all 200, and no Inter or Playfair;
  - the h1 platform font is Instrument Sans on 24/24;
  - one wrap change: `/about` at 375, +48 px (R-471-2).
- Claims: `claims-471.sh` → `claims-471-planning-output.txt`, 0 MISSING.

## Dispatch
**Round 471 = STORE-2c-1** (D-29z1659), in `current-task.md`:
- Grants: `app/styles/app.css` (typography lines plus the body rule), `self-hosted-fonts.test.ts` (FN4 and FN6), and the new doc 306.
- C rows C1–C14: computed fonts, network, overflow and boxes, keep-list, faked bold, glyphs, `/studio-lab`, legacy route, journey, unit plus mutant, scope, doc, auth, claims.

## Architecture checkpoint
Not requested. This is a one-file CSS token change. There is no repeated structural risk on one owner (gate 470: "Architecture note: none").

## Commit readiness
Round 470 is already published by root (`5cd9645`). Nothing else from B is pending publication.
- Scratch HEAD/sketch trees were removed after the measurements. They can be rebuilt with `git archive 5cd9645` plus `sketch-471.patch.txt`; the logs and the probe JSON are kept.

## Second advisor pass (before hand-off) and what changed
The advisor was consulted a second time, before finishing. Its points were applied:
- **Wider probe.** `b-round-470/type-probe2.cjs` measures every visible text element (with line counts), CLS and a long product title. `glyph-and-crops.cjs` reads platform fonts after `document.fonts.ready`. Both ran on fresh production builds of HEAD and the sketch, which were removed afterwards.
- **D-29z1660 rulings:**
  - R-471-2 is now a reflow rule: paragraphs may reflow, and exactly three line growths are accepted at 375 px.
  - CLS < 0.1 (sketch max 0.0216, HEAD max 0.0221).
  - Glyphs: Georgian renders in Noto Sans Georgian, and at most 2 arrow glyphs fall to a system font.
  - The 2c-2 cap counts feature rounds only; regression and fix-up rounds do not count.
- **Grants** for round 471 are recorded in `narrow_grants`: `app.css` and the self-hosted-fonts test.
- **C rows corrected.**
  - C2's HEAD control: HEAD requests no Playfair on `/studio/middle-east`.
  - C1's mono claim is now K12.
  - New C3b (CLS) and C3c (long title).
  - C4 now covers the `/store` cards.
  - C6 is written from the measured glyph output (K16).
- **Backlog check.** A deep-compare against `backlog-before-471.json` shows that only the touched keys differ and no keys are duplicated. The `advisor_used_by_B` history, overwritten by mistake, is restored, with the new note prepended.
- **Claims.** `claims-471.sh` has K15 and K16; it was re-run and the output is stable.
