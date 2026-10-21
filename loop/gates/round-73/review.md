COMMIT: OK (no blockers. Nothing touches auth, purchase or download code; verify.log shows 103 files and 1744 tests passing, `# fail 0`)

## Code Review: round-73 markers (SRW-16 stage 1, C-R72-01 fix)

This reviews the diff only, not the whole module. I read the 10 candidate paths, `ArrangementContext`'s exported value, `model.ts` `isSameArrangement`/`commitHistory`, and `view.ts` `timelineNavigationKey`.

### Critical Issues
- none

### Suggestions (ranked)
1. **macOS gets no Ctrl+←/→** — `StudioWorkspace.tsx:1432-1449`. Out of the box, macOS uses Ctrl+←/→ to switch Spaces, so the browser never sees the key. Mac users can still use the ◀ ▶ buttons, so the feature is reachable. Fix (stage 2): add Alt+←/→ as a second binding on Mac, or write a note in doc 064. Don't use Cmd+←/→, because those are text/back-navigation shortcuts.
2. **F2 and Delete on a flag can't be found by keyboard or screen reader users** — `ArrangementMarkerRow.tsx:370-372`. They are listed only in `title`. Fix: add `aria-keyshortcuts="F2 Delete"` to the flag. Also, `aria-current="true"` (`:371`) is the wrong meaning for "selected": use `aria-pressed`, or move "selected" into the label text.
3. **The +/◀/▶ buttons are 16px tall** — `ArrangementMarkerRow.tsx:36` (`h-4`). That is below WCAG 2.2's 24×24 minimum target size (2.5.8). The buttons sit next to each other with almost no gap, so the spacing exception doesn't apply. Fix: give the header row a little more height or the buttons more padding (`gap-1.5` stays). This matches the existing chrome, so it's low priority.
4. **The name editor can push the horizontal scroll width** — `ArrangementMarkerRow.tsx:421-422`. The `w-40` input sits at `left = time·pxPerSecond`, and near the end of the timeline it goes past `timelineWidth`. Markers can also end up past the project end, for example after a Cut Time. Fix: limit `left` to `timelineWidth - 160`, or put `overflow-hidden` on the strip. Then check that the flag's focus ring isn't clipped.
5. **The ref callback is recreated on every render** — `ArrangementMarkerRow.tsx:354-360`. On each render React calls the old ref with `null` and then the new one, so the Map deletes and re-adds every entry. This is correct and cheap: the context value has no frame-rate `position`, only `getLivePosition`. It's a nit; a single stable callback that uses `data-marker-id` would also work. The effect at `:106-114` with no deps is also cheap and correct.
6. **A pending focus target can go stale** — `ArrangementMarkerRow.tsx:103`. If `commitArrangement` refuses the change and the flag never appears, `pendingFocusRef` stays set, and a later render could unexpectedly steal focus. Fix: in the effect, clear the target if the element doesn't exist after the commit (`pendingFocusRef.current = null` before the lookup already does this). Or check that `refuseEditDuringGesture` can't happen here. Low risk.

### Checked and correct (real-browser behaviour)
- **Enter/Escape followed by blur.** `settledRef` makes the editor settle only once. On rename, the flag is focused synchronously, which fires the input's blur, and that blur does nothing. On add, focus is deferred through `pendingFocusRef` until the new flag exists.
- **Round-73 blur.** The scroller capture runs before the clip's `claimPointerGesture`, so `isPointerGestureActive()` is still false at that point. The clip's `preventDefault` keeps focus off the clip, focus goes to `body`, and the window's Delete reaches `deleteSelection`. `focused.contains(target)` and the "flag and editor can't both exist" argument hold.
- **Ctrl+← in text inputs** still jumps by word, because `isTypingTarget` returns early at `:1290`. `timelineNavigationKey` ignores ctrl/meta, so there's no conflict.
- **During a drag,** M and Ctrl/Cmd+Arrow are refused with `GESTURE_EDIT_BLOCKED_MESSAGE`. The buttons and flag-Delete check through `runUnlessGesture`.
- **Undo/Redo.** `isSameArrangement` is `JSON.stringify`, so marker changes become history entries. `replaceArrangementMarkers` removes the key when the list is empty, so add followed by delete gives back the exact same arrangement.
- **Cut Time.** `deleteTime` is the only operation that shifts time. A marker at b lands on a and is merged; markers inside the range are removed and counted in the status message.
- **Audio.** `scheduleKey` doesn't change, so audio doesn't resync.
- **TS strict** (no `any`, no assertions, semicolons present) and **Tailwind tokens** (`bg-muted`, `brand`, `foreground/10`, `outline`; inline style only for dynamic px values) both pass.
- **No XSS route:** `marker.name` is rendered as React text, and there is no persistence layer that reads untrusted data.
- `timelineChromeHeight` is measured at runtime (`StudioWorkspace.tsx:539`), so the new 20px row doesn't break the lane offsets.

### Good Practices Found
- The pure logic in `markers.ts` imports nothing from React or `model.ts`, so there's no import cycle.
- The `markers?` field is optional, so the Arrangement literals in SfxScene and free downloads are untouched.
- Mutation testing was used (i, ii, h1, h2), and MU8f tests the window's guard directly.

### Architecture note
- **Signal 3 (repeated expensive change) and signal 2 (coupling)** — `StudioWorkspace.tsx:1148-1151`, `:1439-1443`, `:1495`, `:1507-1510`. Each widget that handles its own keys (loop brace, separator, marker) needs the same `isXTarget` guard added in 3–4 branches, and this round's bug, C-R72-01, was exactly one forgotten branch. → **proposal for the planner:** one predicate, `isSelfHandledKeyTarget(target)`, keyed on a data attribute (`data-studio-key-owner`). Replace the three existing predicates with it in the blur, Delete, Arrow and Ctrl+Arrow branches. Acceptance: MU8, MU8c-f, and the existing loop-brace and separator tests stay green with no behaviour change. Focused tests: `markers-ui`, the loop-brace UI tests, and the separator tests. Value: medium, risk: low.
- **The `useImperativeHandle` wiring (workspace → marker row)** → keep, because the workspace only forwards keys and ownership of the row's state stays in one place.
- This note is a proposal, not something to fix in this round.

### Alternative Approach
- **Current:** marker state lives in `Arrangement`, a forwardRef row exposes an imperative handle, and the window keydown handler forwards M and Ctrl+←/→ to it.
- **Alternative:** add `addMarker`/`stepMarker` actions to `ArrangementContext`, with the workspace calling the context and the row just displaying.
- **Verdict:** keep the current approach. The editor and focus lifecycle belong to the row, and moving them into the context would add new state to an already very large owner. That would be signal 4.

### Score: 8.5/10