# B round 514 → 515 planning (2026-11-14)

**Advisor:** available. Consulted after orientation (before writing) and before hand-off.

**Consults run (read-only project agents):**
- `product-designer`, once (`b-round-514/consult-product-designer.md`): keep the logo target; skip only keyboard-opening fields.
- `tech-lead` sketch review: approve-with-changes (`b-round-514/sketch-review.md`). Applied: the narrowed selector and the T7 and `contenteditable="false"` rows. Declined: the no-header BODY row (L47; R514-F8 pins that edge) and the optional `hasFocus` guard (the outcome is the same as HEAD).

**Gate 514:** `published` at `b7cb61f` (both remotes). This is the baseline for round 515 [K1] [K3].

## Round 514 result (from `c-round-514.json` / `c-round-514.md`; D-29z1869)
- **C rows:** C0–C9 PASS, with `browserVerified` and `realVerified` true. No rows were blocked.
- **Accepted:** B-R512-COOKIE-DISMISS-FOCUS-LOST and B-R512-COOKIE-CLOSE-OVERLAPS-TEXT are closed, on independent browser evidence:
  - C1 layout at 5 widths;
  - C3: 22 keyboard rows, BODY 0/22, with a ring;
  - C4: pointer rows with no ring and no scroll.
- **C-R514-01 (Low)** could not be reproduced in Chromium (WebKit is not installed). It is recorded as open.

## Review items recorded (D-29z1870)
- **Gate 514 finding 1 (Medium)** → GATE514-M1-POINTER-FIELD-KEYBOARD.
  - B reproduced it in Chromium on HEAD. After a pointer Accept, focus is on the newsletter email INPUT (375 and 1280) and on the `/hire-us` TEXTAREA (`b-round-514/probe/head/r515.json`).
  - The on-screen keyboard itself cannot be seen headless. It goes to TLM-R515-PHONE-KEYBOARD (in SABA-DEVICE-CHECKS, deadline RETRO 525).
- **Gate findings 2 and 3** → deferred Lows GATE514-L2-STALE-REF and GATE514-L3-HEADER-SELECTOR. Finding 4 → INFO-GATE514-L4-DETAIL-PROXY.
- **Gate architecture note** → `confirmedBy` on SIG-R513-COOKIE-FOCUS-GROWTH. This is a signal, not a scheduled task.
- **A's round-514 notes:**
  - R2 and R3 become rows in round 515;
  - R6 is deferred;
  - the strengthen-only spec tension is ruled (A-R514-SPEC-STRENGTHEN-ONLY): strengthen-only rows go into the pinned sketch, and A proposes more under "For B".
- **C-R514-01's Safari half** → `confirmedBy` on SAFARI-CHECKS.

## Round 515 (D-29z1871)
- **Scope:** GATE514-M1 (Medium; the bug gate puts it first) plus C-R514-01 (Low, same lines, cheap), plus A-R514 R2/R3 rows. This is one file, at most 3 related bugs. NONBRAND N4 waits one round.
- **Ruling:**
  - A pointer/tap dismissal entered from a keyboard-opening field skips it. Those fields are text-type inputs, textarea, and contenteditable that is not "false". Focus goes to the header logo with `preventScroll`.
  - Select, checkbox, radio, range and `contenteditable="false"` stay returnable.
  - A keyboard dismissal is unchanged.
  - The banner `onBlur` clears the stored element when focus leaves the banner.
  - A first draft also had explicit ref clears in the handlers. They were dropped: the mutant that removes them stayed green (unobservable), so GATE514-L2 stays a deferred Low and is not claimed as fixed.
- **Doc 332 stays byte-identical** (it is in the tree pin). A writes a new doc 333.
- **B's pre-check** (`b-round-514/`):
  - tsc rc 0; scoped Biome rc 0.
  - Covering 6 files / 112 tests (slowest 187 ms).
  - Mutants M1–M11 are each red on their named rows.
  - On HEAD, T1 ×3, T3 and T7 are red. T2, T4, T5, T6 and F8 are behaviour pins.
  - Lint 171 and scanner 50, both equal to HEAD.
  - Full vitest on the sketch: 306 files / 4,435 tests, rc 0. The selector puts `type="checkbox"` and similar literals into app source, so the source-scan tests were checked (`precheck-full.log`).
  - Header and banner route conditions: same `/studio` prefix [K23].
  - Browser, HEAD vs sketch (GA4 set):
    - P1 (email field) and P3 (hire-us textarea/select) at 375 tap and 1280 click;
    - P2, a no-focus click **simulated** in Chromium;
    - the round-514 probe on the final sketch: 22/22 focus rows and the layout identical, 0 errors;
    - the journey is clean.
  - Claims K1–K22 run with rc 0 and empty stderr. The allowed delta covers K2 (3 paths), K15 pre-sha, and K19 (the selector text matches the checkbox grep).
- **Not tested in the cloud:** the on-screen keyboard and real Safari. Both are manual rows, kept open.

## For root
1. C-R205-02 (the header is not sticky; needs an `app/styles/**` grant) and ROOT-REQ-DPG2-APPLIED-NOT-AT-HEAD are still open, as in `b-round-513.md`.
2. `tools/ledger-check.py` needs a task file (C round 514 noted this). L58 OK and LEDGER OK are recorded on this task by `claims-515.sh` K11.

## Architecture checkpoint
None requested. `CookieConsent.tsx` gains one blur handler and one selector constant. That stays under the SIG-R513-COOKIE-FOCUS-GROWTH trigger (a second non-modal surface).

## Ready for commit
Nothing new from B. Round 514 is already published (`b7cb61f`).

## Order after 515
1. REGRESSION on or after 2026-11-16.
2. NONBRAND N4 (Home: SpecialOffers ×2, LeadMagnet Close X), then N5–N9.
3. PD-R498, then DPG-BUTTON-CONTRACT-TABLE.
4. The rest of DPG P1 (with the DPG2 ids), the DP gate, then P2.
5. STORE-2c…5, then ARCH-SPLIT, then REVIEW-RECOMMENDATIONS, then the rest of the queue.
6. RETRO 525.

## Files written by B this planning
- `tasks/round-514.md` (byte copy of round 514's task).
- `current-task.md`, `b-next.json` and `b-round-514.md`.
- `feature-status.md`: the header, the round-514 result, the round-515 line and two open-bug lines. Backup in `b-round-514/feature-status-before-515.md`.
- `backlog.json`: v520 → v521 via `b-round-514/update-backlog-515.py`. Backup in `b-round-514/backlog-before-515.json`.
- `b-round-514/*`:
  - the sketch and its sha;
  - the pins: tree (1430), pre and post;
  - the consult and the review;
  - the doc-ledger template;
  - the L50 grep;
  - the mutants and their logs;
  - the probes with their HEAD, sketch, round-514-equivalence and journey outputs;
  - the covering, lint, Biome and tsc logs, and the scanner output;
  - the claims script, its planning output and the allowed delta.

No store file changed (`git status` is clean). B's temp servers (:5174, :5175) are stopped. The `:5173` server and the mock `:5199` were already running and were left alone. The scratch copies are under `/tmp` only.
