# B round 403 → 404 planning (2026-11-08)

**Decision: CONTINUE.** Round 404 is **SYS-R385-LEAF-ACTIONS-CONTEXT stage 1 of 2**, built from B's reviewed sketch v2. The task is in `current-task.md`. The previous task is archived as `tasks/round-403.md`, byte-equal to the round-403 `current-task.md`; it was copied, not moved.

## Inputs read
- `context/active-summary.md` and the round-403 trio: `current-task.md`, `a-round-403.md`, `c-round-403.md`, `c-round-403.json`.
- `gates/gate-round-403.json` (status **published**, commit **cc5cbc6** on both remotes) and `gates/round-403/review.md` (4 Low).
- `lessons.md`, `b-round-402.md`, `b-round-402/consult-perf-14c-ii.md`; backlog ids by lookup only.
- `regression-last.json` says 2026-11-07, so the next regression is due on or after 2026-11-10. This is not a regression round.
- **Baseline for round 404:** cc5cbc6 (the gate-403 commit). `context/head-sha.txt` (7d7d7b2) is stale; it was written before the gate.

## Advisor and consults (availability reported truthfully)
- **Advisor:** available, used twice before the approach was fixed.
  1. First: measure first, then pick a branch.
  2. Second: it corrected B's over-reading of mutant C ("hysteresis makes it worse"). That reading confused mounting more clips with mounting the same clips, so B ran mutant D, the sticky set, as the deciding experiment.
- **`tech-lead`:** three real read-only runs.
  1. Stage design (`b-round-403/consult-tech-lead-sys-r385.md`): Option B, a hoisted memo, one round.
  2. Sketch review pass 1 on v1: 3 Medium (test strength) and 2 Low.
  3. Delta review pass 2 on the final sha `9c0cdbc9…`: **"no new Medium+; dispatch v2 as it is"**, plus 3 optional Lows. See `b-round-403/sketch-review.md`.
- **Not needed:** `performance-optimizer` (the measurement answered its own earlier question), `product-designer` and `ableton-arrangement-expert`. This is a refactor round with no visible change; the reference-first rule excludes it.

## C acceptance (independently evidenced) → backlog v371 → v373
Scripts: `b-round-403/update-backlog.py` and `update-backlog-2.py`, each with a `.done` file. Decisions D-29z1388…D-29z1395.
- **PERF-14c-i (round 403): done.** C PASS on 12 rows, `browserVerified`/`realVerified` true, gate published cc5cbc6. The fake-bearer token row stays BLOCKED (backend unavailable in the cloud) as open evidence.
- **Closed:**
  - C-R315-T1/T2, A-R315-REVIEW-L1/L3/L4, GATE315-S2, GATE315-S8;
  - A-R315-REVIEW-L2, closed with the residual A-R403-L2-RESIDUAL-QUEUED-THROW, which is still deferred.
- **To `deferred_low_polish`:**
  - A-R403-REVIEW-L1, L6 and L7;
  - GATE403-L4-CPURATE-TRY;
  - TL-R403-SK-L1 and TL-R403-SK2-L1/L2/L3.
  - Gate-403 items 1 and 2 were added to TL-R402-SK2-L1/L2, not duplicated.
- **Architecture signals (not scheduled):** A-R403-ARCH-PEAKS-ONERROR and PERF-CAND-14-ZOOM-PER-CLIP-RENDER.
- **REGRESSION-2026-11-10** now also carries the failing-mode fallback check, the export WAV and graph check, and the BLOCKED token path.

## PERF-14c-ii measured (D-29z1389), `b-round-403/probe/medians.txt`
Setup: cc5cbc6 production builds, 200 clips, 6× CPU, 10 keys per variant, both viewports. Each mutant's diff is in `probe/mut*.diff.txt`.

| Variant | Default zoom, median/max (1440 · 1280) | Near min zoom, median/max (1440 · 1280) |
|---|---|---|
| HEAD | 56/64 · 48/72 | 76/88 · 68/88 |
| A: 512 columns | 48/56 · 48/48 | 80/88 · 72/96 |
| B: fixed path | 48/56 · 48/56 | 76/96 · 68/96 |
| C: window ×3 | 64/96 · 60/80 | 120/152 · 108/136 |
| D: sticky set (0 churn) | 48/72 · 48/64 | 80/80 · 64/72 |

**Rulings:**
- Path and column cost is at most 1 Event Timing step (8 ms). Churn removal does not change the median. The cost grows with the number of mounted clips.
- The 1× plan target is already met: ≤ 24 ms, and 1868 DOM elements at min zoom.
- **Pyramid (14c-ii) and canvas (14c-iii) are not dropped.** They are `awaiting_user` under SABA-Q-PERF14C-PYRAMID-CANVAS (`user-review/questions-perf14c-pyramid-canvas.md`). B recommends closing PERF-14 at stage 4. The skip rule applies, so the loop continues.
- PERF-CAND-14-SCROLL-HYSTERESIS is closed as measured. The per-clip zoom cost is recorded as a candidate.

## Round 404 pre-dispatch work (scratch `/tmp/b404-sketch`; `store/` untouched, K2 = 0 lines)
- **Sketch v2:** `b-round-403/sketch-404.patch.txt`, sha256 `9c0cdbc9…`, 8 files. v1 is kept as `sketch-404-v1.patch.txt`.
  - `ArrangementActionsContext`: a memo over the 34 bundle callbacks, plus `useArrangementActions()`.
  - The 4 bundle hooks are narrowed, with their param renamed to `actions`.
  - StudioWorkspace and 4 wrappers now take the actions from it.
  - New test file `actions-context.test.tsx`, rows AC1–AC6.
- **Checks on v2:**
  - Mutants: 9/9 red, the control mutant green, the pristine run rc 0 before and after (`mutants/summary.txt`).
  - Full vitest: 262 files / 3876 tests. tsc, lint and Biome: rc 0.
  - Interactions perf spec, run alone: rc 0. All 189 deterministic rows equal `c-round-402/perf-interactions.json`.
- **Claims:** `b-round-403/claims-404.sh` gives 22 claims with empty stderr. Planning and sketch outputs are saved, and they differ only on the lines the patch changes.
- **Grants and frozen files:** grants `grants-404.txt` (9 paths); frozen `r404-frozen-sha256.txt` (1,290 entries; all 11 protected files included and unchanged).
- **Closes on C PASS:** GATE379-L3, GATE378-L2 (within the scope stated in pass 2) and GATE377-L1.
- **Left for stage 2:** GATE371-L2, GATE375-L2, A-R371-REVIEW-GH5-IDENTITY and B-R374.
- **GATE375-L1** (deleting the wrappers) needs the owner's permission (CLAUDE.md), so it goes to Saba with stage 2.

## Files B wrote (planning artifacts only)
- `current-task.md`, `tasks/round-403.md` (copy), `backlog.json` (v373), `feature-status.md`, `b-round-403.md`, `b-next.json`.
- `b-round-403/*`: probes, mutants, sketch, claims, reviews, grants, frozen manifest, root request and checkpoint.
- `user-review/questions-perf14c-pyramid-canvas.md`.
- No app source or other agents' files changed.
- Scratch copies `/tmp/b404-*` are outside `store/`. Probe servers were stopped by PID or killed after each run.
- The perf spec ran in the scratch copy on :5188 with nothing else running (L38).

## Architecture checkpoint
The end of PERF-14 is a feature boundary. B requested a bounded frontend-architect checkpoint, **ARCH-CHECKPOINT-PERF14-LANE-PEAKS** (`b-round-403/root-request-arch-checkpoint-perf14.md`). It covers keep/extract for lane pin tracking and for the peaks `request` onError. It is non-blocking: round 404 touches neither of those owners.

## Ready to publish?
Round 403 is already published (cc5cbc6). If C passes round 404, SYS-R385 stage 1 is ready for root's gate.

## Advisor hand-off fixes (patch sha unchanged, `9c0cdbc9`)
- **Row 2 (PATCH-IDENTITY):** the method now names `git diff --no-index` for the new, untracked test file, or a scratch apply plus `diff -r`.
- **Row 6 (mutants):**
  - `mutants/run.py` takes `S` and `OUT` from the environment. The defaults are B's paths.
  - B re-ran the defaults and `summary.txt` is byte-identical (`summary-before-param.txt`).
  - C runs it with its own scratch and `OUT=c-round-404/mutants`.
- **Row 4 (LEAF-ACTIONS):**
  - Split follows the round-266 contract: an interior selection gives 3 pieces.
  - The Master fader key step commits on key-up, and Ctrl+Z after that restores it (master-ui test).
- **K18:** now compares `tasks/round-403.md` with `b-round-403/current-task-before-404.md` (equal).
- **Environment note:** a `remix-serve` from `/tmp/c403-scratch` (pid 6090, C's round 403) was still running. B left it alone; it does not survive the job. All B probe servers (`/tmp/b404-*`) are stopped.
