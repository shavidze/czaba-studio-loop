## Code Review: Round 41 (D-29z6 / C-R40-01): ArrangementDetailPanel reason placement, test file, doc 038

**Verdict:** No High or Medium findings. The change matches §0.1 / §2.1–§2.3. I found 2 Low items and a few Nits. This was a static review only: I had no shell, so I didn't run git or the tests. A's artifacts say vitest 1325/1325 (= 1319 + 6), frozen suites 334/334 and Biome clean on both files. Those results agree with what I read in the files, but I did not reproduce them.

### Critical Issues
None.

### Contract compliance (`app/components/arrangement/ArrangementDetailPanel.tsx`)
- **Diff scope:** the changes are only the allowed ones: the `ReactNode` type import, the `STUDIO_SCROLLBAR_CLASS` import (l.41), the scroller `cn(…)` (l.415), the `videoClipGainReason` prop (l.160/165), the video layer (l.195–200), the two built-once nodes plus predicates (l.396–407), the middle-box classes and children (l.472–475), and the column placements (l.522, l.577).
- **Moved `<p>`s (l.399, l.404):** both keep their `id`, `data-testid`, `className="text-dim"` and text. Neither has `truncate`, `title` or any new attribute.
- **Controls unchanged:** `disabled`, `title` and `aria-describedby` on start, end, Apply, Clip Gain input and `0 dB` match the old code (l.487–558).
- **Waveform box:** its class is unchanged (l.191). The layer classes match the contract exactly. The placeholder is `<p className="text-muted" data-testid=…>` holding only `DETAIL_VIDEO_PLACEHOLDER`, and the reason is a sibling of it, not a child.
- **Middle box:** it keeps its original classes and adds `flex flex-col gap-0.5 px-2 py-1`. It stays empty in the none state.

### Predicates and a11y
- **Predicates:** `group` is typed `ArrangementDetailGroup | null` (l.77), so `group !== null` / `group === null` mean the same as the contract's truthiness checks. `clip` is null exactly when `selection` is null (l.236). So the group and none predicates only apply in the `selection ?` false branch, and the video node only reaches the waveform in the true branch. Each node renders at most once, so duplicate ids cannot happen.
- **`aria-describedby` targets always exist:**
  - The range reason exists only when `!clip`, and it renders in the middle box (group) or the range column (none).
  - The Clip Gain reason renders in the waveform (video), the middle box (group) or its column (none).
  - In the audio state both reasons are null and no control references them.

### Suggestions / findings
- **Low, red-run provenance (`tmp/studio-real-loop/a-round-41/red-run.txt:25,44,86`):** the failure traces point at test lines 247, 273 and 320. In the current file those `expect`s are at 253, 279 and 326 (`detail-panel-reason.test.tsx`), so the test file grew by 6 lines after the red run, probably from the `biome --write` pass. The per-case verdicts still match §2.3 (RF1, RF2, RF5 red; RF3, RF4, RF6 green). Still, the artifact is not a run of the shipped file. A should note this in the report, or re-run red on the final file against the old source in a scratch copy.
- **Low, record only, outside D-29z6's measured range (`ArrangementDetailPanel.tsx:191,195`):** the video reason now sits inside the waveform box, which has `overflow-hidden contain-strict` and a centred absolute layer.
  - At 1280 and 1440 it fits, per B's arithmetic.
  - Below about 1280, the middle box shrinks toward `min-w-32`. The stack then wraps beyond the visible height, `justify-center` clips both the top and the bottom, and there is no way to scroll to it.
  - The old column placement could be scrolled, and the group middle box still can be (it has no `overflow-hidden`).
  - This is not an a11y regression, because `title` and `aria-describedby` still carry the text. It is worth a line for B; it is not a change request.
- **Nit (`ArrangementDetailPanel.tsx:469`):** `selection.isVideo ? clipGainReasonNode : null` is redundant, because the node is already null for audio. It is harmless, so leave it.
- **Nit (`detail-panel-reason.test.tsx:27–28`):** `RANGE_REASON_ID` and `CLIP_GAIN_REASON_ID` hold test ids, not element ids. `*_TEST_ID` would be clearer.
- **Nit, doc (`038-studio-lab-pending-status.md:328`):** the polish line groups everything under "DOC035-NOTES და სხვა docs შენიშვნები", but EXPORT-DIALOG-FOCUS-RESTORE is not a docs item.
- **Nit, artifacts:** the timestamps don't line up. The red run is at 14:15, the live panel file's mtime is 14:16, and the snapshot file is 18:36 on the same day. C should rely on A's sha256 checks, not on these timestamps.

### Test quality (`app/lib/arrangement/__tests__/detail-panel-reason.test.tsx`)
Every §4.5 mutation (a)–(h) would make a test fail:

| Mutation | Caught by |
|---|---|
| (a) group reasons left in their columns | RF1 l.253 |
| (b) video reason left in the Clip Gain column | RF2 l.279 |
| (c) video reason inside the placeholder | RF2 l.280/281 |
| (d) none reasons moved into the middle box | RF3 l.300/306 |
| (e) no `STUDIO_SCROLLBAR_CLASS` | RF5 |
| (f) `truncate` on the Clip Gain reason | RF6 `className` check |
| (g) group order swapped | RF1 `compareDocumentPosition` |
| (h) `id` dropped from the moved Clip Gain reason | RF1 l.265/270 |

- **Duplicate rendering:** if a reason rendered in two places, `getByTestId` would find two matches and throw, so that mistake is caught too.
- **Not pinned:** the middle-box and video-layer layout classes. That fits the contract (jsdom has no layout), and C's geometry run covers them.
- **Project rules:** no `any`, no type assertions (`instanceof` guard at l.205), no comments, no timers, no snapshots.
- **Selectors:** `content.children[1]` is positional, but the contract requires it.
- **Strings:** the literals copy source constants that are not exported. That matches the sibling suites, and changing it would need a new export, which is forbidden.

### Doc 038 (`docs/implementation/2026/quarter-IV/038-studio-lab-pending-status.md`)
- The status line (l.4) and l.45 are as §2.2 asks. l.45 now says the `0 dB` row shows `შეუნახავია`, with the rest of the text in `sr-only` and `title`.
- The Round 41 section (l.228–319) has every required part: C's table, B's measurement and fit check, the state table, the scroller, the none-state rationale, rejected (a)–(g), the files, the red/green table, the C IDs and the two-row Ableton table. It matches the code, including the prop name `videoClipGainReason`.
- The test counts on l.304 match A's artifacts: frozen suites 7/22/28/24/16, 6/6 green, full run 1325.
- The TODO (l.321–329) meets every §2.2.3 point. The Georgian is good.

### Good Practices Found
- Each reason is built once and placed by state, so there is no duplicated JSX that could drift.
- The prop name `videoClipGainReason` is easier to find by search than the suggested `videoReason`.
- The tests are strong must-not guards, especially RF4 (no `p` in the audio waveform) and RF3 (`childElementCount === 0`).
- Security: none of this touches XSS, tokens or input handling.

### Alternative Approach
- Current: place the reasons by state (middle box for group, waveform for video, columns for none) and use the Studio scrollbar.
- Alternative: rejected options (a)–(g) of D-29z6.
- Verdict: the current approach is right for the measured viewports. The only open point is the narrow-width Low item above.

### Score: 9/10
