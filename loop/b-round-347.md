# B round 347 → 348 planning

**Decision: CONTINUE.** Round 348 = PERF-DRAG-PREVIEW conversions (`current-task.md`; D-29z1100…D-29z1105; backlog v308 → v310). D-29z1105 closes PERF-CAND-DETAIL-CLIPGAIN-MEMO (c6-ii did it) and schedules PERF-CAND-FADE-BUDGET in round 348. The `budgets.interactions` test sweep hits only `perf/lib/report.test.ts`, which passed 40/40 on the sketch..

## 1. Round 347 close-out (D-29z1100)
- **C round 347: PASS.** `browserVerified`/`realVerified` true, 14 rows, 0 bugs, 0 blocked (`c-round-347.json`).
  - NAMES: fade 4, trim 15, move 12 (crossing 82).
  - FADER-LANE and FADER-CLIPGAIN pass at both viewports and match HEAD.
  - PERF 60/60; FADER-PERF 94/94 with 0 DIFF.
  - G347-AUTH: purchase protection holds, and `/studio-lab` opens anonymously.
- **Gate 347:** `published` `95774e6` on both remotes. This is the baseline for round 348.
- PERF-DRAG-PREVIEW stage c6-ii → done. The task was archived as `tasks/round-347.md`, and backups are in `b-round-347/*-before-348.*`.

## 2. Routing (D-29z1101)
- **To `deferred_low_polish`:**
  - GATE347-S1 = A-R347-REVIEW-L2 (`parseClipGainDbKey` filters non-finite values);
  - A-R347-REVIEW-L1 (the layout-effect timing of the ref);
  - C-R347-HELD-ARROW-HISTORY (pre-existing; Live's behaviour is unverified).
- **Into round 348:** GATE347-S2 (DP65's missing `finally`), together with DP63 (D-29z1103).
- **closed_info:**
  - GATE347-S3: `setTrackPan` is a `useCallback` [K12];
  - C-R347-VISUAL-ID-STRIPPED.
- **open_info:** GATE347-S4. The hook contract moves to `docs/technical/` with the next round that touches that folder.
- **Architecture signals, not scheduled:**
  - ARCH-R347-LANE-HEADER-MIX, which joins checkpoint question 3;
  - ARCH-R347-DETAIL-PANEL-REPEAT;
  - A's two-mechanisms note, folded into ARCH-R346-FADER-DRAG-OPTIONS-EFFECT.
- **ROOT-REQ-PERF-TIMEOUT:** round 347's durations were 440477 ms (C) and 432344 ms (A), both under the 450000 bound. B's runs in this planning took 439301 to 471123 ms; the mutant runs exceed the bound.
- GATE346-L1 and GATE346-INFO3 → closed, because round 347 fixed them.

## 3. Round 348 shape (D-29z1102)
- **14 1x rows become asserts at the ceiling of C round 347's values:**
  - trim per-move and max `<= 15`;
  - move per-move `<= 16`;
  - fade per-move and max `<= 24` → `<= 4`;
  - trim and move `release-commits` `== 1`.

  Asserted rows go from 60 to 70.
- **These stay `record`:**
  - move max (82);
  - the 36 6x copies;
  - fade `release-commits` (3 stopped / 2 playing). It is unexplained; `performance-optimizer` named the second commit, a `clearPreview` layout effect, but not the third. It is tracked as PERF-CAND-FADE-RELEASE-COMMITS.
- **B's sketch,** run on a production build, alone, one run after another (`b-round-347/perf-summary.txt`):
  - the sketch passes 70/70, with 0 NEW and 0 rows higher;
  - MU-FINE-CLIPGAIN, MU-GROSS-PREVIEW and MU-COMBO are all red on their predicted rows (`b-round-347/mutant-ruling.txt`);
  - the test patch passes 67/67 on the sketch, and Biome is clean.
- **Item target ≤ 15 per move.** Trim (14.75) and fade (3.933) meet it. Move (15.317) does not, because of the project-end crossing commit: 82 components, while the other commits average 14.43 in production. **PERF-DRAG-PREVIEW therefore stays in progress** after a round-348 PASS.
- **Consults:**
  - `tech-lead` reviewed the sketch diff (L58; the code-reviewer is not on B's consult list). It found no Medium+ problem in the patches. Its notes on the window-commit margin and the move arithmetic are in the task.
  - `performance-optimizer` looked into fade release and the flake risk.
- **Advisor:** available, consulted once before writing.

## 4. Order after 348
PERF-CAND-VIDEO-TRIM-FADE-ROWS → PERF-CAND-MASTER-GROUP-FADER-PROPS / the project-end crossing (move ≤ 15) → PERF-CAND-FADE-RELEASE-COMMITS → PERF-9…15 → SYS-R2-FAKE-FIDELITY → SYS-CLOCK-DETERMINISM → STEM-LANES → SYS-1…3 → STORE-2b…5 → REVIEW-RECOMMENDATIONS → T12-ADVANCED → phase-2 entries (skip rule).

- REGRESSION is due on or after 2026-11-08.
- RETRO is due around round 351.

## 5. Request to root (non-blocking)
**ARCH-CHECKPOINT-PERF-DRAG-PREVIEW-CLOSE is now wanted.** After round 348, PERF-DRAG-PREVIEW's core is at a feature boundary. Please call the read-only `frontend-architect` before PERF-CAND-MASTER-GROUP-FADER-PROPS or any project-end crossing work. The questions are in `b-round-339.md` §5 and D-29z1093; question 3 now also covers ARCH-R347-LANE-HEADER-MIX. It does not block round 348 or PERF-CAND-VIDEO-TRIM-FADE-ROWS.

## 6. Readiness for publication
Round 347 is already published. Nothing in this planning step changed source; `store/` is clean.
