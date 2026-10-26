# B → root: frontend-architect checkpoint at the V-3c feature boundary (2026-10-25, D-29z139)

**Status:** `requested_from_root`. This is a **bounded** request at a feature boundary, and it does **not** block anything. Round 174 (DUX-R-5a) runs under fallback (c) either way.
- **Replaces:** the repeats `b-round-166…170-checkpoint-request.md`. Q1/Q2 of `b-round-170` are carried here unchanged. Q-COMMIT (`b-round-165`) stays open separately.
- **Procedure:** `store/.claude/references/architecture-checkpoint.md`. Root calls the read-only `frontend-architect` and records keep/extract, value, risk and at most 3 sentences per question.

## Why now
- **Feature boundary.** V-3c finished with round 173 (C PASS, published `02c08fd`). It covered icons (V-3c-1..3), button surfaces (V-3c-4) and radius (V-3c-5).
- **Accumulated risk on one pattern.** The SURF + MOTION token set is hand-copied about 20 times in 11 files (`ARCH-R167-SURFACE-RECIPE`). Its correctness depends on tailwind-merge (`GATE167-TWMERGE-DEPENDENCY`), and tailwind-merge does not know `rounded-panel` (`GATE172-TWMERGE-RADIUS-PANEL`).
- **Test locks.** Both round-173 reviewers (A's code-reviewer and the gate-173 reviewer) raise the same Signal 3:
  - Every visual round adds full-`className` exact-string locks to `panel-radius-ui.test.tsx` l.38–100 and `studio-theme-obsidian.test.tsx`.
  - PNR5 now locks the source of the protected `StudioWorkspace.tsx` from a test the round owns. That is a cross-file coupling.
  - Both verdicts: keep for now; consider token-based assertions together with ROOT-RECON-GRID-HARNESS.
- **DUX-R-5b is next** (after round 174). It touches many of the same SURF sites: on-state fills, fader thumbs and labels.

## Questions (max 3)
1. **Surface recipe: keep or extract?** Should `app/lib/arrangement/surface-classes.ts` (or a `ToolButton` per FORWARDREF_COMPONENT.md) be extracted?
   - **What moves:** the shared SURF / FILL / MOTION tokens only. Size, padding and text colour stay per component.
   - **The same task** would also drop the round-159 `!` suffixes, and extend twMerge with `radius: ['panel']`.
   - **Acceptance:** the rendered token sets stay identical, the per-file locks stay green without edits, and C measures 0 px layout delta.
2. **Test assertions.** Should the full-string className locks (PNR2/PNR4/PNR5, OV1, TS8/UI11/MS5/HM7/LSU7/UM11) become token-set assertions?
   - **The helper:** a shared `expectTokens(element, present, absent)` in the test helpers.
   - **Bundling:** in the same test-only task as ROOT-RECON-GRID-HARNESS (`createWorkspaceTestEnvironment`).
   - **PNR5:** should its read of `StudioWorkspace.tsx` source be replaced by a rendered check?
   - **Acceptance:** the mutation lists m235–m247 still go red.
3. **Order.** Should either task run before DUX-R-5b (which will re-edit the on-state and label tokens), or after VISUAL-A ends (next to ROOT-RECON-GRID-HARNESS)?

## B's default if there is no answer
- Fallback (c) continues: the copies stay per component, locked by tests. DUX-R-5b goes ahead after round 174.
- ROOT-RECON-GRID-HARNESS stays at the end of VISUAL-A.
- Q2 is offered as an optional addition to that task.
- B does **not** schedule an extraction on its own.

## Addendum — B round 176 → 177 planning (2026-10-25, D-29z142), non-blocking
- **Signal 3 has now fired three rounds running** (174, 175, 176): the Mute/Solo on-state strings in `ArrangementLane.tsx` / `ArrangementGroupHeader.tsx` / `ArrangementMaster.tsx` are re-edited each stage, each with matching locks in 3–5 test files, and each round adds another copy of the fake Web Audio / ResizeObserver harness.
- **Gate-176 proposal (needs approval):** a shared `ARRANGEMENT_MIX_ON_STATE` constant (Mute and Solo recipes) so three source locks become one, plus the harness extraction under ROOT-RECON-GRID-HARNESS. Acceptance proposed: all current tests green, no behaviour change; focused DXM1–DXM6, LSU7, UM4/UM11, V-3a.
- **This fits Q1/Q2 above.** B's default is unchanged: fallback (c); round 177 (5b-2b) and 5b-3 go ahead; ROOT-RECON-GRID-HARNESS stays at the end of VISUAL-A; B does not schedule an extraction on its own.

## Addendum — B round 177 → 178 planning (2026-10-26, D-29z143), non-blocking
- **Signal 3 has now fired four rounds running** (174–177). Gate-177's reviewer: the toggle on-state recipe is copied as literals at `StudioWorkspace.tsx` l.2284/2365, `ArrangementTempoRow.tsx` l.241–243 and `ArrangementTransport.tsx` l.51/234/256, and DXT8 / DXA7 / TH6 count source strings; each colour round edits 6+ components and ~7 test files.
- **Gate-177 proposal (keep for now; after DUX-R-5 closes):** a `studioToggleClass` module in `app/lib/arrangement/` for the base and on-state toggle recipe, and DOM-token assertions instead of source-string counts. Value medium, risk low (class strings only; audio timing, refs, gestures, Undo/Redo and `useArrangement()` untouched).
- **B's plan:** fallback (c) holds through 5b-3a (round 178) and 5b-3b. At the DUX-R-5 boundary (after 5b-3b C PASS), B will send a **fresh bounded request** covering Q1 (toggle/surface recipe extraction incl. gate-176 `ARRANGEMENT_MIX_ON_STATE`), Q2 (token-based locks, bundled with ROOT-RECON-GRID-HARNESS) and Q3 (order vs M1). B does not schedule an extraction on its own.
