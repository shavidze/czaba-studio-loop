# B — round 260 → 261 planning

**Date:** 2026-10-30. **Role:** B (planning artifacts only; no app source touched). **Decisions:** D-29z524…D-29z529. **Advisor:** available and used once before writing (the scope-conflict resolution and the order of work).

## 1. Inputs read
- `tasks/round-260.md` (round-260 task, archived in this step as an exact copy of the old `current-task.md`; the before-copy is also in `b-round-260/current-task-before-261.md`).
- `a-round-260.md`: no change, baseline checks OK, plus one piece of lesson feedback on L11.
- `c-round-260.md` / `c-round-260.json`: **FAIL** on RT-LESSONS only. 8 rows PASS. `browserVerified` and `realVerified` are true. Bugs: C-R260-01 Low, C-R260-02 Low. 4 info items.
- `gates/gate-round-260.json`: `skipped` (C FAIL). The baseline stays `7a960c1` (gate 259, published). HEAD at planning is `7a960c1`, and the tree is clean (`b-round-260/head-at-planning.txt`, `git-status-at-planning.txt` 0 bytes).
- `regression-last.json`: round 258, 2026-10-30. The next regression is due on or after 2026-11-02, so it is **not due**.

## 2. Backlog updates (only from C's evidence)
- **Round 260:** `c_fail_rt_lessons_low`. No product row failed, and nothing is promoted to მზადაა.
- **C-R260-01 / C-R260-02** → `open_findings` with status `fixed_in_planning_awaiting_c`. They are loop-artifact Lows (lessons and retro text), not app polish, so they do not go to `deferred_low_polish`. They close only when RT-FIX-261 passes.
- `retro_runs` 260: `done_pending_rt_fix_261`.
- `systemic_tasks` PERF-HARNESS-STRINGS-DRIFT: dispatched for round 261, with the scope ruling.
- New `architecture_signals` entry **SIG-R261-INLINE-LABELS**: a signal, not scheduled.
- Script: `b-round-260/update-backlog.py`. Before-copies: `b-round-260/backlog-before-261.json`, `feature-status-before-261.md`, `lessons-before-261.md`, `retro-260-before-261.md`, `b-next-before-261.json`.

## 3. Corrections (D-29z524), re-checked by RT-FIX-261
- **`lessons.md` l.18 (L29)**, C-R260-01. Inside the claim types:
  - "and the task's state must satisfy that branch" is restored after "the render branch of every named liveness or acceptance signal";
  - "when a command's source changes (position, unit, target), every readout that names the old source is a consumer (acceptance) row;" is restored before "grep the old word".
  - Nothing else changed. The file is still 59 lines.
- **`retros/retro-260.md` l.121**, C-R260-02. B-R239 → L49 now reads "at the round-240 planning". Only B-R237 → L51 is credited to retro 245.
- **`retros/retro-260.md` l.93**, C info. The SABA-B grep claim now rests on `backlog.json` (0) and `policy.local.md` (highest id SABA-B-11). The sentence notes that `agent-workflow.md` has no SABA-B ids, so its 0 proves nothing.

## 4. Ruling on A's L11 feedback (D-29z526)
A asked whether a conflict that one change can satisfy is still a STOP. Ruling:
- A STOP is required for two clauses that cannot both be met by one change, or for a clause that forces a removed accessible state or a regression against HEAD.
- If one change meets both clauses, A applies it and quotes both clauses at the top of `a-round-N.md` under "Spec tension (B to confirm)". C rows it.
- The L11 line is not edited now: this keeps RT-FIX-261 to the lines C named. The wording is a candidate for RETRO 275.
- Rationale: A's narrower wording is the smallest honest reading of "two task clauses disagree". The "Spec tension" header keeps the 252/256 failure mode visible to C instead of hiding it in a report body.

## 5. Round 261 decision (D-29z525, D-29z527, D-29z528)
- **Task:** PERF-HARNESS-STRINGS-DRIFT + RT-FIX-261, as fixed in advance by task 260 §4.
- **Scope conflict found while planning:** the systemic entry asked for "every label from `strings.ts`, grep 0" in `perf/**` only. The source shows 6 of the labels the harness uses exist only inline in components:
  - `ArrangementDetailPanel` l.429;
  - `ArrangementLane` l.797 and l.832;
  - `ArrangementMaster` l.208;
  - `ArrangementTransport` l.153 and l.397.
- **Smallest honest behaviour:** keep `perf/**` only.
  - 11 keys are imported.
  - The 6 inline labels go into one perf-local allowlist with source file + needle, and the limit is stated: they are not drift-protected.
  - Fixture data (track names, "Soft impact") stays perf-local, because `app/data/studio-lab-demo.ts` uses the `~` alias.
- **Why not widen to `app/**`:**
  - the owner area is test-only;
  - SABA-B-9 stage 2 owns Master and Transport next;
  - an app round would need browser and reference rows.
- The move is signal SIG-R261-INLINE-LABELS, to reconsider at SABA-B-9 stage 2.
- **Mutant proof** must show a tsc error located in `perf/`. Renaming a key also breaks app components, so "tsc red" alone is no proof.
- **browserVerified** = the isolated real-Chromium `test:perf` run plus the G261-AUTH guard. No UI changes, so there are no screen-budget or Ableton rows (test-only round, policy "Not in scope").
- **Frozen:** 1,114 entries (`b-round-260-r261-tree-sha256.txt`; all tracked files minus the 4 grants), rc 0 at planning, and each protected file once. Grants: 4 perf files. New files: `perf/lib/app-labels.ts` and doc 195 (`b-round-260-r261-grants.txt`, `-new-files.txt`).
- All `store/` facts in the task carry `[K1]`…`[K8]`. B re-ran every command at `7a960c1` before handing over. The L29 regex over the task found no untagged store fact; the hits are instructions, loop artifacts or tagged rows.

## 6. Queue (D-29z529), unchanged order
- Round 262 = SABA-B-9 stage 2. If the planning is on or after 2026-11-02, round 262 is REGRESSION first.
- Then L46-CONTRACT-CHECKS, SABA-B-11c (`ableton-arrangement-expert` consult first) and SYS-6.
- SABA-B-7 when Saba answers `AGREE-SABA-B-7.md`; SYS-5; STUDIO-PERFORMANCE b-ii; STORE-REDESIGN 2b–5 (direction gate); REVIEW-RECOMMENDATIONS; T12-ADVANCED; the phase-2 entries (PHASE2-VIDEO-SCORING gated on the user's go-ahead) and the deferred Lows before final acceptance.

## 7. Architecture checkpoint
No new request. This round is test-only with one owner. The pending requests (`b-round-211` … `-253`) stay with root. SIG-R261-INLINE-LABELS is a backlog signal only.

## 8. Commit readiness
- Round 260: nothing to publish from `store/`. The loop-state commit carries the retro, the lessons, the screen review and these corrections.
- Round 261 is commit-ready only after C PASS and the root gate.

## 9. Decision
**CONTINUE.**
- Not COMPLETE: scoped features remain (§6).
- Not BLOCKED: runnable work exists, and no credentials or approval are missing for round 261.
