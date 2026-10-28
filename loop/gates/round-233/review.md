COMMIT: OK (focus rescue for the hidden Overview; nothing blocks the commit)

The change does one thing. When keyboard focus is on the Overview and you hide it with Ctrl+Alt+O, focus moves to the next button in the video dock before the Overview is removed. It no longer drops to `body`. No auth, purchase or download code is touched. The verify log shows 208 test files and 3000 tests passing, including `overview-visibility-ui` (7) and `render-budget` (7). This is a review of the diff only, not a full audit of `StudioWorkspace` or `ArrangementVideoDock`.

## Code Review: StudioWorkspace.tsx (+ OV-T6, render-budget, doc 181)

### Critical Issues
- None.

### Suggestions (ranked)
1. **Low: production code finds the dock by its test id** (`StudioWorkspace.tsx:431`). It queries `[data-testid="arrangement-video-dock"]`, so renaming a test id would silently break the feature. The project already uses a semantic attribute for this (`data-timeline-overview`, `ArrangementOverview.tsx:306`).
   **Fix:** add `data-video-dock=""` to the dock `<section>` (`ArrangementVideoDock.tsx:882-887`) and query that. Leave the test id for tests.
2. **Low: the timeout bump hit the wrong test** (`render-budget.test.tsx:377`). Doc 181 says the test that needed headroom already had `15000`. This hunk adds it to a different test that takes about 1 s. It does no harm but has no reason behind it, and it will confuse anyone reading `git blame`.
   **Fix:** reverting is preferred. Otherwise the planner (B) explicitly accepts it and closes C-R232-01 as invalid.
3. **Low: no fallback if no button follows** (`StudioWorkspace.tsx:438-441`). If every following button were disabled, focus would still fall to `body`. That can't happen today because the expand button is always rendered and enabled.
   **Fix:** none needed now. If the dock layout changes, fall back to the hidden slot's container or the dock `<section>` with `tabIndex={-1}`.
4. **Info: screen reader order.** Focus moves first, then `setStatus`. The status region is `aria-live="polite"` (`StudioWorkspace.tsx:2670`), so the "Overview hidden…" message should queue after "Expand video, button". The order is correct. Add a screen reader check (VoiceOver/NVDA) to the manual Tech Lead checklist, next to TLM-R232-ALTGR-WIN and TLM-R232-MAC.
5. **Info: stale doc.** Doc 180 l.42–51 still describes the round-232 rule that focus is not moved. This is already tracked as B-R232-DOC180-FOCUS-STALE in doc 181; I'm repeating it so the planner sees it here too.

### Checked and fine
- **Real-browser event order:** the handler runs on `window` keydown (bubble phase), and the Overview's own key handler only reacts to ArrowLeft/Right. After focus moves, the keyup of O lands on the button. Buttons only activate on Space keyup or Enter keydown, so nothing gets clicked by accident.
- **Floating-video flag:** focusing the expand button runs `handleFloatFocus` (`ArrangementVideoDock.tsx:929`) even when the video is docked. That is the same path as clicking the button, and `handleFloatBlur` clears the flag on the next blur outside the box. In floating mode, the "Return" button target matches the existing return-focus logic (l.777).
- **Leaks and render cost:** no new listener, timer, effect or state. The helper runs only on the hide path and only when focus is inside the Overview.
- **Existing guards:** AltGr, Shift, key repeat, pointer gesture, text field and open sheet all stay in the same order. The helper only runs after them.
- **TS strict, semicolons, Tailwind:** `closest<T>` and `querySelectorAll<T>` are generics, not type assertions. No `any`, no new classes or colours.

### Good Practices Found
- Focus moves before unmount, while the element still exists. Doc 181 explains why this order is required.
- Showing the Overview again doesn't move focus, because nothing is unmounted.
- `preventScroll: true` keeps the view from jumping. The focus target follows Tab order (WCAG 2.4.3).
- OV-T6 covers focus elsewhere (Play), docked video and floating video. Removing the helper call (mutant MU-1) turns it red.
- Doc 181 openly records the timeout mismatch instead of hiding it.

### Architecture note
- **Signal 2 (coupling):** `StudioWorkspace.tsx:425-442` depends on the dock's internal DOM order and its set of buttons. The dock already tracks focus for that area (`expandButtonRef`, `floatFocusRef`, `ArrangementVideoDock.tsx:754-793`) and renders the `overview` slot that gets removed.
  - **Keep for now:** there is one call site, OV-T6 covers it, and it adds no state or lifecycle.
  - **Proposal for the planner (not approved scope, low cost and risk):** have the dock expose `rescueFocusFromOverview()` or accept an `onBeforeOverviewHide` callback. The "next Tab stop after the slot" rule would then live with the component that defines that order. Acceptance: OV-T6 unchanged, MU-1 still red, no new Tab stop, audio/undo invariants untouched.

### Alternative Approach
- **Current:** a document-order search for the next enabled, tabbable button in the dock, called before the hide.
- **Alternative A:** the timeline scroller as the target. Doc 181 rejected it correctly: it has no `tabIndex`, so `.focus()` does nothing. Adding one would create a new Tab stop and trigger `revealKeyboardFocusBelowChrome`.
- **Alternative B:** keep the hidden slot focusable (`tabIndex={-1}`) and move focus there. Focus would stay where the Overview was, but the slot is `aria-hidden`, so a screen reader would announce nothing useful.
- **Verdict:** the current approach is better because it follows Tab order and lands on a real control with a name. It would improve further if the logic moved into the dock (see Architecture note).

### Score: 8.5/10