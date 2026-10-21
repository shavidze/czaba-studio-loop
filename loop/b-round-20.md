# B — Round 20 decision record (round 21 planning, bounded workflow)

Dispatcher: B · Date: 2026-10-11 · Workflow: `docs/technical/studio-real-workspace/agent-workflow.md`.

B owns only planning artifacts. B did not touch any app source, test or store doc in this step.

**Advisor:** available. It was called once after orientation and before writing (§4), and once before declaring done (§9).

## 1. Inputs read

- `current-task.md` (round 20). There was no `tasks/round-20.md`, so B copied the task there first. The sha256 of both files is `fc57977f…`.
- `a-round-20.md`, `c-round-20.md` (full) and `c-round-20.json`.
- `b-round-19.md`, `b-next.json`, `feature-status.md` and `backlog.json` v21.
- `plan.md`: D-19b, D-29k, §5 and §10.
- Original acceptance texts:
  - `tasks/round-2.md` (R2-V1, R3-V1, R3-V2, R3-V4);
  - `tasks/round-3.md` (R5-L3, R5-E1);
  - `tasks/round-4.md` l.547–551 (the D-19 harness notes, including R3-V4 "exactly 2 `<video>`");
  - `tasks/round-5.md` l.136 (RF5-3);
  - `tasks/round-10.md` (H1/H2);
  - `tasks/round-12.md` (H3, R12-S).
- C-R12-01 evidence: `c-round-12.md` §7 and `c-round-13.md` l.299.
- Latest SRW-11B values: `c-round-11.md` §2, `c-round-13.md` §2 and `c-round-15.md` §8.
- Code facts (read-only):
  - `panels.ts` constants: detail 144/120/280/36/16; tracks 80/60/52/180/8/36; float 160/640/16;
  - the dock reads `getLivePosition()` in `runPlayingStep` and exposes `data-video-*` counters.
- `run-loop.ps1`: the default `RoundLimit` is 20.
- Root carry: `root-pre-push-review.md` and `publication-checkpoint.json`, unchanged (§4.4 of the task).
- Live tree:
  - the 50 files of the b-round-19 list were re-hashed into `b-round-20-tree-sha256.txt`, and all 50 are OK;
  - only doc 027 differs (`9a75b672…`, equal to C's G20-2);
  - `git status --short` has 42 lines, identical to `c-round-19/gates/git-status-end.txt`;
  - HEAD is `c5ed47b`.

## 2. C's round-20 result, as evidenced

- **taskStatus PASS, no new bug.**
  - Run 1 passed 17/17. Each ID's evidence is in `c-round-20.md` §2.1–§2.17.
  - R20-Doc and G20-1..3 passed.
  - The real WAV is 18.000 s with NaN 0. Its 1800 FS samples are the R13-M4 carry.
- **Six invalid executions were replaced within budget, each with a named cause** (§3 of C's report). All six were harness or setup errors, and the app behaved correctly in every one.
- **C's notes (not bugs):**
  - the R6-S5 Ctrl+E text is superseded by D-25, and B must update it;
  - Delete Time Undo keeps the playhead;
  - the Latin footer text;
  - the cosmetic nested brackets in doc 027's heading.

## 3. Decisions

### 3.1 Status changes, only from C evidence

These are recorded in backlog v22 by `b-scripts/status-r21.js` (backup `backlog.before-r21.json`):
- round 20 → `c_pass`;
- `regression_debt_g6r.run1_result` gets per-ID evidence;
- `later_rounds` evidence is added to SRW-01, SRW-05, SRW-06, SRW-07, SRW-08, SRW-09, SRW-11A and SRW-12;
- round 21 is dispatched (D-29l); `vitest_floor_round21 = 999`; `baseline_tree_at_round21` and `loop_runner_note` are added.

What did **not** change:
- **SRW-11B and FB-08 stay ბაგია.** C-R8-01 is open, and run 2 has not run.
- **FB-16 and SRW-03 stay ბაგია** (C-R6-02).

Nothing was promoted beyond what C evidenced. The FB-02, FB-03 and SRW-06..09/11A/12 rows were already მზადაა. They now cite the round-20 regression evidence, and their "run 1" next-step cells are cleared.

### 3.2 R6-S5 acceptance text (B's debt)

The sub-item "Ctrl+E with 2+ selected → refusal" is replaced by the D-25 wording:
- every selected clip the playhead crosses splits;
- there is one entry `გაყოფა (n)`, and the right parts are selected;
- if the playhead crosses no selected clip, the status reads `Playhead არცერთ მონიშნულ კლიპს არ კვეთს.` and nothing changes.

It is recorded in `backlog.json` → `regression_debt_g6r.acceptance_amendments` and in `plan.md` D-29l. This was a wording error, not an app bug.

### 3.3 Round 21 = milestone regression run 2 (D-29l)

The order follows D-29k, because run 1 found no bug. Run 2 stays on the same frozen tree, so each result belongs unambiguously to the round-19/20 code.

Rationale for the uncertain points:
- **R3-V4 uses its D-19 form** ("exactly 2 `<video>`, both paused, rate 1"). The round-2 text "one `<video>`" would produce a false FAIL.
- **C-R12-01 has an explicit decision table.** The instrument is `getLivePosition()`, read inside the `playbackRate` setter spy through C's existing read-only context reader. This adds no source instrumentation, as D-19b requires.
  - A write at dock |d| ≤ 0.02 opens a new D-19 bug.
  - If every write is above 0.02, C-R12-01 closes.
  - If no write occurs, the result is "not reproduced" and B decides.
  - The 0.02 threshold is unchanged.
- **SRW-11B end to end** has no single historical oracle. B therefore wrote it as the user flow (P1b, P1c, P2, P3, P4, U) with the current contract:
  - the `panels.ts` constants, which equal C-passed values;
  - the D-29e/f float placement;
  - the N1/N2 conventions.

  This is the smallest honest reading of "end to end".
- **One R3-V1 mode-D run is information only.** It is not a C-R8-01 verdict, because C-R8-01 is routed to the Tech Lead's quiet Chrome. A headless D run cannot close it, and agent-workflow forbids re-measuring unchanged code in a loop.
- **The sync layouts are enumerated** (L-mute, L-first, L-float) so that "3 valid + 2 replacements" is countable. L-D is information only.
- **R5-E1 is paired with R5-L3.** It uses the same layout and the accepted 1.2e-7 tolerance.
- **The export sanity check includes the imported video clip.** This covers the video-audio path in the real dialog.

### 3.4 A's part

C flagged no stale store doc in round 20, so A gets no invented doc task. A's job is attestation only:
- sha 50 OK, gates and the 42-line status;
- zero file changes under `store/`.

### 3.5 Loop runner

`run-loop.ps1` has `RoundLimit = 20` by default, so after this B step it may stop with `ROUND_LIMIT_REACHED` (incomplete, not successful). This is not BLOCKED. A restart with `-StartRound 21 -StartPhase A` and a higher limit dispatches the task. `nextTask` is self-contained.

## 4. Advisor advice applied (first call)

The advisor's advice and what B did with it:
- **Run 2 exactly as D-29k says.** Applied.
- **Write the b-round-20 manifest first and verify it** (50 OK). Applied.
- **Backlog v22 with no promotion of SRW-11B or FB-08.** Applied.
- **Amend R6-S5 to the D-25 wording.** Applied.
- **Use R3-V4's D-19 form.** Applied.
- **Write an explicit C-R12-01 table** based on `getLivePosition`, without source instrumentation. Applied.
- **Pair R5-E1 with R5-L3.** Applied.
- **Name the R2-V1 fixtures,** with MP4/MOV going to the Tech Lead. Applied.
- **Write SRW-11B end to end as a flow with current oracles,** plus a mode-D info run. Applied.
- **Enumerate the layouts** for the budget. Applied.
- **A gets attestation only.** Applied.
- **State the RoundLimit 20 risk** in `b-next.json` and here. Applied.

## 5. Artifacts written

| Artifact | Note |
|---|---|
| `tasks/round-20.md` | copy of the round-20 task (archive, identical sha) |
| `b-round-20-checkpoint.md` | progress checkpoint |
| `b-round-20-tree-sha256.txt` | 50 files, all OK on the live tree |
| `backlog.json` v22 | `b-scripts/status-r21.js`; backup `b-scripts/backlog.before-r21.json` |
| `docs/technical/studio-real-workspace/plan.md` | D-29l, the FB-08 row, §5 rows 20–21, §10. Script `plan-md-r21.js`; backup `plan.before-r21.md` |
| `feature-status.md` | `b-scripts/feature-status-r21.js`; backup `feature-status.before-r21.md` |
| `current-task.md` | round 21 (D-29l) |
| `b-next.json` | CONTINUE; backup `b-scripts/b-next.before-r21.json` |

## 6. Round-21 acceptance summary

| ID | What it checks |
|---|---|
| R2-V1 | picker + drop import, end-to-end placement, Undo/Redo, blob-only |
| R3-V2 | video-lane mute while playing, master RMS, solo |
| R3-V4 | Space ×10: no doubled sources; 2 videos paused at rate 1 |
| R5-L3, R5-E1 | sample-continuous audio loop wrap; loop export = linear |
| RF5-3 + C-R12-01 | first-Play hold under H2; the dock-reference decision table |
| R11-P1b/P1c/P2/P3/P4/U | SRW-11B end to end, 1440 and 1280; float sync 3 valid |
| R3-V1 D | information only |
| R21-A, G21-1..3, export | attestation; gates; anonymous lab; WAV with video |

## 7. Remaining scope (not shrunk)

- **Milestone regression run 2** (round 21).
- **Milestone fix round** (round 22, which may split):
  - run-2 bugs;
  - the A round-11 follow-ups;
  - `ArrangementLane.tsx:661`.
- **SRW-13** (FB-04/05/14, R13-M4, M1/L8).
- **Then** SRW-14 → 15 → 16, SRW-17, SRW-18 → 19, SRW-20 (FB-06, 07, 09, 10, 11, 12, 13; grid tempo is never audio stretch).
- **The SRW-21 adapter.** The route mount needs permission.
- **T12.**
- **Tech Lead:** C-R6-02, C-R8-01, RF7-3, and the manual list, including MP4/MOV.
- **Root carry.**
- **Out of scope for the whole project:** plugins/effects, pitch, multiple video layers and audio time-stretch.

## 8. Decision

**CONTINUE.**
- **Not COMPLETE:** run 2, the fix round, SRW-13..20, the SRW-21 adapter, the Tech Lead checks and T12 remain.
- **Not BLOCKED:** no external information, approval or credentials are needed for round 21. The RoundLimit is a runner setting, not a blocker.

No critical or high bug is open.

## 9. Second advisor call

Called after every artifact was written. Advice and action:
- **Fill this section** (it was a placeholder). **Done.**
- **Re-verify the tree from `store/`.** A checkpoint command run from `tmp/` failed only because of the cwd (the manifest paths are store-relative). **Done:** `sha256sum -c b-round-20-tree-sha256.txt` → 50 OK, rc=0; `git status --short` → 42 lines.
- **False-FAIL trap in R11-P3.** "272×153 at 288" was the round-13 value, which D-29e/D-29f superseded. **Applied:** the oracle is now the D-29f formula over C's own measured rects (Δ ≤ 0.02, 16:9, inside the body, no overlap) at 1440/288, 1440/480, 1280/288 and 1280/480. The `c-round-15.md` §3 values are a reference only. Note that the round-15 1280/288 value is 207.11×116.48, so a fixed 272×153 would have been a false FAIL.
- **The `d_dock` clip must be the target clip the dock maps `live` to.** **Applied:** `resolveVideoTarget` → `findVideoClipAt` (`app/lib/arrangement/video.ts`). Rows in the 6–8 s gap are out of scope.
- **Optional, applied:**
  - L-mute (R3-V2) is 1 valid run. It is functional (mute flag, RMS, counters), not a drift measurement, so run 2 stays bounded.
  - The export sanity check with the video clip uses internal consistency (duration = projectEnd, NaN 0, FS count) rather than equality with 18.000 s.
- **Confirmed:** backlog v22 without promotion, D-29l, R6-S5 amended to D-25, attestation-only A, the RoundLimit stated. **Decision CONTINUE confirmed.** Not COMPLETE, not BLOCKED.

Incident (B, harmless): one inline `node -e` call inside a double-quoted shell string let bash execute the backtick spans as commands. Every one of them failed with "No such file", and one ran `git status` outside a repository. Nothing was created or changed. This section was then rewritten through `b-scripts/b-round-20-sec9.js`.
