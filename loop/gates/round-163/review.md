COMMIT: OK. Nothing blocks this commit. All seven paths are cosmetic: three float-button glyphs became lucide icons and two status sentences were reworded. Nothing in auth, purchase or download is touched.

## Code Review: ArrangementVideoDock.tsx + strings.ts (round 163, V-3c-3a)

This is a review of the diff only, not a full audit of the module. I read the diff, the full `132-…` doc, `ArrangementVideoDock.tsx` lines 59–60 and 795–1007, the start and summary of `verify.log`, and the two required primitives.

### Critical Issues
- None.

### Suggestions (most important first)
1. **Low: dead `text-xs` on the float buttons** (`ArrangementVideoDock.tsx:60`). `text-xs` no longer sizes anything, because the buttons now hold only an SVG. The doc already tracks this as REVIEW-R162-STATIC-CN-DEAD-TEXT. Fix in a polish pass: remove `text-xs` from `VIDEO_FLOAT_BUTTON_CLASS`, or tie the icon size to it. Don't do it this round; the scope is frozen.
2. **Low: the 132 doc still says "In Progress (awaiting C round 163)"** (`132-…md:4`). C round 163 passed. This is the same pattern as 131, whose status is moved to Completed in the next round, so nothing is needed now. Fix: change it to `Completed (C round 163 PASS; published <sha>)` in round 164.
3. **Low: LG3 repeats ST14** (`strings.test.ts:2512–2529`). Its exact-value checks duplicate the updated `EXPECTED_VIDEO_PLAIN_STRINGS`. The part that adds value is the `glyphs` regex. Fix (optional): keep only the regex check and the `endsWith` check.
4. **Low: hard-coded clamp numbers in LVD2** (`floating-video.test.tsx:103`). `{ left: 1440 - 272, top: 900 - 153 }` depends on a 153 px box height that isn't defined anywhere. If the box size changes, this test fails for a reason unrelated to icons. Fix (optional): derive it from the file's existing viewport and size constants, if they exist.
5. **Info: an older doc still contains "Esc or ✕"** (`130-studio-v3c1-library-icons.md`). That is a historical record, not live UI copy. No action needed.

### Things checked that tests can't catch
- **Event ordering in a real browser.** When you press on an icon, the event target is the SVG `<path>` or `<svg>`. The guard at `:801` checks `instanceof Element`, and SVGElement counts as an Element. So `closest('[data-video-float-action]')` still finds the button, and the drag-handle lookup at `:813–816` still finds and focuses the handle (`HTMLElement`). The handlers didn't change and no `pointer-events-none` is needed. The m177 mutation shows LVD2 catches a guard that reads the target directly.
- **Leaks.** No new listeners, timers, effects or state. The `claimPointerGesture` and cleanup path is unchanged.
- **Render cost.** Three static SVGs, no new props or memo concerns. lucide-react is already imported by six neighbouring components, so the bundle cost is negligible.
- **Accessibility.** The icons are `aria-hidden` and the `aria-label`/`title` values are unchanged byte-for-byte; LVD1 checks the accessible names. The new wording "Esc or Close" matches the `Close (Esc)` title, which reads better for screen-reader users than a symbol did.
- **Tailwind and design tokens.** Only `size-2.5 shrink-0` were added. No hard-coded colours; the icons inherit `currentColor` from `text-muted` / `hover:text-foreground`.
- **TypeScript strict.** No `any`, no suppression comments, no type assertions. Statements end with semicolons.
- **Remaining glyphs.** None of ⠿ ⤢ ✕ is left in `app/` outside tests.
- **Gates.** `verify.log` reports 171 test files and 2546 tests passing, and the build succeeds.

### Good Practices Found
- The icon test (LVD1) checks that the button text is empty and that the icon, its class and its stroke are correct. Combined with the mutations (m173–m177), it actually locks the change in.
- LVD2 presses on the SVG itself, not the button. That closes a gap the older "does not start a drag from ⤢ or ✕" test left open.
- The doc lists the real-browser checks (exact pixels, CDP accessible names, real drag) as C-round browser rows rather than claiming jsdom proves them.

### Architecture note
- none. The diff shows none of the four signals: no new state, effect or listener, no ownership move, and only JSX children were swapped. `ArrangementVideoDock.tsx` is large, but per the checkpoint contract size alone isn't a signal. Keep it as is: the float gesture, focus and expand lifecycle all stay in one owner.

### Alternative Approach
- Current: the icons are plain children of the button, and the pointer guard uses `closest()`.
- Alternative: add `pointer-events-none` to each SVG so `event.target` is always the button.
- Verdict: keep the current approach. `closest()` already handles any child element, adds no class noise, and won't break if more children are added to the buttons later.

### Score: 9/10