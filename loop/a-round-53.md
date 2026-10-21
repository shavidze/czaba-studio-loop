# A — Round 53 report (SRW-14 stage 4a finish, D-29z18)

Implementer: A (Claude Opus 5.5) · Date: 2026-10-17 · Task: `current-task.md` (round 53). No commit, push, deploy, install or server start/stop. This report claims no PASS.

## 1. Pre-flight gate and baseline

**Pre-flight gate**
- **Read in full before the first edit:**
  - `rules/read-primitives.md`;
  - the primitives AGENT_DISCOVERABLE_CODE, AUDIO_ARCHITECTURE, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS and GEORGIAN_DOCS, plus FORWARDREF_COMPONENT, DESIGN_TOKENS and TAILWIND_FIRST (the hook map for `app/components`);
  - `prompts/studio-feature.md`, `prompts/new-test.md`, `docs/implementation/TEMPLATE.md` and `skills/pre-flight`.
  - Also read: `grid.ts`, `ArrangementClip.tsx` l.90–110 and l.360–560, `model.ts` (`moveClip`, `trimClip*`, `ARRANGEMENT_EPS`), `selection.ts` (`planClipLaneMove`), both test harnesses, and `c-round-52.md` §6 (P1m/P1c/P1s/P2m/P2). I read §6 after the first report draft, before handing back.
  - User steering: `root-pre-push-review.md` and `publication-checkpoint.json` (open items carried in §8).
- **Assumptions:**
  - D-29z18 R1–R3 are implemented exactly as written in §0.1;
  - `model.ts` and `selection.ts` stay unchanged;
  - group, free and cancel paths stay byte-identical;
  - GS3/GS13 describe behaviour that round 52 already has.
- **Smallest version:**
  - `grid.ts`: tail rewrite of about 60 lines;
  - `ArrangementClip.tsx`: 4 hunks;
  - tests appended;
  - GS3/GS13 bodies;
  - doc section.
- **Files:** exactly the 6 owned files of §3.1.
- **Success criteria:**
  - focused suites green;
  - full vitest 87 / 1497 / 0;
  - tsc 0;
  - build OK;
  - Biome 0 on the owned files;
  - `npm run verify` exit 0.

**Baseline before any edit: case (A)**
- HEAD `038ed5a45f94596a264c14c4ec834607cb407948`.
- `git status --short` listed exactly the 14 paths.
- Frozen list (407 entries): `grep -vc ': OK$'` → **0**.
- Snapshot `SHA256SUMS.txt`: 6 × OK; `cmp`: all 6 owned files "same".
- Protected files 4/4 OK.
- node.exe 9.
- Dev server `http://127.0.0.1:5173/studio-lab` → HTTP `000` (down at the start and again at the end of A's round).

## 2. Red run, mutations, green run

The scratch copy is `a-round-53/scratch` (outside `store/`; `app/` copy plus a `node_modules` junction).
- The junction was created with `cmd //c "mklink /J …" </dev/null` and **without** `MSYS_NO_PATHCONV`.
- It was removed at the end with `cmd //c "rmdir …"`.
- `store/node_modules` is intact (618 entries).

### Red run (`a-round-53/red-run.txt`; snapshot sources plus the new tests)

**9 failed / 43 passed of 52. This matches §2.2 exactly.**
- **Red:**
  - CE4 (8.4 vs 8.3996);
  - CE5 (`clipEdgeTargets is not a function`);
  - CE6 (length / `4` vs `4.0004`);
  - CM12, CM13 and CM14 (start 2 / 9 / 2: the move was blocked, so the clip stayed);
  - CM15 (stayed on `music`);
  - CT7 (blocked text);
  - CT8 (9.6 vs 9.6004).
- **Green:** CE1–CE3, CM1–CM11 incl. CM9b, CT1–CT6, CC1–CC2, and the new GS3 and GS13 (all 20 of `grid-snap-ui`).
- **CE4 rows on the snapshot `grid.ts`, checked individually** (appended to `red-run.txt`):
  - row 1 → 8.4;
  - row 2 → 6;
  - row 3 → 9.6;
  - row 4 → 9.5.
  - Rows 1–3 are red and row 4 is green, as specified.

### Green run (`a-round-53/green-run.txt`, final code)

3 files / **52 / 52** passed. `green-run-v1.txt` is the run before the review follow-up; it was also 52/52.

### Mutations (`a-round-53/mutations.txt`; scripts `a-round-53/tools/run-mutations.sh`, `run-g2.sh`)

`mutations-v1.txt` is the first run, on the pre-review code; it gave the same results for (a)–(h) and (r1). The base passed 52/52.

| # | Mutation (exact strings in the script) | Must fail | Failed |
|---|---|---|---|
| (a) | `toWholeMicroseconds(Math.abs(` → `toWholeMilliseconds(Math.abs(` (2 sites) | CE4 (6.0004 row), CM13 | CE4, CM13 ✔ |
| (b) | `return best;` → `return toWholeMilliseconds(best) / 1000;` | CE4, CM12, CT8 | CE4, CM12, CM13, CT8 ✔ |
| (c) | other-lane edges := `clipEdgeTimes(clips, excludeClipId)` (lane clips give both edges to both lists) | CE5, CM14, CM15, CT7 | CE5, CM14, CM15, CT7 ✔ |
| (d) | lane rule applied to every lane (laneClips = all other clips; other-lane edges = `[]`) | CE5, CM2 | CE5, CM2, CM6 ✔ |
| (e) | the move passes `original.trackId` instead of `hoverTrackId` | CM15 | CM15 ✔ |
| (f) | trims pass lane `'__no_lane__'` (= unfiltered `clipEdgeTimes`) | CT7 | CT7 ✔ |
| (g) | `clipEdgeTimes` pushes `toWholeMilliseconds(x)/1000` | CE6, CT8 | **CE6 ✔; CT8 survives** (see below) |
| (h) | µs dedupe → `time !== last` | CE6 (length 4) | CE6 ✔ |
| (r1) | candidate list not sorted in the nearest helper | CE2 | CE2 ✔ |
| (g′) A extra | the shared sort/dedupe path pushes ms-rounded values | — | CE6, CM13, CT8 |
| (s1) A extra (review) | left trim uses `endEdges` | — | CT6 |
| (s2) A extra (review) | right trim uses `startEdges` | — | CT1, CT7, CT8 |

**Why (g) survives on CT8, and why I left it:**
- §0.2/R3 defines `startEdges` = `clipEdgeTimes`(other-lane clips) ∪ the exact ends of the lane clips, and `endEdges` = `clipEdgeTimes`(other-lane clips) ∪ the exact starts of the lane clips.
- CT8's neighbour m2 is on the **same** lane. Its start reaches the trim directly from the lane clips and never passes through `clipEdgeTimes`, so rounding inside `clipEdgeTimes` cannot reach CT8.
- (g′) puts the rounding on the shared path and is killed by CT8 (and CM13), so CT8 does guard exactness.
- I did not change code or tests to make (g) as written fail CT8. That would mean either routing lane edges through `clipEdgeTimes`, which contradicts §0.2, or adding an `it` beyond the 1497.
- → **B:** the expectation of mutation (g) for CT8 is inconsistent with R3. If B wants an other-lane sub-ms trim guard, it needs a new test ID.

## 3. Diff summary per file (vs snapshots; `a-round-53/diff-vs-snapshots.txt`; all LF, 0 CRLF)

| File | LF lines (was) | Change |
|---|---|---|
| `app/lib/arrangement/grid.ts` | 172 (140) | Snapshot l.1–87 byte-identical. New private `toWholeMicroseconds` and `sortedUniqueEdgeTimes` (sort ascending, then µs-dedupe against the last kept value). `clipEdgeTimes` keeps exact edges via that helper. New export `clipEdgeTargets` (R3). The private `nearestGridOrEdge` (renamed from `nearestGridOrEdgeMs`) does the R1 µs comparison and returns the exact value, dropping candidates whose µs value is negative. `snapTimeToGridOrEdges` has the same signature. `snapMoveStartToGridOrEdges` gains only the optional `endEdges = edges`. One new export only. |
| `app/components/arrangement/ArrangementClip.tsx` | 692 (687) | 4 hunks: the import (`clipEdgeTargets` in, `clipEdgeTimes` out); `moveStartOnGrid(…, startEdges, endEdges)` with the free branch byte-identical; the single move calls `clipEdgeTargets(gesture.before.clips, original.id, hoverTrackId)`; the trim `requested` calls `clipEdgeTargets(gesture.before.clips, original.id, original.trackId)[trimStart ? 'startEdges' : 'endEdges']`, **only in the snapped branch**. Group branch, `groupDeltaOnGrid`, range, `pointercancel`, `beginGesture`, JSX and props are unchanged. |
| `__tests__/grid-edges.test.ts` | 81 (38) | The import line gains `clipEdgeTargets` (needed; reformatted to multi-line by the Biome format width). CE1–CE3 are byte-identical. Appended `describe` with CE4, CE5, CE6. |
| `__tests__/grid-snap-clip-edges.test.tsx` | 667 (573) | Appended only: `MOVE_BLOCKED_TEXT` (the exact source string), helper `exactClipEnd` (unrounded end), and `describe` with CM12–CM15, CT7, CT8. Existing `it` blocks and helpers are byte-identical. |
| `__tests__/grid-snap-ui.test.tsx` | 733 (731) | Only the GS3 and GS13 titles and bodies, per §0.3. |
| doc `048-…-stage-4a.md` | 209 (108) | Status line → `Round 52–53 — D-29z17, D-29z18; C-ის შემოწმებას ელოდება`. Appended `## Round 53 — შესწორებები (D-29z18)` (context, approach incl. the rejected radius and "nearest placeable", Mermaid, files, problems, testing incl. the REAL-mouse (PW) note, Ableton rows, TODO). Earlier text unchanged. |

**Verbatim CM12 status (asserted, confirmed by the green run):** `კლიპის გადატანა: start 00:08.400, length 00:02.000, source offset 00:00.000.` (`formatArrangementTime` rounds the display to ms; the stored start is 8.3996.)

**Banned-content scan of the `+` lines** (`any`, `@ts-ignore`, ` as X`, `//`, fake timers, snapshots, hex colours): no hits.

## 4. Browser smoke

**Not run (environment).** `curl http://127.0.0.1:5173/studio-lab` returned `000` at the start and at the end. Per the override I did not start a server. No gstack state was created.

## 5. code-reviewer (real subagent, `code-reviewer`, read-only): findings and dispositions

Score 8/10. No Critical findings.

| Finding | Severity | Disposition |
|---|---|---|
| A cross-lane move loses sub-ms exactness: `planClipLaneMove` rounds `timeDelta` to ms (`selection.ts:172`). Example: a target-lane edge at 6.0004 becomes 6.000, overlaps by 0.4 ms and is refused. | Medium | **Not fixed:** `selection.ts` is frozen. → **B follow-up** (new ID suggestion: `A-R53-REVIEW-CROSSLANE-SUBMS`). Same-lane moves and trims are exact. CM15 uses whole values. |
| No test proves that the left trim uses `startEdges`. | Medium | **Refuted by evidence:** mutation (s1) (left trim uses `endEdges`) is killed by the existing CT6; (s2) is killed by CT1/CT7/CT8. No change. |
| Trims built the edge lists even with Snap off. | Low | **Fixed** inside the allowed trim-`requested` hunk: `clipEdgeTargets` now runs only in the snapped branch. All gates were re-run afterwards. The move path still builds the lists before the branch, as in round 52 (`A-R52-REVIEW-EDGES-PER-MOVE`, kept open). |
| No µs edge-case tests for a two-edge tie or a negative candidate inside the 1 µs band (−4e-7 → −0 µs is kept; `moveClip` clamps it). | Low | **Not added:** the test count is fixed by §2.3 (1497). A two-edge tie is already covered by CE2 rows 4–5 (and mutation r1). The negative-in-band case is harmless (clamped). → **B**, if wanted. |
| Hovering the video lane filters the video clip's edges under the lane rule, but the move is refused as `video-lane` anyway. | Info | No user-visible change. No action. |

**Architecture note (for B; not acted on):**
- One gesture now follows two precision rules: snapping is exact to the µs (`ArrangementClip.tsx` single move), while the cross-lane plan (`selection.ts:172`) rounds the delta to ms.
- The reviewer proposes a separate bounded task, in round 55 or later: let `planClipLaneMove` keep an exact single-clip delta, or accept the requested start.
- Acceptance test for it: CM15 with a 6.0004 target-lane edge commits without the overlap refusal, and the group-delta tests stay green.
- Keep/extract: **keep** this round.

## 6. Command tails (verbatim, final tree)

```
$ git rev-parse HEAD
038ed5a45f94596a264c14c4ec834607cb407948
$ git status --short            (15 lines — see §7 deviation 1)
 M app/components/arrangement/ArrangementClip.tsx
 M app/components/arrangement/ArrangementLane.tsx
 M app/components/arrangement/ArrangementLoopBrace.tsx
 M app/components/arrangement/ArrangementRuler.tsx
 M app/components/arrangement/StudioWorkspace.tsx
 M app/lib/arrangement/__tests__/grid-snap-edit.test.tsx
 M app/lib/arrangement/__tests__/grid-snap-ui.test.tsx
 M app/lib/arrangement/grid.ts
?? app/lib/arrangement/__tests__/grid-edges.test.ts
?? app/lib/arrangement/__tests__/grid-snap-clip-edges.test.tsx
?? app/lib/arrangement/__tests__/grid-snap-loop-drop.test.tsx
?? app/lib/arrangement/__tests__/grid-snap-position.test.tsx
?? docs/implementation/2026/quarter-IV/046-studio-lab-grid-snap-stage-3a.md
?? docs/implementation/2026/quarter-IV/047-studio-lab-grid-snap-stage-3b.md
?? docs/implementation/2026/quarter-IV/048-studio-lab-grid-snap-stage-4a.md
$ sha256sum -c ../tmp/studio-real-loop/b-round-52-r53-tree-sha256.txt | grep -vc ': OK$'
0
$ protected-baseline check
app/lib/__tests__/download-routes.test.ts OK
app/routes/account.downloads.tsx OK
app/routes/api.studio-token.ts OK
app/routes/studio.$productId.tsx OK
$ npx vitest run <18 frozen suites of §4.8>        (frozen-suites.txt, node.exe 9)
 Test Files  18 passed (18)
      Tests  356 passed (356)
$ npx tsc --noEmit                                  (tsc.txt)
tsc rc=0
$ npx vitest run                                    (full-vitest-v1.txt, pre-review code, node.exe 9)
 Test Files  87 passed (87)
      Tests  1497 passed (1497)
$ npx vitest run                                    (full-vitest.txt, FINAL code, node.exe 9)
     × folds a lane to a 36 px row with compact M/S that keep their aria-pressed and click behaviour 5328ms
     × adds three sounds from two collections at exact positions and preserves their export after save/open 5139ms
 Test Files  2 failed | 85 passed (87)
      Tests  2 failed | 1495 passed (1497)
   (both: "Error: Test timed out in 5000ms."; files not touched this round)
$ npx vitest run app/lib/__tests__/sfx-library.test.tsx            (alone, timeouts-alone.txt, node.exe 9)
      Tests  3 passed (3)
$ npx vitest run app/lib/arrangement/__tests__/track-layout.test.tsx (alone, node.exe 9)
      Tests  36 passed (36)
$ npm run build                                     (build-v1.txt, pre-review code)
✓ built in 6.46s
$ npm run build                                     (build.txt, FINAL code)
✓ built in 23.16s
build rc=0
$ npx biome check ./app                             (biome-app.txt, final)
Found 5 errors.   (all `format`: StudioWorkspace.tsx, auth-bugs.test.ts, grid.test.ts, render-budget.test.tsx, app/lib/auth.ts — the baseline CRLF list)
Found 218 warnings.
Found 1 info.
$ npx biome check <5 owned code/test files>         (biome-owned.txt)
Checked 5 files in 99ms. No fixes applied.   rc=0
$ npm run verify                                    (verify.txt, final code, run quiet, node.exe 9)
 Test Files  87 passed (87)
      Tests  1497 passed (1497)
✓ built in 28.35s
✓ built in 6.97s
verify rc=0
$ tasklist | grep -ci node.exe
9
$ curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5173/studio-lab
000
```

- `npm run verify` on the final code covers lint, tsc, the full vitest (87/1497/0) and the production build.
- Final code has two full-vitest results:
  - inside `verify`: 87/1497/0;
  - a later standalone `npx vitest run`: 2 timeouts, in `sfx-library` and `track-layout`.
  - Both timed-out files are green alone. Neither file is in this round's diff.
  - This looks like a recurrence of the **C-R48-01** load/timeout pattern. I record it under that ID; it is not counted as a pass of the standalone run.
- node.exe was 9 throughout.

## 7. Deviations and notes for B

1. **`git status` has 15 lines, not 14.**
   - `grid-snap-ui.test.tsx` was tracked and identical to HEAD at baseline. The narrow GS3/GS13 grant therefore necessarily shows it as ` M`.
   - §3.1's statement "All 6 owned files already appear in the 14" is wrong for this file.
   - No other new path. The frozen list is 0 mismatches.
2. **Mutation (g) vs CT8:** see §2. This is a spec inconsistency, not a code change.
3. **`grid.ts` has two new private helpers** (`toWholeMicroseconds`, `sortedUniqueEdgeTimes`) besides the renamed nearest helper. They are not exports. Snapshot l.1–87 is untouched.
4. **`grid-edges.test.ts` import line** was extended (`clipEdgeTargets`) and wrapped by the Biome format width. This is a necessary part of "append CE4–CE6"; the CE1–CE3 bodies are byte-identical.
5. **Review follow-up edit** to the trim hunk, after the first full gates (§5, Low). All gates were re-run on the final tree.

## 8. Scope completed / not claimed

**Done by A:**
- §0.2 source;
- §2.2 tests (CE4–CE6, CM12–CM15, CT7, CT8, GS3/GS13);
- red/green;
- mutations (a)–(h), (r1) plus extras;
- doc 048 §3.3;
- unit/tsc/build/Biome/verify gates;
- the real code-reviewer run.

**Not run by A (C's acceptance):**
- R53-S/R53-U re-checks by C;
- G53-1/G53-2 by C;
- every browser ID: R52-EDGE, R53-LANE, R52-TRIM, R52-PLAY, R52-REG/REG-HYD, G53-3 (the dev server was down for A — root must start it);
- the Ableton two-verdict table.

**Known gaps:**
- cross-lane sub-ms exactness (`planClipLaneMove` ms delta; frozen);
- sub-ms behaviour is unit-only (the demo SFX are whole seconds);
- no real-browser `pointercancel`;
- R52-T(1)/(2) (magnet strength, magnet with Snap off) remain Tech Lead questions.

**Carried for C/B follow-up.** Read by A this round; this round changes none of them.
- **From `root-pre-push-review.md`** (§2/§4 open items):
  - RF3-1 (sync runs not 15/15; R2-V3 unmeasured), RF3-2 (`play()` 22–30 ms after `startAt`) and R5-L6 (wrap seek drift) — the C-R27-01 video-sync family;
  - R5-L3 partial (master tap ≤ −60 dBFS, brace past `projectEnd` not measured);
  - R5-L5, R5-E1, R6-S2 and R6-S3 are unit-only;
  - G3-R, G3-3 and G3-shots were not re-run at runtime;
  - the M1 follow-up alternative and the M2 render-load lever for the sync failures.
- **From `publication-checkpoint.json`:**
  - `followupReview`: SRW-21 (the purchased loader hardcodes `middle-east`; do not claim that all product stems work), and portable paths in the instruction files;
  - the `scrollbarUserRequest` and `libraryUserRequest` (SRW-11/SRW-12) are user requests dated 2026-10-07. A did not verify their current status; B should check `feature-status.md`.
- **Other:**
  - the CRLF Biome errors on the auth files;
  - fake Bearer → 500;
  - ENV-DEV-SERVER-DOWN-R52 (still `000` during A-R53);
  - C-R48-01 (the full-run timeouts recurred, §6).

## 9. Exact next C checks

1. **Before acting:**
   - G53-2: HEAD, the 15-line status (see §7.1), frozen 407 OK, protected 4/4;
   - `cmp`/diff of the 6 owned files against the snapshots, with `--strip-trailing-cr`.
2. **R53-S:** `grid.ts` l.1–87 identical; a single new export `clipEdgeTargets`; the 4 `ArrangementClip.tsx` hunks; GS3/GS13 the only changes in `grid-snap-ui`.
3. **R53-U:**
   - re-run (a)–(h) and (r1) with your own strings, plus (i) the cancel guard → CC1, (j) a ±500 µs tie window → CM13 and CE4 row 2, and (k) the group branch given `clipEdgeTargets` → CM10;
   - expect (g) to survive on CT8 for the reason in §2;
   - re-run probes P1m (≈ 8.3996, not blocked), P1s (6.0004), and P2m/P2 (8, normal status);
   - **P1c** (the same-lane control, length exactly 2): A expects it **unchanged at 8.4** with `კლიპის გადატანა: start 00:08.400, …` (CM1 asserts the same case). P1c is same-lane, so the cross-lane ms rounding in `planClipLaneMove` (§5 Medium) does not apply;
   - **only a cross-lane sub-ms probe** (a target-lane edge at e.g. 6.0004) is expected to be refused or land rounded under the frozen `selection.ts`. That is the known gap `A-R53-REVIEW-CROSSLANE-SUBMS`, not a regression of this round.
4. **G53-1:** tsc, vitest 87/1497/0 (record node.exe), build, Biome, `npm run verify`.
5. **Once root starts the server:** R52-EDGE → R53-LANE (LN-SHORT is the key C-R52-03 browser case) → R52-TRIM → R52-PLAY → R52-REG/REG-HYD → G53-3, with REAL-mouse (PW) for drags, trims and Alt.
