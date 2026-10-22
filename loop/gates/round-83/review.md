COMMIT: OK. Nothing here blocks the commit. The verify log shows 2008/2008 tests passing (119 files) and a clean build. Auth, purchase and download code is untouched; the only export change is the one `clipEnvelopes` option in `renderArrangementWav`.

## Code Review: Round 83 — clip volume envelope (stage 2) + X1 fix

### Critical Issues
- None.

### Suggestions (most important first)

**M1. Envelope points draw on top of the sticky track header when you scroll sideways**
- **Where:** `ArrangementClipEnvelope.tsx:343` (`z-30` points), `ArrangementClip.tsx:789` (an unselected clip root has no z-index, so it doesn't start a new stacking context), `ArrangementLane.tsx:617` (header is `sticky … z-20`), `ArrangementLane.tsx:779` (lane body is `relative` with no z-index).
- **Effect:** the points of unselected clips are layered against the header directly. Their `z-30` beats the header's `z-20`, so in envelope mode a point under the header is visible and catches the click. A click meant for a header control (mute, name) can then select the clip and start a point drag.
- **Not new:** active fade handles (`z-40`) and the trim strips (`z-20`, later in the DOM) already behave this way. Envelope mode makes it worse because every point on every clip is always visible. Doc 073 records this as a signal that wasn't checked in a browser. jsdom can't catch it.
- **Fix:** add `isolate` to the clip root's className at `ArrangementClip.tsx:790`. That contains all of the clip's z-indexes, including fades and trim strips. Selected clips keep `z-10`. Do it as the next round's task.

**M2. Dragging a point during playback restarts audio on every pointermove**
- **Where:** `ArrangementContext.tsx:471` (`scheduleKey`) serializes `clips`, envelopes included. Each `previewArrangement` call from `ArrangementClipEnvelope.tsx:257` therefore triggers a full re-schedule in `syncPlayback` (`:987`). That means new source and gain nodes each time, which can be heard as clicks or stutter.
- **Not new:** fade drags already work the same way.
- **Fix (proposal):** while a point drag is active, either leave `envelope` out of `scheduleKey` and re-schedule once on commit, or throttle re-scheduling to rAF.

**L1. The X1 guard depends on a 500 ms timer, but the OS double-click interval can be longer**
- **Where:** `ArrangementClip.tsx:731-740`, `ArrangementClipEnvelope.tsx:300-309`.
- **Effect:** the guard compares against `CLIP_DRAG_DOUBLE_CLICK_GUARD_MS = 500`. Windows lets users set the double-click interval up to about 900 ms, and macOS allows longer. A `dblclick` arriving between 500 ms and the OS interval after a drag still resets the fade or deletes the point. A also couldn't reproduce the real trigger in Chromium (doc 073:101).
- **Fix:** stop using time. Keep the `moved` flag of the last two gestures on that handle or point, and ignore the `dblclick` if the gesture before the last click was a drag.

**L2. Points are hard to hit and have no keyboard path**
- **Where:** `ArrangementClipEnvelope.tsx:343` — points are 8×8 px (`size-2`) with no role or tabindex.
- **Note:** keyboard access is already in the backlog (SRW18-KEYBOARD-FADES).
- **Fix for hit area:** keep the visual size and enlarge the target, e.g. `before:absolute before:-inset-2 before:content-['']`.

**L3. The `Env` button's accessible name is just "Env"**
- **Where:** `StudioWorkspace.tsx:2286-2303`. A screen reader only gets "Env" plus `aria-pressed`; the full description is only in `title`.
- **Fix:** add `aria-label="Envelope რეჟიმი"`.

**L4. Line and double-click position are a few px off**
- The line and points can be up to 2 px off at the right edge, and the double-click position is 1 px off from the ruler. Both come from the root vs body width difference.
- This is already recorded (doc 073 TODO, review L1). Fix it alongside the fade ramp overlay.

### Good Practices Found
- **Model:** envelope points are stored in source time. Move, trim, split and duplicate keep the envelope intact without touching `model.ts`, and points outside the visible window are kept, not deleted.
- **Drag cleanup:** drag state lives in a separate inner `ClipEnvelopeEditor`. Unmounting it (mode off, or zoom below 24 px) reverts first, then releases the claim.
- **Listeners:** the lost-pointer path reuses `watchUncapturedPointerGesture`, and `release()` removes its window listeners. No timer or listener leaks.
- **Undo/Redo:** add and remove each write one history entry. A move previews from `before` and commits once. A press without movement writes nothing.
- **Audio chain:** `source → fadeGain? → envelopeGain → clipGain`. Live gain changes on `clipGain` don't clobber the ramps, and both disconnect points clean up `envelopeGain`. Clips without points build the old graph.
- **Shortcut:** `A` is checked after the `modifier` return, so Ctrl/⌘+A (select all) still works. `isTypingTarget` is respected, and the toggle is refused during a drag.
- **Keys:** `key={slot}` (index) is the right choice here. Keying by `time` would remount the captured element on every move.
- **TS and styling:** no `any`, no `as`, no suppressions. Tailwind tokens only (`bg-accent`, `border-foreground`, `text-accent`); inline style is used only for dynamic positions.
- **Security:** nothing needed changing. No `innerHTML`; the `data-*` attributes hold only numeric strings.

### Architecture note (proposal only, not a fix for this round)
- **Coupling signal (fragile workaround):** `ArrangementClip.tsx:882` passes `watchLostPointer={watchUncapturedPointerGesture}` as a prop to avoid an import cycle (doc 073 says so). The component already takes 14 props.
  - **Keep:** the envelope component itself. Separate ownership is right here.
  - **Proposal for the planner:** move `watchUncapturedPointerGesture` and the `{ pointerId, release }` type into a pure helper, `~/lib/arrangement/pointer-gesture.ts`, so both components import it directly. Acceptance: the `watchLostPointer` prop is gone, behaviour is unchanged, and EU3, EU6 and the existing fade/trim tests stay green. Value: low–medium; risk: low.
- **Repeated costly change:** the gesture region of `ArrangementClip.tsx` (`endStaleClipGesture`, `finishGesture`, fade handles) changed in both round 82 and round 83, each time with new guards. Keep it for now, since one lifecycle there owns the gesture. If a third round touches it, the planner should schedule a `frontend-architect` checkpoint.
- **State added to an existing owner:** `lastFadeDragRef` in `ArrangementClip.tsx:40`. Keep it: it's one ref in the same gesture lifecycle.

### Alternative Approach (Studio audio pipeline)
- **Current:** a separate `envelopeGain` node with `setValueAtTime` plus `linearRampToValueAtTime` per point, scheduled the same way for live playback and export.
- **Alternative:** `setValueCurveAtTime` with a pre-sampled curve, or putting the ramps directly on `clipGain`.
- **Verdict:** the current approach is better. Linear ramps exactly match the UI's linear-amplitude line and are identical between live playback and the offline render. Curves would bring sampling error, and ramps on `clipGain` would be broken by the live `setTargetAtTime`. The weak spot is not the graph but re-scheduling during a drag (M2).

### Score: 8/10