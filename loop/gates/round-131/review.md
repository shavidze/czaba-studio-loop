COMMIT: OK

The diff only moves text into one place. The video import messages now come from a single new `studioVideoStrings` object instead of being written inline, and the flow itself is unchanged. Nothing touches auth, purchase or download code: the changed files are `ArrangementContext.tsx`, `strings.ts`, `video.ts`, `video.client.ts`, their tests and two docs.

## Code Review: round 131 — V-0.2c1 video import strings

### Critical Issues
- None.
  - **Behaviour:** In `ArrangementContext.tsx` around lines 2228–2326, only the five text expressions changed. The checks, their order, the abort and early-return paths, the history entry, the seek, the decode chain, the timeout and `classifyVideoFile` are the same as before.
  - **Old text used as a key:** I searched the repo for every old Georgian text, leaving out docs. Nothing in app code, e2e tests or Playwright selectors still matches on it, and no code compares `error.message` against a fixed string. So the cancel messages (`probeCancelled`, `decodeCancelled`) are display-only.
  - **Imports:** `strings.ts` still imports nothing. `video.ts` and `video.client.ts` import from it, so there is no import cycle and no change to which code runs only in the browser. `soundUnreadable` reuses the existing Export text (`studioExportStrings.videoSoundUnreadable`, line 34), so the two can't drift apart.
  - **Gates:** `verify.log` shows 159/159 test files passing, the build succeeding, and the agents check passing.

### Suggestions (ranked)
1. **Awkward copy** in `app/lib/arrangement/strings.ts:238–239` (`audioFileRejected`): "audio files cannot be added here — only your own video can; sounds are added from the library." "only your own video can" doesn't read well. Suggested: `“${name}”: audio files can't be added here — you can only add your own video; sounds come from the library.` If you change it, update ST15, VI3 and the doc's mapping table row V6. Low priority.
2. **The new test leaves a patched global behind.** `app/lib/arrangement/__tests__/video-import-status-ui.test.tsx:161–165` replaces `URL.revokeObjectURL` with `Object.defineProperty`. `vi.restoreAllMocks()` / `unstubAllGlobals()` don't undo that. Vitest runs each file separately, so nothing leaks today. Fix: save the original in `beforeEach` and put it back in `afterEach`. Low priority.
3. **VI1–VI4 check the context's `status` value, not the screen-reader announcement.** The test doesn't confirm that "Opening …" followed by "… added …" is actually announced through the live region in the right order. `status-announcement-ui.test.tsx` covers that mechanism in general, and C's browser checks (VID-ADD, VID-NOAUDIO) cover it in practice. Optional: add one DOM test on the live region for VI1. Low priority.
4. **Mixed languages on screen for now.** `ArrangementLane.tsx:853/864/889` and `ArrangementVideoDock.tsx` still show Georgian next to the new English status lines; `selection.ts:39` and `groups.ts:476` are also still Georgian. This is planned and tracked (GATE128-S1, V-0.2c3, V-0.4), so it's not a blocker. One wording to keep in mind: the lane hint `ჩააგდე ვიდეოხაზზე` and the new `dropOnVideoTrack` text should end up with the same English wording in V-0.4.
5. **Raw error text is still shown to the user.** `importFailed(error instanceof Error ? error.message : String(error))` at Context ~2326 displays whatever the error says. This was already the case before this diff, and React escapes it, so there is no XSS risk. If an unexpected error ever comes through, it would appear as raw text in an otherwise English UI. A later stage could swap it for a generic message.

### Good Practices Found
- The exported function names and signatures stayed the same (`audioFileRejectionMessage`, `unsupportedFileMessage`, `videoProbeErrorMessage`, `videoAudioNote`), so no caller had to change.
- The new UI test checks hand-written English text rather than values built from the strings module (GATE130-S3). It would catch an accidental template change, and the mutation runs in doc 107 show it does.
- ST16 scans `video.ts` and `video.client.ts`, with comments stripped, for Georgian characters, which guards against regressions.
- `added()` takes times that are already formatted, the same pattern as V-0.2b.
- TypeScript is strict throughout: no `any`, no type assertions, explicit return types on every formatter. The mocks are typed with `vi.mocked`.
- No new state, effects, timers or listeners were added.
- No styling was touched, so Tailwind and design tokens don't apply.

### Architecture note
- **Signal 3 (one region changed repeatedly):** `strings.ts`, the test list at `strings.test.ts:662`, and the text expressions in `ArrangementContext.tsx` have changed in rounds 128, 129, 130 and 131. Keep as is: each round is a narrow swap of text, and the shrinking list (now 4 lines) is meant to shrink, so there's no structural harm yet.
- **Proposal for the planner** (already queued in `b-round-130-checkpoint-request.md`): after V-0.2c3, have `frontend-architect` decide two things:
  - whether `strings.ts`, now 7 objects and growing, should become one file per area under `lib/arrangement/strings/`, keeping the same exported names;
  - whether branching text like `videoAudioNote(reason)` should move into a formatter.
  
  Acceptance: no caller changes, ST1–ST16 still pass, and `useArrangement()` keeps the same shape.
- No signals 1, 2 or 4 in this diff. This review covers the diff only, not the whole module.

### Alternative Approach
Not applicable: this round doesn't touch auth, checkout or Studio audio logic.

### Score: 9/10