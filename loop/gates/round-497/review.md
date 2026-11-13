COMMIT: OK

Nothing here touches auth, purchase or download code. The Header Sign In buttons still call `openModal('signin')` with the same handlers. Only styling changed. I did not run the app in a browser, so the layout points below come from reading the code.

## Findings, ranked (none block)

1. **Low, layout shift: `app/components/layout/Header.tsx:118` and the Sign In button.** The signed-out Sign In went from about 36px to 48px tall (`size="lg"`).
   - The header row is `items-center` with `py-4` at line 70, so the header may grow by a few pixels when signed out. The skeleton was updated to `h-12`, so the loading-to-loaded swap should not jump.
   - Fix: check the signed-out and signed-in header heights in a real browser. If they differ, use `size="md"` with `shape="pill"` for the header only.

2. **Low, intentional visual regression: `app/components/home/HeroSection.tsx:184`.** The Hero CTA padding shrank from `px-8 py-4` to `px-6 py-3`. The design doc covers this, but it is a visible change to the main landing CTA. Confirm the product owner wants it.

3. **Low, a11y and press feedback: link buttons built with `buildButtonClassName`.**
   - Hero, 404, Login and Search links have no `:active` scale, and `isDisabled` is only visual (`pointer-events-none`) on a link.
   - The new doc records both. No current caller passes `isDisabled` to a link, so there is no live bug.
   - Fix: if a disabled link caller appears, add `aria-disabled` and `tabIndex={-1}` handling inside the builder instead of leaving it to each caller.

4. **Low, design change: `app/routes/$.tsx:352`.** "Browse Store" is now a plain text link (`text-foreground hover:text-brand`) instead of a secondary button. It has a `min-h-12` hit area, but at rest only the icon sets it apart from body text. Consider `underline-offset-4 hover:underline`, or `variant: 'secondary'`.

5. **Low, test cost: `app/lib/__tests__/store-button-cleanup.test.tsx:108`.** BC1b renders and unmounts 288 times under a 20s timeout. It passed in verify, but it could flake on a slow CI runner. Move the class-string checks to `buildButtonClassName` calls, which don't need rendering, and keep a few render checks.

## What I checked and found fine

- **Retired classes.** A grep of `app/` outside tests finds no remaining `.btn-primary`, `.btn-secondary`, `.button` or `.button-primary`, in TSX or CSS. `.btn-icon` stays and is still used in Header lines 102 and 141. The other `*-button` classes are different names.
- **Display override.** `max-lg:hidden` replaces `!hidden lg:!inline-block`. In Tailwind v4 variant utilities sort after base ones, so it beats `inline-flex` below the `lg` breakpoint. The `!important` hack is gone.
- **Event ordering, listeners, timers.** None were added. `buildButtonClassName` is a pure function, so there is no render-cost or memoization issue.
- **TypeScript.** No `any`, assertions or suppressions. The new types are exported.
- **Tailwind and tokens.** Only tokens are used (`bg-brand`, `text-background`, `rounded-full`), no hardcoded colors, and custom CSS was removed. The pill tokens are covered by the GS3 test, which checks for no glow, teal or gradient.
- **Nesting.** Links are single `<a>` elements with no button inside a link (BC3).
- **Primary Button text color.** The old `.btn-primary` text color was `--color-brand-foreground`. The Button uses `text-background`. Both resolve to `#0e0d0c`, so there is no contrast change.
- **Docs.** The implementation doc 319 and the DESIGN_SYSTEM update are present.

## Architecture note

- Signal: `app/components/ui/Button.tsx:149` has a new public export, `buildButtonClassName`. `Button` now calls it, and four routes and components use it for links. This changes who owns button styling, and the coupling is one-way and pure.
- Verdict: keep it. The invariants hold: the default class string is byte-identical to HEAD (BC1 and BC1b), the Button props are only extended, and nothing has timing, refs or gestures. The cost of keeping it is low.
- Proposal for the planner (not a fix for this round): in DPG-BUTTON-CLEANUP-2, migrate the remaining hand-built `bg-brand` buttons to `Button` or the builder. Add a small `ButtonLink` wrapper only if link callers pass 5 or more, so that `aria-disabled` and the press state live in one place.

This is a review of the diff only. I did not audit the whole module.

Score: 9/10