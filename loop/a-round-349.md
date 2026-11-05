# A round 349 — PERF-CAND-VIDEO-TRIM-FADE-ROWS (complete, awaiting C)

**Flagged deviation (not a STOP, B to confirm):** A-CLAIMS pre K2 reads `aca59b3 0`, not `70751a5 0`. Root commit `aca59b3` ("docs(store): direction decision — A Obsidian & Brass") is docs-only: `git diff --stat 70751a5 HEAD` = 1 file, `docs/technical/store-redesign/direction-decision.md`, +58. It has 0 lines in app/, perf/, e2e/ or docs/implementation. The premise and the C348 oracle are intact, and every other pre-claim line is equal (`a-round-349/claims-pre.txt`). I treated this as a baseline advance. **C: A's final K2 is `aca59b3 3`.**

## Changed files (exactly 3)
1. `perf/studio-lab-interactions.perf.spec.ts`: `git apply b-round-348/sketch/spec.patch.txt`, unchanged.
2. `perf/budgets.interactions.json`: `git apply b-round-348/sketch/budgets.patch.txt`, unchanged.
3. `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md`:
   - title line and l.4 status (`…, conversions, video-trim-fade; C round 349 pending`);
   - new section `### ეტაპი video-trim-fade …` (items 94–99: rows, the §0.3 table, the L31 ruling and no-more-rows rule, the M1 ruling, the cost finding);
   - a changed-files line;
   - a testing line with A's run;
   - TODO: conversions marked done (C348 PASS); the queue is now VIDEO-TRIM-FADE-COST → MASTER-GROUP-FADER-PROPS → FADE-RELEASE-COMMITS; the no-more-rows rule;
   - the c-stage summary line updated (L34).

No change to app/, perf/lib, other specs or budgets, e2e, config or protected files (K8 = 11, K10 = 0 / untracked 0).

## A rows
| Row | Result | Evidence |
|---|---|---|
| A-CLAIMS pre | PASS except K2 (deviation above) | `a-round-349/claims-pre.txt` |
| A-CLAIMS final | K3, K4, K5, K6, K7, K12, K13 and K14 equal the sketch output. K2 = `aca59b3 3` (expected `70751a5 3`, see deviation). K8 = 11. K10 = `0`, `untracked 0`. K11 = `7 1 0 1` | `a-round-349/claims-final.txt` |
| A-TYPE | `npm run typecheck` rc 0 | `a-round-349/typecheck.log` |
| A-LINT | `npm run lint` rc 0, 205 warnings (≤ 205) | `a-round-349/lint.log` |
| A-PERF | PASS. Production build, run alone, rc 0 (8.4 min). Details below the table | `a-round-349/perf.log`, `perf-results/latest-interactions.json`, `perf-rowcmp-vs-c348.txt`, `perf-checks.txt` |
| A-PERF-LIB | 40/40 (2 files) | `a-round-349/perf-lib.log` |
| A-REVIEW | `code-reviewer` subagent run on the 3 files: 0 Critical/High/Medium. The Low (testing section had no round-349 entry) is fixed. 2 info notes, no change: the repeated `?? 'audio'`; the move step labels changed format, which affects only `abortedAt` text and no row id. No new M1 evidence | below |

**A-PERF details:**
- `complete` true, `failures` [], 252 rows, 70/70 asserted rows pass.
- 0 `abortedAt` and 0 problems in all 6 passes.
- Against C348: 165 EQUAL, 0 DIFF, 22 NEW, exactly the §0.2 ids.
- Every new deterministic row is identical in 3/3 passes: trim 18.683 / 19 / 1 / 0 / 31; fade 8.85 / 9 / 2 / 0 / 31.
- Both liveness rows read 1 in 3/3 passes. `data-clip-start` and `data-fade-in` go 0.000 → 1.500 → 3.000.
- `durationMs` **490693** (≤ 540000; 54.5 % of the 900000 ms timeout).
- The playing trim per-move row (wallclock) has samples 18.683 / 18.683 / 18.717.

## Architecture note (for B; proposal only, not acted on)
The code-reviewer reports that `measureDrag` now carries a third set of new gestures (group, video move, now video trim/fade). It proposes keeping the code as is for now. When the spec is split under D-29z1108, the video block should move into its own spec file with its own timeout budget. The reviewer suggests joining this to ARCH-R339-DRAG-MEASURE-EXTRACT.

## Known gaps
- I ran no browser VIDEO-SMOKE, GRAB-PROBE, MUTANT or G349-AUTH; those are C rows. I ran neither the full vitest suite nor verify; those are gate rows.
- The interactions spec is at 54.5 % of its timeout. ROOT-REQ-PERF-TIMEOUT is still open.

## Next checks for C
- CLAIMS: compare with `a-round-349/claims-final.txt`. K2 `aca59b3 3` is expected.
- Run every other C row in task §2.2 (SOURCE-SCOPE onward) as written.
- PERF: compare the new deterministic rows against this run.
