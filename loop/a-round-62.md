# A — Round 62 report: SRW-14 stage 4c-1, group move snaps the anchor to clip edges (D-29z27)

Implementer: A (Claude Opus 5.5) · Date: 2026-10-19 · Task: `current-task.md` (round 62)
Evidence folder: `a-round-62/`. **No PASS is claimed here; C verifies.**

## 1. Pre-flight gate and baseline

**Pre-flight gate:**
- **Assumptions:**
  - Baseline case A.
  - The helper uses B's positional signature, the same style as `snapGroupDelta`.
  - In `ArrangementClip`, only `groupDeltaOnGrid`, its call site and one import name change.
  - For a video anchor, `hoverTrackId` is already `original.trackId` because of the `!isVideo` guard, so it equals the placement lane.
- **Smallest version:** about 20 lines in `grid.ts` and about 25 in `ArrangementClip.tsx`; 13 new tests plus the CM10 rewrite; doc 055.
- **Files:** the 4 owned files and doc 055 (§3.1).
- **Success criteria:** vitest 89 / 1569; tsc 0; build rc 0; the owned files have 0 Biome diagnostics; verify rc 0; mutations a–k each kill their named tests.

**Read before the first edit:**
- `rules/read-primitives.md`;
- primitives: AGENT_DISCOVERABLE_CODE, FORWARDREF_COMPONENT, TAILWIND_FIRST, AUDIO_ARCHITECTURE, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS (DESIGN_TOKENS was injected by the hook);
- `prompts/studio-feature.md`, `prompts/new-test.md`, `docs/implementation/TEMPLATE.md`;
- the `pre-flight` skill.

The advisor was consulted before the first edit and again before this report.

**Baseline** (`a-round-62/baseline.txt`, 11:1x +04):
- HEAD `038ed5a45f94596a264c14c4ec834607cb407948`; `git status --short` has **30** lines → **case A**.
- Frozen list `b-round-61-r62-tree-sha256.txt`: 418 entries, **0 non-OK**.
- Snapshots: `SHA256SUMS.txt` 4/4 OK, and `cmp` reports "same" for all 4 owned files.
- Protected files 4/4 OK.
- `node.exe` 13.
- Servers: `:5173/studio-lab` **200**; `:5199/api/products` **000** (backend still down; agents do not start servers).

## 2. Diff per file (against the round-61 snapshots; `a-round-62/diff.patch`)

| File | Change | EOL (CRLF / LF) | sha256 prefix at end |
|---|---|---|---|
| `app/lib/arrangement/grid.ts` | **Additions only** (0 removed lines): new exported `snapGroupMoveDelta(anchorStart, anchorDuration, rawDelta, step, minDelta, maxDelta, startEdges, endEdges): { requested; allowed }`, appended after `snapMoveStartToGridOrEdges`. No existing function changed. | 0 / 207 | `d87b9b0c` |
| `app/components/arrangement/ArrangementClip.tsx` | (1) The `groupDeltaOnGrid` signature is now `(anchor, delta, snapStep, group, clips, laneTrackId)`. Its null-`snapStep` branch is byte-identical apart from `const { bounds } = group;`. Its non-null branch builds `clipEdgeTargets(clips minus group members, anchor.id, laneTrackId)` and calls the helper. (2) The call site in the group branch passes `original, delta, snapStep, gesture.group, gesture.before.clips, hoverTrackId`. (3) **The import list:** `snapGroupDelta` → `snapGroupMoveDelta`, because the file no longer uses `snapGroupDelta`. This line is outside the l.111–128 / l.381–387 ranges but is required by the change. Nothing else changed: `moveStartOnGrid`, the single-move path, trims, the Shift path and `finishGesture` are untouched. | 0 / 710 | `97a1bf79` |
| `app/lib/arrangement/__tests__/grid-edges.test.ts` | `snapGroupMoveDelta` added to the import; a new `describe('SRW-14 stage 4c group move snaps the anchor to edges (D-29z27)')` with CE7, CE8 and CE9. CE9 has one extra assertion (deviation D1, §8). The 6 existing `it` are unchanged. | 0 / 108 | `1d216557` |
| `app/lib/arrangement/__tests__/grid-snap-clip-edges.test.tsx` | CM10: new title and body, same position. CM17 after CM11. CM9f–CM9h after CM9e, in the round-55 describe. A new describe at the end of the file, `'SRW-14 stage 4c group move snaps the anchor to edges of other clips (D-29z27)'`, with CG1–CG6. That describe holds the describe-scoped helper `selectGroupPair` and type `EdgeClipParts`. The harness, the existing top-level helpers and every other `it` are unchanged. | 0 / 919 | `49b35e40` |
| `docs/implementation/2026/quarter-IV/055-studio-lab-grid-group-move-edges.md` | New. Georgian, with all §2.5 sections, the Ableton table and the TODO list. | 0 / 114 | `e9fddf7a` |

- **Counts:** `grid-snap-clip-edges` has **41** `it`, `grid-edges` has **9**.
- **Banned patterns:** none (no `any`, assertions, `@ts-ignore`, comments, `.only`, `.skip` or `.todo`). The code reviewer checked this independently.

## 3. Tests

### Red before the source change (`a-round-62/red-before-source.txt`)

The tests were written first and run against the unchanged source:
- **6 failed:**
  - CE7, CE8, CE9 (the helper did not exist yet);
  - CM10 (8 instead of 8.4);
  - CG1 (8 instead of 8.4);
  - CG3 (6 instead of 6.0004).
- **Passed** as expected, because they pin existing behaviour: CM9f–CM9h, CM17, CG2, CG4, CG5, CG6. **No spec-assumption stop:**
  - CM9f–CM9h match C's probe values;
  - `setPxPerSecond(30)` reads back 30;
  - CG4 gives 7, not 7.3;
  - no other existing `it` failed.

### After the change

| ID | Alone duration (`alone-owned-tests.txt`, 2 files, 50/50) |
|---|---|
| CE7 / CE8 / CE9 | 1 / 0 / 0 ms |
| CM10 | 83 ms |
| CM17 | 78 ms |
| CM9f / CM9g / CM9h | 91 / 93 / 72 ms |
| CG1 / CG2 / CG3 / CG4 / CG5 / CG6 | 104 / 109 / 104 / 83 / 144 / 76 ms |

- `grid-snap-clip-edges` + `grid-edges` alone: 7.05 s wall, 4.03 s in tests. No single test exceeds 3 s.
- Focused 6 files (`focused-vitest.txt`: grid-edges, grid-snap-clip-edges, grid-snap-edit, grid-snap-ui, selection, grid): **132 / 132**.

## 4. Mutations (`a-round-62/mutations.txt`, `mutations-ce9.txt`; rig `a-round-62/mut.mjs`)

**Setup:**
- Scratch: `a-round-62/scratch/` (a copy of `app/`, a `node_modules` junction, its own `vitest.config.mts`).
- Command (cwd scratch): `npx vitest run --config vitest.config.mts grid-edges grid-snap-clip-edges grid-snap-edit grid-snap-ui grid.test selection.test --reporter=verbose`.
- Unmutated: 132 / 132. After each run the mutated file is restored; `restored=true` for grid.ts, ArrangementClip.tsx and selection.ts.

| # | Mutation | Failed tests | Required | Result |
|---|---|---|---|---|
| a | group branch passes `[]`, `[]` (grid only) | CM10, CG1, CG3 | CM10, CG1, CG3 | killed |
| b | end targets dropped | CM10 | CM10 | killed |
| c | start targets dropped | CG1, CG3 | CG1 | killed |
| d | only the anchor is excluded (`clips` unfiltered) | CG2 | CG2 | killed |
| e | edge delta rounded with `roundGridTime` (ms) | CE8, CG3 | CG3, CE8 | killed |
| f | out-of-bounds edge clamped to `[min, max]` | **first run: CG4 only**; after D1: **CE9, CG4** | CG4, CE9 | killed (after D1) |
| g | the placement lane is always `original.trackId` | CG5 | CG5 | killed |
| h | grid path uses µs (`toWholeMicroseconds/1e6`) | CE7 | CE7 | killed |
| i | `roundTime` removed from the Snap-off branch of `moveStartOnGrid` | CM17 | CM17 | killed |
| j | Shift read only on the first moved step | CM9f, CM9g | CM9f, CM9g | killed |
| k | Shift path uses `roundTime(original.start)` | CM9c, CM9d, CM9e, CM9f, CM9g, CM9h | CM9f, CM9g, CM9h | killed |
| r4a1 | `moveStartOnGrid` → `snapTimeToGrid` only | CM1, CM2, CM6, CM8, CM12, CM13, CM16, GS3, GS13 | CM1 | killed |
| r4a2 | `clipEdgeTargets` returns `clipEdgeTimes` for both lists (no lane rule) | CE5, CM14, CM15, CT7, CG5 | CM14 | killed |
| r4a3 | `planClipLaneMove` delta in ms (scratch only; `selection.ts` frozen) | SL1, CM16 | CM16 | killed |
| n (C extra) | tie goes to the edge (`<=`) | CE1, CE2, CE4, **CE8**, CM7 | CE8 | killed |
| p (C extra) | group targets from `clipEdgeTimes`, no lane rule | **CG5** | record | killed by CG5 |
| q (C extra) | members excluded only on the anchor's lane | CG2 | CG2 | killed |

## 5. Browser smoke (not a PASS claim; `a-round-62/smoke.txt`, `smoke2.txt`, `smoke-1440b.png`)

**Setup:**
- gstack CLI. State file: `a-round-62/a-browse.json`, new and my own.
- The daemon started normally, so no fallback was needed.

**Results:**
- `/studio-lab` at 1440×900 returned 200. The workspace rendered: library, lanes video/music/stems/SFX, ruler, Snap + `1 წმ`.
- The badge «დემო კოლექცია — ავტორიზაცია არ სჭირდება» is visible.
- The status reads «დემო კოლექცია მზადაა…». It has 0 clips because the demo starts empty, which is expected.
- The first screenshot (`smoke-1440.png`) was fully black, taken during the initial page transition. The retake `smoke-1440b.png` is correct.
- **Network:**
  - 0 matches for `studio-token`, `recording-`, `/api/download` or R2;
  - the only backend request is the allowed `GET http://localhost:5199/api/cart` (backend down).
  - The JS-level `Authorization` header was not inspected by A; that is C's G62-3.
- **Shutdown:**
  - `browse stop` printed "Unable to connect", as in round 61. The state file is gone.
  - No `browse` or `bun` process remains. `node.exe` was 13 before and after.
- **Not run by A:** real-mouse group drags (GE-*), G62-3 token rows (backend 000), Ableton rows. All of these are C's §4.6 and §4.8.

## 6. code-reviewer (real subagent, read-only; score 8.5/10; no Critical or High)

| # | Sev | Finding | Disposition |
|---|---|---|---|
| R1 | Medium | CE9's pinned arguments (max 5) can't catch mutation f: the clamp and the fallback both give 5 | **Already found by my mutation run before the review finished; fixed within §2.2** by a second CE9 assertion at max 5.3 (fallback 5, clamp 5.3). B's original arguments and assertions are unchanged. f now kills CE9 + CG4 (`mutations-ce9.txt`). Recorded as deviation D1. The reviewer suggested changing max to 5.3; I kept B's call and added one instead. |
| R2 | Low → **B** | **Behaviour signal (A-R62-REVIEW-OOB-EDGE-STATUS):** when a nearer edge is out of bounds but the grid line is within bounds, the group lands on the same grid line as before. However `requested ≠ allowed`, so `gesture.blocked` is true: the drag shows `GROUP_MOVE_BLOCKED_MESSAGE`, and on release the "N კლიპი გადავიდა …" success status is not written. Previously such a drag showed no blocked text. | It matches G3 as written ("allowed = fallback"; blocked keeps its meaning), and GE-BOUNDS expects the blocked text during the drag. Not changed. **For B:** accept as intended, or pin the status in a later round. C may observe it in GE-BOUNDS. |
| R3 | Info | Grid path `roundGridTime` vs old `roundTime`: they differ only by `-0` → `0` | Spec-named; not observable (`moveClips`, `planClipLaneMove` re-round, `Math.abs`). Accepted. |
| R4 | Info | The edge path can produce `-0` if an edge lies a few ULPs below the anchor start | Ends at delta 0 → no-op. Accepted. |
| R5 | Info → B | CG5 proves that st9's end is **not** an end target, through the grid tie at 8. It does not prove that a placement-lane edge positively captures the anchor. | B's fixture as specified. **Optional for B:** a later fixture where the placement-lane end touch differs from the grid line. |
| R6 | Info | The import line change is outside the quoted G5 ranges | Stated explicitly in §2 for C's R62-S. |

**Architecture note (A-R62-ARCH-PRECISION-BOUNDARY → B; not acted on):**
- `snapGroupMoveDelta` adds another ms/µs boundary next to `roundTime` (ArrangementClip), `roundGridTime`, `toWholeMicroseconds` and `planClipLaneMove`'s µs rounding.
- `groupDeltaOnGrid` now takes `clips` and `laneTrackId` as well.
- Reviewer verdict: **keep for now.** The invariants are pinned by CE7, CG3 and CM12/CM16. Value now is low to medium.
- Fold into ARCH-CHECKPOINT-SRW14-PREFS question (b): one time-precision rule, as one bounded read-only checkpoint.

## 7. Command tails (verbatim)

```
$ npx tsc --noEmit                         → tsc rc 0
$ npx vitest run                           →  Test Files  89 passed (89)
                                              Tests  1569 passed (1569)
                                              Duration  62.43s   (vitest rc 0; no "Test timed out")
$ npm run build                            → ✓ built in 6.15s   build rc 0
$ npx biome check ./app                    → Checked 363 files … Found 5 errors. Found 218 warnings. Found 1 info.
    error files (--diagnostic-level=error): StudioWorkspace.tsx, auth-bugs.test.ts, grid.test.ts,
    render-budget.test.tsx, app/lib/auth.ts — all `format` (the baseline CRLF list)
$ npx biome check <4 owned files>          → Checked 4 files in 53ms. No fixes applied.   rc 0
$ npm run verify  (attempt 1, quiet, nothing in parallel; node.exe 13 before)
                                           →  Test Files 89 passed (89) / Tests 1569 passed (1569) / ✓ built … / verify rc 0
end: HEAD 038ed5a45f94596a264c14c4ec834607cb407948; git status --short 31 lines (30 start + ?? doc 055)
     frozen non-OK: 0 (418); protected 4/4 OK; node.exe 13; 5173 200; 5199 000
```

Full logs: `tsc.txt`, `vitest-full.txt`, `build.txt`, `biome-app.txt`, `biome-app-errors.txt`, `biome-owned.txt`, `verify.txt`, `end-state.txt`, `git-status-end.txt`.

## 8. Deviations

- **D1 — one extra CE9 assertion:** `expect(snapGroupMoveDelta(2, 2, 6.35, 1, -2, 5.3, [], [10.4]).allowed).toBe(5)`.
  - Why: §2.3 requires mutation f to fail CE9. With B's pinned max = 5 it cannot (clamp = fallback = 5), so I strengthened CE9 within §2.2.
  - B's call and assertions are unchanged; this adds one `expect`, not a new `it`.
  - Counts are unchanged: 9 / 41 / 1569.
- **D2 — CG test placement:** CG1–CG6 sit in a new describe at the end of the file. B did not pin their position. They use a describe-scoped `selectGroupPair` helper, which does the same click / Ctrl-click / selection assertion as CM10 instead of repeating it six times. No top-level helper was added or changed.
- **D3 — browse state path:** used `a-round-62/a-browse.json` (B: own round folder), not the orchestrator's `tmp/studio-real-loop/a-browse.json`. Same choice as round 61.
- **D4 — scratch left in place:**
  - `a-round-62/scratch/` (an `app/` copy plus the `node_modules` **junction**) is left for C or root to inspect.
  - Do not `rm -rf` it naively: remove the junction with `cmd //c rmdir` first.
  - I did not delete it, per the "no deleting" rule.

## 9. Scope completed and known gaps

**Done by A:** §0.1 G1–G5 source; §2.2 tests; §2.3 mutations a–k plus the re-runs; §2.4 gates; doc 055; this report.

**B acceptance criteria A can honestly mark:**
- §2.4 self-check: tsc 0; 89 / 1569; build rc 0; Biome within baseline and owned files 0; verify rc 0. ✔
- §2.3: every mutation kills its named tests (f via D1). ✔
- §2.2 tests present with the specified fixtures, plus D1. ✔
- §3.1 end status: case A, 31 lines. ✔

Every §4 item (R62-S AST check, R62-U in C's own scratch, G62-1/2/3, §4.6 browser, Ableton verdicts) is **C's** and is not claimed here.

**Known gaps:**
- **GROUP-SUBMS-GRID-EDGE** (spec-recorded G3 limitation): unchanged; in doc 055 TODO.
- **R2 status signal:** above.
- **Sub-ms browser testability:** demo assets have whole-ms durations as far as A knows. Not checked in the browser, so CG3 is unit-only unless C finds a sub-ms asset.
- The backend was down for the whole of A's run.

## 10. Exact next checks for C

1. **G62-2:**
   - HEAD `038ed5a…`, 31 status lines;
   - frozen 418 OK; protected 4/4;
   - owned-file sha prefixes as in §2;
   - all 4 owned files LF.
2. **R62-S:**
   - `diff -u` against the snapshots: grid.ts additions only; the ArrangementClip hunks = `groupDeltaOnGrid`, its call and **the import line (R6)**;
   - AST-equal for every existing `it` except CM10;
   - CE9 has B's assertions **plus** D1's extra `expect`.
3. **R62-U:**
   - mutations a–k in C's own scratch;
   - for f, check that CE9 now fails, through D1;
   - extras n / p / q — A's results: n → CE8 among others; p → CG5; q → CG2.
4. **G62-1:** tsc / vitest 89 / 1569 / build / Biome 5/218/1 / verify (≤ 2 quiet attempts).
5. **§4.6 (`:5173` up):**
   - GE-START*, GE-END, GE-MEMBER, GE-BOUNDS, GE-CROSS, GE-ALT / GE-OFF, GE-PLAY, EG-REG*, EG-GROUP;
   - in GE-BOUNDS, also note whether the drag shows the blocked text when the grid line itself is in bounds (R2).
6. **G62-3:** token rows need `:5199` up. It was **000** throughout A's run → "not run (environment)" unless root starts it.

## 11. Carried items for C/B follow-up (unchanged by A)

**`root-pre-push-review.md`** (mtime 2026-10-18 12:46):
- Video sync RF3-1, RF3-2, R5-L6 (C-R27-01) are open.
- R5-L3 is partially measured.
- R5-L5, R5-E1, R6-S2 and R6-S3 have unit tests only.
- M1: the loop refill is rAF-only.
- M2: the per-frame `position` in the context value re-renders every consumer.
- Lows L1–L4 and L6–L8.

**`publication-checkpoint.json`** (mtime 2026-10-17):
- SRW-21: the purchased loader hardcodes `middle-east`.
- Portable instruction paths.
- SRW-23 scrollbar check at 1280×720 / 1440×900.
- SRW-11/12 library and stems parity.
- T12 continuation.

**Root items:**
- INFO-R61-FAKEBEARER-500.
- The backend is down (§6.1 request).
- The publisher has never run.
- ARCH-CHECKPOINT-SRW14-PREFS, now with A-R62-ARCH-PRECISION-BOUNDARY.

**Round 63 (4c-2):** library-drop edges; LD-BLOCK regression for C-R51-01.
