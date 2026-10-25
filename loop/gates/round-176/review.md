COMMIT: OK (the diff only changes colour tokens in 4 arrangement components, updates locked tests and adds docs; it touches no handlers, effects, listeners, timers, aria or auth/purchase/download code, and verify passed)

## Code Review: round-176 — DUX-R-5b-2a mixer on-states plus the Clip-details separator hover (HEAD `c53eefc`, 11 paths)

### Critical Issues
- None.

### Suggestions (ranked)

1. **Low: the test no longer protects two brass sites that are meant to stay.** In `app/lib/arrangement/__tests__/affordance-colour-ui.test.tsx` (hunk `@@ -495,9 +482,5`), the round removed two count checks: `ArrangementExportDialog.tsx` `accent-brand` = 6, and `ArrangementLane.tsx` `'border-accent bg-accent/20 text-accent'` = 2.
   - Both values still hold in the source. ExportDialog has 6 matches, and the Lane string sits at l.886 and l.922.
   - Doc 145 §0.3 marks the ExportDialog card/radio sites as K (stays). The Lane strings are planned for 5b-3. Either way, they should only change on purpose, in a later round.
   - No other test counts them now. The two remaining `accent-brand` references in this file (l.137, l.311) only check the retired tokens.
   - **Fix:** add both back to `KEPT_BRASS_SITES` as `[path, site]` pairs with the counts set per site (6 and 2), or move them into the test that owns the Export dialog or Lane. Remove them only in the round that changes those sites (5b-3).

2. **Low: the Mute-on recipe is copied word for word into three files.** The string `'border-muted bg-muted text-background enabled:hover:bg-muted enabled:active:bg-muted'` appears in `ArrangementLane.tsx:615`, `ArrangementGroupHeader.tsx:288` and `ArrangementMaster.tsx:173`. DXM6 (`mixer-onstate-colour-ui.test.tsx:463`) then requires a count of 1 in each file. The Solo recipe is copied the same way into Lane:633 and GroupHeader:304. Any future recipe change means 3 source edits plus 3 test locks. **Fix (proposal only, not this round):** a shared constant next to `TRACK_GROUP_MIX_BUTTON_CLASS`, with the three locks merged into one. See the Architecture note.

3. **Info (real browser): the border switches instantly while the fill fades.** The base class transitions only `[background-color,color]`, so on toggle `border-muted`/`border-foreground` change at once while the fill eases over 180ms. This already happened with `border-accent`, so it is not a regression. If C sees a one-frame edge, the fix is to add `border-color` to the transition list.

4. **Info (a11y): Mute-on and Solo-on fills differ by only 2.21:1 in lightness.** That is below 3:1, so the M/S letter and `aria-pressed` are what tell them apart. On vs off is ≥ 6:1. Doc 145 records this and Saba can veto it. It is not blocking.

5. **Info (a11y): the mixed group Solo letter is about 4.22:1 at rest and about 3.42:1 when pressed** (`ArrangementGroupHeader.tsx:306`, `text-xs`). That is still under 4.5:1 (WCAG 1.4.3), but much better than the old 1.88:1. A's correction that tailwind-merge drops `bg-foreground/5` when `bg-gradient-to-r` is present is right, and UM11 checks that the class is gone. C should record the measured value in CONTRAST-ONSTATE.

6. **Expected, not a gap:** doc 145 still says "In Progress (awaiting C round 176)". This follows doc 144: the status flips to Completed with the commit hash in the next round.

7. **Not from this diff:** the warning at `verify.log:90–105` is `lint/a11y/useButtonType` in `app/components/audio/AudioPlayer.tsx:48`. That file is not in the candidate and lint passed, so it is an existing warning.

### Checks that tests cannot cover
- **Event order, leaks, render cost:** unchanged. No handler, effect, ref, timer or listener changed, the `cn()` call shape is the same and there are no new renders.
- **Tailwind/tokens:** every new class is a full literal string, so Tailwind v4's scanner will generate it. `--color-muted`, `--color-foreground` and `--color-background` exist in both the default theme and Obsidian (`app.css` l.3922–3936). There are no hardcoded colours or custom CSS. tailwind-merge correctly replaces `border-transparent` and `bg-foreground/5`, and the ON_DROPPED checks confirm it.
- **TS strict:** no `any`, no `@ts-ignore`, and no type assertions in the new test. It uses typed `querySelector<HTMLElement>` and an explicit null `throw`. Semicolons are present.
- **Security:** nothing in auth, cart, checkout or download is touched, and no secrets or XSS surface are added (SECURITY_AUDIT does not apply). ERROR_TAXONOMY does not apply either: no error codes.
- **Verify:** 175 test files and 2595 tests passed, and both builds passed.

### Good Practices Found
- DXM1–DXM5 mount the real `ArrangementProvider` and `StudioWorkspace` and toggle with real clicks, including the nested group setup that produces the mixed state.
- `brassTokens()` checks that no brass token is left except the focus ring, on every state tested.
- DXM6 still locks the brass sites that must stay (`border-l-brand`, `bg-brand/5`, `w-px bg-accent`, `border-brand bg-brand/60`).
- Doc 145 records the contrast math, A's correction to B's figure, the rejected alternatives (warning/destructive token, a single semantic token) and the veto points.
- Hover and press keep the same fill (R2), and tailwind-merge keeps one token per property (R29).

### Architecture note
- **Signal 3 (one region keeps getting expensive changes):** the Mute/Solo on-state class strings in `ArrangementLane.tsx:615/633`, `ArrangementGroupHeader.tsx:288/304/306` and `ArrangementMaster.tsx:173` changed in rounds 174, 175 and 176. Each round also added a full-workspace colour test that copies the fake Web Audio / ResizeObserver harness again (`mixer-onstate-colour-ui.test.tsx:28–105` this round).
  - **Keep for now:** audio timing, refs, gesture lifecycle, Undo/Redo and the `useArrangement()` shape are untouched. Extracting in the middle of 5b would widen the grant. Cost: low to medium.
  - **Proposal for the planner (needs approval):** one test-only task for the existing ROOT-RECON-GRID-HARNESS item, moving the duplicated harness into a shared test helper. Optionally add an `ARRANGEMENT_MIX_ON_STATE` constant with the Mute and Solo recipes, so the three-file source locks become one.
    - **Acceptance:** the current 2595 tests stay green with no behaviour change.
    - **Focused tests:** DXM1–DXM6, LSU7, UM4/UM11 and V-3a.
- This reviews the diff only; I did not audit the modules as a whole.

### Alternative Approach
- Not needed: this round has no auth, checkout or audio-pipeline logic.

### Score: 8/10
One point off for dropping the locks on the brass sites that stay, and one for the recipe string copied into three files.