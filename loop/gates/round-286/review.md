COMMIT: OK. The diff does change purchase UI. It adds `price === undefined` guards in `PurchaseHeader`, but the auth, cart, checkout and download contracts are unchanged. Root, please confirm this fits your "purchase code must be none" rule, or override to BLOCK.

## Code Review: FIX-PD-1a (round 286): ProductDetailPage, PurchaseHeader, ProductSidebar, product-utils, tests, doc 214

### Critical Issues
- None.

### Findings (most important first)

1. **Purchase UI touched (decision for root)**: `PurchaseHeader.tsx:84` and `:112`
   - Both handlers now start with `if (price === undefined) return;`. This runs before the existing sign-in check, so it only removes actions and adds no new auth path.
   - I checked that these are unchanged:
     - The `addToCart(productId, productHandle, productVariantId)` and `buyNow(productId, productVariantId)` call shapes. The new test PU6 checks them.
     - `useCart`, `CartContext`, `apiClient`, the checkout flow, the `/account/downloads` links and the `openModal('signin')` gate. None of them are in the diff.
   - The change is limited to the round's own scope (doc 214, F9). If root reads the rule literally (no edits to that file at all), this becomes a BLOCK, and nothing else in the diff needs fixing.

2. **Disabled-looking buttons still react to hover (medium; only visible in a real browser)**
   - Buy Now at `PurchaseHeader.tsx:363` keeps `hover:bg-buy-hover`.
   - CartButton at `:425` keeps `hover:border-outline-hover hover:bg-elevated`.
   - The cart icon at `:447` keeps `group-hover:opacity-100`.
   - So a button marked `aria-disabled` brightens on hover, which says "clickable". The Studio already handles this with `not-aria-disabled:hover:*` (`ArrangementTransport.tsx:58`, `ArrangementLibraryPreview.tsx:327`).
   - **Fix:** change these to `not-aria-disabled:hover:bg-buy-hover`, `not-aria-disabled:hover:border-outline-hover not-aria-disabled:hover:bg-elevated`, and `group-not-aria-disabled:hover:opacity-100` (or drop that last one). Not blocking.

3. **The store card and the product page can still disagree (medium; outside this round's scope)**
   - Doc 214 says the card and the page now follow one rule. But `routes/store.tsx:79` and `ProductCard.tsx:32` still use the raw `?? 0` chain.
   - Result: a product with no valid price shows `$0` on the card and "Price unavailable" on the page. This is the same class of bug, now reversed.
   - **Fix:** correct the wording in doc 214 now ("matches the card's order of fields; the card itself has not been moved over yet"). The migration itself is in the Architecture note below.

4. **Props passed to the cart button that can never take effect (low)**: `PurchaseHeader.tsx:282-283`
   - The upgrade panel (Case 3) passes `isPriceUnknown` and `priceReasonId` to `CartButton`. That panel only renders when `upgradePrice !== undefined`, so `isPurchaseBlocked` is always false there.
   - The panel also has no `<p id={priceReasonId}>`. If the Case 3 condition is ever loosened, `aria-describedby` would point at an element that doesn't exist.
   - **Fix:** pass `isPriceUnknown={false}` in Case 3, or render the reason line in that panel too.

5. **Code comments break the project rule (low)**: `product-utils.ts:120` and `:129` (`// Catalogue price…`, `// Price for the selected version…`)
   - CLAUDE.md allows only TODO comments or Georgian context.
   - **Fix:** delete them, or rewrite them in Georgian as context.

6. **Old problem, recorded only**: `disabled:cursor-not-allowed` without `!` (`:293`, `:363`, `:422`) is probably overridden the same way the doc describes for `aria-disabled`, by the unlayered `button { cursor: pointer }` rule. This diff didn't introduce it.

### Suggestions
- `product-utils.test.ts`: `withPriceFields` uses `JSON.parse`, which returns `any` and is then assigned to `Partial<Product>`. That works, but it gets around the type check. An object literal with a cast-free `null` would be clearer if the `Product` type allows null. If it doesn't, keep it as is: it really is a test of backend data that doesn't match the type.

### Good Practices Found
- `isValidCatalogPrice` is a type guard over `unknown[]`, with no `as` assertions. It correctly treats `null`, `NaN`, `Infinity` and negative values as invalid, and keeps an explicit `0` as free.
- `useId` is SSR-safe and called before every early return, so the hook order stays stable.
- The disabled buttons use `aria-disabled` instead of native `disabled`, so they stay in the Tab order and point to a visible reason through `aria-describedby`. When the item is already in the cart, the cart button still lets the user go to the cart (`isPurchaseBlocked = isPriceUnknown && !alreadyInCart`).
- The diff adds no listeners or timers. Dropping `useMemo` from `currentPrice` is fine because the function is cheap.
- Only design tokens are used. The `!` important modifier follows the existing Studio pattern.
- `verify.log`: 223 test files, 3346/3346 tests passed, and the build succeeded. The `ArrangementProvider` errors in the log are expected stderr from existing Studio tests, not from this diff.

### Architecture note
- **Signal 3 (the same costly change repeated in one region):** the price-fallback chain now exists in 4 places: `product-utils.ts:92` (frozen), `routes/store.tsx:79`, `ProductCard.tsx:32`, and the new `resolveCatalogPrice`.
- **Keep or extract:** keeping them saves nothing, because the copies have already drifted apart (finding 3). No Studio invariant is affected (audio timing, refs, gestures, Undo/Redo). Cost is low.
- **Proposal for the planner (one bounded task, not approved scope):** move the card and `/store` to `resolveCatalogPrice` and add a display rule for `undefined` ("Price unavailable" on the card). Update `createDisplayVersions:92` separately, together with the `VersionSelector` card that still shows `$0` (the open signal in doc 214).
  - Acceptance: one function is the only source of the price rule.
  - Focused tests: ProductCard and store loader cases for null, 0 and a valid price.

### Alternative Approach (purchase flow is critical logic)
- **Current:** buttons stay in place with `aria-disabled`, handler guards, and a reason line linking to `/support`.
- **Alternative:** remove the buttons and show a single "Contact us" panel when the price is unknown.
- **Verdict:** the current approach is better. The layout doesn't jump when a price appears, keyboard users still reach the buttons and hear the reason, and the guards make it impossible to buy at $0 even though the buttons aren't natively disabled. Its weak spot is the hover styling in finding 2.

### Score: 8/10