# B round 407 → 408 planning (2026-11-08)

**Decision: CONTINUE.** Round 408 is **PERF-11c-iii-e-i**, built from B's reviewed sketch. The task is in `current-task.md`.

The round-407 task is archived as `tasks/round-407.md`. It is a byte-equal copy, not a move (`cp -n`; `cmp` equal; K19). A second copy is in `b-round-407/current-task-before-408.md`. Backups: `b-round-407/backlog-before-408.json`, `feature-status-before-408.md`, `b-next-before-408.json`.

## Inputs read
- `context/active-summary.md`; `lessons.md` in full.
- The round-407 set: `tasks/round-407.md` (the former `current-task.md`), `a-round-407.md`, `c-round-407.md` and `c-round-407.json`.
- `gates/gate-round-407.json`: status **published**, commit **5508f70** on both remotes. Also `gates/round-407/review.md` (COMMIT OK, 8.5/10, 2 Lows + 2 infos, an Architecture note).
- Backlog ids looked up by id only: the STUDIO-PERFORMANCE stages and queue, the deferred Lows TL-R403/R406/R407, ARCH-CHECKPOINT-SYS-R385-ACTIONS, and `user-review/questions-arch-leaf-plumbing.md` for the e scope. The full original backlog FB-01…FB-16 was not re-read: the D-29z1410 queue order still stands, and nothing in round 407 changed it.
- `regression-last.json` says 2026-11-07, so the next regression is due on or after 2026-11-10. This is not a regression round.
- **Baseline for round 408:** 5508f70 (gate 407 published). `context/head-sha.txt` says 8ac5bfb, which is stale.
- Store direction decision exists (`docs/technical/store-redesign/direction-decision.md`), but STORE-2b…5 stay behind STUDIO-PERFORMANCE in the 2026-10-27 order.

## Advisor and consults
Availability is reported truthfully.
- **Advisor:** available, and used twice: before the approach was fixed, and before hand-off. It set the plan:
  1. split e like d, and dispatch only e-i;
  2. fold the actions-region Lows deferred to this planning;
  3. trace the transitive deps of the new keys, including the `collection.sources` coupling;
  4. take the measured premise from the leaf probe;
  5. get fresh `performance-optimizer` and `tech-lead` consults;
  6. add a browser row that drives the Lane's callbacks, with a mutant.
- **`performance-optimizer`:** one real read-only run on the split (`b-round-407/consult-performance-optimizer.md`). e-i is sound; there is no cheaper split. It also gave the e-ii design and its mutant/row list. It left `requestSourcePeaks`/`resyncAfterDecode` untraced; B traced them (`deps-trace.txt`).
- **`tech-lead`:** one real read-only review of the dispatched sha `029e5f8a…` (`b-round-407/sketch-review.md`). Verdict **APPROVE WITH LOWS**, no Critical, High or Medium; 3 Lows, 6 infos and 9 equivalent mutants, all ruled.
- **Not needed:** `product-designer` and `ableton-arrangement-expert`. This is a perf/refactor round with no visible change, which the reference-first rule excludes.

## C acceptance (independently evidenced) → backlog v379 → v381
Scripts: `b-round-407/update-backlog.py` and `update-backlog-2.py`, each with a `.done` file.

- **D-29z1412: PERF-11c-iii-d-ii is done.** The basis is `c-round-407.json`:
  - `taskStatus` PASS, 9 rows passed, `failed` [], `bugs` [];
  - `browserVerified` and `realVerified` true;
  - stopped-seek error 0 on all 4 steps at both viewports;
  - drift 0.008/0.013 s;
  - leaf probe 0 differences;
  - 7/7 mutants RED on C's committed scratch;
  - gate 407 published 5508f70.

  With this, PERF-11c-iii-d (VideoDock) is complete. The fake-bearer row stays BLOCKED (backend unavailable in the cloud) and remains open evidence. Floating-box pointer drag was unit-covered only, and that is recorded.
- **D-29z1413: the reviewer findings.**
  - **R406-CR-L3** is closed (row 4 VIDEO-SYNC PASS).
  - **TL-R407-SK-L1** gets the wider title A reported, plus A's suggested test row.
  - **New deferred Lows:**
    - A-R407-REVIEW-RENDER-PHASE-REGISTRY: A's reviewer Low 2 and Info 5 together with gate-407 item 1;
    - A-R407-REVIEW-L4-CAPTION-VIEW-NAME, a test-selector Low whose fix home is the next owner of drag-preview-render.
  - Gate-407 items 3 and 4 are infos and are closed.
  - **Architecture notes:** both reviewers say "keep". They are recorded as SIG-R407-VIDEO-LANE-STORE: extract only when a second consumer appears. Not scheduled.
  - The fourth keep-echo is recorded on ARCH-CHECKPOINT-SYS-R385-ACTIONS, which stays non-blocking.

## Round 408 pre-dispatch work
All of it was done in the scratch `/tmp/b408-sketch` and on a sketch dev server at :5174 with its own Vite `cacheDir` (L38). The server is now stopped. `store/` is untouched (K2 = 0), and the root server at :5173 still answers 200.

**Sketch:**
- File: `sketch-408.patch.txt`, sha `029e5f8a…`, 3 files.
- Reproducible with `tools/make-sketch.py` + `tools/make-sketch-tests.py` + `biome format`.

**Checks on the sketch:**
- tsc and Biome: rc 0.
- Covering set: 46 files, 911/911; the slowest test is at 21.8 % of its timeout.
- **Full vitest: 262 files, 3,882 tests, rc 0.**
- Mutants: 5/5 red; the pristine runs give rc 0.

**Browser:**
- **Leaf probe:** 0 differences against HEAD over 24 leaves × 13 steps × 2 viewports. Lane `[0,12,4,4,0,0,0,4,4,4,4,4,8]`.
- **New LANE-ACTIONS probe:** mute and solo with Ctrl+Z, volume and pan drags, Undo ×2, active track. It is `ok` on HEAD and on the sketch at both viewports, and the MISMAP-SOLO mutant fails its solo step.
- One cold-start timeout was kept as evidence; the retry passed.
- The probe's `active-track` step records no value before its click, and the clicked lane was likely already active. The advisor flagged this at hand-off. Task row 3 now calls it a non-regression check, and B-R408-PROBE-ACTIVE-TRACK-VACUOUS (Low, deferred) is fixed in the e-ii probe.

**Claims:** `claims-408.sh`. The planning and sketch outputs are saved, with empty stderr, and their diff covers only the lines the patch changes (K1, K5, K7–K10, K13).

**Grants and frozen files:**
- grants: `grants-408.txt` (4 paths);
- frozen: `r408-frozen-sha256.txt` (1,298 entries);
- protected: none granted.

**Docs:** new doc 261 with `In Progress (stage 1 of 2; C round 408 PASS)`.

**Folded Lows (D-29z1414):**
- TL-R406-SK-L1: AC7 takes its keys from the Pick.
- TL-R406-SK-L2/L3: the `livePosition` rename.

  All three are `fix_dispatched` and close on C round 408 PASS. TL-R403-SK-L1 stays deferred; `tech-lead` re-confirmed it.

## Order after round 408 (D-29z1415)
1. PERF-11c-iii-e-ii, the Lane memo inner. Its design and rows are in `b-round-407/consult-performance-optimizer.md`. B sketches it, then runs the mutants and browser rows and gets a review before dispatch.
2. PERF-15.
3. SYS-R2-FAKE-FIDELITY + SYS-R388.
4. SYS-CLOCK-DETERMINISM.
5. SYS-R369.
6. STEM-LANES.
7. SYS-1…3.
8. STORE-2b…5 (direction gate).
9. REVIEW-RECOMMENDATIONS.
10. T12-ADVANCED.
11. Phase 2 (skip rule).

REGRESSION-2026-11-10 comes first, at the first planning on or after 2026-11-10. The next RETRO is at round 416.

**Architecture checkpoint:** e-ii closes the whole PERF-11c-iii leaf-plumbing boundary. At the e-ii planning, B writes the bounded `frontend-architect` checkpoint request for root. The checkpoint covers:
- the actions region: 59 keys and four keep-echoes;
- the dock's commit bus (SIG-R407-VIDEO-LANE-STORE);
- whether the Lane's data should come from stores.

Nothing is requested now; the existing ARCH-CHECKPOINT-SYS-R385-ACTIONS stays open and non-blocking.

## Pending root patches
There are none. `cloud/root-commits/` and `root-deps-request.json` do not exist in the loop folder. The task tells A what to do if HEAD moves anyway.

## Commit readiness
Round 407 is published. After C PASS, round 408 is ready for root's gate. Root still runs the full verify and the review; the 4 granted paths are listed in `grants-408.txt`.

## Files B wrote
- `current-task.md`, `tasks/round-407.md` (archive copy), `b-round-407.md` and `b-next.json`.
- `feature-status.md`: the header, a Round 407 "მზადაა" line, the round 408 line and the STUDIO-PERFORMANCE row.
- `backlog.json`: v381.
- `b-round-407/`:
  - checkpoint, backups and update scripts;
  - tools, the sketch patch and its sha;
  - sketch-review, the consult, the deps trace;
  - claims (script, outputs, diff), grants, frozen list;
  - mutants (runner, logs, summary), probe, lane, sketch-logs and precheck-full.
