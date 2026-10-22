# CURRENT TASK — Round 76: SRW-16 (FB-10) stage 2b-1 — clips snap to markers (D-29z41)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-22
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` and the LOOP POLICY / Loop v2 / cloud-runner / speed rules in your prompt (they win over older text).
- **Previous task:** `tasks/round-75.md` (exact copy). Rationale for this round: `b-round-75.md`. Decision record D-29z41 in `docs/technical/studio-real-workspace/plan.md`.
- **Round size:** one feature stage, one owner (A). Stage 2b was planned as one stage. B split it into three stages; each one is scheduled and none is deferred:
  - **2b-1 (this round, 76):** clips snap to markers: move, group move, cross-lane move, trim, library drop. Live 12 §6.7 confirms this.
  - **2b-2 (round 77):** Ctrl+←/→ also stops at clip edges of the selected tracks (Live 12 §6.9), plus the macOS Option binding (gate-73 reviewer S1).
  - **2b-3 (round 78):** the range (time selection) and the playhead also snap to markers. This is a CZABA decision; the Live text does not state it.

## Why this round
C round 75 (`c-round-75.md`, `.json`): **PASS, `browserVerified=true`, `realVerified=true`, no bugs.** Root gate 75 published commit `e347b9735a1d067fea2938da5b2f25f8256fabf1` to both remotes (rounds 74 and 75). SRW-16 stage 2a (moving markers and the marker menu) is now done.

By dependency order, the next open scope is SRW-16 stage 2b. Clip snapping comes first for two reasons: it is the part the Ableton manual confirms directly, and it only extends the SRW-14 edge-candidate mechanism that already exists. No Critical/High bug is open. The regression round is due on or after 2026-10-24 (`regression-last.json` = 2026-10-21, round 71), so it is not due for this round.

The gate-75 reviewer suggestions are open as backlog signals (GATE75-S1..S8 in `feature-status.md` §3). They are not in this round. S1 is "zoom during a marker drag makes the marker jump" and S2 is "pointercancel commits a marker move". Both are low and are scheduled as a bounded marker-drag fix-up after 2b. **Do not fix them here.** `ArrangementMarkerRow.tsx` is frozen in this round.

## Baseline (measured by B, 2026-10-22)
- **HEAD `e347b9735a1d067fea2938da5b2f25f8256fabf1`**, clean tree: `git status --short` prints **0 lines**.
- **Frozen list:** `../tmp/studio-real-loop/b-round-75-r76-tree-sha256.txt`, **451** entries, 451/451 OK (`cd store && sha256sum -c --quiet ../tmp/studio-real-loop/b-round-75-r76-tree-sha256.txt`). It covers every tracked and untracked `app/**` and `docs/implementation/**` file except the 4 owned existing files below. **`grid.ts` is unfrozen for this round** (frozen since round 64). Everything else stays frozen, including `ArrangementMarkerRow.tsx`, `ArrangementMarkerMenu.tsx`, `StudioWorkspace.tsx`, `ArrangementRuler.tsx`, `ArrangementLoopBrace.tsx`, all existing tests, and docs 064/065.
- **Snapshots:** `../tmp/studio-real-loop/b-round-75-r76-snapshots/` (`SHA256SUMS.txt`). All are LF with CR=0:

  | File | sha256 prefix | LF |
  |---|---|---|
  | `app/lib/arrangement/grid.ts` | `128cba81` | 289 |
  | `app/lib/arrangement/markers.ts` | `7c8874b0` | 189 |
  | `app/components/arrangement/ArrangementClip.tsx` | `97a1bf79` | 710 |
  | `app/components/arrangement/ArrangementLane.tsx` | `9105781c` | 950 |
- **Protected files:** 4/4 OK (`protected-baseline.json`: `cd68eb6e`, `9f738237`, `13914809`, `fa2cf0bc`). Never touch them.
- **Servers (B, Linux cloud):** `:5173/studio-lab` returns 200; backend `:5199` is unavailable (expected). A and C re-check at phase start. Never start or stop servers. A row that truly needs the backend is "BLOCKED: backend unavailable in cloud", never PASS.
- **NEVER** stash, reset, checkout, clean or re-create anything. A mismatch (different HEAD, non-empty status, a changed frozen file) means stop and report. Never run `biome check --write`, `format --write`, `npm run format` or `check:fix`.

## 1. What changes (A)

### Contract (B decision: the smallest honest behaviour consistent with FB-10 and Live 12 §6.7)
Marker times become **snap candidates exactly where clip edges are snap candidates today** (SRW-14 stage 4, `clipEdgeTargets` → `nearestGridOrEdge`). Nothing else about snapping changes.

| # | Rule |
|---|---|
| M1 | With a non-null snap step (Snap on without Alt, or Snap off with Alt, per `resolveSnapStep`), a **clip move** (single, same lane or cross-lane) can land its **start or its end** on any marker time. The nearest candidate wins, and the candidates are the grid line, the existing clip edges and the marker times. A tie with the grid line goes to the grid line, as in CM7 today. There is no pixel threshold, also as today. |
| M2 | A **group move** anchor (the `snapGroupMoveDelta` path) gets the same marker candidates for its start and end. The existing bounds rule is unchanged: an out-of-bounds candidate falls back to the grid result. |
| M3 | A **trim** can land the trimmed edge (left trim → start, right trim → end) on a marker time. Existing clamp and blocked text are unchanged. |
| M4 | A **library drop** onto an audio lane can land the dropped start or end on a marker time. The video lane still refuses library drops (`refused: isVideo`, unchanged), and the `isVideo` / not-ready grid-only branch of `libraryDropStart` stays as it is. |
| M5 | Markers are **not lane-specific**: they belong to both the start and end candidate lists for every lane. The placement-lane rule for clip edges (CM14: a same-lane clip end is not an end candidate) is unchanged and does not apply to markers. |
| M6 | Snap off without Alt, Alt with Snap on, and the Shift time lock ignore markers, exactly as they ignore clip edges today. |
| M7 | Markers are **never changed** by a clip edit: same ids, times and names. A clip move is still one history entry with its existing label; Undo/Redo restores the clip only. The clip move reschedules playback exactly as today; markers add no schedule change of their own, and the moved clip is heard at its new time. |
| M8 | With **no markers**, every result equals the round-75 result (no behaviour change). |
| M9 | A marker exactly at the dragged clip's **current** start or end is a valid candidate. It is not the clip's own edge (CM11 excludes only the clip's own edges). So a 1–2 px drag snaps the clip back onto that marker. This is correct under M1, the same as a grid line there, and **not a bug**. |

### Files (exact grants)
- **`app/lib/arrangement/grid.ts`:** extend the edge-target construction so callers can pass marker times. Preferred: an optional last parameter `markerTimes: readonly number[] = []` on `clipEdgeTargets`, merged (sorted, de-duplicated by the existing `sortedUniqueEdgeTimes`) into **both** `startEdges` and `endEdges`. An equivalent small new export is acceptable if A explains why. Existing exports keep their names, signatures (apart from the optional parameter) and results for existing callers.
- **`app/lib/arrangement/markers.ts`:** at most **one appended export** that returns the marker times of an arrangement (for example `markerSnapTimes(arrangement): number[]`, built on `arrangementMarkers`). No other byte changes. Leave the file untouched if you don't need it.
- **`app/components/arrangement/ArrangementClip.tsx`:** pass the marker times of the gesture's `before` arrangement into the three snap-target constructions: single move (~l.451), trim (~l.513–517) and the group path (`groupDeltaOnGrid`, ~l.111–140; add one parameter for the marker times). No other behaviour change. **Untouched:** the `moveStartOnGrid` helper body, the range-inside-clip `onGrid` (~l.539; that is stage 2b-3 scope), the click-seek `resolveGridTime` (~l.567), the Shift time lock and all refusal/status texts.
- **`app/components/arrangement/ArrangementLane.tsx`:** only `libraryDropStart` (~l.186–202) passes `getArrangement()`'s marker times into `clipEdgeTargets`. The `isVideo` branch is unchanged.
- **New `app/lib/arrangement/__tests__/marker-snap.test.tsx`:** the tests below. Reuse the harness pattern of `grid-snap-clip-edges.test.tsx` by copying it into the new file. Do not edit the existing file.
- **New `docs/implementation/2026/quarter-IV/066-studio-lab-clip-snap-markers.md`:** Georgian, LF, per `docs/implementation/TEMPLATE.md`. Cover the contract M1–M9, the 2b split with its rationale, the Ableton table, files, tests and mutations. Status: awaiting C. Docs 064/065 stay frozen.

If M1–M9 cannot be met inside these grants (for example, some snap path builds its candidates in a frozen file), **stop and report**. Do not edit elsewhere.

### Required tests (meaningful, behavioural; new file only)
The fixture is Snap on, grid 1 s, 40 px/s unless the test says otherwise. Markers are placed off-grid (for example 12.300 and 20.700) so that a pass can only come from the marker candidate. Clips are placed away from the markers so that no clip edge competes, except in MS12.
- **MSU1 (unit, `grid.ts`):** with marker times, `clipEdgeTargets` contains them in both `startEdges` and `endEdges`, sorted and unique. Without them, the result is identical to the old call.
- **MS1:** a single move whose raw start is nearer 12.300 than any grid line lands at `data-clip-start` 12.300.
- **MS2:** a single move whose raw end is nearer 20.700 lands with start + duration = 20.700.
- **MS3:** a nearer grid line beats a marker. An exact tie goes to the grid line.
- **MS4:** Snap off without Alt ignores markers (free ms result). **MS5:** Alt with Snap on ignores markers. **MS6:** Alt with Snap off snaps to the marker.
- **MS7:** a right trim lands its end on a marker, and a left trim lands its start on a marker (with the source offset lowered/raised as the existing trim math does).
- **MS8:** a group move lands the anchor start (or end) on a marker. A marker candidate outside the group bounds falls back to the grid result.
- **MS9:** a cross-lane move lands its start on a marker of the timeline (the target lane has no clip there).
- **MS10:** a library drop on an audio lane: the ghost/drop start lands on a marker. A drop whose raw end is near a marker lands its end there. The video-lane refusal is unchanged (one assertion).
- **MS11:** after MS1, Undo restores the clip start; the marker list (`id`, `time`, `name`) is byte-equal before and after the move and the Undo; the undo label is the existing clip-move label.
- **MS12:** a clip edge nearer than a marker wins. A marker nearer than a clip edge wins.
- **MS13:** the Shift time lock ignores markers.
- **Mutation proofs (A runs each and records it; restore and `cmp` after each):** (a) drop the marker times from the single-move targets → MS1 red; (b) from the trim targets → MS7 red; (c) from the group path → MS8 red; (d) from `libraryDropStart` → MS10 red; (e) merge markers only into `startEdges` → MS2 red.
- **A's checks (speed rules):** `npm run typecheck`, `npm run lint`, and `npx vitest run app/lib/arrangement/__tests__/marker-snap.test.tsx app/lib/arrangement/__tests__/grid-snap-clip-edges.test.tsx app/lib/arrangement/__tests__/grid-edges.test.ts app/lib/arrangement/__tests__/grid.test.ts app/lib/arrangement/__tests__/grid-snap-loop-drop.test.tsx app/lib/arrangement/__tests__/grid-snap-edit.test.tsx app/lib/arrangement/__tests__/markers.test.ts app/lib/arrangement/__tests__/markers-move-ui.test.tsx`, plus any other test file that imports `clipEdgeTargets` (`grep -rl clipEdgeTargets app`). All must be green. No full suite and no `npm run verify` (those belong to the root gate). **Code-reviewer is required** (3+ files). Pass its Architecture note to B as a signal.

## 2. Pre-flight for A
Read CLAUDE.md, `.claude/rules/*`, `primitives-map.json`, `AGENT_DISCOVERABLE_CODE`, `FORWARDREF_COMPONENT`, `AUDIO_ARCHITECTURE`, `TESTING_QUALITY_GATES`, `BUG_HUNTING_TESTS`, `GEORGIAN_DOCS` and `prompts/studio-feature.md`. Then verify the baseline: HEAD, 0 status lines, frozen 451/451, snapshots 4/4, protected 4/4, EOL. Process count: `pgrep -c node`.

## 3. File ownership (exact)
Writable: `app/lib/arrangement/grid.ts`, `app/lib/arrangement/markers.ts` (one appended export only), `app/components/arrangement/ArrangementClip.tsx` (snap-target construction only), `app/components/arrangement/ArrangementLane.tsx` (`libraryDropStart` only), new `app/lib/arrangement/__tests__/marker-snap.test.tsx`, new `docs/implementation/2026/quarter-IV/066-studio-lab-clip-snap-markers.md`. A's report goes to `a-round-76.md` (+ `a-round-76/` scratch in the loop folder). Everything else is read-only, including `.claude/**`, the protected files, `package*.json` and every existing test file.

Expected end `git status --short`: at most 4 `M` lines (the four owned files; `markers.ts` only if used) plus 2 `??` lines (the new test and doc 066). Only root commits.

## 4. Ableton source table
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Clip **move** snaps to locators | Live 12 manual §6.7 "Moving and Resizing Clips", https://www.ableton.com/en/live-manual/12/arrangement-view/ ; B capture 2026-10-21 `b-round-71/ableton-arrangement-view-20261021.txt` | **Confirmed (text):** "Clips snap to the editing grid, as well as various objects in the Arrangement including the edges of other clips, locators and time signature changes." | Markers join the clip-edge candidates (M1, M5) | MS-MOVE, MS-MOVE-END, MS-CROSSLANE |
| Clip **resize (trim)** snaps to locators | same §6.7 | **Inference:** the snap sentence follows the move and the edge-resize paragraphs and speaks of "clips" in general. The text does not say "resize" explicitly | M3 | MS-TRIM |
| Group move, library drop to locators | — | **Unconfirmed** (not stated) | CZABA consistency with the SRW-14 edge rule (M2, M4) | MS-GROUP, MS-DROP |
| Nearest-wins, no pixel threshold, tie → grid | — | **Unconfirmed** | Existing SRW-14 stage 4 rule, unchanged (CM3/CM7) | MS-MOVE (near-grid probe) |
| Bypass (Alt inverts Snap), Shift time lock | Live 12 §6.10, B capture `b-round-46/ableton-6.7-6.10-20261016.txt` (gstack 2026-10-16), decision records D-29z12 (Alt confirmed) and the stage-4 record (plan.md l.1071, re-read 2026-10-19); not re-fetched this round | Alt bypass: confirmed (§6.10). Shift time lock: CZABA rule | Unchanged (M6) | MS-SNAPOFF-ALT |
| Snap to time signature changes | §6.7 | Confirmed in Live | **Not applicable** (CZABA has no time signature changes; grid tempo is not audio stretch) | — |
| Range / playhead snap to markers; Ctrl+←/→ at clip edges | §6.9 (arrows) | Arrows: confirmed (text). Range/playhead: unconfirmed | Stages 2b-3 / 2b-2, rounds 78 / 77 | not this round |
B did no new web research this round; the stored capture is the source. C judges **CZABA requirement** and **Ableton match** separately (confirmed / deliberate difference / unconfirmed / not applicable).

## 5. C acceptance (real browser, Playwright Chromium, **both 1440x900 and 1280x720**, `/studio-lab` anonymous)
Setup: Snap on, grid 1 s (or the nearest available division; record it). Add two markers at off-grid times. To place them, set the playhead with Snap off at, for example, 12.3 s and 20.7 s, then press M. Read the times from the marker row. Read clip positions from `data-clip-start` (3 decimals) and lane-move ghosts from `data-ghost-start`. Respect the 8 px trim zones (round 51 rule). For MS-MOVE/MS-PLAY, first place an SFX clip (immediate onset) on an otherwise empty audio track at a start well away from 12.3 s (for example at 30 s); MS-PLAY half (2) is only valid when no other clip on the soloed track covers 12.3 s.

| ID | Action | Pass evidence |
|---|---|---|
| MS-MOVE | REAL-mouse drag a clip body so its raw start ends ~2–4 px from the 12.3 s marker (nearer than any grid line) | `data-clip-start` = marker time (±0.001); a second drag with the raw start nearer a grid line lands on the grid line |
| MS-MOVE-END | Drag so the raw clip end is near the 20.7 s marker | start + duration = 20.700 (±0.001) |
| MS-CROSSLANE | Drag a clip to another audio lane with its raw start near a marker | `data-ghost-start` during the drag and `data-clip-start` after the drop = marker time |
| MS-TRIM | Right trim near a marker, then left trim near a marker | the trimmed edge = marker time; the audio still starts at the right source offset (no blocked text unless clamped) |
| MS-GROUP | Select two clips (Ctrl+click) and drag the anchor's start near a marker | the anchor start = marker time; the other clip keeps its offset |
| MS-DROP | Drag a library item onto an audio lane near a marker; then hover the video lane | audio: drop ghost and dropped clip start = marker time; video lane: the existing refusal (unchanged) |
| MS-SNAPOFF-ALT | Repeat MS-MOVE with Snap off (free), with Alt + Snap on (free), with Alt + Snap off (marker) | free ms value / free / marker time, respectively |
| MS-UNDO | Ctrl+Z after MS-MOVE, then Ctrl+Shift+Z | the clip goes back and forward; the marker row (names, times, count) is identical throughout; one history step |
| MS-PLAY (real audio, discriminating) | Run this **right after MS-MOVE's first drag** (the clip start on the 12.3 s marker), before the grid-line drag, or re-drag onto the marker first. Use a clip with an immediate onset (an SFX hit). **Solo** that clip's track and REAL-click video **Mute** on (round-44 rule: the demo video audio otherwise lifts the meter). (1) Double-click the 12.3 s marker (play from it): the master meter rises (≥3 dB to ≥-15 dB detector, round-70 rule) within 0.3 s of play start. (2) Stop, Ctrl+Z (the clip goes back to a start that does not cover 12.3 s), play from the marker again: **no rise for ≥1 s**. Restore Solo/Mute after the row | both halves at both viewports; record levels and timestamps |
| REG-EDGES | SRW-14: with a marker present, a clip edge nearer than the marker wins; with no markers in a fresh load, CM1-style edge snap unchanged | positions as stated |
| REG-MARKERS | Short recheck: marker drag with Snap (MK-DRAG-SNAP), right-click menu opens and Play from here works | as in round 74 |
| T76-TARGETED | Run A's targeted vitest list once (not the full suite) | green; record counts |
| REG-HYD | Console during the rows | no hydration / `useLayoutEffect` warning, no non-noise error |
| G76-3 | Header link → `/studio-lab` with the demo badge; `/studio/<id>` anonymous → "Sign in required", no workspace; anonymous `/api/studio-token` 401; page network has no `/api/studio-token`, `/api/recording-*`, `/api/download`, no R2 host, no Authorization header | as stated. fake-Bearer 403 → BLOCKED (backend unavailable in cloud) |
| SOURCE-UNCHANGED | A's end hashes at C start and end; frozen 451/451; protected 4/4; status per §3 | equal |

Gate rows (C marks them `gate`, never `passed`): full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke.
Neighbours that can break: SRW-14 edge snap (CM/CT), Shift time lock, group bounds/blocked text, library drop ghost and refusal, clip trim clamps, cross-lane refusal texts, Undo labels.

## 6. Mutation-proof table for C (optional, read-only re-check)
C may re-run A's mutation (a) on a scratch copy outside `store/`, or reason from A's recorded output. C never edits `store/`.

## 7. After this round
Round 77: 2b-2 (Ctrl/Option+←/→ at the clip edges of the selected tracks; "selected tracks" = the active track plus the tracks of selected clips, a B decision to confirm in that task). Round 78: 2b-3 (range/playhead snap to markers). After that, B asks root for a bounded frontend-architect checkpoint at the SRW-16 boundary (`ArrangementMarkerRow.tsx` owner risk, the `isFollowAutoScroll` duplicate, the GATE75 marker-drag findings). Then comes the GATE75 marker-drag fix-up, then SRW-17. The regression round is due on or after 2026-10-24 and takes precedence when due.
