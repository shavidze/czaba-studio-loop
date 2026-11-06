# B round 374 → 375 planning

## 1. Round 374 result (D-29z1242)
- **C round 374 PASS** (`c-round-374.json`):
  - 14 rows passed: SOURCE-SCOPE, CLAIMS, SKETCH-EQUAL, ASSERT-COUNT, UNIT (140 files / 2,195 tests), MUTANTS-TREE (6/6, same ids), PERF-INTERACT, PERF-RESOURCES, MASTER-BROWSER, EXPORT-DIALOG-BROWSER, STATUS-LT12-BROWSER, G374-AUTH, STUDIO-SMOKE-374 and DOCS.
  - `browserVerified` and `realVerified` are true, with 0 bugs. The fake-bearer 500 is listed as blocked (backend unavailable in the cloud). Gate rows were left to the gate.
- **Gate 374 published `ad13a96`** on both remotes (`gates/gate-round-374.json`). This is the new baseline. The working tree is clean at `ad13a96`.
- **Done:** PERF-11c-iii-a. **Closed:** TL-R372-M1 (S5b-same-act landed) and B-R370-HOOK-ERROR-NAMES (both in `open_findings`; the deferred copy too, L7).
- **Archive:** `tasks/round-374.md` is a copy of the dispatched `current-task.md` (sha256 `4d0e9eca…`, identical). Nothing was deleted.

## 2. Findings and records (D-29z1243)
- **Gate 374 finding 1** (Content's dead `isOpen` branches) = the existing B-R373-EXPORT-CONTENT-DEAD-ISOPEN, deferred, unchanged.
- **Gate 374 finding 2 = A-R374-REVIEW-L4 = C's note:** RB-LEAF1 cannot see a revert of the StudioWorkspace Master site. Filed as GATE374-L2-RBLEAF1-REVERT and **fixed in round 375** (the round owns `render-budget.test.tsx`; one assert plus mutant MU-MASTER-SITE-REVERT).
- **Gate 374 finding 3** (focus returns before the portal DOM is removed) → info GATE374-L3-FOCUS-ORDER: the accepted delta R-SHELL-EQUIV; C's browser rows show focus returns to Export.
- **C's records:** Master ArrowDown ×2 = two Undo steps → INFO-C374-MASTER-ARROWDOWN-TWO-UNDO; ~80 Tabs from body to Export → INFO-C374-EXPORT-TAB-DISTANCE. Both equal on HEAD, pre-existing.
- **Architecture:** gate 374's signal 2 is the second independent echo of ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING. Recorded as an input, not scheduled.
- **No Critical or High is open.** The open Mediums are manual, root or awaiting_user (A-R73-SAFARI-FLAG-FOCUS, GATE232-S2, GATE271-S1-NO-REALIGN, GATE274-S1-HELD-REPEAT-ANNOUNCE, GATE304-M1); none blocks the next round.

## 3. Round 375 = PERF-11c-iii-b (D-29z1244)
- **No root answer** to the leaf-plumbing checkpoint was found, so pattern A continues for b/c as ruled in D-29z1237. `tech-lead` confirmed waiting is safe.
- **Premise measured at HEAD in the browser** (L37; `b-round-374/probe/leaf-probe-375.mjs`, `leaf-head-375.json`, both viewports): a zoom key, a lane mute and Ctrl+Z each render `ArrangementLibrary` and `ArrangementLibraryPreview` once; a preview start renders the preview 12 times.
- **Sketch v2** (`b-round-374/sketch.patch.txt`, sha `b246502f…da2f`, 6 files):
  - `ArrangementLibraryView` and `ArrangementLibraryPreviewView` are `memo(..., sameLibraryLeafProps)`: every prop by `Object.is`, the tracks by id/kind/name, so a mute (new tracks array, same labels) renders neither;
  - the preview keeps its own `useArrangementActiveTrackId()` (the active-track selector), so an active-lane change renders only the preview;
  - `useArrangementLibraryActions`; the wrappers keep their signatures (tests mount them);
  - the name-keyed render counts move to the view names (required: the wrappers no longer mount under StudioWorkspace);
  - rows RB-LEAF3, LP-EQ1, LP-EQ2, and RB-LEAF1 gains `ArrangementMaster` 0 (GATE374-L2).
- **Pre-check:**
  - tsc and Biome rc 0 on v2. Full suite on v1: 252 files / 3,720 tests. v2 delta (test asserts only): the 4 library/budget files, 117/117.
  - Perf on v2, production build, all 4 specs alone: 214 PASS, 0 FAIL. `zoom.1` 67 → 53 (1x and 6x), `zoom.30` 154 → 140, `releaseComponentsMax` −14 on every committing drag, move/lane `move-components-max` 72 → 58. The win is bigger than the probe's 2 named leaves because the Library subtree (options, icons, the insert-marker text) no longer re-renders.
  - Mutants: see `b-round-374/mutants/summary.txt` and the task's §4.
- **`tech-lead` review** (`b-round-374/sketch-review.md`): approve with changes on v1; the delta review approved v2 (reviewed sha = dispatched sha). H1 (site-revert mutants survived), M1 (a Play/Stop row still counted `ArrangementLibrary`) and M2 (no id-only LP-EQ1 case) are fixed in v2. L1 → B-R374-MASTER-VACUOUS-NAME-COUNTS (deferred Low; `master-ui`/`fader-pointer-preview` count `'ArrangementMaster'` under StudioWorkspace, vacuous since round 374). L2 → info. L3 → SIG-R375-LEAF-COMPARATOR-HOME.

- **State recipes probed at HEAD (L29, after the advisor's final check):** the lane buttons "Video/Music — set as the active track" flip the preview's Add `aria-disabled`/title and the Active-track row as the task states, and a Playwright `dragTo` from `Bass` to the Music lane adds one clip at 00:05.000, at both viewports (`b-round-374/probe/recipe-head-375.json`, K28). Timeout headroom cited (Play→Stop→Play 2.3 s of 15 s). LEAF-PROBE carries the L38 warm-up clause.

## 4. Checkpoint, regression and RETRO (D-29z1245)
- **Architecture checkpoint:** ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING stays requested from root (bounded, read-only frontend-architect; `b-round-373/root-request-arch-checkpoint-leaf-plumbing.md`). Round 375 is the third pattern-A leaf; d/e wait for the answer or RETRO 384.
- **REGRESSION:** `regression-last.json` = 2026-11-05 (round 342). Due at the first planning on or after 2026-11-08; today is 2026-11-06, so not this round.
- **RETRO:** about round 384, or at the end of STUDIO-PERFORMANCE.
- **lessons.md:** unchanged (60 lines). No Saba-reported issue this round, so no "Why we missed it" section is due.
- **Not applicable:** reference-first, `product-designer`, YouTube, screen budget (performance refactor, no visible change).
- **Advisor:** used once before the plan (the configured advisor tool was available and was consulted before the plan).

## 5. Ready for the gate after C PASS
Round 375's 6 code/test files and 1 doc. Nothing else in the store tree changes.
