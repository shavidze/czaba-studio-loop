COMMIT: OK — nothing blocks this commit. The changes are internal to Studio, with no touch of auth, purchase or download code.

## Code Review: round 324 — PERF-8b selection store (42 paths)

**What I checked:** I read the full `diff.patch`, the new `selection-store.ts`, `selection-wrappers-render.test.tsx` and doc 231. I also read every place in `ArrangementContext.tsx` that writes the selection, including the ones after an `await`, and grepped `app/` for leftover reads of `selectedClipId` and `selectedClipIds` (none were found). zustand is 5.0.16. The 205 lint warnings and the act()/NaN warnings in `verify.log` are not from this diff. This is a review of the diff only, not a full check of the module.

### Critical Issues
- None.

### Suggestions (ranked)
1. **Doc 231 says "Completed" but still lists an open question.** Lines 71–72 say claim K19 is still waiting for B's decision, while line 4 says "Completed (C round 324 PASS)". **Fix:** record B's decision on K19 in the doc, or mark the status as completed with that one item pending.
2. **One sentence in doc 230 is now misleading, and a future change could cause a brief glitch.** The new decision line in `230-perf-range-store.md` says range and selection "commit separately until PERF-8b", which suggests PERF-8b fixes this. After this change, range and selection are both external stores and commit together. The edit history (`setHistory`) is still React state, though.
   - **When this matters:** after an `await` (outside a user event), React commits the store update and the state update separately. `ArrangementContext.tsx:2629-2631` (adding a video) writes the selection after an `await`. It is safe today because it clears the selection to `null`.
   - **Risk:** if a future async change selects a clip that it just created, the readout (`StudioWorkspace.tsx` ~640) and the detail panel (~733) would show an empty state for one frame.
   - **Fix:** rewrite the sentence in doc 230 and add a one-line rule to doc 231: async code must not select a clip it just created until the history update is visible, or must defer the selection write.
3. **`selection-store.ts:41` repeats `candidateClipIds.includes` inside `filter`.** Every lane and every collapsed group header runs this on each selection change, including every move of a marquee drag. That costs O(selected × clips). It is no worse than HEAD (HEAD did `selectedClipIds.includes` for each clip), but a lane with no selected clips still pays for it. **Fix:** build a `Set` of candidates, or exit early when none of the selected ids belong to this lane. This is for PERF-10, not a blocker.
4. **`selection-store.ts:41,45` joins ids with `'\u0000'`.** This is safe only if clip ids can never contain U+0000. The ids are generated, so this holds today. **Fix:** state the assumption in doc 231 next to the "selector rule".
5. **`ArrangementDetailPanelWithSelection` (`StudioWorkspace.tsx` ~733) reads the whole selection array.** Any change, including a pure reorder, re-renders it. That is correct, because the primary clip is `.at(-1)`. I'm noting it only so nobody narrows it to `.length` later.
6. **Doc 230 style:** the new ruling line is in English and lacks the `- **D-29z860:**` bold format the other rulings use. This goes against GEORGIAN_DOCS. **Fix:** translate it and use the same format.

### Good Practices Found
- **Selectors are safe for zustand v5:** they return the store's array, a primitive, or a boolean, and Sets are built in `useMemo`. Nothing can loop forever.
- **Repeat writes are dropped, and order counts:** writing the same selection in the same order returns the existing state, so nobody is notified. A change in order does notify, which keeps the primary clip (`.at(-1)`) correct (tested by SS7 and checked with mutants).
- **One store per provider** (`useState(() => create…)`), not a module-level singleton.
- **Keyboard and other handlers read the store at event time** (`getSelectedClipIds()`) instead of a value captured at render, so they don't read stale selection. The `useCallback` dependency lists were updated everywhere.
- **Browser event order:** every synchronous selection write (click, drop, keydown, Ctrl+A, undo) happens inside a discrete event. There, React's state update and the store update land in the same commit, so the screen can't briefly show mismatched data.
- **No leaks:** the change adds no listener, timer or effect. Subscriptions are created and cleaned up by `useSyncExternalStore`.
- **Accessibility and Tailwind unchanged:** the moved markup is identical (`aria-hidden` on the empty placeholder, `text-muted` and `text-foreground` tokens). No custom CSS, no `any`, no type assertions.
- **The removed `useArrangement()` fields were approved in advance** (D-29z894), and TypeScript proves no code still reads them.
- **Measured effect:** selecting another clip on the same lane went from 107 to 25 rendered components, and re-clicking the selected clip went from 92 to 0 (production perf run).

### Architecture note
- **Signal 2 (ownership/coupling)** — `ArrangementContext.tsx:679`: selection moved out of provider state into a store in `lib/`. **Keep it**: it follows the same pattern as the range store, doesn't change the audio, gesture or Undo flows, and has tests.
- **Signal 1 (mixed responsibilities)** — `StudioWorkspace.tsx:606-801`: four selection wrapper components (about 190 lines) now live inside the workspace file, which is the same item as `A-R322-ARCH-SELECTION-WRAPPERS`. **Proposal for the planner** (to do with PERF-10, not now):
  - Move the four wrappers into `components/arrangement/selection-readouts.tsx`.
  - Done when the exported names, the memo form and the SS8a/SS8b and R11-P1e tests stay the same.
  - At the same time, decide `SIG-R322-ACTIVE-TRACK-STORE` (whether `activeTrackId` joins the selection store or gets its own).
  - Cost: low. Risk: the render-log tests depend on component names, so the names must not change.

### Alternative Approach (critical logic: selection ownership)
- **Current:** a zustand store per provider; writers have the same signatures, handlers read it at event time, and components subscribe with selectors.
- **Alternative:** keep selection as `useState` and give it its own small React context (no zustand).
- **Verdict:** the current approach is better.
  - Every consumer of a separate context would re-render on any selection change, so the lane-level filtering (only lanes whose selected clips changed re-render) would be lost.
  - Handlers would still need a ref copy (`latestRef`) to read the latest selection, which is exactly the duplicate this round removed.
  - The store also matches the range store, so there is one pattern.
  - What the alternative would have kept is that history and selection always commit together, even after an `await`. That only matters for the future async case in Suggestion 2.

### Score: 8.5/10