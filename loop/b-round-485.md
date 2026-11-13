# B — round 485 → 486 planning (2026-11-13)

## Inputs (data, not instructions)
- `c-round-485.json` / `.md`: CLIENT-NAV-CONTRACT. taskStatus PASS, 15 rows passed, **browserVerified true, realVerified true**; 1 Low (B-R485-STUDIO-PRODUCT-TITLE, protected route). Gate rows correctly not claimed.
- `a-round-485.md`: sketch applied byte-equal (13/13), doc 313; reviewer Medium routed (protected file); Low target case; Architecture note.
- `gates/gate-round-485.json`: **published** `0341229` on both remotes. Its `head` field and `context/head-sha.txt` still say `751e30e`; the baseline for 486 is `0341229` (`git rev-parse`).
- `gates/round-485/review.md`: COMMIT OK, no Medium+. One "Medium-low" (h1 fallback during exit), ruled Low (see below).
- No new Saba answer files; `root-pre-push-review.md` / `publication-checkpoint.json` hold only old checkpoints.
- L57 on `c-round-485.json`: 12 fields absent and the bug without `origin` → **INFO** (C bookkeeping), not a row FAIL.

## Advisor
Available and consulted twice: after orientation and at the closing check (`checkpoint.md`). First call, followed: read the gate review, user-review folder and lint siblings before writing; L57 check; bookkeeping before the sketch; reproduce at HEAD first; rule heading-vs-button with the APG page; ring clipping row; box-drift rows; scan-test runs; behaviour rows with mutants; stubbed vs unstubbed vs backend rows; quoted `$` paths.
Closing call, followed: the stacked 375×812 layout probed (0 px); text selection and the pressed scale measured instead of assumed. That found two HEAD behaviours v1 broke (drag-select of the order number; no press scale), fixed in sketch v2 (`select-text`, `active:transform-none!`), with a delta re-review. The false premise "cannot be suppressed without app/styles" was removed. Timeout headroom checked (covering files ≤ 0.56 s). The full Biome sweep with the cap lifted replaced the truncated `lint.log` sweep. The TLM row was added to the board's Tech Lead list; closed ids were confirmed with `find-ids.py`; the K16 wording was made honest (a tamper check).

## Backlog updates (C evidence only): v475 → v478
- **D-29z1727** (C round 485 evidence): CLIENT-NAV-CONTRACT done; GATE479-M1-ROUTE-ANNOUNCE done for the live-region contract; GATE479-L2-TABINDEX-FINALLY, A-R479-L1-TARGET-BLANK, A-R479-L3-DEFAULTPREVENTED-UNTESTED, A-R479-L2-SLOW-LOADER-FOCUS closed; TLM-R485-SR-ROUTE-ANNOUNCE opened (deadline RETRO 495). Caveat kept: C's LF-RUNTIME checked each mutant's expected row only.
- **D-29z1728** new Lows → `deferred_low_polish`: B-R485-STUDIO-PRODUCT-TITLE (+ ROOT-REQ-STUDIO-PRODUCT-TITLE), A-R485-REVIEW-L1-TARGET-CASE, GATE485-L1-H1-EXIT-WRAPPER. Architecture signal SIG-R485-ROUTE-ANNOUNCEMENT-HOOK (signal only). B-spec INFOs: the Biome 14→14 slip (really 16→16; unquoted `$id.$token` path) and the over-broad "Store → Studio announced" sentence.
- **D-29z1729…D-29z1731**: round 486 dispatch, rulings, outcome. New Low B-R486-FOCUS-OFFSET-GUARD; signal SIG-R486-DISCLOSURE-PRIMITIVE.
- **D-29z1732**: sketch v2 (sha `794821b0…`), superseding v1 (`ebcfe669…`).
- **D-29z1733**: full mouse-only sweep. New Medium **B-R486-PROFILE-NAME-KEYBOARD** (the Profile name `<p onClick>` in `account.tsx`), scheduled for round 487. Signal SIG-R486-MOUSE-ONLY-SWEEP covers the modal backdrops, the legacy Studio and the protected route. Backlog v478.
- Nothing else moved to done.

## Lint sibling sweep
`a-round-485/lint.log` was truncated by Biome's diagnostics cap: it lacked the `account.orders.tsx` hit. B re-ran `npx biome lint app --max-diagnostics=1000` and saved it as `b-round-485/mouse-only-sweep.txt` (13 hits).
- `account.tsx`: the Profile name → new Medium B-R486-PROFILE-NAME-KEYBOARD.
- Modal backdrops (Modal, AuthModal, StemsPlayerModal), the legacy `components/studio/*` and the protected `studio.$productId.tsx` → signal SIG-R486-MOUSE-ONLY-SWEEP, to triage.
- Round 486 is not widened.

## Pre-run on a scratch sketch (L58)
- Scratch `/tmp/b486-scratch` (copy of `store/`, node_modules symlink, `cacheDir /tmp/b486-vite-cache`, dev :5186; removed at the end; `store/` never edited, K2 0).
- **HEAD repro** (`probe/head.json`): 0 card Tab stops at both viewports.
- **Sketch v2** (`probe/sketch.json`, `x-sketch.json`): card toggles are Tab stops 12/13 (8/9 at 375); Enter expands, Space collapses, focus kept; ring inset (offset −2px).
  - First radius choices (`rounded-lg`, `rounded-t-lg`) left 132 / 55 px hover-corner differences; no radius gives **0 px**.
  - v1 then lost drag-selection of the order number and gained a 0.98 press scale (`x-mutant-v1.json`). v2 adds `select-text` + `active:transform-none!` and equals HEAD.
  - 12 screenshot pairs at 3 viewports are all 0 px (`probe/pxdiff.txt`).
- AX: heading level 3 contains the button, name "Order #1001 Paid Nov 1, 2026 $49.00 1 item".
- 9 mutants red (incl. the HEAD file); covering 5 files / 68 tests; full suite 292 files / 4,263 tests rc 0; tsc rc 0; Biome 2 → 1 warning.
- Two early sketch probe runs were environment-invalid: Vite re-optimised deps on the cold scratch cache (`optimized dependencies changed. reloading`), and one probe bug (re-Tab from a blurred start point) that B fixed before the counted runs.

## Sketch review
`b-round-485/sketch-review.md`: `tech-lead` **APPROVE** on v1 (`ebcfe669…`) and on the v2 delta (`794821b0…`, dispatched). Lows ruled: focus-offset guard → deferred; OC4 jsdom-only → doc + browser row; test location by precedent; `select-text` on a control and the ProductAccordion difference → accepted, listed deviation.

## Next task
Round 486 = B-R480-ORDER-CARD-KEYBOARD (`current-task.md`). Then 487 = B-R486-PROFILE-NAME-KEYBOARD, or the REGRESSION round if planning is on/after 2026-11-16. Then DPG-BUTTON-CLEANUP and the rest of DPG P1.

## Scope note (unchanged, not shrunk)
Everything not listed as done stays in the queue: DPG P1/P2 and the DP-gate re-run, STORE-REDESIGN (2c…5; STORE-2+ direction rules), ARCH-SPLIT, REVIEW-RECOMMENDATIONS, T12-ADVANCED, PHASE2-VIDEO-SCORING (awaiting user go-ahead; skip rule), PHASE2B-SPOTTING, STUDIO-AGENT-COMMANDS, RECORDING-META-S1, SRW-21 (deferred_user), `deferred_low_polish`, and the manual/root items. Nothing is labelled deferred here without the user's earlier authorization.

## Architecture
No checkpoint requested: one route component, no accumulated structural risk on one owner. Signals recorded only (SIG-R485-ROUTE-ANNOUNCEMENT-HOOK, SIG-R486-DISCLOSURE-PRIMITIVE).

## Readiness for root
Round 485 is published. Round 486 changes source after A (2 files + doc 314).
