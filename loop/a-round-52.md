# A — Round 52 report: SRW-14 stage 4a (FB-13) — clip edges snap; clip-body cancel no seek; C-R51-T1

Implementer: A (Claude Opus 5.5) · 2026-10-17 · Task: `current-task.md` (D-29z17). **No PASS claim.** No commit, push, install, or server start/stop. My own browse fallback server was started and has exited.

## 1. Pre-flight gate and baseline

**Pre-flight gate**
- **Assumptions:**
  - E1–E5 are exactly as in §0.1.
  - Touching clips are allowed (E5 confirmed):
    - `moveClip` blocks only on `start+dur > other.start + EPS`;
    - `trimClipEnd` has upper = next start, and `trimClipStart` has lower = previous end;
    - `findClipPlacementConflict` (cross-lane) uses `clip.start < end(other) − EPS && end > other.start + EPS`.
- **Smallest version:**
  - `grid.ts`: 3 exports, one private helper and the type import (+56 lines).
  - `ArrangementClip.tsx`: import, `moveStartOnGrid`, the single-move call, the trim `requested` and the `pointercancel` guard (+23 / −3).
- **Files:** only the §3.1 list.
- **Success:** the red run matches §2.2, mutations (a)–(o) fail their named tests, the full vitest run gives 87 files and 0 failures, tsc is 0, Biome on the owned files is 0, and verify exits 0.
  - **Not met:** the full vitest 0 failures and verify exit 0 (see §7.1).
  - Met: Biome owned 0 and tsc 0.
- Primitives read before the first edit: `read-primitives.md`; AGENT_DISCOVERABLE_CODE, FORWARDREF_COMPONENT, AUDIO_ARCHITECTURE, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS (and DESIGN_TOKENS / TAILWIND_FIRST via the hook); `prompts/studio-feature.md`, `prompts/new-test.md`, `docs/implementation/TEMPLATE.md`; skill `pre-flight`.

**Baseline (before any edit): case (A).**
- HEAD `038ed5a45f94596a264c14c4ec834607cb407948`; `git status --short` showed exactly the 11 paths.
- Frozen list: `grep -vc ': OK$'` → **0**.
- Snapshots `SHA256SUMS.txt`: 3 × OK; `cmp`: all 3 owned files "same".
- Protected 4/4 OK; `node.exe` 33.

## 2. Red run, mutations, green run

### Red run (`a-round-52/red-run.txt`; scratch `a-round-52/scratch`, outside `store/`; node.exe 33)

The 3 owned sources were byte-identical to the snapshots when copied, and the new tests were copied in.

**Result: 12 failed / 38 passed of 50. This matches §2.2 exactly.**
- `grid-edges.test.ts`: CE1, CE2 and CE3 all fail with `… is not a function` (the exports do not exist).
- Mounted file, **red:** CM1 (8 vs 8.4), CM2 (7 vs 6.7), CM6 (7 vs 6.7), CM8 (8 vs 8.4), CT1 (10 vs 10.4), CT2 (10 vs 9.6), CT3 (7 vs 6.85), CT6 (7 vs 6.85), CC1 (8.4 vs 0).
- Mounted file, **green:** CM3, CM4, CM5, CM7, CM9, CM10, CM11, CT4, CT5 and CC2, plus the extra CM9b (green, as expected; it is a guard).
- `grid-snap-loop-drop.test.tsx`: 27/27 green, including SL10, SL11, SL7b and SL7c. These are guards; mutations (n) and (o) below prove they are not vacuous.

### Mutations (`a-round-52/mutations.txt` and `mutations-rerun-a-i.txt`; script `a-round-52/tools/run-mutations.sh`)

The unmutated base passed 50/50.

| # | Mutation (exact strings in the script) | Must fail | Failed |
|---|---|---|---|
| (a) | the edge comparison never true → grid line only | CM1, CM2, CT1, CE1 | CE1, CE2, CM1, CM2, CM6, CM8, CT1, CT2, CT3, CT6 ✔ (rerun, see note) |
| (b) | move candidates: start-touch only | CM1, CM8, CE2 | CE2, CM1, CM8 ✔ |
| (c) | move candidates: end-touch only | CM2, CE2 | CE2, CM2, CM6 ✔ |
| (d) | `<` → `<=` (ties go to the edge) | CM7, CE1 | CE1, CE2, CM7 ✔ |
| (e) | own clip not excluded | CM11, CE3 | CE3, CM11 ✔ |
| (f) | the free branch magnets to edges (Snap off, no Alt) | CM4 | CM4, CM5, CM9, CM9b ✔ |
| (g) | Alt with Snap on keeps an edge magnet (`step ?? 1e6`) | CM5, CT5 | CM5, CT5 ✔ |
| (h) | the `< 0` filter disabled | CE2 | CE2 ✔ |
| (i) | `pointercancel` still seeks | CC1 | CC1 ✔ (rerun, see note) |
| (j) | the group move delta comes from the edge snap | CM10 | CM10 ✔ |
| (k) | `clipEdgeTimes` skips `trackId === 'video'` | CE3 | CE3 ✔ |
| (l) | `snapStep = step` (time lock uses grid + edges) | CM9 | **CM9 survives**; **CM9b** fails ✔ |
| (m) | edges filtered to the clip's own lane (both sites) | CM2, CT2, CT3 | CM2, CM6, CM8, CT2, CT3 ✔ |
| (n) | `finishLoopGesture` re-runs `handleLoopPointerMove(event)` before commit | SL10, SL11 | SL10, SL11 ✔ |
| (o) | brace move `resolveGridTime(...)` removed | SL7b | SL2, SL4, SL8, SL10, SL11, SL7b ✔ |
| (r1) review | edge candidates not sorted (earlier edge no longer wins) | CE2 (new line) | CE2 ✔ (`mutations-review.txt`; before the new line this mutation survived every test) |

- **Note on (a)/(i):** in the first scripted pass both produced no vitest summary ((i) printed "no tests"). This happened while the machine's `node.exe` count fell from 33 to 9 (other processes exiting), so it is an environment effect and not a result. The scripted rerun of (a) and (i) alone gave the rows above (`mutations-rerun-a-i.txt`). Both passes are kept.
- **(l) survives CM9 as specified.** The raw start 2 lies on line 2, so the grid always wins. I strengthened the test, not the code: **CM9b** (m1 2.3–4.3, s1 sfx 2.35–3.3, Shift to stems) expects 2.3, and (l) gives 2.35.
- After the mutations the `node_modules` junction was removed with `cmd /c rmdir`. `store/node_modules` is intact (618 entries).

### Green run (`a-round-52/green-run.txt`; node.exe 33)

3 files / **50 tests passed** (CE 3 + mounted 20 + loop-drop 27 = 23 old + 4 new).

## 3. Diff summary (vs `b-round-51-r52-snapshots`; `a-round-52/diff-vs-snapshots.txt`)

| File | Change | EOL |
|---|---|---|
| `app/lib/arrangement/grid.ts` | + `import type { ArrangementClip }`; new `clipEdgeTimes`, `snapTimeToGridOrEdges`, `snapMoveStartToGridOrEdges` and the private `nearestGridOrEdgeMs` (whole-ms compare; grid is the initial best; ascending edges with strict `<`). Existing code byte-identical. | LF 0 CRLF / 135 LF |
| `app/components/arrangement/ArrangementClip.tsx` | grid import (+3 names); `moveStartOnGrid(start, delta, duration, snapStep, edges)` (free branch unchanged); single-move call passes `original.duration`, `clipEdgeTimes(gesture.before.clips, original.id)`; trim `requested` uses `snapTimeToGridOrEdges(..., clipEdgeTimes(gesture.before.clips, original.id))`; range `!moved` branch: `setTimeRange(null)` unconditional, `seekTo` only if `event.type !== 'pointercancel'`. Group branch, range move branch, `beginGesture`, JSX, props byte-identical. | LF 0 / 687 |
| `__tests__/grid-snap-loop-drop.test.tsx` | Pure tail append: one hunk `@@ -679,3 +679,75 @@`, only `+` lines. Helper `moveBraceThenRelease`, plus `describe` with SL10, SL11, SL7b and SL7c. The 23 existing `it` blocks are byte-identical. | LF 0 / 753 |
| `__tests__/grid-edges.test.ts` (new) | CE1–CE3 | LF 0 / 37 |
| `__tests__/grid-snap-clip-edges.test.tsx` (new) | own copy of the edit harness (no import from grid-snap-edit; no import of the new grid exports); CM1–CM11, **CM9b**, CT1–CT6, CC1–CC2 | LF 0 / 573 |
| `docs/implementation/2026/quarter-IV/048-studio-lab-grid-snap-stage-4a.md` (new) | per §3.3, incl. Mermaid, the §4.9 Ableton table and the GS3/GS13 conflict | LF 0 / 105 |

**Final `git status --short`** (verbatim, 14 lines; `a-round-52/final-status.txt`, regenerated at the end) = case (A) of §3.1:
```
 M app/components/arrangement/ArrangementClip.tsx
 M app/components/arrangement/ArrangementLane.tsx
 M app/components/arrangement/ArrangementLoopBrace.tsx
 M app/components/arrangement/ArrangementRuler.tsx
 M app/components/arrangement/StudioWorkspace.tsx
 M app/lib/arrangement/__tests__/grid-snap-edit.test.tsx
 M app/lib/arrangement/grid.ts
?? app/lib/arrangement/__tests__/grid-edges.test.ts
?? app/lib/arrangement/__tests__/grid-snap-clip-edges.test.tsx
?? app/lib/arrangement/__tests__/grid-snap-loop-drop.test.tsx
?? app/lib/arrangement/__tests__/grid-snap-position.test.tsx
?? docs/implementation/2026/quarter-IV/046-studio-lab-grid-snap-stage-3a.md
?? docs/implementation/2026/quarter-IV/047-studio-lab-grid-snap-stage-3b.md
?? docs/implementation/2026/quarter-IV/048-studio-lab-grid-snap-stage-4a.md
```
HEAD is still `038ed5a` at the end.
- Frozen list: 0 non-OK.
- Protected: 4/4 OK.
- No other path changed.

The banned-content check on the diff and the new tests is clean:
- no `any`, `@ts-ignore`, `as` assertion or `//` comment;
- no colours, fake timers or snapshots;
- no exports beyond the 3.
- CC1 uses `fireEvent.pointerCancel`; the guards use `instanceof`.

## 4. Browser smoke (gstack; not a PASS claim; `a-round-52/smoke.txt`)

- **CLI daemon:** it failed once (`Server failed to start within 15s`; the next command came up on `about:blank` state). Following `harness_rules`, I started my **own** `server-node.mjs` from `tmp/studio-real-loop/` with `BROWSE_PARENT_PID=0`. Details: PID 42284, state `a-round-52/a-browse-fg.json`, log `a-round-52/daemon-fg.log`. I stopped it with `stop`; PID 42284 is gone. No `$B restart`.
- **Page:** `/studio-lab` at 1440×900 → 200. Initial state: `data-snap=off`, zoom `40 px/წმ`, 0 clips; the demo badge text is present.
- **REAL `g`:**
  - The first press was made while the status still read `დემო კოლექცია იტვირთება…` and did not toggle.
  - After the status became `დემო კოლექცია მზადაა. …`, a REAL `g` gave `data-snap=on` and the status `Snap ჩართულია — ბადე 1 წმ (G)`.
  - The early press is noted as an observation only; it is pre-existing load-time behaviour and not part of this change.
- **Console:** only the known root `GET /api/cart` `ERR_CONNECTION_REFUSED` / "Failed to load cart".
- **Network:** 0 matches for studio-token / recording- / api/download / r2 / authorization.
- **Not run:** drags and trims (GSTACK-NO-MOUSE; they are C's REAL-mouse (PW)).

## 5. Code review (actual `code-reviewer` subagent)

I ran the real `code-reviewer` agent. Its input was the diff against the snapshots, the full sources, the 3 test files, the related model/selection/brace code and the GS3/GS13 arithmetic. It reported **Score 7/10, no Critical, and no code defect against E1–E5.** It confirmed by reading the code:
- the tie rules, the ms comparisons, the `<0` filter, own-clip exclusion and video edges;
- that `gesture.before` is used and the Shift lock takes the free branch;
- that the group path is byte-identical and E5 touching holds;
- that `pointercancel` is reachable (`onPointerCancel` is bound) and that the uncaptured fallback never seeks;
- the snap-then-clamp order;
- that the test arithmetic and the status strings are right.

| Finding | Severity | Disposition |
|---|---|---|
| GS3/GS13 fail because of E2; §0.4's premise is false for these fixtures | Spec, blocks G52-1 | **For B** (§7.1). The reviewer's option (i): GS3 expects 8.5 with two Undo entries; GS13's blocked step moves to a raw value where the grid line wins and is refused, e.g. raw 8.9 → 9 → 9+4 > 12.5 → blocked at 8.5. Option (ii): move m2 out of reach. |
| **Sub-ms clip lengths:** edges and the duration are rounded to whole ms (as §0.1/§0.2 require). An end touch can land up to 0.5 ms past a neighbour that has a raw `buffer.duration` (library drops are not rounded). `moveClip` / `findClipPlacementConflict` (EPS 1e-4) then refuse it, giving the blocked status instead of a butt-join. Trims are safe (clamped). No fixture has sub-ms lengths. | Medium (spec) | **For B; not changed.** §0.2 fixes `clipEdgeTimes` as "millisecond-rounded", so returning exact values would change the spec. The reviewer proposes comparing in ms but returning the exact candidate (`other.start + other.duration`, `e − duration`). **C should check this on L52 in a real browser:** if `Soft impact` / `Slow rise` / the video have sub-ms durations, EG-* or ET-* may show the blocked text. |
| **Unplaceable same-lane candidates:** on the target lane, "start on another clip's start" and "end on another clip's end" always overlap, but they can still win and block a move that stage 1 placed on a free line. Example: m2 0.5 s at 12–12.5, m1 4 s long, 1 s grid, raw 8.4 → 8.5 is dead, so the move is blocked instead of landing on 8. | Medium (spec) | **For B; not changed** (E2 lists every `e` and every `e − duration`). Proposal: drop those candidates for clips on the target lane, or take the nearest placeable candidate. |
| The "earlier edge wins" rule was untested: the `.sort` could be deleted and every test still passed | Low (A-owned test) | **Fixed.** CE2 gets the line `snapMoveStartToGridOrEdges(6.5, 2, 10, [6.6, 8.4])` → 6.4. Mutation (r1) "no sort" now fails CE2, and (a) still fails its 10 tests (`mutations-review.txt`). Owned files green: 50/50 (`green-run-v2.txt`, node.exe 10); tsc 0; Biome on the file: 0. |
| CM9 cannot catch (l) | Low | Already addressed by CM9b. |
| A same-lane right trim whose nearest candidate is the neighbour's end is clamped to the neighbour's start and shows the blocked text | Low | For B / info; follows F1, so no change. |
| A dragged video clip also snaps to audio edges; untested | Info | For B (fits "dragged clip"). |
| `clipEdgeTimes` runs on every pointermove | Info | No change; caching would need a new `ClipGesture` field, which §0.2 forbids. |

**Architecture note (for B; not acted on):**
- The signal is a repeated costly change: the move/trim region of `ArrangementClip.tsx` `handlePointerMove` (~l.433–514) has been reopened in rounds 47–52, and each test needs a full StudioWorkspace mount.
- Keep it for now (gesture lifecycle, refs and Undo atomicity; 4c reopens it).
- After 4c, consider extracting a pure `resolveSingleMoveTarget(before, original, raw, step, targetTrackId)` into `lib/arrangement/` and reducing the mounted tests to wiring. This is a candidate for ARCH-CHECKPOINT-SRW14-PREFS / root's frontend-architect.

## 6. Command tails (verbatim summaries; full logs in `a-round-52/`)

```
git rev-parse HEAD                      → 038ed5a45f94596a264c14c4ec834607cb407948 (start and end)
sha256sum -c …r52-tree-sha256.txt | grep -vc ': OK$'   → 0 (start and end)
snapshots SHA256SUMS.txt                → ArrangementClip.tsx: OK / grid.ts: OK / grid-snap-loop-drop.test.tsx: OK (start)
protected                               → 4 × OK (start and end)
red run   [node.exe 33]  Test Files 2 failed | 1 passed (3)   Tests 12 failed | 38 passed (50)
green run [node.exe 33]  Test Files 3 passed (3)              Tests 50 passed (50)
frozen suites (18 files) [node.exe 10]  Test Files 2 failed | 16 passed (18)  Tests 3 failed | 344 passed (347)
   × GS3, × GS13 (grid-snap-ui), × track-layout "folds a lane to a 36 px row…" (Test timed out in 5000ms; 5303 ms)
track-layout alone [node.exe 10]  Test Files 1 passed (1)  Tests 36 passed (36)
npx tsc --noEmit                        → exit 0, no output
npx vitest run [node.exe 10]  Test Files 2 failed | 85 passed (87)  Tests 4 failed | 1484 passed (1488)  (128 s)
   × GS3, × GS13 (grid-snap-ui), × 2 sfx-library tests (Test timed out in 5000ms)
sfx-library alone [node.exe 11]  Test Files 1 passed (1)  Tests 3 passed (3)
npm run build                           → exit 0, "✓ built in 9.69s"
npx biome check ./app --diagnostic-level=error → 5 errors: StudioWorkspace.tsx, auth-bugs.test.ts, grid.test.ts, render-budget.test.tsx, app/lib/auth.ts (all format; = baseline list)
npx biome check ./app                   → Found 5 errors. Found 218 warnings. Found 1 info.
npx biome check <5 owned paths>         → Checked 5 files … No fixes applied. (0 diagnostics)
npm run verify [node.exe 10]            → agents:check, test:agents, lint, typecheck OK; test:run: Test Files 2 failed | 85 passed (87), Tests 3 failed | 1485 passed (1488) (GS3, GS13, track-layout timeout) → verify exit 1
tasklist | grep -ci node.exe            → 33 at start; 9–12 later
```

The first frozen-suite call used a wrong path `delete-selection.test.tsx`; the real file is `delete-selection.test.ts`. It was rerun with the right name (`frozen-suites-v2.txt`), and the first log is kept as `frozen-suites.txt`.

## 7. Deviations and open items

### 7.1 STOP-LEVEL FINDING for B: E2 vs frozen stage-1 tests GS3 and GS13 (not resolvable inside A's ownership)

- The fixture is `grid-snap-ui.test.tsx` DEFAULT_CLIPS: m1 music 7–11 (4 s), m2 music 12.5–14.5, plus v1 0–2 and s1 4.3–5.3. Settings: 40 px/s, Snap 1 s.
- **GS3, second drag from 8 by +15 px:**
  - raw 8.375; grid 8 is 0.375 away;
  - end-touch 12.5 − 4 = **8.5** is 0.125 away;
  - E2 → 8.5; the test expects 8 ("a sub-half drag changes nothing").
- **GS13:**
  - raw 8.4 → 8.5 (touches m2) instead of 8;
  - raw 8.6 → 8.5, which fits, so the status is not `MOVE_BLOCKED_STATUS`. The test expects 8 and the blocked text.
- §0.4 ("every stage 1–3 result with no nearer edge is unchanged … R47 … tests stay green") does not hold for these two fixtures. Here a neighbour lies within `duration + ½·step` of the raw target.
- **No other test in the 87 files is affected.** The full run's only non-timeout failures are these two.
- **What I did:** kept the code exactly as E2 specifies, and did **not** edit the frozen test or the rule (either would widen or narrow B's decision).
- Consequently:
  - §2.3 "full vitest 0 failures" is **not met**;
  - `npm run verify` exits **1**;
  - G52-1 cannot pass until B decides.
- **Options for B (no recommendation from A):**
  - (a) Round 53 updates GS3/GS13: move m2 out of reach, or assert the 8.5 touch and the non-blocked status. GS13 then documents FB-13 working.
  - (b) Amend E2, e.g. a radius or edges only within a half step. Note that (b) also changes CM1/CM8/CT1 and C's EG-1/EG-VIDEO/ET-* targets.

### 7.2 Other deviations

- **CM9b** was added beyond the §2.2 table because mutation (l) survives CM9 as specified (§2).
- **CM10 selection** follows the spec literally: a plain header click on m1 (pointerdown and pointerup, no move), then a Ctrl `pointerDown` on s2's header. The test asserts that the selection is `['m1','s2']` before the drag.
- **Load timeouts (not code):**
  - `track-layout` fold test: 5303 ms in the frozen batch and in verify (5506 ms); 36/36 alone.
  - 2 × `sfx-library` (5463 / 5276 ms) in the full run; 3/3 alone.
  - The C-R48-01 pattern is not recorded under a new ID; these are recorded here with both runs.
- **Mutation first pass (a)/(i)** gave no summary while node.exe dropped; the rerun results were used and both logs are kept.
- **Smoke:** the CLI daemon failed once and the approved fallback was used (§4).
- **Process incident (my own, resolved):**
  - When I set up the post-review mutation, I exported `MSYS_NO_PATHCONV=1` before calling `cmd //c "mklink …"`. With path conversion off, `//c` reached cmd literally, so cmd started interactively and waited on stdin.
  - I identified the two hung processes by their exact command lines: PID 44044 `cmd.exe //c "mklink /J …a-round-52\scratch\node_modules …"` (15:28:56) and PID 42656 `cmd.exe //c "rmdir …a-round-52\scratch\node_modules"` (15:34:30, the same background chain). I stopped **only** those two with `taskkill /PID … /F`.
  - The junction was then created and removed without `MSYS_NO_PATHCONV`, with stdin from `/dev/null`. `store/node_modules` is intact (618 entries), the scratch dir has no junction left, and no other process was touched.
- **Test run timing:** the full vitest and verify runs above came **before** the one-line CE2 addition (a test-only change in a new file). After it, the 3 owned files were rerun: 50/50 (same `it` count, so the full-run totals of 87 files / 1488 are unchanged), and tsc is 0. The full run and verify were not repeated, since verify is blocked by GS3/GS13 anyway.

### 7.3 Known gaps (honest)

- No REAL-mouse (PW) runs by A. EG-*, ET-*, EG-CROSS, EG-GROUP, EG-1280 and EP-* are C's.
- No real `pointercancel` in a browser; CC1 is unit-only.
- The edges are recomputed with `clipEdgeTimes` on every `pointermove` (O(n log n) over all clips). This is fine at demo size; see the review in §5.
- Group moves and library drop are still grid-only (4c, scheduled).
- Root-review items still open and carried for B/C (from `root-pre-push-review.md` and `publication-checkpoint.json`):
  - RF3-1, RF3-2 and R5-L6 (C-R27-01) still fail and were not touched;
  - the purchased Studio loader `middle-east` hardcoding is an inherited limitation;
  - instruction-file portable paths still need a follow-up.

### 7.4 Exact next C checks (round 52)

1. **G52-2 / R52-S:**
   - frozen list 0 bad, protected 4/4;
   - `git status` = 11 baseline paths + `grid-edges.test.ts`, `grid-snap-clip-edges.test.tsx`, doc 048;
   - `diff -u --strip-trailing-cr` of the 3 owned files vs the snapshots (loop-drop: one tail hunk);
   - LF counts as in §3.
2. **R52-U:**
   - rerun the 3 files (expect 50/50);
   - C's own mutations (a)–(o) plus (p) and (q): (p) should fail CM3 and CM7; for (q), single-clip trims are expected to survive (info).
   - Confirm that (l) needs CM9b.
3. **G52-1:**
   - confirm independently that the full run fails exactly GS3 and GS13 (plus any load timeouts, rerun alone);
   - record verify's exit code;
   - **report the GS3/GS13 conflict to B**; do not mark G52-1 PASS.
4. **R52-EDGE / R52-TRIM / R52-PLAY** with REAL-mouse (PW) on L52, per §4.3–§4.5. With L52 (music 7–23, Soft impact 4–6, video 0–6.008), EG-1 should land on 7.000 and EG-VIDEO on 4.008.
5. **R52-REG:**
   - SN-1, NU-1, an SE3-like trim, RU-1, LB-MOVE, LD-1, clip-body click → 8.000, REG-HYD;
   - G52-3 anonymous/purchase checks.
6. Ableton two-verdict table (§4.9 / doc 048).

### 7.5 Scope completed vs B acceptance (A's own evidence only)

- **Done, A-verified:**
  - §0.2 source (exact hunks);
  - §0.3 SL10, SL11, SL7b, SL7c;
  - §2.2 tests;
  - the red run matches §2.2;
  - mutations (a)–(o) all kill (with CM9b for (l));
  - tsc 0, build OK;
  - Biome `./app` 5/218/1 within the baseline; owned files 0;
  - doc 048;
  - smoke.
- **Not met:** full vitest 0 failures and `npm run verify` exit 0 (GS3/GS13, §7.1).
- **Not run by A:** every C browser ID.
- **Ready for commit?** Not from A's side until B resolves §7.1.
