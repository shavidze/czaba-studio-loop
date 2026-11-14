# Round 504: DPG-BUTTON-CLEANUP-2 stage 2c. Move the PurchaseHeader brass actions ("Go to Downloads", "Upgrade to Premium", "Unlock Premium") onto `buildButtonClassName` / `Button`

**Planned by:** B, at the round 503 → 504 planning on 2026-11-14 (`b-round-503.md`).
- **Advisor:** available; consulted after orientation and at the closing check.
- **Archive:** the round-503 task is archived as `tasks/round-503.md`, a byte-identical copy (`cmp` rc 0).

## Decisions (`backlog.json` v503, `decisions_log_b`)
- **D-29z1812: round 503 is accepted, from C's evidence only.**
  - `c-round-503.json` is PASS, with `browserVerified` and `realVerified` true and 0 bugs. `c-round-503/l57-check.txt` says `L57 OK`. Gate 503 is `published` at `b806cad` [K21, K22].
  - Stage 2b-3 is verified. B-R502-DOC323-L28-STATUS is closed by C11. CART-REAL-BACKEND-503 folds into CART-REAL-BACKEND.
- **D-29z1813: round-503 follow-ups (L7).**
  - A-R503-CR-1 is the L28 contract and is now true, so it is closed. CR-2, CR-3 and CR-4 go to `deferred_low_polish`.
  - Gate 503's Lows: Low 1 is deviation D3. Low 2 is `confirmedBy` on GATE498-L2-BARREL-IMPORT. Lows 3–4 and the Architecture note are `confirmedBy` on SIG-R501 and SIG-R498.
  - C's 1 px ring info is `confirmedBy` on INFO-C502-CHECKOUT-RING-1PX.
- **D-29z1814: stage 2c scope, mapping and sketch.**
  - **Scope:** inventory row A3 (`b-round-497/stage2-inventory.md`), the three solid brass actions in `PurchaseHeader`.
  - **Mapping:** product-designer's ruling (`b-round-503/consult-product-designer.md`):
    - all three are primary `lg` with the default 8 px shape, and keep `min-w-[160px] whitespace-nowrap`;
    - "Go to Downloads" stays a `<Link>`;
    - the two `<button>`s become `<Button type="button" size="lg">`;
    - "Unlock Premium" keeps `disabled={isDisabled}` and its own "Processing..." children (no `isLoading`);
    - "Upgrade to Premium" is brass primary, not accent.
  - **Untouched:** the Buy Now `bg-buy` sibling and the other siblings (NONBRAND).
- **D-29z1815: consults and review.** See `b-round-503/sketch-review.md`.
  - tech-lead v1 (`ce4b1105…`): **APPROVE**, with no Medium.
  - The optional Low (the B2C-5 title) is fixed in v2, and mutant M13 (`type="button"`) is added.
  - The v2 delta review (`c776999d…`) is **APPROVE**.
  - **D-29z1816 (closing check):** three doc 325 lines were false against the tree and are corrected in v3 (`84cc9df3…`, the dispatched sha; doc 325 text only). The v3 delta review is **APPROVE**. The full suite, build and covering run were re-run on v3.
  - New deferred items:
    - PD-R504-DISABLED-NO-REASON (info): the disabled builder's `pointer-events-none` hides any cursor or `title`;
    - TL-R504-STALE-UPGRADE-COMMENT (info): the pre-existing `{/* Upgrade Now - Brand color */}`;
    - NONBRAND debt: the in-card siblings move to 8 px.
  - **No architecture checkpoint:** one owner, three class or element swaps. The precedents are 2b-2's `<Button disabled>` busy rule (`tasks/round-501.md`) and 2b-3's `<Link>` + builder.

## Rules
- **Read `lessons.md` first.** Applied here: L1, L4, L7, L10, L22, L23, L26, L28, L29, L31, L36, L38, L39, L52, L54, L56, L57, L58, L59 and L60. L47 is not a row: clicking "Upgrade to Premium" unmounts it and the card re-renders, exactly as at HEAD; C may record `document.activeElement` after J2, but does not assert it.
- **STOP threshold (L10):** A writes STOP and changes nothing more on any of these:
  - a Medium-or-higher finding whose fix is outside the grants;
  - a failing covering test;
  - a frozen-file check that is not rc 0;
  - a sketch that does not apply cleanly;
  - a granted file that would need a change beyond the sketch;
  - one of A's numbers differing from B's expected value in §3.
- **The sketch writes every granted byte**, doc 325 included. A writes no prose this round.
- **Ruling lines (L4):**
  - **Radius:** product-designer's default shape (8 px) wins over row consistency with the 12 px siblings. There is no `rounded-lg` override, because the builder has no `twMerge`.
  - **Busy "Unlock Premium":** `Button`'s disabled `pointer-events-none` wins over HEAD's busy hover colour and pointer cursor. The busy fill is rest brass, at opacity 0.5. The copy "Processing..." and the spinner stay [K7, K8].
  - **Press:** the `<button>`s keep the global `:active` scale 0.98 [K10] and add the builder's `active:opacity-90`. The `<Link>` gets only opacity 0.9.
  - **S2 accent "Downloads" sibling:** the probe's text locator matches 3 elements on both trees (`probe/head.out`, `probe/sketch.out`), so it has no per-element row. It is covered by the card's `cardInfo` focusables and the row box in C5. It is untouched by the sketch.
  - **Height:** the builder's `text-base` line height wins. A site standing alone or stacked goes 50 → 48 px. Beside a bordered sibling the row stays 52 px. A card shrinks by at most 2 px (`probe/compare-504.txt`).
- **Pre-ruled Lows** (a re-raise is listed "For B", not a STOP):
  - #1 the two literal oracles duplicate the builder on purpose; B2C-0 proves they are equal.
  - #2 `openingTags` is a fourth copy of the brace-aware scanner (SIG-R501-SHARED-BUTTON-SCANNER, decided at the stage-2 close).
  - #3 the `vi.mock` factories are untyped partials (A-R503-CR-3-STUBCATALOG-DRIFT). The browser rows carry the real hooks.
  - #4 B2C-2's title under-claims: it also pins the "Go to Downloads" class.
  - #5 doc 325 l.4 says "C round 504 PASS" before C runs (L28 contract) [K16].
  - #6 8 px brass beside 12 px siblings until NONBRAND.
  - #7 the stale comment above "Unlock Premium" (TL-R504-STALE-UPGRADE-COMMENT) is pre-existing and not granted.
  - #8 `store-button-cleanup.test.tsx` (BC1b, it tests the unchanged `Button.tsx`) and `store-button-cleanup-2b3.test.tsx` (cart and showcase) hit the K13 sweep only through shared tokens. They are not in the covering set, and they were green in B's full run [K27].
- **Purchase protection:** the handlers block is byte-identical [K6]. Auth, cart, checkout, ownership and download logic are untouched. Buy Now's class line is unchanged [K5]. Check 2 stays rc 0, and C keeps the anonymous "Sign in required" row.
- **Persistent screen text (L39):** nothing is added or removed. Labels and icons are unchanged.
- **Out of scope:** Studio (`/studio-lab` is only smoke-checked in C12), the siblings (NONBRAND), 2d chat and 2e LeadMagnet.
- **Paths:** loop `/home/runner/czaba-project/tmp/studio-real-loop`, store `/home/runner/czaba-project/store`.

## Baseline
HEAD is `b806cad` [K1] (gate 503 `commit`). The worktree is clean [K2]. Frozen-file checks, all run from `store/`, all rc 0 at planning:
1. `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-503/r504-tree-sha256.txt`: every tracked file except the two granted tracked paths (1,415 of 1,417 [K23]).
2. `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-318/protected-sha256.txt`: the protected files. No granted path is protected [K24].
3. Before applying: `b-round-503/r504-pre-sha.txt` (the two granted tracked paths at HEAD).
4. After applying: `b-round-503/r504-post-sketch-sha.txt`, covering all four paths.

B applied the patch to a fresh `git archive` of HEAD (`/home/runner/b503-verify`). All four files were `cmp`-equal to the scratch, and checks 4 and 1 passed there.

## 0. Why this round
- **Saba's DPG item 7:** "Use Button.tsx component only". Stages 1, 2a and 2b-1…2b-3 are done.
- **Stage 2c** is the purchase-path row A3: the three brass actions buyers see on a product page they already own or are upgrading. The scanner count drops from 100 hits / 38 solid to 96 / 35 [K11].
- **Bugs first:** no Critical, High or Medium finding is open on `PurchaseHeader.tsx`. C 503 found 0 bugs.
- **REGRESSION is not due:** the last one was 2026-11-13, and the next is due on or after 2026-11-16. The next RETRO is round 510.

## 1. Reference
- **Store rule** (DESIGN_SYSTEM shape table; `tasks/round-501.md` §1 carries direction A and the Artlist/Epidemic pill CTAs):
  - standalone page CTAs are brass pills;
  - an action inside a notice or card is default-shape (cart "Upgrade", round 503).
- **This stage:** product-designer treats `PurchaseHeader`'s owner and upgrade states as notice and purchase-panel actions, so they are default-shape.
- **Ableton:** does not apply (Store page).

| Point | Reference / rule | CZABA after this round | Deviation (reason) |
|---|---|---|---|
| Owner action ("Go to Downloads") | card action, default shape | `<Link>` primary `lg`, 8 px, `min-w-[160px]` | D1: radius 12 → 8 px; D2: 50 → 48 px when alone; D4: `shadow-sm`, press opacity 0.9 |
| Upsell inside the owned card ("Upgrade to Premium") | card action; Premium is brass | `<Button type="button" size="lg">` primary | D3: pure black text → `text-background`; hover `brand/90` → `brand-hover`; D1, D2, D4 |
| Upgrade purchase ("Unlock Premium") | purchase-panel action; the busy state is visible and inert | `<Button type="button" size="lg" disabled={isDisabled}>` | D5: busy fill rest brass, opacity 0.5, `pointer-events: none` (HEAD: hover colour, `pointer` cursor); D1, D4 |
| Keyboard focus | the shared ring (SABA-B-4) | unchanged: `:focus-visible`, solid, offset 2 px | none |
| Siblings (Buy Now, Add to Cart, Open in Studio, Downloads) | — | unchanged | NONBRAND debt |

## 2. What changes: sketch `b-round-503/sketch-504.patch.txt`
sha256 `84cc9df33deee81e1de91f33c952b7689593c97b1b0003c30b79c41538dae03d` (`b-round-503/sketch-sha.txt`; v1 `ce4b1105…` and v2 `c776999d…` are superseded, see `sketch-sha-history.txt`).

| File | Change |
|---|---|
| `app/components/product/PurchaseHeader.tsx` | "Go to Downloads" `<Link>` [K3]: the HEAD class string → `className={buildButtonClassName({ size: 'lg', className: 'min-w-[160px] whitespace-nowrap' })}`. "Upgrade to Premium" [K3] → `<Button type="button" size="lg" onClick={onSelectPremium} className="min-w-[160px] whitespace-nowrap">`. "Unlock Premium" [K3] → `<Button type="button" size="lg" onClick={handleBuyNow} disabled={isDisabled} className="min-w-[160px] whitespace-nowrap">`. Children are unchanged; the busy branch keeps "Processing..." [K7]. New import `import { Button, buildButtonClassName } from '~/components/ui';` [K9]. After the sketch: 1 builder call, 2 `<Button` tags, 3 extras [K4] |
| `app/lib/__tests__/store-button-cleanup-2c.test.tsx` (new) | B2C-0 to B2C-9 (10 tests) [K25]: 0 = the two literal oracles (idle and disabled) equal the builder; 1 = Premium owner "Go to Downloads" (class, `href`, svg then label); 2 = SFX owner order "Open in Studio", "Go to Downloads"; 3 = Standard owner "Upgrade to Premium" (`type`, class, no `text-black`, svg then label, click selects Premium once and does not buy); 4 = "Unlock Premium" (`type`, enabled, class, click calls `buyNow(1, 12)` once); 5 = buying: "Processing...", `disabled`, busy class, spinner, click does not buy; 6 = adding to cart: label kept, `disabled`, busy class; 7 = anonymous Buy Now keeps its HEAD class and opens sign-in without buying; 8 = brace-aware scan: 0 hand-rolled solid brass actions, 1 builder call, 2 `Button` tags, 1 `bg-buy` button; 9 = the scanner's self-test on the three HEAD shapes, the builder form and an `onClick={() => …}` tag |
| `docs/design/DESIGN_SYSTEM.md` | the default row of the shape table adds "product გვერდის purchase card-ის მოქმედებები (`PurchaseHeader`: …, `lg`, `min-w-[160px]`)"; the two-shapes sentence below it names the purchase card at 8 px [K18] |
| `docs/implementation/2026/quarter-IV/325-dpg-button-cleanup-stage-2c.md` (new) | l.4 `**სტატუსი:** In Progress (stage 2c of DPG-BUTTON-CLEANUP-2; C round 504 PASS)` [K16]; the 7 TEMPLATE headings; deviations D1–D5; the TODO list |

**Sweep (L23)** [K13, K14, K15]:
- The test-root hits are `product-handle-route`, `product-price-unavailable`, `store-button-cleanup-2b`, `store-glow-shadow` and `store-theme-tokens`. All are in the covering set and green on the sketch. `store-theme-tokens` pins exactly one `bg-buy` attribute in `PurchaseHeader` (kept), and `store-glow-shadow` lists the file as glow-free (kept).
- BC1b and 2b3 are covered by pre-ruled Low #8.
- No e2e spec names the three labels.

**L31 timeout headroom** [K20]: the slowest covering test takes 368 ms against the 5 s default (7 %). No covering file declares its own timeout, and `vitest.config.ts` sets no `testTimeout`.

## 3. A: what to implement
1. From `store/`:
   - run frozen checks 1, 2 and 3 (rc 0);
   - run `git apply --check /home/runner/czaba-project/tmp/studio-real-loop/b-round-503/sketch-504.patch.txt`, then `git apply` on the same path;
   - run check 4 and check 1 again (rc 0).
2. **Grants:** the 4 files in the §2 table, exactly as the sketch writes them. Nothing else changes.
3. **Run.** Save the logs under `a-round-504/`. Each expected value is B's sketch output, and a difference is a STOP:
   - `npm run typecheck`: rc 0 (`typecheck.log`; B: `b-round-503/precheck-tsc.log`).
   - `npm run lint`: rc 0, "Found 179 warnings." (`lint.log`; B: `precheck-lint.log`) [K26].
   - `npx biome check app/components/product/PurchaseHeader.tsx app/lib/__tests__/store-button-cleanup-2c.test.tsx`: rc 0, "Checked 2 files", no warnings (`biome-scoped.log`; B: `precheck-biome.log`) [K26].
   - `npx vitest run --reporter=verbose $(cat /home/runner/czaba-project/tmp/studio-real-loop/b-round-503/covering-files.txt)`: 6 files, 79/79, with the B2C-0…B2C-9 lines present, and no test above 2,500 ms (`covering.log`; B: `precheck-covering.log`).
   - The code-reviewer on the whole change against `b806cad`. Give it `git diff b806cad` and the two untracked files.
   - Not run by A: the full suite and the build. B ran both on the sketch tree: `precheck-full.log` (301 files / 4,363 tests, rc 0) and `precheck-build-sketch.log` (rc 0) [K27].
4. Write `a-round-504.md` with the code-reviewer's Architecture note for B.

## 4. C: what to verify
C writes `c-round-504.md`, `c-round-504.json` and `c-round-504/progress.json` as it goes, heaviest rows first (L59).

**Stubbed rows (L36):** all owner rows are **-STUBBED**. Playwright `page.route` answers `/api/auth/profile`, `/api/downloads` (ownership), `/api/cart`, `/api/cart/items`, `/api/cart/checkout` (held 2.5 s) and `/api/payments/checkout` (a same-origin stub URL), with `localStorage.auth_user` set. The product comes from the loop mock API. These rows prove the client path only. The real-backend half is **BLOCKED: backend unavailable in cloud** and goes under `blocked`. That does not make `browserVerified` false.

**Environment:**
- The store dev server at `http://127.0.0.1:5173`.
- **Mock API** (needed for `/products/*`): start `node mock-api/server.mjs` from the loop folder. Stop it by exact PID with `ps -eo pid,args | awk '$2=="node" && $3=="mock-api/server.mjs"{print $1}'`, never `pkill -f`.
- **Warm up (L38):** load `/products/middle-east` and `/products/door-slams` once in a browser before measuring. A cold first run that crashes or finds 0 targets is environment-invalid and is replaced.

**Harness** (under `b-round-503/probe/`, `BASE=http://127.0.0.1:5173`):
- `node measure-504.mjs <c-round-504/after> after` covers 5 states × 1440×900, 1280×720 and 375×812:
  - S1P owns Premium;
  - S1X owns the SFX Universal;
  - S2 owns Standard, Standard selected;
  - S3 owns Standard, `?upgrade=premium`;
  - S0 anonymous.

  It reads every action: rest, hover, mouse press, keyboard focus (padded crops), and card info (focusables, overflow).
- `node journey-504.mjs <c-round-504/after> after` runs J1–J5 with real mouse clicks at the element centre, at 1440 and 375.
- `python3 compare-504.py <head.json> <after.json>` compares against HEAD.

The oracles are `probe/sketch/sketch.json`, `probe/sketch/sketch-journey.json` and `probe/sketch.out`. The HEAD values are in `probe/head/` and `probe/head.out`.

| # | Row | Check | PASS means |
|---|---|---|---|
| C0 | SOURCE-SCOPE (start) | `git status --short --untracked-files=all`; frozen checks 1, 2 and 4 | 2 modified (`PurchaseHeader.tsx`, `DESIGN_SYSTEM.md`) and 2 untracked (the 2c test, doc 325). Checks 1, 2 and 4 rc 0 |
| C1 | REST-STUBBED (3 targets × 3 viewports) | `measure-504.mjs` | Every target `count` is 1, and each `rest` field equals `sketch.json` (boxes ±1 px). All three: bg `rgb(201, 164, 106)`, color `rgb(14, 13, 12)`, 16px / 600, padding `12px 24px`, radius `8px`, `minWidth` `160px`, `boxShadow` ending `rgba(4, 5, 6, 0.3) 0px 1px 2px 0px`, svg colour `rgb(14, 13, 12)`. Boxes [K29]: Go to Downloads 203×48 (S1X 203×52; 277×48 at 375). Upgrade to Premium 230×48 (HEAD colour `rgb(0, 0, 0)`). Unlock Premium 198×52 (198×48 at 375). Every site was 12px at HEAD |
| C2 | HOVER + PRESS | `hover` and `press` fields | Hover bg `rgb(217, 184, 127)` on all three; HEAD Upgrade to Premium hover was `brand/90`. Press: opacity `0.9` on all three. `transform` is `matrix(0.98, …)` on the two `<button>`s and `none` on the `<a>`. `press.focusVisible` false |
| C3 | KEYBOARD FOCUS | `focus` fields plus the `*-focus.png` crops | `focusVisible` true, outline `solid` with offset `2px` in all 9 target rows (equal to HEAD). At least 3 crops viewed (one per target), with the ring visible and not clipped by the card |
| C4 | CONTRAST | `restContrast` / `hoverContrast` | 8.32 / 10.28 on the 9 target rows. A failure is a Medium |
| C5 | SIBLINGS + CARD | `compare-504.py` against `probe/head/head.json`; `cardInfo` | Every sibling row (Open in Studio, Add to Cart, Buy Now) says `diff none`. Buy Now stays 139×52 with radius `12px`. Cards are equal or up to 2 px shorter, as in `probe/compare-504.txt`. `cardInfo` lines are equal to `probe/head.out` (focusables in the same order, `docOverflowX` 0, `cardScrollW` = `cardClientW`). The full card screenshots `after-S1X-375-card.png` and `after-S3-1280-card.png` were viewed: one-line labels, no overlap, and Add to Cart stays on Unlock Premium's row at 1280 |
| C6 | BUSY (L36, stubbed) | `journey-504.mjs` J3/J4 `busy` | "Processing...", `disabled` true, opacity `0.5`, `pointerEvents` `none`, bg `rgb(201, 164, 106)`, svg class containing `animate-spin`. Screenshot `after-J3-1440-busy.png` viewed |
| C7 | JOURNEY + PURCHASE PROTECTION (L54) | `journey-504.mjs` | 10 rows: `count` 1 and `hit` true. J1 arrives at `/account/downloads`. J2 stays on `/products/middle-east` with `after` `{"unlock":1,"upgrade":0}`. J3 and J4 (double-click) POST exactly `/api/cart/items`, `/api/cart/checkout`, `/api/payments/checkout` once each and arrive at `/__stripe-stub` [K30]. J5 (anonymous Buy Now) sends 0 POSTs. Equal to `sketch-journey.json`, with `errors` excluded. One before and one after screenshot per journey viewed |
| C8 | GREP | from `store/`: `python3 -I /home/runner/czaba-project/tmp/studio-real-loop/b-round-497/scan-brand.py . /tmp/s.json`; the K3/K4/K5 greps of `claims-504.sh` | `96 hits; 35 solid` (HEAD 100 / 38) [K11]; K3 `0 0 0`; K4 `1 2 3`; K5 `1 1` |
| C9 | TESTS | `npx vitest run --reporter=verbose $(cat …/b-round-503/covering-files.txt)` | 6 files, 79/79; the B2C-0…B2C-9 lines present; no test above 2,500 ms |
| C10 | MUTANTS | Copy `store/`'s working tree (excluding `node_modules`, `.git` and `build`) to a folder outside `store/`, symlink `node_modules`, then run `python3 -I b-round-503/mutants-504.py <copy> <absolute c-round-504/mutant-logs>` | M1–M13 all RED, each on the rows in `b-round-503/mutants-504.txt` (`summary.txt` lines end `OK`), and `restored rc 0` |
| C11 | DOCS | `git diff b806cad -- docs/design/DESIGN_SYSTEM.md`; doc 325 | DESIGN_SYSTEM: exactly 2 changed lines (the default row and the two-shapes sentence) [K18]. Doc 325: the 7 headings (L26 subsequence) and l.4 byte-equal to `**სტატუსი:** In Progress (stage 2c of DPG-BUTTON-CLEANUP-2; C round 504 PASS)`. Every number in doc 325's D1–D5 traced to `probe/compare-504.txt`, `probe/sketch.out` or `probe/sketch-journey.out`. `grep -rn 'C round [0-9]* pending' docs/implementation` finds 0 |
| C12 | PROTECTION + STUDIO | Fresh no-credential context: `/studio/1`, `/account/downloads`, `/studio-lab` | `/studio/1` and `/account/downloads` show "Sign in required" and no download link. `/studio-lab` opens the demo at 1440 and 1280 (one screenshot each). Check 2 rc 0 |
| C13 | CLAIMS | `bash b-round-503/claims-504.sh` (default tree), compared with `b-round-503/claims-504-sketch-output.txt` | No `MISSING`. Output identical except K1 (HEAD may move to the loop-state commit) and K2 (the sketch output read the clean store) |
| C14 | SOURCE-SCOPE (end) + L57 | As C0, then `python3 -I tools/l57-check.py c-round-504.json c-round-504/l57-check.txt` | As C0; rc 0. The JSON carries all L57 fields. `mutantRedOnSketch` names `b-round-503/mutants-504.txt` |

- **Gate rows** (`gate` in the JSON, never `passed`): the full vitest run, the build, Biome and `npm run verify`.
- **Blocked:** PURCHASE-REAL-BACKEND-504, the owner states and the upgrade checkout with a real backend ("backend unavailable in cloud").
- **Neighbours that could break:**
  - Buy Now and Add to Cart (C5, C7 J5);
  - the "Unlock Premium" row wrapping at 1280 and 375 (C5);
  - the version switch from "Upgrade to Premium" (C7 J2);
  - the checkout POST count (C7 J3/J4);
  - the product page's unavailable-price state (`product-price-unavailable`, in C9).
- **L22:** if A STOPs, C runs C0, C13 and C14 only.
- **Closing:** with C PASS and `browserVerified` true, stage 2c is verified.

## 5. B's pre-check (`b-round-503/`, on `/home/runner/b503-verify` = a `git archive` of HEAD plus the dispatched sketch, outside `store/`)
| Check | Result | Log |
|---|---|---|
| tsc / lint / Biome (2 code and test files; v2, code identical in v3) | rc 0 / rc 0, 179 warnings (= HEAD) / rc 0, no warnings | `precheck-tsc.log`, `precheck-lint.log`, `precheck-biome.log` |
| Covering tests (v3) | 6 files, 79/79 (slowest 368 ms) | `precheck-covering.log` |
| Full suite on the v3 tree | 301 files / 4,363 tests, rc 0 | `precheck-full.log`, `precheck-full-raw.log` |
| Build on the v3 tree (docs included) | rc 0 | `precheck-build-sketch.log` |
| Browser, HEAD (:5173) vs sketch (a second dev server on :5174 with its own `cacheDir`) | §1 table, C1–C7 | `probe/head.out`, `probe/sketch.out`, `probe/compare-504.txt`, `probe/head-journey.out`, `probe/sketch-journey.out` |
| Mutants (on a separate copy of the v2 tree; v3 changes no mutated file) | M1–M13 RED on their expected rows; `restored rc 0` | `mutants-504.txt`, `mutant-logs/` |
| Scanner | 100/38 → 96/35 | `scan-head.json`, `scan-sketch.json`, `scan-sketch.txt` |
| Patch reproduces the tree | `git apply` on a fresh `git archive` of HEAD: all 4 files `cmp`-equal to the scratch; check 4 rc 0 there; check 1 rc 0 on `store/` and on the verify tree | (this table) |
| Sketch review | tech-lead v1 APPROVE (optional Low fixed in v2, M13 added); v2 APPROVE; **v3 APPROVE** on the dispatched sha | `sketch-review.md`, `sketch-delta-v1-v2.diff.txt`, `sketch-delta-v2-v3.diff.txt` |
| Claims | HEAD and sketch outputs, no MISSING | `claims-504-planning-output.txt`, `claims-504-sketch-output.txt` |

## 6. After this round
1. **REGRESSION** comes first if planning happens on or after 2026-11-16.
2. **2d chat** (GuestForm, ChatInput, ChatButton; product-designer rules Button vs IconButton; ChatWidget is mounted by no route (LEGACY-DEAD-STORE-COMPONENTS), so B checks liveness first). Then **2e LeadMagnet** (keep-list restyle), then **NONBRAND** (including the PurchaseHeader siblings at 8 px) and PD-R498-404-SECONDARY-ALIGN.
3. At the stage-2 close: decide SIG-R498-BUTTONLINK-WRAPPER and SIG-R501-SHARED-BUTTON-SCANNER. A bounded frontend-architect checkpoint goes to root only if that proposes a new ui primitive.
4. Then the rest of DPG P1 (CSS-DEDUP, COLOR-CONSOLIDATE, FONT-RESOLVE), the DP-gate re-run with root, and P2. RETRO at round 510.

## Claims (`b-round-503/claims-504.sh`; planning output `claims-504-planning-output.txt` on HEAD, sketch output `claims-504-sketch-output.txt` on `/home/runner/b503-verify`)
K1 HEAD · K2 worktree counts · K3 three old class strings · K4 new forms (builder calls, `<Button` tags, extras) · K5 Buy Now class line / `bg-buy` lines · K6 handlers block sha · K7 busy copy and spinner · K8 `Button.tsx` default shape / lg / disabled classes / Loading... / props spread · K9 ui barrel exports · K10 `:active` scale selector · K11 scanner · K12 PurchaseHeader importers · K13 SWEEP · K14 e2e label hits · K15 token-test pins · K16 doc 325 l.4 and headings · K17 docs 320–325 · K18 DESIGN_SYSTEM phrases · K19 pending grep · K20 L31 timings · K21 gate 503 and c-round-503 · K22 c-round-503 L57 · K23 frozen list sizes · K24 granted paths not protected · K25 new rows · K26 lint/Biome/tsc · K27 full suite/build · K28 mutants · K29 probe key values · K30 journeys · K31 card info HEAD = sketch · K32 artifacts · K33 ids · K34 L58 check.
