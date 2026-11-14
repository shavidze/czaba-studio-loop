# Round 502: the cart page layout. Three related bugs: items hidden on phones, Order Summary clipped on short screens, mouse wheel dead in the cart columns

**Planned by:** B, at the round 501 → 502 planning on 2026-11-14 (`b-round-501.md`).
- **Advisor:** available; consulted after orientation, after the bug was found, and at the closing check.
- **Archive:** the round-501 task is archived as `tasks/round-501.md`, a byte-identical copy (`cmp` rc 0).

## Decisions (`backlog.json` v497, `decisions_log_b`)
- **D-29z1802: round 501 is accepted, from C's evidence only.**
  - `c-round-501.json` is PASS with `browserVerified` and `realVerified` true and 0 bugs. Gate 501 is `published` at `3bb55d4` [K9, K10].
  - DPG-BUTTON-CLEANUP-2 stage 2b-2 is verified.
- **D-29z1803:** A's four reviewer Lows, gate 501's Low #2 and C's harness note are recorded as deferred Lows and info (see `b-round-501.md`).
- **D-29z1804: stage 2b-3 mapping is ready but not dispatched.** product-designer ruled the three sites (`b-round-501/consult-product-designer.md`). One Saba question is filed (SABA-Q-502-UPGRADE-VARIANT, `awaiting_user`, non-blocking).
- **D-29z1805: round 502 fixes three cart bugs before 2b-3.**
  - While measuring the cart's "Upgrade" link for 2b-3, B found that below 1024 px the cart's items column collapses to 0–79 px [K16]. That is **B-R502-CART-MOBILE-ITEMS-HIDDEN**, High.
  - The same root cause hides the checkout button on short desktop screens (**B-R502-CART-LG-SUMMARY-CLIPPED**, Medium) [K24].
  - Separately, Lenis takes the mouse wheel away from both cart columns (**B-R502-CART-WHEEL-NESTED-SCROLL**, Medium) [K25].
  - All three live in the layout of `app/routes/cart.tsx` [K3, K6] and share one fix, so they count as tightly related bugs in one round.
  - High and Medium bugs go before features, and 2b-3's 375 px "Upgrade" row cannot run until the first bug is fixed. Stage 2b-3 is round 503.
- **D-29z1806: consults.**
  - product-designer ruled the short-screen behaviour (option (a), `b-round-501/consult-product-designer-2.md`). It needs no Saba approval: it repairs a broken state and moves nothing.
  - tech-lead reviewed v1 (APPROVE, with a Medium on the test) and v2 (APPROVE with conditions: a Medium, the items column was an empty scroll container below `lg`, plus three Lows). v3 fixes the Medium and Low 3; v4 and v5 correct two doc sentences. A delta review of v2 → v5 (APPROVE, two Lows pre-ruled as #9 and #10) is in the same file and names the dispatched sha. The full suite condition is met. Both reviews and B's rulings are in `b-round-501/sketch-review.md`.
  - **No architecture checkpoint:** one file, class-level change. SIG-R498-BUTTONLINK-WRAPPER stays a signal until stage 2 closes.

## Rules
- **Read `lessons.md` first.** Applied here: L1, L4, L10, L22, L23, L26, L28, L31, L36, L47, L52, L54, L56 and L58.
- **STOP threshold (L10):** A writes STOP and changes nothing more on any of these:
  - a Medium-or-higher finding whose fix is outside the grants;
  - a failing covering test;
  - a frozen-file check that is not rc 0;
  - a sketch that does not apply cleanly;
  - a granted file that would need a change beyond the sketch;
  - one of A's numbers differing from B's expected value in §3.
- **The sketch writes every granted byte, doc 323 included.** A writes no prose this round.
- **Ruling lines (L4):**
  - `lg` sizes: "equal to HEAD ±1 px" wins, except that the items column may be **shorter** where HEAD let it run past `main`'s padded bottom (deviation D2). `compare-502.py` encodes this rule.
  - Wheel where a column cannot scroll: `data-lenis-prevent-wheel` cannot follow a breakpoint or a scroll state. Below 1024 px, and at `lg` when a column is short or at its end, the wheel over that column scrolls the window natively, without Lenis smoothing (deviation D1, doc 323). The window must still scroll; smoothness there is not a row.
  - The OrderSummary card's `sticky top-24` is removed. It never took effect at HEAD, and inside the new scroll column it pushed the card 96 px down. C3 proves the card does not move at `lg`.
- **Pre-ruled Lows** (a re-raise is listed "For B", not a STOP):
  - #1 the test reads plain `className="..."` only. Its failure message says so.
  - #2 CML3 self-tests the helper; M1 proves CML1 rejects HEAD.
  - #3 doc 323 l.4 states "C round 502 PASS" before C runs (L28 form) [K32].
  - #4 the 5 Biome warnings in `cart.tsx` are pre-existing and untouched.
  - #7 the summary column has no scrollbar gutter. When it scrolls (short screens only), the scrollbar narrows the card (doc 323 D3, deferred Low B-R502-CART-SUMMARY-SCROLLBAR-GUTTER). `lg:pr-2` would break the `lg` equality rows.
  - #8 the focus ring inside the scroll column is checked by geometry and by C3's screenshot, not by a pixel measure.
  - #9 doc 323 says the items column's overscroll applies only from `lg`, but `.styled-scrollbar` also sets `overscroll-behavior-y: contain` at every width [K30]. It has no effect on a column that does not scroll (tech-lead review 3, Low A).
  - #10 CML1 does not catch stacked or arbitrary variants such as `md:max-lg:` or `max-[1023px]:` (review 3, Low B).
  - #5 other nested scroll areas in the Store may have the same Lenis wheel problem. They are signal SIG-R502-LENIS-NESTED-SCROLL-SITEWIDE, not this round.
  - #6 the `/cart` window can scroll about 170 px at `lg` even at HEAD (header plus page wrapper taller than the viewport). Info only (SIG-R502-CART-EXTRA-DOC-HEIGHT).
- **Purchase protection:** no auth, cart logic, checkout, ownership or download code changes. Only `className` values and one HTML data attribute change. Check 2 stays rc 0, and C keeps the anonymous "Sign in required" row.
- **Out of scope:** Studio (`/studio-lab` is only smoke-checked in C12), the 2b-3 button migration, and `useSmoothScroll`.
- **Persistent screen text (L39):** nothing is added or removed.
- **Paths:** loop `/home/runner/czaba-project/tmp/studio-real-loop`, store `/home/runner/czaba-project/store`.

## Baseline
HEAD is `3bb55d4` [K1] (gate 501 `commit`). The worktree is clean [K2]. Frozen-file checks, all run from `store/`, all rc 0 at planning:
1. `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-501/r502-tree-sha256.txt`: every tracked file except `app/routes/cart.tsx` (1,412 files) [K36].
2. `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-318/protected-sha256.txt`: the protected files. `cart.tsx` is not one of them [K19].
3. Before applying: `b-round-501/r502-pre-sha.txt` (`cart.tsx` at HEAD).
4. After applying: `b-round-501/r502-post-sketch-sha.txt`, covering the three paths.

B applied the patch to a `git archive` copy of HEAD; check 4 matched and check 1 stayed rc 0.

## 0. Why this round
- **Promise (L55):** "A buyer can see, change and pay for their cart on any screen." At HEAD that fails on phones, on short laptop screens with a discount, and for any cart longer than the visible column.
- The fixed-height `main` came from commit `7052f82` on 2026-01-08, before the loop [K4]. Only `cart.tsx` uses it [K5], and no test pins it [K7].
- **REGRESSION is not due:** the last one was 2026-11-13 [K17], and the next is due on or after 2026-11-16. The next RETRO is round 510.

## 1. Reference and measured behaviour
- **Reference:** none was fetched for this bug fix. The kept reference is the HEAD desktop design: a fixed-height page whose items column scrolls on its own. Below `lg`, the behaviour is the browser's default document scroll. product-designer's options and trade-offs are in `consult-product-designer-2.md`.
- **Lenis:** version `^1.3.17` [K26]. `useSmoothScroll` sets no `allowNestedScroll` [K26]. Lenis skips wheel events whose target has `data-lenis-prevent` or `data-lenis-prevent-wheel` (`node_modules/lenis/dist/lenis.mjs` l.627–629) [K29]. `Modal.tsx` already uses `data-lenis-prevent` [K27].

| Behaviour | HEAD (measured, `probe/head/`) | After (sketch, `probe/sketch/`) |
|---|---|---|
| 375×812, one item, ownership warning | items column 0 px; "Remove item" cannot be clicked | 339 px; Remove opens and closes its dialog |
| 375×812 / 390×844, one item | 47 / 79 px column (content 155) | 155 / 155 |
| 768×1024, three items | 295 px scroll box (content 482) | 482, in page flow |
| 1366×600, 1366×657, 1280×600, tall summary | Checkout below `main`'s clipped bottom; the wheel cannot reach it (10 of 18 states) | the wheel scrolls the summary column; Checkout in view in all 18 states |
| 1280×720, five items | wheel scrolls the window only; item 5 never visible | items column scrolls (366 px); item 5 visible |
| 1024 / 1280 / 1440, summary fits | — | every box equal ±1 px |
| Empty cart, 4 viewports | — | identical |

## 2. What changes: sketch `b-round-501/sketch-502.patch.txt`
sha256 `7d14eae235a5b35caa8943ae4cb50c7a9f024a06e635f92a7e92b7b04a5667c0` (`b-round-501/sketch-sha.txt`; v1–v4 superseded, `sketch-sha-history.txt`). v4 and v5 differ from v3 only in two doc 323 sentences (the Tab start; "the fifth of five items"). Code and test bytes equal v3's. The mutants ran on that code; the full suite and the build were re-run on the v5 tree.

| File | Change |
|---|---|
| `app/routes/cart.tsx` | `main`: `h-[calc(100vh-80px)] bg-background overflow-hidden` [K3] → `min-h-[calc(100vh-80px)] bg-background lg:h-[calc(100vh-80px)] lg:overflow-hidden`. Grid: adds `lg:grid-rows-[minmax(0,1fr)]`. Items column: `overflow-y-auto overscroll-contain` → `lg:overflow-y-auto lg:overscroll-contain`, plus `data-lenis-prevent-wheel`. Summary column: `lg:col-span-1` → `lg:col-span-1 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain styled-scrollbar` plus `data-lenis-prevent-wheel`. OrderSummary card (l.308): `sticky top-24` removed [K27] |
| `app/lib/__tests__/cart-mobile-layout.test.ts` (new) | CML1: `main` has `min-h-…`, `lg:h-…` and `lg:overflow-hidden`, and no height or clipping class that applies below `lg` (unprefixed, `sm:`, `md:` or any `max-*:`). CML2: grid row bound; both columns scroll at `lg` only (no unprefixed `overflow*`/`overscroll*` on the items column); both carry `data-lenis-prevent-wheel`, in order. CML3: the reader's self-test against the HEAD string and a banned list. CML4: the summary card has no `sticky` or `top-*` [K13, K34] |
| `docs/implementation/2026/quarter-IV/323-cart-mobile-items-hidden.md` (new) | l.4 `**სტატუსი:** In Progress (B-R502-CART-MOBILE-ITEMS-HIDDEN, B-R502-CART-LG-SUMMARY-CLIPPED, B-R502-CART-WHEEL-NESTED-SCROLL; C round 502 PASS)` (the whole line) [K32]; the 7 TEMPLATE headings; D1–D3 deviations |

**Sweep (L23):** the changed class strings appear in no test or e2e file [K7]. `store-focus-ring.test.ts` and `store-theme-tokens.test.ts` read `cart.tsx` [K31] and stay green (covering set). The 2b-3 labels are untouched.

**L31 timeout headroom:** the slowest covering test takes 54 ms against the 5 s default (`precheck-covering.log`).

## 3. A: what to implement
1. From `store/`:
   - run frozen checks 1, 2 and 3 (rc 0);
   - run `git apply --check /home/runner/czaba-project/tmp/studio-real-loop/b-round-501/sketch-502.patch.txt`, then `git apply` on the same path;
   - run check 4 and check 1 again (rc 0).
2. **Grants:** the 3 files in the §2 table, exactly as the sketch writes them. Nothing else changes.
3. **Run.** Save the logs under `a-round-502/`. Each expected value is B's sketch output, and a difference is a STOP:
   - `npm run typecheck`: rc 0 (`typecheck.log`).
   - `npm run lint`: rc 0, "Found 179 warnings." (`lint.log`) [K23].
   - `npx biome check app/routes/cart.tsx app/lib/__tests__/cart-mobile-layout.test.ts`: rc 0, "Found 5 warnings." (`biome-scoped.log`) [K23].
   - `npx vitest run --reporter=verbose $(cat /home/runner/czaba-project/tmp/studio-real-loop/b-round-501/covering-files.txt)`: 3 files, 54/54, with CML1–CML4 present (`covering.log`) [K13].
   - The code-reviewer on the whole change against `3bb55d4` (3 files). Give it `git diff 3bb55d4` and the two untracked files.
   - Not run by A: the full suite and the build. B ran both on the patched tree (`precheck-full.log`, `precheck-build-sketch.log`) [K14, K22].
4. Write `a-round-502.md` with the code-reviewer's Architecture note for B.

## 4. C: what to verify
C writes `c-round-502.md`, `c-round-502.json` and `c-round-502/progress.json` as it goes, heaviest rows first (L59). All cart rows are **-STUBBED** (L36): Playwright `page.route` on `/api/cart`, `/api/downloads` and `/api/auth/profile`, and on `POST /api/cart/checkout` (answered 500 so nothing navigates). They prove the client path only. The real-backend half is **BLOCKED: backend unavailable in cloud**, listed under `blocked`. That does not make `browserVerified` false.

**Environment:**
- The store dev server at `http://127.0.0.1:5173`.
- The loop mock API: `node mock-api/server.mjs` from the loop folder. C7 starts on `/store`, which needs it, and C12 runs with it. Stop it by exact PID with `ps -eo pid,args | awk '$2=="node" && $3=="mock-api/server.mjs"{print $1}'`, never `pkill -f`. Every cart call is still stubbed with `page.route`, which takes precedence over the mock.
- Warm `/cart` once in a browser before measuring (L38). A first cold run that finds no "Order Summary" is env-invalid and is replaced.

**Harness** (all under `b-round-501/probe/`, `BASE=http://127.0.0.1:5173`):
- `node cart-states.mjs <c-round-502/after> after`, then `python3 -I compare-502.py b-round-501/probe/head/head-cart.json <c-round-502/after>/after-cart.json`;
- `node cart-wheel.mjs <dir> after`;
- `node items-wheel.mjs > <dir>/after-items-wheel.json`;
- `node cart-actions.mjs <dir> after`;
- `node cart-empty.mjs <dir> after`;
- `node below-lg-wheel.mjs <dir> after`;
- `node c7-journey.mjs <dir> after` (mock API running).

The oracles are the files in `probe/sketch/`, and the HEAD values are in `probe/head/`.

| # | Row | Check | PASS means |
|---|---|---|---|
| C0 | SOURCE-SCOPE (start) | `git status --short --untracked-files=all`; frozen checks 1, 2 and 4 | 1 modified (`cart.tsx`) and 2 untracked (the test, doc 323). Checks 1, 2 and 4 rc 0 |
| C1 | LAYOUT-STUBBED (4 states × 6 viewports) | `cart-states.mjs` + `compare-502.py` | `RESULT PASS`. Every row below 1024 px is `SMALL-OK` (column height = content height, title and Remove hit-test true, `main` overflow visible). Every `lg` row is `LG-EQUAL`, and the 4 rows marked "HEAD column ran past main; bounded now" match `probe/compare-sketch.txt`. One full-page screenshot per state at 375 and 1280 viewed |
| C2 | PHONE ACTIONS-STUBBED (375×812, 1280×720; anonymous and signed in; coupon + gift card) | `cart-actions.mjs` | Each row: `titleHit` true, `removeClicked` true, `dialog` true, `dialogClosed` true. Anonymous: Checkout opens "Sign in" and sends 0 POSTs. Signed in: 1 `POST /api/cart/checkout`. Equal to `sketch-actions.json`. The HEAD 375 rows (`head-actions.json`) have `removeClicked` false |
| C3 | SHORT-SCREEN WHEEL-STUBBED (3 states × 6 viewports) | `cart-wheel.mjs` | `afterWheel.inView` and `afterWheel.hit` true in all 18 rows. At 1366×600, 1366×657 and 1280×600, the summary column's `st` > 0 with `ovY` `auto`. At 1366×900 and 1440×900, `col.h` = `col.sh` (no inner scroll). In the 900-high rows, `before.top`, `before.bottom` and `before.mainBottom` equal `head-wheel.json` (the card did not move; `before.col` differs by design: `ovY` `auto`). `tab.reached` and `tab.state.inView` true in the 6 EXTRAS rows, with the outline `solid`. One screenshot each at 1366×600, viewed: Checkout fully visible and its focus ring not cut |
| C4 | ITEMS WHEEL-STUBBED (5 items; 1280×720, 1440×900) | `items-wheel.mjs` | `st` > 0, `lastVisible` true, `lenisPrevent` true at both. HEAD: `st` 0, `lastVisible` false |
| C5 | BELOW-LG WHEEL + TOUCH (375×812, 768×1024; 3 items) | `node below-lg-wheel.mjs <dir> after` (wheel 3×300, then a raw 400 px touch swipe over the first item) | Each of the 4 rows equals `probe/sketch/sketch-below-lg.json`: the items column has `ovY` `visible` and `h` = `sh` (482), and `scrollY` is above HEAD's 171 (`probe/head/head-below-lg.json`). For the wheel rows the value equals the sketch's (525 at 375, 277 at 768: the page bottom). For the touch rows it only has to exceed 171, because a fling's distance depends on timing (sketch: 525 and 277). D1: smoothness is not judged. `overscrollBehaviorY` `contain` comes from the pre-existing `.styled-scrollbar` rule [K30] and has no effect on a non-scrolling element |
| C6 | EMPTY CART-STUBBED (4 viewports) | `cart-empty.mjs` | JSON equal to `probe/head/head-empty.json` |
| C7 | JOURNEY (L54, 375×812, stubbed cart with 3 items plus coupon and gift card) | `c7-journey.mjs` with the mock API running: `/store` → header "Cart" → `/cart`, then mouse wheel and mouse clicks at element centres only (no `scrollIntoView`, no Playwright auto-scroll); visibility is a centre hit-test | Equal to `probe/sketch/sketch-c7.json`: `seen` `[true,true,true]`, `removeSeen` true, `dialog` true, `closed` true, `titles` 3, `reachedByWheel` true, `signIn` true, `errors` `[]`. One screenshot per step viewed. HEAD (`probe/head/head-c7.json`): `seen` all false, `removeSeen` false |
| C8 | TESTS | `npx vitest run --reporter=verbose $(cat …/b-round-501/covering-files.txt)` | 3 files, 54/54, with CML1–CML4 lines |
| C9 | MUTANTS | Copy `store/`'s working tree (excluding `node_modules`, `.git` and `build`) to a folder outside `store/`, symlink `node_modules`, then run `python3 -I b-round-501/mutants-502.py <copy> <absolute c-round-502/mutant-logs>` | M1–M15 all RED, each on its expected row (`summary.txt` lines end `OK`), and `restored rc 0` |
| C10 | DOCS | doc 323 | 7 headings (L26 subsequence). l.4 byte-equal to the §2 value [K32]. **Full trace:** every number in doc 323 found in its cited probe file (47/79/155, 0→339, 7 px at 1366×657, 1280×600, 501→442, the fifth of five items, 15 mutants, 179 / 5 warnings). `grep -rn 'C round [0-9]* pending' docs/implementation` finds 0 |
| C11 | CLAIMS | `bash b-round-501/claims-502.sh` (default tree), compared with `b-round-501/claims-502-sketch-output.txt` | No `MISSING`. Output identical except K1 (HEAD may move to the loop-state commit) and K2 (the sketch output read the clean store; C reads the applied tree: 3) |
| C12 | PROTECTION + STUDIO | Fresh no-credential context: `/studio/1`, `/account/downloads`, `/studio-lab` | `/studio/1` and `/account/downloads` show "Sign in required" and no download link. `/studio-lab` opens the demo at 1440 and 1280 (one screenshot each). Check 2 rc 0 |
| C13 | SOURCE-SCOPE (end) + L57 | As C0, then `python3 -I tools/l57-check.py c-round-502.json c-round-502/l57-check.txt` | As C0; rc 0. The JSON carries all L57 fields. `mutantRedOnSketch` names `b-round-501/mutant-logs/summary.txt` |

- **Gate rows** (`gate` in the JSON, never `passed`): the full vitest run, the build, Biome and `npm run verify`.
- **Blocked:** CART-REAL-BACKEND, a real cart, purchases and ownership from the .NET backend ("backend unavailable in cloud").
- **Neighbours that could break:**
  - the empty cart (C6);
  - the remove dialog (C2);
  - the sign-in modal from Checkout (C2, C7);
  - page scroll on `/cart` below `lg` (C5);
  - focus ring visibility inside the scroll column (C3).
- **L22:** if A STOPs, C runs C0, C11 and C13 only.
- **Closing:** with C PASS and `browserVerified` true, the three bugs are fixed for the client path.

## 5. B's pre-check (`b-round-501/`, on a `git archive` copy of HEAD plus the patch, outside `store/`)
| Check | Result | Log |
|---|---|---|
| tsc / lint / Biome | rc 0 / rc 0, 179 warnings / rc 0, 5 warnings (all pre-existing in `cart.tsx`) | `precheck-tsc.log`, `precheck-lint.log`, `precheck-biome.log` |
| Covering tests | 3 files, 54/54 | `precheck-covering.log` |
| Full suite | see [K14] | `precheck-full.log` |
| Build | see [K22] | `precheck-build-sketch.log` |
| Browser, HEAD (:5173) vs sketch (a second dev server on :5174 with its own `cacheDir`) | §1 table | `probe/head/`, `probe/sketch/`, `probe/compare-sketch.txt` |
| Mutants | M1–M15 RED on expected rows | `mutant-logs/summary.txt` |
| Patch reproduces the tree | check 4 equal, check 1 rc 0 | (this table) |
| Consults | product-designer ×2; tech-lead v1 APPROVE (Medium fixed in v2), v2 APPROVE with conditions (Medium and Low 3 fixed in v3) | `consult-product-designer*.md`, `sketch-review.md` |
| Claims | no MISSING | `claims-502-planning-output.txt`, `claims-502-sketch-output.txt` |

## 6. After this round
1. **REGRESSION** comes first if planning happens on or after 2026-11-16.
2. **Round 503: DPG-BUTTON-CLEANUP-2 stage 2b-3**, with the mapping already ruled (`b-round-501/consult-product-designer.md`):
   - cart "Upgrade": primary sm default, `min-h-11 shrink-0`;
   - recordings "Create a scene": primary md pill, `mb-6 min-h-11`;
   - StudioShowcase "Browse the Collection": primary lg pill.

   Prepared harness: `probe/measure-502.mjs`. Its showcase target must be scoped to the showcase section, because two links share the name. Re-evaluate SIG-R498-BUTTONLINK-WRAPPER and SIG-R501-SHARED-BUTTON-SCANNER at stage-2 close.
3. Then 2c PurchaseHeader, 2d chat, 2e LeadMagnet, NONBRAND, then the rest of DPG P1, the DP-gate re-run with root, and P2. RETRO at round 510.

## Claims (`b-round-501/claims-502.sh`; planning output `claims-502-planning-output.txt` on HEAD, sketch output `claims-502-sketch-output.txt` on the patched copy)
K1 HEAD · K2 worktree count · K3 the `main` line · K4 origin commit · K5 the only file with the fixed height · K6 grid/column class strings · K7 no test or e2e pins · K8 Remove label and the sign-in branch · K9 gate 501 · K10 c-round-501 · K11 artifacts exist · K12 sketch sha · K13 covering · K14 full suite · K15 mutants · K16 compare result and HEAD column heights · K17 regression date · K18 doc numbers · K19 `cart.tsx` not protected · K20 empty equal · K21 actions HEAD vs sketch · K22 build · K23 lint / Biome warnings · K24 wheel `inView` HEAD vs sketch · K25 items wheel · K26 Lenis version and no `allowNestedScroll` · K27 Modal's `data-lenis-prevent` and the sticky card line · K28 below-`lg` wheel and touch, HEAD vs sketch · K29 Lenis's prevent attributes · K30 `.styled-scrollbar` overscroll rule · K31 the two covering tests read `cart.tsx` · K32 doc 323 l.4 on the applied tree · K33 L58 check · K34 each mutant log's red row · K35 C7 journey, HEAD vs sketch · K36 tracked-file count.
