COMMIT: OK. No blocking issues. Nothing in the diff touches auth, purchase, download or protected-file code. TypeScript strict holds in the production code: no `any`, no `@ts-ignore`, no type assertions. Every colour is a design token; I confirmed `outline-hover` is defined at `app/styles/app.css:60`. All event listeners are React props, the window keyboard listener is the existing one with the new handler added to its deps, and no timers were added. Audio scheduling and Undo/Redo are unaffected, as shown by tests UC11 and UC8. The verify log shows 1900/1900 tests passing, and C's report shows PASS with a browser check at two screen sizes.

## Code Review: round 80 — collapsing and expanding track groups (`ArrangementGroupHeader.tsx`, `StudioWorkspace.tsx`, `groups.ts`, tests, docs 069/070)

### Critical Issues
- none

### Suggestions (most important first)

1. **Low — pressing U while a fader in a lane that would be hidden has focus is refused with the wrong reason (C's bug C80-1). `StudioWorkspace.tsx:951`.**
   - `focusHidden && isSliderTarget(...)` shows `GESTURE_EDIT_BLOCKED_MESSAGE` ("editing doesn't work during a drag") even when nothing is pending. A real pending change is already caught by the `isPointerGestureActive()` / `isArrangementPreviewActive()` checks a few lines earlier, so this branch only ever fires when nothing is pending. The message describes a drag that isn't happening.
   - The volume fader in `ArrangementLane.tsx:762` saves its value on blur (`blurTrackVolume` → `commitTrackVolume` when no pointer gesture is active). But when a focused element is removed from the page, blur may not run reliably, which is probably why the guard was added.
   - **Fix:** before `setTrackLaneLayout`, explicitly blur the focused element (`document.activeElement.blur()`) so any value is saved synchronously, then continue the collapse and send focus to the group name through `pendingRowFocusRef`.
   - It is waiting on a planner decision, so it doesn't block this commit.

2. **Low — the fold button's label word order differs from the agreed wording (C80-2). `ArrangementGroupHeader.tsx:105`.** The button reads "ჯგუფის დაკეცვა / გახსნა — {name}". The agreed wording was "{name} — ჯგუფის დაკეცვა / გახსნა". Screen readers handle it fine either way; the planner decides whether to accept it or change the test helper at `track-groups-ui.test.tsx:219`.

3. **Low — fragile focus lookup. `StudioWorkspace.tsx:280`.** `trackRowNameButton` finds the lane's name button by matching part of the Georgian label (`aria-label*="— აქტიური ხაზის არჩევა"`). If that text ever changes, focus silently goes nowhere and no test fails loudly.
   - **Fix:** add `data-testid="arrangement-track-name"` to that button in `ArrangementLane` and select by it.

4. **Low — work repeated on every render. `StudioWorkspace.tsx:2332-2336` and `:326`.**
   - `trackGroupDescendantTrackIds(arrangement, row.id)` is recalculated for every collapsed group on every render. It belongs inside the existing `trackGroupOverviews` memo, which could store `{ blocks, containsActive }` per group id.
   - `trackRowsLayoutKey` rebuilds a joined string of all rows on every render with no memo. Wrap it in `useMemo(..., [trackRows])`.
   - Both are cheap today.

5. **Low — layout is recalculated twice per collapse. `StudioWorkspace.tsx:427-440` and `:796-803`.**
   - `setTrackGroupsCollapsed` already recalculates the lane layout. The changed `trackRowsLayoutKey` then triggers `refreshTrackLaneLayout()` a second time. Test UC6 shows the result is correct.
   - The same function also builds the collapsed-groups map twice: once from the ref and once inside the state update.
   - **Fix (optional):** build the next map once and reuse it in both places.

6. **Low — the collapsed state of a deleted group is never cleaned up.** Entries in `collapsedGroups` stay after a group is ungrouped. Group ids come from `crypto.randomUUID()` (`groups.ts:221`), so a new group can't pick up an old entry, and Redo deliberately restores a group as collapsed. No fix needed now.

7. **Low — leftover export.** `trackGroupRowCount` (`groups.ts:176`) is now only used by `groups.test.ts`. Remove it, or keep it on purpose.

8. **Low — stale doc status.** `docs/implementation/2026/quarter-IV/070-...md:4` still says it is waiting for C's check, although C has passed it. This matches the project's pattern (doc 069's PASS line was updated in this round), so it's not a blocker.

9. **Nit — test code.** The `'video' as const` in `track-group-collapse-ui.test.tsx:451` is a const assertion. Under the strict "no type assertions" rule, adding a return type to `fitEntries` would be cleaner.

10. **Note — hidden selections after Redo.** Redo can bring back a clip selection inside a collapsed group (UC8), so Delete would then remove a clip the user can't see. The collapsed group's overview does mark it as selected, so this looks like a deliberate choice. It should be written down in doc 070.

### Good Practices Found
- **Browser key handling:** on the fold button, Space is blocked on both keydown and keyup with propagation stopped, so it doesn't also start playback and the button doesn't fire twice in Chrome or Firefox. The global Enter handler already skips buttons, so Enter on the fold button doesn't add a library clip.
- **Collapse rules:** U ignores modifier keys and key repeat, and collapse is refused during a drag or a pending preview. Collapse state is view state only: no Undo history entry, and the arrangement stays the same object.
- **Hidden lanes:** they are removed from the page rather than just hidden, so their controls can't be reached by keyboard or screen reader. Selections, anchors and lane ranges inside hidden lanes are cleared, while a range covering all lanes is kept.
- **Lane heights:** auto-fit only measures visible lanes and writes heights back by track id, so a hidden lane keeps the height the user set.
- **Accessibility:** `aria-expanded`, the collapsed group's label includes its clip count, the overview strip is `aria-hidden` and `pointer-events-none`, and the fold button is 24px (meets the WCAG 2.2 AA minimum target size).
- **Structure:** the pure logic (`visibleTrackGroupRows`, `trackGroupCollapseTargets`, `trackGroupOverviewClips`) lives in `lib/`, and the tests cover the real-world orderings well (UC10b marquee, UC11 playback, F1/F3 focus).

### Architecture note
- **Signal 4 (new state and lifecycle inside an existing owner): `StudioWorkspace.tsx:210, :332, :350-357, :259-310`.**
  - `collapsedGroups` was added to the lane layout state.
  - Also added: `pendingRowFocusRef` with a layout effect that has no dependency list, and three helpers that query the page (`trackRowElement`, `trackRowNameButton`, `focusedTrackRowId`).
- **Keep for now.** It shares one lifecycle with lane layout, Undo/Redo and audio timing are untouched (UC8/UC11 confirm this), and the pure logic is already in `groups.ts`.
- **Proposal for the planner only (not this round):** after stage 3, one bounded task to move the focus-restoration helpers into `app/lib/arrangement/row-focus.ts`.
  - Done when the focus tests UC9 and F3 pass unchanged.
  - The lane name button gets a `data-testid` to replace the label match.
  - The `useArrangement()` shape stays the same.
  - Cost: low.

### Alternative Approach (focus when a collapse hides the focused lane)
- **Current approach:** refuse the collapse when a fader in a lane that would be hidden has focus. When the focus is elsewhere in that lane, move it to the group name after the update.
- **Alternative:** blur the focused element synchronously before the state change (this saves any fader value through `blurTrackVolume`), then always move focus to the group name.
- **Verdict:** the alternative is better for the user: no refusal with the wrong reason, and the save stays atomic because it happens before the lane is removed. The current version is safe, so this can be a follow-up and doesn't block the commit.

### Score: 8.5/10

This reviews the diff only, not the whole module.