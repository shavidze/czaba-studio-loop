# B round 397 → 398 planning (2026-11-07)

**Decision:** CONTINUE.
**Next task:** round 398 = PERF-14a, stage 1 of 3 of PERF-14 (`current-task.md`).
**Baseline:** gate 397 `published`, commit `c93d926` on both remotes (`gates/gate-round-397.json`). HEAD is `c93d926` and the tree is clean. The gate JSON's `head` (`4f28bff`) is the tree before the commit.
**Advisor:** available; consulted at orientation and at close. I followed its advice to:
- use the published commit as the baseline;
- measure 200 clips before shaping the task;
- define the state in which the 2000 target is counted;
- run the DOM-locator sweep now;
- correct the obsolete ruler note;
- keep scale rows `record` unless B runs them on a sketch.

At close, the advisor flagged two unprobed facts. I probed both at HEAD (`b-round-397/probe/groups-drag.cjs`, both viewports, [K25]) and corrected the task:
- The demo shows 0 groups at ready. The spec's self-check is now "0 collapsed groups".
- During a held cross-lane drag, the clip stays mounted on its source lane: 3/0 while held, 2/1 after release, 3/0 after Ctrl+Z. The COUNT-BROWSER row now uses these measured counts, replacing B's earlier "−1/+1 while held" guess.

Also: the K8 sweep allows 3 or 4, and the screenshot row is a plain record.

**Consults** (`b-round-397/consults.md`):
- `performance-optimizer` and `tech-lead` both reviewed the PERF-14 shape.
- `tech-lead` reviewed the frozen sketch twice (`b-round-397/sketch-review.md`). The reviewed sha256 `bd8fe321…` equals the dispatched one.

## 1. Round 397 closed from evidence
- **C round 397:** PASS, `browserVerified` true, `realVerified` true, 0 bugs (`c-round-397.json`). `tools/l57-check.py` OK (`b-round-397/l57-check-c397.txt`). Gate 397 published `c93d926`.
- **Done (D-29z1359):**
  - PERF-13d, so **PERF-13 is done** (13a–13d).
  - Closed: R314-DEMO-BUFFER-LONGTASK-6X and PERF2-STEREO-COPY.
  - A's reviewer pass-1 Medium on doc l.4 is the L28 convention, so it gets no id.
- **Notes placed (D-29z1361):**
  - **C-R397-NOTE-LONGTASK-1280** (Low) → `deferred_low_polish`. Its id says 1280, but C's text says the 1440 run 3; the entry records this.
  - **GATE397-L1-HIDDEN-TAB-YIELD** (gate reviewer Lows 1–3, ruled "keep") → `deferred_low_polish`.
  - **GATE397-ARCH-YIELD-HELPER** → architecture signal only, not scheduled.
- **Archive:** the round 397 task is archived as `tasks/round-397.md` (copy). Pre-edit copies are in `b-round-397/*-before-398.*`.

## 2. Why PERF-14a, and what it is
- **Order:**
  - There is no open C bug. Every open Critical/High/Medium is manual-only, `awaiting_user` or `open_root`.
  - Regression is not due (last on 2026-11-07, round 390; next on or after 2026-11-10). RETRO is at round 400.
  - PERF-14 is the next dependency-ordered STUDIO-PERFORMANCE item.
- **Premise measured at HEAD (L37)** with `b-round-397/probe/clips200.cjs` on the dev server, both viewports, at 1× and 6×. Adding the clips (Add, then Ctrl+D ×199) takes about 5 s. The target is ≤ 2000 elements; the 1× keydown is borderline against the 50 ms target.

  | Measure | Result |
  |---|---|
  | Whole-page elements, 200 clips | 4294 / 4277 |
  | Of those, in clip subtrees | 3400 (17 per clip) |
  | Clips in the window, default zoom | 1 |
  | Clips in the window, min zoom | 16–19 |
  | Zoom keydown max, 1× | 40–48 ms |
  | Zoom keydown max, 6× | 272–280 ms |

  The ruler has been windowed since PERF-3b (95 elements), so PERF-14's old ruler note is corrected (D-29z1360).
- **Split (D-29z1360):**
  - **14a:** a lane `data-clip-count` model signal plus a new 200-clip scale perf spec. Its rows are `record`.
  - **14b:** clip virtualization.
  - **14c:** the peak pyramid and canvas tiles, plus the round-315 peaks Lows.
- **The consults agreed:**
  - on the order;
  - on a separate spec file (the interactions spec's later rows depend on its 30-clip state);
  - on measuring at minimum zoom scrolled to the middle (the tightest state for the budget).
- **Taken from `tech-lead`:** add the model count in 14a, so 14b changes neither the harness nor its meaning. 51 test and perf files locate clips through the DOM (`b-round-397/sweep-clip-dom-locators.txt`).
- **The consults disagreed** on whether 14b pins every selected clip. This is recorded as `Q-14B-PIN-SELECTED` for the 14b task, to be ruled with a select-all measurement.
- **Sketch, `b-round-397/sketch-398.patch.txt`:**
  - **Change:** one attribute line plus `lane-clip-count.test.tsx` LC1–LC5.
  - **Checks:** `tsc` 0; Biome 0; full suite on the final sketch, see `b-round-397/precheck-full.log`.
  - **Mutants:** 5 of 5 red, pristine rc 0 before and after (`b-round-397/mutants/summary.txt`).
  - **Review:** `tech-lead` found 0 Medium+ on the dispatched sha. Its first review added LC4 (cross-lane preview) and LC5 (fold), and asked the spec to check for collapsed groups.
- **The scale spec is A's code.** Its rows ship as `record — not run on sketch` (L58). Its self-checks push problems. C checks the deterministic counts against B's probe: 200 model, 200 mounted, 3400 subtree, 1 in the window.

## 3. Queue after round 398
- PERF-14b, then PERF-14c, then PERF-15.
- The regression round comes at the first planning on or after 2026-11-10. RETRO is at round 400.
- Then the rest of `post_current_stage_queue` unchanged: STEM-LANES, SYS-1…3, STORE-2b…5 (direction gate), REVIEW-RECOMMENDATIONS, T12-ADVANCED, then the phase-2 entries (skip rule).
- **Root, still due and not blocking:** the architecture checkpoint ARCH-CHECKPOINT-PREVIEW-AFTER-13C with ARCH-CHECKPOINT-DECODE-REGION (`b-round-396/root-request-arch-checkpoint-due.md`).
- **Feature boundary at PERF-14b:** virtualization changes how `ArrangementLane`/`ArrangementClip` mount. B will ask root for a bounded `frontend-architect` checkpoint on the 14b shape before dispatching it, if root has not run one by then. The shape is a lane-level window plus the must-stay-mounted rules.

## 4. Ready for commit
Round 397 was published by root (gate 397). B staged nothing. B changed only loop artifacts:
- `backlog.json` v365, `feature-status.md`, `current-task.md`;
- `b-round-397/`, `b-round-397.md`, `b-next.json`;
- `tasks/round-397.md`.
