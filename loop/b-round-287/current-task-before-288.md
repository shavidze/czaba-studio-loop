# Round 287: FIX-PD-1a2, the rest of F9 (C-R286-01 Medium + C-R286-02 Low). An unknown price never shows as `$0`: not on the version card, not on the `/store` card, not on the home product card

**Planned by:** B, at the round 286 → 287 planning, 2026-10-31.

**Decisions** (full text in `backlog.json` → `decisions_log_b`):
- **D-29z700:** round 286 closed with C PASS (`browserVerified` and `realVerified` true), and gate 286 published `096fa4b`. FIX-PD-1a, as scoped, is **მზადაა**. F9 is **not** closed: its remainder is C-R286-01 and C-R286-02, and this round is stage FIX-PD-1a2.
- **D-29z701:** C-R286-02 (Low) is fixed now and not deferred. It has the same cause as the Medium (an unknown price collapses to 0 through `?? 0`), it needs the same fixtures, and the L54 rule says card = page. That makes it one of the "≤ 3 tightly related bugs".
- **D-29z702:** the design (§2). The reviewer's architecture note A-R286-ARCH-ONE-RESOLVER is adopted here because fixing the Medium means changing that line anyway. It is not a scheduled refactor.
- **D-29z703:** A's Lows and signals from round 286 go to `deferred_low_polish` or stay as signals (`b-round-286.md` §1).

**Owner:** A. **Verifier:** C. **Grants:** §4. The round touches no Studio, auth, cart, checkout or purchase-header code.

## Baseline: HEAD `096fa4b` [K1], clean tree [K2]
- `gates/gate-round-286.json` is `published` at commit `096fa4b`. Its `head` field reads `60bfb38`; the commit field is the baseline.
- **Claims (L29):** from `store/`, run `bash ../tmp/studio-real-loop/b-round-286/claims-287.sh` **before editing**. Its output must equal `b-round-286/claims-287-output.txt`. On an archive, only K1 may differ, and it then reads `(archive)`. Any other difference is a STOP (§9).

## 0. Read first
1. `lessons.md` (every role), especially L11, L23, L25, L26, L28, L29, L49 and L54.
2. This task, then `tasks/round-286.md` §2 for the round-286 design this round builds on.
3. `c-round-286.md` §"Findings for B" and `a-round-286.md` §"code-reviewer".
4. A's primitives:
   - `AGENT_DISCOVERABLE_CODE.md` (one new export)
   - `FORWARDREF_COMPONENT.md` (component edits)
   - `DESIGN_TOKENS.md` and `TAILWIND_FIRST.md` (the muted price style)
   - `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md`
   - `GEORGIAN_DOCS.md`
   - `.claude/prompts/new-test.md`

## 1. What C found, and the reference

### 1.1 The defects (evidence from C, not B)
- **C-R286-01 (Medium).** `/products/priceless-track` is a Track with no price fields (C's `c-round-286/mock-priceless2.mjs`, id 10). Its purchase panel correctly reads `Price unavailable`, but the Standard version card on the same page reads **`Standard $0`**, at 1440 and at 1280. HEAD `60bfb38` shows the same card. Evidence: `c-round-286/probe/extra-{dev,head}.json`, `shots/priceless-track-{1440,1280}.png`.
  - **Cause:** the synthetic Standard version is built with `… ?? 0` [K4, line 92], and `VersionSelector` renders `${version.price}` [K7].
- **C-R286-02 (Low).** The `/store` card for `priceless-pack` reads **`$0`** while its page reads `Price unavailable`. Evidence: `c-round-286/probe/unknown-dev.json` (`cards`), `shots/unknown-dev/priceless-store-card-*.png`.
  - **Cause:** `mapProductToPack` ends its chain with `?? 0` [K8].
  - **Same chain on the home page:** `ProductCard` (home `ProductSection`) has it too [K10]. Its unknown price would show **`Complimentary`**, which is worse: it advertises a free product.
- **Correction of round 286's §1.2:** it quoted the card rule without its trailing `?? 0`. C was right about this.

### 1.2 Consumer sweep (L49, `SWEEP`)
Where a catalogue or version price reaches the screen on HEAD:
- **Version card:** `VersionSelector.tsx` lines 32, 55, 105, 107, 114 [K7]. Fixed here.
- **Purchase panel:** `PurchaseHeader`. Already correct since round 286, and **unchanged** here.
- **`/store` card:** `store.tsx:79/552` [K8, K9]. Fixed here.
- **Home card:** `ProductCard.tsx:32/35/36/157` [K10]. Fixed here (API branch only).
- **Sidebar:** `ProductSidebar` already uses `resolveCatalogPrice` (round 286). Unchanged.
- **Not in scope:**
  - The `ProductCard` in `account.downloads.tsx:52` [K11] is a **different, local component** in a protected file. Do not touch it, and do not confuse it with the shared one in a grep.
  - `RelatedTracksCarousel.tsx:120` and `TrackRow.tsx:149` take an already-formatted price from their caller. Neither is rendered by any route at HEAD (B's grep found no consumer). They are recorded as signal B-R286-UNUSED-PRICE-RENDERERS, not fixed.
  - The legacy Shopify branch of `ProductCard` (`priceRange.minVariantPrice.amount`) is unchanged.

### 1.3 Reference and design
- **Reference:** none found. Round 286 searched the competitor and gallery research for an unknown-price state and found none (D-29z697); B adds no new reference.
- **Design:** this is a bug fix-up, so no `product-designer` consult is required. The smallest honest behaviour that fits Saba's F9 decision and round 286's chosen state is the same words, `Price unavailable`, in the existing price slot of each card. The styling is muted and lighter, so it does not read as a price.
  - **Rejected: "—".** It is ambiguous, and it is a different word from the panel's.
  - **Rejected: hiding the price slot.** It would make the card layout jump, and it is a different state from the page's.
- **Explicit 0 stays exactly as it is:** `$0` on the `/store` card, `Complimentary` on the home card, and `$0.00` in the panel. PD-FREE-HEADER stays a STORE-4 signal.
- **Ableton conformity:** does not apply (Store pages). **Screen budget:** does not apply to `/studio-lab`.

### 1.4 Why we missed it
Round 286 froze `createDisplayVersions` to keep the SFX `[]` test byte-identical, and its §1.2 quoted the card rule without its trailing `?? 0`. No row in round 286 rendered a priceless **Track** or a priceless card. C added both fixtures on its own initiative. L54 (card = page) and L49 (consumer sweep) already cover this. No new lesson is added; the file stays at 60 lines.

## 2. The change (D-29z702)

### 2.1 `app/lib/product-utils.ts`
- **The type.** `DisplayVersion.price` becomes `number | undefined` [K3]. **`undefined` means the price is unknown**; `0` stays the "free" state.
- **The synthetic Standard** [K4, line 92]: `price: resolveCatalogPrice(product)`.
- **Real variants** [K4, line 79]: `price: isValidCatalogPrice(variant.price) ? variant.price : undefined`. `isValidCatalogPrice` stays module-private [K6].
- **Unchanged:**
  - the SFX `return [];` [K5];
  - the Premium guard and its `price: product.premiumPrice` [K4, line 100];
  - `resolveCatalogPrice`;
  - `resolvePurchasePrice`. Its results for every PR row must stay the same; do not simplify it in this round;
  - every other function.
- **One new export:** `formatCatalogPriceLabel(price: number | undefined): string`.
  - It returns exactly `Price unavailable` for `undefined`, and `` `$${price}` `` otherwise. For example, 0 → `$0` and 29 → `$29`, the same format as today's cards.
  - It gets a one-line English comment (`AGENT_DISCOVERABLE_CODE.md`).
- **Rules:** TypeScript strict, no `any`, no type assertions, no `@ts-ignore`.

### 2.2 `app/components/product/VersionSelector.tsx`
- **`getUpgradePrice`** returns `number | undefined`. It returns `undefined` when `version.price` is `undefined`, and otherwise `version.price - ownedVersionPrice`, exactly as today.
- **The price slot of each card:**
  - **Upgrade with a known upgrade price:** exactly as today (`+$N` and the struck-through `$price`).
  - **Price unknown (any card, upgrade or not):** the text `Price unavailable`, styled `text-sm font-light text-muted`. There is no `$`, no `+$` and no struck-through figure.
  - **Otherwise:** exactly as today (`$price`).
- **Unchanged:**
  - selection, `aria-pressed`, ownership, the badges (Upgrade, Premium, Owned), the "Standard credit applied" line and the formats/stems lines;
  - every class except the one new conditional for the unknown price;
  - no focus-variant class is added (`store-focus-ring` STF scans).

### 2.3 `app/routes/store.tsx`
- **`Pack`** gains `isPriceUnknown: boolean`.
- **`mapProductToPack`** [K8]:
  - `const catalogPrice = resolveCatalogPrice(product);`
  - `price: formatCatalogPriceLabel(catalogPrice)`
  - `isPriceUnknown: catalogPrice === undefined`
- **The render** [K9]: the same `<span>`. When `pack.isPriceUnknown`, its class is `text-sm font-light text-muted`; otherwise it stays byte-identical to today's `text-2xl font-bold text-foreground`.
- Nothing else in the route changes: no loader, meta, filter, focus or theme change.

### 2.4 `app/components/product/ProductCard.tsx` (API branch only)
- `priceAmount` for an API product becomes `resolveCatalogPrice(product)`, of type `number | undefined`. The legacy branch is unchanged.
- `isFree` stays `priceAmount === 0`. An unknown price is **not** free, so it gets no `Complimentary` text and no `Complimentary` badge.
- `price` becomes `isFree ? 'Complimentary' : formatCatalogPriceLabel(priceAmount)`.
- **The render** [K10, line 157]: the same `<span>`. When the price is unknown, its class is `text-sm font-light text-muted`; otherwise it stays byte-identical.
- The badge order is otherwise unchanged. A priceless pack keeps its `Pack` badge (`isPack && !isFree`).

### 2.5 What must not change
- `PurchaseHeader.tsx`, `ProductDetailPage.tsx`, `ProductSidebar.tsx`, the cart/checkout/auth code and the analytics price.
- For every product with a known price, every visible price string on the page, the `/store` card and the home card is byte-identical to HEAD.

## 3. Tests
Read the existing patterns first. `product-presentation.test.tsx` renders `VersionSelector` with `renderToStaticMarkup`; store tests render routes with `createRemixStub`.

### 3.1 Tests that change on purpose (the 2026-10-28 rule: no change may be a bare assertion removal)
| File:line | Before | After | Why |
|---|---|---|---|
| `product-utils.test.ts:347` [K12] | `expect(standard?.price).toBe(0);` | `expect(standard?.price).toBeUndefined();` | The contract changes: the synthetic Standard of a priceless Track is unknown, not 0. This is the only edited line in the file; everything else is appended |

**Unchanged:**
- `product-utils.test.ts:134–161` (known variant prices);
- `bug-hunting/product-utils-bugs.test.ts:76` (19.99);
- `product-presentation.test.tsx:44–45` and `56–57` (149 and 49);
- the frozen SFX test [K13];
- PR1–PR6, except that one line of PR5.

If any other existing assertion turns red, that is a STOP (§9). Do not rewrite it.

### 3.2 `app/lib/__tests__/product-utils.test.ts`: append one `describe('display version and card price labels', …)`
| Row | What it checks |
|---|---|
| PR7 | `createDisplayVersions`: a priceless Track's Standard has `price === undefined`. A Track with `standardPrice` 19 has Standard 19. A Track with `minPrice` 7 has Standard 7. A Track with `standardPrice: 0` has Standard `0`, not `undefined` |
| PR8 | A real variant with price 49 keeps 49. A real variant whose price is `NaN` or `-1` (built through a typed helper or `JSON.parse`, with no `as`) gets `price === undefined` |
| PR9 | `formatCatalogPriceLabel`: `undefined` → `Price unavailable`; 0 → `$0`; 29 → `$29`; 12.5 → `$12.5` |

### 3.3 New file `app/lib/__tests__/product-price-cards.test.tsx`
| Row | What it checks |
|---|---|
| VC1 | `VersionSelector` with the versions of a priceless Track (a single Standard): the markup contains `Price unavailable` and no `$` |
| VC2 | A Track with no Standard price and `premiumPrice` 99: the Standard card reads `Price unavailable`, the Premium card reads `$99`, and there is no `$0` and no `NaN` |
| VC3 | `ownedVersionType="standard"`, `ownedVersionPrice` 50, and a real Premium variant whose price is `NaN` (so `undefined` after mapping): the Premium card shows the Upgrade badge and `Price unavailable`, with no `+$`, no `NaN` and no `$` |
| VC4 | Known-price regression: round 286's existing upgrade case (Standard 80, Premium 199, credit 50) still renders `+$149` and `$199`, and a plain known-price render (Universal 49) still renders `$49`. Neither contains `Price unavailable`. Assert these price-slot substrings, not whole-markup equality: inserting a ternary into the class template literal may change whitespace without changing behaviour. `product-presentation.test.tsx:44–45` and `56–57` stay the existing pins |
| PC1 | `ProductCard` (API product, no price fields, `category: 'SFX'`): the text `Price unavailable` is present; `Complimentary` and `$` are absent; the `Pack` badge is present |
| PC2 | `ProductCard` explicit 0: `Complimentary` is present (as on HEAD). `standardPrice` 9: `$9`, and no `Complimentary`, `Price unavailable` or `$0` |
| SC1 | `/store` route via `createRemixStub` with a loader returning two packs mapped from products (priceless, and `standardPrice` 29). If the route's loader cannot be stubbed without touching frozen code, test `mapProductToPack` behaviour through the rendered route only, never by exporting it. Expect: the priceless card reads `Price unavailable` with no `$0`, and the other reads `$29`. If rendering the route needs a frozen-file change, drop SC1, say so in the report, and C's B-STORE-CARD row carries it |

Wrap `ProductCard` in `MemoryRouter` or `createRemixStub`, as existing store tests do. It renders `AudioPreviewButton`: mock only what existing tests already mock for it.

### 3.4 Mutants (A runs them and records which rows go red; C re-runs them)
Each mutant is applied to A's tree, and it must turn red at least at the rows listed (L23: a lower bound).

| Mutant | Change | Must go red at |
|---|---|---|
| N1 | The synthetic Standard back to `… ?? 0` | PR5, PR7, VC1 |
| N2 | `VersionSelector` renders `${version.price ?? 0}` with no unknown branch | VC1, VC2 |
| N3 | `formatCatalogPriceLabel(undefined)` returns `$0` | PR9, PC1 |
| N4 | `ProductCard` `isFree` becomes `(priceAmount ?? 0) === 0` | PC1 |
| N5 | The real-variant price passes through unvalidated (`price: variant.price`) | PR8 |
| N6 | `getUpgradePrice` returns `(version.price ?? 0) - ownedVersionPrice` and the upgrade branch ignores the unknown case | VC3 |

## 4. Grants (exact)
**Allowed changes:**
- **M** `app/lib/product-utils.ts`: §2.1 only.
- **M** `app/components/product/VersionSelector.tsx`
- **M** `app/routes/store.tsx`: §2.3 only. This route is not in `global_forbidden_files`.
- **M** `app/components/product/ProductCard.tsx`: §2.4 only.
- **M** `app/lib/__tests__/product-utils.test.ts`: line 347 as in §3.1, plus an appended block.
- **??** `app/lib/__tests__/product-price-cards.test.tsx`
- **??** `docs/implementation/2026/quarter-IV/215-fix-pd-card-price-unknown.md` (next free number [K15])

**Everything else is frozen.** In particular:
- `PurchaseHeader.tsx`, `ProductDetailPage.tsx` and `ProductSidebar.tsx`;
- `app/contexts/CartContext.tsx`, `app/services/api/**` and every other route;
- the auth files (`app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `app/lib/firebase.client.ts`);
- the protected `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts` and `app/routes/account.downloads.tsx`;
- every Studio file;
- `package.json` and the lock file;
- every loop file, including `mock-api/server.mjs`.

If typecheck reports a consumer of `DisplayVersion.price` outside the granted files, that is a STOP (§9). B's sweep found none.

## 5. Doc 215 (Georgian, technical terms in English)
- Follow the `docs/implementation/TEMPLATE.md` headings, in order.
- **Line 4** is exactly `**სტატუსი:** Completed (C round 287 PASS)`, the same format as docs 213 and 214 (L28).
- **Content:**
  - the context: C-R286-01, C-R286-02, and the home-card `Complimentary` risk;
  - the approach: §2, with the rejected options from §1.3 and from A-R286-ARCH-ONE-RESOLVER;
  - the changed files;
  - Problem → Solution;
  - the testing. Cite only rows that exist: PR5 (changed line), PR7–PR9, VC1–VC4, PC1–PC2, SC1 if it exists, and N1–N6 (L26);
  - the TODO: FIX-PD-1b, PD-FREE-HEADER (STORE-4), B-R286-UNUSED-PRICE-RENDERERS.

## 6. The browser contract
- **Servers.** C runs the dev server :5173 (already up) and a mock API on :5199. The pages are SSR-loaded, so `page.route` cannot fake a product.
- **Fixtures (scratch only).** C reuses its own `c-round-286/mock-priceless2.mjs` (it has `priceless-track` id 10 and `priceless-pack` id 9) as a copy in `c-round-287/`. For B-FREE, C adds one active SFX fixture to that copy: `free-pack`, `standardPrice: 0`, `minPrice: 0`. `mock-api/server.mjs` itself is never edited. C restores the standard mock at the end (`/__mock/health` → `products: 8`).
- **Builds.** C compares HEAD `096fa4b` with A's tree, each as its own build with its own port and `cacheDir` (L38), with a warm-up before measuring. Alternatively, C may use the :5173 dev server for A and a scratch HEAD build.
- **Backend-only rows.** The owned-Standard upgrade state is unit only (VC3, VC4). In the browser it is **BLOCKED: backend unavailable in cloud** (the mock's auth returns 401). That does not make `browserVerified` false.

## 7. What A runs (speed rules)
1. Run the claims (see Baseline).
2. Make the edits.
3. Run `npm run typecheck` and `npm run lint`.
4. Run `npx vitest run` on the 7 covering files in `b-round-286/covering-files.txt` plus the new test file. The HEAD baseline is 7 files / 124 tests passing (`b-round-286/covering-run-head.txt`). Afterwards, every pre-existing test must still pass; only the PR5 line in §3.1 changes.
5. Run mutants N1–N6. Restore the tree after each one and check its sha256.
6. Run one browser smoke at 1440 with the standard mock:
   - from the loop folder: `node mock-api/server.mjs > a-round-287-mock.log 2>&1 &`;
   - check `curl -s http://127.0.0.1:5199/__mock/health` (`products: 8`);
   - `/store` must show the 7 known card prices unchanged;
   - `/products/middle-east` must show the version cards `$29` / `$99`;
   - stop the mock by its PID, not with `pkill -f`.
7. Run `code-reviewer`; the round changes 3 or more files.

**Report in `a-round-287.md`:** the diff stat, the test counts, the mutant table, the sha256 of the 7 changed paths, and any code-reviewer Architecture note (passed on as a backlog signal). Do not run the full suite or `npm run verify`; the gate does.

## 8. C rows (both viewports, 1440×900 and 1280×720, unless stated)
| Row | Check |
|---|---|
| CLAIMS | `claims-287.sh` on a `git archive 096fa4b` scratch equals `claims-287-output.txt`, except K1 `(archive)`. Run the L29 untagged-fact sweep of this task |
| SOURCE-SCOPE | `git status` lists exactly the §4 paths. `git diff app/lib/__tests__/product-utils.test.ts` shows exactly one `-` line (line 347), and the rest are `+` lines. `PurchaseHeader`, `ProductDetailPage`, `ProductSidebar`, `CartContext`, `client.ts`, the protected routes and the auth files are unchanged against `096fa4b` |
| TYPECHECK | `npm run typecheck` rc 0 |
| UNIT | The 8 covering files pass. PR7–PR9, VC1–VC4, PC1–PC2 (and SC1 if present) each exist exactly once by name |
| UNIT-MUTANTS | C re-runs N1–N6 on its own copy; each is red at least at its §3.4 rows |
| B-VERSION-CARD | `/products/priceless-track` on A:<br>• the page text contains no `$0`, `$NaN` or `NaN`;<br>• the version card reads `Standard` and `Price unavailable`;<br>• the purchase panel still reads `Price unavailable`, with both buttons `aria-disabled="true"`;<br>• the version card's bbox is equal to HEAD's ±1 px.<br>Compare with HEAD's `Standard $0`. Screenshot the card on HEAD and on A |
| B-STORE-CARD | `/store` on A: the `priceless-pack` and `priceless-track` cards read `Price unavailable` (computed colour = the `muted` token value), and there is no `$0` on either card. The card's outer bbox is equal to HEAD's ±1 px. Screenshot both cards |
| B-HOME-CARD | `/` (home `ProductSection`) on A:<br>• if the priceless fixtures appear in it, their cards read `Price unavailable`, with no `Complimentary` text or badge and no `$0` (HEAD: `Complimentary`);<br>• if they do not appear (sort or page size), write that, with the reason, and the unit rows PC1/PC2 carry it. That is not a FAIL |
| B-FREE | With `free-pack` (explicit 0): the `/store` card reads `$0`, the home card reads `Complimentary` if it appears, and the product page panel is the same on HEAD and A. Explicit 0 is unchanged |
| B-REGRESS | On A versus HEAD, for the 7 standard active fixtures:<br>• each `/store` card price string, each home card price string, each product page panel figure and each version-card price text is byte-equal;<br>• `middle-east` version cards read `$29` / `$99`;<br>• each card's price-span bbox is equal ±1 px |
| B-JOURNEY (L54) | For all 9 active fixtures (7 + `priceless-track` + `priceless-pack`): the `/store` card price label equals the product page's price figure (`Price unavailable` ↔ `Price unavailable`; `$N` ↔ `$N.00`). Screenshot the card, then the page, for `priceless-track` |
| R286-KEEP | Round 286's state still holds on `priceless-pack`: `Price unavailable`, both buttons `aria-disabled="true"`, and no `/api/cart*`, `/api/auth*` or `/api/orders*` request after a click, Enter or Space (only post-activation requests count). `door-slams` still shows `$9.00` |
| G287-AUTH | Fresh context, no credentials:<br>• `/studio-lab` shows the demo badge, `auth_user` is null, and Add is present;<br>• `/studio/middle-east` shows `Sign in required` with 0 `audio[src]`;<br>• `/api/studio-token?product=middle-east&file=stem-01.wav` returns 401 with no header, and with a fake bearer it is not 200 and has no token.<br>A real-backend 403 is BLOCKED: backend unavailable in cloud |
| DOC-215 | Line 4 is byte-exact. The headings equal TEMPLATE's, in order. Every cited row id exists |
| gate | The full suite, the build, Biome, `verify` and `test:e2e:smoke` are the gate's rows. C does not claim them |

C may consult `product-designer` in review mode (at most 7 findings) on the three unknown-price slots.

## 9. STOP conditions (L11)
Write a STOP and change nothing else when:
- the claims output differs;
- a frozen file would need a change, including another consumer of `DisplayVersion.price`;
- an existing assertion other than the PR5 line turns red;
- the SFX `[]` test would need a change;
- a required row cannot be written without a type assertion.

## 10. Neighbour risk
- **The purchase panel and buttons.** `resolvePurchasePrice` is unchanged and the synthetic Standard's resolved price is the same value, so the panel and the cart arguments stay as in round 286 (R286-KEEP, B-REGRESS).
- **The upgrade card.** Its known-price arithmetic is unchanged (VC4).
- **Free products (explicit 0).** They are unchanged everywhere (PR7, PC2, B-FREE).
- **The theme and focus scans.** `store-theme-tokens` and `store-focus-ring` cover `store.tsx`, `ProductCard.tsx` and `VersionSelector.tsx`; they must stay green. Use tokens only.
- **Card layout.** The muted label must not wrap the price row or change the card height (bbox rows).
- **The scan constraints for the three edited components.**
  - The new conditional style goes inside the element's existing `className` value (a ternary in the template literal or string). Do not add a second `className`.
  - Add no `focus:`/`focus-visible:` token, `ring-*`, `outline-*` or `opacity-0` hover-reveal wrapper. `store-focus-ring` STF2 forbids focus-variant tokens, and STF6(c) expects exactly one hover-reveal wrapper in `ProductCard`.
  - Use the colour tokens only (`text-muted`); there are no raw hex values (`store-theme-tokens`).
  - `mapProductToPack` is the only constructor of `Pack` (`store.tsx:72`, used at `:101`), so the required `isPriceUnknown` field needs no other change.

## 11. Outcome, fixed in advance
- **PASS:** every runnable row passes at both viewports, with `browserVerified` true. FIX-PD-1a2 then becomes **მზადაა** after gate publication; C-R286-01 and C-R286-02 close, and F9 closes. The next round is FIX-PD-1b, unless REGRESSION falls due first (it is due when planning happens on or after 2026-11-02).
- **Fix-up:** any Medium or higher finding in B-VERSION-CARD, B-STORE-CARD, B-HOME-CARD, B-FREE, B-REGRESS or R286-KEEP makes the next round a fix-up.
- **Lows:** they go to `deferred_low_polish`, unless this round's files own them cheaply.

## 12. Deliverables
- **A:** the §4 files and `a-round-287.md` (with a checkpoint).
- **C:** `c-round-287.md`, `c-round-287.json` and the evidence in `c-round-287/`.

## Claims block (L29)
Every fact in this task about current code carries a K tag from `b-round-286/claims-287.sh`. The output is in `claims-287-output.txt`.

| Tag | Fact |
|---|---|
| K1 | HEAD `096fa4b` |
| K2 | Clean tree |
| K3 | `product-utils.ts:17` `price: number;` (`DisplayVersion`) |
| K4 | `:79` `price: variant.price,`; `:92` the synthetic Standard's `… ?? 0`; `:100` `if (product.premiumPrice) {` |
| K5 | `:85` the SFX `return [];` |
| K6 | `:116` the private `isValidCatalogPrice`; `:121` `resolveCatalogPrice` and `:131` `resolvePurchasePrice`, both exported |
| K7 | `VersionSelector.tsx:32` the upgrade subtraction, `:55` `upgradePrice`, `:105` `+${upgradePrice}`, `:107` and `:114` `${version.price}` |
| K8 | `store.tsx:79`, the card chain ending in `?? 0` |
| K9 | `store.tsx:552`, `{pack.price}` |
| K10 | `ProductCard.tsx:32` the API chain ending in `?? 0`, `:35` `isFree`, `:36` the `Complimentary` / `$` label, `:157` the render |
| K11 | `account.downloads.tsx:52`, a local `ProductCard` (protected, out of scope) |
| K12 | `product-utils.test.ts:347`, `expect(standard?.price).toBe(0);` |
| K13 | `product-utils.test.ts:263`, the frozen SFX test |
| K14 | The test files that import `createDisplayVersions`, `VersionSelector` or `ProductCard` |
| K15 | The last doc is `214-…`, so the next is 215 |
| K16 | The sha256 of the five owned pre-existing files |
