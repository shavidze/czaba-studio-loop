COMMIT: OK. The diff doesn't touch auth, purchase, download or any protected file, `Modal.tsx` included. All changes stay inside `ArrangementExportDialog.tsx`, its footer test and two Georgian docs. The verify log shows 144 test files and 2242 tests passing, and the build succeeds.

## Code Review: ArrangementExportDialog.tsx (round 101)

### Critical Issues
- None.

### Findings, ranked (all Low; none blocks this commit)
1. **Screen readers hear the progress text twice: `ArrangementExportDialog.tsx:505-511`.** The visible label `<p data-testid="arrangement-export-progress-label">` sits right before the `<progress>`, and the bar's `aria-valuetext` now holds the same text. A screen reader user moving through the page line by line hears it twice (for example "რენდერი · 50%" twice). This doesn't affect live announcements, because the change correctly adds no `aria-live` and FV2 locks that.
   **Fix (optional, later round):** add `aria-hidden="true"` to the label `<p>`, or replace `aria-label` with `aria-labelledby` pointing at the label and keep `aria-valuetext`. Either way, a Chromium accessibility-tree check should decide, not jsdom.
2. **The same helper is called twice per render: `:506` and `:511`.** `formatArrangementExportProgress(progress)` builds one string twice; the cost is negligible. If the code is touched again, compute it once (`const progressText = …`) inside the `isRendering && progress` branch.
3. **Pixel check on Firefox and WebKit: `:267`.** The fix only works if `pb-0` beats `ModalBody`'s built-in `py-4`. `ModalBody` joins class names with `join(' ')`, with no `cn`/twMerge, so the stylesheet order decides. In Tailwind v4 `padding-bottom` (`pb-0`) is emitted after the `padding-block` shorthand (`py-4`), so it wins, and B's Chromium probe confirmed this. If `ModalBody` later switches to twMerge, `pb-0` still wins because it comes last. The open point is that the 0 px gap was measured only in Chromium. Every engine reads the same CSS, so this isn't a blocker, but it's worth adding to C's STRIP checks.
4. **Doc 089 status line: `docs/implementation/2026/quarter-IV/089-…md:4`.** It still says "C-ის შემოწმებას ელოდება" (waiting for C's check) even though C has passed. This matches the pattern doc 088 follows: the next round updates the status after publishing, which is fine. Just don't forget the update.
5. **`event.repeat` guard: `:543`.** The behaviour is identical (`KeyboardEvent.repeat` is a boolean), all four guards now read the same way, and the HE tests are unchanged. No problems.

### Checks against the review focus
- **Event ordering, listener/timer leaks:** no new effects, listeners, timers or state.
- **Regressions:** `footerRef` and the `focusin` guard are unchanged, and the footer is still the last child of `ModalBody` (FS1 checks this). The scroll height shrinks by 16 px, which doesn't break `sticky bottom-0`. The footer keeps its own `py-4`, so the buttons don't touch the panel edge.
- **Render cost:** one extra string per render, negligible.
- **Tailwind/tokens:** only standard utilities, no custom CSS, no hardcoded colours.
- **TypeScript strict:** no `any`, no type assertions. In the test, the `if (!body) throw` null guard is correct.
- **Tests:** FS1 openly says it only checks class names (jsdom has no layout), and the doc points to C's STRIP checks for the pixel result. FV1 compares against the visible label in each phase, which is a good choice.

### Good Practices Found
- `aria-valuetext` reuses the same helper that writes the visible label, so what's read and what's shown can't drift apart.
- The progress bar deliberately has no `aria-live`, because the `role="status"` message already announces phase changes.
- The smallest possible fix: one `pb-0` where `ModalBody` is used, instead of moving the footer out of `ModalBody`. The doc explains the rejected alternatives.
- Fail-before and mutation checks are documented.

### Architecture note
- **Signal 2 (coupling), already recorded:** `ArrangementExportDialog.tsx:267` and `:487`. The footer's `-mx-8 px-8` repeats `ModalBody`'s `px-8`, and the new `pb-0` adds a second dependency on `ModalBody`'s internal padding. **Keep for now:** `Modal.tsx` is protected, and a cleaner fix would change the scroll container, the focusin guard and FT1. Cost: low.
  **Proposal for the planner:** once `Modal.tsx` is unfrozen, add a `className`/padding override to `ModalBody` (or a `ModalStickyFooter` slot) that removes both couplings. Acceptance: FS1, FT1 and the focusin tests stay green, and STRIP-1280 and STRIP-1440 stay at 0 px.
- **Signal 3 (one region changed repeatedly):** the footer region has been touched in rounds 87/88, 97 and 101. Each change was small and cheap, so this isn't a problem yet. It's a candidate for the existing "repeated Enter helper" checkpoint.

### Alternative Approach
Not applicable: this diff has no critical logic (auth, checkout or the Studio audio pipeline).

### Score: 9/10