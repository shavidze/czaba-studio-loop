COMMIT: OK (no auth/purchase/download paths in the diff; no new listeners or timers; no `any`, assertions or suppressions; verify passed: 243/243 test files, build OK)

## Code Review: PERF-DRAG-PREVIEW stage b, round 328 (audio fade status preview)

This review covers the diff (`diff.patch`, 11 paths, 2 of them new). I did not check the whole module.

### Critical Issues
- None.

### Suggestions (most important first)

1. **Low: a keypress during pending-update renders can briefly show the wrong text.** `app/contexts/ArrangementContext.tsx:752-758` and `:331-336` in the patch. `flushStatusPreview` moves `adoptedPreviewSequenceRef` forward when it is called, before React commits the update. One case needs a real browser. A collection-settle `setStatus` is waiting in the default lane. Then a discrete event (pointerup or a key) calls `setStatus(updater)`. The flush skips the adopt because the ref already moved. The sync render skips the default-lane `adoptPreview`, so the updater runs on the old committed text. The layout effect then sees `sequence <= ref` and clears the preview. The footer can show text built from the old committed status for one frame. The final state is correct once the default lane rebases. The normal pointerup ends with a plain string (`fadeCommitted`), so you won't see it there. Only an updater-only sync write would show it, and jsdom can't reproduce it (the doc says the same about MU-SYNC-CLEAR). **Fix (not urgent):** clear when the adopt commits, not when the flush runs. Read `statusEntry.previewKey` in the layout effect, and clear only if the store's preview has that key or an older sequence. Or keep a browser probe like C's SETTLE-REMOUNT that covers an updater during a pending settle.

2. **Low: the reducer's action check is fragile.** `ArrangementContext.tsx` reducer, `if (typeof action === 'object')`. It is correct today because `ArrangementStatusUpdate = string | ((current) => string)` (`status-announcement.ts:6`). If that type ever gets an object form, its actions would be read as `adoptPreview` and the type checker would not catch it. **Fix:** use `'adoptPreview' in action`.

3. **Low: the perf budgets leave little room.** `perf/budgets.interactions.json` fade rows are `<= 24`, and measured values are 21.633 per move and 22 max. Stage a showed that one new memo wrapper adds +1 per workspace commit. The rows are deterministic, so they won't flake, but the next footer or overview wrapper will hit them without warning. **Fix:** none needed now. Add a one-line note in `168-…md` that 2 components is all the room left.

4. **Info: one test global is restored by hand.** In `drag-preview-render.test.tsx` DP18, `vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', …)` is set back to `true` manually, and the test waits 50 ms on a real timer. **Fix:** use `vi.unstubAllGlobals()` in `finally`/`afterEach` so a thrown error can't leave a changed global behind.

5. **Info: the footer still renders on provider commits.** `StudioWorkspace.tsx:823` `ArrangementStatusTextInner` re-renders on every provider commit that changes `status`/`statusKey`, even while a preview is shown. The cost is negligible. No action.

**Not a bug, recorded so the next round doesn't reopen it:** the stop effect (`StudioWorkspace.tsx:2227`) can run in a child layout effect after the adopt commit but before the provider's clearing effect. At that point `getStatusPreviewText()` returns the adopted text, which is the same as the committed text, so `?? status` gives the same result either way.

### Checks for what tests cannot catch
- **Event order:** release always goes through `setStatus` (`ArrangementContext.tsx:1973`), so an unadopted preview is always adopted when the gesture ends. That covers pointerup, pointercancel, unmount cleanup, and abort through `claimPointerGesture`. A preview can't stay stuck on screen.
- **Leaks:** the new store is created once per provider through a `useState` initializer, and `useStore` subscribes and unsubscribes. There are no new timers or listeners, and the two new refs belong to the provider.
- **Regressions:** there are no other `status` consumers. I searched `routes`, `hooks` and `components/arrangement`; only StudioWorkspace and MarkerRow read it. The settle path's `lastNonRefusalStatusRef` write (`:4057`) gets overwritten by the flush with the preview text, which matches HEAD behaviour because the fade text is never a refusal. Video clips stay on the provider path (`ArrangementClip.tsx:438`, `:611`), covered by DP9b and DP13.
- **Render cost:** about 21.6 components per move (down from 103). The `setStatus` wrapper is stable, so adding it to about 30 dependency arrays doesn't cause extra renders.
- **Accessibility:** `<output aria-live="polite">`, its classes and its position are unchanged. When the preview is adopted the key stays the same, so the text isn't announced twice. Each move changes the key, which re-announces, same as HEAD with `statusSequence`.
- **Tailwind/tokens:** no class or style changes.
- **TS strict:** no `any`, `@ts-ignore` or `as`. Semicolons are present.
- **Auth/purchase/download:** none of these files are touched.

### Good Practices Found
- Each sequence is adopted only once (`adoptedPreviewSequenceRef`), so two writes in one batch see each other (DP19).
- The same-text guard in `previewStatus` matches HEAD's rule for the reducer during a gesture (DP17, DP18).
- The optional `previewStatus` prop falls back to the old path, so `gesture-reentry.test.tsx` keeps working.
- `status-preview-store.ts` has the same shape as `preview-store.ts`, and its `written` counter never resets, so keys never repeat (SP2).
- The doc records the mutants, including MU-SYNC-CLEAR, which stays green in jsdom.

### Architecture note
This is a proposal only; nothing here needs fixing in this round.
- **Signal 4, new state and lifecycle in an existing owner.** `ArrangementContext.tsx:717-790` gains a fourth store, two refs, a wrapping reducer with an internal action, a second layout effect, and `setStatus` turned into a wrapper that had to be added to about 30 dependency arrays.
- **Signal 2, ownership moved.** Status display moved from the context value to a store subscription in the footer. Five places now repeat `getStatusPreviewText() ?? status` by hand: `StudioWorkspace.tsx:2227` (stop effect) and `:2854`, and `ArrangementMarkerRow.tsx:286`, `:467`, `:495`.
- **Signal 3, the same region changed repeatedly.** Rounds 327 and 328 both reworked this region (flush semantics, the same-text guard, the layout-effect clear).
- **Keep it for now.** It is one lifecycle. Adopting on flush is what lets `statusAfterGestureRelease` and the refusal messages see the shown text. Splitting it mid-feature risks the aria-live and remount behaviour that DP17–DP19 just pinned down.
- **Proposal for the planner** (one bounded task, medium cost; this connects to D-29z915 "fourth store"): move status ownership into `lib/arrangement/status-store.ts` with a provider-internal hook. That means the reducer, the preview store, flush/adopt, and one `getShownStatus()` helper. Replace the five inline `??` reads with the helper. The `useArrangement()` shape stays the same: `status`, `statusKey`, `setStatus`, `previewStatus`, `getStatusPreviewText`. Done when DP9a–DP19 and SP1–SP3 pass unchanged, plus a browser probe for suggestion 1. Deciding not to refactor yet is also an acceptable outcome.

### Alternative Approach (critical logic: Studio gesture and status pipeline)
- **Current:** a separate status-preview store, adopted into the reducer when the next committed write happens, and cleared in a layout effect after commit.
- **Option 1:** keep `setStatus` on every move, but put the status in its own context so the provider doesn't re-render. This is simpler with no adopt logic, but it needs a context split and the reducer still runs on every move.
- **Option 2:** status only on release. The doc rejected this because it changes what `aria-live` announces mid-drag.
- **Verdict:** the current approach is the right one. It is the only option that keeps HEAD's announcement behaviour and still meets the ≤ 24 budget. Its remaining risk is the lane ordering in suggestion 1, which only a browser test can check.

### Score: 8/10