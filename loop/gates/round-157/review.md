COMMIT: OK (C round 157 PASS and `verify.log` both pass: 170 test files / 2528 tests, build passes, tsc reports 0 errors. Nothing blocks.)

## Code Review: round-157 (ArrangementExportDialog + strings + studio-lab fonts)

### Critical Issues
- None.
- **Auth, purchase and download code:** none of it is touched. In the Export dialog only the text rendering changed. Export scheduling, the render window, format selection and the download trigger are the same as before.
- **TS strict:** no `any`, no `@ts-ignore` and no type assertions. The new `StudioExportTimeBounds` is not exported.
- **Listeners, timers, effects and state:** none were added, so no leaks are possible. The real-browser event order is unchanged.

### Suggestions (most important first, all non-blocking)
1. **`ArrangementExportDialog.tsx:275`, `:409`, `:477`.** The literal `'00:00.000'` appears three times, while the end bound uses `formatArrangementTime(projectEnd)`. Fix: use `formatArrangementTime(0)` (or one local `projectStart` constant) so both bounds come from the same formatter. Mutation m149 shows the tests would catch drift, but one source is still better. Low.
2. **`ArrangementExportDialog.tsx:267–279` and `:409–413` / `:440–446`.** The same `exportRangeScope` / `exportProjectScope` objects are built twice in one render. Fix: compute `rangeScopeParts` and `projectScopeParts` once after `rangeSeconds` (line ~115) and pass them to both places. The render cost is trivial; this only removes the duplication. Low.
3. **`docs/implementation/2026/quarter-IV/127-…md:4`.** The status still says "In Progress (awaiting C round 157)", but C has passed. Fix: change it to "Completed (C round 157 PASS)". In the 126 case this was fixed one round later, so it can wait, but doing it now is cleaner. Housekeeping.
4. **`export-range-ui.test.tsx:141` (`monoTexts`).** The filter matches the exact class string `span.className === 'font-mono font-normal tabular-nums'`. If anyone reorders the classes in `ArrangementTimeText`, the list comes back empty and the XU6–XU8 failures will point at the wrong cause. Fix: use `[class~="font-mono"]`, or add a `data-time` attribute to the time span in `ArrangementTimeText`. Low.
5. **`export-range-ui.test.tsx:182`.** `not.toContain('s')` is a weak check. Comparing against `.toEqual([start, end])` already covers it, so this line can go. Cosmetic.

### Checks done outside the tests
- **Font trim (`studio-lab.tsx:8`):**
  - The only `font-bold` / `font-extrabold` uses are in Header, Footer and `MobileWarning:137`.
  - `root.tsx:137–152` doesn't render Header or Footer on `/studio*`.
  - `MobileWarning` isn't mounted anywhere.
  - Any request for weight 700 now falls back to the 600 face through normal CSS weight matching. That is a fallback, not faux bold.
  - Every `font-mono` element sitting under a `font-medium` parent sets its own `font-normal` (Lane:878→895). The DetailPanel lines 657/665/679 and the Transport line 139 have parents with no weight set. So losing Plex Mono 500 changes nothing visible, which matches visual-direction-a.
- **Accessibility:** the nested `<span>`s and Fragments don't change accessible-name computation. XU6/XU7 confirm it with `getByRole('radio', { name })`, and the `ModalDescription` textContent is the same, so `aria-describedby` is unchanged. Placing `<span>` inside `<p>` is valid HTML.
- **Tailwind/tokens:** only existing utility classes are used; no custom CSS and no hardcoded colors.
- **Visible text change:** B-R155-EXPORT-ZERO. `0:00` became `00:00.000`, and the description now matches the option. This is intended and documented as R3.

### Good Practices Found
- `ArrangementTimeText` and `StudioTimeTextPart` are reused rather than copied (R6).
- The id convention (`export-` prefix, unique ids) is enforced by a test (ST-TP5).
- The join-equality test (ST-TP4) ties the new builders to the unchanged `studioExportStrings`, and four mutations were checked.
- The unused `rangeLabel` was removed.

### Architecture note
- **Signal 3** (the same region changed again, rounds 156→157) **and two sources of truth:** `strings.ts:547–581` (`studioTimeTextParts.export*`) and `studioExportStrings.projectScope/rangeScope/loopRangeNote/loopProjectNote`. The latter now have no production callers; only the tests use them, as the equality reference.
  - **Keep for now:** the freeze on `studioExportStrings` keys in D-29z122 R2 is explicit, and ST-TP4 guards against drift.
  - **Proposal for the planner (add to ARCH-CHECKPOINT-V2):** once the freeze lifts, build `studioExportStrings.*` from `joinStudioTimeTextParts(studioTimeTextParts.export*)`. That leaves one source, and ST-TP4's equality checks become redundant. Acceptance: same output, and `export-dialog-a11y-copy` / `export-range-ui` stay green.
- This reviewed the diff only; I'm not claiming a full audit of the module.

### Alternative Approach
- **Current:** separate parts builders, with a test that compares their joined output to the old strings.
- **Alternative:** change `rangeScope` to take `{ start, end, seconds }` and derive the parts from it.
- **Verdict:** the current approach is right because the strings freeze is still in force. The alternative is the target once the freeze lifts (see the Architecture note).

### Score: 9/10