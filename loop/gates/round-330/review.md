COMMIT: OK (no blocking issues. The diff doesn't touch auth, purchase or download code. Round 330 removes the +1 component regression from round 329, measured by C, and moves are much cheaper.)

## Code Review: ArrangementTransport.tsx, StudioWorkspace.tsx, drag-preview-render.test.tsx, 232-perf-drag-preview.md

Evidence I checked:
- **The diff:** `diff.patch` (4 paths; `untracked.txt` is empty).
- **The verify log:** 243 test files and 3564 tests passed, and the build passed.
- **C's result:** `c-round-330.json` is PASS with `bugs: []`, `G330-AUTH` passed and 36/36 assert rows.
- **C's perf comparison** (`perf-rowcmp-vs-c328.txt`):
  - `interact.click.components` is back from 107 to 106, the same as round 328.
  - `drag.range.*.move-components-max` is back from 31 to 30.
  - `drag.move.*.per-move` dropped from 106.85 to 30.367.
  - `drag.move.*.max` went from 107 to 108. This is a `record` row, and the doc explains it (one commit when a move crosses into the next second).

### Critical Issues
- None.

### Suggestions (ranked)
1. **Low: the doc's file list is out of date.** In `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md`, line 376 (the test line under "შეცვლილი ფაილები") still says "round 329-ში DP20–DP22". It doesn't list DP23 and DP24 or the optional `loop` parameter on the fixture. **Fix:** add "; round 330-ში DP23–DP24, fixture/mount `loop` პარამეტრი".
2. **Low: two doc items contradict each other.** Item 22 (line 327) says "`memo` არ დაემატა … no-memo mutant მწვანე დარჩა", but item 23 reverses that. Someone reading item 22 alone gets the wrong answer. **Fix:** add a short note at the end of item 22: "(round 330-ში შეიცვალა, იხ. item 23)".
3. **Info: the DP24 far move doesn't prove the loop is used.** In the test file around line 297, `pointerMoveTo(root, 1, 400)` with `> 20` would also pass if the loop were ignored. The real check is the two `'20.000'` assertions, which already catch MU-OVERVIEW-NO-LOOP (C's INFO-C330-DP24-FAR). **Fix (optional):** use an exact extent value for the far move, or delete that part.
4. **Info: browser event order on release (reasoned, not measured).** On pointerup, `ArrangementProjectEndText` can render twice: once for the new committed prop (the transport re-renders after the commit) and once when the preview store clears. HEAD had the same count with the subscription at component level, so this isn't a regression. jsdom can't reproduce the lane split; C's END-LIVE browser probe covers it.
5. **Info: the inline selector in `StudioWorkspace.tsx:2949`.** It reads `viewportSeconds` and `committedProjectEnd` from the render closure. That's correct with `useStore`/uSES: it returns a primitive, the snapshot is recomputed every render, and a viewport resize re-renders the workspace through its own state. The `timelineSecondsRef` that the range gesture reads (line 2393) still holds the same ceil value as on HEAD.

### Good Practices Found
- **TS strict:** `Omit<ComponentProps<typeof ArrangementOverview>, 'extent'> & {…}`. No `any`, no assertions, no suppressions.
- **Hook order:** one hook was swapped for another at the same place. There are no conditional returns, and `useMemo(extent)` was removed correctly (`timelineExtent` returns a `number`, so no reference stability is needed).
- **Memo:** the `ArrangementProjectEndTextInner` + `memo` naming is consistent with the render log. DP23 has a positive control (rendered at mount) before its zero assertion.
- **Tests:** DP21 now also checks the Undo path (a smaller end under memo), and C's own mutant MU-C330-MEMO-IGNORES-END-DECREASE catches it.
- **Behaviour unchanged:**
  - The loop still comes from the committed arrangement.
  - `fitTimeline` still reads the committed end through `workspaceRef`.
  - Tailwind, tokens and accessibility are unchanged: the same `data-testid` span, no new classes and no aria changes.
- **No listener or timer leaks:** no new effects, listeners or timers were added.

### Architecture note (proposal only, not a finding for this round)
- **Signal 3, the same region keeps changing at a cost:** `StudioWorkspace.tsx:808–835` and `:2949–2958`, plus `ArrangementTransport.tsx:77–88`, were reworked in stages a, b, c1 and now round 330. Each time it needed render-log rows and mutants. **Keep it for now:** the tail and viewport policy belong to the layout owner, and checkpoint D-29z915 is already pending, so this round is just more evidence for it.
- **Signal 2, ownership moved:** the extent calculation moved from `StudioWorkspace` into `ArrangementOverviewWithPreviewInner` (`StudioWorkspace.tsx:833`). **Keep it:** the leaf now reads its own data, which means less prop plumbing.
- **Proposal for the planner (one bounded task):** make `ArrangementLane` memo, and have the lanes read the timeline width from the store. That removes the 108-component commit when a move crosses into the next second.
  - Ownership: `ArrangementLane.tsx`, plus a selector in StudioWorkspace.
  - Acceptance: in DP22, `StudioWorkspace` renders 0 times on the second crossing, and the ruler width still grows by exactly `PX_PER_SECOND`.
  - Tests: DP21, DP22 and DP2, plus a mutant where the lane isn't memo.

### Alternative Approach (Studio render pipeline)
- **Current:** an inline selector in StudioWorkspace that takes the ceil of the timeline seconds, plus two leaves that subscribe to the raw end (the overview extent and the transport readout).
- **Alternative A:** a `selectPreviewTimelineSeconds` helper in `preview-store.ts`. That would move layout policy (the tail constant and viewport) into preview state, which is the wrong layer.
- **Alternative B:** the lanes read the width from the store. That's a bigger change and only pays off once the lanes are memo.
- **Verdict:** the current approach is the right one for now. The formula is exactly HEAD's, so values are the same for every input. The only extra render is the one when a move crosses into the next second, which HEAD also paid for. B is the natural next step (see the proposal above).

### Score: 9/10