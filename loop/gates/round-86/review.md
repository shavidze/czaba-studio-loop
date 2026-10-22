COMMIT: OK

## Code Review: SRW-20 stage 2 (MP3 and WAV + MP3 export) and the X1 range fix, round 86

I found nothing that blocks this commit. `verify.log` shows 126 test files and 2068 tests passing, plus typecheck and build. C's real-browser rows passed at both viewports. This change does not touch any auth, purchase or download code: `ffmpeg.ts`, `StudioContext` and the auth files are unchanged, C confirmed `ffmpeg.ts` hash `0995ae78`, and C's protection rows passed.

This is a review of the diff only. I did not review the whole module.

### Critical Issues
- None.

### Suggestions (most important first)
1. **Medium: retrying after a timeout hits an existing timer leak in `app/utils/ffmpeg.ts:19-28`.**
   - When a load is already in progress, `loadFFmpeg()` waits with a `setInterval` that only stops if loading succeeds. If the load hangs, `isLoading` is never reset, because only the `catch` resets it.
   - The new 120 s timeout (`ArrangementContext.tsx` around lines 2756-2765) is the first path that hands control back to the user while that load is still pending. Each retry adds one 100 ms interval that never stops, and each retry times out again.
   - The error message already says to reload the page, and doc 076 records this as FFMPEG-LOAD-POLLER-HANG (line 110). MX6 mocks `~/utils/ffmpeg`, so the tests cannot see this.
   - **Fix (separate task with the Studio owner):** on timeout or abort, clear the interval and reset `isLoading`, or have `loadFFmpeg` accept an `AbortSignal`.
2. **Low-medium: the WAV + MP3 note promises more than the browser guarantees.**
   - The note "ან ორივე შეიქმნება, ან არცერთი" (`ArrangementExportDialog.tsx:37`) is true for rendering and encoding, not for delivery.
   - The two `anchor.click()` calls run back to back (`ArrangementContext.tsx` around lines 2810-2817). C saw both files arrive, but in Playwright Chromium, which accepts multiple downloads without asking. In a normal Chrome window the second file can trigger an "allow multiple downloads" prompt, and Safari may drop it. Then only the WAV arrives while the message says both were created.
   - It is already listed in doc 076 (line 111).
   - **Fix:** reword the note to say the encoding happens together and the WAV downloads first, or add the possible browser prompt to the done message.
3. **Low: the 120 s timeout doesn't cover `import('~/utils/ffmpeg')` or `convertWavToMp3`.**
   - If the chunk import hangs, the dialog stays in `rendering` with Close disabled and no limit.
   - A late download can still happen after unmount, the same as in `exportWav`.
   - Doc 076 (line 108) defers both to stage 3 (cancel / AbortController). I agree, as long as stage 3 actually includes them.
4. **Low: the format radios aren't disabled while an export runs, but the scope radios are** (`ArrangementExportDialog.tsx` around lines 243-293 vs 308/329).
   - C's EXTRA-FORMAT-SWITCH-DURING-MP3 row shows the running export isn't affected. Still, the two groups behave differently during an export.
   - **Fix:** add `disabled={isRendering}` to the three format radios.
5. **Not yet verified: MP3 export from the production bundle.** C says the built bundle was not run because there is no preview server in the cloud. `optimizeDeps.exclude` only affects dev. The production chunk is the same one `StudioContext.tsx:25` already ships, so the risk is small, but it remains unchecked.

### Good Practices Found
- **`render-window.ts`:** removes the third copy of the window-validation check, and it has its own unit tests.
- **Timeout cleanup:** `finally { window.clearTimeout(loadTimer) }` clears the timer on every exit, including when the import throws.
- **Encoder loading:** the encoder loads only through a dynamic import. MP-NET confirms no unpkg requests before the first MP3 click, and none after a WAV export.
- **X1 fix:** the project scope radio is no longer disabled when there is no range.
- **Disabled range radio:** it gets `aria-describedby` only when disabled, pointing at the explanation, with an id from `useId`.
- **Dialog reset:** the format resets to WAV when the dialog closes.
- **`exportMp3` callback:** has `[]` deps because it reads only refs, so it causes no extra renders, and `useArrangement()` only gained one member.
- **Code standards:** no `any`, no type assertions, no `@ts-ignore`; Tailwind tokens only (`border-brand`, `bg-brand/10`, `border-outline`, `text-muted`).
- **Tests:** Georgian messages are checked by exact text, and the focus-order tests were updated to include the new radios.

### Architecture note
- **Signal 4 (new timer lifecycle inside an existing owner):** `ArrangementContext.tsx` around lines 2753-2783, the `Promise.race` with `loadTimer`. → **Keep:** the timer belongs to one async call, is cleared in `finally`, and is covered by MX6 and MP-TIMEOUT.
- **Signal 3 (the same region changed again at high cost):** the export area changed in rounds 84, 85 and 86. Each time it needed a full workspace mount plus an ffmpeg mock, and `exportMp3` (around lines 2711-2740) repeats the four guards and the render step from `exportWav` (around lines 2660-2688).
  - **Proposal for the planner:** add `prepareArrangementRender(...)` in `lib/arrangement/export.ts`, returning either the rendered result or an error message, and use it in both `exportWav` and `exportMp3`.
  - Acceptance: MX8 and the existing WAV tests pass unchanged, and the shape of `useArrangement()` does not change.
  - Value: medium. This is a proposal, not something to change this round.

### Alternative Approach (Studio export pipeline)
- **Current:** render the WAV, race the encoder load against a 120 s timer, encode, then download.
- **Alternative:** prefetch the encoder as soon as the user selects MP3 or WAV + MP3, so most of the 31 MB download overlaps with the rest of their choices.
- **Verdict:** keep the current approach. It guarantees zero CDN traffic until the user actually starts an MP3 export, which saves bandwidth and is better for privacy. Prefetching is a UX follow-up, and it could only reasonably happen after the radio is selected.

### Score: 8.5/10