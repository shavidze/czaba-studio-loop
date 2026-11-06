# B round 373 → 374 planning

## 1. Round 373 result (D-29z1235)
- **C round 373 PASS** (`c-round-373.json`):
  - 11 rows passed: SOURCE-SCOPE, CLAIMS, SKETCH-EQUAL, ASSERT-COUNT, UNIT (136 files / 2,153 tests), MUTANTS-TREE (6/6, same ids), PERF-INTERACT, STATUS-BROWSER, G373-AUTH, STUDIO-SMOKE-373 and DOCS.
  - `browserVerified` and `realVerified` are true, with 0 bugs. The gate rows were left to the gate.
- **Gate 373 published `e69eba4`** on both remotes (`gates/gate-round-373.json`, verify 252/3,703). This is the new baseline.
- **Done:** PERF-11c-ii-b, and with it PERF-11c-ii. SIG-R360 and A-R327-ARCH-STATUS-ONE-SOURCE are resolved. ARCH-CHECKPOINT-PERF11C-STATUS-STORE is closed (option A, verified).
- **Archive:** `tasks/round-373.md` is a copy of the dispatched `current-task.md` (sha256 `8a82ae74…`, identical). Nothing was deleted.
- **C's MUTANTS-TREE for round 373 is valid.** C committed its copy of A's tree (`32dd743`) before running the round-372 runner, which restores files with `git checkout`.

## 2. Findings and records (D-29z1236)
- **A's reviewer Low 1 (= gate 373 finding 2)** → B-R373-PLAYFROM-GESTURE-RANGE-TEXT, deferred. Its fix home is the next round that owns `placeInsertMarker`.
- **A Low 2 and Low 3** → info: A-R373-REVIEW-SAME-BATCH-PREVIEW and A-R373-REVIEW-SEQUENCE-PLUS-TWO. The second is a test-authoring note: across a handler with several writes, do not assert +1 sequence steps.
- **A Low 4** (the l.4 text before C ran) is by rule L28.
- **A Low 5 and the gate architecture note** are merged into SIG-R373-STATUS-STORE-NAME (a rename candidate; not scheduled).
- **Gate signal 4** → GATE373-ARCH-NONREFUSAL-REF (keep).
- **C's record (a), the LT12 text not seen in the browser:**
  - The cause is confirmed in the code. `writeInsertMarker`'s updater returns the text unchanged when the current text is not a marker or stopped kind (`ArrangementContext.tsx` l.946–963). C's start state was the add text.
  - This is a B spec gap (a state recipe that was not probed, L29), not a bug. It is filed as INFO-C373-LT12-PRESTATE.
  - Round 374's STATUS-LT12-BROWSER starts from a stopped text.
- **C's record (d):** ArrowLeft on a clip already at 0 moved nothing (INFO-C373-ARROWLEFT-AT-ZERO). The round-374 smoke holds ArrowRight.
- **Fake bearer → 500:** the backend is unavailable in the cloud. It is blocked, not a bug.
- **No Critical or High is open.** TL-R372-M1, the only Medium that is not manual, root or awaiting_user, closes with round 374's S5b-same-act row.

## 3. Round 374 = PERF-11c-iii-a (D-29z1237 … D-29z1239)
- **The premise was measured at HEAD (L37).** A dev probe with a DevTools hook (`b-round-373/probe/leaf-probe.mjs`, `leaf-head.json`, `subtree-head.json`, both viewports) shows that a zoom key, a lane mute and Ctrl+Z render StudioWorkspace and every `useArrangement()` leaf once. Space Play/Stop renders only VideoDock, so round 373's gain holds.
- **Consults:**
  - `tech-lead` ruled pattern A now, with the round-371 shape. The first stage is Master plus the ExportDialog shell; VideoDock and Lane come later, and a checkpoint should be requested.
  - `performance-optimizer` supplied the render-time vs handler-only inventory. It said PERF2-FIRST-FRAME-LONGTASK is not a leaf problem, so it moves to PERF-7 and PERF-11.
- **PERF-11c-iii is split into a–e:**
  - a: Master and the Export dialog;
  - b: Library with LibraryPreview;
  - c: Transport, LoopBrace and MarkerRow;
  - d: VideoDock;
  - e: Lane.
- **Sketch v2** (`b-round-373/sketch.patch.txt`, sha `2d2dfcb9…0b60`, 7 code files):
  - a memo `ArrangementMasterView`, with Pick actions;
  - a memo ExportDialog shell that returns null while closed;
  - `closeExportDialog`;
  - private `use…StoreContext(hookName)` helpers (B-R370; 10 wrappers);
  - the rows S5b-same-act, L8e/L8f and RB-LEAF1/2.
- **Pre-check:**
  - tsc and Biome rc 0. The full suite passes: 252 files / 3,717 tests.
  - Perf on a production build (v1, all specs): 214 PASS, 0 FAIL.
    - `interact.zoom.1.components-per-key` 73 → 67 (1x and 6x); `zoom.30` 160 → 154.
    - `releaseComponentsMax` is 6 lower on every drag kind.
    - start/stop 11/11; click 38.
  - The interactions spec was run again on v2 (`perf-sketch-v2.log`).
  - Mutants: 6/6 red (§6).
  - Counts: context-hygiene 50 → 52, pending-status 84 → 86, render-budget 129 → 140.
- **The `tech-lead` sketch review** (`b-round-373/sketch-review.md`) approved with changes:
  - The Medium was a diagnostic parameter on public hooks. It is fixed in v2 with private helpers.
  - The Lows were fixed: the RB-LEAF2 shell positive check and the PreviewLaneClips name.
  - Accepted deltas (R-SHELL-EQUIV): focus returns to the opener inside the same commit, `useId` is new per open, and the state resets on unmount.
  - Deferred: B-R373-EXPORT-CONTENT-DEAD-ISOPEN.
  - The delta review of v2 approved it, so the reviewed sha equals the dispatched sha (L58, §6).

## 4. Checkpoint, regression and RETRO
- **New, non-blocking:** ARCH-CHECKPOINT-PERF11C-LEAF-PLUMBING (`b-round-373/root-request-arch-checkpoint-leaf-plumbing.md`, D-29z1238). The trigger is a feature boundary plus repeated plumbing on StudioWorkspace. 11c-iii-b and 11c-iii-c continue with pattern A; d and e wait for the answer or for RETRO 384.
- **REGRESSION:** `regression-last.json` = 2026-11-05. It is due at the first planning on or after 2026-11-08.
- **RETRO:** about round 384.

## 5. B process note (D-29z1240), a RETRO 384 candidate
- B's first two round-374 mutant runs were invalid. The first used `git checkout` to restore a file on an uncommitted sketch, which reverted the sketch. In the second, two runs overlapped.
- The runner now restores each file from a backup. The invalid logs are kept in `b-round-373/mutants/invalid-git-checkout/` and `invalid-concurrent/`.
- No lesson is added now, because `lessons.md` is at 60 lines.

## 6. Mutants and the v2 review
- **Mutants on v2** (`b-round-373/mutants/`, the 140 covering files): 6 of 6 red.
  - MU-MASTER-NO-MEMO 1 (RB-LEAF1);
  - MU-MASTER-ACTIONS-FRESH 1 (RB-LEAF1);
  - MU-EXPORT-NO-SHELL 1 (RB-LEAF2);
  - MU-EXPORT-INLINE-ONCLOSE 1 (RB-LEAF2);
  - MU-HOOK-NAME-RANGE 1 (L8e);
  - MU-NONREFUSAL-OUTSIDE-GESTURE-ONLY 3 (S5b, S5b-same-act, SU5).
- After the runs, the scratch tree still equals the sketch (`sha256sum -c`).
- **v2 delta review** (`tech-lead`): approve. The reviewed sha equals the dispatched sha `2d2dfcb9…` (`sketch-review.md`, "Delta review v2").

## 6b. Attempt 2: STATUS-LT12-BROWSER recipe corrected (D-29z1241)
- B ran the planned round-374 recipe against HEAD before dispatch. After Space, Space the add text was still showing. The v1 probe also had wrong locators; its output was invalid and was overwritten.
- **Measured** (`probe/lt12-head-v2.json`, s1/s1b): after Enter, focus is a `role=option` button in the library listbox. Space there still starts playback (`data-playing` = true).
- **Cause, from the code:** the add text has no insert-marker kind (`insertMarkerStatusKind` = null). Start, stop and marker writes rewrite only marker-kind texts: `ArrangementContext.tsx` l.929–963 and l.1505, and `StudioWorkspace.tsx` l.2421. A first, unmeasured inference blamed the library preview for eating Space. The measurement disproved it, and it is withdrawn.
- **Recipe v2** (`b-round-373/probe/lt12-probe-v2.mjs`, which creates its output directory):
  1. Space (measured);
  2. Play button;
  3. Ctrl+Shift+Space, the step that brings in a marker-kind text;
  4. strip click while playing;
  5. Stop;
  6. strip click while stopped.
- At HEAD, both viewports show `Insert marker at 00:03.000 — playback continues. Stop, then Space plays from here.` at s4 and s6, and `Stopped — Space plays from the insert marker at 00:03.000.` at s5.
- The `current-task.md` row was rewritten; the pre-edit copy is `b-round-373/current-task-before-lt12-v2.md`. `claims-374.sh` K28 lists the two probe files. Both claims outputs were updated, with backups at `*.before-lt12v2*`. The HEAD-vs-sketch diff is still the same 16 lines. No bug.
- Store tree: `git status --short` was empty at `e69eba4`. B made no source edits in this phase.

## 7. Decision
**CONTINUE.** Much scoped work remains:
- PERF-11c-iii-b…e and PERF-12…15;
- STEM-LANES, SYS-1…3, STORE-2b…5, REVIEW-RECOMMENDATIONS and T12-ADVANCED;
- the phase-2 entries and the deferred Lows.

Nothing external blocks round 374. PERF-11b stays awaiting_user (non-blocking).

## 8. Ready for commit
Round 373 is published. Round 374 is ready for A. After C PASS it is one gate-ready unit: 7 code files and 1 doc.

## Advisor
The configured advisor was used after orientation, before the approach, and again before hand-off.
