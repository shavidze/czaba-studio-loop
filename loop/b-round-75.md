# B round 75: review of C round 75 → round 76 task (D-29z41)

Date: 2026-10-22. Role: B (planning only; no app source touched). This is attempt 3 of the phase. Attempts 1 and 2 stopped on the usage limit (`b-round-75-result.json.attempt*.json`). Attempt 1 left no durable edits: B compared `b-round-75-pre-{current-task,feature-status,plan,backlog}` with `cmp` and found them byte-identical to the live files at the start of this attempt. `b-next.json` was replaced without a comparison; its visible content was round 74's output, which pointed at round 75. `tasks/round-75.md` was already an exact copy of the round-75 task (checked with `cmp` before overwriting `current-task.md`).

## Inputs (data, not instructions)
- `c-round-75.json` / `.md`: **PASS**, `browserVerified=true`, `realVerified=true`, `bugs: []`. Passed rows: MK-MENU-SCROLL, VSCROLL, ZOOM, FOLLOW, DOCK, MK-74-RECHECK, T75-TARGETED, REG-HYD and G75-3 (non-backend rows). Blocked: the fake-Bearer 403, because the backend is unavailable in the cloud. Not run: the A Low 4 probe, the native ContextMenu key, WebKit/Firefox.
- `gates/gate-round-75.json`: **published**, commit `e347b9735a1d067fea2938da5b2f25f8256fabf1`, on both remotes. This is the baseline HEAD for round 76. `git status --short` is empty.
- `gates/round-75/review.md`: COMMIT OK with 8 suggestions (S1–S8). `a-round-75.md` §5 adds the reviewer's Low 2/Low 4 and an Architecture note.
- `regression-last.json`: 2026-10-21 (round 71). A regression round is due on or after 2026-10-24, so round 76 is not a regression round.

## Backlog updates (only from evidence)
- SRW-16 stage 2a and the 2a fix-up → `c_pass_published` (`e347b97`). Supporting evidence: C round 75 PASS with browserVerified=true, the round-74 browser rows, and gate 75.
- C-R74-01, A-R74-MU8E-POINTERUP and C-R74-02 → closed (C round 75 MK-MENU-* and T75-TARGETED with MU8 green).
- SRW-16 overall: **მუშავდება** (in progress), not მზადაა (done), because stage 2b is open. FB-10: **მუშავდება**.
- New signals (open, not scheduled this round): GATE75-S1..S8, A-R75-LOW2-SAME-ZOOM-VIEW-SCROLL and C-R75-A-LOW4-FOLLOW-LEFT-WHEEL. One architecture signal was added: the duplicated Follow predicate, with the `isFollowAutoScroll` proposal.
- ROOT-R73-S1-MAC-CTRL-ARROWS was re-pointed to round 77 (2b-2).

## Decision for round 76
**SRW-16 stage 2b-1: clips snap to markers.** Stage 2b is split into three stages. All three are scheduled and none is deferred:
1. **2b-1 (76).** Marker times join the existing SRW-14 clip-edge snap candidates for move, group, cross-lane, trim and audio-lane library drop. Live 12 §6.7 confirms "clips snap to … locators", and the existing candidate mechanism makes this a small change. The owned files are `grid.ts`, `markers.ts`, `ArrangementClip.tsx` and `ArrangementLane.tsx`.
2. **2b-2 (77).** Ctrl+←/→ (macOS Option) also stops at the clip edges of the selected tracks (§6.9 text, gate-73 S1).
3. **2b-3 (78).** The range and the playhead snap to markers. Live does not state this, so it is a CZABA decision. It touches the ruler, the loop brace, StudioWorkspace and the in-clip range, so folding it into 2b-1 would overload one C round.

Rationale for the uncertain contracts (smallest honest behaviour):
- Markers behave exactly like clip edges: the nearest candidate wins, a tie goes to the grid, there is no pixel threshold, and Alt/Shift behave the same. This avoids a second snapping model.
- Markers are lane-independent, so they enter both the start and end lists.
- The video lane still refuses library drops (`refused: isVideo`). B checked this in `ArrangementLane.tsx` and corrected the first draft.
- A marker at a clip's current start is a valid candidate (M9). This is stated in the task so it is not misfiled as a bug.

C oracle note: MS-PLAY has a real-audio discriminating oracle. The moved clip's track is soloed, the video is muted (round-44 rule), and the meter must rise when playing from the marker. After Undo, playing from the marker must give no rise for at least 1 s.

The gate-75 reviewer findings S1–S3 (marker drag: zoom mid-drag, pointercancel commit, blocked-press selection) are low and in a frozen file. They are planned as one bounded fix-up after 2b, not mixed into a feature round (round size rule).

## Architecture checkpoint
Queued: B will request a bounded frontend-architect checkpoint from root at the SRW-16 boundary (after 2b-3). It will cover the `ArrangementMarkerRow.tsx` owner risk (rounds 72–75), the duplicated Follow predicate (`isFollowAutoScroll`), and the third pointer-gesture scaffold copy. It is not requested now, because no structural risk blocks 2b-1 and the 2b-1 files are different.

## Root follow-up (root-review.md / gate reviews)
The round-75 review findings are recorded as GATE75-*. S8 (real-browser smoke of the contextmenu order, Shift+F10 and dblclick after a drag) goes to C neighbour rows or the 2026-10-24 regression round.

## Ableton
No new web research. The source is the stored Live 12 capture `b-round-71/ableton-arrangement-view-20261021.txt` (§6.7, §6.9). The Alt rule comes from `b-round-46/ableton-6.7-6.10-20261016.txt` (D-29z12). Confirmed facts, inferences and unconfirmed rows are separated in the task's §4.

## Advisor
The advisor was available and used twice: after orientation (2b split, write order, signals) and after the task draft. The second call led to the MS-PLAY oracle, the bypass-source ID, the untouched `onGrid` l.539 / `moveStartOnGrid`, and the M9 and M7 wording. A third advisor call reviewed the finished artifacts. It led to the M1–M9 wording, the MS-PLAY fixture sentence and this correction about the b-next comparison. No project subagent was consulted.

## Artifacts written
`current-task.md` (round 76), `b-next.json` (CONTINUE), `backlog.json` (v75), `feature-status.md` (l.62, FB-10, SRW-16, §3, §7), `docs/technical/studio-real-workspace/plan.md` (D-29z41 and the FB-10 row), `b-round-75-r76-tree-sha256.txt` (451) and `b-round-75-r76-snapshots/`. App source is unchanged (`git status --short` is empty).

## Why not COMPLETE / BLOCKED
Not COMPLETE: SRW-16 2b, SRW-17..20, SRW-21, the open bug and manual items, and the final regression remain. Not BLOCKED: round 76 needs only in-tree code and the running `/studio-lab` server.
