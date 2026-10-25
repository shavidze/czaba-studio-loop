# B round 156 → 157 planning (D-29z122)

Date: 2026-10-25 · Author: B. **Advisor: configured.** I called it once after orientation, before writing, and followed its advice (archive first, check the forbidden list, `ModalDescription` children type and the `MobileWarning` mount, the ST-TP3 key change and the `rangeScope` shape). The second call before finishing returned "temporarily overloaded", so there is no final advisor review of this plan.

## Inputs read
- `context/active-summary.md` and its open-findings list.
- `current-task.md` (round 156), now archived as `tasks/round-156.md` with sha256 `835b6021…338b3dd`, identical to the source.
- `a-round-156.md`, `c-round-156.md`, `c-round-156.json` and `b-round-155.md`.
- `gates/gate-round-156.json`: **published**, commit `cbcd3d9`, the same hash on both remotes. This is the baseline HEAD for round 157.
- `regression-last.json`: 2026-10-24, so the next regression is due on or after 2026-10-27. It is not due.
- `env-status.json`: store 200.
- `user-review/`: there is no `ableton-decisions.md` and no `design-ux-decisions.md`.
- Source at `cbcd3d9`, read-only:
  - `ArrangementExportDialog.tsx` l.100–125 and l.255–500;
  - `strings.ts` l.1–70 and l.495–560;
  - `ArrangementTimeText.tsx` and `studio-lab.tsx`;
  - `Modal.tsx` (`ModalDescription`: `children: ReactNode`);
  - `root.tsx` AppContent;
  - TH7, ST-TP1…3 and the `export-range-ui` helpers;
  - `font-bold`/`font-semibold` usage in UI that root renders on `/studio-lab`.

## Evidence → backlog (only from C's independent results)
| ID | Before | After | Evidence |
|---|---|---|---|
| V-2b-3a | მუშავდება | **მზადაა / done** | C round 156 PASS (21 rows), `browserVerified` = `realVerified` = true, 0 bugs; published as `cbcd3d9` |
| B-R155-V2B3-MISSED-TIMECODES | scheduled round 156 | **resolved** | TEXT-BYTES (e)(f), MONO-STYLE-N11/N12 |
| B-R154-V2B3-MISSED-TIMECODES | absorbed into round 156 | **resolved** | TEXT-BYTES (c)(d), MONO-STYLE-N9/N10 |
| B-R155-EXPORT-ZERO (Low) | `deferred_low_polish` | **pulled forward to round 157** (R3); stays in the list until C verifies it | — |
| C-R156-OBS-RULER-DRAG-WORDING (info) | — | applied as a harness rule in the round-157 task | — |
| C-R156-OBS-RANGE-UNDO-SELECTION (info) | — | signal only: pre-existing, Live behaviour unconfirmed, not scheduled | — |
| C-R156-OBS-LABEL-OVERLAY (info) | — | added as evidence to C-R154-GHOST-TITLE (deferred Low) | — |
| A-R156-REVIEW-LOWS (info) | — | acknowledged; C's browser rows cover them | — |
| ARCH-R156-THEME-COUNT-TABLES | — | `architecture_signals`; applied in a small way (R5) | — |

The fake-Bearer 403 check stays open as backend-only evidence. It is not counted as PASS.

## Rulings (D-29z122; details in `current-task.md` §0.1)
- **R1 — The mono rule is unchanged.** It now covers the four Export sites. The seconds value and the two warnings stay sans.
- **R2 — Four independent Export builders.** They sit in `studioTimeTextParts`, and `studioExportStrings` stays untouched.
  - **Why not derive:** `rangeScope` takes an already-joined label, which existing tests pin with `'x'`, and `studioExportStrings` is declared above the builders in the file.
  - **Lock:** each builder is checked against a hand-written literal and against join equality with the unchanged functions. This answers the A round-156 reviewer's Medium about a test that was equal by construction.
  - **Cost:** the four sentence templates now exist twice in `strings.ts`. The join-equality test catches any drift.
- **R3 — B-R155-EXPORT-ZERO is fixed now.** The round owns that exact line, and the 2026-10-23 rule allows a cheap early fix there. Without it, the description would be half-mono. This is the round's only visible text change; it can be vetoed.
- **R4 — css2 trim: Instrument Sans 700 and IBM Plex Mono 500 come out; 600 stays.**
  - **Why 600 stays:** the protected `ModalTitle` and the root Toast title use it. `body:has(...)` puts root-rendered UI in Instrument Sans.
  - **Source check:** the only 700 in root-rendered `/studio-lab` UI is in `Header.tsx` (hidden on `/studio*`) and `MobileWarning.tsx` (imported nowhere).
  - **Fallback:** a removed weight falls back to the nearest loaded face. It is never synthesized.
- **R5 — No new TH source-count table** (following the A round-156 Architecture note). The Export spans get DOM assertions instead (XU6–XU8).
- **R6 — The checkpoint shape question stays open.** ARCH-CHECKPOINT-V2 is still unanswered and is not re-requested. The round reuses the round-156 shape. I suggest root runs the pending checkpoints at the end of V-2b, before V-3.

## Round 157 in short
- **A owns:** 7 existing files and 1 new one:
  - `strings.ts`;
  - `ArrangementExportDialog.tsx`;
  - `studio-lab.tsx`;
  - `strings.test.ts`;
  - `studio-theme-obsidian.test.tsx`;
  - `export-range-ui.test.tsx`;
  - doc 126 and the new doc 127.
- **Frozen:** 968 files.
- **Mutations:** m147–m150.
- **Code-reviewer:** required.
- **C rows:**
  - T157-TARGETED, SOURCE-SCOPE, AN-REVIEW;
  - TEXT-BYTES-E (a)–(d), including the CDP accessible names;
  - MONO-STYLE-N13…N16;
  - LAYOUT-FIT-E;
  - CSS2-TRIM (with FONTS-SCOPED);
  - FONT-INVENTORY (no visible weight 700, no Plex Mono at 500 or above, every weight-600 element listed);
  - FONT-FAIL;
  - FUNC-SMOKE-E (range and project WAV durations, focus return);
  - G157-3 and PX-NET/REG-HYD.

## Neighbour risk
- Spans inside a `<label>` could change the scope radios' accessible names. This is checked in jsdom (`a11y-copy`, XU7) and with CDP (TEXT-BYTES-E (d)).
- At 1280 the dialog body already scrolls under the footer (a known state). Mono adds width. LAYOUT-FIT-E checks it.
- A weight that silently relied on Instrument Sans 700 or Plex Mono 500 would change. CSS2-TRIM and FONT-INVENTORY check this.

## Architecture
- **New reviewer note:** ARCH-R156-THEME-COUNT-TABLES, recorded as a signal and applied in a small way.
- **Pending checkpoints:** `b-round-148-checkpoint-request.md` and `b-round-155-checkpoint-request.md`. Both are non-blocking.
- **Load on one owner:** `strings.ts` has been edited in every V-0/V-2 round, but the structure risk is already part of those requests (strings split, part templating). I am not sending a new request. Root's natural moment is round 157 PASS, which ends V-2b.

## Commit readiness
- V-2b-3a is finished and published (`cbcd3d9`).
- Round 157 is not ready to commit until C passes and the gate runs.

## Decision
**CONTINUE.**
- Nothing needs external input.
- No Critical, High or Medium finding is open (Tech Lead manual items do not block).
- Open scope remains:
  - V-2b-3b, V-3, M1, M3 and M4;
  - the deferred Lows (220);
  - T12-ADVANCED;
  - the regression on 2026-10-27;
  - the final regression;
  - the items awaiting the user (V-2b-DISPLAY, B-R153-PREVIEW-DUR, C-R151-2, ABL-R, DUX-R, M5, phase 2) and SRW-21 (deferred by the user).
