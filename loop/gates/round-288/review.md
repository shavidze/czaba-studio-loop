COMMIT: OK. The change only affects how prices are shown. No auth, cart, checkout, download or Studio code is touched. Nothing below blocks the commit. The verify log shows typecheck passing, 224 test files and 3358 tests passing, a successful build and lint warnings only.

## Code Review: round-288 (FIX-PD-1a2: unknown price shown on cards)

**Purchase path.** `app/lib/product-utils.ts` feeds the purchase panel through `resolvePurchasePrice` (lines 136–144), which this diff does not change.
- **Real variants:** prices were already checked with `isValidCatalogPrice` before reaching `PurchaseHeader`. The new check in `createDisplayVersions` (line 79) runs before it and does the same thing, so `PurchaseHeader` still gets the same `currentPrice`.
- **Synthetic Standard (id -1):** it still goes through `resolveCatalogPrice`.
- **`PurchaseHeader`:** it already handles a missing price (lines 71, 84, 112, 333). Purchase behaviour is unchanged.

### Critical Issues
- None.

### Suggestions (ranked)
1. **`app/lib/product-utils.ts:131`**: `formatCatalogPriceLabel` accepts any number. In `ProductCard.tsx:35`, the older product shape still uses `Number(product.priceRange?.minVariantPrice?.amount ?? 0)`. A bad amount there gives `NaN`, which the card shows as `$NaN` (and a negative gives `$-5`). This bug existed before, but the new shared function now carries it into all three cards. **Fix:** make the function show "Price unavailable" for any invalid number: `!isValidCatalogPrice(price) ? 'Price unavailable' : ...` (change the parameter type to `unknown` or `number | undefined`). Base `isPriceUnknown` in `ProductCard` on the same check, so the muted style follows.
2. **`VersionSelector.tsx:132`**: if an upgrade card has no known price, it still says "Standard credit applied" under "Price unavailable". That suggests a credit was worked out when it wasn't. **Fix:** `isUpgrade && version.price !== undefined ? 'Standard credit applied' : …`.
3. **`VersionSelector.tsx:33`** (existed before): `version.price - ownedVersionPrice` is never clamped or rounded. A credit larger than the price shows `+$-10`, and decimal prices can show `+$40.00000000000001`. **Fix:** `Math.max(0, …)` and round to cents. Better as a separate task, since `PurchaseHeader.tsx:75` has the same arithmetic.
4. **Free products look different on each surface.** `/store` shows `$0`, the home card shows `Complimentary` and the panel shows `$0.00`. The implementation doc admits this (PD-FREE-HEADER), so it's a known item, not a regression.
5. **Nits:**
   - `product-utils.ts:130`: a new code comment, against CLAUDE.md's "no comments". It does match the file's existing comments at 120 and 135.
   - `product-utils.test.ts:129`: the `await import('../product-utils')` is unnecessary. Add the function to the static import.

**Checks without findings:**
- **Browser behaviour / leaks:** no new effects, listeners or timers.
- **Render cost:** only a few cheap derived values per render; the existing `useMemo` in `ProductDetailPage:31` already caches the version list.
- **Accessibility:** the price is still plain text inside the existing button or link. No new controls, and the existing button type and `aria-pressed` are kept.
- **Tailwind/tokens:** only token classes (`text-muted`, `text-foreground`). `leading-7`/`leading-8` keep the line height the same as the known-price text, so cards don't change height.
- **TS strict:** no `any`, suppression comments or type assertions. The `isValidCatalogPrice` type guard narrows properly. `DisplayVersion.price: number | undefined` now makes every consumer handle the missing case (I searched; only `VersionSelector` and `resolvePurchasePrice` read it).

### Good Practices Found
- All cards and the panel now use one price function, `resolveCatalogPrice`, instead of a separate `?? 0` fallback in each card.
- An explicit `0` stays "free" while a missing price no longer looks free, and tests cover both (PR7, PC2, SC1).
- `isFree` in `ProductCard` no longer advertises a paid product as Complimentary.
- `SC1` tests the real `loader` → render path, not a private helper.
- The doc covers the rejected alternatives and checks that the tests fail when the fix is broken (N1–N10).

### Architecture note
- **Signal (repeated costly changes + coupling):** price display has been changed in rounds 286, 287 and 288. The rules are spread across `product-utils.ts:116-144`, `VersionSelector.tsx:31-34,104-119`, `PurchaseHeader.tsx:71-75`, `ProductCard.tsx:32-37` and `store.tsx:75-83`. Each one decides on its own what "free", "unknown" and "upgrade" mean.
- **Keep for this round:** the code is cohesive and fully tested, and moving it now would mean reopening `PurchaseHeader`, which is out of scope.
- **Proposal for the planner (one bounded task):** create a single price-display function in `lib/` covering unknown, free, regular and upgrade (clamped and rounded). `VersionSelector`, `ProductCard`, `store.tsx` and `PurchaseHeader` would use it, which also settles the free-product wording. Acceptance: existing tests VC1–5, PC1–2, SC1 and PR5–10 stay green, plus new rows for NaN, a negative upgrade and cent rounding. The amounts sent to checkout must not change. Cost: low to medium.

### Alternative Approach (critical logic: purchase-adjacent pricing)
- **Current:** a missing price is `undefined` in the data (`DisplayVersion.price`), and each component chooses how to show it.
- **Alternative:** a tagged value, e.g. `{ kind: 'unknown' } | { kind: 'known'; amount }`, so the compiler forces every case to be handled.
- **Verdict:** keep the current approach. `number | undefined` already makes strict TypeScript flag every place that reads it, matches `PurchaseHeader`'s existing contract, and has less churn. Revisit the tagged value only if the price-display task above goes ahead.

### Score: 8.5/10