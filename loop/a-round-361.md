STOP — needs B ruling on L11 timing: TG1 (`track-groups-ui.test.tsx`) 3212 / 3254 ms and UC1 (`track-group-collapse-ui.test.tsx`) 3054 / 3377 ms in the 9-file A-TESTS run. Declared timeout 5000 ms (vitest default; none is set). A's isolated 2-file rerun: TG1 1692/1767, UC1 1629/1689. Gate 360 `verify.log`: TG1 1794, UC1 1686. **The same 9-file command on a HEAD `93ea6c1` scratch (without this change): TG1 3561, UC1 3204** (`a-round-361/a-tests-head-scratch.log`). So it exists before this change and comes from the parallel run; the higher time (A's, 3377 ms = 68 %) decides, which makes this a STOP by L11's form. The tree is left at its final consistent state. All tests pass.

# A round 361: PERF-10b-i (active track moved into the selection store)

**Status:** implementation complete. Every A row passed (§2). The only open item is the L11 timing STOP above, which needs B's ruling (for example "accepted delta, parallel load, pre-existing on HEAD").
**HEAD:** `93ea6c1`, unchanged. No commit or push. Only the 11 granted files changed.

## 1. Changed files (11)
| # | File | How |
|---|---|---|
| 1–9 | `app/lib/arrangement/selection-store.ts`, `app/contexts/ArrangementContext.tsx`, `app/components/arrangement/ArrangementLane.tsx`, `app/components/arrangement/ArrangementLibraryPreview.tsx`, `app/components/arrangement/StudioWorkspace.tsx`, `app/lib/arrangement/__tests__/helpers/workspace-probe.ts`, `.../grid-snap-position.test.tsx`, `.../marker-time-snap-ui.test.tsx`, `.../selection-store.test.tsx` | `patch -p1 < b-round-360/sketch.patch.txt`, unchanged (patch sha256 `692c6467…` = `sketch-dispatched.sha256`). K15 = `f96e046ed0aa` = sketch |
| 10 | `perf/budgets.interactions.json` | `git apply b-round-360/budgets.patch.txt`, unchanged. sha256 `371659418617a302…` = `budgets-dispatched.sha256` |
| 11 | `docs/implementation/2026/quarter-IV/234-perf-playback-store.md` | §1.2: l.4, l.5, the new `### ეტაპი 3: PERF-10b-i (round 361, D-29z1170)`, 10 dated file bullets, a stage-3 testing bullet, and the TODO change (10b-i struck, 10b-ii, TL-R361-ACTIVE-TRACK-DANGLING) |

## 2. §2.1 rows (actually run)
| Row | Result | Evidence |
|---|---|---|
| A-CLAIMS pre | PASS: byte-equal to `b-round-360/claims-361-planning-output.txt` | `a-round-361/claims-pre.txt` |
| A-CLAIMS final | PASS: equals the sketch output except K2 = `93ea6c1 11` and K14 = `doc234-l4 d116f6ef doc234-h2 7 doc234-stage3 1 doc234-10b-bullet 0`, as §2.1 expects; every other K equals the planning or sketch output, as §2.1 assigns | `a-round-361/claims-final.txt` |
| A-TYPE | PASS: `npm run typecheck` rc 0 | `a-round-361/typecheck.log` |
| A-LINT | PASS: `npm run lint` rc 0, 205 warnings (≤ 205) | `a-round-361/lint.log` |
| /check (scoped Biome) | PASS: `npx biome check` on the 10 changed code files, rc 0, "Checked 9 files … No fixes applied" (Biome's config does not include the budgets JSON) | `a-round-361/biome-scoped.log` |
| A-TESTS | PASS: 9 files, 167/167. SS8, SS9, SS10, SS11 and UC7 are named in the verbose log | `a-round-361/a-tests.log` |
| A-PERF-LIB | PASS: 2 files, 40/40 | `a-round-361/perf-lib.log` |
| A-PERF | PASS: production, run alone. rc 0, `complete` true, `failures` [], 252 rows, 95/95 asserted, 0 NEW. `interact.click.components` 42 ×3 (asserted `<= 42`), `.6x` 42 ×3 (record). `click.commits` 2 ×3 at both rates. Against C360, only those two components rows differ, and no other row changed. `durationMs` **491070** (≤ 540000) | `a-round-361/perf.log`, `a-round-361/latest-interactions.json`, `a-round-361/perf-rowcmp.txt` |
| A-MUTANT | not required; B ran MU-1…MU-7 (`b-round-360/perf-summary.txt`, `mutant-MU-2.log`…`MU-6.log`) | — |
| A-REVIEW | PASS: `code-reviewer` subagent on all 11 files. **0 Critical/High/Medium.** Findings are in §4 | below |
| A-DOC | done as §1.2. 7 `## ` headings in TEMPLATE order; `grep -rl 'C round [0-9]* pending' docs/implementation` gives 0; l.4 md5 prefix `d116f6ef`; SS8–SS11 and UC7 exist in their files | `a-round-361/claims-final.txt` K14 |

## 3. Timing detail (L11 STOP, see the top)
- Idle rerun of the 9-file set: TG1 3254, UC1 3377, 167/167 (`a-round-361/a-tests-rerun.log`). HEAD scratch, same command: TG1 3561, UC1 3204, 163/163 (`a-round-361/a-tests-head-scratch.log`; the scratch was under `/home/runner/a361-head-scratch` and has been deleted).
- Final claims were re-run after perf: `git status --untracked-files=all` = 11 M, 0 untracked; `a-round-361/claims-final.txt` was overwritten with the post-perf output (identical to before).
- In the 9-file A-TESTS run (4 cores, files in parallel), the slowest tests were **TG1** (`track-groups-ui.test.tsx`) at 3212 ms and **UC1** (`track-group-collapse-ui.test.tsx`) at 3054 ms. vitest.config sets no `testTimeout`, so the 5000 ms default applies. 3212 ms is 64 % of it.
- Rerun of only those two files, twice, on this tree: TG1 **1692 / 1767 ms**, UC1 **1629 / 1689 ms**, about 34 % (`a-round-361/slow-rerun.log`). Gate 360's `verify.log` (HEAD without this change): TG1 1794 ms, UC1 1686 ms.
- Conclusion: the 3.2 s comes from the parallel load (it is the same on HEAD), not from this change. I did not change any test. By L11's "the higher time decides" it is over 50 %, so it is a STOP for B to rule on. The full-suite gate measures it again.

## 4. Code-reviewer result (score 9/10)
- **Low, `A-R361-REVIEW-CANDIDATES-ARRANGEMENT-DEP`:** `StudioWorkspace.tsx` ~l.3086: `trackGroupActiveCandidates` depends on the whole `arrangement`. Every arrangement edit therefore gives a collapsed group header a new array identity and a re-render. The reviewer notes this adds no cost, because `trackGroupOverviews` already changes on the same inputs. Not fixed: it is outside the patch (L11). It goes to B as a deferred-Low or PERF-10b-ii candidate.
- **info:** SS10's fixture puts `video` first, so it really tells "first audio" from "first track" apart. SS11 alone cannot fail on the HEAD code; its value is MU-5, as B designed.
- **info:** `TL-R361-ACTIVE-TRACK-DANGLING` was already known and is documented.
- **info:** `<= 42` has no headroom, deliberately (D-29z1170).
- No stale `activeTrackId` reads from `useArrangement()` or `latestRef` remain in `app/**`. The hook rules and the project rules (no `any`, no assertions, semicolons, no comments) hold.
- **Architecture note (for B/root, not a task):** ownership moved from context state into a `lib/` store (`selection-store.ts`). The reviewer says keep it: clip selection and the active lane are the same "what is selected" state, under one provider, read at event time like the range and playback stores. No action.

## 5. Known gaps
- None of the browser rows (ACTIVE-LANE, GROUP-RING, PASTE-LANE, VIDEO-FAIL-STOP-1, G361-AUTH, C's mutant) were run by A. They are C's rows. A did not use the dev server on :5173.
- Full vitest, build and `npm run verify` were not run by A (speed rules); they belong to the gate. The production build did run as part of the perf webServer and succeeded.

## 6. Next C checks (exact)
1. `bash b-round-360/claims-361.sh` → equals `a-round-361/claims-final.txt`.
2. SOURCE-SCOPE: `git status --short --untracked-files=all` (11 M, 0 untracked); `patch -p1 -R --dry-run < ../tmp/studio-real-loop/b-round-360/sketch.patch.txt`; `git apply -R --check ../tmp/studio-real-loop/b-round-360/budgets.patch.txt`.
3. PERF alone (production) plus `perf-rowcmp.py` against C360: 95/95, click components 42; compare with `a-round-361/perf-rowcmp.txt`.
4. C's own MUTANT (not MU-1…7), PERF-LIB 40/40.
5. ACTIVE-LANE (1440×900, 1280×720), GROUP-RING, PASTE-LANE through `b-round-360/lane-probe.mjs`, against `b-round-360/lane-probe/head-*.json`.
6. VIDEO-FAIL-STOP-1, G361-AUTH, and DOCS (l.4 byte-exact; the stage-3 numbers checked against `perf/budgets.interactions.json` and `b-round-360/perf-summary.txt`).
7. Optional: the TG1/UC1 timings in the gate's full-suite run (§3).

## 7. Scope completed
B §1.1 and §1.2 in full. The A rows passed: A-CLAIMS pre and final, A-TYPE, A-LINT, A-TESTS, A-PERF-LIB, A-PERF, A-REVIEW, A-DOC. The C rows and the gate rows are not claimed. The backlog is not marked complete.
