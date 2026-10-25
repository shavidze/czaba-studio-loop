# B round 157 → 158 planning (D-29z123)

Date: 2026-10-25 · Author: B.

**Advisor:** configured. I called it twice. The first call came after orientation and the baseline measurement, before writing. I followed its advice:
- cut V-3a along the box-safe line;
- capture the pre-V-3 RV-1 reference with C's unchanged d6 tool;
- check radius, Tailwind bare values and the icons barrel;
- turn C-157-N5 into a triage finding with a fixed ruling;
- do the bookkeeping;
- re-ask the checkpoint.

The second call reviewed the finished artifacts; its outcome is recorded at the end of this file.

## Inputs read
- `context/active-summary.md` (head and tail), `current-task.md` (round 157), `a-round-157.md`, `c-round-157.md`, `c-round-157.json` and `b-round-156.md`.
- **Archive:** `tasks/round-157.md` is a copy of `current-task.md`. Both have sha256 `376f1abd7207c8da…1f85154`. It was created now; no earlier archive existed.
- **Backups before editing:** `b-round-157/{backlog-before-r158.json, b-next-before-r158.json, feature-status-before-r158.md, plan-before-r158.md}`.
- **Gate:** `gates/gate-round-157.json` is **published**, commit `f8a316a`, the same hash on both remotes. This is the baseline HEAD. `git status` is clean and the tree holds 976 files.
- **Regression:** `regression-last.json` = 2026-10-24, so the next one is due on or after 2026-10-27. It is not due. `env-status.json` shows store 200.
- **User decisions:** `user-review/` has no `ableton-decisions.md` and no `design-ux-decisions.md`.
- **Source at `f8a316a`, read-only:**
  - `ArrangementTransport.tsx` (whole file) and `strings.ts` l.140–160 and l.216;
  - the glyph usage across `app/components/arrangement`;
  - `app/components/icons/index.ts`, `app/lib/utils.ts` (`cn` = twMerge) and `app/styles/app.css` (`--radius-md` 8 px);
  - the tests that query transport controls, `studio-theme-obsidian` TH6, and the `visual-direction-a.md` spec.

## Evidence → backlog (only from C's independent results)
| ID | Before | After | Evidence |
|---|---|---|---|
| V-2b-3b | მუშავდება | **მზადაა / done** | C round 157 PASS (19 rows), `browserVerified` = `realVerified` = true, 0 bugs; published as `f8a316a` |
| B-R155-EXPORT-ZERO (Low) | pulled forward | **resolved**; removed from `deferred_low_polish` (220 → 219), record kept in `open_findings` | TEXT-BYTES-E (a), both viewports |
| C-157-N5 | — | **B-R157-EXPORT-PEAK (triage)**, with a C row and a ruling fixed in advance | 797 / 4741 full-scale samples; whether the overload warning rendered was not recorded |
| C-157-N1 / N2 / N6 / N7 | — | info, recorded | `c-round-157.md` |
| C-157-N3 / N4 | — | harness rules in the round-158 task (Escape does not clear a range; the footer button is Done) | `c-round-157.md` |
| A-R157 Architecture note | — | `architecture_signals` ARCH-R157-EXPORT-TEMPLATE-DUP; checkpoint question 3; not scheduled | `a-round-157/code-review.md` |

The fake-Bearer 403 check stays open as backend-only evidence. It is not counted as PASS.

## B measurement (planning data)
**Transport glyphs** (`b-round-157/measure-transport.cjs` → `measure/transport-{1440,1280}.json`):
- They render in the DejaVu Sans fallback, so the old box depends on the platform.
- A 16 px icon would change the intrinsic-width buttons by +4.3 / +5.3 / −2.8 / +5.3 / +7.9 px.
- The fixed-width buttons (Play `w-24`, Zoom to selection `w-8`, Undo/Redo `w-28`) keep their box.

**RV-1 reference for V-3:**
- **Tool:** `c-round-148/tools/d6.cjs`, unchanged (sha256 `3abc88fe…`), with the c-round-157 helpers, copied to `b-round-157/tools/` (`tools-sha256.txt`).
- **Runs:** two per viewport at `f8a316a`. S0, S1 and S2 at both viewports show **0 px** delta and 0 missing keys.
- **Reference:** `b-round-157/out/d6/d6-{1440,1280}-r1.json`. The previous reference (post-V-0) no longer reflects the V-2 widths.

## Rulings (D-29z123; details in `current-task.md` §0.2)
- **R1 — V-3 split.**
  - **V-3a (round 158):** the transport only, meaning the surfaces of all 12 buttons, Play/Export colour, and icons on Play/Pause and Zoom to selection.
  - **V-3b:** the 7 remaining transport glyphs and their glyph-pinned tests.
  - **V-3c:** the other components, the glyphs in the strings module, and the 10 px panel radius.
  - Nothing is deferred or shrunk.
- **R2 — Default icon size for V-3b.** Each icon fills the old glyph slot (12 / 10 / 20 px, keeping a 1 px visual line), so boxes stay within ±1 px. User question **Q-V3-ICON-SIZE**; the default is vetoable.
- **R3 — Surfaces per spec.** The 1 px border stays as transparent. Fill 5 / 8 / 12 % with `enabled:`, `rounded-md` 8 px, and `motion-safe` 180 ms on background-color and color.
- **R4 — Colour roles.**
  - Play is ivory-filled, with hover /92 and active /88; without these, the base hover would empty the fill.
  - Export becomes a brass outline.
  - The state cues stay, and the Loop-on fill survives hover.
  - All vetoable.
- **R5 — Icons.** `lucide-react` directly, at 16 px with stroke 1.5, `aria-hidden`. The aria-labels are unchanged.
- **R6 — No new TH source count.** The classes are locked by DOM tests in a new file.
- **R7 — OVERLOAD-CHECK.** It runs on unchanged audio code. ≥ 10 full-scale samples and no warning → High, which goes before V-3b.

## Round 158 in short
- **A owns:** `ArrangementTransport.tsx`, doc 127 (status line), the new `transport-surface-ui.test.tsx` and the new doc 128.
- **Frozen:** 974 files.
- **Mutations:** m151–m154.
- **Code-reviewer:** required.
- **C rows:**
  - T158-TARGETED, SOURCE-SCOPE, AN-REVIEW;
  - RV1-V3A, SURFACE-STYLE (a)–(i), ICON-STYLE, CONTRAST-V3A;
  - FUNC-SMOKE-T, OVERLOAD-CHECK;
  - G158-3 and PX-NET/REG-HYD.

## Neighbour risk
- **Play hover/active:** dark text on an emptied fill. Prevented by the overrides; checked by TS2 and SURFACE-STYLE (e).
- **Loop-on fill on hover.** Checked by TS5 and SURFACE-STYLE (g).
- **Focus ring on the new fill.** Checked by SURFACE-STYLE (i).
- **Disabled hover.** Checked by SURFACE-STYLE (d).
- **1280 wrap of the right group.** Checked by RV1-V3A.
- **Export entry point and focus return.** Checked by FUNC-SMOKE-T and T158-TARGETED.

## Architecture
- **New signal:** ARCH-R157-EXPORT-TEMPLATE-DUP.
- **Checkpoint:** `b-round-157-checkpoint-request.md` re-asks once at the V-2b end and adds question 3, as `b-round-155-checkpoint-request.md` promised. It is non-blocking, and V-3 proceeds. The last natural moment is before V-3c.
- **Load on one owner:** `strings.ts` was touched in every V-0/V-2b round; V-3a does not touch it.

## Commit readiness
- Round 157 is finished and published (`f8a316a`).
- Round 158 is not ready to commit until C passes and the gate runs.

## Decision
**CONTINUE.**
- Nothing needs external input; Q-V3-ICON-SIZE has a default.
- No Critical, High or Medium finding is open. Tech Lead manual items do not block, and B-R157-EXPORT-PEAK is in triage.
- **Open scope remains:**
  - V-3a/b/c, M1, M3 and M4;
  - the deferred Lows (219);
  - T12-ADVANCED;
  - the regression from 2026-10-27;
  - the final regression;
  - the items awaiting the user: V-2b-DISPLAY, B-R153-PREVIEW-DUR, C-R151-2, Q-V3-ICON-SIZE, ABL-R, DUX-R, M5 and phase 2;
  - SRW-21, which the user deferred.

## Final advisor review (second call)
Verdict: CONTINUE as written. It asked for four fixes; all are applied.
1. **N1 toolbar scope.** `closest('div')` from the position span returns the readout box. The task now names the `.flex-wrap` ancestor that holds both position and Fit, with exactly 12 buttons.
2. **Bookkeeping checks.**
   - The duplicate `B-R155-EXPORT-ZERO` in `open_findings` was removed. The original entry stays, with status resolved.
   - The feature-status checkpoint sentence is confirmed.
3. **This report** now records both advisor calls.
4. **Hardenings.**
   - SURFACE-STYLE: a `(hover: hover)` precheck (false = environment-invalid), and a colour-parse tolerance (±0.005 alpha, ±1 per channel).
   - N1: the harness points at `render-budget` / `master-ui`, which already toggle Play with an AudioContext stub.
