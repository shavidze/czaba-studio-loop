COMMIT: OK

I read the diff and the surrounding code in `collection.ts` and `preview.client.ts`. I did not re-run any tests. The verify log shows `# fail 0`. The "Error: … must be used within an ArrangementProvider" lines in that log are most likely expected-throw tests, though I only searched the log, not read it all. The 8 paths are all tracked, and `untracked.txt` is empty.

## Findings, ranked

1. **Low, `app/lib/arrangement/preview.client.ts:114`: the `crossOrigin = 'anonymous'` rollout carries a deploy risk.**
   - The code is correct. It is set after `createAudioElement()` and before `element.src` at line 178, and the PS29 test checks the attribute at the moment `src` is assigned.
   - If the production asset host (R2 or CDN) lacks CORS headers, every cross-origin stream emits `error`. That falls back to decode, which needs the same CORS headers anyway.
   - Cost: one wasted request and a short delay before sound. There is no new failure.
   - Fix: none needed in code. Before SRW-21 mounts purchased stems, confirm the host sends `Access-Control-Allow-Origin` for range requests. The doc already says this.

2. **Low, `app/lib/arrangement/collection.ts:127`: `previewUrl` hands out a signed URL as a plain string.**
   - It is the same URL that `loadSource` already uses, and `stemUrls` is a private Map snapshot, so nothing new leaks.
   - The `<audio>` element sends it as a network request. It is not logged and not rendered into the DOM. There is no auth, purchase or download code change.
   - Real signed-URL expiry matters at SRW-21: a long preview session or a seek after expiry fails and falls back to decode, which would fail too.
   - Fix: none now. SRW-21-PLAN should say a URL refresh creates a new collection object. The doc already records this.

3. **Low, `perf/studio-lab-resources.perf.spec.ts:535-538, 576-581`: the `window.__czabaPreviewMedia` bookkeeping is not removed if the page dies.**
   - The `play` wrapper is restored in `finally`, which is good.
   - If `page.evaluate` in the `finally` fails (page crashed), the original error is replaced by the evaluate error.
   - This is test-only, so I would not block on it. A `.catch(() => undefined)` on the restore call would keep the root cause visible.

4. **Info, `perf/studio-lab-resources.perf.spec.ts:604-607`: preview teardown depends on button text.**
   - The step toggles Stop by reading the label text. If the preview already ended (a short stem or `ended`), it skips the click and waits for the `Preview` label. That is correct.
   - The 15 s wait for 1 s of playback is acceptable, and the liveness row `res.harness.preview-stream-playing` prevents a false pass on a stall.
   - Limitation: it only checks that some element has played ≥ 1 s. It does not check that the stream is the library preview element.

**Checks with no finding**
- **Event ordering and leaks:**
  - The six listeners added are the six removed in `detach`. The stall timer is cancelled in `detach`, and PS26 and PS28 cover that.
  - PS28 covers the sync-throw path: no timer is left, `src` is cleared, and the offset is `null`.
- **Same-URL seek key:** the URL is stable per collection (PV2), so the same-URL seek check in the player is a sound key.
- **TS strict and Tailwind:**
  - No new `any`, suppression or type assertion. The `declare global` in the perf spec is a type declaration, not an assertion.
  - No CSS or tokens were touched.
- **Render cost and accessibility:** no component changed.
- **Auth, purchase, download:** none touched.
  - The only change to the purchased-stem code is a read-only getter on the existing URL Map.
  - There is no caller outside tests until SRW-21.
- **Budget rows:** the three rows are 1×-only assert rows with owner `PERF-13c-ii-b`, and the mutant evidence is cited in the doc.
- **Docs:** both implementation docs are updated and the 248 status line is fixed.

## Architecture note
- **Signal 4 (new lifecycle in an existing owner):** `preview.client.ts:101-188`. `playLibraryPreviewStream` now holds six listeners, a stall timer, a same-URL seek path and `crossOrigin` inside one closure. Rounds 394, 395 and 396 each changed the same function, which fits signal 3 (repeated costly changes to one region).
  - **Keep, because:** the closure has one lifecycle (`active`, `detach`, `fail`). Audio timing, the gesture lifecycle and the public player shape are all pinned by PS1–PS29. Splitting now would add plumbing for `active` and `stopActive`.
  - **Cost of extracting:** medium, with a regression risk to event ordering.
  - **Proposal for the planner (not a finding):** after the planned ARCH-CHECKPOINT-PREVIEW-AFTER-13C, consider one bounded task. Extract `createStreamPreview(element, hooks)` as a pure factory inside `preview.client.ts` only. Acceptance would be PS1–PS29 unchanged, the `LibraryPreviewPlayer` interface unchanged, and no new exports. Do it only if a fourth round touches this region.
- **Signal 2 (ownership):** `ArrangementContext.tsx:1849-1860` already calls `collection.previewUrl?.()` and is unchanged here. The coupling stays one-directional (collection → context → player). Keep it.
- This note covers the diff only. I did not audit the whole module.