# Sketch review — PERF-FIX-R423-LANE-SHELL (round 424)

**Dispatched sketch:** `b-round-423/sketch-424.patch.txt`, sha256 `942dfdb660b529bc72e6e44fe4116f520343e71c6ffe2e100d6c8093fa0ae920`.

**Reviewed sha (tech-lead, read-only, 2026-11-10):** `942dfdb660b529bc72e6e44fe4116f520343e71c6ffe2e100d6c8093fa0ae920` — the same as the dispatched one. No edit after the review.

**Verdict: approve-with-lows** (no Critical/High/Medium).

## Findings (all Low; B ruling)
| id | Finding | B ruling |
|---|---|---|
| TL-R424-L1 | The ghost-title memo is keyed on `laneGhosts`, and it reads `getArrangement().clips` at render. If an undo or external commit removes or re-sources a ghost's clip while the ghosts stay the same, the old title lingers until the next ghost update. A render-time ref read is impure under concurrent rendering. The minimal fix is `sourceId` on `ClipLaneGhost`. | Accepted as Low → `deferred_low_polish`. A lane drag holds the pointer gesture, and a preview never changes `sourceId` (reviewer, point 2). Not in this round's grants. |
| TL-R424-L2 | `useArrangementPreviewLaneClips` (`ArrangementContext.tsx`) is now used only by `context-hygiene` and `preview-store` tests. | Low → `deferred_low_polish`. A removal needs Saba's approval (CLAUDE.md: nothing is deleted without permission), the same as GATE375-L1-UNUSED-WRAPPERS. |
| TL-R424-L3 | `selectPreviewLaneClips(state.preview, state.preview, …)` and `(null, committed, …)` hide what they do; a plain lane filter would read better. | Low → `deferred_low_polish` (naming). |
| TL-R424-L4 | DP29 keeps `toBeGreaterThan(0)` for the inner. | Not a defect. The added `ArrangementLane = 0` row catches the regression (mutant MU-SHELL-SUBSCRIBES). |

## Reviewer checks (summary)
- Preview cleared on a commit: `updateHistory` clears the preview in the same batch. The inner subscribes to the preview store itself and falls back to the new `committedLaneClips`.
- Undo during a preview: the preview wins, as at HEAD.
- Collection, peaks and video sources: these are memo props now, and `laneSources` keeps the same dependencies.
- `committedLaneClips` via `useShallow(fn)(arrangement)` is exactly as stable as HEAD's `clips`, which RB-LEAF7 needs. `sourcePeaks` and `videoSources` are `useState` values.

## B's pre-check on this sha (all under `b-round-423/`)
- **Typecheck:** rc 0 (`precheck-typecheck.log`).
- **Biome:** rc 0 on the 2 files (`precheck-biome2.log`).
- **Lint:** rc 0, 205 warnings, 1 info (`precheck-lint.log`).
- **Covering set:** 12 files, 291/291 (`precheck-a2.log`, `covering-files.txt`).
- **Full suite:** 264 files, 3,957/3,957 (`precheck-full.log`).
- **Perf interactions spec on the production build:**
  - 95/95 asserted rows pass;
  - the 17 ids are back at their round-404 values;
  - no component row is worse than at HEAD (`perf-sketch/compare-404-423-sketch.txt`).
- **Browser name probe:**
  - fade: 6 fibers at HEAD, 4 on the sketch;
  - trim: 17 at HEAD, 15 on the sketch;
  - shell and Memo(lane) both go from 59 to 0 (`probe/names-summary.txt`).
- **Mutants:** `mutants/summary.txt`.

## Event-ordering matrix
Not applicable: no concurrency, queue or write-ordering contract changes (L58 matrix clause). The ordering of preview, commit and undo is covered in the reviewer checks above.
