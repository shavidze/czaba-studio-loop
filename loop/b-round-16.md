# B — Round 16 decision record (round 17 planning, bounded workflow)

Date: 2026-10-11 · Author: B (task writer / dispatcher)

**Advisor.** Available. I called it once after orientation and before writing; §4 lists the advice I applied. The second call, after writing, is in §9.

**Subagents.** B's session has no Agent tool, so the `code-reviewer` run (and the optional `design-philosopher` run) stays with A (task §7).

**MCP connectors.** Atlassian, Gmail, Google Calendar/Drive, Microsoft 365, Similarweb, Klaviyo and marketing Amplitude/Slack need authorisation in the claude.ai connector settings (or `/mcp` in an interactive session). None were needed.

## 1. Inputs read

- **Round 16 task.** `current-task.md` (round 16), archived unchanged as `tasks/round-16.md`. No earlier `round-16` archive existed, so nothing was overwritten.
- **Agent reports.**
  - `a-round-16.md`: §2, §3, §7, §8, §9 and the section index;
  - `c-round-16.md` and `c-round-16.json`, in full.
  - `b-round-16-result.json` (0 bytes) belongs to the harness and was not touched.
- **B's own records.** `b-round-15.md`, `feature-status.md`, `b-next.json`, and in `backlog.json` v17: SRW-11B's `polish_round`, `recorded_followups`, `open_bugs`, `rounds` and `planned_rounds`.
- **Plan.** `plan.md`: D-29 through D-29g, §5 and §10.
- **Root items.** `root-pre-push-review.md` and `publication-checkpoint.json` are unchanged since the last round, and C's carry list (§11) still matches them.
- **Original reviewer notes:** `a-round-8.md` §(code-reviewer L3–L11, design (a)–(d)) and `a-round-9.md` §7 (M1, L2–L8).
- **Prototype, read-only, for the design (d) direction:** `output/studio-workspace-prototype/index.html` l.24. The detail panel there uses Georgian `დასაწყისი` / `სიგრძე`.
- **Source, read-only, to make the task concrete:**
  - `ArrangementLibraryPreview.tsx` (full file):
    - l.58–77 `LibraryPlayheadText` (position writer + span);
    - l.121 `setPreviewCursor` at up to 20 Hz (`PREVIEW_CURSOR_STEPS_PER_SECOND`, l.22);
    - l.264–271 the active-lane `<p>`, which has no height or line control. This is the C-R16-01 mechanism;
  - `render-budget.test.tsx` l.1–80 and l.512–540. The probe counts renders by function name. R9-L1 asserts the `<p>` text `· playhead 00:00.000`, the span class and render counts by the name `LibraryPlayheadText`. That is why the task keeps the inner name;
  - `ArrangementDetailPanel.tsx` (round-18 preparation):
    - l.218–226: the input reset depends on `range` wholesale (L4);
    - l.188: the overlay `bg-foreground/60` sits inside the R9-D3 waveform box;
    - l.596: the `biome-ignore` text;
    - l.280–293: the Latin `start`/`offset` labels.
- **Tree.** `git status` shows 18 M and 18 Studio `??` (doc 025 is new), plus the 2 foreign files. That equals C's end status. All file mtimes are earlier than C's run.

## 2. C's round-16 result, as evidenced

**C `taskStatus: PASS`.** All numbers below are C's own.

| Area | Result | Evidence |
|---|---|---|
| R16-L1 | **PASS 7/7** | `c-round-16.md` §3. Folded handle: `pointer-events: none`. The bottom 3/2/1 px hit the clip or its trim edge. The trim gives 1 Undo and the row stays 36. Keys unfold only. Drop at −2 px adds one clip |
| R16-F1 | **PASS** | §4. Footer 69 with Δ0 across none/select/deselect ×2 at both viewports. At 1280, lane 60 and cap 142 stay constant. The price is disclosed: 1440 footer 49 → 69 |
| R16-F2/F3 | **PASS** | §5. D-29f holds against the new body. In the C-R15-02 flow, body 255–500 Δ0 and 0/360 preview samples in the box |
| R16-H1 | **PASS 1–6** | §6. Stays at 142 over 100 rAF samples; through 1440 and back; through collapse/reopen; D-29b +10 → 152; the 1440 control stays 144; R9-D3 hunks untouched |
| R16-G1, T1, U, Doc | **PASS** | §7. Guard M1–M7 each fail as expected. G6 (M5) and every-key (M6) fail the new test |
| Adjacent | **PASS** | §8: R15-P3 quick, R13-F2/F3, R11-P2/P2a, R14-E, R11A-1, dock, RF7-P2, real WAV export 18.000 s and a playback sanity check |
| Gates | G16-1 (979/979), G16-2, G16-3: **PASS** | §2 |

**New Low: C-R16-01.** It is a pre-existing mechanism: the active-lane text wraps in the preview, and nothing is re-placed after placement (D-29g).

## 3. Decisions

### 3.1 Status changes, only from C evidence

| ID | Before | After | C evidence |
|---|---|---|---|
| C-R11-01 | open (Low) | **closed** | R16-L1 (`runs/l1-1440.txt`) |
| C-R11-02 | open (Low) | **closed** | R16-F1 (`runs/f1-*.txt`) |
| C-R11-03 | open (Low) | **closed** | R16-H1 (`runs/h1-1280.txt`, `cancel-restore-1280.txt`) |
| C-R15-02 | open (Low) | **closed** | R16-F3/F2 (`runs/f3-1280-480.txt`) |
| C-R15-03 | open (Low) | **closed** | R16-T1 (`gates/guard-c16.txt` M5/M6) |
| A round-11 deviation 9 | open finding | **closed** | R16-G1 (`runs/g1-1440.txt`) |
| C-R16-01 | — | **open (Low)** → round 17 | `c-round-16.json` |
| SRW-11B / FB-08 | ბაგია | **ბაგია**: C-R8-01 (Medium), C-R16-01 (Low) | same |

Nothing moved to **მზადაა**: SRW-11B still has C-R8-01, C-R16-01 and polish open.

### 3.2 C-R16-01: fixed, with a fixed two-line row (D-29h)

- **Not accepted as a price.** The fix is local and cheap: one `<p>` in a file that is not a sync target. Accepting the overlap would shrink the request.
- **Why not re-placement:** the D-29g reasons still hold. It would need a ResizeObserver or re-anchor, and a re-anchor resets a user drag in the frozen dock.
- **Why two lines and not one `truncate`:** the video-lane note `(აუდიო აქ არ ემატება)` explains why ＋ is disabled. It stays visible at 288 instead of hiding behind an ellipsis.
- **Width independence.** A fixed two-line height also stops the body changing when the library separator moves while the video is expanded, which is the same class of shift.
- **Price:** +16 px wherever every state fits on one line. A measures it, doc 026 records it and C verifies the number. A stops if any state needs more than two lines at 288.

### 3.3 Order: C bugs first, so round 17 = C-R16-01 + M-R10-1/M2, and 14b moves to round 18

- Both items live in `ArrangementLibraryPreview.tsx`, which is not a Tech Lead sync target. M-R10-1/M2 was recorded as "allowed when ArrangementLibraryPreview.tsx is next in scope".
- **The memo keeps the inner function name `LibraryPlayheadText`.** The frozen `render-budget.test.tsx` counts by that name. Guard 4 proves this constraint is load-bearing.
- **The split of 14c:** the preview part goes to round 17. The context part (M1 `ArrangementContext`, L8 position-store) waits for the Tech Lead run or, at the latest, rides with SRW-13, which must open `ArrangementContext` anyway. It is scheduled, not dropped.

### 3.4 Decision-only 14b items (D-29h), and round 18's code items

**Decided now, without code:**
- **(a)** The footer selected-clip line stays: D-29g just made it a reserved row.
- **(c)** The name in the header and in the content is accepted: the header identifies a collapsed panel.
- **L2/L3** ride with C-R8-01. A collapsed panel is R3-V1 3/3 PASS, and touching the writer would break the frozen R9-D3 contract while the Tech Lead run is pending.
- **Round-9 L5 (pointer capture) and L7 (6 px separator)** are accepted, with the reviewer's own round-8 rationale.
- **Lift the panel height into the snapshot:** not now; only if a C bug needs it.

**Round 18 code, in the task's orientation section:**
- **L4**, the input reset;
- **L11**, the wheel. C can only observe a unit test plus a mutation; the real wheel goes to the Tech Lead;
- **design (b)**, the overlay. Only the overlay class changes, and the criterion is a pixel test;
- **L6**, the comment text;
- **design (d)**, the Georgian labels per the prototype, with the footer verbatim. Before writing round 18, B greps the tests for the label strings.

### 3.5 A's round-16 deviations

- **1–4, 6 and 7 are accepted**, and C confirmed each one. The collapsed clamp reopens at the announced value; the cancel-restore was browser-confirmed.
- **Deviation 5 is B's wording error.** The round-16 task said "deselect by an empty-lane click or Esc", but Esc never deselected clips (Ableton PNL-02/VID-06). Round 17 states it: deselect = an empty-lane click on the **same** lane (the C-R16-01 confounder).

The reviewer notes are recorded in `backlog.json`: pass 1 8/10, pass 2 9/10, and the snapshot-lift alternative.

## 4. Advisor advice applied

- **Decision:** CONTINUE.
- **Backlog:** v18 closes only the IDs that C evidenced, each with its run paths; it opens C-R16-01; `vitest_floor_round17` is 979.
- **New 46-file sha reference:**
  - `sha256sum -c` passes 46/46 on the live tree;
  - against `b-round-15-tree-sha256.txt`, exactly the 7 A-owned files plus doc 025 differ, which equals C's G16-2.
- **Deviation 5:** recorded as a B error.
- **Ordering:** "C bugs first" decides it, so round 17 = C-R16-01 + M-R10-1/M2 in the same file, after checking that the file is not a sync target.
- **14b items for round 18:**
  - the overlay criterion is narrowed so R9-D3 does not fail by construction;
  - L11 gets only criteria that C can observe;
  - L4 has clear acceptance.
- **D-29h:** holds the decision-only items.
- **Carried verbatim:** same-lane deselect, the D-29g residual with its "covered control = new bug" rule, and the harness-owned result file left untouched.

## 5. Artifacts written

| File | Change |
|---|---|
| `b-round-16-checkpoint.md` | Context checkpoint, written first and updated during the work |
| `tasks/round-16.md` | Archive of the round-16 task |
| `b-round-16-tree-sha256.txt` | 46 files (the 45 round-15 entries re-hashed, plus doc 025); 46/46 OK on the live tree |
| `backlog.json` | **v18.** Changes: C-R11-01..03, C-R15-02/03 and deviation 9 closed with evidence; C-R16-01 open with its D-29h decision; SRW-11B stage 3 `evidence_round16`; `stages_status`; `polish_round.split`; D-29h in the decisions; round-16 follow-ups; round 16 `c_pass`; round 17 dispatched; `planned_rounds` 16/17/18; `baseline_tree_at_round17`; `vitest_floor_round17` 979; the dirty-tree note. Script: `b-scripts/status-r17.js`. Backup: `b-scripts/backlog.before-r17.json` |
| `docs/technical/studio-real-workspace/plan.md` | D-29h; the §4 FB-08 row; §5 rows 17/18; §10 (advisor line, round-16 result, round-17 dispatch, the SRW-11B remaining line). Script: `b-scripts/plan-md-r17.js`. Backup: `b-scripts/plan.before-r17.md` |
| `feature-status.md` | The board for round 17, with the new Tech Lead item R17-T. Backup: `b-scripts/feature-status.before-r17.md` |
| `current-task.md` | Round 17 |
| `b-next.json` | CONTINUE. Backup: `b-scripts/b-next.before-r17.json` |

No app source, test or other agent's file was touched.

## 6. Round-17 acceptance summary (for traceability)

- **The fixes:**
  - **R17-P1:** the fixed two-line row; Δ0 across lanes and widths; title; verbatim text; the price.
  - **R17-P2:** the exact C-R16-01 repro at 1440/288, plus the 1280 confounder at 480 and 288. Body Δ0 and 0 preview samples in the box.
  - **R17-P3:** the preview's wave, toggle and keys, find → add, and the video-lane note.
  - **R17-M:** the library playhead node is stable during a library preview, and it advances during arrangement Play.
  - **R17-U:** the 4-part guard proof, including the render-budget name guard.
  - **R17-Doc.**
- **Adjacent:** R16-F2/F3/F1 quick, R15-P2 quick, R13-F3 quick, R11A-1 quick, dock quick and RF7-P2.
- **Gates:** G17-1..3; vitest floor 979; frozen reference `b-round-16-tree-sha256.txt`, plus `library.ts` clean in git.

## 7. Remaining scope (not shrunk)

- **Open bugs:**
  - C-R6-02 and C-R8-01 (Medium; Tech Lead);
  - C-R16-01 (Low; round 17);
  - C-R12-01 (Low; milestone RF5-3).
- **Polish:**
  - M-R10-1/M2 (round 17);
  - 14b: L4, L11, design (b), L6, design (d) (round 18);
  - M1/L8 (after the Tech Lead run, or with SRW-13);
  - L2/L3 (with C-R8-01);
  - the remaining A round-11 follow-ups (round 18 or the milestone).
- **Features:**
  - SRW-13 (FB-04/05/14 and the export 0 dBFS hard-clip);
  - SRW-14 (FB-13);
  - SRW-15 (FB-09/11; grid tempo only, never audio stretch);
  - SRW-16 (FB-10);
  - SRW-17 (FB-12);
  - SRW-18 (FB-06);
  - SRW-19 (FB-07, in scope);
  - SRW-20;
  - the SRW-21 adapter (the route mount needs approval);
  - T12 afterwards.
- **Verification:**
  - the milestone regression (21 regression-debt IDs plus C-R12-01);
  - the Tech Lead manual list: RF7-2/RF7-3, R23-1/2, R12-L4, R8-M1/M2, R10-N1/N2, R30-H1, R11-P3m, R11-SB, R13-RM, R15-SB, the new R17-T, and Lenis.
- **Root carry:**
  - the purchased loader hardcodes middle-east;
  - Lenis on `/studio/*`;
  - portable instruction-file paths;
  - the export hard-clip;
  - the final commit/push after everything;
  - the foreign untracked agent files;
  - the shared Modal focus gap;
  - root GA `scroll` with consent denied;
  - the uncommitted tree (18 M + 18 untracked);
  - the `publication-checkpoint.json` requirements.

## 8. Decision

**CONTINUE.**
- **Not COMPLETE:**
  - FB-04..07 and FB-09..14 are not started;
  - two Medium bugs are open;
  - SRW-11B has C-R16-01 and polish open;
  - the milestone regression and the Tech Lead checks are pending.
- **Not BLOCKED:** round 17 needs no external information, approval or credentials.

## 9. Second advisor call

I made it after all the artifacts were written. The advisor confirmed CONTINUE and found the chain consistent:
- the archive is equal to the round-16 task;
- the backlog closes only the IDs that C evidenced;
- the 46-file reference equals C's G16-2 diff set;
- the plan, board, task and b-next agree on round 17;
- the guard 3/4 reasoning holds against the probe. It counts by function name, the SimpleMemo fiber's type is the inner function, and a memo bail-out is not counted.

I applied these before reporting (script `b-scripts/task-r17-fix.js`; backup `b-scripts/current-task.before-r17-fix.md`):
1. **R17-P1.1 line count.** A fixed two-line height makes `offsetHeight` constant, so it cannot count lines. C now counts content lines as `round(scrollHeight / line-height)` and compares that with A's pre-code count. The ellipsis is required only when `scrollHeight > offsetHeight`. The stop condition names the pre-code measurement.
2. **The title whitespace.** `title` is exactly `აქტიური ხაზი: ${name}${note}`, with no trailing space. C compares it after `.trim()` with the `textContent` before `·`, because the JSX `{' '}` leaves a trailing space. This prevents a literal-criterion FAIL of the D-19b/D-29g class. R17-U asserts the same.
3. **Board ID.** In `feature-status.md`, the SRW-12 row cited `R17-R`; it now cites R17-P3.
