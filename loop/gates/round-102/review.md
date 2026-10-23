COMMIT: OK. No blocking issues in the four candidate paths, and none of them touch auth, purchase or download code.

## Code Review: ArrangementExportDialog.tsx + export-dialog-footer.test.tsx (round 102)

### Evidence checked
- **`paths.txt`:** 4 paths. Only one is product code (`ArrangementExportDialog.tsx`); the others are one test file and two docs.
- **`diff.patch`:** read in full. I also read the component around the focusin guard (217–246) and the footer render (491–528).
- **`verify.log`:** typecheck is clean, `Test Files 144 passed (144)`, `export-dialog-footer.test.tsx (15 tests)` passed, and the build passed (`built in 6.48s` / `1.50s`). Lint shows only existing warnings in files this diff doesn't touch.
- **New doc** `090-…md`: read.

### Critical Issues
- None.

### Findings, most important first

1. **Low · cross-browser a11y (only Chromium was checked)**, `ArrangementExportDialog.tsx:512-522`. The phase text ("რენდერი" / "WAV-ის ჩაწერა") now reaches screen readers only through `aria-valuetext` on a native `<progress>`. A probe with B's CDP AX tree only proves this in Chromium. In any browser/screen-reader pair that ignores `aria-valuetext` on native `<progress>`, users lose the phase and hear only the percent. Before this change the visible `<p>` covered that case.
   **Fix (no code this round):** add a C browser row that checks the Firefox and WebKit accessibility trees for the bar's value text. If either drops it, swap `aria-hidden` for `role="progressbar"` on a div with explicit `aria-valuenow/min/max/valuetext`. Don't go back to the duplicate text.

2. **Low · real-browser event order, mouse**, `ArrangementExportDialog.tsx:233-242`. Measuring the card's bottom edge means a plain mouse click now scrolls more often than before. In the 1280 done state, before this change, clicking the `scope-project` card didn't scroll (the radio was above the footer). Now it scrolls about 16 px.
   - Chromium focuses the radio on mousedown, so the scroll happens before mouseup. I traced it through: the pointer still lands inside the same card (card ~54 px tall, radio in the middle, shift 16 px), so the click still activates the right option.
   - Clicking the label text focuses on click, after mouseup, so nothing is lost there.
   - This is the same item as `GATE89-S5`/`A-R88 #2`, which was already rated cosmetic, but it now triggers more often.
   **Fix:** only if UX objects. Skip the scroll when the focus came from a pointer (`:focus-visible` check, i.e. `target.matches(':focus-visible')`). Not needed for this commit.

3. **Low · edge case**, `ArrangementExportDialog.tsx:238`. `coveredBottom` has no upper limit. If a label card were ever taller than the visible space above the footer, scrolling to its bottom would push the focused control off the top of the panel. Today's cards are `p-3` with one or two lines, so this can't happen yet.
   **Fix:** when the card is taller than `footer.top - content.top`, fall back to `target.bottom`. Leave it for a future change that adds tall cards.

4. **Nit · TS clarity**, `ArrangementExportDialog.tsx:248` and `:522`. `progressText` repeats the `isRendering && progress` condition that already wraps the JSX, so `?? undefined` exists only to narrow `string | null`. It's correct and has no casts.
   **Optional fix:** type it as `string | undefined`: `const progressText = isRendering && progress ? formatArrangementExportProgress(progress) : undefined;`, then pass `aria-valuetext={progressText}`.

5. **Nit · docs**, `090-…md:4`. The status still says "waiting for C", but `c-round-102.json` is PASS. That matches the existing convention: doc 089's status is updated one round later, in this same diff. So this is consistent, just already stale at commit time.

### Checks that came back clean
- **Listener/timer leaks:** none. No new effect, listener, ref or timer. The focusin handler keeps its `[isOpen]` deps and its cleanup.
- **Render cost:** `formatArrangementExportProgress` now runs once per render instead of twice. The guard reads `getBoundingClientRect()` one more time per focusin, which costs nothing that matters.
- **Existing flows:** the early returns (footer missing, focus inside the footer, target containing the footer) haven't changed.
  - Controls without a label are still measured by their own rect. FC3 and FC4 cover Close and X.
  - Taking `max` of the two edges can only add scroll, never remove it, so existing FT4 still passes.
- **Tailwind/tokens:** no class changes.
- **TS strict:** no `any`, no `@ts-ignore`, no `as`. `closest<HTMLElement>` in the test is a generic, not a type assertion.
- **Security:** no `dangerouslySetInnerHTML`, no token or API code. Local audio export is not the protected download of purchased files.
- **Error taxonomy:** doesn't apply; no backend error handling is touched.

### Good Practices Found
- `content.contains(card)` limits the label lookup to the dialog panel. The doc is honest that the mutation test can't catch this check.
- The fail-before and mutation matrix is documented, and the FC1 title states that jsdom only checks arithmetic and the pixel acceptance is C's CARD-1280 row.
- `aria-hidden` was picked over `aria-labelledby` based on an AX-tree probe, and the doc gives the reason.

### Architecture note
- **Signal 3 (one region changed repeatedly at high cost):** `ArrangementExportDialog.tsx:217-246`, the footer focus guard. It was changed in rounds 83, 88/89 and now 102, and every time the tests needed rect mocks in jsdom.
  - **Keep for now:** the guard is cohesive (one lifecycle, `isOpen`), it adds no state, and the diff doesn't touch audio timing, gestures, Undo/Redo or `useArrangement()`.
  - **Proposal for the planner (not scope for this round):** move just the arithmetic into a pure function in `app/lib/arrangement/`, e.g. `exportFooterFocusScrollDelta({ targetBottom, cardBottom, footerTop, marginPx }): number`.
    - Ownership: one function plus unit tests. The component keeps the listener and the DOM reads.
    - Acceptance: FT4, FC1–FC4 and FA1 stay unchanged and green.
    - Value: low–medium. It's only worth doing if this guard changes again (for example findings #2 or #3 above).

### Alternative Approach
- **Current:** measure `max(target.bottom, nearest in-panel label.bottom)` against the footer's top edge, scroll by overlap + 8.
- **Alternative:** `card.scrollIntoView({ block: 'nearest' })` with `scroll-padding-bottom` set to the footer height via a CSS variable.
- **Verdict:** keep the current approach. The alternative needs a dynamic footer height (107/171/163 px) passed through inline style or a ResizeObserver, which is new state and lifecycle. It also scrolls ancestor containers and behaves differently across browsers. The current approach adds nothing new to manage and only ever increases scroll.

### Score: 8.5/10