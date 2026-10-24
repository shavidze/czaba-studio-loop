COMMIT: OK (no blocker: the zoom only changes how the waveform is drawn; audio, history and auth/purchase/download code are untouched)

## Code Review: Round 121 — Waveform Vertical Zoom (6 paths)

**What I checked:** `diff.patch`, the two new source files and the doc in the repo, the `StudioWorkspace` grid row, `isTypingTarget`, `ArrangementClipView` memo, `cn`/twMerge, and `verify.log`. This is a review of the diff only, not a full audit of the module.

**Gate evidence:**
- Typecheck passed, with no errors.
- 157/157 test files passed, including `waveform-zoom.test.tsx` with 9 tests (verify.log:1041).
- Both builds finished.
- Lint printed 218 warnings but showed only the first ~20; 199 were not shown. None of the shown ones are in the touched files, but `verify` can't prove the hidden ones aren't.
- `verify` runs `biome lint`, not a format check, so formatting is not gated by this log. Run `npm run check` before the commit.

### Critical Issues
- None.

### Suggestions (ranked)
1. **`StudioWorkspace.tsx:2373`: the control looks like a static badge.** `appearance-none` removes the native dropdown arrow and nothing replaces it, so the closed control reads as a static "1×" label. Keyboard and screen-reader users are fine (it's still a native select), but mouse users may not see it's clickable.
   - **Fix:** add `hover:text-foreground` / `hover:border-foreground`, matching how Snap/Env hint they're clickable. Or add a small chevron through `bg-[url]`, but only if the 224 px header still fits.
   - Don't change the layout.
2. **`StudioWorkspace.tsx:2373`: no hover state.** Snap and Env have `hover:text-foreground` and `hover:text-accent` in their active state; the zoom select has neither.
   - **Fix:** add the same pair of hover classes to keep the design system consistent.
3. **`ArrangementClip.tsx:302` and `ArrangementLane.tsx:136`: hard-coded default.** The prop default is the literal `1`, while `WAVEFORM_ZOOM_DEFAULT` exists.
   - **Fix:** `waveformZoom = WAVEFORM_ZOOM_DEFAULT`, so the default can't drift apart from the select's "accent off" check.
4. **Render cost (same cost class as existing horizontal zoom, not a regression).** One zoom change re-renders `StudioWorkspace` and rebuilds `buildPeakShape` for every audio clip at once, up to 4096 columns each.
   - Changing horizontal zoom (`pxPerSecond`) already costs the same, and this is a one-off choice, not a continuous drag.
   - Video clips skip the rebuild: their `peakScale` doesn't change, so the memo holds.
   - If a slider is ever added (to match Live), throttle it or use `useDeferredValue`.
5. **`StudioWorkspace.tsx:2370`: label language.** The aria-label mixes English and Georgian, while the neighbouring grid select is Georgian only ("ბადის დანაყოფი"). Minor. "Waveform Zoom" is a Live term, so keeping it is defensible, but the choice should be deliberate.
6. **`docs/implementation/2026/quarter-IV/103-studio-waveform-vertical-zoom.md:4`: stale status.** It still says C's browser check and the root gate are ahead. C has passed (c-round-121.json), so update the status line when committing.
7. **Header width (risk, not checked by tests).** The 224 px header now holds Snap + grid select (with its native arrow) + Env + zoom + `gap-2`×3 + `px-2`. With long musical labels (tempo set, triplet group) it could overflow. C checked this in a real browser; a screenshot with BPM set and the widest division would be useful.

### Good Practices Found
- **Not in history, not in audio.** `waveformZoom` is local view state in the workspace. It never reaches context, `scheduleKey`, the graph, export or Undo/Redo. WZ6 and WZ7 test this: same arrangement reference, 0 new sources, 0 `setClipGain` calls.
- **1× restores exactly.** `gain * 1` is exact, so 1× gives the same paths as before (WZ2). The existing clamp and floor in `buildPeakShape` apply to the combined scale without changing that function.
- **Memo and deps are right.** `ArrangementClipView` is `memo`'d, and `useMemo` deps include the combined `peakScale`. A mutation that drops it turns WZ2 and WZ3 red.
- **Keyboard is safe.** `isTypingTarget` already counts `HTMLSelectElement` as a typing target (`StudioWorkspace.tsx:368`), so Space, arrows and Delete on the focused select don't edit, move or play (WZ9). The grid select's Digit1/2/3 handler is not affected.
- **No leaks.** No new effect, listener, timer or ref, so nothing can leak.
- **Type safety.** No `any`, no assertions, semicolons present. `parseWaveformZoom` accepts only known levels, so DOM values can't be injected. Bad zoom values (NaN, 0, Infinity) fall back to 1.
- **Tailwind tokens only** (`border-outline`, `bg-surface`, `accent`, `ring-brand`). `cn`/twMerge correctly resolves the `bg-surface` vs `bg-accent/20` conflict.
- **Must-not cases are tested:** video lane (WZ4) and detail panel (WZ5) stay unchanged.

### Architecture note
- **Signal 4 (new state in an existing owner):** `StudioWorkspace.tsx:478` adds `useState(WAVEFORM_ZOOM_DEFAULT)` next to `envelopeMode`, snap and grid division. These are workspace view preferences passed down as props through `ArrangementLane` to `ArrangementClipView` (`ArrangementLane.tsx:981`).
  - **Keep, because:** it's one lifecycle, with no effect, listener or history/audio path, and it changes no invariants (audio timing, refs, gesture lifecycle, Undo/Redo, `useArrangement()` shape).
  - **Cost:** low now; it grows with each new preference.
  - **Proposal for the planner (proposal only, not approved scope):** `ARCH-CHECKPOINT-SRW14-PREFS`, already named in the doc. Gather the view preferences (snap, grid division, envelope mode, waveform zoom) into one object or hook owned by the workspace, passed as one prop. Acceptance criteria:
    - 1× drawings stay byte-identical.
    - Undo/Redo and the `useArrangement()` shape don't change.
    - The existing grid/env/zoom tests pass without changes.

### Alternative Approach (Studio rendering path)
- **Current:** local `useState` in the workspace, passed as a prop, folded into the scale `buildPeakShape` already uses.
- **Alternative:** a CSS `transform: scaleY(zoom)` on the clip's SVG `<path>`, which wouldn't rebuild peaks.
- **Verdict:** keep the current approach. `scaleY` can't apply the clip-height clamp or the 0.02 floor to the combined gain × zoom value (T12.19), and it would make the peaks bleed out of the clip. Rebuilding once per discrete choice is cheap enough.

### Score: 8.5/10