Review is done and the verify log confirms it: 2980 tests passed, Biome and the build are clean. Here is the verdict.

COMMIT: OK

## Code Review: CALM-2a: helper text moved off the timeline canvas and video dock (round 229, 16 paths)

The candidate makes no change to auth, purchase or download code. No new listeners, timers, effects, refs, `any`, type assertions or suppression directives. Overall render cost goes down slightly: one empty-state span, one text paragraph and the label span are gone. I grepped the whole repo outside `node_modules` for the six deleted strings and the `TEMPO_EMPTY_HINT` export. Only negative assertions in tests and historical docs still mention them, so no e2e spec or other code still uses them.

### Critical Issues
- none

### Suggestions (ranked)
1. **The reason a disabled button can't be used now only shows on hover**: `app/components/arrangement/ArrangementTransport.tsx:232-238`. "Loop: make a time selection first (Ctrl+L)" now lives only in the `title` of a `disabled` button. A disabled button can't take keyboard focus, so keyboard and screen-reader users can't get this reason any more. Before, it was visible text in the loop strip. Not every browser shows the tooltip on disabled controls, so check it in Chrome, Firefox and Safari. This matches the existing `zoomToSelectionNeedsRangeTitle` pattern (`strings.ts:352`) and Saba's decision 2, so it doesn't block the commit. **Fix (later round, for the planner):** switch the Loop and Zoom-to-selection buttons together from `disabled` to `aria-disabled="true"` plus an early return in the click handler. That keeps them focusable so the description can be read. Alternatively, on Ctrl+L with no selection, give a one-time status like the existing `zoomNeedsSelection` (`strings.ts:365`). Do both buttons in one change so the pattern stays the same.
2. **Leftover layout class**: `app/components/arrangement/ArrangementVideoDock.tsx:889`. The row has only one child now, so `justify-between` (and `gap-2`) do nothing. **Fix:** remove them. `flex-1 text-right` on the caption already handles alignment. Low priority.
3. **Tooltip text repeats the button's name**: `app/components/arrangement/ArrangementLane.tsx:645` and `:663`. For video tracks, `title` now equals the `aria-label` exactly (`Mute — Original video sound`, `soloLabel(mixLabel)`). Browsers drop a description that matches the name, so there's no harm to screen readers. But for video, Solo's title now comes from `soloLabel`, while audio tracks get it from `soloTitle`. That's two sources for one kind of string. **Fix (optional):** add `videoSoloTitle` to `studioLaneStrings`, built from `STUDIO_VIDEO_MIX_LABEL` the same way as `videoMuteTitle`, so the video M/S/Volume titles come from one place.
4. **Layout only checked in a real browser**: the 16 px height that `min-h-4` (`ArrangementVideoDock.tsx:889`) keeps when the caption is empty is only covered by C-BBOX-229 (jsdom doesn't compute layout). C reported the round as PASS. Before the commit, root should confirm that the bbox evidence covers both an empty caption and a long, truncated file name.
5. **Empty-state overlay still blocks the pointer**: `ArrangementVideoDock.tsx:954-957`. The empty `div` is still `absolute inset-0 z-20` and catches the pointer, just like the old `<p>`, so drag and float behaviour is unchanged. That's fine, but say so in the doc: the claim that "nothing changed" depends on it.

### Good Practices Found
- `STUDIO_VIDEO_MIX_LABEL` is one constant behind both `videoMixLabel` and `videoMuteTitle`. ST-C2a pins both the literal and how it's built.
- `needsSelectionTitle` goes through `studioShortcutTitle(…, 'loop')`, and NS6 checks the shortcut suffix against the shortcut table. So the shortcut text can't drift.
- Deleted keys are asserted absent with `'key' in obj`. The implementation doc names the vacuous `undefined === undefined` trap in T10 and avoids it.
- The loop strip keeps its fixed `h-4` (`ArrangementLoopBrace.tsx:222`), so removing the hint doesn't move the layout.
- Audio-track titles are pinned as unchanged in LSU8, which guards against regressions.
- Tailwind tokens only; no hardcoded colours.

### Architecture note
- none. The diff only removes copy and touches strings. No new state, lifecycle or ownership change. `ArrangementVideoDock.tsx` is large, but file size alone is not a signal, and this round makes it smaller.

### Alternative Approach (Loop availability, interaction logic)
- **Current:** a `disabled` button with a three-state `title`.
- **Alternative:** `aria-disabled` plus a one-time status on activation (as in suggestion 1).
- **Verdict:** the current approach is fine for this round. It's consistent with Zoom-to-selection and keeps Saba's calm canvas. The alternative is better for accessibility, but it should be planned as one change covering both buttons, not patched into this commit.

### Score: 8.5/10