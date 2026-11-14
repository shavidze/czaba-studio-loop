COMMIT: OK

The diff only changes class names and adds a data attribute in `cart.tsx`. Nothing in auth, checkout logic, downloads or purchase code is touched. `handleCheckout`, Remove, the ownership logic and `useSmoothScroll` are unchanged. The verify log shows 299 of 299 test files passed and the build succeeded. I didn't run a browser. The real-browser numbers in the implementation doc come from the C round (c-round-502.json PASS), and I'm taking them as given.

## Code Review: app/routes/cart.tsx, cart-mobile-layout.test.ts, docs/…/323

### Critical Issues
- None.

### Suggestions (ranked)
1. **Low, `cart.tsx:599` and `:619`.** `data-lenis-prevent-wheel` applies at every breakpoint, but the columns only scroll from `lg` up.
   - Below `lg` the columns aren't scroll containers. Lenis still skips smoothing when the cursor is over them, so wheel scroll is jumpy there. This is already recorded as D1 in the doc. Touch is unaffected, because the wheel-only attribute doesn't apply to touch.
   - The same happens at `lg` when a column is shorter than its box. Nested wheel events fall through to native window scroll, which is harmless because `main` is `overflow-hidden` at `lg`.
   - Fix, later and in a separate task: a `prevent` callback in `useSmoothScroll` that checks `matchMedia('(min-width:1024px)')`, or `allowNestedScroll`. Both touch the whole Store, so I wouldn't do them in this round.
2. **Low, `cart-mobile-layout.test.ts:5-60`.** The tests read class strings with regexes, so they pin exact markup. For example `<div\s+className="…"\s+data-lenis-prevent-wheel>` breaks if the code moves to `cn()` or a prop is added. `READER_HINT` already warns about this. It is acceptable, but these are brittle source-scan tests that cannot catch real layout bugs. The real checks stay in the browser and the C round.
3. **Info, `cart.tsx:568`.** `h-full` on the inner container resolves to `auto` below `lg`, because `main` only has `min-h`. That is the intended behaviour. With few items the page is `min-h`, and with many it grows. I found no issue.
4. **Info, `cart.tsx:618`.** At `lg` the Summary column now has `overflow-y-auto`, so its focus ring or box-shadow could be clipped at the column edge. The doc notes the scrollbar narrowing in D3. Check the focus-visible ring on the coupon input and the checkout button at 1280×600. The doc says Tab brings checkout into view, which suggests this is fine.
5. **Info, `useSmoothScroll.ts:32-37` (not in the diff).** The `requestAnimationFrame` loop is never cancelled in cleanup. After `lenis.destroy()` it keeps calling `raf` on a destroyed instance. This is an existing leak outside this commit. It matters only if the hook remounts often.

### Good Practices Found
- Tailwind only, with no hardcoded colours or custom CSS. It reuses `styled-scrollbar` and the existing `data-lenis-prevent` convention (`Modal.tsx`).
- I confirmed that Lenis in `node_modules` honours `data-lenis-prevent-wheel` (`lenis.mjs:629`), so the attribute does something.
- DOM order and a11y semantics are unchanged. Removing `sticky top-24` fixes the card sitting 96px too low inside the scrolling column.
- `lg:grid-rows-[minmax(0,1fr)]` plus `min-h-0` is the standard way to stop a grid row growing taller than its parent.
- Mutant checks were done, and the implementation doc follows the required template. No `any`, no suppression directives and no type assertions. The new `.ts` file ends statements with semicolons.

### Architecture note
- none. `cart.tsx` is a route file, and the diff only edits classes. The Lenis-versus-nested-scroll issue is a signal for the planner, not a task for this round. Signal: `cart.tsx:599` and `:619` → keep, because it is a one-attribute fix that matches the `Modal.tsx` precedent. Proposal for the planner, one bounded task: audit the other nested-scroll areas in the Store and decide between a `prevent` option in `useSmoothScroll` and `allowNestedScroll`. Acceptance would be wheel scrolling working in each area with tests, and no change to auth or Studio behaviour. This is a diff review only, not a full audit of the module.

### Alternative Approach
This isn't critical business logic, because it is a layout change with no auth, checkout or audio. A short comparison anyway:
- Current: scroll containers inside the columns at `lg` plus a per-element Lenis opt-out.
- Alternative: normal page scroll with a sticky Summary at `lg`.
- Verdict: the current approach keeps desktop behaviour unchanged. The alternative changes it for every cart and needs Saba's approval, as the doc says. Keep the current approach.

### Score: 8.5/10