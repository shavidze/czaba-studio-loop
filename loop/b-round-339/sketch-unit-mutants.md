# B round 339 -> 340: unit evidence on the c4-ii sketch (DP51-DP56, GS5b)

Trees (all from `git archive 99a5912`, node_modules symlinked; tools in `sketch/*.py`):
- **sketch** = `apply-sketch.py` + `apply-sketch-ws.py` + `apply-tests.py` + `apply-gs5b.py` + Biome format of the DP file + `apply-tl-fixes.py` (DP56, the GS5b DOM/committed-m1 reads, the `Set` in `groupHasVideoClip`) + `apply-budgets.py` (= `sketch/{source,tests,budgets}.patch.txt`).
- **HEAD + new tests** (`unit-head-new-tests.log`): DP51, DP52, DP54, DP56 and GS5b red; DP53, DP55 green (they pin behaviour HEAD already has).
- **MU-OVERVIEW-COMMITTED** = sketch without the StudioWorkspace change (`unit-mut-ws.log`): only DP54 red (`expected '1.000' to be '4.000'`: the collapsed overview stays at the committed start during the drag).
- **MU-VIDEO-STORE** = sketch with `const previewGroup = previewGeometry;` (`unit-mut-video.log`): only DP53 red (the store holds a preview while the video member must keep the history path).
- **Sketch, 23 affected suites** (`sketch-targeted-vitest-final.log`): 23 files, 561 tests pass.
- First sketch run without the GS5b reader change: GS5b failed at its mid-drag `clipOf` read (`expected 4.3 to be 5.3`; `sketch-targeted-vitest.log`). The test read the committed `arrangement` mid-drag; the change moves those two reads to `getArrangement()` (`shownClipOf`) and adds `expect(clipOf(api, 's1').start).toBe(4.3)` (the committed state stays at the start during the drag). No assertion is removed.
- DP55 debug run: on a repeated blocked group move only the `ArrangementProvider` fiber renders (1; the status reducer returns the previous entry and the children bail out); `StudioWorkspace` 0, `ArrangementLane` 0.
- DP56 (tech-lead TL-3): a window blur mid group move restores both clips, no entry, store empty; red at HEAD only because HEAD holds no store preview mid-drag (`expect(previewOf(api)).not.toBeNull()`).
