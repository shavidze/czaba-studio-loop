COMMIT: OK

## Code Review: round 251 (SABA-B-10a stage 2a + fix-up for C-R250-01)

I reviewed only the diff, not the whole module. Checked: all 17 paths in `paths.txt` (`untracked.txt` is empty) and `verify.log` (215 test files and 3,132 tests passed, `tsc --noEmit` clean, build passed). Lint shows 205 old warnings and no errors. 186 of those warnings are hidden in the log, so I can't say from the log alone whether any come from the changed files.

### Critical Issues
- None. The diff doesn't touch auth, purchase, download, the API client or Firebase. No new `any`, `@ts-ignore` or type assertions. No new Tailwind classes or hardcoded colours: the span keeps `font-mono tabular-nums`, and TH10 checks it.

### Suggestions (ranked; none block the commit)
1. **Low: the library readout mixes React text with direct DOM writes.** `ArrangementLibraryPreview.tsx:63-78`
   - The span gets its first text from JSX, then the effect overwrites `span.textContent` directly. That replaces the text node React owns.
   - This is safe today. The component is memoised, has no props and reads only a stable context value (the store is created once in `ArrangementContext.tsx:663`), so it never re-renders. The old `LibraryPlayheadText` used the same pattern.
   - It breaks if someone later adds a prop or makes the text depend on state.
   - Fix (when the component is next touched): render an empty span and let the effect be the only writer. Or add a line to the doc saying the component must stay prop-less.
2. **Low: the shortcut sheet row is incomplete.** `shortcuts.ts:84` says "Add a marker at the insert marker". Two cases are missing: with a time selection M uses the selection start, and during playback it uses the playback position (IM18 and IM23 test both). The button title at `strings.ts:507` is already correct. This is already tracked as A-R250-REVIEW-SHEET-MARKER-COPY for 10b.
   - Fix: reuse the `addTitle` wording, e.g. "Add a marker (selection start / insert marker / playback position)".
3. **Low: copy still says "playhead" in places.** `strings.ts:504-505` (`noneAfter` / `noneBefore`) and the ruler titles still say "playhead". This is in scope for stage 2b (B-R250-NAV-ORIGIN, B-R250-PLAYHEAD-TITLES) and is written down in the doc's TODO. Not a regression.
4. **Info: Home during a drag gives no feedback.** `StudioWorkspace.tsx:2436` now swallows Home during a pointer gesture: `preventDefault` runs and nothing else happens, with no status message. This matches the other gesture-guarded keys (KeyO, zoom). In a real browser it doesn't change pointer event order and adds no listener. Worth checking by hand in Chromium: keyboard Home while dragging a range should still move neither the page scroll nor focus.
5. **Info: paste/add/split while playing use the insert marker.** `ArrangementContext.tsx:1590,1977,2001,2264` now read `insertMarkerRef.current` during playback too. Saba should confirm this: Enter-add during playback no longer lands at the moving playhead. It's recorded as SABA-Q-10A-DEVIATIONS (e), so it isn't hidden, but it's a user-visible change from ABL-R-6.

### Good Practices Found
- **Listeners and timers:** `subscribePosition` returns its unsubscribe function from the effect, and the dependency array is just the stable store. No leak and no new timer.
- **Render cost:** playback frames no longer touch the library line at all. The R9-L1 test proves it: 60 position frames leave the text unchanged with 0 renders, and both marker moves are written with 0 renders.
- **Context value:** `getLocatorPosition` is wrapped in `useCallback([livePosition])` and appears in both the value object and its memo dependencies (`ArrangementContext.tsx:3921,4037`). Removing `livePosition` from three other dependency arrays shrinks the set of things that cause re-creation.
- **Audio timing:** `startPlaybackAt` only adds an `origin` argument used in status text. The start order and audio-context handling are unchanged.
- **Undo/Redo:** each edit is still a single `applyEdit` call, and the tests do Undo between the stopped and playing branches.
- **Tests:** IM3 and IM13 now separate the marker from the playhead first, so they actually test something. Red-proof mutants are listed in the doc.
- **Strings:** all new copy is in `strings.ts`, and ST11 checks the exact text for all three start points.
- **Accessibility:** the Split button keeps `aria-keyshortcuts`, and its title follows the real target.

### Architecture note
- **Signal 4 (new state/lifecycle in an existing owner):** `ArrangementLibraryPreview.tsx:63` adds a second store subscription next to the preview cursor's own effect (`:141`). **Keep**: it has one lifecycle and no prop plumbing, and pulling it out would only create a one-off abstraction.
- **Signal 2 (ownership/coupling):** `ArrangementContext.tsx:1479` adds `getLocatorPosition` to the public `useArrangement()` shape. Choosing "which position" is now split three ways: context (`getLocatorPosition`), commands (`insertMarkerRef`), and components (`getLivePosition` for Ctrl+←/→ in `ArrangementMarkerRow.tsx:270`).
  - Proposal for the planner, at the 10a/10b checkpoint already logged as GATE249-ARCH-TRANSPORT-POSITIONS: one small task that writes down which position each command reads, as a table or a pure function in `lib/arrangement`.
  - Constraints: `useArrangement()` keeps its shape, the IM/BR tests stay unchanged, and refs and timing are not moved.
  - This is a proposal, not an instruction for this round.

### Alternative Approach (critical logic: which position edits target)
- **Current:** each command reads `insertMarkerRef.current` directly. M alone uses `getLocatorPosition()` (live position while playing).
- **Alternative:** one `resolveCommandPosition(kind)` in the context that returns the selection start, the insert marker or the live position for each command type.
- **Verdict:** the current approach is right for this round. It's the smallest change, keeps the existing callback dependencies and has a test per command. The alternative is worth doing once stage 2b changes the Ctrl+←/→ origin, because by then four sources choose a position.

### Score: 8.5/10