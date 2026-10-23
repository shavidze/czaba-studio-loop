COMMIT: BLOCK (Medium regression: holding ArrowLeft/ArrowRight against a boundary now announces the same refusal again on every key auto-repeat and re-renders the whole provider each time. Gate 104 blocked the pointer version of this same problem, and the round-105 fix only covers pointer gestures.)

## Code Review: round 105 — GATE96-S2 status repeat announcement (`status-announcement.ts`, `ArrangementContext.tsx`, `StudioWorkspace.tsx`)

### Critical Issues
1. **Holding an arrow key against a boundary repeats the refusal on every auto-repeat (Medium: a11y, render cost, regression in an existing flow).**
   - **Where:** `StudioWorkspace.tsx:1933-1960`. This is the only branch in `handleKeyDown` without an `event.repeat` guard (about 17 other branches have one). That is on purpose, because a held arrow should keep nudging.
   - **What happens:** on every repeat that hits the boundary, a string goes to `setStatus`. One source is `:1955` `NUDGE_AT_TIME_START_MESSAGE` (snap on). The others come through `nudgeSelectedClip` → `ArrangementContext.tsx:1680` (`GROUP_MOVE_BLOCKED_MESSAGE`) and `:1698` ("…მეზობელი კლიპი ან დროის დასაწყისი.").
   - **Why it's new:** a key press is not a pointer gesture, so `gestureCountRef === 0` and `reduceArrangementStatus` (`status-announcement.ts:17-21`) adds 1 to `sequence` every time. The result is a new `<span>` at the OS auto-repeat rate (about 30/s) plus a full provider commit, and every `useArrangement()` consumer re-renders because `statusSequence` is in the value deps (`ArrangementContext.tsx:3245`).
   - **Before this change (`3b6178b`):** `useState` skipped the identical update, so there was no render and the message was announced once.
   - **Impact:** keyboard nudging is the main input path for a screen-reader user. This is the keyboard version of the 81-span blocked drag, and it breaks the doc's own rule (`092…md:67`): "one gesture, one message".
   - **Not covered by C PASS:** the round-105 browser checks (HD-BLOCKED-HOLD, HD-FADE-CLAMP, HD-READOUT-CHANGING) are all pointer-based. No check holds an arrow key at a boundary.
   - **Fix:** gate on `event.repeat`, not on whether the text is the same. Merging identical texts would break GATE96-S2 again for deliberate repeated presses.
     - `StudioWorkspace.tsx:1954-1956` → `if (target === null) { if (!event.repeat) { current.setStatus(NUDGE_AT_TIME_START_MESSAGE); } return; }`
     - `:1944` / `:1958`: let `nudgeSelectedClip` tell the caller it refused, so the caller decides whether to announce. Either add an optional second argument (`nudgeSelectedClip(delta, { announceRefusal: !event.repeat })`) or have it return `boolean` and move the refusal text to the caller. Both keep the `useArrangement()` shape compatible.
     - **Test:** select a clip at time 0, then send `fireEvent.keyDown(document.body, { key: 'ArrowLeft', repeat: true })` three times after one non-repeat press. The span identity and `statusSequence` must stay the same after the first press. Cover both snap on (`:1955`) and snap off (`:1698`).
   - **How far I checked:** the other keyboard paths I looked at don't have this problem. Digit1/2 (`:1903`) and Digit3 (`:1911`) are guarded. The `setStatus` calls in `ArrangementLane`, `ArrangementMaster` and `ArrangementClipEnvelope` are drop, refusal or commit paths, not repeating key readouts. I only checked the obvious places, so this is not a full sweep of every key path in the module.

### Suggestions
2. **Doc drift (Low)** at `docs/implementation/2026/quarter-IV/092-studio-status-repeat-announcement.md:54-55`. "შეცვლილი ფაილები" still lists SA1–SA5 / SU1–SU4, but round 105 added SA6–SA7 and SU5–SU6. Update the list, and add the keyboard-repeat case to "ჩაწერილი სემანტიკა" once item 1 is fixed.
3. **Inline reducer reads a mutable ref (`ArrangementContext.tsx:544-549`). Acceptable, but be aware.** The flag is read when React runs the update, not when it is dispatched. The doc's semantics item 1 records this honestly: at most one extra announcement as a gesture ends. Under StrictMode the reducer runs twice, but both runs see the same ref value, so the result is deterministic. No change needed. If the reducer logic grows, pass the flag in through the action instead (see Alternative Approach).
4. **Accessibility details (no action):** the `<output>` element stays the same node (good). It has no `aria-atomic`, so assistive tech announces only the added span. That's correct, because there is only ever one child. Moving `key` from a text node to a `<span>` doesn't affect layout: the parent has the `block` class and the span is inline, with the same text, so no layout shift.

### Good Practices Found
- The core logic is a pure reducer in `lib/` with direct tests (SA1–SA7), and the call sites are untouched: `setStatus` is still the `useReducer` dispatch and stays stable, so no new lint warnings.
- The updater branch returns the same object when nothing changed, so the gesture-end restore stays quiet (SU4).
- The `gestureCountRef` move is justified: mutation m9 shows the TDZ crash in the old position, and hook order is unchanged.
- Tests use `MutationObserver` to check that the live region node and its children stay the same, which is the right signal for live regions. The fail-before results and mutations m1–m9 are documented.
- TS strict: no `any`, no assertions, no `@ts-ignore`, semicolons present. Tailwind/tokens untouched, no new CSS.
- No new listeners or timers, so nothing new can leak.
- **Auth/purchase/download: not touched.**

### Architecture note
- **Signal 4 (new state/lifecycle in an existing owner):** `ArrangementContext.tsx:543-551`. Sequencing status announcements is a new concern inside the provider, and the inline reducer reading `gestureCountRef` is the second place (after `beginPointerGesture`, `:1488-1506`) that ties status to gesture state.
  - **Keep for now:** it's one lifecycle with no prop plumbing, the pure core is already in `lib/`, and extracting it would move refs used for audio timing and gestures (an invariant).
  - **Proposal for the planner (one bounded task, not approved scope):** let each `setStatus` call say whether its message should be announced again (for example a separate `announceStatus` vs `setStatus` intent, or a `{ text, repeat }` action), so the reducer doesn't have to infer it from refs. Acceptance: one rule covers the pointer drag (A-R104-REPEAT-DRAG), the held arrow key (item 1), and deliberate double presses (GATE96-S2); `useArrangement()` stays backward-compatible; tests SA, SU and render-budget stay green.
- This reviewed the diff only, not the whole module.

### Alternative Approach (Studio status / a11y pipeline)
- **Current:** decide inside the provider. A same-text string is suppressed only while `gestureCountRef > 0`; everything else adds 1 to `sequence`.
- **Alternative A:** decide at the call site. Callers whose input repeats (pointermove, key auto-repeat) pass `repeat: true` or skip the dispatch, and the reducer stays fully pure with no ref reads. Cost: more call sites need changes, including the frozen `ArrangementClip.tsx`.
- **Alternative B:** coalesce identical text within a time window. Already rejected in the doc as an invented timing contract, and I agree.
- **Verdict:** the current approach is fine for pointer input and touches the fewest files. But it can't cover input that repeats without claiming a gesture, which is item 1. The smallest fix this round is to add `event.repeat` gating at the nudge call site. Alternative A belongs in the planner proposal above, not in this round.

### Score: 6/10
The mechanism, the tests and the documentation are solid. The score is lowered for one unblocked regression in exactly the class gate 104 already blocked for.