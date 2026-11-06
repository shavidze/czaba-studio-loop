COMMIT: OK

I reviewed the diff by reading code only. I did not run a browser or any tests. The `verify.log` and C PASS are as you reported them. No auth, purchase, download, token, Firebase or Stripe code is touched. The diff changes no styles, adds no `any`, `@ts-ignore` or type assertions, and adds no timers or listeners.

## Findings, ranked

1. **Low, accepted behavior change: `ArrangementContext.tsx:231-249` (`setStatus`).**
   - Function updaters and the gesture flag used to run at render time. They now run when `setStatus` is called. Doc 240 records this (R-CALLTIME, TL-R372-M1).
   - In a batch of a non-refusal text, a refusal and a release, the text restored is now the one written inside the batch. At HEAD it was the one from before the batch. Doc 240 says no production handler does all three in one batch. I could not confirm that without a browser.
   - **Fix:** none needed now. Keep the browser check C does on status texts against HEAD.

2. **Low, residual gap: `ArrangementContext.tsx:968-976` (`placeInsertMarker`), now called after `startPlaybackAt` at about lines 1671-1673.**
   - **The reorder is correct.** From a stopped text, `startPlaybackAt` turns the stopped text into "Playing from". `writeInsertMarker` then sees the `playing-from` kind, and `isPlayingRef` is already true, so it writes `insertMarkerWhilePlaying`. That is the same final text HEAD produced, and LT12 pins it.
   - **Stale range text during a gesture:** the stopped-text updater can still read a range that `setRange(null)` has not cleared yet. `setRange` only fixes the text when `gestureCountRef` is 0 (line 939). That leaves a stale range text if `playFrom` runs during an active gesture. Doc 240 argues no production path does this, and I have no counter-evidence.
   - **Fix:** add a one-line guard test that `playFrom` during a gesture leaves the status text consistent. Alternatively, have `placeInsertMarker` clear the range before calling `writeInsertMarker`.

3. **Info, event ordering: `status-preview-store.ts:66-80` and `StudioWorkspace.tsx:971-978`.**
   - `commitStatus` is one atomic `set`. It adopts the preview, reduces the update, and clears the preview, so the leaf never sees a half-adopted state.
   - Adoption keeps the key as `preview-<n>`, so the `aria-live` `<output>` does not remount and screen readers do not read the text twice.
   - The old layout effects are gone. The `lastNonRefusalStatusRef` write now happens at the call, which removes the render-then-effect lag.
   - Leaks: zustand and `useSyncExternalStore` handle unsubscription, and no new `useEffect`, timer or listener appears in the diff.
   - **Fix:** none.

4. **Info, render cost, improved.**
   - A status write used to change the whole context value and re-render every `useArrangement()` consumer. Now it re-renders only `ArrangementStatusTextInner`. RB-MEMO3 asserts exactly 2 renders for 2 writes and 0 for `StudioWorkspace`. GH1 asserts 0 for `ArrangementTransport`.
   - `getStatus` is a stable `useCallback`, so the `useMemo` deps of the context value do not churn.
   - **Fix:** none.

5. **Nit: `status-preview-store.ts:63-64`.** The new `commitStatus` rebuilds the `committed` object every time `reduceArrangementStatus` returns a changed entry, and the `key` is derived from `sequence`. That is correct. If `key` ever needs to differ from `sequence`, this is the single place to change.

## Architecture note

- **Signal 1 (mixed responsibilities), `app/lib/arrangement/status-preview-store.ts:1-85`.** The store holds the drag preview and the committed status together with their adoption protocol. The file and hook names (`status-preview-store`, `useArrangementStatusPreview`) no longer describe what they hold.
- **Verdict on the signal: keep.** One lifecycle and one atomic `set` is what makes the adoption race-free. Doc 240 already weighed a separate committed-status store and rejected it. That store would split adoption across two stores and create new ordering cases.
- **Signal 4 (new state in an existing owner), `ArrangementContext.tsx:231-255`.** `lastNonRefusalStatusRef` still lives in the provider and is written from `setStatus`, so status knowledge sits in two places. Keep it for now, because it is tied to `gestureCountRef`, which the provider owns.
- **Proposal for the planner (one bounded task, low cost, low risk, not for this round):** rename to `status-store.ts`, `createArrangementStatusStore` and `useArrangementStatus`, with no behavior change. The acceptance criterion would be the existing DP11–DP18, LT12–LT13 and RB-MEMO3 tests passing unchanged.
- **PERF-11c-iii:** doc 240 already lists the remaining `useArrangement()` leaf consumers as the next work.

This is a review of the diff only. It does not say the module was fully checked.