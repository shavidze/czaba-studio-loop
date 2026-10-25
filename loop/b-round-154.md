# B round 154 → 155 planning (D-29z120)

Date: 2026-10-25 · Author: B. **Advisor: available.** I called it once after orientation, before writing, and once before finishing.

## Inputs read
- **Task:** `current-task.md` (round 154), archived as `tasks/round-154.md`. It is an identical copy (sha256 `be11efbdafdfbc6a03264f479f859fe9c8fe6b0880c33a3db352610a2a01124f`); no archive existed before.
- **Backups made before editing:**
  - `b-round-155-current-task.md-before`, `b-round-155-b-next.json-before` and `b-round-155-feature-status.md-before`;
  - `b-round-154/backlog-before.json` and `b-round-154/plan-before.md`.
- **Reports:**
  - `a-round-154.md`. Reviewer score 9/10. Architecture note: "none".
  - `c-round-154.md` / `c-round-154.json`: **FAIL**, `browserVerified` = `realVerified` = true. 13 rows passed. MONO-STYLE failed on N6 only (C-R154-01, Low). C-R154-02 is Low and pre-existing. The fake-Bearer 403 is blocked (backend unavailable in cloud).
- **Gate:** `gates/gate-round-154.json` = **skipped** (C taskStatus FAIL). The baseline stays HEAD `037e25f`, plus A's round-154 working tree. `sha256sum -c a-round-154/end-sha256.txt` passed for all 14 paths at planning, and `git status` shows 13 ` M` + 1 `??`.
- **Lookups only:**
  - `context/active-summary.md` (head);
  - ID lookups in `backlog.json`, `feature-status.md` and `plan.md`;
  - `ArrangementLane.tsx` l.860–1015, TH10 l.410–430 and `CookieConsent.tsx`, all read-only.
- **Root review files:** `root-pre-push-review.md` (latest entry: round 65 and the 2026-10-21 VISUAL-A note) and `publication-checkpoint.json` (latest: `rootV2Checkpoint_round65`) are present. They have no item newer than what the backlog already holds, so there is nothing new to fold in.
- **Not due or absent:**
  - The regression is not due. `regression-last.json` says 2026-10-24, round 122, so it is due on or after 2026-10-27.
  - `user-review/` has no `*-decisions.md`.

## Backlog updates from evidence (v147; only C round 154 + gate 154)
| ID | Before | After | Evidence |
|---|---|---|---|
| V-2b-2 | in progress (round 154) | **ბაგია**, not done (C FAIL Low; gate skipped); fix-up in round 155 | `c-round-154.json` |
| round 154 entry | dispatched | `c_fail_low_unpublished` | `gates/gate-round-154.json` |
| C-R154-01 (new) | — | open Low, scheduled round 155 (an owned row, cheap) | `c-round-154/out/c154-*.json` laneGhost |
| C-R154-02 (new) | — | `deferred_low_polish` (pre-existing glyph fallback, like C-R151-3) | `c154-*.json` group.m.groupGlyph |
| C-R154-GHOST-TITLE (new) | — | `deferred_low_polish`: a short clip's ghost title is visible only 1 px (it was 9 px); fixing it needs a layout change | `c154-*.json` laneGhost |
| C-R154-INFO-NOTES (new) | — | info: ruler gap 12.8 px (0 overlaps), N5 has no tabular-nums as specified, the TH10 inherited-weight gap | `c-round-154.md` |
| B-R154-V2B3-MISSED-TIMECODES (new) | — | added to V-2b-3 by name: the drop-ghost start and the all-tracks range overlay label | B source read |
| A-R154-ARCH-NOTE (architecture signal) | — | signal only (reviewer proposals: W6 order dependence, N1 loading/error lock, ruler ≥ 10:00 spacing) | `a-round-154.md` |
| VISUAL-A | V-2b-2 in progress | status appended; `v2b2_fixup_d29z120` with the V-2b-3 scope and the css2 evidence plan | — |

- `deferred_low_polish` now has 219 entries (217 + 2). The `feature-status.md` count is aligned to 219.
- **Process note:** while editing, I briefly overwrote the long VISUAL-A `status` string. I restored it from `b-round-154/backlog-before.json` and appended the round-155 note. A check confirmed that the new value starts with the original string unchanged. A key-level diff against the backup shows only the intended keys changed.

## Decisions (D-29z120) and rationale
- **Round 155 is only the fix-up.** `tasks/round-154.md` §7 fixed the next step in advance: C FAIL on an owned row → a bounded fix-up of that row. The bug gate lets an owned, cheap Low be fixed now. It also blocks the css2 evidence, so leaving it would stall R4.
- **R1 — `font-normal` on the span, not the container.** This is the smallest honest fix. Only the mono timecode changes, and the sans title keeps 500, like the other lane labels. It is user-vetoable.
- **R2 — A lock that sees the inherited weight.** TH10 l.422 is an exact-string assertion and has to change anyway. A new source assertion pins "container `font-medium` + span `font-normal`". m142 checks the rejected alternative.
- **R3 — Two missed timecodes go to V-2b-3 by name, not into this fix.** Each is a time inside a sentence string, which is the part-templating case, so no scope is dropped.
- **R4 — The css2 trim needs evidence first.** The cookie banner cannot render in the cloud (`VITE_GA4_MEASUREMENT_ID` is absent), so C checks it at source level as COOKIE-SOURCE. The render is listed as blocked by env and does not make `browserVerified` false. The trim removes only zero-consumer weights; Instrument Sans 600 stays while the protected Modal title uses it.
- **B grep:** the only exact-class assertion on the N6 span is TH10. The other ghost tests select by testid or `data-ghost-start`.

## Ownership (round 155)
- **A owns 3 existing files** (`b-round-154-r155-grants.txt`):
  - `ArrangementLane.tsx` (one token);
  - `studio-theme-obsidian.test.tsx` (TH10);
  - doc 125.
- **New files:** none.
- **Frozen:** 970 (`b-round-154-r155-tree-sha256.txt`). This includes A's other 11 round-154 files at their end hashes.
- **Start state:** hashes in `b-round-154-r155-granted-start-sha256.txt`, copies in `b-round-154/r155-granted-start/`.
- **Protected files are unchanged:** `studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`, `auth*`, `AuthContext.tsx`, `StudioContext.tsx`, `Modal.tsx`, `root.tsx` and `CookieConsent.tsx`.

## Architecture
- A-R154 has no Architecture note. The reviewer proposals are recorded as signals only.
- The V-2 boundary frontend-architect request waits for a V-2b-2 PASS, which has not happened yet. It is not dropped. `b-round-148-checkpoint-request.md` is still pending and does not block.
- A round-155 change of one token adds no owner-concentration risk.

## Commit readiness
- Round 154 is not publishable alone.
- On a C round 155 PASS, root publishes rounds 154 + 155 together (14 paths).

## Remaining scope (nothing shrunk)
- **VISUAL-A:**
  - the V-2b-2 fix-up (round 155);
  - V-2b-3 (5 named places);
  - the css2 trim (after the evidence);
  - V-2b-DISPLAY and B-R153-PREVIEW-DUR (awaiting_user);
  - V-3;
  - M1, M3, M4.
- **Then T12-ADVANCED.**
- **The deferred_low_polish pass** (219 entries) comes before release.
- **awaiting_user:** ABL-R-*, DUX-R-*, M5, phase 2, and the C-R151-2 option.
- **Other:**
  - SRW-21 is deferred_user;
  - the Tech Lead manual checks;
  - backend-only evidence;
  - PROD-MP3-UNVERIFIED / PROD-SSR-NUL (gate);
  - the regression is due 2026-10-27;
  - the final full regression.

## Advisor points applied
- Second review: m142 now removes only the container's `font-medium`, so only the (ii) lock can catch it. The (ii) container literal is pinned exactly (count 1, distinct from l.878). The feature-status wording is fixed. The root review files were checked.
- Fix at span level, with the rationale recorded.
- The TH10 exact-string change is stated as required, and the grep was repeated for the new string.
- The drop ghost and range overlay are named in V-2b-3.
- C-R154-02 and the ghost-title Low go to `deferred_low_polish`.
- The cookie banner gap is closed with a source row, because a browser render is env-gated in the cloud.
- The checkpoint request is deferred to the V-2b-2 PASS and stays recorded.
- Rounds 154 + 155 are published together.
