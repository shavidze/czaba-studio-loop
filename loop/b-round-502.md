# B round 502 → 503 planning (2026-11-14)

**Decision:** CONTINUE. **Next task:** round 503 = DPG-BUTTON-CLEANUP-2 stage 2b-3 (`current-task.md`).
**Advisor:** available; consulted after orientation and at the closing check.
**Archive:** `tasks/round-502.md` is a byte-identical copy of the round-502 task (`cmp` rc 0). The pre-planning copies of `current-task.md`, `backlog.json`, `feature-status.md` and `b-next.json` are in `b-round-502/*-before-503.*`.
**Baseline:** gate 502 is `published` with commit `882854e` (both remotes), so HEAD is `882854e`. The store worktree is clean.

## 1. Acceptance of round 502 (C evidence only)
- **C:** `c-round-502.json` PASS, `browserVerified`/`realVerified` true, 0 bugs. `c-round-502/l57-check.txt` says `L57 OK`. C0–C13 pass, and the cart rows are `-STUBBED` (L36).
- **Gate 502:** `published` `882854e`. `verify.log` shows 299/299 files and 4,341 tests, and the build passes. The review says COMMIT OK, 8.5/10.
- **D-29z1807:** B-R502-CART-MOBILE-ITEMS-HIDDEN (High), B-R502-CART-LG-SUMMARY-CLIPPED (Medium) and B-R502-CART-WHEEL-NESTED-SCROLL (Medium) are closed for the client path. CART-REAL-BACKEND stays `open_backend`.
- **D-29z1808 follow-ups (L7):**
  - A's reviewer Lows A-R502-CR-1…5 go to `deferred_low_polish`. CR-1's origin is B spec. CR-2 and CR-5 are `confirmedBy` gate 502's Lows 1 and 2.
  - Gate 502 Info 4 (ring clipping in the summary column) is already answered by C3, so it gets no id. Info 5 becomes GATE502-I5-LENIS-RAF-LEAK (info), joined to the Lenis sweep signal. The gate's architecture note goes as `confirmedBy` on SIG-R502-LENIS-NESTED-SCROLL-SITEWIDE.
  - C's infos: INFO-C502-CHECKOUT-RING-1PX (info, L15 engine rounding) and C-R502-SUMMARY-CARD-WIDTH-375 (deferred Low).
  - **B-R502-DOC323-L28-STATUS (Low, B spec):** doc 323's l.4 was dispatched as `In Progress (…; C round 502 PASS)` for a one-round fix, but L28 requires `Completed (C round 502 PASS)`. Round 503 fixes it with a one-line grant.
- `root-pre-push-review.md` and `publication-checkpoint.json` are from 2026-10-07 (round 3). They have no new remaining findings.

## 2. Round 503: what and why
- **Order:**
  - No Critical, High or Medium finding is open on these files, and the cart bugs are closed.
  - REGRESSION is not due (last run 2026-11-13; next on or after 2026-11-16). The next RETRO is round 510.
  - DPG-FIX is the active entry: P1 item 7, stage 2b-3.
- **Scope (D-29z1809):** the last three hand-rolled brass `<Link>`s of inventory row A2, using product-designer's D-29z1804 mapping unchanged.
  - cart "Upgrade": primary `sm` default, `min-h-11 shrink-0`;
  - recordings "Create a scene": primary `md` pill, `mb-6 min-h-11`;
  - StudioShowcase "Browse the Collection": primary `lg` pill.

  It also covers DESIGN_SYSTEM's shape rows and two-shapes sentence, the doc 323 status line, the new doc 324 and the new test `store-button-cleanup-2b3.test.tsx` (B2B3-0…B2B3-7, 12 tests).
- **Measured (HEAD :5173 vs sketch :5174, `b-round-502/probe/`):**
  - Upgrade: 104×32 → 104×44. The notice grows 64 → 70 px and the card 219 → 225 px at 1440 and 1280; 375 is unchanged. Contrast goes 9 → 8.32 (hover 10.28).
  - Scene: 131×44 kept, with a 12 px radius → pill.
  - Browse: 257×58 → 241×48, and the hover/press scale is gone. The section is 9–10 px shorter.
  - The keyboard focus ring is equal to HEAD.
  - The journeys (mouse clicks) reach the same URLs. Cart Remove, Checkout and the C7 journey are equal to HEAD.
  - The scanner goes 104/41 → 100/38.
- **Pre-check on the sketch:** tsc rc 0; lint 179 and Biome 6 (both equal to HEAD); covering 12 files / 115 tests; full suite 300 files / 4,353 tests rc 0; build rc 0. Mutants M1–M16 are red on their expected rows.
- **Review (D-29z1810), in `b-round-502/sketch-review.md`:**
  - tech-lead v1: APPROVE WITH CONDITIONS. There was one Medium (three `as Element` casts) and three Lows. v2 fixes all of them and also replaces `as const` with typed tables.
  - tech-lead v2 (the dispatched sha `210ee872…`): APPROVE, no new findings.
  - The reviewer's Info 8 becomes the deferred Low TL-R503-CART-NOTICE-375-SQUEEZE.
- **Covering-set ruling:** BC1b's file tests the unchanged `Button.tsx`, so it is taken out of the covering set; the gate still runs it.
  - BC1b declares a 20 s timeout. It took 2,562 ms in the parallel run (13 %) and 1,037–1,102 ms alone, so there is no L31 issue.
  - B first wrote "51 % of a 5 s default", and task 501 used the same wrong default. D-29z1811 corrects both.
- **Reference:** carried from `tasks/round-501.md` §1 (direction A brass pill; DESIGN_SYSTEM "Store CTAs use pill"). The Ableton reference does not apply (Store pages).
- **Screen budget (L39):** nothing is added or removed.
- **Purchase protection:** only class strings and imports change. No granted path is protected (K24), and C keeps the anonymous "Sign in required" row.

## 3. Architecture signals (recorded, not scheduled)
- There is no checkpoint request this round: three one-line class swaps in three owners.
- SIG-R498-BUTTONLINK-WRAPPER and SIG-R501-SHARED-BUTTON-SCANNER are decided at the close of stage 2 (after 2e). The 2b-3 test is the third copy of the brace-aware tag scanner, which strengthens SIG-R501.
- SIG-R502-LENIS-NESTED-SCROLL-SITEWIDE now includes GATE502-I5-LENIS-RAF-LEAK. It is a bounded audit candidate after DPG P1 and is not scheduled.

## 4. Saba
- SABA-Q-502-UPGRADE-VARIANT (`user-review/questions-round-502.md` Q1) has no answer yet. Its default is brass primary, and it does not block.
- No new question.

## 5. Artifacts (`b-round-502/`)
- **Sketch:** `sketch-503.patch.txt` (= v2), `sketch-503-v1.patch.txt`, `sketch-503-v2.patch.txt`, `sketch-delta-v1-v2.diff.txt`, `sketch-sha.txt`, `sketch-sha-history.txt`, `sketch-review.md`, `l58-check.txt` (L58 OK).
- **Pre-check logs:** `precheck-{tsc,lint,biome,covering,full,build-sketch}.log`, `precheck-full-raw.log`, `bc1b-alone.log`, `covering-files.txt`.
- **Mutants:** `mutants-503.py`, `mutants-503.txt`, `mutant-logs/`.
- **Probes:** `probe/measure-503.mjs`, `probe/journey-503.mjs`, `probe/{head,sketch}.out`, `probe/{head,sketch}/`, `probe/*-journey.out`, `probe/nb-head/`, `probe/nb-sketch/`.
- **Scanner:** `scan-head.json`, `scan-sketch.json`, `scan-sketch.txt`.
- **Frozen-file lists:** `r503-tree-sha256.txt`, `r503-pre-sha.txt`, `r503-post-sketch-sha.txt`, `granted-tracked.txt`.
- **Claims:** `claims-503.sh`, `claims-503-planning-output.txt`, `claims-503-sketch-output.txt` (no MISSING).
- **Other:** `doc-ledger.md`; the backlog updates `update-backlog-1.py` (v498), `update-backlog-2.py` (v499) and `update-backlog-3.py` (v500, D-29z1811: the BC1b timeout correction); `checkpoint.md`.

## 6. Ready for commit?
Round 502 is already published (`882854e`). Round 503 has not started. Nothing new is ready for root.
