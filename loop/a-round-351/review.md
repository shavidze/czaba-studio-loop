# Round 351 — A's code-reviewer output (agentId a65e689675a52dc1e), verbatim findings summary

Scope: DP72 hunk (`b-round-350/sketch-dp72.patch.txt`) in `app/lib/arrangement/__tests__/drag-preview-render.test.tsx`; product read-only (`ArrangementVideoDock.tsx` l.770–815, `sfx-video.client.ts`, `video.ts`). Reviewer did not run the test. Score 7.5/10 (8.5 after F1).

- **F1 — Medium (A-R351-REVIEW-RELEASE-ASSERT).** After `pointerUpAt` the test goes straight to Undo and asserts the pre-drag time (2 s). If a bug made the commit seek back to the old clip position, the last write would already be 2 and Undo would change nothing; the assert still passes. Also hides an Undo that writes nothing if release left the old value. Proposed fix: right after `pointerUpAt`, `await waitFor(() => expect(seeks.at(-1)).toBeCloseTo(previewTarget, 3));` (optionally record `seeks.length`; the dedupe key `url|mediaTime` is unchanged after release, so no new write is expected).
- **F2 — Low (A-R351-REVIEW-GLOBAL-SPY).** The prototype setter spy records writes from every media element. Today only `seekSfxVideo` writes while stopped (`writeSlotSeek` only while playing), so not flaky now. Hardening: record `{ element: this, value }` or filter to `HTMLVideoElement`.
- **F3 — Low (A-R351-REVIEW-TRY-SPAN).** `try/finally` wraps only the `waitFor`; the three `expect`s after it can throw with the pointer still down. Harmless (unmount cleans up). Wrap from `pointerDownAt` or drop the `try` (DP64 has none).
- **F4 — Low, no action.** Spy restored by `vi.restoreAllMocks()`; no timer leaks (`stoppedSeekRef.current?.abort()` on unmount).
- **F5 — Low, no action.** `waitFor` is correct (write lands one microtask after the sync).
- **F6 — Info.** Expected formula matches `video.ts:110` (`position − clip.start + clip.sourceOffset`); move does not change `sourceOffset`.
- **F7 — Info.** Pre-drag and preview asserts can fail (non-vacuous); TS strict OK; semicolons OK. Nit: no blank line between DP71's `});` and DP72.
- **Architecture note:** none.
