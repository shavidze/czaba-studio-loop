# B round 359 → 360 planning

**Decision: CONTINUE.** Round 360 is **PERF-10a-BUDGETS**. Nine 1× perf rows go from `record` to assert: the five Play/Stop rows and the four fade-release rows. C also runs the two VIDEO-FAIL-STOP variants carried since round 357. The task is in `current-task.md`.
- The round-359 task is archived as `tasks/round-359.md`, a byte-equal copy (`cmp` OK). Nothing was deleted.
- Advisor: available, and consulted after orientation and before declaring done.

## 1. Inputs read
- `context/active-summary.md`, the old `current-task.md` (now `tasks/round-359.md`), `a-round-359.md`, `c-round-359.md` and `c-round-359.json`.
- `gates/gate-round-359.json`: status **published**, commit `a977b97`. That is the baseline HEAD for round 360; `git log` agrees.
- `regression-last.json`: 2026-11-05, so the next regression is due on or after 2026-11-08. Today is 2026-11-06: not due.
- `lessons.md` (the B part, plus L37, L38 and L58).
- Backlog ids were looked up by id only: PERF-10 `split_d29z1153`, D-29z1151, D-29z1153, D-29z1161 and D-29z1162.
- Source and perf files were read only: `perf/budgets.interactions.json`, the interactions spec (`measurePlayback`), `perf/lib/budgets.ts`, `perf/lib/report.ts`, `ArrangementContext.tsx` (`startPlaybackAt`, `stopPlayback`, `pausePlaybackWithStatus`), `ArrangementClip.tsx` (`finishGesture`), `ArrangementVideoDock.tsx` (`startSlotPlayback`), and docs 232 and 234.

## 2. Round 359 closed from C's evidence (D-29z1163)
- **PASS**, with `browserVerified` and `realVerified` true:
  - TEMPO-REMOUNT and SETTINGS-REMOUNT at both viewports;
  - METRONOME-AUDIO (8 = 8 clicks; 0 with the metronome off);
  - CLEARED and RELOAD;
  - REMOUNT, equal to C358;
  - FOLLOW texts;
  - PERF 84/84, 0 NEW, 0 DIFF;
  - G359-AUTH (premium not bypassed) and DOCS.
- Gate 359 published `a977b97`. **C-R358-01 is closed**, and A-R357-TEMPO-SEED-REMOUNT-DUP is closed with it.

## 3. Round-359 notes routed (D-29z1164)
- To `deferred_low_polish`:
  - **C-R359-01** (Low, coverage: four of the ten restored fields have no red-proving row). The reviewer's Medium on the same gap is merged into it, as the round-359 task ruled. Rows WS6–WS8 are kept as suggestions.
  - **A-R359-REVIEW-METRONOME-REF-RENDER** and **A-R359-REVIEW-SESSION-READONLY** (both Low).
- **B-R359-VIEW-STATE-REMOUNT** is now confirmed in the browser and stays Low/deferred.
- **C-R359-OBS-FOLLOW-JITTER** is info: 5 px once against a 4 px tolerance, with equal texts.
- The Architecture note (`useWorkspaceTempoGrid`) joins signal A-R357-ARCH-PLAYBACK-SPLIT-HOOKS. It is not scheduled.
- The architecture checkpoint request is repeated, still non-blocking. Round 360 adds no store.

## 4. Round 360 evidence (D-29z1165), all in `b-round-359/`
- **Predictions first:** `checkpoint.md`, written before any run.
- **Sketch:** `sketch/budgets.patch.txt`, with sha256 `728ed85b…` in `budgets-dispatched.sha256`. 93 of 252 rows asserted.
- **Production perf runs, alone and in sequence** (`run-perf.sh`, `perf-summary.txt`):
  - **Sketch:** rc 0, 93/93, 0 NEW, 0 DIFF against C359.
  - **MU-A:** red on exactly the 3 predicted rows: components 70 and 70, sources 2.
  - **MU-B:** red on the 6 predicted rows: commits 2 and 2; fade release 5, 4, 4 and 4. Also red: the component rows at 99, which the checkpoint recorded as possible.
- **perf-lib on the sketch:** 40/40.
- **Sketch review** (`sketch-review.md`): `tech-lead` TL-R360-1…5 and `performance-optimizer` PO-R360-1…5 read files only. No Medium+ is left unruled. PO-R360-2 (the meter latch could add a Play commit) is ruled an accepted risk, backed by 18 equal samples per row.
- **VIDEO-FAIL-STOP pre-check** on HEAD `a977b97` (dev :5173, 1440×900, `vfs-probe.mjs`). Both variants are reachable:
  - **v2:** the video clip starts at 4.000. Playback stops at 00:04.002 with the video-failure text.
  - **v3:** Follow is paused before the clip. Playback then stops at 00:04.011 with the same text, and Follow returns to on.
  - After the advisor review, the probe creates its own output folder. Both variants were re-run with the final script (`vfs-probe.sha256`).
- **Claims:** `claims-360.sh` gives K1–K12. Three advisor fixes:
  - K7 excludes the root-lane paths, so an allowed root patch is not a STOP.
  - K12 pins doc 234 by content, not by line number.
  - A's final doc 234 l.4 hash is given exactly (`5807ea0e`).

  Both the planning output (on HEAD) and the sketch output are saved. K10 confirms 0 cited files are missing.
- **New signal:** SIG-R360-STATUS-WRITE-RENDERS-WORKSPACE (backlog addendum `update-backlog-addendum.py`). Under MU-B, one status write in the Play window renders 99 components instead of 28, because the provider value re-renders. It is input for planning PERF-10b and PERF-11, not a scheduled task.
- **Rulings:**
  - The oracle is C359, not the "C358" that D-29z1162 named. The values are identical.
  - The `.6x` copies stay `record`.
  - `start-sources` is `== 1`.
  - Doc 232 items 90 and 228 stay as dated history. The live contract goes to doc 234's stage 2, and doc 232 gains one TODO bullet. So A edits 3 files, and the code-reviewer is required.

## 5. Order (D-29z1166)
1. Round 360: PERF-10a-BUDGETS.
2. REGRESSION, at any planning on or after 2026-11-08.
3. PERF-10b.
4. PERF-9, then PERF-11…15.
5. STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → the phase-2 entries.

RETRO comes at round 368 or at the end of STUDIO-PERFORMANCE.

## 6. Files written by B
- `tasks/round-359.md` (a copy) and `current-task.md` (round 360).
- `b-round-359.md` and `b-next.json` (the previous one is backed up as `b-round-359/b-next-before-360.json`).
- `backlog.json`, v322 → v323. The backup is `b-round-359/backlog-before-360.json`, and the script is `update-backlog.py`.
- `feature-status.md`. The backup is `b-round-359/feature-status-before-360.md`, and the script is `update-feature-status.py`.
- `b-round-359/`: checkpoint, sketch, mutants, perf runs and summary, the sketch review, claims, and the VIDEO-FAIL-STOP probe and results.

B did not modify `store/`: `git status` shows 0 entries. All sketch and mutant work ran in `/home/runner/b359-scratch`. B started no long-running server; the probes used root's dev server on :5173.

## 7. Readiness for commit
- Round 359 is already published (`a977b97`).
- Round 360 is not ready. Root publishes only after C PASS on round 360 and the gate.
