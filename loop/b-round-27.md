# B round 27 → round 28 dispatch

Date: 2026-10-12 · Role: B (planning artifacts only; no app source touched) · Decision: **CONTINUE** · Plan entry: D-29s

## 0. Restart and preservation

- A previous B session for this round died with an API DNS error (`b-round-27-dns-error-20261012.json`). Before dying, it had created `tasks/round-27.md`.
  - I verified with `cmp` that the archive is **byte-identical** to the dispatched round-27 `current-task.md`, so I did not overwrite it.
  - `backlog.json`, `feature-status.md` and `b-next.json` were untouched since the round-27 dispatch (mtime 10-11 11:2x), so no partial edit needed reconciling.
- Backups made before any edit:
  - `backlog.json.bak-before-b-round-27`;
  - `feature-status.before-b-round-27.md`;
  - `b-scripts/b-next.before-r28.json`;
  - `b-scripts/plan.before-r28.md`;
  - `b-scripts/current-task.round-27-dispatched.md`.
- Advisor (Fable via the `advisor` tool): **available**. Called once before writing; the advice was applied (§3). Called once more before declaring done.

## 1. Inputs read

**Round 27 records:**
- `current-task.md` (round 27), `a-round-27.md`, `c-round-27.md`, `c-round-27.json` and `c-round-27/checkpoint.md`;
- `backlog.json`, `feature-status.md` and `plan.md` (D-29r);
- `agent-workflow.md` (including the 2026-10-11 Ableton addendum), `delete-selection-update.md`, `root-pre-push-review.md` and `publication-checkpoint.json`.

**Source, read-only, for the delete contract:**
- `ArrangementContext.tsx` l.1490–1730;
- `StudioWorkspace.tsx` l.960–1160 and l.1475–1490;
- `ArrangementTransport.tsx` l.55–175;
- `ArrangementLane.tsx` l.560–665;
- `ArrangementClip.tsx` l.580–600;
- `clipboard.ts` (the range functions and `cutTimeToClipboard`);
- `model.ts` `splitClipsByRange`;
- `types/arrangement.ts` `TimeRange`;
- greps of `__tests__` for the old contract.

## 2. Independent check (what B actually verified)

- **Dev server down:** `curl http://127.0.0.1:5173/studio-lab` → `000`. B did **not** re-verify anything live.
- **Tree:**
  - HEAD `c5ed47b`;
  - `git status --short` has 62 lines, identical to `b-round-27-git-status.txt` and `c-round-27/gates/git-status-now.txt`;
  - `sha256sum -c b-round-26-tree-sha256.txt` → 60 OK;
  - `sha256sum -c c-round-27/gates/owned-sha-now.txt` → 9 OK.
- **Machine:** 34 `node.exe` processes running.
- **Backlog changes come only from C's evidence:**
  - C's `passed` list is recorded as PASS;
  - R27-RB cost is FAIL (C-R27-01);
  - the §13 items are "not run";
  - the R27-TL SFX decay windows are recorded as "oracle restated, not PASS".
  - Nothing is moved to "მზადაა".

## 3. Decisions

1. **SRW-13 stage 2b is not done.** SRW-13 moves to **ბაგია** (C-R27-01 is a medium bug in its own stage). FB-14 stays **მოწმდება**.

2. **FB-02 and SRW-09 flip from მზადაა to მუშავდება.**
   - The user's 2026-10-11 decision makes the shipped behaviour wrong. Today, `deleteSelection` with a range calls `deleteTime` and its status says "სიცარიელე დაიხურა ყველა ხაზზე".
   - R1-B5, R1-B12 and R9-C5's first clause are marked `superseded` in the backlog. The Delete Time parts of R2-V3 and R5-L5 now refer to Ctrl+Shift+X.
   - A new item, **SRW-24**, holds the user's six acceptance checks (R24-1..6).

3. **Round 28 = SRW-24, not SRW-13 stage 3.**
   - **Why now:** it is a dated user product decision that invalidates shipped behaviour, and every later round would freeze more tests onto the contradicted contract. The workflow tells B to give it a separate small round.
   - **Why the open bug does not block it:** C-R27-01 is Medium and touches neither security nor data. Its budget is exhausted, so the policy allows a concrete follow-up while independent work proceeds.
   - **Stage 3 is scheduled as round 29**, not left floating.

4. **The C-R27-01 follow-up is a pre-registered decision table**, not an open-ended investigation:
   - the same tree on the exact round-26 layout, with a 3 + 2 budget;
   - row 1 closes it as "no regression established";
   - row 2 sends it to an A bug round;
   - row 3 sends it to the Tech Lead's quiet Chrome;
   - row 4 is an independent new bug if dock hardSeeks coincide with Master Mute clicks.

   This keeps it bounded and separate from the feature, per the workflow rule against merging a feature with a full sync investigation.

5. **R27-TL oracle restated** (B's error):
   - sustained windows keep the literal ±1.0 dB;
   - decay windows are compared with the round-26 ballistics model fed by the tap's block peaks, p95 ≤ 0.5 dB and max ≤ 1.0 dB.

   This is the correct oracle for a transient source, not a relaxation: C's own model fit is p95 0.11 dB, and the Master meter behaves identically. It is not PASS until C re-scores it, with the max reported.

6. **Smallest honest UI contracts** (where the user's words leave room):
   - **The model:** `TimeRange` gets one optional all-lanes flag. `trackId` is kept, so the detail panel and the single-lane paths stay unchanged. A `trackIds` array was rejected because the user asks for "the whole vertical", not arbitrary lane subsets.
   - **A no-op delete** creates no history entry and keeps the range.
   - **Shift+Delete/Backspace** leave a gap. The user's rule ("Delete/Backspace always leave a gap") wins over Ableton's Shift = time modifier.
   - **Ctrl+Shift+L** is not an edit (no history entry).
   - **Split on an all-lane range** is refused with a status. The user did not ask for it, Ableton's behaviour was not verified, and it is recorded as a conscious difference, not as deferred user scope.
   - **Ctrl+C/X on an all-lane range** work on every lane, consistent with the existing multi-lane Cut Time clipboard.
   - **Ctrl+Shift+X's meaning** is made legible in the transport delete title and the footer hint, because no Cut Time button exists.

7. **Test amendments:** a grep of `__tests__` shows exactly **one** frozen line encoding the old contract (`ArrangementContext.test.ts:567`, the undo label `დროის წაშლა`). A gets that single line. The `clipboard.test.ts` single-lane and `cutTimeToClipboard` tests stay frozen and must remain green.

8. **Key conflict found:** `StudioWorkspace.tsx:1078`, `modifier && key === 'l'`, has no Shift check, so today Ctrl+Shift+L toggles the loop. The task specifies the split, and C mutation (c) guards it.

## 4. Ableton source (workflow addendum)

- **What B checked:** the Live 12 Reference Manual, verified live with gstack `/browse` on 2026-10-12 13:25 +04:00. Text captures are in `b-round-27/`:
  - <https://www.ableton.com/en/live-manual/12/arrangement-view/> §6.9 and §6.11;
  - <https://www.ableton.com/en/live-manual/12/live-keyboard-shortcuts/> §42.5.
- **Confirmed:**
  - standard Cut/Copy/Paste/Delete affect only the selection;
  - Delete Time and Cut Time close time across all tracks;
  - Shift = "Time Across All Tracks" as a modifier rule;
  - Shift+click extends a selection across tracks.
- **Conscious differences** (user request): Ctrl+Shift+X is the only ripple; Shift+Delete leaves a gap; Ctrl+Shift+L extends to every lane in one step.
- **Unconfirmed:** the Windows Backspace key; Split on a multi-track selection; whether Live has a Ctrl+Shift+L. Nothing is claimed about these.
- **Source-link gap for already shipped features** (recorded, no rewrite): the earlier SRW rounds have no per-row Ableton table. The workflow puts them in the milestone audit.

## 5. Next task

- **Task:** `current-task.md`, Round 28 (D-29s).
  - **A:** SRW-24 in 6 owned files plus 2 new tests, a one-line test amendment and doc 034. The expected status is 66 lines, and the frozen list is 66 files (`b-round-27-tree-sha256.txt`, B: 66 OK). Snapshots are in `b-round-27-snapshots/`.
  - **C:** the round-27 follow-ups first (§4.1), then R28-*, G28-1..3 and the Ableton compliance column.
- **Environment, for root:** start the dev server before the C phase, and reduce stray `node.exe` processes. Neither is BLOCKED: no external information, approval or credentials are missing.

## 6. Why not COMPLETE and not BLOCKED

- **Not COMPLETE.** Open in-scope work remains:
  - FB-02 is being reworked (SRW-24); FB-04 to FB-13 have not started; SRW-13 stages 2b to 4 are unfinished;
  - SRW-14 to SRW-20 have not started; the SRW-21 adapter contract and its route mount, which needs permission, are open;
  - the full regression and the root review are pending;
  - T12 follows after that.
- **Open bugs:**
  - Medium: C-R27-01, C-R23-01, C-R6-02 and C-R8-01;
  - Low: C-R27-02, R26-M1, MASTER-HOLD-TICK-EDGE, L3, LIB-SEP-REASON and R9-REVIEWER-M1-L8.
- **Open decisions and checks:** the DEMO-SFX-FULL-SCALE decision belongs to the Tech Lead, and the Tech Lead manual checks remain (now including R28-T).
- **Not BLOCKED.** The round needs no external input. The Tech Lead items (C-R23-01, quiet Chrome, Soft impact, the SRW-21 mount) do not block it.
- **There is no open critical or high bug.**

## 7. Root items carried

These come from `root-pre-push-review.md` and `publication-checkpoint.json`, unchanged:
- the SRW-21 middle-east loader;
- Lenis on `/studio/*`;
- portable paths;
- the export hard-clip;
- the final commit/push only after everything, and the uncommitted round-6..27 tree (62 lines);
- the `Modal.tsx` focus gap;
- GA `scroll` with consent denied;
- the two foreign agent files;
- the earlier A/C deviations;
- the fake Bearer gets 500;
- the CDP `Input.dispatchMouseEvent` denial;
- the publication-checkpoint requirements;
- the `Content-Type` without a charset.

New: machine load during the A and C runs.
