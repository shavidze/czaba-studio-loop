COMMIT: OK (this round only changes button and input styling, adds token-assertion tests and updates two docs; I found nothing blocking)

## Code Review: V-3c-4a toolbar button surfaces (round 167)

I read `SECURITY_AUDIT.md`, `ERROR_TAXONOMY.md` and `architecture-checkpoint.md` before the review. This reviews the round-167 diff only. I did not do a full audit of these modules.

**Auth/purchase/download touch: none.** The four source files changed are all in `app/components/arrangement/` (MarkerRow, Master, TempoRow, StudioWorkspace). The diff has no logic, handler, effect, listener, timer, ref or type changes. Only `className` strings change, so this round cannot add event-ordering problems, leaks or extra render cost. The Master Peak class is still only recalculated when `over` flips.

The verify log shows 171/171 test files passing, Biome clean (218 warnings, all from earlier and in unrelated files) and both builds succeeding.

### Critical Issues
- none

### Suggestions (ranked)
1. **Low / UX — buttons that are on give no hover or press feedback.**
   - **Where:** `ArrangementMaster.tsx:112`, where the Master Peak in its `over` state uses `enabled:hover:bg-destructive/15` and `enabled:active:bg-destructive/15`, the same as its resting fill.
     - Its aria-label says "click to clear", but nothing changes when you hover or press it.
     - Master Mute on (`:173`), Snap/Env on (`StudioWorkspace.tsx:2287,2368`) and Metronome on (`ArrangementTempoRow.tsx:243`) behave the same way.
   - **Why it's like this:** it's deliberate (doc 136, R2), to keep the on-state fill from being covered.
   - **Possible fix, only if the spec allows it:** a one-step-stronger fill on hover/active, e.g. `enabled:hover:bg-destructive/20 enabled:active:bg-destructive/25` and `enabled:hover:bg-accent/25` for the others. Otherwise ask Saba.
2. **Low / accessibility — contrast was measured in a browser, not by the tests.**
   - Off-state text contrast drops from 6.68 to 5.98, which still passes AA (4.5).
   - The disabled Metronome is at 2.52. That's allowed because disabled controls are exempt.
   - With the border gone, the only visual edge of a button is a 5% fill. That may fall below WCAG 1.4.11's 3:1 for control boundaries. It's a design-spec decision, so record it as a known trade-off in doc 136.
   - The jsdom tests cannot see any of this. The only evidence is the C round 167 browser check, so it is worth citing there.
3. **Low / the styling depends on `cn` using twMerge.** The on-state fills and the `enabled:hover:`/`enabled:active:` overrides use the same variants as the base tokens. They only win because twMerge (`tailwind-merge ^3.4.0`) drops the conflicting base token. If `cn` were ever switched to plain `clsx`, which fill shows would depend on CSS order. TS8, UI11 and HM7 check that the dropped tokens are absent, which is the right check, so this is covered for now.
4. **Low / test fragility.** TS8, UI11, MS5 and HM7 all check raw `className` tokens. That's the project's existing pattern, but every later surface change (4b, 4c, Q2's `!` removal) will mean editing them again. The shared class proposed in the Architecture note would reduce this.
5. **Note / doc status.** Doc 136 still says "In Progress (awaiting C round 167)". That matches how doc 135 was handled, so it isn't a blocker. The next round should change it to Completed.
6. **Note / design.** At 16 px tall, the `rounded-md` corners turn the marker `+` into a circle and ◀ ▶ / Metronome into pills (R4). Keep Saba's option to veto this open.

### Good Practices Found
- Inputs and selects keep their borders and only get the larger radius (R3). This keeps the line between fields and buttons clear.
- `enabled:hover:`/`enabled:active:` keep disabled buttons from reacting. The Metronome's full disabled styling (`disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:text-muted`) is kept and tested.
- The Peak `over` string is unchanged, and the destructive hover/active tokens were added as a separate `cn` argument. This keeps the existing TH10 test valid.
- `motion-reduce:transition-none!` is present; focus rings are unchanged.
- No hardcoded colours. `bg-foreground/8`, `bg-foreground/12`, `duration-180` and the arbitrary `ease-[cubic-bezier(...)]` are the same values already used at `ArrangementTransport.tsx:51`, so this adds no new values. Everything uses Tailwind classes, with no custom CSS.
- Seven mutations were run and every one made a test fail, so the new tests do catch real regressions.
- No `any`, no suppression comments and no type assertions were added. Semicolons are in place.

### Architecture note
- **Signal 3 (the same costly change repeated in one region):** the same set of surface and motion classes now appears in 6 places. Rounds 4b and 4c will add about 6 more.
  - `ArrangementTransport.tsx:51`
  - `ArrangementMarkerRow.tsx:51`
  - `ArrangementTempoRow.tsx:241`
  - `ArrangementMaster.tsx:108` and `:171`
  - `StudioWorkspace.tsx:2285` and `:2366`
- **Keep for this round.** Copying the classes was the documented fallback (c) while checkpoint Q1 is unanswered. Extracting them partway through the 4a/4b/4c split would mean rewriting the tests now.
- **Proposal for the planner, after V-3c-4c:** a single shared class constant (`toolSurfaceClass`), or a `ToolButton` component built to `FORWARDREF_COMPONENT.md`. The arrangement components own it.
  - **Done when:** every button renders byte-for-byte the same `className`, and the twMerge on-state tests stay green.
  - **Tests:** point TS8, UI11, MS5, HM7 and TH10 at the shared class.
  - Do Q2 (removing the `!` suffixes) in the same task.
  - This is a proposal, not an approved scope.

### Alternative Approach
Not applicable. The diff only changes styling and touches no critical logic: auth, checkout and the Studio audio pipeline are not involved.

### Score: 8/10