COMMIT: OK

The candidate touches two files: the implementation doc `232-perf-drag-preview.md` and `perf/budgets.interactions.json`. It has no runtime, UI, auth, purchase or download code, so event ordering, listener and timer leaks, render cost, accessibility, Tailwind and TS strict don't apply. `untracked.txt` is empty. I checked the diff and the grep of `verify.log`; I did not re-run the perf harness. The warnings the log shows (Biome a11y, unused variables) are in files outside this diff.

## Code Review: budgets.interactions.json + 232-perf-drag-preview.md

### Critical Issues
- None.

### Suggestions (ranked, none blocking)
1. **`perf/budgets.interactions.json` ~2615–2623 (stopped per-move row):** Budget `<= 10` against a measured 9.883 leaves about 1.2% headroom per move. The doc (§116) says 8 extra components over the 60-move window turn the row red, and I see no problem with that. The risk is flaky reds if the harness gains any fixed per-window overhead, for example from a new unrelated component in the video dock. If that happens, raise this one row to `<= 11` rather than loosening the max rows. Keep as is for now, since `determinismFailure` already requires all three samples to grow.
2. **`perf/budgets.interactions.json` ~2623–2632 and ~2673–2682 (video `move-components-max`, `<= 13` and `<= 12`):** These have zero headroom. Any legitimate +1 component, such as an extra memo child in the dock, will fail them. They are deterministic and the doc justifies them. The failure message should point the next person to `PERF-CAND-VIDEO-MOVE-BUDGET`. The `owner` field already does this.
3. **`docs/.../232-perf-drag-preview.md` line 1:** The title keeps growing, since each stage appends to it. This is cosmetic. When the stage list is next touched, move it into the body and keep a short title.
4. **Doc consistency:** I counted the notes in the diff: 12 rows from video-trim-fade-cost-2, 5 from c5-ii and 2 max rows, which comes to 19. This matches §115. The assert row count of 82 → 84 matches two rows moving from `record` to `assert`, and the per-move row was already `assert`. The "3 row" wording in the changed-files list is also correct.

### Good Practices Found
- The budgets were tightened with evidence: three equal samples across three independent runs, plus a mutant (M-B2) that goes red on exactly the intended rows.
- `playing.move-components-per-move` stays `record` because its `kind` is wallclock and its samples vary (9.883–9.95). That is the right call.
- The stale "Record until …" text was removed by class, not just on the rows touched. This covers GATE354-S1.
- The doc follows the implementation-docs rule: Georgian text, with problem, solution and next-step sections.

### Architecture note
- Signal: `perf/budgets.interactions.json` (about 3000 lines, one region repeatedly edited, rounds 345, 348, 354 and 356) → keep for now. The edits are data-only, the schema is uniform, and nothing couples it to runtime code, so the cost is low. The doc already defers any new rows to ROOT-REQ-PERF-TIMEOUT or a spec split (D-29z1108).
- Proposal for the planner, optional: when the spec is split, also generate the repeated `note` boilerplate ("1x only, measured last…") from per-scenario templates. That would stop every stage from rewriting 12–19 long strings. Acceptance: the JSON schema test stays green and the row ids and budgets are unchanged.
- This is a review of the diff only. It does not say the module was fully checked.

### Alternative Approach
Not applicable. This is a budgets change and not auth, checkout or audio pipeline logic.

### Score: 9/10