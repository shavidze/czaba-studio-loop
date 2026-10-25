COMMIT: OK (diff is display-only typography: nothing touches auth/purchase/download, no new hooks or listeners, visible text unchanged byte for byte; C-156 PASS, verify 170 files / 2523 tests and build green)

## Code Review: round 156 — V-2b-3a, timecodes inside sentences rendered in mono

### Critical Issues
- None.

### Findings (ranked, all Low, none block the commit)
1. **`StudioWorkspace.tsx:2570` + `ArrangementClip.tsx:934` — mono digits are wider.** The selected-clip line (`truncate`) and the clip range badge (`whitespace-nowrap`) may now cut off sooner. C round 156 tested this in the browser (LAYOUT-FIT) and it passed. **Fix:** nothing now. If a clip shorter than the badge needs it, fall back to `max-w-full truncate` on the badge.
2. **`ArrangementLane.tsx:895` (drop ghost) and `ArrangementVideoDock.tsx:229` (video gap) have no DOM-level class test.** Only TH11's source count protects them. **Fix (for B):** one `getByTestId('arrangement-video-gap').querySelector('span')?.className` check. For the ghost, add a check in the existing library-drop test.
3. **TH11 (`studio-theme-obsidian.test.tsx:~461–481`) is brittle on purpose.** It counts the exact string `className="font-mono font-normal tabular-nums"` per file. Reordering the classes or moving them into a constant breaks it. **Fix:** nothing now. Note it in the V-2b-3b task so whoever changes the class string knows to update TH11.
4. **`strings.ts:552–557` — `studioWorkspaceStrings.rangeReadout` and `selectedClipDetail` are no longer used by production code.** Only tests call them (TH11 asserts zero calls in StudioWorkspace). `selectedClipTitle` is still used for the `title` attribute. **Fix:** keep them as the test's reference text for now. In V-2b-3b, decide whether to remove them or mark them test-only.
5. **`tabular-nums` appears twice on some sites.** The new span repeats the parent `<p>`'s `tabular-nums` (`StudioWorkspace.tsx:2545/2570`, `ArrangementVideoDock.tsx:225`). It does no harm, and TH11 depends on the single class string. **Fix:** none.
6. **`docs/implementation/.../126-…md:4` still says "In Progress (awaiting C round 156)".** This matches the existing convention: 125 is only flipped to Completed in this round. It should be updated in the next round.

### Focus-area checks
- **Auth/purchase/download:** untouched. All 12 paths are `app/components/arrangement/*`, `app/lib/arrangement/*` or `docs/implementation/*`.
- **Listener/timer leaks and event order:** `ArrangementTimeText.tsx` has no hooks or state. The VideoDock span keeps the same `ref` and the same `useArrangementPositionWriter` callback; only a className was added. The imperative `textContent` write replaces the children but keeps the class on the span. No new effects, listeners or timers anywhere in the diff.
- **Text identical byte for byte:** I traced the JSX spacing by hand at `ArrangementClip.tsx:934–941` and `ArrangementLane.tsx:1009–1016`. `</span>{' '}`, then `–{' '}`, then `· {…}` gives exactly `"a – b · 2.000 s"`. Tests CSU1 and WSU3–5 also check this. ST-TP1 now compares against literal strings, so it is no longer comparing the code with itself.
- **Render cost:** about 13 small objects per `StudioWorkspace` render, and the readout is now ~7 nodes instead of 1. Negligible. The footer doesn't re-render on every playhead tick (position updates go through the imperative writer), so this isn't on the playback-hot path.
- **Accessibility:** inline spans and Fragments keep the reading order. `title`, `aria-*` and the `aria-live` status were not touched. The `title` attribute is still built from the same parts, so it matches the visible line (WSU4 checks this).
- **Tailwind/tokens:** `font-mono` comes from the `--font-mono` token (`app.css:3940`, IBM Plex Mono). No custom CSS, no hard-coded colours. `font-normal` stops Plex Mono 500 from being picked up inside `font-medium` containers (the C-R154-01 lesson).
- **TS strict:** no `any`, no suppression comments, no type assertions. `StudioTimeTextPart` has explicit types and React keys are stable `id`s.
- **forwardRef:** `ArrangementTimeText` returns a Fragment and renders no DOM element of its own. The `FORWARDREF_COMPONENT.md` templates only cover components that render DOM elements, so this is a reasonable, documented exception.

### Good Practices Found
- The parts builder is the single source of the text. The visible line and the `title` attribute both come from it, so they can't drift apart.
- Mutations m143–m146 show the tests check the mono spans, not just the text.
- The VideoDock change is minimal and keeps the imperative update path the same.

### Architecture note
- **Signal 2 (coupling) — `strings.ts:514–542`.** `lib/` now holds a presentation-shaped type (the `isTime` flag) for one component. **Keep, because** there are only two builders and it keeps the visible text and `title` identical. **Proposal for planner:** when V-2b-3b adds the Export sites, decide whether the parts builders stay in `strings.ts` or move to a sibling `strings-parts.ts`, so `strings.ts` stays plain text. Acceptance: ST-TP1–3 and TH11 stay green unchanged.
- **Possible signal 3 — `StudioWorkspace.tsx:2544–2588` (footer readouts).** The typography rounds keep touching this region, and each change needs a full-workspace mount test. I only have this round's diff as evidence, so this is a one-line backlog note, not a checkpoint request. **Keep** for now.
- This is a review of this round's diff only, not a full audit of the module.

### Alternative Approach
- **Current:** `studioTimeTextParts` returns typed parts and `ArrangementTimeText` renders them, wrapping only the timecodes in mono spans.
- **Alternative:** a single `<ArrangementTimecode value={seconds} />` component placed directly in each sentence's JSX, with no parts layer.
- **Verdict:** the current approach is better for the two footer sentences. With the alternative, the visible text and the `title` text would be built in two places and could drift apart. For the single-timecode sites (Lane, Clip, VideoDock) the alternative fits better; a small `ArrangementTimecode` component there could later replace the repeated class string. That would be a V-2b-3b proposal, not something to change now.

### Score: 9/10