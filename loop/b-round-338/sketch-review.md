# B338 sketch review (PERF-DRAG-PREVIEW c4-i, round 339 task)

Reviewer: `tech-lead` (read-only; `code-reviewer` is not on this phase's consult list, as in round 337). Input: `sketch/spec.patch.txt` and `sketch/budgets.patch.txt` of sketch v1 (`apply-sketch.py` + `apply-budgets.py`), the scratch tree, and the v1 perf summary. No Critical or High finding.

| Id | Severity | Finding | Ruling |
|---|---|---|---|
| TL-1 | Medium | (a) used `< 2`; a stale or duplicate ghost would pass | applied in v2: `!== 2` (v1 runs: exactly 2 in every pass) |
| TL-2 | Low | (d) checked only the first clip's lane | applied in v2: the copy's lane is checked too |
| TL-3 | Low/Info | no entry read, so a ghost that stops moving is caught only through (c) | applied in v2: entry read + check (e), as in the lane drag |
| TL-4 | Low | a null `data-clip-id` would make the copy locator point at the original | applied in v2: a problem and `null` |
| TL-5 | Low | the `null` setup path leaves the copy and writes no live row; Control could stay held | applied in v2: `try/finally` around the Ctrl+click; on `null` the live row is set 0 and a left-over copy is removed with Ctrl+Z |
| TL-6 | Info | the own-lane copy read has no frame settle | applied in v2: double `requestAnimationFrame` before the read |
| TL-7 | Medium (task text) | A must run the format/lint check; A must update doc 168 and an implementation doc; the mutant's note must match the real mutant run; the setup relies on Ctrl+D selecting only the copy | v3: two sequence strings without interpolation use single quotes. Biome ignores `perf/**` (L30), so the task cites `npm run typecheck` plus the stdin format check `npx biome format --stdin-file-path=app/x.perf.spec.ts` (equal on HEAD and on the sketch). Docs 232/168 are granted. The liveness note is written only from the final mutant run. The Ctrl+D selection reliance is pinned by condition (f) and by MU-GROUP-SINGLE |
| TL-8 | Info | no state leak in the success path: 139/139 EQUAL; teardown `expect` aborts the pass if the copy stays; `buildThirtyClips` re-selects; Ctrl+D clears the redo entry | recorded |

## B's side observation (not a finding of this round)
Mutant MU-GROUP-SINGLE showed a single-clip drag released on the next lane after the pointer came back to its own lane. B reproduced it at HEAD on :5173 (`back-lane-probe.mjs`, `probe/back-lane-1440-sel0.json` / `-sel1.json`): with the Ctrl+D copy starting at the clip's end, every rightward same-lane position overlaps, `moveClip` refuses it, and the same-lane branch keeps the last valid lane target and its ghost (`keptGhosts`, `setStatus(studioClipStrings.moveBlocked)`). Release then commits "Move to track — Stems". Without the copy the same gesture returns to the own lane. This is the existing "a blocked position keeps the last valid placement" rule, not a regression and not touched by c4. Recorded as INFO-B338-BLOCKED-BACK-KEEPS-LANE-TARGET (info, product question candidate for the REGRESSION / Ableton list); no Ableton reference was checked for it.

## performance-optimizer
Not consulted this round: c4-i is a harness-only stage with every component row `record`; the only assert is the liveness row, proven by the sketch run and a red mutant. c4-ii (the store change and its budgets) consults `performance-optimizer` and `tech-lead`, as c3-ii did.
