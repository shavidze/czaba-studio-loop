# B: Round 209 → 210 planning (D-29z183 … D-29z187)

Date: 2026-10-27.
- **Advisor:** available. Used before writing; once more at the end.
- **Consults:** none new. This round re-dispatches the same PERF task; the round-208 tech-lead + performance-optimizer consults (b-round-208.md §3) still cover the design, and no new measurement or design question arose that they would answer (C's probe gives the fresh numbers).

## 1. Inputs read
- `current-task.md` (round 209). Archived unchanged as `tasks/round-209.md` (`cmp` identical; no earlier archive existed).
- `a-round-209.md` (STOP), `c-round-209.md`, `c-round-209.json`.
- `gates/gate-round-209.json`: **skipped** ("C taskStatus FAIL"). Last publication remains `f535ab3` → round-210 baseline.
- `lessons.md`, `regression-last.json` (round 199; next due on or after 2026-10-30), `context/active-summary.md`, `b-round-208.md`, `backlog.json` by id.
- Source, read-only: `gesture-guard.test.tsx` (all `trackVolume(api…)` reads, l.151–533), `ArrangementContext.tsx` `previewTrackPan` (l.2797–2808), `ArrangementLane.tsx` `handlePanChange` now vs `git show f535ab3` (l.455–470).

## 2. Acceptance results used (independently evidenced by C)
- **C round 209: FAIL (incomplete)**, `browserVerified: false`, `realVerified: false`. Passed only SCOPE-209-start and G209-3 (auth guard: `/studio-lab` anonymous, `/studio/middle-east` "Sign in required", token 401 / 500 without mock, no token issued).
- **Nothing is marked done.** C's own browser probe (four faders: max 1 component per move, ≥ 101 window commits from below max, 0 source starts, 1 release commit, Ctrl+Z restores, cancel/blur restore with 0 commits) is "observed, not claimed" and is used only as evidence for the rulings below.
- A's own runs (perf ×2, FP1–FP12, MD1–MD5) are A's evidence, not acceptance.

## 3. Rulings (L10: every STOP and finding is ruled before re-dispatch)
- **D-29z183 — C-R209-01:** grant `gesture-guard.test.tsx`, l.447 hunk only, A's exact re-expression (DOM value, `aria-valuetext`, model unchanged). B verified by grep that every other model read in the file follows a pointerup/blur/window-blur/pointercancel; A's covering run (1 failure in 2,184) agrees.
- **D-29z184 — WINDOW threshold:** "≥ 100 window commits" only for C's below-max run; max-start and Pan runs: every value-changing move commits, component counts = harness ±2. Harness unchanged.
- **D-29z185 — draft-clear order:** round-209 §1.4 order kept (clear, then one `applyEdit`); LIVE-DISPLAY checks no snap-back.
- **D-29z186 — C-R209-03:** accepted delta. Baseline showed a display-only pan draft with no audio after a stolen claim (`f535ab3` Lane l.456 `setPanDraft(pan)` beside a `previewTrackPan` that refused); now `previewTrackPan` refuses at l.2799 and nothing shows, so display = audio = model. Smallest honest behaviour; tested by new FP13 and C's PAN-DELTA-210 attempt.
- **D-29z187:** the two code-reviewer Mediums become mandatory rows (FP14 pan cancel ×3; FP9 + group pending path). Red-proof method fixed (start copy + store + minimal hook export; FP1–FP8/FP10 red on assertions, FP9/11/12/13/14 named mutants). Reviewer Lows filed one by one in `deferred_low_polish` (A-R209-REVIEW-L-*, 5; bug gate 2026-10-23); `takeMixOverride(kind)` optional. FP13's named mutant is the l.2799 guard, so the row cannot pass through an upstream early return (advisor end review).
- **WINDOW/C-R209-02:** the missing deliverables (48 flips, docs 163/165, perf ×2, red-proof, final review) are carried unchanged from round 209.

## 4. Architecture
- A round 209 code-reviewer note (Signal 4: override/store/lifecycle in `ArrangementContext.tsx`; Signal 2: pan draft cleared by lane and context; verdict keep; proposal: pure gesture → override → commit/revert reducer with one pan-draft owner) → `architecture_signals` as **ARCH-R209-MIX-OVERRIDE**, not scheduled. It is folded into the frontend-architect checkpoint B already plans to request from root after PERF-FADER-b (third override kind on the same owner), before PERF-8/PERF-10. No new root request now: the feature is not at its boundary yet and the active round keeps one owner.
- **I-209-RELEASE-REBUILD** (C info: graph rebuilt after pointerup / Ctrl+Z while playing; pre-existing, perf-plan §1.5) → PERF-2+ signal.

## 5. Bookkeeping
- **Archived:** `tasks/round-209.md`; snapshots `b-round-209/backlog-before-210.json`, `feature-status-before-210.md`, `b-next-before-210.json`.
- **Frozen-tree artifacts (baseline `f535ab3`, not rebuilt from the dirty tree):** `b-round-209-r210-tree-sha256.txt` (1,030 = round 209's 1,031 minus gesture-guard; `sha256sum -c` OK on the current tree), `b-round-209-r210-grants.txt` (20), `b-round-209-r210-granted-start-sha256.txt` (gesture-guard hash from `git show f535ab3`), `b-round-209-r210-new-files.txt` (5), start copy `b-round-209/r210-granted-start/…/gesture-guard.test.tsx`; the other 19 start copies stay in `b-round-208/r209-granted-start/`.
- **`backlog.json` (v193):** round 209 → `c_fail_incomplete` with result; round 210 added; open findings C-R209-01/02 (Medium, scheduled 210), C-R209-03 (Low, ruled), A-R209-REVIEW-PAN-CANCEL / -GROUP-PENDING (Medium, scheduled 210), A-R209-REVIEW-LOWS (→ 5 entries in `deferred_low_polish`, now 310), I-209-WINDOW-THRESHOLD, I-209-RELEASE-REBUILD; SABA-B-5 still in progress; architecture signal added.
- **`feature-status.md`:** round 209 → ბაგია (C FAIL, დაუსრულებელი); round 210 → მუშავდება; SABA-B-5 and STUDIO-PERFORMANCE rows updated.
- **Schedule:** regression not due (on or after 2026-10-30); RETRO at round 215 or at the end of STUDIO-PERFORMANCE. Bug gate: no Critical/High open; the open Mediums are this round's own.
- **Ready to commit:** nothing; round 209 was not published and round 210 is not ready until C passes.
- **Root pre-push / publication checkpoint:** no new findings this round (C reports none new).

## 6. For Saba (the loop does not wait)
- The slow-fader fix is implemented and C's real-browser probe already shows it working (about 1 small update per mouse move instead of 80+), but the round was not finished: one old test, the budget switch and the docs remain. Round 210 finishes it; Clip Gain follows in PERF-FADER-b.
- One small behaviour change was accepted: in a rare multi-pointer case the Pan knob no longer shows a value that is not actually playing (D-29z186).
- Earlier open questions (`b-round-205.md` §8, `b-round-206.md` §8, SABA-B-6-R1) are unchanged.
