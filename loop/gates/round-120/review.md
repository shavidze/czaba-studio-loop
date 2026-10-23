COMMIT: OK

## Code Review: round 120 — waveform follows Clip Gain (ArrangementClip.tsx, ArrangementDetailPanel.tsx, clip-gain-waveform.test.tsx, doc 102)

**What was checked.** I reviewed the diff (`diff.patch`), both new files, the code around each call site, `clipLinearGain` (`model.ts:523`), and how `ArrangementClipView` is memoized (`ArrangementClip.tsx:956`, a plain `memo` with no custom comparator). I also read `c-round-120.json` (PASS, no bugs) and `verify.log`: 156/156 test files passed, typecheck is clean, the build succeeded, and lint showed only old warnings in files this round didn't touch. I read the `SECURITY_AUDIT`, `ERROR_TAXONOMY` and architecture-checkpoint references. This reviews the diff, not the whole module.

**Auth, purchase, download.** None of these were touched. The diff contains no API, token, cart, checkout or file-access code.

### Critical Issues
- None.

### Suggestions (ranked)
1. **Render cost during a gain drag (Medium–Low)** — `ArrangementClip.tsx:308-312`
   - Before this round, dragging Clip Gain never rebuilt the waveform path. Now every pointermove rebuilds it for every selected clip.
   - Each rebuild can be up to 4096 columns (`PEAK_SHAPE_MAX_COLUMNS`, line 40), about 120 KB of path string per clip, plus the browser re-parsing that path. The detail panel adds 480 more columns.
   - It's fine at normal zoom. At high zoom with a long, multi-selected drag on low-end hardware, frames may drop. C's WG-LIVE check covered 1440/1280 widths, not a stress case.
   - **Fix (later round):** keep scale-1 peaks as they are and apply gain as an SVG transform, `<g transform="translate(0 1) scale(1 s) translate(0 -1)">`. The svg viewport crops for free, so the clamp at 1 happens visually. The catch is the 0.02 floor, which would then scale too and would need a separate minimum stroke. Not needed now; measure first.
2. **The doc's status line will be wrong at commit (Low)** — `docs/implementation/2026/quarter-IV/102-studio-waveform-clip-gain.md:4` and the TODO at line 64.
   - It still says C's browser check and the root gate are "ჯერ წინაა" (still ahead). C passed.
   - **Fix:** set the status to Completed (or "C PASS, root gate OK"). Mark the TODO line for C done. Add the open WG-VIDEO item as a remaining step: there is no browser byte baseline from before the round.
3. **Process note C-R120-01 (Low, not an app bug)** — A made a formatting edit to the test file with a Python replace, which skipped the primitives hook. Biome passes on the file. Record this in the doc's problems section so the hook bypass doesn't become a habit.
4. **Behaviour clamps hard at high gain (Info, Ableton not confirmed)** — `ArrangementClip.tsx:267`
   - At about +10 dB and above, most columns hit full height and the clip looks like a solid block. C marked `linearScaleAndClamp` as unconfirmed against Ableton.
   - This stays as an item for ABLETON-EXPERT-REVIEW, not a fix now.
5. **Test-only `data-testid` in production markup (Info)** — `ArrangementClip.tsx:~849`. The `arrangement-detail-waveform` testid already follows this pattern, so it's consistent. No action.

### Good Practices Found
- `clipLinearGain` is reused, so the drawing and the audio graph use the same gain factor. They can't drift apart.
- The guard at line 258 handles bad input: NaN, Infinity or a negative scale falls back to 1, and WG1 tests that.
- The scale is multiplied before the clamp, and mutation m2 proves the test suite would catch the reverse order.
- `gainScale` sits outside the memo and in its deps, which satisfies `useExhaustiveDependencies`. React compares it as a plain number, so a non-gain edit doesn't force a recompute.
- The default `memo` on `ArrangementClipView` compares the `clip` object by reference. A gain change replaces that object (`replaceClip`), so the lane re-renders and no stale-drawing path exists.
- WG2 pins the scale-1 output to a sha256 hash, and C independently checked that hash against the HEAD code. The existing drawing is byte-identical.
- The test cleans up after itself: `afterEach` unstubs globals and restores mocks.
- No new listeners, timers or effects were added, so nothing can leak.
- `aria-hidden` on the waveform is unchanged, so accessibility is not affected.
- Colours still use `currentColor` and no Tailwind classes changed. TS strict holds: no `any` and no type assertions (the `instanceof` checks in the test are runtime type narrowing). Every statement ends with a semicolon.
- The WG7/WG8 must-not tests check that track and group Volume, Master, Pan, Mute/Solo, fades and envelope points leave the drawing unchanged. They also check that playback creates no new audio sources and that the gain node receives exactly 10^(dB/20).

### Architecture note
- **Signal 2 (ownership/coupling), mild:** `ArrangementDetailPanel.tsx:47` imports `buildPeakShape` from the component file `ArrangementClip.tsx`, and the test imports it from there too. The function is pure geometry, and stage 4b will make it more complex (`source × clipGain × verticalZoom`).
  - **Keep for now:** there are only two callers, it shares no state or lifecycle with the component, and moving it now would only shuffle imports.
  - **Proposal for planner (consider with 4b):** move `buildPeakShape` and `PeakShape` to `app/lib/arrangement/peak-shape.ts` without changing behaviour.
    - Acceptance: the WG2 sha256 and WG1 literals stay the same, and both call sites change only their import.
    - Focused tests: `clip-gain-waveform.test.tsx` plus the existing lane and detail tests.
    - Value: low–medium. Risk: low.
- No other signals: no new state, effect or listener in any existing owner, and the context, audio graph and model are untouched.

### Alternative Approach (Studio drawing ↔ audio pipeline)
- **Current:** recompute the peak path with `peak × linearGain` and clamp in JS, inside `useMemo`.
- **Alternative:** build the scale-1 path once and apply gain with an SVG `transform` scaleY around y=1, letting the viewport crop the overflow.
- **Verdict:** keep the current approach for this round.
  - It gives exact, testable path literals and keeps the 0.02 floor visible.
  - Stage 4b's vertical zoom can multiply into the same factor.
  - The transform would avoid the per-move rebuild (suggestion #1) but changes floor behaviour and makes byte-level tests weaker.
  - Revisit only if profiling shows dropped frames during gain drags at high zoom.

### Score: 9/10