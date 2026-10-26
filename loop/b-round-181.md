# B — Round 181 → 182 planning (D-29z147)

Date: 2026-10-26 · Role: B (planning artifacts only; app source not touched: `git status` was clean before and after B's work) · Advisor: **available and consulted** (after orientation, before writing; and at the end).

## Inputs read
- `context/active-summary.md`, `current-task.md` (round 181), `a-round-181.md`, `c-round-181.md`, `c-round-181.json`, `b-round-180.md`, `gates/gate-round-181.json`, `env-status.json` and `regression-last.json`.
- `backlog.json` and `feature-status.md` only at the IDs needed: the VISUAL-A order, approved_moves, RV-1, `m1_plan_d29z146`, rounds, regression_rounds and the latest open findings.
- Spec `visual-direction-a.md` §M (M3 and M4).
- Source, read-only at `f1782f8`:
  - `ArrangementLibrary.tsx`, the whole file.
  - The suites that mount library options or read the Library source.
  - `app/styles/app.css` `--spacing-1`, `biome.json` (no `useSortedClasses`), and `CookieConsent.tsx` / `root.tsx` l.161, for the M4 forward note.

## Gate and baseline
- `gate-round-181.json`: **published**, commit `f1782f8`, on both remotes. HEAD is `f1782f8`.
- `sha256sum -c c-round-181/end-tree-sha256.txt` → **OK** (1006 files), so the published commit equals C's verified end tree. `git status` is clean.
- **Before-copies:** `b-round-181/before/` holds backlog, feature-status, b-next, current-task and the round-180 checkpoint request.
- **Archive:** `tasks/round-181.md` is a copy of the round-181 `current-task.md` (`cmp` equal, sha `7bc0b57b…`). Nothing was deleted.

## Backlog updates (only from C's independent evidence)
Source: `c-round-181.json` (PASS, `browserVerified` and `realVerified` true, 0 bugs, every runnable row passed at both viewports).
- **M1 → მზადაა.**
- **A-R180-DOC147-L123 → closed** (AN-REVIEW-181).
- **Blocked sub-check:** G181-3 fake-Bearer 403 stays BLOCKED (backend unavailable in cloud). It is kept as open evidence, not a FAIL.

**Triage of C's and A's notes:**
| ID | B decision |
|---|---|
| C-R181-PRESS-SCALE | Process rule: size criteria exclude the pre-existing `:active` scale of 0.98. Applied in round 182 §5. |
| C-R181-LINE-METRIC | Info only: a metric difference, and unchanged against HEAD. |
| C-R181-CORNER-HITTEST | Info only: the expected rounded hit-test. |
| C-R181-TITLE-TOOLTIP-HEADLESS | On the Tech Lead manual list. |
| A-R181-REVIEW-TS1-TITLE | Low → `deferred_low_polish`. Round 182 does not own `transport-surface-ui.test.tsx`. |
| A-R181-REVIEW-BYNAME-DUP | Low → `deferred_low_polish`. Same reason. |
| A11Y-R181-PLAY-KEYSHORTCUTS | Signal, not scheduled. It would change the accessible description, the same class as Q-R166-EXIT-NAME. |

- **Architecture:** A's round-181 note was "none". `b-round-180-checkpoint-request.md` is still unanswered. It is not re-requested; it is non-blocking, fallback (c), and a status line was appended to it.

## Decision: round 182 = M3
- **Regression:** 2026-10-24 → 2026-10-26 is 2 days, so it is **not due**. Planning on or after 2026-10-27 makes the next round the REGRESSION round (expected 183). `regression_rounds` now includes M1 and M3, plus the press-scale harness rule.
- **Bug gate:** no Critical, High or Medium finding is open. Decision files re-hashed, all unchanged (`3b132399…`, `0da40d98…`, `b8494bb4…`). M3 is next in the VISUAL-A order (approved 2026-10-21).
- **Rationale gap (M3-RATIONALE-VETOABLE):**
  - The spec's reason for M3 (more air for a serif name) no longer applies, because the serif role was dropped (V-2b-DISPLAY `decided_user`).
  - The move itself was approved on its own line, and B has no authority to drop it. So it is scheduled as written and put on the vetoable list in `feature-status.md`.
  - The spec's impact ("fewer entries visible") does not happen at the two user viewports: B measured 6 / 3 fully visible rows, before and after.
- **Smallest honest contract:** add `space-y-1` to the listbox (4 px between rows). Rulings, all vetoable:
  - **R41:** a gap, not padding. Each row's highlight box stays the same size.
  - **R42:** the gap is not a hit target.
  - **R43:** no margin after the last row.
  - `flex gap-1` is excluded, because items could shrink in an overflow list.
- **Prediction, measured by B** in real Chromium on the clean `f1782f8` tree (`b-round-181/out/library-probe.json`; a prediction, not evidence):
  - Option *n* moves y +4·n.
  - The listbox rect and every box outside it are unchanged.
  - scrollHeight goes 637 → 669.
  - Gaps go 0 → 4.
- **Tests:** one new test (LGS1) in the existing `library-row-strings-ui` suite, so no new harness copy. It locks tokens only; the pixels are C's. Mutations m304–m307; m306 and m307 keep `space-y-1`, so they turn red only through the row-token assertions (advisor fix).

## Freeze and base
- **Grants:** `b-round-181-r182-grants.txt` (3): `ArrangementLibrary.tsx` l.597, `library-row-strings-ui.test.tsx` (LGS1 plus at most one import) and doc 149 (status).
- **New file:** `b-round-181-r182-new-files.txt` (1): doc 150.
- **Frozen list:** `b-round-181-r182-tree-sha256.txt` (1003 entries, checked OK). Start hashes and the copies in `b-round-181/r182-granted-start/`.
- **Vitest base:** `b-round-181-r182-vitest-base.txt`, 17 files. B ran it on the start tree: **328/328** (`b-round-181/out/vitest-base-r182.json`). This is targeted, not the full suite.

## Ableton
- **No source was consulted.** M3 is a visual-density change with no behaviour, so B makes no Ableton claim. Parity: not applicable.

## Forward note (M4)
- The banner is `app/components/common/CookieConsent.tsx` (`fixed bottom-0 z-50`). It is mounted for every route in the protected `app/root.tsx` l.161.
- M4 will need a grant decision on a Store-shared file, plus a Store-page screenshot check.
- Recorded as M4-COOKIE-GRANT, to plan after the regression round.

## Not COMPLETE, not BLOCKED
- **Remaining scope:** M3, the REGRESSION round, M4, ROOT-RECON-GRID-HARNESS, STORE-REDESIGN (STORE-0…5), REVIEW-RECOMMENDATIONS (22 approved ids), T12-ADVANCED, the deferred Lows (254 entries), the Tech Lead manual checks, backend-only evidence and the final regression.
- **`awaiting_user` items** stay recorded; B does not call them deferred.
- Nothing needs external input.

## Ready for commit (root)
- Round 181 is already published (`f1782f8`). M1 is complete at that commit.
- Round 182 is not yet implemented.
