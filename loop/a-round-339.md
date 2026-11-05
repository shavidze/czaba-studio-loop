# A round 339 — PERF-DRAG-PREVIEW c4-i: group move perf rows

**Status:** done. All A rows of §2.1 ran and passed (A-CLAIMS, A-TYPE, A-FORMAT, A-LINT, A-PERF, A-PREMISE, A-PERF-LIB, A-MUTANT, A-SCOPE, A-REVIEW). Doc 232 testing entry added after the mutant; claims re-run after it (same K2/K19-only diff). Not a whole-backlog completion; C verifies.

## Changed files (exactly the 4 granted)
- `perf/studio-lab-interactions.perf.spec.ts`: B's `spec.patch.txt` + **one A strengthening** (see A-REVIEW): `teardownGroupClips` presses Ctrl+Z until the Undo title is back at the start entry (max 3, first press always). Needing >1 press is a problem. Then the same count/state/title checks.
- `perf/budgets.interactions.json`: B's `budgets.patch.txt` as is (26 group rows after `drag-lane-live.6x`; the stale L58 sentence was removed from the 2 `drag-lane-live` notes).
- `docs/implementation/2026/quarter-IV/232-perf-drag-preview.md`:
  - l.1 and l.4 per §1.3;
  - a new `### ეტაპი c4-i` section (items 53–58);
  - entries under files, problems, testing and TODO (c4-ii and its inputs).
- `docs/implementation/2026/quarter-IV/168-perf-interactions-baseline.md`: only the 3 granted sections:
  - the group block under step 8;
  - the `drag-group-live` row, plus `drag-lane-live` now `assert == 1` since round 338 with (e);
  - a `## მეტრიკები` paragraph.

**Strengthened hunk, for C's `git apply -R --check` (run by A):**
- `budgets.patch.txt` reverse-applies cleanly.
- `spec.patch.txt` fails the reverse check at the `@@ -670,6 +674,252 @@` new-functions hunk (`error: patch failed: …spec.ts:674`). Within that hunk, only the `teardownGroupClips` body differs: the bounded Ctrl+Z loop, plus Biome's wrap of its one long line. See `a-round-339/spec-vs-sketch.diff` and `spec-a.diff`.
- The `interactionSequence` and `runInteractionPass` hunks are identical to B's: only their line offsets and hunk-header context differ.

## A rows
| Row | Result | Evidence |
|---|---|---|
| A-CLAIMS | pre == planning output (PRE-EQUAL); final == sketch output except K2 (`662ed42 4`) and K19 (`stage c4-i of 7 1 11 3 0`: token c4-i, `### ეტაპი c4-` 1, doc 168 `drag-group-live` 3) | `a-round-339/claims-pre.txt`, `claims-final.txt` |
| A-TYPE | rc 0 | `a-round-339/typecheck.log` |
| A-FORMAT | equal (after applying Biome's wrap of A's one new long line) | `a-round-339/format.log` |
| A-LINT | rc 0, 205 warnings (= gate 338's 205) | `a-round-339/lint.log` |
| A-PERF (final tree, alone) | rc 0, `complete` true, `failures` [], 219 rows, **45/45 asserted pass**, **139 EQUAL / 0 DIFF / 18 NEW / 0 GONE** vs c-round-338. The 18 NEW equal §0.3: per-move 74.781, max 106, release-commits 1, move-restarts 0, release-restarts 2, live 1. Wallclock: cross 16.727, lane 110.45 (all passes, both rates). `drag-group-live` [1,1,1] and `.6x` [1,1,1]. No kind change needed | `a-round-339/perf-results/latest-interactions.json`, `perf-rowcmp-vs-c338.txt`, `group-rows.txt`, `perf.log` |
| A-PERF run 1 (B's sketch as applied, before the review fix) | same counts and the same NEW values | `a-round-339/perf-results-run1-sketch/`, `perf-rowcmp-run1-sketch-vs-c338.txt` |
| A-PREMISE | PASS: group 74.781 > lane 24.906 at 1× and 6×, stopped and playing | `a-round-339/group-rows.txt` |
| A-PERF-LIB | 34/34 | `a-round-339/perf-lib.log` |
| A-MUTANT | MU-GROUP-SINGLE on a scratch copy of A's final tree (`git archive` + A's diff, `cmp`-equal before the mutant), alone: rc 1, `drag-group-live` [0,0,0] and `.6x` [0,0,0], 50 failures = (f) 12, (a) 12, (b) 12, (c) 12 + 2 assert failures; (d) 0, (e) 0, teardown 0 (= §0.3 / K13). Scratch deleted | `a-round-339/mutant.log`, `mutant-results/latest-interactions.json` |
| A-SCOPE | `git status`: the 4 files, 0 untracked; `git diff --stat HEAD -- app perf/lib` empty; K8 protected 11 OK | `claims-final.txt` |
| A-REVIEW | code-reviewer run twice (full diff, then the changed hunk). No Medium+ open | below |

## Code review findings
- **A-R339-REVIEW-TEARDOWN-ABORT (Medium, origin: B sketch): fixed.**
  - The sketch's teardown did one Ctrl+Z and then `expect(count 1)`. If the playing reset left a stale entry, that Ctrl+Z undid the move instead. The expect then threw and the 1× pass aborted, dropping the 1×-only rows.
  - Fixed with the bounded loop above; the re-review closed it.
  - Per L58, this is a Medium found on B's sketch that the task did not rule. C/B should record it as a planning signal.
- **A-R339-REVIEW-E-GHOST-ORDER (Low, deferred, for B):**
  - (e) reads `target.at(0)` of the two ghosts, so it relies on DOM order.
  - Not changed: `readLaneGhosts` is shared with the lane drag, and the mutant's letter set is pinned.
  - Proposal: compare all sorted starts, requiring `cross[i] > entry[i]`.
- **A-R339-REVIEW-LANE-NOTE-ORDER (Low, for B):** in the 2 `drag-lane-live` notes, (e) now follows the "Asserted since" sentence. Reordering it goes beyond §1.2's delete-only wording.
- **A-R339-REVIEW-OVER-UNDO (Low, re-review):** if 2+ unexpected entries exist, press 3 can undo past the start entry. This is never silent: the presses problem and the state, title and count checks all catch it. A cap of 2 is optional.
- **A-R339-REVIEW-NULL-SETUP (Low):** the failed-setup cleanup is a single Ctrl+Z with no `waitForQuiet` and no Undo check. Liveness is already 0 there.
- **Info:**
  - Group and lane cross/lane windows are not like-for-like, because of the extra settle and copy read before `t1`. Do not compare those wallclock rows across scenarios.
  - The reviewer asked whether the playhead shift affects the 1× block. Run 1 and the final run show every `interact.zoom.30.*` row EQUAL.
- **Architecture note (proposal for B/root, not done):** `measureGroupDrag`'s window slicing and row writing, and its double-rAF settle, copy `measureLaneDrag`'s. Proposal: extract `writeLaneWindowRows(...)` and `settleTwoFrames(page)` in c4-ii, keeping the window bounds and row ids.

## Known gaps
- The B sketch's null-setup path is not exercised by any run, because setup always succeeded.
- A did not run the full vitest, build, `npm run verify` or e2e smoke. These are gate rows.

## Exact next C checks
- CLAIMS (vs `a-round-339/claims-final.txt`).
- SOURCE-SCOPE: the strengthened hunk is `teardownGroupClips` only.
- PERF on a production build, alone; PREMISE; MUTANT (MU-GROUP-SINGLE plus C's own).
- GROUP-NAMES at both viewports on :5173; HARNESS-READ (include the new teardown loop); PERF-LIB; G339-AUTH; DOCS.
