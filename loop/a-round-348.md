# A round 348: PERF-DRAG-PREVIEW conversions (trim/move/fade 1x rows asserted; DP63/DP65 finally)

**ROOT-REQ-PERF-TIMEOUT / L31 / L11 (slow covering test, listed at the top). Not a STOP. B rules.** The interactions perf spec has a 15-minute Playwright timeout, and L31's bound is 450000 ms, which is 50 % of it. A clean run went over that bound for the first time. A's store run took `durationMs` **453013** (`1 passed (7.8m)`). A's mutant runs took 450821, 466959 and 457154. For comparison, B's sketch took 439301, C round 347 took 440477, and A round 347 took 432344. This diff changes no app source and no harness work, only budgets, two test `finally` blocks and the doc, so the extra 3 s comes from the environment, not from this change. It is not a §4 STOP: §4 has no duration criterion, and A-PERF only says "`durationMs` recorded".

**Lint:** 205 warnings is exactly the ≤ 205 ceiling, so one new warning anywhere would fail A-LINT next round.

**SOURCE-SCOPE pre-check:** `git apply -R --check` passes (rc 0) for both `b-round-347/sketch/budgets.patch.txt` and `tests.patch.txt`, run after Biome.

**Scope completed.** There was no STOP. All three files are done, exactly as B's task says. The changes are test, budget and doc only. No app source changed.

## Changed files (3)
| # | File | Change |
|---|---|---|
| 1 | `perf/budgets.interactions.json` | `git apply b-round-347/sketch/budgets.patch.txt`, unchanged. 14 rows now have owner `PERF-DRAG-PREVIEW-conv`. Trim per-move and max are `<= 15`, trim release is `== 1`. Move per-move is `<= 16`, move release is `== 1`. Fade per-move and max went from `<= 24` to `<= 4`. Move max, fade `release-commits` and every `.6x` row stay `record`. |
| 2 | `app/lib/arrangement/__tests__/drag-preview-render.test.tsx` | `git apply b-round-347/sketch/tests.patch.txt`, unchanged. In DP63 and DP65, the code after `pointerDownAt` is now inside `try { …; pointerUpAt; released = true; undo } finally { if (!released) pointerUpAt(…) }`. There is no `catch`, and the assertions and their order are unchanged. |
| 3 | `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md` | Title line, l.4 status (`…conversions; C round 348 pending`), and a new section `### ეტაპი conversions` (items 88–93). Item 18 now points to the new fade budget. Also updated: the changed-files list (the budgets line and a round-348 entry), the testing section (3 entries) and TODO. In TODO, FADE-BUDGET, DETAIL-CLIPGAIN-MEMO and c6-ii are marked done, and the new order is VIDEO-TRIM-FADE-ROWS → MASTER-GROUP-FADER-PROPS → FADE-RELEASE-COMMITS. Stage c is updated, and the fade item target line now says 3.933 / `<= 4`. There are still 7 `## ` headings. |

## A rows (all actually run)
| Row | Result | Evidence |
|---|---|---|
| A-CLAIMS pre | **PASS**: equals `claims-348-planning-output.txt` | `a-round-348/claims-pre.txt` |
| A-CLAIMS final | **PASS**: the only differences from `claims-348-sketch-output.txt` are K2 = `95774e6 3` and K11 = `7 1 0 1`. Both are expected. K8 = 11, and K10 = `0 untracked 0`. K3–K7, K12 and K13 are the same as the sketch. | `a-round-348/claims-final.txt` |
| A-TYPE | **PASS**: rc 0 | `a-round-348/typecheck.log` |
| A-LINT | **PASS**: rc 0, **205 warnings** (limit ≤ 205), 1 info | `a-round-348/lint.log` |
| /check (Biome, test file) | **PASS**: rc 0 | `a-round-348/biome.log` |
| A-UNIT | **PASS**: 67/67 | `a-round-348/vitest-dp.log` |
| A-PERF-LIB | **PASS**: 40/40 | `a-round-348/perf-lib.log` |
| A-PERF (production, run alone) | **PASS**: rc 0, `complete`, `failures` [], 230 rows, **70/70** asserted pass, 0 NEW. Against C round 347: 165 EQUAL, 0 DIFF, 0 deterministic rows higher. Per move: trim 14.75 (max 15), move 15.317 (max 82), fade 3.933 (max 4). Release commits: trim 1, move 1, fade 3 stopped / 2 playing. `durationMs` 453013. | `a-round-348/perf-store-results/latest-interactions.json`, `a-round-348/perf-rowcmp-vs-c347.txt`, `a-round-348/perf-summary.txt` |
| A-MUTANT (all three, scratch `/home/runner/a348-scratch`) | **PASS**: MU-FINE-CLIPGAIN had 6 failures, MU-GROSS-PREVIEW 17 and MU-COMBO 22. In each one, the RED ids, medians and maxes match B's `b-round-347/perf-summary.txt` exactly, compared id by id. The mutants did not change `git status` in `store/` (still exactly the 3 files). | `a-round-348/perf-mu-*-results/`, `a-round-348/perf-mu-*.log`, `a-round-348/mutant-red-vs-b.txt` |
| A-REVIEW | **PASS**: the `code-reviewer` subagent found 0 Medium+ issues and scored the change 9/10 | below |

Runs were done in order (L38). The store perf run went first, then the three mutants one after another. typecheck, lint, Biome and vitest ran only after `perf-runs.done`. **Disclosure:** the read-only `code-reviewer` subagent only read files and started no processes, but it was running during the store perf run. After the runs, the dev server at :5173/studio-lab still answers 200.

## Code review (`code-reviewer`)
- **Low:** in DP63/DP65, if `pointerUpAt` inside the `try` throws, the `finally` calls `pointerUpAt` again, and a second throw would hide the first error. This is unlikely. It is B's patch byte for byte, and C's SOURCE-SCOPE row needs the patch to reverse-apply, so I left it unchanged. → B (`deferred_low_polish` candidate).
- **info:** the note on trim `move-components-max` says "ceil of the C round 347 value 15". It is a whole number, so "ceil" is odd wording. The fade max notes just say "value 4". These are B's patch bytes, so I left them. → B.
- **info:** the reviewer asked about the decision IDs. Items 89–93 use D-29z1102/D-29z1103 and the TODO uses D-29z1105. All three match the task's decisions block, so nothing changed.
- **Architecture note (for B):** "None of the four signals appear in this diff: it touches no app source, owners or lifecycle. Keep things as they are. The move ≤ 15 gap is already sent to ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE and should not be handled here."

## Known gaps / notes for B
- **Move ≤ 15 is met only in steady state.** Move per-move is 15.317 with budget `<= 16`, because the project-end crossing commit (82 components) is counted. **A PASS in this round does not make PERF-DRAG-PREVIEW done.** That needs checkpoint question 1 or PERF-CAND-MASTER-GROUP-FADER-PROPS.
- Fade `release-commits` (3 / 2) is still `record` (PERF-CAND-FADE-RELEASE-COMMITS). The `.6x` copies are not asserted.
- ROOT-REQ-PERF-TIMEOUT: the details are at the top.
- The scratch copies in `/home/runner/a348-scratch` are still there, outside `store/`.

## Exact next C checks
CLAIMS (`bash b-round-347/claims-348.sh` should equal `a-round-348/claims-final.txt`), SOURCE-SCOPE (3 modified files, 0 untracked, and both patches pass `git apply -R --check`), READ, UNIT 67/67, PERF (production, run alone, compared with `perf-rowcmp.py` against C347: 70/70), C's own MUTANT (predicted before running), PERF-LIB 40/40, G348-AUTH at both viewports, DRAG-SMOKE (trim, move and fade-in, then Undo, at 1440×900 and 1280×720 on :5173), and DOCS (l.4, one conversions section, 7 `## `, "C round 347 pending" count 0, and every stated budget matching the live JSON).
