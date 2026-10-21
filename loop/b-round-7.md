# B — Round 7 decision record (round 8 planning, bounded workflow)

Date: 2026-10-09 · Author: B (task writer / dispatcher)

**Advisor.** Available. I called it once after orientation and before writing; §4 lists the advice I applied. A second call follows after writing (§8).

**Subagents.** B's session has no Agent tool. The SRW-11B design-philosopher pre-step is therefore assigned to A's pre-flight, as in SRW-11A (round 4). D-29/D-29a stay binding.

**MCP connectors.** Atlassian, Gmail, Google Calendar/Drive, Microsoft 365, Similarweb, Klaviyo and marketing Amplitude/Slack need authorisation in the claude.ai connector settings (or `/mcp` in an interactive session). None were needed.

## 1. Inputs read

- `current-task.md` (round 7, bounded), archived unchanged as `tasks/round-7.md` (sha256 identical; no earlier archive existed).
- `a-round-7.md`, `a-round-7-checkpoint.md`, `c-round-7.md`, `c-round-7.json`, `c-round-7/runs/rf72-summary.txt`, `L6_1_res.txt`, `n8-1280x720.json`, `n8-1440x900.json`.
- `backlog.json` v8, `feature-status.md`, `b-round-6.md`, `b-next.json`.
- `plan.md` (D-24a, D-29, D-30, FB map, round table, §10).
- `tasks/round-7-before-bounded-policy.md` §2 and §7 (the SRW-11B draft acceptance).
- `agent-workflow.md`, `publication-checkpoint.json`, and the `root-pre-push-review.md` headings. Root findings were already resolved or accepted per `backlog.json` `open_findings`. Inherited items are still carried: the purchased loader hardcodes middle-east (SRW-21), Lenis on `/studio/*` (Tech Lead), and the portable instruction-file paths.
- Source (read-only, to make the task concrete): `ArrangementContext.tsx` value members (`setTimeRange`, `claimPointerGesture`, `isPointerGestureActive`, `useArrangementPositionWriter`), the `StudioWorkspace.tsx` footer test ids and `isTypingTarget`, and `ArrangementClip.tsx` `buildPeakShape` (not exported).
- `git status`: HEAD `c5ed47b` + 14 M + 2 ??. This matches C's start state.

## 2. Backlog v9 (only what C evidenced)

| Item | Change | Evidence |
|---|---|---|
| C-R6-01 | **resolved** | `c-round-7.json` R30-1, R30-2, R30-U PASS (+ keyboard refusal with real `$B press`) |
| checkpoint-r6-10 | **resolved** | same |
| C-R6-03 | **resolved** | R10-N5r, R10-N5-U PASS |
| SRW-10 | `verified_except` → **`verified_except_manual`**; new Low **C-R7-02** (sweep overflow 1.41–1.47 px; not a named case) | `c-round-7.md` §3, §6 |
| SRW-03 | stays `regression_open`; `evidence_round7` added; **C-R6-02 stays open** with C's note that the forced-layout axis was 0 before and after; new **C-R7-01** (Medium) with a concrete instrumentation spec | `c-round-7.md` §2 |
| SRW-05 | `done` → **`regression_open`** (its R5-L6/RF5-2 video-landing evidence is regressed by C-R7-01; the audio wrap is not implicated) | `c-round-7/runs/L6_1*` |
| SRW-08 | `evidence_round7` (R26-1..3, R30-*); status unchanged | `c-round-7.md` §4, §6 |
| SRW-11B | `todo` → `dispatched_stage1`; stages recorded; D-29a reference | planning only |
| rounds[7] | verified, with C's result and gates; rounds[8] dispatched | — |
| `planned_rounds` | 8 = detail panel; 9 = bug round; 10–11 = stages 2/3; then the milestone | planning |
| `tech_lead_manual_checks` | quiet Chrome now also covers the RF5-2 wrap; new R30-H1 | `c-round-7.md` §10–11 |
| `open_findings` | `a7-review-pending` (the round-7 fix delta was not re-reviewed) | `c-round-7.md` §10 |

Nothing was set to done without C's PASS. The regression debt (21 IDs) is unchanged and still not PASS. Script: `b-scripts/plan-r8.js`. Backup of v8: `%TEMP%/backlog-v8-before-b7.json`.

## 3. C's bugs → routing

| Bug | Severity | Route | Why |
|---|---|---|---|
| C-R7-01 | Medium | **Round 9** (bug round), with the instrumentation spec in `backlog.json` (standby `readyState`/`currentTime`/`seeking` at the swap, pre-seek `seeked` timing, `play()`→`playing` latency, first vs later swaps) | It is a valid-run failure, so it is real. But no round-7 change sits on the wrap path: `video-sync.ts`, the dock `step` and `position-store.ts` are unchanged, and the loop sits inside one clip. With no app hypothesis, an immediate round would only re-measure. The spec turns it into measure → named cause → fix. |
| C-R6-02 | Medium | **Tech Lead quiet Chrome** (required), then round 9 with A's two named candidates | Round 7 used the run budget with an honest fix (tick p50 2.0 → 0.7 ms). The workflow forbids an endless re-measure loop. |
| C-R7-02 | Low | Round 9 | It is in the same area as C-R6-03, and it is not a named-case failure. |

None is critical, a security issue or a data-loss bug, and none blocks the detail panel.

The user's "C bugs first" was applied in rounds 6 and 7. For these sync bugs, the workflow's newer and more specific sync-budget rule decides instead (`publication-checkpoint.json` `approvedWorkflow`: "schedule independent remaining functionality when nonblocking"). This is also the pre-commitment in `tasks/round-7.md` §3: RF7-P1/P2 passed, so the next round starts SRW-11B. The bugs are **sequenced, not deferred**: round 9 is reserved for them, and quiet-Chrome evidence can bring that round forward.

## 4. Round 8 = SRW-11B stage 1 (detail panel) — choices

1. **Stage 1 only.** Fold/height/auto-fit (stage 2) and the floating video (stage 3) keep their full draft acceptance (`tasks/round-7-before-bounded-policy.md` §7.2–§7.4).
2. **1280×720 height conflict: D-29a.** C's n8 numbers: the scroller is 422 px, and ruler + loop strip + 4 × 81 lanes = 368 px, with a scrollbar of about 10 px. An open 144 px panel would break R11A-3/R10-N8 at 1280. Even the stage-2 auto-fit minimums (232 px) do not fit beside 144 px; only ≈ 224 px would remain.
   - Smallest honest choice: the default state is decided once from the measured budget (open at 1440, collapsed at 1280), and the separator adds 0 px.
   - Opening at 1280 scrolls the timeline vertically until stage 2.
   - Stage 2 must reconcile the 224 < 232 gap.
   - Alternative rejected: pulling the lane auto-fit into stage 1. It would drag `ArrangementLane` and lane-height logic into the panel round.
3. **Tight grants.** Allowed: the new panel component, `panels.ts` + tests, a component test, `StudioWorkspace.tsx`, `ArrangementContext.tsx` only if needed (named), and one `export` keyword in `ArrangementClip.tsx` for `buildPeakShape`. The dock, lane, library, overview, ruler, transport, `view.ts`, `video-sync.ts` and `position-store.ts` are excluded, so RF6-1 is not an adjacent check.
4. **Per-frame discipline.** The detail playhead is a new position consumer. It must use the round-7 writer pattern and have a 0-render test (R11-P1e). R4-M2 and 3 valid R3-V1 light runs are adjacent checks.
   - **Attribution rule:** an app LoAF ≥ 10 ms, or forced layout > 1 ms, from the panel's own scripts fails the round. Other drift failures are new C-R6-02 evidence. This is attribution, not a relaxed tolerance.
5. **Range inputs.** These reuse `setTimeRange` (no history). The exact refusal text comes from the draft. A gesture-time refusal uses `GESTURE_EDIT_BLOCKED_MESSAGE` (D-26 rule 3). The inputs are enabled exactly where the timeline's waveform range works today; A confirms this from the code rather than B guessing.
6. **Footer unchanged.** C's scripts depend on its test ids, so any design ruling against the duplicate line is recorded as a follow-up only.
7. **Review gap closed.** A re-runs `code-reviewer` on its fix delta.

## 5. Uncertain contracts: the smallest honest choice

- **Default open state:** decided once from the measured budget. It is not re-evaluated on resize and not persisted. Rationale: it is deterministic and testable as a pure function, and it avoids layout jumps.
- **Range tolerance ±0.01 s:** taken from the draft. Rationale: it matches the precision of the displayed time.
- **Separator inside the header:** 0 px of layout cost. Rationale: the 1280 budget has only 8 px of slack when collapsed.

## 6. Decision

**CONTINUE.** Not COMPLETE:
- SRW-03 and SRW-05 have open Medium regressions;
- SRW-10 has a Low bug and the manual check;
- SRW-11B (3 stages) and SRW-13..20 are open;
- SRW-21's adapter part is not done;
- SRW-23 and the drift/wrap checks need Tech Lead real Chrome;
- the 21 regression-debt IDs are unverified on the current tree;
- T12 follows.

Not BLOCKED: nothing needs external information, approval or credentials. Quiet Chrome is required evidence for two bugs, but plenty of independent scope remains, and SRW-21's route mount is the only part that needs permission.

## 7. Files written by B this round

- `tasks/round-7.md`: archive of the round-7 task (copy).
- `current-task.md`: round 8 (SRW-11B stage 1).
- `feature-status.md`, `backlog.json` v9, `b-next.json`, this file and `b-round-7-checkpoint.md`.
- `b-scripts/plan-r8.js` and `b-scripts/plan-md-r8.js`: the update scripts.
- `docs/technical/studio-real-workspace/plan.md`:
  - D-29a;
  - the FB-01, FB-08 and FB-16 rows;
  - the round table (8; 9; 10–11; later rounds renumbered 12–19 as orientation);
  - the advisor line;
  - the §10 round-7 result and the round-8 line;
  - the "remaining" lines.

  Backup: `%TEMP%/plan-before-b7.md`.

No app source, test or other agent's file was touched.

## 8. Second advisor call (after writing)

The advisor was available and called after all files were written. It confirmed CONTINUE and the round-8 routing. I applied these corrections after the call (script: `b-scripts/fix-r8-advice.js`):

1. **Drift attribution (§8 of the task).** LoAF `sourceURL` cannot single out the panel, because position writers run inside the `ArrangementContext.tsx` rAF `tick`. The rule is now:
   - forced layout > 1 ms in any steady app script fails the round;
   - the detail writer's p50/p95/max must stay within the round-7 writer envelope;
   - `tick` + microtasks must not regress more than 0.2 ms against A's round-7 numbers.
2. **No layout read per frame** in the detail playhead: `left` is a percentage, or the width is cached by a ResizeObserver.
3. **D-29a mount decision.** The first render is collapsed, a layout effect decides once, and that change applies without a transition. Also recorded in `plan.md`.
4. **SRW-11B dependency.** SRW-03 applies to stage 3 only. This is noted in `backlog.json` and `plan.md`.
5. **Board.** FB-01 and SRW-10 are now **ბაგია** (Low C-R7-02), consistent with the board's rule.
6. **Space on the panel toggle.** It now has a component test in R11-U1, together with the mount-without-transition test.
7. **Minor.** The SRW-08 `resolved` field was renamed to `related_pass`. Round 9's three-bug cut is marked as orientation only, so the next B re-decides it from round-8 evidence.

The decision is unchanged: **CONTINUE**.
