# A round 424: PERF-FIX-R423-LANE-SHELL

**Status:** implementation complete; awaiting C. No STOP. No commit, push or deploy.
**Baseline:** HEAD `875ff37` (unchanged at start and end).

## Changed files (`git status --short --untracked-files=all`)
```
 M app/components/arrangement/ArrangementLane.tsx
 M app/lib/arrangement/__tests__/drag-preview-render.test.tsx
?? docs/implementation/2026/quarter-IV/273-perf-fix-lane-shell-subscriptions.md
```
- The two code files come from `git apply b-round-423/sketch-424.patch.txt`: `--check` rc 0, then apply rc 0. The patch sha256 is `942dfdb660b529bc72e6e44fe4116f520343e71c6ffe2e100d6c8093fa0ae920`, the same as the reviewed sha. The two files were not edited afterwards.
- Doc 273 is new and is in Georgian. Its l.4 is byte-exact `**სტატუსი:** Completed (C round 424 PASS)`, and its 7 TEMPLATE headings are in order.
  - The mutant block is a byte-exact copy of `b-round-423/mutants/summary.txt`, checked with `cmp`.
  - The 4 `names-summary.txt` lines are copied byte for byte.
  - The 17-id table comes from `compare-404-423-sketch.txt`; the ids were cross-checked against `c-round-423.json`.

## Checks (logs in `a-round-424/`)
| # | Check | Result |
|---|---|---|
| A1 | claims at the start (`claims-a1.txt`, `.err`) | rc 0, stderr empty. Identical to `claims-424-planning-output.txt`, K12 included (0 diff lines) |
| A2 | `npx vitest run $(cat covering-files.txt)` (`a2-vitest.log`) | rc 0, **12 files, 291/291**; `drag-preview-render` 77/77 |
| A3 | `npm run typecheck` (`typecheck.log`); `npm run lint` (`lint.log`) | rc 0; rc 0 with 205 warnings and 1 info (same as B's pre-check) |
| A4 | `npx biome check` on the 2 code files (`biome2.log`) | rc 0, no fixes |
| A5 | claims at the end, re-run after the last doc edit (`claims-a5.txt`, `.err`) | rc 0, stderr empty. K1 stays `875ff37`. K2 `1 ?? 2 M total 3`, K3 frozen 1319 rc 0, K4 protected 11 rc 0, K5 `no`, K6 `1` with the l.4 line, K9 and K10 equal the a5-stub output. Every other line equals the planning output. The only differences from the stub file are K1 (that line is the stub's scratch HEAD) and K21 (not in the stub; it equals the planning output) |
| A6 | `code-reviewer` subagent on the 3 files | No Critical, High or Medium. 3 Lows, listed below |

- **A6 trace:** `a-round-424/a6-code-reviewer.md` (agentId a6e15b622db43daa5).
- **Patch identity pre-check:** from `store/`, `git apply -R --check sketch-424.patch.txt` gives rc 0, so the two code files are exactly the sketch.

## A self-check (lessons "Before handing over", pre-flight)
- **Pre-flight:** honestly, the `pre-flight` skill checklist was run **after** the apply, not before. Applied to this round:
  - Assumption: apply B's reviewed sketch as-is.
  - Smallest version: the sketch itself (2 files) plus doc 273.
  - Scope: only the 3 granted paths.
  - Success: A1–A6.
  All hold.
- **L11, timeouts:** no covering test is above 50 % of its declared timeout (`a2-vitest.json`). The highest are:
  - render-budget detail panel: 2.06 s of the default 5 s (41 %);
  - CP12c: 6.1 s of 30 s (20 %);
  - render-budget Play→Stop→Play: 3.3 s of 15 s (22 %).
  Nothing failed, so there is no STOP.
- **L12:** no class selectors were added; the test changes use component names only.
- **L13–L15:** not applicable (no scanner, no dialog, no colour change).
- **L26:** every row the doc cites exists: DP2, DP49, DP21, DP29, DP30 and the 4 shell `toBe(0)` lines 437/612/981/1252. All 7 headings are in order.
- **L28:** l.4 is byte-exact.
- **The doc's DP30 paragraph** states only what was observed, citing K10 `lane-gt0 1`. The cause is not given (reviewer guess: a committed-context change such as the timeline extent; unconfirmed).

A did not run `npm run test:perf`, the full suite, the build or the browser rows. Those belong to C and the gate (L38). A ran no browser probe this round.

## Reviewer findings (A6) and how they were handled
1. **Low, DP30 (`drag-preview-render.test.tsx:1272`)** still asserts `rendersOf('ArrangementLane') > 0` on a same-lane move to x=80. DP21 asserts 0 for a similar gesture. The shell renders there for a reason that is not confirmed; a committed-context change such as the timeline extent is a guess. The test file is sketch-only, so it was **not edited**. Doc 273 now states the exception and labels it unconfirmed. → B: move DP30 to `ArrangementLaneViewInner`, or pin the reason the shell renders.
2. **Low, the mutant line numbers.** `mutants/summary.txt` cites the HEAD lines (436/610/978/1248). In the sketch tree, the shell `toBe(0)` asserts are at 437/612/981/1252. The doc keeps the byte-exact block, as the task requires, and adds a note with the correct lines. The error starts in B's artifact.
3. **Low, consistency.** The inner uses raw `useStore(useArrangementPreviewStore(), …)`. The existing wrapper `useArrangementPreview(selector)` (`ArrangementContext.tsx:5205`) would remove the direct `zustand` import. This is in the sketch-only file, so it is not edited. → `deferred_low_polish` candidate.

TL-R424-L1…L4 were not re-raised. The reviewer confirmed:
- the comparator ignores prop names;
- the hook rules hold for `useShallow(fn)(arrangement)`;
- preview and commit are batched;
- no assertion was lost.

## For B
- **Architecture note (reviewer, signal 2):** the subscriptions moved shell → inner. Keep. Low cost.
- **Architecture note (reviewer, signal 3):** the shell/inner boundary of `ArrangementLane` was split in round 409 and partly reverted in round 424. Each change needed the browser probe and the perf spec, and neither is in the gate. Proposal: run the perf `move-components` rows on any component-boundary change in `components/arrangement/`, or add a fiber-count assert that covers the Memo wrapper to the unit gate, so that the C-R423-01 mutant turns red in the normal gate. This overlaps RC-R423-PERF-SPEC-ON-STRUCTURE and GATE304-M1-PERF-LIB-NOT-IN-GATE. It is a proposal only, not done here.
- New Low candidates: A-R424-DP30-SHELL-RENDER and A-R424-PREVIEW-WRAPPER-STYLE (items 1 and 3 above), plus the line-number drift in `mutants/summary.txt`.

## Known gaps
- Not run by A: the perf interactions spec (C row 3), browser rows 4–8 and the full suite and build (gate). C-R423-01 is therefore **not yet verified** on this tree. The only perf evidence is B's sketch run.
- DP30's shell render is unexplained (Low).

## Exact next C checks
In the order of task §4 (L59):
1. Row 1: the claims must equal the A5 expectation (see `a-round-424/claims-a5.txt`).
2. Row 3: `npm run test:perf` alone, after a browser warm-up, with the 17 ids at the sketch medians.
3. Rows 4–7: the browser rows at :5173 (name probe fade/trim, ghost title, lane and leaf, video and play smoke).
4. Row 2: patch identity plus A2.
5. Row 8: auth.
6. Row 9: the doc (l.4, headings, the mutant block `cmp`) and the end scope.

## Acceptance (A's part only)
- A1–A6: all passed, as above.
- C rows 1–9: not claimed.
