# B round 512 → 513 planning (2026-11-14)

**Advisor:** available. Consulted after orientation (before writing) and before hand-off.
**Consults run:**
- `product-designer` on N3: approved (`b-round-512/consult-product-designer.md`).
- `tech-lead` sketch review: approve, 6 Lows ruled (`b-round-512/sketch-review.md`).

**Gate 512:** `published` at `cbc5709` (rounds 510–512, both remotes). This is the baseline for round 513 [K1] [K3].

## Round 512 result (from `c-round-512.json` / `c-round-512.md`; D-29z1860)
- **C rows:** C0–C8 PASS, with `browserVerified` and `realVerified` true and 0 bugs. The backend-only purchase row is BLOCKED, as expected in the cloud.
- **Accepted:** NONBRAND N2 (PurchaseHeader) is complete for rounds 511 and 512. C511-DESIGNSYSTEM-STALE-PRIMARY-EXAMPLES is closed.
- **Restored:** the optimizer had archived DPG-BUTTON-CLEANUP-2-NONBRAND (still `in_progress`). B restored it into `open_findings` and added `confirmedBy` on ROOT-REQ-OPTIMIZER-ARCHIVES-OPEN.
- **D-29z1861, Lows and review items:**
  - A's three doc Lows (A-R512-REVIEW-DOC330-HEAD-WORDING, -BUTTONMD-CLAIM, -DECISION-TREE-UNLOCK) go to `deferred_low_polish`, origin B spec.
  - From gate 512's review: suggestion 1 is `confirmedBy` on B-R510-BUSY-CURSOR-HIDDEN, and suggestion 2 becomes GATE512-L2-CARTBUTTON-SIZE-DRIFT (Low, deferred).
  - Suggestion 4 is `confirmedBy` on SIG-R501-SHARED-BUTTON-SCANNER.
  - The Architecture note becomes the signal SIG-R512-PURCHASEHEADER-SOURCE-SCAN-TESTS. It is recorded, not scheduled.
- **C's artifact gap:** C512 claims K5 and K12 read `a-round-511/diff.patch` and `b-round-511/scratch/`. The loop `.gitignore` drops both at job hand-over. Recorded as INFO-C512-ARTIFACT-GAP. Round-513 claims read only surviving files: a temp-copy apply plus the post pin, `*.patch.txt` and `mut-logs/`.

## Design gate 2 (root, 2026-11-14) recorded per L42 (D-29z1863)
- **Scores:** DP 5.2 and PD 5.0.
- **New Medium ids:** DPG2-OFF-PALETTE, DPG2-LEGACY-BLUE-TOKENS, DPG2-STUDIOMOCKUP-OFF-PALETTE, DPG2-NATIVE-SELECT-STORE and DPG2-DOCS-TYPOGRAPHY-STALE. All are placed in DPG P1/P2 after NONBRAND.
- **Existing ids:**
  - "Three button systems" is DPG-BUTTON-CLEANUP, already in progress.
  - StudioTrack teal gets `confirmedBy` on SABA-Q-DPG-LEGACY-STUDIO-TEAL (frozen legacy).
- **Why N3 still goes first:** it continues the P1 item already in progress, and most DPG2 ids need `app/styles/**`, which needs a root grant.

## For root
1. **Footer `<a href>` is refuted at HEAD.** `Footer.tsx` has 0 `<a ` and every nav entry is `<Link>` [K23]. Recorded as INFO-DPG2-FOOTER-CLAIM-REFUTED.
2. **ROOT-REQ-DPG2-APPLIED-NOT-AT-HEAD.** The policy says root set `ENTRANCE_MIN_TOTAL_MS` to 4000 and made `DESIGN_TOKENS.md` brass. HEAD has 3500 and still lists teal `#13D9CC` [K23], and `cloud/root-commits/` has no pending patch for either. Please land both as root commits, or confirm that 3500 stays. Round 513 has a HEAD-drift rule, so a root commit that touches only those paths does not break the round.
3. **ROOT-REQ-OPTIMIZER-ARCHIVES-OPEN** happened again with the NONBRAND parent (restored).

## Round 513 (D-29z1862, D-29z1864)
- **Scope:** NONBRAND N3, the cookie banner. A applies one byte sketch, `b-round-512/sketch-513.patch.txt` (sha `cd995844…`), covering the product and the tests:
  - Decline and Accept become `Button` secondary sm pill, with equal weight. SABA-Q-507-COOKIE-WEIGHT has no answer, so its default applies and the question stays open.
  - Close becomes `IconButton` ghost sm with X 16.
  - Rows N3-1…N3-6 are added. A writes doc 331.
- **Reference:**
  - EDPB Cookie Banner Taskforce report (2023): equal prominence.
  - Store research: competitors cover the hero with cookie modals, which reads as cheap.
  - HEAD has the white-pill-vs-muted-text asymmetry.
- **Browser recipe:** the banner renders only with `VITE_GA4_MEASUREMENT_ID` [K7]. C starts a second dev server with its own Vite `cacheDir` (the round-183 recipe).
- **B's pre-check:**
  - Full suite on the product sketch: 306 files, 4,405 tests, rc 0; tsc rc 0.
  - Covering: HEAD 6/82, sketch 6/88.
  - Mutants M1–M13 are each red on their named rows.
  - N3-1, N3-3 and N3-5 are red on the HEAD product file.
  - Browser HEAD vs sketch at 1440, 1280 and 375, plus the journey (`probe/`).
  - Lint 174 → 171 and scanner 51 → 50.
  - Claims K1–K25 run with rc 0 and empty stderr. L58 OK and LEDGER OK.
- **New findings:**
  - B-R512-COOKIE-DISMISS-FOCUS-LOST (Medium, pre-existing: focus falls to `body` after dismissal at HEAD and on the sketch). It goes to round 514.
  - B-R512-COOKIE-PILL-LOW-SEPARATION and A-R512-TL-N3-5-DENYLIST-NARROW (Low, deferred).
  - A-R183-COOKIE-BUTTON-TYPE and A-R183-REVIEW-FBQ-BRANCH close on C round 513 PASS.

## Advisor closing check (D-29z1865)
- **tsc on the dispatched sketch** (product plus test rows) is rc 0 (`b-round-512/precheck-tsc-dispatched.log`). The first tsc log covered the product-only sketch.
- **C10's allowed delta** is now the saved claims output from a sketch-applied clone (`claims-513-sketch-output.txt`, `claims-513-allowed-delta.txt`): only K2 and K16 differ.
- **375 px crops:** the Close X covers the "Privacy" glyphs at HEAD and on the sketch. This is filed as pre-existing **B-R512-COOKIE-CLOSE-OVERLAPS-TEXT** (Medium) and paired with the focus bug in round 514. Round-513 C1 records it with a crop; it is not a FAIL.
- **Optimizer matcher:** it is a plain substring test for `closed`, `done` or `resolved` (`cloud/optimize-backlog.py` l.49). The restored NONBRAND status is rewritten without those words, and the old chain is kept in `status_history_d29z1865`. Every entry this round touched was tested against the matcher.
- **HEAD-drift rule:** extended to C (C0 check 1, K1/K23/K24).
- **Font decision:** the policy's "Instrument Sans for everything (700/400), no Playfair" answers SABA-Q-DPG-LOGO-FONT-SERIF with option (a). It feeds DPG-FONT-RESOLVE and DPG2-DOCS-TYPOGRAPHY-STALE.
- **Stale references fixed:** the consult file names both shas; the INFO-C512 wording is corrected; K24 lists `prot.mjs`, the scanner, the clone outputs and the 375 crops.

## Architecture checkpoint
None requested. N3 is one bounded stage, and no structural risk has built up on CookieConsent. The PurchaseHeader source-scan signal is recorded for DPG-BUTTON-CONTRACT-TABLE.

## Ready for commit
Nothing new from B. Rounds 510–512 are already published (`cbc5709`).

## Order after 513
1. Round 514: B-R512-COOKIE-DISMISS-FOCUS-LOST and B-R512-COOKIE-CLOSE-OVERLAPS-TEXT (same banner, both Medium).
2. REGRESSION on or after 2026-11-16.
3. NONBRAND N4–N9.
4. PD-R498, then DPG-BUTTON-CONTRACT-TABLE.
5. The rest of DPG P1 (with the DPG2 ids), the DP gate, then P2.
6. STORE-2c…5, then ARCH-SPLIT, then REVIEW-RECOMMENDATIONS, then the rest of the queue.

## Files written by B this planning
- `tasks/round-512.md` (byte copy of round 512's task).
- `current-task.md`, `b-next.json` and `b-round-512.md`.
- `feature-status.md` (header, round-512 result, round-513 line, two open-bug lines).
- `backlog.json`: v518 → v519, written by `b-round-512/update-backlog-513.py`, plus one evidence-count correction on DPG2-STUDIOMOCKUP-OFF-PALETTE.
- `b-round-512/*`:
  - backups;
  - the sketch, its review, the consult and the doc-ledger template;
  - the probes and their HEAD, sketch and journey outputs;
  - the mutants and their logs;
  - the pins;
  - the covering and lint logs, and the full-suite log;
  - the claims script and its planning output.

No store file changed (`git status` is clean). B's temp servers, the mock API and the scratch copies are stopped or removed at the end.
