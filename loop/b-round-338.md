# B round 338 → 339 planning (2026-11-04)

**Decision: CONTINUE.** Round 339 = **PERF-DRAG-PREVIEW stage c4-i**: a two-clip group move scenario in the interactions perf harness, recorded at HEAD. It is test-and-docs only (4 files). c4-ii (the fix) is measured against it.
- The task is in `current-task.md`.
- The round-338 task is archived as `tasks/round-338.md`, a byte-equal copy. `cmp` was checked right after copying, and again before `current-task.md` was overwritten.

## 1. Round 338 closed from evidence (D-29z1041)
- **C:** `c-round-338.json` PASS, `browserVerified` and `realVerified` true, 10 rows passed, 0 bugs. The six gate rows are not claimed.
- **Gate:** `gates/gate-round-338.json` is `published` `662ed42` on both remotes. **The baseline is `662ed42`.** It equals store HEAD, and the tree is clean. `context/head-sha.txt` still says `bbc281f`, because it was written before the gate; B used `git`.
- **Backlog:** PERF-DRAG-PREVIEW stage c3-ii → done.

## 2. Round-338 notes (D-29z1042)
| Id | Origin | Ruling |
|---|---|---|
| A-R338-REVIEW-CL2-SHARED-EMPTY, -IDENTITY-TRIM-TEST, -STORE-NAMES | A reviewer | `deferred_low_polish` (the identity-trim row is a c4-ii candidate) |
| GATE338-S1-IDENTITY-INVARIANT | gate #1 | open; carried as a ruling line into c4-ii, which adds the second preview writer |
| GATE338-S2-PROBE-HELPER | gate #2 | `deferred_low_polish` |
| GATE338-S3-STALE-LIVE-NOTE | gate #3 | fixed in round 339 (the budget file is granted, L7) |
| INFO-GATE338-S4-S5 | gate #4/#5 | info, closed |
| ARCH-R338-STORES-PROVIDER | gate Architecture note | signal, triggered by an 11th store; not scheduled |
| INFO-B337-ACLAIMS-K23 | B spec | info (planning gap: the A-CLAIMS exception list omitted K23); RETRO input |

There are no open Critical or High findings. The 5 open Mediums are root-only or manual, which the 2026-10-23 clarification says do not block. C reported no bugs, so there was no C bug to schedule first.

## 3. Why c4-i now (D-29z1043, D-29z1044)
- `regression-last.json` is 2026-11-02, and this planning ran on 2026-11-04 from 21:38 UTC, 2 days later. REGRESSION is due at the first planning on or after 2026-11-05, which is expected to be round 340.
- The next item in dependency order is PERF-DRAG-PREVIEW c4. The harness has no multi-selection move scenario (claims K4 = 0), so c4 is split as c3 was: c4-i adds the measurement, c4-ii makes the change.
- Nothing is dropped from scope. Architecture notes stay signals.

## 4. Premise and sketch (L37, L58)
- **Premise at HEAD** (`b-round-338/group-probe.mjs`, dev, 1440×900 and 1280×720):
  - 4 same-lane group moves render 106/104/104/104 components each, with the provider and `StudioWorkspace` rendered every time. A single-clip same-lane move costs 19.
  - Cross-lane group moves: 5 + 1 per move.
  - Blocked moves: 1 per move.
  - Release: 89.
- **Sketch** in `/home/runner/b338-scratch/sc` (a `git archive` of `662ed42`; `store/` untouched). Built by `apply-sketch.py`, `-v2.py` and `-v3.py`, plus `apply-budgets.py`. Final patches are in `b-round-338/sketch/`; both pass `git apply --check` on HEAD.
- **Results on the final sketch:**
  - typecheck rc 0; stdin format check equal; perf-lib 34/34.
  - Perf alone, production build: rc 0, 219 rows; **139/139 old non-wallclock rows EQUAL, 0 DIFF**, 18 NEW, 26 ids added and 0 removed, 45/45 asserted pass.
  - Group `move-components-per-move` is **74.781**, against the lane drag's 24.906. It is identical in all 6 passes.
- **Mutant MU-GROUP-SINGLE** (the Ctrl+click skipped): `drag-group-live` 0 in every pass, with (f), (a), (b) and (c) named 12× each. That is why the liveness row ships as `assert` (L58).
- **Claims:** `claims-339-planning-output.txt` (HEAD) and `claims-339-sketch-output.txt` (sketch). Both have empty stderr.

## 5. Consults (D-29z1046)
- **`tech-lead`** reviewed sketch v1, because `code-reviewer` is not on this phase's list.
  - TL-1 (Medium, (a) `< 2`) was fixed in v2 (`!== 2`).
  - TL-2…TL-6 (Low/Info) were applied in v2.
  - TL-7 (task text) is ruled in the task.
  - The table is in `b-round-338/sketch-review.md`.
- `performance-optimizer` was not consulted: all component rows are `record`. c4-ii consults it, together with `tech-lead`.
- **Advisor:** the configured advisor was available. It was consulted after orientation, before the sketch; its advice was the c4-i/c4-ii split, closure order and GATE338-S1 as a c4 ruling. The second call, before declaring done, is recorded in §10.

## 6. Side observation (info, D-29z1046)
- Mutant MU-GROUP-SINGLE exposed one behaviour, which B reproduced at HEAD on :5173 (`probe/back-lane-1440-sel0.json` / `-sel1.json`).
  - **The case:** another clip starts at the dragged clip's end. A single-clip drag goes to the next lane, then comes back to its own lane, where every position is blocked. It keeps the last valid lane target (`keptGhosts`), and release moves the clip to the next lane.
  - **Without the second clip,** the clip returns to its own lane.
- This is the existing rule that a blocked position keeps the last valid placement. It is not a regression and not part of c4. It is recorded as INFO-B338-BLOCKED-BACK-KEEPS-LANE-TARGET, a product-question candidate. No Ableton source was checked, so no conformance claim is made.

## 7. Policy checks
- **No full suite for A or C:** the gate rows stay in `"gate"`.
- **`browserVerified`:** PERF, GROUP-NAMES and G339-AUTH all run in the cloud. None needs the backend.
- **Protected files:** 11/11 (K8). The purchase guard is re-checked in the browser (G339-AUTH). The anonymous `/studio-lab` demo opens.
- **Reference-first, product-designer, screen budget and YouTube request:** not applicable. This is a measurement round; nothing visible changes.
- **Saba-reported issues:** none new. There is no new user-review decision file to schedule.

## 8. Commit readiness
- Round 338 is published (`662ed42`).
- Round 339 is one 4-file test-and-docs change, ready for the normal gate after C PASS.

## 9. Housekeeping
- **Backups:** `b-round-338/backlog-before-339.json`, `feature-status-before-339.md`, `b-next-before-339.json` and `regression-last-before-339.json` (unchanged).
- **Scripts:** `update-backlog.py` (v297 → v298, once-only marker `update-backlog.done`) and `update-feature-status.py`.
- **Scratch:** `/home/runner/b338-scratch/{sc,mu}` is outside `store/` and does not survive the job. Every result C needs is under `b-round-338/`.
  - The v1 runs are kept as `*-v1*`.
  - No second dev server was started; the root :5173 server was only read.
- `lessons.md` is unchanged. This is not a RETRO round, and no Saba-found issue came in.
- `context/active-summary.md` is left to root.

## 10. For root
- Checkpoint D-29z915 is still unanswered (SIG-R331/SIG-R332, deadline the close of c5).
- B will request the bounded frontend-architect checkpoint at the close of stage c (after c5). If c4-ii adds an 11th store, B requests it at c4-ii planning (ARCH-R338-STORES-PROVIDER).
- ROOT-REQ-VITEST-PERF-INCLUDE (= GATE304-M1) and R80-RECORDINGS-FIELD-BORDERS remain open.

## 11. Advisor (second call)
- The configured advisor was called again before declaring done. Its fix was applied: A-PERF and C's PERF row now compare only the 18 non-wallclock new rows with §0.3 and report the 8 wallclock group rows (L37). GROUP-NAMES now names its compared fields and the L38 cold-start clause. Nothing else changed.
