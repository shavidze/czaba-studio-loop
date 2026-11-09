COMMIT: OK

I read the candidate files and the full effect and teardown code around the change. I did not run anything. I did not open the verify log or C's PASS file. I only checked what is visible in the diff and the surrounding code.

## Findings, ranked (no blockers)

1. **Low, `app/lib/arrangement/preview.client.ts:203`:** `readTime: () => readTime()` falls back to `start`. That is right for `getLibraryPreviewOffset` and `handleError`. `armStall` at line 153 also uses the `start` fallback. If the first read throws while arming, the stall is armed at `start`, and a later successful read at the same time looks like a stall. This is a rare edge case, and it is the same as HEAD. Fix, if wanted: add a row for it. No code change is needed now.
2. **Low, `app/contexts/ArrangementContext.tsx:4523`:** `stopLibraryPreview()` now runs in the collection effect's cleanup, which also runs on unmount. It calls `setLibraryPreviewSourceId(null)` and `releasePreviewPin()` on a provider that is unmounting.
   - This is safe in React 18, because there is no unmounted-setState warning and `previewPlayerRef` is still set at that point.
   - The unmount effect at line 4640 is declared later, so its cleanup runs after this one. The order is correct.
   - Fix: none. A comment is not needed.
3. **Low, `docs/implementation/2026/quarter-IV/271-sys-preview-lifecycle.md:96`:** The doc says a decoded-buffer preview has no row that covers a collection change (A-R421-REVIEW-L1). The doc already lists this as a TODO. Fix: add one row once the collection can change from the UI.

## What I checked

- **Event order and leaks:** The new `stopLibraryPreview` call sits in the same cleanup as `controller.abort()` and `inFlight.clear()`. It detaches all six listeners and cancels the stall timer through `detach`. `setStart` runs before the `currentTime` setter, so if the setter throws, `fail()` reports the new seek offset. No new listeners or timers are added.
- **Effect dependencies:** `stopLibraryPreview` depends on `releasePreviewPin`, which depends on `decodedBuffers`. `decodedBuffers` is already in the effect's dependencies, so adding `stopLibraryPreview` does not make the effect re-run more often. A re-render with the same collection does not stop the preview (PL5).
- **Behaviour change:** `getLibraryPreviewOffset` no longer throws on a bad `currentTime` read. The `null` result still means "no preview".
- **Render cost:** There is no new state and no new context value. The only added `setState` call, to clear the preview id, runs in cleanup and only when a preview is active.
- **TypeScript and project rules:** No `any`, `@ts-ignore` or type assertions. The new test code is typed. Semicolons are in place. There are no code comments. No CSS or tokens are touched.
- **Accessibility and Tailwind:** There is no UI change.
- **Auth, purchase and download code:** None is touched. The four paths are the context, the preview client, a test file and a doc.
- **Documentation:** The implementation doc was added, as the project rules require.
- **Security:** `SECURITY_AUDIT.md` has nothing to check here, because there are no token, XSS or input changes. `ERROR_TAXONOMY.md` is not relevant, because no error codes are involved.

## Architecture note

- Signal 4 (new lifecycle in an existing owner): `ArrangementContext.tsx:4523` → keep. The collection effect already owns teardown for decoded buffers, in-flight decodes and peaks. Stopping the preview in the same teardown keeps one lifecycle, and the invalidated token is what cancels fallbacks already queued. Moving it out would split the order that PL1 and PL2 depend on.
- Signal 3 (repeated costly change to one region): the preview region, `preview.client.ts` and the preview hooks in `ArrangementContext.tsx`, has been changed over several rounds (R416, R418, R421). Each round needed a custom stream-element stub and mutant runs.
  - Proposal for the planner: one bounded task to put a small, shared preview test harness in front of those tests (the element stub, `throwingTimeAfter`, and the scheduler).
  - Acceptance: existing PC, PS and PL rows pass unchanged.
  - Do not extract the production code.
- This note covers the diff only. It is not a full audit of `ArrangementContext.tsx`.