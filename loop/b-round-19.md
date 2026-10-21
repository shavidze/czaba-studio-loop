# B — Round 19 decision record (round 20 planning, bounded workflow)

Dispatcher: B · Date: 2026-10-11 · Workflow: `docs/technical/studio-real-workspace/agent-workflow.md`.
B owns only planning artifacts. No app source, test or store doc was touched by B in this step.

Advisor: **available**. Called once after orientation and before writing (§4), and once before declaring done (§9).

## 1. Inputs read

- `current-task.md` (round 19). There was no `tasks/round-19.md` archive, so B copied the task there before any edit. `cmp` confirmed the copy is identical.
- `a-round-19.md` (full), `c-round-19.md` (full), `c-round-19.json`.
- `b-round-18.md`, `b-next.json`, `feature-status.md`, `backlog.json` v20.
- `plan.md`: §4 FB map, §5 rounds and dependency graph, §10 status.
- The loop runner `run-loop.ps1`. It always runs A, then C, then B. The default `RoundLimit` is 20.
- Original acceptance texts for the 21 regression-debt IDs: `tasks/round-1..7.md`. Earlier C evidence: `c-round-1.md` B5 and `c-round-5.md` §2–§4.
- Code facts, read-only:
  - the oracle strings still exist (`GESTURE_UNDO_BLOCKED_MESSAGE`, `GESTURE_EDIT_BLOCKED_MESSAGE`, `DUPLICATE_RANGE_MESSAGE`, `დუბლირება (n)`, `გაყოფა (n)`, `გადატანა (n)`, `კლიპის გადატანა`, `Loop შეიქმნა`);
  - the Delete Time label is today `დროის წაშლა — სიცარიელე დაიხურება ყველა ხაზზე` (transport) plus the footer hint. The task uses today's text;
  - A round-11 follow-up sites: Home seek at `StudioWorkspace.tsx:1125`, `nextElementSibling` at l.447/474, the fold button in `ArrangementLane.tsx` l.418–427, and the `biome-ignore` reason at l.661.
- Root carry: `root-pre-push-review.md` and `publication-checkpoint.json`, as tracked in `feature-status.md` §6 and C §7. A round-19 deviation 5 (python heredoc) was added.
- Live tree:
  - `b-round-19-tree-sha256.txt` re-hashes the 50 files of the b-round-18 list, and all 50 are OK;
  - exactly the panel (`f28e069f…`), the polish test (`b85c3c96…`) and doc 027 (`d2e4e8df…`) differ from round 18. These equal C's G19-2;
  - `git status --short` has 42 lines; HEAD is `c5ed47b`.

## 2. C's round-19 result, as evidenced

- **taskStatus PASS, no new bug.**
  - R19-D1 and R19-D2: 8/8 rows, ±0 px against A's record;
  - R19-A; R19-U (guards G6, G6b and G7, plus C's G6c–e; round-18 M1 and M5 still bite); R19-Doc;
  - adjacent: R8 detail, R18-B, R18-W, R16-H1/F1 and R9-D3/RF7-P2;
  - G19-1..3, with vitest 999/999.
- **C-R18-01 is closed.**
- **C's notes (not bugs):**
  - doc 027's title and round-18 sections are stale;
  - at 1280 the panel can load collapsed (persisted state);
  - the group hint keeps the Latin `range`, and the footer keeps Latin by design;
  - the 1280 group needs a scroll (the D-29g residual, unchanged);
  - A round-19 deviation 5 (python heredoc) was not verified by C.

## 3. Decisions

### 3.1 Status changes, only from C evidence (backlog v21, `b-scripts/status-r20.js`)

- Round 19 → `c_pass`. C-R18-01 → `closed`, with its evidence.
- `evidence_round19` is added to SRW-11B stage 3, and the follow-ups are recorded (the doc 027 relabel, the harness note, the Latin notes).
- **SRW-11B and FB-08 stay ბაგია.** C-R8-01 (Medium, Tech Lead quiet Chrome) is still open, and the milestone regression has not run. Nothing is promoted.
- SRW-01 gains the `c-round-19.md` G19-3 and export evidence.
- `regression_debt_g6r` gets the run-1/run-2 split, and the milestone entry in `planned_rounds` is filled in.
- `vitest_floor_round20 = 999`; `baseline_tree_at_round20`; round 20 is `dispatched`.

### 3.2 Round 20 = milestone regression run 1 (D-29k)

No C bug is left that an app-side round can close:
- C-R6-02 and C-R8-01 need the Tech Lead's quiet Chrome;
- C-R12-01 belongs to the milestone RF5-3.

SRW-11B and its polish are delivered, and the workflow requires a stage regression before the next feature.

**Why the regression comes before the fix round.** The A round-11 follow-ups change `StudioWorkspace.tsx` (Home handling) and `ArrangementLane.tsx` (fold button, track name). Both are shared infrastructure. If they changed in the same round, a regression result could not be attributed. The fix round therefore runs after, on the tree that the regression certified.

**The split** (one C run budget each):

| Run | Round | IDs |
|---|---|---|
| 1 | 20 | R1-B5, R4-B1, R5-L4, R5-L5, R6-S5, R7-D2..D5, R8-M3, R8-M4, R9-C5, R5-B5, R5-B1u, R11A-2 keys, R12-L2, R12-L4 (synthetic half) |
| 2 | 21 | R2-V1, R3-V2, R3-V4, R5-L3, C-R12-01 under RF5-3 (dock live position, D-19b), SRW-11B end to end, plus any run-1 ID not run |

**Run 1 rules:**
- The task quotes each ID's original criterion. C may adapt the setup numbers to the demo, but must record the mapping and keep every tolerance.
- One valid execution per ID, plus at most two replacements for environment-invalid runs.
- A failure is a bug. An un-run ID is "not run", never PASS.
- R12-L4: C does only the synthetic half. The real HTML5 drag stays a Tech Lead check.
- R5-L5 and R7-D3 involve playback, but they measure only audio-source scheduling, not video sync. That is why they are in run 1.

**A's part.** The runner always runs A, so A gets the smallest honest task: the doc 027 relabel that C flagged. A edits nothing else. `app/` is frozen, and the end state is 49 OK with only doc 027 changed. A runs tsc, vitest and the build as a tree record; C re-runs them.

### 3.3 Rationale for uncertain points

- **"One quick per ready FB."** FB-02 is covered by R1-B5 and R9-C5, and FB-03 by R8-M3 and R8-M4, in run 1. FB-15 is covered by R2-V1 in run 2. FB-01 and FB-16 are "მოწმდება"/"ბაგია" with Tech Lead items. SRW-11B end to end in run 2 exercises the panel flows.
- **Round numbers after the milestone** in `plan.md` §5 are now "—". They are orientation only (D-29k).

## 4. Advisor advice applied

The advisor was called after orientation and before writing. Its advice and what B did with it:
- **Do not fold the fix round into the regression,** because of shared-file attribution. **Applied** (§3.2).
- **The runner always runs A, so give A a doc-only task** (doc 027) with `app/` frozen: 49 OK plus doc 027. **Applied.**
- **Checkpoint first, then re-hash the 50 files and verify them before writing.** **Applied:** `b-round-19-checkpoint.md`; 50 OK; exactly the 3 expected hashes differ.
- **Backlog v21:** round 19 `c_pass`, C-R18-01 closed, `evidence_round19`, floor 999, the harness note, and SRW-11B/FB-08 not promoted. **Applied.**
- **Quote each debt ID's oracle verbatim,** split into run 1 (non-sync editing) and run 2 (video/sync, C-R12-01, SRW-11B end to end), with only the synthetic half of R12-L4. **Applied.** B also checked the oracle strings against today's code and corrected the R1-B5 label text.
- **plan.md and feature-status updates; drop C-R18-01 from `remaining`.** **Applied.**
- **Make `nextTask` self-contained,** because the runner's `RoundLimit` may stop the loop after this B step. **Applied:** `b-next.json` `nextTask` names run 1, run 2, the fix round and the order after it.

## 5. Artifacts written

| Artifact | Note |
|---|---|
| `tasks/round-19.md` | copy of the round-19 task (archive; `cmp` identical) |
| `b-round-19-checkpoint.md` | progress checkpoint |
| `b-round-19-tree-sha256.txt` | 50 files, all OK on the live tree |
| `backlog.json` v21 | `b-scripts/status-r20.js`; backup `backlog.before-r20.json` |
| `docs/technical/studio-real-workspace/plan.md` | D-29k, FB-08 row, §5 rows 20–22 (later rows renumbered "—"), §10; script `plan-md-r20.js`; backup `plan.before-r20.md` |
| `feature-status.md` | `b-scripts/feature-status-r20.js`; backup `feature-status.before-r20.md` |
| `current-task.md` | round 20 (D-29k) |
| `b-next.json` | CONTINUE; backup `b-scripts/b-next.before-r20.json` |

## 6. Round-20 acceptance summary

| ID | What it checks |
|---|---|
| R1-B5 … R12-L4 (17 IDs) | each original criterion, quoted in the task (§4.1) |
| R20-Doc | the doc 027 relabel: C-cited PASSes only, numbers unchanged, Georgian |
| G20-1..3 | tsc, vitest ≥ 999, build, Biome; frozen tree 49 OK + doc 027, 42-line status; anonymous `/studio-lab` and purchase protection |
| Export sanity | one real WAV: frames, duration, NaN, FS count (the R13-M4 carry) |

## 7. Remaining scope (not shrunk)

- **Milestone regression:** run 1 (round 20); run 2 (round 21: R2-V1, R3-V2, R3-V4, R5-L3, C-R12-01, SRW-11B end to end).
- **Milestone fix round (round 22):**
  - the regression bugs;
  - the A round-11 follow-ups: `aria-controls` on the fold button, Home on separators, `ring-inset` on the track name, `nextElementSibling`, and the silent fold refusal;
  - the `ArrangementLane.tsx:661` reason text.
- **SRW-13** (FB-04/05/14, including the export hard-clip, and M1/L8 if the Tech Lead run has not happened).
- **Then in dependency order:**
  - SRW-14/15 (FB-13/09/11; grid tempo only, no audio stretch);
  - SRW-16 (FB-10), SRW-17 (FB-12), SRW-18 (FB-06), SRW-19 (FB-07) and SRW-20.
- **SRW-21 adapter.** The route mount needs Tech Lead or auth-owner permission.
- **T12** after all of the above.
- **Tech Lead:** C-R6-02, C-R8-01, RF7-3, and the manual list including R19-T.
- **Root carry** as listed in the task §4.4.
- **Out of scope** for the whole project: plugins/effects, pitch, multiple video layers and audio time-stretch.

## 8. Decision

**CONTINUE.**
- **Not COMPLETE:**
  - the milestone regression and fix round are pending;
  - SRW-13..20 (FB-04..07, FB-09..14) are not started;
  - SRW-11B still has C-R8-01;
  - the Tech Lead checks, the SRW-21 adapter and T12 remain.
- **Not BLOCKED:** round 20 needs no external information, approval or credentials.

No critical or high bug is open.

## 9. Second advisor call

Called after every artifact was written. Advice and action:
- **Remove the stray item-level `evidence_round19` on SRW-01** (a first patch wrote it before `evidence.later_rounds`). **Done:** only `evidence.later_rounds` remains.
- **Fill this section** with the advice. **Done.**
- **Pin the R20-Doc base:** A's backup must hash to `d2e4e8df…` from `b-round-19-tree-sha256.txt`. **Applied** in the task §4.2.
- **Optional:** R7-D2, R8-M3 and R8-M4 use a video clip. If C sees a stall or hard seek during setup, it opens a bug, with no extra runs. **Applied** in the task §4.1.
- **Confirmed:** SRW-11B stays ბაგია; 17 run-1 + 4 run-2 IDs = 21 debt IDs; the 42-line status gate covers files outside the manifest; doc 027 "Completed" with R19-T pending is honest. **Decision CONTINUE confirmed.** Round planning complete.
