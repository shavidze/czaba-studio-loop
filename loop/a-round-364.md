# A — round 364 (PERF-10b-ii-b re-dispatch: C-R363-01, C-R363-02, reviewer Lows)

No STOP. All §2.1 rows ran and passed.

## Changed files (6, exactly §1.1)
1. `app/lib/arrangement/__tests__/render-budget.test.tsx`: unchanged from round 363 (K7 `rb-memo-rows 3 rb-tests 13 rb-sha f67004381b1c`).
2. `perf/studio-lab-interactions.perf.spec.ts`, `measureBackgroundRangeDrag`:
   - **R-L1:** the reset problem also fires when `selectedAfter !== selectedBefore`. The message text is unchanged.
   - **R-L3:** `readClipState(clip)` is read before `t0` and after the reset's `waitForQuiet`. A start/width change pushes a problem.
   - New helper `readInsertMarker(page)` (`page.evaluate`, `string | null`). It reads after `snapshot(...)` and before the reset click, and again after the reset. A different value pushes "Insert Marker moved by the name-bar reset". Null on both reads pushes "Insert Marker not found".
   - These checks only push problems. Liveness and row values are unchanged.
3. `perf/budgets.interactions.json`: unchanged (K3/K4 equal planning).
4. `perf/lib/report.test.ts`: B's patch `b-round-363/sketch-perflib.patch.txt` (sha256 `90df5aab…`, matches the dispatched sha) applied unchanged with `git apply`.
5. Doc 234:
   - l.4 is `**სტატუსი:** Completed (C round 364 PASS)`.
   - New section `### ეტაპი 5: PERF-10b-ii-b (rounds 363–364, D-29z1182, D-29z1187)`. It holds the premise table, RB-MEMO1–3 with the MU-P/W/R table, the GATE320-S3 ruling, the 12 rows with A's round-364 values, the DC-KINDS change with the MU-K/MU-N table, the two reviewer checks, and the list of findings this stage closes.
   - Mermaid T/M edges fixed.
   - 4 dated bullets under `## შეცვლილი ფაილები`, including `perf/lib/report.test.ts`.
   - C-R363-01 entry under `## პრობლემები და გადაწყვეტები` (Problem → Solution).
   - Stage-5 bullet under `## ტესტირება`. It cites `b-round-363/sketch-perf-lib.log`, `b-round-363/mutants/summary.txt`, `b-round-362/mutants/summary.txt`, C's round-364 PERF-LIB row and C's round-364 PERF row.
   - PERF-10b-ii-b struck in the TODO list. There are still 7 `## ` headings.
6. Doc 168:
   - Sequence sub-bullet under item 5: the background drag and its name-bar reset, including the round-364 checks.
   - One `## მეტრიკები` bullet: 12 rows, `record`, owner PERF-10b-ii-b, D-29z1181, 18 wallclock `commits-per-move` rows.
   - l.4 unchanged.

## Acceptance (§2.1)
| Row | Result | Evidence |
|---|---|---|
| A-CLAIMS pre | PASS: byte-equal to planning | `a-round-364/claims-pre.txt` |
| A-CLAIMS final | PASS (details below) | `a-round-364/claims-final.txt`, `claims-final-vs-planning.diff` |
| A-TYPE | PASS, rc 0 | `a-round-364/typecheck.log` |
| A-LINT | PASS, rc 0, 205 warnings | `a-round-364/lint.log` |
| Scoped Biome (`/check` on the owned code paths) | rc 0, clean | `a-round-364/biome-scoped.log` |
| A-TESTS | PASS 13/13. RB-MEMO1/2/3 took 43/39/40 ms | `a-round-364/render-budget.log` |
| A-PERF-LIB | PASS **40/40**, rc 0 | `a-round-364/perf-lib.log` |
| A-PERF | PASS (details below) | `a-round-364/perf-run.log`, `latest-interactions.json`, `rowcmp.txt` |
| A-REVIEW | PASS: no Medium+ (details below) | below |
| A-DOC | PASS (as §1.4) | docs 234, 168 |

**A-CLAIMS final.**
- Unchanged from planning: K1, K3–K8, K10, K11, K13, K15, K17 and K18.
- K2 = `9da8daa 6`.
- K9 = `3a3291c7bdb3 / 4ea9c8b2886d / 10`.
- K12: bg-mentions 4, dragNames 1, lane-drag-stopped-step 1, spec-sha `0354d8e2bebc`.
- K14 = `bd0682b1 7 1 0 0`, dc-kinds-mention 7.
- K16: `1 ca98da32`, bg 2.
- K19 = `1 0 1 0 20f761a88bb4`.
- K20: insert-marker-reads 1, selected-before 3, all other values equal planning.

**A-PERF.** Production build, run alone, 06:15:52–06:23:37 UTC (`perf.start`, `perf.end`); doc edits only meanwhile, no other jobs.
- rc 0, 1 passed (7.6 m). `durationMs` 453584 (limit 560000).
- `complete` true, `failures` [], `abortedAt` null. `problems` [] and pageErrors 0 in all 6 passes, so the new R-L1/R-L3 problems did not fire.
- `perf-rowcmp.py` against `c-round-363/latest-interactions.json`: 264 rows (prev 264), asserted 95/95 pass, **189 EQUAL, 0 DIFF, 0 NEW**.

**A-REVIEW.** The `code-reviewer` subagent ran on the 6 files and scored them 9/10. It found no Medium+.
- **Low (doc 168), applied.** Doc 168 did not mention the "Insert Marker not found" case. I added the clause. The reviewer re-checked the edited bullet and reported no findings.
- **Low, not applied, for B.** The new `selectedAfter !== selectedBefore` check has no passing outcome when the clip starts unselected. The step relies on the earlier stopped-drag resets leaving the clip selected, which today's order guarantees. If that order ever changes, the "reset failed" message would blame the reset.
- **Low, not applied, for B.** The marker is read after the drag, so the check covers only the reset, as §1.3 specifies. A drag that moved the marker is not caught here. jsdom `background-time-selection-ui.test.tsx` l.317–319 covers that case. The reviewer's option is one more `readInsertMarker` before `t0`. I did not add it because §1.3 fixes where the reads go and a spec edit would mean re-running A-PERF.
- **Info:** helper placement style; "not found" is unreachable in normal use (the marker element is only `hidden`); the docs say "C round 364 PASS" before C runs, as L28 requires.
- **Architecture note:** keep `measureBackgroundRangeDrag` separate from `measureDrag`. Its liveness rule and reset are different. This agrees with SIG-R363-DRAG-ROW-WRITER; no task.

## The 12 background values (A round 364; median and samples)
| Row | 1× | 6× |
|---|---|---|
| `interact.drag.background-range.stopped.commits-per-move` (wallclock) | 0.983 [0.983 ×3] | 0.983 [0.983 ×3] |
| `….move-components-max` | 37 [37 ×3] | 37 [37 ×3] |
| `….release-commits` | 1 [1 ×3] | 1 [1 ×3] |
| `….move-to-paint-p95` (wallclock, ms) | 2.8 [3.2, 2.7, 2.8] | 17.4 [15.3, 18.8, 17.4] |
| `….move-components-per-move` | 7.383 [7.383 ×3] | 7.383 [7.383 ×3] |
| `interact.harness.drag-background-range-live` | 1 [1 ×3] | 1 [1 ×3] |

The deterministic values equal round 363 (both A and C).

## For B
- Doc 168's older round-225 paragraph still says 16 wallclock `commits-per-move` rows; the new bullet says 18. The grant was additions-only, so I left the old text. It is a stale count for B to rule on.
- Reviewer Lows on `selectedBefore` and the drag-time marker read (above).

## SOURCE-SCOPE self-check
`git status --short --untracked-files=all`: 6 modified, 0 untracked. Both `git apply -R --check` (b-round-363 perf-lib patch, b-round-362 sketch) pass. `b-round-362/mutants-head/summary.txt` (cited in doc 234) exists.

## Known gaps
- Biome does not process `perf/**` (L30). `perf/**` is covered by typecheck. Biome's scoped log covered only the `app/` file.
- I ran no browser BG-RANGE or AUTH check myself; those are C rows. A's browser evidence is the production perf run.
- The full vitest suite, build and `npm run verify` were not run. They are gate rows.

## Next C checks
- CLAIMS: `bash b-round-363/claims-364.sh` should equal `a-round-364/claims-final.txt`.
- SOURCE-SCOPE: 6 modified files, 0 untracked; both B patches reverse-apply.
- PERF-LIB 40/40, plus C's own budgets mutant on a scratch.
- RB-MEMO 13/13.
- PERF (production, alone) against `c-round-363/latest-interactions.json`, recording the 12 values and `durationMs`.
- BG-RANGE at both viewports, plus `data-insert-marker` read across the name-bar click and clip start/width.
- G364-AUTH at both viewports.
- DOCS (l.4 byte-exact, stage heading, 7 `## `, counts vs live files, `C round N pending` = 0, doc 168 l.4 unchanged).
- MARKER-NONE-PLAYING-BACK (best effort).

## Scope completed
- §1.1 files 1–6 are done as specified.
- B acceptance rows truly passed: A-CLAIMS pre/final, A-TYPE, A-LINT, A-TESTS, A-PERF-LIB, A-PERF, A-REVIEW, A-DOC.
- C-R363-01 and C-R363-02 are fixed in the tree but close only on C PASS.
