# B round 513 → 514 planning (2026-11-14)

**Advisor:** available. Consulted after orientation (before writing) and before hand-off.

**Consults run:**
- `product-designer`, twice (`b-round-513/consult-product-designer.md`). Consult 1 ruled "always the header logo". B's browser probe refuted its premise. Consult 2 approved the revised rule.
- `tech-lead` sketch review: approve-with-changes, findings 1, 4 and 5 applied (`b-round-513/sketch-review.md`).

**Gate 513:** `published` at `4c85587` (both remotes). This is the baseline for round 514 [K1] [K3].

## Round 513 result (from `c-round-513.json` / `c-round-513.md`; D-29z1866)
- **C rows:** C0–C10 PASS, with `browserVerified` and `realVerified` true and 0 bugs. No rows were blocked.
- **Accepted:** NONBRAND N3 (cookie banner) is C-verified. A-R183-COOKIE-BUTTON-TYPE and A-R183-REVIEW-FBQ-BRANCH are closed.
- The NONBRAND parent stays `in_progress`. Its status was rewritten without the optimizer's archive words, and the old chain moved to `status_history_d29z1866`.
- C's cold-hydration note is recorded as `confirmedBy` on INFO-C510-COLD-HYDRATION.

## Review items recorded (D-29z1867)
- **A's code-reviewer:**
  - Low 3 → A-R513-REVIEW-N3-5-CWD-REGEX (deferred).
  - Low 4 → A-R513-REVIEW-N3-3-SELF-REF (deferred).
  - Low 2 ("Close" silently records a decline) → **SABA-Q-513-CLOSE-AS-DECLINE**, asked in `user-review/questions-round-513.md`, default keep.
  - Architecture note: "keep".
- **Gate 513 review:**
  - Finding 1 (32 px touch target) → `confirmedBy` on B-R512-COOKIE-CLOSE-OVERLAPS-TEXT. Fixed this round with md 40 px.
  - Finding 2 ("no focus-visible style") → INFO-GATE513-L2-FOCUS-GLOBAL. The global `:focus-visible` rule applies, and C3 measured the ring.
  - Finding 5 → `confirmedBy` on A-R183-COOKIE-INLINE-GRADIENT.
  - Finding 6 → the two A-R513 Lows.
  - Architecture note → signal **SIG-R513-COOKIE-FOCUS-GROWTH**. Recorded, not scheduled.

## Round 514 (D-29z1868)
- **Scope:** the two pre-existing Mediums on `CookieConsent.tsx`, B-R512-COOKIE-DISMISS-FOCUS-LOST and B-R512-COOKIE-CLOSE-OVERLAPS-TEXT. Same file, at most 3 related bugs.
- **Browser finding during planning:** the site header is not effectively sticky. `probe/sticky.mjs` on HEAD shows top -1500 at scrollY 1500. The cause is `app/styles/app.css` l.269–272, `html, body { overflow-x: hidden }`.
  - This is the cause of the deferred Low C-R205-02, which gets `confirmedBy`. `app/styles/**` needs a root grant.
  - It refuted consult 1's premise, so consult 2 changed the focus target.
- **Ruling:**
  - Focus returns to the element focused before the banner, else the header logo, else the first header link.
  - Keyboard (`click.detail === 0`) uses `focus()`. Pointer uses `focus({ preventScroll: true })`.
  - After each `focus()`, `activeElement` is checked.
  - Focus is left alone when it is already outside the banner (the Safari click case).
  - Close becomes IconButton md 40 px with X 20, and the text gets `px-10 sm:px-0`.
- **References:** WCAG 2.4.3, 2.4.7 and 2.5.8; WAI-ARIA APG dialog focus return; the GOV.UK cookie banner, rejected for the screen budget.
- **B's pre-check:**
  - tsc rc 0; scoped Biome rc 0.
  - Covering 6 files / 99 tests (slowest 183 ms).
  - Mutants M1–M15 are each red.
  - New rows on HEAD: 10 red; F8 and F9 are behaviour pins.
  - Lint 171 and scanner 50, both equal to HEAD.
  - HEAD vs sketch probes: 5 widths and 22 focus rows each. HEAD is BODY in 22 of 22 rows; the sketch is BODY in 0 of 22, and every keyboard row has a visible ring. The 22 rows include:
    - Space;
    - mid-page Shift+Tab with nothing focused (the sketch scrolls to the logo at 0);
    - Privacy navigation from the stale footer link;
    - a fresh first visit.
  - `/studio-lab` shows no banner (`r514-studio.json`).
  - Added after the advisor's closing check: the off-screen keyboard path had not been run in the browser.
  - The three post-review deltas were not re-read by tech-lead; mutants M9 and M15 cover them, and the task says so.
  - Journey on the sketch is clean.
  - Claims K1–K22 run with rc 0 and empty stderr. The allowed delta, from a sketch-applied clone, is K2 plus K16 pre-sha.
- **Accepted trade-offs** (pre-ruled in the task):
  - a pointer dismissal mid-page focuses an off-screen logo with no ring;
  - a never-focused Shift+Tab entry scrolls to the logo;
  - a window refocus clears the stored element;
  - screen-reader mouse simulation gets `preventScroll`.

## For root
1. **C-R205-02 (deferred Low):** the cause is now known, `app/styles/app.css` l.269–272. Fixing it needs an `app/styles/**` grant. The header markup intends sticky, but it never sticks today. It belongs in a STORE header stage.
2. **ROOT-REQ-DPG2-APPLIED-NOT-AT-HEAD** is still open: the EntranceCover timing and the stale `DESIGN_TOKENS.md` teal row. Round 514 has a HEAD-drift rule for it.

## Architecture checkpoint
None requested. One owner (`CookieConsent.tsx`) gains one ref, one handler and one module helper; that is the threshold the gate reviewer named. It is recorded as SIG-R513-COOKIE-FOCUS-GROWTH. No structural risk has built up.

## Ready for commit
Nothing new from B. Round 513 is already published (`4c85587`).

## Order after 514
1. REGRESSION on or after 2026-11-16.
2. NONBRAND N4–N9.
3. PD-R498, then DPG-BUTTON-CONTRACT-TABLE.
4. The rest of DPG P1 (with the DPG2 ids), the DP gate, then P2.
5. STORE-2c…5, then ARCH-SPLIT, then REVIEW-RECOMMENDATIONS, then the rest of the queue.
6. RETRO 525.

## Files written by B this planning
- `tasks/round-513.md` (byte copy of round 513's task).
- `current-task.md`, `b-next.json` and `b-round-513.md`.
- `feature-status.md`: the header, the round-513 result, the round-514 line and two open-bug lines. Backup in `b-round-513/feature-status-before-514.md`.
- `backlog.json`: v519 → v520 via `b-round-513/update-backlog-514.py`. Backup in `b-round-513/backlog-before-514.json`.
- `user-review/questions-round-513.md` (Q1, SABA-Q-513-CLOSE-AS-DECLINE).
- `b-round-513/*`:
  - the sketch and its sha;
  - the consult and the review;
  - the doc-ledger template;
  - the probes (`r514-banner.mjs`, `sticky.mjs`, `n3-journey.mjs`) with their HEAD, sketch and journey outputs;
  - the mutants and their logs;
  - the pins;
  - the covering, lint, Biome and tsc logs, and the scanner output;
  - the claims script, its planning and sketch outputs, and the allowed delta.

No store file changed (`git status` is clean). B's temp servers (:5174, :5175 and the mock :5199) are stopped. The scratch copies are under `/tmp` only.
