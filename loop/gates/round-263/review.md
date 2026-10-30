**COMMIT: OK** — I found nothing that should block this commit. The change moves the Master group (Mute, Volume, meter and Peak) from the header into the footer's last row, just before the Shortcuts button, and moves its three labels into `strings.ts`.

## Code Review: round-263 (SABA-B-9 stage 2 — Master in the bottom-right corner)

What I checked: all 11 paths in `paths.txt`, `diff.patch`, the new doc 196, and the current `StudioWorkspace.tsx` footer (lines 3095–3189) and `ArrangementMaster.tsx`. I also checked `c-round-263.json` (PASS) and `verify.log` (216 test files and 3164 tests passed). This is a review of the diff only, not a full check of either module.

**Auth, purchase and download code:** not touched. The diff only changes Studio arrangement UI, tests, strings, perf helpers and docs. No `dangerouslySetInnerHTML`, tokens or new user input appear in it.

### Critical Issues
- None.

### Findings, most important first (none block the commit)
1. **Tab order changes for keyboard users.** `StudioWorkspace.tsx:3173`: Master used to come before the transport in Tab order. Now it comes after the whole timeline and detail panel, and just before Shortcuts. That follows from the approved placement, and the doc confirms the Shift+Tab path from Shortcuts. But anyone who used to Tab quickly to Master Volume now needs many more key presses.
   - **Fix:** no code change this round. Add one line about this to doc 196's list of differences, so the open question to Saba (SABA-Q-9-MASTER-ROW) covers it.
2. **The footer row can overflow on narrow screens.** `StudioWorkspace.tsx:3127`: the row uses `flex` with no wrapping. Master has fixed widths (fader `w-24`, readout `w-16`, meter `w-20`, Peak `w-14`, plus gaps), about 330–350 px, and nothing in it can shrink. Only the clip or hint text on the left can shrink. Overlap was 0 at 1024×720, but below about 700 px the row will overflow.
   - **Fix:** if Studio has a minimum supported width, write it in doc 196. Otherwise, plan `flex-wrap` on this row for a later round. Don't change it now.
3. **The doc status names the wrong round.** `196-…md:4` and `193-…md:4` both say "C round 262 PASS". The verification on file is `c-round-263.json`, and round 262 was the task.
   - **Fix:** change both to "C round 263 PASS". It is a doc-only edit.
4. **The e2e smoke test hasn't run on this diff yet.** `c-round-263.json` lists "e2e smoke (never ran on the round-262 diff)" among the gates. `npm run verify` doesn't include it.
   - **Fix:** run `npm run test:e2e:smoke` before committing. Any smoke selector that expects Master inside `header` would break.
5. **The LABELS test checks the source text with regexes.** `master-ui.test.tsx:176-180` reads `ArrangementMaster.tsx` with `readFileSync` and matches against regexes such as `/^ *Master$/m`. It works, but a formatter change or an unrelated JSX line could break it. The accessible-name checks in the same test already protect the actual behaviour.
   - **Fix:** later, keep only the `not.toContain('aria-label="Master')` check and drop the line regex.
6. **The new strings aren't marked `as const`.** `strings.ts:748`: `studioMasterStrings` isn't `as const`, so its values are plain mutable strings. This is probably consistent with the other string objects, and with no type assertions allowed by the project rules it's acceptable as is.

### Suggestions
- The undo labels `MASTER_VOLUME_LABEL` and `MASTER_MUTE_LABEL` in `ArrangementContext.tsx` still repeat the same text. The doc already lists moving them as a TODO. Track it in the backlog so the two copies don't drift apart.

### Good Practices Found
- **Focus is kept on the fader.** Master sits in its own fixed position after the hint/clip/reserve choice, so changes in the footer don't remount it. The FOCUS-KEEP test checks this through four footer state changes, and a deliberately broken version (Master moved inside the choice) makes it fail.
- **Render cost is unchanged.** Master has the same parent and the same context subscription as before. The test that expects 0 renders per Play frame still passes in its new position. The meter still writes directly to the DOM through refs and `useMasterMeterWriter`, which this diff doesn't touch.
- **No new listeners, timers or effects.** Pointer-drag behaviour (`useRelativeFaderDrag`, pointer capture, commit on pointer up or lost capture) is unchanged.
- **Accessibility and styling hold up.** The `fieldset` keeps its accessible name and the visible label stays `aria-hidden`. All classes use existing Tailwind tokens. Labels and accessible names are byte-for-byte the same text as before.
- **The perf locator now follows the string source.** It reads `studioMasterStrings.volumeLabel`, so renaming that field fails typecheck in the perf code. Removing the old `perfInlineLabels.masterVolume` entry left nothing pointing at it; I searched and found no references.
- **No test checks were dropped.** In `track-layout.test.tsx` the old length checks became exact child-order checks.

### Architecture note
- **Signal 2 (ownership/coupling), low:** `StudioWorkspace.tsx:3173`. **Keep.** Only the position moved. The owner, context subscription and lifecycle stay the same, and `ArrangementMaster` still reads `useArrangement()` directly, so no new props are passed down.
- **Signal 3 (one region changed repeatedly), watch only:** the footer's last row (`StudioWorkspace.tsx:3127-3188`) has been changed in several rounds: the reserve slot, the Shortcuts button, and now Master. Each time, `track-layout`, `master-ui` and `meter-ui` all need updating.
  - **Proposal for the planner (not approved scope):** move this row into its own `StudioFooterBar` component. It would take `clipLaneDrag`, `selectedClip` and the Shortcuts handler, and keep Master in its fixed position. Done when FOCUS-KEEP, track-layout l.867 and the 0-renders test pass unchanged. Only worth doing if the footer changes again.

### Alternative Approach
Not applicable: the diff doesn't touch auth, checkout or the Studio audio path.

### Score: 9/10