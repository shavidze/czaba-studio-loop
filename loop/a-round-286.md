# A round 286 — FIX-PD-1a (F9): catalogue price on the product page, "Price unavailable" state

**Status:** implemented and handed to C. No STOP. Nothing committed.

## Claims (L29)
`bash ../tmp/studio-real-loop/b-round-285/claims-286.sh` was run before any edit. Its output was byte-equal to `claims-286-output.txt` (`diff` returned nothing). HEAD `60bfb38`, clean tree.

## Changed files (exactly the §4 paths)
```
 app/components/product/ProductDetailPage.tsx |  5 +-
 app/components/product/ProductSidebar.tsx    |  6 +-
 app/components/product/PurchaseHeader.tsx    | 51 ++++++++++++---
 app/lib/__tests__/product-utils.test.ts      | 92 ++++++++++++++++++++++++++++   (0 removed lines)
 app/lib/product-utils.ts                     | 25 ++++++++                         (0 removed lines)
 ?? app/lib/__tests__/product-price-unavailable.test.tsx
 ?? docs/implementation/2026/quarter-IV/214-fix-pd-price-fallback.md
```
sha256:
```
57c37d7ef35879a75eaa01c0ad353e9b5da74cb009ece92e2137510211002e80  app/lib/product-utils.ts
0277bb6aecca6c7918858a5cd51dcdb575080c6eae20140963777f64322ad34f  app/components/product/ProductDetailPage.tsx
bfe73e1137f2f1fcc8a273454f3b66808be3aeec11960fb24071e64006c128e4  app/components/product/PurchaseHeader.tsx
8955f2d47ad332e6f9931d50784ebbe4680617a5427e475ed3b3292ea7e3d186  app/components/product/ProductSidebar.tsx
319b8b588d635bf55d58ef9cd7b32a24532e86329acbf9e606d8f60293d7866f  app/lib/__tests__/product-utils.test.ts
ffec52b4c3ace543d8ba9e89251a367c7866b2c0cc7159efc1427f13aa2aee4c  app/lib/__tests__/product-price-unavailable.test.tsx
e48873d087951b83d988d0204766c6714d3fd00ff0d252b77922dbca31086cc0  docs/implementation/2026/quarter-IV/214-fix-pd-price-fallback.md
```

## Implementation notes (all inside the §2 design)
- `resolveCatalogPrice` uses a type guard (`isValidCatalogPrice`, not exported) with `candidates.find`, so it needs no assertion. `resolvePurchasePrice` follows §2.1. `createDisplayVersions` and every other existing function are byte-identical (the diff only adds lines).
- `ProductDetailPage`: `currentPrice = resolvePurchasePrice(product, selectedVersion)`; the `useMemo` is dropped. Everything else is unchanged, including the `'Standard'` fallback and `productVariantId`.
- `PurchaseHeader`:
  - `price: number | undefined`; `isPriceUnknown`; the reason id comes from `useId`.
  - The guard `if (price === undefined) return;` is the first line of both `handleAddToCart` and `handleBuyNow`, before the sign-in check. It is equivalent to the spec's `if (isPriceUnknown) return;`, and it also narrows `price` for the analytics calls.
  - Case 3 is gated by `upgradePrice !== undefined && upgradePrice > 0`, which is equivalent to `price !== undefined && price - ownedPrice > 0`.
  - The default panel shows `Price unavailable` (`text-2xl font-light text-muted tracking-tight`). Buy Now gets `aria-disabled={isPriceUnknown || undefined}` and `aria-describedby`. `CartButton` gets the same, except in its `alreadyInCart` state (navigation keeps working).
  - The reason `<p id>` reads `Price unavailable — ` + `<Link to="/support">contact us</Link>` + ` to buy it.`
  - Exactly one `bg-buy` class attribute remains (`grep -c bg-buy` = 1). No focus-variant classes were added.
- **Deviation worth C's eye (cursor):** `app/styles/app.css:483` has an **unlayered** `button { cursor:pointer }`. It beats every layered Tailwind utility, so a plain `aria-disabled:cursor-not-allowed` measured `cursor: pointer` in the browser. The same rule silently voids HEAD's existing `disabled:cursor-not-allowed` on these buttons (pre-existing; not touched). I used `aria-disabled:cursor-not-allowed!` (important modifier; the pattern already exists in `app/components/arrangement/ArrangementTransport.tsx` and `ArrangementTempoRow.tsx`). Computed cursor is now `not-allowed` at both viewports.
- `ProductSidebar`: `isFree = resolveCatalogPrice(product) === 0`; the local `standardPrice` constant is removed.

## Tests actually run
| Check | Result |
|---|---|
| `npm run typecheck` | rc 0 |
| `npm run lint` | rc 0 (warnings only; repository-wide pre-existing) |
| Biome scoped to the 6 owned code/test files | 1 warning, `ProductSidebar.tsx:61` `useButtonType` on the "Complimentary Download" button. It is identical on HEAD (`:63`), so pre-existing and not fixed |
| `npx vitest run` on the 6 covering files + the new file | **7 files / 124 tests pass** (HEAD baseline 6 / 111; +6 PR rows, +7 PU rows). Log: `a-round-286/covering-run.txt` |
| No test is slow (L11) | The slowest file is the new one, 654 ms total |

`product-presentation.test.tsx` prints 6 `useLayoutEffect does nothing on the server` warnings. They are pre-existing: the same 6 appear on a `git archive HEAD` copy (`/tmp/a286-head`).

## Mutants (script `a-round-286/mutants.py`, output `a-round-286/mutants.txt`)
Each mutant was applied to the tree, both test files were run, the original was restored and its sha256 re-checked (all OK).

| Mutant | Change | Required red | Red observed |
|---|---|---|---|
| M1 | `resolveCatalogPrice` `… ?? 0` | PR2, PR5, PU2 | PR2, PR5, PU2, PU3, PU4, PU7 ✅ |
| M2 | remove the `handleBuyNow` guard | PU3 | PU3, PU4 ✅ |
| M2b | remove the `handleAddToCart` guard | PU3 | PU3, PU4 ✅ |
| M3 | `disabled` instead of `aria-disabled` (both buttons) | PU2 | PU2 ✅ |
| M4 | sidebar `isFree` back to the `?? 0` chain | PU7 | PU7 ✅ |
| M5 | `resolvePurchasePrice` always returns the catalogue price | PR4, PU6 | PR4, PR6, PU6 ✅ |

M1 is red at more rows than required, by mechanism: a missing price resolves to 0, so PU3/PU4 see enabled buttons and the handlers fire, and PU7 goes red because the sidebar shares `resolveCatalogPrice`. §3.3 "must turn red at" is a lower bound. M2 and M2b are also red at PU4 (same guard, signed in). M5 goes red at PU6 because PU6 also selects Premium and expects `$99.00`. With variants Standard 29 / Premium 99, the catalogue fallback is 29 too, so the Standard assertion alone could not catch M5.

## Browser (Playwright + installed Chromium, dev server :5173)
- **Required smoke.** Standard mock started from the loop folder (`node mock-api/server.mjs`), health `{"ok":true,"products":8}`. On `/products/door-slams` at 1440×900 the panel reads `TOTAL PRICE $9.00USD Add to Cart Buy Now`. The page has no `$0.00` anywhere, both buttons are enabled with no `aria-disabled`, and there is no "Complimentary Download". `middle-east` was checked as a control: `$29.00USD`. Evidence: `a-round-286/smoke.json`, `a-door-slams-1440.png`, `a-middle-east-1440.png`. The mock was stopped by PID.
- **Extra A probe, not a substitute for C's B-UNKNOWN.** I made a copy of the mock in `a-round-286/mock-priceless.mjs` with `priceless-pack` (id 9, no price fields); the original was not edited. Results at both 1440 and 1280:
  - the panel reads `TOTAL PRICE Price unavailable Add to Cart Buy Now Price unavailable — contact us to buy it.` and contains no `$`;
  - both buttons have `aria-disabled="true"` and no `disabled`; opacity 0.5, cursor `not-allowed`;
  - `aria-describedby` resolves to the exact reason text;
  - after a mouse click at the centre plus Enter and Space on each button: 0 dialogs and **0** `/api/cart|auth|orders` requests;
  - the `contact us` link navigates to `/support`;
  - there is no "Complimentary Download".

  Evidence: `a-round-286/probe-unknown.json`, `a-priceless-1440.png`, `a-priceless-1280.png`. The copy mock was stopped by PID, and nothing is listening on :5199 now.
- **For C (B-UNKNOWN network row):** every product page load sends one `GET /api/cart` from the frozen `CartContext` initial load (phase `load` in the probe). Scope the "no request" check to requests **after activation**, or that row would fail on HEAD for any page.

## code-reviewer (real subagent run) and what I did
- **"High": a priceless *Track* still shows `$0` in the `VersionSelector` version card.** This is because `createDisplayVersions` keeps `?? 0` (frozen [K6]; PR5 pins it per the task). It is not a regression against HEAD: HEAD showed `$0.00` in the panel and allowed a $0 purchase. Now the panel says unavailable and purchase is blocked, but the version card's `$0` remains. The fix needs the frozen `createDisplayVersions` or `VersionSelector`. No mock fixture is a priceless Track. **Signal for B: A-R286-REVIEW-TRACK-VERSION-ZERO (suggest Medium, F9 remainder).**
- **Medium, test strength.** PU6 did not pin the analytics price or the signed-in `buyNow` arguments. **Fixed:** PU6 now asserts that `trackAddToCart`/`trackFBAddToCart` and `trackBeginCheckout`/`trackFBInitiateCheckout` get `{productId:'1', productTitle:'Middle East', productPrice:29, currency:'USD'}`, and that signed-in Buy Now calls `buyNow(1, 21)`.
- **Medium, test strength (left as is, documented).** jsdom does not synthesize a click from Enter or Space on a button, so the key presses in PU3/PU4 only prove that no keydown handler acts; the click is the real check. Real keyboard activation is covered by my browser probe and C's B-UNKNOWN. Also untested in unit: unknown price + `alreadyInCart` ("In Cart" still navigates), and owned Standard + priceless Premium (Case 3 falls through to the default panel).
- **Medium (not changed).** The PR2 helper assigns `JSON.parse` to `Partial<Product>`. The task explicitly allows `JSON.parse` for the `null` case, and the code has no `as` or `any` token.
- **Low → candidates for `deferred_low_polish`:**
  - `hover:` styles still apply on soft-disabled buttons (`hover:bg-buy-hover`, `hover:bg-elevated`). Not changed, to keep the `bg-buy` scan and class surface minimal. Signal A-R286-REVIEW-HOVER-SOFT-DISABLED.
  - A screen reader hears "Price unavailable" twice (figure + reason). This is the spec'd copy.
  - The two English one-line helper comments were required by task §2.1.
- **Architecture note (backlog signal for B/root, not acted on):** price resolution now lives in two places. `DisplayVersion.price` can be a synthetic 0, while `resolvePurchasePrice` treats it as unknown. Proposal: make `DisplayVersion.price` `number | undefined` so `VersionSelector` and `PurchaseHeader` share one resolver; this would also close the Track version-card `$0`. Keep for now; extract as a bounded B task.

## Known gaps
- C's B-KNOWN, B-UNKNOWN, B-SIDEBAR, B-REGRESS, B-JOURNEY and G286-AUTH rows have not been run by A beyond the probes above. The HEAD-vs-A bbox and price equality comparison was not done by A.
- The priceless-Track version-card `$0` remains (above).
- PD-FREE-HEADER (explicit 0 renders `$0.00` in the header) is out of scope, as the task states.

## Acceptance criteria A actually checked
- §2.1–§2.4 implemented as specified (except the cursor `!`, explained above).
- §3.1 PR1–PR6 exist once each, append-only (0 `-` lines).
- §3.2 PU1–PU7 exist once each.
- §3.3: every mutant is red at its rows.
- §7 steps 1–7 done (claims, edits, typecheck, lint, 7 covering files, mutants, 1440 smoke, code-reviewer).
- Doc 214: line 4 reads `**სტატუსი:** Completed (C round 286 PASS)`, the same format as doc 213. It has TEMPLATE's 7 headings in order and cites only PR1–PR6, PU1–PU7, M1–M5 and M2b.

## Next C checks (exact)
1. SOURCE-SCOPE: `git status` = the 7 paths above. `git diff app/lib/__tests__/product-utils.test.ts app/lib/product-utils.ts | grep -c '^-[^-]'` = 0.
2. UNIT and UNIT-MUTANTS: `npx vitest run $(cat ../tmp/studio-real-loop/b-round-285/covering-files.txt) app/lib/__tests__/product-price-unavailable.test.tsx` gives 124/124. Re-run the mutants with your own copy of `a-round-286/mutants.py`.
3. B-UNKNOWN with your own `c-round-286/mock-priceless.mjs`. Count only post-activation API requests. Click soft-disabled buttons with `page.mouse.click` (L25). Check the cursor and the Tab order (preview button → Add to Cart → Buy Now → contact us).
4. B-KNOWN, B-REGRESS (middle-east $29/$99, copper-horizon $19, harbour-lights $24, bbox ±1 px vs HEAD), B-JOURNEY over the 7 active products, B-SIDEBAR, G286-AUTH, DOC-214.
