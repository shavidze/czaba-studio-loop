COMMIT: OK

## Code Review: round 303, NAME-AND-HINT stage b (one-time name bar hint)

I reviewed the 9 paths in `paths.txt`, the diff, the new test file `name-bar-hint-ui.test.tsx`, and the code around the change: `ArrangementContext.tsx:1631-1778`, `status-announcement.ts` and the status output at `StudioWorkspace.tsx:3137-3143`. `verify.log` shows 232/232 test files passing and the build passing (`✓ built`). This covers only the diff, not the whole module.

### Critical Issues
- None.
- No auth, purchase or download code is touched. All changes are inside `contexts/ArrangementContext.tsx`, `lib/arrangement/**` and `docs/implementation/**`.

### Suggestions (ranked)
1. **Low, accessibility/UX: the hint only describes a mouse action.** `strings.ts:293` and `ArrangementContext.tsx:1636`. The hint also appears when the clip was added with **Enter** (`addSourceToActiveTrack`), but its text only says to drag. I didn't confirm whether clips can be moved from the keyboard; a quick search of `components/arrangement` didn't turn up a clip-move shortcut. That means a keyboard or screen reader user hears an instruction they can't act on.
   **Fix (product decision, not this round):** ask Saba whether the Enter path should get a version of the hint that names a keyboard alternative, if one exists, or none at all. Add this as a follow-up next to SABA-Q-NAME-HINT-LIFETIME.
2. **Low, test maintenance: the same helper is written 3 times.** `firstAddStatus` appears in `grid-snap-loop-drop.test.tsx:233` and `status-lifetime.test.tsx:121`, and `firstPlacedText` in `tempo-seed-ui.test.tsx:196` is the same idea.
   **Fix:** move one `withFirstAddHint(text)` helper into `__tests__/helpers/`. Behaviour doesn't change.
3. **Info, the hint's lifetime.** `ArrangementContext.tsx:682`: the flag is a `useRef` tied to the provider, so the hint appears once each time the provider mounts. That includes projects that already have clips when they load. This matches the doc and the open SABA-Q-NAME-HINT-LIFETIME question. Not a bug.
4. **Checked, no problem.** The flag is set before `setStatus`, which would matter if the update could be dropped. It can't be:
   - `reduceArrangementStatus` (`status-announcement.ts:18`) only drops a plain-text update when a gesture is in progress and the text is unchanged.
   - Both add paths already return early through `refuseEditDuringGesture()` when a gesture is in progress.
   - The flag is changed inside the click/key handler, not during render, so React StrictMode can't trigger it twice.

### Good Practices Found
- The hint goes out in the same `setStatus` call as the "clip added" text, so the polite live region (`aria-live="polite"`, `key={statusSequence}`) makes one announcement instead of two competing ones.
- The tempo-seed text that gets appended afterwards (NB6) keeps its order without changing the seed code.
- The flag is only set on the two successful paths. Every refusal (not loaded, failed source, video lane, blocked drop, during a gesture) leaves the hint unused, and NB4/NB4b plus mutants m6–m8 cover this.
- Undo doesn't bring the hint back (NB5). No timers, listeners or `localStorage` are involved, so there is nothing to leak.
- `withNameBarHint` is a `useCallback` with empty deps and is listed in both deps arrays. It adds no re-renders, because the context value doesn't depend on it beyond the two callbacks that already existed.
- No new `any`, `@ts-ignore` or type assertions. Statements end with semicolons. There are no style changes; the footer has `flex-wrap` and `break-words`, so the longer status line wraps.
- The 12 existing exact-text checks were updated rather than deleted, and still compare exact strings.

### Architecture note
- **Signal 4 (new state in an existing owner):** `ArrangementContext.tsx:682` adds `nameBarHintShownRef`. → **Keep it.** It's a one-bit flag with the same lifetime as the status and the add path. Moving it out would push the ref through extra props and split up the add flow. The cost of keeping it is low.
- **Signal 3 (repeated costly changes to one region):** the exact "clip added" status text is shared by many tests. One wording change broke 12 assertions in 5 files. → **Proposal for the planner (one bounded task):** create `__tests__/helpers/status-expectations.ts` with `expectedClipAdded({ title, track, time, suffix, first })` and switch the existing 12 assertions plus NB1–NB8 to use it. Ownership: tests only, no product code. Acceptance criteria: the same tests pass, exact equality stays, and mutants m1–m5 still turn their NB rows red. This is a proposal only, not a fix for this round.

### Alternative Approach (status/UX logic)
- **Current:** a ref on the provider plus a string wrapper, applied in the same `setStatus` call on the two successful add paths.
- **Alternative A:** a second `setStatus` with the hint (or a timer). Rejected: the second write would replace the "clip added" text, and a screen reader might skip the first.
- **Alternative B:** persist the flag in `localStorage` (once per browser). It's a product question that is already logged; it adds storage and SSR edge cases.
- **Alternative C:** a visual tooltip or coachmark on the clip's name bar. It would point straight at the target, but it means a new component, design tokens and focus management.
- **Verdict:** the current approach is the right choice for this round. It's simple, makes one announcement, and doesn't change behaviour or Undo. Consider C later only if testing shows people still drag clips by the body.

### Score: 9/10