COMMIT: OK. This is a class-string-only restyle of three buttons and one shared input class. It adds no new behaviour, listeners, timers or state, and it doesn't touch auth, purchase or download code. C's round passed in the browser and `npm run verify` passed (171 test files and 2566 tests passed; the build passed).

## Code Review: ArrangementDetailPanel.tsx + detail-panel-strings-ui.test.tsx (round 170, V-3c-4c-2)

I read `SECURITY_AUDIT.md`, `ERROR_TAXONOMY.md` and `architecture-checkpoint.md` before the review.

### Critical Issues
- None.

### Suggestions (most important first)
1. **Low: the 0 dB button and Set selection still turn brand-coloured on hover when disabled** (`ArrangementDetailPanel.tsx:752`, `:861`). The background change is limited to enabled buttons with `enabled:hover:`, but the text colour change is plain `hover:text-brand`. Today `disabled:text-dim` wins because Tailwind v4 orders the `disabled` variant later, and B's probe confirms hover changes nothing on disabled buttons. That only holds because of variant order. Fix in a later round: use `enabled:hover:text-brand` on these two buttons. The behaviour existed before this diff, so it doesn't block.
2. **Low: the border-free buttons are hard to see against the panel** (`:752`, `:861`, `:1142`). A 5 % fill against the panel background is only 1.12:1. This is the known spec trade-off GATE167-WCAG-1411-FILL. The text labels and the `aria-label`/`aria-expanded` attributes still identify the controls, and focus still shows the brand ring. Nothing to change in this round.
3. **Low: `enabled:hover:` / `enabled:active:` on the toggle** (`:1142`). The toggle never has a `disabled` attribute, so the `enabled:` prefix does nothing there. It is still correct, and it keeps the token set identical to `ArrangementTransport` and the other copies, which the doc says on purpose (R13). Keep it.
4. **Info: the new `beforeEach`/`afterEach` repeats the stubs from the first describe block** (`detail-panel-strings-ui.test.tsx:366-382` vs `:175-190`). It works, and the explicit unmount in `afterEach` is correct. If a third describe block is added, move the shared setup into one helper.
5. **Info: doc 139 still says "In Progress (awaiting C round 170)"** (`139-…md:4`). The loop's pattern is to change it to Completed in the next round, as 138 is changed in this one. If you want this commit to record the C PASS, change it now. Either way is consistent.

### What tests cannot catch, checked by reading
- **Event ordering:** the handlers are unchanged (`onMouseDown` preventDefault on 0 dB, the `Enter` repeat guard, toggle keydown/keyup). Only `className` changed.
- **Listener/timer leaks:** none added. The test unmounts in `afterEach` and resets mocks and stubbed globals.
- **Render cost:** these are static string literals, with no new `cn()` call or memo dependency. The input still goes through the existing `cn(inputClass, … 'border-warning')`, and twMerge keeps `rounded-md` while swapping in the warning border. DFR1 covers this case.
- **Layout:** the border width stays 1 px (now transparent), so element sizes don't change. C's layout check measured 0.000 px difference.
- **Tailwind/tokens:** `bg-foreground/8`, `/12` and `duration-180` are valid in v4. The only arbitrary `[...]` values are the four motion tokens, which match the existing pattern in 9 other components. No hardcoded colours.
- **TS strict:** no `any`, suppressions or type assertions in the new test code.
- **Regressions:** the DPS5 padding checks and the PM1/PM2/F4/TH5 `border-outline-strong` checks are untouched and still pass.

### Good Practices Found
- The input fields keep their visible border (only the radius changed), so the pending `border-warning` state still works.
- `disabled:opacity-40` was deliberately not added, so disabled buttons stay at 4.82:1 contrast instead of falling below 4.5.
- The new tests split class names into tokens instead of matching substrings, and check both the Collapse and Expand states of the toggle. The doc records the mutation runs that turned each test red.

### Architecture note
- Signal 3 (one region changed repeatedly at high cost): `ArrangementDetailPanel.tsx:752`, `:861`, `:1142`. The same 9-token surface/motion class string now exists as about 17 hand-copied literals across 10 files (Transport:51, GroupHeader:37, MarkerRow:51, Lane:613/631/723/731, Master:108/171, LibraryPreview:307/332, StudioWorkspace:2285/2366, TempoRow:241, DetailPanel ×3). Every V-3c-4 round edits these copies and adds token tests for them.
  - **Keep for now:** the agreed fallback (c) applies until the checkpoint answers Q1. Each copy is covered by tests, and changing this mid-stage would widen the frozen scope.
  - **Proposal for the planner, after V-3c-4c-3:** one task to move this into a single `surfaceButtonClass` constant in `app/lib/arrangement/` and replace the copies. Only the shared part moves; size, padding and text colour stay per component. Acceptance: the rendered class token sets are identical (the existing token tests stay green with no edits) and layout still measures 0 px difference. Value: medium. Risk: low.

### Alternative Approach
Not applicable. This is a pure styling change and doesn't touch auth, checkout or the audio pipeline.

### Score: 9/10