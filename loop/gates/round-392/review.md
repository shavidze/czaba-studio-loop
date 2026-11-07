COMMIT: OK

I'm finishing the review. I read the diff, the surrounding `ArrangementContext` code, the implementation doc and `verify.log`. I didn't re-run anything. Nothing here blocks the commit.

**What I checked**
- **Auth, purchase and download code:** untouched. The six paths are the arrangement context, strings, one test file, the strings test, the perf budgets and the doc.
- **Event ordering:** `patchSourceState` writes `latestRef.current.sourceStates` synchronously (`ArrangementContext.tsx:927-931`). The new `.then` in `decideDecodeSettle` therefore sees the `error` state in the same microtask as the failed decode.
- **Listener and timer leaks:** none added. The new code is promise continuations that write to the status store, not React state, so they are safe after unmount. Abort gives `kind: 'none'`, so a stale decode can't overwrite the new collection's status.
- **Render cost:** changing the dependency from `collection.sources` to `collection` adds no churn. `ensureDecoded` already depended on `collection`.
- **TypeScript strict:** no `any`, suppressions or assertions. `DecodeSettle` is a discriminated union.
- **Tailwind and tokens:** no styling changes.
- **Accessibility:** the status text goes through the existing status line, which I take to be a live region. I didn't confirm that from the markup in this diff.

**Findings, ranked**
1. **Low, `decoded-buffer-eviction-ui.test.tsx` (EV12 about line 725, EV22 about line 503 of the diff, EV25 about line 579 of the diff):** three `console.info("... record: ...")` calls are left in committed tests. They add noise to CI output.
   - Fix: delete them, or turn them into assertions.
   - EV22 also only asserts `not.toBe(decoding)`. A pointer-gesture settle could leave a stale or deferred preview text, and the test doesn't catch that.
   - Fix: assert `getStatusPreviewText()` explicitly once the intended behaviour is decided.
2. **Low, `ArrangementContext.tsx:1767-1776` (the Play warning):** it names the first failed clip anywhere in the arrangement, not one at or after `from`. The message can name a clip the user isn't about to hear.
   - Fix: filter by `clip.start + clip.duration > from`, or accept this deliberately, as Ableton does for missing media.
3. **Low, `perf/budgets.resources.json:38-65`:** flipping `pcm-live-decode-mib-ready` to `assert ≤ 0` depends on two GCs reclaiming every decoded buffer. That can be flaky in a real browser.
   - Evidence it's fine: the doc cites three sketches and a mutant that goes red.
   - Suggestion: watch the first few CI runs.
4. **Note, `ArrangementContext.tsx:1580-1590` (`prepareExportSources`):** the check blocks an export on any in-window clip whose source is in `error`, including sources that failed at the first load. This is intended (D-29z1326) and the message names the source. The "no clip with sound" preflight wording is already tracked as C-R391-02.
5. **Note:** the duplicated settle/status block in `startPlaybackAt` and `startLibraryPreview` is small. It is tracked in the architecture note below.

**Good practices found**
- The settle rule is a pure module-level function with one decision order: failure, then success, then none.
- The owner check happens up front, and a null owner writes `sourceNotLoaded` without a pin or decode.
- The status swap is conditional (`text === loadingText`), so it doesn't clobber later statuses.
- The tests cover supersession, collection change, a window that misses the failed clip for both WAV and MP3, and pin release.
- The implementation doc is complete, and its number 251 is unique.

**Architecture note**
- Signal: `ArrangementContext.tsx:289-304` and `1727-1760` and `1831-1870`. The decode, settle and status logic is now repeated at two call sites, in a file that already owns audio, export, history and status. This matches signal 4 (new state or lifecycle in an existing owner) and signal 3 (repeated costly changes to the region over rounds 382, 391 and 392).
- Decision: keep it for now. The logic needs `latestRef`, `ensureDecoded` and the `collectionControllerRef` owner check, so extracting it would mean a lot of plumbing. The only parts that can be pulled out cleanly are the pure `decideDecodeSettle` and the status-writing helper. Cost is low, and the risk is the Undo/Redo and gesture ordering invariants.
- Proposal for the planner (one bounded task): move `decideDecodeSettle` and a `settleDecodeStatus({awaiting, controller, loadingText, readyText, onFailed})` helper into `lib/arrangement`. The acceptance criteria are that EV3, EV9, EV12 and EV16–EV25 pass unchanged and that the `useArrangement()` shape is unchanged. This is already listed in the doc's TODO as ARCH-CHECKPOINT-DECODE-REGION. It is not a finding for this round.
- This is a review of the diff only. I did not audit the whole module.

**Score: 8.5/10**