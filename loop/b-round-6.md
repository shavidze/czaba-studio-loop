# B — Round 6 decision record (round 7 planning, bounded workflow)

Date: 2026-10-09 · Author: B (task writer / dispatcher)

**Session.** This is a fresh B session, started after a watchdog restart and after the bounded workflow was approved (`docs/technical/studio-real-workspace/agent-workflow.md`, 2026-10-09). The earlier B session had already:
- archived `tasks/round-6.md` (the round-6 task C verified; not overwritten here);
- updated `backlog.json` to v7 from C's round-6 evidence;
- added the D-24a clarification, D-29 and D-30 to `plan.md`;
- written an unbounded round-7 draft (three bugs + SRW-11B). That draft is preserved as `tasks/round-7-before-bounded-policy.md`.

It had not written `b-round-6.md`, `b-next.json` or `feature-status.md`. This session re-cut round 7 to the approved policy and wrote those files. Checkpoint: `b-round-6-checkpoint.md`.

**Advisor.** Available. Called once after orientation and before writing; its advice was applied (§4). A second call follows after writing (§8).

**Subagents.** B's session has no Agent tool. The SRW-11B design-philosopher pre-step is scheduled for round-8 planning.

**MCP connectors.** Atlassian, Gmail, Google Calendar/Drive, Microsoft 365, Similarweb, Klaviyo and marketing Amplitude/Slack need authorisation in claude.ai connector settings (or `/mcp` in an interactive session). None were needed.

## 1. Inputs read

- `current-task.md`: the pre-policy round-7 draft, byte-identical in size to `tasks/round-7-before-bounded-policy.md`.
- `tasks/round-6.md`, `a-round-6.md` (§8, §9, progress log), `c-round-6.md`, `c-round-6.json`, `backlog.json` v7, `b-next.json` (still round 5).
- `plan.md` lines 180–225: D-24a clarification, D-29 and D-30 are complete, with no partial edit.
- `agent-workflow.md`.
- `publication-checkpoint.json` (approvedWorkflow, final-only commit/push, T12 after the original scope, real Store only).
- `checkpoint-r6-review.md`: #1–#5, #7 (playhead), #8, #9 and #12 were fixed by A in round 6. #6 and #7 (marquee) were accepted by C. #10 is C-R6-01.
- `root-pre-push-review.md`: its findings are resolved or accepted per `backlog.json` `open_findings` (L2/L3 re-run PASS as R4-B5/R4-B4 in C round 6; L7 accepted).
- `git status`: HEAD `c5ed47b` plus the 11 M files C verified. Root has not committed them yet.

## 2. Backlog changes (only what C evidenced)

The C-evidence updates were already in v7 and match `c-round-6.json`. I re-checked them; nothing was redone:

| Item | Status | Evidence (c-round-6) |
|---|---|---|
| SRW-03 | **regression_open** | RF6-1 (with a note), RF6-U, R2-V3 5/5 and RF5-2 5/5 pass. RF6-2 fails: R3-V1 22 PASS / 6 FAIL / 2 INVALID, 8 runs with app LoAF. RF5-3 4/9. → C-R6-02 |
| SRW-10 | **verified_except** | R10-N1..N4, N6..N8 and U pass. R10-N5 fails (C-R6-03). The Tech Lead real-mouse/wheel check is still open |
| SRW-04 | done | C-R5-05 resolved by R27-1/R27-U |
| SRW-08 | done | C-R5-02 (R26-*), C-R5-03 (R6-G1), Shift note (R6-H1) resolved |
| SRW-09 | done | C-R5-04 resolved by R6-P1 |
| SRW-12 | done | C-R5-01 resolved by R6-L1 |
| root-M3 | resolved | R6-D1 |
| B-R5-01 | resolved | RF6-1 + RF6-U |

New in v8 (planning only, no new verdicts):
- `version` 8;
- `workflow_policy`;
- `rounds[7]` re-cut to the three bugs, with the draft marked superseded;
- `planned_rounds` (8–10 SRW-11B stages, then the milestone regression);
- `regression_debt_g6r` (the 21 IDs; not PASS);
- SRW-11B `dispatched` → `todo` (round 8, staged; the acceptance draft reference is kept).

Backup of v7: `%TEMP%/backlog-v7-before-b6-bounded.json`.

## 3. C's bugs → routing

| Bug | Severity | Route | Why |
|---|---|---|---|
| C-R6-02 | Medium | Round 7 S1: measure first; RF7-P1/P2 (per-frame discipline, Play render budget), RF7-2/3 (drift, first Play), bounded runs | This is a new regression signal, not a re-measurement of unchanged code: 8 runs had app-attributed LoAF, round 5 had 0, and round 6 added per-frame work. The deterministic P1/P2 criteria test the likely cause, so the verdict does not rest only on noisy drift runs. |
| C-R6-03 | Low | Round 7 S2: R10-N5r, R10-N5-U | Last open SRW-10 criterion. |
| C-R6-01 | Low | Round 7 S3: D-30, R30-1/2/U | Last open D-26 gap (checkpoint-r6 #10). |

The workflow allows up to three closely related bugs per round. These three are related as follows:
- all three come from C's verification of the round-6 shared-timeline work: per-frame playback, ruler/Fit and the D-26 registry;
- they share `ArrangementContext.tsx` and the arrangement components.

None is critical, a security issue or a data-loss bug, so the user's "C bugs first" order applies unchanged.

## 4. How the bounded policy changed the draft

1. **SRW-11B removed from round 7.** The policy forbids putting an independent feature in the same task as a sync investigation, and SRW-11B is itself three separately verifiable features. It now runs as three rounds:
   - round 8: detail panel;
   - round 9: fold, height and auto-fit;
   - round 10: floating video.

   D-29 stays binding and the full acceptance (R11-P1b…R11-U) is preserved. This is a sequencing decision, not a deferral or a scope cut.
2. **Run budget.** The draft asked for R3-V1 10+5, R2-V3 3+2 and RF5-2 5. The new limits:
   - every layout gets 3 valid runs plus at most 2 replacements for environment-invalid runs;
   - RF7-3 chains 3 RF5-2 loops before each fresh Play, so the loop regression is covered inside the same budget;
   - A's own baseline and after measurements use the same budget.

   Tolerances and the D-24 rules are unchanged.
3. **Regression breadth.** The draft's G7-R (21 not-rerun IDs plus about 35 more) is replaced by adjacent regressions only: RF6-1 if `step`/`video-sync.ts` changed, R10-N6, R4-M2, R10-N1/N3/N5/N8, R26-1..3, R27-1 and R3-V3/R5-B1r where relevant.

   The 21 IDs are recorded as **regression debt, not PASS**. They are due at the milestone regression after SRW-11B, or earlier if a concrete regression appears.
4. **What happens after the budget.** If RF7-2/RF7-3 still fail after an honest fix:
   - C-R6-02 stays open, with no relaxed tolerance and no PASS;
   - if RF7-P1/P2 pass, the next step is the Tech Lead quiet-Chrome run, and round 8 starts SRW-11B;
   - that move is allowed because C-R6-02 blocks no other feature and is not a security or data-loss bug.
5. **Removed from the round-7 grants:** `panels.ts`, `ArrangementDetailPanel.tsx`, the design-philosopher step and the dock U1 layout grant. The S1 dock grant stays, with the `<video>` mount frozen.

## 5. Uncertain contracts: the smallest honest choice

- **RF6-1 wording.** C's release note is resolved by the D-24a clarification already in `plan.md`. It allows at most one in-flight escalation from a window that was already qualified at release, ≤ T + 150 ms, then recovery. This only takes effect if RF6-1 is re-run this round.
- **R10-N5r.** Only the outcome is fixed: overflow ≤ 1 px, no half-cut label, ≥ 40 px gap. The mechanism is left to A, because any of skip, right-anchor or clip is honest.
- **D-30.** A slider pointer drag claims the existing registry; no new concept is introduced. Keyboard changes stay single commits.

## 6. Decision

**CONTINUE.** Not COMPLETE:
- SRW-03 and SRW-10 have open bugs;
- SRW-11B and SRW-13..20 are not started;
- SRW-21's adapter part is not done;
- SRW-23 and the drift check still need Tech Lead real-Chrome evidence;
- 21 regression IDs are unverified on the current tree;
- T12 follows the original scope.

Not BLOCKED: nothing needs external information, approval or credentials. SRW-21's route mount is the only permission-gated part, and other scope remains.

## 7. Files written by B this round

- `tmp/studio-real-loop/current-task.md`: round 7 (bounded), replacing the pre-policy draft. The draft stays at `tasks/round-7-before-bounded-policy.md`. `tasks/round-6.md` was not modified.
- `tmp/studio-real-loop/feature-status.md`: first version of the progress board.
- `tmp/studio-real-loop/backlog.json`: v8 (§2).
- `tmp/studio-real-loop/b-next.json`, `b-round-6.md` (this file) and `b-round-6-checkpoint.md`.
- `docs/technical/studio-real-workspace/plan.md`: FB-08 row, D-29 heading, round table (7; 8–10), round-6 "not re-run" line, round-7 status line. Backup: `%TEMP%/plan-before-b6-bounded.md`.

No app source, test or other agent's file was touched.

## 8. Second advisor call (after writing)

Available; called after all files were written. It confirmed that CONTINUE, the three-bug round, the SRW-11B staging and the regression-debt handling are consistent with the policy. It also noted that the "closely related" rationale is thin but recorded. Corrections applied:

1. `current-task.md` §3:
   - RF7-P1 now uses the same 3 R3-V1 runs as RF7-2, so the layout budget is not doubled.
   - RF7-3 takes the RF5-2 verdict from the first 3 wraps; the other loops are setup.
   - A's F_1..3 repro keeps C's exact order (5 loop runs). A repro is about fidelity; the budget applies to measurements.
2. `feature-status.md` FB-08: `არ დაწყებულა` (SRW-11A done; SRW-11B not started), instead of an in-progress status that round 7 does not cover.
3. This section replaces the earlier placeholder.
