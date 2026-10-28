# B round 224 → 225 planning (2026-10-28)

**Decision: CONTINUE.** Round 225 = the **PERF-HARNESS-SHARED-LIB-b-i fix-up** (test-only). It closes 3 findings in the same 3 files. Decisions D-29z259…D-29z265. After it: **SABA-B-8 CALM-1…3** (rounds 226–228), then PERF-HARNESS-SHARED-LIB-b-ii.

## 1. Inputs read
- `context/active-summary.md` (head), `lessons.md`, `current-task.md`. It is archived as `tasks/round-224.md`; `cmp` OK, nothing deleted.
- `a-round-224.md`, `c-round-224.md`, `c-round-224.json`.
- `gates/gate-round-224.json`: **published**. Commit `bbaea50` is on both remotes, so it is **the next baseline**. Store HEAD = `bbaea50`, and the tree is clean (`b-round-224/git-status-at-planning.txt` is empty).
- `env-status.json` (round 224, store 200). `regression-last.json` (round 199, 2026-10-27), so REGRESSION is due on or after 2026-10-30, not now.
- `docs/technical/studio-real-workspace/calm-studio-review.md` (SABA-B-8).
- Backlog lookups by ID only.
- Source, read-only:
  - `perf/lib/determinism.ts` and `perf/lib/report.ts` (l.55–178);
  - `perf/lib/report.test.ts` (ids and MiB cases);
  - the commit windows in both specs;
  - `perf/budgets*.json` (kinds and units);
  - `vitest.config.ts`;
  - the doc 176 / 168 / 163 headings.
- `b-round-221..224-prompt.txt`, grepped for SABA-B-8. Only the round-225 planning prompt (`b-round-224-prompt.txt`) contains it.

## 2. Backlog: updated only from independent evidence
**Round 224: C PASS.** 11 rows passed; `browserVerified` and `realVerified` are true. Gate 224 published `bbaea50`.
- **PERF-HARNESS-SHARED-LIB-b-i → `c_pass_published`, with a fix-up.** It is not "done" while 2 Mediums are open against it.
- **Closed, each by a named C row:**
  - GATE214-S4 (S4-224) moves to `closed_findings_d29z163`;
  - PERF-LONGTASKS-DETERMINISTIC-MISCLASS (BUDGETS-DIFF-224);
  - GATE223-S1-DOC175-CLAIM (AN-REVIEW-224);
  - GATE223-S4-ROWRATE-PIN (UNIT-224 DC-RATE);
  - the round-214 code-review M2 (ratio rows could not fail). UNIT-224 killed CM-2, CM-6 and CM-7.
- **New findings:**
  - **C-R224-01** (Medium);
  - **A-R224-REVIEW-TENTHS-NAN** (Medium, B's assessment, D-29z260);
  - **C-R224-02** (Low, fixed now);
  - **PERF-REPORT-TEST-INCLUDE** (Low, root-dependent; added to `deferred_low_polish`);
  - watch item **R224-WINDOW-BOUNDARY-WATCH**;
  - signal **ARCH-A224-DETERMINISM-SPLIT-KEEP**. This is A's reviewer's Architecture note ("keep"). It is not scheduled.
- **Updated:**
  - PERF-1A-TIMEOUT-HEADROOM: C measured 8.0 min, which is 53 % of 15 min and above the 50 % rule. It goes to b-ii.
  - C-R223-OBS-01 recurred.
- `deferred_low_polish`: 349 → **349** (−GATE214-S4, +PERF-REPORT-TEST-INCLUDE).

## 3. Rulings
- **C-R224-01 (D-29z259, the pre-fixed outcome `tasks/round-224.md` §8 row 5):**
  - **The ruling:** the 16 PERF-1b-i drag `commits-per-move` rows count commits inside a timestamp window, and they become `wallclock` (record, no budget). The 24 PERF-1a fader rows count the whole gesture and stay exact.
  - **The evidence:**
    - C's loaded run gave 60/59/60, with `componentsSum` 5782 ×3 and `release-commits` [1, 1, 1].
    - B's replay of 25 reports (rounds 210–224) found 1 varying observation in 185 rows (`b-round-224/commit-count-replay.txt`).
    - performance-optimizer agrees.
  - **Hypothesis, not confirmed:** the mechanism (start boundary or a no-render commit). The release-boundary explanation is ruled out by `release-commits` staying 1.
- **TENTHS-NAN (D-29z260):** Medium. The contract fails open, and its purpose is to fail closed. The fix is a non-finite guard with its own text.
- **C-R224-02 (D-29z261):** fixed now, as DC-MIB-EDGE. The round owns the file.
- **Pre-check (L23):** B applied both code/data changes on a scratch copy (`/tmp/b225`, scripts in `b-round-224/replay/`). The 16 existing tests stay green. C's round-224 reports give 0 failures, **the contaminated report gives 0 failures**, and the NaN injection gives exactly 1 failure. `equiv-check-b2.py` controls: rc 0 on the planned reports, and rc 1 on the unflipped report, on a median shift and on a note change (`b-round-224/ctl/controls.log`).

## 4. Why this round, then Calm Studio (D-29z262)
- **Round 225 comes first** for three reasons:
  - §8 row 5 was pre-fixed;
  - the 2026-10-23 bug gate fixes open Mediums before new scope;
  - the work is ≤ 3 related findings in the same files.
- **SABA-B-8** says "right after round 222, before the next PERF task". The policy first reached B in this planning (it is absent from the round-221…223 planning prompts), so rounds 223–224 were not a slip.
  - It is recorded as queue entry `SABA-B-8-CALM-STUDIO`, placed **before** STUDIO-PERFORMANCE. That entry holds Saba's 4 decisions, the rules, and stages CALM-1/2/3.
  - b-ii (a PERF task) now waits for CALM-1…3.
  - DUX-R-2 is marked "superseded by CALM-1" and closes when CALM-1 passes.
- **The CALM-1 "Why we missed it" section and its lesson** are owed at the round-226 planning (D-29z265). feature-status has a placeholder row.
- **REGRESSION still takes precedence when due** (on or after 2026-10-30). **RETRO** comes at round 230, and it includes the new whole-screen review.

## 5. 2026-10-28 policy blocks recorded (D-29z265)
- `workflow_policy.saba_issue_root_cause_2026_10_28`
- `workflow_policy.screen_budget_2026_10_28`
- `retro_policy.whole_screen_review_2026_10_28`, `retro_policy.next_due_d29z262`

## 6. Lessons (D-29z263)
- **L37 (B):** event counts inside a time window are wallclock until a loaded replicate shows otherwise. C-R224-01 was a gap in B's own contract design.
- **L38 (C/A):** perf runs alone. An overlapped attempt is environment-invalid.

`lessons.md` grows from 49 to 52 lines (limit 60).

## 7. Consults
- **performance-optimizer:** adopted. Its point is summarised in §3.
- **Advisor (before writing):** adopted:
  - the round order;
  - evidence by replay;
  - B owns the TENTHS-NAN severity;
  - a boundary DC id;
  - the oracle is `c-round-224/reports`;
  - record SABA-B-8 and the policy blocks;
  - b-i stays `c_pass` with a fix-up;
  - the lesson.
- **tech-lead:** not consulted. The fix is a 3-line guard and a data reclass, with no structural choice.
- **ableton-arrangement-expert / docs-explorer:** not consulted. The round is test-only, so "Reference first" is excluded.

## 8. Architecture checkpoint
No new request. These stay pending with root, all non-blocking:
- `b-round-221-checkpoint-request.md`;
- D-29z195;
- `b-round-203/205-checkpoint-request.md`.

**CALM-1…3 is a feature boundary on `StudioWorkspace.tsx`.** Its prior signal ARCH-CHECKPOINT-SRW13 is still open. B will decide at the CALM-1 planning whether to request a bounded frontend-architect checkpoint. It must not delay CALM-1.

## 9. For Saba (`awaiting_user`, unchanged)
- GATE220-S3 / GATE221-S2;
- SABA-Q-FFMPEG-FILENAME, SABA-Q-LAME-LGPL;
- the retro-200/215 proposals, including `biome.json` for `perf/**`.

## 10. Files written by B
- **Task files:**
  - `tasks/round-224.md` (a copy);
  - `current-task.md` (round 225);
  - `b-round-224-r225-{tree-sha256 (1,072; rc 0), grants (5), new-files (empty), root-or-granted (4), granted-start-sha256, root-files-start-sha256}.txt`.
- **`b-round-224/`:**
  - backups: `backlog-before.json`, `feature-status-before.md`, `b-next-before.json`, `current-task-before.md`, `lessons-before.md` and `regression-last-before.json`;
  - `git-status-at-planning.txt`;
  - `commit-count-replay.txt`;
  - `scripts/{commit-count-replay,equiv-check-b2}.py`;
  - `replay/` (scratch replay test, config and results). The test file hardcodes `/tmp/b225`, which does not survive the job, so it is a pattern and cannot be rerun as is. The result JSONs are the durable evidence;
  - `ctl/`;
  - `backlog-update.py`.
- **Updated:**
  - `backlog.json` v210;
  - `feature-status.md`;
  - `lessons.md`;
  - `b-next.json`.

Unchanged:
- `regression-last.json`, because REGRESSION is not due;
- `context/*`, which is root-generated.

App source was not touched. The store `git status` is clean.

## 11. Status
**CONTINUE.** Round 225 is dispatched.

**Commit readiness:** round 224 is published. Round 225 becomes commit-ready after C PASS and the root gate.
