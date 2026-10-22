## (a) app/components/arrangement/StudioWorkspace.tsx
- replaced: `() => visibleTrackGroupRows(allTrackRows, trackLaneLayout.collapsedGroups),`
- result: ['Tests  13 failed | 14 passed (27)'] exit=1
- red tests: ['UC1 the fold button hides the member lanes, shows an overview and writes no history', 'UC10 a clip dragged onto a collapsed group row keeps its music lane target', 'UC10b a marquee across a collapsed middle group never selects its hidden clips', 'UC2 U and the fold button are refused during a pointer gesture and a pending fader preview', 'UC2 U is ignored in text fields, with modifiers and while repeating', 'UC2 plain U toggles the selected groups and refuses a track-only selection', 'UC3 a collapsed group nested by Ctrl+G stays collapsed and ungrouping shows its children', 'UC3 nested collapse keeps the inner group collapsed when the outer one expands', 'UC4 F3 a collapse moves focus from a hidden lane to the collapsing group name', 'UC4 hidden lane controls are unreachable and the collapsed label carries the clip count', 'UC6 auto-fit uses the visible lanes only and writes heights back by track id', 'UC6 nested: an outer collapse leaves one lane and one group row to fit', 'UC8 Undo shows the lanes, Redo restores the collapsed group without pruning']
- restored + cmp identical: True

## (b) app/lib/arrangement/groups.ts
- replaced: `if (row.kind === 'group' && (hidden || collapsedGroups[row.id] === true)) {`
- result: ['Tests  2 failed | 25 passed (27)'] exit=1
- red tests: ['GC1 nesting hides every descendant and keeps the inner collapse state', 'UC6 nested: an outer collapse leaves one lane and one group row to fit']
- restored + cmp identical: True

## (c) app/components/arrangement/StudioWorkspace.tsx
- replaced: `const lanes = trackLaneFitEntries(tracks, previous.folded);`
- result: ['Tests  2 failed | 25 passed (27)'] exit=1
- red tests: ['UC6 auto-fit uses the visible lanes only and writes heights back by track id', 'UC6 nested: an outer collapse leaves one lane and one group row to fit']
- restored + cmp identical: True

## (d) app/components/arrangement/StudioWorkspace.tsx
- replaced: `fittedById.get(track.id) ?? previous.heights[track.id]`
- result: ['Tests  1 failed | 26 passed (27)'] exit=1
- red tests: ['UC6 auto-fit uses the visible lanes only and writes heights back by track id']
- restored + cmp identical: True

## (e) app/components/arrangement/StudioWorkspace.tsx
- replaced: `if (clipIds.some((id) => hiddenClipIds.has(id))) {`
- result: ['Tests  1 failed | 26 passed (27)'] exit=1
- red tests: ['UC5 collapsing prunes hidden clip, row and lane-range selections, keeps an all-lanes range']
- restored + cmp identical: True

## (f) app/components/arrangement/StudioWorkspace.tsx
- replaced: `const handleKeyDown = (event: KeyboardEvent) => {`
- result: ['Tests  1 failed | 26 passed (27)'] exit=1
- red tests: ['UC2 U is ignored in text fields, with modifiers and while repeating']
- restored + cmp identical: True

## (g) app/components/arrangement/StudioWorkspace.tsx
- replaced: `pendingRowFocusRef.current = result.childIds[0];`
- result: ['Tests  2 failed | 25 passed (27)'] exit=1
- red tests: ['UC8 Undo shows the lanes, Redo restores the collapsed group without pruning', 'UC9 F1 from BODY, and F2 after Ctrl+Shift+G focus lands on the first child, never BODY']
- restored + cmp identical: True

## (h) app/lib/arrangement/groups.ts
- replaced: `start: clip.start,`
- result: ['Tests  2 failed | 25 passed (27)'] exit=1
- red tests: ['GC2 overview blocks list the clips on every descendant track with exact times', 'UC1 the fold button hides the member lanes, shows an overview and writes no history']
- restored + cmp identical: True

## (i) first attempt (no-op mutation, discarded)
- `commitArrangement({ ...arrangementNow })` is a no-op in applyEdit (identical arrangement), so it wrote no history; 27/27 green. Re-run below with a real history write.

## (i) app/components/arrangement/StudioWorkspace.tsx
- replaced: `if (hiddenIds.size === 0) {
        return;
      }
      if (focusHidden) {`
- result: ['Tests  3 failed | 24 passed (27)'] exit=1
- red tests: ['UC1 the fold button hides the member lanes, shows an overview and writes no history', 'UC11 collapsing while playing restarts no sources and leaves the arrangement untouched', 'UC8 Undo shows the lanes, Redo restores the collapsed group without pruning']
- restored + cmp identical: True
- note (i): the re-run mutation adds an extra `master.volume` field (vitest does not typecheck) only so the arrangement differs and a real history entry is written.

# Re-run on final code (after code-review fixes)

## (a) app/components/arrangement/StudioWorkspace.tsx
- replaced: `() => visibleTrackGroupRows(allTrackRows, trackLaneLayout.collapsedGroups),`
- result: ['Tests  15 failed | 14 passed (29)'] exit=1
- red tests: ['UC1 Space on the focused fold button toggles the group and does not start playback', 'UC1 the fold button hides the member lanes, shows an overview and writes no history', 'UC10 a clip dragged onto a collapsed group row keeps its music lane target', 'UC10b a marquee across a collapsed middle group never selects its hidden clips', 'UC2 U and the fold button are refused during a pointer gesture and a pending fader preview', 'UC2 U is ignored in text fields, with modifiers and while repeating', 'UC2 plain U toggles the selected groups and refuses a track-only selection', 'UC3 a collapsed group nested by Ctrl+G stays collapsed and ungrouping shows its children', 'UC3 nested collapse keeps the inner group collapsed when the outer one expands', 'UC4 F3 a collapse moves focus from a hidden lane to the collapsing group name', 'UC4 hidden lane controls are unreachable and the collapsed label carries the clip count', 'UC6 a hidden lane keeps its manual height across collapse and expand', 'UC6 auto-fit uses the visible lanes only and writes heights back by track id', 'UC6 nested: an outer collapse leaves one lane and one group row to fit', 'UC8 Undo shows the lanes, Redo restores the collapsed group without pruning']
- restored + cmp identical: True

## (b) app/lib/arrangement/groups.ts
- replaced: `if (row.kind === 'group' && (hidden || collapsedGroups[row.id] === true)) {`
- result: ['Tests  2 failed | 27 passed (29)'] exit=1
- red tests: ['GC1 nesting hides every descendant and keeps the inner collapse state', 'UC6 nested: an outer collapse leaves one lane and one group row to fit']
- restored + cmp identical: True

## (c) app/components/arrangement/StudioWorkspace.tsx
- replaced: `const lanes = trackLaneFitEntries(tracks, previous.folded);`
- result: ['Tests  2 failed | 27 passed (29)'] exit=1
- red tests: ['UC6 auto-fit uses the visible lanes only and writes heights back by track id', 'UC6 nested: an outer collapse leaves one lane and one group row to fit']
- restored + cmp identical: True

## (d) app/components/arrangement/StudioWorkspace.tsx
- replaced: `fittedById.get(track.id) ?? previous.heights[track.id]`
- result: ['Tests  1 failed | 28 passed (29)'] exit=1
- red tests: ['UC6 auto-fit uses the visible lanes only and writes heights back by track id']
- restored + cmp identical: True

## (e) app/components/arrangement/StudioWorkspace.tsx
- replaced: `if (clipIds.some((id) => hiddenClipIds.has(id))) {`
- result: ['Tests  1 failed | 28 passed (29)'] exit=1
- red tests: ['UC5 collapsing prunes hidden clip, row and lane-range selections, keeps an all-lanes range']
- restored + cmp identical: True

## (f) app/components/arrangement/StudioWorkspace.tsx
- replaced: `const handleKeyDown = (event: KeyboardEvent) => {`
- result: ['Tests  1 failed | 28 passed (29)'] exit=1
- red tests: ['UC2 U is ignored in text fields, with modifiers and while repeating']
- restored + cmp identical: True

## (g) app/components/arrangement/StudioWorkspace.tsx
- replaced: `pendingRowFocusRef.current = result.childIds[0];`
- result: ['Tests  2 failed | 27 passed (29)'] exit=1
- red tests: ['UC8 Undo shows the lanes, Redo restores the collapsed group without pruning', 'UC9 F1 from BODY, and F2 after Ctrl+Shift+G focus lands on the first child, never BODY']
- restored + cmp identical: True

## (h) app/lib/arrangement/groups.ts
- replaced: `start: clip.start,`
- result: ['Tests  2 failed | 27 passed (29)'] exit=1
- red tests: ['GC2 overview blocks list the clips on every descendant track with exact times', 'UC1 the fold button hides the member lanes, shows an overview and writes no history']
- restored + cmp identical: True

## (i) app/components/arrangement/StudioWorkspace.tsx
- replaced: `if (hiddenIds.size === 0) {
        return;
      }
      if (focusHidden) {`
- result: ['Tests  3 failed | 26 passed (29)'] exit=1
- red tests: ['UC1 the fold button hides the member lanes, shows an overview and writes no history', 'UC11 collapsing while playing restarts no sources and leaves the arrangement untouched', 'UC8 Undo shows the lanes, Redo restores the collapsed group without pruning']
- restored + cmp identical: True
