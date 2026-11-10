# B round 423 → 424 planning (2026-11-10)

**Decision: CONTINUE.** Next is round 424: PERF-FIX-R423-LANE-SHELL, the fix-up of C-R423-01, applied from B's reviewed sketch (`current-task.md`). Part 2 of REGRESSION-2026-11-10 moves to round 425.

**Advisor:** available. Consulted after orientation, and its advice was followed:
- B names the cause before dispatch (no "bisect, then fix" for A);
- preserve first;
- the baseline stays at the gate commit;
- default to restoring the counts;
- run C's exact perf command on the sketch.

A second call was made before close. It found seven gaps, and all are fixed (§7).

**Consults:**
- `tech-lead`: RESTORE, then the sketch review (approve-with-lows, sha `942dfdb6…`).
- `performance-optimizer`: ACCEPT, a dissent that is recorded.

## 1. Round 423, from C's evidence only (D-29z1479)
- **C FAIL** (`c-round-423.json`):
  - 21 rows passed.
  - 1 failed: RR-PERF, 17 deterministic `move-components` asserts.
  - 1 blocked: the fake bearer (backend unavailable in the cloud). It stays as open backend evidence.
  - `browserVerified` and `realVerified` are true; L57 OK (`c-round-423/l57-check.txt`).
- **Gate 423:** `skipped`. The baseline stays `875ff37`.
- **Part 1 of the regression** is complete except RR-PERF, which round 424 re-runs. `regression-last.json` is unchanged, because part 2 has not run.
- **C's lookups are ruled (D-29z1482):**
  - The R423-DECODE-STATUS oracle drift is accepted as B spec drift, `INFO-C423-DECODE-ORACLE-DRIFT`. Later regressions cite C's replay and r393/r395.
  - The SCALE-EXPORT second clip made with Ctrl+D is a lookup.
  - The min-zoom probe is recorded only.
- **Status board:** no item moves to მზადაა. PERF-11c-iii-e-ii (round 409) moves from მზადაა to **ბაგია**.

## 2. C-R423-01: cause named before dispatch (D-29z1480)
- **Every clip drag gets +2 fibers per rendered lane** compared with round 404. Lane drags, which render two lanes, get +4, and range drags are unchanged (`b-round-423/move-components-404-vs-423.txt`).
- **The browser name probe** (`b-round-423/probe/fade-names.mjs`, using the harness's counting rule) shows the fade-drag commit at HEAD: `ArrangementLane` + `Memo(ArrangementLaneViewInner)` + inner + clip memo + envelope + status = 6 fibers.
- **Cause:** round 409's shell/memo split. The shell subscribes to the per-lane preview and ghost stores, so every drag commit renders shell + Memo + inner.
- **Origin `B spec`:** round 409 never ran the interactions spec on its sketch.
- **Move-to-paint p95 is unchanged** (`latency-404-vs-423.txt`, every value ≤ 7.8 ms).

## 3. Ruling: RESTORE (D-29z1481)
- **tech-lead:** restore. The comparator always fails during a drag, and the budgets have no headroom by design.
- **performance-optimizer:** accept +2 (microseconds); add a latency budget instead. The idea is filed as candidate `PERF-CAND-DRAG-LATENCY-BUDGET`, not scheduled.
- **B follows tech-lead and the advisor default.** No budget changes. The fix keeps round 409's saving for unaffected lanes.
- **Sketch** (`b-round-423/sketch-424.patch.txt`, sha `942dfdb660b529bc…`, 2 files):
  - the preview and ghost subscriptions, `laneSources` and `laneGhostTitles` move into the memo inner;
  - the shell passes `committedLaneClips`;
  - four drag-preview-render rows pin `ArrangementLane = 0`.
- **B's pre-check on the sketch** (all in `b-round-423/`):
  - perf interactions spec on the production build: 95/95 asserted rows pass, and the 17 ids are exactly at their round-404 values (`perf-sketch/compare-404-423-sketch.txt`);
  - name probe: fade 6 → 4, trim 17 → 15, shell 59 → 0;
  - ghost-title probe: HEAD equals the sketch at both viewports;
  - full suite: 264 files, 3,957/3,957;
  - covering set: 12 files, 291/291;
  - typecheck, lint and Biome: rc 0;
  - mutant MU-SHELL-SUBSCRIBES: 4 rows red.
- **Review:** approve-with-lows (`sketch-review.md`). TL-R424-L1 (ghost-title ref read), L2 (an unused hook; deleting it needs Saba) and L3 (naming) go to `deferred_low_polish`. L4 is not a defect.

## 4. Backlog and signals
- **`backlog.json` v400** (`b-round-423/update-backlog.py` + `.done`):
  - D-29z1479 … D-29z1482;
  - C-R423-01 opened as Medium, origin B spec;
  - INFO-C423 added;
  - three deferred Lows;
  - PERF-11c-iii-e-ii status set to bug;
  - REGRESSION entry updated;
  - architecture signal SIG-R423-SHELL-MEMO-FIBER-COST: per-gesture subscriptions belong inside the memo inner. Check the other leaf shells when their drag rows are next touched; not a separate task.
- **Retro candidate:** RC-R423-PERF-SPEC-ON-STRUCTURE, for RETRO 435. `lessons.md` is unchanged (60 lines). L58 already requires this; it was not applied in round 409.
- **No architecture checkpoint request.** This is a contained single-owner fix. The open requests ARCH-CHECKPOINT-PREVIEW-AFTER-13C and ARCH-CHECKPOINT-STEM-LANES stand.

## 5. Order after this round
1. 424: this fix-up.
2. 425: REGRESSION-2026-11-10 part 2 (the round-390 template). When it closes, `regression-last.json` is updated.
3. STEM-LANES, when Saba answers. `AGREE-STEM-LANES.md` is still `awaiting_user`.
4. Otherwise SYS-2 stage 2a, then 2b, SYS-1 and SYS-3.
5. STORE-2b…5, then REVIEW-RECOMMENDATIONS, then T12-ADVANCED, then phase 2 (skip rule).

The next RETRO is 435.

## 6. Why not COMPLETE or BLOCKED
- **Not COMPLETE:**
  - C-R423-01 is an open Medium;
  - regression part 2 has not run;
  - still open: SYS-1…3, STEM-LANES, STORE-REDESIGN 2b–5, REVIEW-RECOMMENDATIONS, T12-ADVANCED, the phase-2 entries, the parked PERF remainders, SRW-21 (`deferred_user`) and every deferred Low.
- **Not BLOCKED:** round 424 runs fully in the cloud. Only the fake-bearer auth path needs the backend.

## Files written by B
- `current-task.md` (round 424)
- `tasks/round-423.md` (archive; byte-identical, K11)
- `b-next.json`
- `backlog.json` (v400)
- `feature-status.md`
- `b-round-423/*`:
  - checkpoint and before-copies;
  - claims-424.sh with its planning and sketch outputs (stderr empty);
  - frozen manifest (1,319) and grants;
  - sketch patch and review;
  - pre-check logs;
  - perf-sketch results;
  - probes with HEAD and sketch outputs;
  - mutants.

Nothing in `store/` was changed: the sketch work ran in `/tmp/b424/scratch`, and its dev server ran on its own port and cacheDir and was stopped.

## 7. Fixes after the close advisor call
1. **Row 6 (lane + leaf):** B ran `leaf-probe-409`, `lane-actions-probe` (both viewports) and `leaf.cjs` on the sketch, on its own dev server (port 5191, own cacheDir; stopped by port afterwards).
   - Result: 0 diffs from C round 423 on the first two, and 0 non-timing diffs on `leaf.cjs` (`b-round-423/probe/lane-leaf-video-compare.txt`).
   - The row's oracle is now B's sketch output, with one rule per count. `.pos` and `.aud.ctx` are recorded only: wallclock, up to 50 ms apart.
2. **Row 7 (video):** the sketch run gives max |drift| 0.012 / 0.007 s with 0 swaps. The 0.05 s assert now cites round 406's VIDEO-SYNC row. The unrun mouse fade/trim recipe is dropped; the perf spec's `interact.harness.*-live` rows cover it.
3. **Row 3 (perf):** the whole `npm run test:perf` ran on the sketch, alone: 5 passed in 19.1 min, every spec `complete`, 0 failing asserts (`perf-sketch-full/summary.txt`).
   - Between B's two sketch runs only two record-only "playing" per-move rows moved (±0.07). Row 3 records them.
4. **Row 4:** the commit count is a record (wallclock, L37). The row asserts sizes, shell 0, Memo(lane) 0 and inner = commits, at 1440×900 only.
5. **A5:** K2, K6 and the other end-state lines come from a scratch run in A's end state: the sketch applied but not committed, plus a stub doc 273 (`claims-424-a5-stub-output.txt`). Nothing is typed by hand.
6. **INFO-B423-LANE-RESTORE-PARTIAL** (`update-backlog-2.py`): these rows stay above round 404 after the fix. All are record-only or within budget, and C-R423-01 closes on its 17 ids:
   - zoom 41 → 45;
   - move/lane max 40 → 44;
   - group max 44 → 48;
   - per-move +0.2…0.5.

   Round 409's saving survives: play start/stop is 11 → 7. Doc 273 lists this.
7. **RC-R423-PERF-SPEC-ON-STRUCTURE** is added to `retro_candidates`. `BUG_HUNTING_TESTS.md` is added to A's primitives.
