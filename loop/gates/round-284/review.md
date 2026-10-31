COMMIT: OK (no blocking issue; the change stays inside Studio arrangement rendering, and auth, purchase and download code are untouched)

## Code Review: round 284 — PERF-3a (`peaks.ts`, `ArrangementClip.tsx`, `ArrangementClipEnvelope.tsx`, 3 tests, doc 212)

### Critical Issues
- None.

### Suggestions (ranked)
1. **Medium — short clips are drawn differently at the default zoom, but the doc says the waveform is unchanged from 50 px/s up.** In `app/lib/arrangement/peaks.ts:309-315`, above 25 px/s each column holds one peak bucket. So the column count is `ceil(duration × 100)` until it reaches 4096. Any clip shorter than about 41 s never reaches that cap, so its column count doesn't depend on zoom.
   - A 12 s clip at 40 px/s now gets 1200 columns in 480 px, about 2.5 per pixel. The ZQ1 test confirms the `[1200, 200]` counts. Before, it got `round(min(480, 4096)) = 480`.
   - So the slightly softer spikes the doc expects "below 41 px/s" also show up for short clips at the default 40 px/s, and up to about 100 px/s.
   - B's pixel comparison (`imgdiff-head-vs-sketch`) only used 101 s clips, which hit the 4096 cap both before and after, so it couldn't catch this.
   - **Fix:** in the next round, run one WAVE-PIXELS comparison on a 12 s clip at 40 px/s. If the softening is acceptable, narrow the wording in `docs/implementation/2026/quarter-IV/212-perf-zoom-waveform-columns.md:71` to "long, cap-bound clips". If it isn't, use `bucketsPerColumn × pixelsPerBucket ≥ 1/2` as a lower limit for the band.
2. **Low — fewer path rewrites on zoom, but heavier paths to paint.** ZQ2b allows up to `ceil(4 × width) + 1` columns. For example, 30 clips of 101 s at 6.3 px/s now draw 2534-column paths into 638 px; before it was 638. That costs more on every repaint, such as horizontal scroll or the playhead moving. **Fix:** add a frame-cost row at 6–25 px/s to the PERF-3b harness, since that's where the p95 < 50 ms target will be measured.
3. **Low, not reachable today — the loop in `peaks.ts:311` only stops because `pxPerSecond` is positive.** If both `duration` and `pxPerSecond` were negative, `width` would be positive and the loop would never end. Today `clampTimelineZoom` (`app/lib/arrangement/view.ts:65-70`) keeps zoom in [0.5, 320], so it can't happen. **Fix (optional):** return 0 early when `!(pxPerSecond > 0) || !(duration > 0)`.
4. **Info — the MutationObserver checks in ZQ1 and ZQ3 add nothing.** React only writes an attribute when its value changes, and the tests already check the strings are unchanged with `toStrictEqual(before)` / `toBe(before)`. What proves the memo is needed is the Z4 mutant (deps `[]`). Keep the checks, but don't cite them as that proof.
5. **Info — `verify.log` lines 1348–1381.** The `Error: useArrangement… must be used within an ArrangementProvider` lines come from tests that expect that error. They aren't failures: 222 of 222 test files and 3324 of 3324 tests passed, and the build succeeded.

### What else I checked (no problems found)
- **Browser event order, listener and timer leaks:** no new effects, listeners or timers. The envelope editor still positions in pixels and its handlers (`ArrangementClipEnvelope.tsx:161, 268, 373`) are unchanged, so gesture handling and Undo are unaffected.
- **Hooks rules:** `useMemo` is placed before the early return at `ArrangementClipEnvelope.tsx:48-67`. Its deps `[clip]` are complete, because `visibleClipEnvelopePoints` uses only `clip`.
- **Line geometry:** whenever `width ≥ 1`, the seconds-based viewBox (`0 0 spanSeconds 1`) maps to the same pixels as before. `vectorEffect="non-scaling-stroke"` and the `left` offset are kept.
- **Type safety, Tailwind, accessibility:** no `any`, no `@ts-ignore`, no type assertions (`querySelector<SVGSVGElement>` is a generic, not an assertion). No style or token changes. `aria-hidden` is kept.
- **Detail panel:** `ArrangementPeakPath` still gets a fixed column count there.

### Good Practices Found
- The new code is a pure function with a table test (ZQ2) and a sweep over zoom and clip length (ZQ2b), including NaN, 0 px/s and sub-pixel clips.
- The column count stays the same within a zoom band, so the path memo key (`columns`) stays stable while zooming.
- The doc includes a table of mutants and which tests each one fails, and states explicitly what is out of scope (ruler → PERF-3b).

### Architecture note
- signal (2. ownership/coupling): `ArrangementClipEnvelope.tsx:48-67` against `:373`. The line is now positioned in seconds, while the editor dots and gesture math are still in pixels, in the same file. → **keep:** the AL1 test checks that the two line up, the gesture handling is untouched, and moving a 15-line memo elsewhere wouldn't make anything clearer. Cost: low. This is not a finding for round 284 and not a refactor instruction.

### Alternative Approach
- **Current:** column count chosen by zoom band, with bands ×4 apart, based on peak buckets.
- **Alternative:** the next power of two at or above the clip's pixel width.
- **Verdict:** keep the current approach. With 1.25× zoom steps, the alternative would still rewrite the paths about every third step. The bands don't rewrite at all between 25 and 320 px/s, and only once when crossing a band edge. Its costs are findings 1 and 2: denser paths on short clips and heavier painting.

### Score: 8/10