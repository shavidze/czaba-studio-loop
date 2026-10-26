# B — Round 185 → 186 planning (D-29z151)

Date: 2026-10-26 · Role: B (planning artifacts only; no app source touched — `git status` clean before and after) · Advisor: **available and consulted** after orientation, before writing.

## Inputs read
- `context/active-summary.md` (head + open findings), `tasks`/`current-task.md` (round 185), `a-round-185.md`, `c-round-185.md`, `c-round-185.json`, `gates/gate-round-185.json`, `gates/round-185/review.md` (Architecture note), `regression-last.json`, `b-round-184.md`, `b-next.json`, `env-status.json`.
- `backlog.json`: only `current_task`, `rounds`, queue STORE-REDESIGN, `regression_rounds`, `deferred_low_polish` (tail), FB ids.
- `feature-status.md`: only the header, the round lines, the FB table (§1) and the STORE-REDESIGN row.
- Spec: `store-redesign-spec.md`, `direction-decision.md` (DATA).
- Source, read-only at `4a73ced`: `products.$handle.tsx`, `SpecialOffersSection.tsx`, `AudioPlayer.tsx`, `AudioPreviewButton.tsx`, `root.tsx` (AppContent), `Header.tsx` h1, `Footer.tsx` l.74, `app.css` (player rules, `--color-primary` absent), `product-utils.ts` `mapProductType`, test patterns (`sfx-scene-route.test.tsx`, `product-presentation.test.tsx`), `public/images/gift-card.png` (viewed), mock fixture descriptions.

## Gate and baseline
- `gate-round-185.json`: **published**, commit `4a73ced` on both remotes. HEAD `4a73ced`, 1011 tracked, clean.
- Archive: `tasks/round-185.md` = copy of the round-185 `current-task.md` (`cmp` equal, sha `a9c57f00…`). Nothing deleted.
- Before-copies: `b-round-185/before/` (backlog, feature-status, b-next, current-task, regression-last).
- New baseline files: `b-round-185-r186-tree-sha256.txt` (1009, OK), `b-round-185-r186-grants.txt` (2), `b-round-185-r186-new-files.txt` (store 2), `b-round-185-r186-granted-start-sha256.txt`, `b-round-185/r186-granted-start/`.

## Backlog updates (only from C's independent evidence)
Source: `c-round-185.json` PASS, `browserVerified=true`, `realVerified=true`, 11 rows passed.
- **STORE-0 → მზადაა** (stage `done`); round 185 → `c_pass_published 4a73ced`.
- PX-NET-185 failed only on pre-existing frozen store code → **C-R185-01 (Low)**. **C-R185-02 (Low)** recorded. Both scheduled in round 186 (the 2026-10-23 rule allows a Low when the round owns the code and the fix is cheap).
- C's info I2 (SFX filter "All" chip) and I3 (mini-player overlap) → `deferred_low_polish` as Lows (B classifies; owner notes point at STORE-1b/2/4). I4/I5 → info, no task.
- Blocked rows (real backend ownership/auth/cart; dev-server stdout) stay open evidence (BACKEND-ONLY-EVIDENCE); they do not make the round unverified.
- Standing C expectations reset: Studio cart-noise errors = 0; fake-Bearer row = mock-backed 403.
- B info: `ArtistBioSection.tsx:12` unsplash (unused component), other generic meta in `store.tsx` / `free-downloads.tsx` (signal for STORE-5).
- `feature-status.md`: stale "cloud/run.sh ვერ ვიპოვე" root question removed (closed by `mock_api_hook_confirmed`).

## Decision: round 186 = STORE-1a (C bugs first)
- **Regression not due:** 2026-10-24 → 2026-10-26 = 2 days. First planning on/after 2026-10-27 = REGRESSION (expected round 187); its scope gained the STORE-0 store smoke and the STORE-1a checks.
- **No Critical/High/Medium open.** Next queue step is STORE-1.
- **Split.** STORE-1 has 5 bugs + 2 features; the workflow allows at most three tightly related bugs per round, so 1a–1d (recorded in `store1_split_d29z151`, nothing dropped). The advisor suggested one larger bug bundle; B kept the three-bug rule, which the workflow policy states explicitly.
- **1a contents:** C-R185-02 and the meta template both live in `products.$handle.tsx`; C-R185-01 is a one-element swap to an existing local asset. All three are C-visible on the pages C already baselined.
- **Rulings (vetoable):** R52 inactive → 404 (strict `false`); R53 keep-listed SpecialOffers keeps all text/layout, only the decorative photo becomes the repo's `gift-card.png` (lazy); R54 meta fallback states only data.
- **Tests:** T1 with mutation/start-copy proof that L1, M1–M3, M5 discriminate. C runs T1 itself plus browser rows; home LCP/CLS become pass/fail (before baseline from round 185).

## Feature boundary and architecture
- A reviewer (mock) and gate-185 reviewer: Architecture note **none** → no new signal.
- `b-round-183-checkpoint-request.md` still unanswered; fallback (c) continues; it blocks nothing. Next checkpoint point: STORE-REDESIGN exit. No single owner accumulates risk in round 186 (2 small files).

## Ableton
Not applicable (store pages).

## FB-01..FB-16 and remaining scope
- FB table unchanged this round: FB-03 and FB-15 მზადაა; the others მოწმდება pending Tech Lead manual checks (not cloud-reproducible failures).
- Remaining: STORE-1a…1d, STORE-2…5, REGRESSION, REVIEW-RECOMMENDATIONS (22 approved ids), T12-ADVANCED, deferred Lows (incl. C-R185-I2/I3), Tech Lead manual checks, backend-only evidence, final regression; awaiting_user items stay recorded, not called deferred.
- Out of scope unchanged: professional plugins/effects, pitch, multi-video layers, audio stretch (grid tempo is not stretch).

## Not COMPLETE, not BLOCKED
Large scope remains and nothing needs external input or credentials.

## Ready for commit (root)
- Round 185 already published (`4a73ced`).
- Round 186 on C PASS: the 2 grants + T1 + doc 153.
