# CURRENT TASK — Round 78: SRW-16 (FB-10) stage 2b-3 — playhead seeks, the in-clip time range and the loop brace snap to markers (D-29z43)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-22
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` and the LOOP POLICY / Loop v2 / cloud-runner / speed rules in your prompt (they win over older text).
- **Previous task:** `tasks/round-77.md` (exact copy). Rationale for this round: `b-round-77.md`. Decision record D-29z43 in `docs/technical/studio-real-workspace/plan.md`.
- **Round size:** one feature stage (2b-3), one owner (A). This is the last stage of SRW-16 stage 2b (D-29z41 R2: 2b-1 clips → markers, done; 2b-2 Ctrl/Option+arrows at clip edges, done; **2b-3 this round**). Nothing is deferred.

## Why this round
C round 77 (`c-round-77.md`, `.json`): **PASS, `browserVerified=true`, `realVerified=true`, no bugs.** Root gate 77 published `60006d4305c4ef316f5459e6fa29a48e7931b36c` to both remotes. Stage 2b-2 is done. No Critical/High bug is open. `regression-last.json` = 2026-10-21 (round 71); the regression round is due on or after **2026-10-24**, so it is not this round (today 2026-10-22).

Gate-77 review: S2 (doc 067 status line) is granted below as one line. S1, S3, S4 and the Architecture note are backlog signals (GATE77-*, ARCH-R77-*), not in this round.

## Baseline (measured by B, 2026-10-22)
- **HEAD `60006d4305c4ef316f5459e6fa29a48e7931b36c`** (gate 77 published commit), clean tree: `git status --short` prints **0 lines**.
- **Frozen list:** `../tmp/studio-real-loop/b-round-77-r78-tree-sha256.txt`, **455** entries, 455/455 OK (`cd store && sha256sum -c --quiet ../tmp/studio-real-loop/b-round-77-r78-tree-sha256.txt`). It covers every tracked and untracked `app/**` and `docs/implementation/**` file except the 6 owned existing files below. It includes **every existing test file**, `markers.ts`, `edge-navigation.ts`, `loop.ts`, `ArrangementMarkerRow.tsx`, `ArrangementLane.tsx`, `ArrangementContext.tsx`, `view.ts`, docs 064–066.
- **Snapshots:** `../tmp/studio-real-loop/b-round-77-r78-snapshots/` (`SHA256SUMS.txt`), all LF, CR=0:

  | File | sha256 prefix | LF |
  |---|---|---|
  | `app/lib/arrangement/grid.ts` | `0398debc` | 295 |
  | `app/components/arrangement/ArrangementRuler.tsx` | `07cbc584` | 420 |
  | `app/components/arrangement/ArrangementClip.tsx` | `4b82508a` | 722 |
  | `app/components/arrangement/ArrangementLoopBrace.tsx` | `e57566a7` | 265 |
  | `app/components/arrangement/StudioWorkspace.tsx` | `dbc6895e` | 2037 |
  | `docs/implementation/2026/quarter-IV/067-studio-lab-marker-edge-navigation.md` | `f0e786c6` | 95 |
- **Protected files:** 4/4 OK (`protected-baseline.json`: `cd68eb6e`, `9f738237`, `13914809`, `fa2cf0bc`). Never touch them.
- **Servers (B, Linux cloud):** `:5173/studio-lab` 200 per `env-status.json`; backend `:5199` unavailable (expected). A and C re-check at phase start. Never start or stop servers. A row that truly needs the backend is "BLOCKED: backend unavailable in cloud", never PASS.
- **NEVER** stash, reset, checkout, clean or re-create anything. A mismatch (different HEAD, non-empty status, a changed frozen file) means stop and report. Never run `biome check --write`, `format --write`, `npm run format` or `check:fix`.

## 1. What changes (A)

### Today (read by B in the source at `60006d4`)
Every user time below is resolved by `resolveGridTime(time, snapSeconds, gridSeconds, bypass)` (`grid.ts` l.77): step = `resolveSnapStep` (Snap on → grid; Snap on + Alt → free; Snap off → free; Snap off + Alt → grid); step `null` → the raw time, else `snapTimeToGrid`. Markers are not candidates anywhere here.
| Site | File / lines | Today |
|---|---|---|
| P1 ruler click seek | `ArrangementRuler.tsx` l.314 (`endRulerNavigation`) | `onSeek(resolveGridTime(anchorTime, …, bypass))` |
| P2 ruler playhead drag | `ArrangementRuler.tsx` l.166 (scrub move) and l.181–185 (scrub end) | `resolveGridTime(pointerTime(clientX), …, altKey)` |
| P3 empty-lane click seek | `StudioWorkspace.tsx` l.1282–1289 (marquee `finish`, not moved) | `latest.seekTo(resolveGridTime(clickTime, snapEnabledRef ? gridSecondsRef : null, gridSecondsRef, altKey))` |
| P4 click in a clip waveform | `ArrangementClip.tsx` l.579 (`finishGesture`, range not moved) | `seekTo(resolveGridTime(anchorTime, …, altKey))` |
| P5 time range in a clip waveform | `ArrangementClip.tsx` l.551–561 (`onGrid` for anchor and current, clamped to the clip) | `snapTimeToGrid(time, step)` when `step !== null` (`step` = `resolveSnapStep(…, altKey)`, l.389) |
| P6 loop brace | `ArrangementLoopBrace.tsx` l.137–160: move → `moveLoop(before, resolveGridTime(roundLoopTime(start + delta)…), resolveSnapStep(…))`; resize → `resizeLoop(before, kind, resolveGridTime(roundLoopTime(edge + delta)…))` | grid only |

Round 76 (2b-1, `c-round-76.md` MS-SNAPOFF-ALT) fixed the marker rule for clips: markers are candidates **exactly when the resolved step is non-null**; nearest wins, a tie goes to the grid line, no pixel radius (D-29z18 ruling; ROOT-R64-M1 is the known consequence). `snapTimeToGridOrEdges(time, step, edges)` (`grid.ts` l.252) and `snapMoveStartToGridOrEdges(start, duration, step, edges, endEdges)` (l.261) already implement this; candidates below 0 are ignored.

### Contract (B decision: smallest honest behaviour consistent with FB-10, round 76 R3 and Live 12 §6.7/§6.10)
| # | Rule |
|---|---|
| T1 | **Marker candidates at P1–P6.** Wherever a site above resolves a time with a non-null step, the result is the nearest of {the grid line, every marker time} (`markerSnapTimes(arrangement)`). Tie → grid line. No pixel radius. |
| T2 | **Bypass matrix unchanged.** Snap on → grid ∪ markers; Snap on + Alt → free (raw, byte-unchanged); Snap off → free (byte-unchanged); Snap off + Alt → grid ∪ markers. The Shift time-lock does not exist at these sites; nothing new is added. |
| T3 | **No markers → identical to today** at every site (the frozen grid / loop / seek / range tests stay green unchanged). |
| T4 | **Range (P5):** both the anchor and the current edge use T1, then the existing clamp to the clip bounds. If both resolve to the same time, the existing "no range" branch applies (`setTimeRange(null)`). |
| T5 | **Loop move (P6):** the moved loop's **start or end** lands on a marker, whichever candidate is nearest (the clip-move rule of 2b-1; use `snapMoveStartToGridOrEdges(raw, length, step, markers, markers)`), then `moveLoop` as today. After a marker snap that is not on a grid line, `moveLoop` keeps the length in ms (its on-grid length rule needs start, end and the new start on grid lines). A candidate that would put the start below 0 is ignored. **Loop resize:** the dragged edge uses T1, then `resizeLoop`'s existing minimum-length clamp. **Loop arrow keys** (`adjacentGridLine`, l.186–196) are unchanged (grid only). |
| T6 | **Not changed:** the marker drag (`ArrangementMarkerRow.tsx` l.490; it does not snap to other markers, the collision refusal stays), clip move/trim/drop (2b-1), Ctrl/Option+arrows (2b-2), the playhead arrow keys (0.1 s, l.188–197), the ruler double-click, overview, zoom, history labels. Seeks and range changes create no history entry (as today); the loop gesture keeps its existing single history entry. Playback keeps playing on a seek (as today). |
| T7 | **Marker times are read at event time**, from the arrangement the gesture already holds (`gesture.before` in the clip and the loop brace) or the live arrangement (`workspaceRef.current.getArrangement()` in the workspace). The ruler gets them through **one new optional prop** `getSnapMarkerTimes?: () => readonly number[]` (default: no markers), passed from `StudioWorkspace` as a stable callback that reads `workspaceRef.current.getArrangement()`. The ruler does **not** call `useArrangement` and gains no render-time dependency on the arrangement (B's reason: the ruler is the hot, frozen RU-DBLCLICK surface; the round-77 reviewer endorsed lazy computation at event time). |

### Files (exact grants)
- **`app/lib/arrangement/grid.ts`:** add **one** export beside `resolveGridTime`: `resolveGridTimeWithTargets(time, snapSeconds, gridSeconds, bypass, targets: readonly number[])` → `step === null ? time : snapTimeToGridOrEdges(time, step, targets)`. The name may differ if A explains (AGENT_DISCOVERABLE). No other byte change.
- **`app/components/arrangement/ArrangementRuler.tsx`:** the optional `getSnapMarkerTimes` prop (T7) and the three expressions at P1/P2 only (`ArrangementRulerPlayhead` receives the props through the existing `{...props}` spread at l.417; if A has to forward it explicitly, that one line is granted too). Nothing else (double-click, navigation drag, playhead keys, rendering stay byte-identical).
- **`app/components/arrangement/ArrangementClip.tsx`:** P4 (l.579) and P5 (`onGrid`, l.551) only, using `markerSnapTimes(gesture.before)`.
- **`app/components/arrangement/ArrangementLoopBrace.tsx`:** P6 move/resize only (l.137–160), using `markerSnapTimes(before)`. The arrow-key handler is not edited.
- **`app/components/arrangement/StudioWorkspace.tsx`:** P3 (l.1282–1289) and the ruler prop wiring (the stable callback + one JSX attribute at l.1854–1867). **Untouched:** `handleKeyDown`, the gesture block, every other site.
- **`docs/implementation/2026/quarter-IV/067-studio-lab-marker-edge-navigation.md`:** only the status line (l.4), replaced by exactly this line (one line, nothing else; GATE77-S2):

  > **სტატუსი:** Round 77 — C PASS (browserVerified), გამოქვეყნდა `60006d4` (D-29z42)

- **New tests:** `app/lib/arrangement/__tests__/marker-time-snap.test.ts` (unit) and `app/lib/arrangement/__tests__/marker-time-snap-ui.test.tsx` (workspace; copy the harness from `marker-snap.test.tsx`; do not edit any existing test).
- **New `docs/implementation/2026/quarter-IV/068-studio-lab-marker-time-snap.md`:** Georgian, LF, per `docs/implementation/TEMPLATE.md`: T1–T7, the site table, the Ableton table, files, tests, mutations. Status: awaiting C.

`markers.ts`, `loop.ts`, `ArrangementMarkerRow.tsx`, `ArrangementLane.tsx` and every existing test stay frozen (read-only imports are fine). If T1–T7 cannot be met inside these grants (for example, a frozen handler resolves a time first, or a frozen test fails because it expected a grid line while a marker was nearer), **stop and report**. Do not edit elsewhere.

### Required tests (behavioural; new files only)
UI fixture (B suggestion): Snap on, grid 1 s; tracks video, music, sfx; clip music `0.000–40.000` (long, so ranges and loops fit inside it); marker `6.375` "A" (off-grid by 0.375 s) and `20.000` "B" (on a grid line); then record the project end you get. Off-grid values make a pass possible only through the marker candidate.
- **TU1 `resolveGridTimeWithTargets`:** the bypass matrix (T2) for Snap on / on+Alt / off / off+Alt with target 6.375 and raw 6.45 → 6.375 / 6.45 / 6.45 / 6.375; nearest rule: raw 6.10 → 6.000 (grid nearer), raw 6.30 → 6.375; tie → grid (raw 6.1875 against grid 6 and marker 6.375); negative targets ignored; `[]` targets give exactly `resolveGridTime` on a table of ≥ 8 raw times × 3 steps (incl. a non-whole-ms musical step, e.g. 60/90).
- **TS1 P1 ruler click:** Snap on, click at raw 6.45 → position 6.375; at raw 6.10 → 6.000; Snap off → raw (ms); Alt with Snap on → raw; Alt with Snap off → 6.375.
- **TS2 P2 ruler playhead drag:** a scrub through raw 6.45 reports 6.375 to `onScrub` and the release seeks 6.375; Alt during the drag → raw.
- **TS3 P3 empty-lane click:** an empty sfx lane click at raw 6.45 → 6.375 (Snap on); Snap off → raw.
- **TS4 P4 clip click:** a click (no drag) in the music clip waveform at raw 6.45 → 6.375.
- **TS5 P5 range:** a drag in the music waveform from raw 3.2 to raw 6.45 → range `3.000–6.375`; from raw 6.40 to raw 6.45 → no range (both edges on 6.375; T4); Snap on + Alt → raw edges.
- **TS6 P6 loop resize:** with a loop `2.000–4.000`, drag the end edge to raw 6.45 → end 6.375; drag the start edge to raw 6.30 (with a loop `5.000–9.000`) → start 6.375; one history entry each; Undo restores.
- **TS7 P6 loop move:** loop `2.000–4.000` (length 2): a move with start raw 6.45 → start **6.375**, end **8.375** (length kept exactly); a move with the end at raw 6.42 (start raw 4.42) → end **6.375**, start **4.375**; with markers removed the same moves give the round-77 results (grid start, grid length).
- **TS8 regression with no markers:** P1, P3, P5 and P6 with no markers give the grid results (T3).
- **TS9 unchanged neighbours:** loop arrow keys step to grid lines past a marker (no marker stop); the playhead arrow keys step 0.1 s; marker B (12.000, on-grid) dragged with Snap on to raw 6.45, near the off-grid marker A, lands on the grid line 6.000, not on 6.375 (the drag must approach the **off-grid** marker; an on-grid one proves nothing).
- **Mutation proofs (A runs each, records it, restores and `cmp`s):** (a) the helper ignores targets → TU1/TS1 red; (b) the ruler scrub uses `resolveGridTime` → TS2 red; (c) P3 without markers → TS3 red; (d) P5 `onGrid` without markers → TS5 red; (e) the loop move without end candidates (`[]` as `endEdges`) → TS7 red; (f) markers used when the step is null → TU1/TS1 (Snap off) red; (g) a tie prefers the marker → TU1 red; (h) the loop resize without markers → TS6 red.
- **A's checks (speed rules):** `npm run typecheck`, `npm run lint`, and `npx vitest run` on the two new files plus every existing test file that renders `ArrangementRuler`, `ArrangementLoopBrace` or `ArrangementClip` or imports `grid.ts` (find them with `grep -rlE "ArrangementRuler|ArrangementLoopBrace|arrangement-loop|arrangement-ruler|lib/arrangement/grid|'\.\./grid'" app --include=*.test.ts --include=*.test.tsx`; also run `marker-snap.test.tsx`, `marker-edge-nav-ui.test.tsx`, `markers-ui.test.tsx`, `markers-move-ui.test.tsx`, `loop*.test.*`). Record the file list and counts. All green. No full suite, no `npm run verify` (root gate). **Code-reviewer is required** (3+ files); pass its Architecture note to B as a signal.

## 2. Pre-flight for A
Read CLAUDE.md, `.claude/rules/*`, `primitives-map.json`, `AGENT_DISCOVERABLE_CODE`, `FORWARDREF_COMPONENT`, `AUDIO_ARCHITECTURE`, `TESTING_QUALITY_GATES`, `BUG_HUNTING_TESTS`, `GEORGIAN_DOCS`, `prompts/studio-feature.md`. Verify the baseline: HEAD, 0 status lines, frozen 455/455, snapshots 6/6, protected 4/4, EOL. Process count: `pgrep -c node`.

## 3. File ownership (exact)
Writable: `grid.ts` (one export), `ArrangementRuler.tsx` (prop + P1/P2), `ArrangementClip.tsx` (P4/P5), `ArrangementLoopBrace.tsx` (P6 move/resize), `StudioWorkspace.tsx` (P3 + ruler prop wiring), doc 067 (status line only), new `marker-time-snap.test.ts`, new `marker-time-snap-ui.test.tsx`, new doc 068. A's report → `a-round-78.md` (+ `a-round-78/` scratch in the loop folder). Everything else read-only, including `.claude/**`, the protected files, `package*.json` and every existing test file.

Expected end `git status --short`: at most 6 `M` lines plus 3 `??` lines. Only root commits.

## 4. Ableton source table
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Clips snap to locators | Live 12 manual §6.7, https://www.ableton.com/en/live-manual/12/arrangement-view/ ; B capture `b-round-71/ableton-arrangement-view-20261021.txt` (re-read 2026-10-22) | **Confirmed (text):** "Clips snap to the editing grid, as well as various objects in the Arrangement including the edges of other clips, locators and time signature changes." | Already done in 2b-1; T6 keeps it | REG-CLIP-SNAP |
| The cursor (insert marker / time selection) snaps to the grid | §6.10 "Using the Editing Grid", same capture | **Confirmed (text):** "the cursor will snap to grid lines that represent the meter subdivisions of the song tempo"; "When the grid is off, the cursor does not snap to meter subdivisions." | Already done (rounds 48–51) | TS8 / REG-SNAP-SEEK |
| The cursor, time selection or loop brace also snapping to **locators** | §6.4, §6.7, §6.10 (no statement) | **Unconfirmed** | T1/T5: **CZABA decision** for consistency with 2b-1 (FB-10 "snap to markers"); do not describe it as Live behaviour | MT-* rows |
| Alt bypass of the grid | §6.10, B capture `b-round-46/ableton-6.7-6.10-20261016.txt`, D-29z12 | **Confirmed (text)** | T2 unchanged | MT-RULER |
| Clip edges as candidates for the cursor | — | Unconfirmed | **Not added** (not requested; the cursor gets markers only) | — |
B did no new web research; the stored captures are the source. C judges **CZABA requirement** and **Ableton match** separately.

## 5. C acceptance (real browser, Playwright Chromium on Linux, **both 1440x900 and 1280x720**, `/studio-lab` anonymous, real `page.mouse`)
Setup (record actual values): fresh load (0 clips per C round 77). With Snap off, drop **Middle East** on music at ≈0.350 (long clip; sets the project end ≈01:41.7). Snap on, grid **1 s**. Add marker **6.375**: with Snap off click the ruler at 6.375 (verify ±1 ms via the transport readout / `arrangement-position`; adjust with the playhead arrow keys or a re-click if needed), M, Enter. Add a second, **on-grid** marker **12.000** (ruler click at 12, M, Enter). Then Snap on again. Zoom as loaded (record px/s; at 40 px/s, 0.075 s = 3 px). In every row compute the expected value from the actual marker time, grid and px/s, and record raw pointer times.

| ID | Action | Pass evidence |
|---|---|---|
| MT-RULER | Ruler clicks at raw ≈6.45 and ≈6.10 with Snap on; ≈6.45 with Snap off, Snap on + Alt and Snap off + Alt | 6.375 / 6.000 / raw (ms) / raw / 6.375 (±1.1 ms; raw ±1 px) |
| MT-SCRUB | Drag the ruler playhead handle from 2 s to raw ≈6.45 (pause on the way); release | the playhead sits on 6.375 during the hover at ≈6.45 and after release; with Alt held → raw |
| MT-LANE | Click an empty part of the **sfx** lane at raw ≈6.45 (mid-lane, not the bottom 6 px height handle) | position 6.375; Snap off → raw |
| MT-CLIPCLICK | Click (no drag) inside the Middle East waveform at raw ≈6.45 | position 6.375 |
| MT-RANGE | Drag in the Middle East waveform from raw ≈3.2 to ≈6.45; then from ≈6.40 to ≈6.45 | range `00:03.000 — 00:06.375`; second drag: no range |
| MT-LOOP-RESIZE | Make a loop `2.000–4.000` (range 2–4 in the waveform, Ctrl+L); drag its end edge to raw ≈6.45; Undo; drag the end edge to raw ≈6.8 | end 6.375 (one history entry, Undo restores 4.000); at ≈6.8 → 7.000 (grid nearer) |
| MT-LOOP-MOVE | Loop `2.000–4.000`: drag the brace body so its start passes raw ≈6.45; Undo; drag so its end is at raw ≈6.42 | start 6.375, end 8.375 (length 2.000 exactly); second: end 6.375, start 4.375 |
| MT-AUDIO (real audio, discriminating) | Grid **10 s** (Snap on). Drop **Soft impact** on **sfx** near 6.375 so it snaps onto the marker (2b-1; verify start 6.375). Solo sfx; REAL-click video **Mute** on (round-44 rule). (1) Ruler click at raw ≈4.0 → read the position (expect 6.375: marker 2.375 away, grid lines 0/10 farther); Space. (2) Stop; Snap on + **Alt** ruler click at raw ≈4.0 (free, ≈4.0); Space | (1) the master meter rises (≥3 dB to ≥-15 dB detector, 10 ms sampler, round-70 rule) within **0.3 s** of play start. Without the marker candidate the click would land on 0 (no sound for 6 s). (2) **no rise for ≥1 s** (the SFX starts ≈2.4 s later; negative control). Both viewports; record levels, timestamps and the positions. Restore Solo/Mute and grid 1 s |
| REG-SNAP-SEEK | Delete both markers (6.375 and 12.000), then ruler click at raw ≈6.45 (Snap on) and a range drag 3.2 → 6.45 | 6.000 and `3.000 — 6.000` (round-50/51 behaviour) |
| REG-LOOP-KEYS | Focus the loop brace and press → / ← with a marker inside the next grid step | grid-line steps only (no stop on the marker), as round 68 |
| REG-CLIP-SNAP | A clip move near the marker (2b-1 MS-MOVE) and Ctrl+→ to the marker (2b-2) | as rounds 76/77 |
| REG-MARKERS | Drag the **12.000** marker with Snap on to raw ≈6.45 (near the off-grid 6.375 marker); Undo; right-click menu, Play from here | lands on **6.000** (grid line), not on 6.375; one `Move Marker`; menu and Play from here as round 77 |
| RU-DBLCLICK | Real `page.mouse` double-clicks on the ruler (≥ 9 attempts per viewport, from a zoomed-in and a scrolled view); porting C's older script is allowed | the view fits the project every time (rounds 67/70: 18/18); a miss is recorded against the INFO-C65/C66 watch, and a repeatable miss is a bug |
| T78-TARGETED | Run A's targeted vitest list once (not the full suite) | green; record counts |
| REG-HYD | Console during the rows | no hydration / `useLayoutEffect` warning, no non-noise error |
| G78-3 | Header link → `/studio-lab` with the demo badge; `/studio/<id>` anonymous → "Sign in required", no workspace; anonymous `/api/studio-token` 401; page network has no `/api/studio-token`, `/api/recording-*`, `/api/download`, no R2 host, no Authorization header | as stated. fake-Bearer 403 → BLOCKED (backend unavailable in cloud) |
| SOURCE-UNCHANGED | A's end hashes at C start and end; frozen 455/455; protected 4/4; status per §3 | equal |

Gate rows (C marks them `gate`, never `passed`): full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke.
Neighbours that can break: the ruler double-click Fit and ruler navigation drag (the ruler file is unfrozen this round: the main regression exposure), the playhead scrub, the clip move/trim gestures in `ArrangementClip.tsx`, the loop brace keys and gesture history, the empty-lane marquee, Space/playback.

## 6. Mutation-proof table for C (optional, read-only)
C may re-run A's mutation (a) or (e) on a scratch copy outside `store/`, or reason from A's recorded output. C never edits `store/`.

## 7. After this round
- **SRW-16 stage 2b closes with C evidence of this round.** Then B asks root for the **bounded frontend-architect checkpoint at the SRW-16 boundary** (the `handleKeyDown` arrow resolver proposal ARCH-R77-RESOLVE-ARROW-SHORTCUT, the `timeline-stops` idea, ArrangementMarkerRow owner risk, `isFollowAutoScroll` duplicate, `snapTargetsFor` from gate 76, GATE75 marker-drag findings). The checkpoint does not stop independent feature work.
- **Round 79 planning will most likely fall on or after 2026-10-24 → the REGRESSION round** (C re-verifies every done / c_pass item in the browser at both viewports, plus `npm run test:e2e:smoke`; A fixes only what C finds). Then GATE75 S1–S3, then SRW-17.
- Tech Lead manual check **R78-T**: in a real Chrome on the 10 s grid, does marker capture of the playhead and loop edges feel right (no pixel radius, ROOT-R64-M1)?
