# B round 189 → round 190 planning (D-29z155)

Date: 2026-10-26 · Author: B · Advisor: available, consulted after orientation (before writing) and again at the end.

## Inputs read
- `tasks/round-189.md` (archived copy of the round-189 task; `cp` + `cmp` OK), `a-round-189.md`, `c-round-189.md`, `c-round-189.json`.
- `gates/gate-round-189.json`: **skipped** ("C taskStatus FAIL"). No publication, so the baseline stays HEAD `850445c` plus the uncommitted round-189 tree.
- `env-status.json` (store 200, round 189), `regression-last.json` (2026-10-24, round 122), `context/active-summary.md`; `backlog.json` read only by ID (STORE-REDESIGN, rounds, open_findings, regression_rounds).
- Source checked read-only: `app/components/loading/SpotlightLoader.tsx` (round-189 state), the T1 case list and doc 156 headings.

## C round 189: what the evidence supports
- **C FAIL**, `browserVerified=true`, `realVerified=true`. 15 rows PASS, 1 FAIL (STORE-AFTER-189 on fresh-mode CLS), 0 blocked.
- The working tree equals `a-round-189/end-sha256.txt` (4/4; B checked).
- **C-R189-01 (Medium):** fresh-mode home CLS median 0.0815 / 0.2727 / 0.6158 at 1440 / 1280 / 375. Shift sources are inside `[data-testid=entrance-loader]` (`previousRect` y/height 0/0). Seen mode is unchanged from round 188. The cause is a hypothesis; pre-existence is unverified.
- **C-R189-02 (Low):** Tab under the opaque overlay moves focus and can scroll the hidden carousel.
- **Backlog effect:** STORE-1d → **ბაგია**. Nothing is marked done. STORE-1 stays in progress.

## Decision for round 190
- **Bug gate:** a Medium is open, so it goes before new scope. Regression is not due (2 days; due on or after 2026-10-27).
- **One round, two tightly related bugs in one file** (within the "at most three related bugs" rule).
- **C-R189-02 fixed now, not deferred.** The 2026-10-23 rule allows an early Low fix when the round owns the code and the fix is cheap. This is one line in the existing keydown handler.
  - New ruling **R67** (vetoable): Tab and Shift+Tab end the loader like Escape, without `preventDefault`. It replaces R63's Tab clause, because R63 assumed Tab had no side effects and C showed it does.
  - Rejected: `inert` on the page (frozen files or sibling-DOM reach), a Tab trap, and deferring.
- **K1 is evidence-first.** A reproduces C's measurement and bisects the animated children before fixing. The fix keeps the visuals (R66) and every round-189 property. No CLS case goes into jsdom T1, because jsdom cannot see layout shift; acceptance is browser-only (CLS-FRESH-190 at all three viewports, no overlay-sourced shift).
- **Lesson recorded:** round 189's A live proof measured only 1440 and no CLS. In round 190, A measures fresh-mode CLS at 375, 1280 and 1440 before and after the fix.
- **Baseline files** (round-179 pattern):
  - `b-round-189-r190-tree-sha256.txt`: 1016 entries, OK from the store root. Doc 155 is frozen at `cdf011f9…`.
  - `b-round-189-r190-grants.txt`: 3 files (SpotlightLoader, T1, doc 156).
  - `b-round-189-r190-new-files.txt`: empty.
  - `b-round-189-r190-granted-start-sha256.txt`, and start copies in `b-round-189/r190-granted-start/`.

## Routing of C/A info
- **C-R189-I1:** use the pre-paint sampler. **I5:** sessionStorage is per tab. Both are added as harness rules to `REGRESSION-ROUND-2026-10-27`.
- **I3, I4, I6:** info.
- **A-189 reviewer Lows:** recorded as `A-R189-SIGNALS`, not scheduled. The tagline is shown for about 150 ms, which is a design note for Saba at STORE-2. The Architecture note is "keep", with no proposal.
- **Architecture checkpoint:** there is no new feature boundary. `b-round-183-checkpoint-request.md` is still pending; fallback (c) continues. The next checkpoint point is the STORE-REDESIGN exit.
- **RETRO:** not due. It comes after STORE-REDESIGN or at round 200, whichever is first.

## Files written
- `tasks/round-189.md` (archive) and `b-round-189/` (before-copies of current-task, backlog, feature-status, b-next and regression-last, plus the start copies).
- `current-task.md` (round 190), `backlog.json` (version 175: STORE-REDESIGN `store1d_result` + `store1d_fixup_d29z155`, 4 open_findings, regression additions, rounds 189/190).
- `feature-status.md`, `b-next.json`.
- `regression-last.json` is unchanged.

## Readiness for commit
Not ready. Round 189 is not publishable until round 190 passes C. Root then publishes 189 + 190 together.

## Changes after the final advisor review
- **CLS criterion:** the row now counts only overlay-sourced shifts with `value ≥ 0.005`. Round 189's evidence already shows `v: 0` entries from the rule line's width draw, and those are expected (info).
- **Scrolling keys:** ArrowDown, Space or PageDown scrolling the hidden page is outside R67, which covers Tab only. It is recorded as info or a deferred Low, not as a K2 FAIL.
- **Harness:** A must copy `cls.cjs` together with `lib.cjs` and `ld.cjs`.
- **Baseline shots:** the 9 non-scrolled baselines in `c-round-189/shots/store-after/` were confirmed to exist.
- **b-next.json:** the STORE-REDESIGN entry under `remaining` was updated.
