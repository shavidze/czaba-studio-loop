COMMIT: OK

## Code Review: ArrangementContext.tsx, preview.client.ts, library-preview-stream.test.tsx, doc 269

I read the full diff and the final code of `startLibraryPreview`, `stopLibraryPreview` and `createLibraryPreviewPlayer`. I did not run the verify command, the tests or a browser. I rely on the stated results (C round 418 PASS, `verify.log` passed). The diff touches no auth, purchase, download or API-client code. Its only paths are `app/contexts/ArrangementContext.tsx`, `app/lib/arrangement/preview.client.ts`, the test file and the doc. A grep of `preview.client.ts` for `localStorage|auth|checkout|download|fetch(` found nothing.

### Critical Issues
- None.

### Suggestions (ranked, all Low)
1. **`preview.client.ts:218-220` (`getLibraryPreviewOffset`).** It still reads `active.element.currentTime` unguarded. A throwing getter on a released element would escape into the caller (this is the doc's A-R418-REVIEW-L2). Fix: use the same try/catch as `readTime`. Put it on the `ActiveStreamPreview` object, for example as a `readTime` member, so the stream branch calls it.
2. **`preview.client.ts:111` and `:125-131` (A-R418-REVIEW-L1).** A throwing read after a same-URL seek falls back at the original `start`, not the seek target. Fix: add `setStart` next to `setErrorHandler`, or keep a mutable `lastKnownTime` inside the closure.
3. **Test PC12 (test file, around line 301).** The title says "stall" but the body dispatches `error` (A-R418-REVIEW-L3). Either rename it to "error", or drive the fake scheduler so it really exercises the stall path. Seek-then-stall is currently covered only by the manual browser row R1b.
4. **`ArrangementContext.tsx:1948-1955`.** The microtask is not cancelled on provider unmount, and the unmount code at line 4671 doesn't bump the token. I judge this unreachable. Unmount runs `stopLibraryPreview` on the player, which detaches the listeners, so the error callback can't fire after it. A microtask queued before the unmount would only touch refs and a no-op `setState`. Optionally bump `previewTokenRef` at line 4671 for symmetry.

### Good Practices Found
- **Ordering and re-entrancy.**
  - The fallback runs through `queueMicrotask`. It starts after the media `error` handler and the outer start call return. The browser-visible order (error → Loading → decode → buffer) is unchanged.
  - The remembered-fallback set is still written synchronously, so a real media error is recorded even if the request was superseded.
  - In the decode branch the token is captured after `stopLibraryPreview()`. In the stream branch it is captured after the increment. A stale decode settle and a stale fallback are both rejected.
- **Listener and timer hygiene.** The `detach` function still removes all six listeners and cancels the stall timer. `reportError` calls `stopActive()` before `errorHandler`, so the handler never runs while the element is live. There is no new timer, listener or retained closure. The microtask is one-shot and holds only primitives and refs.
- **Seek re-entrancy.** `playing` is a local `const`, so a synchronous `pause` inside the `currentTime` setter, which nulls `active`, can't cause a null dereference on the next call. `readTime` runs once per stall tick.
- **Stale call behaviour.** The null-owner refusal now runs before `stopLibraryPreview()`. A stale call no longer kills a live preview.
- **TypeScript and tokens.** The diff adds no `any`, no `@ts-ignore` and no type assertions, and has no Tailwind or token changes. Semicolons are present. The tests wrap the error dispatch in `await act(async …)` and keep all assertions. Mutant evidence (11 mutants, each red on the intended rows) is documented.
- **Render cost.** `previewTokenRef` is a ref, so it causes no extra renders. `setLibraryPreviewSourceId` is guarded or written exactly as before.

### Architecture note
- signal 3 and 4: `ArrangementContext.tsx:1909-2034` (`startLibraryPreview`, about 125 lines with three branches) plus `previewTokenRef`, `streamFallbackRef` and `startLibraryPreviewRef`. The same region was changed in rounds 392 to 418, and each round needed broad context (decode controller, pins, status text).
  - **Keep for now.**
    - The token, pin and `libraryPreviewSourceId` writes are one lifecycle that must change together. The self-reference through `startLibraryPreviewRef` is atomic with `latestRef`.
    - The public hook shape is unchanged.
    - The tests pin the behaviour.
    - Extracting mid-fix would risk audio timing and ref ordering.
  - **Proposal for the planner (one bounded task).** Extract a `createPreviewController` into `app/lib/arrangement/`. It would own the token counter, the fallback memory and the stream → decode → buffer decision. The context would inject `ensureDecoded`, the pin set and release, and status writes. Acceptance: `useArrangement()` is unchanged, PS and PC rows pass unchanged, and the mutant list still goes red. This is the same item as the open ARCH-CHECKPOINT-PREVIEW-AFTER-13C request. It is not for this round.

### Alternative Approach
- **Current:** a per-request token counter, plus a `queueMicrotask` deferral of the stream fallback.
- **Alternative:** `setTimeout(0)` deferral, or a state machine that carries a request object `{id, source, offset}`.
- **Verdict:** keep the current approach. The microtask is the smallest deferral that leaves the handler and the outer call. The request-object form would also fix a token-bearing offset race, but it adds plumbing for no behavioural gain.

### Score: 8.5/10