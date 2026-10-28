COMMIT: OK

Biome, tsc, 304 renderer tests, 93 main tests and 7 E2E tests all pass (`verify.log`). I found nothing in this diff that should block the commit.

**Critical / High:** none.

**Medium:** none.

**Low**
1. `src/renderer/src/components/ui/button.tsx:35`: a Button marked `aria-disabled="true"` still gets its normal `hover:` colours. With native `disabled` the browser didn't send mouse events, so this hover cue is new, and a greyed-out Save Tags will now react to the mouse. Fix: in the variant styles, add `aria-disabled:hover:` overrides, or add `aria-disabled:pointer-events-none`. Only the second option also stops the click, but it's safe either way because `handleSave` now checks first.
2. `src/renderer/src/components/schema/SchemaEditor.tsx:138`: the guard reads `isApplying` from the render that created the handler. That's correct for real clicks, because React applies the update before the next click event, and test f2 covers it. It would break if `handleSave` were ever called twice in the same tick, for example by a future keyboard shortcut. Fix: if a second trigger is added, use a ref guard like `isSaveBlocked()` uses for Save Tags.
3. `tests/renderer/components/schema-editor-done-busy.test.ts:155`: test (b1) is still called "...is disabled", but it now checks `aria-disabled`. Rename it to match what it tests. Only the name is wrong.
4. `SchemaEditor.tsx:186,194`: middle reorder arrows inside the disabled fieldset still get `hover:text-foreground`, as before. Clicks are blocked natively, so this is only a visual cue.

**Checked, no problems**
- **Save Tags guard:** `isSaveBlocked()` reads the store directly at the moment of the click, before any `await`, and `setIsSaving(true)` runs straight after, so two quick Enter or Space presses can't both start a write. `handleSave` has one caller (line 372) and no keyboard shortcut or form submit calls it.
- **`aria-disabled` styling:** Tailwind v4's `aria-disabled:` only matches `aria-disabled="true"`. React renders `false` as `"false"`, so enabled buttons look unchanged.
- **Done button:** it sits outside the fieldset (which closes at line 271), so the fieldset's `disabled` doesn't natively disable it again.
- **Reorder arrows:** the edge arrows keep native `disabled`, and the old `opacity-30` × 60% stacking now only affects them, as intended.
- **Conventions:** no comments in the code, semicolons present, no `any`, colours come from tokens. The new helpers are private module-level functions.

**Architecture note (proposal only):** the "focusable but disabled" pattern is now repeated across two components: an `aria-disabled` prop plus a separate guard inside each handler. It could move into `Button` as a `busy`/`inert` prop that sets `aria-disabled`/`aria-busy`, blocks `onClick` itself, and turns off hover styles. That keeps the guard and the visual state from drifting apart, and the next commit button would get the right behaviour without extra code.