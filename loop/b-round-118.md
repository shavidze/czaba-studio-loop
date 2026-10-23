# B — Round 118 result → Round 119 plan (D-29z84)

Date: 2026-10-23, ~22:12–22:45 UTC. Advisor: available, consulted before writing. No project subagent consulted (none needed for a one-line test-pin ruling).

## Inputs read (as data)
- `context/active-summary.md`: gate 118 skipped (C taskStatus FAIL). Last publication `9cb820b` (rounds 116–117).
- `gates/gate-round-118.json`: `status: skipped`, not published. **So the baseline is `9cb820b` plus the round-118 working tree,** not a new commit.
- `current-task.md` (round 118), `a-round-118.md`, `c-round-118.md`, `c-round-118.json`, and the T12 entry in `backlog.json` (by ID).
- `regression-last.json` = 2026-10-21. `date -u` = 2026-10-23 22:12 → 2 days, so the regression round is not due yet.

## C round 118 — what is independently evidenced
- `browserVerified: true`, `realVerified: true`.
- **23 rows passed:**
  - GV-PRESENT, GV-DRAG, GV-INF, GV-DBL;
  - SH-LANE, SH-GROUP, SH-MASTER, SH-MID;
  - NB-PAN/CLIP, NB-TV-DRAG, NB group Mute/Solo, NB U rescue;
  - G-GROUP-T3 (0.501187, 0.000 %), with a control ratio of 1.000000;
  - G-GROUP-INF (0 non-zero samples);
  - GV-PLAY (37.50 dB drop, 0 new sources);
  - TV-ANCHOR, G118-3, PX-NET/REG-HYD, AN-REVIEW, SOURCE-SCOPE, DOC-100/101.
- **Failed:** T118-TARGETED 451/452 (CF11 l.501).
- **Blocked:** fake-Bearer 403 (backend unavailable in cloud).

## Ruling on C-R118-01 (B's defect)
- Round 118 §2.1 pinned the fine Master value as −24 × 66 / 1320 = −1.2. B left out `MASTER_GAIN_STEP_DB = 0.5` (`ArrangementMaster.tsx` l.25).
- `relativeFaderValue` rounds to the step, so the value is −1.0. R4 kept the Master step on purpose.
- Proof the fine path is live:
  - A's m5 (no `fineDivisor` on Master) gives −12;
  - C's SH-MASTER gives Shift −2.5 against plain −27.5.
- A was right to stop.
- **Ruling: CF11 l.501 → `toBe(-1)`.** This is the same failure class as C-R116-01: B enumerated the grant without re-deriving the value through the real rounding path. Lesson for B: when pinning fader values, apply the fader's `step` rounding in the formula.
- The red test blocks the gate's full vitest, so this is **not** a deferred Low.

## Backlog updates (only from evidence)
- **T12 stage 3b → `bug (test pin only) - fix-up round 119`.** Not `c_pass`, not მზადაა.
- **C-R118-01:** added, dispatched round 119.
- **GATE117-S1:** done in the tree (C DOC-100 PASS). It publishes with 118+119.
- **New entries:**
  - A-R118-REVIEW-DOC100-L69 (Low, round 119 grant);
  - MASTER-FINE-STEP (signal → ABLETON-EXPERT-REVIEW);
  - SHIFT-FINE-DISCOVERABILITY (signal → DESIGN-UX-REVIEW);
  - A-R118-REVIEW-GV-HALVES (acknowledged; m2 kills GV4);
  - C-R118-OBS-GV-INF-METER-BALLISTICS (acknowledged: "stay silent" = no signal);
  - B-R118-UM9-ROW-WORDING (B spec imprecision; C tested both cases);
  - ENV-FIRST-LOAD-GRID-NULL (watch; second occurrence).
- **Merged:** OBS-R118-DEMO-OVER → C-R86-OBS-DEFAULT-OVERLOAD (existing gain staging; signal).
- **Deferred Low** GATE117-S3: noted that a second, group copy now exists. The deferred count stays 160.
- **TV11 pre-check outcome (a):** confirmed by C (TV-ANCHOR and the helper reading). No A-R118-TV11-ANCHOR finding.
- **Accepted A deviations:** the GV9 extra `plainPan` pin; the GV5 retitle; finishing the independent scope after the STOP.
- **Architecture:** the A reviewer's note (start capture + stored ↔ slider mapping now copied word for word in Lane and GroupHeader; verdict keep) = addendum **(ac)**, already with root. No new request: this is not a new feature boundary.

## Round 119 (current-task.md)
- **Scope:** C-R118-01 only, plus three documentation status lines. A owns:
  - `clip-gain-fader.test.tsx` l.501;
  - doc 101 l.4/50/66/70;
  - doc 100 l.69.
- **Frozen:** `b-round-118-r119-tree-sha256.txt`, 929 entries. It includes every round-118 app file and the untracked `group-volume-db.test.tsx` (sha `5168160d…`).
- **Pre-edit sha256 values:**
  - `clip-gain-fader.test.tsx`: `261472d6d911226b2b74c5d997be003ad8b7f965a124b79dfa6f961439142bad`
  - doc 101: `f910ed7b2f923395fc00af7d1bc794e9d625a3a3c244dca122ea2ed462af74f9`
  - doc 100: `5912f18f7c1aed3f35b04676611ebaece65a276e31edc3f5ac5c29c5e15f110b`
- **A:** re-runs m5 against the new pin (CF11 must go red with −12), so the reviewer's "no green Master-Shift guard" note is closed. The code-reviewer is not required (1 test line + docs).
- **C:**
  - T119-TARGETED 452/452;
  - AN-REVIEW (revert-copy sha equals `261472d6…`);
  - SOURCE-SCOPE (frozen 929 OK = app byte-identical to C's round-118 tree);
  - SH-MASTER + GV-DRAG at both viewports;
  - G119-3, PX-NET/REG-HYD.
  - The other round-118 rows go under `"carried"`, not under `"passed"`.
- **Ableton:** Shift fine is confirmed by §42.6. Master fine snapping to its 0.5 dB step is **დაუდასტურებელი** (signal MASTER-FINE-STEP).

## Why not COMPLETE, why not BLOCKED
- **Not COMPLETE.** Still remaining:
  - stage 3b publication, stage 4 and T12-ADVANCED;
  - the regression round, ABLETON-EXPERT-REVIEW, DESIGN-UX-REVIEW and VISUAL-A;
  - 160 deferred Lows, the Tech Lead checks, SRW-21 (`deferred_user`) and the final regression.
- **Not BLOCKED.** Nothing needs outside information, approval or credentials.

## Next after round 119
- The first planning on or after **2026-10-24 UTC** is the **REGRESSION round**.
- Then T12 stage 4 (T12.19 the waveform shows clip gain, display only; T12.18 a view-only vertical zoom; Test 7).
- Then ABLETON-EXPERT-REVIEW.
- If round 120 is planned before 2026-10-24 UTC, stage 4 comes first and the regression round follows at the first planning on or after that date.

## Commit readiness (for root)
- Rounds 118 + 119 form one publication unit after C round 119 PASS:
  - the 8 M + 2 ?? round-118 paths;
  - the round-119 edits inside 3 of those paths.
- `plan.md` (outside `store/`) was edited by B only.
