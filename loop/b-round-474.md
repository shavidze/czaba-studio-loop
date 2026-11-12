# B: round 474 → 475 planning (2026-11-12)

**Decision: CONTINUE.** Next is round 475 = DPG-FIX P0 stage 2 (DPG-P0-2), in `current-task.md` (D-29z1681).

## Inputs read
- **Context:** `context/active-summary.md`, `lessons.md`, the round-474 task, all of `a-round-474.md`, `c-round-474.md`/`.json`, `gates/gate-round-474.json`, and `gates/round-474/review*` (9/10, Lows only).
- **Backlog by id:** DPG-FIX, A-R187-PRODUCTCARD-PRIMARY-TOKEN, the Ctrl+K/Gift Cards questions (untouched: round 475 changes only palette CSS colours, not palette content), `global_forbidden_files` and `narrow_grants`.
- **Old reviews:** `root-pre-push-review.md` and `publication-checkpoint.json` are from October and hold no open item for this round.
- **Baseline:** HEAD `297f5ae` (gate 474 published; `context/head-sha.txt` was stale at `58fc56e`). Regression is not due: `regression-last.json` says 2026-11-10, so it is due on or after 2026-11-13, at the next planning.

## Advisor, consults and reviews
- **Advisor:** available and consulted once after orientation (before writing). Advice applied:
  - read all of A's report and the gate review;
  - check the forbidden list and the keep-list;
  - split the work into no-change and visible repairs;
  - use `git log -S` for intent;
  - probe the palette close and item at both viewports;
  - add a positive control;
  - use a real resolver rather than a regex guess for definitions;
  - grant the `.code-4` pin;
  - run the claims on a sketch-applied tree with the doc placeholder;
  - run the full suite and the tech-lead review, then `l58-check`.

  **Attempt 2 (after a context restart).** The second advisor call happened before hand-off. As a result:
  - `mutants/run-mutants.sh` was hardened. It uses absolute paths, refuses the store tree and restores from a pristine snapshot, not git. It resumes after an interruption by restoring from an existing snapshot, and prints `NOT-APPLIED` when a mutation text is not found.
  - B proved it on the sketch-applied copy: 11/11 red, the same rows. An interrupted run followed by a rerun reproduced the same 11 rows, and the copy ended identical to the clone. The unmutated copy is 17/17 green.
  - The script, `summary.txt` and task step 5 and row C3 were revised **after** the tech-lead APPROVE. The sketch sha is unchanged (`d2385ffc2e62c654`).
  - The claims and the L58 check were re-run (`claims-475-planning-output.txt`, `claims-475-allowed-deltas.txt`, `l58-check.txt`).
- **`product-designer`:** 5 rulings (`b-round-474/pd-p0-2.md`). Its nav-bar item hit protected `root.tsx`, so B resolved it with a `display: none` interim, ROOT-REQ-NAV-LOADING-BAR-RENDER, and SABA-Q-PENDING-NAV-FEEDBACK (L44).
- **`tech-lead`:** APPROVE WITH CHANGES on v1. All four changes were adopted:
  - UT2 pins tokens;
  - the C9 row was re-worded;
  - the app.css narrow grant was recorded;
  - the emission check is batched (UT2 8.5 s → 3.1 s under full-suite load).

  The optional variant fix was adopted too. The delta review on v2 is APPROVE (`b-round-474/sketch-review.md`). The Lows are signal SIG-R475-TOKEN-GUARD-LIMITS.

## Backlog updates (from evidence only)
- **Round 474: C PASS** (C1–C10, `browserVerified`/`realVerified` true), published `297f5ae`. DPG-P0-1 is C-verified and **awaiting the DP-gate re-review**, not მზადაა (Saba's design-gate rule 4).
- **C-R474-01** is closed as ruled: K16, K17 and K18 are accepted deltas (L10). It is added as evidence to L56; `lessons.md` stays at 60 lines.
- **C-R474-02** goes to `deferred_low_polish`, confirmed by A's SIG-R474-DOCS-TAILWIND-TEAL. It is attached to ROOT-REQ-DPG-PRIMITIVES-PATCH.
- **The A and gate signals are recorded, not scheduled:**
  - SIG-R474-STYLE-SCAN-COLOUR-EXTRACT (keep);
  - the legacy-loader scrollbar note, added to SABA-Q-DPG-LEGACY-STUDIO-TEAL.
- **New entries:**
  - SIG-R475-LEGACY-DEAD-MORE (UserDropdown, TrackRow, TrackListSkeleton);
  - SIG-R475-STUB-ROUTES;
  - RC-R474-POLICY-LIST-VS-RESOLVER;
  - SABA-Q-PENDING-NAV-FEEDBACK (`user-review/questions-round-474.md`);
  - ROOT-REQ-NAV-LOADING-BAR-RENDER;
  - the `narrow_grants` app.css entry for round 475.
- **The DPG-FIX entry** gets the P0-2 note. EntranceCover's Tailwind-default `--color-black` (`#000`) is recorded as input to P0-3.
- **Decisions:** D-29z1678…D-29z1681. The updater is `b-round-474/update-backlog-475.py`, guarded by its `.done` marker. The pre-edit copies are `b-round-474/*-before-475.*`.

## Round 475 in short
- **Inventory** with Tailwind's own compiler as the resolver (`b-round-474/scan/`):
  - undefined `var()` reads: 14 → 0;
  - non-emitting colour utilities: 28 → 24. The rest are in dead or frozen files and pinned token by token.
  - `--radius-xs` is not broken (Tailwind default `0.125rem`).
- **The fixes:**
  - the ProductCard genre badge gets `bg-background/70 text-foreground`, so brass appears only on "New";
  - the image wrapper gets `bg-surface`;
  - the no-op title hover is removed;
  - the stub routes turn muted;
  - `--color-text-primary` becomes `--color-foreground` (0 px, measured);
  - the dead `.artist-photo-*` takes brand-rgb;
  - the nav bar becomes `display: none` (invisible at HEAD too).
- **The guard:** `store-undefined-tokens` UT1–UT5, plus the one `.code-4` pin.
- **The sketch pre-check:**
  - 11 of 11 mutants red (re-run in attempt 2 with the hardened script: absolute paths, refuses the store tree, restores from a pristine snapshot; unmutated copy 17/17 green; `mutants/summary.txt`);
  - typecheck and lint rc 0;
  - full suite 287 files / 4204 tests green;
  - browser probes at 1440 and 1280 on a sketch-applied clone (own Vite cache on :5181, now stopped) against HEAD on :5173, with a HEAD-vs-HEAD control on the 404 animation;
  - claims identical apart from the expected live-tree lines (`claims-475-allowed-deltas.txt`), and `L58 OK`.

## Scope and gates
- **Not touched:**
  - app code (the store tree is clean, 0 status lines);
  - the protected files;
  - the keep-list;
  - the Ctrl+K content.

  No scope was dropped. The nav-bar question and the stub-route rewrite are recorded as a Saba question and a signal, not marked deferred.
- **No architecture checkpoint is requested.** This is not a feature boundary, and there is no repeated structural risk on one owner. P0 ends at P0-3; root's DP-gate re-review follows.
- **COMPLETE is not possible:** DPG P0-2/P0-3/P1/P2 remain, then the regression, STORE-2c…5, ARCH-SPLIT, REVIEW-RECOMMENDATIONS, T12-ADVANCED, the queued phase-2b, agent-commands and recording entries, and the deferred Lows.
- **BLOCKED is not applicable:** nothing needs external input to proceed.

## Next planning
1. **REGRESSION-2026-11-13**, if dated 2026-11-13 or later.
2. **DPG-P0-3:** SpotlightLoader with SABA-B-16, EntranceCover's `#000` and the docs; the primitives patch goes via root.
3. **Root's P0 DP-gate re-review.**
