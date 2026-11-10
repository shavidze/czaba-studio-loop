# tech-lead review of sketch v2 (verbatim result, round 440 → 441 planning)

Reviewed sha256: `5fd99e42c02abf6d7f3b8d83de520eeef9012ff58b8322de5cf972ab7b9e3553` (`sketch-441-v2.patch.txt`).

I reviewed sketch-441.patch.txt (sha256 `5fd99e42c02abf6d7f3b8d83de520eeef9012ff58b8322de5cf972ab7b9e3553`) against HEAD 047a0fc. Nothing is Medium or higher, so the sketch is fine to land. I ran no tests myself; that it passes rests on your 267-test run. The `VideoProbeResult` and `VideoAudioDecodeResult` mock shapes match their types, so I don't expect tsc to fail.

**Q1: assertions lost or replaced**
- **OV1 exact source string, count 1:** the count of 1 survives as `getAllByTestId(...outline)` length 1 plus a parent check in PNR4. But `expectPanelTokens` only checks that listed classes are present or absent, so an extra class on the overlay would now pass. **Low.** Fix: compare the full sorted token list with `toStrictEqual`.
- **UM8 `toContain('isTrackAudibleWithGroups(videoTrack, arrangement)')`:** replaced by a stronger behavioural test. Under a group solo with no track solo, the old `isTrackAudible` returns true, so the dialog would show "Included" and UM8b would fail.
- **UM8 `not.toMatch(/isTrackAudible\(/)`:** the file-wide ban is lost, and group Mute is never exercised in the rendered dialog. **Low.** Fix: add a Group 1 Mute step. The video lane stays ungrouped, so this also needs a group that contains the video lane.
- **OV-E1 `children[1]` testid is null:** inverted on purpose. Lanes now carry a testid, and `previousElementSibling === baseline` pins the order. Stronger than before.
- **OV-E1 `children[1].children` length 2:** equal, and the lane and bar counts add to it.
- **DXC4 / PNR4 (`:scope > div`, `> div > div`):** the new selectors only count bars that carry the hook, so an extra unhooked child div in a lane would no longer be caught. **Low.**

**Q2: the video.client mock and the 20-tick wait**
- Only UM8b calls `importVideoFiles`, so the mock cannot affect any other UM test. The spread keeps `videoAudioNote` real.
- Vitest 4's `restoreAllMocks` does not reset `vi.fn()`, so the resolved values carry over into later tests. Nothing calls them, so this is harmless hygiene. **Low:** use `mockResolvedValueOnce`.
- The wait is bounded by tick count, not by time. jsdom has no `Worker`, so peaks are computed on the main thread. The gesture wait does not run because there is no preview. Each step to `'ready'` is a promise or a `setTimeout(0)` hop, so load does not change the result. The `['ready']` assertion after the loop gives a clear failure if it ever stalls.

**Q3: hook names and render cost**
- Placement is correct, with no change to classes or structure. The new attributes sit on existing nodes, add no props and cost nothing for the memoised component.
- **Low:** `data-overview-bar` and `data-overview-lane` share a prefix with `ArrangementGroupHeader`'s `data-overview-clip-id`. Nothing collides today. A prefix like `data-overview-map-*` would remove the ambiguity.

**Q4: remaining positional lookups**
- None in `app/**/__tests__`, `perf` or `e2e`. OV-E1's `root.children[0]` and `previousElementSibling` are deliberate order checks on elements already found by testid.
- The `firstElementChild` hits in drag-preview-render are clip headers, and the ones in track-group-collapse-ui are the timeline scroller, not the Overview.
- The source-text goal is only partly met. PNR4 (l.498–501), the content-colour scan at l.336, and studio-focus-ring and strings still read the `ArrangementOverview.tsx` source. Not in this round's scope, but worth logging.

**Q5:** Nothing Medium or higher. Two titles are now stale: UM8 ("uses the group-aware rule") and OV1 ("outline overlay"). **Low.**
