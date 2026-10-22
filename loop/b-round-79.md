# B round 79 → round 80 planning (D-29z45)

Date: 2026-10-22 · Author: B
- **Advisor:** available and used, **twice**.
  - Before writing: on the round choice, where the collapse state lives, the fit contract, selection pruning, focus and the checkpoint.
  - After writing: it found three gaps, and B patched all of them into the task.
    - Collapse is refused while an arrangement preview is pending, because `U` could unmount a fader whose keyboard preview has not been committed.
    - A marquee across a collapsed group in the middle of the lanes now has a discriminating row. B read `clipsInMarquee` and confirmed that it slices the DOM order.
    - Pruning runs only on the collapse action, not on Redo. This is documented.
  - It also flagged two cleanups, both done: the FOCUS-HIDDEN and UC4 text was rewritten, and FOLD-A11Y now uses `ariaSnapshot`.
- **Project subagents:** none consulted. Reading the source and the stored Ableton captures was enough.

## 1. Inputs read (as data)
- `context/active-summary.md`, then specific IDs in `backlog.json`, `feature-status.md` and `plan.md` (grep).
- **Round-79 reports:** `current-task.md` (now `tasks/round-79.md`, `cmp` OK), `a-round-79.md`, `c-round-79.md`, `c-round-79.json`.
- **Gate 79:** `gates/gate-round-79.json` (status **published**, commit `74eca15`, which is the baseline HEAD for round 80) and `gates/round-79/review.md`.
- **Loop state:** `env-status.json` (store 200), `regression-last.json` (2026-10-21), `root-review.md`, `root-pre-push-review.md` and `publication-checkpoint.json` (no new root note since the 2026-10-21 visual-A note).
- **Source at `74eca15`:**
  - `groups.ts`;
  - `ArrangementGroupHeader.tsx`;
  - in `StudioWorkspace.tsx`: `TrackLaneLayout`, `resolveTrackLaneLayout`, `withTrackGroupRows`, `toggleTrackFold`, the selection and group commands, `handleLaneBackgroundPointerDown`, the plain-letter block (`u` is free) and the row render;
  - in `ArrangementLane.tsx`: the fold rendering;
  - the context API list (`selectClips`, `setTimeRange`);
  - the doc 029 TODO.
- **Ableton (stored captures, untrusted data):**
  - `b-round-78/ableton-mixing-20261022.txt`: l.96 Unfold Group button; l.102/104 overview of a folded group;
  - `b-round-71/ableton-shortcuts-20261021.txt` (§42): `U`, Alt+U, `+`/`−`.

## 2. Round 79 result (C evidence only)
- **C PASS:** `browserVerified=true`, `realVerified=true`, 0 bugs. All 17 rows passed at both viewports. TG-AUDIO compared the WAVs by the round-26 rule (max|Δ| = 1 LSB).
- **Gate 79:** published `74eca15` to both remotes. Review 8.5/10, COMMIT OK. Verify: 111 files, 1871 tests.
- **Backlog (version 79):**
  - SRW-17 stage 1 → `c_pass_published` (browserVerified true);
  - SRW-17 stays `in_progress` / „მუშავდება“, because the collapse half of R17-G1 and all of R17-G2/G3 remain;
  - the fake-Bearer 403 stays BLOCKED (backend unavailable in the cloud). It is open evidence, not a bug.

## 3. Findings recorded
| ID | Source | Disposition |
|---|---|---|
| GATE79-S1-GROUP-BAND-POINTER | review #1 | Lows batch. The lane background handler needs a `trackId` and sets the active lane, so a group row needs a design decision first |
| GATE79-S2-UNGROUP-FOCUS-BODY | review #2, C O2 | **Round 80 F2** |
| GATE79-S3-SHORTCUT-HINT | review #3 | **Round 80 H1** |
| GATE79-S4-MAC-HINT-TEXT | review #4 | Lows batch (the string may be locked by the frozen round-79 test) |
| GATE79-S5-MULTI-DRAG-LANE-TARGET | review #5 | Signal (pre-existing, `ArrangementClip`) |
| GATE79-S6-ROWCOUNT-PER-RENDER | review #6 | Acknowledged |
| GATE79-S7-DOC069-STATUS | review #7 | **Round 80: one status line** |
| ARCH-R79-TRACK-ROW-SELECTION-HOOK | A + gate Architecture notes | Checkpoint request, **question 8** (addendum appended to `b-round-78-checkpoint-request.md`). No extraction in round 80 |
| C-R79-O1-TRACK-SELECTION-NEVER-CLEARED | C O1, A #9 | Lows batch / product question |
| C-R79-O2-FOCUS-AFTER-GROUP | C O2, A #8 | **Round 80 F1** |
| C-R79-O3 / O4 | C | Accepted / acknowledged |
| A-R79-REVIEW-RESIDUALS | A #4, #6, #11–#14 | Lows batch |
| TRACK-FOLD-U | B, §42 | Signal (`U` on plain tracks and the arrow-key fold are not bound) |
| GROUPS-NO-MODEL-SANITIZER | A note | Signal |
| R80-T | new | Tech Lead |

## 4. Round 80 choice and rationale
- **Regression round:** not due (last 2026-10-21; due on or after 2026-10-24). This condition is written into the task for round 81.
- **Bugs:** none open, no Critical or High.
- **Scope: SRW-17 stage 2**, the next dependency-ordered step. It is exactly the stage fixed in D-29z44 R2, and nothing is shrunk.
- **Contract choices (the smallest honest behaviour):**
  - **The collapse state lives beside the track fold in `TrackLaneLayout`.** It is the same lifecycle: view-only, no history, gesture-guarded, feeding the fit. This adds no third state/ref mirror to `StudioWorkspace`, which is the advisor's point about owner risk.
  - **Hidden rows are not rendered** rather than CSS-hidden. That honestly closes the doc 029 a11y TODO. G10, the marquee and `trackOrder` keep working on the rendered `[data-track-id]` subset without editing `ArrangementClip` or the marquee code.
  - **Collapse is not mute.** Live describes folding only as hiding tracks from view. The group mixer is stage 3.
  - **Nothing selected stays invisible.**
    - Collapsing prunes the hidden track rows, the hidden clips (through the existing `selectClips`) and a lane range on a hidden lane.
    - Ctrl+A remains global, and the overview shows the selected blocks.
    - The active lane is not moved, because the context is frozen. The collapsed group shows the active accent instead.
  - **The fit uses the visible lanes and writes back by track id.** This is the main stage-1 regression risk, and mutation (d) targets the index misalignment.
  - **The focus extras F1–F3 are labelled bounded additions.** Collapse needs the same focus-restore helper, and they close C O2 and review #2/#8. Review #1 (band pointer) is not added: the lane background handler requires a `trackId`, so it needs its own decision.
- **Ableton:**
  - Confirmed (text): the Unfold Group button, the overview on a folded group, and `U` for Collapse/Expand.
  - Deliberate difference: `+`/`−` stay zoom.
  - CZABA choices (unconfirmed in Live): no history, and the mixed-state `U` rule.
  - The expanded-group overview is unconfirmed, so it is not shown.
- **Owner risk:** `StudioWorkspace.tsx` is 2225 lines. Round 80 keeps logic in pure `groups.ts` helpers and the existing layout state, and the SRW-16 checkpoint request now carries question 8. There is still no root result for that checkpoint, and the request does not block.

## 5. Artifacts written by B this phase
- `tasks/round-79.md`: copy of the round-79 `current-task.md` (`cmp` OK).
- `current-task.md`: the round-80 task.
- `b-round-79.md`: this file.
- `b-round-79-checkpoint.md`.
- `b-next.json`.
- `b-round-79-r80-tree-sha256.txt`: 465 entries, 465/465 OK.
- `b-round-79-r80-snapshots/`: 4 files plus `SHA256SUMS.txt`.
- `b-round-79/backups/`: backlog, feature-status, b-next and plan as they were before this phase.
- `b-round-79/update_backlog.py`.
- `b-round-78-checkpoint-request.md`: SRW-17 addendum (question 8) appended.
- `backlog.json` (version 79):
  - SRW-17 stage 1 published, stage 2 dispatched;
  - round 79 closed and round 80 added;
  - R80-T added;
  - 15 findings added;
  - ARCH-CHECKPOINT-SRW16 updated.
- `feature-status.md`: header, current round, the round-79 result, the FB-12 and SRW-17 rows, R80-T, and the history line.
- `docs/technical/studio-real-workspace/plan.md`: D-29z45 added and the FB-12 map row updated.

B did not touch app source and did not commit or push. `regression-last.json` is unchanged, because no regression round closed. **Commit readiness:** round 79 is already published (`74eca15`). Round 80 has no source change yet.
