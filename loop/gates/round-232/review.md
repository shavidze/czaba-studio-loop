COMMIT: OK

## Code Review: round-232 — CALM-3 Overview empty state + Ctrl+Alt+O (HEAD e5507ff)

I read the full diff, the 4 new files, the keydown handler in `StudioWorkspace.tsx` (lines 1766–1850), the effects and cleanup in `ArrangementOverview.tsx`, and `library-notice.ts`, which was the template for the new store. Verify passed. The lint warnings near verify.log:99 and verify.log:355 are in older code outside this diff. This review covers the diff only, not the whole module.

**Auth, purchase and download code:** none of it is touched. All 12 paths are under `components/arrangement`, `lib/arrangement` or docs. The only thing stored is the key `czaba-studio-overview-hidden`, which holds `'1'` and nothing sensitive. No XSS, secrets or API code is involved.

### Critical Issues
- None.

### Suggestions (ranked)
1. **Medium, accessibility: focus is lost when the Overview hides while focused** (`StudioWorkspace.tsx:1819-1823`, `:2322-2327`). If the Overview slider has focus when Ctrl+Alt+O is pressed, it unmounts and focus falls back to `document.body`. A keyboard or screen-reader user then loses their place, and the status line only partly makes up for it. The doc calls this deliberate.
   - **Fix (next round):** before `setOverviewHidden(true)`, check whether `document.activeElement` is the `[data-timeline-overview]` root. If it is, move focus to the timeline scroller (`arrangement-timeline-scroller`) with `preventScroll`. This needs no new focus target.
2. **Medium, needs a real-browser check: AltGr guard on Windows** (`StudioWorkspace.tsx:1813`). Windows turns *left* Ctrl+Alt into AltGr on AltGr layouts (Polish, German, …). Chromium may then report `getModifierState('AltGraph') === true` for left Ctrl+Alt as well. If so, the toggle never fires on those layouts, and the doc's claim at line 43 ("left Ctrl+Alt works") is wrong. jsdom can't test this.
   - **Fix:** add a manual check (Windows + Polish layout, left Ctrl+Alt+O) next to TLM-R232-MAC. If it fails, document it, or consider not ignoring AltGraph when `event.key` is not a printable character.
3. **Low: brief flash after load for users who hid the Overview** (`StudioWorkspace.tsx:105-109`). The server snapshot is `false`, so the Overview renders on the server and is swapped for the slot right after hydration. Both are `h-16`, so the layout doesn't shift; it's only visual. This matches the library-notice pattern and is acceptable; C is already measuring it as C-TOGGLE-PERSIST.
4. **Low: the hidden slot repeats the Overview's height** (`StudioWorkspace.tsx:2324` `h-16` vs `ArrangementOverview.tsx:295` `h-16`). If the Overview's height changes, the slot silently drifts and the caption row jumps.
   - **Fix:** have the dock own the height with one wrapper class, `h-16`, that holds either the Overview or nothing.
5. **Low: copy on Mac.** The status strings (`strings.ts:372-373`) say "Ctrl+Alt+O" on Mac too. This matches the sheet convention (`Ctrl+Z` and others), so it's consistent, but Mac users read it literally.
6. **Low: no sync across tabs** (`overview-visibility.ts`). There is no `storage` event subscription, so another tab only picks up the change after reload. This is already in the doc's TODO list.
7. **Nit: the empty Overview is still fully interactive** (`ArrangementOverview.tsx:294-297`): `cursor-ew-resize` plus drag and double-click on a transparent strip with only a baseline. This is intentional and keeps the slider semantics. A future empty-state hint could set a default cursor when `!hasClips`.

### Checks with no issue found
- **Listener and timer leaks:** `subscribeOverviewVisibility` removes its listener from the Set on cleanup. The new key branch adds no listeners. When the Overview unmounts while hidden, it unsubscribes from scroll and position and cancels any drag's rAF and gesture claim (`ArrangementOverview.tsx:113-137`). Hiding during a drag is blocked by `isPointerGestureActive()`.
- **Event order:** the branch runs after the early returns for the shortcut sheet, Export, text fields and floating-video Escape, and before Space and navigation. `preventDefault` is called before the `repeat`/gesture return, so the browser's own shortcut is also suppressed on auto-repeat. Matching on `code` means it works on the Georgian layout.
- **Render cost:** a toggle re-renders `StudioWorkspace` once and does nothing per frame. `hasClips` comes from a prop that already exists, so the memo is unaffected.
- **TypeScript and style:** no `any`, no type assertions, semicolons present. Tailwind tokens only (`bg-outline`, `bg-transparent`, `invisible`). `cn` was already imported.
- **Existing flows:** nothing else depends on the Overview's DOM (only `isOverviewTarget` reads it, by event target), so unmounting it is safe.

### Good Practices Found
- The empty state keeps the frame and playhead in the DOM with `invisible`, so `aria-valuenow` and the arrow keys keep working (OV-E2).
- A storage failure falls back to in-memory state for the session (OV-T5).
- The toggle adds no history entry (OV-T4).
- The SSR test sits in its own file to avoid leaking module state between tests.
- Each guard (AltGr, repeat, gesture, server snapshot) is backed by a named test that fails if the guard is removed.

### Architecture note
- **Signal 3 (one region changed repeatedly)** at `StudioWorkspace.tsx:1766-1850`: the window keydown handler gains another special-case branch this round. It is the same region flagged in `b-round-231-checkpoint-request.md`.
  - **Keep for now:** the branch order relies on the shared early returns and is covered by tests.
  - **Proposal for the planner (not current scope):** one limited task to move the modifier-chord branches (floating-video Escape, Ctrl+Alt+O) into a pure function in `lib/arrangement/shortcuts.ts`, e.g. `studioChordAction(event)`. The handler would only dispatch. Acceptance: existing keyboard tests stay green unchanged; behaviour and branch order stay the same.
- **Signal 2 (light duplication)** in `overview-visibility.ts` vs `library-notice.ts`: two near-identical stores combining localStorage, an in-memory value and listeners.
  - **Keep:** two copies don't justify a one-off abstraction. Revisit if a third one appears.

### Alternative Approach (Ctrl+Alt+O visibility state)
- **Current:** a module-level external store read with `useSyncExternalStore` and persisted to localStorage; the toggle lives in the window keydown handler.
- **Alternative:** a `useState` in `StudioWorkspace` initialised from localStorage in an effect, with the toggle logic inside the component.
- **Verdict:** keep the current approach. It follows a pattern already in the codebase, stays correct with SSR (server shows the Overview), and is easy to test without the component. The alternative would give the same hydration flash plus an extra effect and render.

### Score: 8.5/10