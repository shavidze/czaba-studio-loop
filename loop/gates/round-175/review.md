COMMIT: OK

## Code Review: round-175 (DUX-R-5b-1 affordance colour), 13 paths at HEAD `0a4a41e`

Nothing here blocks the commit. Every code change only swaps a Tailwind class string. No event handler, effect, ref, timer, listener, cleanup, aria attribute, `data-*` attribute or layout value changed.

**Checks that came back clean:**
- **Auth, purchase and download code:** not touched. `paths.txt` lists 9 `app/components/arrangement/*` files, 2 tests and 2 docs. Nothing under `app/lib/auth*`, `services/api`, `contexts/Auth|Cart` or `routes/studio.$productId`.
- **Event ordering, leaks, regressions:** no hunk touches pointer, gesture or keyboard logic. Gesture lifecycle, Undo/Redo and the shape of `useArrangement()` are unchanged.
- **Render cost:** unchanged or slightly lower. In `ArrangementClip.tsx:859` and `:876`, two `cn()` calls that only joined fixed strings became plain literals. `cn` is still used at `:949`.
- **TypeScript strict:** no types changed.
- **Lint:** the 218 Biome warnings in `verify.log` already existed. None are in the 9 changed files.
- **Tokens:** `accent-foreground`, `bg-foreground/50`, `bg-background` and `bg-foreground/25` all exist in both the base theme and the Obsidian theme (`app.css:48/70`, `:3922/3930`). No hex values, arbitrary values or new CSS were added.
- **Accessibility:** every brass `focus-visible:ring-brand` and `focus-visible:bg-brand` is kept, and protected selection K7 (`border-brand bg-brand/60`) stays.
- **Verification:** 174 test files and 2589 tests pass, the build passes, and `affordance-colour-ui.test.tsx` passes 7/7.

### Critical Issues
- none

### Suggestions (ranked)
1. **`ArrangementDetailPanel.tsx:1121`**: the Clip details height separator still uses `hover:bg-accent/60`. It is the same kind of control as the lane height handle, which this round changed to `foreground/50`, so the two handles now look different. This is already tracked as A-R175-DETAIL-SEP-ACCENT, and DXA7 pins it at exactly 1. **Fix:** `hover:bg-foreground/50` (4.53 on background), once B rules on it. Low.
2. **`affordance-colour-ui.test.tsx:471-502` (DXA7)**: the test reads source files and counts raw substrings, including sites outside this round's scope (`ExportDialog` `accent-brand` must equal 6, Lane `'border-accent bg-accent/20 text-accent'` must equal 2). Any 5b-2/5b-3 edit, or a Biome reformat that splits a className across lines, will fail this test even though nothing broke. **Fix:** keep these source checks only for this round's files. Move the out-of-scope counts into a separate test that 5b-2/5b-3 explicitly own and update, or check them on rendered tokens, as DXA1–6 already do.
3. **`docs/implementation/2026/quarter-IV/144-studio-dux-r5b1-affordance-colour.md:4`**: the status still says "awaiting C round 175", but `c-round-175.json` shows PASS. Doc 143 was flipped to Completed in the following round, so this matches that pattern and doesn't block. Either flip it now or do it next round.
4. **Browser-only risk that jsdom can't check**: Chromium draws both the native range thumb and its filled track with `accent-color`. A light `#ece6da` thumb against the unfilled track could fall below 3:1. C's CONTRAST-DUX5B1 check covers this, and a fix-up is already planned (switch the 6 thumbs to `accent-muted`). Noted only.
5. A design note, not a code issue: scrollbar hover now goes from `dim` to full `bg-foreground`, which is a big jump in a dark theme. It's a deliberate choice (doc 144 rejects `bg-muted`: only a 1.24 contrast step from `dim`); it's in the list for Saba's possible veto.

### Good Practices Found
- Every site keeps its focus ring, and the selection, playhead and primary-action brass stays as specified (K7–K10).
- Doc 144 gives a contrast ratio for each site and explains why alternatives were rejected (`/40` at 3.25, `bg-muted/60` at 1.14 against selected).
- The hollow fade handle (`bg-background border-foreground`) is clearly different from the filled envelope point (K6). DXA2 checks both, and checks that the fade handles are hidden in Env mode.
- DXA7 pins the known gap at exactly 1 rather than silently allowing it. DXA4 unmounts between the loop-on and loop-off cases, and DXA5 checks the drag fill both during the drag and after release.
- The `track-layout.test.tsx` locks were updated together with the source change.

### Architecture note
- Signal 3, the same region changing repeatedly at high cost: `ArrangementClip`, `ArrangementLane`, `ArrangementGroupHeader` and the other 9 files have their className literals edited by hand in round 174, now 175, and next in 5b-2 and 5b-3. Each round also adds a test file that copies the fake Web Audio / ResizeObserver harness again (`affordance-colour-ui.test.tsx:25-102`) and pins token strings in source.
  - **Keep for now:** this round's scope is small, and tokens are the design system's contract. Audio timing, refs and gesture lifecycle are untouched.
  - **Proposal for planner (not this round):** (a) the shared test harness is already in the backlog as ROOT-RECON-GRID-HARNESS, so attach this file to that task rather than opening a new one. (b) Before 5b-2, decide whether a semantic token (an affordance-hover or on-state colour in `app.css` for the Obsidian theme) would replace the remaining ~60 one-by-one literal swaps. That would also let the next tests check one token instead of many raw strings.

### Alternative Approach
- Not applicable. This is a styling-only change with no auth, checkout or audio-pipeline logic.

### Score: 8.5/10

This is a review of the diff only, not a full audit of these modules.