COMMIT: OK

There are no blockers. I only read the diff. I did not test in a browser; the browser evidence is C's round-79 PASS. The verify log shows 111 test files and 1871 tests passing, and both builds succeeded. **No auth, purchase or download code is touched.**

## Code Review: Track Groups Stage 1 (round 79): `groups.ts`, `ArrangementGroupHeader.tsx`, `ArrangementLane.tsx`, `ArrangementClip.tsx`, `StudioWorkspace.tsx`, `types/arrangement.ts`

### Critical Issues
- None.

### Suggestions (most important first)
1. **The timeline part of a group row ignores the mouse** — `ArrangementGroupHeader.tsx:141`. The empty strip next to the group name has no `onBackgroundPointerDown`, unlike every lane row. Clicking it does not deselect clips. Dragging from it does not start a marquee or move the playhead. Tests can't catch this; it only shows up in a real browser.
   **Fix:** pass `handleLaneBackgroundPointerDown` into the group header and attach it to the strip, the same way lanes do. At minimum, make a click there deselect.
2. **Focus is lost after Ctrl+Shift+G** — `StudioWorkspace.tsx:776-796` (`ungroupSelectedTrackRows`). If the group name button has focus, ungrouping removes it and focus falls to `<body>`. The marker row puts focus back after edits; this path doesn't. Keyboard and screen-reader users lose their place.
   **Fix:** after a successful commit, focus the name button of `result.childIds[0]`, for example via a `[data-track-id]` / `[data-group-id]` query in a rAF.
3. **The new shortcuts can't be found** — `StudioWorkspace.tsx:2201-2204`. Ctrl+G, Ctrl+Shift+G and F2 appear only in the group button's `title` (`ArrangementGroupHeader.tsx:13`). That button only exists once a group exists, and keyboard and screen-reader users never see a `title`.
   **Fix:** add `Ctrl+G / Ctrl+Shift+G · F2` to `arrangement-shortcut-hint`.
4. **The Mac hint text is wrong** — `groups.ts:289`. The message says "Ctrl+click", but on macOS Ctrl+click opens the context menu and never fires `click`. Only Cmd+click works there; the code already accepts `metaKey`, so only the text is wrong.
   **Fix:** write "Ctrl/Cmd+click", or choose the text with `isApplePlatform`.
5. **Dragged group clips snap back over a group header** — `ArrangementClip.tsx:432` vs `:497-504`. When a multi-clip move is refused, the code clears `gesture.laneTarget`; the single-clip path keeps it. With the new rule ("pointer over a group header → keep the last target"), a multi-clip drag over a header jumps back to its own lane, but a single clip stays on its last target. This existed before but is only visible now. It belongs to whoever owns drag, not this round.
6. **Render cost (note only)** — `StudioWorkspace.tsx:211`. `trackGroupRowCount(arrangement)` runs on every render, including every preview frame during a drag. It's cheap: it returns 0 immediately when `groups` is undefined and is linear otherwise. No change needed now.
7. **Doc 069 status is stale** — `069-…md:4` still says "waiting for C's check" although C has passed. This follows the 068 pattern, so update it next round.

### Good Practices Found
- **Pointer zones fixed:** the new three-zone `laneTrackIdAtPointer` (`ArrangementClip.tsx:188-194`) is a real fix. The old version returned the last row for any gap between rows; now a gap returns `null` and the caller falls back to an earlier target. Without groups the result is the same as before.
- **Ctrl+G placement:** the block sits before `if (modifier) return;`. It excludes `altKey`, so AltGr on Windows doesn't trigger it, and ignores `repeat`. It always calls `preventDefault`, so the browser's Find Next can't take over. It uses `shortcutLetter` (`event.code`), so the Georgian keyboard layout works.
- **Selection safety:** `liveTrackSelection` is applied on every render and before every command, so a stale selection after Undo can't corrupt anything. Every command checks `isPointerGestureActive()`, and status only changes if `commitArrangement` succeeds.
- **Pure logic in `groups.ts`:** no `any` or type assertions, cycle protection (`seen` sets), a normal form so `ungroup(group(a)) === a`, and ungroup works from derived parents.
- **Rename editor:** same settle/blur pattern as the marker row. `stopPropagation` keeps F2/Enter/Escape away from the window handler, and focus returns after Enter/Escape. Blur during a gesture discards the edit, the same as markers.
- **Tailwind and tokens:** only tokens are used (`bg-elevated`, `border-outline`, `bg-brand/20`, `ring-brand`). Inline styles appear only for computed px values. The name button is 24 px tall, which meets WCAG 2.5.8.
- **Audio untouched:** `arrangement.tracks` order and `scheduleKey` don't change, and `ArrangementLane` is not memoized, so the new props add no extra re-renders.

### Architecture note
- **Signals 4 and 2:** `StudioWorkspace.tsx:207-212, 267-373, 1625-1635` adds new UI state (`trackSelection`, an anchor ref, a group-count ref, a layout effect) and four command callbacks to an owner that has changed in many recent rounds. Separately, `ArrangementGroupHeader.tsx:5-9` imports layout constants from a sibling component (`ArrangementLane`).
  → **keep for now.** The window keydown handler needs the selection through refs and filtered against the live arrangement, and keeping it in one place avoids passing props around.
  → **Proposal for the planner** (when Stage 2/3 add fold and group mixer): extract the selection and group commands into one bounded `useTrackRowSelection` hook. Acceptance criteria:
  - `useArrangement()` keeps its shape;
  - TG1–TG11, TG8b and GU1–GU6 stay green;
  - no new window listeners;
  - Undo/Redo stays one entry per command.

  Move `ARRANGEMENT_HEADER_WIDTH_PX` and `TRACK_HEADER_PADDING_X_PX` into `lib/arrangement/` only if that extraction happens.

### Alternative Approach (Studio gesture/undo — critical logic)
- **Current:** two optional fields (`groups?` on the arrangement, `groupId?` on a track). Group header rows are computed from them with `trackGroupRows` and render as sibling elements with no `data-track-id`.
- **Alternative:** add a `kind: 'group'` track to `arrangement.tracks`, or wrap each group and its children in one container element.
- **Verdict: keep the current approach.** Playback, export, meters and auto-fit never see group rows, so audio can't regress in Stage 1. Without a wrapper, marquee and `laneTrackIdAtPointer` keep working on direct lane children. Stage 3 summing can be built on `groupId` without migrating stored data.

### Score: 8.5/10