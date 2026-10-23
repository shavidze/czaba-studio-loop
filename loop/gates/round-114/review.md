COMMIT: OK — nothing in the diff blocks this commit. It doesn't touch auth, purchase or download code. Window listeners are attached and removed exactly as the master fader does it, and Undo/Redo stays atomic. Lint, typecheck (`verify.log:438-439`), tests (152 files / 2355 tests) and build all passed.

## Code Review: round 114 — Clip Gain fader (`ArrangementDetailPanel.tsx`, `ArrangementContext.tsx`, `useRelativeFaderDrag.ts`, `StudioWorkspace.tsx`, `clip-gain-fader.test.tsx`, docs 097/098)

This review covers the diff only. It is not a full check of these modules.

### Critical Issues
- None.

### Suggestions (ranked)
1. **Low — `ArrangementDetailPanel.tsx:407-418, 429-433, 652-656`.** The hook's `readStoredValue`, `previewValue` and `beginGesture` read the clip id from the latest render, not from the moment the drag started.
   - **Problem:** if the selected clip changes while the pointer is held (for example, keyboard clip navigation), every pointermove calls `previewClipGainFader(newId)`. That call is refused (`ArrangementContext.tsx:2766`), and `setStatus(GESTURE_EDIT_BLOCKED_MESSAGE)` is written again on each move. `onPointerUp` and `onBlur` then pass the wrong id.
   - **What still works:** the window capture `pointerup` listener commits the original clip, so history is not corrupted.
   - **Fix:** in `beginGesture`, save the id to `dragClipIdRef`. Read that ref in `previewValue`, `commitClipGainFaderValue` and `onBlur` while the gesture is active.
2. **Low — `ArrangementDetailPanel.tsx:607`.** The number field still uses a hard-coded `step={0.1}`, while the fader uses `DETAIL_CLIP_GAIN_STEP_DB`. Use the constant in both places so the two controls can't drift apart.
3. **Low (real browser) — `ArrangementDetailPanel.tsx:657`.** Chromium doesn't fire `blur` when a focused element becomes `disabled`. If the selection changes to a video clip or a group during a keyboard preview, the change is not committed on blur. It is saved later by any `applyEdit`, Undo/Redo or other preview, so nothing is lost; the Undo entry just appears later. C should cover this in CG-DISABLED; no code change needed now.
4. **Info — `useRelativeFaderDrag.ts:80-86`.** Shift is only detected on `pointermove`. Pressing or releasing Shift without moving changes nothing until the next move. That's correct (no jump), but the re-anchor starts from `previewedValue`, which is already rounded to the step and limited to min/max. So after an overshoot past the limit, the value moves back immediately instead of after the pointer returns. This only happens when Shift is toggled, and the behaviour is acceptable.
5. **Doc — `098-studio-clip-gain-fader.md:49`.** The file table says `CF1–CF12`, but there are 14 tests (CF1–CF14, which the ტესტირება section confirms). The status line (`:4`) still says "C-ის შემოწმებას ელოდება", although `c-round-114` passed. Update both next round, the same way 097 was updated this round.

### Good Practices Found
- **Fader hook (no regression):** callers without `fineDivisor` behave exactly as before. In that case `isFine` is always `false`, so the anchor never moves and `relativeFaderValue` gets the old inputs. That proof covers Pan (`ArrangementLane.tsx:364`) and group Volume (`ArrangementGroupHeader.tsx:93`), which CF11 does not test.
- **Gesture lifecycle mirrors Master:** begin, commit, cancel and blur work like Master's, including claim, revoke and unmount release (`ArrangementContext.tsx:3288-3289`). Window capture listeners are removed through `detach()` on every exit path, so there is no listener leak.
- **Pending previews are saved before other edits:** an unfinished Clip Gain change is saved on every route — `applyEdit`, Undo/Redo, Volume/Master preview, and the Volume/Pan/Master gesture begins. CF14 shows the Clip Gain change doesn't merge into another Undo entry.
- **Playback:** dragging changes the gain with a ramp only. There is no reschedule and no new sources (CF12).
- **Disabled state:** the fader is guarded in code too, because jsdom and Chromium can deliver pointerdown to a disabled input. It shares `title` and `aria-describedby` with the number field, and has `aria-valuetext` in dB. Tab order is field → fader → `0 dB`. Double-click reset has a keyboard equivalent (the `0 dB` button).
- **Code rules:** Tailwind tokens only (`accent-brand`, `ring-brand`, `disabled:opacity-50`); TS strict with no `any` or type assertions; semicolons present; no comments.
- **Render cost:** the new props are stable `useCallback`s and the memoized `ArrangementDetailContent` stays memoized.

### Architecture note
- **Signals 4 + 3 at `ArrangementContext.tsx`.** A third preview/commit/begin/blur/flush set was added next to the Volume and Master ones. Flush wiring is now spread across about 10 sites (1154-1155, 2067-2068, 2081-2082, 2298-2299, 2398-2399, 2594-2595, 2652, 2733-2734, 2770-2774, 2864-2865). The fader hook has changed in two rounds in a row (113, 114).
- **Keep for now.** All three share one gesture lifecycle (`gestureCountRef`, `claimPointerGesture`) and one history. Pulling them out now would move refs and the gesture lifecycle across the context boundary, which the checkpoint lists as invariant.
- **Cost: medium.** Every new preview kind has to be wired into every other begin/preview, so the work grows as n². The doc's m6 mutation surviving shows that some of these flushes are only defensive.
- **Proposal for the planner (ARCH-R81, not this round):** replace the three `*BeforeRef`s with one `pendingPreviewRef {kind, key, before, label}` and one `flushPendingPreviews()`.
  - Owner: `ArrangementContext` only.
  - Acceptance: master-ui, volume, pan and clip-gain-fader tests stay unchanged and green, the m6-style mutation is covered, and `useArrangement()` keeps the same shape.

### Alternative Approach (Studio gesture/history logic)
- **Current:** Clip Gain gets its own preview/commit pair, built like Master's.
- **Alternative:** add `'clip'` as a third kind of `MixVolumeTarget`.
- **Verdict:** the current approach is better for now. `previewVolumeTarget` and `flushPendingVolume` hard-code the `Volume` label and the group flush, so a third kind would change the shared track/group path, against the R7 constraint. The trade-off is more repeated code, which the Architecture note proposal addresses.

### Score: 8.5/10