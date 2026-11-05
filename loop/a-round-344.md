# A round 344: PERF-DRAG-PREVIEW c5-i (a video clip move drag row in the interactions perf harness)

**Status: implemented, handed to C.** Baseline HEAD `0aa317f`. No STOP.

## Changed files (exactly the 4 granted files)
| File | Change |
|---|---|
| `perf/studio-lab-interactions.perf.spec.ts` | B's `spec.patch.txt` applied as is, plus **two strengthened hunks** (see below) |
| `perf/budgets.interactions.json` | B's `budgets.patch.txt` applied as is: 11 rows appended; the 219 earlier rows are untouched (`git apply -R --check budgets.patch.txt` passes) |
| `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md` | l.1, l.4 (exact §1.3 string), new section `### ეტაპი c5-i …` (items 67–71), one entry each under files, problems and testing, the TODO `c5:` line → `c5-ii:` with its inputs, and the stage-c TODO line updated. 7 `## ` headings |
| `docs/implementation/2026/quarter-IV/168-perf-interactions-baseline.md` | Only the three granted sections were edited (diff hunks at l.34, l.61 and l.128): item 10's "ბოლოს" → "30 კლიპის ბლოკის შემდეგ", a new item 11 (the video block), a liveness row for `interact.harness.drag-video-live`, and a `## მეტრიკები` paragraph on the 11 video rows |

### Strengthened hunks (they differ from B's sketch, so C's `git apply -R --check spec.patch.txt` fails at hunk `:762` on purpose)
1. **`setupVideoClip`, spec l.784–787:** after the import, if the Undo title still equals `undoBefore`, the setup pushes the problem `video setup: the import added no Undo entry` and returns `null`. Without this check, the teardown's first Ctrl+Z could undo an unrelated entry. Reviewer Low.
2. **Run order, spec l.1758:** `setLive(result, 'interact.harness.drag-video-live', true, { zoomKeys })` moved from right after setup to after the playing `measureDrag`. `setLive` ANDs with the earlier sample, so on the green path this call only adds `zoomKeys`. Before the move, an abort between setup and the drags left the row at 1. Now that row stays unmeasured. Reviewer **Medium**, now closed.

Everything else matches the sketch: names, constants, `'all-but-ratio'`, the teardown, `interactionSequence`, and the `else` branch that writes `{ setup: 'failed' }`. `DragName`, `dragSteps`, `dragDistancePx`, `measureLaneDrag`, `measureGroupDrag` and every existing row id are unchanged.

## A rows (logs in `a-round-344/`)
| Row | Result | Evidence |
|---|---|---|
| A-CLAIMS pre | **PASS**: identical to `b-round-343/claims-344-planning-output.txt` | `claims-pre.txt` |
| A-CLAIMS final | **PASS**: differs from `claims-344-sketch-output.txt` only in K2 (`0aa317f 4`), K12 (`stage c5-i of 7 1 11 2`) and K15 (`12.99 3995012 tracked`) | `claims-final.txt`, `claims-final-vs-sketch.diff` |
| A-TYPE | **PASS**, rc 0 (final tree) | `typecheck.log` |
| A-FORMAT | **PASS**: equal (`cmp` rc 0) | `format.log` |
| A-LINT | **PASS**: rc 0, 205 warnings, the same as gate 343 (`gates/round-343/verify.log`: 205) | `lint.log` |
| A-PERF (final tree, run 2, alone) | **PASS** on all criteria; details below | `perf.log`, `perf-results/latest-interactions.json`, `perf-rowcmp-vs-c343.txt`, `video-rows.txt` |
| A-PREMISE | **PASS**: video `interact.drag.video.stopped.move-components-per-move` **98.35** > audio `interact.drag.move.stopped.move-components-per-move` **22.8** (same run) | `video-rows.txt` |
| A-PERF-LIB | **PASS**: 34/34 (DC-KINDS green), final tree | `perf-lib.log` |
| A-SCOPE | **PASS**: 4 modified files, 0 untracked; `git diff --stat HEAD -- app perf/lib e2e` is empty; protected K8 = 11 OK | `scope.txt`, `claims-final.txt` |
| A-REVIEW | **PASS**: the real `code-reviewer` subagent ran twice. Review 1: 1 Medium, 5 Low. The Medium (early liveness) is fixed, and the re-review confirms it is closed and finds no new Medium+. The re-review's one wording Low (doc 168 "setLive after both drags") is fixed in the doc. The open Lows are listed below | this file |

### A-PERF detail (run 2, final tree)
- rc 0, `complete` true, `failures` [], problems [] in all 6 passes, 230 rows, **55/55 asserted pass**.
- Against `c-round-343`: **157 EQUAL, 0 DIFF, 8 NEW**. The NEW values are 98.35, 100, 1, 100, 1, 0, 31 and 1, equal to §0.3.
- Per-pass values (3/3 1× passes):
  - stopped: `move-components-per-move` [98.35 ×3], `move-components-max` [100 ×3], `release-commits` [1 ×3];
  - playing: `move-components-max` [100 ×3], `release-commits` [1 ×3], `move-restarts` [0 ×3], `release-restarts` [31 ×3];
  - `drag-video-live` [1, 1, 1], `zoomKeys` [8, 8, 8].
- Wallclock rows (reported, not compared):
  - playing `move-components-per-move` [98.383, 98.35, 98.383];
  - stopped `move-to-paint-p95` [7.5, 6.9, 7.6] ms;
  - playing `move-to-paint-p95` [13.5, 12.1, 12.3] ms.
- No other video row varied across the 3 passes, so no further `wallclock` change was needed (§1.1).
- **`durationMs` 469 442.**
- Overlap: the code-reviewer re-review (a read-only Read/Grep subagent, about 28 s) ran during run 2. L38 names vitest, tsc, builds and browser jobs, not a read-only review. Run 1, which had no overlap, gave the same deterministic video rows and the same 157 EQUAL rows, so C has a clean fallback.
- Run 1 (B's sketch as applied, before the review fix) gave identical non-wallclock results, with `durationMs` 463 678. It is kept in `perf-run1.log`, `perf-run1-results/`, `perf-run1-rowcmp-vs-c343.txt` and `video-rows-run1.txt`.

## Findings / known gaps
- **A-R344-PERF-DURATION (Low, recorded per §1.1, not a STOP).** `durationMs` 469 442 (run 2) and 463 678 (run 1). Both are above 450 000, which is 50 % of the 15-minute spec timeout. Evidence for ROOT-REQ-PERF-TIMEOUT (15 → 25 min, root only).
- Reviewer Lows not fixed (for B's `deferred_low_polish`):
  - **A-R344-REVIEW-FAILED-SETUP-STATE:** a failed video setup leaves the clip and its Undo entry behind, and the zoom-in keys are never reverted. This is harmless only because the block runs last. Doc 168 item 11 now says so.
  - **A-R344-REVIEW-RATEROWID:** the video `setLive` calls use the raw id rather than `rateRowId`. It is the same at 1×, but the ids would collide if the block ever ran at 6×.
  - **A-R344-REVIEW-ALL-BUT-RATIO-NAME:** `'all-but-ratio'` actually means "all but `commits-per-move`". `move-components-per-move` is also a ratio.
  - **A-R344-REVIEW-LIVE-SCENARIO:** the liveness row's `scenario` leaves out "30 audio clips". Budget rows outside the grant were not changed.
  - **A-R344-REVIEW-SEQ-TEXT:** the `interactionSequence` text says "1 video clip at 0". The code checks the count and, now, that an Undo entry was added, but not the start at 0.
  - **A-R344-REVIEW-PARTIAL-LIVE (re-review, informational):** if Space or `waitForPlaybackSettled` throws after the stopped drag, the row keeps the stopped drag's 1. The pass still fails through `abortedAt` and its problem.
- **Architecture note (signal for B; no action taken):** spec l.1691–1762. The tail of the 1× block has gained one setup/measure/teardown group in each of c3-i, c4-i and c5-i. The reviewer's verdict is to keep it. If c5-ii adds another group, consider one bounded task: a shared `withTeardown` helper that also cleans up a failed setup.
- Not run by A (gate rows or C rows): full vitest, a standalone `npm run build` gate step (the perf config's webServer built the production bundle for each perf run), `npm run verify`, e2e smoke, VIDEO-PREMISE, G344-AUTH and the mutant. No dev server was started; the root server on :5173 was not touched.

## Exact next C checks
1. CLAIMS: `bash b-round-343/claims-344.sh`. It should equal `a-round-344/claims-final.txt`.
2. SOURCE-SCOPE:
   - `git apply -R --check` passes for `budgets.patch.txt`.
   - It fails for `spec.patch.txt` only because of the two strengthened hunks above (spec l.784–787 and l.1758). Diff them against the sketch.
   - The 219 earlier budget rows are byte-equal by id.
   - `app/`, `perf/lib/` and `e2e/` are clean.
3. PERF (production, alone, after a browser warm-up), then rowcmp against `c-round-343`. Expect 157/0/8 with the values above and record `durationMs`.
4. PREMISE (98.35 vs 22.8 in A's run). Save `c-round-344/video-rows.txt`.
5. MUTANT on a scratch copy.
6. VIDEO-PREMISE at both viewports against `b-round-343/probe/head-<w>.json`. A changed no `app/` file.
7. HARNESS-READ, including the two strengthened hunks and the AND semantics of `setLive`.
8. PERF-LIB 34/34.
9. G344-AUTH.
10. DOCS:
    - doc 232: l.1 and l.4 are byte-exact; items 67–71; 7 `## ` headings.
    - doc 168: the hunks are only at l.34, l.61 and l.128.

## Scope completed
Only stage c5-i, within the 4 granted files. All A rows of §2.1 are PASS. The B acceptance criteria are not marked complete here: C's rows (PERF on C's run, MUTANT, VIDEO-PREMISE, G344-AUTH, DOCS) and the gate rows are still open. c5-ii is not started.
