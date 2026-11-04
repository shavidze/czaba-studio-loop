# A round 335 — PERF-DRAG-PREVIEW c3-i: cross-lane move row in the interactions perf harness

**Status:** implementation complete. No STOP. The scope is test code and docs only (4 granted files).

## Changed files (exactly the 4 in §1)
1. `perf/studio-lab-interactions.perf.spec.ts`
   - New `readLaneGhosts` (double-rAF settle, then counts: non-blocked ghosts whose closest `[data-track-id]` is the target lane, and every lane-move ghost in the document).
   - New `clipLaneTrackId` and `measureLaneDrag`.
   - Call sites: `drag lane stopped` after the stopped `dragNames` loop; `drag lane playing` after the playing loop, before `pause`.
   - Two new `interactionSequence` entries.
   - `DragName`, `dragNames`, `measureDrag` and `resetAfterDrag` are unchanged. The lane drag calls `resetAfterDrag(…, 'move', …)` and then its own lane check.
2. `perf/budgets.interactions.json`: 26 new rows, all `record` / `budget: null`, owner `PERF-DRAG-PREVIEW-c3-i` (5 stopped + 7 playing + liveness, each also as `.6x`).
   - The 167 old rows are equal by id and in order to `git show HEAD:`.
   - The diff is additions only, plus the comma after the last old row.
3. `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md`
   - l.1, l.4 (byte-exact per §1.3) and l.5.
   - New section `### ეტაპი c3-i …` (items 43–46).
   - Entries under files, problems (the kind ruling), testing (A's values) and TODO (c3-ii + liveness → assert).
   - `^## ` count is 7.
4. `docs/implementation/2026/quarter-IV/168-perf-interactions-baseline.md`: hunks only inside `### Pass-ის თანმიმდევრობა`, `### Liveness-ის წესები` and `## მეტრიკები`.
   - Pass order: the lane drag is added to items 5 and 7.
   - Item 9 now also lists the zoom in/out/wheel paths, and a new item 10 is select-same-lane. Both were missing from the granted section before; they make it match the live spec (L34).

## A rows
| Row | Result | Evidence |
|---|---|---|
| A-CLAIMS | PASS: empty diff before any edit | `a-round-335/claims-before.txt` |
| A-TYPE | PASS: `npm run typecheck` rc 0, re-run on the final tree after the note edits | `a-round-335/typecheck.log`, `typecheck-final.log` |
| A-LINT | PASS: rc 0, 205 warnings + 1 info, the same as gate 334; re-run on the final tree | `a-round-335/lint.log`, `lint-final.log` |
| A-PERF | PASS (details below) | `a-round-335/perf.log`, `a-round-335/perf-results/`, `a-round-335/perf-rowcmp-vs-c334.txt`, `a-round-335/lane-rows.txt` |
| A-PREMISE | PASS (details below) | |
| A-PERF-LIB | PASS: 34/34, DC-KINDS green. Run once after the rows were added and again after the note fix | `a-round-335/perf-lib-report.log`, `perf-lib-report-final.log` |
| A-MUTANT | PASS (details below) | `a-round-335/mutant/` |
| A-SCOPE | PASS: exactly the 4 files, 0 untracked; `app/` and `perf/lib/` have no diff; protected sha 11/11 OK | `a-round-335/git-status-final.txt` |
| A-REVIEW | Done: 9/10 → fixed → re-review 9/10 (details below) | |

**A-PERF.** Production perf, run alone, once.
- rc 0, `complete` true, 193 rows, `failures` [], 36/36 asserts pass. All 6 passes have no problems and no abort.
- rowcmp vs `c-round-334`: 121 EQUAL, 0 DIFF, 18 NEW.

**A-PREMISE.** Cross 96.545 > lane 41.25, at 1× and 6×, stopped and playing.
- Report only: lane `move-components-max` is 101, the same as `interact.drag.move.*.move-components-max` (101).

**A-MUTANT (MU-LANE-NO-CROSS).** Scratch `/tmp/a335mut` used `grab.y` in place of `target.y` in the cross step, and was run alone.
- `drag-lane-live` read [0,0,0] and `.6x` read [0,0,0].
- 12 failures (6 passes × 2 states): "lane-drag liveness (a) target-lane stems non-blocked ghosts 0 at the cross read".
- The scratch was deleted afterwards.

**A-REVIEW.** Two real `code-reviewer` runs.
- Run 1, 9/10: no Critical/High/Medium. One Low: the lane window's move count leaves out `firstMove` (spec-literal `t > firstMove`), but the notes said "whole minus cross".
  - Fix: the code stays spec-literal. The 4 lane notes, doc 168 and doc 232 now say that the first pointermove is not counted as a move but its commit is (32 = 1 + 20 + 11).
  - Values are unchanged (notes only), so the perf run was not repeated. perf-lib was re-run: 34/34.
- Run 2 (L11), 9/10: the original finding is resolved. One new Low remains open (below).

### Measured new rows
3 passes, identical at 1× and 6×, stopped = playing (`a-round-335/lane-rows.txt`):
- `move-components-per-move` 58.969 (1887 / 32)
- `move-components-max` 101
- `release-commits` 1
- `cross-components-per-move` 96.545 (1062 / 11), wallclock
- `lane-components-per-move` 41.25 (825 / 20), wallclock
- playing: `move-restarts` 0, `release-restarts` 1
- `interact.harness.drag-lane-live` 1 and `.6x` 1
  - target-lane ghost 1 at the cross read, 0 ghosts at the back read;
  - after release: `music`, start 3.000;
  - after reset: start 0.000, on `music`.
- The L10 pre-ruled kind change did not fire: every deterministic row is equal across its 3 passes.

### Claims after the edit
`a-round-335/claims-after.txt`, compared with the planning output: K2 `0d22ab9 4`, K5 `193 35`, K11 the new l.4, K12 `1 1 1 7 11 3`. These are exactly the allowed deltas in C's CLAIMS row.

## Known gaps / for B
- **Low (A-R335-REVIEW-WHOLE-NOTE, open):** the whole-window notes ("…/ pointermoves in the whole window. Whole window: after the first pointermove …") read as if `firstMove` were excluded from the move count. The code divides by all 32 moves, including `firstMove`. The existing 167 move rows use the same wording, so I left it consistent. Suggest `deferred_low_polish`.
- **Info (reviewer, pre-existing, outside the grant):** the 1× entry in `interactionSequence` lists Ctrl+wheel before "Space, Home, fade-in drag…, Space", but the code runs wheel after the final Space. Doc 168 item 9 now matches the code, while doc 168 still says "the exact list is in the JSON `sequence`". I did not change the pre-existing entry.
- **Info:** a reset that leaves the clip on the wrong lane can produce up to 3 problems (`resetAfterDrag`'s restored check, the lane check and (d)).
- **Architecture note (proposal for B/root, not done):** `measureLaneDrag` duplicates `measureDrag`'s down/up/firstMove resolution and `put`/per-move/window-detail code.
  - Keep for now, because the other drags' paths are frozen.
  - Later, as a separate no-behaviour task: one shared window-rows helper, with every pre-existing non-wallclock row EQUAL.
  - Reviewer's alternative, outside scope (needs `perf/lib`): per-segment move tags would let the cross/lane rows become deterministic.
- I did not run the CROSS-NAMES dev probe or G335-AUTH. Those are C rows.

## Environment
- :5173 `/studio-lab` returned HTTP 200 after A's perf and mutant runs. :5188 is free.

## Exact next C checks
1. CLAIMS: `bash b-round-334/claims-335.sh` at start and end. Expected deltas as above.
2. SOURCE-SCOPE: 4 files; 167 old rows equal by id vs `git show HEAD:perf/budgets.interactions.json`; `DragName`/`dragNames` unchanged; protected 11 OK.
3. PERF: a production run alone after a browser warm-up, then `perf-rowcmp.py` vs `c-round-334/perf-results/latest-interactions.json`. Expect 193 rows, 121 EQUAL, 18 NEW, and live 1 in all passes. Write `c-round-335/lane-rows.txt`.
4. PREMISE: cross > lane at 1× and 6×, both states.
5. MUTANT: MU-LANE-NO-CROSS plus C's own mutant (for example, drop (b)'s document count or skip the release lane check).
6. CROSS-NAMES on :5173 and HEAD; G335-AUTH; HARNESS-READ; PERF-LIB; DOCS. For DOCS, also expect doc 168 items 9 and 10 to be rewritten inside the granted section.

## Scope completed
Only stage c3-i of PERF-DRAG-PREVIEW is done. c3-ii, c4 and c5 and the liveness assert conversion remain. The backlog is not complete.
