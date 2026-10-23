COMMIT: OK. The change is small and only affects error handling. It touches no auth, purchase or download code, it matches the purchased-collection loader exactly, and verify passed.

## Code Review: `app/data/studio-lab-demo.ts` (+ test, docs) — round 95

Reviewed against HEAD `0513439` and the five paths in `paths.txt`. This covers the diff only, not the whole module.

### Critical Issues
- None.

### Suggestions (ranked)
1. **Low (doc status falls behind):** `docs/implementation/2026/quarter-IV/083-studio-lab-demo-loader-error-text.md:4` still says the round is waiting for C's check, but `c-round-95.json` is already PASS. **Fix:** change it to `C PASS (Round 95)` now, or keep the current habit of updating it in the next round's commit, as 082 does in this diff. Either works; just pick one.
2. **Nit (duplicate code, already logged as GATE95-DUP-ERROR-MAP):** `studio-lab-demo.ts:106-131` repeats `collection.ts:86-111` line for line. The DL8 test keeps the two in step today. **Fix:** a later, separate task (see the Architecture note).
3. **Nit (real browser, existing behaviour, not a regression):** `decodeAudioData` (`studio-lab-demo.ts:128`) cannot be cancelled. If the user unmounts or switches collection mid-decode, the decode still finishes. The provider drops the result in `ArrangementContext.tsx:3026/3039`, so no false error appears and nothing leaks long-term. It is a short burst of wasted CPU. **Fix:** nothing to do now. DL5 ("decode after abort → decode text") correctly documents that the provider ignores this case.
4. **Nit (verify.log:90):** Biome flags `useButtonType` in `app/components/audio/AudioPlayer.tsx:48`. That file is not in this diff, so it's existing debt and does not block. Track it separately.

### Checked against the review focus
- **Browser event order:** if `fetch` is aborted, it rejects with an AbortError and the `signal.aborted` check passes that same error through. A body read aborted mid-stream is handled the same way. If the signal aborts in the gap between the error and the catch, a plain network error is passed through unchanged. The provider ignores it anyway, so the user sees no difference.
- **Listener/timer leaks:** no new listeners, timers or state. There is still one controller per effect, and its cleanup is unchanged (`ArrangementContext.tsx:3050`).
- **Existing flows:** the success path is unchanged. DL6 checks the URL, `credentials: 'omit'`, that the exact same `signal` object is passed (`toBe`), and that the same buffer reaches `decode`. The synthetic sources and the `'უცნობი დემო წყარო'` text are untouched.
- **Render cost / a11y / Tailwind:** no UI changes. The `შეცდომა: ` prefix in `ArrangementLibrary` is unchanged.
- **TS strict:** no `any`, no `@ts-ignore`, no type assertions. The test gets its types through `vi.stubGlobal` fakes instead of casts. Every statement ends with a semicolon.
- **Security:** error messages no longer include the URL, the browser's own text or a stack trace (DL1, DL3). That satisfies SECURITY_AUDIT §3/§5. `collection.ts` (the purchased adapter) and the auth, purchase and download code are not touched.
- **ERROR_TAXONOMY:** the 50001–50399 codes are for backend errors and don't apply to this client-side loader text.

### Good Practices Found
- Behaviour matches the purchased adapter, and DL8 checks the parity directly.
- The abort check guards only fetch and the body read, which keeps the abort semantics minimal and correct.
- The test checks that the same error object is passed through (`rejects.toBe(abortError)`), not just that the error has the same text.
- The `toStrictEqual` gap on the signal found in the earlier review was fixed with an identity assertion, and a mutation test proves it.

### Architecture note
- **Signal 2 (ownership/coupling) is weak.** The same mapping from network/HTTP/decode errors to Georgian text now lives in two owners: `app/data/studio-lab-demo.ts:106-131` and `app/lib/arrangement/collection.ts:86-111`. **Keep for now:** `collection.ts` is frozen this round, and DL8 guards parity. **Proposal for the planner (not approved scope):** once `collection.ts` is back in scope, add one unexported-to-UI helper, `fetchAndDecodeAudio(fetchFn, url, ctx, signal)`, in `lib/arrangement/` and use it in both loaders. Acceptance: all existing `collection.test.ts` and `studio-lab-demo.test.ts` tests pass unchanged; the `WorkspaceCollection` type stays the same; auth and purchase access don't change. Value: low.

### Alternative Approach
- **Current:** each loader translates errors into Georgian text right inside its own `try/catch`.
- **Alternative:** the provider (`ArrangementContext.tsx:3045`) translates every non-aborted error into general text.
- **Verdict:** the current approach is better. The loader is the only place that knows whether a failure was network, HTTP or decode, so it can say which. A general provider message would lose that detail and wouldn't match the purchased-collection texts.

### Score: 9/10