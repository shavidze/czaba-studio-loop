COMMIT: OK (no blocking findings. The diff doesn't touch auth, purchase or download code. Verify passed: 107 files and 1824 tests, build OK.)

## Code Review: round 77, Ctrl/Option+←/→ stops at clip edges (SRW-16 2b-2)

I reviewed only this diff. I didn't audit the whole of `StudioWorkspace` or the marker row.

### Critical Issues
- None.

### Suggestions (most important first)
1. **Mac users aren't told about Option, and the buttons don't do what their shortcut does.** `ArrangementMarkerRow.tsx:673` (and the matching ▶ button) declare `aria-keyshortcuts="Control+ArrowLeft/Right"`. Two problems:
   - On macOS, Ctrl+←/→ is taken by the system for switching Spaces, so the only key that works there is Option. It isn't declared anywhere.
   - The buttons stop only at markers, while the keys now also stop at clip edges. So the declared shortcut does more than the button. This is already logged as R77-BUTTON-SHORTCUT-SUPERSET (Low).
   - **Fix:** in a later round, either remove `aria-keyshortcuts` from ◀ ▶ or rewrite the `title` to say "Ctrl / ⌥ + ← → (also clip edges)". Don't attach a platform-specific value during render, because the server and browser would render it differently. Low priority, so it doesn't block.
2. **The 067 doc status line is out of date.** `docs/implementation/2026/quarter-IV/067-studio-lab-marker-edge-navigation.md:4` still says "C-ის შემოწმებას ელოდება", but `c-round-77.json` is PASS. For 066 this line was fixed a round later (GATE76-S4). The cleaner fix is to change it to "C PASS" in this commit, before committing. Low priority.
3. **Minor speed-up in `clipEdgeTimesOnTracks`.** `edge-navigation.ts:40` calls `trackIds.includes` inside `filter`, which costs O(clips×tracks) on every keydown, including key repeat. A `new Set(trackIds)` makes this linear. At current sizes it doesn't matter, so this is optional.
4. **Possible test flakiness.** `marker-edge-nav-ui.test.tsx:428-429` (EN10) checks the position against the real clock (`< 2.75`). The window is 0.5 s and the code between the two calls is synchronous, so the risk is very low. If a slow CI run ever fails it, freeze the clock with `fakeClock.base`.
5. **Pre-existing, not from this diff:** on Windows and Linux, Alt+← is the browser's Back shortcut. When no clip is selected, the workspace doesn't block it. This is the documented N8 behaviour, so I only note it.

### Checked and correct (what tests can't show)
- **Real-browser event order.**
  - Focused library row (`ArrangementLibrary.tsx:238`), preview wave (`ArrangementLibraryPreview.tsx:201`) and marker flag (`ArrangementMarkerRow.tsx:605`): these handle the arrow on the element first and stop it from reaching the window listener. The flag handler returns early when `altKey` is set, so the window branch navigates and the marker doesn't move (EN11).
  - Text fields: the typing guard at `StudioWorkspace.tsx:1304` catches the key first, so Option+← still jumps by word in text inputs.
- **Pointer gesture in progress.** On a Mac, Option+arrow has `modifier=false`, so it falls into the existing `!modifier && Arrow*` block (lines 1368-1373). Correct (EN9).
- **Modifier combinations.** Ctrl+Alt (including AltGr on Windows), Meta and Shift are all excluded. The branch runs before the clip-nudge code, so on a Mac Option+→ no longer moves a selected clip (N6). On other platforms, the Alt path and the nudge are unchanged.
- **Server rendering.** `navigator` is only read inside the keydown handler, not during render, so there's no server/browser mismatch. The platform check deliberately ignores `AppleWebKit`, which all Chromium user agents contain.
- **Listeners and timers.** No new listener, effect, timer or state. Edges are computed only at keydown, from `workspaceRef.current`. There's no extra render cost and no memoization is needed.
- **`adjacentMarkerTarget`.** With `edgeTimes` omitted or `[]`, the result is identical to round 76 (EU3 table). An edge within `MARKER_TIME_EPS` of a marker counts as that marker. Going forward, an edge is clamped to `end`. Going backward, rounding can't produce a negative time. The status text appears only when there is no target.
- **History and audio.** No `undoLabel` is created, playback continues and the arrangement isn't changed (EN5/EN10).
- **Code rules.** TypeScript strict passes with no `any` or type assertions (`Reflect.deleteProperty` in the test is fine). Semicolons are present. No CSS or Tailwind changes. No new comments.

### Good Practices Found
- The three pure functions live in `lib/` with no React or `navigator` dependency, and they're covered by unit tests. Only the platform value is passed in from the component.
- `edgeTimes` is an optional parameter, so the ◀ ▶ buttons and the old behaviour aren't touched (N5).
- Edges are rounded with `roundMarkerTime`, which removes the floating-point noise (e.g. 4.1 + 1.8).
- The mutation list in the doc matches what the tests cover.

### Architecture note
- **Signal 3 (the same region keeps getting expensive changes):** the global keydown handler at `StudioWorkspace.tsx:1300-1566` has been changed again. Rounds 73, 76 and 77 each extended its arrow and modifier precedence. The order now carries meaning: navigation keys, then the gesture block, then Ctrl/Option stepping, then `modifier` return, then nudge. Each round needs a full UI test with audio and pointer-capture mocks (this round added 539 lines of fixtures).
  - **Keep for now:** the handler has one lifecycle and one `workspaceRef`. Splitting it would put precedence, the gesture block and `preventDefault` timing at risk.
  - **Proposal for the planner (not approved scope):** one bounded task. Extract a pure `resolveArrowShortcut({key, ctrl, alt, meta, shift, isApple, targetKind, hasSelectedClip, gestureActive}) → 'step' | 'nudge' | 'block' | 'browser' | null` into `lib/arrangement/` and cover it with a table test. The handler would only execute the result, and its order would stay the same.
    - Acceptance: the existing EN1–EN11 tests and the round-73/76 nudge and gesture tests stay green unchanged.
    - Cost: low to medium.
- **Signal 2 (coupling):** the workspace now works out which tracks count as "selected" and passes the result to the marker row through `stepMarker(…, edgeTimes)`. This is one-way, and the logic lives in `lib/`, so keep it as is.

### Alternative Approach (critical logic: keyboard navigation in Studio)
- **Current:** at keydown, the workspace computes the edges and passes them to `adjacentMarkerTarget`, which merges markers and edges and treats an edge on a marker as the marker. The Apple check runs only at keydown.
- **Alternative:**
  - A combined list of stops (markers plus edges) memoized in the context, updated whenever the arrangement or selection changes.
  - Or deciding the platform once in a mount effect.
- **Verdict:** the current approach is better.
  - The memoized list would recalculate on every selection or drag change, which adds render cost and is used only on a keypress.
  - A mount-time platform flag adds state and gains nothing.
  - Computing lazily at keydown has no lifecycle, no hydration risk and no cost while dragging.

### Score: 9/10