I've finished reading the diff and the test, verify and doc files. Here is the review.

COMMIT: OK

## Code Review: SABA-B-3 fader pressed state (round 191, HEAD 338564e)

This covers only the round-191 diff. It is not a full review of the modules. Verify passed: 184/184 test files and the build is clean. No auth, purchase, download, API or context code was touched. There are no new effects, listeners, timers or refs, and no handler or ARIA changes, so the gesture lifecycle, Undo/Redo and the `useArrangement()` shape are unchanged.

### Critical Issues
- None.

### Suggestions (most important first)
1. **Stale doc status.** `docs/implementation/2026/quarter-IV/157-saba-b-3-fader-pressed-state.md:4` still says "In Progress (awaiting C round 191)", but C has passed. Also, line 60 lists the tests as FS0–FS6 while line 82 and the test file have FS0–FS7.
   **Fix:** set the status to Completed and change line 60 to FS0–FS7 before committing. This is doc-only and doesn't block the commit.
2. **The Pan reset button still has a double ring when it has focus itself.** At `ArrangementLane.tsx:786` the button keeps `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand`. The doc's own root-cause analysis says the global unlayered `:focus-visible` outline beats `outline-none`. So tabbing onto the reset button shows the same ~6 px double brass band that this round removes from the faders. Before this change, that 2 px outline gap showed the background between the two rings. The new `relative` and `::before` don't make it worse, but the bug is right next to the fixed controls.
   **Fix (not this round):** belongs to the GLOBAL-FOCUS-VISIBLE-UNLAYERED system task the doc already records. If it's wanted sooner, a small follow-up could give this one button `STUDIO_FADER_FOCUS_CLASS` (minus `rounded-full`) instead of `ring-2`.
3. **Low thumb-to-fill contrast (accessibility).** The thumb against the brass fill is 1.88:1 (doc line 84). I don't count this as a WCAG 1.4.11 failure: the 15 px thumb mostly touches the parent background, and the thumb against the track is 11.45:1. Still, at high levels the left edge of the thumb blends into the fill.
   **Fix:** this is Saba's call (doc TODO); a dark ring around the thumb would solve it. It doesn't block the commit.
4. **`accent-foreground` does nothing on the four level faders.** In `ArrangementLane.tsx:832`, `ArrangementGroupHeader.tsx:348`, `ArrangementMaster.tsx` (~209) and `ArrangementDetailPanel.tsx:853`, `appearance-none` means `accent-color` has no effect. In forced-colors mode the system colours win anyway. It's harmless, but it misleads readers, and DXA1 still asserts it.
   **Fix:** leave it for this round, since the DXA1 contract depends on it. Removing it can come later together with a DXA1 update.
5. **Class names are built with template literals instead of `cn()`.** All six call sites use `` `… ${STUDIO_…}` `` while the rest of the codebase uses `cn`. It works, because there are no conflicting tokens to merge. It's only a consistency nit.
   **Fix (optional):** `cn('h-4 …', STUDIO_LEVEL_FADER_CLASS, STUDIO_FADER_FOCUS_CLASS)`.
6. **Repeated lookups in the test.** `affordance-colour-ui.test.tsx:226-247` calls `byTestId` and `rangeByLabel` twice per row. It's a readability nit; assign each lookup to a local, as was already done for `pan`.
7. **Manual checks still open.** Safari thumb centring (the `-mt-[calc(var(--spacing)*1.375)]` value is correct: (15−4)/2 = 5.5 px), Firefox `::-moz-range-progress`, and real Windows High Contrast all still need a manual check (TECH-LEAD-MANUAL is already recorded). jsdom can't check these, so they should stay on the manual list and not be marked as passed.

### Real-browser and render checks (no issues found)
- **Peer ring placement:** `peer` is on the Pan input and the reset button is its direct next sibling, so `peer-focus-visible:` works. `before:end-full before:me-1` matches `gap-1` and works in RTL too. `before:pointer-events-none` keeps the second click going to the input.
- **Pan row:** with `folded` or `isVideo`, the input and the button disappear together, so the pseudo-ring never appears on its own.
- **Fill stays in sync:** each fill is computed from the same expression as the input's `value`: `trackVolumeSliderDb(volume)`, `master.gainDb` and `clipGainMaxDb`. So it follows preview and drag before commit, with no extra state or effect. The fill math (7.5 px + (100% − 15 px) × fill) lines up with the thumb centre in Chromium.
- **Render cost:** each render creates one small style object. Since `value` already re-renders on every preview, this adds nothing noticeable.
- **Layout:** going from `h-1` to `h-4` (16 px) plus the 2+2 px offset outline fits the 28 px group row and the lane rows that have h-5/h-6 buttons.
- **Tailwind and tokens:** only tokens are used (`brand`, `foreground`, `outline-hover`), with no hardcoded colours and no custom CSS. The `!` modifiers are a justified workaround while `app/styles` is frozen.
- **TypeScript:** `StudioLevelFaderFillStyle extends CSSProperties` with no `as`, `any` or `@ts-ignore`. `studioLevelFaderFillFraction` guards against NaN, an infinite span and a span ≤ 0.

### Good Practices Found
- The root cause was proven with on/off toggles (the outline and box-shadow drawing at the same time), not guessed.
- The Pan workaround keeps the frozen DOM-order test green, and FS1 locks the geometry the pseudo-ring depends on (`w-12`, `gap-1`, 4 children, no `disabled:opacity`).
- FS0 covers edge cases (zero span, NaN, ±Infinity), and the doc records red proofs and mutants.
- `forced-colors:appearance-auto` brings back the native control in High Contrast mode.

### Architecture note
- **Signal 2 (ownership/coupling):** `ArrangementLane.tsx:773,786` → **keep.** The Pan input's focus ring is now drawn on a sibling (the reset button's `::before`). This is CSS-only coupling, with no state or refs involved, and FS1 guards it. Pulling it into a wrapper would break the frozen `track-pan.test.tsx` DOM contract and isn't worth it now.
- **Signal 3 (same region changed repeatedly):** the focus ring on range controls changed in DUX-R-5b-1, then R169-N1, and now here, because of the global unlayered `:focus-visible` rule (`app/styles/app.css:379`, `app/styles/base/utilities.css:79`). **Proposal for the planner (one bounded task):**
  - **Change:** move the global `:focus-visible` rule into `@layer base`.
  - **Then:** remove the `!` modifiers in `studio-fader.ts` and fix the ~53 `outline-none + ring-2` sites in one pass.
  - **Acceptance:** each control shows exactly one ring (Playwright pixel check on 6 controls and a sample of buttons), and FS1/FS7/DXA1 are updated.
  - **Ownership:** `app/styles` plus `studio-fader.ts`.

  This is a proposal only, not approved scope.

### Alternative Approach (focus ring, a11y-critical)
- **Current:** an outline ring with `!` on each control, plus a peer `::before` ring for Pan.
- **Alternative:** fix the global `:focus-visible` cascade first (layer it), then use plain `focus-visible:outline-*` with no `!`, and give Pan a wrapper.
- **Verdict:** keep the current approach for this round. `app/styles` and `track-pan.test.tsx` are frozen. The alternative is cleaner but belongs to the system task above.

### Score: 8.5/10