COMMIT: OK

I read the diff and the three new files. I didn't run the browser or the test suite myself. I'm relying on C's PASS and the verify log for those.

**What I checked**
- **Auth, purchase and download code:** I found no changes to `CartContext`, `apiClient`, `auth.ts` or any download code. `PurchaseHeader` only has its inline `handleBuyNow` moved into `useBuyNowAction`. I compared the old and new versions line by line, and the order of steps is identical: price guard, sign-in toast and modal, sellable/valid-id toast, GA4 and Pixel events, then `buyNow`, all inside `try`/`catch`. `isValidProductId` is still computed in `PurchaseHeader` at line 78, and the hook computes the same `productId > 0`. So the extraction doesn't change behavior.
- **Double click:** `CartContext.buyNow` guards with `buyingRef` (CartContext.tsx:321). Two buttons calling the same action can't start two checkouts. The sidebar button is also disabled while `isBuyingNow` is true.
- **Leaks:** the diff adds no listeners, timers or effects.
- **TS strict:** no `any`, no assertions, no suppressions, and semicolons are present.
- **Styling:** the sidebar uses `Button` with its existing variants. The hand-built `<button>` with its custom classes is gone. There are no hardcoded colors.
- **Accessibility:** the old button had no `type` and no handler. The new one has `type="button"`, a real accessible name, and an `aria-hidden` spinner.

**Findings, ranked**
1. **Low, product risk (not a code defect):** the sidebar "Get it free" button now starts the real Stripe checkout for a $0 order. The doc says plainly that this is unverified in the cloud (D2: `SABA-Q-509-FREE-DELIVERY`). If the backend or Stripe rejects $0 sessions, a visible CTA ends in an error toast.
   - **Fix:** before release, test one real $0 order on staging. If it fails, hide the button behind a flag until the backend supports it.
2. **Low, accessibility:** `ProductSidebar.tsx:~92` shows "Processing..." only visually, with no `aria-busy` or live region. The header button behaves the same, so this isn't a regression.
   - **Fix:** add `aria-busy={getFree.isBusy}` to the `Button`.
3. **Low, render cost:** `ProductDetailPage.tsx:46-52` builds a new `getFree` object on every render. `runBuyNow` in `useBuyNowAction.ts:44` isn't wrapped in `useCallback`. `ProductSidebar` isn't memoized, so this has no practical cost today. It matters only if the sidebar is wrapped in `memo` later.
   - **Fix:** do nothing now. If the sidebar gets memoized, wrap `runBuyNow` in `useCallback` and `getFree` in `useMemo`.
4. **Info, event order and flow:**
   - **Anonymous click:** the user gets a toast and the sign-in modal, then has to click the button again after signing in. That matches the header button.
   - **bfcache:** if the user returns with the back button from Stripe, `isBuyingNow` can stay stuck in the restored page. The header already has this problem. Because the button is now in two places, it's worth a manual check.

**Architecture note**
- **Signal: change in ownership/coupling.** `useBuyNowAction.ts` now owns the checkout trigger, which was previously inline in `PurchaseHeader`. `ProductDetailPage` and `PurchaseHeader` each call the hook separately.
  - **Keep it, because** the single shared handler is what keeps the sidebar and header from drifting apart. The public shape is small, and SF2 and SF3 cover both call sites.
- **Signal: new state and lifecycle in an existing owner.** `ProductDetailPage` now calls `usePurchases`, `useBuyNowAction` and `useCart` just to compute `showGetFree`.
  - **Keep it for now.** There is no effect or timer, so the cost is low.
  - **Proposal for the planner (one task):** if more selected-version rules appear (a "free" label on the header, for example), extract a `useSelectedVersionOffer(product, selectedVersion)` hook. It would return `{ price, isSellable, isOwned, showGetFree }`. Acceptance would be that the SF5, SF7 and SF9 tests stay green and the `ProductSidebar` props don't change.

This note is not a finding to fix in this round.