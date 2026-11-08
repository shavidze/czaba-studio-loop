COMMIT: OK

**Scope.** The commit has no auth, checkout or download changes. `createPurchasedWorkspaceCollection` is the purchased-stems adapter, and the diff adds `peaksUrl` and `fetchPeaks` to it. Nothing outside tests calls that adapter (grep over `app/`), and nothing populates `AudioStem.peaksUrl`. The new code is inert in production until SRW-21 mounts the adapter. Demo behavior is unchanged because the demo collection has no `fetchPeaks`, so it keeps using the default fetch.

**Review notes.** I did not run the app, tests or build; I relied on the verify log and C's PASS and read the diff and docs. No Critical Issues.

- **Bearer token:** `fetchPeaks` is `fetchAudio`, which may add a bearer header. The same-origin rule in `collection.ts:79-90, 112` therefore matters. It is fail-closed: it drops a different-origin, empty or unparsable `peaksUrl`, and PK4 covers each case.
- **Listener and timer leaks:** none found.
  - The abort listener in `readCappedText` (`precomputed-peaks.ts:513`) is `{ once: true }` and removed in `finally` (`:530`).
  - The reader is cancelled on every exit path: pre-aborted, over the cap, and abort mid-read.
  - `cancel()` has a swallowed `.catch`, so there is no unhandled rejection.
  - The read loop ends cleanly when the cancel resolves a pending `read()`.
- **Streamed cap:** `PRECOMPUTED_PEAKS_MAX_BYTES` is enforced on counted decoded bytes. A missing or lying `content-length` can no longer bypass it. A declared length of `NaN` is still refused.
- **Event ordering:** an abort that arrives after the last chunk is caught by the `signal.aborted` re-check before `JSON.parse` (`:152`), and PP7e covers it. `ArrangementContext.tsx:4557` still checks `controller.signal.aborted` and `peaksDecided`, so a late peaks result cannot overwrite decoded peaks.
- **Render cost:** none added. The context change is one extra argument to an existing call, and `collection` was already in scope for that effect.
- **TypeScript strict:** no `any`, suppression directives or type assertions. `fetchPeaks` is an inline function type, so `types/` does not import from `lib/`. Tests use `Object.getOwnPropertyDescriptor` instead of casts.
- **Tailwind, tokens, accessibility:** no UI touched.
- **Docs:** 263 and 264 are status-line changes only. 265 follows the template, and its sections are filled in.

**Findings (all non-blocking):**
1. **Low, `precomputed-peaks.ts:532-538`:** the chunks are held and then copied into one buffer, so peak memory is up to about 2× the 4 MiB cap, and the final `JSON.parse` runs synchronously on the main thread. That is fine at 4 MiB. Fix, if it ever matters: decode with a `TextDecoder` using `{ stream: true }` per chunk and skip the `Uint8Array` copy.
2. **Low, `precomputed-peaks.test.ts` PP12 and PP12b:** they use real 1-second race timers. They are already tracked as TL-R413-L-b. Fix: use `vi.useFakeTimers`.
3. **Low, `collection.ts:79`:** the `https://base.invalid` base means a relative peaks URL beside an absolute audio URL is always dropped. That is the intended fail-closed behavior, but the backend handoff must keep `peaksUrl` on the same origin as the audio. The doc already records this.
4. **Info, `collection.ts:104-111`:** `stem.peaksUrl` is validated once at creation. An expiring signed URL would go stale in a long session. This is acceptable now because peaks are only fetched at load. Revisit it when SRW-21 wires real data.

**Architecture note**
- signal: `ArrangementContext.tsx:4553-4566` (peaks prefetch inside the collection-load effect). This is signal 4: related lifecycle state added to an existing owner. Keep it, because:
  - the change is one argument;
  - the effect shares its `controller`, `peaksDecided` and `precomputedPeaks` with the decode path, which is the invariant to protect;
  - the fetch and parse logic already lives in `lib/arrangement/precomputed-peaks.ts`.
- Proposal for the planner, only if a further round touches this region (this region has now been changed in three rounds: 263, 264 and 265): one bounded task to extract a `startPrecomputedPeaksPrefetch(collection, controller, onPeaks)` helper into `lib/arrangement`. The tests would be PPC1–PPC12 unchanged, plus a check that nothing changes in the public `useArrangement()` shape. Cost is low-to-medium. I would not do it now.
- This is a review of the diff only. I did not audit the whole `ArrangementContext` module.