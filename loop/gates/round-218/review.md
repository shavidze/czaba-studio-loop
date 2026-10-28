COMMIT: OK

## Code Review: PERF-16a — `mp3-encoder.client.ts` moves from ffmpeg.wasm to mediabunny + LAME (round 218)

**What I checked:** I read the 5 candidate paths in the diff and the new doc 170, plus the context they touch: `ArrangementContext.tsx` lines 3400–3530, `export-cancel.ts` `raceArrangementExportAbort`, `package.json` and the git log. I reviewed only this diff, not the whole module. I did not run anything; I relied on the verify log and the C round 218 PASS.

- **Dependencies are already committed.** `mediabunny@1.62.1` and `@mediabunny/mp3-encoder@1.62.1` were added by HEAD `13c7805` ("chore(deps): add mediabunny…"). So the candidate builds without `package.json` in it.
- **No auth, purchase or download code is touched.** All changes are under `app/lib/arrangement/` plus a doc. The legacy `/studio/:productId` path (`app/utils/ffmpeg.ts`) is unchanged and is planned for 16b.
- **Encoder stays lazy-loaded.** The ME9 import scan confirms only `ArrangementContext.tsx:3456` loads the encoder, through `import()`. Line 3411 is a `typeof import` used only for typing.

### Critical Issues
- None.

### Suggestions (most important first)
1. **Production worker not tested in a real browser.** `mp3-encoder.client.ts` (the whole module). The browser test ran on the dev server (`:5173`). The production build was only checked by reading the files. In production, the LAME worker starts from a `blob:` URL inside the minified chunk, which the dev run doesn't exercise. **Fix:** before 16b, run one MP3 export on `npm run build` plus the prod server and check that `FF FB E4 64` frames are produced and no worker is left over. Not a blocker: this chunk was not rewritten.
2. **Raw library errors reach the user.** `mp3-encoder.client.ts` builds `MP3 conversion is invalid (${reasons…})`, and the context (`ArrangementContext.tsx:3518`) passes `error.message` straight into `mp3Failed`. Users can see internal codes like `no_encodable_target_codec`, or mediabunny's cancel text. Today this only happens when `signal.aborted` is false, so normal cancel paths don't show it. **Fix (separate task):** map error types to user-friendly copy in `strings.ts` and keep the raw reason for console/telemetry. The same thing happened before with `ffmpeg exit code N`, so this is not a regression.
3. **Artificial microtask in `registerArrangementMp3Encoder`.** The `await Promise.resolve()` before the generation check exists only to give the "reset during load" test a window. Doc 170 says this openly. **Fix:** acceptable as is. Do not "fix" it by removing the generation check, because ME3(a) covers it.
4. **Progress handler is set before the validity check.** `conversion.onProgress` is assigned before `if (!conversion.isValid)`. It is harmless, since `execute()` is never called on an invalid Conversion. Moving the assignment after the check would make the order read more clearly. Cosmetic.
5. **CSP will need `worker-src blob:`.** Already listed as a TODO in doc 170 (line 119). I'm repeating it here so it isn't lost when the CSP header is added; `SECURITY_AUDIT.md` §6 does not have it yet.

### Real-browser concerns checked (no issues)
- **Event ordering and races:**
  - A run is added to `mp3EncoderRuns` synchronously after `Conversion.init` and before `execute()`, with nothing awaited in between. So a reset cancels each running Conversion exactly once.
  - A reset during `init` is caught by the generation check after `init`, so the late Conversion is never executed.
  - The `isCancelled` flag drops progress that arrives after a cancel.
- **Leaks:**
  - `input.dispose()` runs in `finally` on every path, including invalid, rejected and reset.
  - `mp3EncoderRuns.delete` runs in `finally`.
  - Rejections after a cancel are absorbed by `work.catch` inside `raceArrangementExportAbort`, so they don't surface as unhandled.
  - The context's existing timer and abort-listener cleanup is unchanged.
  - The upstream worker blob URL that is never revoked is documented and small.
- **Memory:** the full-size `wav.arrayBuffer()` copy is gone; `BlobSource` now reads the WAV in chunks (ME8). The output `BufferTarget` holds the whole MP3, about 4 MB for 100 s, which is fine.
- **Render cost, accessibility, Tailwind:** nothing in the diff touches components or styles. The copy changes are text only.
- **TypeScript strict:**
  - No `any`, `@ts-ignore` or `as`. The tests use `instanceof` narrowing instead of casts.
  - Semicolons are in place.
  - `Quality({ bitrate })` passed typecheck, and the browser test confirmed 320 kbps CBR frames.
- **Regressions:**
  - The public API (`ArrangementMp3Encoder`, `load…`, `reset…`) has the same signatures.
  - The removed `ARRANGEMENT_MP3_CORE_BASE_URL` is not used anywhere else in `app/`.
  - The 8 test files that cover this pass.

### Good Practices Found
- Each `encode` call is tied to the generation it was loaded in, so an encoder object kept from before a reset rejects new work and creates no Conversion (ME3(c)).
- The decision not to use `canEncodeAudio` is well argued: the file should be the same in every browser. The `encoderLoadFailed` copy ("Reload the page") correctly reflects that a retry can't fix a failed upstream registration.
- The ME9 import-boundary scan comes with tests that plant violations in scratch copies to prove the scan catches them, including a type-only import that must not be flagged.
- The fakes have controllable timing (`manual` init and execute modes) instead of fake timers.

### Architecture note
- Signal 2 (ownership/coupling) is weak. `ArrangementContext.tsx:3445–3515` still calls `resetArrangementMp3Encoder` from 5 places, and the cancel/reset rules are now split between the context (abort, timeout, error) and the encoder module (generation, run set). **Keep**, because the module API and lifecycle didn't change, the context wasn't touched, and the existing tests (export-cancel-ui, export-progress-ui) pin the behavior. Extracting now would put the timing of the export flow and its cancel UI at risk for little gain. **Proposal for the planner (only if 16b makes the legacy `StudioContext` call the same encoder):** one bounded task to move the "load with timeout + reset on abort" logic into a single helper in `app/lib/arrangement/`, shared by both callers. Acceptance: no change to `useArrangement()`, and the export-progress-ui, export-cancel-ui and export-mp3 tests pass unchanged.

### Alternative Approach (Studio audio pipeline: critical logic)
- **Current:** mediabunny `Conversion` with LAME registered unconditionally, so every browser produces CBR 320 kbps. A run set plus a generation counter handle cancellation.
- **Alternative A:** `canEncodeAudio('mp3')` first, falling back to LAME. It skips loading the worker where the browser can encode MP3 natively, but the output would differ by browser.
- **Alternative B:** run LAME directly through `lamejs` or a hand-written worker. That gives full control but means more code of our own and our own WAV parsing and chunking.
- **Verdict:** current is better. A predictable file plus less code of our own is worth more than skipping a ~227 kB gzip chunk, which loads once and only when an MP3 export starts.

### Score: 9/10