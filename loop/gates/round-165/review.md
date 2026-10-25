COMMIT: OK

## Code Review: ArrangementMarkerRow.tsx + markers-ui.test.tsx (round 165)

The diff is small and correct. Before an Enter in the editor is accepted, `settleEditor` now checks whether a pointer gesture is active, and that check runs before `settledRef.current = true` and `setEditor(null)`. So the editor stays open with the typed text, and the next Enter after release commits it once. F2 now goes through the same `runUnlessGesture` check as M, Add, the arrows, Delete and the menu's Rename, so it no longer gets around the block. No auth, purchase or download code is touched; the four paths are one component, one test file and two docs. `verify.log` shows 171/171 test files passing, `markers-ui.test.tsx` with 25 tests, and both builds passing. I didn't find `c-round-165.json` among the gate artifacts, so I'm relying on your statement that C passed.

### Critical Issues
- none

### Suggestions (ranked)
1. **Stale doc status.** `docs/implementation/2026/quarter-IV/134-studio-marker-gesture-commit-guard.md:4` still says `In Progress (awaiting C round 165)`, but C round 165 has passed. Fix: change it to `Completed (C round 165 PASS)` in this commit, or update it in the next round as was done for doc 133. This is the only thing I'd change before committing, and it doesn't block.
2. **Screen-reader repeat (Low, a11y).** `ArrangementMarkerRow.tsx:291-293`: if the user presses Enter several times while still dragging, each press sets the same `GESTURE_EDIT_BLOCKED_MESSAGE`. If `setStatus` writes to a live region, the same text usually isn't read out again, so later presses give no feedback. This affects every `runUnlessGesture` caller, not just this diff. Fix (separate task): reset the live region or add an invisible nonce so a repeated message is announced again.
3. **Remaining loss path (already documented, Low).** `:298-301`: after a blocked Enter, a Tab or blur while the button is still held closes the editor and the typed name is lost (MU13 path). Doc 134's TODO already records this, and it belongs with `B-R164-COMMIT-DURING-PREVIEW`. Nothing to do this round.
4. **Weak blur check in MU15.** `markers-ui.test.tsx:74-76`: the blur assertion can't catch a double commit, because the input is already unmounted. The doc admits this. Fix: delete it or rename it as a smoke check so nobody treats it as protection against double commits.
5. **TS workaround in tests (`:53-67`, repeated in MU16/MU17).** `const releaseGesture: (() => void) | null = release;` gets around control-flow narrowing after the assignment in the closure. It doesn't break strict mode and it isn't an `as` assertion. A small helper like `holdGesture(api)` that returns `{ release }` would remove the repetition. Optional.

### Real-browser / lifecycle check
- **Event order:** pointerdown on a focusable target usually blurs the input before the gesture is claimed, which leads to the existing MU13 path. The new Enter branch only applies when focus stays in the input during the drag (the Shift+Tab → F2 repro in doc 134). The order is handled correctly.
- **Leaks:** no new listeners, timers or effects. The guard reads `isPointerGestureActive()` at each press and caches nothing.
- **Render cost:** one `setStatus` per blocked press. Negligible.
- **Tailwind, tokens, markup:** unchanged. TS strict holds: no `any`, no assertions. Semicolons are present.
- **Escape during a gesture:** unchanged and now covered by MU16.

### Good Practices Found
- The guard is placed before `settledRef` is set, and the m184 mutation check confirms that order matters.
- The fix reuses the existing `runUnlessGesture` and message instead of adding a new string.
- The tests were written first, and each fix (K1, K2) has its own failing mutation (m182, m183).
- MU16 checks that the arrangement object is unchanged (`toBe(mounted)`), not just the label.

### Architecture note
- **Signal 2/4 (ownership/lifecycle):** `ArrangementMarkerRow.tsx:279-301`. The rule "keyboard commits are blocked while a gesture is active" now lives in this component at 7+ call sites. The real cause is in `ArrangementContext.commitArrangement`, which accepts commits while a gesture preview is being built from `gesture.before` (`B-R164-COMMIT-DURING-PREVIEW`). **Keep for now:** the context is a protected owner, and moving the rule would touch gesture lifecycle and Undo atomicity. **Proposal for the planner (not approved scope):** one bounded task in which `commitArrangement` either rejects or queues commits while a gesture is active. Acceptance criteria: MU13–MU17 and the drag/Undo tests stay green unchanged, the Move clip → Undo order is preserved, and the public shape of `useArrangement()` doesn't change. Ownership: `frontend-architect` checkpoint first.

### Alternative Approach
- **Current:** Enter during a gesture is rejected and the editor stays open with the typed text; the user commits after releasing.
- **Alternative A:** Queue the commit and apply it automatically on pointerup. This is better UX, but it creates a new lifecycle in this component and an ordering question against the gesture's own commit (Move clip vs Rename on the Undo stack).
- **Alternative B:** Close the editor the same way blur does. This loses the typed text with no Undo.
- **Verdict:** Current is the right choice here. It's minimal, keeps Undo atomic and loses no data. Alternative A should only be considered as part of the context-level task above.

### Score: 9/10