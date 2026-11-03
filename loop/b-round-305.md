# B round 305 → 306 planning (2026-11-03)

**Decision: CONTINUE.** The next task is round 306, **PERF-3d**, in `current-task.md`. The round-305 task is archived as `tasks/round-305.md`, a byte-identical copy (`cmp` equal; claim K19).

**Advisor:** available. I consulted it after orientation and before writing; I call it once more after this hand-off is written.

## 1. Evidence read
- **`c-round-305.json`:** `taskStatus: FAIL`, `browserVerified: true`, `realVerified: true`.
  - 9 rows passed: SOURCE-SCOPE, CLAIMS, RT-NUM, RT-CAUSE, RT-IDS, RT-LESSONS, RT-SABA, G305-AUTH and STUDIO-SMOKE-305 (both viewports).
  - 1 row failed: RT-SCREEN, on **C-R305-01** (Low, origin B). SR-305-4 said the add status is cut at 1440. C measured that it is not (scrollWidth = clientWidth at 1440 and 1280). The cause was B's capture JSON, which cuts text at 120 characters.
  - The browser re-run itself matched the review.
- **`a-round-305.md`:** baseline confirmed. No change. No lesson disagreement.
- **`gates/gate-round-305.json`:** `skipped` (C FAIL), so it is not published. **The round-306 baseline stays `adf959d`** (gate 304 published). The tree is clean, and 1,176 files are frozen in `b-round-305-r306-tree-sha256.txt`.
- **`regression-last.json`:** round 301, 2026-11-02. The next REGRESSION is due on or after 2026-11-05, so it is not due now.
- **No open Critical or High.**

## 2. Round 305 closure (D-29z807), from C's evidence only
| Id | Change |
|---|---|
| C-R305-01 | `fixed_by_B_pending_C`. B reworded SR-305-4 in `user-review/screen-review-305.md`: the issue is density, not truncation, and the text cites C's measurement. Before-copy and diff are in `b-round-305/`. C re-checks only those lines (RT-FIX in round 306) |
| INFO-C305-SR3-NOTHING-TO-PLAY | Folded into SR-305-3's paragraph (the "Nothing to play — add a clip from the library first." status) |
| INFO-C305-AUTH-ATTEMPTS | Recorded. The L38 warm-up already covers it |
| RETRO 305 run | `c_result` recorded. Retro numbers, causes, ids and lessons all passed. Nothing in `retro-305.md` or `lessons.md` changes |
| RC-R305-CAPTURE-TEXT-SLICE | New retro candidate (1×): a truncation claim must rest on the screenshot or a DOM measurement, never on sliced capture text |

No backlog item is marked done this round. PERF-3d is dispatched, not done.

## 3. PERF-3d planning (D-29z808…D-29z810)
1. **Premise re-measured at HEAD (L37).** The attribution probe is `b-round-305/probe/zoom-attr.cjs`.
   - The slow steps are the band crossings (4096 ↔ 2534 columns, 30 path rewrites, 2.64 MB of `d`).
   - Crossing up: keydown 104 ms, LoAF 90 ms, of which script is 84 ms and forced layout 14 ms. Render time is about 1 ms.
   - Microbench, for 30 clips: the `toFixed` path build takes 32–55 ms, and `setAttribute` takes 12–15 ms whatever the path format.
   - Only 1–2 of the 30 clips are on screen at those zooms.
   - This answers C's step-4 vs step-7 question. The crossing up (to 4096 columns) costs more than the crossing down (2534).
2. **Consults.**
   - `performance-optimizer`: integer paths alone would come to 65–75 ms, which still fails. Viewport gating would come to about 30–38 ms. Visibility should be computed from the scroll position, not with an IntersectionObserver.
   - `tech-lead`: same order. Integer paths would need four test-file grants for no exit progress. An unmeasured viewport must count as "visible".
   - Both are recorded in the task.
3. **Mechanism.** Reuse the rulers' existing timeline page window. Off-window clips keep their last path until a scroll brings them into the window.
4. **Sketch on scratch** (`/tmp/b305/sketch`; kept as `b-round-305/sketch.patch.txt`):
   - Full vitest: 232 files, 3,449 tests passed (`precheck-full.log`).
   - Covering set: 11 files, 169 tests.
   - Perf spec, two runs, alone. Run 1 used the old budgets: the only failures were the two `== 60` rows, at 3 and 2. Run 2 used the new budgets: rc 0, `failures` [], keydown max 24/24 ms, LoAF 0, 1 commit per step, 247 components (HEAD also 247).
   - Probes: crossing keys took 16–24 ms. A scroll after a crossing does at most 1 rebuild per step. Visible paths are byte-identical to HEAD at 1440 and 1280.
   - Specified rows WG0–WG4: green. The four mutants each turn their rows red. At HEAD, WG0 and WG2–WG4 are red.
5. **Budgets (GATE304-M2):** out == 3 and wheel == 2, both values from the saved runs. The GATE304-L3 note premise was checked in the spec (K13). C-R304-02's text is in the grant.

**Claims (L56):** the expected output after A's change is `b-round-305/claims-306-sketch-output.txt`. I produced it by running the same script on the sketch, with the doc-222 line and a stub doc 223 applied. K26–K30 tag the facts that the L29 grep found untagged. The other two perf specs only count waveforms (K30), so they were not re-run on the sketch.

**Servers:** I started my production builds on :5189 and :5190 and stopped both. The dev server :5173 was not touched. `store/` was clean after every step (`git status` empty).

## 4. Queue and cadence
1. Round 306: PERF-3d.
2. REGRESSION, on or after 2026-11-05.
3. The rest of STUDIO-PERFORMANCE: PERF-COMMIT-RESCHEDULE, PERF-DRAG-PREVIEW, PERF-4…15 and PERF-HARNESS-SHARED-LIB.
4. **A bounded frontend-architect checkpoint request at the end of STUDIO-PERFORMANCE** (D-29z811): `StudioWorkspace.tsx` size, the prop chain into the clip view, GATE304-ARCH-ZOOM-LIVE-RULE and B-R303-PERF-HARNESS-METRIC-FAMILY.
5. STEM-LANES.
6. SYS-1…3.
7. STORE-2b…5.
8. REVIEW-RECOMMENDATIONS.
9. T12-ADVANCED.
10. The phase-2 entries (skip rule).

**Signals recorded, not scheduled:** PERF-3D-VERTICAL-GATE and PERF-3D-SCROLL-HARNESS-ROW. GATE304-INFO-REMOUNT was considered and not added.

**Ready for commit:** nothing new from `store/` this round. The loop-state commit carries the screen-review RT-FIX edit.

## 5. Not COMPLETE, not BLOCKED
- **Not COMPLETE:** PERF-3d and the rest of STUDIO-PERFORMANCE remain, as do every later queue entry, the deferred Lows, the parked Mediums, the awaiting-user items and SRW-21 (`deferred_user`).
- **Not BLOCKED:** nothing external is missing. `/studio-lab` needs no backend.

## 6. Files written by B this planning
- `current-task.md`, `tasks/round-305.md` (archive), `b-round-305.md`, `b-next.json`, `feature-status.md`, `backlog.json` (v265; `b-round-305/update-backlog.py`, one-shot), `user-review/screen-review-305.md` (RT-FIX), `b-round-305-r306-tree-sha256.txt`.
- `b-round-305/`: `checkpoint.md`, the claims script and output, the probes and their JSON, the sketch patch, the logs, the mutants, the WG test sketch, and the before-copies.
