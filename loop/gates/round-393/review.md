COMMIT: OK

I read the full diff, the two new files, `startLibraryPreview` and the unmount cleanup in `ArrangementContext.tsx`, the `SECURITY_AUDIT` and `ERROR_TAXONOMY` primitives, and the architecture checkpoint. I did not run the code or a browser. I'm relying on the C PASS and the verify log you cited for that.

## Code Review: ArrangementContext.tsx, preview.client.ts, studio-lab-demo.ts, arrangement.ts, library-preview-stream tests, doc 252

### Critical Issues
- None.
- Auth, purchase and download code are untouched. `previewUrl` returns only the two same-origin demo MP3 URLs from `demoUrls`, and `null` for every other source. PS15 enforces this.
- No `any`, `@ts-ignore`, type assertions or `dangerouslySetInnerHTML` appear in the diff. No secrets or tokens are involved.

### Suggestions (ranked)
1. **Medium, deferred and documented:** `preview.client.ts:~121-122`. `element.currentTime = start` can throw synchronously, and so can `element.play()`. If it throws, `active` stays set to the stream preview, but the context has already set `libraryPreviewSourceRef` and the preview id. The UI then shows `Stop` on silence until the next stop. Browsers that throw here are rare, and the doc already lists "sync throw protection" for 13c-ii. Fix then: wrap the `currentTime`/`play()` calls in `try/catch`, and call `handleError` from the `catch`.
2. **Low:** `preview.client.ts` (the `handleError` / `.catch(handleError)` path). A `NotAllowedError` from `play()`, for example a lost user gesture, is treated as a stream failure and permanently adds the id to the fallback list. That costs a decode and a memory spike, not correctness. The doc defers the filter to 13c-ii. Fix then: skip the fallback for `NotAllowedError`, and just clear the preview state.
3. **Low:** `ArrangementContext.tsx:1860-1870`. When the fallback callback fires, the stale `startLibraryPreviewRef.current` is called synchronously from inside the media `error` event handler. It works, and PS8 and PS13 cover it. It would be more robust if a later refactor deferred the call or checked that the preview is still current. This is not a blocker.
4. **Low:** `streamFallbackRef` keeps its set for the lifetime of the provider and is never cleared per collection. The set is tiny and keyed by collection identity, so there is no leak. When the 13c-ii signed URLs arrive, decide whether "a stream error means never stream again" should expire.

I found no problems in the areas you listed:
- **Event ordering:** a stale `ended`, `error` or `play()` rejection is ignored because the handlers check `active === preview`. PS3 and PS4 cover this. The `pause`-induced `AbortError` is also ignored, because by then the preview is no longer active.
- **Listener and timer leaks:** `stopActive` detaches both listeners, then calls `pause`, `removeAttribute('src')` and `load`. The unmount cleanup at line 4547 releases the element, and PS10 covers it. The code adds no timers.
- **Transport and preview:** a stream preview stops the playing transport before the element plays (PS11). `startPlaybackAt` calls `stopLibraryPreview` first, so Play stops a stream preview (PS9).
- **Render cost:** the only added state writes are `setLibraryPreviewSourceId`, which was already there. The stream path writes no status (PS14), so there is no extra re-rendering.
- **Accessibility and Tailwind:** no UI or CSS changes.

### Good Practices Found
- The cached buffer takes precedence over streaming (PS7).
- The audio element factory can be injected, which keeps the player testable without type assertions.
- A seek on the same URL reuses the element instead of reloading it (PS2).
- Each stream failure is remembered per collection, and the fallback resumes from `currentTime` (PS13).
- The implementation doc covers the alternatives that were rejected, and the Ableton claim is worded carefully.

### Architecture note
- Signal 4 (new state and lifecycle in an existing owner): `ArrangementContext.tsx:885-889` and `1841-1872`. The change adds `streamFallbackRef`, a third inline copy of the preview-player creation block (also at `1936` and the buffer path), and a third kind of preview path.
- Signal 1 (mixed responsibilities): the choice between cached, stream and decode previews now lives inside one `useCallback` with 8 dependencies.
- Keep for now. The invariants (audio timing, preview-pin ordering, `startLibraryPreviewRef` re-entry) are pinned by PS1–PS15. Extracting it mid-PERF-13c would put those behaviours at risk.
- Proposal for the planner, after 13c-ii lands: one bounded task to extract `ensurePreviewPlayer` and a `useLibraryPreviewController` hook. It would own the preview refs, the fallback set and the three preview paths. Acceptance: the public `useArrangement()` shape and the PS1–PS15 and round-392 preview tests are unchanged. Cost: medium. Risk: re-entrancy ordering around `startLibraryPreviewRef`.
- This is a review of the diff, not a full audit of the module.

### Alternative Approach
- Current: a bare `HTMLAudioElement` streams the file straight to the output, outside the Web Audio graph. Failures fall back to decode.
- Alternative: `createMediaElementSource` routed through the master bus.
- Verdict: keep the current approach. The alternative would cause CORS problems with 13c-ii's signed URLs, and buffer previews already bypass the master bus, so the two stay consistent.

### Score: 8.5/10