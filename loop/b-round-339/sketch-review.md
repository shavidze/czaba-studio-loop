# B round 339 -> 340: c4-ii sketch review (consults and rulings)

Sketch: `/home/runner/b339-scratch/sc` = `git archive 99a5912` + `sketch/{source,tests,budgets}.patch.txt` (tools `sketch/*.py`).

## tech-lead (read-only, static, on the sketch before TL fixes)
No Critical/High.
- **TL-1 Info (GATE338-S1):** only three places write `historyRef.current`: `updateHistory` (publishes at once) and the two writes in `previewClipGeometry`. During a group drag, the only unpublished content is the preview itself, so the identity reset drops preview content only, as HEAD's `previewArrangement(before)` did. `moveClips` returns the same object at delta 0, so a full block (DP55) and a return to the start take the identity branch on every move. Edge case, the same at HEAD: a keyboard or wheel fader edit during a drag publishes `{...historyRef.current}` with the preview geometry; a later return to delta 0 overwrites it. **Ruling:** GATE338-S1 closes on C's READ row (§2.2). The edge case becomes signal SIG-R340-FADER-EDIT-DURING-DRAG (HEAD-equal; not scheduled).
- **TL-2 Low (HEAD-equal):** the clip-view unmount cleanup calls `release()` without reverting, so the gesture release would publish a preview with no entry. In practice the triggers are refused during a gesture (`setTrackGroupsCollapsed` refuses while `isPointerGestureActive()`). **Ruling:** signal SIG-R340-UNMOUNT-RELEASE-PUBLISHES; hypothesis, not reproduced; not scheduled.
- **TL-3 Medium (test gap): applied.** DP56 tests a window blur mid group move.
- **TL-4 Info:** no other reader of the committed `arrangement` that matters goes stale during a group drag. The table covers tempo seed, empty-lane hint, ghost lookup, marker-row `projectEnd`, video dock `hasVideoClips`, loop brace and track selection. The marker-row `projectEnd` matches the single-clip stage.
- **TL-5 Info: applied.** `groupHasVideoClip` uses a `Set`.
- **TL-6 Low: applied.** GS5b also checks the DOM `data-clip-start` `5.300` and that the committed `m1` start does not change mid-drag.
- **TL-7 Low:** DP55 allows `ArrangementProvider` ≤ 1. **Ruling: kept.** B's debug run shows that on a repeated blocked move only the provider fiber renders. `reduceArrangementStatus` returns the previous entry, React still renders the reducer's owner and the children bail out. Workspace and lanes are 0. Making it 0 would need a status-write change, which this round does not make (L51).
- **TL-8 Info:** the collapsed header selector is correct.

## performance-optimizer (read-only)
- Assert the same set as the c3-ii lane rows: group `move-components-per-move` `<= 27` (sketch 26.969; HEAD 74.781 fails), `release-commits` `== 1`, playing `move-restarts` `== 0`. `release-restarts` (2), `move-components-max` (104) and the window rows stay `record`. **Applied for both rates.** The lane `.6x` rows already carry the same modes in the budget file.
- Blocked-move status: covered by the TL-7 ruling. On a lane refusal the text changes once, then the reducer keeps the entry.
- Per-move CPU in the group branch (`markerSnapTimes`, `groupDeltaOnGrid` scan, a double `planClipLaneMove` on a refusal, `JSON.stringify` in `publishLaneGhosts`) → signal SIG-R340-GROUP-PERMOVE-CPU. Not renders; not scheduled.
- Collapsed-header subscription: no re-render unless a collapsed group's clips move. A collapsed group costs O(clips) CPU per preview update. Accepted.

## B rulings (D-29z1053)
- **Collapsed group overview: required.** At HEAD it is reachable and live. Ctrl+A selects clips on collapsed lanes; collapse prunes the selection only at collapse time. B's browser probe at HEAD (`probe/head-<w>.json`) shows the hidden block 0 → 3.000 mid-drag. Without the reader change the sketch freezes it (MU-OVERVIEW-COMMITTED, DP54 red). With the change, the sketch build matches HEAD (`probe/sketch-<w>.json`).
- **Group with a video clip: keeps the history path** (HEAD behaviour; stage c5 handles video previews). DP53 and MU-VIDEO-STORE.
- **Blocked-move status: unchanged `setStatus`** (TL-7).
- **Release-restarts 2: record.** Both moved sources restart once at release. It is not a per-move cost.
