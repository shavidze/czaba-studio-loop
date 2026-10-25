COMMIT: OK. Nothing blocks this commit. There are no Critical or High findings, auth/purchase/download code is untouched, and `verify.log` shows 171/171 test files and 2534/2534 tests passing.

## Code Review: ArrangementTransport.tsx (+ transport-surface-ui.test.tsx, docs 127/128)

I reviewed the diff only. I did not audit the whole module.

### Critical Issues
- None.

### Findings (ranked)
1. **Low: Loop-on has no hover or press feedback.** At `ArrangementTransport.tsx:220-222`, `enabled:hover:bg-accent/20` and `enabled:active:bg-accent/20` are the same as the resting `bg-accent/20`. This keeps the accent from being overwritten (doc R4 says so on purpose), but the Loop button no longer reacts to hover or press. **Fix (optional, V-3b/c):** use `enabled:hover:bg-accent/25` and `enabled:active:bg-accent/30`, mirroring the 5/8/12 steps, and update TS5.
2. **Low: Export contrast can't be proven by jsdom.** At `:324`, `text-brand` on `bg-foreground/5` (hover `/8`) replaces `text-brand-foreground` on `bg-brand`. TS4 only checks class names. Computed contrast in obsidian is C's job, and C round 159 passed. **Fix:** none in code; make sure C's report records the actual contrast ratio for Export at rest and on hover.
3. **Low: doc 128 status is out of date.** Its status still reads "In Progress (awaiting C round 159…)" (`128-…md:4`), although C round 159 has passed. Doc 127 was closed one round later in the same way, so this is not a block. **Fix:** set it to Completed next round, as you did for 127.
4. **Low: tests check class names, not real styles.** TS1 checks class tokens only, and doc 128 says so at l.133. TS6 locks the current glyphs (`↤`, `↶Undo`, …), so V-3b has to rewrite it. That is expected, so plan for it.

### Suggestions / scope checks done
- **Existing tests and e2e:** I searched `e2e/**` for `▶`, `❚`, `⇔` and Play/Pause text selectors and found nothing. No e2e spec covers Studio. The full unit suite passes, so the removed glyph text breaks no existing tests.
- **Browser event order, listeners, timers:** the diff adds no effects, refs, subscriptions or handlers. The focus handoff and the Enter-repeat guard are unchanged. Hover only applies on devices that support it (`@media (hover:hover)`). `active:` shows on mouse and Space presses, not Enter, which is normal button behaviour.
- **Render cost:** the only new work is switching between two small lucide SVGs when play state changes. Named imports from `lucide-react ^0.561.0` are tree-shaken, and the package is already in the bundle.
- **Accessibility:** the `aria-label`s are unchanged and every icon has `aria-hidden="true"`. Play/Pause keeps its visible text, so its accessible name equals the visible label. Zoom to selection is icon-only but keeps its `aria-label`. The focus ring (`ring-brand`) is kept on all 12 buttons.
- **Tailwind, tokens, TS strict:** no custom CSS and no hardcoded colours. The bare values (`/8`, `/12`, `/92`, `/88`, `duration-180`) are standard v4 utilities. `tailwind-merge ^3.4.0` understands the trailing `!`, and TS2/TS4 prove it resolved the class conflicts (the base `/5` and `border-transparent` are gone from Play and Export). No `any`, no assertions, semicolons present.
- **Auth/purchase/download:** untouched. The Export button's `onOpenExport` wiring is identical; only `className` changed.

### Good Practices Found
- The four `!` tokens match the root cause exactly: unlayered global rules outrank `@layer utilities`. Adding `motion-reduce:transition-none!` closes the reduced-motion gap that the `motion-safe` tokens alone would leave open.
- Hover and press use the `enabled:` variant, which fixes the old hover reacting on disabled buttons.
- Play/Pause and Zoom to selection were picked as the first icon swaps because their width is fixed, so nothing in the layout moves.
- Mutations m151–m157 show the tests fail when the classes are broken.

### Architecture note
- **Signal 3 (the same region keeps needing expensive changes):** `toolButtonClass` at `ArrangementTransport.tsx:40-41` was rewritten in rounds 158 and 159. Both times it needed computed-style checks in a real browser, because of the unlayered global rule `a, button, … { transition: … }` in `app/styles/app.css:305-314` and `app/styles/base/utilities.css:7-15`. The `!` tokens are a correct local workaround, but now the component carries an `!important` contract that only the global stylesheet can release.
  - **Keep for now:** it stays inside Studio scope, and it touches no audio timing, refs, gesture lifecycle, Undo/Redo or public hook shape.
  - **Proposal for planner:** this is already recorded as **ROOT-GLOBAL-TRANSITION-RULE**. One bounded task, root-approved because it is Store-wide: move both copies of the rule into `@layer base`. Acceptance: the transport `!` tokens can be removed without C-R158-01 coming back, plus computed `transition-property` checks in a browser on `ProductAccordion` and one Studio button.

### Alternative Approach
- Not applicable: this is visual-only and touches no critical logic (auth, checkout, audio pipeline).

### Score: 9/10