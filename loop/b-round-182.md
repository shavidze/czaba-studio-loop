# B — Round 182 → 183 planning (D-29z148)

Date: 2026-10-26 · Role: B (planning artifacts only; app source not touched: `git status` was clean before and after B's work) · Advisor: **available and consulted** (after orientation, before writing; and at the end).

## Inputs read
- `context/active-summary.md` (head), round-182 `current-task.md`, `a-round-182.md`, `c-round-182.md`, `c-round-182.json`, `b-round-181.md`, `gates/gate-round-182.json`, `env-status.json` and `regression-last.json`.
- `backlog.json`: only the keys needed (items status, `post_current_stage_queue`, VISUAL-A `order` / `approved_moves`, `rounds`, `regression_rounds`, `open_findings` M4-COOKIE-GRANT, `deferred_low_polish` C-R169-N1, `global_forbidden_files`).
- `feature-status.md`: only at the M3 / round-180 lines.
- Spec `visual-direction-a.md` §M (M4).
- Source, read-only at `f22290f`: `CookieConsent.tsx`, `root.tsx` (l.48–95 GA consent default, l.130–161), `lib/analytics.ts` (l.1–43), `vitest.config.ts`, `vite.config.ts`.

## Gate and baseline
- **Gate:** `gate-round-182.json` is **published**, commit `f22290f`, on both remotes. HEAD is `f22290f`.
- **Tree check:** `sha256sum -c c-round-182/end-tree-sha256.txt` → **OK** (1006). The 1007th tracked file is doc 150. It was untracked when C hashed, and its hash `73b80132…` equals A's end hash. `git status` is clean.
- **Archive:** `tasks/round-182.md` is a copy of the round-182 `current-task.md` (`cmp` equal, sha `4ff73521…`). Nothing was deleted.
- **Before-copies:** `b-round-182/before/` holds backlog, feature-status, b-next, current-task and regression-last.

## Backlog updates (only from C's independent evidence)
Source: `c-round-182.json`: PASS, `browserVerified` and `realVerified` both true, 0 bugs, every runnable row passed at both viewports.
- **M3 → მზადაა.** It stays vetoable (M3-RATIONALE-VETOABLE).
- **Blocked:** G182-3 fake-Bearer 403 stays BLOCKED (backend unavailable in cloud), as open evidence.

**Triage of C's and A's notes:**
| ID | B decision |
|---|---|
| C-R169-N1 (C's scope request) | The deferred Low's scope is widened to library options (`scope_round182`). |
| C-R182-N1-ARROW-SUBPIXEL-EDGE | Info, pre-existing (identical on HEAD). |
| C-R182-R42-GAP-CLICK | Info. The R42 ruling is confirmed in the browser. |
| C-R182-STATE-M3-WORDING | Process note. The regression round rewords the check: the inset ring equals the row box, and the global outline (C-R169-N1) is excluded. |
| A-R182-REVIEW-MARGIN-REGEX | Low → `deferred_low_polish`. Test-only. |
| A-R182-REVIEW-EXCLUSIONS | Low → `deferred_low_polish`. Test-only. |

- **Architecture:** A's round-182 note was "none". Nothing new.

## Decision: round 183 = M4
- **Regression:** 2026-10-24 → 2026-10-26 is 2 days, so it is not due. Planning on or after 2026-10-27 → REGRESSION round (expected 184). `regression_rounds` now covers M1, M3, M4 and the STATE-M3 wording.
- **M4 is next in the VISUAL-A order** (approved 2026-10-21). It is the last approved M; M5 is `awaiting_user`.
- **Reproduction:** B ran it on a clean HEAD copy, where it is real but cloud-hidden.
  - With `VITE_GA4_MEASUREMENT_ID` set (own vite `cacheDir`, :5175, GA hosts aborted), the banner on `/studio-lab` is fixed at (0, 832) 1440×68 / (0, 652) 1280×68.
  - It covers the status line and the shortcut hint bar.
  - On the shared :5173 server it never renders, because there is no `.env`. So the task requires C to run GA-env CUR and HEAD copies.
  - Evidence: `b-round-182/out/banner-head*`, `under-banner-head*`; tools in `b-round-182/tools/`. The first cold load reloaded (ENV-FIRST-LOAD) and was re-run. The copy, its cache and its server were removed.
- **Grant (M4-COOKIE-GRANT resolved):** `CookieConsent.tsx` is not globally forbidden, so it is granted. `root.tsx` is globally forbidden and stays untouched; the route check lives inside the component.
- **Smallest honest behaviour** (rulings, vetoable):
  - **R44, hide on `/studio*`, do not move.** Every fixed overlay position covers some Studio surface, and VISUAL-A forbids layout moves.
  - **R45, no Studio consent UI.** M4 does not change the pre-decision tracking posture: the gtag consent default stays `denied`, exactly as on Store pages before a click. Consent Mode may still send cookieless pings, but no analytics cookies or identifiers are stored. The banner appears on the next Store page.
  - **R46, the same predicate as `root.tsx` `isStudioPage`.**
  - **Alternatives considered:** a corner card or a top bar both still cover Studio controls. A Studio-native consent entry would be new behaviour and needs Saba.
- **Tests:** a new `CookieConsent.test.tsx` (CC1–CC5) and mutations m308–m311.
  - There is no "before" base, because no existing suite covers the component.
  - B warned against running vitest with an empty file list.

## Advisor (final call)
The final advisor call led to three tightenings:
1. **BANNER-STORE-M4:** a DOM / computed-style criterion. The pixel crop is supporting evidence only, because the banner blurs the dynamic content underneath.
2. **CUR copy:** an exact `git ls-files -c -o | tar` command, since `git archive` misses uncommitted work.
3. **R45 wording:** made accurate. Consent Mode may send cookieless pings, and M4 does not change the pre-decision posture. The wording was updated in `current-task.md`, `backlog.json` and here.

## Ableton
- Not applicable. Live has no web cookie banner, and no claim is made.

## Feature boundary and architecture
- After M4 and the regression round, VISUAL-A reaches its exit (ROOT-RECON-GRID-HARNESS).
- At that boundary B will re-raise the unanswered `b-round-180-checkpoint-request.md` to root as **one** bounded frontend-architect ask.
- This is not scheduled now and does not block M4.

## Not COMPLETE, not BLOCKED
- **Remaining scope:** M4, the REGRESSION round, ROOT-RECON-GRID-HARNESS, STORE-REDESIGN (STORE-0…5), REVIEW-RECOMMENDATIONS (22 approved ids), T12-ADVANCED, the deferred Lows (256 entries), the Tech Lead manual checks, backend-only evidence and the final regression.
- **`awaiting_user` items** stay recorded; B does not call them deferred.
- Nothing needs external input.

## Ready for commit (root)
- Round 182 is already published (`f22290f`). M3 is complete at that commit.
- Round 183 is not yet implemented.
