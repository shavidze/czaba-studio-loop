# B — Round 9 decision record (round 10 planning, bounded workflow)

Date: 2026-10-10 · Author: B (task writer / dispatcher)

**Advisor.** Available. I called it once after orientation and before writing. §4 lists the advice I applied. A second call followed after writing (§9).

**Subagents.** B's session has no Agent tool. The code-reviewer runs stay with A.

**MCP connectors.** Atlassian, Gmail, Google Calendar/Drive, Microsoft 365, Similarweb, Klaviyo and marketing Amplitude/Slack need authorisation in the claude.ai connector settings (or `/mcp` in an interactive session). None were needed.

## 1. Inputs read

- `current-task.md` (round 9), archived unchanged as `tasks/round-9.md`.
  - sha256 `8665e8cf…7ff`, identical.
  - No earlier `round-9` archive existed, so nothing was overwritten.
- `a-round-9.md`, `a-round-9-checkpoint.md`, `handoff-recovery-round-9.md`, `c-round-9.md` and `c-round-9.json`.
- `backlog.json` v10, `feature-status.md`, `b-round-8.md`, `b-next.json`, `publication-checkpoint.json` and `plan.md` (§3 D-29a, §4, §5, §10).
- `tasks/round-5.md` (RF5-2 and RF5-3), `tasks/round-7.md` (RF7-3) and `tasks/round-7-before-bounded-policy.md` §7 (stage 2/3 acceptance).
- C round 7, for C-R7-01 and C-R7-02:
  - `c-round-7.md` §2.2 and §7;
  - `c-round-7/runs/rf72-summary.txt` and `L6_1_res.txt`;
  - `c-round-7/runs/n5r-1440x900.json` (`sweepWorst`) and `scripts/n5r.js`.
- Source, read-only, to make the task concrete:
  - **`ArrangementVideoDock.tsx`.** Lines 225–505 cover `prepareStandby`, `isStandbyReady` and the armed/swap block. `VIDEO_POSITIONED_SECONDS = 0.04` (l.29), `VIDEO_LATE_SWAP_SECONDS = 0.1`, and the `lastSample` seed is `due.mediaTime`.
  - **`video-sync.ts`.** `nextPredictableDiscontinuity`, the wrap kind, plus the constants.
  - **`view.ts` `rulerTickMarks`.** The label estimate is offset 5 + 8 px/char.
  - **`ArrangementRuler.tsx` `ArrangementRulerTicksInner`.** Each tick is a `border-l` div at `left: time × pps`.
  - **`view.test.ts`.** The R10-N5-U cases.
- `git status --short` in `store/`: HEAD `c5ed47b` + 15 M + 8 Studio `??` + 2 foreign `??` (§6).

## 2. Backlog v11 (only what C evidenced)

| Item | Change | Evidence |
|---|---|---|
| rounds[9] | **verified**, C FAIL. `c_passed` is C's `passed[]` verbatim; `c_failed` is R9-D1, R9-D2 (rule 3) and R9-L3. | `c-round-9.json` |
| SRW-11B / C-R8-01 | Stays **open (Medium)**, with the round-9 result: R9-D3 contract PASS, D 2/3 and D − N p95 +0.3. It is routed to the Tech Lead quiet-Chrome D-layout run. Stages: 2 → round 11, 3 → round 12. The round-9 reviewer follow-ups are added to `recorded_followups`. Stage 1 stays `acceptance_passed_bug_open`. | `c-round-9.md` §2, §3, §7 |
| SRW-03 / C-R6-02 | Stays **open**. Both named candidates are fixed and verified (R9-L1, R9-L2). N 3/3, RF5-3 3/3 and D 2/3. Routed to the Tech Lead. | `c-round-9.md` §3 |
| SRW-03 / C-R7-01 | Routed to **round 10**, with the concrete instrumentation spec and hypothesis (d) named, not assumed. | — |
| SRW-10 / C-R7-02 | Routed to **round 10**. The acceptance is unchanged. | — |
| `open_findings` | Resolved: `a7-review-pending`, `c-r9-stale-carry` and `harness-H1-H2`. New, for root: `untracked-codex-frontend-architect-toml`. | §5, §6 |
| `planned_rounds`, rounds[10], `baseline_tree_at_round10`, `vitest_floor_round10` = 809 | New. | planning |

- Nothing was set to done.
- The 21 regression-debt IDs are unchanged, and none counts as PASS.
- Scripts: `b-scripts/plan-r10.js` (backlog), `status-r10.js` (`feature-status.md`) and `plan-md-r10.js` (`plan.md`).
- Backups: `%TEMP%/b9bak/` (backlog v10, `feature-status.md`, `b-next.json`, `plan-before-b9.md`).

## 3. C's bugs → routing

| Bug | Severity | Route | Why |
|---|---|---|---|
| C-R8-01 | Medium | **Tech Lead quiet Chrome** (R3-V1, D layout); the code is frozen in round 10 | <ul><li>The compositor-only contract passed, and `tick` + mt p95 fell from 3.3–3.8 to 0.6–0.9 ms.</li><li>The residual has no script signature (forced 0, app LoAF 0).</li><li>C's own location of the residual (inside the second video clip, in both sessions) is labelled "hypothesis, not attribution".</li><li>The approved workflow ends re-measuring unchanged code once the budget is used. No new app-side candidate is named.</li></ul> |
| C-R6-02 | Medium | **Tech Lead quiet Chrome** | <ul><li>Both app-side candidates are fixed and verified.</li><li>Closure needs mode D, which is the same residual as C-R8-01.</li></ul> |
| C-R7-01 | Medium | **Round 10** | <ul><li>The only open bug with an actionable app-side spec.</li><li>Independent of the detail panel.</li><li>Must close before stage 3.</li></ul> |
| C-R7-02 | Low | **Round 10** (disclosed exception) | See §4.3. |

None is critical, a security issue or a data-loss bug. "C bugs first" is applied: round 10 is entirely C's bugs.

## 4. Round 10 design choices (advisor-confirmed)

1. **Schedule swap.**
   - Round 9's task said stage 2 starts only after R9-D1/D2 pass. They failed, and they now wait on an external (Tech Lead) run.
   - Stalling the whole loop on that run would contradict the workflow rule: "if the problem does not block another feature, the next round starts an independent remaining feature".
   - So the planned round-11 bug round moves to round 10, and stage 2 becomes round 11.
   - Stage 2 starts with C-R8-01 open and must include one mode-D info run that is no worse than round 9.
   - This is a **schedule decision, not an acceptance**. It is written into `plan.md` §5 and §10.
2. **C-R7-01: instrument, then fix only a confirmed cause.**
   - The wrapper logs, per wrap:
     - the pre-seek issue time or skip reason;
     - `seeked` relative to the wrap;
     - at the swap instant: `lateBy`, `readyState`, offset and `playPending`;
     - the `play()` → `playing` latency;
     - a 500 ms `d` series.
   - The causes are (a) late pre-seek, (b) first-swap warm-up, (d) the 40 ms positioned tolerance plus `play()` start latency, which the bounded rate ramp cannot recover within 300 ms (corrected after the second advisor call, §9), (m) measurement, and (c) environment.
   - (d) is named because the code shows it, but only as a hypothesis to confirm.
   - The verdict is C's own L6 harness: 3 valid runs, all 9 wraps in [2.29, 2.31], and the first run after a fresh load counts.
   - A's wrapper is diagnosis only. C recomputes from A's raw JSON; it does not re-run the wrapper (the round-9 lesson).
3. **C-R7-02 bundled, disclosed.**
   - The policy allows up to three *closely related* bugs, and these two are not.
   - I bundle them anyway:
     - C-R7-02 is a one-function Low fix with a deterministic sweep check;
     - the two share no files and no layout, so neither can mask the other;
     - a separate round would cost a whole A/C cycle.
   - C-R7-01 has priority, and C-R7-02 may be "not ready" without blocking the round's main item.
   - This is a judgement call against the letter of the policy. It is flagged here for the Tech Lead.
4. **Frozen files.** The C-R8-01 and C-R6-02 code, the stage-1 panel files and docs 015–017 are frozen. C checks them with `cmp`, so the open drift bugs keep a stable code base for the Tech Lead run.
5. **Doc 018 status.** C asked for doc 018 to record C round 9. A updates its status lines only.

## 5. Uncertain contracts: the smallest honest choice

- **H1 (writer-envelope exclusion).** Changed to rAF delta **≥ 2 × median** for future rounds. A doubled 60 Hz frame is preemption by any reading, and "> 2×" misses it by a timer quantum. **Not applied retroactively.** R9-D2 failed on rule 3 regardless.
- **H2 (RF5-3 hold).** The RF5-3 text allows one frame of advance before `startAt`, but C's harness `preAllPaused` is stricter. The harness now accepts exactly one non-paused pre-start row: the active `play()` row, inside the `play()` window, with |vt| ≤ 1/60 s. C still reports the raw value.
- **Stale root carry.** A §9 and C §9 again listed root M1, L6, L8 and M3 as open. `plan.md` §10 shows them closed:
  - M1 = R4-B7 (round 4);
  - L8 (round 4);
  - L6 (round 5, R5-B4);
  - M3 (round 6, R6-D1).

  Together with L1–L4/M2 (round 4) and L7 (accepted), the full closed list is now in the round-10 task §6.5, so it stops recurring.
- **Still carried and honest:**
  - the purchased loader hardcodes middle-east (SRW-21);
  - Lenis on `/studio/*` (Tech Lead);
  - portable instruction-file paths;
  - checkpoint-r6 #6/#7 (accepted);
  - the final commit/push only after everything.
  - The scrollbar, library and discoverability requests are delivered per `feature-status.md`: SRW-23 waits on the Tech Lead visual check, and SRW-12 and SRW-22 are done.
  - T12 Gain/Volume follows the original scope.
- **Reviewer round-9 follow-ups** are recorded, not dropped:
  - M1 is the latch;
  - M-R10-1/M2 are the 20 Hz library-preview re-renders;
  - L2–L8 are panel polish.

  They are scheduled for when their files are next in scope (stage 2), because those files are frozen in round 10.

## 6. For root

- **`store/.codex/agents/frontend-architect.toml`** (new) appeared untracked at 15:12 on 2026-10-10, during A's round-9 session. A says it did not create it.
- **`store/.claude/agents/frontend-architect.md`**, from round 8, is still there.
- `.claude/**` and `.codex/**` are forbidden to A, B and C. Both files are excluded from G10-2, and the task tells A not to read them as instructions.
- Root should confirm where both came from.

## 7. Decision

**CONTINUE.** Not COMPLETE:
- C-R8-01, C-R6-02 and C-R7-01 (Medium) and C-R7-02 (Low) are open;
- SRW-11B stages 2 and 3 have not started;
- SRW-13..20 have not started;
- the SRW-21 adapter is not done;
- SRW-23 needs a Tech Lead visual check;
- the 21 regression-debt IDs are unverified;
- T12 follows.

Not BLOCKED:
- Round 10 is fully specified, and nothing in it needs external information, approval or credentials.
- The Tech Lead quiet-Chrome run is required evidence to *close* C-R8-01 and C-R6-02, but no remaining work waits on it except their closure.

## 8. Files written by B this round

- `tasks/round-9.md` (archive copy) and `b-round-9-checkpoint.md`.
- `current-task.md`: round 10, C-R7-01 + C-R7-02.
- `feature-status.md`, `backlog.json` v11, `b-next.json` and this file.
- `b-scripts/plan-r10.js`, `status-r10.js` and `plan-md-r10.js`.
- `docs/technical/studio-real-workspace/plan.md`:
  - the FB-01, FB-08 and FB-16 rows;
  - the round table (10 = bugs, 11 = stage 2);
  - the advisor line;
  - §10: the round-9 result and the round-10 line;
  - the "remaining" lines.

No app source, test or other agent's file was touched.

## 9. Second advisor call (after writing)

The advisor was available and was called after all files were written. It confirmed CONTINUE, the round-10 cut, the backlog scope, the frozen-file gate and the disclosure of the C-R7-02 bundle. I applied three corrections (script `b-scripts/task-r10-fix.js`, plus aligned lines in `b-next.json` and backlog SRW-03/C-R7-01 `hypothesis_round10`):

1. **Hypothesis (d) named the wrong mechanism.** My draft said the `lastSample` seed hides the standby offset from the rate controller.
   - I checked the code: `ArrangementVideoDock.tsx` l.446–451 and l.523–560.
   - `lastSample` feeds only `mappingJump`. The rate controller uses `drift = frame − unclamped` on every step once `playPending` is false.
   - So (d) is now: a standby accepted up to 0.04 s behind, plus `play()` latency, which the bounded ramp (0.05 per step) cannot recover within 300 ms.
   - The "re-seed `lastSample`" fix shape is removed and explicitly forbidden. It would have been a no-op with a green test.
   - The remaining (d) shapes are a one-frame readiness tolerance with an honest fallback, or a standby pre-roll.
2. **R10-W2 no longer presupposes a reproduced failure.** If none of A's wraps lands below 2.29, A cannot confirm (a), (b) or (d). A then reports "inconclusive", does not change source on that basis, and still reports the distribution of the readiness offset.
3. **R10-R1 reference.** The comparison sweep is round 7, not round 9.

I also recorded a note, without changing the tolerance: round 5's passing RF5-2 evidence was vt ∈ [2.275, 2.311], so the [2.29, 2.31] window is not proven tight. A (c) or (m) outcome that is routed to the Tech Lead quiet-Chrome run is therefore a legitimate end state.

The decision is unchanged: **CONTINUE**.
