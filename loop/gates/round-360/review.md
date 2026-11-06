COMMIT: OK

The diff is limited to two docs and `perf/budgets.interactions.json`. Nothing under `app/` changed. That means no auth, purchase or download code, no listeners or timers, no render path, no TS and no Tailwind. I also did not re-run the perf measurements. I relied on the C round 360 PASS and the verify log.

What I checked:
- **Row count:** `perf/budgets.interactions.json` has 93 `"mode": "assert"` rows, which matches the "84 → 93" claim in doc 234.
- **Owner tag:** 18 occurrences of `PERF-10a-BUDGETS` are consistent with 9 rows plus 9 notes.
- **Budgets:** the nine promoted rows match the doc 234 table: `==1`, `<=28`, `==1`, `==1`, `<=28`, and `<=3` for each of the four fade release rows.
- **Cross-reference:** doc 235, which doc 234 cites, exists at `235-workspace-session-remount.md`.
- **Verify log:** it shows `# fail 0`. The Biome warnings in it cover `app/` files that this commit does not touch. The "must be used within an ArrangementProvider" lines look like negative-test output.

Findings, ranked:

1. **Low — `interact.drag.fade.stopped.release-commits` has no margin** (`perf/budgets.interactions.json`, the row near line 363).
   - **Issue:** `<= 3` equals the measured value (3 ×3), so one extra commit fails the gate. Doc 234 says the playing variant has an intermittent third commit and its note says it is "2 ×3".
   - **Why it's acceptable:** this is the D-29z1151 upper bound and it was proposed by tech-lead.
   - **Fix:** none needed. If the gate flakes in a real browser, tighten the cause rather than raise the budget.

2. **Low — stale "Record until C measures it" sentence** in the two video-fade notes (budgets file lines ~236 and ~254).
   - **Issue:** the sentence now contradicts the "Asserted since…" sentence appended after it.
   - **Fix:** in a later round, drop the "Record until…" clause from those two notes.

3. **Info — `== 1` does not catch a Play that makes zero commits** (TL-R360-3).
   - **Why it's acceptable:** this is already documented in doc 234.
   - **Fix:** none.

Good practices:
- Each budget cites the oracle run, and the doc records the B sketch and mutant runs.
- The doc gives a stated reason for keeping the `.6x` copies on `record`.
- The commit changes no app code.

### Architecture note
- **Signal 3 (repeated costly change):** `perf/budgets.interactions.json` (about 3000 lines, a single file) takes row edits in nearly every round.
  - **Keep:** the file is cohesive and schema-driven, and a split carries risk.
  - **Proposal (for the planner, not a fix now):** this is the same issue as the existing ROOT-REQ-PERF-TIMEOUT item. Split the interactions spec and, if a split happens, the budgets file by gesture family (play, drag, harness). Acceptance: the same 252 rows, `perf/lib/report.ts` reads them unchanged, PERF-LIB 40/40.
  - **Scope:** I only reviewed this diff.

### Alternative Approach
Not critical logic. This commit only moves rows to assert in the perf budgets.

### Score: 9/10