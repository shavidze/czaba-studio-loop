# B — Round 8 decision record (round 9 planning, bounded workflow)

Date: 2026-10-09 · Author: B (task writer / dispatcher)

**Advisor.** Available. I called it once after orientation and before writing; §4 lists the advice I applied. A second call followed after writing (§9).

**Subagents.** B's session has no Agent tool. The code-reviewer runs stay with A.

**MCP connectors.** Atlassian, Gmail, Google Calendar/Drive, Microsoft 365, Similarweb, Klaviyo and marketing Amplitude/Slack need authorisation in the claude.ai connector settings (or `/mcp` in an interactive session). None were needed.

## 1. Inputs read

- `current-task.md` (round 8), archived unchanged as `tasks/round-8.md` (sha256 identical `49aac3fa…15e3`; no earlier archive existed).
- `a-round-8.md`, `a-round-8-checkpoint.md`, `c-round-8.md`, `c-round-8.json`, `c-round-8/runs/drift-summary.txt` and `c-round-8/scripts/modeD.js`.
- `backlog.json` v9, `feature-status.md`, `b-round-7.md`, `b-next.json`, `publication-checkpoint.json`, and `root-pre-push-review.md` (M1 §).
- `c-round-4.md` R4-B7 (lines 166 and 303), to check C's carried list.
- Source, read-only, to make the task concrete:
  - `ArrangementDetailPanel.tsx`: `ArrangementDetailPlayhead` writes `left %` per frame; the waveform box is a 480-column SVG.
  - `ArrangementLibraryPreview.tsx`: `LibraryPlayheadText` uses `useArrangementPosition()`, so it renders on every frame.
  - `ArrangementContext.tsx`: `isTransportRunning` is in the value type, the value object and the memo deps. It is flipped by `markTransportRunning` in `pumpPlaybackAudio`.
  - `render-budget.test.tsx`: line 340 uses the `LibraryPlayheadText` per-frame render as a positive control, and lines 384–391 read the detail playhead's `style.left`.
- Greps: `isTransportRunning` has no reader in `app/components` and none in `__tests__`. Tailwind 4.1.18 has `contain-strict`, `contain-paint` and `will-change-*`.
- `git status`: HEAD `c5ed47b` + 14 M + 7 Studio ?? + the untracked `.claude/agents/frontend-architect.md` (§6).

## 2. Backlog v10 (only what C evidenced)

| Item | Change | Evidence |
|---|---|---|
| rounds[8] | **verified**, C FAIL on the §8.2 attribution; feature IDs and gates PASS | `c-round-8.json` |
| SRW-11B | `dispatched_stage1` → **`stage1_bug`**: `evidence_round8` lists the 7 passed stage-1 IDs; new open bug **C-R8-01** (Medium) with a follow-up spec; stage rounds 8 / 10 / 12; `recorded_followups` (design-philosopher (a)–(d), reviewer L11, N3); `contract_decisions_round8` (N1, N2) | `c-round-8.md` §2, §4, §8 |
| SRW-03 | C-R6-02 gets the round-8 N_1 evidence and routes to round 9 with closure criteria; C-R7-01 routes to round 11; `evidence_round8` | `c-round-8.md` §4 |
| SRW-10 | C-R7-02 routes to round 11, acceptance unchanged | — |
| `open_findings` | `a7-review-pending` → `partially_resolved`; new `c-r8-stale-carry` (resolved); new `untracked-frontend-architect-agent` (root) | §5, §6 |
| `baseline_tree_at_round9`, `planned_rounds`, rounds[9] | new | planning |

Stage 1 is **not** marked done. Its acceptance passed, but the round failed on its own drift attribution and C-R8-01 is against the panel itself. Nothing was set to done without C's PASS. The 21 regression-debt IDs are unchanged and still not PASS. Script: `b-scripts/plan-r9.js`. Backups: `%TEMP%/backlog-v9-before-b8.json`, `feature-status-before-b8.md`, `b-next-before-b8.json`, `plan-before-b8.md`.

## 3. C's bugs → routing

| Bug | Severity | Route | Why |
|---|---|---|---|
| C-R8-01 | Medium | **Round 9** | The panel is open by default at 1440×900, so the failing state is the normal one. Stage 2 changes the same panel and the same D-29a budget, so this is not an "independent" next feature. It closes first, as C recommended. |
| C-R6-02 | Medium | **Round 9** | Same fix class (a per-frame consumer costing more than it should) and same verification layout (the R3-V1 light harness; C's mode N is already its evidence). One run budget covers both. Its two named candidates are concrete. |
| C-R7-01 | Medium | **Round 11** (after stage 2, before stage 3) | It has a different mechanism (the standby hand-off at the wrap) and its own RF5-2 layout and instrumentation. Bundling it would make round 9 three unrelated measurement setups. Stage 3 depends on SRW-03, so it must close before stage 3. |
| C-R7-02 | Low | **Round 11** | Ruler label; unrelated to the drift mechanism. |

None is critical, a security issue or a data-loss bug. "C bugs first" is applied: round 9 is entirely C's bugs. Round 10 (stage 2) goes before the wrap bug, because stage 2 depends only on SRW-11A and C-R8-01, not on SRW-03. The previous B record explicitly left this cut to the next B, marked "orientation only".

## 4. Round 9 design choices (advisor-confirmed)

1. **Probe before the fix.** Probe S (static SVG, no line) and probe L (moving line, no SVG), as temporary local edits restored with `cmp`. This resolves C's stated ambiguity before code changes.
2. **A compositor-only DOM contract,** written into D-29a.
   - The per-frame write is only `transform: translateX(…)`. `translateX(p%)` on a full-width wrapper is recommended, because a percentage translate needs no width measurement and works in jsdom tests.
   - Plus `will-change-transform` on the line and `contain-strict`/`contain-paint` on the box.
   - Forbidden: hiding the line or waveform, changing the default-open state, or throttling the writer.
3. **Same-session attribution reference.** Rule 3 becomes D − N ≤ 0.2 ms at p50 and at p95, using the median over 3 valid runs. The absolute round-7 reference is reported for information only.
   - Rationale: in round 8 the no-panel control N itself exceeded the absolute reference on a busier machine, so that reference measured the environment.
   - **The 0.2 ms tolerance is unchanged.** Only the comparison base changed.
4. **Verifiable writer envelope.** A saves the raw per-frame JSON series of writer cost and rAF delta. Preempted frames are defined as delta > 2 × the median. C recomputes the numbers. This closes C's "blocked" item honestly: C verifies the computation, not the capture.
5. **C-R6-02 fix and grants.**
   - `LibraryPlayheadText` → writer.
   - `isTransportRunning` → out of the context value (no reader found; if A finds one, it gets a ref getter).
   - Two named exceptions to "existing assertions do not change" in `render-budget.test.tsx`: the line-340 positive control (> 0 → 0) and the detail playhead read (`left` → `translateX`).
   - Closure needs 3/3 valid PASS in D, N and RF5-3. The code alone does not close it.
6. **Review gap.** A reviews the full cumulative diff of the files it touches, which includes the round-8 Low fixes that were never re-reviewed.

## 5. Uncertain contracts: the smallest honest choice

- **N1, "the footer is one line":** this means the shortcut-hint line (the R11A-3 meaning). The footer was unchanged in round 8, and rewriting the footer would break C's test ids for no user benefit.
- **N2, collapsed `aria-valuenow`:** A's deviation is accepted. `aria-valuenow` equals the rendered height while expanded. While collapsed it keeps the stored height, with `aria-valuetext`. A value of 36 below `aria-valuemin` 120 would be invalid ARIA.
- **N3, animated restore on abort:** accepted. The spec did not forbid it, and it does not change the restored value.
- **Stale carry.** C's §9 and A's §10 list root M1/L2/L3/L4/L7 as open. They are closed by C's own evidence: M1 = R4-B7 (`c-round-4.md` lines 166 and 303), L2 = R4-B5, L3 = R4-B4, L4 = R4-B1/B2, and L7 is accepted. The round-9 task tells C to drop them.
- **Still carried and honest:**
  - the purchased loader hardcodes middle-east (SRW-21);
  - Lenis on `/studio/*` (Tech Lead);
  - portable instruction-file paths;
  - checkpoint-r6 #6/#7 (accepted);
  - the final commit/push only after everything.
  - The scrollbar, library and discoverability user requests are delivered per `feature-status.md` (SRW-23 waits on the Tech Lead visual check; SRW-12 and SRW-22 are done).

## 6. For root

- **`store/.claude/agents/frontend-architect.md`** appeared untracked at 19:43:40 during C's session. Neither A nor C created it, and `.claude/**` is forbidden to A, B and C.
  - Root should confirm its origin.
  - The round-9 task tells A not to read it as an instruction, edit it or delete it, and excludes it from G9-2.

## 7. Decision

**CONTINUE.** Not COMPLETE:
- SRW-11B has an open Medium (C-R8-01), and stages 2 and 3 have not started;
- SRW-03 and SRW-05 have open Mediums (C-R6-02, C-R7-01);
- SRW-10 has a Low (C-R7-02) and needs the manual check;
- SRW-13..20 have not started;
- the SRW-21 adapter is not done;
- SRW-23 needs a Tech Lead visual check;
- the 21 regression-debt IDs are unverified;
- T12 follows.

Not BLOCKED: nothing needs external information, approval or credentials, and round 9 is fully specified.

## 8. Files written by B this round

- `tasks/round-8.md` (archive copy) and `b-round-8-checkpoint.md`.
- `current-task.md`: round 9, C-R8-01 + C-R6-02.
- `feature-status.md`, `backlog.json` v10, `b-next.json` and this file.
- `b-scripts/plan-r9.js`: the backlog update.
- `docs/technical/studio-real-workspace/plan.md`:
  - D-29a: the compositor-only playhead clause and the N1/N2 contract wording;
  - the FB-08 row;
  - the round table (9 bugs; 10 stage 2; 11 bugs; 12 stage 3; later rounds renumbered 13–20 as orientation);
  - the advisor line;
  - §10: the round-8 result and the round-9 line;
  - the "remaining" lines.

No app source, test or other agent's file was touched.

## 9. Second advisor call (after writing)

The advisor was available and was called after all files were written. It confirmed CONTINUE and the round-9 cut. One correction was applied to `current-task.md` (§4 R9-L2 and §5):
- **R9-L2 could pass vacuously.** The RF7-P2 pattern clears render counts after `waitReal(300)`, which is after the ~260 ms hold release, so it cannot observe the `isTransportRunning` flip.
  - The new test clears the counts before the release, asserts that the release happened and that the context value keeps the same reference, then expects 0 consumer renders over 30 frames.
  - A second guard proof was added: `isTransportRunning` is put back temporarily, and the test must fail.
  - `markTransportRunning` must keep updating `transportRunningRef`.

The decision is unchanged: **CONTINUE**.
