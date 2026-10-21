# B — Round 12 decision record (round 13 planning, bounded workflow)

Date: 2026-10-10 · Author: B (task writer / dispatcher)

**Advisor.** Available. I called it once after orientation and before writing; §4 lists the advice I applied. I called it a second time after writing (§9).

**Subagents.** B's session has no Agent tool, so the `design-philosopher` and `code-reviewer` runs stay with A (task §1.2, §7).

**MCP connectors.** Atlassian, Gmail, Google Calendar/Drive, Microsoft 365, Similarweb, Klaviyo and marketing Amplitude/Slack need authorisation in the claude.ai connector settings (or `/mcp` in an interactive session). None were needed.

## 1. Inputs read

- **Round 12 task.** `current-task.md` (round 12), archived unchanged as `tasks/round-12.md`:
  - made with `cp -n` before any rewrite;
  - no earlier `round-12` archive existed, so nothing was overwritten.
- **Agent reports.**
  - `a-round-12.md` (all sections);
  - `c-round-12.md`, `c-round-12.json`, `c-round-12/runs/r12s-split.txt` and `w-summary.txt`.
- **B's own records.** `feature-status.md`, `b-round-11.md`, `b-next.json` and `backlog.json` v13, including SRW-03, SRW-05, SRW-11B (stages, `polish_round`), `planned_rounds` and `open_findings`.
- **Plan and drafts.**
  - `plan.md`: D-19, D-19a and its amendment, D-22, D-24/D-24a, D-26, D-29..D-29c, §5 and §10;
  - `tasks/round-7-before-bounded-policy.md` §7.3–§7.4 (the original R11-P3 draft).
- **Root items.** `root-pre-push-review.md` and `publication-checkpoint.json`. Nothing new; the carried list is unchanged.
- **Source, read-only, to make the task concrete:**
  - `ArrangementVideoDock.tsx`: the effects l.236–624 and l.626–663, the `sourceChanged` path l.446–568 and the JSX l.665–711;
  - `ArrangementLibrary.tsx`: the local `isCollapsed` l.150, the search Escape l.204 and the aside/rail l.340–385;
  - `StudioWorkspace.tsx`: the keydown handler l.809–994 (Space l.818–823), the layout l.1085–1135 and `isTypingTarget` l.153;
  - `panels.ts` (all);
  - `root.tsx` l.136–150 and `components/animations/PageTransition.tsx` (the framer-motion wrapper, a possible containing block for `fixed`);
  - the prototype `workspace.js` l.2565–2580, 2655–2772 and 3305–3316, for behaviour and status text only.

## 2. C's round-12 result, as evidenced

**C `taskStatus: FAIL`**, on the literal R12-S only.

| Area | Result | Evidence |
|---|---|---|
| R12-W1 | **PASS.** 3 valid runs, 0 replacements; 9/9 wraps `d300` −0.0030…+0.0058; swaps only; `videoSettles` 0 → 3 = swaps; escalations 0; D-24 PASS; settle-window rate ≤ 1.45 at \|d\| ≤ 0.11 | `c-round-12.md` §2.1; `runs/w-table.txt`, `w-summary.txt` (B read it) |
| R12-S | **FAIL (literal).** 5 writes (1.1) at 0.19–0.33 s after Play, before the first swap, at same-frame harness \|d\| 0.0192–0.0196. After the first swap: 0 writes outside settle (0/147, 0/147, 0/145; V3_1 0/237) | `c-round-12.md` §2.2; `runs/r12s-split.txt` (B read it: `postNe` 0 in all four) |
| R12-U | **PASS.** 58/58; C's own mutations M1–M7 each fail named tests | `c-round-12.md` §2.3 |
| R12-Doc | **PASS** | §2.4 |
| Adjacent | R2-V3 (settles = 2 boundary swaps), RF5-3 H2 (first Play does not arm), R5-L3, R5-E1, RF7-P2 and the dock quick check: **PASS**. R3-V1 N info .0109/.0196 | §3 |
| Gates | G12-1 (tsc 0, vitest 877/877, Biome, build), G12-2 (33/37 b-round-11 hashes OK; the 4 changed are exactly the owned files), G12-3: **PASS** | §1, §6 |

B also checked the tree: the live sha256 values of the dock, `video-sync.ts`, its test and doc 020 equal A's `owned-final-sha256.txt` (`b-round-12-tree-sha256.txt`).

## 3. Decisions

### 3.1 R12-S: a B mis-scope, not a tolerance change (`plan.md` D-19b)

The question is whether the fix can reach the failing rows. It cannot:
- At those 5 writes, settle is unarmed: `videoSettles` was 0, and C's F_1 shows first Play does not arm it.
- Unarmed `settleRate` is identical to `videoRateCorrection`: A's 2401-point grid test, and C's M4 mutation (an `armSettle` no-op) fails 11 tests.
- `videoRateCorrection` is byte-unchanged: C's diff shows additions only.

So R12-S, as B wrote it, measured code that round 12 did not change.

**Ruling.** R12-S applies from the first arm onward. C's own data shows 0 writes there. The 0.02 threshold is unchanged, and round 12's `taskStatus: FAIL` stays on record (`c-round-12.json`, `tasks/round-12.md`, `backlog.json` round 12 `c_fail_literal_r12s`). B writes no PASS for R12-S.

### 3.2 C-R7-01: closed in headless

- R12-W1 meets the H3 rule on 9/9 wraps, with settles = swaps and 0 escalations.
- `backlog.json` SRW-03 `C-R7-01.status = closed_headless`.
- The Tech Lead quiet-Chrome RF7-3 run (VP9 + H.264) **remains required** for SRW-03/SRW-05.
- SRW-03 stays **ბაგია** because C-R6-02 is open. SRW-05 moves to **მოწმდება**: every C ID passes, and the Tech Lead RF7-3 run is left.

### 3.3 C-R12-01 (Low): opened, routed to the milestone RF5-3

The start transient is unchanged code at the edge of the harness reference (≤ 0.8 ms). Re-measuring unchanged code in its own round is the loop the workflow forbids.

At the milestone RF5-3, C reads the dock's live position next to the harness `d`, with no source instrumentation. If a rate ≠ 1 write is confirmed at dock |d| ≤ 0.02, it becomes a D-19 bug with its own round.

### 3.4 A's reviewer Low 1 (`sourceChanged`): accepted, no code

The dock trace:
- `sourceChanged` → `seekWanted = true` (l.535–545);
- `issueHoldSeek` (l.548) → `endSettle()` (l.328).

The frame returns before the rate write (l.558), so an armed settle writes nothing in between. The residual case (a spontaneous pause → `holdRelease` → play) keeps settle armed for ≤ 1.0 s, at rate ≤ 1.45. No fifth end site.

### 3.5 Round 13: SRW-11B stage 3, the floating video (`plan.md` D-29d)

`plan.md` §5 gates stage 3 on C-R7-01 closing, and it closed in 3.2. It is the next dependency-ordered item from the original backlog (FB-08).

C-R11-01..03 and C-R12-01 are Low and block nothing. C-R6-02 and C-R8-01 wait on the Tech Lead.

**Contract decisions** (smallest honest behaviour, with reasons in D-29d):
- **State lift.** The library collapse state is lifted into `StudioWorkspace` props. `ArrangementContext` is frozen for the Tech Lead C-R8-01/C-R6-02 run.
- **Same box.** The same box becomes `fixed`, with no portal, reparent or remount. The two dock effects are byte-identical, and C diffs them against A's round-12 final.
- **Esc order.** Esc in the workspace keydown is skipped when the event is `defaultPrevented`, focus is in a text field, or Export is open. The library search Esc therefore clears first.
- **Placement timing.** The box is placed after the aside `transitionend`, not with the prototype's rAF polling.
- **Prototype text verbatim.** The status texts are copied from the prototype.
- **Space keeps the existing workspace rule:** it toggles the transport on non-slider, non-text targets, buttons included.
  - This corrects the round-7 draft ("Space on a focused button activates it"), which would change a global shortcut outside this feature.
  - Enter activates the buttons.
- **No compact slider or video fold** (D-29).
- **Containing block.** A measures it before code. Root's framer-motion `PageTransition` wrapper could make `fixed` relative to it; if so, A stops and reports, because `root.tsx`, `components/animations` and `app/styles` are forbidden.
- **Adjacent sync check.** One R12-W1-style wrap run runs with the video expanded, because the dock's markup and compositing change. It is one run, and a failure opens a bug.

## 4. Advisor advice applied

- R12-S is ruled on scope ("can the fix reach the failing rows?"), not on tolerance; round 12's FAIL is kept on record.
- C-R7-01 is closed in headless; RF7-3 stays mandatory.
- C-R12-01 goes to the milestone RF5-3 with a live-position read, with no dedicated round.
- `sourceChanged` is accepted from the dock trace.
- The library collapse lift goes through `StudioWorkspace` props, not `ArrangementContext`.
- The dock effects must be byte-identical, checked with a diff against `a-round-12/bak/ArrangementVideoDock.final.tsx`.
- Esc precedence uses `defaultPrevented` / `isTypingTarget`.
- Placement waits for the aside `transitionend`, with no rAF polling.
- The frozen reference is `b-round-12-tree-sha256.txt`, and the vitest floor is 877.
- One wrap run is the adjacent regression.
- The dirty-tree exposure is named for root.

## 5. Artifacts written

| File | Change |
|---|---|
| `tasks/round-12.md` | archive of the round-12 task (`cp -n`) |
| `b-round-12-tree-sha256.txt` | 38 Studio files at the C round-12 end tree |
| `b-round-12-checkpoint.md` | context checkpoint |
| `backlog.json` | v14: C-R7-01 `closed_headless`, C-R12-01 added, SRW-05 `verified_except_manual`, SRW-11B stage 3 dispatched (D-29d), `baseline_tree_at_round13`, `vitest_floor_round13` 877, open findings (reviewer Low 1 accepted, dirty-tree exposure), rounds 12/13, advisor note. Script: `b-scripts/status-r13.js`; backup `b-scripts/backlog.before-r13.json` |
| `docs/technical/studio-real-workspace/plan.md` | D-19b and D-29d, §5 row 13, §10 round 12/13 status and remaining items, advisor line. Script: `b-scripts/plan-md-r13.js`; backup `b-scripts/plan.before-r13.md` |
| `feature-status.md` | the board for round 13 (backup `b-scripts/feature-status.before-r13.md`) |
| `current-task.md` | round 13: SRW-11B stage 3 |
| `b-next.json` | CONTINUE |

No app source, test or other agent's file was touched.

## 6. Status changes (only from C evidence)

| ID | Before | After | C evidence |
|---|---|---|---|
| C-R7-01 | open (Medium) | **closed in headless**; RF7-3 Tech Lead still required | `c-round-12.md` §2.1 R12-W1 |
| SRW-05 | regression_open / ბაგია | **verified_except_manual / მოწმდება** | R12-W1, R5-L3, R5-E1 (`c-round-12.md` §2.1, §3) |
| SRW-03 / FB-16 | ბაგია | ბაგია (C-R6-02 open) | — |
| C-R12-01 | — | **open (Low)** → milestone RF5-3 | `c-round-12.md` §2.2, §7 |
| SRW-11B / FB-08 | ბაგია | **მუშავდება** (stage 3 dispatched; C-R8-01 and C-R11-01..03 still open) | stage 1–2 evidence unchanged |

Nothing moved to **მზადაა** in this round.

## 7. Remaining scope (not shrunk)

- **Open bugs:** C-R6-02, C-R8-01 (Medium; Tech Lead); C-R11-01..03 (Low; 14a); C-R12-01 (Low; milestone).
- **Features:** SRW-11B stage 3 (round 13) and polish 14a–14c; SRW-13 (FB-04/05/14 and the export 0 dBFS hard-clip), SRW-14 (FB-13), SRW-15 (FB-09/11; grid tempo only, never audio stretch), SRW-16 (FB-10), SRW-17 (FB-12), SRW-18 (FB-06), SRW-19 (FB-07, in scope), SRW-20; the SRW-21 adapter (the route mount needs approval); T12 afterwards.
- **Verification:** the milestone regression (21 regression-debt IDs plus C-R12-01) and the Tech Lead manual list (RF7-2/RF7-3 quiet Chrome, R23-1/2, R12-L4, R8-M1/M2, R10-N1/N2, R30-H1, R11-P3m including the floating-video drag, R11-SB, Lenis).
- **Root carry:** the purchased loader hardcodes middle-east; Lenis on `/studio/*`; portable instruction-file paths; the export hard-clip; the final commit/push after everything; the foreign untracked agent files.

**Root exposure note.** There has been no commit since `c5ed47b`. Rounds 6–12 leave 17 M + 12 untracked Studio files. This is policy-correct, because the final commit/push is root's, but the exposure grows each round.

## 8. Decision

**CONTINUE.**
- Not COMPLETE: most of FB-04..14 is not started, there are open Medium bugs, and the milestone regression and the Tech Lead checks are pending.
- Not BLOCKED: round 13 needs no external information, approval or credentials. The Tech Lead run only closes C-R6-02/C-R8-01 and adds SRW-03 evidence.

## 9. Second advisor call

Made after these artifacts were written. The advisor confirmed CONTINUE and that the status changes stay within C's evidence. Applied before reporting:
1. **Reduced motion.** Placement waits for `transitionend` (`propertyName` width) only when the aside's computed `transitionDuration` is non-zero. Otherwise it places on the next frame, because `motion-reduce:transition-none` means `transitionend` never fires. This adds one R13-U test and one D-29d sentence.
2. **Guard proof 2** now hoists the Esc branch above the l.811 early return. Removing `defaultPrevented` alone was unfalsifiable: B verified that `type="search"` is in `TEXT_INPUT_TYPES`, so `isTypingTarget` already short-circuits.
3. **Doc 021** is added to A's base backups (G13-2 checks them against `b-round-12-tree-sha256.txt`).
4. **R13-F2** asserts that Follow does not scroll during the float drag.
5. **R11-SB** on the Tech Lead list notes the 1280×720 temporary library opening and the real horizontal scrollbar.
