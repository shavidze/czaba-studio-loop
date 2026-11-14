COMMIT: OK

I read the diff, `Button.tsx`, the new test and the implementation doc. I didn't run anything, and I didn't read the verify log or the C report. The checks below are from reading the code.

**Scope and safety**
- Only `PurchaseHeader.tsx` changes in code. The change swaps three hand-built brass actions for `buildButtonClassName` (the "Go to Downloads" link) and `Button` (the two buttons).
- Every handler, `href`, `disabled={isDisabled}` and label is unchanged: `onSelectPremium`, `handleBuyNow`, `/account/downloads`.
- I found nothing in auth, checkout, cart or download code. The purchase path is only restyled.
- There is no `any`, `@ts-*` or type assertion. The only new import is `Button, buildButtonClassName` from `~/components/ui`, which `index.ts` already exports, so there is no new bundle cost.
- The classes are Tailwind and tokens (`bg-brand`, `text-background`), with no hardcoded colors.

**Event ordering, leaks, render cost**
- `Button` spreads `{...props}` after its own props. `type="button"`, `onClick` and `disabled` therefore reach the DOM element. `isLoading` isn't used, so the "Processing..." label and spinner stay as before.
- Nothing is added that could leak: no listeners, timers or effects. Render cost is unchanged, because `Button` is a thin `forwardRef` around `<button>`.
- Double-click safety still holds. While buying, `disabled` is set on the element, and B2C-5 asserts that `buyNow` isn't called on a click.
- Dropping the old `group` class is safe. The only `group-hover` in the file (line 453) is inside `CartButton`, which this diff doesn't touch.

**Accessibility**
- "Go to Downloads" stays a real `<a>` and the two actions stay real `<button>`s, so roles and names are unchanged.
- "Upgrade to Premium" changes from `text-black` to `text-background`. The doc gives contrast 8.32, which is fine.

**Findings (all low severity, none blocking)**
1. **Cursor change.** `PurchaseHeader.tsx:~294-312`: a disabled "Unlock Premium" now gets `pointer-events-none` from `buildButtonClassName`. The `cursor-not-allowed` cursor is therefore never shown, where before it was. The doc records this as D5, so it's intentional. Fix, if the cursor matters: do nothing here, and decide once in `Button`.
2. **Brittle tests.** `store-button-cleanup-2c.test.tsx:72-77, 269-275`: the tests compare against whole class strings and a hand-written tag scanner. A harmless change to `Button`'s tokens or class order would fail B2C-1 to B2C-6. This is a maintenance cost, not a bug. Fix: when the shared scanner is built (SIG-R501), move these checks onto it and assert only on the pieces that matter (`bg-brand`, `min-w-[160px]`).
3. **Doc status.** The implementation doc says "In Progress" and links to artifacts outside the repo (`b-round-503/...`). Fix: set the status to Completed after the commit.

**Architecture note**
- Signal: repeated, similar edits to the Button-cleanup region (stages 2a through 2c, docs 320 to 325). The source-scanning test helpers are copied per stage (`openingTags`, `handRolledBrassActions` in `store-button-cleanup-2c.test.tsx:115-149`).
- Keep for this round. The scope is frozen, and moving the helpers now would touch the tests that gate earlier stages.
- Proposal for the planner: one bounded task to extract a shared `handRolledBrassActions` scanner into `app/lib/__tests__/helpers/`. It should move the 2a to 2c tests onto it with no behavior change, with a green full suite as the acceptance criterion. The doc already tracks this as SIG-R501-SHARED-BUTTON-SCANNER.
- This note covers the diff only. I haven't audited the whole module.