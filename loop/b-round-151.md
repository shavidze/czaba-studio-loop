# B round 151 → 152 planning (D-29z117)

Date: 2026-10-25 · Author: B. The advisor was available and used before writing (one call); it is used again before finishing.

## Inputs read
- **Task:** `current-task.md` (round 151), archived as `tasks/round-151.md` (identical copy, sha256 `1f0e86f5a14c946ae2cda7c215c1f6f5942a68c748b827fe2a9a80263a97a352`). `-before` copies of `backlog.json`, `feature-status.md`, `plan.md` and the round-150 `b-next.json` are in `b-round-151/`.
- **Reports:** `a-round-151.md`; `c-round-151.md` / `c-round-151.json`: **FAIL, Low only**, `browserVerified` = `realVerified` = true, 13 rows passed, fake-Bearer 403 blocked (backend unavailable in cloud).
- **Gate:** `gates/gate-round-151.json` = **skipped** ("C taskStatus FAIL"). Not published, so the round-152 baseline is HEAD `e94ae88` **plus the preserved round-151 working tree** (8 M + 1 ??). B checked that the 9 hashes equal `a-round-151/end-sha256.txt`.
- **Lookups only:** `context/active-summary.md`; ID lookups in `backlog.json`; `plan.md` D-29z116; `visual-direction-a.md` § ტიპოგრაფია and § საზღვრები.
- **Not due / absent:** regression (`regression-last.json` 2026-10-24, round 122; due on or after 2026-10-27); `user-review/ableton-decisions.md` and `design-ux-decisions.md`.

## B measurements this planning (real Chromium on the round-151 tree, store source untouched)
- `b-round-151/tools/sepprobe.cjs` → `out/sepprobe.json`: Instrument Sans 12 px: space 2, `·` 1, " · " 5 px; Inter 3 / 3 / 9 px. `word-spacing` 0.08 / 0.12 / 0.16em → " · " 7.6 / 8.8 / 10.1 px, hint 1132 / 1162 / 1193 px. (Headless Linux integer advances; not tuned finer.)
- `b-round-151/tools/wsprobe.cjs` → `out/wsprobe-{1440,1280}.json`: `word-spacing` 0.1/0.12em vs the V-2a tree in S0: 17 horizontal moves, 0 vertical, 0 missing/added, 0 new overflow (INTER selector only).
- Google css2 for IBM Plex Mono: no served subset's `unicode-range` covers U+221E.
- `b-round-151/tools/size16.cjs` → `out/size16.json`: in S0 the only ≥ 16 px Studio text is the mono transport position and the `◀` icon (both viewports). Portals and S1/S2 not measured.

## Backlog updates from evidence (v144; only C round 151 evidence + gate 151)
| ID | Before | After | Evidence |
|---|---|---|---|
| V-2a | dispatched (მუშავდება) | **ბაგია** (C FAIL Low only); not მზადაა | `c-round-151.json` |
| C-R151-1 | — | low, **ruled (R1)**: d6 tag error; closes on C round 152 RV-1-TYPE PASS | `c-round-151/out/rv1type-compare.json` |
| C-R151-2 | — | low, **`deferred_low_polish` + awaiting_user** (R2) | `c-round-151/out/space2-1440.json`, `b-round-151/out/*` |
| C-R151-3 | — | low, **`deferred_low_polish`** (R3) | `c-round-151/out/c151-1440.json` |
| A-R151-REVIEW-L1 | — | info, ruled (R4, FONTS-SCOPED wording) | `a-round-151.md` review |
| A-R151-REVIEW-L4 | — | info, scheduled round 152 (T2) | `a-round-151.md` review |
| A-R151-ARCH-NOTE | — | signal (keep; not scheduled) | `a-round-151.md` |
| B-R151-V2B-SIZE16, C-R151-SIG-SANS-TIMECODES | — | info, V-2b inputs | `b-round-151/out/size16.json`, `c-round-151.md` VISUAL |

The 13 PASS rows are sub-criterion evidence for V-2a; they do not make it done while the round verdict is FAIL.

## Decisions (D-29z117) and rationale
- **R1 — C-R151-1 is a classification error, not a defect.** The hint is a content-sized `<p>`: its box is its text. D-29z116 R1 already allowed own-text width changes; B's "panels ±1 px" clause collided with d6's tag. Smallest honest behaviour: re-tag, keep every other rule. A fixed width would be a new, unapproved layout change. User may veto.
- **R2 — C-R151-2 is not shipped as a fix-up.** Round-151 §7 said a round-caused Low gets a fix-up "not a waiver", but the user's 2026-10-23 gate (new Lows during VISUAL-A → `deferred_low_polish`) is the authority, and no fix exists inside the approved typography: the spec allows font, weight and letter-spacing only (`ასოებს შორის დაშორება`); word-spacing is a different knob and does not widen the 1 px dot; changing the glyph changes text content (forbidden) across 94 lines with no shared constant. So it is deferred **and** put to the user with measured options; it still blocks final acceptance until fixed or accepted. This is not a scope cut.
- **R3 — C-R151-3:** no bounded font-side fix (glyph absent from every Google subset; self-hosting forbidden). Deferred to V-3/polish.
- **R4 — header prefetch:** reword FONTS-SCOPED (css2 `prefetch` allowed, 0 woff2 required); C checks it explicitly this time.
- **R5 — round 152 scope:** doc 123 (D1) + TH8 exact pan count (T2, expected 3: unfolded music/stems/sfx; video and folded lanes have none per `track-pan.test.tsx` l.686–703). Mutation m133 only (no m132 re-run: `ArrangementLane.tsx` is frozen and T2 leaves the not-font-mono loop unchanged; round-151 m132 evidence stands). If the SSR count is not 3, A writes the actual N with the reason. C re-checks only what the rulings changed plus a short font/function/auth spot check; unchanged-source rows from round 151 stand.
- **Why a separate closure round, not V-2b now:** one stage per round, and V-2a is unpublished. Combining it with V-2b would keep 9 paths unpublished longer and mix two verdicts. The closure round is small.

## Ownership (round 152)
- A owns 2 files: `studio-theme-obsidian.test.tsx` (T2, one line) and doc 123 (D1). 0 new files.
- Frozen 969 (`b-round-151-r152-tree-sha256.txt`), including the 7 other round-151 paths at their round-151 end hashes. Start hashes `b-round-151-r152-granted-start-sha256.txt`; start copies `b-round-151/r152-granted-start/`.
- Protected files unchanged: `studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`, `auth*`, `AuthContext.tsx`, `StudioContext.tsx`, `Modal.tsx`, `root.tsx`.

## Architecture
- A-R151 note (keep) recorded as a signal. `b-round-148-checkpoint-request.md` (3 questions) is still pending with root; non-blocking. No new owner-concentration risk this round (2 files, test + doc).

## Commit readiness
- Rounds 151 + 152 become commit-ready only on C round 152 PASS; root runs verify, review and publishes. Not ready now.

## Remaining scope (not shrunk)
- VISUAL-A: V-2a closure (r152), V-2b (display serif ≥ 16 px — may need a user decision on size, labels 11 px/500/0.14em uppercase, weight roles), V-3 (icons), M1/M3/M4; then T12-ADVANCED; deferred_low_polish pass (including C-R151-2/3, ABL-B-2, C-R122-01/02, DUX-B-2 etc.) before release; awaiting_user: ABL-R-*, DUX-R-*, C-R151-2 option; SRW-21 deferred_user; Tech Lead manual checks; final full regression.
