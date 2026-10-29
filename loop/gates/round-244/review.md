COMMIT: OK

The round-244 candidate (5 paths) is safe to commit. I found nothing blocking. It touches no auth, purchase, download or style code, adds no new listeners or timers, and introduces no `any`, `@ts-ignore` or type assertions (`closest<HTMLElement>` is a type parameter, not a cast). Per `verify.log`, all 214 test files and 3089 tests pass, Biome reports "No fixes applied" and the build passes. The only lint warning, `AudioPlayer.tsx:48` (useButtonType), is already in the code and outside this candidate.

## Code Review: ArrangementMarkerRow.tsx, StudioWorkspace.tsx, grid-snap-menu.test.tsx, docs 186/188

### Critical Issues
- none

### Suggestions (in priority order)
1. **`ArrangementMarkerRow.tsx:159–162, 324–328` — a removed input stays in memory.** After every blur-commit, `blurSuccessorRef` keeps the input element even though React has removed it from the page. It is only cleared by the next `openEditor` or the next `focusEditorSuccessor` call. It is one node and doesn't grow, so it isn't a real leak.
   - **Fix:** store `{ session, markerId }` instead of the element, and check by session. Alternatively, clear the ref in `handleGridMenuRequest` when `focused !== pressFocus`, which is the point where it becomes unusable.
2. **`ArrangementMarkerRow.tsx:281–290` — `true` can mean "focus is only scheduled".** If the flag isn't on the page, `focusMarkerTarget` only sets `pendingFocusRef`, and that focus happens on a later render. Because `ArrangementMarkerRow` is a plain `forwardRef` with no `memo`, the row re-renders after `setGridMenu(null)` and the pending focus runs straight away. The risk is therefore Low and depends on that no-memo setup.
   - **Fix:** if someone later wraps the row in `memo`, have `focusEditorSuccessor` return `element?.isConnected === true` before saying focus succeeded.
3. **`StudioWorkspace.tsx:465–470` — `groupNameEditorRowId` reads `data-testid` at runtime.** It's the same pattern as the existing `trackRowNameButton` (`:351`), so it's consistent and not new. It does mean focus behaviour now breaks if test IDs are ever stripped in production builds.
   - **Fix (later):** use a dedicated attribute such as `data-group-name-input` and keep `data-testid` for tests only.
4. **Already a gap before this change, not caused by it: macOS Ctrl+click.** That gesture sends `pointerdown` with `button === 0` plus `ctrlKey`, so `pressFocus` (`:1870`) stays `null`. After a Ctrl+click the menu still returns focus to the page body, for the marker/group editors and for the fader/BPM cases alike.
   - **Fix:** treat it as a right press with `event.button === 2 || (event.button === 0 && event.ctrlKey && isMacPlatform)`. That's a separate small task for the planner.
5. **Real-browser event order.** In jsdom, `activeElement === body` at `contextmenu` time is guaranteed. In a real browser, the default action of the right-button mousedown could move focus to a focusable ancestor. I checked the DOM: the scroller (`:2613–2620`) has no `tabIndex` and contains focusable children, so Chromium won't make it a keyboard-focusable scroller. Doc 188 also records a Chromium probe at 1440×900 and 1280×720. I accept the claim on that evidence.
6. **Public surface.** `ArrangementMarkerRowHandle` gained `focusEditorSuccessor`. The change is additive and its only caller is `closeGridMenu`, but the planner should know the handle's shape changed.
7. **Doc nits in `188`.** The test order is GM49 then GM48, while the doc says "GM44–GM49". Cosmetic only.

### Good Practices Found
- **Identity check.** The successor is used only when the stored input is exactly the element the menu wants to return focus to, and the ref is cleared on every read. GM49 checks that an older marker successor can't take a later group's focus return. MU14 keeps the "focus stays where the user moved it" behaviour.
- **Group id captured on press.** It's read while the input is still on the page, because `closest()` on a removed node returns `null`. Doc 188 explains this correctly.
- **Writes on every press (L1).** `releaseEditFocusOnTimelinePointerDown` now writes the press-focus ref on every press, so a left press removes a stale value. GM47 also covers the header path, where no menu opens.
- **Tests now exercise the real blur.** GM40–GM43 call `rightPress`, so the blur comes from the capture handler instead of being faked. The `BODY` setup assertion can now fail.
- **Callback deps are correct.** `closeGridMenu` keeps `[]` deps because it reads only refs and module functions. `focusEditorSuccessor` has the right deps.
- **The commit-on-blur contract is unchanged.** Same history entry, status messages and naming rules. Undo/Redo stays atomic.

### Architecture note
- **What I found:** a region that keeps needing costly changes (signal 3), plus new state added to existing owners (signal 4).
  - `StudioWorkspace.tsx:1617–1660, 1867–1887`: this is the third focus-return change in rounds 242–244.
  - Two more refs at `:586–587`.
  - One ref in `ArrangementMarkerRow.tsx:159`, plus a new method on its handle that another component calls.
- **Keep for now.** These invariants are covered by tests that pass: gesture lifecycle, Undo/Redo, the FR/GM/MU sets, and the shape of `useArrangement()`. Pulling the code out needs its own set of covering tests. Cost: medium.
- **Proposal for the planner (doc 188 TODO, ARCH-CHECKPOINT-TEMPO-GRID addendum 9):**
  - **Task:** extract `useGridMenuFocusReturn(scrollerRef, markerRowRef)`. It would own the press/return refs and group ids and return `onPressCapture`, `captureReturn(event)` and `restore()`.
  - **Ownership:** StudioWorkspace only. The marker-row handle stays as it is.
  - **Acceptance:** GM14 and GM36–GM49, FR1–FR4 and MU14 all pass with no changes. Add a mutant test proving the hook still has a single writer.

### Alternative Approach (focus/gesture lifecycle)
- **Current:** the editor still commits on blur. When the menu's return target is no longer on the page, `closeGridMenu` uses fallbacks: first the marker successor (with the identity check), then the group's name button.
- **Alternative A:** don't blur on a right press, so the editor stays open. The doc correctly rejects this: the menu takes focus itself, so the editor would blur and commit anyway, and paths where no menu opens would change.
- **Alternative B:** have every editor register a "successor" through one shared registry (for example a context or a single ref map) instead of two separate mechanisms.
- **Verdict:** keep the current approach. There are only two inline editors (doc 188 confirms no others exist), so B would be a one-off abstraction. B becomes worth doing if a third editor appears, and it would fit naturally into the `useGridMenuFocusReturn` extraction above.

### Score: 8/10