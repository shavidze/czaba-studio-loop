COMMIT: OK

I read the diff and the two changed files. The diff only touches `perf/budgets.interactions.json` and the implementation doc `232-perf-drag-preview.md`. Nothing under `app/` changed, so there is no code in auth, purchase, download, audio timing, listeners or timers, and there is no render, accessibility, Tailwind or TS-strict impact.

I checked that the budget file matches what the doc claims:
- 12 rows carry the new owner `PERF-CAND-VIDEO-TRIM-FADE-COST-2`, and the file has 82 `"mode": "assert"` rows. That matches the doc's "70 → 82".
- The 12 rows break down as 6 trim, 4 fade and 2 harness rows, which is what the doc table lists.
- The values are the ceilings of the round-350 measurements: 12.817 → 13, 15 → 15, 2.95 → 3, 3 → 3. The `==` rows use 1 and 0.
- The rows deliberately left as `record` (`move-to-paint-p95`, `playing.move-components-per-move`, `release-restarts`, video fade `release-commits`) have reasons in the doc.
- The verify log has no failures. The `Error:` lines at 4217–4250 are the expected output of "must be used within a Provider" tests, which are still passing.

**Findings, ranked:**
1. Low, `perf/budgets.interactions.json` (the new `assert` rows): each `note` still starts with "Record until C measures it…" before the "Stage 2 … assert" sentence. A reader may take the note as contradicting `mode: assert`. Fix in a later budgets-only edit by dropping the "Record until…" clause.
2. Low, `perf/budgets.interactions.json` (trim stopped per-move `<= 13` against 12.817, fade `<= 3` against 2.95): there is almost no headroom. The doc (item 107) explains this is intended, because one extra commit in stopped state is a real regression. The risk is that a legitimate small change causes a red row that needs a `windowCommits`/`componentsSum` check. No change needed.
3. Info, `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md:1` (title): the title grows with every stage and is now very long. Consider shortening it in a docs-only pass.

**Architecture note**
- Signal: `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md` (title and status line) → this is signal 3, repeated costly changes to one region. One doc now carries more than 20 stages, and its title and status line are edited every round. Keep it for now, because splitting a living implementation doc mid-feature has no benefit and no runtime risk.
- Proposal for the planner: when PERF-DRAG-PREVIEW closes, via the already planned ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE, run a docs-only task. It would move the per-stage sections into a child doc and keep a short index with a one-line status. This is not part of the current round.
- This is a review of the diff only. I did not audit the perf spec or the arrangement modules.