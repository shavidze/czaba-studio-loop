# B round 397 → 398: consults on PERF-14 (summaries, B's words)

Both consults got the same HEAD numbers (`probe/head-200-*.json`). Neither edited a file.

## performance-optimizer
- Order 14a → 14b → 14c holds. 14b (virtualization) is what cuts the DOM, and it probably brings zoom under 50 ms by itself: every zoom key re-renders all 200 memo clips because each gets `pxPerSecond` as a prop (it cites `ArrangementLane.tsx:1068`, `ArrangementClip.tsx:1116`). 14c makes each clip's peak build cheaper; gate it on zoom p95 at min zoom.
- 14b is mostly built: `ArrangementClip.tsx:448-469` already subscribes to a three-viewport page window (`view.ts:290-300`) but only uses it to freeze peak columns. Move the filter to the lane `clips.map` (`ArrangementLane.tsx:1050`) with `spanInTimelineWindow` (`view.ts:279`) and the page key.
- 14a metrics: DOM total at default and min zoom; mounted clips next to model clips; clips in the window; zoom keydown p95/max at 1× and 6×; commits and components per zoom key; scroll page-cross cost. Build at 1×, then throttle. Measure at scroll 0 **and scrolled to the middle** at min zoom.
- 14b: do not pin all selected clips (select-all would mount 200 again); pin the gesture clip and `laneMoveSourceIds`. jsdom already renders all (`clientWidth` 0 → no window → every clip in view, `view.ts:248,284`); add one unit row to lock it.

## tech-lead
- New spec file, not the 2059-line interactions spec: its later rows start from the state the 30-clip block leaves (`interactions.perf.spec.ts:85-87`).
- Add the model clip-count signal in 14a: `data-clip-count={clips.length}` on the lane element with `data-track-id` (`ArrangementLane.tsx`), so 14b's harness does not change. 0 users today; low collision risk.
- 14b shape: one subscription per lane; must-stay-mounted: selected clips (`ArrangementLane.tsx:268`), lane-move sources (`:285`), any clip with an active gesture (unmount releases the gesture and pointer capture, `ArrangementClip.tsx:468-474`, `:559`). Check `waveform-window-ui.test.tsx` and `fader-guards.test.tsx` first (they stub `clientWidth`). The page key does not include zoom; recompute on zoom with the pending view (`StudioWorkspace.tsx:1742-1748`). Min-zoom budget estimate about 1860 at mid-timeline: tight, so 14a records min zoom scrolled to the middle.

## Disagreement (for 14b, not this round)
Pin **selected** clips (tech-lead) vs pin only the gesture clip and lane-move sources (performance-optimizer, because select-all would remount all 200). Recorded as PERF-14b input `Q-14B-PIN-SELECTED`; B rules it in the 14b task with a measurement (select-all + DOM count), not here.

## B's choices for 14a
- Both agree on the split and on the new spec file. B adopts tech-lead's `data-clip-count` in 14a (one attribute, sketched and pre-checked: `sketch-398.patch.txt`, mutants 3/3 red, full suite 260/3850 rc 0) and performance-optimizer's metric list, including min zoom scrolled to the middle and the scroll page-cross rows.
- All scale rows are `record — not run on sketch` (the spec is A's code; L58). The model count and the HEAD mounted count are checked by C against B's dev probe.
