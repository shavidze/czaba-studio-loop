# C round 339 — PERF-DRAG-PREVIEW c4-i (group move perf rows). Verdict: PASS

Test-and-docs round (4 files). Behaviour unchanged; Ableton conformance: not applicable. Evidence in `c-round-339/`.

| Row | Result | Evidence |
|---|---|---|
| CLAIMS | PASS. `claims-339.sh` at start == at end == A's `claims-final.txt` (K2 `662ed42 4`, K19 `c4-i`) | `claims-start.txt`, `claims-end.txt` |
| SOURCE-SCOPE | PASS. 4 files, 0 untracked; no diff in `app/`, `perf/lib/`; `budgets.patch.txt` reverse-applies; `spec.patch.txt` reverse fails only in the new-functions hunk (`@@ -670`), where A's `teardownGroupClips` bounded Ctrl+Z loop differs from the sketch (the only strengthened hunk). Spec diff has 0 deleted lines (additions only → `DragName`/`dragNames`/existing code untouched). Budgets: 193 → 219; 191 rows byte-equal; only the 2 `drag-lane-live` rows changed (note only); 26 added = 24 `record` + 2 `assert` liveness | `budget-diff.txt` |
| PERF | PASS. Production build, spec alone: rc 0, `complete` true, `failures` [], 219 rows, 45/45 asserted pass, 139 EQUAL / 0 DIFF / 0 GONE / 18 NEW. The 18 non-wallclock NEW rows equal B: per-move 74.781, max 106, release-commits 1, move-restarts 0, release-restarts 2, live 1. Wallclock rows recorded (cross 16.727, lane 110.45), not compared. `drag-group-live` [1,1,1] and `.6x` [1,1,1]. Note: no separate browser warm-up before the run (the build/server start is the only warm-up); all values were identical across 3 passes and both rates | `perf.log`, `perf.rc`, `perf-results/latest-interactions.json`, `perf-rowcmp.txt` |
| PREMISE | PASS. group per-move 74.781 > lane 24.906 at 1× and 6×, stopped and playing; all 26 rows × 3 passes saved as c4-ii baseline | `group-rows.txt` |
| MUTANT | PASS. MU-GROUP-SINGLE on scratch: rc 1, live [0,0,0]/.6x [0,0,0], 50 failures = (f)(a)(b)(c) 12 each + 2 assert; no (d)/(e)/teardown. Own mutant MU-ENTRY-LATE (entry ghost read moved after the cross moves), predicted before running: only (e) red, 12 failures + 2 asserts = 14, live 0 — exactly as predicted. Scratch copies deleted; store untouched | `mutant-a.log`, `mutant-b.log`, `mutant-*-results/`, `own-mutant-prediction.md`, `own-mutant.py` |
| GROUP-NAMES (browser, dev) | PASS at 1440×900 and 1280×720: `group-probe.mjs` on :5173 equals B's `head-<w>.json` after dropping the informational `top`/names/time fields (all commit counts, provider/workspace flags, clip states, ghosts, undo titles); `pageErrors` [] | `probe-1440.json`, `probe-1280.json` |
| HARNESS-READ | PASS. Read the diff vs §0.2: setup (Undo title, state, null clip id/copy → null), gesture (3 segments, 10×40 px, double-rAF settle, entry read), windows from `firstMove`/`t1`/`t2`, six liveness letters (f)(a)(e)(b)(c)(d), `setLive` after the reset, teardown (bounded Ctrl+Z ≤ 3 until Undo title restored; >1 press = problem; count/state/title checks), failed-setup path (live 0 + cleanup). Existing drag paths unchanged in the diff. Low observations (A's own, not bugs): (e) uses `targetStart` from DOM-order first ghost; failed-setup path unexercised | spec diff |
| PERF-LIB | PASS 34/34 | `perf-lib.log` |
| G339-AUTH | PASS (browser, fresh anonymous contexts, both viewports): `/studio-lab` workspace + demo badge, `auth_user` null, no errors; `/studio/middle-east` "Sign in required", 0 `audio[src]`, no workspace; `/api/studio-token` no header → 401, fake bearer → 500 (no token), bare → 400. First script attempt timed out on cold dev compile (environment, replaced once, L38) | `g339-auth.json`, `g339-auth.cjs`, `shots/` |
| DOCS | PASS. Doc 232 l.1 appended `, ეტაპი c4-i — group move-ის perf row)`, l.4 byte-exact; c4-i section (items 53–58) with the numbers; files/problems/testing/TODO entries; 7 `## ` headings in order; doc 168 diff hunks only in the three granted sections (step 8 block, liveness row, metrics paragraph) | git diff |

## Gate (not claimed)
full vitest, build, Biome, typecheck, `npm run verify`, e2e smoke. Gate 338 `published` `662ed42`; `chainHeadGateRunGreen` true.

## Findings
0 bugs. Info/Low for B (origin A's reviewer, already in a-round-339.md): E-GHOST-ORDER, LANE-NOTE-ORDER, OVER-UNDO, NULL-SETUP. Planning signal: A-R339-REVIEW-TEARDOWN-ABORT (Medium on B's sketch, fixed by A, confirmed by C's harness read).
