COMMIT: OK. Nothing blocks the commit, and nothing in the diff touches auth, purchase or download code.

## Code Review: round 81 — group Mute / Solo / Volume + X1 (14 paths)

I reviewed only the diff and the three new files. I did not check whole modules, and I ran nothing. My evidence for checks is C's PASS and `verify.log`, which shows tsc clean, 115/115 test files and the build passing. The lint warnings in that log are old ones in other files.

### Critical Issues
- None.

### Suggestions (most important first)
1. **The 071 doc's status is out of date.** `docs/implementation/2026/quarter-IV/071-…md:4` says it is waiting for C's check, but C has passed (c-round-81.json PASS). **Fix:** change it to `Round 81 — C PASS (browserVerified)` before the commit, the same way doc 070 was updated.
2. **The UM8 test checks source text, not behaviour.** `track-group-mix-ui.test.tsx:639-640` reads the dialog's source and looks for `isTrackAudibleWithGroups(videoTrack, arrangement)` and the absence of `isTrackAudible(`. Any rename or reformat will break it, and the behaviour part of UM8 already covers this. **Fix:** delete the source-text assertion and add a DOM check instead: render the dialog with the video track inside a muted group and check the video-sound line.
3. **`applySchedule` can silently use the old audibility rule.** At `graph.client.ts:115-117`, if a caller leaves out `trackGains`, it falls back to `isTrackAudible`, which ignores groups. Both current callers pass it, but a future caller that forgets gets wrong gains with no error. **Fix:** make `trackGains` required, or compute it inside from `arrangement` via `trackEffectiveGains`. This is low priority; the doc (M3) says the fallback is deliberate.
4. **Render cost.** `ArrangementGroupHeader.tsx:76-87` now reads the whole `useArrangement()` value. Every change to status, selection or `sourceStates` re-renders every group header, and each one runs `trackGroupSoloState`, which rebuilds the group map. This is not a regression: the playback position goes through `useArrangementPositionWriter`, so it does not re-render at 60 fps, the header was never wrapped in `memo`, and `ArrangementLane` works the same way. Similarly, `trackEffectiveGains` (`schedule.ts:55`) rebuilds the group map once per track on every frame of a volume drag. **Fix (only if profiling shows a problem):** build the group map once per call. Low.
5. **Group objects are rebuilt even when nothing changed.** The exclusive branch of `toggleTrackGroupSolo` (`groups.ts:156-163`) recreates every group object, so references change for no reason. Only the copying in `toggleTrackGroupSolo` is waste. Low; it costs performance only.
6. **Tailwind v4 naming.** `bg-gradient-to-r` (`ArrangementGroupHeader.tsx:269`) still works as a legacy name, but v4 calls it `bg-linear-to-r`, and this is the only gradient class in `components/arrangement`. **Fix:** rename to `bg-linear-to-r`. Colours all come from design tokens (`accent`, `brand`, `brand-foreground`, `background`, `outline`); nothing is hardcoded.
7. **Group names get squeezed in deep nesting.** The fixed parts of the header take 144 px of the 224 px width, and each nesting level adds 12 px of indent. The name button (`flex-1 min-w-0`) is about 43 px at depth 3 and below 20 px at depth 5. The doc measured only depths 0–2. **Fix:** give the button a minimum width, or have B decide a maximum nesting depth. Low.
8. **Question for the planner, not a bug: Solo display for a child group.** `trackGroupSoloState` (`groups.ts:170-188`) returns `'off'` for a group whose parent is soloed, even though that group is audible because of the parent. `'mixed'` only looks downward. Doc 071 says nothing about this case. B should decide what the button shows, along with the lane M/S, which shows nothing when the track is silent because of its group.

### Good Practices Found
- **The X1 `blur()` ordering holds in a real browser.** At `StudioWorkspace.tsx:949-954`, the focused row id is read first. `blur()` then fires synchronously, so the fader's `onBlur` → `blur*Volume` → commit runs before `setTrackLaneLayout`. Pointer gestures and `isArrangementPreviewActive()` are still refused up front. Volume does not change which rows exist, so reading `arrangementNow` before the blur is safe. When the focused element is hidden, a group to move focus to is always found, because hidden rows are exactly the descendants of the collapsing group.
- **No listener leaks.** `useRelativeFaderDrag` removes all five listeners in `stopDrag`, and the hook's cleanup calls it on unmount. In the context, the volume gesture removes its listeners through `detach()` on commit, cancel and claim-steal alike.
- **Undo stays atomic.** `applyEdit` calls `flushPendingVolume` first, so pressing M or S during a keyboard preview writes two separate history entries (`Volume`, then `Mute`). Switching between a track and a group commits the previous preview first. Merging track→track previews into one entry is the old behaviour, kept on purpose (doc M5).
- **The audio graph is not rebuilt.** `scheduleKey` did not change. Live playback (`startGraph`, `syncPlayback`) and export (`renderArrangementWav`) all use the same `trackEffectiveGains`.
- **TypeScript strict holds.** There is no `any`, no type assertions and no suppression comments. The new type fields are optional, and default values are not written into the saved object.
- **Accessibility.** The M/S buttons have `aria-label`, and S uses the valid ARIA value `aria-pressed="mixed"`. Volume has `aria-valuetext`. The focus ring follows the existing pattern.
- **The group fader is wired exactly like the lane fader** (`ArrangementLane.tsx:753-762`).
- The 071 doc has every required section, explains why a real summing bus was rejected, and gives the Ableton source for each behaviour.

### Architecture note
- **Signal 4 (new state/lifecycle in an existing owner):** `ArrangementContext.tsx` lines 328-337 and 2185-2400. The context took on a general track-or-group volume gesture lifecycle (`MixVolumeTarget`, `volumeTargetKeyRef`, cross-flush). **Keep it for now:** the gesture lifecycle, `volumeBeforeRef` and the flush points (`applyEdit`, undo/redo, Master) protect Undo atomicity, and they need to stay with one owner. Moving them now would scatter that protection. Doc 071 already lists this as a TODO. **Proposal for B:** one bounded task to pull the volume preview/commit/cancel state machine into a pure module in `lib/arrangement/`. The `useArrangement()` shape must not change. Acceptance tests: UM3, UM9, `fader-guards.test.tsx` and UC2, all still green.
- **Signal 2 (ownership/coupling):** `ArrangementGroupHeader` used to get everything through props and now reads the context directly. **Keep it:** this matches `ArrangementLane` and avoids passing extra props through.

### Alternative Approach (Studio audio pipeline)
- **Current:** an effective gain per track: the track's volume times the volume of every parent group, or 0 if the track is not audible. It feeds the existing track GainNode.
- **Alternative:** a real summing bus, one GainNode per group, so that later group effects, group pan and a group meter become possible.
- **Verdict:** keep the current approach. Without effects, the gains simply multiply, so the sound is identical. Ctrl+G and ungrouping restart no sources, which round 79's TG-AUDIO test checks. A bus would need a graph rebuild or live rewiring. Switch to a bus when group FX or group pan come into scope.

### Score: 8.5/10