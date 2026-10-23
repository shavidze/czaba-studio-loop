COMMIT: OK

## Code Review: ArrangementLibrary.tsx + library-focus-handoff.test.tsx + docs 094/095

**What I checked:** the diff, both new files, `SECURITY_AUDIT.md`, `ERROR_TAXONOMY.md`, `architecture-checkpoint.md`, the Enter/typing guards in `StudioWorkspace.tsx`, and `verify.log`. In the log, the test files show 149/149 and tests 2324/2324 passing, and the build succeeded. This reviews the diff only, not the whole module.

**Auth, purchase and download code:** nothing in those areas is touched. The four paths are one component, one test and two docs.

### Critical Issues
- None.

### Suggestions (ranked)
1. **Low: mouse clicks in Safari and Firefox on macOS (existing gap, not a regression).** `ArrangementLibrary.tsx:214-215` and `:220`. The handoff only starts when `document.activeElement === event.currentTarget`. In those two browsers a mouse click doesn't focus a `<button>`, so after a mouse click on ◀ or × focus still ends up on BODY, and the next Enter adds a clip, same as before. The keyboard path works in every browser, because a keyboard-activated button always has focus. The 095 doc's evidence is Chromium-only.
   - **Fix (next round, proposal):** add a WebKit or Firefox probe to C's LF-MOUSE row. If the hazard reproduces, consider starting the handoff when `activeElement` is BODY *or* the button. The current check `document.activeElement === event.currentTarget || document.activeElement === document.body` would do it, as long as LF5b's "nothing focused, stays on BODY" contract is changed deliberately.
2. **Low: the × repeat guard does almost nothing.** `ArrangementLibrary.tsx:466`. `clearLibrarySearch` moves focus to the input during the first keydown's click, so held-Enter repeats land on the input. There, `handleSearchKeyDown` ignores Enter and the workspace handler returns early via `isTypingTarget` (`StudioWorkspace.tsx:1683`). It's harmless and keeps the convention consistent; just be aware that LF8's × assertions test the guard on its own, not a real user path.
3. **Low: a11y on the ◀/▶ toggles (existing).** `:420-447`. They have no `aria-expanded` or `aria-controls`. With the handoff in place, a screen reader now announces "ბიბლიოთეკის გახსნა/დაკეცვა" on the partner button, which is good, but the state is still only implied by the label. Proposal: `aria-expanded={!isCollapsed}` on both buttons. This is a separate task; `data-testid` and the labels stay the same.
4. **Info: doc 095 status is stale.** `095-...md:4` still says "C-ის შემოწმებას ელოდება" although c-round-110 is PASS. This matches the established pattern (094's status is fixed this round), so it's fine to fix in round 111.
5. **Info: the `MouseEvent` type import shadows the global `MouseEvent` in this file.** Today that's safe: the file uses `globalThis.PointerEvent` for native events and nowhere uses the global `MouseEvent`. If someone later adds a native mouse listener here, they'll need `globalThis.MouseEvent`.

### Good Practices Found
- **Event ordering (what tests can't fully prove).** The layout effect runs before the dock's passive cleanup, so ⤢ never takes focus from ▶. LF10 covers this, and the doc reasons through it in its sequence diagram.
- **Focus is only moved when it would otherwise be lost.** The handoff runs only when `activeElement ∈ {body, null}` and `isConnected` is true. It never takes focus from something else (LF5, LF6, LF7). The ref is cleared on every render, so a stale handoff can't fire later. The doc's S3 case is already called out.
- **No new state.** It uses refs only, so the render budget is unchanged. The effect without a deps array is intentional and cheap: one ref read per render.
- **No scroll jump.** `preventScroll: true` fixes the 243 px `scrollLeft` jump, confirmed in Chromium and checked by LF11.
- **Repeated Enter only gets `preventDefault`, no `stopPropagation`.** The workspace's Enter handler already ignores `HTMLButtonElement` targets (`StudioWorkspace.tsx:1972-1975`), so a held Enter on ▶ can neither bounce focus back and forth nor add a clip (LF9).
- **No leaks.** No new listeners or timers. The only new effect has no subscription to clean up.
- **Code rules:** strict TS, no `any`, no type assertions in production code (the test uses `instanceof` guards), semicolons, no comments. Class names and tokens are byte-identical; no custom CSS.
- **Tests:** LF0 first proves the hazard exists in the test harness. Then fail-before results, the mutation table m1–m6 with controls, and separate negative cases.

### Architecture note
- **Signal 4 (new focus state and lifecycle in the existing owner):** `ArrangementLibrary.tsx:170-231`. The component gains 4 refs, a layout effect and 3 handlers for focus handoff. The same pattern already exists in `ArrangementTransport` (093).
  - **Keep, for now.** It is one lifecycle, tied tightly to which buttons are mounted, and it adds no props.
  - **Proposal for the planner:** once a third owner needs the same "self-unmounting or self-disabling control keeps focus" logic, write a single bounded task: a `useFocusHandoff(partnerRefs)` helper in `app/hooks/`, used by `ArrangementTransport` and `ArrangementLibrary`. Acceptance would be LF0–LF11 plus `self-disabling-focus` and `floating-video` passing unchanged, with the render budget unchanged. Until then, extracting isn't worth it.
- **Signal 3 (the same region keeps needing costly changes):** focus loss onto BODY (093, 095 and the S5 case in TODO) keeps coming back because of the workspace contract that "Enter on BODY adds a clip". That is the root cause, and it's the user's open question B-R107-ENTER-ON-BODY in the frozen `StudioWorkspace.tsx`. The decision belongs to root or the user, not to this round.

### Alternative Approach
- **Current:** the clicked toggle marks its partner in a ref, and a layout effect focuses the partner (or, for ×, the input) after it mounts.
- **Alternative A:** keep both toggles mounted and hide one with CSS. This changes the rail and panel layout, the width transition and the floating-video measurements. It's riskier.
- **Alternative B:** change the workspace so Enter on BODY does nothing. This fixes the whole class of bug (S5 included), but it's frozen and needs the user's decision.
- **Verdict:** the current approach is right within the frozen scope: small, measured and well guarded. B is the long-term fix and should be raised with the user.

### Score: 9/10