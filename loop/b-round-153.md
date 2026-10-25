# B round 153 → 154 planning (D-29z119)

Date: 2026-10-25 · Author: B. **Advisor: available.** I called it once after orientation and measurement, before writing anything, and once more before finishing.

## Inputs read
- **Task:** `current-task.md` (round 153), archived as `tasks/round-153.md` (identical copy, sha256 `a3cff53b3afc789b2547ad37bf67b72f3188e0db4d9f28ae750391e596218698`). Before editing I saved `-before` copies of `backlog.json`, `feature-status.md`, `plan.md` and `b-next.json` in `b-round-153/`.
- **Reports:**
  - `a-round-153.md`. Reviewer score 9/10. Architecture note: "none". The reviewer also proposed a shared label-class constant.
  - `c-round-153.md` / `c-round-153.json`: **PASS**, `browserVerified` = `realVerified` = true, 12 rows passed, 0 bugs. The fake-Bearer 403 is blocked (backend unavailable in cloud).
- **Gate:** `gates/gate-round-153.json` = **published** `037e25f` (both remotes). That commit is the baseline, and the store tree is clean.
- **Lookups only:** `context/active-summary.md` (head), ID lookups in `backlog.json` / `feature-status.md` / `plan.md`, and `visual-direction-a.md` (§ ტიპოგრაფია, § საზღვრები).
- **Not due or absent:**
  - The regression is not due. `regression-last.json` says 2026-10-24, round 122, so it is due on or after 2026-10-27.
  - `user-review/` has only `ableton-review.md` and `design-ux-review.md`. **No `*-decisions.md` exists.**

## Backlog updates from evidence (v146; only C round 153 + gate 153)
| ID | Before | After | Evidence |
|---|---|---|---|
| V-2b-1 | in progress (round 153) | **მზადაა** (C PASS browserVerified, published 037e25f) | `c-round-153.json`, `gates/gate-round-153.json` |
| C-R152-DOC123-L67 | scheduled | closed | AN-REVIEW (clause on l.70) |
| B-R152-LABEL-WIDEN-26PX | user-vetoable | user-vetoable, measured by C (max 26 px, 0 vertical, 0 clip) | `c-round-153.json` |
| C-R151-SIG-SANS-TIMECODES | scheduled V-2b-2 | round 154 (R2 split) | — |
| C-R153-D6-TEMPO-ROW-TESTID (new) | — | info, tool note | `c-round-153.md` |
| C-R153-SR-UPPERCASE (new) | — | info, Tech Lead manual (no real SR in cloud) | `c-round-153.md` |
| C-R153-PRED-MASTER-TEXT (new) | — | closed (my prediction-text error) | `c-round-153.json` notes |
| B-R153-PREVIEW-DUR (new) | — | awaiting_user | `b-round-153/out/previewprobe-*.json` |
| B-R153-SANS-LIST (new) | — | user-vetoable decision | `zoomprobe`, `v2b2sim` |
| B-R153-CSS2-TRIM (new) | — | evidence pending (C WEIGHT-INVENTORY) | — |
| A-R153-ARCH-NOTE (architecture signal) | — | signal only | `a-round-153.md` |

The round-153 entry in `rounds` is now `c_pass_published`, and round 154 was added. VISUAL-A got the status line and `v2b2_plan_d29z119`. `feature-status.md` got the round-153 line and its VISUAL-A row was updated. `plan.md` got D-29z119 and its ownership line.

## B measurements (real Chromium on `037e25f`, store untouched)
Tools are in `b-round-153/tools/` and outputs in `b-round-153/out/`.
- **`v2b2sim`** (S0/S1/S2, both viewports, in-page style only):
  - **Weights 600/700 → 500:** 11–14 hits; only the `h1` dw −2 and "· Workspace" dx −2 move; 0 vertical, 0 clip.
  - **Mono core:** only the library playhead dw +8 and Metronome +2 (from `4/4`) move. The one new ellipsis is the preview title.
  - **Selects:** +10 px, and Env moves +10.
  - **Gain reset:** dw +3, no follower.
- **`previewprobe`:** the preview title has slack 0. A mono duration gives −6 px, −3 px with −0.025em and −1 px with −0.05em. Any widening truncates the title.
- **`zoomprobe`:** the worst readout "123.4 px/s" is 57 px in sans and 70 px in mono, against a 64 px box and a 6 px gap. Pan "50L" is 21 px in both.
- **`rulerprobe`** (8 zoom positions, BPM 90): ruler and tempo labels have 0 overlaps in mono at both viewports. The minimum gap is 14.4 px.
- **`__tests__` grep:** the only exact class assertion that breaks is `render-budget` l.528, so it is granted. LRS l.248 survives because N1 wraps inside the second child. TH8 (pan stays sans) is kept.

## Decisions (D-29z119) and rationale
- **R1 — Weight roles.** Every `font-semibold` and `font-bold` becomes `font-medium`, matching the spec's UI sans 400/500. The peak over-state drops to mono 400; the over state is still shown by the destructive colours. This closes the D-29z116 R5 interim state.
- **R2 — Mono follows the spec list (timecode, BPM, dB, from/to).** This is the smallest honest reading, and it stays consistent with the round-151 rule that kept pan out (TH8).
  - **Counts, zoom px/s, `4/4` and the selects are not on the list.** That narrows the D-29z118 planning note, which listed "zoom readout, counts". I record it as a user-vetoable ruling (B-R153-SANS-LIST), not as dropped scope. For the zoom readout, the measured overflow independently supports keeping it sans.
  - **The preview duration is on the list**, but mono would hide part of the default title, which is user content. Hiding content needs a user call, so it is a recorded question (B-R153-PREVIEW-DUR, options a–c). It is not a deferral.
  - **From/to inside sentences is on the list** and becomes its own stage, V-2b-3, scheduled next. It needs part-templating in `strings.ts` with `textContent` byte-identical.
- **R3 — The Export title stays as it is.** Its weight comes from the protected `Modal.tsx`. It is folded into the V-2b-DISPLAY question.
- **R4 — The css2 URL is unchanged.** `body:has([data-studio-theme])` gives the whole page Instrument Sans, so a Store component on `/studio-lab` (for example, the cookie banner) may still use 600/700. Trimming without C evidence risks faux bold, so C collects WEIGHT-INVENTORY first.
- **R5 — Text content is unchanged.**

## Ownership (round 154)
- **A owns 13 existing files + 1 new** (`b-round-153-r154-grants.txt`, `b-round-153-r154-new-files.txt`):
  - 9 components, one class or wrapper per W/N row;
  - the 3 test files: TH10, the l.528 line, and the LRS assertions;
  - doc 124 (status line);
  - the new doc 125.
- **Frozen:** 959 (`b-round-153-r154-tree-sha256.txt`; `sha256sum -c` OK at planning).
- **Start state:** hashes in `b-round-153-r154-granted-start-sha256.txt`, copies in `b-round-153/r154-granted-start/`.
- **Protected files are unchanged:** `studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`, `auth*`, `AuthContext.tsx`, `StudioContext.tsx`, `Modal.tsx` and `root.tsx`. `studio-lab.tsx` and `app.css` are not granted.

## Architecture
- A-R153 has no Architecture note. The reviewer's proposal of a shared label-class constant is recorded as a signal only.
- `b-round-148-checkpoint-request.md` is still pending and does not block.
- V-2b-2 is the last V-2 piece that can be implemented without the user, apart from V-2b-3. At round 155 planning, B sends root a bounded frontend-architect checkpoint request for the V-2 boundary, together with the pending request. Independent V-3 work does not wait for it.

## Commit readiness
- Round 153 is published.
- Round 154 becomes commit-ready only on a C round 154 PASS.

## Remaining scope (nothing shrunk)
- **VISUAL-A:**
  - V-2b-2 (round 154);
  - V-2b-3 (from/to inside sentences);
  - css2 trim (C evidence first);
  - V-2b-DISPLAY and B-R153-PREVIEW-DUR (awaiting_user);
  - V-3 (lucide icons, borderless buttons, radius, hover motion);
  - M1, M3, M4.
- **Then T12-ADVANCED.**
- **The deferred_low_polish pass** (including C-R151-2/3) comes before release.
- **awaiting_user:** ABL-R-*, DUX-R-*, the C-R151-2 option, V-2b-DISPLAY, B-R153-PREVIEW-DUR, M5, phase 2.
- **Other:**
  - SRW-21 is deferred_user;
  - the Tech Lead manual checks (including C-R153-SR-UPPERCASE);
  - backend-only evidence (fake-Bearer 403);
  - PROD-MP3-UNVERIFIED / PROD-SSR-NUL (gate);
  - the regression is due 2026-10-27;
  - the final full regression.

## Final advisor check
I applied every advisor point:
- the preview duration, the Export title and the selects are out, with recorded reasons;
- pan was checked against `formatTrackPan` (max `50L`, 21 px) and kept sans per TH8;
- range and selected-clip move to V-2b-3;
- the peak over-state drops to 400;
- the css2 trim waits for C evidence;
- `render-budget` is granted;
- ruler density and zoom-readout overflow were measured;
- doc 124 status is folded in;
- the checkpoint request is planned for round 155.

The one place I went further than the advisor: counts and `4/4` also stay sans, by the same spec-list rule. That is recorded as user-vetoable.

## Second advisor review (after the deliverables were written): 3 fixes applied to `current-task.md`
The pre-fix copy is in `b-round-153/current-task-pre-advisor2.md`.
1. **WEIGHT-INVENTORY:** the PASS bullet now excludes the Export `ModalTitle`. It is protected and expected at 600, and per `serifprobe` the dialog may render inside `.studio-container`. Without the exclusion, C would fail a row nobody can close.
2. **TH10 (c):** `studio-theme-obsidian.test.tsx` is `// @vitest-environment node`, so a mounted test is impossible there. N3–N6, where they do not render in the S0 SSR, now use source-level class assertions, and m138 must still kill them. C's MONO-STYLE is the real check.
3. **MASTER-OVER:** C now has a concrete trigger recipe, the hero music + Soft impact overlap from C-R152-EXPORT-FULLSCALE. The not-run clause stays.
