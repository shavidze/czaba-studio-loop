# CURRENT TASK — Round 51: SRW-14 stage 3b (FB-13) — library drop and loop brace follow the grid (drop ghost + drop start; brace move/resize drag; brace arrow keys)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-17
- Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09; Ableton-source addendum 2026-10-11; periodic commits 2026-10-13; behavioural reverse-engineering 2026-10-14; architecture checkpoint; user priority 2026-10-15 Grid/Snap).
- Decision record: **D-29z16** in `docs/technical/studio-real-workspace/plan.md`. Rationale: `b-round-50.md`.
- Round size: **one feature stage** — stage 3b, the second half of stage 3 (3a = round 50, C PASS). It contains no bug fixes: C found no product bug in round 50, and the one reviewer Low (A-R50-REVIEW-CLIP-CANCEL-SEEK) belongs to `ArrangementClip.tsx`, which stage 4 (round 52) reopens.

> **Environment (root, not BLOCKED):** `http://127.0.0.1:5173/studio-lab` → see `b-round-50/gates.txt`. If it is down, root restarts it. No agent starts or stops it.
>
> **Browse rules** (`backlog.harness_rules`):
> - Never run `$B restart`.
> - Use a **new** `BROWSE_STATE_FILE` under your own round folder.
> - After **one** CLI-daemon failure, use the approved `server-node.mjs` fallback, started from `tmp/studio-real-loop/` with `BROWSE_PARENT_PID=0`. Record the PID and log; stop only your own process.
> - **GSTACK-NO-MOUSE:** gstack has no mouse down/move/up, no held modifier during a click and no double-click. **HTML5 drag from the library, brace drags and every Alt case use standalone Playwright** (installed chromium, fresh context, no install), labelled **REAL-mouse (PW)**; never call it gstack. This is still a deviation pending root/user acceptance. Plain clicks and key presses use gstack (REAL).
> - **Fixture rule (new, C-R50-N1):** keep click/drag targets out of the 8 px trim and loop-edge zones (0.2 s at 40 px/s). Brace **moves** start at the bar centre; **resizes** start at the edge centre (edges are `w-2`).
> - **Lane REAL clicks:** click the lane element with `$B click` and log the real `clientX` with a read-only listener (an injected child marker is ignored by `target === currentTarget`).
>
> **Machine load:** record `tasklist | grep -ci node.exe` on every A and C run. If a test times out under load, re-run that file alone and report both runs.

## Why this round

**Round 50 result** (`c-round-50.md`, `c-round-50.json`): **C PASS** on every ID it ran; **no product bug**.
- Ran: R50-S, R50-U (A's (a)–(r) and C's (q), (s), (t1) all killed), R50-RULER, R50-DRAG (DR-PLAY: audio restarts at 10.000), R50-LANE, R50-CLIP, R50-PASTE, R50-PLAY (PL-1: SFX audible at 4.022 vs PL-OFF silent to 3.990), R50-REG, REG-HYD, G50-1 (84 / 1438, `npm run verify` exit 0), G50-2, G50-3.
- **Closed:** C-R49-01 (SE20), C-R49-02 (SE21).
- **Info:** C-R50-N1 (B's CL-EDGE fixture sat in the trim zone → the new fixture rule above); C-R50-N2 (a playhead drag during playback restarts audio on each line → R50-T / R51-T).
- **Commit:** round 50 is **not committed yet**. C's commit readiness: 7 paths, HEAD `038ed5a`. Root commits it; round 51 is valid either way (see Baseline).

**What stage 3b delivers (FB-13; user transcript `2.srt` 05:16–07:53: "clip movement and the play position must follow the chosen grid … a free mode too"):**
- With Snap on, a sound **dropped from the library** lands on a grid line, and the drop ghost shows that line before release.
- The **loop brace** moves and resizes on grid lines, and its ←/→ keys step line to line (Live 6.6).
- **Alt** bypasses snapping when Snap is on and temporarily enables it when Snap is off (Live 6.10; same rule as stages 2–3a).

## Baseline

B measured on 2026-10-17 (`b-round-50/gates.txt`, `tsc.txt`, `vitest-focus.txt`, `biome-app.txt`, `biome-app-errors.txt`).

**Content baseline (round 50 is uncommitted):** one of these must hold.
- **(A)** HEAD `038ed5a45f94596a264c14c4ec834607cb407948` and `git status --short` lists **exactly** the 7 round-50 paths:
  ```
   M app/components/arrangement/ArrangementClip.tsx
   M app/components/arrangement/ArrangementRuler.tsx
   M app/components/arrangement/StudioWorkspace.tsx
   M app/lib/arrangement/__tests__/grid-snap-edit.test.tsx
   M app/lib/arrangement/grid.ts
  ?? app/lib/arrangement/__tests__/grid-snap-position.test.tsx
  ?? docs/implementation/2026/quarter-IV/046-studio-lab-grid-snap-stage-3a.md
  ```
- **(B)** HEAD is a newer **root** commit whose message/stat contains exactly those 7 paths, and `git status --short` is empty.

In both cases:
- **Frozen list:** `../tmp/studio-real-loop/b-round-50-r51-tree-sha256.txt` → all OK (run from `store/`; the count is in `gates.txt`). It holds every tracked `app/**` and `docs/implementation/**` file plus the two untracked round-50 files, minus the 3 owned tracked files below.
- **Snapshots** (`../tmp/studio-real-loop/b-round-50-r51-snapshots/`, `SHA256SUMS.txt` inside): `ArrangementLane.tsx` (LF, 922 lines), `ArrangementLoopBrace.tsx` (LF, 227), `StudioWorkspace.tsx` (**CRLF**, 1668/1668; it already contains the round-50 ruler/lane edits). Hashes are in `SHA256SUMS.txt` and `gates.txt`.
- **Root-commit tolerance (case B):** the frozen list and snapshots were generated at 12:42 +04, before any root commit. If root edits doc 046 while committing round 50 (as it fixed doc 045 in round 49), `sha256sum -c` mismatches confined to `docs/implementation/2026/quarter-IV/046-studio-lab-grid-snap-stage-3a.md` are root's: record them as foreign (with the new hash) and continue. A mismatch under `app/**`, or a root commit with any path beyond the 7, is still a stop.
- Anything else (another HEAD, extra paths, a snapshot or frozen mismatch) → **stop and report**.

Other measurements (`gates.txt`):
- protected 4/4 OK; tsc 0; focused vitest (see `vitest-focus.txt`);
- full vitest = C's G50-1 on this tree: **84 files / 1438**;
- Biome `./app`: see `biome-app.txt` (expected 5 / 218 / 1). All errors are CRLF-only `format` errors on: `StudioWorkspace.tsx`, `grid.test.ts`, `render-budget.test.tsx`, `app/lib/auth.ts`, `app/lib/__tests__/bug-hunting/auth-bugs.test.ts`.

**Line-ending rule (A and C):**
- `StudioWorkspace.tsx` stays **CRLF**; `ArrangementLane.tsx` and `ArrangementLoopBrace.tsx` stay **LF**; the new test and doc 047 are LF.
- **Never** run `npx biome check --write` on `StudioWorkspace.tsx`. Check its format on an LF copy in scratch (`tr -d '\r'` + `biome format`, which must report no changes). The two LF owned files are checked with `npx biome check <file>` and must report 0 diagnostics.
- Count EOLs with node (`/\r\n/g` vs `/\n/g`), not `grep -c $'\r$'` (false counts in Git Bash, A-R50 §7.3).
- Diff against the snapshots with `diff -u --strip-trailing-cr`.
- Line-ending churn is a finding; the 5 baseline CRLF `format` errors are not.

**Rules:**
- Do not revert, re-create or reformat anything; the round 47–50 grid code stays as it is.
- `.claude/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `AGENTS.md`, `biome.json`, `scripts/**` and the agent files belong to root.
- Only root commits or pushes.

## 0. Scope

### 0.1 Library drop — `app/components/arrangement/ArrangementLane.tsx` (one hunk + import)

- `libraryDropStart` (l.174–179) returns `resolveGridTime(libraryDropTime({...unchanged}), snapSeconds, gridSeconds, event.altKey)`.
- The lane already receives `snapSeconds` / `gridSeconds` (l.83–84, 97–98; `StudioWorkspace` l.1571–1572), so no prop change is needed.
- `handleLibraryDragOver` (ghost start and `canPlaceLibraryClip`) and `handleDrop` (`dropLibrarySource`) both call `libraryDropStart`, so **the ghost equals the drop by construction**. Alt is read from each `dragover` sample and from the `drop` event (Q1).
- The `grid` import line gains `resolveGridTime`. Nothing else in the file changes: no new state, effect, prop, message or export. The file-drop (`Files`) path is unchanged.

### 0.2 Loop brace — `app/components/arrangement/ArrangementLoopBrace.tsx`

- `ArrangementLoopBraceProps` gains two **optional** props: `snapSeconds?: number | null` (default `null`) and `gridSeconds?: number` (default `undefined`). A render without them (for example frozen `gesture-guard.test.tsx` l.98) behaves exactly as today.
- **Drag** (`handleLoopPointerMove`, l.118–135), after the unchanged threshold check:
  - `move`: `moveLoop(before, resolveGridTime(roundLoopTime(original.start + delta), snapSeconds, gridSeconds, event.altKey))`. The **start** snaps and the length is kept, like a clip move (R47).
  - `start` / `end`: `resizeLoop(before, kind, resolveGridTime(roundLoopTime(original[kind] + delta), snapSeconds, gridSeconds, event.altKey))`. The **dragged edge** snaps.
  - **Snap first, then clamp** (Q2). `moveLoop` / `resizeLoop` keep doing the clamping (time 0, `MIN_LOOP_LENGTH` 0.1 s). A clamped edge can therefore end off the grid, as for trim (F1 / SE20).
  - The order of `roundLoopTime` and `resolveGridTime` is A's choice, as long as SL1–SL14 hold.
- **Release:** `finishLoopGesture` is **unchanged**. It commits the last preview, so Alt counts as it was on the **last `pointermove`** (Q3; same as clip move/trim).
- **Arrow keys** (`handleLoopKeyDown`, l.152–160):
  - **Snap off** (`snapSeconds === null`): unchanged (±`LOOP_KEY_STEP_SECONDS`).
  - **Snap on:** `kind = event.shiftKey ? 'end' : 'move'`; `current = kind === 'end' ? loop.end : loop.start` (read from `getArrangement().loop`); `target = adjacentGridLine(current, snapSeconds, direction)`.
    - If `target !== null` → `stepLoopRange(kind, target - current)`.
    - If `target === null` (no line below time 0) → call the existing Snap-off path `stepLoopRange(kind, -LOOP_KEY_STEP_SECONDS)`. That shows the existing `LOOP_STEP_BLOCKED_MESSAGE` when nothing can move; there is no new string.
  - Alt does not change the keys (Q4, as clip nudge R47).
- No new state, effect, listener, export or status text. `ArrangementContext.tsx` (`stepLoopRange`, `previewLoopArrangement`, `commitLoopRange`), `loop.ts` and `grid.ts` are frozen. The `grid` import (`adjacentGridLine`, `resolveGridTime`) is new.

### 0.3 Workspace — `app/components/arrangement/StudioWorkspace.tsx` (one spot, CRLF kept)

- `<ArrangementLoopBrace seconds={timelineSeconds} pxPerSecond={pxPerSecond} />` (l.1556) gains `snapSeconds={snapEnabled ? gridSeconds : null}` and `gridSeconds={gridSeconds}`. These are the same expressions the ruler (l.1535–1536) and the lanes (l.1571–1572) use.
- Wrap the JSX as Biome requires, keeping CRLF.
- **Nothing else** in `StudioWorkspace.tsx` changes: no import, state, ref, effect, shortcut or status text. The global clip-nudge handler already skips the brace (`isLoopBraceTarget`, l.1244).

### 0.4 B decisions recorded for this round (D-29z16)

- **Q1 — drop:**
  - The ghost and the drop share one function, so the ghost's start equals the dropped clip's start.
  - Alt is read from the event (each `dragover`, then `drop`).
  - If the snapped start overlaps a clip, the drop is refused with today's ghost text (` · აქ ადგილი არ არის`) and status (`LIBRARY_DROP_BLOCKED_MESSAGE`), even when the unsnapped position would fit. CZABA does not search for a free spot (smallest honest rule; Alt gives the free position).
- **Q2 — brace drag:**
  - Move snaps the start; resize snaps the dragged edge.
  - Snap then clamp: the same order as trim (round 49 F1, pinned by SE20).
  - A snapped preview equal to the original commits nothing (no Undo entry), because `commitLoopRange` already ignores an unchanged arrangement.
- **Q3 — Alt on a brace drag:** read from each `pointermove`; release commits the last preview. This differs from the playhead handle (round 50 re-reads on `pointerup`) and matches clip move/trim. Recorded, not changed.
- **Q4 — brace keys:**
  - With Snap on, ← → move the start to the adjacent line (length kept); Shift + ← → move the end to the adjacent line (clamped to start + 0.1).
  - With Snap off: ±0.1 s, unchanged.
  - Live 6.6 ties the brace's arrows to the grid; this is why the brace differs from the playhead's ±0.1 s (round 50 P3).
- **Q5 — not added:** Live's ↑/↓ (shift by loop length), Ctrl + ↑/↓ (double/halve) and Ctrl + ← → (length by grid; CZABA uses Shift).
  - The user transcripts do not ask for them, so they are recorded as a backlog signal (ABLETON-LOOP-KEYS-NOT-REQUESTED). This is not a deferred user request.
  - Tech Lead may ask (R51-T).
- **Q6 — unchanged paths:**
  - Ctrl+L builds the loop from the current range, and the range already follows the grid (stage 2).
  - "＋ დამატება" / Enter adds at the current position, which already follows the grid (stage 3a).
  - Neither changes.
- **ARCH-CHECKPOINT-SRW14-PREFS** is still unanswered. Round 51 adds the brace as the fourth prop consumer of the snap triple. B renews the request (`b-round-50.md` §6). Non-gating.

### 0.5 Unchanged / out of this round

**Frozen (in the frozen list):**
- source: `ArrangementContext.tsx`, `loop.ts`, `library.ts`, `grid.ts`, `ArrangementClip.tsx`, `ArrangementRuler.tsx`, `ArrangementLibrary.tsx`;
- every existing test file, including `gesture-guard.test.tsx`, `track-layout.test.tsx`, `loop.test.ts`, `library.test.ts` and all `grid-snap-*`;
- docs 001–046.

**Not this round (scheduled, not deferred):**
- **Round 52 — stage 4:**
  - clip-edge snap (Live 6.7);
  - right-click division menu on lanes (user, transcript 07:00);
  - narrow/widen keys (Live 6.10 Ctrl+1/2);
  - A-R50-REVIEW-CLIP-CANCEL-SEEK;
  - R49-OUTWARD-TRIM-SHRINK / R49-WIDE-DIVISION-RANGE review.
- Then stage 5 after SRW-15; SRW-16..20; the Lows (C-R48-01, R26-M1, …); SRW-21; full regression and root review; T12.

**Out of scope for the whole project:** plugins and effects (compressor, limiter, normalise); pitch; multiple video layers; audio time-stretch. Grid tempo (SRW-15) is never audio stretch.

**What could be affected (C checks):**
- library drop with Snap off (free, today's behaviour);
- the drop ghost texts (refused on video, not ready, blocked);
- file drops on the video lane;
- loop brace drag with Snap off;
- the brace's threshold, Undo labels and status;
- the second-pointer guard on the brace;
- loop playback (wrap point) while dragging;
- Ctrl+L, clip nudge (brace focus excluded), ruler/lane snapping from round 50;
- render cost;
- SSR/hydration.

## 1. Mandatory before acting (A)

1. **Read in full before the first edit:**
   - `.claude/rules/read-primitives.md`;
   - primitives `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `AUDIO_ARCHITECTURE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`;
   - `prompts/studio-feature.md`, `prompts/new-test.md`, `docs/implementation/TEMPLATE.md`.

   Then run the `pre-flight` skill.
2. **Baseline before any edit:**
   - HEAD and `git status --short` → case (A) or (B) above;
   - `sha256sum -c ../tmp/studio-real-loop/b-round-50-r51-tree-sha256.txt | grep -vc ': OK$'` → 0;
   - `cmp` each of the 3 owned files with its snapshot, and `(cd ../tmp/studio-real-loop/b-round-50-r51-snapshots && sha256sum -c SHA256SUMS.txt)`;
   - protected 4/4; Biome numbers; `node.exe`.
3. **Read:**
   - `ArrangementLoopBrace.tsx` (all);
   - `ArrangementLane.tsx` l.1–260 and l.740–790 (ghost render);
   - `grid.ts` (all);
   - `StudioWorkspace.tsx` l.255–270, l.1240–1266, l.1530–1575;
   - read-only: `loop.ts` (`moveLoop`, `resizeLoop`) and `ArrangementContext.tsx` `beginLibraryDrag` / `getLibraryDragSource` / `dropLibrarySource` (l.1200–1268), `previewLoopArrangement` / `commitLoopRange` / `stepLoopRange` (l.1443–1492);
   - `gesture-guard.test.tsx` (brace fixture, `beginLibraryDrag('song')`), `track-layout.test.tsx` l.740–784 (`DragEvent` stub, `dataTransfer` shape), `grid-snap-position.test.tsx` (mount harness);
   - `b-round-46/ableton-arrangement-view-20261016.txt` (6.6) and `b-round-50/ableton-browser-20261017.txt` (4.10).
4. Post the pre-flight gate at the top of your report.

## 2. A: the change

### 2.1 Source

Exactly §0.1–§0.3. Code rules:
- no comments, no `any`, no type assertions, no `@ts-ignore`;
- semicolons;
- no reformatting of unrelated lines;
- no new exports.

### 2.2 Tests

**New file `app/lib/arrangement/__tests__/grid-snap-loop-drop.test.tsx`.**

**Harness:**
- Mount `StudioWorkspace` under `ArrangementProvider`, as in `grid-snap-position.test.tsx`. Copy the stubs; do not import them.
- **Library drag:** reuse the gesture-guard way to get a **ready** drag source (`beginLibraryDrag(<ready source id>)` through the live API, or a real `dragStart` on a library option if the harness renders one). Fire `dragOver` / `drop` on the lane body (`[data-track-id=X] [data-grid-seconds]`) with `dataTransfer = { types: [LIBRARY_DRAG_MIME], … }` and the `DragEvent` stub from `track-layout.test.tsx`. If the harness cannot produce a ready source, **stop and report**; do not change the context or a helper.
- **Brace:** the initial arrangement has a loop (state A's fixture). Use `pointerDown` on the bar/edge test ids and `pointerMove` / `pointerUp` on the brace. Read the span from the brace `aria-label` (`Loop 00:13.000 — 00:14.800 · …`), from the status and from the Undo button `title`.
- jsdom rects are 0. State the time ↔ x mapping you use (40 px/s from `arrangement-zoom-readout`).
- **Fixtures:** loop **12.3–14.1** unless a case says otherwise (off-grid on purpose); drop target lane `sfx`, free after 7 s.

| ID | Case | Expected |
|---|---|---|
| SD1 | Snap off; dragOver then drop at 9.4 s | ghost text starts `00:09.400`, ghost `left` = 9.4 × 40 px; clip start 9.4; status `„<title>“ დაემატა <lane> ხაზზე 00:09.400-ზე.` |
| SD2 | Snap on 1 s; dragOver at 9.4 (read the ghost), drop at 9.4 | ghost `00:09.000`, `left` 360 px, `data-blocked="false"`; clip start **9.000**; status `… 00:09.000-ზე.`; one Undo entry `დამატება — <title>` |
| SD3 | Snap on; dragOver and drop with `altKey: true` at 9.4 | ghost and clip 9.4 |
| SD4 | Snap off, division 0.25; dragOver and drop with `altKey: true` at 9.4 | ghost and clip **9.5**; `data-snap="off"` stays |
| SD5 | Snap on; dragOver with `altKey: true` (ghost 9.4), then drop **without** Alt at 9.4 | clip **9.000** (the drop event decides, Q1) |
| SD6 | Snap on; a position where the unsnapped clip fits but the snapped one overlaps an existing clip. Easy constructions: division **5 s** with a clip at 4–6 and a raw drop at ~6.2 (snapped 5 overlaps for any duration), or an off-grid fixture clip 3.9–5.9 with a 2 s source and a raw drop at 1.6 (snapped 2 → 2–4 overlaps). A states the fixture | ghost `data-blocked="true"` with ` · აქ ადგილი არ არის`; drop refused: status exactly `აქ ადგილი არ არის — ერთ ხაზზე კლიპები ერთმანეთს არ ფარავს.`, clip count and Undo unchanged; the same drop with Alt succeeds at the free position |
| SD7 | Snap on; dragOver on the video lane at 9.4 | ghost `00:09.000 · აუდიო ვიდეოხაზზე არ ემატება`; drop adds nothing |
| SL1 | Snap off; drag the brace bar +10 px (→ 12.55) | preview and commit 12.55–14.35; Undo `Loop-ის დიაპაზონი` |
| SL2 | Snap on 1 s; drag the bar +10 px; read before release, then release | **13.000–14.800** before and after; status `Loop: 00:13.000 — 00:14.800.`; one Undo entry |
| SL3 | Snap on; the same drag with `altKey: true` on the moves | 12.55–14.35 |
| SL4 | Snap off, division 0.25; bar +10 px with `altKey: true` | **12.5–14.3** |
| SL5 | Snap on; end edge +22 px (14.1 → 14.65) | end **15**, start 12.3 unchanged |
| SL6 | Snap on; end edge −66 px (14.1 → 12.45; the line is 12; the minimum is 12.4) | end **12.4** (snap then clamp, off the grid); status `Loop: 00:12.300 — 00:12.400.` |
| SL7 | Snap on; loop 0.3–1.5, bar −30 px (raw −0.45) | **0–1.2** |
| SL8 | Snap on; loop 12–14 (on the grid), bar +8 px (raw 12.2 → line 12) | loop stays 12–14; **no** Undo entry (Undo title unchanged) |
| SK1 | Snap off; focus the brace, ArrowRight | 12.4–14.2 (±0.1 unchanged) |
| SK2 | Snap on 1 s; ArrowRight, ArrowLeft, ArrowLeft | 13–14.8, then 12–13.8, then 11–12.8; one Undo entry per key (`commitHistory` does not merge entries; prove it with three Ctrl+Z steps back to 12.3–14.1) |
| SK3 | Snap on; Shift+ArrowRight from 12.3–14.1 | end **15**; then Shift+ArrowLeft → end **14** |
| SK4 | Snap on; loop 0–1.2, ArrowLeft | loop unchanged; status exactly `Loop ვეღარ გადაიწევს: დროის დასაწყისი ან მინიმალური სიგრძე.`; no Undo entry |
| SK5 | Snap on; loop 12.3–12.9, Shift+ArrowLeft twice | end 12.4 (clamped), then unchanged with the blocked status |
| SK6 | Snap on, division 0.25; ArrowRight from 12.3 | start **12.5** (end 14.3) |
| SK7 | Snap on; a clip selected and the brace focused, ArrowRight | the brace moves; the clip does not (the global nudge skips the brace) |

**Red/green:**
1. Write the tests first and run them against the snapshot sources (scratch copy outside `store/` containing the 3 snapshot files) → `a-round-51/red-run.txt`.
2. Expected on the snapshots (nothing snaps there):
   - **green:** SD1, SD3, SL1, SL3, SK1, SK4 (at 0 the old ±0.1 path is already blocked), SK7;
   - **red:** SD2, SD4, SD5, SD6 (the unsnapped drop fits), SD7 (ghost text), SL2, SL4, SL5, SL6, SL7 (raw −0.45 clamps to 0 anyway — **state** whether it is green or red and why), SL8 (the raw preview moves), SK2, SK3, SK5 (the first press gives 12.8), SK6.
   - Explain every difference.
3. Then the green run → `a-round-51/green-run.txt`.

**A's mutations** (scratch copy outside `store/`; remove the `node_modules` junction with `cmd /c rmdir` only; `MSYS_NO_PATHCONV=1`) → `a-round-51/mutations.txt`:

| # | Mutation | Must fail |
|---|---|---|
| (a) | ghost snapped, drop unsnapped (snap only in `handleLibraryDragOver`) | SD2 |
| (b) | drop snapped, ghost unsnapped | SD2 |
| (c) | drop ignores Alt | SD3, SD4 |
| (d) | Alt taken from the last `dragover` (stored) instead of the `drop` | SD5 |
| (e) | brace move snaps the **end** instead of the start | SL2 |
| (f) | brace drag unsnapped | SL2, SL5 |
| (g) | brace drag ignores Alt | SL3, SL4 |
| (h) | resize snaps the clamped result (snap applied after `resizeLoop`) | SL6 |
| (i) | brace keys stay ±0.1 with Snap on | SK2 |
| (j) | brace keys step by `snapSeconds` (± one division from the current value) instead of to the adjacent line | SK2 or SK6 |
| (k) | `StudioWorkspace` passes `snapSeconds={gridSeconds}` to the brace regardless of Snap | SL1, SK1 |
| (l) | `target === null` → return without calling `stepLoopRange` | SK4 |
| (m) | brace keys snap even with Snap off using `gridSeconds` | SK1 |

If any survives, strengthen the test (never the code) and report it.

**Test rules:** no `any`, no `@ts-ignore`, no type assertions (`instanceof` guards), no comments; exact strings from the source or rendered output; no snapshot tests; no fake timers.

### 2.3 After the code

- **Self-check:** the frozen suites of §4.8, then the full `npx vitest run` → **85 files / 1438 + your new `it` count, 0 failures**.
- **Biome:**
  - Follow the line-ending rule.
  - Read-only `npx biome check ./app` → ≤ 5 errors, each a CRLF-only `format` error on the baseline list; warnings ≤ the baseline in `gates.txt`; 1 info.
  - `npx biome check` on the new test, `ArrangementLane.tsx` and `ArrangementLoopBrace.tsx` → 0 diagnostics.
  - `npx biome lint app/components/arrangement/StudioWorkspace.tsx` → 0.
- **Review:** run the `code-reviewer` agent on the diff. If your session cannot spawn subagents, say so; root runs it. Report the findings and your dispositions. **Architecture notes** go to B (`a-round-51.md` §5), not into the code.
- **Browser smoke** (one run, gstack, fresh state under `a-round-51/`; not a PASS claim): `/studio-lab` 1440×900 → `g` → focus the brace (REAL click after creating a loop with Ctrl+L from a range) → ArrowRight → the aria-label shows a whole-second start.
- **`/check`:** `npm run verify` → exit 0. Do not run `npm run test:e2e:smoke` (root only).

## 3. File ownership (exact; nothing else may change)

### 3.1 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `app/components/arrangement/ArrangementLane.tsx` | A | §0.1 only (`libraryDropStart` + the grid import) |
| `app/components/arrangement/ArrangementLoopBrace.tsx` | A | §0.2 only |
| `app/components/arrangement/StudioWorkspace.tsx` | A | §0.3 only (brace props; CRLF) |
| `app/lib/arrangement/__tests__/grid-snap-loop-drop.test.tsx` | A | new (§2.2) |
| `docs/implementation/2026/quarter-IV/047-studio-lab-grid-snap-stage-3b.md` | A | new (§3.3) |
| `../tmp/studio-real-loop/a-round-51.md`, `a-round-51/` | A | report, gate output, own browse state |
| `../tmp/studio-real-loop/c-round-51.md`, `c-round-51.json`, `c-round-51/` | C | report, runs, shots, gates, own browse state |

**Expected `git status --short` at the end:**
- case (A): the 7 round-50 paths of §Baseline **plus**:
  ```
   M app/components/arrangement/ArrangementLane.tsx
   M app/components/arrangement/ArrangementLoopBrace.tsx
  ?? app/lib/arrangement/__tests__/grid-snap-loop-drop.test.tsx
  ?? docs/implementation/2026/quarter-IV/047-studio-lab-grid-snap-stage-3b.md
  ```
  (`StudioWorkspace.tsx` is already in the 7.)
- case (B): those 4 lines plus ` M app/components/arrangement/StudioWorkspace.tsx`.

The frozen list at the end must be all OK. If root changes something meanwhile, record it as foreign and do not touch it.

### 3.2 Frozen this round

- Everything in `b-round-50-r51-tree-sha256.txt`, and everything else under `store/`.
- **Forbidden to modify.** C checks the first four by sha256 against `protected-baseline.json`:
  - `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
  - `app/lib/auth.ts`, `app/lib/__tests__/bug-hunting/**`, `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`;
  - `components/studio/**`, `components/ui/**`, `components/layout/**`, `components/animations/**`;
  - `root.tsx`, `entry.server.tsx`, `entry.client.tsx`, `app/styles/**`, `lib/sfx-*`, `app/routes/**`;
  - firebase/R2/auth/purchase code;
  - `public/**`, `package.json`, the lockfile, `.claude/**`, `AGENTS.md`, `CLAUDE.md`, `.agents/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `.husky/**`, `scripts/**`, `e2e/**`;
  - the playwright and vitest configs, `../backend/**`, env/config files, the sitemap, `app/data/studio-lab-demo.ts`;
  - the other roles' files under `../tmp/studio-real-loop/`, and root's `../tmp/studio-remote-reconcile/**` and `../tmp/studio-root-r49/**`.
- **Also not allowed:**
  - new dependencies or installs;
  - deleting files or tests;
  - git commit, stash, checkout, push or deploy;
  - reverting earlier work (the uncommitted round-50 changes are work to keep);
  - in-place mutation of `store/` files for experiments;
  - killing processes you did not start;
  - starting or stopping the dev server;
  - `npm run format`.

### 3.3 Doc 047

`docs/implementation/2026/quarter-IV/047-studio-lab-grid-snap-stage-3b.md`, per `TEMPLATE.md` and `GEORGIAN_DOCS.md`.

**Header:** date; status `Round 51 — D-29z16; C-ის შემოწმებას ელოდება`; the project.

**Sections:**
- **კონტექსტი:** FB-13, 3b after 3a.
- **მიდგომა:** Q1–Q6.
- **არქიტექტურა:** one Mermaid diagram — `dragover`/`drop` → `libraryDropStart` → `resolveGridTime` → ghost/`dropLibrarySource`; brace `pointermove` → `resolveGridTime` → `moveLoop`/`resizeLoop` → preview; key → `adjacentGridLine` → `stepLoopRange`.
- **შეცვლილი ფაილები**, **პრობლემები და გადაწყვეტები**, **ტესტირება** (including the REAL-mouse (PW) method note and that HTML5 drag in PW/CDP is not an OS drag).
- **The §4.9 Ableton table.**
- **TODO:** stage 4, A-R50-REVIEW-CLIP-CANCEL-SEEK, stage 5, R50-T, R51-T, ABLETON-LOOP-KEYS-NOT-REQUESTED.

Docs 001–046 are frozen.

## 4. Acceptance (C)

**Viewport and setup:** 1440×900, and 1280×720 where named; fresh load. **Layout L51** = L50:
- the demo video at 0;
- `სრული მიქსი` on music at 7–23;
- `Soft impact` on SFX at 4–6;
- Master 0 dB;
- zoom 40 px/s unless stated.

**Loop fixture LF:** with Snap **off**, make a body range on the music clip from ~11.3 to ~14.1 (REAL-mouse (PW)), then REAL Ctrl+L. Record the exact span from the brace aria-label; the cases below use it.

**Harness rules:**
- **REAL** = `$B click` / `$B press` / `$B type`.
- **REAL-mouse (PW)** = `page.mouse` / `page.keyboard`. Use it for HTML5 drags (library option → lane; record whether Chromium delivered `dragover`/`drop` from the PW mouse), brace drags and every Alt case.
- **SYNTHETIC** (labelled) = dispatched events or `.focus()`. Never use it for the acceptance IDs below. If PW cannot deliver a native HTML5 drag or Alt during it, mark that ID **not run (harness)** with the evidence, not PASS.
- **Reads:** brace `aria-label`, the drop ghost text and `left`, `data-blocked`, `data-clip-start`, `data-snap`, `data-grid-seconds`, the status line, the Undo button title, the transport readout. `window.__c` only for reads, if the setup chain provides it.
- No source instrumentation. Mutations only in a scratch copy outside `store/`. Record `node.exe` on every run.

**Checkpoint order if the session may end:** G51-2 → R51-S → R51-U → R51-DROP → R51-LOOP → R51-KEYS → R51-PLAY → R51-REG → the rest. Write `c-round-51/checkpoint.md` as you go.

### 4.1 R51-S — static (read-only)

- `diff -u --strip-trailing-cr` each owned file against its snapshot, and `git diff`. Changes only where §0.1–§0.3 allow, with no EOL churn:
  - `ArrangementLane.tsx`: the import and `libraryDropStart`; LF;
  - `ArrangementLoopBrace.tsx`: the import, the 2 optional props + defaults, the move sample, the key handler; `beginLoopGesture`, `finishLoopGesture`, `endStaleLoopGesture` and the JSX are byte-identical; LF;
  - `StudioWorkspace.tsx`: only the brace JSX; CRLF = line count; the round-50 hunks are unchanged against the snapshot.
- Frozen list all OK; protected 4/4.
- Banned content in the diff and the new test: no `any`, `@ts-ignore`, `as` assertion, `//` comment, hardcoded colour, new export, fake timers or snapshots.

### 4.2 R51-U — unit tests and mutations

- The new file is green. A's red run matches §2.2; otherwise A explains each difference.
- The frozen suites of §4.8 are green.
- C re-runs A's mutations (a)–(m) in its own scratch copy; each must fail its named test.
- **C extras:**
  - **(n):** the brace re-snaps on `pointerup` from the release `clientX` (Alt of the up event), committing a value different from the last preview → expected to fail SL3 or SL2 if the release x differs; C designs the release so it does. If no committed test catches it, record it as a test gap (Low), not a product bug.
  - **(o):** the drop ghost's `left` uses the raw time while its text uses the snapped one → must fail SD2.

### 4.3 R51-DROP (REAL-mouse (PW): library option → lane)

| ID | Steps | Expected |
|---|---|---|
| LD-OFF | Snap off; drag `Slow rise` (or `Soft impact`) from the library onto SFX at ~9.4 s; read the ghost before releasing | ghost and clip at the free time (9.4 ± 0.025) |
| LD-1 | REAL `g`; same drag | ghost text `00:09.000`; clip `data-clip-start` **9.000**; status `„…“ დაემატა SFX ხაზზე 00:09.000-ზე.` (record exact); Undo `დამატება — …`; REAL Ctrl+Z removes it |
| LD-ALT | Snap on; Alt held through the drag (`keyboard.down('Alt')` before the move) | free 9.4 ± 0.025, if PW delivers Alt on the drag events (record `altKey` seen by a read-only `dragover` listener); otherwise **not run (harness)** |
| LD-ALT-ON | Snap off, division 0.25 (REAL select); Alt drag to ~9.4 | 9.5 (same harness condition) |
| LD-BLOCK | Snap on, division **5** (REAL select); drop on SFX at ~6.2 s (raw start after `Soft impact` 4–6 fits; snapped 5 overlaps). Record the arithmetic and the source duration | ghost `data-blocked="true"` with ` · აქ ადგილი არ არის`; no clip; status `აქ ადგილი არ არის — …` |
| LD-VIDEO | Snap on; drag onto the video lane | ghost `… · აუდიო ვიდეოხაზზე არ ემატება` at a whole second; nothing added |
| LD-1280 | LD-1 at 1280×720 | same |

### 4.4 R51-LOOP (REAL-mouse (PW))

| ID | Steps | Expected |
|---|---|---|
| LB-OFF | Snap off; drag the brace bar (centre) +10 px | free (start + 0.25 ± 0.025), length unchanged |
| LB-MOVE | Snap on 1 s; bar +10 px, read before release, release | start on the nearest whole second to (start + 0.25), length unchanged, before and after; status `Loop: …`; Undo `Loop-ის დიაპაზონი` |
| LB-ALT | Snap on; Alt held through the drag | free |
| LB-ALT-ON | Snap off, division 0.25; Alt drag | start on a 0.25 line |
| LB-END | Snap on; end edge (centre) +22 px | end on the whole second nearest to (end + 0.55); start unchanged |
| LB-CLAMP | Snap on; end edge dragged left to ~start + 0.15 | end = start + 0.100 (clamped, off the grid); record the status |
| LB-SAME | Snap on; brace moved to whole seconds first (LB-MOVE), then bar +6 px | no change and no new Undo entry |
| LB-1280 | LB-MOVE at 1280×720 | same |

### 4.5 R51-KEYS (REAL: `$B click` on the brace, then `$B press`)

| ID | Steps | Expected |
|---|---|---|
| LK-OFF | Snap off; ArrowRight | +0.1 s |
| LK-1 | Snap on 1 s, LF loop; ArrowRight, ArrowLeft, ArrowLeft | the start goes to the next / previous whole-second lines; the length is kept; one Undo entry each |
| LK-SHIFT | Snap on; Shift+ArrowRight, then Shift+ArrowLeft | the end goes to the next / previous whole second; the start is unchanged |
| LK-ZERO | Snap on; move the brace to start 0 (keys), then ArrowLeft | unchanged; status `Loop ვეღარ გადაიწევს: დროის დასაწყისი ან მინიმალური სიგრძე.` |
| LK-025 | division 0.25; ArrowRight | the start goes to the next 0.25 line |
| LK-CLIP | select `Soft impact` (REAL click on its header), then click the brace and ArrowRight with Snap on | the brace moves; `Soft impact` stays at 4 |

### 4.6 R51-PLAY — real audio

| ID | Steps | Expected |
|---|---|---|
| LP-LOOP | Video Mute (REAL). LF loop; Snap on; drag the end edge (PW) to the next whole second E. REAL ruler click 1 s before E (snapped), REAL Space. Sample the transport readout every 25 ms with the read-only `h30` source-start hook (round 30 / 50 method) | the readout wraps from ≤ E + 0.05 back to the loop start; the music source restarts at the wrap with `offset = loopStart − 7`; it never runs to the raw (unsnapped) end; stop with Space |
| LP-LOOP-ALT | the same with Alt held on the edge drag (end off the grid, E′) | the wrap happens at E′ (contrast) |
| LP-DROP | Video Mute. Snap on: drop `Soft impact` on SFX at ~9.4 → 9.000. Snap on: REAL ruler click at ~8.4 → 8.000. REAL Space; sample the SFX track meter (PL-1 method) | the SFX source `when` ≈ 1.0 s after start; the SFX meter is above −∞ from readout ≥ 8.95 and ≤ 9.15 |
| LP-DROP-OFF | the same with Snap off at drop time (clip at ~9.4) | the meter stays −∞ until readout ≥ 9.35 (contrast) |

### 4.7 R51-REG — directly related regressions

- **REG-HYD:** fresh load at 1440×900, console for 3 s → no hydration-mismatch, React or `useLayoutEffect` warning. Record the C-R23-01 NUL count and offsets.
- **Round-50 spot checks**, one run each:
  - RU-1 (ruler 7.3 → 7);
  - LA-1 (empty lane 4.6 → 5);
  - CL-RANGE (7.3 → 9.6 → {7, 10}), then REAL Ctrl+L → the brace shows `Loop 00:07.000 — 00:10.000`.
- **Clip nudge:** with Snap on and `Soft impact` selected (focus not on the brace), ArrowRight → 5.000 (R47 NU-1).
- **G toggle and division texts** are unchanged.
- **Render cost:** `render-budget.test.tsx` is green in the full run; `gesture-guard.test.tsx` (second pointer on the brace) is green.

### 4.8 Gates and frozen suites

**G51-1:**
- tsc 0;
- vitest = **85 files / 1438 + the new `it` count, 0 failures** (record `node.exe`; re-run a timed-out file alone and report both runs; a recurrence of C-R48-01 is recorded under that ID);
- build passes;
- Biome `./app` read-only within the baseline (errors only the CRLF list); the new file and the two LF owned files 0 diagnostics; `biome lint StudioWorkspace.tsx` 0;
- **`npm run verify` exit 0**.

**G51-2:**
- protected 4/4 OK; frozen list all OK;
- `git status --short` = §3.1 for case (A) or (B);
- HEAD at the start and at the end (if root commits round 50 during the round, record the hash and check that the commit contains exactly the 7 round-50 paths).

**G51-3 (anonymous workspace and purchase protection), fresh browse state:**
- `/studio-lab` direct and via the header link shows the workspace with the demo badge;
- no request to `/api/studio-token`, `/api/recording-*`, `/api/download` or R2, and no `Authorization` header from workspace code (including during a library drop);
- anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → 401;
- `/studio/middle-east` → "Sign in required".

Known and allowed: the root `GET /api/cart`, GA consent-denied events, GTM, dev modules, the homepage Unsplash image, Google Fonts.

**Frozen suites** (A self-check, C G51-1): the new file; `grid-snap-position`; `grid-snap-edit`; `grid`; `grid-snap-ui`; `loop`; `library`; `gesture-guard`; `gesture-reentry`; `track-layout`; `render-budget`; `context-hygiene`; `view`; `ArrangementContext.test.ts`; `selection`; `model`; `ssr-layout-effect`; `library-preview`.

**Not re-run this round (not PASS):** video sync and C-R27-01 (RF3-1, RF3-2, R5-L6); the full find sound → add → fit video → export flow; the FB-01..FB-16 stage regression; `npm run test:e2e:smoke` (root only).

### 4.9 Ableton source and compliance (workflow addendum 2026-10-11)

**Sources:**
- Live 12 Reference Manual, chapter 6, `https://www.ableton.com/en/live-manual/12/arrangement-view/`, **6.6 "The Arrangement Loop"** — B's gstack text from 2026-10-16, `b-round-46/ableton-arrangement-view-20261016.txt`. B re-read it on 2026-10-17.
- Chapter 4, `https://www.ableton.com/en/live-manual/12/working-with-the-browser/`, **4.10 "Adding Content from the Browser to a Live Set"** — fetched by B with gstack browse on 2026-10-17, `b-round-50/ableton-browser-20261017.txt`. The manual is labelled Version 12.
- 6.10 (Alt) — `b-round-46/ableton-6.7-6.10-20261016.txt`.
- No video was watched and no Live installation was used.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Loop brace edges and bar can be dragged | 6.6 "dragging from the left or right edge adjusts the loop start/end points, while dragging the brace bar horizontally moves the loop without changing its length" | **Confirmed** | same (existing) | LB-OFF |
| The dragged brace lands on grid lines | 6.6 does not say; 6.7 says *clips* snap to the editing grid | **Unconfirmed** (inferred from the clip rule) | CZABA snaps it with Snap on (user: everything follows the chosen grid) | LB-MOVE, LB-END |
| ← → nudge the brace by the grid | 6.6 "The left and right arrow keys nudge the loop brace to the left or right based on the current grid settings" | **Confirmed** (text; the exact landing rule — to the line vs by one step — is not stated) | to the adjacent line with Snap on; ±0.1 s with Snap off | LK-1, LK-025, LK-OFF |
| Shorten/lengthen the loop by the grid | 6.6 "Ctrl (Win) … + the left and right arrow keys shortens or lengthens the loop by the current grid setting" | **Confirmed** | **deliberate difference:** CZABA keeps its existing Shift + ← → for the end | LK-SHIFT |
| ↑/↓ shift by loop length; Ctrl + ↑/↓ double/halve | 6.6 | **Confirmed** | **not added** — not requested by the user (Q5; signal) | — |
| Alt bypasses / temporarily enables the grid | 6.10 | **Confirmed** (text) | same, per `pointermove` / drag event | LB-ALT, LB-ALT-ON, LD-ALT, LD-ALT-ON |
| Items dragged from the browser into tracks | 4.10 "Items can be dragged and dropped from the browser into tracks in the Session or Arrangement View" | **Confirmed** (that a drop adds the item) | same (existing, SRW-07) | LD-OFF |
| The drop position follows the grid | 4.10 does not describe the position | **Unconfirmed** | CZABA snaps it with Snap on; ghost = drop | LD-1 |
| Dropping below the tracks creates a new track | 4.10 | **Confirmed** | **not applicable** — CZABA's lanes are fixed | — |

C gives two verdicts per row: the CZABA requirement, and Ableton conformance (confirmed / deliberate difference / unconfirmed / not applicable). Never write "Ableton does it this way" for an unconfirmed row.

### 4.10 Carried, honest (not PASS, not new bugs unless they change)

- **Open C bugs:**
  - C-R48-01 (Low, render-budget cold flake; no recurrence in rounds 49–50);
  - C-R41-01 (Low, TL-Q-VIEWPORT);
  - C-R27-01, C-R6-02, C-R8-01 (Tech Lead quiet Chrome; C-R27-01 includes RF3-1, RF3-2, R5-L6 from `root-pre-push-review.md`);
  - C-R23-01 + C-R38-01 (Tech Lead).
- **Accepted (B):** FADER-KEY-ENTRIES, A-R29-REVIEW-1, A-R43-EXACT-5DB, A-R43-REVIEW-W66, A-R43-REVIEW-ROOTFONT, A-R45-SSR4, A-R46-RESTORE-SELECTION, A-R47-GROUP-LANE-DELTA, F1 (D-29z14).
- **Open Low:**
  - A-R50-REVIEW-CLIP-CANCEL-SEEK (→ stage 4), R26-M1, A-R34-REVIEW-RESIDUALS, DEMO-SFX-FULL-SCALE, L3-REMOVED-TRACK-TAPS, SETTRACKMIX-NAN-IDENTITY, BIOME-HOOKS-DEPS, VIDEO-CLIP-TRANSLUCENT-GRID, DETAIL-RESET-SHRINK (info), SHIFT-BEFORE-DOWN-NOTE;
  - R49-OUTWARD-TRIM-SHRINK, R49-WIDE-DIVISION-RANGE (→ stage 4).
- **Root items:**
  - commit of round 50 (7 paths, C ready);
  - ARCH-CHECKPOINT-SRW13; **ARCH-CHECKPOINT-SRW14-PREFS** (renewed, wanted before round 52);
  - GSTACK-ACL; GSTACK-NO-MOUSE (pending acceptance); SRW-21;
  - the CRLF Biome errors on the auth files; fake Bearer → 500; ENV-BROWSE-DAEMON; machine load.
- **Tech Lead manual checks:** R23-1, R23-2, R38-T, R35-T, R30-T, R31-T, R33-T, R34-T, TL-Q-FB05-FB11, TL-Q-VIEWPORT, R47-T, R49-T (1–3), R50-T (1–3), and **R51-T**:
  1. a real library drag with Snap on — the ghost and the clip land on one line; with Alt held in real Windows Chrome, does the drop still happen and is it free (R51-ALT-NATIVE-DRAG);
  2. brace drag and its edges land on lines;
  3. brace arrows go line to line; should Live's ↑/↓ or Ctrl + arrows exist;
  4. C-R50-N2: a playhead drag during playback restarts audio on each line.

## 5. Commands

A pastes the real output tails into the report:

```bash
cd C:/Apps/czaba-project/store
git rev-parse HEAD
git status --short
sha256sum -c ../tmp/studio-real-loop/b-round-50-r51-tree-sha256.txt | grep -vc ': OK$'
(cd ../tmp/studio-real-loop/b-round-50-r51-snapshots && sha256sum -c SHA256SUMS.txt)
for f in app/components/arrangement/ArrangementLane.tsx app/components/arrangement/ArrangementLoopBrace.tsx app/components/arrangement/StudioWorkspace.tsx; do cmp -s "$f" "../tmp/studio-real-loop/b-round-50-r51-snapshots/$(basename $f)" && echo "$f same" || echo "$f changed"; done
npx vitest run app/lib/arrangement/__tests__/grid-snap-loop-drop.test.tsx app/lib/arrangement/__tests__/grid-snap-position.test.tsx app/lib/arrangement/__tests__/grid-snap-edit.test.tsx app/lib/arrangement/__tests__/loop.test.ts app/lib/arrangement/__tests__/library.test.ts app/lib/arrangement/__tests__/gesture-guard.test.tsx app/lib/arrangement/__tests__/track-layout.test.tsx app/lib/arrangement/__tests__/render-budget.test.tsx
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app --diagnostic-level=error --max-diagnostics=100
npx biome check ./app
npm run verify
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
tasklist | grep -ci node.exe
```

- If a test path above does not exist, report it and run the rest. Do not create test files other than the one named in §2.2.
- C re-runs the gates itself and does not trust A's numbers.
- **Dev server and browser (C):** use the running `http://127.0.0.1:5173` and do not start or stop servers. If it is down, say so and do the offline items (G51-1/2, R51-S, R51-U).

## 6. Reports

**A → `../tmp/studio-real-loop/a-round-51.md`:**
1. the pre-flight gate and the §1.2 baseline (case A or B);
2. the red run per case, mutations (a)–(m), the green run;
3. a diff summary per file (with EOL counts);
4. the smoke result;
5. code-reviewer findings, dispositions and any **Architecture note** (for B; not acted on);
6. verbatim command tails, including `node.exe` and `npm run verify`;
7. deviations.

Do not claim PASS. On a stop condition, stop and report; do not widen or narrow the change.

**C → `c-round-51.md` and `c-round-51.json`** (the usual schema). For each ID give PASS, FAIL (with a bug ID) or **not run** (with the reason, including **not run (harness)** for PW drag/Alt limits):
- R51-S and the R51-U mutation table, including C's (n) and (o);
- R51-DROP, R51-LOOP, R51-KEYS, R51-PLAY, with REAL / REAL-mouse (PW) / SYNTHETIC labels;
- R51-REG, REG-HYD, G51-1..3;
- the Ableton two-verdict table (§4.9);
- the carried items.

`passed` lists only IDs C ran in this round. State **commit readiness** for root (round 51 paths, and whether round 50 was committed in between).

## 7. Next (orientation only; not this round)

- **Round 52 — SRW-14 stage 4:**
  - clip-edge snap (Live 6.7 "Clips snap to the editing grid, as well as … the edges of other clips");
  - right-click division menu on lanes (transcript 07:00);
  - narrow/widen keys (Live 6.10 Ctrl+1/2);
  - A-R50-REVIEW-CLIP-CANCEL-SEEK.

  If root answers ARCH-CHECKPOINT-SRW14-PREFS first, it comes before this.
- **Then:**
  - stage 5 after SRW-15 (BPM grid, bars/beats, metronome; R14-G1);
  - SRW-16 (FB-10), SRW-17 (FB-12), SRW-18 (FB-06), SRW-19 (FB-07), SRW-20;
  - Lows (R26-M1, L3-REMOVED-TRACK-TAPS, A-R34-REVIEW-RESIDUALS, SETTRACKMIX-NAN-IDENTITY, C-R48-01);
  - SRW-21 adapter; full regression and root review; T12.

**Loop runner:** if `run-loop.ps1` stopped on a `-RoundLimit`, restart it with `-StartRound 51 -StartPhase A` and a higher limit.
