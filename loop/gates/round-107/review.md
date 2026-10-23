COMMIT: OK (no blocking issues in this diff. Auth, purchase and download code are untouched. There are no new listeners, timers, `any`, type assertions, suppression directives or custom CSS. The change is limited to the 6 paths in `paths.txt`, and `untracked.txt` is empty.)

## Code Review: round 107 (StudioWorkspace, ArrangementContext, ArrangementMarkerRow, ArrangementDetailPanel, status-announcement-ui test, doc 092)

I read the SECURITY_AUDIT, ERROR_TAXONOMY and architecture-checkpoint references. The security checklist doesn't apply: this diff has no token, auth, XSS or API surface. The error-code ranges don't apply either, because this is client-side UI status text with no backend errors. This is a review of the diff only, not of the whole modules.

### Critical Issues
- None.

### Suggestions (most important first)
1. **Low (pre-existing, not a regression): pressing Enter on a marker flag still repeats.** `ArrangementMarkerRow.tsx:623-668` (`handleFlagKeyDown`) has no handling for a held Enter. The flag `<button>` at :760 runs `jumpToMarker` on every auto-repeat click in Chromium. This is the same class of bug as R2, but the flags aren't in the doc 092 TODO list for B (doc l.625).
   - **Fix:** next round, add `if (event.key === 'Enter' && event.repeat) { event.preventDefault(); return; }` inside `handleFlagKeyDown`, plus one HE test. Add it to the B list in doc 092 now.
2. **Low: Snap-on and Snap-off now block a held key in two different ways.**
   - Snap on (`StudioWorkspace.tsx:1963`) compares against `current.status`, the old approach.
   - Snap off (`ArrangementContext.tsx:1708`) uses the updater form.
   - Both produce the same text and NZ4 covers it, so behaviour matches. But a held Snap-on ← with a different status in between behaves slightly differently from Snap-off.
   - **Fix (later):** make the Snap-on branch use `setStatus(event.repeat ? () => NUDGE_AT_TIME_START_MESSAGE : NUDGE_AT_TIME_START_MESSAGE)`. Don't do it this round.
3. **Nit: `ArrangementContext.tsx:1707`: `target === clip.start` with a positive delta would show the time-start text.** No current caller can reach this; doc 092 already records it as F3. A defensive `delta < 0 &&` in the condition would make the message always true. Keeping it as is is acceptable.
4. **Nit: the HE tests check `defaultPrevented`, not whether a click fires.** jsdom doesn't synthesize a click from Enter. The "no click in Chromium" claim therefore depends on browser checks: C round 107's HE-MARKER-*, HE-CLIPGAIN-RESET and HE-DETAIL-APPLY. C reported PASS, so this is acceptable.

### Checked against what tests can't catch
- **Real-browser event order:** after the first Enter on `+`, the editor takes focus, so the first repeat lands on the input. The input guard (:824) catches it, and its `preventDefault` + `stopPropagation` keep the window Enter handler from running `addSourceToActiveTrack`. The window handler (`StudioWorkspace.tsx:1972-1973`) skips `HTMLButtonElement` targets, so the button guards don't interact with it.
- **Ctrl+C:** the `getSelection()` early return still runs before `preventDefault` (:1804-1807), so copying selected page text still works (HK6).
- **Undo:** Ctrl+Z/Y still repeat on purpose (HK5).
- **Nudge:** the nudge action itself has no repeat guard, so a held arrow still moves the clip, which is correct (NZ3, SK7).
- **Leaks and render cost:** no listeners or timers were added. The inline `onKeyDown` closures cost almost nothing. With a held key, the updater-form `setStatus` bails out instead of re-rendering, as covered by D-29z71.
- **Accessibility:** a fresh Enter, Space and Escape are unchanged. The time-0 nudge used to fail silently and now announces why.
- **Range side effect:** a refused nudge at time 0 now keeps the selected range, the same as a refusal next to a neighbouring clip. It is documented (F2), but no test pins it down.
- **Verify:** `verify.log` passes. `status-announcement-ui` ran 32 tests, all green.

### Good Practices Found
- `NUDGE_AT_TIME_START_MESSAGE` now has one owner: it is exported from the context, and the local copy in StudioWorkspace was deleted, so Snap on and Snap off can't drift apart.
- The repeat guards wrap only the action; `preventDefault` still runs on every repeat, so the browser doesn't act on those keys either.
- Mutations h1–h13 each turn the intended test red, and the fail-before run matches B's expectation.
- Strict TS, semicolons and Tailwind tokens are followed.

### Architecture note
- **Signal 3 (the same costly change repeated across rounds):** the inline `if (event.key === 'Enter' && event.repeat) event.preventDefault();` now appears 9 times in 5 files:
  - `ArrangementMarkerRow.tsx:686,702,718`
  - `ArrangementDetailPanel.tsx:520,567`
  - `ArrangementTransport.tsx:250`
  - `ArrangementLibraryPreview.tsx:294,313`
  - `ArrangementExportDialog.tsx:554`

  Doc 092's TODO already lists more than 15 more toolbar buttons (Loop, Play, Split, Snap, Env, Follow, Fit, Zoom, Metronome, Mute/Solo, folds…).

  **Proposal for planner B (one bounded task):** create one exported handler, `preventRepeatedEnterActivation(event)`, in `app/lib/arrangement/` and replace the copies, then apply it to the remaining toolbar buttons in one pass.
  - **Invariants:** gesture lifecycle, Undo/Redo and the `useArrangement()` shape stay unchanged. No `stopPropagation`; Space keeps working.
  - **Tests:** extend the HE pattern to each button, plus one Chromium probe checking that the click count is 1 for 1 keydown + 5 repeats.
  - **Value:** medium, since it removes a whole bug class. **Risk:** low.

  This is a proposal only, not a finding for this round.

### Alternative Approach (Studio keyboard handling is critical logic)
- **Current:** a guard on each button's `onKeyDown` with `preventDefault`, plus `!event.repeat` checks inside the window shortcut handler.
- **Alternative A:** a capture-phase listener on `document` that calls `preventDefault` for every repeated Enter whose target is a `button`.
  - Upside: one place, and it covers every toolbar button at once.
  - Downside: it's implicit, it would also hit buttons in modals and the store outside Studio unless scoped, and it's harder to discover by grep.
- **Alternative B:** the shared helper from the Architecture note.
- **Verdict:** keep the current approach for this round, since it is explicit, local and already tested. When the toolbar backlog comes up, prefer Alternative B to Alternative A: scoping stays visible at each call site, with no global listener lifecycle to manage.

### Score: 8.5/10