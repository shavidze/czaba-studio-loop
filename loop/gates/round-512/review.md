COMMIT: OK

I'm still reviewing. I've read the diff, `PurchaseHeader.tsx`, `Button.tsx` and the implementation doc. The doc has all the required sections. I haven't run the tests or the build. I'm relying on the C PASS and `verify.log` for that.

## Code Review: PurchaseHeader.tsx (N2 purchase card)

### Critical Issues
- None. The diff changes class names and markup only.
  - `handleBuyNow`, `useBuyNowAction`, `isDisabled`, the Link targets (`/account/downloads`, `recordingsHref`) and the `aria-disabled`/`aria-describedby` wiring are untouched.
  - No auth, purchase or download logic is touched, and no `any`, type assertions or `dangerouslySetInnerHTML` were added.

### Suggestions (ranked)
1. **`PurchaseHeader.tsx:346-354`, Buy Now cursor and pointer behavior.**
   - `Button` adds `opacity-50 cursor-not-allowed pointer-events-none` when `disabled` is true, which happens while `isBuyingNow` or `isAddingToCart` is true. `pointer-events-none` stops the `cursor-not-allowed` from ever showing. The old hand-rolled button showed it.
   - Impact: during "Processing..." the cursor now shows whatever is underneath, not "not-allowed". Double clicks are still blocked, because the button is `disabled`.
   - The price-unknown state is `aria-disabled` and not `disabled`. It stays clickable and keeps `hover:bg-buy-hover`, exactly as before. Its `aria-disabled:cursor-not-allowed!` does still work.
   - Fix: none required. If you want the cursor, drop `pointer-events-none` from the shared builder in a separate task.
2. **`PurchaseHeader.tsx:413`, `CartButton` drift.**
   - It still has hand-rolled `px-6 py-3 text-base rounded-md font-semibold`, copied by hand to match `Button` size `lg`. Nothing enforces that it stays in sync.
   - It is documented as an exception (NONBRAND N2). Consider a test that compares its sizing tokens with `buildButtonClassName({size:'lg'})`.
3. **Visual change for users, `PurchaseHeader.tsx:159` and `205`.**
   - "Open in Studio" was brand-outlined and "Downloads" was accent-outlined. Both are now neutral `secondary`.
   - Buy Now changed from `rounded-lg` to `rounded-md`, and it gained `shadow-sm`, `active:opacity-90` and `text-base`. The docs describe this as intentional.
   - Check it in a browser, especially the "Owns Standard" card, which has an `accent/5` background. The neutral secondary buttons may look different there.
4. **`store-theme-tokens.test.ts`, `buyVariantTag`.**
   - This is a hand-written JSX scanner. It tracks quotes and braces but not `>` inside template literals or JSX comments. It only needs to find the one Buy Now tag.
   - Impact: it is fragile but test-only. Fixing it isn't blocking.

### Checked, no issue
- **Listeners and timers:** none added.
- **Render cost:** none added. `Button` is a `forwardRef` component and was already used in this file.
- **Event ordering:** `type="button"`, `onClick` and `disabled` are unchanged. `Button` spreads `{...props}` after `disabled`, so `aria-disabled` and `aria-describedby` reach the DOM.
- **Tailwind and tokens:** only token classes are used (`bg-buy`, `text-brand-foreground`). There is no custom CSS and no hardcoded colors. The `group` class was removed from the two Links. The only `group-hover` use in the file (line 438) is inside `CartButton`, which keeps `group`.
- **Accessibility:** focus-visible styling now comes from the shared rule through `Button`. The aria wiring is preserved.

### Good Practices Found
- Reuses the `Button` / `buildButtonClassName` primitives and removes three hand-rolled button classes.
- Tests were updated alongside the change: B2C-8 now asserts zero lowercase `<button>`, and the token test checks that `bg-`/`text-` aren't overridden in the Buy Now `className`.
- The docs were synced in `DESIGN_SYSTEM.md`, `button.md` and `ui-components.md`. The implementation doc 330 is included and has all the required sections.

### Architecture note
- Signal 3 (repeated costly change): `PurchaseHeader.tsx` has been touched by several consecutive button-cleanup rounds (2c, then N2).
  - Each round needs source-scanning tests (`openingTags`, `buyVariantTag`) that depend on file text. They are coupled to formatting and tag order.
  - Keep for now. It is one cohesive file with a single lifecycle, and extracting it would put the `useBuyNowAction` and cart state wiring at risk.
  - Proposal for the planner, if more rounds land here: one bounded task to replace the text-scanning tests with rendered-DOM assertions (role and class tokens) and delete the scanner helpers. Acceptance: the same coverage, with no source-text parsing.
- This is a review of the diff only, not a full check of the module.

### Alternative Approach
- Not applicable. This is presentation only, not auth, checkout logic or the audio pipeline.

### Score: 8.5/10