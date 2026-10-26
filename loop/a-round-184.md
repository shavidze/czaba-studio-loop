# A round 184 — ROOT-RECON-GRID-HARNESS (D-29z149)

Status: **implemented, awaiting C.** A test-only round: no application source changed and no commit was made.

## Start check
- HEAD is `423fbc4`. `sha256sum -c --quiet b-round-183-r184-tree-sha256.txt` OK (1005). All 4 grant start hashes OK.
- Before editing, I confirmed again that the three blocks are byte-identical: snap l.23–101, musical l.29–107, triplet l.30–108.
- The Biome baseline on the 3 suites was 0 diagnostics (`a-round-184/biome-start.txt`).

## Changed files (6; `end-sha256.txt`)
| ID | File | Change |
|---|---|---|
| H1 | **new** `app/lib/arrangement/__tests__/helpers/workspace-test-environment.ts` | `export function createWorkspaceTestEnvironment()`. The body is the 79-line block with +2 indent. It returns `{ fakeClock, FakeAudioContext, FakeOfflineAudioContext, FakeAudioBuffer, FakeResizeObserver }`, has no module-level state and no exported type. |
| H2 | `grid-snap-ui.test.tsx` | Diff hunks are `13a14` (import) and `23,100c24,30` (block → destructure, which Biome wraps across lines). |
| H3 | `grid-musical-ui.test.tsx` | `19a20`, `29,106c30,36` |
| H4 | `grid-triplet-ui.test.tsx` | `20a21`, `30,107c31,37` |
| D1 | doc 151 | Only hunks `4c4` (status Completed), `73c73` (TODO struck through, then "შესრულდა: C round 183 PASS, გამოქვეყნდა `423fbc4`") and `75c75` (next step: harness r184, then REGRESSION). l.74 is unchanged. |
| D2 | **new** doc 152 `152-studio-grid-test-harness.md` | Georgian, TEMPLATE sections, status `In Progress (awaiting C round 184)`. |

- **Mechanical check:** `diff <(sed -n 2,80p helper | sed 's/^  //') <(sed -n 23,101p start/grid-snap-ui.test.tsx)` is empty.
- `git status`: 4 ` M` + 2 `??` (`helpers/` and doc 152). `git diff 423fbc4 --stat`: 4 files, +27 / −237. The frozen 1005 still checks OK at the end.
- `diff-vs-start.patch` holds the 4 grants against the start copies, plus the 2 new files in full.

## Tests and checks (actually run)
- **Targeted vitest (JSON):** `vitest-after.json`. 3 files (`testResults` = 3; the helper is not collected), 45 total, 45 passed, 0 failed, 0 pending/todo, rc=0.
  - `numTotalTestSuites=8` counts describe blocks, not files.
  - The default-reporter log is `vitest-after.log`: Test Files 3 passed, Tests 45 passed.
- **Not collected (R48), actual proof:** `npx vitest run helpers/workspace-test-environment` printed "No test files found", include `app/**/*.test.{ts,tsx}`, rc=1 (`not-collected.txt`). The targeted 3-file run alone would not prove this.
- **Name lock (R49):** `vitest-after-names.txt` (built with B's `vitest-names.py`) vs `b-round-183/out/vitest-base-names.txt`: **diff empty**.
- `vitest-files.txt` lists the 3 suites.
- **R47 probe** (`tools/r47-identity.mjs`, run on a /tmp copy with node 22 `--experimental-strip-types`; output in `r47-identity.txt`): two calls give a different `fakeClock` and different identities for all 4 classes. Setting `a.base` leaves `b.base = 0`, and each `currentTime` reads its own clock.
- `npm run typecheck` rc=0.
- `npm run lint` rc=0. It reports 218 warnings + 1 info, the same as gate 183, and 0 of them in the 4 code/test paths (`lint-full.log`, full listing).
- `npx biome check` on the 4 paths: 0 diagnostics, no fixes (`biome-after.txt`). No new warnings.

## Mutations (`a-round-184/mut/`; restored from `helper-clean.ts` and sha-checked OK after each one)
- **m312:** export renamed to `createWorkspaceTestEnvironmentX`.
  - `tsc` rc=2 with TS2724 in each suite: `grid-musical-ui.test.tsx(20,10)`, `grid-snap-ui.test.tsx(14,10)`, `grid-triplet-ui.test.tsx(21,10)`.
  - vitest: 3 files failed, no tests ran.
- **m313:** `currentTime` returns `0`.
  - tsc rc=0, vitest 45/45 passed: **0 red** (`m313-red.txt` is empty).
  - This is information for B: these 3 suites never assert anything through the fake clock's value. It is not a defect in this round.

## Code review (subagent `code-reviewer`, actually invoked)
- Verdict: no Critical / High / Medium findings, score 9/10. It confirmed 2 changes per suite, behavioural equivalence, isolation, that the helper is not collected and is still type-checked and linted, the naming, and no `any` / `as` / comments.
- **Low (lint/format not run by the reviewer):** addressed. I ran `biome check` on the 4 paths: 0 diagnostics, and the import order and destructure wrap were accepted.
- **Low (drift risk with the 73 copies):** out of scope by design. Recorded as a TODO signal in doc 152. I confirmed the count with grep: 73 suites still contain `const fakeClock = { base: 0 };` and `class FakeResizeObserver`.
- **Architecture note (verbatim, for B):**
  > One signal: checkpoint signal 3 (repeated expensive change in one region). The same Web Audio/ResizeObserver fakes block is still copied in 73 other suites, so any change to the fakes has to be repeated many times. Keep it as is for this round, because the user froze the scope at 3 suites. Proposal for the planner: one bounded task to move the remaining suites onto `createWorkspaceTestEnvironment()`. Before switching each suite, check that its fakes block is identical to the factory, and leave any suite whose copy has drifted on its own copy (or handle it separately) so its behaviour does not change silently. Pass criterion: each suite's diff is only the import and the destructure, and the suite passes before and after. This is a review of this diff only, not an audit of the module.

## Acceptance (A's part only)
- H1–H4, D1, D2: done as specified.
- R47, R48, R49: confirmed (probe, 3-file count, empty name-lock diff).
- m312: behaved as required. m313: observed and reported (0 red).
- **Not run by A** (they belong to C or the gate): all browser rows (STUDIO-RV-184, G184-3, PX-NET / REG-HYD), the full suite, verify, build and e2e. I did not use a browser this round, so `a-browse.json` was not created.

## Known gaps
- m313 shows that the fake clock's value is not covered by these suites. Adding an assertion is B's decision.
- 73 copies of the block remain (Architecture note above).

## Exact next C checks
1. T184-TARGETED: `npx vitest run $(cat ../tmp/studio-real-loop/a-round-184/vitest-files.txt) --reporter=json --outputFile=…`, then build the name list yourself and diff it against `b-round-183/out/vitest-base-names.txt`. Confirm `testResults` = 3.
2. SCOPE-184: frozen 1005 at C start and end; `sha256sum -c a-round-184/end-sha256.txt`; `git status` (4 M + 2 ??); `git diff 423fbc4 --stat`.
3. AN-REVIEW-184: the mechanical dedent diff above, the 2 hunks per suite, doc 151's 3 hunks, and doc 152.
4. MUT-184: read `a-round-184/mut/*`.
5. STUDIO-RV-184, G184-3 and PX-NET / REG-HYD on :5173 at both viewports.
