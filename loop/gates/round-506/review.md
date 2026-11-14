COMMIT: OK

I reviewed the diff and the changed files. I did not run a browser, so the real-browser points below come from reading the code, not from a test run. No auth, purchase, download or API code is touched. "FREE DOWNLOAD" is only a button label, and the `/api/subscribe` call path is unchanged. Hooks, effects, listeners and timers are also unchanged, so there are no new leaks. The five paths match `diff.patch` and `untracked.txt`.

## Code Review: LeadMagnetPopup.tsx (+ tests, docs)

### Critical Issues
- None.

### Suggestions (ranked, none blocking)
1. `LeadMagnetPopup.tsx:240-248` (the CONTINUE submit, in the email step) — Event order with `disabled={isSubmitting}`: the input and the submit button both become disabled when the submit starts.
   - Browsers drop focus from a disabled control, so `document.activeElement` falls back to `body`.
   - The effect at lines 66-72 already handles this. It refocuses the input when a submit ends while focus is outside the dialog, so this is not a regression.
   - The Tab trap's `querySelectorAll('button:not([disabled])…')` still works, because the Close button always stays enabled.
   - Fix: none needed. Add a real-browser check of "submit → fail → focus returns to the field" at the next DP gate. jsdom does not reproduce the focus drop.
2. `Button.tsx:95` (shared component, unchanged in this diff) — The disabled state is `opacity-50 cursor-not-allowed pointer-events-none`. `pointer-events-none` means the `cursor-not-allowed` cursor never shows. The doc lists this as deviation D3, and it is only cosmetic. Fix: none now. Leave it as a possible follow-up for `Button` in general.
3. `store-button-cleanup-2e.test.tsx:80,91,133` — The tests compare the full className string to `buildButtonClassName(...)` output. They will fail on any harmless edit to `Button`'s class order. Fix: if it gets noisy, assert on the tokens (`toContain`) as B2E-2 already does.
4. `327-dpg-button-cleanup-stage-2e.md:4` — The status is "In Progress". Set it to Completed once the commit lands, as the project's implementation-docs rule requires.

### Good Practices Found
- `isLoading` is deliberately not used, so the "SENDING..." text stays and no spinner appears. The test pins this (B2E-3, B2E-6).
- The `ref` is forwarded through `forwardRef` to the "BACK TO SITE" button. The focus effect at lines 62-63 still works, and B2E-5 checks it.
- Keyboard handling, the `aria-*` attributes and the open/step/return focus logic are untouched.
- `type="button"` and `type="submit"` are set explicitly, and `{...props}` spreads after `className`, so nothing is overridden.
- There are no custom CSS rules and no hardcoded colours. The change moves the CONTINUE button from `bg-destructive` to the primary brand token (a visible colour change). That resolves the problem that a red submit button reads as an error. The 8.32:1 text contrast is documented in the implementation doc, not verified here.
- Tailwind and tokens: no `any`, no type assertions, semicolons kept. The `store-theme-tokens` pin is rewritten to "zero `bg-destructive`/`bg-brand` literals", which is consistent with the new component.
- Render cost: unchanged. `Button` is a light `forwardRef` wrapper. Only the current step's button is mounted, and the popup returns `null` when hidden.
- Accessibility: the visible name is unchanged, and the buttons grow from 57.6px to 48px tall. Both sizes are above the 44px touch-target minimum. `Button` has no `focus-visible` style, but the old hand-rolled buttons had none either, so this is not a regression.

### Architecture note
- None of the four signals appears in this diff. Mixed responsibilities, ownership/coupling, repeated costly changes to one region and new state/lifecycle are all absent. No state, effect or ref ownership moved. Proposal: none.
- One observation for the planner, with no action needed: `LeadMagnetPopup.tsx` still has hand-rolled controls, the Close button and the email input (tracked as `DPG-BUTTON-CLEANUP-2-NONBRAND`). Keep them where they are until that task. The focus trap and the `closeButtonRef` initial focus depend on them.

### Alternative Approach
- Not critical logic: this is a presentation refactor, and the focus and submit flow is untouched.

### Score: 9/10