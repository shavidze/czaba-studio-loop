# B round 146 → 147 planning (D-29z112)

Date: 2026-10-24 · Author: B · Advisor: available and used (once before writing, and once before finishing).

## Inputs read
- `context/active-summary.md`. From `backlog.json`, only the specific IDs needed (python lookups).
- `current-task.md` (round 146), now archived as `tasks/round-146.md` (sha256 `821b6ad4…0fd3`, identical copy).
- `a-round-146.md`, `c-round-146.md`, `c-round-146.json`.
- `gates/gate-round-146.json` is **published**, commit `3328e753db68c2eb84c291e0b711f933e498ced7` on both remotes. It is the baseline HEAD for round 147. Also read `gates/round-146/review.md` (9/10).
- `regression-last.json` (round 122, 2026-10-24): the next regression is due on or after 2026-10-27, so it is not due now.
- `user-review/ableton-decisions.md` and `design-ux-decisions.md`: absent.
- Store HEAD is `3328e75` and `git status --short` is empty. The dev server on :5173 returns 200.

## Evidence-based backlog updates (only from C round 146 PASS + gate 146)
| ID | Before | After | Evidence |
|---|---|---|---|
| V-0.5a | bug | **c_pass / done** (published 3328e75) | C round 146 all rows PASS; round 145 PASS rows stand |
| C-R145-01 | scheduled | closed | PLAY-MARKER (a)–(d), LAYOUT-LIB (ii) |
| ABL-B-1 | scheduled (deferred Low) | closed | LAYOUT-LIB (iv): list 134/134, all options sw = cw |
| C-R142-02, LIB-SEARCH-KEYWORDS, ARCH-R142, GATE144-S4 | waiting on publication | closed | C round 145 LIB-SEARCH PASS + publication |
| GATE144-S1 | waiting on publication | closed | C round 145 AN-REVIEW + publication |
| A-R145-REVIEW-DM-VALUES / GUARD-TEXTS | scheduled | closed | C round 146 AN-REVIEW |
| GATE-145-SKIPPED | open | closed | gate 146 published 145 + 146 |
| C-R146-01 (Low, pre-existing) | — | `deferred_low_polish` | `c-round-146.json` bugs[0] |
| GATE146-S3 / S4 / S6 (Low) | — | `deferred_low_polish` | `gates/round-146/review.md` |
| GATE146-S1 (doc 119 status) | — | scheduled round 147 (cheap, owned) | review #1 |
| GATE146-S2, C-R146-OBS-SELECT-MOVES-PREVIEW, A-R146-REVIEW-PC2-SUBSTRING | — | signals / info | review #2, C note 3, A review |

- **Architecture notes** were recorded as signals and not scheduled:
  - A-R146 note: "no signal".
  - Gate-146 signal 2 (imports into the leaf module): keep.
  - Gate-146 signal 3 (library row layout contract): conditional; scheduled only if V-0.5b breaks the row again.
- The strings-split checkpoint request has a round-146 addendum. It now asks root to run the bounded frontend-architect checkpoint when V-0.5c closes, which is the V-0 feature boundary.

## Round 147 decision: V-0.5b in one round
- **Scope (measured at 3328e75):**
  - Georgian, non-comment lines: `ArrangementLibrary.tsx` 16, `ArrangementLibraryPreview.tsx` 8, `collection.ts` 10.
  - Pins: 68 lines in 9 test files, plus ST47's two ledgers. e2e has none. `library.test` l.16 is fixture data.
- **Why not split:** the `ready` status names the preview's Add button, and `empty`/`failed` name the library (GATE128-S1). Grants 15 + 1 is the same size as round 145.
- **Smallest honest UI contract choices** (rationale in D-29z112 R2–R4):
  - **New object `studioLibraryPanelStrings`.** This follows the V-0.4 pattern of one object per component, and ST10 stays untouched. The cost is the 23rd object, which is recorded on the checkpoint.
  - **Collection statuses stay in place.** They remain literals in `collection.ts`, and `ready` interpolates the Add constant.
  - **Plural forms:** `1 sound` / `N sounds`.
  - **Terms.** These come from the Live 12 browser chapter in B's capture, `b-round-144/live/working-with-the-browser.txt`, re-read now:
    - `All` (§4.2);
    - `Fold/Unfold` (§4.5, §4.4.3);
    - `Library sidebar` (§4 layout);
    - `Preview` (§4, §4.9).

    `Expand/Collapse library` is a CZABA glossary term, and its Live counterpart is unconfirmed. In user-visible text, "source" becomes "sound", to match the panel's own words.
  - **`▶ Preview`, not `▶ Play`.** The toggle starts a library preview, not transport playback (Live calls it the "Preview toggle"), so `▶ Play` would be ambiguous next to the transport's Play.
- **Layout baseline re-captured by B** at 3328e75, before A runs:
  - Tool: `b-round-146/tools/libbase147.cjs`. Its selectors are testid/role only, and `lib.cjs` accepts both `იტვირთება…` and `Loading…`.
  - Output: `b-round-146/out/libbase147-{1440,1280}.json` and `b-round-146/shots/libbase147-*`.
  - States: ready, selected, previewing, emptySearch, filtered, collapsed, error. The header badge and the status line were added.
  - Observations at baseline:
    - The badge is 283 px wide.
    - The status line fits on one line.
    - The filter line already truncates (sw 284 > cw 264, `truncate`, by design).
    - The preview title shows `Middle East — საჯარო preview` by default. The no-selection text appears only when the search has no results.
- **Frozen list:** 950 entries. Grants: `b-round-146-r147-grants.txt` (15) plus `b-round-146-r147-new-files.txt` (doc 120). Start hashes and start copies: `b-round-146/r147-granted-start/`.

## Not scheduled now (kept, not deferred without authorization)
- **Remaining V-0 work:** V-0.5c (VideoDock 17 lines, route meta title + ST40, SSR `console.error` assertion, `lang="en"`, final RV-4 grep, RV-1 re-capture).
- **Later queue:** V-1…V-3, M1/M3/M4, T12-ADVANCED, and the deferred-Low polish pass (206 open entries).
- **Waiting on others:** Tech Lead manual checks; SRW-21 (`deferred_user`); PROD-SSR-NUL / PROD-MP3 (gate); backend-only evidence (fake-Bearer 403, PURCHASED rows); the ABL-R / DUX-R recommendations (`awaiting_user`); the phase-2 go-ahead.

## Readiness
- Gate 146 already published rounds 145 + 146. Nothing new is commit-ready until C round 147 passes.
- **B-owned files changed this planning:**
  - `current-task.md`, `tasks/round-146.md` (copy), `b-round-146.md`, `b-next.json`;
  - `backlog.json` (v139), `feature-status.md`, `b-round-136-checkpoint-request.md` (addendum);
  - `docs/technical/studio-real-workspace/plan.md` (D-29z112 + ownership line);
  - `b-round-146-*` grant/frozen/start files and `b-round-146/` tools/out/shots.
- Before-copies are saved as `b-round-146-*-before`.
- No store file was touched.
