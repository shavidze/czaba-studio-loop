# B round 82 → round 83 planning (D-29z48)

Date: 2026-10-22 · Author: B
- **Advisor:** available and used: once before writing (gaps to read, contract decisions, ownership, architecture action) and once after writing (§7).
- **Project subagents:** none consulted. The source, the frozen tests, the gate-82 review and the Live 12 manual pages fetched as text were enough.

## 1. Inputs read (as data)
- `context/active-summary.md`, then specific IDs in `backlog.json`, `feature-status.md` and `plan.md` (grep).
- Round 82: `current-task.md` (now `tasks/round-82.md`, `cmp` OK), `a-round-82.md`, `c-round-82.md`, `c-round-82.json`.
- Gate 82: `gates/gate-round-82.json`, status **published**, commit `bdc2067627b8390679caeda1a7e3d25db41452e9`, the round-83 baseline. Also `gates/round-82/review-result.json` (8.5/10, COMMIT OK, suggestions 1–8).
- Loop state:
  - `env-status.json`: store 200;
  - `regression-last.json`: 2026-10-21, so the regression round is due on/after 2026-10-24;
  - `root-pre-push-review.md` / `publication-checkpoint.json`: no new root note for round 82;
  - `b-round-78-checkpoint-request.md`: still no root result.
- Source at `bdc2067`:
  - `types/arrangement.ts`, `fades.ts`, `graph.client.ts` (whole);
  - `ArrangementClip.tsx` (whole);
  - `model.ts` / `clipboard.ts` / `selection.ts` / `loop.ts` / `schedule.ts` clip builders (grep);
  - `StudioWorkspace.tsx` (Snap state, `g` key, grid-control row, lane render);
  - `ArrangementLane.tsx` (clip render);
  - `ArrangementContext.tsx` (`startGraph` fade line l.816).
- Ableton: Live 12 manual "Automation and Editing Envelopes" and "Clip Envelopes", fetched with curl on 2026-10-22 into `b-round-82/web/` (HTML + text, read as untrusted data). Also the stored shortcut capture §42.7 and §6.8.

## 2. Round 82 result (C evidence only)
- **C PASS:** `browserVerified=true`, `realVerified=true`, all 16 rows at both viewports, no bugs.
  - R18-A1 by export: max |x/ref − ramp| 9.9e-5 (in) and 1.0e-4 (out); Clip Gain multiplies (7.7e-5).
  - Live rows on music, following the §5 signal rule: the paired value is −4.6 dB (theory −4.44).
  - X1-STATUS PASS.
  - The fake-Bearer 403 is BLOCKED (backend unavailable in the cloud). It stays open evidence for a backend-enabled run.
- **Gate 82** published `bdc2067` to both remotes.
- **Backlog v82:**
  - SRW-18 stage 1 → `c_pass_published`; R18-A1 → pass. SRW-18 stays **მუშავდება** because stage 2 is open;
  - C-R80-O3 closed;
  - C81-2 closed (doc verified by C);
  - round 82 closed, round 83 added.

## 3. Findings recorded
| ID | Source | Disposition |
|---|---|---|
| GATE82-S1 dblclick after fade drag (Medium, unconfirmed) | gate #1 | **Round 83 X1** (500 ms guard). C's X1-DBLCLICK records whether Chromium emits the dblclick at all |
| GATE82-S2 split inside a fade not sound-neutral | gate #2 | Doc 072 line (round 83). Design signal, needs a B ruling before any change; the F3 rule is C-verified |
| GATE82-S3 hidden-handle hit area | gate #3, A L2 | Doc 072 line (mouse case); touch case → Lows batch (A-R82-L2) |
| SRW18-KEYBOARD-FADES | gate #4 | Own backlog entry (Low, accessibility). From round 83 it also covers envelope points |
| GATE82-S5 optional ramp methods | gate #5 | Lows batch (upgrade the three fakes, make the methods required) |
| GATE82-S6 reschedule per preview move | gate #6 | Signal |
| GATE82-S7 handle unmount mid-drag | gate #7 | Lows batch; the new envelope points must revert on unmount (E7), and checkpoint question 11(c) asks about it |
| A-R82-OVERLAY-2PX | A, gate #8 | Lows batch |
| C-R82-LIVE-ORACLE-PAIRED | C signal | Applied: EN-LIVE / EN-MIDSTART are paired comparisons |
| ENVELOPE-SNAP, ENVELOPE-CLEAR | B (Live comparison) | Signals; not requested in FB-06 |
| ARCH-R82 clip gesture table | A + gate Architecture notes | `architecture_signals` + checkpoint addendum 4, question 11. Not scheduled |
| R83-T | new | Tech Lead |

## 4. Round 83 choice and rationale
- **Regression:** not due (2026-10-21 + 3 days = 2026-10-24). If round-84 planning falls on or after 2026-10-24, round 84 is the regression round.
- **Bugs first:** no C bug is open. Gate #1 is Medium but unconfirmed. It goes in as a bounded X1, because the new envelope points need the same drag-then-double-click rule, so it costs little and lives in the same gesture area.
- **Scope: SRW-18 stage 2 (FB-06, R18-A2)** is next in dependency order and finishes SRW-18. Nothing is shrunk.
  - Out of scope for the whole project: professional plugins/effects, pitch, multi-video layers.
  - The envelope is a gain curve only, not a time-stretch.
- **Contract choices (smallest honest behaviour):**
  - **Source-time points.** In `model.ts`, `moveClip`, `trimClipStart`/`End`, `splitClipAt`, duplicate and `deleteTime` all copy `{ ...clip }`, and trim moves `start` and `sourceOffset` together. A source-anchored envelope therefore moves with the clip and survives split/trim/delete-time **with zero change to `model.ts`**, and the level at each source sample is the same before and after a split. That gives C a strong oracle: the split export equals the pre-split export.
    - The cost: points outside the window stay stored. B makes that explicit as a non-destructive rule (a trim back shows them again).
    - The clip-relative alternative would have reopened every cut function in `model.ts`.
  - **Linear gain 0…1, linear ramps.**
    - It reuses the optional `setValueAtTime?` / `linearRampToValueAtTime?` already accepted by the three frozen fakes.
    - The drawn line is exactly the audio gain.
    - The export oracle is computable from `data-envelope`.
    - Boost stays with Clip Gain (up to +24 dB).
    - A dB-linear law would need a new curve method.
  - **Always a final ramp to the window-end value.** Without it, a hidden point after the window would be ignored and the level would freeze at the last visible point. This is mutation (c).
  - **Separate envelope GainNode, only for clips with points:** the round-82 pattern. It keeps the node-count locks green and avoids `setClipGain` collisions.
  - **Explicit mode (`Env` + `A`).** The clip body already owns range drag and click-seek, and Live uses the same key for Automation Mode.
    - The line stays visible with the mode off, because FB-06 says "envelope drawn on clip".
    - In mode the editor overlay owns body presses. Its own element receives the `dblclick`, which matters because root capture sends `dblclick` to the clip root (round-82 H1).
  - **Double-click adds at the line's value, double-click on a point deletes.** This avoids the click/drag/delete ambiguity and the gate-#1 class of bug. It makes R18-A2 a deterministic three-double-click-then-drag flow. Recorded as differences from Live.
  - **Free drag, clamped 1 ms from neighbours.** It is consistent with fades. Live's grid snap is a recorded difference and a signal.
  - **A child component for point gestures.** This is the fourth consecutive round on `ArrangementClip.tsx`. Both round-82 reviewers flag the six-kind switch. A new component keeps the switch unchanged and the `ArrangementClip.tsx` grant small. It still uses the shared claim/preview/commit props, so the one-gesture-at-a-time invariant holds.
- **Ownership:** 8 existing files (`StudioWorkspace.tsx` and `ArrangementLane.tsx` with narrow grants) + 5 new. `model.ts` and `fades.ts` are frozen. A stops and reports if a hidden builder drops the field.
- **Mutation hygiene:** round 82's mutations ran in place while HMR served :5173. Round 83 asks for a scratch copy.

## 5. Architecture checkpoint
SRW-18 reaches its feature boundary with this round, and one owner file has accumulated risk over four rounds. `b-round-78-checkpoint-request.md` gains **addendum 4, question 11**: the per-kind handler table, the child-component rule, and lost-capture handling. It is a bounded, non-blocking request to root. Independent core features (SRW-19, SRW-20) are not held back for it.

## 6. Artifacts written by B this phase
- `tasks/round-82.md`: copy of the round-82 `current-task.md` (`cmp` OK, written before anything else).
- `current-task.md`: the round-83 task.
- `b-round-82.md`: this file.
- `b-next.json`.
- `b-round-82-r83-tree-sha256.txt`: 471 entries, 471/471 OK at `bdc2067`.
- `b-round-82-r83-snapshots/`: 8 files + `SHA256SUMS.txt`.
- `b-round-82/backups/`: backlog, feature-status, b-next, plan and the checkpoint request, as they were before this phase.
- `b-round-82/`: `update_backlog.py`, `update_status.py`, `update_plan.py`, `owned-existing.txt`, and `web/` (the manual pages).
- `backlog.json` v82:
  - SRW-18 stage 1 published, stage 2 dispatched; R18-A1 pass;
  - round 82 closed, round 83 added;
  - 4 narrow grants; 11 findings added, 2 updated (C-R80-O3 closed, SRW18-KEYBOARD-FADES own entry);
  - one architecture signal; R83-T; `baseline_tree_at_round83`.
- `feature-status.md`: header, current round, the round-82 result, the FB-06/SRW-18 rows, bug rows (C-R80-O3, C81-2, GATE82-S1, SRW18-KEYBOARD-FADES), R83-T, and the history lines.
- `docs/technical/studio-real-workspace/plan.md`: D-29z48 added; the FB-06 map row updated.
- `b-round-78-checkpoint-request.md`: addendum 4 (question 11).

B did not touch app source and did not commit or push. `regression-last.json` is unchanged, because no regression round closed.

**Commit readiness:** round 82 is already published (`bdc2067`). Round 83 has no source change yet.

## 7. Final advisor review (second call), applied
The advisor checked the oracles (EV5c, EN-EDITS f/g, EN-EXPORT, EN-MIDSTART, the `pan`-free names, 8 M + 5 ??) and found them consistent. It asked for these edits, all now in `current-task.md`:
1. **Stacking:** a `z-30` editor overlay would cover the full-height `z-20` trim strips, because the clip root is not a stacking context. The editor is now `inset-x-2 z-10` and the points are `z-30`.
2. **EN-LIVE control:** the plateau needs 6 entries, so the control run is now "Ctrl+Z until `data-envelope` is empty", not ×4.
3. **Frozen-test grep (done by B):**
   - tests touching `arrangement-grid-control` read only `dataset` and the Snap toggle;
   - no frozen test presses a plain `a`;
   - GS14 locks the transport toolbar at 12 buttons, so the task forbids putting `Env` there.
4. **Minor:**
   - points are React-keyed by index, so the drag-then-double-click guard keeps its target;
   - `a` and `Env` are refused mid-gesture (the `setTrackGroupsCollapsed` guard). EU3's unmount case is now a test-driven unmount;
   - X1-DBLCLICK uses "one more click".

`tasks/round-82.md` is untouched (`cmp` OK).
