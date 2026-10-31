# Round 286: FIX-PD-1a (F9, Medium). A product page shows the catalogue price instead of "$0.00". When no price is known, it shows "Price unavailable", Add to Cart and Buy Now do nothing, and a visible reason line links to /support

**Planned by:** B, at the round 285 → 286 planning, 2026-10-31.

**Decisions** (full text in `backlog.json` → `decisions_log_b`):
- **D-29z690:** round 285 closed with C PASS (`browserVerified` and `realVerified` true). Gate 285 published `60bfb38`. PERF-3b is **მზადაა**.
- **D-29z691:** A-R285-REVIEW-NAN-PAGE goes to `deferred_low_polish`.
- **D-29z692:** Saba's 2026-10-31 product-review decisions are recorded as queue entry `PD-REVIEW-2026-10-31`. FIX-PD-1 is split into 1a, 1b and 1c, and this round is 1a.
- **D-29z693:** the SR candidates are assigned to queue entries.
- **D-29z694 / D-29z695:** the design (§2).
- **D-29z696:** the browser contract (§6).
- **D-29z697:** the reference section (§1.2).
- **D-29z698:** lessons L54 and L55.

**Owner:** A. **Verifier:** C. **Grants:** §4. The round touches no Studio, auth, cart or checkout code.

## Baseline: HEAD `60bfb38` [K1], clean tree [K2]
- `gates/gate-round-285.json` is `published` at commit `60bfb38`.
- **Claims (L29):** from `store/`, run `bash ../tmp/studio-real-loop/b-round-285/claims-286.sh` **before editing**. Its output must equal `b-round-285/claims-286-output.txt`; on an archive, only K1 may differ, reading `(archive)`. Any other difference is a STOP (§9).

## 0. Read first
1. `lessons.md` (every role), especially L11, L12, L23, L26, L28, L29, L54 and L55.
2. This task.
3. The review's F9 section: `/home/runner/czaba-project/docs/technical/studio-real-workspace/product-design-review-2026-10-31.md`, lines 97–103 (outside `store/`; use the absolute path).
4. A's primitives:
   - `AGENT_DISCOVERABLE_CODE.md` (new exports)
   - `FORWARDREF_COMPONENT.md` (component edit)
   - `DESIGN_TOKENS.md` and `TAILWIND_FIRST.md` (new text styles)
   - `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md`
   - `GEORGIAN_DOCS.md`
   - `.claude/prompts/new-test.md`

## 1. What B measured, and the reference

### 1.1 Reproduction on HEAD (evidence `b-round-285/probe/`)
- **Setup:** mock API `node mock-api/server.mjs` (:5199, health `{"ok":true,"products":8}`) and the dev server :5173. Probe: `b-round-285/probe/f9-probe.cjs`.
- **`/products/door-slams`** (SFX, no `variants`, `standardPrice` 9; the `/store` card shows $9), at both 1440×900 and 1280×720:
  - the only price on the page is **`$0.00USD`**;
  - Buy Now `disabled: false`;
  - Add to Cart `disabled: false`.
- **`/products/middle-east`:** `$29.00USD`, buttons enabled (control).
- Files: `head-f9.json`, `head-door-slams-{1440,1280}.png`, `head-middle-east-{1440,1280}.png`.
- **Cause, in two steps:**
  1. `createDisplayVersions` deliberately returns `[]` for an SFX product with no variants [K5]. This is pinned by the test "does not invent a purchasable SFX variant when none exists" [K10], which must stay byte-identical.
  2. `ProductDetailPage` then passes `selectedVersion?.price ?? 0` [K3] and `selectedVersion?.name ?? 'Standard'` [K4]. A missing version therefore looks like a supported $0 Standard.
- **Neighbour defect in the same class:** with no price at all, `ProductSidebar` computes `standardPrice ?? minPrice ?? variants[0].price ?? 0` and shows "Complimentary Download" for 0 [K9]. A product whose price is unknown would advertise a free download.
- The synthetic Standard version of a Track with no variants also falls back to 0 [K6].

### 1.2 Reference: how comparable stores do it (D-29z697)
- **Searched:** `/home/runner/czaba-project/docs/technical/store-redesign/research/competitors.md`, `luxury-and-galleries.md` and `visual-pass.md` (absolute paths; not under `store/`) (unavailable / no-price / contact states). **No reference found** for an unknown-price state. B invents none.
- **Kept from the reference:** the price shown on the product page equals the price on the `/store` card. That is the card's existing rule: `standardPrice ?? minPrice ?? variants[0].price` (`store.tsx:79`, `ProductCard.tsx:32`).
- **Deviations:** none from any listed reference.
- **Ableton conformity:** not applicable (a Store page).
- **Screen budget:** not applicable to `/studio-lab`. The reason line appears only in the unknown-price state.

### 1.3 Design consult (`product-designer`, this planning)
- **Chosen design:**
  - the panel keeps its shape;
  - the "Total Price" label stays, and its figure is replaced by "Price unavailable", with no currency symbol;
  - Add to Cart and Buy Now stay visible as `aria-disabled="true"`. They stay focusable, and `aria-describedby` points to the reason line;
  - pressing them does nothing;
  - a visible reason line contains a "contact us" link to `/support`. `/hire-us` is for commissions, so it is the wrong target;
  - the ownership panels and the loading state come first, unchanged.
- **Rejected:** replacing the buttons with a single contact panel. It contradicts Saba's "Buy is disabled with a reason", and the layout would jump once a price exists.
- **Copy ruling (B):** the designer proposed "Online purchase isn't open for this collection yet." B keeps the reviewed wording, **"Price unavailable — contact us to buy it."** The data does not say *why* the price is missing, so B uses the smallest honest copy.

### 1.4 Why we missed it (L54)
Before STORE-0 the cloud had no product data. Every Store check after it looked at one product type (Track with variants), and no row compared the card price with the page price across the catalogue. L54 (added at this planning) makes that walk a row: B-JOURNEY below.

## 2. The change (D-29z694, D-29z695)

### 2.1 `app/lib/product-utils.ts`: two new exports only
Every existing function stays byte-identical, including `createDisplayVersions` and its `?? 0` [K6]. Only add:

- **`resolveCatalogPrice(product: Product): number | undefined`**
  - Returns the first **valid** value of `product.standardPrice`, `product.minPrice`, `product.variants?.[0]?.price`.
  - **Valid** means `typeof v === 'number' && Number.isFinite(v) && v >= 0`.
  - A `null` from JSON, `NaN` or a negative value is skipped.
  - Returns `undefined` when none is valid.
  - An explicit `0` is valid and returned. 0 is the existing "free" state.
- **`resolvePurchasePrice(product: Product, version: DisplayVersion | null): number | undefined`**
  - If `version` exists and `version.id !== -1`: return `version.price` when valid, else `undefined`. This covers a real backend variant (id > 0) and the synthetic Premium (id −2, built only when `premiumPrice` is truthy).
  - Otherwise (no version, or the synthetic Standard id −1): return `resolveCatalogPrice(product)`.
- **Rules:** TypeScript strict, no `any`, no type assertions. Each helper gets a one-line comment in English, per `AGENT_DISCOVERABLE_CODE.md`.

### 2.2 `app/components/product/ProductDetailPage.tsx`
- `currentPrice` becomes `resolvePurchasePrice(product, selectedVersion)`, of type `number | undefined`. Drop the `useMemo`, or keep it; either is fine.
- Nothing else changes. Keep the `selectedVersionName` fallback [K4]: `isSupportedVersion` stays true for the no-variant case, so a known price still buys exactly as today, with `productVariantId` undefined. **Purchase protection:** `addToCart` and `buyNow` are called with the same arguments as on HEAD whenever a price is known.

### 2.3 `app/components/product/PurchaseHeader.tsx`
- **The prop:** `price: number | undefined` (it was `number` [K7]). Define `const isPriceUnknown = price === undefined;`.
- **Branch order is unchanged.** The order is:
  1. `!isSupportedVersion` `<output>`;
  2. Case 1 (owns Premium or SFX);
  3. Case 2 (owns Standard, Standard selected);
  4. Case 3 (upgrade);
  5. loading;
  6. default.
- **Case 3** requires a known price: `isUpgrade && price !== undefined && price - ownedPrice > 0`. With an unknown price it falls through to the default panel.
- **Default panel, known price:** byte-equivalent behaviour to HEAD (figure `$x.xx USD`, same buttons, same handlers).
- **Default panel, unknown price:**
  - **Figure.** The "Total Price" label stays. The figure is the text `Price unavailable`, smaller and muted (for example `text-2xl font-light text-muted`; tokens only). The panel contains no `$` character.
  - **Buttons.** Add to Cart and Buy Now render in the same place with `aria-disabled="true"` and `aria-describedby={reasonId}` (`useId`). They have **no** `disabled` attribute, so they stay in the Tab order. Their look matches the existing disabled look (`opacity-50`, `cursor-not-allowed`), through an `aria-disabled:` variant or a conditional class. No focus-variant classes may be added (STF2 in `store-focus-ring.test.ts`).
  - **Activation.** Click, Enter and Space do nothing. There is no toast, no `openModal`, no `addToCart` or `buyNow` call and no GA4 or Facebook event. The guard sits at the top of `handleAddToCart` and `handleBuyNow` (`if (isPriceUnknown) return;`), **before** the sign-in check.
  - **Exception.** `CartButton` in its `alreadyInCart` state ("In Cart" → `/cart`) keeps working; it is navigation, not a purchase.
  - **Reason line.** A visible `<p id={reasonId}>` under the buttons reads exactly `Price unavailable — ` + `<Link to="/support">contact us</Link>` + ` to buy it.` (an em dash with spaces). The link must not be disabled.
  - **One Buy Now.** The single Buy Now `<button>` that carries `bg-buy` stays one element; `store-theme-tokens.test.ts` expects exactly one `bg-buy` class attribute in this file. Do not render a second Buy Now button for the unknown state.
- **Analytics.** The `productPrice` sent with a known price is unchanged.

### 2.4 `app/components/product/ProductSidebar.tsx`
- Change only how `isFree` is computed: `const isFree = resolveCatalogPrice(product) === 0;`. Keep or remove the local `standardPrice` constant as you need.
- An unknown price shows no "Complimentary Download". An explicit 0 still shows it, unchanged.

## 3. Tests
Before writing them, read the `vi.mock` patterns for the hooks in existing tests (for example `grep -rln "vi.mock('~/hooks/useAuth'" app`).

### 3.1 `app/lib/__tests__/product-utils.test.ts`: append only
- Add one new `describe('purchase price resolution', …)` at the end. **No existing line changes**: `git diff` must show only added lines.
- Build values such as `null`, `NaN` and negative numbers through a typed helper or `JSON.parse` of a product string. Use no `as` or `any`.

| Row | What it checks |
|---|---|
| PR1 | The catalogue order: `standardPrice` 9 → 9; standardPrice missing and `minPrice` 7 → 7; only `variants[0].price` 5 → 5 |
| PR2 | Nothing valid → `undefined`. `standardPrice: null` with `minPrice: 7` → 7. `NaN` → skipped. `-1` → skipped |
| PR3 | An explicit `standardPrice: 0` → `0`, not `undefined` |
| PR4 | A real variant (id 12, price 49) wins over `standardPrice` 29. A real variant with a non-finite price → `undefined` |
| PR5 | `version` null with SFX `standardPrice` 9 → 9. The synthetic Standard (id −1) built by `createDisplayVersions` for a Track with no price fields → `undefined`, while that version's own `price` is still 0 (the old function is unchanged) |
| PR6 | The synthetic Premium (id −2) → `premiumPrice` |

### 3.2 New file `app/lib/__tests__/product-price-unavailable.test.tsx` (RTL)
Render `ProductDetailPage` (and `ProductSidebar` for PU7). Wrap it in `createRemixStub` or `MemoryRouter`, whichever existing store tests use. Mock `useAuth`, `useCart`, `usePurchases`, `useToast`, `~/lib/analytics` and `~/lib/facebook-pixel`. Follow L27: a mocked-hook rerender needs a fresh element.

| Row | What it checks |
|---|---|
| PU1 | A door-slams-like product (SFX, no variants, `standardPrice` 9): the text `$9.00` is present and `$0.00` absent. Buy Now and Add to Cart have no `aria-disabled="true"` and no `disabled` |
| PU2 | A priceless product: `Price unavailable` is visible; the purchase panel has no `$`; both buttons have `aria-disabled="true"` and no `disabled` attribute. Each button's `aria-describedby` resolves to an element whose text is exactly `Price unavailable — contact us to buy it.` The link named `contact us` has `href="/support"` |
| PU3 | Priceless and signed out: click, `{Enter}` and `{Space}` on each button → `openModal`, `showToast`, `addToCart`, `buyNow`, `trackAddToCart`, `trackBeginCheckout`, `trackFBAddToCart` and `trackFBInitiateCheckout` are each called **0** times |
| PU4 | Priceless, signed in, not an owner: the same 0 calls |
| PU5 | Priceless, the owner panels keep precedence and are unchanged:<br>• owns SFX → `You own this collection`;<br>• owns Premium → `You own Premium`;<br>• owns Standard with Standard selected → `You own Standard`;<br>• purchases loading → `Checking purchase status...` |
| PU6 | Known-price regression: a Track with Standard 29 / Premium 99 variants shows `$29.00`. Add to Cart calls `addToCart(productId, handle, standardVariantId)` once. Signed-out Buy Now calls `openModal('signin')` once, as on HEAD |
| PU7 | `ProductSidebar`: unknown price → no `Complimentary Download`; `standardPrice` 0 → present; 9 → absent |

### 3.3 Mutants (A runs them and records which rows go red; C re-runs them)
Each mutant is applied to A's tree and must turn red at the rows listed.

| Mutant | Change | Must go red at |
|---|---|---|
| M1 | `resolveCatalogPrice` ends with `?? 0` instead of `undefined` | PR2, PR5, PU2 |
| M2 | Remove the guard in `handleBuyNow` | PU3 |
| M2b | Remove the guard in `handleAddToCart` (both guards are required) | PU3 |
| M3 | Use `disabled` instead of `aria-disabled` | PU2 |
| M4 | Sidebar `isFree` back to the old `?? 0` chain | PU7 |
| M5 | `resolvePurchasePrice` always returns the catalogue price | PR4, PU6 |

## 4. Grants (exact)
**Allowed changes:**
- **M** `app/lib/product-utils.ts`: the two new exports only.
- **M** `app/components/product/ProductDetailPage.tsx`
- **M** `app/components/product/PurchaseHeader.tsx`
- **M** `app/components/product/ProductSidebar.tsx`
- **M** `app/lib/__tests__/product-utils.test.ts`: append only.
- **??** `app/lib/__tests__/product-price-unavailable.test.tsx`
- **??** `docs/implementation/2026/quarter-IV/214-fix-pd-price-fallback.md` (next free number [K13])

**Everything else is frozen.** In particular:
- `app/contexts/CartContext.tsx`, `app/services/api/**`, `app/routes/**`
- the auth files (`app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `app/lib/firebase.client.ts`)
- the protected `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts` and `app/routes/account.downloads.tsx`
- every Studio file
- `package.json` and the lock file
- every loop file, including `mock-api/server.mjs`

## 5. Doc 214 (Georgian, technical terms in English)
Follow the `docs/implementation/TEMPLATE.md` headings, in order.
- **Line 4** is exactly `Completed (C round 286 PASS)` (L28).
- **Content:** the context (F9 and the HEAD reproduction), the approach (§2, with the rejected options), the changed files, the Problem → Solution entries, the testing (cite only rows that exist: PR1–PR6, PU1–PU7, M1–M5; L26) and the TODO (FIX-PD-1b and FIX-PD-1c).

## 6. The browser contract (D-29z696)
- **Servers.** C runs the dev server :5173 (already up) and the mock API on :5199. The product page is SSR-loaded (`products.$handle.tsx` loader), so `page.route` cannot fake a product.
- **Unknown-price fixture.** C copies `mock-api/server.mjs` to `c-round-286/mock-priceless.mjs` and adds one active SFX fixture:
  - `id 9`, handle `priceless-pack`;
  - no `standardPrice`, `minPrice`, `premiumPrice` or `variants`;
  - a local `audioPreviewUrl`.

  C stops the standard mock, runs the copy on :5199 for the B-UNKNOWN rows, and restores the standard mock afterwards. `mock-api/server.mjs` itself is never edited.
- **Builds.** C compares HEAD `60bfb38` with A's tree, each as its own build with its own port and `cacheDir` (L38), with a warm-up before measuring. Alternatively C may use the :5173 dev server for A and a scratch HEAD build.
- **Backend-only rows.** Signed-in and owner states are unit rows only (PU4, PU5). The mock's auth returns 401, so a browser check of those states is **BLOCKED: backend unavailable in cloud**. That does not make `browserVerified` false.

## 7. What A runs (speed rules)
1. Run the claims (§Baseline).
2. Make the edits.
3. Run `npm run typecheck` and `npm run lint`.
4. Run `npx vitest run` on the 6 covering files in `b-round-285/covering-files.txt` plus the new test file. HEAD baseline: 6 files / 111 tests pass (`covering-run-head.txt`).
5. Run mutants M1–M5 and M2b. Restore the tree after each one and check its sha256.
6. Run one browser smoke on `/products/door-slams` ($9.00) at 1440. The page is SSR-loaded from the mock API, which is not running by default. From the loop folder, start `node mock-api/server.mjs > a-round-286-mock.log 2>&1 &` first, check `curl -s http://127.0.0.1:5199/__mock/health` (`products: 8`), and stop the mock afterwards by its PID (not with `pkill -f`, which can match the calling shell).
7. Run `code-reviewer`; the round changes 3+ files.

**Report in `a-round-286.md`:** the diff stat, the test counts, the mutant table, the sha256 of the 7 changed paths, and any code-reviewer Architecture note (passed on as a backlog signal). Do not run the full suite or `npm run verify`; the gate does.

## 8. C rows (both viewports, 1440×900 and 1280×720, unless stated)
| Row | Check |
|---|---|
| CLAIMS | `claims-286.sh` on a `git archive 60bfb38` scratch equals `claims-286-output.txt`, except K1 `(archive)`. Run the L29 untagged-fact sweep of this task |
| SOURCE-SCOPE | `git status` lists exactly the §4 paths. `git diff app/lib/__tests__/product-utils.test.ts` shows only `+` lines (the file ends with a newline at HEAD, so appending needs no `-` line). In `product-utils.ts`, every pre-existing function is byte-identical (diff hunks only add). CartContext, client.ts, routes and auth files are unchanged |
| TYPECHECK | `npm run typecheck` rc 0 |
| UNIT | The 7 covering files pass. PR1–PR6 and PU1–PU7 each exist exactly once by name |
| UNIT-MUTANTS | C re-runs M1–M5 and M2b on its own copy; each is red exactly at its §3.3 rows |
| B-KNOWN | `/products/door-slams` on A shows `$9.00 USD` and no `$0.00` anywhere (HEAD: `$0.00`). Add to Cart and Buy Now are enabled. Signed out, Buy Now gives the same result as on HEAD for `/products/middle-east`: the sign-in modal and toast |
| B-UNKNOWN | With the `mock-priceless` server, `/products/priceless-pack`:<br>• `Price unavailable` is visible, and the purchase panel has no `$`;<br>• both buttons have `aria-disabled="true"` and no `disabled`;<br>• keyboard Tab, starting from the sidebar preview button (or from the document start if that button is absent), reaches Add to Cart → Buy Now → `contact us`, in that order. The priceless product has no version selector (`ProductDetailPage.tsx:138` renders it only with a selected version), and the ring is visible on each (computed outline ≥ 1 px);<br>• click, Enter and Space on each button: no dialog, no toast element, no request to `/api/cart*`, `/api/auth*` or `/api/orders*` (network log);<br>• `contact us` navigates to `/support`;<br>• `aria-describedby` resolves to the reason text, exactly as in PU2.<br>Screenshot of the panel |
| B-SIDEBAR | No `Complimentary Download` on `priceless-pack` or on `door-slams` |
| B-REGRESS | On A versus HEAD:<br>• `middle-east` shows `$29.00`, and Premium selected shows `$99.00`;<br>• `copper-horizon` (Track, no variants, 19) shows `$19.00`;<br>• `harbour-lights` shows `$24.00`;<br>• each price text is equal on HEAD and A;<br>• the purchase-panel bbox is equal ±1 px |
| B-JOURNEY (L54) | `/store` → for each active fixture product (7): the card price equals the product page's price figure on A. Screenshot each step for `door-slams`: the card, then the page |
| G286-AUTH | Fresh context, no credentials:<br>• `/studio-lab` shows the demo badge, `auth_user` null, and Add present;<br>• `/studio/middle-east` shows `Sign in required` and has 0 `audio[src]`;<br>• `/api/studio-token?product=middle-east&file=stem-01.wav` with no header → 401; with a fake bearer → not 200 and no token.<br>A real-backend 403 is BLOCKED: backend unavailable in cloud |
| DOC-214 | Line 4 is byte-exact. The headings equal TEMPLATE's, in order. Every cited row id exists |
| gate | The full suite, the build, Biome, `verify` and `test:e2e:smoke` are the gate's rows. C does not claim them |

**Product-designer acceptance rows** are B-UNKNOWN, PU3–PU5, B-KNOWN and B-SIDEBAR. C may consult `product-designer` in review mode (at most 7 findings).

## 9. STOP conditions (L11)
Write a STOP and change nothing else when:
- the claims output differs;
- keeping exactly one `bg-buy` attribute is impossible;
- any frozen file would need a change;
- `createDisplayVersions` or the SFX `[]` test would need a change;
- a required row cannot be written without a type assertion.

## 10. Neighbour risk
- **Products with a known price.** The buttons, handlers, analytics price and cart arguments must stay exactly as on HEAD (PU6, B-REGRESS).
- **The upgrade panel (Case 3)** depends on `price`. Its known-price arithmetic is unchanged.
- **Free products (explicit 0).** They still render `$0.00` in the header, as today. This is out of scope; recorded as open signal PD-FREE-HEADER for STORE-4.
- **Themes and focus.** The `store-theme-tokens` and `store-focus-ring` scans must stay green.

## 11. Outcome, fixed in advance
- **PASS:** every runnable row above passes at both viewports, with `browserVerified` true. FIX-PD-1a becomes **მზადაა** after gate publication, and the next round is FIX-PD-1b.
- **Fix-up:** any Medium or higher finding in B-KNOWN, B-UNKNOWN or B-REGRESS makes the next round a fix-up.
- **Lows:** they go to `deferred_low_polish`, unless this round's files own them cheaply.

## 12. Deliverables
- **A:** the §4 files and `a-round-286.md` (with a checkpoint).
- **C:** `c-round-286.md`, `c-round-286.json` and evidence in `c-round-286/`.

## Claims block (L29)
Every fact in this task about current code carries a K tag from `b-round-285/claims-286.sh`; their output is in `claims-286-output.txt`.

| Tag | Fact |
|---|---|
| K1 | HEAD `60bfb38` |
| K2 | Clean tree |
| K3 | `ProductDetailPage.tsx:68` `selectedVersion?.price ?? 0` |
| K4 | `:122` `selectedVersion?.name ?? 'Standard'` |
| K5 | `product-utils.ts:85` SFX `return [];` |
| K6 | `:92` synthetic Standard `… ?? 0` |
| K7 | `PurchaseHeader.tsx:22` `price: number;`, `:140` `isDisabled`, `:327` the `${price.toFixed(2)}` figure |
| K8 | `PurchaseHeader` is used only by `ProductDetailPage` |
| K9 | `ProductSidebar.tsx:36` `isFree = standardPrice === 0`, `:65` `Complimentary Download` |
| K10 | `product-utils.test.ts:263`, the frozen SFX test |
| K11 | `app/routes/support.tsx` exists |
| K12 | Exactly 1 test file mentions `PurchaseHeader` (`store-theme-tokens.test.ts`, the `bg-buy` count) |
| K13 | The last doc is `213-…`, so the next is 214 |
| K14 | The sha256 of the five owned pre-existing files |
