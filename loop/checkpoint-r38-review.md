## Code Review: D-29z3 fader click, relative drag and double-click (round 38, SRW-13 4b-1)

**How this was checked:** I only had Read and Grep. I did **not** run `diff -u`, vitest, tsc or Biome. I compared the snapshots by reading them side by side, and for `fader-guards` I compared line counts and grepped the changed lines. Treat this review as a code reading, not gate evidence. The G38 gates are still A's and C's to run.

### Critical Issues
None. I found no High findings, and only one Medium, which still has to be confirmed on a real touch device.

**Medium (unverified, check on a device in R38-T): touch drags may bring the native jump back.**
- Where: `ArrangementLane.tsx:636`, `:686` and `ArrangementMaster.tsx:185` (the `touch-none` class), together with `useRelativeFaderDrag.ts:28`.
- Why: `preventDefault()` on `pointerdown` stops the compatibility *mouse* events. It does not stop *touch* events.
- What I recall, but have not verified in this session: Chromium's range slider (`SliderContainerElement::HandleTouchEvent`) slides natively on `touchstart`/`touchmove` when `touch-action` allows it, and `touch-action: none` does allow it.
- If that is right, a touch press jumps the value through native `input`, which runs `onChange` → `previewTrackVolume` with an absolute value. That would compete with the hook's relative preview during the drag.
- jsdom and the synthetic C runs cannot see this.
- Fix if a device confirms it: add a native, non-passive `touchstart` listener on the three faders that calls `preventDefault()`. That needs a contract amendment, so it is the Tech Lead's call.

### Suggestions
1. **Low: `useRelativeFaderDrag.ts:19` writes a ref during render** (`optionsRef.current = options`).
   - It works today because the write is idempotent and the handlers run after commit, but it breaks React's render-purity rule.
   - Fix: `useLayoutEffect(() => { optionsRef.current = options; });`
2. **Low: the hook does not stop on a window blur** (`useRelativeFaderDrag.ts:72-84`).
   - `claimPointerGesture` cancels the gesture on **window** `blur` (`ArrangementContext.tsx:1362,1372`): it reverts the preview, clears the gesture and sets the count to 0.
   - The hook stops only on the fader's own `blur`, `pointerup` or `pointercancel`. So it relies on the browser sending an element `blur` when the window loses focus.
   - If that event is missing, the next `pointermove` is exactly the F9b hazard: `previewTrackVolume`/`previewMasterGain` with no gesture creates a pending preview.
   - Fix: inside the hook's `pointerdown` handler (where the other listeners are added), add `window.addEventListener('blur', stopDrag)`, and remove it in `stopDrag`.
   - Optional extra: a one-way guard in `handleMove`: `if (!optionsRef.current.isPointerGestureActive() || move.buttons === 0) { stopDrag(); return; }`. This only ever stops the drag, so it does not break the contract's rule against deciding by polling the flag.
3. **Nit: a vertical move from an off-grid value changes the value** (`fader.ts:28-31`).
   - When `deltaPx === 0`, the result is `snap(startValue)`. If the stored value is not on the step grid, a purely vertical move previews a change, which breaks "vertical movement changes nothing".
   - Current demo values sit on the grid, so this is latent.
   - Fix: `if (deltaPx === 0) return startValue;`
4. **Nit, test quality (C's §4.7 mutation table):**
   - (h) "no snap": P1 (`1 − 0.25`) and P3 (`−24·66/132`) are exact without snapping, so they **pass under (h)**. Only P5's last assert (`Δ −0.4 → 1`) and F2's float noise (`0.35000000000000003`) catch it. An off-grid P5 case would harden this, e.g. `Δ −24.6` on Volume → `0.75`.
   - No test sends a `pointermove` from a **foreign** pointerId during a drag. Removing the `move.pointerId !== pointerId` filter at `:49` survives every test.
   - No test presses with a non-left button. Removing the `button !== 0` check at `:25` survives.
   - No test unmounts during a drag, so a listener leak would go unnoticed.
   - No test separates the `focus()`→`begin` order from the reverse. R1 and the amended l.1597 pass either way, because `begin*Gesture` flushes pending values and R1's field blur comes from the root capture.
   - There is no unit test for DR-Y (pure vertical move).
   - The test file name breaks primitive rule 7 (`fader-click` vs `fader.ts`/`useRelativeFaderDrag.ts`), but the contract dictates the name, so I am not counting it.
5. **Nit: the expected test count.** `fader-click.test.tsx` has **22** `it`s (5 pure + 17 component), so the full vitest should be **1286**.
6. **Nit, 4b-2 material (the context is frozen):** `previewTrackVolume` (`ArrangementContext.tsx:2066-2068`) has no identity short-circuit, unlike `previewMasterGain` (`:2312`). A double-click at the default still does `updateHistory` + `syncPlayback` before `commitHistory` drops the equal snapshot. It writes 0 entries (D4 covers that) but costs one wasted render.
7. **Nit: `focus()` could also take `{ preventScroll: true }`.** The fader is under the pointer, so this is defensive only.

### Good Practices Found
- **Hook flow** matches §2.2:
  - `preventDefault` for button 0 runs before any branch (`:25-28`);
  - the refusal path adds no listeners and does not move focus (`:33-36`);
  - `focus()` runs before `begin`, and listeners are added only after `begin` returns true;
  - previews are deduplicated against `previewedValue`;
  - the unmount cleanup and the `stopDragRef` identity guard are in place.
- **Event order is safe.** The context's listeners are **capture** on `window`; the hook's are **bubble**. On `pointerup`/`pointercancel` the context commits or reverts first, then the hook only removes its listeners. On blur, the hook's native `blur` runs before React's `focusout` (`onBlur` → the context cancel). Neither depends on the other.
- **Root capture interplay:** `releaseTypingFocusBeforeRangePointerDown` (`StudioWorkspace.tsx:911`) runs before the hook and skips the release while a gesture is active, so R1 and MN-CR36 hold.
- **Byte-identical blocks:**
  - `suppressPanPointerAfterBlur` (262-279 vs snapshot 255-272);
  - `handlePanChange` (345-357 / 304-316);
  - `handlePanPointerEnd` (359-366 / 318-325);
  - `handlePanBlur` (368-377 / 327-336);
  - the Pan readout button (639-653 / 597-611).
- **`handlePanPointerDown`** was split into `beginPanPointerDrag` (returns a boolean) plus the hook, which §4.7 allows. The volume `step={0.01}` became `TRACK_VOLUME_STEP`, which is inside the allowed input change.
- **`fader-guards.test.tsx`:** both files have 1710 lines, and only l.840, l.1597 and l.1602 differ, matching decision 6. C's `diff -u` is still the proof that nothing else changed.
- **Double-click semantics:**
  - At the default: Master returns early because `next === present`. Volume and Pan return to equal snapshots, which `commitHistory` drops, and `applyEdit` sets no status.
  - During another gesture: `refuseEditDuringGesture` sets the blocked status, and `commitTrackVolume`/`commitMasterGain` return because the count is above 0.
- **`relativeFaderValue`:**
  - It guards against non-finite input, width ≤ 0, step ≤ 0 and `max ≤ min`.
  - The snap is anchored at `min`, which matches the native step base.
  - `toPrecision(12)` is one honest normalisation.
  - It produces no `-0`.
- **TypeScript, comments, colours and naming:**
  - There is no `any`, `as` or `@ts-ignore`; the test's `rect: DOMRect` is a typed literal, not an assertion.
  - No new comments (the `biome-ignore` is pre-existing), and the only class added is `touch-none`, so no colours.
  - Hooks are called unconditionally. The Pan hook instance also exists on the video lane, which is zero-cost and required by the rules of hooks.
  - The names `relativeFaderValue`, `useRelativeFaderDrag` and `RelativeFaderDragOptions` meet AGENT_DISCOVERABLE_CODE.
- **Security (SECURITY_AUDIT.md):** not applicable. The change handles only pointer coordinates, renders no user content and has no secrets or network calls. ERROR_TAXONOMY does not apply (no API error codes).
- **Mutations the tests do catch:** (a) via F1, (b) via F1 and l.840/l.1602, (c) via F2/F4/F5, (d) via D1/D2/D3, (e) via F7, (f) via F8/F9b, (g) via T1, and (h) via P5/F2.

### Alternative Approach
- **Current:** `preventDefault` on `pointerdown`, explicit `focus()` → `begin`, a relative value from `window` `pointermove` filtered by `pointerId`, and the stop tied to element blur, `pointerup` and `pointercancel`.
- **Alternative A:** `setPointerCapture` on the input. This gives cleaner end semantics (`lostpointercapture`, so a window blur or a missed `pointerup` can't leave the drag running), but jsdom lacks it (D-29z3 decision 1) and it would need guards.
- **Alternative B:** a custom `role="slider"`. Rejected in (c): it means rewriting the a11y and every selector.
- **Verdict:** the current approach is right for this round. The open gaps are the touch interaction (Medium, check on a device) and the window-blur stop path (Low).

### Score: 8/10

Files reviewed:
- `C:/Apps/czaba-project/store/app/lib/arrangement/fader.ts`
- `C:/Apps/czaba-project/store/app/hooks/useRelativeFaderDrag.ts`
- `C:/Apps/czaba-project/store/app/components/arrangement/ArrangementLane.tsx`
- `C:/Apps/czaba-project/store/app/components/arrangement/ArrangementMaster.tsx`
- `C:/Apps/czaba-project/store/app/lib/arrangement/__tests__/fader-click.test.tsx`
- `C:/Apps/czaba-project/store/app/lib/arrangement/__tests__/fader-guards.test.tsx`
- `C:/Apps/czaba-project/store/app/contexts/ArrangementContext.tsx` (read-only)
