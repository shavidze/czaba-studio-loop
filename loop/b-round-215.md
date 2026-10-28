# B: Round 215 → 216 planning (D-29z213 … D-29z217)

Date: 2026-10-28.
- **Advisor:** available. Used once before writing, after orientation. It flagged the deps-request vs frozen-list trap, the memory API question, the export fixture size, the L28 ruling for the new doc and the bookkeeping fix; all were addressed. It was called again before handover and flagged six points, all applied:
  - the RT-FIX row now lists the `lessons.md` l.3 header edit;
  - one explicit rule says which rows carry `.6x`, liveness included;
  - the ruler render branch was verified (`StudioWorkspace.tsx:2435`, no early return);
  - `retro_runs[1].status` was updated;
  - STUDIO-SMOKE-216 has a pre-ruling for 1280;
  - this note.
- **Consults (read-only):**
  - `tech-lead`: the spec layout, the doc 168 candidate mapping and the L28 ruling;
  - `performance-optimizer`: a production-build probe in a `/tmp` scratch copy; store untouched. Data in `b-round-215/consult-perf/`.

## 1. Inputs read
- `tasks/round-215.md`. Archived from `current-task.md` before the overwrite; `cmp` identical.
- Round-215 reports:
  - `a-round-215.md` (no change; L28/L32 feedback);
  - `c-round-215.md` and `c-round-215.json` (FAIL RT-NUM; 7 PASS; `browserVerified` and `realVerified` true);
  - `gates/gate-round-215.json`: **skipped** (C FAIL). The baseline therefore stays `eb9e76e` (gate 214).
- Loop state:
  - `context/active-summary.md`;
  - `lessons.md`;
  - `backlog.json` (by id, via scripts);
  - `regression-last.json`: round 199; due on or after 2026-10-30, so not due today.
- Snapshots before editing, in `b-round-215/`:
  - `backlog-before-216.json`, `b-next-before-216.json`, `feature-status-before-216.md`, `lessons-before-216.md`, `retro-215-before-216.md`;
  - `regression-last.json`;
  - `git-status-at-planning.txt` (empty, HEAD `eb9e76e`).

## 2. Acceptance results used and rulings
- **C round 215: FAIL on RT-NUM only.** C-R215-01 (Low) is real: `gates/round-200/`, `round-201/` and `round-202/` do not exist, and 10 `review.md` files exist in 200–214. Every other number reproduced byte for byte (C's copies of B's scripts).
- **D-29z213 (RT-FIX).** Changes to `retros/retro-215.md`; diff in `b-round-215/retro-215-rtfix.diff`:
  - l.53: 11 → 10 reviews, and the rounds without one are now 200, 201, 202, 209 and 212;
  - l.70: C's note (a): the class label was "ambiguous task text". It now says no listed class fits (a B analysis error in the retro text);
  - l.32 and l.75: C's note on the citation range, l.38–42 → l.38–41;
  - no number other than l.53's count changed.
- **D-29z214 (C-R215-02, L28).**
  - Keep the exact string `Completed (C round N PASS)`. It is defined as the post-PASS value, true only at HEAD; `c-round-N.json` stays the source of truth.
  - On a re-dispatch as N+1, l.4 is granted implicitly, for rewriting N only. This answers A's question.
  - Root request `b-round-215-root-request-l28.md`: a gate-side substitution of `Pending (C round N)` → `Completed (C round N PASS)`, with a gate failure on any leftover `Pending (`. L28 switches only after root confirms.
  - Why not the placeholder now: the 8 stale findings came from a manual amend. Without the script, a placeholder would bring that class back (tech-lead).
- **L32** (A's feedback): when a gate `verify.log` exists, report A's time and the last gate time; the higher one decides. The citation was also fixed to l.38–41.
  - `lessons.md` changed in three places: the l.3 header note ("round-216 planning: L28 and L32 amended per A/C feedback, D-29z214"), L28 and L32. It stays at 47 lines.
  - Diff: `diff b-round-215/lessons-before-216.md lessons.md`.
- **Bookkeeping (C needsBRuling):** `rounds[]` 211 → `c_pass_published` (28a274c); 212 → `c_pass_gate_failed_published_with_213` (fe556fd). Closed as C-R215-BOOKKEEPING-ROUNDS.
- **Doc 168 PERF candidates (D-29z215),** per the tech-lead mapping:

  | Candidate | Ruling |
  |---|---|
  | range drag | PERF-8, re-baselined to 101.283 per move |
  | clip click, play/pause | PERF-10 |
  | zoom key, 1 clip | PERF-3, plus a Ctrl+wheel baseline row |
  | zoom, 30 clips | PERF-14 |
  | fade/trim/move preview | new **PERF-DRAG-PREVIEW**, after PERF-8 |
  | release restart of every clip | new **PERF-COMMIT-RESCHEDULE**, after PERF-3. Audibility is a hypothesis; the stage measures it first, along with trim and move at 30 clips |
  | PERF-HARNESS-SHARED-LIB | 3rd copy now → a queued test-only stage after OSS-LIC |

  The order is in `backlog.json` → STUDIO-PERFORMANCE `execution_order_d29z215`.
- **D-29z216: deps request deferred.**
  - The request is not filed now. `cloud/run.sh` would commit `chore(deps)` at the next job start, which would move HEAD and change `package.json` and `package-lock.json` under the frozen list.
  - Round 216 does not use the packages, and `oss-adoption.md` allows filing "in the same planning step as the dispatch".
  - This deviates from D-29z212, as recorded here.

## 3. Consults and probe (summary)
- **tech-lead:**
  - Use a third self-contained spec, with the minimum helper set; both reference specs stay byte-identical.
  - GATE206-S5 is a doc note only (the config is frozen).
  - The candidate mapping is above, and so is the L28 answer.
- **performance-optimizer probe** (Chromium 143, production build in `/tmp/b216-probe`, port 5197): the full table is in `current-task.md` §1. Key facts:
  - the demo clip is 101.352 s, so 04:11 / 7 clips cannot be rebuilt, and 2 clips (03:22.7) is closest;
  - WAV output is 24-bit;
  - at 1× the export has 0 long tasks over 50 ms, while 6× shows 117 / 193 ms;
  - `backingStorageSize` reproduces the plan's 140 MB at ready and the +161 MB export peak (linear, 0.641 MiB/s);
  - RSS is noisy and `performance.memory` is fixed;
  - 17 elements per clip, plus about 202 ruler elements per added 101 s clip;
  - `/studio-lab` script bytes are 339,306 B body and 355,155 B `encodedDataLength`.
- **Python check of the ceil artifact:**
  - `3*101.352*48000` = 14594688.000000002 → `Math.ceil` = 14594689, and 44 + 6 × 14594689 = 87,568,178 B, which equals the probe's 3-clip download.
  - Recorded as **B-R215-EXPORT-CEIL-FRAME** (Low, `deferred_low_polish`, owner PERF-12). The cause is an inference from `graph.client.ts`; C has not verified it.

## 4. Round 216 summary (D-29z217)
- **Baseline:** HEAD `eb9e76e`, clean.
- **Frozen:** 1,058 files (`b-round-215-r216-tree-sha256.txt`, rc 0).
- **Grants:** 4 docs, l.4 only (SYS-4). Start copies are in `b-round-215/r216-granted-start/`.
- **New files:**
  - `perf/studio-lab-resources.perf.spec.ts`;
  - `perf/budgets.resources.json`;
  - `docs/implementation/2026/quarter-IV/169-perf-resources-baseline.md`.
- **A:** the `res.*` baselines (3 passes at 1×, plus 3 passes at 6× for the exports only; ≤ 8 min, with a pre-ruled fallback), the WAV header liveness, the leak row, JS bytes for three routes, doc 169 (GATE206-S5 section and findings for PERF-11/12/13/14), and the four SYS-4 lines. Four named mutants. Required code-reviewer.
- **C rows:** SCOPE-216, RT-FIX-216, PERF-RUN-216, PROBE-216, REDPROOF-216, DOC-216, AN-REVIEW-216, G216-3 and STUDIO-SMOKE-216 (a real WAV export with a header and non-silence check).
- **Lessons applied:**
  - L29: the ruler `data-testid` render branch;
  - L30: no Biome on `perf/`;
  - L31: perf specs are not in `verify`, and the new spec has its own 15 min timeout;
  - L34: the doc section is new, and no existing harness file changes.

## 5. Queue
1. 216 PERF-1b-ii + SYS-4 + RT-FIX.
2. 217 REGRESSION (expected; due 2026-10-30).
3. PERF-16, with `root-deps-request.json` filed at its planning.
4. OSS-LIC.
5. PERF-HARNESS-SHARED-LIB.
6. PERF-2.
7. PERF-3.
8. PERF-COMMIT-RESCHEDULE.
9. PERF-4, PERF-5, PERF-7.
10. PERF-8.
11. PERF-DRAG-PREVIEW.
12. PERF-9 … PERF-15.
13. SYS-1…3.
14. STORE-2b…5.
15. REVIEW-RECOMMENDATIONS.
16. T12-ADVANCED.
17. The phase-2 entries (PHASE2-VIDEO-SCORING awaits the user's go-ahead; the skip rule applies).

## 6. Not scheduled / unchanged
- **Architecture checkpoint** (D-29z195): pending with root and non-blocking. This round adds no app owner risk.
- **Signals:** GATE213-ARCH-B, and the `useDialogFocus` group (with STORE-2b).
- **For Saba (unchanged):** the `biome.json` `perf/**` scope, and the retro-200 proposals.
- **Commit-ready:** nothing new from `store/`. Round 215 changed no source; the loop state commit records the retro fix.

## 7. Completion check
- **Not COMPLETE.** Remaining scoped work: PERF-1b-ii, PERF-16, OSS-LIC, PERF-HARNESS-SHARED-LIB, PERF-2…15 plus the two new stages, SYS-1…4, STORE-2b…5, REVIEW-RECOMMENDATIONS, T12-ADVANCED, the phase-2 entries and 314 open deferred Lows. Final acceptance also needs all of them fixed and C-verified.
- **Not BLOCKED.** Nothing external is missing for round 216.
