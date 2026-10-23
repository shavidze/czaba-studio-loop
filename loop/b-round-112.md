# B — Round 112 result and Round 113 plan (D-29z78)

Author: B · Date: 2026-10-23 (~15:25–16:10 UTC) · Decision: **CONTINUE** · Next task: `current-task.md` (round 113). Archive: `tasks/round-112.md`, an exact copy of the round-112 task (made with `cp -n` and checked with `cmp` before overwriting).

## 1. Inputs read
- **Context:** `context/active-summary.md`.
- **Round 112:** `tasks/round-112.md`, `a-round-112.md`, `c-round-112.md`, `c-round-112.json`.
- **Gate 112:** `gates/gate-round-112.json`: **published**, commit `ad58b5e88b8f6c6c8b3c6766f59e8c0a14622aa3`, both remotes on the same hash. Also `gates/round-112/review-result.json`: 10/10, COMMIT: OK, verify 150/150 files and 2334/2334 tests.
- **Lookups by ID only:** `backlog.json` entries C-R6-02, C-R8-01, C-R27-01, A-R38-REVIEW-TOUCH, SRW-03/11B/13, T12-GAIN-VOLUME, `global_forbidden_files`, `narrow_grants`; the `plan.md` D-29z77 format.
- **Source, read only:**
  - `app/hooks/useRelativeFaderDrag.ts` (the whole file);
  - `app/lib/arrangement/fader.ts`;
  - `ArrangementLane.tsx` l.355–400 and l.695–770;
  - `ArrangementMaster.tsx` l.125–145;
  - `ArrangementGroupHeader.tsx` l.85–110;
  - `ArrangementTransport.tsx` l.225–250 (Zoom);
  - the fader test files list, and `fader-click.test.tsx` test names.
  - jsdom provides `TouchEvent` (checked with node).
- **Baseline:** HEAD = `ad58b5e` (the gate commit), `git status` clean. The protected hashes are unchanged (`fa2cf0bc`, `13914809`, `56f5b76f`, `bf9ee257`).
- **Regression timing:** `date -u` = 2026-10-23 15:30. `regression-last.json` = 2026-10-21, so the regression round is **not** due yet. It is due at the first planning on or after 2026-10-24.

## 2. Backlog changes (only from independent evidence)
| ID | Before | After | Evidence |
|---|---|---|---|
| C-R27-01 (Medium) | open_tech_lead_quiet_chrome | **closed** | C r112 VM1–VM3 valid, max 15.6/16.0/15.6 ms ≤ 30.1, hardSeeks 0→0, 0 LoAF |
| C-R6-02 (Medium) | open_tech_lead_quiet_chrome | unchanged status. The §5 row is "FAIL, no app attribution"; the round-112 result and the B ruling were added. **Does not block T12.** | literal D 0/3, N 1/3, RF5-3 1/3; 0 LoAF / 0 app script |
| C-R8-01 (Medium) | open_tech_lead_quiet_chrome | same as C-R6-02 | literal D 0/3 |
| A-R38-REVIEW-TOUCH (Medium) | open_tech_lead_check (unverified) | **confirmed in cloud Chromium → round 113** | TOUCH harness valid (Zoom jumps 3/3); Volume, Pan and Master jump on touchStart 3/3; each jump commits an undo step |
| SRW-03 | regression_open | `c_pass_tech_lead_manual (C-R6-02 open_tech_lead_quiet_chrome …)` | §5 SRW rule |
| SRW-11B | stage3_passed_bugs_open | `c_pass_tech_lead_manual (C-R8-01 …)` | §5 SRW rule; the accepted Lows do not hold it back |
| SRW-13 | in_progress_bug_open | unchanged until round 113 C PASS | §5 SRW rule (TOUCH FAIL) |
| GATE111-S3-DOC096-STATUS | dispatched r112 | **done** | C DOC-096-L4 PASS; published `ad58b5e` |
| GATE112-S1-DOC096-TESTING (Low, new) | — | `deferred_low_polish` (now 146) | gate-112 review, suggestion 1 |
| C-R112-HARNESS-BOUNDARY, C-R112-RF53-PANEL-SPLIT, TOUCH-DOUBLE-TAP-RESET | — | info signals in `open_findings` | C's notes 1–2; R4 below |

- **Backlog version:** `backlog.json` is now version 111. The pre-edit copies (backlog, feature-status, plan, b-next) are in `b-round-112/`.
- **Feature-status changes:** SRW-03, SRW-11B, FB-08 and FB-16 → **მოწმდება**. FB-05 and FB-14 (Pan, Master) → **ბაგია** for A-R38-REVIEW-TOUCH. That is the honest state: the fader contract fails on touch.
- **Not changed:** `regression-last.json`; SRW-21 (`deferred_user`); B-R107-ENTER-ON-BODY (still the user's open question).

## 3. Rulings on C's notes
1. **Boundary skew (C note 1):** not accepted as a PASS. Round-112 §3 said that no exclusion changes after seeing a number, and C added the correction after seeing the 6.0 s values. C reported it honestly and did not use it. Two things follow:
   - The finding stays `open_tech_lead_quiet_chrome`, which §5 already maps to "does not block T12". So the ruling costs nothing on the schedule and keeps the rule honest.
   - The useful part, measuring against the dock's active clip or `requestVideoFrameCallback`, is recorded as C-R112-HARNESS-BOUNDARY for the Tech Lead's quiet-Chrome run.
2. **RF5-3 panel split (C note 2):** recorded as the unverified hypothesis C-R112-RF53-PANEL-SPLIT. It is not "cost follows app state", for three reasons:
   - §5 names the D − N difference, and that difference is ≈ 0;
   - P was declared attribution-control only;
   - C itself shows that the `startAt` estimator error (cloud audio clock steps of 8.7–31.9 ms) exceeds the ±16.7 ms window.
3. **Touch changes data (C note 3):** this is why A-R38-REVIEW-TOUCH stays a Medium. Round 113 asserts it directly with TC-TAP (no history entry) and TC-UNDO.

## 4. Round 113 (D-29z78) summary
- **Scope:** one Medium bug, the round-38 pre-specified amendment. A native non-passive `touchstart` → `preventDefault()` goes into the shared `useRelativeFaderDrag`, wired into every relative-drag fader input: track Volume (video included), track Pan, Master and **group Volume**.
  - **R1 (group Volume):** it did not exist in round 38. It shares the hook, so it has the same defect by construction.
  - **Zoom** is excluded and stays C's positive control.
- **Mechanism warnings in the task:**
  - React's `onTouchStart` is passive, so `preventDefault()` there does nothing.
  - `touch-none` is already present and did not help.
  - The listener is attached at mount and removed at unmount.
- **What could break, and how it is covered:**
  - The touch relative drag should keep working, because the pointer events continue. C row TC-REL; a failure there is a separate finding and is not hidden.
  - A touch double-tap reset is lost. This is deliberate (R4): keyboard, mouse double-click and the reset buttons remain. Info row TC-DTAP.
- **A owns:** 4 app files, the new `fader-touch.test.tsx` (FT1–FT6 plus 3 mutations) and doc 097. The frozen list `b-round-112-r113-tree-sha256.txt` holds 916 tracked files, checked OK at `ad58b5e`. Expected end state: 4 M + 2 ??.
- **A's checks:** typecheck, lint, the targeted fader/mixer vitest files and the code-reviewer. There is no full suite. The unit tests only pin the wiring, and the task says so.
- **C:** the round-112 CDP touch recipe, unchanged, at 1440 and 1280. Rows: TC-ZOOM/START/REL/UNDO/TAP/DTAP, MC-PRESS/DRAG/DBL, KB-ARROW, TC-VIDEO-VOL, SOURCE-SCOPE, AN-REVIEW, T113-TARGETED, PX-NET, REG-HYD, G113-3 and DOC-097.
- **Ableton:** not applicable (a browser range input under touch). The D-29z3 relative-drag contract is extended to touch.

## 5. Ownership and protection
- **A:** the six paths above only. `ArrangementTransport.tsx`, `ArrangementContext.tsx`, `fader.ts` and every existing test are frozen. So are the protected auth/purchase files.
- **C:** `tmp/studio-real-loop/c-round-113/**` and its reports.
- **Public `/studio-lab`** stays demo-only, checked by G113-3.

## 6. COMPLETE / BLOCKED check
- **Not COMPLETE:**
  - A-R38-REVIEW-TOUCH (Medium) is open;
  - SRW-13 is not yet `c_pass_tech_lead_manual`;
  - the regression round, T12, ABLETON-EXPERT-REVIEW, VISUAL-A, the 146 deferred Lows and the final regression are not done.
- **Not BLOCKED:** round 113 needs no outside information, approval or credentials.

## 7. Root / architecture
- **No new architecture signal** from gate 112: the reviewer repeated ARCH-R111-FOCUS-OWNERSHIP, which is already in addendum (w).
- **Round 113** changes a shared hook used by four components. If A's reviewer raises an Architecture note, it goes to the pending checkpoint request (`b-round-91-checkpoint-request.md`). It is not scheduled automatically.
- **Commit readiness:** round 112 was published by root. Round 113 is ready for the gate only after C PASS.

## 8. Advisor
The advisor was available and was consulted once before writing. B followed it on these points:
- §5 applied literally: the skew correction is not accepted, and the panel split is not counted as attribution;
- the hook-level fix that includes group Volume, with Zoom excluded;
- the mechanism warning (passive React touch, `touch-none` already present);
- the explicit ruling on double-tap reset;
- unit tests framed as wiring-only;
- the bookkeeping for the Low (GATE112-S1) and the regression timing.

No deviation.
