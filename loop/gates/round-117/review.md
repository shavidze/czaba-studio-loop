COMMIT: OK. The code is fine to commit. One fix to the implementation doc (`100-studio-track-volume-db.md`) should go into the same commit (finding 1).

## Code Review: round 117 — lane Volume fader in dB with −∞ (`ArrangementLane.tsx`, `track-volume-db.ts`, 11 test files, 2 docs)

**Checked:** the whole diff, the 3 new files, `useRelativeFaderDrag.ts`, `fader.ts`, `formatMasterGainDb`, the reference files, and `verify.log`. The log shows `tsc` clean, 154 test files / 2380 tests passed, and the build passed. This is a review of the diff only, not a full check of the module.

**Out-of-bounds code:** nothing in auth, purchase, download or protected files changed. No `dangerouslySetInnerHTML`, no secrets, no API calls. `track-volume-db.ts` imports from `model.ts`, but `model.ts` doesn't import it back, so there's no circular import.

### Critical Issues
- None.

### Suggestions (ranked)
1. **The implementation doc contradicts what this commit does.** File: `docs/implementation/2026/quarter-IV/100-studio-track-volume-db.md`.
   - Line 4 says "Round 116 — waiting for C", but this is round 117 and C passed.
   - Line 56 says `track-group-mix-ui.test.tsx` "was not changed" and was handed to B. In fact, line 11 of `paths.txt` and the diff (patch lines 699–763) change UM3/UM5/UM9 in that file, and line 65 of the doc already says so.
   - Line 70 still lists B's decision on that file as an open TODO.
   - **Fix:** set the status to "Round 117 — C PASS (`c-round-117.json`)", rewrite the problem at line 56 as solved by C-R116-01, and remove that file from the TODO on line 70. Do this in the same commit so the doc matches the code.
2. **Dragging the fader now feels very different.** The fader is linear in dB, so about 100 px covers 60 dB: 1 px ≈ 0.6 dB, and half the travel is −30…0 dB. The same −25 px drag that used to take 0.6 to 0.35 now goes to about 0.107 linear (−19.4 dB). This matches the spec and isn't a bug, but users will notice. Fine dragging with Shift comes in stage 3b, and until then Shift does the same as a plain drag (TV11). Consider a non-linear taper (more resolution near 0 dB) as a separate signal.
3. **`volumeGestureStartRef` is never cleared** (`ArrangementLane.tsx:406`). It's harmless today: only the hook's `previewValue` reads it, `beginGesture` overwrites it before any move, and the keyboard `onChange` doesn't use it. If you want it tidy, set it to `null` in the pointer-up, blur and cancel paths of `commitTrackVolume`/`blurTrackVolume`. The hook has no end-of-gesture callback to do it from.
4. **Unity reads `+0.0 dB` on the lane but `0.0 dB` on Master.** This is already noted for B in the doc (line 54). I'm only pointing to it here, not raising it as a new issue.
5. **Small accessibility mismatch below the slider floor.** For a stored value like `1e-4`, the readable text is `−80.0 dB` while the slider value is −59.9. Screen readers use the text, so this is acceptable as designed.

### Good Practices Found
- dB is only a display layer. The model, schedule, graph, export and context API still use linear values, so the audio engine still mutes at exactly `0`.
- Returning to the start position restores the exact stored value. I checked the maths for −4.4: `-60 + 556*0.1` rounded to 12 digits equals `Math.round(-44)/10`. So a drag that ends where it started previews nothing (the hook skips equal values) and writes no Undo entry (TV4, F2, F8).
- No React state was added, only a ref. The render-count test (PV4) still shows 0 renders. No new listeners or timers. Playback keeps the same schedule and sources while dragging (TV10).
- Edge cases are handled: NaN, ±Infinity, values ≤ 0, `-0` and values above 1 all map to defined slider positions and text (TV1/TV2).
- Styling uses tokens only (`w-10 shrink-0 whitespace-nowrap text-muted`). No `any`, no type assertions, no suppression comments, and semicolons are consistent.
- In the old tests, linear values that would have been silently clipped to 0 dB were converted to dB, with expectations written as `toBe(trackVolumeFromDb(…))`.

### Architecture note
- Signal 4 (gesture state added to an existing owner): `ArrangementLane.tsx:184` and `:401–415`. A ref was added to the lane only so that returning to the start position is exact.
  - **Keep it for now:** it serves one fader and one gesture, and tests pin the behaviour (TV4, F2, F8). Cost: low.
  - **Proposal for the planner (stage 3b):** the group fader will need the same exact-return behaviour. Instead of adding a second ref in the group owner, give `useRelativeFaderDrag` an optional stored-value ↔ slider-value mapping so the hook itself restores the anchor exactly.
  - **Must not change:** the hook's public shape for current callers (Pan, Master), the gesture lifecycle, and the move-back-writes-nothing tests (F2, F8, TV4).
  - This is a proposal, not a refactor instruction.

### Alternative Approach
- **Current:** the model stores linear volume, the UI maps to and from dB, and the start value of a drag is remembered in a ref.
- **Alternative:** store a `volumeDb` field in the model.
- **Verdict:** keep the current approach. Storing dB would change the model, export, group logic and every context test without any visible benefit, and it would make an exact zero (silence) less clear.

### Score: 8.5/10