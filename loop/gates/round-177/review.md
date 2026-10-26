COMMIT: OK. This round only changes the colours of the Studio mode toggles: `className` strings in 6 components, test updates, and docs 145/146. No auth, purchase, download, API or service code is touched, and no handler, effect, ref, timer or listener changed, so there is no leak or event-ordering risk. `verify.log` shows 176 test files and 2603 tests passing and a successful build, and C round 177 passed. I didn't run anything myself; this review is from reading the diff and the files.

## Code Review: round-177 (DUX-R-5b-2b, mode toggles go neutral)

### Critical Issues
- None.

### Suggestions (most important first, none block the commit)
1. **`ArrangementTransport.tsx:218`, Delete with a range looks like a pressed toggle.** With a range selected, Delete gets `border-foreground`, the same border that means "on" for Loop and Follow right next to it. But Delete is an action, not an on/off switch. Before, brass text separated it from the toggles; now the border is the only cue. Screen readers are fine because the `aria-label` comes from `rangeDeleteHint`, but sighted users may read Delete as "switched on". **Fix (needs a design decision):** use a weaker border such as `border-foreground/50`, or `border-dashed` the way Follow paused does, to set "armed action" apart from "on". Record it as an item Saba can veto in `feature-status.md`.
2. **`ArrangementTransport.tsx:244,257`, Follow paused is visible on screen but invisible to screen readers.** When paused, the button has `aria-pressed="false"` and a dashed border. The only spoken difference from "off" is the `title` and the `‖` glyph. This gap was there before (brass text, same aria), but now that the border carries the state it is worth closing. **Fix:** add a text alternative, e.g. an `aria-label` from `studioViewStrings` such as "Follow paused". Do it in a separate task, because it changes the button's accessible name and the `byName('Follow')` lookups in tests.
3. **`ArrangementLoopBrace.tsx:239`, the enabled brace is much louder.** It is now `border-2 border-foreground` on a near-black strip, about 15:1, where the brass was about 7–9:1, and it is on for as long as the loop is enabled. The edge hover `fg/50` on top of `fg/20` gives 3.43 (doc 146). That passes, but with little margin. This is a design-weight question, not a bug. Make sure the visual-weight veto in doc 146's TODO actually reaches `feature-status.md`.
4. **Border colour snaps instantly.** `toolButtonClass` and the TempoRow/Workspace bases use `transition-[background-color,color]` with no `border-color`. Now that the border carries the state, it changes instantly while the fill and text animate over 180 ms. Low priority. **Fix:** `transition-[background-color,color,border-color]` in the base strings of `ArrangementTransport.tsx:51`, `ArrangementTempoRow.tsx:241` and `StudioWorkspace.tsx:2284/2365`. That's 4 strings, so do it as its own round.
5. **Doc 146 status.** The status still says "In Progress (awaiting C round 177)". This matches how doc 145 was handled (closed in the following round), so it doesn't block. But C has now passed, so it could be changed to Completed in this commit.

### Checks that passed
- **TypeScript strict:** no `any`, `@ts-ignore` or `as` was added. The only casts in the new test are typed `querySelector<HTMLElement>` calls. The new code ends statements with `;`.
- **tailwind-merge behaves as intended:** `border-foreground` replaces `border-transparent`/`border-outline`, and `bg-foreground/20` replaces `bg-foreground/5`/`bg-surface`. `border-dashed` doesn't conflict, because the base has no border-style token. The tests check the actual tokens (`not.toContain('border-transparent')`), not just the source text.
- **Text colour where it's needed:** `text-foreground` is added only where the base is `text-muted` (Metronome, Snap, Env). Transport, the Zoom select and Library Preview already have it in their base.
- **Metronome:** removing `hover:text-accent` lets the base `hover:text-foreground` apply. `disabled:hover:text-muted` stays, and Metronome can only be on with a tempo set, so the disabled-and-on case doesn't occur.
- **Accent rule held:** focus rings stay `ring-brand`, which matches the rule that accent is kept only for selection, playhead, primary button and focus. No new hardcoded colours.
- **Kept brass is guarded:** G1 puts back the guarded counts (`KEPT_BRASS_COUNTS` and `LATER_STAGE_BRASS_SITES`), with a `TODO` comment, which the comment rule allows.

### Good Practices Found
- DXT1–DXT8 check both directions (on and back to off), the full three-state Follow cycle, and that the brass sites still meant to stay brass are each counted exactly once.
- Doc 146 records contrast numbers for every state, says plainly that the fill is "info only", and lists both test deviations (TS1, LRS3) openly.
- No behaviour changed, so there is no added render cost.

### Architecture note
- **Signal 3 (one region keeps getting costly edits):** the on-state toggle recipe is copied as long literal strings in `StudioWorkspace.tsx:2284` and `:2365`, `ArrangementTempoRow.tsx:241–243` and `ArrangementTransport.tsx:51,234,256`. Several tests also count exact source strings (`mode-toggle-colour-ui` DXT8, `affordance-colour-ui` DXA7, `studio-theme-obsidian` TH6). Rounds 175, 176 and 177 each had to edit 6 or more components and about 7 test files for one colour decision, and 5b-3 will do the same again. **Keep for now**, because the scope is frozen until 5b-3's C PASS and an extraction would invalidate the source-count guards mid-stage. **Proposal for the planner, after DUX-R-5 closes:** move the base and on-state toggle recipe into one module, e.g. `studioToggleClass` in `app/lib/arrangement/`. Replace the source-string counts with token checks on the rendered DOM. Acceptance: the existing token tests stay green, and every changed test asserts DOM tokens rather than source strings. Value: medium. Risk: low, because only class strings move. Audio timing, refs, gestures, Undo/Redo and the shape of `useArrangement()` are untouched.
- The repeated fake Web Audio/ResizeObserver harness in `mode-toggle-colour-ui.test.tsx:23–100` is already tracked as ROOT-RECON-GRID-HARNESS, so nothing new to add.

### Alternative Approach
- Not applicable: this round only touches visual classes, not auth, checkout or the audio pipeline.

### Score: 9/10