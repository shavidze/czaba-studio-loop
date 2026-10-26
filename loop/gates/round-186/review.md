COMMIT: OK. Nothing blocks the commit. The four paths are fine: inactive products return 404, meta descriptions come from the product's own text, and the Gift Cards image is now local. No auth, purchase or download code is touched. The new code adds no listeners, timers or effects, so there is nothing to leak and no event-ordering risk. TS strict holds: the `Product` import is type-only and the tests avoid type assertions. Semicolons and Tailwind classes are as required.

## Code Review: products.$handle.tsx, SpecialOffersSection.tsx, product-handle-route.test.tsx, 153-store-1a doc

### Critical Issues
- none

### Suggestions (ranked)
1. **The doc's status is out of date (Low, fix before commit)**: `docs/implementation/2026/quarter-IV/153-store-1a-product-page-bugs.md:4` says "In Progress (awaiting C round 186)", and line 64 says C's browser check has not run yet. `c-round-186.json` is PASS. The docs before this one (150, 151, 152) were all committed as `Completed`.
   **Fix:** set line 4 to `Completed` and change line 64 to cite C round 186 PASS.
2. **The sitemap now lists links that return 404 (Low, follow-up, not this round)**: `app/routes/sitemap[.]xml.tsx:23-28` lists every product with no `isActive` filter. The home page (`_index.tsx:54`) and the store page (`store.tsx:101`) do filter. Before this change those links opened a broken $0.00 page; now they return 404. This gap existed already; this change only makes it visible.
   **Fix:** `result.items.filter((p) => p.isActive).map(...)`.
3. **Existing links now lead to a 404 (Low, note only)**: these links point to a product page that will 404 once the product is deactivated:
   - `cart.tsx:59/89/158` (including `?upgrade=premium`)
   - `studio.$productId.tsx:520` ("View Product" on the Purchase Required screen)
   - `AudioPlayer.tsx:36`

   A 404 is better than the old $0.00 page with working Add to Cart and Buy Now. Owned content stays reachable through `/account/downloads` and Studio. No fix needed now; this is just the full list of affected links for the planner.
4. **Cutting text inside an emoji (Nit)**: when the description has no spaces, `products.$handle.tsx:13` cuts at a fixed position (159). An emoji sitting at that spot gets split in half. This can only happen on that no-space path.
   **Fix (optional):** `Array.from(collapsed).slice(0, 159).join('')`.
5. **Image size (Info)**: `SpecialOffersSection.tsx:10-13`: the PNG is 1.1 MB. `loading="lazy"` and `decoding="async"` are the right fix for a section below the fold. WebP and explicit width/height belong to the STORE-2 redesign, not this round.
6. **Test location (Nit)**: the route test sits in `app/lib/__tests__/`, but it tests a route. It's fine, just inconsistent.

### Good Practices Found
- The inactive check runs outside the `try` (`products.$handle.tsx:72`), so the `catch` can't turn the 404 into a 503. A mutant run confirmed this: moving the check into the `try` turns L1 red.
- Only a strict `isActive === false` is rejected, so responses without the field behave as before (covered by an L2 test).
- The description helper stays inside the route file, has no side effects, and is tested at the edges: spaces at index 158, 159 and 160, exactly 160 characters, no spaces at all, and `null`.
- The tests use `Reflect.*` and narrow types with `in` instead of type assertions, which meets TS strict.
- React escapes the meta content, so there is no XSS risk from `product.description`.

### Architecture note
- Signal 1 (mixed responsibility), weak: `products.$handle.tsx:5-14`. A text-formatting helper now lives in a route module. **Keep it there:** it is unexported, has one caller and is fully tested. Moving it to `lib/product-utils` only makes sense if a second route needs it. Low value, low risk.
- **Proposal for the planner:** add the `isActive` filter to the sitemap from Suggestion 2 as a one-line task. Acceptance: a test where the sitemap mock includes an inactive product and its URL is missing from the output.

### Alternative Approach
- **Current:** inactive products get the same 404 as a missing product.
- **Alternative:** a dedicated "no longer available" page with status 410 or 200, plus a link for buyers to their downloads.
- **Verdict:** keep the current approach. Lists already hide inactive products, buyers can still reach their files through downloads and Studio, and a 404 is the smallest honest behaviour. A 410 page is only worth building if search engines or buyers really need the extra signal, and it should first be checked against how the real backend answers an inactive handle (still unknown).

### Score: 9/10