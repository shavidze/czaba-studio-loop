# B: Round 213 → 214 planning (D-29z204 … D-29z208)

Date: 2026-10-27.
- **Advisor:** available. Used once before writing; 8 of its 9 points were applied:
  - archive and snapshots;
  - closures from C evidence;
  - the doc 167 grant (L28);
  - mandatory consults;
  - the split with a second spec file;
  - code checks before naming rows;
  - row design;
  - boilerplate;
  - RETRO 215.

  The ninth point, filing `root-deps-request.json` now, was moved to round-216 planning. The oss-adoption rule allows "one job before the task's round", and PERF-16 follows 1b-ii.
- **Advisor at the end:** 4 task-text fixes were applied to `current-task.md`:
  - the pass order, with the 30-clip block run in 1× passes only (one rule for the throttle, L4);
  - a pre-ruled fallback for the 12 min cap instead of a bare STOP;
  - one drag distance (+120 px), also used by C's probe;
  - the PERF-RUN "measured 3 times" wording.

  The feature-status line for round 212 was re-checked with grep.
- **Consults:** `performance-optimizer` (with a dev-server probe) and `tech-lead`, both read-only for the store. See §4.

## 1. Inputs read
- **Round 213 task:** `current-task.md` (round 213), archived as `tasks/round-213.md`. `cmp` shows it identical; no archive existed before.
- **Round 213 reports:**
  - `a-round-213.md`;
  - `c-round-213.md` and `c-round-213.json`;
  - `gates/gate-round-213.json`: **published** `fe556fd`. HEAD `fe556fd` is the round-214 baseline;
  - `gates/round-213/review.md` (score 9/10, no critical findings).
- **Loop state:**
  - `context/active-summary.md`;
  - `lessons.md`;
  - `backlog.json`, read by id only;
  - `regression-last.json`: round 199; next due on or after 2026-10-30;
  - `env-status.json`: store 200.
- **Root files:** `root-pre-push-review.md` and `publication-checkpoint.json`. Both are 2026-10-07 content and have no new item for this round.
- **Snapshots before editing:** `b-round-213/{backlog-before-214.json, b-next-before-214.json, feature-status-before-214.md}`.

## 2. Acceptance results used (independently evidenced by C)
- **C round 213: PASS.**
  - `browserVerified: true` and `realVerified: true`, with 0 bugs.
  - 7 rows passed, including the browser rows G213-3 and STUDIO-SMOKE-213. The gate rows were not claimed.
- **Gate 213: published `fe556fd`** (rounds 212 and 213). CP12a–d took 4.6–5.9 s in the full suite (`verify.log` l.536–539).
- **Closed (D-29z204):**
  - **SABA-B-5.** Parts 1–3 are C PASS with browser evidence and are published (`180dd2e`, `28a274c`, `fe556fd`).
  - **GATE212-B1.**
  - **PERF-FADER-c.**
  - The board shows all three as **მზადაა**.

## 3. Rulings
**Gate-213 review (D-29z205):**

| Item | Ruling |
|---|---|
| S1 | `antialiased` in doc 167 l.23. A one-word doc grant fixes it in round 214. The systemic `@source not` fix stays under C-R212-04, which needs an `app/styles` grant. |
| S2 | Doc 167 l.4 and its TODO were published stale. Granted in round 214 under L28. This is the third miss (docs 161, 162, 167) → **ROOT-L28-AMEND-MISSED**, a RETRO 215 signal. |
| S3 | Already ruled as D-29z200. Doc l.102 now cites it. |
| S4, S5 | Info signals: GATE213-S4 and GATE213-S5. |
| S6 | Low, moved to `deferred_low_polish` (GATE213-S6, now 319 entries). |
| S7 | Root signal (GATE213-S7): the gate log shows only 19 of 205 Biome warnings. |
| Architecture (a) | Merged into C-R212-04. |
| Architecture (b) | `architecture_signals` → GATE213-ARCH-B. Not scheduled. |

**PERF-1b-i findings (D-29z207):**
- **C-R212-02:** resolved by design. `load.longtasks-over-50` is already a record row, reported as the median of 3 passes (spec l.787). No change.
- **GATE211-S4:** covers the wait at l.203 only. The `waitForTimeout(2000)` at l.638 is the measurement window of `harness.hook-live` (`budgets.json` l.14) and is kept.
- **GATE206-S5:** document only, in 1b-ii. A real fix would need the frozen `vite.config.ts` and `playwright.perf.config.ts`.

## 4. Consults and re-measure (PERF dispatch rule)
**`performance-optimizer`** (dev server, React 18.3.1 dev build; output in `b-round-213/consult-perf/`):
- **All four drags re-render the whole provider on every move.** Range, fade-in, trim and move each cost about 95–103 components per move.
  - Fade, trim and move go through `previewArrangement` → `setHistory`.
  - Range goes through `setTimeRange`, which sets a new object on every move.
- **0 `start()` calls per move while playing.** The graph is rebuilt once, at commit, and that rebuild restarts every clip (29 with 30 clips).
- **Zoom:** 1 commit per key; about 95 components with 1 clip and 240 with 30 clips.
- **Recipes:**
  - Ctrl+D ×29 gives 30 clips;
  - `=` and `-` zoom;
  - the selectors by title and testid used in the task;
  - liveness on `data-range-*` (`ArrangementLane.tsx` l.1025).
- **Harness gaps it flagged:**
  - one shared budgets file breaks both specs;
  - the two specs would overwrite each other's `latest.json`;
  - per-commit sizes are bimodal, so the task uses per-move sums.

**`tech-lead`:**
- **Spec structure:** a self-contained second spec, no `perf/lib` refactor this round (→ PERF-HARNESS-SHARED-LIB), and its own budgets file, env var and results file.
- **Tooling:**
  - `typecheck` covers `perf/**`;
  - Biome does not lint `perf/`, so A runs `npx biome check perf/` by hand;
  - `test:perf` is not part of `verify`.
- **Grants:** `playwright.perf.config.ts` and `package.json` stay frozen.

**Disagreement, resolved by code.** Tech-lead thought GATE206-S6 needs a new `start()` counter. `instrumentation.ts` already records `starts` (l.37 and l.174), so S6 needs no counter. Only S3 needs an `instrumentation.ts` change.

**Time arithmetic.**
- PERF-1a takes 525 s (`a-round-212/perf-run-1.log` l.35).
- The consult estimates 5–6 min for the new spec at 3 passes × [1, 6].
- The new test is capped at ≤ 12 min. Going over is a STOP.

## 5. Decisions
- **D-29z204:** round 213 accepted. SABA-B-5, GATE212-B1 and PERF-FADER-c are closed.
- **D-29z205:** gate-213 review findings recorded. Doc 167 post-PASS grant.
- **D-29z206:** PERF-1b split into **1b-i** (round 214) and **1b-ii** (round 216). This is a split, not a deferral.
- **D-29z207:** the 1b-i design and the rulings in §3.
- **D-29z208:** the queue. 214 PERF-1b-i → 215 RETRO → 216 PERF-1b-ii.
  - At 216 planning, B rules on the doc 168 PERF candidates and files `root-deps-request.json` for mediabunny. PERF-16 comes next.
  - Regression is due on or after 2026-10-30, and takes precedence when it is due.

## 6. Round 214 summary
- **Baseline:** `fe556fd`, clean.
- **Scope:**
  - 1,054 frozen files (rc 0);
  - 5 grants: the PERF-1a spec, `instrumentation.ts`, `budgets.json`'s audio-running note, doc 163 l.67 and doc 167's post-PASS lines;
  - 3 new files: the interactions spec, its budgets file and doc 168.
- **A delivers:**
  - the `interact.*` baselines (record rows) with liveness asserts;
  - the hygiene items S3, S6 and S4;
  - mutants M1–M4;
  - doc 168 §"PERF candidates".
- **C rows:**
  - SCOPE-214;
  - **PERF-RUN-214**, **PROBE-214** (C's own production probe), **G214-3** and **STUDIO-SMOKE-214**, all in the real browser;
  - REDPROOF-214, HYGIENE-214, DOC-214 and AN-REVIEW-214;
  - the gate rows are not claimed.

## 7. Not scheduled / unchanged
- **Architecture checkpoint** (D-29z195): still pending with root, with no result file. It is non-blocking. The next feature boundary is the end of STUDIO-PERFORMANCE.
- **Accumulated risk on one owner:** this round has no app owner, so no new checkpoint request.
- **New signals:** PERF-HARNESS-SHARED-LIB and GATE213-ARCH-B, recorded only.
- **Saba questions:** unchanged, including C-R212-03 (the 6× slow-CPU budget).
- **Commit-ready:** nothing pending. Round 213 is published.

## 8. Completion check
- **Not COMPLETE.** Large scoped work remains:
  - PERF-1b-i/ii and PERF-2…16;
  - SYS-1…3 and STORE-2b…5;
  - REVIEW-RECOMMENDATIONS and T12-ADVANCED;
  - the phase-2 entries;
  - 319 deferred Lows.
- **Not BLOCKED.** Nothing external is missing.
