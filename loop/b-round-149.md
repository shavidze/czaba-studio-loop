# B round 149 → 150 planning (D-29z115)

Date: 2026-10-25 · Author: B. The advisor was available and used before writing; it is used again before finishing.

## Inputs read
- **Task:** `current-task.md` (round 149), archived as `tasks/round-149.md` (identical copy, sha256 `c53c1ef3…3eef`). `-before` copies of `current-task.md`, `backlog.json`, `feature-status.md`, `b-next.json`, `regression-last.json` and `plan.md` are stored as `b-round-149-*-before`.
- **Reports:** `a-round-149.md`, `c-round-149.md`, `c-round-149.json`.
- **Gate:** `gates/gate-round-149.json` = **skipped** ("C taskStatus FAIL"). The baseline HEAD stays `b292ff4`, and the round-149 tree is uncommitted (B: `sha256sum -c a-round-149/end-sha256.txt` 5/5 OK).
- **Lookups only:** `context/active-summary.md`, ID lookups in `backlog.json`, `plan.md` D-29z114, `visual-direction-a.md`, and the 6 source lines to change. B also checked the dev-server SSR HTML: all 5 field testids and the Overview playhead are present in S0.
- **Not due or absent:**
  - the regression (`regression-last.json` 2026-10-24, round 122; it is due on or after 2026-10-27);
  - `user-review/ableton-decisions.md` and `design-ux-decisions.md` (still absent).

## Backlog updates from evidence (v142; only C round 149 evidence)
| ID | Before | After | Evidence |
|---|---|---|---|
| V-1a | dispatched | **ბაგია**: C FAIL, Low only; all other rows PASS, browserVerified | `c-round-149.json` |
| C-R149-1 (Low, round-caused) | — | scheduled round 150 (L1) | RV-2 `arrangement-loop-brace:Loop` 4.32/4.38 |
| C-R149-2 (Low, round-caused) | — | scheduled round 150 (L2) | STATE-DISTINCT, pixel 1.03 |
| DUX-B-1 / DUX-B-4 | scheduled r149 | **C-verified** (61/61 ≥ 4.5); closes on round 150 C PASS + publication | RV-2 |
| GATE148-S1 | scheduled r149 | **C-verified** (AN-REVIEW 3/3); closes on publication | AN-REVIEW |
| DUX-B-3 | deferred, V-1b | scheduled round 150 | RV-2-FIELDS 1.15 |
| B-R150-PM2-SUBSTRING | — | info note | B source read |
| C-R149 observations (selection highlight; Space on an empty project) | — | info signals; the Space one is re-checked in the next regression | `c-round-149.md` |

- **Not closed yet:** DUX-B-1/B-4 and GATE148-S1. The tree is unpublished, and round 150 changes the same token block, so RV-2 runs again. V-1a is not **მზადაა**.
- **Architecture notes, recorded as signals (not scheduled):**
  - A-R149-ARCH-STUDIO-THEME-CSS: move Studio rules to `studio-theme.css`. Revisit at V-2 if V-2 adds Studio-scoped rules.
  - Reviewer L2: split the `:has()` selector.
  - Reviewer L4: page-transition overlap.
- **Blocked row:** the fake-Bearer 403 stays open backend-only evidence. It does not make the round unverified.

## Round 150 decision: V-1b + C-R149-1 + C-R149-2 (three related colour/contrast items)
Round 149 §7 fixed this outcome in advance: a Low the round caused → bounded fix-up, same owner. Colour failures join V-1b.

| Item | Fix | Math (WCAG, sRGB) |
|---|---|---|
| DUX-B-3 | scoped `outline-strong` `#736b60`; `border-outline-strong` on BPM, library search and the detail `inputClass` | 3.50 on surface, 3.70 on the fill, 3.30 on elevated |
| C-R149-1 | brace `bg-accent/30` → `/20` (the Loop button's existing on-fill) | label 5.47 |
| C-R149-2 | Overview playhead + `ring-1 ring-background` (a 1 px dark halo) | halo vs bar 8.32; line vs floor 8.32 |

- **Corrected count:** 3 components, not 4. The group-name and marker-name inputs are already `border-brand`.
- **Smallest honest choices:**
  - `outline-strong` has 0 consumers, so no new `@theme` token and no Store-wide edit.
  - The spec value `#3A3530` cannot reach 3:1. The deviation is recorded the same way as dim in D-29z114.
  - No single token can fix the playhead (foreground 1.88 on the bar; background ≈ 1.0 on the floor). The halo keeps the one accent, and box-shadow does not move the bbox.
- **Grants:** 8 existing files, 0 new (`b-round-149-r150-grants.txt`). Frozen 962 (`b-round-149-r150-tree-sha256.txt`, OK). Start hashes and start copies are in `b-round-149/r150-granted-start/`, which includes the 2 untracked round-149 files (C-R119-01). The `app.css` narrow grant is in `narrow_grants`.
- **Mutations:** m119–m124. C rows: FIELD-BOUNDARY (pixel ≥ 3.0, actual parent background), the full RV-2 re-run, STATE-DISTINCT (Overview halo ≥ 3:1), RV-1, TOKENS-SCOPED, RV-3, FUNC-SMOKE, VISUAL, G150-3 and PX-NET.
- **Ableton:** CZABA-only (brand and WCAG). No Live parity is claimed.

## Not scheduled now (kept, not deferred without authorization)
- **After V-1:** V-2, V-3, M1/M3/M4, T12-ADVANCED, the deferred-Low polish pass (215 entries) and the final regression.
- **Waiting on others:** Tech Lead manual checks; SRW-21 (`deferred_user`); PROD-SSR-NUL and PROD-MP3 (gate); backend-only evidence; ABL-R and DUX-R (`awaiting_user`); M5 (not approved); the phase-2 go-ahead.
- **Frontend-architect checkpoint:** `b-round-148-checkpoint-request.md` is still pending and non-blocking. Round 150 is a small colour stage on the same owner, so this is not a new boundary. It is re-asked once at the VISUAL-A boundary.

## Readiness
- Nothing is commit-ready. Rounds 149 + 150 publish together after C round 150 PASS.
- **B-owned files changed in this planning:**
  - `current-task.md`, `tasks/round-149.md` (a copy);
  - `b-round-149.md`, `b-round-149-checkpoint.md`, `b-next.json`;
  - `backlog.json` (v142), `feature-status.md`;
  - `b-round-149-r150-{grants,new-files,tree-sha256,granted-start-sha256}.txt`, `b-round-149/r150-granted-start/`;
  - `docs/technical/studio-real-workspace/plan.md` (D-29z115).
- No store file was changed by B.
