# B round 396 → 397 planning (2026-11-07)

**Decision:** CONTINUE. **Next task:** round 397 = PERF-13d, the final PERF-13 stage (`current-task.md`). **Baseline:** gate 396 `published`, commit `4f28bff` on both remotes (`gates/gate-round-396.json`).
**Advisor:** available; consulted at orientation and at close. Followed its advice: close 396 first, measure before claiming, rows that can fail, mono ruled out, L28 for doc 247.
**Consults:** `performance-optimizer` and `tech-lead` on the PERF-13d shape; `tech-lead` reviewed the frozen sketch (`b-round-396/sketch-review.md`; reviewed sha = dispatched sha `4db03d5a…`).

## 1. Round 396 closed from evidence
- C round 396: PASS, `browserVerified` true, `realVerified` true, 0 bugs (`c-round-396.json`). Gate 396 published `4f28bff`.
- Done (D-29z1355): PERF-13c-ii-b, so **PERF-13c is done** (stages 393, 395, 396). Closed: TL-B395-SKETCH-M2-CROSSORIGIN, A-R395-REVIEW-L2-THROW-WHILE-ARMED, B-R395-DOC248-STATUS, GATE393-L4-FALLBACK-NEVER-EXPIRES.
- **Not passed:** PURCHASED-PREVIEW-BROWSER was BLOCKED ("no mount point: SRW-21 deferred_user"). It stays open evidence on SRW-21 and is listed as an SRW-21-PLAN input.
- Round 396 task archived as `tasks/round-396.md` (copy). Pre-edit copies: `b-round-396/*-before-397.*`.

## 2. Notes placed (D-29z1357)
- To `deferred_low_polish`:
  - GATE396-L1-CORS-DEPLOY and GATE396-L2-SIGNED-URL-STRING (also SRW-21-PLAN inputs);
  - GATE396-I4-PREVIEW-ELEMENT-IDENTITY (info);
  - A-R396-REVIEW-DOC248-TODO;
  - C-R396-NOTE-PS29-TITLE.
- Gate-396 Low 3 has the same root cause as B-R395-PERF-RESTORE-CATCH, so its evidence was merged there (L7).
- Architecture signal GATE396-ARCH-STREAM-FACTORY was recorded under ARCH-CHECKPOINT-PREVIEW-AFTER-13C. It is a signal, not a scheduled task.

## 3. Architecture checkpoint for root (D-29z1358)
PERF-13c is a completed feature, so the bounded `frontend-architect` checkpoint ARCH-CHECKPOINT-PREVIEW-AFTER-13C is **due now**, together with ARCH-CHECKPOINT-DECODE-REGION. Reminder: `b-round-396/root-request-arch-checkpoint-due.md`. It does not block round 397, which touches neither region.

## 4. Why PERF-13d, and what it is
- **Order:** no open C bug, and every open Critical/High/Medium is manual-only, `awaiting_user` or `open_root`.
  - Regression is not due: the last was round 390, 2026-11-07, and the next is due on or after 2026-11-10.
  - RETRO is at round 400.
  - PERF-13d is the next dependency-ordered item. PERF-12b and PERF-11c-iii-d/e are `awaiting_user`.
- **Premise re-measured (L37).** At HEAD at 6×, the five worker synth buffer builds sit in one 135–187 ms long task. B ran 6 runs at both viewports plus a premise run: `b-round-396/probe/head-6x-1.json` and `rows-summary.txt`.
  - The cause of R314 is confirmed: the five loads resume from one awaited worker promise.
  - The ten `copyToChannel` calls take about 100 ms of it.
- **Fix (D-29z1356):**
  - one `setTimeout(0)` yield plus an abort check per build on the worker path, so the 5 builds become 5 tasks;
  - one shared array for both channels;
  - `generateDemoStereoChannels` deleted.
- **Rulings:**
  - **No yield for the SFX.** B's first sketch yielded for the SFX too and broke NG5b/NG5c (`precheck-full-v1-yield-all.log`). Those builds take 1–4 ms, so the SFX path is left alone.
  - **Mono rejected.** A mono buffer would change the pan sound.
  - **No new perf spec row.** No load row isolates these builds. Deterministic browser rows come from `b-round-396/probe/rows.cjs` instead.
- **Consults disagreed on bundling:**
  - `performance-optimizer` said to include the yield.
  - `tech-lead` said to make it a separate stage.
  - B bundled both into one round. It is one function in one file, the yield is the only part that actually splits the task, and both consults found no hang risk.
- **Sketch evidence:**
  - tsc 0, Biome 0;
  - full suite 259/3847 rc 0;
  - 7/7 unit mutants red;
  - browser, sketch vs HEAD:

    | Metric | Sketch | HEAD |
    |---|---|---|
    | Synth builds per long task | ≤ 1 | 5 |
    | Builds that share one array | 5/5 | 0/5 |

  - channel hashes identical to HEAD;
  - play works;
  - perf spec on the sketch (production build): rc 0, failures empty.
    - `load.script-max` 0/0/5 ms, against 39/40/0 in C round 389 on another tree.
    - These numbers are recorded, not asserted.
    - Source: `b-round-396/perf-sketch-load-rows.txt`.
  - covering set: 16 files, 219 tests.
  - slowest covering test: NG5, 1.7 s of 15 s.
- **Planning checks:**
  - claims K1–K25: `claims-397-planning-output.txt` and `claims-397-on-sketch.txt`;
  - L57 check on `c-round-396.json`: OK (`b-round-396/l57-check-c396.txt`).

## 5. Queue after round 397
- PERF-14, then PERF-15.
- The regression round comes at the first planning on or after 2026-11-10.
- RETRO comes at round 400. No parked `regression_rounds` row names round 398 (the only `398` hit is a pixel width).
- Then the rest of `post_current_stage_queue` unchanged: STEM-LANES, SYS-1…3, STORE-2b…5 (direction gate), REVIEW-RECOMMENDATIONS, T12-ADVANCED, the phase-2 entries (skip rule).

## 6. Ready for commit
Round 396 was published by root (gate 396). Nothing new is staged by B. B changed only loop artifacts: `backlog.json` v364, `feature-status.md`, `current-task.md`, `b-round-396/`, `b-round-396.md`, `b-next.json` and `tasks/round-396.md`.
