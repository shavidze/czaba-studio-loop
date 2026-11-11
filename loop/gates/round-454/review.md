COMMIT: OK

## Code Review: app.css, base/utilities.css, store-live-teal.test.ts, doc 297

I reviewed the diff and the new files. I did not review the whole of `app.css`.

### Critical Issues
- None. The diff touches only CSS, one node-environment test and one doc. No auth, purchase, download, TSX, hook, timer or listener code is changed. So there is no new event-ordering, leak or render-cost surface, and no TS strict regression in the diff.

### Suggestions (ranked)
1. `app.css` `.audio-player-button-play` (about line 738) and `:hover`. The shadow is now `none`, and the hover only changes the fill (`#C9A46A` to `#D9B87F`) plus `scale(1.08)`. Keyboard users get no new glow signal. Confirm that `:focus-visible` is covered by the global focus ring in `utilities.css`. I did not confirm this. If a ring exists the point is moot; if not, add `focus-visible:` styling in a later stage (STORE-2c). It doesn't block the commit.
2. `app.css` `.audio-player-button-play` with `transition: all` (about line 739). Leaving `box-shadow: none` in the base rule is harmless. No fix is needed.
3. `app.css` `.code-4` (about line 3499). It reads the undefined token `--color-text-primary`, which is an old defect that the doc already flags. The test pins it, so a later fix will have to update the pin. Fix: use `var(--color-foreground)` in 2b-3c-2 or 2b-3d, and change the LT1 literal at the same time.
4. `app.css` `.command-palette-item.selected`. `rgba(var(--color-brand-rgb), 0.12)` works because `--color-brand-rgb` is defined in `@theme` (line 141) as a bare triplet. The `--color-brand-rgb` token is defined, so I found no problem. Selected-row text contrast was measured at 12.2:1 in the doc, which is fine.
5. `utilities.css` `.styled-scrollbar`. The thumb colour `outline-strong` is about 3.7:1 on the page, which meets the 3:1 non-text minimum. Firefox and Safari were not checked, and the doc says so, so it is tracked as TLM-R454-FIREFOX-SAFARI-SCROLLBAR. `.styled-scrollbar-thumb:hover` moves to `--color-muted`, which is a visible state change. Accessibility is acceptable.
6. `store-live-teal.test.ts` LT3/LT5. These tests pin allow-list hit counts such as 37 and 6. Any later edit to a dead rule will need the pin updated. That is deliberate, but it makes the 2b-3d cleanup more expensive. The doc already notes that these tests do not check whether the dead rules are really dead (a rule with no mounted user).

### Good Practices Found
- All new colours are tokens (`--color-foreground`, `--color-outline-strong`, `--color-muted`, `--color-brand-rgb`). I confirmed every token exists in `app.css`.
- `180deg in srgb` is valid CSS-grammar. It keeps interpolation in sRGB, so the `::before` gradient looks the same as before.
- Removing `.light-flicker-effect::after` and its six stagger selectors leaves no dangling reference. The `light-flicker-on` animation is still used by `::before`.
- The change stays within the stage: motion and dead rules are untouched, and the doc says so.
- The test pins live rule blocks exactly and checks that dead teal stays in an allow-list. It also covers self-tests for the matchers. The existing `studio-dialog-scrollbar.test.tsx` only checks class names, so it does not conflict with the new scrollbar colours.
- The implementation doc follows the TEMPLATE sections and is in Georgian, as the project rules require.

### Architecture note
- signal: `app/lib/__tests__/store-live-teal.test.ts:176-274` is signal 3 (repeated costly change): count-pinned allow-lists in one test file get edited every stage, and the pins couple the test to the exact text of CSS rules.
- keep, because it deliberately blocks teal from coming back, and the cost is low. No extraction now.
- proposal for the planner (one bounded task, only if 2b-3c-2 and 2b-3d keep churning these pins): move the allow-lists into one shared data file used by the GS tests and `store-live-teal.test.ts`, with the same test behaviour and a mutant check kept. Audio timing, refs and the public hook are not involved.

### Alternative Approach
- Current: neutral token-based colours with the glow removed, enforced by a scanning test.
- Alternative: keep a brass shadow on the play button and a brass radial on the card light.
- Verdict: the current approach is better. It follows the spec (a single accent, no glow in Direction A) and was chosen with the product-designer. The alternative would bring back the glow in brass.

### Score: 9/10