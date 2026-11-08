# B round 404 → 405 planning (2026-11-08)

**Decision: CONTINUE.** Round 405 is **SYS-R385-LEAF-ACTIONS-CONTEXT stage 2 of 2**, built from B's reviewed sketch. The task is in `current-task.md`. The round-404 task is archived as `tasks/round-404.md`, byte-equal to the round-404 `current-task.md`; it was copied, not moved (`b-round-404/current-task-before-405.md`, K20).

## Inputs read
- `context/active-summary.md`; the round-404 trio `current-task.md`, `a-round-404.md`, `c-round-404.md` and `c-round-404.json`.
- `gates/gate-round-404.json`: status **published**, commit **dd52107** on both remotes. Also `gates/round-404/review.md` (4 Low + an Architecture note) and the `verify.log` timings.
- `lessons.md`, `b-round-403.md`, `user-review/questions-arch-leaf-plumbing.md`; backlog ids by lookup only.
- `regression-last.json` says 2026-11-07, so the next regression is due on or after 2026-11-10. This is not a regression round.
- **Baseline for round 405:** dd52107 (the gate-404 commit). `context/head-sha.txt` (cc5cbc6) is stale; it was written before the gate.

## Advisor and consults (availability reported truthfully)
- **Advisor:** available, used before the approach was fixed and before hand-off.
  - It set the order of work: housekeeping first, then the backlog from C evidence only, wrapper deletion to Saba, a tech-lead consult on the comparator shape, L58 sketch evidence, the final-stage doc, and the C row-4 marker loose end.
- **`tech-lead`:** three real read-only runs.
  1. Comparator consult (`b-round-404/consult-tech-lead-stage2.md`): close both comparator Lows as covered, with no production change. A type rule cannot reject `Object.is`, which is typed `(any, any) => boolean`.
  2. Sketch review pass 1, on v1 `9158d333…`: no Medium+, 4 Lows.
  3. Delta review pass 2, on the final sha `c64a5589…`: **"no Medium+ … dispatch as is"** (`b-round-404/sketch-review.md`).
- **Not needed:** `performance-optimizer` (no runtime change), `product-designer` and `ableton-arrangement-expert` (test and refactor round; reference-first excludes it).

## C acceptance (independently evidenced) → backlog v373 → v375
Scripts: `b-round-404/update-backlog.py` and `update-backlog-2.py` (marker-seek carry into REGRESSION-2026-11-10), each with a `.done` file; the backup is `backlog-before-405.json`). Decisions D-29z1396…D-29z1402.
- **SYS-R385 stage 1 (round 404): done.**
  - C PASS on 8 rows, `browserVerified`/`realVerified` true, gate published dd52107.
  - B ran the L57 checker on `c-round-404.json`: OK (`b-round-404/l57-check-c404.txt`).
  - The fake-bearer token row stays BLOCKED (backend unavailable in the cloud) as open evidence.
- **Closed:** GATE379-L3, GATE378-L2 (D-29z1393 scope only) and GATE377-L1. C-R404-B-LOOP-OFF-WORDING is closed as a B wording error; L29 already covers it, so no new lesson.
- **Ruled (D-29z1397):** C-R404-A-AC1-COVERAGE = **Low**. A's reviewer said Medium, C said Low.
  - It is a coverage gap in a dispatched test, with no behaviour impact.
  - A did not edit it because reviewed = dispatched.
  - Fix home is round 405, AC7, together with A-R404-REVIEW-AC2-ALL-KEYS, which is the same gap as gate-404 item 1.
- **To `deferred_low_polish`:** GATE404-L2-REDUNDANT-HOOK-MEMO and GATE404-L3-HOOK-PARAM-SAME-TYPE. The gate-404 Architecture note (one `const` tuple for the 34 keys) is an echo on TL-R403-SK-L1, not a new task.
- **To Saba (D-29z1398):** GATE375-L1, deleting the test-only wrappers, as SABA-Q-UNUSED-LEAF-WRAPPERS (`user-review/questions-unused-leaf-wrappers.md`, `awaiting_user`). CLAUDE.md requires owner permission for a deletion. The loop does not wait for it.
- **INFO (D-29z1401):** C's row 4 put the marker at 0 s, so Next marker fell back to the project end (19.000 s = clip at 3 s + 16 s; `adjacentMarkerTarget` end fallback). This is not a bug. The marker-seek half of the row was not exercised, and the next marker-seek C row must place the marker at a non-zero time.

## Round 405 pre-dispatch work (scratch `/tmp/b405-sketch`, `/tmp/b405-apply`; `store/` untouched, K2 = 0)
- **Sketch v2:** `b-round-404/sketch-405.patch.txt`, sha256 `c64a5589…`, 6 files:
  - AC7 and the AC4 markers freeze;
  - FP0 and the live name in fader-pointer-preview;
  - master-ui: the live name, plus a counts clear (the old positive control was fed by the previous test's mount, a second vacuity B found while running the mutant);
  - render-budget RB-LEAF1: the vacuous line removed;
  - GH5 group ids;
  - the Library hook parameter rename.
- **Checks on v2:**
  - Mutants: **14/14 red**. The 4 gap mutants keep AC1/AC2 green, the pristine runs pass before and after on all 5 files, and scratch status is 0.
  - `tsc`, `lint` and Biome: rc 0.
  - **Full vitest: 262 files / 3878 tests, rc 0** (`precheck-full.log`; 3876 + AC7 + FP0).
  - No perf spec: the only runtime change is a local parameter name (record only, L58).
- **Comparators (D-29z1399):** 4 mutants show that GH2 and RB-LEAF3 already catch both regression classes. They close on C's mutant row on the tree.
- **Claims:** `b-round-404/claims-405.sh`, 32 output lines (K1–K21 plus sub-claims), stderr empty. Planning and sketch outputs are saved; the diff covers only the lines the patch changes (`claims-405-planning-vs-sketch.diff`).
- **Grants and frozen files:** grants `grants-405.txt` (7 paths); frozen `r405-frozen-sha256.txt` (1,292 entries); all 11 protected files are frozen and unchanged.
- **Doc 258** is the final-stage doc, so its l.4 becomes `Completed (C round 405 PASS)`. The other 7 `In Progress (stage` docs belong to open stages (PERF-14, PERF-DRAG-PREVIEW, PERF-12b, PERF-11c).

## Order after round 405 (D-29z1402)
1. PERF-11c-iii-d (VideoDock), then PERF-11c-iii-e (Lane). Both are unblocked by SYS-R385.
2. PERF-15.
3. SYS-R2-FAKE-FIDELITY + SYS-R388, SYS-CLOCK-DETERMINISM, SYS-R369.
4. STEM-LANES, then SYS-1…3.
5. STORE-2b…5 (the direction gate still applies), REVIEW-RECOMMENDATIONS, T12-ADVANCED, then phase 2 (skip rule).

REGRESSION-2026-11-10 comes first, at the first planning on or after 2026-11-10.

## Architecture checkpoint
SYS-R385's end is a feature boundary, and d/e would add the most action fields to one owner. B requested a bounded, non-blocking frontend-architect checkpoint, **ARCH-CHECKPOINT-SYS-R385-ACTIONS** (`b-round-404/root-request-arch-checkpoint-sys-r385.md`). It asks whether to extend `ArrangementActions` for VideoDock and Lane or keep pattern A, and whether to keep the triple listing of the 34 keys. With no answer by d's planning, B uses the B-actions default.

## Files B wrote (planning artifacts only)
- `current-task.md`, `tasks/round-404.md` (copy), `backlog.json` (v375), `feature-status.md`, `b-round-404.md`, `b-next.json`.
- `user-review/questions-unused-leaf-wrappers.md`.
- `b-round-404/*`: sketch, mutants, claims, reviews, consult, grants, frozen manifest, root request, checkpoint and backups.
- No app source or other agents' files changed. Scratch copies `/tmp/b405-*` are outside `store/`. The first full-suite run was stopped by B because the sketch changed mid-run; the reported run is the second, on the final sha.

## Ready to publish?
Round 404 is already published (dd52107). If C passes round 405, SYS-R385 is complete and ready for root's gate.
