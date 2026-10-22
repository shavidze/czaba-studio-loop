# B round 78 → round 79 planning (D-29z44)

Date: 2026-10-22 · Author: B
- **Advisor:** available and used. It was consulted twice before writing: once on the round choice, once on the stage-1 contract. A final review was requested after the files were written.
- **Project subagents:** none consulted. The source reading and the Ableton capture were enough.

## 1. Inputs read (as data)
- `context/active-summary.md` and `context/active-backlog.json` were read first. Specific IDs were looked up in `backlog.json`, `plan.md` and `feature-status.md` with grep.
- Round 78 reports and gate: `tasks/round-78.md` (a `cmp`-identical copy of the round-78 `current-task.md`, created in this phase), `a-round-78.md`, `c-round-78.md`, `c-round-78.json`, `gates/gate-round-78.json` and `gates/round-78/review.md`.
- Loop state: `env-status.json` and `regression-last.json`.
- `root-pre-push-review.md` and `publication-checkpoint.json` (mtime 03:50 today). There is no root note newer than the 2026-10-21 visual-A note: phase 1, then T12, then VISUAL-A-OBSIDIAN, then BLOCKED for phase 2.
- **Source at `c062147`:**
  - every `applyTimelineView` caller, the `isPointerGestureActive` guards and `claimPointerGesture` (`ArrangementContext.tsx` l.1422);
  - the `ArrangementMarkerRow` drag (GATE75 S1–S3);
  - `types/arrangement.ts`, `model.ts` (`createArrangement`, `setTrackMix`, `toggleSolo`);
  - `routes/studio-lab.tsx` (the four fixed tracks);
  - the `graph.client.ts` track graph and `scheduleKey`;
  - the `ArrangementLane` header;
  - `laneTrackIdAtPointer`, the marquee and the lane auto-fit in `StudioWorkspace`;
  - the `handleKeyDown` modifier block (Ctrl+G is free; plain `g` is Snap).
- **Ableton:**
  - New capture: Live 12 manual chapter 18 (https://www.ableton.com/en/live-manual/12/mixing/). It was captured with Playwright Chromium, because gstack is not installed in the cloud. File: `b-round-78/ableton-mixing-20261022.txt`, sha256 `792522f099995cd2b8956e1f852c80e614450a95f87f24059f3c3acc1534e811`. The script is `b-round-78/tools/capture.cjs`.
  - Stored §42 capture: `b-round-71/ableton-shortcuts-20261021.txt`.
  - Both are treated as untrusted data.
- **Not available on this runner:** the original video transcripts (`docs/video-to-text-bugs/`). The SRW-17 acceptance in `backlog.json` (R17-G1..G3) and the initial plan line ("track groups and collapse") are the requirement source.

## 2. Round 78 result (C evidence only)
- **C PASS, `browserVerified=true`, `realVerified=true`, 0 bugs.** All 17 rows passed at both viewports. MT-AUDIO had a real onset 60–132 ms after play, and its negative control stayed at −inf for 1.3 s. RU-DBLCLICK was 10/10 + 10/10.
- **Gate 78:** published `c062147` to both remotes. Review 9/10, COMMIT OK. Verify: 109 files, 1846 tests.
- **Backlog changes:**
  - SRW-16 stage 2b-3 → `c_pass_published`.
  - **SRW-16 → `c_pass_tech_lead_manual` / „მოწმდება“.** All stages have browser-verified C PASS. Only Tech Lead R72-T, R74-T, R77-T and R78-T are open, so SRW-16 is not „მზადაა“.
  - GATE77-S2 is closed: C confirmed the doc 067 line.
  - The fake-Bearer 403 sub-check stays BLOCKED (backend unavailable in the cloud). It remains open evidence for a later backend-enabled check and is not a bug.

## 3. Signals recorded (none scheduled unless stated)
| ID | Source | Disposition |
|---|---|---|
| GATE78-S1-LOOP-MICROSECOND-HELPER | review #1 | Checkpoint request |
| GATE78-S2-SCRUB-GETTER-PER-MOVE | review #2, A reviewer #6 | Acknowledged (keep, per T7); checkpoint |
| GATE78-S3-DOC068-STATUS | review #3 | **Granted in round 79:** one status line |
| ARCH-R78-RESOLVE-SNAP-TIME | review Architecture note, A note | Checkpoint request (reviewer: keep for now) |
| A-R78-REVIEW-NAMING | A reviewer #5 | Lows batch / checkpoint |
| C-R78-HARNESS-NOTES | c-round-78.json | Harness notes |
| GROUP-NONADJACENT | B, D-29z44 | Signal: a deliberate difference, not a deferral |
| R79-T-TECH-LEAD | new | Ctrl/Cmd+G in a real Chrome opens no find bar |
| ARCH-CHECKPOINT-SRW16 | B | **Requested from root:** `b-round-78-checkpoint-request.md` (non-blocking) |

## 4. Round 79 choice and rationale
- **Regression round:** not due. The last one was 2026-10-21 and today is 2026-10-22, so it falls due on or after 2026-10-24. If round 79 closes on or after 2026-10-24, round 80 is the regression round.
- **Bugs:** no C bug is open, and no Critical or High issue.
- **GATE75 S1–S3 move to the Lows batch.** The earlier plan put them before SRW-17. B revised that plan with this rationale:
  - **S1 is unreachable at `c062147`.** All zoom writes go through `applyTimelineView`. Every caller returns on `isPointerGestureActive()`, or needs a gesture claim that the marker drag refuses.
  - S2 and S3 are cosmetic Lows on one file.
  - The loop policy says low polish must not delay independent core features.
  - They stay in the Lows batch together with S4–S6.
- **Next scope in dependency order: SRW-17 (FB-12).** SRW-13's code stages are C-verified; its remaining Tech Lead items are cloud-unrunnable. The stages are fixed in D-29z44 R2, and nothing is shrunk:
  - stage 1 (this round): model, selection, Ctrl+G with nesting, header rows, F2;
  - stage 2: collapse, `U`, a11y, overview;
  - stage 3: group Mute/Solo/Volume in playback and export, R17-G2 and R17-G3.
- **Contract choices (the smallest honest behaviour, G1–G13):**
  - **Data shape:** a parent-pointer model with only additive optional fields. There is no `group` track kind, which would touch every `tracks` consumer.
  - **Normal form:** empty keys are omitted, because `isSameArrangement` is a JSON comparison.
  - **Contiguity:** a selection must be contiguous. A non-contiguous one is refused instead of reordering tracks, because CZABA has no track reorder. R17-G1 and R17-G3 stay reachable with the fixed music / stems / sfx lanes.
  - **Video:** not groupable.
  - **Rename:** F2 (Live's Ctrl+R is the browser's reload).
  - **Active lane:** unchanged on every name click, so the C-verified active-lane behaviour does not move.
  - **Group rows** have no `data-track-id`. `laneTrackIdAtPointer` keeps the previous target over a group row; without that rule, a clip would fall to the last lane.
  - **Auto-fit:** subtracts the height of the group rows, with `panels.ts` frozen.
  - **`ArrangementContext.tsx`:** untouched. `scheduleKey` covers only clips and the loop, so grouping restarts nothing.
- **Ableton (Live 12, captured 2026-10-22):**
  - Confirmed in §18.3: Group Tracks, nesting with the same command, ungroup, the folded overview, mixer controls on a group, and the half-coloured Solo.
  - Confirmed in §18.2: Shift-click selects adjacent tracks, Ctrl-click non-adjacent ones.
  - Confirmed in §42: Ctrl+G, Ctrl+Shift+G, `U` and Ctrl+R.
  - Deliberate differences: F2 for rename, non-contiguous selections refused, video excluded. Refusing Ctrl+G on an empty selection is a CZABA decision.
- **Owner risk:** `StudioWorkspace.tsx` grows again. This is why the SRW-16 checkpoint request is written now, including question 7 about where the selection state should live. A has a stop-and-report clause for frozen `model.ts`, `panels.ts` and `ArrangementContext.tsx`.

## 5. Artifacts written by B this phase
- `tasks/round-78.md`: copy of the round-78 `current-task.md` (`cmp` OK).
- `current-task.md`: the round-79 task.
- `b-round-78.md`: this file.
- `b-next.json`.
- `b-round-78-checkpoint-request.md`.
- `b-round-78-r79-tree-sha256.txt`: 459 entries, 459/459 OK.
- `b-round-78-r79-snapshots/`: 5 files plus `SHA256SUMS.txt`.
- `b-round-78/`:
  - `backups/`: backlog, feature-status, b-next and plan as they were before this phase;
  - `update_backlog.py`;
  - `tools/capture.cjs`;
  - `ableton-mixing-20261022.txt`.
- `backlog.json` (version 78):
  - SRW-16 updated: 2b-3 published, the item set to c_pass_tech_lead_manual;
  - SRW-17 given three stages, stage 1 dispatched;
  - round 78 closed and round 79 added;
  - 9 findings added; 6 updated, among them GATE75 S1–S3 → Lows batch, GATE77-S2 closed, and the two ARCH signals pointed to the checkpoint.
- `feature-status.md`: header, current round, the round-78 result, the FB-10, FB-12, SRW-16 and SRW-17 rows, R78-T and R79-T, and the history line.
- `docs/technical/studio-real-workspace/plan.md`: D-29z44 added, and the FB-10 and FB-12 map rows updated.

B did not touch app source and did not commit or push. `regression-last.json` is unchanged, because no regression round closed.
