# B round 319 → 320 planning

**Date:** 2026-11-03. **Advisor:** available and used (before writing, and before finishing).
**Consults:** none new. This round only rules a naming form, and the codebase convention settles it. Round 318's `performance-optimizer` and `tech-lead` conclusions still apply (`b-round-318.md` §3).

## 1. What was read
- `context/active-summary.md`, `tasks/round-319` (the task as dispatched), `a-round-319.md`, `c-round-319.md`, `c-round-319.json`, `gates/gate-round-319.json` (`skipped`, C FAIL), `b-next.json`, `regression-last.json`, and the `lessons.md` L23/L52 lines.
- Store greps for the memo convention and the name-keyed tests.

## 2. Preserved
- `tasks/round-319.md`: copy of the round-319 task. It did not exist before, so nothing was overwritten.
- `b-round-319/backlog-before-320.json`, `feature-status-before-320.md`, `lessons-before-320.md`, `b-next-before-320.json`.

## 3. Evidence-based backlog changes (C round 319 only)
- **PERF-8a stays `bug`.** Nothing becomes done. Gate 319 was skipped, and C's FAIL holds (CLAIMS, UNIT/TL5, deliverables).
- **Measured facts kept from C:**
  - the 37-entry tree equals the baseline in every browser row at both viewports, and the 4 WAVs are byte-identical;
  - production: 14.15 per move, max 32, restarts 0, `failures` [].
- **Open findings added:**
  - C-R319-01 (Medium, origin B spec);
  - C-R319-02 (Medium, origin A STOP);
  - C-R319-03 (Low; the current round owns that code, so it is fixed now and not deferred);
  - A-R319-ARCH-DETAIL-SUBSCRIPTION and SIG-R320-WAVEFORM-VIDEO-NONBAIL (info signals for PERF-10);
  - INFO-C319-R-ROWS-MISSPEC.

## 4. Rulings (D-29z872…D-29z879)
- **D-29z872:** continue on A's 37-entry tree.
- **D-29z873:** O1. `function XInner` + `const X = memo(XInner)` for five components, plus 5 test literals.
  - Reasons: six existing `memo(XInner)` boundaries, and the tests already key on `…Inner`.
  - Rejected: O2 (the exported name would point at the unmemoised function), O3 (global config) and O4 (no headroom).
- **D-29z874:** RS8 and two mutants for C-R319-03.
- **D-29z875:** the deliverables close C-R319-02. A's ChevronRight hoist is accepted.
- **D-29z876:** four round-319 rows that B mis-specified are rewritten at the same strength:
  - R-WAVEFORM;
  - R-DETAIL at 1280;
  - PERF-LOAD per-commit;
  - named-fiber attribution on dev.
- **D-29z877:** RETRO moves 320 → 321 (window 305–320). The C bugs come first, and the mid-round tree cannot pass a gate.
- **D-29z878:** L23 gains the runtime-name clause. `lessons.md` stays at 59 lines.
- **D-29z879:** the architecture signals go to PERF-10 and are not scheduled.

## 5. L23 pre-check (scratch `/tmp/b320s`; `store/` untouched, 37 entries before and after)
- O1 applied by `b-round-319/sketch-o1.py`. The diff is in `b-round-319/sketch-o1.patch.txt`.
- `render-budget`, `clip-gain-pointer-preview`, `detail-panel`, `track-layout` and `range-store`: **5 files / 100 tests pass**. `tsc --noEmit`: clean.
- Name liveness in CP1's setup window: all five `…Inner` names render with a count > 0 (`b-round-319/sketch-name-liveness.txt`).
- Claims on the sketch: K17 1/1, K19 1+1 ×4, K24 0, K25 0+0+0 / 3+1+1, K27 88/184.
- **Not measured by B:** the per-move effect of the three new memos (about 9 projected). C's PERF-RANGE decides it. The handed-off tree is already at 14.15 / 32 in production, and adding memos can only cut renders.

## 6. Round 320 (dispatched)
PERF-8a fix-up 2. Claims are in `b-round-319/claims-320.sh` K1–K27; the head output was taken on the 37-entry tree. Expected K2 after A: 43.

## 7. Queue after 320
321 RETRO → REGRESSION (if its planning falls on or after 2026-11-05, with the C-R318-06 repro) or PERF-8b → PERF-DRAG-PREVIEW → PERF-9…15 → STEM-LANES → SYS-1…3 → STORE-2b…5 → COPY-PD → REVIEW-RECOMMENDATIONS → T12-ADVANCED → the phase-2 entries.
- PHASE2-VIDEO-SCORING stays gated on the user's go-ahead.
- RETRO 321 takes as its input every backlog candidate tagged "RETRO 320" (D-29z804, D-29z811, D-29z820).
- SRW-21 stays `deferred_user`. SRW-21-PLAN is a planning doc, and it touches no protected file.

## 8. Architecture checkpoint
**Not requested now.** PERF-8a is mid-stage, and the frontend-architect checkpoint already requested (D-29z195) is still pending. Recommendation: at the PERF-8a/8b boundary (after PERF-8b), root runs one bounded frontend-architect checkpoint on `ArrangementDetailPanel.tsx`/`StudioWorkspace.tsx`. Its input is the memo-boundary signals (SIG-R319-*, A-R319-ARCH-DETAIL-SUBSCRIPTION, SIG-R320-WAVEFORM-VIDEO-NONBAIL), because those signals accumulate on one owner.

## 9. Commit readiness
None. The tree is mid-round (rounds 318–320). Root publishes after C PASS and gate 320.
