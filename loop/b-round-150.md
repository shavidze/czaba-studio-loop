# B round 150 → 151 planning (D-29z116)

Date: 2026-10-25 · Author: B. The advisor was available and used before writing (one call); it is used again before finishing.

## Inputs read
- **Task:** `current-task.md` (round 150), archived as `tasks/round-150.md` (identical copy, sha256 `73619d5c…a777`). The `-before` copies of `backlog.json`, `feature-status.md`, `plan.md` and the round-150 `b-next.json` are stored in `b-round-150/`.
- **Reports:** `a-round-150.md` and `c-round-150.md` / `c-round-150.json`: PASS, `browserVerified` = `realVerified` = true, 0 bugs, 14 rows passed. The only blocked check is fake-Bearer 403 (backend unavailable in cloud).
- **Gate:** `gates/gate-round-150.json` = **published**, commit `e94ae889c9f331bd681036cc154bb92d38020dc6` on both remotes. This is the round-151 baseline. B checked that HEAD = e94ae88 and that `git status` is empty.
- **Lookups only:** `context/active-summary.md`; ID lookups in `backlog.json` (VISUAL-A queue entry, RV-1..RV-5, findings); `plan.md` D-29z115; `visual-direction-a.md` § typography, boundaries and C checks; the source lines to change.
- **Not due or absent:**
  - the regression (`regression-last.json`: 2026-10-24, round 122; due on or after 2026-10-27);
  - `user-review/ableton-decisions.md` and `design-ux-decisions.md` (still absent).
- `root-pre-push-review.md` and `publication-checkpoint.json` are from 2026-10-07 to 2026-10-13. Their findings were triaged long ago, and nothing in them applies to this round.

## Backlog updates from evidence (v143; only C round 150 evidence + gate 150)
| ID | Before | After | Evidence |
|---|---|---|---|
| V-1a + V-1b (V-1) | V-1a ბაგია / V-1b dispatched | **მზადაა** (C PASS browserVerified, published e94ae88) | `c-round-150.json`, `gates/gate-round-150.json` |
| DUX-B-1 / DUX-B-4 | C-verified, closes on PASS + publish | **closed** | RV-2 61/61 ≥ 4.5 (min 4.57) |
| DUX-B-3 | scheduled r150 | **closed** | FIELD-BOUNDARY ≥ 3.05 pixel at both viewports |
| C-R149-1 | scheduled r150 | **closed** | Loop label 5.48 / 5.50 px |
| C-R149-2 | scheduled r150 | **closed** | halo 8.57 vs bar, line/halo 8.32 |
| GATE148-S1 | C-verified | **closed** (published) | AN-REVIEW r149 + publication |
| A-R150-REVIEW-L1 | — | info, **scheduled r151 (T1)** | A reviewer finding 1, confirmed by C |
| C-R150-BPM-EDGE-MARGIN | — | info note | `c-round-150.json` signals |
| B-R150-PM2-SUBSTRING | info | info (`pending-status.test.tsx` is not granted in r151) | — |

**Architecture notes, recorded as signals (not scheduled):**
- **A-R150-ARCH-NOTE:** keep the obsidian block as it is; moving the rules to `studio-theme.css` stays a signal.
- **A-R149-ARCH-STUDIO-THEME-CSS:** B was to revisit this at V-2. V-2a adds only 3 declarations to the same block and no new rule. It stays a signal, and B re-weighs it if V-2b or V-3 adds selectors.

## Round 151 decision: V-2a (typography stage 1)
- **Why now:** round 150 §7 fixed this outcome in advance (C PASS → V-1 closes → round 151 = V-2 first stage). No Critical, High or Medium finding is open, the regression is not due, and no user decisions arrived.
- **Facts measured, not assumed** (`b-round-150/tools/fontprobe.cjs`, real Chromium; outputs `b-round-150/out/fontprobe-{1440,1280}.json`, `v2a-predicted-moves-{1440,1280}.json`, `probe-*.png`; the store was not changed):
  - **Current font:** the Studio renders in Inter.
  - **Network:** Google Fonts are reachable.
  - **Utilities:** Tailwind `font-*` utilities resolve to `var(--font-*)`.
  - **Movement:** the exact V-2a change moves 29/27 keys horizontally (Master-strip followers by ≤ 9 px; the hint line's own width by −119 px), with 0 vertical or height deltas and 0 new overflow.
- **The uncertain UI contract and B's choice (R1):** the spec approves typography but also requires ±1 px boxes. Both cannot hold.
  - **Smallest honest behaviour:** allow horizontal text-width effects only; keep y/h, panels and visibility strict.
  - **Precedent:** the V-0 text-width exception that RV-1 already carries.
  - **Not BLOCKED:** the user approved the font change itself, and stopping would only delay approved scope.
  - **Veto:** the decision is visible to the user in `feature-status.md`, which they can veto.
- **Staging (R2):**
  - **V-2a:** loading, sans and numeral mono.
  - **V-2b:** serif display only on text already ≥ 16 px (measured first), 11 px uppercase labels and weight roles.
  - The full spec scope stays. Nothing is deferred.
- **Ownership:**
  - 8 existing files and 1 new file. `app.css` has a narrow grant (3 declarations).
  - `root.tsx` and `Modal.tsx` stay protected. Loading goes through the route's `links` (precedent: `studio.$productId.tsx` l.37).
  - Portals inherit through the existing `body:has(...)` selector.
- **Tests:** hand-written literals (TH2 +3 entries, TH7 links, TH8 SSR tokens) and 8 mutations (m125–m132). T1 fixes the dead guard that C confirmed.
- **C:**
  - Real-font proof uses CDP `CSS.getPlatformFontsForNode`, not just the computed stack.
  - Further rows: FONTS-SCOPED (Store pages fetch nothing new), RV-1-TYPE (R1 contract vs B's prediction), NO-CLIP with extreme values, FONT-FAIL fallback, and the usual RV-2, TOKENS-SCOPED, FUNC-SMOKE, VISUAL, G151-3 and PX-NET/REG-HYD.

## Not scheduled now (kept, not deferred without authorization)
- **VISUAL-A:** V-2b, V-3, M1/M3/M4.
- **Queued after VISUAL-A:** T12-ADVANCED (stage 5+), DEFERRED-LOW-POLISH (215 entries) and the final regression.
- **Awaiting the user:**
  - ABL-R-1..18 and DUX-R-1..9 (`awaiting_user`);
  - phase 2 (awaiting the user's go-ahead);
  - SRW-21 (`deferred_user`; a note was added that its route will need the same font links).
- **Open gate / evidence rows:**
  - PROD-SSR-NUL and PROD-MP3-UNVERIFIED (gate rows);
  - the fake-Bearer 403 checks (backend unavailable in cloud);
  - the Tech Lead manual checks.
- **Out of scope:** professional plugins/effects, pitch and multi-video layers. Grid tempo is not audio stretch.

## Checkpoint request (stage boundary: V-1 closed)
- **For root:** please run the bounded read-only frontend-architect checkpoint in `b-round-148-checkpoint-request.md`. Its three questions still stand:
  1. splitting the strings module, with names and aliases;
  2. test pins and a shared scan helper;
  3. `ArrangementLibraryOption`.
- **One addition:** should the Studio theme rules (now 21 declarations in `app.css`, growing in V-2b/V-3) move to `app/styles/studio-theme.css` before V-3?
- **Format:** keep or extract, with value, risk and at most three sentences, per `store/.claude/references/architecture-checkpoint.md`.
- **It does not block V-2a.**

## Readiness
- **Round 151** is ready to dispatch. Baseline e94ae88 is clean; frozen 962; grants 8 + 1.
- **Commit:** nothing new is ready to commit until C round 151 passes.
- **COMPLETE: no.** Remaining:
  - VISUAL-A stages, T12-ADVANCED, the deferred Low polish and the final regression;
  - user-gated items and backend-only evidence.
