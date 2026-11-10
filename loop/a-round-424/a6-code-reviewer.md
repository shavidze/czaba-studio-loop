# A6 code-reviewer (round 424): summary of the subagent report

- Agent: code-reviewer, agentId a6e15b622db43daa5, run on 2026-11-10 against the uncommitted 3-file diff.
- Verdict: no Critical, High or Medium. Score 8.5/10.
- Lows:
  1. DP30 (drag-preview-render.test.tsx:1272) still asserts `rendersOf('ArrangementLane') > 0` on a same-lane move to x=80, while DP21 asserts 0. The doc did not mention this.
  2. Doc 273's mutant block cites the HEAD lines (436/610/978/1248). In the sketch tree the asserts are at 437/612/981/1252. The error started in `b-round-423/mutants/summary.txt`.
  3. The inner uses raw `useStore(useArrangementPreviewStore(), ...)`; the wrapper `useArrangementPreview(selector)` already exists (`ArrangementContext.tsx:5205`). Cosmetic.
- Checked and found correct:
  - the comparator is key-agnostic (`ArrangementLane.tsx:243-260`);
  - `committedLaneClips` is stabilised by useShallow;
  - `sourcePeaks` and `videoSources` are useState values (`ArrangementContext.tsx:843`, `:872`);
  - preview and commit are batched (`ArrangementContext.tsx:1019-1022`);
  - the hook rules hold for `useShallow(fn)(arrangement)`;
  - the `laneSources` deps are complete;
  - no other test asserts on `rendersOf('ArrangementLane')`;
  - the doc follows TEMPLATE.
- Architecture notes:
  - signal 2, the shell→inner ownership move: keep, low cost;
  - signal 3, the 409/424 boundary churn: proposal for B to make the move-components rows, or a Memo-covering fiber assert, part of the gate.
- Handling:
  - item 1: recorded in the doc as observed, with no guessed cause; the test is not edited (sketch-only grant);
  - item 2: a doc note gives the correct lines, verified by grepping `mutants/mutant-SHELL-SUBSCRIBES-HEAD.log` (437, 612, 981, 1252);
  - item 3: reported to B, not edited.
