COMMIT: OK

I read the diff, the two new hook files, `ArrangementMixFader.tsx`, the clip-gain code in `ArrangementDetailPanel.tsx`, and the `verify.log` grep output. I did not run anything. The C round PASS and the verify result are taken as given. I did not check the paths.txt files against the working tree.

## Code Review: useStableHandler + MixFader/DetailClipGain memo (round 347)

### Critical Issues
- None. Nothing in the diff touches auth, purchase or download code. The changes are in arrangement components, one hook, tests and a doc.

### Suggestions (ranked)
1. **`ArrangementDetailPanel.tsx:17-22`, `parseClipGainDbKey` can misalign values with clip ids.**
   - `JSON.stringify` turns `NaN` or `Infinity` into `null`, and the `.filter(Number.isFinite)` then drops that entry.
   - Every later entry shifts left, so `storedClipGainsDb[index]` (line 348) would pair a gain with the wrong clip.
   - Practically unreachable, since gains are clamped to −60…+24 dB. It is still a silent misalignment.
   - Fix: `.map((db) => (typeof db === 'number' && Number.isFinite(db) ? db : 0))`, which keeps the length and matches the `?? 0` fallback.
2. **`drag-preview-render.test.tsx` DP65 has no `try/finally`.** If an assertion fails mid-loop, the gesture and pointer state leak into later tests. DP62 was already fixed this way in round 346. Wrap the loop body in `try/finally` that releases the pointer and undoes.
3. **`ArrangementLane.tsx` `renderPanReadout` deps include `setTrackPan`.** If `setTrackPan` is not referentially stable, the `useCallback` recreates on every render and the memo on the MixFader is defeated for that prop. Correctness is unaffected, and the perf numbers in the doc show the memo works. I did not confirm that `setTrackPan` is stable.
4. **Doc: the `useStableHandler` contract (never call it during render) exists only in impl doc item 84.** That is a hazard for future callers, and the doc already defers it to `docs/technical/`. A lint-level or test-level guard would be stronger than prose, but this is not a blocker.

### Good Practices Found
- **Event ordering:** `useStableHandler` updates its ref in a layout effect, so every event handler sees the latest committed closure before the next user event. React flushes discrete events synchronously, so no event can land between render and commit. A blur fired during commit sees the previous closure, which is what an unwrapped inline handler saw before.
- **Listener/timer leaks:** none added. The hook adds no listeners and no timers, only a ref and a `useCallback` with an empty dependency array.
- **Render-time calls:** `renderPanReadout` is called during the MixFader's render, so it correctly stays a `useCallback` rather than a stable handler. The deps include `isPanCentred`, and mutant 5 in the doc confirms a test fails if it is dropped.
- **TS strict:** no `any`, no `@ts-ignore`, no `as`. `parseClipGainDbKey` narrows with type guards. `memo(forwardRef)` keeps `displayName` on the inner component, so the render counter still works.
- **Tests:** DP65 has a positive control, and the doc lists mutants that fail the tests. `waitFor` replaces the fixed five-tick loop in DP64, which removes a flake source.
- **Accessibility and Tailwind:** DOM, attributes, aria labels and classes are unchanged. No new CSS and no hardcoded colours.
- **Verify log:** the `verify.log` lines I grepped show the tests passing, including `drag-preview-render` at 67 tests. I did not read the whole log, and I did not look at the Biome and build stages.

### Architecture note
- **Signal 4 (new lifecycle in an existing owner), `ArrangementLane.tsx`, about lines 515-600:** the lane header now holds about 10 stable handlers plus pan and volume gesture refs, in a component that also owns clip and ghost rendering.
  - Keep for now. The invariants (pan gesture cleanup refs, the volume drag handler and Undo) share one lifecycle, and the doc rejected option (c) for being out of scope.
  - Proposal for the planner, as one bounded task: extract a memoised `LaneHeaderMix` child owning pan and volume. Its acceptance criteria are the existing `track-pan.test.tsx`, `drag-preview-render.test.tsx` and `fader-guards.test.tsx` unchanged, plus a render-count test showing zero lane header renders during clip drags. Cost: medium. Risk: pan blur and cleanup ref ownership.
- **Signal 3 (repeated costly change):** `ArrangementDetailPanel.tsx` clip-gain code was changed again this round and keeps needing the heavy `drag-preview-render` mock harness. Keep for now; the next conversions round should confirm whether it recurs.
- This is a review of the diff only. It does not claim the modules were fully audited.

### Alternative Approach (critical logic: drag/gesture pipeline)
- Current: `useStableHandler` ref indirection plus `memo` on the faders.
- Alternative: per-call-site `useCallback` with explicit deps (option (a) in the doc), or a lane-header child component.
- Verdict: keep the current approach. `useCallback` with long dependency lists risks silently stale closures in gesture code, such as the Escape restore and the fader guard. The ref pattern always reads the latest committed values. The trade-off is that it must not be called during render, and that is documented and covered by SH4 and the pan-readout test.

### Score: 8.5/10