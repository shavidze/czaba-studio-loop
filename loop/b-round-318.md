# B round 318 → 319 planning

**Date:** 2026-11-03
**Baseline:** gate 318 is `skipped` (C taskStatus FAIL). HEAD is `50662e1`, root's `chore(deps): add zustand@5.0.16` on `a5a9c97`. On top of it sits A's round-318 working tree, with 36 status entries, unchanged during C's phase and during B's phase.
**Decision:** CONTINUE → round 319 = PERF-8a fix-up on A's tree.

**Advisor:** available, and consulted after orientation. B adopted its advice:
- continue on A's tree;
- widen the grant only into the DetailPanel internals;
- keep ≤ 15 per move, with headroom arithmetic;
- re-set the max for the one-time null→range commit;
- memo the two wrappers, with a per-commit load tolerance;
- accept the 4 notices rows under the generator's own `devOptional` rule;
- re-baseline the protected sha in `b-round-318/`;
- measure with a scratch sketch;
- add an L37 clause.

## 1. Round 318 ruled (L10)
**Evidence used:** `c-round-318.json`, `c-round-318.md`, `a-round-318.md`, `gates/gate-round-318.json`, `c-round-318/rowcmp-*.txt` and `rows-*.json`. B did not re-run C's browser rows. B re-measured the range drag on its own scratch sketch (§2).

| Finding | Ruling | D-ID |
|---|---|---|
| C-R318-02 (Medium; A's STOP: 21.033/move, max 39 > 15) | The grant widens into `ArrangementDetailPanel.tsx` internals. Per move stays ≤ 15. Max becomes ≤ 35: the max is the first-move null→range commit with the transport flip, once per gesture. The transport is frozen; its split goes to PERF-10 | D-29z864 |
| C-R318-01 (Low; +2 fibers on 37 interaction rows, load +22) | `memo()` on `ArrangementRangeReadout`. `ArrangementRangeDetailPanel` is removed: the panel subscribes itself, and `range` is an optional prop where an explicit value wins. A memoised wrapper would not bail, because `detailSelection` depends on `selectedClip`. The clip overlay is a memo child with primitive props. **Named-fiber rule:** a non-range row may rise only by the overlay renders, which A names and C confirms. The load tolerance is per load commit | D-29z865 |
| C-R318-03 (Medium; TL5, notices) | Accept the generator's 4 rows (count 564). The header and TL2 define `devOptional` as runtime. Policy questions go to root/OSS-LIC as a signal | D-29z866 |
| C-R318-04 (Medium; deliverables missing because of the STOP) | Closed by round 319's rows (K14 5, notices, doc 230, mutants, review) | D-29z869 |
| C-R318-05 (Low; protected sha) | `b-round-318/protected-sha256.txt` → 11/11 OK. Closed | D-29z867 |
| C-R318-06 (Low, provisional, pre-existing at 1280) | Recorded in `open_findings`. A repro and root-cause row is added to REGRESSION-ROUND-2026-11-05. The Undo that followed is correct: it undid the Add, because the split never happened | D-29z870 |
| A's exception items (gesture-reentry prop literal; DXT8 needle) | Accepted. The rename-to-satisfy-needle alternative is rejected | D-29z868 |

**Not done:** PERF-8a is not done; feature-status marks it ბაგია. Its browser behaviour rows passed, but the perf rows and the deliverables did not.

## 2. B's pre-check: scratch sketch (L23)
- **Setup:**
  - `/tmp/b319s`, a tar copy of A's tree;
  - a dev server on :5196 with its own `cacheDir`;
  - A's profiler `a-round-318/diag-range-components-from-down.mjs`.
- **Sketch:**
  - the clip's range overlay as a child subscriber;
  - `memo()` on the two StudioWorkspace wrappers;
  - `memo()` on `ArrangementDetailPlayhead` and `ArrangementPeakPath`.
- **Result** (`b-round-318/sketch-diag-dev.json`): steady state **10 + 3 = 13 per move**; first-move commit **33**. The pointerdown commit (91) falls outside the harness window.
- **Main commit (10):** overlay 1, wrapper 1, panel 1, chevron 2, ContentInner 1, Waveform 1, ClipGain 1, readout 2.
- **Layout commit (3):** ContentInner, Waveform, ClipGain.
- **Not in the sketch:** the chevron hoist (−2) and the `Waveform` memo (−1 in the layout commit) were added to the task after the sketch. B's expectation is about 10 per move.
- **Files:** `sketch.patch.txt`, `sketch.py` and `sketch2.py`. The scratch server was stopped, and `store/` was never edited (36 entries before and after).

## 3. Consults (required before a PERF dispatch)
- **performance-optimizer:**
  - The Playhead and PeakPath memos bail: their props are numbers or stable.
  - The detail ClipGain will not bail: about 10 inline or plain handlers and 2 fresh arrays (`ArrangementDetailPanel.tsx` ~997–1050).
  - Hoist the chevron. A `Waveform` memo shrinks the layout commit.
  - The clip reads `range` only at render time, so a child subscriber is safe.
  - Estimate: about 8–11 per move. A max of about 20 is possible only with transport subscribers; measure before asserting.
  - The props StudioWorkspace passes to the detail wrapper are stable, except `detailPeaks` (INFERENCE).
- **tech-lead:**
  - Leave the transport to PERF-10: subscriber wrappers can remount a focused button. Pass `hasRange` to stable buttons there.
  - A ClipGain memo would widen the grant a lot.
  - `applyDetailRange` reads `range` at render time. That stays correct while `ContentInner` re-renders on every range change.
  - The selectors return the stored reference or `null`, and event-time reads use `getState()`. FACT, with file:line in its answer.
  - Two checks stay in place: the `setRange` status branch is gesture-gated (RS4/RS6), and the range-before-selection order is covered by the R-rows.

## 4. Claims and artifacts
- **`b-round-318/claims-319.sh`:** K1–K23. Head output is in `claims-319-head-output.txt`: K8 11 OK, K16 10/10.
- **`b-round-318/protected-sha256.txt`:** `package.json` at `50662e1`.
- **Backups:** `b-round-318/{backlog-before-319.json, feature-status-before-319.md, lessons-before-319.md, b-next-before-319.json}`.
- **Archive:** `tasks/round-318.md` is a byte copy of round 318's `current-task.md` (`cmp` equal).

## 5. Bookkeeping (D-29z871)
**Backlog v278:**
- round 318 → `c_fail_a_stop`, and round 319 is dispatched;
- 9 new `open_findings` entries:
  - C-R318-01 to C-R318-06;
  - SIG-R319-TRANSPORT-FLIP, SIG-R319-CLIPGAIN-PROPS, SIG-R319-DEVOPTIONAL-NOTICES;
- the PERF-8a stage → bug, with fix-up `budget_ruling_d29z864`;
- `consults_round_319`;
- `execution_order_d29z871`;
- a REGRESSION scope addition for C-R318-06.

**Other files:**
- **`feature-status.md`:** PERF-8a ბაგია; round 319 მუშავდება.
- **`lessons.md`:** L37 gains the budget-headroom clause. It is still 59 lines, and no lesson was dropped.
- **`regression-last.json`:** unchanged (2026-11-02). REGRESSION is due on or after 2026-11-05. RETRO is at round 320, the next round after this one.
- **`root-pre-push-review.md` / `publication-checkpoint.json`:** no new finding since round 317's triage.

**Architecture:**
- ARCH-R315-* and the round-319 signals stay signals.
- A bounded frontend-architect checkpoint is still requested at the PERF-8b/PERF-10 context-split boundary (D-29z862). It does not block now.

## 6. Commit readiness
**Nothing is ready.** The tree is mid-round, and root must not publish it. After C PASS and gate 319, the round-318 and round-319 paths are published together on top of `50662e1`.

**Hand-off review (advisor, second call), applied before hand-off:**
- **K2 after A = 41.** Round 318's 36 entries did not include `ArrangementDetailPanel.tsx`.
- **Detail wrapper removed.** The panel subscribes itself, because `detailSelection` depends on `selectedClip`.
- **Clip overlay.** It is a memo child with primitive props.
- **Named-fiber tolerance.** It replaces the unmeasured "A ≤ baseline" rule on non-range rows.
- **Notes in §0.2.** The dev max was 33, and the PeakPath memo has its limit.
