# B round 406 → 407 planning (2026-11-08)

**Decision: CONTINUE.** Round 407 is **PERF-11c-iii-d-ii**, built from B's reviewed sketch. The task is in `current-task.md`.

The round-406 task is archived as `tasks/round-406.md`. It is a byte-equal copy, not a move (`cp -p`, `cmp` equal; K19). A second copy is in `b-round-406/current-task-before-407.md`.

## Inputs read
- `context/active-summary.md`.
- The round-406 set: `tasks/round-406.md` (the former `current-task.md`), `a-round-406.md`, `c-round-406.md` and `c-round-406.json`.
- `gates/gate-round-406.json`: status **published**, commit **8ac5bfb** on both remotes. Also `gates/round-406/review.md` (COMMIT OK, 3 Lows + 1 info, an Architecture note).
- The L4/L11/L26/L28/L31/L49/L55/L57/L58/L59 entries of `lessons.md`.
- Backlog ids were looked up by id only. The full original backlog FB-01…FB-16 was not re-read: the queue order of D-29z1407 still stands and nothing in round 406 changed it.
- `regression-last.json` says 2026-11-07, so the next regression is due on or after 2026-11-10. This is not a regression round.
- **Baseline for round 407:** 8ac5bfb (gate 406 published). `context/head-sha.txt` may be stale.

## Advisor and consults
Availability is reported truthfully.
- **Advisor:** available, and used twice: before the approach was fixed, and before hand-off. It set the order:
  1. the backlog first, from C evidence;
  2. fix the two task-text defects C reported (a `data-video-hardseeks` attribute that does not exist; a stopped-seek row with no recipe);
  3. check `sameClipList` and the L49 side effects;
  4. write the R406-CR-L2 ruling line;
  5. a full sketch with a browser stopped-seek recipe run against a mutant;
  6. no downgrade of the correctness row to `record`.
- **`tech-lead`:** one real read-only run, a review of the dispatched sha `4ec62e31…` (`b-round-406/sketch-review.md`). **No Critical, High or Medium.** It found 2 Lows, 1 info and 5 equivalent mutants, all ruled.
- **Not needed:**
  - `performance-optimizer`: its d-ii consult from round 405 (`b-round-405/consult-performance-optimizer.md`) was used as input. The sketch goes further than that consult's "inner = 1 on a video Undo": with the commit notify, the inner renders 0 on a video Undo too.
  - `product-designer` and `ableton-arrangement-expert`: this is a perf/refactor round with no visible change, which the reference-first rule excludes.

## C acceptance (independently evidenced) → backlog v377 → v379
Scripts: `b-round-406/update-backlog.py` and `update-backlog-2.py`, each with a `.done` file. The backup is `b-round-406/backlog-before-407.json`.

- **D-29z1408: PERF-11c-iii-d-i is done.**
  - C PASS on 8 rows, `failed` [], `bugs` [], `browserVerified` and `realVerified` true.
  - Video drift 0.006/0.011 s; leaf probe 0 differences; 4/4 mutants RED on C's committed scratch.
  - Gate 406 published 8ac5bfb.
  - The fake-bearer row stays BLOCKED (backend unavailable in the cloud) and remains open evidence.
- **D-29z1409:**
  - **R406-CR-L1** (info) is closed.
  - **R406-CR-L2** became the d-ii ruling line, which closes it (D-29z1411).
  - **R406-CR-L3** closes on C round 407 row 4.
  - Gate-406 review items 2 and 3 equal the deferred TL-R406-SK-L2/L1.
  - **Architecture note, third keep-echo** on the actions region (gate 405, A's reviewer in round 406, gate 406). It is recorded on ARCH-CHECKPOINT-SYS-R385-ACTIONS as a signal, with the concrete proposal: after d-ii, the const-tuple key derivation plus the `livePosition` rename, with AC7 free of a hardcoded count and no type assertion. It is not scheduled; B rules it again at the PERF-11c-iii-e planning.

## Round 407 pre-dispatch work
All of it was done in the scratch `/tmp/b407-sketch` and on a sketch dev server at :5174, which is now stopped. `store/` is untouched (K2 = 0).

**Sketch:**
- File: `sketch-407.patch.txt`, sha `4ec62e31…`, 2 files.
- It is reproducible with `tools/make-sketch.py` + `tools/make-sketch-tests.py` + `biome format`.
- Design: a memo inner for the dock box, a memo caption, the reader keyed on `videoTrackId`, and a video-lane commit signal.

**Checks on the sketch:**
- tsc and Biome: rc 0.
- Covering set: 16 files, 360/360.
- **Full vitest: 262 files, 3,881 tests, rc 0.**
- Unit mutants: 7/7 red. Dropping the commit notify also turns the existing DP70 and DP72 red.

**Browser:**
- **Leaf probe** (`probe/leaf-probe-407.mjs`, which adds the leaves `ArrangementVideoDockViewInner` and `ArrangementVideoCaption`):
  - the caption goes from `[0,3,1,1,1,0,1,1,1,1,1,1,2]` to all 0 at both viewports;
  - the dock shell is unchanged.
  - The first sketch run at 1440 hit a cold-server timeout. It is kept as `probe/leaf-sketch-407-cold-timeout.*`, and the retry passed.
- **New stopped-seek recipe** (`video/video-stopped-seek-probe.mjs`), on HEAD and on the sketch at both viewports, with error 0. The commit-notify mutant, run in the browser via HMR, gives error **1.5 s** after Ctrl+Z.
- **Play drift:** 0.008/0.012 s.

**Claims:** `claims-407.sh`. The planning and sketch outputs are saved, and their diff covers only the lines the patch changes.

**Grants and frozen files:**
- grants: `grants-407.txt` (4 paths);
- frozen: `r407-frozen-sha256.txt` (1,297 entries);
- protected: none granted.

**Docs:** new doc 260 with `Completed (C round 407 PASS)`, and doc 259 l.4 set to Completed (L28, final stage).

## Order after round 407 (D-29z1410)
1. PERF-11c-iii-e (Lane). B rules again there on the actions-region echoes and TL-R403-SK-L1.
2. PERF-15.
3. SYS-R2-FAKE-FIDELITY + SYS-R388, then SYS-CLOCK-DETERMINISM, then SYS-R369.
4. STEM-LANES.
5. SYS-1…3.
6. STORE-2b…5 (the direction gate applies).
7. REVIEW-RECOMMENDATIONS.
8. T12-ADVANCED.
9. Phase 2 (skip rule).

REGRESSION-2026-11-10 comes first, at the first planning on or after 2026-11-10. The next RETRO is at round 416.

**Architecture checkpoint:** d-ii closes the VideoDock feature boundary. The open root request ARCH-CHECKPOINT-SYS-R385-ACTIONS covers the next one (Lane, e). It is non-blocking, and its default stands.

## Pending root patches
There are none. `cloud/root-commits/` and `root-deps-request.json` do not exist in the loop folder. The task tells A what to do if HEAD moves anyway.

The second advisor pass also added two task items:
- labels for the HEAD line numbers;
- the render-budget positive-control ruling.

## Commit readiness
After C PASS, round 407 is ready for root's gate. Root still runs the full verify and the review; the 4 granted paths are listed in `grants-407.txt`.

## Files B wrote
- `current-task.md` and `tasks/round-406.md` (archive copy).
- `b-round-406.md` and `b-next.json`.
- `feature-status.md`: the header, a new Round 406 "მზადაა" line, the round 407 line, and the STUDIO-PERFORMANCE row.
- `backlog.json`: v379.
- `b-round-406/`: checkpoint, backups, update scripts, tools, sketch patch + sha, sketch-review, claims (script, outputs, diff), grants, frozen list, mutants (runner, logs, summary), probe, video, sketch-logs and precheck-full.
