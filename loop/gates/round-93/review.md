COMMIT: OK. Nothing in the diff touches auth, purchase or download code. verify.log shows all 138 test files passing and both builds succeeding. The Biome warnings in the log (verify.log:85–109, e.g. `AudioPlayer.tsx:48`) were already there and don't come from this diff.

## Code Review: ArrangementExportDialog.tsx + export-dialog-a11y-copy.test.tsx + docs 080/081

### Critical Issues
- None.

### Suggestions (all Low, most important first)
1. **`docs/implementation/2026/quarter-IV/081-studio-lab-export-dialog-names-and-notes.md:4`**: the status line still says "Round 93 — C-ის შემოწმებას ელოდება", but C has already passed this round (c-round-93.json PASS). This follows the same pattern as doc 080, which was fixed in the next round with the commit hash. So it doesn't block, but the next round needs to update it.
   **Fix:** set it to `C PASS (Round 93), გამოქვეყნდა <hash> (D-29z58)` once the commit exists.
2. **`ArrangementExportDialog.tsx:103–114`**: `optionIds` is rebuilt as a new object on every render. It's just nine string concatenations, so the render cost is negligible and `useMemo` isn't worth adding. You could move the suffixes into a module-level array, but that's optional.
3. **`ArrangementExportDialog.tsx:349–363`**: the disabled video radio's `aria-describedby` is only heard in screen-reader browse mode, because a disabled input can't get Tab focus. That's expected and matches the range-reason pattern, so no change is needed. I'm noting it only so a future round doesn't call it a regression.

**Browser-only checks that unit tests can't cover:**
- **Accessible names:** each radio sits inside its `<label>` and also has `aria-labelledby`. In Chrome, Firefox and Safari, `aria-labelledby` takes priority over the wrapping label (accname step 2B), so the name is just the main text and doesn't include the note.
- **Click target:** the label still passes clicks through to its radio (test AN4). C's browser PASS covers the AX-NAMES and VIS-LAYOUT checks.
- **Listeners and effects:** no new listener, timer, effect or state was added.
- **WAV text unchanged:** `label.textContent` is the same byte for byte, so the existing tests in `export-range-ui` and `export-mp3` stay green.
- **Tailwind:** the new name `span` has no class, so it stays inline. The note `span`s keep their existing classes, and there are no hardcoded colours.
- **TypeScript:** no `any`, no type assertions, and the `Record<ArrangementExportFormat, string>` covers every format.
- **Hydration:** `useId` returns the same value on the server and the client, so the IDs won't mismatch.
- **Test quality:** the test uses `[id="…"]` / `getElementById` rather than an unescaped `#id`, which is correct because `useId` output contains `:`.

### Good Practices Found
- The whole format group was fixed together, so no radio is left inconsistent with its neighbours.
- `aria-labelledby` points at visible text, which is better than duplicating it with `aria-label`.
- `EXPORT_FORMAT_CREATES` uses the same wording as the completion messages ("WAV შეიქმნა" and so on).
- Close and reopen resets the format to WAV, and the note follows (test NC3).
- AN5 checks every ID: it is unique, it resolves inside the dialog, and its text isn't empty.

### Architecture note
- **Signal 3: one region keeps getting expensive changes.**
  - `081-…md:68` lists about 10 more Lows queued for this same dialog (GATE90-S3/S4/S5, A-R88-REVIEW-EDGES, GATE89-S3/S4/S6, C-R90-MUT-B-CU4-GAP, A-R87-LOW-PU-ORDER).
  - `export-dialog-a11y-copy.test.tsx:52–128` needs a full fake AudioContext, OfflineAudioContext and AudioBuffer setup plus a live `ArrangementProvider`, just to check the aria wiring on five radios.
- **Keep the component as it is.** It has one lifecycle, the diff adds no state or effect, and splitting out the radio rows would disturb the existing `label.textContent` tests for no change in behaviour.
- **Proposal for the planner (not approved scope):** add one shared test harness for the export dialog (the fake audio, the provider mount and the `live(api)` helper) under `app/lib/arrangement/__tests__/`. The remaining Lows would then stop copying about 80 lines of mocks each.
  - **Ownership:** test files only.
  - **Acceptance:** existing export tests pass unchanged after moving to the harness.
  - **Value / risk:** low cost and no production code changes. Audio timing, refs, Undo/Redo and the `useArrangement()` shape are untouched.

### Alternative Approach
- **Current:** `aria-labelledby` points to the main text and `aria-describedby` points to the note, both visible `span`s inside the label.
- **Alternative:** move the notes outside the `<label>` as siblings and keep the label's implicit name.
- **Verdict:** keep the current approach. The alternative would change `label.textContent`, which breaks the existing tests, and clicking a note would no longer select its radio. The current approach changes the accessibility tree without changing the DOM text or the click target.

### Score: 9/10