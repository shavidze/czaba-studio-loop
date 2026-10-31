COMMIT: OK. Nothing blocks the commit. The diff doesn't touch any auth, purchase, download, cart or API-client code.

## Code Review: round 294 — `/studio-lab` narrow-window state (FIX-PD-1c)

I read the diff, the 4 new files, `SECURITY_AUDIT.md`, `ERROR_TAXONOMY.md` and `architecture-checkpoint.md`. I also read the parts of `ArrangementContext` and `StudioWorkspace` the new code calls into: `stopPlayback`, `togglePlayback`, `stopLibraryPreview` and the pointer-gesture handling. This reviews the diff only, not the whole module. The verify log shows 226 test files and 3385 tests passing, plus the agent-reference checks.

### Critical Issues
- None.

### Findings, ranked

1. **Low–Medium (accessibility, phone-only screen): the exit link is too small to tap easily.** `app/components/arrangement/StudioNarrowScreen.tsx:94`
   - The `← CZABA` link has `px-1 text-sm` and no vertical padding, so it is about 20px tall. That is under the WCAG 2.2 minimum target size of 24×24px (2.5.8), on a screen that only phones see.
   - The `Send link` button at `:130` is about 36px tall: it passes the minimum but is under 44px.
   - **Fix:** add `min-h-11 px-2 py-2` to the link (it is already `inline-flex items-center`) and `min-h-11` to the button. These are Tailwind classes only, no custom CSS.

2. **Low (React rules): a ref is changed during render.** `app/routes/studio-lab.tsx:53-55`
   - `wasWideRef.current = true` runs inside render. It only ever goes from false to true, and `useSyncExternalStore` renders synchronously, so it is safe today. React's rules still forbid it: a render that React throws away could set the "was wide" latch even though the wide screen never appeared.
   - **Fix:** use a state latch instead: `const [wasWide, setWasWide] = useState(false); if (isHydrated && isWide && !wasWide) setWasWide(true);`. This is React's supported pattern for state derived during render, and the behaviour is the same.

3. **Low (fragile meaning): the stop component uses a toggle to stop playback.** `app/routes/studio-lab.tsx:31-35`
   - `StopPlaybackOnNarrow` checks the React `isPlaying` state, then calls `togglePlayback()`. But `togglePlayback` decides what to do from `isPlayingRef` (`ArrangementContext.tsx:1433-1443`).
   - This is safe today because `stopPlayback` sets the ref and the state together (`:1112-1113`) and `startPlaybackAt` does the same (`:1412-1413`).
   - If a later change ever lets the state and the ref disagree, this effect would *start* playback behind the narrow screen.
   - **Fix (in this file):** none needed now; keep it.
   - **Real fix:** an explicit `stopPlayback` exposed by the context. `ArrangementContext.tsx` is frozen, so that goes to the planner (see the Architecture note).

4. **Low (behaviour change for the user): workspace view settings reset after narrowing and widening again.**
   - In the narrowed state `StudioWorkspace` is unmounted (`studio-lab.tsx:79`). Its local view settings (folded tracks, track heights, zoom/scroll, library panel width, video dock position) are lost.
   - Clips, mix and Undo history are kept, as the doc promises, and NG5 checks this.
   - **Fix:** no code change in this round. Add one sentence to the TODO section of implementation doc 218 so the "your work is not lost" promise isn't read as "nothing changes".

5. **Low (no test): narrowing in the middle of a drag.**
   - When the workspace unmounts, each component's own cleanup runs (`ArrangementLane.tsx:366-370`, `StudioWorkspace.tsx:2019`). The provider also listens for pointerup and pointercancel on the window and aborts the drag (`ArrangementContext.tsx:1836-1854`), so the gesture counter should go back to 0.
   - No test covers this. In a real browser it can happen when an iPad is rotated or window snapping is used during a drag.
   - **Fix:** add NG10: start a clip drag, call `setWide(false)`, fire `pointerup`, call `setWide(true)`, then check `isPointerGestureActive()` is false and an edit is not refused. If a full UI test is too heavy, a Playwright smoke check is enough.

6. **Low (test hygiene): a test timeout was raised.** `library-row-strings-ui.test.tsx:180`
   - The `{ timeout: 15_000 }` increase hides a slow test rather than explaining it. No cause is recorded.
   - **Fix:** note in doc 218 why LRS4 slowed down (probably shared jsdom load), or file a separate perf task.

7. **Info: extra audio request on desktop.** `StudioNarrowScreen.tsx:117-124`
   - The hidden copy of the narrow screen's `<audio preload="metadata">` makes one extra request on desktop. This is already documented and has an owner (B), so it's acceptable.

### Checks that passed
- **Event order in a real browser:** the width is read through `useSyncExternalStore` with `matchMedia`, so updates are synchronous and render without tearing.
  - The workspace's window `keydown`/`keyup` listeners go away when it unmounts, so Space and Delete can't reach the transport while narrow (NG6).
  - Children's effects run before the route's focus effect, so the route's focus move wins.
- **Listener and timer leaks:** the `matchMedia` and resize listeners are removed. The hydration hook subscribes to nothing. Stopping playback clears the rAF and the audio pump interval (`:1114-1121`).
- **Hydration:**
  - The server snapshot is `true` (wide), and the latch can't switch on during the hydration pass (`useStudioHydrated`).
  - The `max-[900px]:hidden` and `min-[900px]:hidden` classes cover exactly opposite ranges, so phones don't see the toolbar flash.
  - Only one theme marker is visible at a time, which `body:has([data-studio-theme])` relies on.
- **Accessibility:**
  - The heading is focused only after a wide-to-narrow change, not on first load.
  - Focus goes back to `arrangement-exit` only if it was in the narrow screen or on `body`.
  - The status uses `<output aria-live="polite">`, the audio player is labelled by its title, and the fallback "Studio link" field has a label.
  - A global `:focus-visible` style exists (`app.css:386`).
- **Tailwind and tokens:** `bg-background`, `text-foreground`, `text-muted`, `border-outline` and `bg-surface` all exist in `@theme` and in the Obsidian scope (`app.css:48-71`, `:3905-3916`). There are no hardcoded colours or custom CSS.
- **TypeScript strict:** no `any`, no `@ts-ignore`, no `as`. `isShareAbortError` narrows `unknown` properly. Every statement ends with a semicolon.
- **Security:** no `dangerouslySetInnerHTML`. The link that gets shared is `window.location.href`, and React escapes it in the read-only field. `/middle-east.mp3` is a public file in `public/`, not purchased content.
- **Render cost:** `StopPlaybackOnNarrow` returns `null`. The route re-renders only when the width or hydration state changes.

### Good Practices Found
- The gate sits above `ArrangementProvider`, so clips, mix and Undo history survive narrowing. Unmounting only `StudioWorkspace` removes its keyboard listeners without touching frozen files.
- Using separate `key`s for the hidden and the narrowed copies of the narrow screen correctly forces a remount, so the heading gets focus.
- Doc 218 is complete. It lists the rejected options and the known limitation (B-R291-NARROW-PREFETCH).

### Architecture note
- **Signal 4 (new state/effects added to an existing owner):** `app/routes/studio-lab.tsx:47-93`. The route component now holds the width latch, a focus effect and the playback-stopping child.
  - **Keep it**, because all of it is one lifecycle (narrow ↔ wide) and the route is the only place above the provider. Moving it into a hook would mean passing refs between the route and a new hook for no real gain. Cost: low.
- **Signal 2 (ownership/coupling):** `studio-lab.tsx:26-35`. The route stops playback by calling a toggle, because the frozen context has no stop action.
  - **Proposal for the planner (one bounded task):** add `stopPlayback: () => void` to `ArrangementContextValue`, wired to the existing `stopPlayback`, and switch `StopPlaybackOnNarrow` to use it.
  - **Acceptance:** NG5b and NG5c still pass, and a new test shows that calling `stopPlayback()` while stopped does not start playback.
  - **Constraint:** the existing `useArrangement()` fields stay as they are (the change only adds one).
  - This is a proposal, not a fix for this round.

### Alternative Approach (critical logic: Studio audio and state lifecycle)
- **Current:** the provider stays mounted at the route level, only the workspace unmounts when narrow, and a separate child stops playback and the library preview.
- **Alternative A:** keep the workspace mounted but hidden, and add a keyboard guard inside `StudioWorkspace`. It would keep the view settings from finding 4, but it changes a frozen file and leaves hidden key handlers attached. Rejected.
- **Alternative B:** stop playback through a context-level "suspend" flag (`setStudioSuspended(true)`) owned by the provider. That makes the stop atomic and removes the toggle risk. It's cleaner, but it changes the frozen context.
- **Verdict:** the current approach is the best option within the frozen scope. B is where it should go next, via the planner proposal above.

### Score: 8/10