COMMIT: OK

I found no blocking issues. The diff touches no auth, purchase, download, token, `dangerouslySetInnerHTML` or Tailwind/token code. I read the full diff and traced its dock readers by static review. I did not run the app in a browser. For real-browser event ordering, C's PASS and the verify log are what cover the jsdom tests.

**Findings, ranked (none blocking)**

1. **Low, `perf/budgets.interactions.json` (notes of the five rows now `assert`).** The notes still say "Record until c5-ii moves the video preview off history…" and then add "Asserted since…". The first sentence is stale and contradicts the mode. Fix: drop the "Record until…" sentence from those five notes.
2. **Low, `docs/implementation/.../232-perf-drag-preview.md` item 71.** It still reads "c5-ii … გადადის" as a future step, while item 72 onward describes it as done. The "Problem" bullet for c5-ii also says the dock "ვერაფერს გაჰყვებოდა". Fix: change item 71 to past tense or point it at 72–77.
3. **Low, `ArrangementVideoDock.tsx:195-198` and `:322`.** The video `track.id` lookup runs twice, once in `useVideoLaneArrangement` and once in the component body. It is a cheap `find` and harmless. Fix: pass `videoTrackId` into the hook, or leave it as is.
4. **Informational, `ArrangementVideoDock.tsx:196`.** The `''` sentinel for a missing video track relies on no clip having `trackId === ''`. This is safe today. A type-level `string | null` check would make it explicit if the selector ever allows it.

**What I checked and found correct**

- **Dock readers:** `video.ts:93-97`, `video-sync.ts:75-79` and `video-fades.ts` read only `tracks` and clips on the video lane. Swapping `arrangement` for `{...arrangement, clips: videoLaneClips}` therefore loses nothing. The `hasVideoClips` check stays on the committed state, which is safe because edits are refused during a gesture.
- **Render cost:** `useShallow` over the filtered lane array keeps the dock from re-rendering on audio drags (DP60). The `useMemo` on `[arrangement, videoLaneClips]` keeps the object stable for the stopped-sync effect deps. The fade overlay's layout effect only re-runs when the lane changes.
- **Listeners and timers:** the diff adds no new listeners or timers. The stopped-sync effect keeps its existing `subscribePosition` cleanup, and only its dependency changed.
- **Video fade readout:** it now goes through `previewStatus`, the same path audio fades use. Cancel and release are covered by DP13 and DP61, and no stale status stays behind.
- **Removed `hasVideo` and `previewGroup`:** this removes the third preview path, which was the ARCH-R343 signal. `endStaleClipGesture` still resets through `previewArrangement`, which also clears the store.
- **Undo atomicity:** the tests assert a single "Move clip", "Move (2)" or "Video Fade In" entry per gesture. Undo restores the original value, and cancel adds no entry.
- **TypeScript strict:** no `any`, suppression comments or type assertions in the production diff. The `if (!shown) throw` pattern in the tests is correct.
- **Budgets:** moving the five rows to `assert` is justified by B's sketch numbers (23.617 against a ceiling of 24, HEAD at 98.35) and by the mutant evidence the doc records. The `move-components-max` rows stay `record`.

**Architecture note**

- **Signal: new state/lifecycle in an existing owner, `ArrangementVideoDock.tsx:195-198,324` → keep.**
  - The dock is the one owner that needs a preview-aware video-lane view. The hook is local, takes one prop, and leaves the public `useArrangement()` shape unchanged.
  - It adds no timers or refs, so audio timing, the gesture lifecycle and Undo/Redo are untouched.
  - Extracting it would add prop plumbing for no gain.
- **Signal: repeated costly change to one region, `ArrangementClip.tsx` gesture handlers (the `handlePointerMove` branches).** This region has changed in rounds 343, 344 and 345. This round removed a path, so it got simpler.
  - Proposal for the planner: only if another stage touches it, open one bounded task to extract the pure "preview write target" decision from the move, trim and fade branches. Acceptance would be DP9b, DP13, DP53 and DP57–DP62 unchanged and green.
  - Cost: medium, with risk in gesture ordering. I recommend keeping it as is for now.
- This is a review of the diff, not a full audit of the module.

### Score: 9/10