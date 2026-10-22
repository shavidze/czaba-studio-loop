# B round 80 → round 81 planning (D-29z46)

Date: 2026-10-22 · Author: B
- **Advisor:** available and used, **three times**.
  1. **Before writing.** It covered the round choice, C80-1/C80-2, the model normal form, the header constraints, O3 and the artifacts. Its first recommendation was a real summing bus.
  2. **Reconcile call.** B found that a bus would break the published round-79 TG-AUDIO lock (0 `createBufferSource` on Ctrl+G during playback; `scheduleKey` covers only clips and the loop). The advisor withdrew the bus and agreed on effective gains. It also dropped its "preview-pending flag" suggestion, since the blur fix makes it unnecessary. It added two points, both now in the task:
     - the X1 ordering trap: capture the focused row before `blur()`;
     - O3 severity: the blocked ghost label means the refused path ran, so the severity depends on whether the refusal status is shown.
  3. **After writing:** see the end of this file.
- **Project subagents:** none consulted. Reading the source and the stored Ableton capture was enough.

## 1. Inputs read (as data)
- `context/active-summary.md`, `context/active-backlog.json`, then specific IDs in `backlog.json`, `feature-status.md` and `plan.md` (grep).
- **Round-80 reports:** `current-task.md` (now `tasks/round-80.md`, `cmp` OK), `a-round-80.md`, `c-round-80.md`, `c-round-80.json`, `c-round-80/probe-ghost.json`.
- **Gate 80:** `gates/gate-round-80.json` (status **published**, commit `68383fa91f0e58f577b5e33f14d21ff63fb1531c`, which is the baseline HEAD for round 81) and `gates/round-80/review.md` (8.5/10, COMMIT OK).
- **Loop state:**
  - `env-status.json`: store 200.
  - `regression-last.json`: 2026-10-21, so not due until 2026-10-24.
  - `root-review.md`, `root-pre-push-review.md` and `publication-checkpoint.json`: no new root note since the 2026-10-21 visual-A note.
  - `b-round-78-checkpoint-request.md`: no root result.
- **Source at `68383fa`:**
  - `graph.client.ts` (whole);
  - `schedule.ts` (`isTrackAudible`, 3 production callers);
  - `model.ts` (`setTrackMix`, `toggleSolo`);
  - `types/arrangement.ts`;
  - `ArrangementGroupHeader.tsx`;
  - the lane M/S/Volume markup (`ArrangementLane.tsx` l.557–760);
  - `ArrangementContext.tsx` (`startGraph` l.774–800, `syncPlayback` l.946–995, mix actions l.2122–2273);
  - `ArrangementClip.tsx` l.380–646 (for O3);
  - `StudioWorkspace.tsx` l.950 (C80-1).
- **Frozen tests checked for constraints:**
  - `GROUP_ROW_PX = 28` literal (two files);
  - `rowOrder` / `selectedRows` read `textContent`;
  - `parentId` literals and the GN "group state survives every edit" test;
  - `track-pan.test.tsx` source-text checks on `renderArrangementWav`;
  - the UC2 fader segment l.574–594.
- **Ableton (stored capture, untrusted data):** `b-round-78/ableton-mixing-20261022.txt`, §18.1 l.40–43, §18.3 l.90/92/100/112, §18.6 l.169.

## 2. Round 80 result (C evidence only)
- **C PASS:** `browserVerified=true`, `realVerified=true`. All 22 rows passed at both viewports. The fake-Bearer 403 is BLOCKED (backend unavailable in the cloud).
- **Gate 80:** published `68383fa` to both remotes. Verify 1900/1900.
- **Backlog (version 80):**
  - SRW-17 stage 2 → `c_pass_published` (browserVerified true);
  - SRW-17 stays **მუშავდება**, because stage 3 (R17-G2/G3, half-solo) remains;
  - stage 3 is dispatched.
- **Bugs:**
  - **C80-1 (Low):** scheduled as round 81 X1.
  - **C80-2 (Low):** closed by B decision. The shipped wording is the C2 contract.
- **Closed by C round-80 evidence:** GATE79-S2, GATE79-S3, GATE79-S7, C-R79-O2.

## 3. Findings recorded
| ID | Source | Disposition |
|---|---|---|
| C80-1 | C | **Round 81 X1** (blur-then-collapse; capture the focused row first; narrow UC2 amendment) |
| C80-2 | C, A deviation 1 | **Closed (B decision D-29z46)**; doc 070 l.70 records it |
| C-R80-O3-REFUSED-LANE-DRAG-PARTIAL-COMMIT | C O3, `probe-ghost.json` | Open, Low (Medium if the refusal is silent). One discriminating row in round 82 |
| C-R80-O1 / O4 | C | Acknowledged |
| GATE80-S3 label focus lookup | review #3 | Lows batch / row-focus checkpoint |
| GATE80-S4, S5, S7, S9 | review #4, #5, #7, #9 | Lows batch |
| GATE80-S6, S10 | review #6, #10 | Acknowledged (deliberate C1/C7) |
| GATE80-S8 doc 070 status | review #8 | **Round 81** (doc 070 l.4) |
| ARCH-R80-ROW-FOCUS | A + gate Architecture notes | Checkpoint request, **question 9** (addendum 2). No extraction |
| A-R80-PREVIEW-FLAG-SIGNAL | A deviation 3 / reviewer | Resolved by X1 (no context flag needed) |
| A-R80-REVIEW-RESIDUALS | A #8, #9 | Lows batch |
| GROUP-PAN-NOT-IN-SCOPE | B, §18.3 l.92 | Signal (not requested) |
| R81-T | new | Tech Lead |

## 4. Round 81 choice and rationale
- **Regression round:** not due; the condition is carried into the task for round 82.
- **Bugs first:**
  - C80-1 is handled inside the round as the labelled bounded fix X1. The group volume fader added in stage 3 sits in rows that a collapse can hide, so the same blur rule must cover it.
  - C80-2 needs no code.
  - No Critical, High or Medium bug is open.
- **Scope: SRW-17 stage 3**, exactly as D-29z44 R2 defined it (Mute/Solo/Volume in playback and export, nesting, half-solo). Nothing is shrunk; group pan was never requested.
- **Contract choices (the smallest honest behaviour):**
  - **Effective gain, not a bus.**
    - The result is acoustically identical (linear gains multiply, and there are no effects).
    - The topology does not change, so the published TG-AUDIO zero-restart property is preserved.
    - A single pure helper feeds live start, live sync and export, so play and export cannot drift.
    - The only observable difference from a bus is that child meters read post-group. This is recorded as a CZABA choice; Live's child-meter behaviour is not in the capture.
  - **Audibility rule:** mute beats solo at every level. A solo on a group or an ancestor makes its descendants audible. This follows §18.1 l.43 and §18.6 l.169.
  - **Half-solo** uses `aria-pressed="mixed"`, which is the accessible form of Live §18.3 l.112.
  - **Normal form:** the new fields are optional and omitted at their defaults. The frozen `toEqual` and the GN tests stay green, and `isSameArrangement` (JSON) is unchanged for plain groups.
  - **Header:** the row stays 28 px, because the literal is frozen in two tests. No text nodes are added, because `rowOrder` reads `textContent`. The labels avoid the frozen regexes.
  - **Ungroup drops the group's mix state.** This is the smallest rule: the children keep their own state, and Undo restores the group.
- **Owner risk:** this is the first SRW-17 round to open `ArrangementContext.tsx`, and SRW-17 reaches its feature boundary. Addendum 2 (question 9) was appended to the pending checkpoint request. It is non-blocking, and no extraction happens in this round.

## 5. Artifacts written by B this phase
- `tasks/round-80.md`: copy of the round-80 `current-task.md` (`cmp` OK).
- `current-task.md`: the round-81 task.
- `b-round-80.md`: this file.
- `b-round-80-checkpoint.md`.
- `b-next.json`.
- `b-round-80-r81-tree-sha256.txt`: 461 entries, 461/461 OK at HEAD `68383fa`.
- `b-round-80-r81-snapshots/`: 11 files plus `SHA256SUMS.txt`.
- `b-round-80/backups/`: backlog, feature-status, b-next, the checkpoint request and plan, as they were before this phase.
- `b-round-80/`: `update_backlog.py`, `update_status.py`, `update_plan.py`, `owned-existing.txt`.
- `b-round-78-checkpoint-request.md`: addendum 2 (question 9) appended.
- `backlog.json` (version 80):
  - SRW-17 stage 2 published, stage 3 dispatched;
  - round 80 closed and round 81 added;
  - R81-T added;
  - 17 findings added and 5 statuses updated.
- `feature-status.md`: header, current round, the round-80 result, the FB-12 and SRW-17 rows, three bug rows, R81-T, and the history line.
- `docs/technical/studio-real-workspace/plan.md`: D-29z46 added and the FB-12 map row updated.

B did not touch app source and did not commit or push. `regression-last.json` is unchanged, because no regression round closed.

**Commit readiness:** round 80 is already published (`68383fa`). Round 81 has no source change yet.

## 6. Final advisor review (third call), applied
- **GX-SOLO and GX-EXPORT-DIALOG:**
  - The setup has video Mute on, and `videoSoundStatus` takes one boolean. As written, both rows would pass trivially.
  - Both rows now run with **video Mute off**, and the export dialog row has a baseline/after comparison. This makes them real evidence for M2 and M7.
- **GX-CONTROLS depth:**
  - G2 ⊃ {music, G1} places G1 at depth 1, not depth 2.
  - The C row now checks ≥ 40 px at depth 1. The depth-2 width is A's recorded measurement in doc 071.
- **M5, "only soloed":**
  - The rule now explicitly includes groups.
  - GM6 gained the case "soloed track + soloed group, plain click on the track → the track stays, the group is cleared".
- **Pre-flight:** A confirms that no test renders `ArrangementGroupHeader` outside the provider.
- **Housekeeping:** the checkpoint was ticked. The advisor judged the artifacts consistent (68383fa, stage 2 published, stage 3 dispatched, X1 bounded, C80-2 closed, O3 scheduled, `regression-last.json` untouched, store clean) and dispatch-ready after these patches.
