COMMIT: OK

Round 119 is safe to commit. The diff doesn't touch auth, purchase or download code, adds no CSS or colour changes, and adds no `any`, suppression comments or type assertions. `verify.log` shows 155 test files and 2389 tests passing, and both builds succeeded. I read the diff, the new test file, doc 101 and the hook. I didn't run anything in a browser and didn't review whole modules.

## Code Review: Group Volume dB + Shift fine (ArrangementGroupHeader / Lane / Master, fader.ts)

### Critical Issues
- None.

### Suggestions (ranked)
1. **Low: the gesture-start ref is never cleared.** `ArrangementGroupHeader.tsx:83` and `:125-131` copy the same gap the lane already has (gate-117 S3). The stored start value stays set after the gesture ends. This is harmless today: every `beginGesture` overwrites it, and `onChange` (`:313-315`) never reads it.
   - **Risk:** if someone later makes `onChange` read the ref, a keyboard step could jump back to an old start value.
   - **Fix:** clear it when the gesture ends. The hook has no end callback, so do it in the existing `onPointerUp` and `onLostPointerCapture` handlers (`:321-322`): set the ref to `null`, then call `commitGroupVolume`. Do the same in the lane. Keep it in the deferred Low list.
2. **Nit: duplicate constant.** `ArrangementDetailPanel.tsx:59` keeps its own `DETAIL_CLIP_GAIN_FINE_DIVISOR = 10`, separate from `FADER_SHIFT_FINE_DIVISOR` (`fader.ts:12`). If someone tunes one, the faders drift apart. **Fix:** import the shared constant. This is already logged as GATE118-NIT-FINE-CONST.
3. **Low, accessibility/discoverability: nothing tells users Shift exists.** Shift fine works only with a pointer, and the `title` (`ArrangementGroupHeader.tsx:312`, and the lane and Master equivalents) doesn't mention it. Keyboard users still have 0.1 dB arrow steps, so there's no functional gap. **Fix (only if design agrees):** add a hint to the title, e.g. `Volume −15.0 dB · Shift: ზუსტი`. Changing the title text would mean updating the current title assertions in the tests.
4. **Info: older saved group volumes.** Arrangements saved with the old percent fader (e.g. 0.74 → −2.6 dB) display correctly. The first keyboard step snaps them onto the 0.1 dB grid, and a pointer press without movement preserves them exactly (GV4). Acceptable, no action.

### Real-browser and lifecycle checks (things tests can't fully catch)
- **Shift pressed or released mid-drag:** no pointermove fires on a modifier change alone. The next move re-anchors at `lastX`/`previewedValue` (`useRelativeFaderDrag.ts:81-85`), so the value doesn't jump.
- **Shift key-up during a drag:** this fires `onKeyUp` on the focused fader. It doesn't commit early, because the handler checks `isPointerGestureActive()` first (`:323-327`).
- **Listeners:** no new listeners or timers. Window and blur cleanup stays in the existing hook, and the unmount cleanup (`:40`) is unchanged.
- **Shift-click range selection:** it lives on the name buttons (`ArrangementGroupHeader.tsx:252`, `ArrangementLane.tsx:691`), not on the faders, so it doesn't conflict with Shift-drag.
- **Render cost:** two extra pure dB conversions per render (`formatTrackVolumeDb`, `trackVolumeSliderDb`). Negligible.

### Good Practices Found
- The exact start value is captured when a gesture begins. A press without movement, or a drag back to the start, keeps an off-grid value (e.g. 0.72) and writes no Undo entry (GV4, mutation m2).
- Stored volume stays linear, so the context, model, schedule and export are untouched.
- The mutation table (m1–m5) shows each `fineDivisor` wiring is actually tested. The change to CF11's expectation (Master's 0.5 dB step rounds −1.2 to −1) is explained in doc 101 and was confirmed by B (D-29z84).
- Pan deliberately stays without Shift fine, and doc 101 records why (signal PAN-SHIFT-FINE).

### Architecture note
- **Signal 3 (one region repeatedly changed at high cost) / duplicated mapping:** the stored ↔ slider-dB mapping and exact-return logic now exist twice, in `ArrangementGroupHeader.tsx:102-131` and `ArrangementLane.tsx:393-419`. Both carry the same uncleared ref.
- **Keep for now:** it's two copies, the tests cover them, and moving the logic into the hook would change the gesture lifecycle mid-feature.
- **Proposal for the planner (needs the checkpoint, addendum ac):** one bounded task. Add optional `toSlider`/`fromSlider` options to `useRelativeFaderDrag`, plus the exact-start capture and a reset when the gesture ends. Use it in the Lane and GroupHeader.
  - **Acceptance:** GV1–GV9, TV11, CF11 and UM3–UM9 pass unchanged, and the hook's public shape stays as it is.
  - **Value:** medium.

### Alternative Approach
- **Current:** the hook works in slider-dB. Each component converts dB to linear and keeps its own exact-start ref.
- **Alternative:** the hook takes a value-mapping pair and handles the exact return itself.
- **Verdict:** the current approach is the right call for this round. Behaviour is identical and the scope stays frozen. The alternative only pays off once a third Volume-style fader appears, so leave it for the planner.

### Score: 9/10