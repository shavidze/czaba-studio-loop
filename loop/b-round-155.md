# B round 155 → 156 planning (D-29z121)

Date: 2026-10-25 · Author: B. **Advisor: available.** I called it once after orientation, before writing, and once before finishing.

## Inputs read
- `context/active-summary.md` (head) and the active backlog view.
- `current-task.md` (round 155), `a-round-155.md`, `c-round-155.md`, `c-round-155.json`.
- `gates/gate-round-155.json`: status **published**, commit `4c07d5f`, the same hash on both remotes. This is the baseline HEAD for round 156.
- `regression-last.json`: 2026-10-24, round 122, so the next regression is due on or after **2026-10-27**. It is not due today.
- `env-status.json`: store 200.
- `user-review/`: only `ableton-review.md` and `design-ux-review.md` (plus `.notified`). **No** `ableton-decisions.md`, **no** `design-ux-decisions.md`.
- Source at `4c07d5f`, read-only: every `formatArrangementTime` consumer in `app/components/arrangement/**`, `strings.ts` l.1–100 and l.495–535, and the tests that read the affected test ids.

## Evidence → backlog (only from C's independent results)
| ID | Before | After | Evidence |
|---|---|---|---|
| V-2b-2 | ბაგია (round 154 FAIL Low) | **მზადაა / done** | C round 154 (13 rows) + C round 155 PASS, `browserVerified` = `realVerified` = true; published `4c07d5f` |
| C-R154-01 | open, scheduled round 155 | **resolved** | `c-round-155.json` `n6`: Plex Mono 400, "IBM Plex Mono [web]" at 1440 and 1280 |
| B-R153-CSS2-TRIM | evidence pending | evidence complete → V-2b-3b | PLEX500-INVENTORY (500 face `unloaded`, 0 elements ≥ 500) and COOKIE-SOURCE (`font-medium` only; render blocked in cloud) |
| B-R154-V2B3-MISSED-TIMECODES | scheduled V-2b-3 | absorbed into V-2b-3a | — |
| B-R155-V2B3-MISSED-TIMECODES (new, info) | — | scheduled round 156 | B source sweep: clip range badge `ArrangementClip.tsx` l.934, video gap `ArrangementVideoDock.tsx` l.229 |
| B-R155-EXPORT-ZERO (new, Low) | — | `deferred_low_polish` (now 220 entries) | `ArrangementExportDialog.tsx` l.267 `'0:00'` vs l.395 `'00:00.000'` |
| ARCH-CHECKPOINT-V2 (new, info) | — | requested, non-blocking | `b-round-155-checkpoint-request.md` |

Rows that were blocked or only checked at source level (the COOKIE-SOURCE render, the fake-Bearer 403) stay open evidence for a backend- or GA4-enabled check. They are not counted as PASS.

## Rulings (D-29z121; details in `current-task.md` §0.1)
- **R1 — Split V-2b-3 into 3a and 3b; the scope is unchanged.** To prevent another "missed timecodes" fix-up, the sweep listed every visible timecode in a sentence: 10 render sites in 6 components. Both earlier lists missed two of them. 3a covers the workspace surfaces (6 sites). 3b covers the Export dialog and the css2 trim. The trim goes with 3b because both concern the dialog's fonts (Instrument Sans 600 stays for the protected `ModalTitle`), and the URL change needs its own FONT-FAIL re-run.
- **R2 — Mono rule (smallest consistent and testable choice; user may veto):**
  - goes mono: visible `MM:SS.mmm` values only;
  - stays sans: values in seconds, attributes, `aria-live` announcements and the two Export warnings.
- **R3 — Part templating** goes in a separate `studioTimeTextParts` object, so the exhaustive `studioWorkspaceStrings` key list (`strings.test.ts` l.1718) stays untouched. The existing exact-string tests then lock the bytes.
- **R4 — Every new mono span is `font-mono font-normal tabular-nums`.** Three of the sites sit under `font-medium` containers.
- **R5 — `textContent` stays byte-identical.**
- **R6 — B-R155-EXPORT-ZERO is recorded only;** it is not fixed in this round.

## Round 156 in short
- **A owns:** 10 existing files and 2 new ones, and nothing else.
- **Frozen:** the other 963 files.
- **Mutations:** m143–m146.
- **Code-reviewer:** required.
- **C rows:** TEXT-BYTES (a)–(f), MONO-STYLE-N7…N12 with CDP, LAYOUT-FIT (a new truncation is a finding), PLEX500-INVENTORY-S, FUNC-SMOKE-S, G156-3, PX-NET/REG-HYD, plus the scope and diff rows.

## Neighbour risk
- The footer may wrap or truncate: mono is wider, and the selected-clip line is `truncate`. B-R153-PREVIEW-DUR showed this can happen.
- The N6 ghost lives in the same Lane file; TH10 still locks it.
- The video-gap span is updated imperatively and keeps its `ref`.

## Architecture
- No new reviewer Architecture note arrived (A round 155 did not use the reviewer).
- The V-2 boundary is reached, so the checkpoint request is sent now (`b-round-155-checkpoint-request.md`). It has two V-2 questions: the source-level class locks and the part-templating shape. It goes together with the still-pending `b-round-148-checkpoint-request.md`.
- It does not block V-2b-3a. Its result can change V-2b-3b's shape before that round reuses the helper.

## Commit readiness
- V-2b-2 is a finished, published stage (`4c07d5f`).
- Round 156 is not ready to commit until C passes and root's gate runs.

## Decision
**CONTINUE.**
- Nothing needs external input.
- No Critical, High or Medium finding is open, apart from the Tech Lead manual items, which do not block.
- Open scope remains: V-2b-3a/3b, V-3, M1/M3/M4, the deferred Lows, T12-ADVANCED, the final regression and others.
