# B — Round 117 result and Round 118 plan (D-29z83)

Author: B · Date: 2026-10-23 (~21:05–21:50 UTC) · Decision: **CONTINUE** · Next task: `current-task.md` (round 118)
- **Archive:** `tasks/round-117.md` is an exact copy of the round-117 task. It was made with `cp -n` and checked with `cmp` (ARCHIVE_OK) before `current-task.md` was overwritten.
- **Pre-edit copies:** `b-round-117/` holds `backlog.json`, `feature-status.md`, `b-next.json`, `b-round-91-checkpoint-request.md` and `plan.md` as they were before this planning. The update scripts are in `b-round-117/tools/`.

## 1. Inputs read (all treated as DATA)
- **Active context:** `context/active-summary.md`.
- **Round 117:** `current-task.md` (round 117), `a-round-117.md`, `c-round-117.md` and `c-round-117.json`.
- **Gate:** `gates/gate-round-117.json` (status **published**, commit `9cb820b`, both remotes), plus `gates/round-117/review.md` and the tail of `verify.log`.
- **Loop state:** `env-status.json` (store 200), `regression-last.json`, and the previous `b-next.json` / `b-round-116.md`.
- **Backlog:** looked up by ID only: the T12 entry, `open_findings`, `architecture_signals`, `deferred_low_polish` and `rounds`.
- **T12 source:** `next-stage-t12/gain-volume-source.txt` §T12.5, §T12.9 and §T12.24.
- **Ableton captures:** `b-round-78/ableton-mixing-20261022.txt` (§18.1, §18.3) and `b-round-71/ableton-shortcuts-20261021.txt` (§42.6).
- **Source, read only at `9cb820b`:**
  - `ArrangementGroupHeader.tsx`, `ArrangementLane.tsx` l.360–430 and l.770–815, `ArrangementMaster.tsx`;
  - `useRelativeFaderDrag.ts`, `fader.ts`, `track-volume-db.ts`;
  - `groups.ts` l.85–135, and the group volume callbacks and `previewVolumeTarget` in `ArrangementContext.tsx`;
  - tests: `track-group-mix-ui` (UM1–UM9), `track-volume-db` (TV11 and its helpers), `clip-gain-fader` CF11, `clip-gain-multi` MG6/MG13, `fader-touch` (group usage).

## 2. Round-117 result, from C's independent evidence
- **C PASS. `browserVerified: true`, `realVerified: true`.**
  - **Passed:** T117-TARGETED (370/370 + 38/38), LANE-WRITE-GREP, AN-REVIEW, SOURCE-SCOPE, TV-PRESENT, TV-DRAG, NB-GROUP (each at 1440 and 1280), G117-3, PX-NET/REG-HYD and DOC-100.
  - **Blocked:** the fake-Bearer 403 sub-check, because the backend is unavailable in the cloud. This does not affect `browserVerified`.
  - **Bugs:** none.
- **Gate 117 published `9cb820b`** (rounds 116 + 117) to both remotes.
  - Verify: 154 files / 2380 tests, and the build is OK.
  - Reviewer: 8.5/10, COMMIT OK.
- **Consequences:**
  - T12 stage 3a → **`c_pass_published`** (feature-status **მზადაა**). The real-audio evidence is from round 116, and round 117 proves the code is byte-identical: G-T3 0.501187, G-T4 1.412537, G-INF 0 non-zero samples.
  - C-R116-01 is done, GATE-116-SKIPPED is closed, and GATE115-S4 is done.
- **One C note:** one invalid 1440 setup run on the job's first load (`grid-control` null). It is inside the harness budget. It is not a finding.

## 3. Gate-117 reviewer findings → backlog
| Finding | Ruling |
|---|---|
| S1: doc 100 l.4/l.56/l.70 are stale | **GATE117-S1-DOC100-STALE** (Low), dispatched in round 118 as a three-line grant |
| S2: the linear-in-dB taper feels coarse | Signal **TRACK-VOLUME-TAPER**. Not requested; Shift fine in 3b addresses precision |
| S3: `volumeGestureStartRef` is never cleared | **GATE117-S3-START-REF-NOT-CLEARED** → `deferred_low_polish` (160). Round 118 owns the Lane file only for one option line, so B does not widen the grant |
| S4: `+0.0` vs `0.0 dB` | Already LANE-MASTER-ZERO-SIGN (deferred) |
| S5: text below the slider floor | Info, acknowledged |
| Architecture note (hook stored ↔ slider mapping) | `architecture_signals` ARCH-R117-HOOK-SLIDER-MAPPING → checkpoint addendum **(ac)**. Not scheduled; round 118 copies the pattern (second copy) |

## 4. Why round 118 is T12 stage 3b, in one round
- **Regression timing.** `regression-last.json` = 2026-10-21. `date -u` at this planning = 2026-10-23 21:04 UTC, which is 2 days; the rule is "3 or more days at the time B plans". So this planning is not a regression round. The prediction "next planning on/after 2026-10-24 = regression" carries over to **round 119**, which falls between 3b and stage 4.
- **Bug gate.** No Critical, High or Medium finding is open and reproducible in the cloud. C-R6-02, C-R8-01 and A-R73-SAFARI-FLAG-FOCUS are Tech-Lead-only under the root clarification.
- **Dependency order.** T12 V1 = stages 1, 2, 3a, 3b, 4. Stage 3b is next. FB-01..FB-16 / SRW items are all complete-for-gate or `deferred_user` (SRW-21).
- **One round versus a 3b-1/3b-2 split.** This is the round-115 lesson: B enumerated the grant from a full grep first.
  - **Group-fader users:** `track-group-mix-ui`, `track-volume-db`, `fader-touch`. `fader-touch` only checks that the value is unchanged after a touch, so it is scale-agnostic.
  - **Shift pins on Volume/Master:** only CF11 (`clip-gain-fader`) and TV11. MG13 has no Shift.
  - **Group-creating tests in the grid, marker and tempo files:** 0 `Volume` / valuetext matches.
  - **`e2e`:** 0 matches.
  - Every inverted pin is listed line by line in §2.1 of the task, so one stage fits one round.
- **The audio path is unchanged.** `setTrackGroupMix` only clamps the raw float to [0, 1]. So `trackVolumeFromDb(x)` is stored bitwise and `0` stays exact; the conversion is UI-only, as in 3a.

## 5. Uncertain UI contracts: the smallest honest behaviour (rationale)
- **Visible group readout (R2).**
  - B's own 3b scope line said "readout". The user's T12 text asks for dB volume, not for a header readout.
  - The SRW-17 contract (UM1) is that the group row adds no text and stays 28 px tall.
  - In the 224 px header the name has about 82 px at depth 0. A `w-10` readout leaves about 40 px at depth 0 and about 16 px at depth 2.
  - The group never had a visible `%` readout, so dB takes exactly the places the `%` had: the title and valuetext.
  - The visible readout is kept as the signal GROUP-VOLUME-VISIBLE-READOUT for DESIGN-UX-REVIEW. It is not dropped, and Tech Lead check R118-T asks the question.
- **Pan without Shift fine (R5).** The stage scope names the Volume faders. Pan's integer ±50 steps make ×10 a design question. Signal PAN-SHIFT-FINE.
- **Fine factor 10.** Live does not state the factor. 10 matches Clip Gain stage 1, so all the faders agree.

## 6. Risk found while planning: the TV11 anchor
- **What B saw:**
  - TV11 commits 0.72, and l.518 asserts the slider shows `-2.9`.
  - The plain −20 px result is pinned at `F(-16.4)`. That is −12 dB from **−4.4**, the fixture's 0.6.
  - CF11 confirms −4.4 for the 0.6 fixture: −25 px gives −19.4.
- **Possible meanings:** either B misreads the fixture or ordering, or a lane drag starts from a value other than the displayed one.
- **More evidence:** TV11 l.538 asserts the music readout `−4.4` after both drags are undone. That also points to the drags seeing 0.6. The only action in between is the Master drag (l.520).
- **What the task does:** B could not settle this without running tests, which B does not do. A triangulates three values (stored, display, anchor) after the Master drag. Outcome (b) becomes the finding **A-R118-TV11-ANCHOR**, with the observed values; the round continues. C adds the browser row TV-ANCHOR. B did not assume it is a bug.
- **Second advisor call:** it also found that the export rows had no window without music. G-GROUP-T3/INF now use the round-116 G-T3 method (music lane muted), plus a group-muted control pair.

## 7. Backlog changes (version 115 → **116**)
| ID | Before | After |
|---|---|---|
| T12-GAIN-VOLUME stage 3a | c_browser_pass_gate_blocked | **c_pass_published** (9cb820b) |
| T12-GAIN-VOLUME stage 3b | not_started | **dispatched** (round 118, D-29z83) |
| C-R116-01 | dispatched | **done** |
| GATE-116-SKIPPED | open_root | **closed** |
| GATE115-S4-DOC099-STATUS | dispatched | **done** |
| GATE117-S1-DOC100-STALE (Low) | — | dispatched round 118 |
| GATE117-S3-START-REF-NOT-CLEARED (Low) | — | `deferred_low_polish` (160) |
| TRACK-VOLUME-TAPER, GROUP-VOLUME-VISIBLE-READOUT, PAN-SHIFT-FINE | — | info signals |
| GATE117-S5-TEXT-BELOW-FLOOR, GATE118-NIT-FINE-CONST | — | info |
| ARCH-R117-HOOK-SLIDER-MAPPING | — | architecture signal → addendum (ac) |
| rounds | 116 c_fail_test_scope, 117 dispatched | 116 + 117 **c_pass_published**; 118 dispatched |
| baseline_tree_at_round118, R118-T | — | added |

- `regression-last.json` is unchanged: no regression round ran.
- SRW-21 stays `deferred_user`.
- `feature-status.md`: the header line, the round 116/117 line (3a → **მზადაა**, 3b → **მუშავდება**) and the T12 row.
- `plan.md`: the D-29z83 block, the 118 table row and the ownership line.

## 8. Architecture checkpoint
- ARCH-CHECKPOINT-PHASE1-BOUNDARY: (aa) and (ab) are still unanswered. **(ac)** was appended to `b-round-91-checkpoint-request.md`.
- It is non-blocking. Round 118 copies the lane pattern rather than wait, because the workflow says core features are not delayed for non-urgent structure.
- The useful moment for a root frontend-architect checkpoint is **after round 118**. That is the T12 V1 Volume boundary, and two copies of the capture will then exist.

## 9. Consultation
- The advisor was available and was used before writing. It confirmed the not-due ruling and asked B to:
  - check that group storage is raw (done: `groups.ts` l.121–124);
  - grep `shiftKey` and the group-fader selectors (done);
  - decide the readout question explicitly (R2);
  - note the UM5 product order (l.579 `F(-6) * F(-6)`).
- No project subagent was consulted. The rulings are mechanical scope and grant decisions, and the visible readout question goes to DESIGN-UX-REVIEW and the Tech Lead.

## 10. Ready for publication?
- Nothing new is pending. Rounds 116 and 117 are already published (`9cb820b`).
- Round 118 publishes after C PASS, the root gate's full verify and an independent review.
