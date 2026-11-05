# A round 343 — PERF-DRAG-PREVIEW stage c4-ii (group move preview via the store)

No STOP. All A rows ran and passed. The task is implemented as B specified. Whether the round passes is C's call; nothing here is self-marked done in the backlog.

## Changed files (exactly the 7 granted in §1)
- `app/components/arrangement/ArrangementClip.tsx`: `groupHasVideoClip`, gesture `group.hasVideo`, `previewGroup` in the group branch.
- `app/components/arrangement/StudioWorkspace.tsx`: `overviewGroupId` prop, the preview selector in `ArrangementGroupHeaderWithSelectionInner`, `sameTrackGroupOverviewClips`.
- `app/lib/arrangement/__tests__/drag-preview-render.test.tsx`: `PROJECT_END_CLIP`, DP51–DP56.
- `app/lib/arrangement/__tests__/grid-snap-ui.test.tsx`: GS5b uses `shownClipOf` plus 3 new asserts.
- `perf/budgets.interactions.json`: 10 group rows `record` → `assert` (owner `PERF-DRAG-PREVIEW-c4-ii`).
- `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md`:
  - l.1 suffix and l.4 exactly as in §1.4;
  - new section `### ეტაპი c4-ii …` (items 59–66);
  - entries under files, problems, testing and TODO.
- `docs/implementation/2026/quarter-IV/168-perf-interactions-baseline.md`: one paragraph added inside `## მეტრიკები` only.

The three patches (`b-round-339/sketch/source.patch.txt`, `b-round-339/sketch/tests.patch.txt`, `b-round-342/sketch/budgets.patch.txt`) were applied **unmodified** with `git apply`. A strengthened no hunks, so C's `git apply -R --check` should succeed for all three.

## A rows
| Row | Result | Evidence |
|---|---|---|
| A-CLAIMS pre | PASS: byte-equal to `claims-343-planning-output.txt` | `a-round-343/claims-pre.txt` |
| A-CLAIMS final | PASS: equal to `claims-343-sketch-output.txt` except K2 (`99a5912 7`) and K10 (`stage c4-ii of 7 1`); K7 equal (11 OK) | `a-round-343/claims-final.txt` |
| A-TYPE | PASS rc 0 | `a-round-343/typecheck.log` |
| A-LINT | PASS rc 0: 205 warnings + 1 info, the same as gate 339's `verify.log` (205 + 1) | `a-round-343/lint.log` |
| A-FORMAT | PASS: 4/4 `app/` files byte-equal under `biome format --stdin-file-path` | `a-round-343/format.log` |
| A-UNIT | PASS: 23 files, **561 passed** in 39.7 s | `a-round-343/unit.log` |
| A-UNIT-HEAD | PASS: `git archive HEAD` plus only `tests.patch.txt`, filtered to `DP5[1-6]` or `GS5b`. Red: DP51, DP52, DP54, DP56, GS5b. Green: DP53, DP55 (5 failed / 2 passed) | `a-round-343/unit-head-new-tests.log` |
| A-MUTANT | PASS: MU-OVERVIEW-COMMITTED (A's tree with `StudioWorkspace.tsx` = HEAD). Only DP54 is red (`expected '1.000' to be '4.000'`); the other 5 c4-ii rows are green. Scratch deleted by absolute path | `a-round-343/unit-mut-ws.log` |
| A-PERF | PASS (details below) | `a-round-343/perf.log`, `a-round-343/perf-results/latest-interactions.json`, `a-round-343/perf-rowcmp-vs-c339.txt` |
| A-PERF-LIB | PASS 34/34 | `a-round-343/perf-lib.log` |
| A-SCOPE | PASS: `git status` shows exactly the 7 files, 0 untracked; protected files 11 OK (K7) | `git status` (and see below) |
| A-REVIEW | PASS: code-reviewer subagent found no Critical, High or Medium; Lows and an Architecture note are listed below | this report |

**A-PERF details:**
- The run was alone (nothing else running), production build on :5188, and finished in 6.3 min.
- rc 0, `complete` true, `failures` [], 219 rows, **55/55 asserted pass**.
- Against `c-round-339`: **149 EQUAL, 8 DIFF, 0 NEW**. The 8 DIFF rows are exactly the ones in §0.3, with the same values in all 3 passes:
  - `interact.drag.group.{stopped,playing}.move-components-per-move` and `.6x`: 74.781 → **26.969**;
  - `interact.drag.group.{stopped,playing}.move-components-max` and `.6x`: 106 → **104**.
- Wallclock rows (recorded only): lane window 35.45, cross window 14.
- Unchanged: `release-commits` 1, `move-restarts` 0, `release-restarts` 2, `drag-group-live` 1 at both rates.

**Scratch method:** both scratch trees were built under `a-round-343/` (`scratch-head`, `scratch-mut`) with `node_modules` symlinked. Only vitest ran in them; no dev server was started (D-29z1057). Both trees were deleted afterwards.

## code-reviewer findings (subagent run this round)
No Critical, High or Medium. Every dropped side effect was checked against HEAD and found equivalent:
- release/commit: `commitHistory` records `before`;
- Undo during the drag is blocked by `gestureCountRef`;
- the stale/blur revert still uses `previewArrangement(gesture.before)`;
- cross-lane takes the identity branch;
- `setStatus` is unchanged.

Lows, for B to route (`deferred_low_polish` per the 2026-10-23 rule). A did not fix them, because the test hunks are B's sketch and C pins them with `git apply -R --check`:
- **A-R343-REVIEW-FROZEN-READERS (Low, residual risk).** During a non-video group drag, any reader of React `arrangement` stays at the committed state. The reviewer checked the collapsed header; the readout, detail panel, overview and project end already select the preview. Other multi-selection displays were not audited. C's GROUP-BEHAVIOUR and OVERVIEW-FOLLOWS browser rows cover what the user sees.
- **A-R343-REVIEW-DP55-LOOSE (Low).** In DP55, `ArrangementProvider <= 1` is loose by design (TL-7). The row's HEAD-red power comes from the workspace and lane counts.
- **A-R343-REVIEW-DP52-PREVIEW-NULL (Low).** DP52's `previewOf null` also holds at HEAD; the render counts are what distinguish HEAD from the change.
- **A-R343-REVIEW-DP53-DUP (Low).** One DP53 assert repeats the line above it.
- **A-R343-REVIEW-GROUP-CANCEL (Low).** There is no group-specific `pointercancel` test and no test for a second press over a leftover gesture. Both use shared code that DP56 covers.
- **A-R343-REVIEW-HELDREF-IN-RENDER (Low, origin pre-existing since c2a).** `useEqualityStableSelector` writes `heldRef` during render (`StudioWorkspace.tsx` ~l.643–652). The new selector reuses that existing pattern. The reviewer confirmed it cannot loop under zustand v5's `Object.is` check and that hook order is unconditional.

**Architecture note (signal for B, not acted on):** `ArrangementClip.tsx` now chooses among three preview paths (`previewArrangement`, `previewGeometry`, `previewGroup`). The reviewer's verdict is to keep it this round. It proposes one bounded task after c5, once video reads the preview store, to remove the `hasVideo` and `previewArrangement` fallback. This fits with ARCH-R339-DRAG-MEASURE-EXTRACT and ARCH-R338-STORES-PROVIDER for the frontend-architect checkpoint at the close of PERF-DRAG-PREVIEW.

## Known gaps
- A did not run any browser row: GROUP-BEHAVIOUR, OVERVIEW-FOLLOWS, BLOCKED-STATUS and G343-AUTH are C rows. The dev server on :5173 was neither touched nor restarted.
- The full vitest suite, `npm run build` as a gate step and `npm run verify` are gate rows, not run by A. The production build inside the perf webServer did succeed.
- L11 timing was measured, and nothing is above 50 % of its timeout (`a-round-343/timing-verbose.log`, 88/88 passed). The slowest test in the two changed files takes 359 ms (GS14; its describe timeout is 15 s, and the vitest default is 5 s). Gate 339 timed the files at 9.5 s for drag-preview-render (52 tests) and 6.4 s for grid-snap-ui (30 tests). The perf spec ran 6.1 min against its 15 min timeout (41 %). `claims-final.stderr` is empty.

## Exact next C checks
1. CLAIMS: `bash b-round-342/claims-343.sh` should equal `a-round-343/claims-final.txt`.
2. SOURCE-SCOPE: `git apply -R --check` should succeed for all three patches. A's docs are outside them.
3. UNIT and MUTANT as in §2.2, plus C's own predicted mutant (e.g. MU-VIDEO-STORE: only DP53 red).
4. PERF alone, compared with `perf-rowcmp.py` against `c-round-339`: the same 8 DIFF rows.
5. READ (GATE338-S1): `historyRef.current =` occurs at `ArrangementContext.tsx` l.922 (`updateHistory`), l.1942 and l.1946 (`previewClipGeometry`). A grepped this; C confirms it.
6. GROUP-BEHAVIOUR: record `providerRendered` per same-lane commit (DP51 predicts false).
7. OVERVIEW-FOLLOWS, BLOCKED-STATUS, G343-AUTH (fake Bearer → 403 while the mock is up), DOCS (doc 232 l.4 byte-exact; doc 168 diff only in `## მეტრიკები`).

## Scope completed
All of §1 (7 files) and all A rows of §2.1. The B acceptance rows A truly passed: A-CLAIMS, A-TYPE, A-LINT, A-FORMAT, A-UNIT, A-UNIT-HEAD, A-MUTANT, A-PERF, A-PERF-LIB, A-SCOPE, A-REVIEW. The C rows and the gate rows are open.
