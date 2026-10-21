# CURRENT TASK — Round 62: SRW-14 stage 4c-1 — a group move snaps its anchor to the edges of other clips (D-29z27). Includes C-R52-T1 (start-touch and end-touch group targets), INFO-R55-FREE-ROUND-UNGUARDED (Snap-off whole-ms test) and A-R55-REVIEW-SHIFT-MIDDRAG-TEST (Shift on the last step). Stage 4c-2 (library-drop edges) is round 63.

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-19
- **Workflow:** `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09). Addenda: Ableton 2026-10-11; periodic commits 2026-10-13; behavioural reverse-engineering 2026-10-14; architecture checkpoint; user priority 2026-10-15 Grid/Snap.
- **Decision record:** **D-29z27** in `docs/technical/studio-real-workspace/plan.md`. Rationale: `b-round-61.md`.
- **Round size:** one owner (A), **one feature** (stage 4c-1: edge snap for a group move), plus two committed tests that the plan already tied to the same test file and area (D-29z24). Two source files (`grid.ts`, `ArrangementClip.tsx`) and two test files.
- **Why now:** C round 61 was a clean **PASS** (no bugs), so no C bug pre-empts the next feature. Round 61 was the last menu-only round (D-29z26 hard boundary). 4c is next in the SRW-14 order.
- **Split, not a cut (D-29z27):** the recorded 4c scope is "group-move edge snap + library-drop edge decision". It is split like 4a was:
  - **4c-1 (this round):** group moves.
  - **4c-2 (round 63):** library drops snap to clip edges (`ArrangementLane.tsx`, a different gesture, file and test file).
- **C-R51-01 is ruled now (closed by design, no code).** See §0.6.

> **Servers.** At B's check (2026-10-19 ~11:15 +04, `b-round-61/gates.txt`): `/studio-lab` **200**, `:5199/api/products` **000 (backend down since the machine restart)**. Root is asked to start the backend before A (§6.1).
> - Check both at the start of A and of C, and record the result. Agents never start or stop servers.
> - `/studio-lab` needs no backend for §4.6 (round 61 network logs: only the root-allowed `GET /api/cart`). Therefore:
>   - **If only the backend is down:** run §4.6 and record that it ran with the backend down. G62-3's token rows are then "not run (environment)" (§4.8).
>   - **If `:5173` is down:** write "not run (environment)" for every browser item.
>
> **Browse rules** (`backlog.harness_rules`, unchanged):
> - Never `$B restart`. Use a **new** `BROWSE_STATE_FILE` under your own round folder.
> - After one CLI-daemon failure, use the approved `server-node.mjs` fallback with `BROWSE_PARENT_PID=0`. Record its PID and log, and stop only your own process.
> - **GSTACK-NO-MOUSE:** every drag, Ctrl-click selection, held press and wheel uses standalone Playwright (installed chromium, fresh context, no install), labelled **REAL-mouse (PW)**. Plain clicks and keys use gstack (REAL).
>
> **Machine load:** record `tasklist | grep -ci node.exe` on every run.
> **Scratch junctions:** `cmd //c mklink /J …` / `cmd //c rmdir …` with stdin from `/dev/null`. Do not export `MSYS_NO_PATHCONV=1` for these calls.

## Why this round

**Round 61 result** (`c-round-61.md`, `c-round-61.json`): **C PASS, no bugs.**
- **Offline:** G61-2, R61-S, R61-U (a–f; r60 g/h/i; r58 a/d; r59 k killed), G61-1 (tsc 0; Biome 5/218/1; **89 / 1556**; build; verify rc 0 on attempt 1).
- **Browser** (1440×900 and 1280×720): MN-EDGE-FOCUS, MN-CONTEXT, MN-ITEM-PRESS, MN-REPEAT, MN-KEY-RELEASE, VSCROLL-CLOSE, MN-FOLLOW (also in the overflow layout), MN-DISMISS-BUTTON, MN-KEYS, SEL-KEYS.
- **G61-3:**
  - Anonymous `/studio-lab` (direct and via the header), 0 forbidden requests, token 401, `/studio/middle-east` asks to sign in.
  - **The fake Bearer gave 403 on 2026-10-18 (backend up) and 500 on 2026-10-19 (backend down).** Still fail-closed.
- **Closed by this evidence:** C-R60-01, C-R60-02, ROOT-R50-58-L1, A-R60-REVIEW-BLUR-CAPTURE-TEST.

**Why the group move:** stage 4a gave single moves and trims edge snapping (Live 12 §6.7: "Clips snap to the editing grid, as well as … the edges of other clips"). A selected group still snaps only to the grid (CM10, "a group move stays on the grid only"). C-R52-T1 showed that CM10 cannot tell the start-touch and end-touch cases apart. Stage 4c gives groups the same edges and replaces CM10.

## Baseline

Measured by B on 2026-10-19 (`b-round-61/gates.txt`).

**The content baseline decides; HEAD may differ.** Root may publish pending units (`cb12805` = rounds 50–58; rounds 59, 60, 61) before or during this round. Any of these is valid at the start:
- **(A)** HEAD `038ed5a45f94596a264c14c4ec834607cb407948`, `git status --short` **30 lines** (the round-61 end state: 29 lines + `?? doc 054`).
- **(B)** HEAD `cb128056…` (rounds 50–58 applied), `git status --short` **9 lines**: ` M` `StudioWorkspace.tsx`, `ArrangementGridMenu.tsx`, `grid.ts`, `grid-snap-menu.test.tsx`, `grid-snap-ui.test.tsx`; `??` `grid-snap-keys.test.tsx`, docs 052, 053, 054.
- **(C)** HEAD is a newer **root** commit that contains rounds 59–60 but not 61, and `git status --short` has **4 lines**: ` M` `StudioWorkspace.tsx`, `ArrangementGridMenu.tsx`, `grid-snap-menu.test.tsx`; `?? doc 054`.
- **(D)** HEAD is a newer **root** commit that contains round 61, and `git status --short` is **empty**.

**In every case:**
- **Frozen list:** `../tmp/studio-real-loop/b-round-61-r62-tree-sha256.txt`, **418** entries, all OK (run from `store/`). It covers every tracked and untracked `app/**` and `docs/implementation/**` file except the 4 owned files below. `ArrangementGridMenu.tsx`, `StudioWorkspace.tsx`, `grid-snap-menu.test.tsx` and doc 054 are now **frozen** at C's round-61 end hashes (`96779a7d`, `49ce77b0`, `839847b9`, `852bdbd5`).
- **Snapshots:** `../tmp/studio-real-loop/b-round-61-r62-snapshots/` with `SHA256SUMS.txt`. None of the 4 owned files may differ from its snapshot at the start:

  | File | sha256 prefix | EOL (CRLF / LF) | `it` |
  |---|---|---|---|
  | `app/lib/arrangement/grid.ts` | `46c9b656` | 0 / 184 | — |
  | `app/components/arrangement/ArrangementClip.tsx` | `0e711fae` | 0 / 694 | — |
  | `app/lib/arrangement/__tests__/grid-snap-clip-edges.test.tsx` | `9e26f133` | 0 / 738 | 31 |
  | `app/lib/arrangement/__tests__/grid-edges.test.ts` | `61d8615f` | 0 / 81 | 6 |

- **B's check:** the 4 owned files are unchanged since round 60 (they were in the round-61 frozen list, 418/418 OK at C's round-61 end). Protected 4/4 OK.
- **Anything else is a stop and report:** a frozen or snapshot mismatch, or a status that fits none of A/B/C/D.

**Other measurements:** `node.exe` 13. Full vitest at round-61 end: **89 files / 1556** (A and C rc 0). Biome `./app`: **5 / 218 / 1**. The 5 errors are the CRLF-only `format` errors on `StudioWorkspace.tsx`, `grid.test.ts`, `render-budget.test.tsx`, `app/lib/auth.ts` and `auth-bugs.test.ts`.

**Line endings:**
- All 4 owned files are LF and stay LF.
- `StudioWorkspace.tsx` and `grid.test.ts` are CRLF and **frozen**.
- Never run `biome check --write` / `format --write` / `npm run format`.

**Rules:**
- Do not revert, re-create or reformat anything. The work of rounds 47–61 stays.
- `.claude/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `AGENTS.md`, `biome.json`, `scripts/**`, the vitest/playwright configs and the agent files belong to root.
- Only root commits or pushes.

## 0. Scope

### 0.1 Rule D-29z27-G: a group move snaps its anchor to the grid or to the edges of other clips

**Terms.**
- **Group:** the selected clips moved together (`gesture.group`, 2+ ids).
- **Anchor:** the clip whose header is dragged (`gesture.original`).
- **Members:** the clips in `gesture.group.ids`.
- **Raw anchor start:** `original.start + dx / pxPerSecond`.

**G1. Candidates (Snap step not null).** The anchor's new start is the nearest of:
- (a) the grid line `snapTimeToGrid(raw, step)`;
- (b) every **start target** (the anchor start touches it);
- (c) every **end target − anchor duration** (the anchor end touches it); a negative result is dropped.

The targets come from **`clipEdgeTargets` over `gesture.before.clips` minus every member**, with the anchor's **placement lane** as `laneTrackId`:
- `hoverTrackId` for a cross-lane move;
- `original.trackId` for a same-lane move or a video anchor.

This is the round-53 lane rule (D-29z18), applied to the anchor:
- on the placement lane, a clip end is only a start target and a clip start only an end target;
- on every other lane, both edges count.

**Other members' edges are never candidates.** Neither their old positions (they move with the group) nor their new positions count. Only the anchor touches edges.

**G2. Distance and ties:** unchanged from 4a (`nearestGridOrEdge`). The comparison is in whole microseconds. On a tie the grid line wins, then the earlier edge. There is no pixel radius (D-29z17, C-R52-01 variant a).

**G3. Delta, precision and bounds.** Let `gridStart = snapTimeToGrid(raw, step)` and let `target` be the G1 winner.
- **If `target` equals `gridStart` in whole µs** (the grid wins), behaviour is **byte-identical to today**:
  - `requested` = `gridStart − anchorStart` rounded to whole ms, exactly as `groupDeltaOnGrid` does today (`roundGridTime` in `grid.ts` gives the same value);
  - `allowed = snapGroupDelta(anchorStart, rawDelta, step, minDelta, maxDelta)`.
- **Otherwise (an edge wins):**
  - `requested = Math.round((target − anchorStart) × 1e6) / 1e6` (whole µs; **never ms**, or a sub-ms butt join fails, as in CM12/CM16 for single moves);
  - `allowed = requested` if `minDelta − 1e-6 ≤ requested ≤ maxDelta + 1e-6`;
  - otherwise `allowed = snapGroupDelta(anchorStart, rawDelta, step, minDelta, maxDelta)`. This is today's grid fallback, unchanged: the nearest in-bounds grid line, else 0.
- **Known limitation (recorded, not changed this round; GROUP-SUBMS-GRID-EDGE):** an edge that lies exactly on the winning grid line takes the grid path. With a **sub-ms anchor**, the ms-rounded delta can then fall just outside the bounds. Example: anchor 6.0004 / 1, a same-lane neighbour at 8, raw 7.05 → the end touch 7 equals line 7 → `roundGridTime(0.9996)` = 1.0 > max 0.9996 → fallback 0. The µs path would give a clean join. This is today's behaviour, so it is not a regression. It needs a sub-ms anchor and a whole-ms edge on a grid line (demo assets are whole ms). Doc 055 records it under TODO.
- `gesture.blocked`, `GROUP_MOVE_BLOCKED_MESSAGE`, the cross-lane `planClipLaneMove(… timeDelta: requested)` and the refusal ghosts (`timeDelta: allowed`) keep their current code paths and meanings.

**G4. Unchanged:**
- Snap off → free (`roundTime(delta)`, clamped to bounds).
- Alt → bypass or enable, read per pointermove (`resolveSnapStep`).
- Shift time lock → `snapStep` null, delta 0.
- Keyboard nudge of a group.
- Single moves, trims, ranges, ruler, playhead, drop, brace.
- Overlap rules, `groupMoveBounds`, `moveClips` and `planClipLaneMove`. **`selection.ts` is frozen.**

**G5. Where (shape, not literal code):**
- **`grid.ts`:** one new exported pure helper, e.g. `snapGroupMoveDelta(anchorStart, anchorDuration, rawDelta, step, minDelta, maxDelta, startEdges, endEdges): { requested: number; allowed: number }`.
  - It implements G3 using the existing `snapTimeToGrid`, `snapMoveStartToGridOrEdges`, `snapGroupDelta` and `toWholeMicroseconds`.
  - No existing export changes its signature or behaviour.
  - The name follows `AGENT_DISCOVERABLE_CODE.md`.
- **`ArrangementClip.tsx`:** only the group branch of `handlePointerMove` (`groupDeltaOnGrid` and its call, l.111–128 and l.381–387).
  - With a non-null `snapStep`, build the targets from `gesture.before.clips` filtered to non-members, with `laneTrackId` = the placement lane above, and call the helper.
  - The null-`snapStep` path is unchanged.
- No new UI text, no new state, no new props.

**Rejected:**
- **Every member touches edges.** More candidates and a new priority rule that nobody asked for. C-R59-03 / doc 044 l.23 fixed the group rule as the anchor's rule.
- **Clamp an out-of-bounds edge to the bound.** It would silently butt a non-anchor member against its neighbour, i.e. a member-edge snap through the back door. The grid fallback keeps today's behaviour.
- **ms rounding of an edge delta** (sub-ms joins open by up to 0.5 ms; D-29z18/19).

### 0.2 C-R52-T1: CM10 is replaced and the group gets start-touch and end-touch targets

- **Narrow grant (C checks by AST):** only the **title and body of CM10** may change. Its new contract is "a group move lands the anchor end on a clip start of another lane".
- CG1–CG6 (§2.2) add the start-touch case, the member exclusion, sub-ms exactness, the bounds fallback, the cross-lane lane rule and Alt.

### 0.3 INFO-R55-FREE-ROUND-UNGUARDED: pin `roundTime` in the Snap-off single move

- **Test only (CM17).** The jsdom drags use whole pixels at 40 px/s, so `start + delta` is always a whole ms. That is why mutation `Math.max(0, start + delta)` survived round 55.
- CM17 sets the zoom to **30 px/s** after the mount, so a 10 px step is 0.3333… s, and expects 2.333.
- No source change: D-29z20 kept `roundTime` in the Snap-off branch on purpose.

### 0.4 A-R55-REVIEW-SHIFT-MIDDRAG-TEST: Shift only on the last step, and the Shift ghost

- **Test only (CM9f–CM9h).** These turn C's round-55 probes PS-MIDDRAG, PS-MIDDRAG-X and PS-GHOST into committed tests.
- **Source:** `c-round-55/scratch/mut/app/lib/arrangement/__tests__/c-probe-r55.test.tsx` l.744–766. Values from `c-round-55/runs/probes.txt` l.20–22 (round-55 tree).

### 0.5 Ableton (workflow addendum 2026-10-11)

**Source:** Live 12 Reference Manual, `https://www.ableton.com/en/live-manual/12/arrangement-view/`, §6.7 "Moving and Resizing Clips" and §6.10 "Using the Editing Grid". B capture `b-round-46/ableton-6.7-6.10-20261016.txt` (captured 2026-10-16; re-read by B 2026-10-19).
- The manual says nothing about multi-clip selections or the lane rule. No `/browse` capture beyond it exists.
- No video was watched and no Live installation was used.
- **C gives two verdicts per row:** the CZABA requirement, and Ableton conformance.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| A dragged clip snaps to the grid and to the edges of other clips | §6.7 (text) | **confirmed** for "dragging a clip" | now also for a selected group (anchor) | CM10, CG1, GE-START, GE-END |
| Which clip of a multi-selection snaps | — | **unconfirmed (no source)** | CZABA: only the anchor (the dragged clip); members' edges are not targets (D-29z27-G) | CG2, GE-MEMBER |
| Snap distance and grid-vs-edge priority | §6.7 does not say | **unconfirmed** | nearest wins (µs), tie → grid, then the earlier edge; no radius | CE8, CG1 |
| Out-of-bounds edge for a group | — | **unconfirmed (no source)** | CZABA: falls back to today's in-bounds grid line | CG4, GE-BOUNDS |
| Alt bypasses / temporarily enables | §6.10 (text) | **confirmed** | unchanged; also for group edges | CG6, GE-ALT |
| Shift keeps the time while changing lanes | — | **no source** | CZABA R8-M, unchanged | CM9f–CM9h |

Nowhere may a report claim "Ableton does the same" for the unconfirmed rows.

### 0.6 B rulings

- **C-R51-01 → closed by design (D-29z27-D), no code.**
  - C's round-59 probe showed the browser contract: a release on a blocked lane fires no `drop`, and `dragend.dropEffect` is `none`.
  - The refusal is carried while the user still holds the item: the red ghost text and the no-drop cursor (D-29z17 Q1). Nothing is added.
  - The user's request (`docs/video-to-text-bugs/transcripts/2.srt` 05:16–07:53) asks for grid divisions, Snap on/off and free placement. It does not ask for a status after a refused release.
  - The precedent INFO-R55-REFUSAL-STATUS-ON-RELEASE (accepted) is the same pattern: a refusal message lives for the duration of the gesture.
  - A post-release status would need `ArrangementLibrary` `onDragEnd` + `ArrangementContext` + the lane's ghost state (3 files) for a Low that nobody requested. Recorded as a deliberate CZABA behaviour. 4c-2 (round 63) re-runs LD-BLOCK as a regression.
- **C's round-61 deviation (browser rows run with the backend down): accepted.**
  - The network logs show `/studio-lab` makes no backend request apart from the root-allowed `GET /api/cart`.
  - **Limit:** the fake-Bearer **403** was verified only on 2026-10-18. The 2026-10-19 run gave 500 (backend down). G62-3 re-checks it with the backend up (§4.8).
- **Round-61 info items (recorded, not scheduled):**
  - **INFO-R61-XSPAN:** optional GM32-style inner-`<span>` press test. Goes to the menu Lows batch.
  - **INFO-R61-XLEAK = A-R61-REVIEW-LEAK-STATIC-ONLY:** the static add/remove-by-reference check stays a **standing C gate** whenever `ArrangementGridMenu.tsx` changes.
  - **A-R61-REVIEW-CLOSEST-SCOPE:** info.
  - **A-R61-ARCH-FOLLOW-AUTOSCROLL-DUP:** an architecture signal, filed with ROOT-R50-58-L5.
  - **INFO-R61-FAKEBEARER-500:** root/backend signal. `api.studio-token.ts` is protected; B cannot schedule it.

### 0.7 Source

| File | Change |
|---|---|
| `app/lib/arrangement/grid.ts` | §0.1 G5: one new exported pure helper. Nothing else changes. |
| `app/components/arrangement/ArrangementClip.tsx` | §0.1 G5: the group branch only (targets from non-members on the placement lane; the helper call). Nothing else changes. |

- **Frozen:** everything else, including `selection.ts`, `ArrangementLane.tsx`, `StudioWorkspace.tsx`, `ArrangementGridMenu.tsx`, `ArrangementContext.tsx`, `grid-snap-edit`, `grid-snap-ui`, `grid-snap-menu`, `grid-snap-keys`, `grid-snap-loop-drop`, `grid-snap-position`, `grid.test.ts` and docs 001–054.
- No comments, no `any`, no type assertions, no `@ts-ignore`; semicolons everywhere. No new UI text is needed.

### 0.8 What could be affected (C checks)

- **Single moves and trims (4a):** `moveStartOnGrid` and the trim path are untouched. CM1–CM16, CT1–CT9 and CM9–CM9e stay unchanged and pass.
- **Group grid snapping (stage 1 SN-GROUP, stage 2 R49-GROUP, PG-GROUP):** when the grid wins, the deltas are byte-identical (G3). This covers sub-ms members (PG-GROUP `s2` 8.0004).
- **Group bounds status and cross-lane group refusals** (`grid-snap-edit`, `selection.test.ts`): unchanged.
- **Expected suite: 89 files / 1569** (1556 + 13: CE7–CE9; CG1–CG6; CM9f–CM9h; CM17). CM10 is rewritten, not added.
  - `grid-snap-clip-edges` has **41** `it`;
  - `grid-edges` has **9**.

**Out of scope for the whole project:** plugins and effects; pitch; multiple video layers; audio time-stretch. Grid tempo (SRW-15) is never audio stretch. Musical divisions and triplets belong to SRW-14 stage 5, after the SRW-15 BPM. `/studio-lab` stays demo-only; purchase protection and the protected files stay unchanged.

## 1. Mandatory before acting (A)

1. **Read in full before the first edit:**
   - `.claude/rules/read-primitives.md`;
   - primitives `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md`, `AUDIO_ARCHITECTURE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`;
   - `prompts/studio-feature.md`, `prompts/new-test.md` and `docs/implementation/TEMPLATE.md`.

   Then run the `pre-flight` skill.
2. **Baseline before any edit:**
   - HEAD and `git status --short` → case A/B/C/D;
   - `sha256sum -c ../tmp/studio-real-loop/b-round-61-r62-tree-sha256.txt | grep -vc ': OK$'` → 0;
   - the snapshots' `SHA256SUMS.txt` and `cmp` for each owned file;
   - protected 4/4; Biome numbers; `node.exe`; both servers.
3. Post the pre-flight gate at the top of your report.

## 2. A: the change

### 2.1 Source

Implement exactly §0.1 and §0.7.

### 2.2 Tests

**`app/lib/arrangement/__tests__/grid-edges.test.ts` (LF).** The 6 existing `it` stay unchanged. Append a new `describe('SRW-14 stage 4c group move snaps the anchor to edges (D-29z27)')` with exactly:

| ID | Call | Must assert |
|---|---|---|
| CE7 | helper(`6.0004`, 2, `1.9`, step 1, min −6.0004, max +∞, `[]`, `[]`) | `{ requested: 2, allowed: 2 }` exactly (`toEqual`): the grid path keeps today's whole-ms delta for a sub-ms anchor |
| CE8 | (1) helper(2, 2, `4.05`, 1, −2, +∞, `[6.0004]`, `[]`); (2) helper(2, 2, `4.375`, 1, −2, +∞, `[6.75]`, `[]`) | (1) `requested` and `allowed` both `toBeCloseTo(4.0004, 9)` (start touch, exact µs; raw 6.05, edge at 0.0496, line 6 at 0.05); (2) `toEqual({ requested: 4, allowed: 4 })`: raw 6.375 is exactly 0.375 from line 6 and from the start target 6.75 (both binary-exact), and the tie goes to the grid |
| CE9 | helper(2, 2, `6.35`, 1, −2, **5**, `[]`, `[10.4]`) | `requested` `toBeCloseTo(6.4, 9)` (end touch: 10.4 − 2 − 2); `allowed` **=== 5** (out of bounds → `snapGroupDelta` fallback, which gives 5 here) |

Use `Infinity` for an unbounded `maxDelta`.

**`app/lib/arrangement/__tests__/grid-snap-clip-edges.test.tsx` (LF).**
- **No change** to the harness, `beforeEach`, `afterEach`, the helpers or any existing `it` **except CM10** (narrow grant §0.2: title + body only, same position).
- **Selecting a group:** as CM10 does today. Drag the first clip's header without moving, so it is selected. Then `pointerDown` with `ctrlKey: true` and `pointerId: 2` on the second header at its lane's y, then `pointerUp`. Assert `selectedClipIds` (sorted) before the drag.
- **Every group drag** uses `pointerId: 3`, the anchor `m1`, and `pressG()` first (Snap on, division 1). The only exception is CG6, which sets its Alt flag per step.

| ID | Fixture → drag of `m1` | Must assert |
|---|---|---|
| CM10 (rewritten) "a group move lands the anchor end on a clip start of another lane" | m1 music 2/2, s2 sfx 2/2, st1 stems 10.4/1.6; dx **254** (raw 8.35; grid 8 at 0.35; st1 start − 2 = 8.4 at 0.05) | m1 **8.4** and s2 **8.4** (`toBeCloseTo(…, 9)`); `undoLabel` `გადატანა (2)`; status `გადატანა (2): 2 კლიპი გადავიდა 00:06.400-ით მარჯვნივ.` (format from C's PG-GROUP probe, `c-round-55/runs/probes.txt` l.45) |
| CG1 start touch | m1 music 2/2, s2 sfx 2/2, st1 stems **5/3.4** (end 8.4); dx 254 | m1 8.4, s2 8.4; `undoLabel` `გადატანა (2)` |
| CG2 member edges are not targets | m1 music 2/2, s2 sfx **6.4/1**; dx **174** (raw 6.35; grid 6 at 0.35; s2's own old start 6.4 would be 0.05) | m1 **6**, s2 **10.4** |
| CG3 sub-ms exactness | m1 music 2/2, s2 sfx 2/2, st0 stems **0/6.0004**; dx **162** (raw 6.05; edge 6.0004 at 0.0496, grid 6 at 0.05) | m1 and s2 both `toBeCloseTo(6.0004, 9)`; m1 start `>=` st0's exact end − 1e-9 |
| CG4 out-of-bounds edge falls back to the grid | m1 music 2/2, s2 sfx 2/2, **s3 sfx 9.3/0.7** (s2's maxDelta 5.3), st1 stems 10.4/1.6; dx 254 (nearest = st1 end touch 8.4, delta 6.4 > 5.3) | m1 **7** and s2 **7** (`snapGroupDelta` → 5; **not** 7.3 = a clamp to the bound); s3 unchanged; `undoLabel` `გადატანა (2)` |
| CG5 cross-lane: the lane rule applies to the anchor's target lane | m1 music **2/4**, st2 stems **0/1**, st9 stems **12/0.5**; select m1 + st2; drag dx **256** with **y = STEMS_LANE_Y** (raw 8.4, end 12.4) | m1 on **stems** at **8** (st9's end 12.5 is not an end target on the placement lane); st2 on **sfx** at **6**; `undoLabel` `გადატანა (2)` |
| CG6 Alt with Snap on keeps a group free of grid and edges | the CM10 fixture; dx 254 with `altKey: true` on the step | m1 **8.35**, s2 **8.35** |

**SHIFT-MIDDRAG** (§0.4), appended to the round-55 `describe` (`… (C-R54-01, C-R54-02, D-29z20)`) after CM9e:

| ID | Fixture → steps (startX 250, as in the probes) | Must assert |
|---|---|---|
| CM9f Shift only on the last step, same lane | m1 music 6.0004/2; steps `[{ dx: 40 }, { dx: 40, shiftKey: true }]` | track `music`; start **=== 6.0004**; `undoLabel` null; status `კლიპის გადატანა: ცვლილება არ მოხდა — ისტორია არ შეიცვალა.` |
| CM9g Shift only on the last step, across lanes | m1 music 6.0004/2; steps `[{ dx: 40, y: STEMS_LANE_Y }, { dx: 40, y: STEMS_LANE_Y, shiftKey: true }]` | track `stems`; start **=== 6.0004**; `undoLabel` `გადატანა ხაზზე — სტემები`; status `გადატანა ხაზზე — სტემები: start 00:06.000.` |
| CM9h the Shift ghost sits at the exact start | m1 music 6.0004/2, st0 stems 0/6.0004; one step `{ dx: 40, y: STEMS_LANE_Y, shiftKey: true }` with `release: false`; read every `[data-testid="arrangement-lane-move-ghost"]`; then `pointerUp` (pointerId 1, clientX 290, STEMS_LANE_Y, `shiftKey: true`) | exactly one ghost, on lane `stems`, `data-blocked` `false`, `style.left` **`240.016px`**, `data-ghost-start` `6.000`; after the release: stems, start **=== 6.0004** |

**INFO-R55** (§0.3), appended to the first `describe` after CM11:

| ID | Steps | Must assert |
|---|---|---|
| CM17 a Snap-off move keeps a whole-millisecond start at a fractional zoom | m1 music 2/2; Snap stays **off** (assert `snapState` `off`); `act(() => live(api).setPxPerSecond(30))` and **assert `live(api).pxPerSecond` is 30**; drag dx **10** | start **=== 2.333** |

**Expected count:** vitest **89 files / 1569**; `grid-snap-clip-edges` **41** `it`; `grid-edges` **9** `it`.

### 2.3 Mutation proof (A, scratch only, outside `store/`)

Use a scratch copy with a `node_modules` junction and your own vitest config, as in round 61.
- **Run on:** `grid-edges`, `grid-snap-clip-edges`, `grid-snap-edit`, `grid-snap-ui`, `grid.test`, `selection.test`.
- Each mutation must fail at least the named tests. Restore after each one.

| # | Mutation | Must fail |
|---|---|---|
| a | the group branch ignores edges (today's `snapGroupDelta` only) | CM10, CG1, CG3 |
| b | start targets only (end targets dropped) | CM10 |
| c | end targets only (start targets dropped) | CG1 |
| d | only the anchor excluded (members' old edges kept) | CG2 |
| e | an edge delta rounded to whole ms | CG3, CE8 |
| f | an out-of-bounds edge is clamped to `[minDelta, maxDelta]` instead of the fallback | CG4, CE9 |
| g | the placement lane is always `original.trackId` | CG5 |
| h | the grid path uses µs instead of today's ms rounding | CE7 |
| i | `roundTime` removed from the Snap-off branch of `moveStartOnGrid` | CM17 |
| j | the time lock reads Shift only on the first moved step (later steps reuse `gesture.timeLocked`) | CM9f, CM9g |
| k | the Shift path rounds the kept start to whole ms (`roundTime(original.start)`) | CM9f, CM9g, CM9h |

**Re-runs on the new tree (4a):**
- 4a "no edges for single moves" (`moveStartOnGrid` → `snapTimeToGrid` only) → CM1;
- 4a lane rule dropped (`clipEdgeTimes` for every lane) → CM14;
- D-29z19 delta in ms in `planClipLaneMove`. `selection.ts` is frozen, so this one runs in scratch only → CM16.

**Rules:**
- Write `a-round-62/mutations.txt` with the command, each result line and the failing test names.
- If a mutation survives, **strengthen that test** within §2.2. Do not add tests outside the list.
- **Spec-assumption stop:** if any §2.2 assertion fails on the **unmutated** tree, stop and report to B; do not rewrite the assertion. Examples:
  - CM9f–CM9h differ from C's probe values;
  - `setPxPerSecond(30)` does not read back 30;
  - CG4 gives 7.3;
  - any existing `it` other than CM10 fails.

### 2.4 After the change

- **Self-check:**
  - `npx tsc --noEmit` → 0;
  - full `npx vitest run` → **89 / 1569, 0 failures**;
  - `npm run build` → rc 0.
- **Biome:**
  - read-only `npx biome check ./app` → ≤ 5 errors (only the baseline CRLF list), ≤ 218 warnings, 1 info;
  - the 4 owned files → 0 diagnostics.
- **Review:** run the real `code-reviewer` subagent on the diff and put its findings and dispositions in the report.
  - **Architecture notes** go to B (`a-round-62.md` §6), not into code. The snap-preference and edge plumbing is a known signal (ARCH-CHECKPOINT-SRW14-PREFS).
  - Reviewer items outside §0 go to B; they are not fixed this round.
- **`/check`:** `npm run verify` → exit 0, run quietly, with no PW probe in parallel. Do not run `npm run test:e2e:smoke`; that is root's.
- **Browser smoke (`:5173` up):** one gstack load of `/studio-lab` at 1440×900. Confirm the workspace and badge render and the network has no forbidden request. This is not a PASS claim.

### 2.5 Doc 055

New file `docs/implementation/2026/quarter-IV/055-studio-lab-grid-group-move-edges.md`. Georgian, with technical terms in English, per `TEMPLATE.md` and `GEORGIAN_DOCS.md`. Sections:
- **Date, status** (`Round 62 — D-29z27; C-ის შემოწმებას ელოდება`), **changed project**;
- **Context:** Live §6.7; CM10's old contract; C-R52-T1; INFO-R55; SHIFT-MIDDRAG;
- **Approach:** G1–G5;
- **Alternatives:** every member touches edges; a clamp to the bound; ms rounding (all rejected, §0.1);
- **The C-R51-01 ruling** (closed by design, §0.6) in one paragraph;
- **Changed files; problems and solutions; testing** (CE7–CE9, CM10, CG1–CG6, CM9f–CM9h, CM17, mutations a–k, gates);
- **Ableton** (the §0.5 table);
- **TODO:** round 63 (4c-2 library-drop edges); the ARCH checkpoint; GROUP-SUBMS-GRID-EDGE (the §0.1 G3 known limitation).

## 3. File ownership (exact; nothing else may change)

### 3.1 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `app/lib/arrangement/grid.ts` | A | §0.1 G5 (one new exported helper) |
| `app/components/arrangement/ArrangementClip.tsx` | A | §0.1 G5 (the group branch only) |
| `app/lib/arrangement/__tests__/grid-edges.test.ts` | A | CE7–CE9 appended |
| `app/lib/arrangement/__tests__/grid-snap-clip-edges.test.tsx` | A | CM10 rewritten; CG1–CG6, CM9f–CM9h, CM17 added (§2.2) |
| `docs/implementation/2026/quarter-IV/055-studio-lab-grid-group-move-edges.md` | A | new (§2.5) |
| `../tmp/studio-real-loop/a-round-62.md`, `a-round-62/` | A | report, gate output, scratch, own browse state |
| `../tmp/studio-real-loop/c-round-62.md`, `c-round-62.json`, `c-round-62/` | C | report, runs, shots, gates, own browse state |

**Expected `git status --short` at the end** (the owned files keep their start status codes; all four are ` M` or `??` in case A):
- **Case A: 31 lines** (the 30 start lines + `?? doc 055`).
- **Case B: 13 lines** (the 9 start lines, which already include ` M grid.ts`; plus ` M` `ArrangementClip.tsx`, `grid-edges.test.ts`, `grid-snap-clip-edges.test.tsx`, all tracked in `cb12805`; plus `?? doc 055`).
- **Case C: 9 lines** (the 4 start lines + ` M` for the 4 owned files + `?? doc 055`).
- **Case D: 5 lines** (` M` for the 4 owned files + `?? doc 055`).

The rule in every case: **no path outside §3.1 may appear or change.** The frozen list must stay 418/418 OK.

### 3.2 Frozen this round

- Everything in `b-round-61-r62-tree-sha256.txt` and everything else under `store/`.
- **Forbidden to modify** (C checks the first four by sha256 against `protected-baseline.json`):
  - `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
  - `app/lib/auth.ts`, `app/lib/__tests__/bug-hunting/**`, `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`;
  - `components/studio/**`, `components/ui/**`, `components/layout/**`, `components/animations/**`;
  - `root.tsx`, `entry.server.tsx`, `entry.client.tsx`, `app/styles/**`, `lib/sfx-*`, `app/routes/**`;
  - firebase, R2, auth and purchase code;
  - `public/**`, `package.json`, the lockfile;
  - `.claude/**`, `AGENTS.md`, `CLAUDE.md`, `.agents/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `.husky/**`, `scripts/**`, `e2e/**`;
  - the playwright and vitest configs, `../backend/**`, env/config files, the sitemap, `app/data/studio-lab-demo.ts`;
  - the other roles' files under `../tmp/studio-real-loop/`, and root's `../tmp/studio-remote-reconcile/**`, `../tmp/studio-root-r49/**` and `root-publish/**`.
- **Also not allowed:**
  - new dependencies or installs;
  - deleting files or tests;
  - git commit, stash, checkout, push or deploy;
  - reverting earlier work;
  - in-place mutation of `store/` files for experiments;
  - killing processes you did not start;
  - starting or stopping the dev server or the backend;
  - `npm run format`;
  - deleting `playwright-report/`, `store/nul` or `a-round-61/scratch/` (root's call).

## 4. Acceptance (C)

**Checkpoint order:** G62-2 → R62-S → R62-U → G62-1 → G62-3 → §4.6 → §4.7.
- Write `c-round-62/checkpoint.md` as you go.
- Check both servers at the start, after the offline items and before the report, and record each check. Do not start them.

### 4.1 R62-S — static (read-only)

- **`diff -u` against the snapshots:**
  - **`grid.ts`:** only the new exported helper. Every existing function is byte-identical.
  - **`ArrangementClip.tsx`:** only the group branch (`groupDeltaOnGrid` and its call site). `moveStartOnGrid`, the single-move path, the trim path, `finishGesture` and the Shift path are byte-identical.
  - **Tests:** the existing `it` are AST-identical, except CM10 (title + body only). Use C's `asteq-it.cjs` or an equivalent, with a negative control. CE7–CE9, CG1–CG6, CM9f–CM9h and CM17 are present with the §2.2 fixtures.
- **Banned patterns:** no `any`, assertions, `@ts-ignore`, comments or hardcoded colours. No `.skip`, `.only`, `.todo`, `retry`, `vi.setConfig` or per-`it` numeric timeouts.
- **EOL:** all owned files LF.
- **Tree:** frozen list 418 OK; protected 4/4. Doc 055 exists with the §2.5 sections.

### 4.2 R62-U — unit and mutation (C's own scratch, own strings)

- **Mutations a–k and the §2.3 re-runs:** re-run them in your own scratch with your own edits. Each must kill its named tests.
- **C extras (info), suggested:**
  - (n) the tie goes to the edge → CE8 must kill it;
  - (p) the targets come from `clipEdgeTimes` with no lane rule (same lane included) → expected to be killed by CG5 or to survive. Record which;
  - (q) the members are excluded only on the anchor's lane → CG2 must kill it.
- **Durations:** run `grid-snap-clip-edges` alone and record it. A test over 3 s alone is info.

### 4.3 G62-1 — gates

- tsc 0; build passes.
- **Biome:** read-only `./app` within the baseline; owned files 0 diagnostics.
- **vitest = 89 files / 1569, 0 failures** (quiet). Record `node.exe`.
- **`npm run verify` exit 0**, quietly, with at most two quiet attempts, each recorded. If neither gives rc 0, G62-1 is FAIL.
- Record any `Test timed out` with file, test and ms.

### 4.4 G62-2 — tree

- Protected 4/4 OK; frozen 418 OK.
- `git status --short` matches §3.1 for the observed case; record HEAD at start and end.

### 4.5 Not run, or not testable

- **If `:5173` is down:** write "not run (environment)" for §4.6 and §4.7.
- **Sub-ms exactness:**
  - It is browser-testable only if a `/studio-lab` asset has a duration that is not a whole ms (as CX-NOTE in round 55).
  - Otherwise CG3 is unit-only. Say which.

### 4.6 Browser acceptance (`:5173` up) — REAL-mouse (PW), 1440×900, then the starred rows at 1280×720

**Setup and oracle.**
- Fresh page, demo ready. Snap via REAL `g`, division via REAL `select` (or the lane menu).
- Record every clip's `start`, `duration` and `trackId` before each drag (`window.__c` or the `data-clip-*` attributes).
- **Group selection:**
  - REAL click on the first clip's header;
  - **Ctrl**+REAL click on the second clip's header;
  - check that both are selected;
  - then drag the **first** clip's header (the anchor).
- **Oracle for every GE-* row, computed by C from the recorded values before the drag:**
  1. The anchor's new start is the nearest (ties → grid, then earlier) of:
     - the grid line for `raw = start + dx / pxPerSecond`;
     - every **start target**;
     - every **end target − anchor duration**.

     The targets come from non-members, with the lane rule on the anchor's placement lane.
  2. Every member moves by the same delta, unless the bounds fallback applies.
- Write the oracle's candidate list in the run log.
- **Ctrl+Z after each row** restores all members. Record the start values after Ctrl+Z.

| ID | Steps | Pass |
|---|---|---|
| GE-START* | Make a group of `Soft impact` + one other non-music audio clip (add `Slow rise` from the library to an empty lane with Snap off, away from the music clip). Division **10**, Snap on. Drag `Soft impact` so its raw start is ≈ 0.4 s before the music clip's start (EG-1's +104 px from 4.000) | `Soft impact` lands **exactly on the music clip's start**; the other member moves by the same delta; status `გადატანა (2): 2 კლიპი გადავიდა …-ით მარჯვნივ.` (verbatim); Undo `გადატანა (2)`; Ctrl+Z restores both |
| GE-END | The same group. Drag so that the anchor's raw **end** is within 0.2 s before another lane's clip start, nearer than any grid line and start target (C picks it from the oracle) | the anchor's end = that clip's start (`< 1e-6`); same delta for both |
| GE-MEMBER | Group `Soft impact` + `Slow rise` with `Slow rise`'s **old** start within 0.2 s of the anchor's raw start after the drag, and no other target nearer than the grid line | the anchor is **not** captured by `Slow rise`'s old edge (it lands on the grid line or on a real non-member target, per the oracle) |
| GE-BOUNDS | A group where the nearest edge would push a member into a lane neighbour (C builds it from the library) | both land on the oracle's in-bounds grid fallback; during the drag the status shows `ჯგუფის გადატანა შეჩერდა — მეზობელი კლიპი ან დროის დასაწყისი.`; nothing overlaps |
| GE-CROSS | Group of two audio clips on adjacent lanes; drag the anchor one lane down with an edge on the target lane in reach | the ghosts and the commit follow the oracle with the lane rule on the target lane; status `გადატანა (2): start …` (verbatim) |
| GE-ALT / GE-OFF | GE-START with Alt held through the drag / with Snap off | free: raw ± 0.025 s; no edge capture |
| GE-PLAY (real audio) | After GE-START: Video Mute, REAL ruler click before the anchor (Snap on), REAL Space; sample the anchor's track meter (round-51 LP-DROP / PL-1 method) | the anchor's meter is −∞ until the readout is ≥ new start − 0.05 and rises by ≤ new start + 0.15; the second member is audible at its new start too |
| EG-REG* (4a regression) | `tasks/round-55.md` EG-1, EG-LINE, EG-CROSS, LN-TOUCH (single moves) | as written there (single moves unchanged) |
| EG-GROUP (re-stated) | `tasks/round-55.md` EG-GROUP fixture (`Soft impact` + the music clip, +104 px, division 10) | **the old "no edge capture" sentence is superseded by D-29z27.** Pass = the oracle above (the music clip is a member, so its edges do not count). Record both starts and the status |

### 4.7 Carried items

- **Round 61 regressions:** none required. The menu files are frozen and unchanged by this round.
- **INFO-R61-XLEAK** is a standing static gate only when `ArrangementGridMenu.tsx` changes; it does not change this round, so record "not applicable".

### 4.8 G62-3 — anonymous workspace and purchase protection

Use a fresh browse state, as in G61-3.
- **Workspace:** `/studio-lab`, opened directly and via the header link, shows the workspace with the demo badge.
- **Network:** no requests to `/api/studio-token`, `/api/recording-*`, `/api/download` or R2, and no `Authorization` header from workspace code. This includes every §4.6 run.
- **Sign-in gate:** `/studio/middle-east` shows "Sign in required".
- **Token rows (backend `:5199` must be up):**
  - an anonymous `/api/studio-token?product=middle-east&file=mix.mp3` returns **401**;
  - a fake Bearer returns **403** (re-check after round 61's 500).
  - **If the backend is down, both are "not run (environment)", not PASS.** Record the codes either way.
- **Known and allowed:** root `GET /api/cart`, GA consent-denied events, GTM, dev modules, the homepage Unsplash image, Google Fonts.

### 4.9 Not run this round, and carried items (honest)

**Not run this round in any case:**
- video sync and C-R27-01 (RF3-1, RF3-2, R5-L6);
- the full find → add → fit video → export flow with WAV checks;
- the FB-01..FB-16 stage regression;
- `npm run test:e2e:smoke` (root);
- the round 57–61 menu browser re-run.

**Open C items:**
- **This round:** C-R52-T1, INFO-R55-FREE-ROUND-UNGUARDED, A-R55-REVIEW-SHIFT-MIDDRAG-TEST.
- **Round 63 (4c-2):** library-drop edges. LD-BLOCK is re-run there as a regression of the C-R51-01 ruling.
- **C-R41-01** (TL-Q-VIEWPORT).
- **Tech Lead:** C-R27-01, C-R6-02, C-R8-01 (quiet Chrome); C-R23-01 + C-R38-01.

**Open Low / info (batched after 4c unless Medium+):**
- **General:** R26-M1, A-R34-REVIEW-RESIDUALS, DEMO-SFX-FULL-SCALE, L3-REMOVED-TRACK-TAPS, SETTRACKMIX-NAN-IDENTITY, BIOME-HOOKS-DEPS, VIDEO-CLIP-TRANSLUCENT-GRID, DETAIL-RESET-SHRINK, SHIFT-BEFORE-DOWN-NOTE.
- **Rounds 49–55:**
  - R49-OUTWARD-TRIM-SHRINK, R49-WIDE-DIVISION-RANGE;
  - A-R51-REVIEW-BRACE-NO-RIGHT-BOUND, A-R51-REVIEW-STALE-ALT-GHOST, ABLETON-LOOP-KEYS-NOT-REQUESTED, R51-ALT-NATIVE-DRAG;
  - A-R52-REVIEW-VIDEO-DRAG-EDGES, A-R52-REVIEW-EDGES-PER-MOVE;
  - A-R53-REVIEW-NEG-MICRO-BAND, INFO-R53-NARROW-GAP;
  - A-R54-REVIEW-LOWS.
- **Grid-menu batch:**
  - A-R57-REVIEW-TAB-BODY-FOCUS, A-R57-REVIEW-CONTEXTMENU-KEY, A-R57-REVIEW-PAGE-TRANSITION;
  - A-R58-REVIEW-ANDROID-TAP-CLICK (Tech Lead, touch);
  - C-R59-02 (accepted);
  - A-R59-REVIEW-END-INDEX, A-R59-REVIEW-REANNOUNCE, A-R59-REVIEW-PUNCTUATION;
  - A-R60-REVIEW-GK11-EXPORT-STATUS;
  - INFO-R60-FOCUS-RETURN, INFO-R60-SHIFT1-SYNTH;
  - INFO-R61-XSPAN, A-R61-REVIEW-CLOSEST-SCOPE.
- **Architecture:** ROOT-R50-58-L5 + A-R61-ARCH-FOLLOW-AUTOSCROLL-DUP.

**`root-pre-push-review.md`** (mtime 2026-10-18 12:46:34, unchanged):
- **Video sync:**
  - RF3-1, RF3-2 and R5-L6 (C-R27-01) are open.
  - **Partially measured:** R5-L3.
  - **Unit tests only:** R5-L5, R5-E1, R6-S2, R6-S3.
- **Medium:**
  - M1: the loop refill is rAF-only, so a hidden tab goes silent.
  - M2: the per-frame `position` in the context value re-renders every consumer.
- **Lows:** L1–L4 and L6–L8.
- **`root-review-r50-58.md`:** L1–L4 closed by C (rounds 60–61); L5 architecture.

**`publication-checkpoint.json`** (mtime 2026-10-17 11:11:24, unchanged):
- SRW-21: the purchased loader hardcodes `middle-east`; do not claim that every product's stems work.
- Portable instruction paths.
- The SRW-23 scrollbar check at 1280×720 and 1440×900.
- SRW-11/12 library and stems parity.
- T12 continuation.

**Root items:**
- ROOT-COMMIT-ROUND51 / the publisher: `cb12805` + rounds 59, 60 and 61 are separate units. `root-claude-checkpoint.md` says the publisher has never run.
- ARCH-CHECKPOINT-SRW14-PREFS (§6.3) and ARCH-CHECKPOINT-SRW13.
- GSTACK-ACL, GSTACK-NO-MOUSE, ENV-BROWSE-DAEMON.
- The CRLF Biome errors on the auth files.
- The stray `store/nul`; the git autocrlf warning on LF files.
- INFO-R61-FAKEBEARER-500.

**Tech Lead manual checks:** the earlier list (R23-1, R23-2, R38-T, R35-T, R30-T, R31-T, R33-T, R34-T, TL-Q-FB05-FB11, TL-Q-VIEWPORT, R47-T, R49-T, R50-T, R51-T, R52-T, R57-T, R58-T, R59-T, R60-T, R61-T), plus **R62-T:**
- Select two clips (click, then Ctrl+click), turn Snap on and drag one of them slowly past another track's clip. It "clicks" onto that clip's start or end, and the other selected clip moves by the same amount.
- Hold Alt during the same drag: no clicking onto edges or grid lines.
- Drag a group so that one of the selected clips would run into a neighbour on its own track: the group stops on a grid line and the status explains why.

## 5. Commands

A pastes the real output tails into the report:

```bash
cd C:/Apps/czaba-project/store
git rev-parse HEAD
git status --short
sha256sum -c ../tmp/studio-real-loop/b-round-61-r62-tree-sha256.txt | grep -vc ': OK$'
(cd ../tmp/studio-real-loop/b-round-61-r62-snapshots && sha256sum -c SHA256SUMS.txt)
for f in app/lib/arrangement/grid.ts app/components/arrangement/ArrangementClip.tsx app/lib/arrangement/__tests__/grid-snap-clip-edges.test.tsx app/lib/arrangement/__tests__/grid-edges.test.ts; do cmp -s "$f" "../tmp/studio-real-loop/b-round-61-r62-snapshots/$(basename $f)" && echo "$f same" || echo "$f changed"; done
npx vitest run app/lib/arrangement/__tests__/grid-edges.test.ts app/lib/arrangement/__tests__/grid-snap-clip-edges.test.tsx app/lib/arrangement/__tests__/grid-snap-edit.test.tsx app/lib/arrangement/__tests__/grid-snap-ui.test.tsx app/lib/arrangement/__tests__/selection.test.ts --reporter=verbose
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app
npx biome check app/lib/arrangement/grid.ts app/components/arrangement/ArrangementClip.tsx app/lib/arrangement/__tests__/grid-edges.test.ts app/lib/arrangement/__tests__/grid-snap-clip-edges.test.tsx
npm run verify
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
tasklist | grep -ci node.exe
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5173/studio-lab
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5199/api/products
```

C re-runs the gates itself. **Dev server (C):** use the running `http://127.0.0.1:5173`; do not start or stop servers.

## 6. Requests to root (non-gating for A)

1. **Start the backend (`:5199`) before A starts, and keep both servers up through C round 62.** It has been down since the 2026-10-19 machine restart (C round 61; B 11:15 +04). G62-3's token rows need it.
2. **Commit units** (all interim checkpoints, not a release; only via root's publisher flow; never by hand):
   - **Rounds 50–58:** the pending `cb12805` bundle — C-ready.
   - **Rounds 59 and 60:** ready, each as its own unit.
   - **Round 61:** **ready** (C PASS, no bugs; 3 owned files + doc 054).
   - **Round 62:** only after C.
   - `root-claude-checkpoint.md` (2026-10-18) says `root-publisher.cmd` has never run. Starting it is the user's action.
3. **ARCH-CHECKPOINT-SRW14-PREFS — re-requested.** (a)(b)(c) have no recorded answer. For (d), root already said "one bounded task; keep for now" in `root-review-r50-58.md` (2026-10-18); it is re-raised only because A-R61 found the duplicated Follow check. Please run the bounded read-only frontend-architect checkpoint (`store/.claude/references/architecture-checkpoint.md`). Questions:
   - (a) the snap-preference plumbing versus a non-history edit-preferences slice;
   - (b) one time-precision rule (`roundTime` ms, `roundGridTime` ms, `toWholeMicroseconds`, `planClipLaneMove` µs). **Round 62 adds one more ms/µs boundary (G3)**;
   - (c) the shared grid test harness;
   - (d) `useArrangementGridMenu` + `isFollowAutoScroll` (A-R61-ARCH-FOLLOW-AUTOSCROLL-DUP, ROOT-R50-58-L5): still keep-for-now, or schedule?

   **Answer format:** keep/extract, value, risk, ≤ 3 sentences each. An approved change becomes its own B task with one owner and behaviour-preserving tests. **4c-1/4c-2 do not wait for the answer.**
4. **INFO-R61-FAKEBEARER-500:** with the backend unreachable, a fake Bearer gets 500 instead of 403/503. It is still fail-closed. `api.studio-token.ts` is protected, so it is root's decision.

## 7. Reports and next

**A → `../tmp/studio-real-loop/a-round-62.md`:**
1. the pre-flight gate and the §1.2 baseline (case A/B/C/D);
2. the diff summary per file with EOL counts;
3. the CE/CG/CM tests, each with its alone duration;
4. mutations a–k and the re-runs;
5. smoke;
6. code-reviewer findings, dispositions and any Architecture note;
7. verbatim command tails, including `node.exe` and `npm run verify`;
8. deviations.

Do not claim PASS. On a stop condition, stop and report; do not widen or narrow the change.

**C → `c-round-62.md` and `c-round-62.json`** (usual schema).
- Each ID gets one of: PASS; FAIL with a bug ID; or **not run** with the reason (harness / environment / not testable).
- Cover R62-S, R62-U, G62-1, G62-2, G62-3, §4.6 and the Ableton rows, with two verdicts each.
- `passed` lists only IDs run this round.
- State **commit readiness** for root, separately for round 62, round 61, rounds 59–60 and rounds 50–58.

**Next (orientation only):**
- **Round 63: SRW-14 stage 4c-2** — the library drop's ghost and drop start snap to clip edges:
  - same G1/G2 rules; the dragged item's duration from `getLibraryDragSource()`; no exclusion; the lane rule on the drop lane;
  - `dragged === null` → grid only; the video lane stays refused;
  - LD-BLOCK as the C-R51-01 regression.
- **Then:** SRW-14 stage 4 closes; SRW-15 (+ SRW-14 stage 5), SRW-16 (FB-10), SRW-17 (FB-12), SRW-18 (FB-06), SRW-19 (FB-07), SRW-20; the batched Lows; SRW-21; full regression and root review; T12.

**Loop runner:** if `run-loop.ps1` stopped on a `-RoundLimit`, restart it with `-StartRound 62 -StartPhase A` and a higher limit.
