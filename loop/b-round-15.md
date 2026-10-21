# B — Round 15 decision record (round 16 planning, bounded workflow)

Date: 2026-10-11 · Author: B (task writer / dispatcher)

**Advisor.** Available. I called it once after orientation and before writing; §4 lists the advice I applied. The second call, after writing, is in §9.

**Subagents.** B's session has no Agent tool, so the `code-reviewer` run (and the optional `design-philosopher` run) stays with A (task §7).

**MCP connectors.** Atlassian, Gmail, Google Calendar/Drive, Microsoft 365, Similarweb, Klaviyo and marketing Amplitude/Slack need authorisation in the claude.ai connector settings (or `/mcp` in an interactive session). None were needed.

## 1. Inputs read

- **Round 15 task.** `current-task.md` (round 15), archived unchanged as `tasks/round-15.md`:
  - no earlier `round-15` archive existed, so nothing was overwritten;
  - `cmp` confirmed the copy before the rewrite.
- **Agent reports.**
  - `a-round-15.md`: §7–§10 in full, plus the section index;
  - `c-round-15.md` and `c-round-15.json`, in full.
  - `b-round-15-result.json` (0 bytes) belongs to the harness and was not touched.
- **B's own records.** `b-round-14.md`, `feature-status.md`, `b-next.json` and `backlog.json` v16.
- **Plan.** `plan.md`: D-29c, D-29d, D-29e, D-29f, §4, §5 and §10.
- **Root items.** `root-pre-push-review.md` (2026-10-07) and `publication-checkpoint.json` (2026-10-09). Both are unchanged since the last round, and C's carry list (§10) still matches them.
- **Source, read-only, to make the task concrete:**
  - `StudioWorkspace.tsx`:
    - l.144–203: the lane layout model and `resolveTrackLaneLayout`;
    - l.316–440: float state and placement. Placement runs only on expand, after the transition, and on a window resize via the dock;
    - l.442–580: `refreshTrackLaneLayout`, `toggleTrackFold` (a silent return during a gesture), `changeTrackHeight` (`autoFit: false, detailCap: null`, which is the C-R11-03 jump), the snapshot and `markDetailPanelUserResized`;
    - l.1056: the Mute and edit-key refusal that writes `GESTURE_EDIT_BLOCKED_MESSAGE`;
    - l.1424–1469: the `flex-wrap` footer. The selected-clip `<p>` is rendered only when a clip is selected, which is the shared root of C-R11-02 and C-R15-02;
  - `ArrangementVideoDock.tsx` l.699–724: a new `videoFloatAnchor` object resets `floatRect`. So a workspace re-anchor would discard a user drag. This is why D-29g rejects re-placement;
  - `ArrangementLane.tsx`:
    - l.281–310: on a folded lane, the handle's pointerdown and its ↑/↓ keys unfold;
    - l.665–686: the 6 px handle with `cursor-row-resize`;
  - `ArrangementDetailPanel.tsx` l.375–430: `openHeight = min(expandedHeight, cap)`;
  - `grep arrangement-selected-clip app/`: only the footer uses this id; no test does.
- **Tree.** `git status` shows 18 M, 17 Studio `??` and the 2 foreign files, which equals C's end status. `sha256sum -c a-round-15/gates/owned-final-sha256.txt` is 9/9 OK on the live tree.

## 2. C's round-15 result, as evidenced

**C `taskStatus: FAIL`**, only on the literal R15-P3 sub-check. All numbers below are C's own.

| Area | Result | Evidence |
|---|---|---|
| R15-P1 | **PASS.** 4 cases plus the temporary opening, Δ ≤ 0.02, 16:9, box ≤ body/2, inside the body. Hit-tests return the control 4/4. A real ◀ click works in all five cases. The 160 minimum is never reached | `c-round-15.md` §3 |
| R15-P2 | **PASS.** 1280/480 repro: the real click on the "soft" row succeeds, giving 1 clip and 1 Undo with the box unmoved. 1440/288 last rows: reachable. All four cases: 9/9 list rows and 9/9 tree nodes reachable. ArrowDown keeps every focused row above the box, and Enter adds one clip | §4 |
| R15-P3 | **FAIL, literal only.** After ✕ and Esc an empty `style=""` remains. Padding 4 px, scroll-padding `auto`, `scrollHeight` = pre-expand, texts verbatim, ◀ → ▶ has no attribute, pending inset 0 | §5 |
| R15-E | **PASS.** The X repro stays inside the dialog. Tab ×8 and Shift+Tab ×8 stay inside. E1/E3/E4/E5 pass; the WAV is 288 384 frames. 0 of 656 mid-render samples were outside the dialog | §6 |
| R15-U, R15-Doc | **PASS.** 116/116 and 965/965. C's guards G1–G5 fail as expected. **G6 stays green** → C-R15-03 | §7 |
| Adjacent | R13-F2 (from 8,450.5), R13-F3, R13-F4 quick, R11A-1 quick, dock quick, RF7-P2: **PASS** | §8 |
| Gates | G15-1 (tsc 0, vitest 965/965, Biome 0 errors, build), G15-2 (frozen 36/36, protected 4/4, `Header.tsx` = HEAD), G15-3 (no bypass): **PASS** | §2 |

**New Low bugs:** C-R15-01 (`style=""`), C-R15-02 (the footer line shrinks the body after placement) and C-R15-03 (test strength).

## 3. Decisions

### 3.1 Status changes, only from C evidence

| ID | Before | After | C evidence |
|---|---|---|---|
| C-R14-01 | open (Medium) | **closed** | R15-P1 and R15-P2 PASS; the round-14 repro no longer reproduces (`c-round-15.md` §3–§4) |
| C-R14-02 | open (Low) | **closed** | R15-E PASS; the exact repro now stays inside the dialog (§6) |
| C-R15-01 | — | **accepted**, code unchanged (D-29g) | §5: every functional sub-check passes; only the literal attribute check fails |
| C-R15-02 | — | **open (Low)** → round 16 | `c-round-15.json` |
| C-R15-03 | — | **open (Low)** → round 16 | `c-round-15.json` |
| C-R11-01..03 | open → round 16 | **in progress** (round 16) | unchanged evidence (`c-round-11`) |
| SRW-11B / FB-08 | ბაგია | **ბაგია**: C-R8-01 (Medium); C-R11-01..03, C-R15-02 and C-R15-03 (Low) | same |

Round 15's `taskStatus: FAIL` stays recorded in `backlog.json` (`rounds[15].status = c_fail_literal_p3`). The bug closures rest on the IDs that passed, so the round verdict and the closures do not contradict each other.

Nothing moved to **მზადაა**.

### 3.2 C-R15-01: a B criterion error, accepted (D-29g)

- **Why this is B's error.** D-29f's intent was "no inset declarations; the layout equals round 14", and C measured exactly that.
- **Why the attribute stays:**
  - React leaves an empty attribute when `style` goes from an object to `undefined`;
  - the dock box does the same, and C accepted it under R13-F3;
  - a `key` remount would lose list scroll and focus, the very flow round 15 fixed;
  - a `removeAttribute` effect would fight React's style bookkeeping.
- **The fix is the wording.** R15-P3 now reads "no inline declarations (`style.cssText === ''`)". C re-checks it quickly in round 16, because `StudioWorkspace.tsx` changes again.

### 3.3 C-R15-02: folded into D-29c (2), no re-placement

- **Shared root cause.** C-R11-02 and C-R15-02 have one cause: the footer's selected-clip row exists only while a clip is selected.
- **Why the fix is not re-placement.** Re-placing the box on a body change would need a ResizeObserver or a re-anchor:
  - round 15 banned those mechanisms;
  - a new anchor resets a user's drag inside the frozen dock.
- **D-29d stays:** layout changes after placement do not move the box; only a window resize re-clamps it.
- **The footer contract.**
  - The real line becomes a `basis-full truncate` row with a `title`.
  - With no single selected clip, an `aria-hidden` placeholder (nbsp) holds that row.
  - A measures before coding and stops if select/deselect cannot give Δ 0.
  - The range, ≥ 2-clips and lane-move lines are a recorded residual. C measures them, and any covered control becomes a new bug.
- **Acceptance.** R16-F3 replays C's exact flow with a body-Δ-0 requirement and C's preview sample points.

### 3.4 Round 16 = polish 14a + C-R15-02/03

- The three D-29c track-layout bugs are the core.
- C-R15-02 adds acceptance only. C-R15-03 is one test, which C's G6 mutation must fail.
- Deviation 9 is one status line in the same fold path and was scheduled with 14a.
- Other A round-11 follow-ups (`aria-controls`, Home on separators, ring-inset, `nextElementSibling`) ride with 14b/14c, as `backlog.json` → `polish_round.split` already says.
- **C-R11-03 mechanism.** It is left to A as the smallest honest design, with these constraints:
  - no context, history or effect loop;
  - the detail playhead and waveform stay untouched (the R9-D3 contract of C-R8-01), and C diff-checks them;
  - a cap released for any other reason behaves as today.

### 3.5 A's round-15 deviations and reviewer notes

All are accepted, and C confirmed them:
- the inset tests live in `floating-video.test.tsx`;
- the helper name is kept;
- E3 Space was pressed on WAV;
- E4 was re-run;
- the probe was measured against the round-14 box.

Recorded reviewer notes:
- the dead (h − 16) term;
- the 160 minimum below a ~196 px body;
- focus on `body` escapes the trap. This is added to the shared-Modal root note.

## 4. Advisor advice applied

- **Decision:** CONTINUE.
- **C-R15-01:** accepted as D-29g, in the D-19b pattern; R15-P3 re-worded and re-checked quickly in round 16.
- **C-R14-01/02:** closed on the IDs that passed, while round 15's FAIL stays recorded.
- **C-R15-02:** folded into D-29c (2) as acceptance only; the ResizeObserver/polling ban kept; acceptance R16-F3 plus footer Δ 0 at both viewports.
- **C-R15-03:** one test, with C's G6 as the guard.
- **Round 16:** polish 14a plus those two.
- **Before writing:** source read to cite lines.
- **Footer contract:** the open UI question was settled by a pre-code measurement with stop-and-report, and recorded in `plan.md`.
- **Artifact order:** checkpoint first; doc-024 status plus a new doc 025; the carry list unchanged, with the Modal `body` note.

## 5. Artifacts written

| File | Change |
|---|---|
| `b-round-15-checkpoint.md` | context checkpoint, written first |
| `tasks/round-15.md` | archive of the round-15 task (`cmp` equal) |
| `b-round-15-tree-sha256.txt` | 45 files: the 44 round-14 entries plus doc 024; all 45 OK on the live tree; equals A's owned-final 9/9 |
| `backlog.json` | **v17**. Changes: C-R14-01/02 closed with evidence; C-R15-01 accepted; C-R15-02/03 open with B decisions; C-R11-02 `covers: [C-R15-02]`; SRW-11B stage-3 `evidence_round15`; D-29g in decisions; A's deviations in follow-ups; round 15 `c_fail_literal_p3`; round 16 dispatched; `planned_rounds` 15/16 notes; `baseline_tree_at_round16`; `vitest_floor_round16` 965; the Modal, dirty-tree and deviation-9 notes. Script: `b-scripts/status-r16.js`; backup: `b-scripts/backlog.before-r16.json` |
| `docs/technical/studio-real-workspace/plan.md` | D-29g; §4 FB-08 row; §5 row 16; §10 round-15 result, round-16 dispatch and the SRW-11B remaining line. Scripts: `b-scripts/plan-md-r16.js`, `plan-md-r16b.js`; backup: `b-scripts/plan.before-r16.md` |
| `feature-status.md` | the board for round 16. Script: `b-scripts/feature-status-r16.js`; backup: `b-scripts/feature-status.before-r16.md` |
| `current-task.md` | round 16 |
| `b-next.json` | CONTINUE (backup: `b-scripts/b-next.before-r16.json`) |

No app source, test or other agent's file was touched.

## 6. Round-16 acceptance summary (for traceability)

- **The fixes:**
  - R16-L1: the folded handle has no hit area; the trim edge, keys, unfolded drag and drop.
  - R16-F1: footer, scroller, lanes, cap and body Δ 0 across select/deselect, at both viewports; the residual is recorded.
  - R16-F2: the D-29f formula from the new body.
  - R16-F3: the exact C-R15-02 flow. Body Δ 0, the box inside the body, and the preview points return the preview. The range residual is information; a covered control is a new bug.
  - R16-H1: the C-R11-03 cap keeps its height through resize and collapse/reopen; the D-29b user resize; the 1440 control case; the R9-D3 diff check.
  - R16-G1: deviation 9.
  - R16-T1: the C-R15-03 test fails under G6.
  - R16-U: the five-part guard proof.
  - R16-Doc.
- **Adjacent:** R15-P3 quick (D-29g reading), R13-F2/F3 quick, R11-P2/P2a quick, R14-E quick, R11A-1 quick, dock quick and RF7-P2.
- **Gates:** G16-1..3; vitest floor 965; frozen reference `b-round-15-tree-sha256.txt`.

## 7. Remaining scope (not shrunk)

- **Open bugs:**
  - C-R6-02 and C-R8-01 (Medium; Tech Lead);
  - C-R11-01..03, C-R15-02 and C-R15-03 (Low; round 16);
  - C-R12-01 (Low; milestone RF5-3).
- **Features:**
  - SRW-11B polish 14b/14c (rounds 17–18);
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
  - the Tech Lead manual list: RF7-2/RF7-3 quiet Chrome, R23-1/2, R12-L4, R8-M1/M2, R10-N1/N2, R30-H1, R11-P3m, R11-SB, R13-RM, R15-SB and Lenis.
- **Root carry:**
  - the purchased loader hardcodes middle-east;
  - Lenis on `/studio/*`;
  - portable instruction-file paths;
  - the export hard-clip;
  - the final commit/push after everything;
  - the foreign untracked agent files;
  - the shared Modal focus gap (now including focus on `body`);
  - root GA `scroll` with consent denied;
  - the growing uncommitted tree (18 M + 17 untracked);
  - the `publication-checkpoint.json` requirements.

## 8. Decision

**CONTINUE.**
- **Not COMPLETE:**
  - FB-04..07 and FB-09..14 are not started;
  - two Medium bugs are open (C-R6-02, C-R8-01);
  - SRW-11B has open bugs and polish;
  - the milestone regression and the Tech Lead checks are pending.
- **Not BLOCKED:** round 16 needs no external information, approval or credentials.

## 9. Second advisor call

Made after all artifacts were written. The advisor confirmed CONTINUE and checked the whole chain as consistent:
- the round-15 FAIL stays recorded, and C-R14-01/02 close only on the IDs that passed;
- C-R15-01 is `accepted`, not "fixed";
- the board, plan D-29g and `b-next.remaining` agree;
- the 45-file reference equals A's final hashes;
- the owned and frozen lists do not overlap.

Applied before reporting (script `b-scripts/task-r16-fix.js`):
1. **Footer cost.** C-R11-02's evidence is 1280-only. At 1440, `basis-full` may add a permanent ~20 px row that a selection never added there. The task (§0, §1.4a, R16-F1.3) and D-29g now name this as the accepted price of Δ 0: A measures it and records it in doc 025, and C verifies the number. It is not a stop condition.
2. **Pointer check.** `a-round-11.md` deviation 9 is l.356 (reviewer L12 is l.315); the task cites both lines.
