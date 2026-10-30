# Round 271: SABA-B-11c stage 2. An off-grid clip keeps its offset and moves in whole grid divisions (relative snap, Saba option (a)); closes F1-ABSOLUTE-SNAP and R49-T part (1)

**Planned by:** B, at the round 270 → 271 planning, 2026-10-30.

**Decisions:**
- D-29z586: the round-270 result (C PASS; gate 270 published `4b912a9`; GATE266-S1, B-R269-DETAIL-ALLTRACKS-DROP, GATE266-S4 and B-R266-CLIPS-SPLIT-COPY closed);
- D-29z587: the relative-snap contract, its scope (pointer drags only) and the rejected options. **This changes how an existing project behaves:** an off-grid clip dragged with Snap on no longer jumps onto the nearest line;
- D-29z588: the Snap title wording;
- D-29z589: triage of the gate-270 review and C's round-270 notes;
- D-29z590: consults, Saba questions and the Live measurement request;
- D-29z591: order and checkpoint.

**Read first:** `lessons.md` in full. These apply directly:
- L23 (B's scratch pre-check, §6);
- L29 (claims, §9);
- L4 (one element, one rule: §3.4);
- L44 (deliberate differences go to Saba: §2, §3.5);
- L49 (a replaced call keeps its side effects: §3.1);
- L39 (screen budget);
- L11 (STOP);
- L26 and L28 (the docs, including the multi-stage clause).

**Previous task:** `tasks/round-270.md` (an exact copy of the round-270 `current-task.md`).
- C: `c-round-270.json` = **PASS**, with `browserVerified` and `realVerified` true and 0 bugs.
- Gate 270: **published**, commit `4b912a9` on both remotes.

## Baseline: HEAD `4b912a9`, clean tree
`git rev-parse HEAD` = `4b912a9e065b60a714c196bae5456a9857944634`, and `git status --porcelain` prints nothing [K1]. If root commits again before A starts, C accepts the drift only when `git diff 4b912a9 HEAD -- app` is empty (L29 clause).

## 1. What changes, and why
**Saba's answer (2026-10-30, policy "Saba's answers, 2026-10-30", item 3):** "A clip off the grid keeps its offset and moves in whole divisions (4.3 → 5.3 → 6.3)." He chose option (a) of `user-review/questions-11c.md` Q3. When root later measures Live and the result differs, it comes back to Saba as a question; it never silently changes (a).

**Today, at HEAD:**
- A clip move with Snap on snaps the dragged clip's start to the nearest **absolute** grid line, or to a magnetic edge (another clip's edge or a marker) when that is nearer. Single moves go through `moveStartOnGrid` → `snapMoveStartToGridOrEdges`, and group and cross-lane moves through `groupDeltaOnGrid` → `snapGroupMoveDelta` [K2][K3].
- After the 3 px drag threshold [K4], even a small jitter can therefore jump an off-grid clip by up to half a division (F1-ABSOLUTE-SNAP).

**B's browser repro at HEAD (both viewports, 0 page errors, `b-round-270/probe-relative-snap-head.json`) [K10].** Steps: add the demo clip to Music (start 10.000, grid 1 s, 40 px/s), press G, then Alt-drag it +12 px.

| Step | HEAD | Sketch (`probe-relative-snap-sketch.json`) |
|---|---|---|
| Alt-drag +12 px | 10.300 | 10.300 |
| drag +5 px (jitter) | **10.000**, a new "Move clip" Undo entry | 10.300, status `Move clip: nothing changed — the Undo history is unchanged.` |
| drag −5 px | 10.000 | 10.300 |
| drag +48 px (1.2 s) | 11.000 | 11.300 |
| drag +48 px again | 12.000 | 12.300 |
| drag +48 px down to Stems (ghost while dragging) | ghost `13.000`, lands 13.000 on `stems` | ghost `13.300`, lands 13.300 on `stems` |
| left trim handle +30 px (0.75 s) | 14.000 | 14.000 (trim is unchanged) |

**Second recipe (`probe-group-nudge.mjs`, `probe-group-nudge-head.json` / `-sketch.json`) [K13].** Steps: the same clip, G, Alt-drag +12 px to 10.300. Then:
- ArrowRight → 11.000 on both builds (the nudge is unchanged), and Ctrl+Z → 10.300.
- Click the Stems lane 600 px right of its left edge, focus the second library option and press Enter: a clip at 15.000 on `stems`.
- Click the music clip's header, Ctrl+click the stems clip's header, then drag the music clip +48 px:
  - HEAD: 12.000 / 16.700, status `Move (2): 2 clips moved 00:01.700 to the right.`;
  - sketch: **11.300 / 16.000**, status `Move (2): 2 clips moved 00:01.000 to the right.`

**Why we missed it** (the SABA-B-* rule of 2026-10-28):
- **Which phase should have caught it:** B planning in round 47. B accepted the Medium F1 "until R49-T", a parked Tech Lead manual check, without a deadline round (`backlog.json` F1-ABSOLUTE-SNAP, D-29z14).
- **Why it did not:** no rule then required a deadline for a parked check, so F1 stayed "accepted" from round 47 until RETRO 260 sent it to Saba. He answered on 2026-10-30. The reference-first rule did not exist either, so nobody asked how Live treats an off-grid clip.
- **The rule that catches it:** L46 ("a parked check gets a deadline round", already in `lessons.md`) and L45 / the reference-first rule. No new lesson is needed. The project review `/home/runner/czaba-project/docs/technical/studio-real-workspace/transport-grid-review.md` (outside `store/`, a loop reference) carries the per-gap root cause.

## 2. Reference: how Ableton Live 12 does it (checked 2026-10-30)
| Point | Source | What the source says | CZABA, this round | C row |
|---|---|---|---|---|
| Clip moves snap | Live 12 manual, Arrangement View §6.7 "Moving and Resizing Clips" (https://www.ableton.com/en/live-manual/12/arrangement-view/, fetched by B on 2026-10-30) | "Clips snap to the editing grid, as well as various objects in the Arrangement including the edges of other clips" | Unchanged: grid and edges, nearest wins, a tie goes to the grid | RS-B-ONGRID, RS-B-OFFSET |
| An **off-grid** clip's offset during a snapped move | §6.7 and §6.10 (same fetch); `ableton-arrangement-expert`, round-264 consult (UNKNOWN); video riOD 2:22 (`reference/youtube/SABA-B-9-10-11-transcripts.md`: "clip moves and edge trims snap to the edit grid") | **No reference found.** None of the three sources says whether an off-grid clip keeps its offset. Root could not measure it in Live on 2026-10-30 (a Windows overlay blocked input) | Saba's decision (a): keep the offset, move in whole divisions. A Live measurement request is filed (§3.5) | RS-B-OFFSET, RS-B-JITTER, RS-B-XLANE |
| Bypass | §6.10: "hold down the Alt (Win) / Cmd (Mac) modifier while performing an action to bypass grid snapping"; §6.7 names Ctrl+Alt+Shift (Win) / Cmd+Option+Shift (Mac) for "dragging the clip's contents" | The manual's two sections differ. That is a data point, not a task item | Alt bypass unchanged | RS-B-OFFSET (the Alt step) |
| Edge trims snap | riOD 2:22 (root's summary) | Edge trims snap to the edit grid | Unchanged: absolute lines | RS-B-TRIM |
| Arrow-key nudge | §6.9: "You can nudge a selection of material using the left and right arrow keys" | Whether the step is the grid, and whether an offset is kept, is not stated | **Unchanged** (the next absolute line). Saba question SABA-Q-11C-NUDGE (§3.5) | RS-B-NUDGE (guard) |

**Other reference points (cursor, hover and selected states, shortcuts, visuals):** unchanged by this task. Snap changes only the computed destination of a drag. The grab cursor, ghosts, selection ring and the G / Alt / Shift keys are untouched.

**Deviations:** none recorded as settled.
- The off-grid behaviour follows Saba's decision with no Live source.
- "Nudge stays absolute while drags are relative" is a **planner choice**, so it goes to Saba as a question (L44). It is not recorded as a deliberate difference.

**`product-designer` (consulted at this planning, D-29z590):**
- **Framing:** one rule: "a drag moves the grabbed clip by whole grid steps measured from where it started". Today's on-grid behaviour is the special case where the offset is 0.
- **Chosen:**
  - nothing new on screen. The clip's constant distance to the lines is the feedback;
  - title "Snap on — clips follow the grid (G)";
  - the offset is computed from the stored grid line, so it does not drift on non-millisecond (musical) steps;
  - the grabbed clip decides, not the first-selected one.
- **Rejected:**
  - a "relative" badge or a status message (new text for what the eye already sees);
  - an offset guide line (a new visual concept);
  - the titles "…land on the grid" (false for off-grid drags), "edits follow the grid" ("edit" means a cut to a film editor) and "move in grid steps" (false for trims).
- **States checked:** selected, group, cross-lane ghost, blocked group, hidden-grid pause, musical/triplet grid, near the time start.
- **Its view on mixed nudge and drag:** acceptable for one round while Saba is asked. Absolute nudge is today the only snapped way back onto the grid, so it must not change before he answers.
- Its six acceptance rows map as follows:
  - 1 (F1 jitter) → RS-B-JITTER and RS1;
  - 2 (jitter beside a neighbour edge) → RU8;
  - 3 (successive drags and Undo) → RS-B-OFFSET and RS2;
  - 4 (group to another lane, ghost) → RS-B-XLANE, RS-B-GROUP and GS6b;
  - 5 (left stop at the offset; Alt free) → RS4 and RU3, plus the Alt step of RS-B-OFFSET;
  - 6 (on-grid drag, then trim) → RS-B-ONGRID and RS-B-TRIM.

## 3. The contract (D-29z587)
### 3.1 Single move (`ArrangementClip.tsx` `moveStartOnGrid`; new `grid.ts` `snapRelativeMoveStartToGridOrEdges(anchorStart, rawDelta, duration, step, edges, endEdges = edges)`)
- **On the grid:** when the grabbed clip's start is within **0.5 ms** of a stored grid line (`GRID_OFFSET_TOLERANCE = 0.0005`), the result is exactly today's `snapMoveStartToGridOrEdges(anchorStart + rawDelta, …)`.
  - Why 0.5 ms: clip starts are stored in whole milliseconds, and stored lines of non-millisecond steps are rounded to the millisecond. So half a millisecond is the largest rounding error that still means "on the line".
  - The existing sub-millisecond rows CE4 and CE7 stay green.
- **Off the grid:**
  - `baseIndex` = the stored line at or below the start, and `offset` = start − that line.
  - The grid candidate is `storedGridLine(baseIndex + k) + offset`, rounded once to the millisecond, with `k = floor(rawDelta / step + 0.5)`.
  - The candidate never goes below the lowest position ≥ 0, which is the offset itself.
- **Edges:** the magnetic edges compete with this candidate exactly as today (`nearestGridOrEdge`: nearest to the raw position wins, a tie goes to the grid candidate, negative candidates are dropped).
- **Unchanged inputs:**
  - Alt (bypass), the hidden-grid pause and Snap off: `resolveSnapStep`, unchanged;
  - Shift (time-locked lane move), unchanged;
  - the 3 px threshold [K4], unchanged.
- **L49:** the replaced call is a pure function, so there are no side effects to carry. History, status and ghosts stay with the existing gesture code.

### 3.2 Group and cross-lane moves (`snapGroupMoveDelta`, body only)
- `gridStart` becomes the §3.1 candidate of the **grabbed** clip (`anchorStart`). The edge target becomes `snapRelativeMoveStartToGridOrEdges(…)`.
- The out-of-bounds fallback depends on where the grabbed clip starts:
  - **on the grid:** today's `snapGroupDelta`, unchanged;
  - **off the grid:** the largest whole number of divisions inside `[minDelta, maxDelta]`, moving toward 0. A blocked group stops at the last whole step before its neighbour; it never stops at the bound itself, because that would drop the offset.
- Every clip in the group moves by the same delta, so each one keeps its own offset.
- **Musical steps and a blocked group:** B's sketch computes the blocked fallback as `whole · step`, rounded to the millisecond. On a non-millisecond step that can differ by ≤ 1 ms from the drift-free `relativeGridStart` value. A may derive the fallback from `relativeGridStart` instead. Either way, RG1 pins whole-millisecond steps only, and no row requires the ≤ 1 ms case.

### 3.3 Unchanged, with the reason (each is frozen; a change is a STOP)
| Path | Today [K5] | Why it stays |
|---|---|---|
| Library drop (`ArrangementLane.tsx`) | `snapTimeToGrid` / `snapMoveStartToGridOrEdges` | a new clip has no prior offset |
| Trim edges, in-clip range, background range (`ArrangementClip.tsx`, `StudioWorkspace.tsx`) | `snapTimeToGridOrEdges` / `resolveGridTimeWithTargets` | an edge lands on a line. The video (riOD 2:22) says trims snap to the grid. The old F1 note "stage 2 applies the same semantics to trim and range" describes round 48 (SRW-14 stage 2) and is not a requirement of this stage |
| Loop brace move and its keys (`ArrangementLoopBrace.tsx`) | absolute | not part of Saba's answer. Recorded as SABA-Q-11C-NUDGE item (b) |
| Arrow nudge (`StudioWorkspace.tsx`) | `adjacentGridLine`, the next absolute line | Saba answered for drags only. See §3.5 |
| Markers, ruler, tempo row | absolute | positions, not moves of content |

### 3.4 One element, one rule (L4)
- A clip's drag destination is decided by §3.1/§3.2 only. Trims and ranges keep their own rules (§3.3).
- The status text of a move is not changed by this task. A jitter now gives the existing "nothing changed" text because nothing moved; it is not a new write (L51).

### 3.5 For Saba (D-29z590; `user-review/questions-11c-stage2.md`, `user-review/live-checks.md`)
- **SABA-Q-11C-NUDGE** (`awaiting_user`): should the arrow nudge of an off-grid clip also keep its offset (4.3 → 5.3), as the drag now does? The same question covers the loop brace move.
- **SABA-Q-11C-REALIGN** (`awaiting_user`): with relative snap there is no snapped drag that brings an off-grid clip back onto the grid, and a drag left stops at the offset (0.3), not at 0. Today's ways back are an Alt-free drag, an edge touch or the absolute nudge.
  - `product-designer`'s default for Saba: make the time start (0) a magnetic edge, and keep the absolute nudge as the deliberate way back.
  - Not implemented this round.
- **LIVE-MEAS-11C-OFFSET** (`live-checks.md`): exact steps for root to read off Live 12 (drag and nudge of an off-grid clip). A result that differs goes to Saba as a question.

### 3.6 Copy (D-29z588)
| Key | Old [K6] | New |
|---|---|---|
| `studioGridStrings.snapOnTitle` | `Snap on — clips land on the grid (G)` | `Snap on — clips follow the grid (G)` |

- It is a `title` (a tooltip) of the Snap toggle [K6]. It has no box, so L3's box row does not apply, and it is one character shorter.
- **L29 changed-meaning sweep** [K7] (`on the grid|onto the grid|land on|lands on|to the grid|grid line` over `app perf e2e`, non-test files) finds 3 lines: this title, `snapPausedTitle` (still true: "grid lines are hidden") and a JSX comment in `ScrubZone.tsx`. Nothing else names the old meaning.

## 4. Grants (exact, `b-round-270-r271-grants.txt`)
| File | What may change |
|---|---|
| `app/lib/arrangement/grid.ts` | add `GRID_OFFSET_TOLERANCE`, `isOnGrid`, `relativeGridStart`, exported `snapRelativeMoveStartToGridOrEdges` and `relativeGroupDelta`; the body of `snapGroupMoveDelta` (its `gridStart` / `target` / `gridFallback` lines [K2]). Every other export unchanged |
| `app/components/arrangement/ArrangementClip.tsx` | the grid import [K3] and the one call in `moveStartOnGrid`; nothing else |
| `app/lib/arrangement/strings.ts` | `snapOnTitle` only |
| `app/lib/arrangement/__tests__/grid-snap-ui.test.tsx` | §5.1 rewrites; new describe RS1–RS5 |
| `app/lib/arrangement/__tests__/grid-snap-clip-edges.test.tsx` | CM11 rewrite only |
| `app/lib/arrangement/__tests__/grid-edges.test.ts` | the new import; new describe RU1–RU7 and RG1 |
| `app/lib/arrangement/__tests__/strings.test.ts` | the `snapOnTitle` literal [K6] only |
| `docs/implementation/2026/quarter-IV/202-saba-b-11c-relative-snap.md` | new doc. l.4 is exactly `**სტატუსი:** Completed (C round 271 PASS)`. Georgian; the 7 TEMPLATE headings in order (L26); it cites only test ids that exist and states the D-29z587 behaviour change for saved projects |
| `docs/implementation/2026/quarter-IV/198-saba-b-11c-background-time-selection.md` | l.4 only, → `**სტატუსი:** Completed (C round 271 PASS)` (L28 multi-stage clause [K11]) |

Everything else is frozen:
- `StudioWorkspace.tsx`, `ArrangementLane.tsx`, `ArrangementLoopBrace.tsx`, `ArrangementRuler.tsx`, `ArrangementMarkerRow.tsx`, `ArrangementTempoRow.tsx`, `ArrangementContext.tsx`, `model.ts`, `shortcuts.ts`, `perf/**`, `e2e/**`;
- the protected auth/purchase files (`studio.$productId.tsx`, `app/routes/api.studio-token*`, `app/lib/auth.ts`, `AuthContext.tsx`);
- `package.json`.

## 5. Tests
### 5.1 Tests that change, and why (Saba's rule: a rewrite whose only change is removing an assertion is a Medium bug) [K8]
| Test (HEAD line) | Old | New | Why |
|---|---|---|---|
| GS5 (`grid-snap-ui` l.368) "a group follows the grabbed clip onto the grid…" | s1 4.3 → **5**, m1 7 → **7.7** | renamed "GS5 a group moves by whole grid steps from the grabbed off-grid clip, keeping every offset, with one history entry": s1 → **5.3**, m1 → **8**; the other asserts are unchanged | the anchor 4.3 is off the grid; same subject, same assert count |
| GS5b (l.383) "…stops on the last grid line before it" | 5 / 7.7 (twice) | renamed "…stops at the last whole grid step before it": **5.3 / 8** (twice); the status, neighbour and Undo asserts are unchanged | §3.2 blocked fallback |
| GS6 (l.410) "…shows a grid ghost and lands on the grid" | ghost `['5.000']`, start 5 | renamed "GS6 a cross-lane move of an off-grid clip shows its ghost one whole grid step away and lands there with one entry": ghost `['5.300']`, start **5.3** | the off-grid anchor |
| GS6b (l.430) "…puts the off-grid anchor on the grid…" | ghosts `['13.200','8.000']`, m1 8, m2 13.2 | renamed "…keeps the off-grid anchor offset (one whole grid step) despite a same-lane neighbour": `['13.500','8.300']`, m1 **8.3**, m2 **13.5**; m3 15 and Undo unchanged | the off-grid anchor |
| GS10 (l.494), last assert (l.523) | 7.325 → 7.5 | 7.325 → **7.525** (free would be 7.542) | after the hidden-grid free move the clip is off the grid; the assert still proves Snap is active |
| HS2 (l.736), last assert (l.744) | 7.5 | **7.525** | same as GS10 |
| CM11 (`grid-snap-clip-edges` l.460) "the moved clip ignores its own edges" | clip 7.3 (2 s), +8 px → 8 | clip 7.3 (**2.4 s**, own end 9.7), +94 px (raw 9.65) → **9.3** | under (a), the own start is the k = 0 candidate. The longer clip makes the own end edge (9.7, 0.05 away) the trap a mutant falls into, so the subject is kept |
| `snapOnTitle` literals: `grid-snap-ui` l.339 and l.720, `strings.test.ts` l.1412 | `…land on the grid (G)` | `…follow the grid (G)` | §3.6 |

The B pre-check proves these are the **only** collisions. On the scratch copy with the code sketch but without the rewrites, 168 test files under `app/lib/arrangement/__tests__` and `app/components` gave exactly the 7 failures above (`b-round-270/precheck-collisions.txt`). The title literal collisions were applied with the copy change. With every rewrite applied, all 168 files pass, 2519/2519 (`precheck-folder.txt`).

### 5.2 New rows (each red on a named mutant, §7, or labelled as a guard). Ids grep-checked: no existing `RS`/`RU`/`RG` row ids under `app` [K9]
In `grid-edges.test.ts`, a new describe `SABA-B-11c stage 2 relative move snap (RU)`:
- **RU1:** `(4.3, Δ, dur 1, step 1, [])`: Δ 0.9 → 5.3; 1.6 → 6.3; 0.49 → 4.3; 0.5 → 5.3; −0.4 → 4.3; −0.6 → 3.3.
- **RU2:** an on-grid start gives exactly the absolute result. Anchors 0, 2 (step 1), 7 (step 0.25), 6.0004 (step 1), and 0.667 and 1.333 (step 60/90), each with Δ from −2 to 2 in 0.05 steps, equal `snapMoveStartToGridOrEdges(anchor + Δ, …)`.
- **RU3:** (4.3, −10) → 0.3; (0.3, −0.6) → 0.3.
- **RU4:** edge 5.22 wins → 5.22; edge 5.2 ties → 5.3 (the grid); an end edge 6.27 with duration 1 → 5.27.
- **RU5:** step 60/90, (1, 0.7) → **1.666** (stored line 1.333 + offset 0.333); (1, −0.3) → 1.
- **RU6:** (6.0004, 1.9) → 8 (within 0.5 ms = on the grid); (6.0006, 1.9) → 8.001.
- **RU7:** twenty one-beat drags from 1 at step 60/90 → **14.333** (no drift).
- **RU8 (guard; `product-designer` row 2):** jitter with a neighbour edge 0.6 s away: (4.3, ±0.1, edge 4.9) → 4.3. An absolute helper would give 4.0.
- **RG1:** `snapGroupMoveDelta(4.3, 1, Δ, 1, min, max, [], [])`:
  - 0.9 in [−4.3, 10] → {1, 1};
  - 2.6 in [−4.3, 1.5] → {3, 1};
  - −2.6 in [−1.5, 10] → {−3, −1};
  - 0.9 in [−4.3, 0.7] → {1, 0};
  - −10 in [−4.3, 10] → {−4, −4}.

In `grid-snap-ui.test.tsx`, a new describe `SABA-B-11c stage 2 relative snap of clip moves (RS)`, `{ timeout: 15_000 }`, on the file's default fixture (s1 4.3 on sfx, 40 px/s, 1 s grid, G pressed):
- **RS1 (F1):**
  - +5 px → 4.3; −19 px → 4.3; +21 px → 5.3;
  - `undoLabel` = `Move clip`, and `undoAll` = 1 (the two no-op drags wrote no entry);
  - after Undo the clip is back at 4.3.
- **RS2:** +36 px twice → 5.3, then 6.3; `undoAll` = 2; back at 4.3.
- **RS3:**
  - +326 px → 12.5. m2's start edge wins over the grid candidate 12.3;
  - then +116 px → **15.5**, which keeps the new 0.5 offset. Absolute would give 15.0;
  - m2's end edge (14.5) is 0.9 away and does not interfere.
- **RS4:** −164 px → 0.3.
- **RS5 (guard, on-grid anchor):** s1 + m1 selected, drag m1 +36 px → m1 8, s1 5.3, `Move (2)`.

L31 headroom: gate 270 shows `grid-snap-ui` at 25 tests in 8035 ms, slowest GS14 957 ms against the file's 15 s describe timeout, and `grid-snap-clip-edges` at 44 tests in 10233 ms. On B's scratch the new rows run 30 tests in 4893 ms. No test is near 50 % of its timeout.

The sketch of all rows is in `b-round-270/sketch.diff`. A may write them differently, provided they are equal or stronger.

### 5.3 A runs (speed rules)
- `npm run typecheck`;
- `npm run lint`;
- `npx biome check` on the 7 changed code and test files;
- `npx vitest run` on these 7 files: `app/lib/arrangement/__tests__/{grid-snap-ui.test.tsx,grid-snap-clip-edges.test.tsx,grid-edges.test.ts,grid.test.ts,grid-musical.test.ts,grid-musical-ui.test.tsx,strings.test.ts}`. B's scratch result for 6 of these files (all but `grid-musical-ui`) was 181/181 before RU8 was added; with RU8, `grid-edges` alone is 20/20.

A reports the slowest covering test; a test above 2500 ms is a STOP (L11). A also runs the `code-reviewer` (7 files) and reports any Architecture note.

## 6. B's pre-check (L23), all in `b-round-270/`
- **Scratch:** `/tmp/b270-scratch` (`git archive` of HEAD `4b912a9`, `node_modules` symlinked). `sketch.diff` applies §3 and §5.
- **RU8** was added after the pre-check, with `grid-edges` 20/20 and Biome clean. `sketch.diff` is 440 lines.
- **Checks:** `npx tsc --noEmit` rc 0 (`precheck-typecheck.txt`); Biome on the 7 files is clean (`precheck-biome.txt`).
- **Collision sweep:**
  - code only: 168 files, 2506 tests, exactly 7 failures, all in §5.1 (`precheck-collisions.txt`);
  - final sketch: 168 files, 2519/2519 (`precheck-folder.txt`);
  - `perf/**` and `e2e/**` have no snap or title hits (§9 K7).
- **Scope probe:** B also sketched a relative arrow nudge. It turned 5 more tests red (GS8, GS8b, GS8c, GU12, HS4). B reverted it, because the nudge is a Saba question (§3.5).
- **Mutants:** `mutants.py` and `mutants.txt` (§7).
- **Browser (Chromium, both viewports, 0 page errors):**
  - HEAD on :5173: `probe-relative-snap-head.json`;
  - sketch on scratch :5184 with its own Vite cache (`/tmp/b270-vite-cache`, stopped after the probe): `probe-relative-snap-sketch.json`;
  - screenshots in `shots/`.
  - `store/` `git status` stayed empty.

## 7. Mutants (A red-proofs them; C re-runs them on its own scratch)
| Mutant | Change | Red at B (`mutants.txt`) |
|---|---|---|
| M-ABSOLUTE-SINGLE | `moveStartOnGrid` calls the old absolute `snapMoveStartToGridOrEdges(start + delta, …)` | CM11, GS6, GS10, HS2, RS1, RS2, RS3, RS4 |
| M-ABSOLUTE-GROUP | `snapGroupMoveDelta` back to the absolute `gridStart` / target / fallback | RG1, GS5, GS5b, GS6b |
| M-TOLERANCE-0 | `GRID_OFFSET_TOLERANCE = 0` | RU2 |
| M-TOLERANCE-WIDE | `GRID_OFFSET_TOLERANCE = 0.001` | RU6 |
| M-DRIFT | candidate = `anchorStart + k·step` (no stored line) | RU5, RU7 |
| M-EDGE-OFF | the relative path ignores edges | RU4, RS3 (and 16 existing edge rows) |
| M-GROUP-CLAMP-ZERO | the off-grid blocked fallback returns 0 | RG1, GS5b |
| M-TITLE | the old `snapOnTitle` | GS3, HS1, ST23 |

No mutant row exists for the "never below the offset" floor. `storedGridLine` already clamps a negative index to line 0, so the floor is enforced twice. RU3 and RS4 pin the behaviour; A may write the floor either way.

## 8. C rows (Chromium, `/studio-lab`, 1440×900 and 1280×720, fresh anonymous contexts)
Recipe as in `b-round-270/probe-relative-snap.mjs`:
- wait for `Demo collection ready`;
- click the Music lane, focus the first library option and press Enter (clip at 10.000, 40 px/s, grid 1 s, Snap off);
- press G (Snap on);
- drag the clip by its header strip (the clip's first child).

Gate rows (full vitest, build, full Biome, verify, e2e smoke) are `gate`; do not claim them.

| Row | Steps | PASS when |
|---|---|---|
| SOURCE-SCOPE | `git status --porcelain` | only the 9 granted paths |
| HUNK-SCOPE | diff `ArrangementClip.tsx` and `grid.ts` | `ArrangementClip.tsx`: the import and the one call only. `grid.ts`: additions plus the `snapGroupMoveDelta` body; `snapMoveStartToGridOrEdges`, `snapGroupDelta`, `snapTimeToGrid`, `adjacentGridLine` byte-identical |
| CLAIMS | re-run §9 at HEAD | every K matches (L29) |
| TESTS-TARGETED | §5.3 files | all pass |
| TEST-REWRITES | diff each §5.1 test against HEAD | each changed `expect` is replaced on the same subject with an equal or stronger one; no `expect` removed |
| MUTANTS | §7 on C's own scratch | each red as listed |
| RS-B-OFFSET | Alt-drag +12 px; drag +48 px; drag +48 px; Ctrl+Z twice | 10.300 → 11.300 → 12.300 (`data-clip-start`); after two Undos 10.300 |
| RS-B-JITTER (F1) | at 10.300: drag +5 px, then −5 px | `data-clip-start` stays `10.300`; status exactly `Move clip: nothing changed — the Undo history is unchanged.`; the Undo button's title is the same before and after. HEAD gave 10.000 |
| RS-B-XLANE | at 12.300: drag +48 px down onto Stems; read the ghost before releasing | ghost `data-ghost-start` = `13.300`; the clip lands at 13.300 on `stems`; status `Move to track — Stems: start 00:13.300.` |
| RS-B-ONGRID (guard) | fresh context, Snap on, drag +56 px (1.4 s) | 11.000, as at HEAD |
| RS-B-TRIM (guard) | clip at an off-grid start (e.g. 13.300): drag the left trim handle (`title` `Trim — left edge`) +30 px | start 14.000 (absolute line), as at HEAD |
| RS-B-NUDGE (guard, §3.3) | `probe-group-nudge.mjs` recipe: clip at 10.300 (selected after the Alt-drag), Snap on, press ArrowRight; then Ctrl+Z | 11.000 (the next absolute line, unchanged from HEAD); after Undo 10.300 |
| RS-B-GROUP | same recipe: the second library item on Stems at 15.000; click the music clip's header, Ctrl+click the stems clip's header; drag the music clip +48 px | 11.300 / 16.000; status exactly `Move (2): 2 clips moved 00:01.000 to the right.` (HEAD: 12.000 / 16.700, `00:01.700`) |
| SNAP-TITLE | the Snap toggle's `title` with Snap on, with Snap off and over hidden lines | `Snap on — clips follow the grid (G)`; `Snap off — free movement (G)`; the paused title unchanged |
| SCREEN-BUDGET (L39) | persistent text lines outside the timeline, HEAD vs new, after RS-B-OFFSET | equal (no new persistent element) |
| G271-AUTH | `/studio-lab` anonymous; `/studio/middle-east` signed out; `/api/studio-token` with no header and with a fake Bearer | loads with 4 lanes / "Sign in required", 0 audio requests / 401 / 500 without a token, as in round 270 |
| DOC-202 / DOC-198 | doc 202 l.4, headings and test ids; doc 198 l.4 | byte-exact l.4 lines; the 7 TEMPLATE headings in order; every cited id exists |

**Ableton conformance:** C rates each §2 row separately.
- Off-grid offset: "unconfirmed (no source; Saba decision)".
- Edges and Alt: "confirmed".
- Nudge: "unconfirmed (Saba question)".
- F1 closes on RS-B-JITTER plus RS1.

## 9. Claims (L29). Run from `store/` at HEAD
| Tag | Command | Expected |
|---|---|---|
| K1 | `git rev-parse HEAD; git status --porcelain \| wc -l` | `4b912a9e065b60a714c196bae5456a9857944634`, `0` |
| K2 | `grep -n "export function snapMoveStartToGridOrEdges\|export function snapGroupMoveDelta\|const gridStart = snapTimeToGrid(rawStart, step);\|const gridFallback = snapGroupDelta" app/lib/arrangement/grid.ts` | `272:`, `285:`, `296:`, `298:` |
| K3 | `grep -n "  snapMoveStartToGridOrEdges,\|function moveStartOnGrid\|: snapMoveStartToGridOrEdges(start + delta\|return snapGroupMoveDelta(" app/components/arrangement/ArrangementClip.tsx` | `15:`, `140:`, `150:`, `176:` |
| K4 | `grep -n "const DRAG_THRESHOLD_PX = 3;" app/components/arrangement/ArrangementClip.tsx` | `43:` |
| K5 | `grep -rn "snapMoveStartToGridOrEdges(\|adjacentGridLine(anchor.start" app/components --include=*.tsx` | ArrangementClip.tsx:150, ArrangementLane.tsx:282, ArrangementLoopBrace.tsx:154, StudioWorkspace.tsx:2564 |
| K6 | `grep -rn "snapOnTitle\|clips land on the grid" app --include=*.ts --include=*.tsx` | strings.ts:479; StudioWorkspace.tsx:2861; grid-snap-ui.test.tsx:339, :720; strings.test.ts:1412 (and the key-list line 1445 `'snapOnTitle',`) |
| K7 | `grep -rnE "on the grid\|onto the grid\|land on\|lands on\|to the grid\|grid line" app perf e2e --include=*.ts --include=*.tsx \| grep -v __tests__` | 3 lines: ScrubZone.tsx:79, strings.ts:479, strings.ts:480 |
| K8 | `grep -nE "it\('(GS5\|GS5b\|GS6\|GS6b\|GS10\|HS2) \|it\('CM11 " app/lib/arrangement/__tests__/grid-snap-ui.test.tsx app/lib/arrangement/__tests__/grid-snap-clip-edges.test.tsx`; `grep -n "toBe(7.5);" app/lib/arrangement/__tests__/grid-snap-ui.test.tsx` | grid-snap-ui 368, 383, 410, 430, 494, 736; clip-edges 460. `7.5` at 523, 536, 744 (536 is GS12, on the grid, unchanged) |
| K9 | `grep -rnE "it\('(RS\|RU\|RG)[0-9]" app`; `grep -cE "^\s+it\('" app/lib/arrangement/__tests__/grid-snap-ui.test.tsx app/lib/arrangement/__tests__/grid-edges.test.ts app/lib/arrangement/__tests__/grid-snap-clip-edges.test.tsx` | no hits; 25, 11, 44 |
| K10 | browser: `b-round-270/probe-relative-snap.mjs` at HEAD | the HEAD column of §1 at both viewports |
| K11 | `grep -rn 'In Progress (stage' docs/implementation` | 2 lines: doc 176 (perf, another feature, not this task) and doc 198 l.4 `In Progress (stage 1 of 2; C round 266 PASS)` |
| K12 | `grep -n "trimStartLabel:\|nothing changed — the Undo history is unchanged" app/lib/arrangement/strings.ts` | `689:`, `685:` |
| K13 | browser: `b-round-270/probe-group-nudge.mjs` at HEAD | ArrowRight 11.000, Undo 10.300, second clip 15.000 on `stems`, group drag 12.000 / 16.700 at both viewports |

## 10. STOP conditions (L11)
- Any covering test fails, or one runs above 2500 ms.
- A change is needed outside §4. This includes any wish to change nudge, trim, range, loop brace or library drop.
- Two clauses of this task disagree.
- An on-grid drag changes its result anywhere (RU2 or an existing GS/CM/CG row goes red outside §5.1).

## 11. After C PASS
- SABA-B-11c stage 2 → done. SABA-B-11c is complete (stage 1 C round 266, stage 2 C round 271), and SABA-B-9-10-11-TRANSPORT-GRID is complete.
- F1-ABSOLUTE-SNAP and R49-T part (1) close. R49-T parts (2) and (3) stay with the Tech Lead.
- Round 272 = **SYS-6 STATUS-LIFETIME**, unless REGRESSION is due (on or after 2026-11-02), in which case REGRESSION goes first.
- RETRO at 275.
