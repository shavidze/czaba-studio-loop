# A round 372: PERF-11c-ii-a (test-only status probe migration)

No STOP. Scope is complete for the A part of the task. C verification is pending.

## Changed files (18 = the grants in `b-round-371/grants-372.txt`)
- `app/lib/arrangement/__tests__/helpers/workspace-probe.ts` and the 16 granted test files. These are applied from `b-round-371/sketch.patch.txt` with `patch -p1`, after `sha256sum -c sketch-dispatched.sha256` passed (`80961cd1…4933`). There were no other edits. `sha256sum -c b-round-371/sketch-files-sha256.txt` gives 17/17 OK (SKETCH-EQUAL).
- `docs/implementation/2026/quarter-IV/239-perf-status-probe-migration.md` (new, Georgian):
  - l.4 is exactly `**სტატუსი:** In Progress (stage 1 of 2; C round 372 PASS)`;
  - the 7 TEMPLATE `## ` headings are present in order;
  - `grep -rn 'C round [0-9]* pending' docs/implementation` returns 0;
  - every cited test id (FS1–FS8; S1–S6, S8, S1-same-act, S3-same-act, S5b, PO4; F7, D5; RS4; PV1–PV4) and every cited file exists, as I grep-checked and the reviewer confirmed.
- `git status --short --untracked-files=all` shows 18 lines, the same as the grants (`a-round-372/git-status.txt`).
- `sha256sum -c --quiet b-round-371/r372-frozen-sha256.txt` gives rc 0, and the protected `b-round-318/protected-sha256.txt` check gives rc 0.

## Checks actually run (logs in `a-round-372/`)
| Check | Result |
|---|---|
| `npm run typecheck` | rc 0 (`typecheck.log`) |
| `npm run lint` | rc 0. There are 205 repo-wide warnings, none of them in the 17 files (`lint.log`) |
| `npx biome check` on the 17 files | rc 0, no diagnostics (`biome-17.log`) |
| vitest on the 62 files of `covering-372.txt` (xargs from `store/`) | 62 files and 1,153 tests pass, rc 0 (`vitest-covering.log`, `vitest-covering.json`) |
| `pending-status.test.tsx --sequence.shuffle --sequence.seed=42` | 22/22 pass (`pending-status-shuffle42.log`) |
| Timeout headroom (L11) | The slowest test is CP12a: 9,262 ms here and 9,844 ms in gate-371 `verify.log`, out of a declared 30,000 ms (33 %). TC10 is 4,848 ms in the gate, out of 15,000 ms (32 %). No test is above 50 % (`slowest-10.txt`) |
| ASSERT-COUNT | The `expect(` and `^\s*(it\|test)\(` counts equal HEAD in 16/16 files (`assert-count.txt`) |
| MIGRATION-COMPLETE (A self-check on a scratch copy, deleted afterwards) | The script prints `removed interface fields: 3, value shorthand lines: 6`. The tsc error files are workspace-probe.ts (3), StudioWorkspace.tsx (4) and ArrangementMarkerRow.tsx (1), which equals `tsc-sketch-removed-files.txt` (`tsc-removed.log`) |
| `claims-372.sh` | rc 0. The output differs from `claims-372-sketch-output.txt` only on K2 (`66ee771 status-lines: 18`) and K11 (`free: 1 last: 239-…`), as the CLAIMS row expects. There is no MISSING (`claims-372-a.txt`) |
| Mutants | Not re-run by A. These are C's MUTANTS-TREE row |
| Browser | Not run by A. The app is unchanged, and G372-AUTH and STUDIO-SMOKE-372 are C's rows |
| Full suite, build, verify, e2e smoke | Not run (speed rules). These are gate rows |

## Code review (actual `code-reviewer` subagent)
- **Review 1 (all 18 files):** no Critical, High or Medium findings; score 9/10. The reviewer read the current files only (its tools are Read/Glob/Grep, so it had no HEAD comparison). Assertion equality is backed by A's ASSERT-COUNT and the covering run.
  - Doc Lows: it named a script that is not in the repo, and its "18 vs 46" wording was unclear. **Fixed in doc 239.**
  - **Low, not applied:** `gesture-guard.test.tsx:14` declares the type `LaneDragProbeValue` between imports. SKETCH-EQUAL forbids any edit to the 17 sketch files, so this goes to B for deferral.
  - **Low, not applied (by design):** `WorkspaceStatusValue` is written by hand instead of `Pick<ArrangementContextValue,…>`. That is intended, because round 373 removes the fields.
  - **Low, input for round 373:** no migrated test reads `statusKey`. MU-HELPER-EMPTY-STATUS does not mutate `statusSequence`, so a sequence or key mutant is worth adding in round 373.
  - **Architecture note:** none.
- **Review 2 (doc 239 edits only, as the task requires for later edits):**
  - **Low:** "6 shorthand lines from the value object" was wrong. There are 3 shorthand lines (l.4205–4207) and 3 `useMemo` deps lines (l.4322–4324). **Fixed** with the reviewer's own wording. This is a one-phrase doc correction, not code.

- **Review 3 (HEAD diff of the 17 test files, `a-round-372/diff-17.txt`), which closes review 1's HEAD-comparison gap:**
  - no matcher or `expect(` was removed or weakened;
  - no test name changed;
  - no setup, act, timer, waitFor or timeout changed;
  - the line splits are Biome reformatting only.

  It raised two informational Lows. First, the helper calls `useArrangement()` twice (the same context, so no extra render). Second, each probe returns a new spread object on every render; the reviewer found no identity comparison on the probe object in the 4 files it searched, and all 62 covering files pass. Score 10/10.
- **Advisor-prompted doc wording (one phrase, after review 2):** "მიდგომა" no longer says that round 373 changes "only the helper body and two app readers". It now names the provider's status path as well, to match the TODO section and `sketch-review.md`. This is a doc-only change, inside the passage review 2 already covered.
- **Final mechanical re-check after all doc edits** (`a-round-372/final-recheck.txt`):
  - l.4 is EXACT;
  - all 7 headings are in order;
  - pending hits: 0;
  - status lines: 18;
  - SKETCH-EQUAL: 17 OK;
  - frozen rc 0, protected rc 0.

## Known gaps
- A did not run the mutants or the browser rows (both belong to C).
- The Lows above go to B (`deferred_low_polish` candidates).

## Exact next C checks (from task §3)
1. SOURCE-SCOPE: 18 status lines, the frozen sha check rc 0 and the protected sha check rc 0.
2. CLAIMS: `bash b-round-371/claims-372.sh` from the loop root.
3. SKETCH-EQUAL: `sha256sum -c ../tmp/studio-real-loop/b-round-371/sketch-files-sha256.txt` from `store/`.
4. ASSERT-COUNT on the 16 files vs `git show HEAD:`.
5. MIGRATION-COMPLETE on a copy under `c-round-372/tree`.
6. UNIT: the 62 covering files, plus pending-status with shuffle seed 42.
7. MUTANTS-TREE: MU-HELPER-EMPTY-STATUS (21 red) and MU-REVERT-ONE-PROBE (gains fader-click (7)).
8. G372-AUTH and STUDIO-SMOKE-372 at 1440×900 and 1280×720 on http://127.0.0.1:5173.
9. DOCS: doc 239 l.4, the headings, and every cited name exists.

## Acceptance criteria A truly passed
SKETCH-EQUAL, ASSERT-COUNT, the MIGRATION-COMPLETE self-check, UNIT (62 covering files plus shuffle), the typecheck/lint/Biome scope, SOURCE-SCOPE (status, frozen and protected), the DOCS structure and the CLAIMS output. C verifies these independently. The browser rows and mutants were not run by A.
