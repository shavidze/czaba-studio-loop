COMMIT: OK

## Code Review: round 169 — `ArrangementLibrary.tsx`, `ArrangementLibraryPreview.tsx`, `library-row-strings-ui.test.tsx`, docs 137/138

Nothing blocks this commit. The diff only changes class strings in two arrangement components, adds one test block and updates docs. No auth, purchase or download path is touched.

### Critical Issues
- None.
- **Things tests can't catch:** none of these can come from this diff, because it adds or changes no handlers, effects, refs, timers or listeners. There is no new event-ordering, leak or render-cost risk. The class string is still computed on render the same way, and `cn` is called the same number of times.

### Suggestions (ranked, none block the commit)
1. **Low — Doc 138 status** (`docs/implementation/2026/quarter-IV/138-studio-v3c4c1-library-button-surfaces.md:4`). It still says "In Progress (awaiting C round 169)", but C round 169 has passed. This follows the same pattern as doc 137, which is updated one round later in this commit. **Fix:** in the next round's commit, set it to `Completed (C round 169 PASS; published <sha>)` and strike through the TODO at `:126`.
2. **Low, for the planner, not caused by this round — double focus ring on the search field** (`ArrangementLibrary.tsx:473`). C measured a 2 px outline sitting outside the gold `focus:border-brand`. The ring is also in B's screenshot from before this change. C thinks a global focus rule in `app.css` overrides `focus:outline-none`, but didn't measure that part. With the new 8 px radius, two rings with different radii look worse. **Fix (separate task):** find which global rule wins and turn off just one of the two rings on this field, then confirm with a real browser focus check.
3. **Low — test hygiene** (`library-row-strings-ui.test.tsx:119–134` and `:193`/`:217`):
   - The `beforeEach`/`afterEach` stub block is copied from the first describe.
   - `view.unmount()` comes after the asserts, so if an assert fails, the tree stays mounted.
   - **Fix:** move the stubs into a shared `stubAudioGlobals()` helper and do the unmount in `afterEach`. The other describes in the file have the same shape, so this can be a cleanup for the whole file later.
4. **Info — a visible behaviour change that is intended** (`ArrangementLibraryPreview.tsx:307`). The old `hover:border-brand` also coloured the disabled toggle on hover. The new `enabled:hover:*` and `enabled:active:*` fills don't, so a disabled control no longer reacts on hover. This is an improvement. I'm naming it so nobody later reads it as a regression. Doc 138 R9 already describes it.
5. **Nit — the twMerge result for Stop depends on `cn`** (`:308`). `border-accent` replaces `border-transparent` only because the classes go through `cn`. LPS1 checks this in the DOM. If someone ever turns this into a static string, the rule in doc R11 applies: don't put two border colours in one static string.

### Good Practices Found
- **Tailwind and tokens:** only design tokens (`foreground/5·8·12`, `brand`, `accent`, `outline-strong`) and no new hardcoded colours. The only arbitrary values are the four MOTION tokens, which are already the project pattern in 9 other files.
- **Reduced motion:** `motion-reduce:transition-none!` is included.
- **Accessibility:**
  - Focus rings (`focus-visible:ring-2 ring-brand`) and `disabled:` tokens are kept.
  - `aria-label`, `role=option` and `aria-selected` are unchanged.
  - C measured contrast at 7.05 / 6.58 / 5.82 for rest / hover / press, all at or above 4.5.
- **Layout:** C measured no change in any box size at 1440 and 1280. Keeping a 1 px transparent border is what holds the size steady.
- **Add button:** no `border-transparent` was added to its static string, which correctly avoids depending on CSS order.
- **Tests:** they check that tokens are present or absent, not the exact string. Seven mutations (m206–m212) were all caught. Stop's accent border with no `border-transparent` is checked in the DOM.
- **TS strict, semicolons, Biome:** clean. No `any` or assertions. `verify.log` shows 171/171 test files, 2564 tests, and the build succeeded.

### Architecture note
- **Signal 3, repeated costly change:** `ArrangementLibraryPreview.tsx:307` and `:332`. The SURF/FILL/MOTION token set has now been copied into its 9th component, and each copy gets its own token-lock test and mutation sweep.
- **Keep for this round, because:** checkpoint Q1 fallback (c) is the recorded decision, and a shared constant would reach files the implementer doesn't own.
- **Proposal for the planner (already handed to B in doc 138, not a new finding):** after checkpoint Q1, one bounded task to add a `lib/arrangement/surface-classes.ts` constant (SURF/FILL/MOTION). Transport, Lane, GroupHeader, LibraryPreview and Master would use it, with one token-lock test. Acceptance: the existing per-file locks stay green and there is no visible rendering change.

### Alternative Approach
- Not applicable. There is no critical logic in this diff (no auth, checkout or Studio audio pipeline).

### Score: 9/10

This reviewed only the five candidate paths in the diff. It is not a full check of the Library module.