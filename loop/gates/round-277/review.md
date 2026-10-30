COMMIT: OK

## Code Review: SYS-5 stage 1 (round 277): `ArrangementTransport.tsx` soft-disabled buttons, `strings.ts`, press-scale CSS, 7 test files, doc 206

Nothing blocks the commit. All five findings below are Low.

**Checked:**
- **Auth / purchase / download:** none of that code is touched. The two global CSS edits (`app.css:380`, `utilities.css:73`) only stop the press-scale on `[aria-disabled="true"]`. The only other `aria-disabled` user in the app is `ArrangementLibraryPreview.tsx:244`, which is `role="slider"`, so it isn't affected.
- **Production CSS:** the variants actually make it into `build/client/assets/app-C8-pFxCP.css`. `not-aria-disabled\:hover\:bg-foreground\/8`, `not-aria-disabled\:active\:bg-brand\/88`, `aria-disabled\:\*\:opacity-40` and `aria-disabled\:cursor-not-allowed` are all there.
- **Verify run:** 220/220 test files pass, `tsc --noEmit` is clean, the build passes, and the lint warnings are all pre-existing ones outside the diff.
- **Event order in a real browser:**
  - Every `onClick` checks `isSoftDisabledButton` first, before `armFocusHandoff` and before the action. So the undo/redo atomicity and the "no refusal status" rule both still hold, and SD2b covers the case during a pointer gesture.
  - Enter on a focusable soft-disabled button does nothing: `StudioWorkspace.tsx:2575` skips buttons, and the native click is then guarded.
  - Space goes to the existing window handler (`:2272`) and toggles playback, the same as on any other button.
  - None of the seven buttons already had an `onMouseDown`, so the spread doesn't overwrite one.
  - The grid-menu dismiss-click swallow (`ArrangementGridMenu.tsx:54`) works the same either way.
- **Listener / timer leaks and render cost:** the component gets no new state, effect, listener or timer. The only per-render cost is one small props object per button.
- **TS strict:** no `any`, no type assertions, no suppression comments, and the `'aria-disabled'?: 'true'` typing is narrow.
- **Tailwind:** every change uses tokens and no hardcoded colours. tailwind-merge still drops the `/8` hover when an override like Loop-on or Play is applied, and the tests confirm it.

### Critical Issues
- None.

### Suggestions (ranked)
1. **Low (accessibility): Delete's accessible name contradicts its reason.** `ArrangementTransport.tsx:241`
   - With nothing selected, `aria-label` is still `deleteClipLabel` ("Delete — the selected clip; leaves a gap"), while `title` says "select a clip or make a time selection first".
   - Before, the button couldn't be focused, so nobody heard this. Now a screen reader reads the name, then "dimmed", then a description that says the opposite.
   - Fix: `aria-label={rangeDeleteHint ?? (selectedClipId ? studioEditStrings.deleteClipLabel : studioEditStrings.deleteButton)}`. With nothing selected the name becomes "Delete" and the reason comes from the title. Add one assertion to SD1.
2. **Low (visual): unavailable buttons look different from HEAD.** `ArrangementTransport.tsx:53`
   - HEAD faded the whole button to 40%. Now only the children fade, so the `bg-foreground/5` background stays at full strength.
   - This is on purpose, so the focus ring stays fully visible. Look at it in the real-browser pass, especially the icon-only "Zoom to selection" button, and confirm it still reads as unavailable.
3. **Low (accessibility / UX): a focus-ring flicker is possible.** `ArrangementTransport.tsx:60`
   - Suppose a keyboard user has focus on a soft-disabled button and then mouse-clicks the same button.
   - The capture `pointerdown` in `focus-source.ts:73` switches `data-focus-source` to `pointer`. Focus stays put because `mousedown` is cancelled, so the ring may disappear without focus moving.
   - It only affects looks. Check it in the browser pass; no code change needed now.
4. **Low (docs): round numbers clash.** `206-sys-5-disabled-reasons-stage-1.md:4,9,65`
   - Round 277 is named both as this test fix-up round and as stage 2's round.
   - Fix: change the stage-2 references (lines 9 and 65) to "next round".
5. **Low, already in the doc's TODO, same as HEAD:** `aria-disabled:cursor-not-allowed` has no effect, because the unlayered `button { cursor: pointer }` rule in `app.css` wins. HEAD's `disabled:` form had the same problem, so this isn't a regression.

### Good Practices Found
- `aria-disabled` is left off entirely when the button is available, rather than set to `"false"`. That keeps the CSS selectors and `isSoftDisabledButton` simple.
- Cancelling `mousedown` keeps focus in a marker-name or tempo field when one of these buttons is clicked, so the field no longer commits on blur.
- The focus-handoff check now looks at `aria-disabled`, and the note about mutant M3 shows the FL/SD tests catch a revert.
- The transport-only test constants are split out, so the token lists for Snap, Env, Master and Metronome are untouched and no assertion was deleted.

### Architecture note
- **Signal 3 (one costly region keeps changing):** `ArrangementTransport.tsx:53`. The `toolButtonClass` tokens and their disabled behaviour needed matching edits in three test files' token constants plus a source-grep test (SD7, `self-disabling-focus.test.tsx:654`).
  - **Keep it for now:** the helper is local and has a single owner, and moving it is already planned for stage 2.
  - **Proposal for the planner (one bounded task):** when stage 2 moves `softDisabledButtonProps` / `isSoftDisabledButton` into a shared module, export the soft-disabled token list from the same module. The three UI tests and SD7 would then assert against that export instead of copied literals.
    - **Ownership:** the shared module and those test files.
    - **Done when:** the token lists exist in one place and behaviour is unchanged.
  - This is a proposal only, not something to fix in this round.

### Alternative Approach (critical logic: focus handoff and the disabled path)
- **Current:** `aria-disabled` plus a click guard and a cancelled `mousedown`, applied by a local helper. Native `disabled` is no longer used.
- **Alternative:** keep native `disabled` and put the reason in a visually hidden `aria-describedby` element next to each button, or in a live region.
- **Verdict:** keep the current approach. Native `disabled` takes the button out of the Tab order, so keyboard users still couldn't reach the reason, which is the original problem (C-R229-01). A live region would also be read twice alongside the status line. The cost of the current approach is guarding every handler (SD2/SD2b cover this) and the cursor rule losing to `app.css` (item 5).

### Score: 8.5/10