# B round 81 → round 82 planning (D-29z47)

Date: 2026-10-22 · Author: B
- **Advisor:** available and used: once before writing (round shape, O3 discriminator, fade-graph traps, dispositions) and once after writing (see §6).
- **Project subagents:** none consulted. Reading the source, the frozen tests and the stored Live 12 §6.8 capture was enough.

## 1. Inputs read (as data)
- `context/active-summary.md`, `context/active-backlog.json`, then specific IDs in `backlog.json`, `feature-status.md`, `plan.md` (grep).
- Round 81: `current-task.md` (now `tasks/round-81.md`, `cmp` OK), `a-round-81.md`, `c-round-81.md`, `c-round-81.json`.
- Gate 81: `gates/gate-round-81.json`, status **published**, commit `efbed86f644c4faabbdf2044620d089e7537e5bb`, the round-82 baseline. Also `gates/round-81/review.md` (8.5/10, COMMIT OK).
- Loop state:
  - `env-status.json`: store 200.
  - `regression-last.json`: 2026-10-21, so the regression round is not due until 2026-10-24.
  - `root-pre-push-review.md` / `publication-checkpoint.json`: no new root note since the 2026-10-21 visual-A note.
  - `b-round-78-checkpoint-request.md`: no root result.
- Source at `efbed86`:
  - `ArrangementClip.tsx` (whole gesture code);
  - `graph.client.ts` (whole);
  - `model.ts` (move/trim/split/deleteTime);
  - `clipboard.ts` (whole);
  - `ArrangementContext.tsx` (`scheduleKey` l.469, `startGraph` l.780–850);
  - `types/arrangement.ts`;
  - `selection.ts` (refusal messages).
- Frozen tests, checked for constraints:
  - source-text locks on `renderArrangementWav` (`track-pan`, `graph`, `clip-gain`);
  - `FakeParam implements ScheduleAudioParam` in three files;
  - grep for a release after a refused single-clip lane hover: none found.
- Ableton: `b-round-71/ableton-arrangement-view-20261021.txt`, Live 12 §6.8 (read as untrusted data).

## 2. Round 81 result (C evidence only)
- **C PASS:** `browserVerified=true`, `realVerified=true`. All 20 rows passed at both viewports. The fake-Bearer 403 is BLOCKED (backend unavailable in the cloud).
  - R17-G2 by export: ratio 0.50000001; 0% → 0 LSB.
  - R17-G3 by export: ratio 0.24999999.
  - Both are also confirmed by live meters.
- **Not browser-verified, stated by C:**
  - group Volume pointercancel (jsdom UM3 only);
  - collapsed-header Solo/Volume (checked by attributes and history, not audio).
  - Neither is a §5 row, so `browserVerified` stays true.
- **Gate 81** published `efbed86` to both remotes.
- **Backlog v81:**
  - SRW-17 stage 3 → `c_pass_published`;
  - R17-G1..G3 → pass;
  - SRW-17 → `c_pass_tech_lead_manual`, shown as **მოწმდება** on the board, not მზადაა, because R79-T/R80-T/R81-T are open;
  - C80-1 closed (C X1-FOCUS);
  - GATE80-S8 closed;
  - A-R80-PREVIEW-FLAG-SIGNAL closed.

## 3. Findings recorded
| ID | Source | Disposition |
|---|---|---|
| C81-1 nested group name truncation | C, gate #7 | Lows batch + Tech Lead R81-T. No nesting-depth cap: that would shrink FB-12 without user authorisation |
| C81-2 doc 070 l.72 | C, A L9 | **Round 82** one-line grant |
| GATE81-S1 doc 071 status | gate #1 | **Round 82** one-line grant |
| GATE81-S2..S6 | gate #2–#6 | Lows batch |
| GATE81-S8 child-group solo display | gate #8 | **Ruled (D-29z47 R9):** a child shows its own state (`off`), like lane M/S under a muted group. Live is unconfirmed |
| ARCH-R81-VOLUME-STATE-MACHINE | A + gate Architecture notes | Signal → checkpoint request **question 10** (addendum 3). Not scheduled |
| A-R81-ORPHAN-SOLO-CONSISTENCY, C-R81-NB-POINTERCANCEL | A gap 7, C | Acknowledged |
| C-R80-O3 | C round 80 | **Ruled + Round 82 X1** (below) |
| C-R28-INFO-NO-EDGE-FADES | C round 28 | Closed as a recorded conscious difference (Live's 4 ms edge fades are an opt-in setting, §6.8) |
| SRW18-KEYBOARD-FADES | B | Signal for SRW-18 stage 2 planning |
| R82-T | new | Tech Lead |

## 4. Round 82 choice and rationale
- **Regression:** not due (2026-10-21 + 3 days). The condition is carried to round 83.
- **Bugs first.**
  - Nothing Critical, High or Medium is open.
  - The plan's earlier "O3 repro round" is unnecessary. C's `probe-ghost.json` already reproduces O3, and B traced the cause in the source.
  - FB-03 (plan l.170) defines "the clip stays at its last valid place", so 1.025 s is by design. No frozen test contradicts this.
  - The defect is the release status, which never says where the clip landed. It is fixed as X1 in the same owner file as the new fade gestures. This follows the round-81 precedent of one feature stage plus one labelled bounded fix.
  - C81-2 and gate #1 are one-line doc grants.
- **Scope: SRW-18 stage 1 (FB-06, R18-A1).** It is next in dependency order: SRW-13's code stages are done, and SRW-17 is complete.
  - Stage 2 (the envelope, R18-A2) follows. Nothing is shrunk.
  - Professional plugins/effects, pitch and multi-video layers stay out of scope.
  - The fade is a gain ramp only, no time-stretch.
- **Contract choices (smallest honest behaviour):**
  - **Separate per-source fade GainNode, only for faded clips.**
    - A ramp on `clipGain` would collide with the live `setClipGain` `setTargetAtTime`.
    - Unfaded clips keep today's graph exactly.
  - **Optional ramp methods on `ScheduleAudioParam`.** Three frozen fakes implement the interface, and a real AudioParam always has both methods.
  - **Export line `clipFades: clipFadeShapes(arrangement),`.** The `track-pan` lock forbids any `pan` substring, and `clipFadeSpans` would contain one.
  - **Restart on a fade edit during playback.** It comes for free from `scheduleKey` (JSON of clips), the same as a clip move.
  - **Edit rules F3:**
    - fades travel with move and copy;
    - trim shrinks the fade at the trimmed edge first;
    - cuts drop the fade at a new cut edge.
    - These are CZABA choices, because Live's split/trim behaviour is not in the capture.
  - **Free drag, linear ramp, double-click = 0, pointercancel reverts.** The Live differences are recorded in §4 of the task.
- **Owner risk:**
  - `ArrangementContext.tsx` changes by one line only.
  - `ArrangementClip.tsx` gains the fade gestures. Stage 2 will add envelope breakpoints to the same component, so question 10(b) asks root whether a gesture module is needed first. This is non-blocking.

## 5. Artifacts written by B this phase
- `tasks/round-81.md`: copy of the round-81 `current-task.md` (`cmp` OK).
- `current-task.md`: the round-82 task.
- `b-round-81.md`: this file.
- `b-round-81-checkpoint.md`.
- `b-next.json`.
- `b-round-81-r82-tree-sha256.txt`: 467 entries, 467/467 OK at `efbed86`.
- `b-round-81-r82-snapshots/`: 8 files + `SHA256SUMS.txt`.
- `b-round-81/backups/`: backlog, feature-status, b-next, the checkpoint request and plan, as they were before this phase.
- `b-round-81/`: `update_backlog.py`, `update_status.py`, `update_plan.py`, `owned-existing.txt`.
- `backlog.json` v81:
  - SRW-17 stage 3 published, SRW-17 c_pass_tech_lead_manual;
  - SRW-18 stages 1–2, stage 1 dispatched;
  - round 81 closed, round 82 added;
  - 3 narrow grants;
  - 13 findings added and 6 updated;
  - one architecture signal;
  - R82-T.
- `feature-status.md`: header, current round, the round-81 result, the FB-06/FB-12/SRW-17/SRW-18 rows, bug rows (C80-1, C-R80-O3, C81-1, C81-2), R82-T, and the history line.
- `docs/technical/studio-real-workspace/plan.md`: D-29z47 added; the FB-06 and FB-12 map rows updated.
- `b-round-78-checkpoint-request.md`: addendum 3 (question 10).

B did not touch app source and did not commit or push. `regression-last.json` is unchanged, because no regression round closed.

**Commit readiness:** round 81 is already published (`efbed86`). Round 82 has no source change yet.

## 6. Final advisor review (second call), applied
The advisor judged the artifacts dispatch-ready and consistent:
- the store is clean;
- the baseline, frozen list, snapshots and protected files agree;
- backlog v81 changes come only from C evidence;
- SRW-17 is **მოწმდება**, not მზადაა;
- `regression-last.json` is untouched.

It asked for four sharpening edits. All four are now in `current-task.md`:
1. **Live rows on a rhythmic stem.** C runs the FD-LIVE control first. If it already differs by more than 3 dB, FD-LIVE and FD-MIDSTART move to the sustained Middle East clip. The export rows FD-IN/FD-OUT are the primary R18-A1 evidence, and a noisy live row is reported honestly for B to decide.
2. **"Omitted at 0" means the key is absent.** It never means `undefined`. B grepped the frozen tests and found no `toStrictEqual` on clips. The new tests use `toStrictEqual` (FD3).
3. **FD-EDITS** now runs each edit on a fresh faded clip and lists the expected `data-fade-in/out` values per step.
4. **Doc 071 l.4 and X1:**
   - the doc 071 l.4 line is given verbatim in a fenced block;
   - X1 states that a drag whose first move lands in the refused lane commits nothing and shows the existing no-change status;
   - FU5 covers that case.

`tasks/round-81.md` is untouched.
