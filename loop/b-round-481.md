# B round 481 → 482 planning (started 2026-11-12T23:47Z)

## Round 481 acceptance (D-29z1712)
- **C round 481 PASS:** 8 rows (C1–C8), 0 bugs, `browserVerified` and `realVerified` true (`c-round-481.json`).
  - C4 ran in the browser at 1440×900 and 1280×720, through the L36 stubbed client path. The link goes to `/store` with a full load, the first Tab lands on the logo, and the button box is 151×50, equal to the HEAD baseline.
  - C5 (guard) and C6 (auth and `/studio-lab` anonymous) passed.
  - C7 recorded that the protected `/account/downloads` page still links to `/music`.
  - The real-owner path is BLOCKED: backend unavailable in cloud.
- **Gate 481:** published `751e30e` on both remotes. This is the baseline for round 482. The gate's `head` field and `context/head-sha.txt` (`bbb3193`) are stale.
- **B-R478-DEAD-MUSIC-LINK:** the account.orders half is verified. The finding stays **open** for the protected `account.downloads.tsx` half (ROOT-REQ-DOWNLOADS-MUSIC-LINK). Nothing moves to მზადაა.
- **A's report:** no Architecture note. Rulings on the code-reviewer's three Lows:
  - **Low 1 (route test in `app/lib/__tests__/`):** accepted, not a finding. The round-481 grant fixed that path.
  - **Low 2 (Mermaid labels):** fixed in the round.
  - **Low 3 (doc cites external loop artifacts):** accepted by design.

  There are no new Lows for `deferred_low_polish`.
- **Archive:** the round-481 task is archived as `tasks/round-481.md`, a copy that is byte-equal to the dispatched task.

## Round 482 (D-29z1713, D-29z1714)
- **REGRESSION-2026-11-13, part 1.** C runs it alone; A changes nothing. It covers rounds 426–481 and every `scope_additions` entry by name (L6).
- **Timing.** Planning started 13 minutes before the 3-day mark (`regression-last` = 2026-11-10). A and C run on 2026-11-13.
  - The 3-day rule is a floor (precedent D-29z1476), and D-29z1709 had already ordered it.
  - `regression-last.json` is unchanged until part 2 closes.
- **Oracle rule (advisor's main risk).** Many rounds later changed the same surfaces that earlier rounds measured. I built an overlap map from the `paths` of `gates/gate-round-426..481.json`, and the latest round's output is the oracle for each surface.
  - The 453 glow inventory and the 447/454 teal states are superseded (470/474) and are not oracles.
  - A tagged "Changed UI facts since round 425" block lists the copy, client-side links, the entrance colour, fonts, glows, teal, My Orders and the repeat guard.
- **Pre-checks (L58):**
  - The hue scan at `751e30e` gives TOTAL 20, identical to `c-round-474/hue-scan.txt`. All 20 hits are in frozen legacy Studio files (`b-round-481/hue-scan-751e30e.txt`).
  - The frozen manifest has 1,393 entries. The protected files give rc 0.
  - `claims-482.sh`: 0 MISSING among its 102 artefact claims, and stderr is empty. I re-ran it after the last edit.
  - **B pre-runs at `751e30e` (`b-round-481/probe/`):**
    - spin 430: `ALL OK (6)`;
    - held-Enter 2a: `ALL OK (28)`;
    - ime-sites: `ALL OK (18)`;
    - Store colour against `c-round-474/browser.json`: `ALL SAME (18)`;
    - 475 rows: 66/66 equal; 475 card: equal (both with the mock API, which I stopped afterwards).
  - **Compare inputs:** the compares for rounds 426–434 need each round's own pre-fix `head/`. The task now gives the exact invocation for every row.
- **Rulings on the scope additions:**
  - **REG-STORE-2C-1-FONTS:** its condition is met through the round-473 PASS.
  - **REG-SCROLL-HOME-FRAMES:** uses only `what_update_d29z1657`. Round 470 measured `/free-downloads` finalY 575/755 and the look band before the round-473 font change, so the task asserts finalY === maxScroll and only records the look band.
  - **Round 453's non-home glows:** these were not superseded by 470, so they get a record cell, (e).
  - **REG-CART:** tries L36 stubs first. The mock returns an empty cart, so `GET /api/cart` is stubbed with one item. The row is BLOCKED only with an exact reason.
- **Carried to part 2:** `carry_to_next_regression_d29z1490`.

## Order (D-29z1715)
- **482:** REGRESSION part 1.
- **483:** REGRESSION part 2 (the round-423 and round-425 rows plus the carries).
- **484:** CLIENT-NAV-CONTRACT (GATE479-M1).
- **485:** B-R480-ORDER-CARD-KEYBOARD.
- **Then:** DPG-BUTTON-CLEANUP and the rest of DPG P1.

A Critical, High or cloud-reproducible Medium finding goes first. STEM-LANES jumps ahead if Saba answers AGREE-STEM-LANES; there is no answer yet.

## Signals and checkpoint
- **New findings:** none from planning. I made no change to `deferred_low_polish`: round 481 has no new Lows.
- **Architecture checkpoint:** not requested. This is a regression round with no code change and no accumulated owner risk.
- **Consults:**
  - **Advisor:** used twice.
    - **After orientation:** six points. The early-run wording, the oracle overlap map, the L6 carry, the baseline and manifest, the before-copies, and the order shift.
    - **Before hand-off:** four points. The compare inputs, the pre-font scroll numbers, the 453 glows, and the wording and the Low 1 ruling.
    - **Result:** all ten are applied.
  - **`product-designer`, `tech-lead`, `ableton-arrangement-expert`, `performance-optimizer`:** not needed. The round adds no new behaviour and no sketch, and its perf asserts reuse the existing budgets.

## Commit readiness
Round 481 is published. Round 482 changes no source, so the gate has nothing to publish unless C finds a bug.

## Files written
- `current-task.md`
- `tasks/round-481.md`
- `b-round-481/`: claims script and output, manifest, hue scan, checkpoint, before-copies, update scripts
- `backlog.json` v471
- `feature-status.md`
- `b-next.json`
