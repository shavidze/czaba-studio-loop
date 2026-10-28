# B round 223 → 224 planning (2026-10-28)

**Decision: CONTINUE.** Round 224 = **PERF-HARNESS-SHARED-LIB-b-i** (test-only). Decisions D-29z251…D-29z258.

## 1. Inputs read
- `context/active-summary.md` (head), `lessons.md`, `tasks/round-223.md` (archived copy of `current-task.md`; `cmp` OK, nothing deleted).
- `a-round-223.md`, `c-round-223.md`, `c-round-223.json`.
- `gates/gate-round-223.json`: **published**. Commit `e140ab4796d1…` is on both remotes, so **the next baseline is that commit**. The store tree is clean (`b-round-223/git-status-at-planning.txt` is empty).
- `gates/round-223/review.md` (COMMIT OK, 9/10), `gates/round-223/verify.log` (203 files, 2,958 tests), `env-status.json` (round 223, store 200), `regression-last.json` (2026-10-27 / round 199, so due on or after 2026-10-30).
- Backlog lookups by ID: PERF-HARNESS-SHARED-LIB(-b), GATE214-S1..S5, GATE217-S1/S2, R216-MEM-POLLS-HEADROOM, PERF-1A-TIMEOUT-HEADROOM, A-R214 M2, DOC-PERF-LINEREF-DRIFT-223.
- Source:
  - `perf/lib/{report,stats,budgets,page}.ts`;
  - the 3 specs at the determinism sets, `measureZoom` and `emptyLanePoint`;
  - `perf/budgets*.json`;
  - `vitest.config.ts` and `playwright.perf.config.ts`;
  - `app/lib/arrangement/view.ts` l.1–8 and l.245–256;
  - `app/routes/studio-lab.tsx` l.18–21;
  - the headings of docs 163, 168, 169 and 175.

## 2. Backlog: updated only from independent evidence
**Round 223: C PASS.** 13 rows passed; `browserVerified` and `realVerified` are true. Gate 223 published `e140ab4`.
- **PERF-HARNESS-SHARED-LIB → done.** GATE214-S3, GATE214-S5, GATE217-S1 and GATE217-S2 are closed (C `passed`), and they move to `closed_findings_d29z163`.
- **GATE214-S2 is not closed.** C put it in `notPassed`.
  - **L10 ruling (D-29z254):** the premise was my error in the round-223 §3: the Add clip lands on `music`, which has no empty right-half point.
  - A's revert to HEAD is accepted. It is not an A defect.
  - Re-scoped to "the first lane **after** the clip's lane in DOM order with an empty point" (`stems` in the fixture). A scan from the top would hit `video`.
  - Scheduled in b-ii.
- **C-R223-OBS-01** (info, a cold dev-server hook error, not reproduced): attached to VITE-EXCLUDE-STALE / `b-round-220-root-request-vite.md`.
- **The `load.longtasks-over-50` variance** (C observation) became PERF-LONGTASKS-DETERMINISTIC-MISCLASS. It is reclassified in round 224 (D-29z257).
- **DOC-PERF-LINEREF-DRIFT-223** is confirmed (doc 168 l.216 → doc 163 l.73). It stays deferred.
- **Gate-223 review (D-29z258):**
  - S1 (doc 175 claim) is fixed in round 224 through a doc 175 grant;
  - S2 (observer before `try`) becomes GATE223-S2 in b-ii;
  - S3 = DRIFT;
  - S4 becomes the DC-RATE test case;
  - S5 is info;
  - the Architecture note becomes signal ARCH-GATE223-REPORT-POLICY-RECORD. Not scheduled.
- **A's reviewer Low** (1a `[data-clip-kind="audio"]` literal) becomes A-R223-REVIEW-L3, deferred.
- `deferred_low_polish`: 351 → **349**.
- **No Critical, High or Medium finding is open.** The open_tech_lead items stay on the Tech Lead list.

## 3. Why this round
- **The outcome was fixed in advance** (`tasks/round-223.md` §8, row 1): PASS, and planning on 2026-10-28 is before 2026-10-30. REGRESSION is not due yet. RETRO comes at round 230 or at the end of STUDIO-PERFORMANCE.
- **Split by meaning (D-29z252), not a scope cut.** Stage b as queued held the tolerance redesign, S1, S4, R216, the S2 reroute, GATE223-S2 and the unit test. The two halves need different proofs:
  - **b-i (semantics)** keeps every window, so its proof is "every compared median is equal to C's round-223 reports, and the new checks turn red on named mutants";
  - **b-ii (windows)** must re-baseline.

  Mixing them would leave no oracle for either half. Both consults agree.
- **B's own replay (L1, inventory before grants):** `b-round-223/scripts/replay.py` ran over 13 complete reports from rounds 222–223.
  - **The result:** one deterministic row varies within a run, `load.longtasks-over-50`.
  - **Every ratio numerator and denominator** is stable within each run.
  - **Inventory** of every deterministic metric/unit class: `b-round-223/det-metric-inventory.txt`. It maps fully onto the contract.
  - **Oracle for EQUIV-224:** `c-round-223/reports/*`, checked with the new `b-round-223/scripts/equiv-check-b1.py`.
  - **Controls** (`b-round-223/ctl/controls.log`): rc 0 on the planned changes; rc 1 on an injected median shift and on an unplanned note change.

## 4. Root request
`b-round-223-root-request-vitest.md` (D-29z253): add `'perf/**/*.test.ts'` to the vitest `include`. It is non-blocking. Task §0.3 gives one 3-case rule:
- a grant file;
- a root commit;
- otherwise a scratch config, and the Low PERF-REPORT-TEST-INCLUDE is opened.

The tech lead also noted that `biome.json` excludes `perf/`. That is the existing Saba proposal from retro-215 §9, unchanged.

## 5. Consults
- **tech-lead:**
  - the contract in code, keyed by metric, then by unit;
  - fail-closed;
  - no JSON key;
  - remove the dead `tolerancePct`;
  - drop the per-spec sets;
  - keep cross-rate separate;
  - a root request for the include;
  - the test must not import `page.ts`;
  - replay first.

  Adopted.
- **performance-optimizer:**
  - the 6× fade 59/60 is stable, so no ratio metric is cross-checked;
  - denominators identical and numerators exact;
  - MiB 0.1;
  - reclassify the two longtasks rows, and keep `play.idle-longtasks-over-50` deterministic;
  - S4: the exact compare is right; add symmetry and no-clamp guards;
  - the mutant list.

  Adopted. **Dissent not adopted:** JSON fields `toleranceAbs` and `ratioOf`. B chose the tech lead's code-side contract, which keeps the budget and report key order byte-stable and keeps the equivalence oracle valid (D-29z256).
- **Advisor (before writing):** adopted:
  - the bookkeeping;
  - an explicit GATE214-S2 ruling;
  - closing the contract gaps (absolute vs percentage, missing 1a ratio details, longtasks);
  - named mutants;
  - the 3-case vitest rule;
  - the proof shape;
  - the split.
- **ableton-arrangement-expert / docs-explorer:** not consulted. There is no user-facing behaviour, so "Reference first" is excluded for this test-only round.

## 6. Architecture checkpoint
No new request. Pending with root, all non-blocking:
- `b-round-221-checkpoint-request.md` (export pipeline);
- D-29z195;
- `b-round-203/205-checkpoint-request.md`.

The perf-harness signal is resolved by round 223. ARCH-GATE223-REPORT-POLICY-RECORD is recorded only. Round 224 removes two options, which lowers the pressure.

## 7. For Saba (`awaiting_user`, unchanged)
- GATE220-S3 / GATE221-S2 (stale ffmpeg guidance in agent tooling).
- SABA-Q-FFMPEG-FILENAME, SABA-Q-LAME-LGPL.
- The retro-200/215 proposals, including `biome.json` for `perf/**`.

## 8. Files written by B
- `tasks/round-223.md`: a copy (`cmp` OK).
- `current-task.md`: round 224.
- `b-round-223-r224-tree-sha256.txt` (1,060; `sha256sum -c` rc 0), `-grants.txt` (14), `-new-files.txt` (3; none exist), `-root-or-granted.txt` (4), `-granted-start-sha256.txt` and `-root-files-start-sha256.txt`.
- `b-round-223-root-request-vitest.md`.
- `b-round-223/`:
  - backups (`backlog-before.json`, `feature-status-before.md`, `b-next-before.json`, `current-task-before.md`, `lessons-before.md`);
  - `git-status-at-planning.txt` (empty);
  - `checkpoint.md`;
  - `replay-exact.txt` and `det-metric-inventory.txt`;
  - `scripts/{spread,replay,equiv-check-b1}.py`;
  - `ctl/` (control reports and `controls.log`);
  - `backlog-update.py`.
- `backlog.json` v209:
  - round 223 closed and round 224 added;
  - stages b-i and b-ii;
  - `execution_order_d29z252`;
  - `consults_round_224`;
  - deferred Lows closed or added;
  - new open findings;
  - one signal;
  - `root_requests_b`;
  - D-29z251…258.
- `feature-status.md`: round 223 marked მზადაა (GATE214-S2 goes to b-ii), a round-224 line added, and the STUDIO-PERFORMANCE row and deferred count updated.
- `b-next.json`.

Unchanged:
- `regression-last.json` (not due);
- `lessons.md`. C-R223-01 is a B premise error of the class L29 already covers ("render condition of every named signal"). The fix was B's own replay this round, so no new lesson.
- `context/*` (root-generated).

App source was not touched. The store `git status` is clean.

## 9. Status
**CONTINUE.** Round 224 is dispatched. After it:
- b-ii, then PERF-2…15, PERF-COMMIT-RESCHEDULE and PERF-DRAG-PREVIEW;
- SYS-1..3;
- STORE-2b..5;
- REVIEW-RECOMMENDATIONS and T12-ADVANCED;
- the gated and queued phase-2 / 2b / CMD / RECORDING entries;
- 349 deferred Lows.

REGRESSION is due on or after 2026-10-30. Nothing needs outside input to proceed.

**Commit readiness:** round 223 is published. Round 224 becomes commit-ready after C PASS and the root gate.
