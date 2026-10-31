# B round 283 → 284 planning

**Date:** 2026-10-31. **Decisions:** D-29z671…D-29z680. **Advisor:** available, consulted before the approach and before finishing. **Consults:** `performance-optimizer`, `tech-lead` (read-only; results in `backlog.json` → STUDIO-PERFORMANCE `consults_round_283`).

## 1. Round 283 closed
- **C:** PASS (`c-round-283.json`). `browserVerified` and `realVerified` are true. 10 rows passed: SOURCE-SCOPE, TEST-BYTES, HUNK-SCOPE, CLAIMS, TYPECHECK, UNIT (101), UNIT-MUTANTS, DOC-211, LIBRARY-STATES and G283-AUTH, the last two in real Chromium at both viewports. Round 282's runtime rows are listed under `carried`. The only blocked check is the real-backend bearer rejection (backend unavailable in cloud).
- **Gate:** `gates/gate-round-283.json` is `published`, commit `54a3fcc` on both remotes. **The baseline HEAD for round 284 is `54a3fcc`.**
- **PERF-2 is მზადაა** (D-29z671).
- **Findings moved to `deferred_low_polish`** (D-29z672, 2026-10-23 bug gate):
  - C-R283-01 (stall-timer row), C-R283-02 (doc 211 LoAF figures), C-R283-03 (doc 163 says 316 rows, there are 320; this is the same issue as A's M1);
  - A-R283-REVIEW-LOAF-SCRIPTS (A's M2, also the gate's S5), A-R283-REVIEW-L9-EXPECTRELEASED;
  - GATE283-S1 (an inferred `any`), GATE283-S2 (a `.client` import plus doc 211's SSR wording).
- **Info:** GATE283-S3 (the 6× timeout headroom) and GATE283-S4 (load commits are now wallclock).
- **Architecture note:** A-R282-REVIEW-WORKER-PROTOCOL stays a signal; it is not scheduled.

## 2. PERF-3: the premise re-measured (D-29z673)
The evidence is in `b-round-283/`. The probes are `zoom-probe.cjs`, `zoom-probe2.cjs`, `zoom-probe3.cjs` and `nodes-probe.cjs`, with results in `probe-results/*.json`, `head-*.json` and `imgdiff-head-vs-sketch.json`.

**At HEAD** (production build, 30 clips of 101.352 s):
- Zoom in (40 → 122.1 → 40 px/s): waveform `d` rewrites `[30,0,0,0,0,0,0,0,0,30]`, 3/3 runs.
- Zoom out (40 → 13.1 → 40): `[30 ×10]`.
- Event Timing (in): key 5 is 144–152 ms and key 6 is 96–104 ms. That is `ArrangementRuler`: the document gains 6,142 nodes on that key (`head-detail.json`); the ruler subtree grows by 6,143 over the five keys with 30 clips, against 264 with 1 clip (`probe-results/nodes-head-30.json`, `nodes-head-1.json`), because it renders ticks over the whole arrangement.
- Keys 1 and 10 are 88–104 ms (the path rewrites). The other keys are about 40 ms.

**Conclusion.** perf-plan's PERF-3 cause, "path rebuilt every zoom step", holds only below the 4096-column cap. The slowest key comes from the ruler, which is outside the outline's stated fix. Neither half alone reaches "p95 < 50 ms with 30 clips". **Split, without shrinking the scope:**
- **PERF-3a** (round 284): the waveform column bands, plus the envelope line in seconds.
- **PERF-3b:**
  - ruler tick windowing, keeping `play.idle-commits` (rule on tiles with hysteresis versus CSS lines plus windowed labels);
  - the bars-ruler sibling;
  - the `data-tick-step` consumers;
  - harness rows for Event Timing p95 per key, path rewrites, ruler nodes, and the Ctrl+wheel baseline (`scope_addition_d29z215` moves here).

  The exit target is measured at 3b.

## 3. PERF-3a design
**Column rule (D-29z674).** I chose the `tech-lead` consult's zoom bands, ×4 at 25 / 6.25 / 1.5625 px/s with a cap of 4096. I rejected `performance-optimizer`'s next power of two ≥ the width, because it still rebuilds about every third step.

Results on B's sketch:

| | HEAD | Sketch |
|---|---|---|
| Zoom in, path rewrites | 60 | 0 (3/3) |
| Zoom out, path rewrites | 300 | 60 (3/3; only the crossing of 25 px/s) |
| Waveform pixels, ≥ 50 px/s | | identical |
| Waveform pixels, below the cap | | meanAbs ≤ 5.001, \|Δ\| > 32 on ≤ 6.057 % (`shots/compare-out4.png`: the same shape, slightly softer spikes) |
| Event Timing, in-band keys | | about 40 ms |
| Event Timing, ruler keys | | unchanged |

**Envelope (D-29z675).** The envelope line is drawn in a seconds viewBox and memoised on the clip object. Browser recipe `env-probe.cjs`: HEAD writes 180 `points` + 90 `viewBox` over three zoom keys, the sketch 0, with Δ 0 px dot-to-vertex at both viewports. EU5 and EU7 are rewritten to seconds (equal strength). AL1 is unchanged.

**Scratch checks.**
- 9 covering files, 171 tests pass; `tsc` 0; Biome clean.
- `patch -p1` dry-runs cleanly on `git archive HEAD`.
- The HEAD-code control and Z1–Z5 are each red at their rows (`mutants.txt`).
- `sketch-full.diff` and `sketch-sha256.txt` define the exact bytes.
- Claims: `claims-284.sh` → `claims-284-output.txt` (K1–K20).

## 4. Rulings and records
- **Consult data errors (D-29z676, INFO-B283-CONSULT-FALSE-CLAIMS):**
  - `tech-lead` said `perf-plan.md` does not exist; it is in `docs/technical/performance/`, outside `store/`;
  - `tech-lead` also said `budgets.json` has no zoom rows; they are in `budgets.interactions.json`.

  Every consult claim used in the task was checked by grep or measurement.
- **Architecture signal B-R283-RULER-WINDOW-REUSE (D-29z677):** PERF-14 should reuse the window primitive that PERF-3b introduces. No frontend-architect checkpoint was requested: PERF-3a is three small files with no structural risk, and the earlier requests are still pending.
- **Lessons (D-29z678):** L37 gains the clause "re-measure the plan's premise; a new deterministic perf row is first shown non-zero at HEAD". The file stays at 59 lines.
- **REGRESSION (D-29z680):** `regression-last.json` is 2026-10-30, so the next one is due on or after 2026-11-02. It is not due now, and the file is unchanged. RETRO is at round 290.
- **Root publication files:** `root-pre-push-review.md` and `publication-checkpoint.json` are the round-3 / 2026-10-07 records, already folded into earlier planning. They have no new remaining findings.
- **Saba-gated items, unchanged:**
  - PHASE2-VIDEO-SCORING: awaiting the user's go-ahead;
  - STORE-2…5: waiting for the direction decision;
  - the awaiting_user recommendations.

## 5. Owners and protection
- A owns exactly 6 files (= the sketch) plus the new doc 212.
- These are not touched: `perf/**`, the ruler, the detail panel, `package.json`, the protected auth and purchase files, and `app/routes/studio.$productId.tsx` (SRW-21 is `deferred_user`).
- `/studio-lab` stays demo-only and anonymous; G284-AUTH re-checks the purchase protection.

## 6. Environment notes
- B ran `npx tsx` once for the helper's value table. npm fetched `tsx@4.23.15` into the npm cache only; the project and the lockfile are unchanged (INFO-B283-NPX-TSX-CACHE).
- Twice, a `pkill -f`/`pgrep -f` pattern matched B's own shell and ended that command (exit 144). The scratch servers were then stopped by PID.
- Nothing under `store/` was modified: `git status` was clean during planning. All scratch work was in `/tmp/b283`.

## 7. Readiness for publication
Round 283 is published. Nothing is pending for root from this planning.

STATUS: CONTINUE. Next: round 284, PERF-3a (`current-task.md`).
