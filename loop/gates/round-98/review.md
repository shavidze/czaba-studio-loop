COMMIT: OK. The change is one 5-line `onKeyDown` guard on the toolbar Export button, plus 5 new tests and docs. It touches no auth, purchase or download code. C passed the round (c-round-98.json) and verify passed: 143 files and 2228 tests, typecheck, lint and build. The `useArrangement… must be used within an ArrangementProvider` stack traces in verify.log are expected output from `context-hygiene.test.tsx` and are not failures.

## Code Review: ArrangementTransport.tsx (+ export-toolbar-hold-enter.test.tsx, docs 085/086)

### Critical Issues
- None.

### Event ordering, leaks, regressions (what the tests cannot catch)
- **Event order in a real browser:** In Chromium and Firefox, Enter fires the button's click on keydown. Calling `preventDefault()` on that keydown cancels the click. So the guard (`ArrangementTransport.tsx:249-253`) blocks exactly the auto-repeat that lands on Export after focus comes back from the dialog. Space fires on keyup, so it is correctly left alone.
- **Order with the global shortcut:** The global Enter handler at `StudioWorkspace.tsx:1961-1962` already ignores button targets. The new `preventDefault` doesn't change it, and no `stopPropagation` is called. The gesture-block branch (`StudioWorkspace.tsx:1748-1754`) also calls `preventDefault` on Enter during a gesture. Doing it twice is harmless.
- **Listener/timer leaks:** None. It's a React synthetic handler with no effect, timer or ref.
- **Render cost:** One new closure per `ArrangementTransport` render. The component already creates `() => seekTo(0)` and `onChange` the same way, and the position text is written through a ref (`ArrangementTransportPosition`), so this is negligible. render-budget is green.
- **Accessibility:** Keyboard activation still works: a fresh Enter, Space and mouse click all open the dialog. A screen-reader virtual click sends no keydown, so the guard doesn't affect it. Role, name and focus ring are unchanged.
- **Tailwind/tokens:** No class changes.
- **TS strict:** No `any`, no type assertions, semicolons present.

### Suggestions (ranked, none blocking)
1. **`ArrangementTransport.tsx:250` vs `ArrangementExportDialog.tsx:542`:** The two guards are written differently: `event.repeat` here, `event.repeat === true` there. They behave the same, but one style is better. Do this together with GATE97-S4, which is already scheduled for the footer round. Don't change the frozen dialog file in this round.
2. **`export-toolbar-hold-enter.test.tsx:219-225`:** TH1 copies the body of `closeAfterClick` by hand so it can also check the spy count. Fix: have `closeAfterClick` return the dialog/close handles, or add the spy assertion inside it.
3. **`export-toolbar-hold-enter.test.tsx:21-98`:** The fakes (`FakeAudioContext`, `FakeAudioBuffer`, `FakeResizeObserver`, fake clock) are pasted in again. This is test hygiene only; it's covered in the Architecture note below.
4. **Doc 086, "მეორე საზღვარი" section (Safari/macOS Firefox):** In those browsers a mouse click doesn't focus the button, so focus can return to `body`, and the global shortcut doesn't check `repeat`. This is correctly marked as existing behaviour that has been handed to B. Keep it in B's backlog, because the risk is real outside Chromium.

### Good Practices Found
- The guard is as narrow as it can be: only Enter, only `repeat`, and only on the dialog's one opener. TH3 and TH5 prove nothing else is affected.
- No `stopPropagation`, and TH4 checks that document listeners still see the event.
- The doc is honest that jsdom doesn't turn keydown into a click, so TH1 checks the return value of `fireEvent.keyDown`. The real click suppression is shown in Chromium (C row CLOSE-HOLD).
- Fail-before and the mutation matrix are documented. The test cleans up its listeners in `afterEach`.

### Architecture note
- **Signal 3 (one region changed repeatedly), Export hold-Enter flow:** `ArrangementExportDialog.tsx:541-545` (round 97) and `ArrangementTransport.tsx:249-253` (round 98) got the same guard, and the footer round is already planned to touch it again. **Keep:** there are only two call sites, the code is 4 lines, and a shared helper would be a one-off abstraction. Audio timing, refs, the gesture lifecycle and the shape of `useArrangement()` are untouched. Cost: low.
- **Proposal for the planner (test hygiene, not product code):** move the repeated jsdom audio fakes and the `ArrangementProvider` mount into one test fixture under `app/lib/arrangement/__tests__/`. Acceptance: the new file and at least two existing Studio UI tests use the fixture, and test counts and render-budget don't change. This is a proposal, not approved scope.
- This review covers only the diff. I have not audited the whole module.

### Alternative Approach (critical logic: keyboard/dialog lifecycle)
- **Current:** a stateless repeat-Enter guard on the opener button.
- **Alternative A:** delay focus restore in the dialog until keyup. This fixes the cause in one place, also covers the Safari `body` case, and keeps the opener simple. The cost is changing the frozen dialog's focus effect and adding a keyup listener lifecycle.
- **Alternative B:** make the global Enter shortcut in `StudioWorkspace.tsx` ignore `event.repeat`. This covers the `body` case but doesn't stop Export from reopening.
- **Verdict:** The current approach is right for this round. It has no state or timers, it closes the path seen in Chromium, and it respects the frozen scope. Alternatives A and B should be scheduled together later for non-Chromium focus restore. They add to the guard; they don't replace it.

### Score: 9/10