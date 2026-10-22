COMMIT: OK. Nothing in this round needs fixing before the commit. All findings below are follow-ups.

## Code Review: round-85 (range export + track-header stacking)

This reviews the diff only, not the whole module. Auth, purchase and protected-download code is not touched. The only download is the local blob anchor in `exportWav`, which already existed. No `any`, no suppression comments, no type assertions, and every colour class is a design token (`text-dim`, `border-outline` and `bg-brand/10` all exist in `app.css`). The verify log shows 0 failures and a passing build.

### Critical Issues
- None.

### Suggestions (most important first)
1. **A range past the end of the project exports silence with no warning.** `ArrangementExportDialog.tsx:337`: the "no sounding clip" note uses `hasSoundingClip`, which looks at the whole project. If the selected range is entirely after the last clip, or covers only muted clips, the user gets a fully silent `-range.wav` and no note. **Fix:** in range scope, also check that at least one audible clip overlaps `[rangeStart, rangeEnd)`, for example with `planSchedule(arrangement, rangeStart, rangeEnd).length > 0` inside a `useMemo`, and reuse the existing silence note.
2. **The reason text isn't linked to its radio for screen readers.** `ArrangementExportDialog.tsx:129-149`: the disabled range radio shows `EXPORT_RANGE_MISSING_REASON`, but nothing connects the two. **Fix:** give the reason span an `id` and set `aria-describedby` on the radio when `!hasValidRange`. This doesn't change the focus order, so the frozen C-R14-02 test (which counts exactly 4 enabled controls) is unaffected.
3. **The 0.001 s minimum is written in two places.** The dialog has `EXPORT_RANGE_MIN_SECONDS` (line 23), and the context repeats `0.001` as a literal (`ArrangementContext.tsx:2678`). The guard's error message is also an inline string. **Fix:** export one constant, plus a small validity check, from `graph.client.ts` (next to `ArrangementRenderWindow`) and use it in both places.
4. **`renderArrangementWav` doesn't check the window itself.** `graph.client.ts:441`: if a caller passes an inverted window, `length` is negative and `OfflineAudioContext` throws a native `NotSupportedError` with an English message. Today only the context calls it, and the context guards the window. A one-line throw with the Georgian message would make the lib safe for other callers.
5. **The scope reset runs one frame late.** `ArrangementExportDialog.tsx:119-123`: `setScopeChoice(null)` runs in an effect after close, so it costs one extra render. It works and can't be seen while the dialog is closed. Resetting it in `onClose`, or keying the body on `isOpen`, would avoid the extra render. Low priority.
6. **Page-level browser check, not covered by jsdom.** `ArrangementLane.tsx:779`: `isolate` turns every lane body into its own layer, which is what keeps clip handles under the sticky header. I checked what sits inside the lane body. The grid and marker menus render elsewhere (StudioWorkspace, and a portal in MarkerRow), and the dock's `fixed z-40` is outside the lane, so none of them gets trapped. C's browser rows M1-* should still confirm that a selected clip's handles in row N aren't covered by row N+1 when a fade is dragged close to the row boundary.

### Good Practices Found
- When no window is passed, the call is byte-for-byte the old one: `planSchedule(arrangement, 0)` and length `ceil`. That keeps the frozen literal tests and the old 2-argument mock calls valid.
- The window path reuses the same mid-start mapping as live playback (`from = start`, `startAt = 0`). So clips, fades and envelopes that start before the window come in at the correct offset and mid-value. I checked this in `scheduleClipFadeGain` and `scheduleClipEnvelopeGain`.
- The validity check sits before the rendering state, so an invalid window produces no download and no stuck "rendering" phase.
- `round` vs `ceil` is explained in doc 075 with a frame-count reason.
- Taking min/max of the range handles ranges dragged right-to-left.
- No new listeners, timers or object URLs. The existing `revokeObjectURL` call covers the range file too.

### Architecture note
- Signal 4 (new state/lifecycle in an existing owner), `ArrangementExportDialog.tsx:38-49,119-123`: the dialog now owns the range check, the scope state and its reset on close, alongside focus trap and export state. **Keep, because** it all lives and dies with the dialog, and splitting it out would only add props to pass through.
- Signal 2 (ownership/coupling), `ArrangementContext.tsx:2674` ↔ `ArrangementExportDialog.tsx:40`: the range-validity rule is duplicated between the context and the component. **Proposal for the planner (not current scope):** own `isValidRenderWindow` plus the constant in `lib/arrangement/graph.client.ts` and use it from both places. Acceptance: the XU and XR tests are unchanged and green; no change to the `useArrangement()` shape. Cost is low.

### Alternative Approach
- **Current:** the window comes from the existing Arrangement range. If a valid range exists, the dialog defaults to "range" on every open; otherwise it uses the whole project. The whole thing is rendered at the window's length with `from = start`.
- **Alternative:** always default to the whole project and make the user tick "range" explicitly (or add typed Start/Length fields, as in Ableton).
- **Verdict:** keep the current approach. It matches Ableton Live 12 §5.1.3.1, which doc 075 cites, and the description, the notes and the file name (`-range.wav`) all show the range clearly. That means an accidental export of a stale selection is easy to spot and cheap to fix. Rendering only the window costs less memory and time than rendering everything and trimming. Finding #1 above is the only gap in the UX.

### Score: 8.5/10