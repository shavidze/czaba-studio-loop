# A round 76 — SRW-16 stage 2b-1: clips snap to markers (D-29z41)

STATUS: IMPLEMENTED — awaiting C. Not a C pass; no browser check was run by A (C owns the real-browser rows).

## Baseline at start (verified)
HEAD `e347b9735a1d067fea2938da5b2f25f8256fabf1`; `git status --short` 0 lines; frozen list 451/451 OK; snapshots grid/markers/Clip/Lane = 128cba81/7c8874b0/97a1bf79/9105781c; protected 4/4 (cd68eb6e, 9f738237, 13914809, fa2cf0bc); `:5173/studio-lab` 200; one node process (the dev server, pid 3312). It was not started or stopped.

## Pre-flight
Read: CLAUDE.md, `.claude/rules/*`, `primitives-map.json`, AGENT_DISCOVERABLE_CODE, FORWARDREF_COMPONENT, AUDIO_ARCHITECTURE, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS, `prompts/studio-feature.md`, `skills/pre-flight`. The gate was printed in the chat before the first edit.

## Changed files (end state: 4 M + 2 ??, exactly per §3)
| File | Change | sha256 |
|---|---|---|
| `app/lib/arrangement/grid.ts` | `clipEdgeTargets(..., markerTimes: readonly number[] = [])`, merged into **both** `startEdges` and `endEdges` via the existing `sortedUniqueEdgeTimes`. No other change. | `0398debc` |
| `app/lib/arrangement/markers.ts` | One appended export `markerSnapTimes(arrangement): number[]` (built on `arrangementMarkers`). The diff vs snapshot shows only 4 added lines. | `168cd442` |
| `app/components/arrangement/ArrangementClip.tsx` | `markerSnapTimes(gesture.before)` is passed at the single move (l.455), the trim (l.525) and the group path (`groupDeltaOnGrid` gets a new `markerTimes` param, caller l.406). `moveStartOnGrid` body, range `onGrid`, click-seek `resolveGridTime`, the Shift lock and all texts are untouched. | `4b82508a` |
| `app/components/arrangement/ArrangementLane.tsx` | Only `libraryDropStart`: hoists `const arrangement = getArrangement()` and passes `markerSnapTimes(arrangement)`. The `isVideo`/not-ready grid-only branch is unchanged. | `8bd53baf` |
| NEW `app/lib/arrangement/__tests__/marker-snap.test.tsx` | 25 tests (harness copied from `grid-snap-clip-edges.test.tsx` + drop helpers from `grid-snap-loop-drop.test.tsx`; neither was edited) | `2b1baff1` |
| NEW `docs/implementation/2026/quarter-IV/066-studio-lab-clip-snap-markers.md` | Georgian, LF, status awaiting C; M1–M9, the 2b split, the Ableton table, files, tests, mutations | `8576ba44` |

All six files: CR=0 (LF). Frozen list 451/451 OK at end (`sha256sum -c --quiet … && echo FROZEN_OK` → FROZEN_OK); protected 4/4 at end; HEAD unchanged.

## Tests actually run
- `npx vitest run` on the 8-file targeted list (marker-snap, grid-snap-clip-edges, grid-edges, grid, grid-snap-loop-drop, grid-snap-edit, markers, markers-move-ui): **8 files, 201 tests, all passed** (final run after the review fix). `grep -rl clipEdgeTargets app` adds no other test file (only grid-edges.test.ts, already in the list).
- `npm run typecheck`: exit 0. `npm run lint`: exit 0 (218 pre-existing repo warnings). Scoped `npx biome check` on the 5 owned code/test files: clean, no fixes applied (read-only; no `--write`).
- Not run (they belong to the root gate): the full vitest suite, `npm run build`, `npm run verify`, e2e smoke.

### Test → contract map
MSU1 (both lists, sorted, unique; no-marker call equals the old call), MSU2 (`markerSnapTimes`), MS1 + MS1b (M8: the same drag without markers → 12.000), MS2, MS3 (nearer grid wins; exact tie raw 12.15 → grid), MS4/MS5/MS6 (M6), MS7/MS7b/MS7c (right trim end; left trim start with source offset raised 2.3 / lowered 0.3), MS8 (anchor start; other clip keeps offset), MS8b (anchor end), MS8c (an in-bounds edge 12.25 vs an out-of-bounds marker 12.3 → grid 12.000), MS8d (blocked group → status `GROUP_MOVE_BLOCKED_MESSAGE`, grid fallback 11), MS9 (cross-lane `data-ghost-start` 12.300 + drop), MS10/MS10b/MS10c (drop ghost `00:12.300`/492px, end → 20.7, video refusal unchanged `00:12.000 · …`), MS11 (markers JSON byte-equal before/after move/Undo/Redo; label `კლიპის გადატანა`; one step), MS12/MS12b (edge vs marker both ways), MS13 (Shift cross-lane lock ignores markers), MS14 (M9: clip at 12.3, 4 px drag snaps back; no history, status `კლიპის გადატანა: ცვლილება არ მოხდა — ისტორია არ შეიცვალა.`).

## Mutation proofs (run by A; final copies in `a-round-76/final/`, restored with `cp` and `cmp`-verified after each)
| Mutation | Red |
|---|---|
| (a) `[]` instead of markers in the single-move targets | MS1, MS2, MS6, MS9, MS11, MS12b, MS14 (re-run after MS14 was added: 7 failed) |
| (b) trim targets | MS7, MS7b, MS7c |
| (c) group path (`markerTimes` → `[]`) | MS8, MS8b, MS8c |
| (d) `libraryDropStart` | MS10, MS10b |
| (e) markers merged only into `startEdges` | MSU1, MS2, MS7, MS8b, MS10b |

Restore: cmp OK in all 5 cases. Final run 25/25.

Not discriminating for wiring (by design: they guard the other direction): MS3, MS4, MS5, MS13, MS8d, MS10c. They are not counted as wiring evidence.

## Code review (actual `code-reviewer` subagent, id a4fab7b02daad95d1; it had no shell and reviewed by reading all six files and grepping the call sites): 9/10, no Critical/High
- **Medium: M9 untested.** Fixed: added MS14 (it is in mutation (a)'s red set).
- Low (reported, no code change): no test with a marker at 0 or a marker equal to the clip duration (behaviour is correct: negative targets are filtered); an existing `-0` microsecond quirk in `nearestGridOrEdge` (not caused by this diff; `moveClip` clamps); MS8c design consequence (a marker that is nearest but out of bounds can make a group skip an in-bounds edge; existing `snapGroupMoveDelta` rule; documented in 066 for C); missing coverage for a cross-lane group with a marker, Alt+Snap off on trim/drop, and a marker inside a same-lane clip (not required by the contract).
- Performance: `markerSnapTimes` per pointermove is negligible.
- **Architecture note (signal for B, not acted on):** `clipEdgeTargets(arr.clips, id, lane, markerSnapTimes(arr))` now repeats at 4 call sites (Clip l.129/455/525, Lane l.202), and 2b-2/2b-3 may add more. Keep for now. Proposal: a single `snapEdgeTargets(arrangement, excludeClipId, laneTrackId)` in `grid.ts`, low cost, with behaviour-preserving tests (`grid-snap-clip-edges` and `marker-snap` unchanged). Also: `marker-snap.test.tsx` is the ~38th copy of the FakeAudioContext harness; a shared test harness module is a low-priority separate task.

## B acceptance criteria truly passed by A
- §1 contract M1–M9: covered by unit/component tests (jsdom, fake audio). Real-browser behaviour is **not verified by A**.
- File grants / expected status: passed (4 M + 2 ??).
- Required tests MSU1, MS1–MS13 + mutations (a)–(e): passed as described.
- A's checks (typecheck, lint, targeted vitest): passed. Code-reviewer: done, Medium addressed.

## Known gaps
- No browser run by A. All §5 rows (MS-MOVE … MS-PLAY, REG-*, G76-3, both viewports) are open for C.
- MS-PLAY (real audio) has only scheduling-by-position reasoning: markers add no schedule change of their own, and the moved clip is rescheduled by the existing path. Not measured by A.
- `grid-snap-loop-drop` DE5 (the not-ready source stays grid-only) was not re-asserted with markers present (that branch returns before `clipEdgeTargets`, unchanged code).

## Exact next C checks
1. SOURCE-UNCHANGED: compare the hashes above at C start/end; `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-75-r76-tree-sha256.txt` 451/451; protected 4/4; status 4 M + 2 ??.
2. T76-TARGETED: the 8-file vitest list → expect 8 files / 201 tests.
3. Browser §5 at 1440x900 and 1280x720: MS-MOVE (incl. the grid-line second drag), MS-PLAY right after the first MS-MOVE drag, MS-MOVE-END, MS-CROSSLANE (`data-ghost-start`), MS-TRIM (offset), MS-GROUP, MS-DROP + video refusal, MS-SNAPOFF-ALT (3 modes), MS-UNDO (marker row identical), REG-EDGES, REG-MARKERS, REG-HYD, G76-3.
4. Note for MS-GROUP: per MS8c, if the nearest candidate is an out-of-bounds marker, the group lands on the grid line, not on a nearer in-bounds clip edge (existing rule).
   **For B (decision signal):** this complies with the contract (M2), but it is a visible difference from round 75 when a marker is present. With the same markers in the arrangement, round 75 (markers were not candidates) landed the MS8c group on the in-bounds edge 12.25; round 76 lands it on the grid line 12.000. B should decide whether that is wanted, or whether a later stage should make the group fallback try the next-nearest in-bounds candidate. No code change was made.
5. Note: a 1–2 px drag of a clip already on a marker snaps back (M9, not a bug); status says no change, no history entry.

## Scope completed
Round 76 / stage 2b-1 implementation only. Stages 2b-2 (round 77), 2b-3 (round 78) and the GATE75 S1/S2 marker-drag fix-up were not touched. `ArrangementMarkerRow.tsx` and all other frozen files are unchanged. No commit, push, deploy, install, stash, reset or `--write`.
