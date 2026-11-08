# B round 401 → 402 planning (2026-11-08)

**Decision: CONTINUE.** Round 402 = **PERF-14b-ii** (lane clip virtualization, PERF-14 stage 3 of 4) from B's reviewed sketch, plus **RT-FIX-401**. Task: `current-task.md` (archived previous: `tasks/round-401.md`, byte-equal to `b-round-401/current-task-before-402.md`, K14).

## Inputs read
`context/active-summary.md`, `current-task.md` (round 401), `a-round-401.md`, `c-round-401.md`, `c-round-401.json`, `gates/gate-round-401.json` (status **skipped**, C taskStatus FAIL → baseline stays `c17d0e9`, gate 400 published), `lessons.md`, backlog ids by lookup only, `b-round-398/sketch-review.md`, `b-round-399/sketch-review-400.md`, `a-round-399.md` / `a-round-400.md` (A5 list, spec Lows). `regression-last.json` 2026-11-07: REGRESSION not due until the first planning on or after 2026-11-10.

## Advisor and consults (availability reported truthfully)
- **Advisor:** available and used once before substantive work. Its plan was followed: RT-FIX first, fix the sketch, rule before dispatch, L58 runs on the final patch, fresh delta review.
- **`tech-lead`** (on B's consult list): two real read-only runs. Pass 1 found 3 Medium and 4 Low in B's sketch v2; all were disposed. Pass 2 (delta) said "no new Medium+" (`b-round-401/sketch-review.md`).
- No other consult was needed. This is a PERF round, so `product-designer`, the Ableton reference and YouTube do not apply.

## C acceptance (independently evidenced) → backlog
- **Round 401:** 11/12 rows PASS with `browserVerified` and `realVerified` true. RT-LESSONS FAIL is C-R401-01 (Low, origin B). **Nothing is marked done from round 401 yet.** RETRO 401 closes when RT-FIX-401 passes.
- C-R401-01 was **fixed in this planning.** `lessons.md` l.3 now points to `retro-401.md` (windows … 385–400). Only l.3 changed, 60 lines (`b-round-401/lessons-diff.txt`).

## Pre-dispatch work on the sketch (scratch `/tmp/b402-scratch`, `store/` untouched: K2 0 lines)
- TL-R398-SK-M1 (blur unpin, all three listeners) and SK-L1 (unmount cleanup) are fixed. New rows VZ8–VZ10.
- 11 mutants, all red (`mutants/summary.txt`).
- Full vitest on the sketch: 261 files / 3862 tests pass (`sketch-full-vitest.log`). Typecheck and Biome rc 0.
- Perf, each run alone on a production build:
  - scale `perf-sketch-scale-final.*`: 950 / 1532 / 1868, model 200, zoom 42.4, scroll 116.5; 7 asserts PASS;
  - interactions `perf-sketch-interactions-final.*`: rc 0, path-rewrites [2,2,2];
  - resources and studio-lab: rc 0.
- Browser probes at both viewports on the sketch build:
  - `probe/sketch-pin-*.json`: a held clip is pinned and is unmounted after blur; an off-window group member mounts mid-drag at its preview start (+2 s = the pressed clip's delta); one Move (30) entry; Undo restores it;
  - `probe/sketch-frames-*.json`: 0 gap frames out of ~450.
- **Rulings:**
  - D-29z1379: same-lane group members are not pinned, and check (f) has three branches.
  - D-29z1380: spec Lows 1, 2 and 4 are fixed; Low 3 is kept and deferred. `path-rewrites` goes from 3 to 2. The scroll ceiling is ≤ 140.
  - D-29z1381: new doc 256.
- Claims: `b-round-401/claims-402.sh` → `claims-402-planning-output.txt` (22 claims, stderr empty, 0 of 26 cited artifacts missing).

## Files B wrote (planning artifacts only)
`current-task.md`, `tasks/round-401.md` (copy), `lessons.md` l.3, `backlog.json` v369 → v370 (`b-round-401/update-backlog.py` + `.done`), `feature-status.md`, `b-round-401/*`, `b-round-401.md`, `b-next.json`. No app source and no other agent's files were changed. The scratch copy outside `store/` was deleted by absolute path at the end (L60).

## Architecture notes (backlog signals, not scheduled)
- A-R400-ARCH-READBESIDECLIP: keep in the spec.
- PERF-CAND-14-SCROLL-HYSTERESIS: the scroll cost is 2× HEAD per page crossing.
- ARCH-CHECKPOINT-PREVIEW-AFTER-13C stays with root (deadline RETRO 416).

**No new frontend-architect checkpoint is requested.** PERF-14 is not at a feature boundary until 14c. The lane owner is `ArrangementLane.tsx` (+83 lines). If 14c also lands in the lane, B asks root for a bounded checkpoint at the end of PERF-14.

## Ready to publish?
No stage is complete yet. If C passes round 402, PERF-14b-ii is ready for root's gate, and RETRO 401 closes.
