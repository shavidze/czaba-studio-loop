COMMIT: OK

The change is small and safe. It only changes styling: hover colours now apply only while a button can actually be used. I found no runtime, security, or regression problems.

**Evidence**
- I checked the built CSS (`out/renderer/assets/index-DhZ4VC4p.css:1258-1304`). The new classes compile to the selectors you'd expect: `.enabled\:not-aria-disabled\:hover\:bg-brand-hover:enabled:not([aria-disabled="true"]):hover` and `.enabled\:hover\:text-destructive:enabled:hover`. Tailwind v4 is handling `enabled:` and `not-aria-disabled:` correctly.
- A button inside `<fieldset disabled>` with no `legend` is disabled, so `:enabled` doesn't match it. The trash, hide, reorder and hidden-standard buttons in `SchemaEditor` correctly lose their hover change while Applying.
- The Back button (`SchemaEditor.tsx:157`, plain `hover:`) sits outside the fieldset and is always enabled, so leaving it unchanged is correct.
- No `<Button>` caller passes a `hover:` override in `className`, so the class merge doesn't create a hover conflict.
- The verify log passes: biome reports only 8 warnings, all in files this round didn't touch; tsc is clean; 310 renderer and 93 main tests pass; the build passes; 7 E2E tests pass.
- Skipping a new test is within the rules: `test-on-bugfix.md` exempts styling-only Tailwind changes.

**Findings**

- **Low — the design docs cite a decision "D-46" that isn't recorded anywhere.** It appears at `docs/design/component-specs.md:50` and `docs/design/style-guide.md:215` and `:235`, but `docs/bugs/001-save-and-selection-known-limits.md` lists decisions only up to D-45, and no other file mentions D-46. Anyone looking up the reason will find nothing.
  - **Fix:** add a short Georgian D-46 entry after D-45 in `001-…md` covering:
    - `Button` variants now use `enabled:not-aria-disabled:hover:*`.
    - The `SchemaEditor` icon buttons now use `enabled:hover:*`.
    - The rejected alternative.
    - That no test was added because the change is styling only.
- **Low — the line-number update in the bug doc is correct.** The D-45 `button.tsx:35`→`:36` change at doc lines 24 and 317 matches: `aria-disabled:` classes are on line 36. The `SchemaEditor` line numbers it cites (`:186`, `:194`, `:280-281`) didn't move, because this diff swaps classes without adding lines.
- **Low — an a11y gap that jsdom can't check.** `aria-disabled` buttons can still be focused, and they get no focus-visible styling of their own beyond the shared ring. That is acceptable, but someone should hover them once in the real app to confirm the cursor and opacity look the same as native `disabled`.

**Architecture note (proposal only)**

Disabled-state styling is now copied in several places: the `disabled:`/`aria-disabled:` pair in `Button`, and the `enabled:hover:` classes on raw `<button>`s in `SchemaEditor`. One option is a small shared `IconButton` (forwardRef, under `ui/`) that owns `enabled:not-aria-disabled:hover:*` and the disabled-opacity rules. `SchemaEditor`'s trash, hide and reorder buttons could then use it, and future raw buttons would get the right hover behaviour without anyone having to remember the variant prefix.