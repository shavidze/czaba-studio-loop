# B round 405 → 406 planning (2026-11-08)

**Decision: CONTINUE.** Round 406 is **PERF-11c-iii-d-i**, built from B's reviewed sketch. The task is in `current-task.md`. The round-405 task is archived as `tasks/round-405.md`. It is a byte-equal copy, not a move (`b-round-405/current-task-before-406.md`, K19).

## Inputs read
- `context/active-summary.md`.
- The round-405 set: `current-task.md`, `a-round-405.md`, `c-round-405.md` and `c-round-405.json`.
- `gates/gate-round-405.json`: status **published**, commit **5c89a95** on both remotes. Also `gates/round-405/review.md` (5 suggestions and an Architecture note).
- The L4/L11/L49/L55/L57/L58/L59 entries of `lessons.md`. Backlog ids were looked up by id only.
- `regression-last.json` says 2026-11-07, so the next regression is due on or after 2026-11-10. This is not a regression round.
- **Baseline for round 406:** 5c89a95. `context/head-sha.txt` (dd52107) is stale.

## Advisor and consults
Availability is reported truthfully.
- **Advisor:** available. Used before the approach was fixed. It set the order: housekeeping first, then the backlog from C evidence, the checkpoint default, consults and a re-measurement, and the sketch last.
- **`tech-lead`**, two real read-only runs:
  1. Scope consult (`b-round-405/consult-tech-lead.md`): split d into d-i and d-ii; 34 → 36 keys; no const tuple; the stopped-video correctness trap for d-ii.
  2. Sketch review on the dispatched sha `60bdf24c…` (`b-round-405/sketch-review.md`): **no Critical, High or Medium**, and 5 Lows, all ruled.
- **`performance-optimizer`**, one real run (`b-round-405/consult-performance-optimizer.md`):
  - It recommends shape (a) for d-ii, with the same trap.
  - It preferred separate props over widening the actions. B ruled that down (D-29z1405), with reasons in the task.
- **Not needed:** `product-designer` and `ableton-arrangement-expert`. This is a perf/refactor round with no visible change, which the reference-first rule excludes.

## C acceptance (independently evidenced) → backlog v375 → v377
Scripts: `b-round-405/update-backlog.py` and `update-backlog-2.py`, each with a `.done` file. The backup is `b-round-405/backlog-before-406.json`. Decisions: D-29z1403…D-29z1407.
- **SYS-R385 stage 2 (round 405) is done, so SYS-R385 is done.**
  - C PASS on 7 rows, with `browserVerified` and `realVerified` true and `failed` [].
  - The 14 mutants are RED on the tree.
  - The gate published 5c89a95.
- **Closed:**
  - C-R404-A-AC1-COVERAGE, A-R404-REVIEW-AC2-ALL-KEYS, A-R404-REVIEW-LIBRARY-PARAM, B-R374-MASTER-VACUOUS-NAME-COUNTS, A-R371-REVIEW-GH5-IDENTITY, TL-R403-SK2-L1 and TL-R403-SK2-L2.
  - GATE371-L2 and GATE375-L2 per D-29z1399: C's `mutantRedOnTree` shows the 4 comparator mutants red.
- **Ruled, D-29z1404:**
  - **C-R405-GH5-NOT-G1-VACUOUS is Low.** A's reviewer said Medium and C said Low. Low matches D-29z1397 for the same class. It goes to `deferred_low_polish` with its fix written; round 406 does not own that test file.
  - **Gate-405 items:**
    - item 1 is the same finding;
    - item 2 → GATE405-L2-AC7-LOAD-FLUSH (deferred);
    - item 3 is closed as the intended pin;
    - A's meter-ui name Low is deferred;
    - item 5 (teardown) is info only.
  - **Architecture note:** a further echo on TL-R403-SK-L1. It is a signal, not a task, and is ruled in D-29z1405.
- **Still open evidence:** the fake-bearer token row stays BLOCKED (backend unavailable in the cloud).

## Round 406 pre-dispatch work
Done in scratch `/tmp/b406-sketch`. `store/` is untouched (K2 = 0).
- **HEAD re-measure:** `probe/leaf-head-406.json`. VideoDock renders 1 per commit plus play/stop, at both viewports.
- **Sketch:** `sketch-406.patch.txt`, sha `60bdf24c…`, 3 files. It adds 2 action keys, moves the dock's getters to actions, and sets AC7 to 36.
- **Checks on the sketch:**
  - tsc and Biome: rc 0.
  - Covering files: 180/180.
  - **Full vitest: 262 files, 3878 tests, rc 0.**
  - Mutants: 4/4 red.
  - Dev leaf probe: **0 differences** against HEAD.
  - Real-video playsync: max |drift| 0.013 s on HEAD and on the sketch. The 1440 run hit one cold-server timeout and was retried; that log is kept as `video/sketch-1440x900-cold-timeout.log`.
- **Claims:** `claims-406.sh`. The planning and sketch outputs are saved, and the diff covers only the lines the patch changes.
- **Grants and frozen files:**
  - grants: `grants-406.txt` (4 paths);
  - frozen: `r406-frozen-sha256.txt` (1,296 entries);
  - protected: none granted.

## Order after round 406 (D-29z1407)
1. d-ii (VideoDock memo inner + committed video-clip signal).
2. PERF-11c-iii-e (Lane).
3. PERF-15.
4. SYS-R2-FAKE-FIDELITY + SYS-R388, then SYS-CLOCK-DETERMINISM, then SYS-R369.
5. STEM-LANES.
6. SYS-1…3.
7. STORE-2b…5 (the direction gate applies).
8. REVIEW-RECOMMENDATIONS.
9. T12-ADVANCED.
10. Phase 2 (skip rule).

REGRESSION-2026-11-10 comes first, at the first planning on or after 2026-11-10. The next RETRO is at round 416.

## Architecture checkpoint
- ARCH-CHECKPOINT-SYS-R385-ACTIONS is still unanswered by root.
- Its default (option 1) is applied and recorded (D-29z1405). The request stays open and non-blocking.
- Lane (e) is the third round to touch the action list, so B will rule TL-R403-SK-L1 again at e's planning.

## Files B wrote
All are planning artifacts only.
- `current-task.md`, `tasks/round-405.md` (copy), `backlog.json` (v377), `feature-status.md`, `b-round-405.md` and `b-next.json`.
- Under `b-round-405/`: checkpoint, backups, consults, probe, video, sketch, mutants, review, claims, grants, frozen files and the backlog scripts.

No app source and no other agent's files changed. The scratch copy and its temporary dev server (port 5174, stopped) were outside `store/`. The store dev server on 5173 was used read-only and is still up.

## Ready to publish?
Round 405 is already published (5c89a95). If C passes round 406, d-i is ready for root's gate. It is an intermediate stage; the dock's render saving comes in d-ii.
