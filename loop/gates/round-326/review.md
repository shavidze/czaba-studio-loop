COMMIT: OK

## Code Review: round-326 (PERF-DRAG-PREVIEW stage a): preview store for audio trim and same-lane move

I read the diff, all four untracked files, the `ArrangementContext` history, gesture and preview paths, and `ArrangementClip`'s finish and abort paths. I did not review the whole module. The verify log shows 242 test files and 3545 tests passing, plus a successful build. The `Error:` lines in the log come from tests that expect a missing-provider throw.

**Out-of-scope check:** this candidate touches no auth, purchase, download, protected-file or API-client code. `preview-store.ts` imports only `zustand/vanilla`, arrangement types and `model.projectEnd`.

### Critical Issues
- None.

### Suggestions (ranked)
1. **Possible one-frame flash when the preview is cleared outside a pointer event** (`app/contexts/ArrangementContext.tsx:854-855`, `:1886-1887`)
   - **Problem:** `updateHistory` runs `setHistory(next)` and then the zustand `clearPreview()`. Inside a pointerup or keydown event, React renders both in one commit, so the normal finish path at `ArrangementClip.tsx:802-874` is fine. Two paths run outside an event, though: the blur/window-pointerup abort, which goes through `setTimeout` (`:1923`), and an unmount mid-drag (`ArrangementClip.tsx:467-472`). There, React renders the store change first, with sync priority, and `setHistory` later at default priority.
   - **Result:** the overview, readout, project end and lanes can show the old committed state for one frame. In the abort case old state equals `gesture.before`, so nothing visible changes. In the unmount-convergence case the old geometry can flash.
   - **Fix:** clear the preview after React commits the new history. Either add `useIsomorphicLayoutEffect(() => previewStore.getState().clearPreview(), [history])` and drop the call from `updateHistory`, or run the convergence branch through `flushSync`. The layout-effect version needs a check that DP3 and DP8a stay green. Severity: Low.
2. **Unmount mid-drag commits the edit with no Undo entry** (`ArrangementContext.tsx:1886-1888` together with `ArrangementClip.tsx:467-472`)
   - **Problem:** the convergence promotes the preview to `present` without adding anything to `past`. HEAD already behaved this way (`previewArrangement` wrote the state on every move), so this is not a regression. The new code does make the behaviour explicit and intentional.
   - **Fix (separate task, not this round):** on convergence, either return to `gesture.before` or commit with the gesture's label. That decision belongs to the owner of Undo atomicity.
3. **The optional prop can hide missed wiring** (`ArrangementClip.tsx:126`, `:425-427`)
   - **Problem:** `previewClipGeometry ?? previewArrangement` silently brings back the slow path. If a future caller forgets the prop, the perf gain disappears and no test fails.
   - **Fix:** in stage b or c, make the prop required and pass it explicitly in `gesture-reentry.test.tsx`. Low.
4. **The lane selector runs once per lane on every move** (`ArrangementContext.tsx:4417-4424`)
   - Each lane runs `selectPreviewLaneClips` on each preview set, so each move costs (number of lanes) × (number of clips). That is negligible at today's scale, and `useShallow` means lanes that didn't change don't re-render. Record it for stage c, where lane memoisation and an extent store are planned. No action now.
5. **An unrelated flake fix is bundled in** (`insert-marker-ui.test.tsx:627`)
   - The IM24 test now freezes `Date.now`. It's justified: doc 232 documents it with the MU-DELAY-60 mutant, and `afterEach` → `vi.restoreAllMocks()` at `:174` undoes it. Acceptable as is. Naming it in the commit body would help.

### Good Practices Found
- **Why the fix works:** `historyRef` keeps following the preview, so `getArrangement()`, the loop-wrap resync (`:1334`), the video-import wait (`:2619`) and `commitArrangement(getArrangement(), …)` read the same values as on HEAD. Playback timing doesn't change, and no history effect depends on intermediate states (I found no effect keyed on `history`).
- **The selectors are safe:**
  - `setPreview` skips notifying when the reference is unchanged.
  - `clearPreview` skips when the preview is already null.
  - Selectors that return arrays are wrapped in `useShallow`.
  - Project end is subscribed as a primitive number.
- **Gesture order is right:** `finishGesture` releases first and commits second, in the same discrete event, so the convergence and the commit land in one React commit.
- **Stage a is narrow:** video clips, fade, group, cross-lane moves and every return to `gesture.before` stay on the old path.
- **No leaks:** no new listeners, timers or `any`, and no type assertions. Semicolons are present. No markup or class changes, so accessibility and Tailwind tokens are unaffected.
- **Tests and budgets:** the nine mid-drag test reads moved to `getArrangement()`, including one assertion that was passing for the wrong reason, and the number of `expect(` calls didn't drop. The `move-restarts == 0` budget is now asserted.

### Architecture note
- **Signal 2/4 (ownership, state lifecycle):** `ArrangementContext.tsx:751`, `:1858-1865`, `:1884-1888`. The arrangement now lives in three places: `historyRef`, React `history`, and the preview store, with `publishedHistoryRef` tracking which has been written to React. The invariant that ties them together sits inside `beginPointerGesture`'s release.
  - **Keep it in this round.** It sits next to the gesture lifecycle and the Undo/Redo refs, and `useArrangement()` keeps its shape. Pulling it out now would put the audio timing and refs at risk.
- **Signal 3 (one region changed repeatedly):** each perf round has edited the same provider-nesting block and hook set. Range came in round 318, selection in 323-324, preview now. Each time the change touched the large `ArrangementContext`.
  - **Proposal for the planner:** one bounded task, after stage c. Move the external-store wiring (the five store contexts, the provider nesting at `:4307-4323`, and the `useArrangementX`/`useArrangementXStore` hooks) into one co-located module.
  - **Acceptance:** the `useArrangement()` shape doesn't change, no test file changes beyond imports, and DP1-DP9, SS8a/SS8b and the render-log tests stay green.
  - **Cost and risk:** low cost; the risk is limited to import paths.
- This note is a proposal for the planner, not a finding to fix in this round.

### Alternative Approach (critical logic: the drag gesture and the history it commits)
- **Current:** a ref-shadowed preview plus an external store, with convergence on gesture release. Cheap per move, playback unaffected, Undo stays atomic on the normal path.
- **Alternative A:** keep `setHistory` and wrap preview updates in `startTransition` or `useDeferredValue`. That's less code, but every move still re-renders the whole tree. It only postpones the render cost, and the dragged clip could lag behind the pointer.
- **Alternative B:** move the dragged clip only through DOM styles inside `ArrangementClip`, with no store. That's the cheapest option, but the overview, readout, detail panel and project end would stay stale until release, which breaks the DP6 and DP7 behaviour.
- **Verdict:** keep the current approach. It is the only one that keeps live secondary views at about 0.23× the per-move render cost of HEAD. The only change I'd make is to suggestion 1 (when the preview is cleared).

### Score: 8.5/10