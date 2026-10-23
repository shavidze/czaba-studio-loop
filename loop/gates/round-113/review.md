COMMIT: OK

## Code Review: round 113: fader touch no-jump (`useRelativeFaderDrag` + 3 consumers + FT tests + doc 097)

This reviews the diff only. I did not audit the whole module. I read the full diff, both new files, the current hook and the `ArrangementLane` hook region (160–410), and checked `c-round-113.json` (PASS on line 3) and `verify.log` (151 files / 2341 tests passed, build succeeded). No auth, purchase or download code is touched. The only changes are in `components/arrangement/*`, `hooks/useRelativeFaderDrag.ts`, one test and one doc.

### Critical Issues
- None.

### Findings (ranked)
1. **Low: the doc status is out of date.** `docs/implementation/2026/quarter-IV/097-studio-fader-touch-no-jump.md:4` still says "C-ის შემოწმებას ელოდება", but C has returned PASS. The TODO at line 97 also lists the C rows as still to do.
   **Fix:** change the status to "Round 113 — C PASS (c-round-113.json)". Mark the line 97 TC rows as done and leave R38-T / TOUCH-DOUBLE-TAP-RESET as open.
2. **Low (accepted UX change): double-tap reset is gone on touch.** Preventing `touchstart` also cancels the `click`/`dblclick` that would follow it. Because of that, `onDoubleClick` (`ArrangementLane.tsx` resetTrackVolume, `ArrangementMaster.tsx:184`, `ArrangementGroupHeader.tsx` double-click handler) no longer fires on a touch screen. The doc's R4 note says this on purpose, and the reset buttons and keyboard still work, so it doesn't block.
   **Future fix (not this round):** in `onPointerDown`, detect two `pointerType === 'touch'` presses on the same fader within about 300 ms and call a reset callback passed in through the options.
3. **Info: screen-reader and real-device behaviour isn't proven yet.** In jsdom and CDP touch the order is pointerdown, then touchstart, then preventDefault, and that is correct. VoiceOver and TalkBack adjust sliders through accessibility actions, not through `touchstart`, so I expect no regression. That is reasoning only; nothing tested it. Keep it on the R38-T real-device checklist, with an explicit "swipe up/down adjusts value" check.
4. **Info: the test ties itself to the implementation.** `fader-touch.test.tsx:281` spies on `EventTarget.prototype.addEventListener` globally, and FT3/FT4 count those registrations. That is deliberate: it is the mutation guard for m3/m4/m5. `restoreAllMocks` in `afterEach` cleans the spy up, so nothing leaks between tests.
   **Optional:** a short comment naming the mutation each assertion guards against. The project's no-comments rule would need an exception for that.

### Checks that passed (what tests can't catch)
- **Listener leaks:** none. The `ref` callback is stable (`useCallback`, `[]`). It removes the listener from the previous element before attaching to the new one. React calls `ref(null)` on unmount, on fold, and on StrictMode double-mount, and each case cleans up. The listener function is defined at module level, so `removeEventListener` gets the same reference.
- **Pan merged ref** (`ArrangementLane.tsx:394-401`): its only dependency is the stable `attachPanFaderDrag`, so it doesn't run again on every render. `panSliderRef.current?.focus()` (line 732) still works. The `| null` widening to get a `MutableRefObject` avoids a type assertion, which is correct.
- **Hook order:** the new `useCallback` sits with the other unconditional hooks in `ArrangementLane`, and no early return comes before it.
- **Render cost:** the binding is memoised. Its identity is stable for the life of the component, so no new re-renders or prop churn.
- **Gesture lifecycle and Undo:** `onPointerDown` is unchanged. FT5 shows a press with no movement writes no history entry, and FT6 shows one "Volume" entry plus a working undo. A refused second-finger press is still prevented, so it doesn't jump either.
- **Focus:** cancelling `touchstart` would block the browser's default focus, but `fader.focus()` is called explicitly, so the keyboard path and focus order stay intact.
- **TS strict, Tailwind, semicolons:** no `any`, `@ts-ignore`, assertions or new classes or CSS. Zoom is correctly left alone and is used as the must-not control in FT2.

### Good Practices Found
- One binding (`{ onPointerDown, ref }`), so a future relative fader can't get drag without the touch guard.
- Native non-passive listener, with the reason documented: React attaches `onTouchStart` as a passive listener.
- A must-not test (Zoom), a test where the element changes but the hook stays the same (FT7), and a mutation table in the doc.

### Architecture note
- Signal 4 (new listener lifecycle in an existing owner), `app/hooks/useRelativeFaderDrag.ts:41-45` → **keep**. The touchstart guard belongs to the same fader-gesture lifecycle as `onPointerDown`, the hook's API change is small and fully typed, and splitting it out would bring back the "forgot the touch guard" risk.
- Signal 3 (one region changed repeatedly at high cost), the Pan gesture region in `ArrangementLane.tsx:314-401` (blur suppression, drag cleanup, draft state, and now a merged ref): **proposal for the planner, not for this round.** Move the Pan-specific gesture glue into a `useTrackPanFader(track)` hook that returns `{ binding, panDraft, sliderRef }`. Ownership: `ArrangementLane` + the new hook. Acceptance: `pan-release-recovery`, `fader-click`, `fader-guards`, `fader-focus-order` and `fader-touch` stay green with no changes. Value is medium and the risk is the gesture timing. Only worth doing if Pan is touched again.

### Alternative Approach
- **Current:** a native `touchstart` listener (`passive: false`) on every relative fader, attached through a stable ref callback.
- **Alternative A:** add an `onTouchStart` prop on the input. It doesn't work, because React attaches it as a passive listener and `preventDefault()` is ignored.
- **Alternative B:** one delegated non-passive listener on the Studio root that filters for `[data-relative-fader]`. It uses one listener in place of N, but a global touch listener on the root blocks scroll optimisation for the whole workspace, and it adds a hidden data-attribute contract.
- **Verdict:** the current approach is better. It is scoped to each element, tested, and cannot be forgotten.

### Score: 9/10