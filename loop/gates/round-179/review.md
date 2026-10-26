COMMIT: OK (the diff only changes class names, re-points test locks and edits docs; nothing blocks the commit)

## Code Review: round-179 (DUX-R-5b-3a, labels and status text go neutral)

The commit doesn't touch auth, purchase or download code.

**What I checked against your focus list:**
- **Event order, leaks, render cost:** No listener, timer, effect, state, ref, handler, aria, role or `data-*` attribute changed. The only structural change is the Biome reflow at two places: DetailPanel l.676–678 and StudioWorkspace l.2605–2610. Event order, cleanup and render cost are therefore the same as at `cc984b6`.
- **Design tokens:** Every new class uses an existing token: `foreground`, `muted`, `outline-strong` (app.css l.3928–3931), and `accent-foreground` on `<progress>`, which repeats the pattern from stage 5b-1. There is no `style=`, hex value, arbitrary value or new CSS.
- **TypeScript strict:** No `any`, no type assertions and no `@ts-ignore`. The new test throws a labelled `Error` instead of using `!`.
- **Verification:**
  - All 177 test files passed and the build succeeded.
  - The new suite `label-status-colour-ui.test.tsx` passed 10/10 (verify.log l.1140).
  - None of the 19 lint warnings visible in the log is in a touched file. The other 199 were hidden by the output limit, so I couldn't check them individually; doc 147 records `lint` exit 0.
  - The `e2e/` folder doesn't use any of the changed classes or `arrangement-*` test ids.

### Critical Issues
- none

### Suggestions (most important first)
1. **Doc 147 has stale lines (Low).**
   - **Problem:** `docs/implementation/2026/quarter-IV/147-...md` l.104–105 still says "არცერთი ფაილი … არ შეცვლილა. B-მ უნდა გადაწყვიტოს". The next entry (l.106–107) records the round-179 fix, so the two contradict each other. In the TODO list, l.124 ("Badge-ის selector … B-ის გადაწყვეტილება") is already done, and l.123 says "C round 178" while the header says "awaiting C round 179".
   - **Fix:** Merge l.104–105 into the round-179 entry (or mark it as superseded), delete TODO l.124, and change l.123 to round 179. Leaving the status as In Progress at commit time matches what was done for doc 146.
2. **`badgeText()` is no longer tied to the badge element (Low).**
   - **Problem:** `purchased-collection-ui.test.tsx:229–237` matches any `<span>` in the header whose text equals a badge string. The header also contains `ArrangementMaster` and the heading-suffix span. The duplicate check stops false passes for now, but the lookup is fragile.
   - **Fix:** Add `data-testid="arrangement-collection-badge"` to StudioWorkspace l.2210 once that file is unfrozen, then use `getByTestId` in both PW and LRS5. The doc already defers this; it should go in the backlog.
3. **Hover text is now a no-op on three buttons (Low).**
   - **Problem:** In `ArrangementDetailPanel.tsx` l.754, l.863 and l.1144, the base colour is already `text-foreground`, so `hover:text-foreground` does nothing. Hover feedback now comes only from `enabled:hover:bg-foreground/8`. That still works, but DXL8 (`expectCount(..., 'hover:text-foreground', 3)`) now requires a class that has no effect.
   - **Fix:** In 5b-3b, either remove the token and the lock, or keep it and document it as intentional (the doc already explains the reasoning).
4. **A count-0 check sits inside the "kept brass" block (readability).**
   - **Problem:** In `mode-toggle-colour-ui.test.tsx:495–499`, the badge check now expects count 0 but still sits among the kept-colour checks.
   - **Fix:** Move it to a "migrated" group or add a TODO label.
5. **Accessibility, for Saba's possible veto rather than a fix:**
   - The overload alert (`ArrangementExportDialog.tsx:568`) and the empty note (l.524) no longer stand out by colour. `role="alert"` and `role="note"` are kept, and the `not text-destructive` lock still holds.
   - The lane-move refusal is set apart from its muted line only by `font-medium` plus `foreground`.
   - All contrast ratios are at least 4.5:1, per the doc 147 table.

### Good Practices Found
- Each place changes exactly one class within one CSS property, so tailwind-merge has no conflicts.
- The two badge lookups that relied on the colour class now find the badge by its text. Mutation m290 shows the lookups no longer depend on colour, and the colour itself is still locked by DXL3 and DXL8.
- The DXL tests check real rendered states, including a pending render with `onProgress` and an overload result. Source locks compare against whitespace-normalised text, so Biome reflows don't break them.
- The `KEPT_BRASS_COUNTS` 6→5 fix (C-R177-G1-562) has a stated reason.

### Architecture note
- **Signal 3 (one region repeatedly costly to change):** at `label-status-colour-ui.test.tsx:504–569` (DXL8), source-text count locks now live in four suites: affordance-colour, mode-toggle-colour, panel-radius and label-status. Each colour round edits 5–6 test files to re-lock literals, and each new suite copies the fake AudioContext and ResizeObserver block again (l.38–115).
  - **Keep for now:** DUX-R-5 is one sub-stage from done, the locks caught C-R177-G1-562, and no runtime invariant is involved (audio timing, refs, gestures and Undo/Redo are untouched).
  - **Proposal for the planner (one bounded task):** when 5b-3b closes, replace the per-round literal counts with the single INVENTORY-GREP lock the doc names: every non-focus `brand|accent` class token may appear only at kept (K) places. Also land ROOT-RECON-GRID-HARNESS (a shared fake-audio and observer test helper) before the next new test file.
  - **Acceptance:** one inventory test plus the existing DXL/DXT tests stay green, with no runtime code changes.

### Alternative Approach
- Not needed: this round has no critical logic (auth, checkout or the audio pipeline).

### Score: 8.5/10