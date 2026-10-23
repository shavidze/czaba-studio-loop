COMMIT: OK

## Code Review: round 99, held Enter adds only one clip (ArrangementLibrary / ArrangementLibraryPreview / StudioWorkspace + test + docs 086/087)

I reviewed the code at HEAD 736db33 plus the patch for the six paths in `paths.txt`. The C report (`c-round-99.json`) says `taskStatus: PASS` and covers `HOLD-PLUS`. `verify.log` passed: 144 test files and 2236 tests, plus the build.

### Critical Issues
- None.

### Findings (ranked; all Low, none blocks the commit)
1. **`docs/implementation/2026/quarter-IV/087-studio-held-enter-single-add.md:4`**: the status line still says "Round 99 — C-ის შემოწმებას ელოდება", but C has passed. **Fix:** change it to `C PASS (Round 99)` now, or next round as was done for doc 086 in this diff. It doesn't block.
2. **`ArrangementLibraryPreview.tsx` ▶ მოუსმინე button (around 280–303)**: it has no guard against repeated Enter. A held Enter may start and stop the preview on every repeat. This is already tracked as `B-R98-H1-PREVIEW-TOGGLE-HOLD` in doc 087's TODO and is outside this round's scope. **Fix next round:** add the same inline `onKeyDown` guard (`key === 'Enter' && repeat` → `preventDefault()`) once B has reproduced it in a browser.
3. **`ArrangementLibraryPreview.tsx:307-311`**: the inline arrow function is recreated on every render. The cost is trivial and it follows the existing pattern (`ArrangementTransport.tsx:249`, `ArrangementExportDialog.tsx:542`). No change needed now; see the Architecture note.

### Things tests can't catch, checked
- **Real-browser event order**:
  - **＋ button:** `preventDefault()` on the repeated keydown stops Chromium from turning that keydown into a click. In Firefox, Enter on a button fires a click from `keypress`, and a cancelled keydown suppresses `keypress`, so it should hold there too. That is reasoned from the spec and not tested, which doc 087 says honestly.
  - **First Enter:** the first keydown (not a repeat) isn't cancelled, so the click still happens.
  - **Library row:** `ArrangementLibrary.tsx:242-249` keeps calling `preventDefault` and `stopPropagation` on every Enter, so the browser never synthesises a click. The row's only other add path is `onDoubleClick` (`:89` → `handleOptionAdd :276`), which no key triggers.
- **No double add through the window handler.** `StudioWorkspace.tsx:1962` skips targets that are an `HTMLButtonElement`. So a repeated Enter on ＋ that bubbles up to window does nothing, and the row has already stopped propagation. The `Enter` at `:1752` is the separate "gesture edit blocked" branch: it only sets a status message and never adds a clip, so it doesn't conflict.
- **Listener/timer leaks**: none. The two `!event.repeat` checks sit inside existing handlers, the ＋ guard is a React prop, and no effect, state, timer or listener was added. The cleanup at `:1997-2003` is unchanged.
- **Regressions**: HA7 checks that a held ArrowDown still moves one row per repeat, and HA2/HA4 check that two separate presses add two clips. HA8 checks that one Ctrl+Z after a held Enter removes the one added clip, so Undo/Redo stays atomic.
- **Render cost / accessibility**: no new renders or ARIA changes. Holding Enter on a focused row keeps focus on that row (HA1).
- **Tailwind/tokens, TS strict**: no className changes, no `any`, no assertions, semicolons are present.
- **Auth / purchase / download**: nothing touched. Only `app/components/arrangement/*`, one test and two docs are in scope; nothing in `services/api`, `lib/auth` or the contexts.
- The `useArrangement must be used within an ArrangementProvider` lines at `verify.log:1210-1243` come from other tests and are old noise. The new test file wraps everything in the provider.

### Good Practices Found
- The fix is minimal and the same in all three places: skip only the repeats and leave the first keydown alone. The rejected options (a time window in the context, a pressed flag with a keyup listener) are written down with reasons.
- The test file drives the real `StudioWorkspace` inside `ArrangementProvider`. Its queued rAF fake makes the focus hand-off in HA7 deterministic. Listeners and frames are cleaned up in `afterEach`.
- The fail-before results and mutation table in doc 087 tie each guard to at least one named test that turns red without it.
- Doc 087 openly states the known limits: some environments send auto-repeat as `repeat=false`, and no non-Chromium browser was checked.

### Architecture note
- **Signal 3 (one region changed repeatedly):** the "ignore repeated Enter" rule has been added across rounds 85, 86, 98 and 99 and now lives in five places:
  - The same inline `onKeyDown` guard on three buttons: `ArrangementTransport.tsx:250`, `ArrangementLibraryPreview.tsx:308` and `ArrangementExportDialog.tsx:542`.
  - `!event.repeat` checks in two handlers: `StudioWorkspace.tsx:1967` and `ArrangementLibrary.tsx:245`.
- **Keep for now.** Each copy is 4 lines or fewer, tested for behaviour, and shares no state or lifecycle. Moving the code wouldn't touch audio timing, refs, the gesture lifecycle or Undo/Redo.
- **Proposal for the planner (not a finding):** one bounded task to move the three button guards into a small shared helper in `app/lib/arrangement/`. It should come with one focused unit test, plus the existing HA5/HA6 and Export tests passing with no change in behaviour. Value low, risk low.
- This reviews the diff only; I haven't claimed a full audit of the module.

### Alternative Approach
- **Current:** each input path checks `event.repeat` locally (row, global handler, ＋ button).
- **Alternative:** remove duplicates inside `addSourceToActiveTrack` (a time window or a pressed-key flag).
- **Verdict:** the current approach is better. A time window would also block a fast, deliberate second press. It would also change `ArrangementContext.tsx`, which is frozen for this scope, and add lifecycle. The local guard costs no state, and the only gap left is environments that send auto-repeat as `repeat=false`, which doc 087 already lists as a known limit.

### Score: 9/10