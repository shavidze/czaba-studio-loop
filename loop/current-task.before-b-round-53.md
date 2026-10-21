# CURRENT TASK — Round 52: SRW-14 stage 4a (FB-13) — clips snap to the edges of other clips (single move + trim); clip-body cancel no longer seeks; loop-release test gap (C-R51-T1)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-17
- Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09; Ableton addendum 2026-10-11; periodic commits 2026-10-13; behavioural reverse-engineering 2026-10-14; architecture checkpoint; user priority 2026-10-15 Grid/Snap).
- Decision record: **D-29z17** in `docs/technical/studio-real-workspace/plan.md`. Rationale: `b-round-51.md`.
- Round size: **one feature stage** (4a). Stage 4 was split into 4a / 4b / 4c so that each is checkable on its own; nothing is cut (§0.6). The two Lows folded in belong to the file this stage reopens (`ArrangementClip.tsx`) or are test-only, as round 50 did with C-R49-01/02.

> **Environment (root, not BLOCKED):** `http://127.0.0.1:5173/studio-lab` → 200 at B's measurement (`b-round-51/gates.txt`). If it is down, root restarts it. No agent starts or stops it.
>
> **Browse rules** (`backlog.harness_rules`):
> - Never run `$B restart`. Use a **new** `BROWSE_STATE_FILE` under your own round folder.
> - After **one** CLI-daemon failure, use the approved `server-node.mjs` fallback, started from `tmp/studio-real-loop/` with `BROWSE_PARENT_PID=0`. Record the PID and log; stop only your own process.
> - **GSTACK-NO-MOUSE:** gstack has no mouse down/move/up, no held modifier during a click and no double-click. Every clip drag, trim and Alt case uses standalone Playwright (installed chromium, fresh context, no install), labelled **REAL-mouse (PW)**; never call it gstack. Still a deviation pending root/user acceptance. Plain clicks and key presses use gstack (REAL).
> - **Fixture rule:** keep move targets out of the 8 px trim zones (0.2 s at 40 px/s); trims start at the trim-handle centre.
> - **Lane REAL clicks:** click the lane element with `$B click` and log the real `clientX` with a read-only listener.
>
> **Machine load:** record `tasklist | grep -ci node.exe` on every A and C run. If a test times out under load, re-run that file alone and report both runs (C51 saw one load-induced GS14 timeout while its own PW probe ran).

## Why this round

**Round 51 result** (`c-round-51.md`, `c-round-51.json`): **C PASS for the round-51 change.**
- PASS: R51-S, R51-U ((a)–(m), (x1), C's (o) killed), LD-OFF, LD-1, LD-ALT, LD-ALT-ON, LD-VIDEO, LD-1280, LB-OFF, LB-MOVE, LB-ALT, LB-ALT-ON, LB-END, LB-START, LB-CLAMP, LB-SAME, LB-1280, LK-OFF, LK-1, LK-SHIFT, LK-ZERO, LK-025, LK-CLIP, LP-LOOP, LP-LOOP-ALT, LP-DROP, LP-DROP-OFF, REG-HYD, RU-1, LA-1, CL-RANGE, NU-1, G-TEXT, G51-1 (85 / 1461, quiet `npm run verify` exit 0), G51-2, G51-3.
- **LD-BLOCK partial** → **C-R51-01** (Low, older than round 51): the blocked-drop status never appears in a real browser (`dropEffect = 'none'` → Chromium fires no `drop`). B decision in §0.5: Q1 amended; probe in 4b.
- **C-R51-02** (Low, older): after the brace has focus, a clip click does not take the arrows. B decision in §0.5: defect; fixed in 4b (the round that reopens `StudioWorkspace.tsx`).
- **C-R51-T1** (Low, test gap): mutation (n) (brace re-snaps on `pointerup`) survives → **this round** (§0.3).
- **Commit:** rounds 50 + 51 are **not committed**; C says ready (11 paths on `038ed5a`). Root commits; round 52 is valid either way (Baseline).

**What stage 4a delivers (FB-13; user `2.srt` 07:00–07:53: "… it must jump onto it and lock, so that the exact time is controlled"; Live 12 6.7 "Clips snap to the editing grid, as well as … the edges of other clips"):**
- With Snap on, a dragged clip lands on the nearest of: a grid line, or a position where its **start or end touches the edge of another clip** (any lane, the video clip included). Butt-joining two sounds, or ending a sound exactly at the video cut, no longer needs Alt and pixel luck.
- A dragged **trim edge** lands on the nearest grid line or edge of another clip.
- A clip-body press that is **cancelled** (`pointercancel`) without moving no longer moves the playhead (A-R50-REVIEW-CLIP-CANCEL-SEEK).

## Baseline

B measured on 2026-10-17 14:32 +04 (`b-round-51/gates.txt`, `tsc.txt`, `vitest-focus.txt`, `biome-app.txt`, `biome-app-errors.txt`).

**Content baseline (rounds 50 + 51 are uncommitted):** one of these must hold.
- **(A)** HEAD `038ed5a45f94596a264c14c4ec834607cb407948` and `git status --short` lists **exactly** these 11 paths:
  ```
   M app/components/arrangement/ArrangementClip.tsx
   M app/components/arrangement/ArrangementLane.tsx
   M app/components/arrangement/ArrangementLoopBrace.tsx
   M app/components/arrangement/ArrangementRuler.tsx
   M app/components/arrangement/StudioWorkspace.tsx
   M app/lib/arrangement/__tests__/grid-snap-edit.test.tsx
   M app/lib/arrangement/grid.ts
  ?? app/lib/arrangement/__tests__/grid-snap-loop-drop.test.tsx
  ?? app/lib/arrangement/__tests__/grid-snap-position.test.tsx
  ?? docs/implementation/2026/quarter-IV/046-studio-lab-grid-snap-stage-3a.md
  ?? docs/implementation/2026/quarter-IV/047-studio-lab-grid-snap-stage-3b.md
  ```
- **(B)** HEAD is one or more newer **root** commits on top of `038ed5a` whose combined stat contains exactly those 11 paths, and `git status --short` is empty.

In both cases:
- **Frozen list:** `../tmp/studio-real-loop/b-round-51-r52-tree-sha256.txt` → **407**, all OK (run from `store/`). It holds every tracked and untracked `app/**` and `docs/implementation/**` file minus the 3 owned existing files below.
- **Snapshots** (`../tmp/studio-real-loop/b-round-51-r52-snapshots/`, `SHA256SUMS.txt` inside): `ArrangementClip.tsx` (`aa85fc7e`, LF 664 lines; contains the round-50 `finishGesture` line), `grid.ts` (`c2ff66dc`, LF 84), `grid-snap-loop-drop.test.tsx` (`a104ada3`, LF 681, 23 `it`).
- **Root-commit tolerance (case B):** if root edits doc 046 or doc 047 while committing (as it did with doc 045), `sha256sum -c` mismatches confined to those two docs are root's: record them as foreign (with the new hash) and continue. A mismatch under `app/**`, or a root commit with any path beyond the 11, is a stop.
- Anything else (another HEAD, extra paths, a snapshot or frozen mismatch) → **stop and report**.

Other measurements (`gates.txt`): protected 4/4 OK; tsc 0; focused vitest 7 files / 158; full vitest = C's G51-1 on this tree: **85 files / 1461**; Biome `./app` **5 / 218 / 1**; all 5 errors are CRLF-only `format` errors on `StudioWorkspace.tsx`, `grid.test.ts`, `render-budget.test.tsx`, `app/lib/auth.ts`, `auth-bugs.test.ts`.

**Line endings:** `ArrangementClip.tsx`, `grid.ts`, `grid-snap-loop-drop.test.tsx`, both new tests and doc 048 are **LF**. Count EOLs with node (`/\r\n/g` vs `/\n/g`). Diff with `diff -u --strip-trailing-cr` against the snapshots. `StudioWorkspace.tsx` (CRLF) is **not** owned this round. Never run `npx biome check --write` on a file you do not own.

**Rules:** do not revert, re-create or reformat anything; the round 47–51 grid code stays as it is. `.claude/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `AGENTS.md`, `biome.json`, `scripts/**` and the agent files belong to root. Only root commits or pushes.

## 0. Scope

### 0.1 Rule (D-29z17 E1–E5)

Let **s** be the effective step from the existing `resolveSnapStep(snapSeconds, gridSeconds, event.altKey)` (Snap on and no Alt → the division; Snap off + Alt → the division; otherwise `null`).

- **E1 — candidates.** `E` = the start and the end (`start + duration`) of **every other clip** in `gesture.before` — every lane, the video clip included — excluding the clip being dragged or trimmed. Times are compared in whole milliseconds.
- **E2 — single move** (same lane and cross-lane, not a group, not the Shift time lock), when `s !== null`, raw start `r = original.start + delta`:
  - candidates: the grid line `snapTimeToGrid(r, s)`; every `e ∈ E` (start touches `e`); every `e − duration` (end touches `e`);
  - drop candidates `< 0`;
  - choose the candidate nearest to `r`; on a tie the **grid line wins**; between edge candidates the **earlier** time wins.
  - When `s === null` (Snap off, or Alt with Snap on) the move is free, exactly as today. No edge magnet without the grid (the user's "free mode").
- **E3 — trim** (left or right edge), when `s !== null`, raw edge `r = edge + delta`: the nearest of `snapTimeToGrid(r, s)` and every `e ∈ E` (same tie rule). The result goes to `trimClipStart` / `trimClipEnd` unchanged, so **snap then clamp** (F1, SE20) still holds: an edge target past the source start/end or below the minimum length is clamped and the existing blocked status shows.
- **E4 — unchanged this round:** group moves (grid only, `groupDeltaOnGrid`), the clip-body time range, the ruler, the playhead, empty-lane clicks, the library drop, the loop brace, the nudge keys. Group-move and library-drop edges are stage 4c (§0.6).
- **E5 — overlap:** edge snap only proposes a start/end; `moveClip` / `planClipLaneMove` / `trimClip*` still refuse overlaps exactly as today. Touching (end = other start) is allowed today; if A finds it is not, **stop and report**.

### 0.2 Source

**`app/lib/arrangement/grid.ts` (LF; three new exports, existing code byte-identical):**
- `clipEdgeTimes(clips: readonly ArrangementClip[], excludeClipId: string): number[]` — ascending, unique, millisecond-rounded starts and ends of every clip except `excludeClipId` (type-only import of `ArrangementClip` from `~/types/arrangement`).
- `snapTimeToGridOrEdges(time: number, step: number, edges: readonly number[]): number` — E3.
- `snapMoveStartToGridOrEdges(start: number, duration: number, step: number, edges: readonly number[]): number` — E2.
- Names are fixed (the tests import them). No other change in `grid.ts`.

**`app/components/arrangement/ArrangementClip.tsx` (LF):**
- `moveStartOnGrid` (l.95–99) takes `duration` and `edges` and uses `snapMoveStartToGridOrEdges` when `snapStep !== null`; its free branch is unchanged. The single-move branch (l.424–425) passes `original.duration` and `clipEdgeTimes(gesture.before.clips, original.id)`. The cross-lane plan already takes `requestedStart − original.start`, so it follows.
- The trim branch (l.471–475): `step === null ? roundTime(edge + delta) : snapTimeToGridOrEdges(edge + delta, step, clipEdgeTimes(gesture.before.clips, original.id))`.
- `finishGesture` range branch (l.519–523): when `!gesture.moved`, keep `setTimeRange(null)` and call `seekTo(…)` **only if `event.type !== 'pointercancel'`**.
- No other hunk: `groupDeltaOnGrid`, the group branch, the range branch of `handlePointerMove`, `beginGesture`, the JSX and the props are byte-identical. No new prop, state, effect, export or status text.

### 0.3 Test gap C-R51-T1 — `grid-snap-loop-drop.test.tsx` (append only)

The 23 existing `it` blocks and the helpers stay byte-identical; A may **add** helpers below the existing ones and append a new `describe` at the end:
- **SL10** — Snap on 1 s, `LOOP_FIXTURE` 12.3–14.1; `pointerDown` on the bar, `pointerMove` +10 px → read the preview `13.000–14.800`; `pointerUp` at **+50 px** (raw 13.55 → a re-snap would give 14) → committed 13–14.8; status `Loop: 00:13.000 — 00:14.800.`; one Undo entry.
- **SL11** — the same move without Alt; `pointerUp` at +10 px with **`altKey: true`** → committed 13–14.8 (a re-read of Alt would give 12.55).
- **SL7b** — Snap on, loop 0.6–1.8, bar −10 px (raw 0.35 → line 0) → **0–1.2**. **SL7c** — the same with Snap off → **0.35–1.55**. Together they tell snapping from clamping (A-R51 §5).

### 0.4 B decisions recorded for this round (D-29z17)

- **E2 nearest-wins, no pixel radius.** The grid line is always within half a division, so an edge wins only when it is nearer than the nearest line; a wide division (5 s, 10 s) therefore makes edges the main targets. Live 6.7 confirms that clips snap to other clips' edges but not the distance or the priority, so this is CZABA's smallest deterministic rule.
- **Grid wins ties**, so every stage 1–3 result with no nearer edge is unchanged (R47 SN-*, R49 SE*, R50, R51 tests stay green).
- **Snap off = free**, also for edges. Live 6.10 only says the grid-off cursor does not snap "to meter subdivisions"; whether Live still snaps to objects is unconfirmed. The user asked for a free mode, so CZABA keeps it fully free. Alt keeps its two meanings (bypass / temporary enable) for edges too.
- **Video edges count:** the user's main flow is fitting sound to the video, and E1 says "every other clip".
- **Group moves, library drop: not yet** (stage 4c, scheduled). Range/ruler/playhead/brace/nudge do not snap to edges (6.7 is about clips; locators come with SRW-16).
- **R49-OUTWARD-TRIM-SHRINK / R49-WIDE-DIVISION-RANGE (stage-4 review):** edge snap does not change either. Both follow the accepted F1 / stage-2 rules; Alt is the escape, and 4b's narrow/widen keys give a faster one. They stay recorded for Tech Lead R49-T(3); no code.

### 0.5 B decisions on C-R51-01 / C-R51-02 (no code this round)

- **C-R51-01 → Q1 amended.** In a real browser a blocked library drop is refused **by the browser**: the red ghost text ` · აქ ადგილი არ არის` and the no-drop cursor carry the refusal and nothing is added. `LIBRARY_DROP_BLOCKED_MESSAGE` in `dropLibrarySource` remains the guard for drops that do reach the lane (jsdom SD6). SD6 therefore tests `handleDrop`, not the browser contract. Stays **open (Low)**: round 53 (4b, which owns `ArrangementLane.tsx`) gets a C probe — `dragleave` count and `relatedTarget` on a blocked release vs a lane-to-lane move — and B then decides whether the release can show the status.
- **C-R51-02 → defect (Low).** Rule: keyboard ownership follows the last pointer press inside the timeline. Fix in round 53: `releaseEditFocusOnTimelinePointerDown` (`StudioWorkspace.tsx` l.930) also blurs a focused loop brace when the press target is outside it. Ableton: unconfirmed (6.6 "clicking on the loop brace … Select Loop" is a selection model, not a focus model).

### 0.6 Stage 4 split (scheduled, not deferred)

- **4a — round 52 (this):** E1–E5 for single move + trim; A-R50-REVIEW-CLIP-CANCEL-SEEK; C-R51-T1.
- **4b — round 53:** right-click division menu on the lane main area (user 07:00 "right-click … choose the grid"; Live 6.10 context menu), narrow/widen keys over `GRID_DIVISIONS_SECONDS` (Live 6.10 Ctrl+1/2 — B checks before dispatch whether Chrome lets a page receive Ctrl+1/2; tab switching may own them → record and choose keys honestly), C-R51-02 fix, C-R51-01 probe.
- **4c — round 54:** edge snap for group moves (anchor-based) and the library-drop decision.
- Then SRW-15 (+ stage 5 musical divisions, R14-G1), SRW-16..20, Lows, SRW-21, full regression and root review, T12.

**Out of scope for the whole project:** plugins and effects; pitch; multiple video layers; audio time-stretch. Grid tempo (SRW-15) is never audio stretch.

**What could be affected (C checks):** single move with Snap off / Alt; R47 move snapping where no edge is nearer; cross-lane ghosts and refusals; trim blocking texts and F1 clamp; group moves (must stay grid-only); clip-body click seek (pointerup) and range; render cost; SSR/hydration.

## 1. Mandatory before acting (A)

1. **Read in full before the first edit:** `.claude/rules/read-primitives.md`; primitives `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `AUDIO_ARCHITECTURE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`; `prompts/studio-feature.md`, `prompts/new-test.md`, `docs/implementation/TEMPLATE.md`. Then run the `pre-flight` skill.
2. **Baseline before any edit:** HEAD and `git status --short` → case (A) or (B); `sha256sum -c ../tmp/studio-real-loop/b-round-51-r52-tree-sha256.txt | grep -vc ': OK$'` → 0; `cmp` each of the 3 owned files with its snapshot and `(cd ../tmp/studio-real-loop/b-round-51-r52-snapshots && sha256sum -c SHA256SUMS.txt)`; protected 4/4; Biome numbers; `node.exe`.
3. **Read:** `grid.ts` (all); `ArrangementClip.tsx` (all); `model.ts` `moveClip` / `trimClipStart` / `trimClipEnd` overlap rules (read-only; confirm E5 touching); `selection.ts` `planClipLaneMove` (read-only); `grid-snap-edit.test.tsx` (harness, `dragFrom`, `clipAt`) and `grid-snap-loop-drop.test.tsx` (brace helpers); `b-round-46/ableton-6.7-6.10-20261016.txt`.
4. Post the pre-flight gate at the top of your report.

## 2. A: the change

### 2.1 Source

Exactly §0.2. No comments, no `any`, no type assertions, no `@ts-ignore`; semicolons; no reformatting of unrelated lines; the only new exports are the three in `grid.ts`.

### 2.2 Tests

**New `app/lib/arrangement/__tests__/grid-edges.test.ts` (pure):**

| ID | Call | Expected |
|---|---|---|
| CE1 | `snapTimeToGridOrEdges(9.3, 1, [9.35])`; `(9.3, 1, [9.8])`; `(9.25, 0.5, [9])`; `(9.3, 1, [])` | 9.35; 9; **9.5** (tie → grid); 9 |
| CE2 | `snapMoveStartToGridOrEdges(6.35, 2, 1, [8.4])`; `(6.35, 2, 1, [6.4])`; `(-0.5, 2, 1, [1.6])`; `(6.5, 2, 10, [6.4, 8.6])` | 6.4 (end touches); 6.4 (start touches); **0** (end-touch −0.4 is below 0); **6.4** (edge tie 6.4 vs 6.6 → earlier) |
| CE3 | `clipEdgeTimes([video 0–6.008, music 7–23, sfx 4–6, music 23–25], 'sfx id')` | `[0, 6.008, 7, 23, 25]` (video included, own clip excluded, unique, ascending) |

**New `app/lib/arrangement/__tests__/grid-snap-clip-edges.test.tsx` (mounted):** copy the harness of `grid-snap-edit.test.tsx` (stubs, `clipAt`, `mountEditWorkspace`, `dragFrom`; do not import them). 40 px/s; `delta = dx / 40`. Snap on 1 s (`pressG`) unless stated.

| ID | Fixture → action | Expected |
|---|---|---|
| CM1 | m1 music 2–4, m2 music 10.4–13; header drag dx +254 (raw 8.35) | start **8.4** (end touches 10.4); Undo `კლიპის გადატანა`; status `კლიპის გადატანა: start 00:08.400, length 00:02.000, source offset 00:00.000.` |
| CM2 | m1 music 2–4, s1 sfx 6.7–8; dx +184 (raw 6.6) | **6.7** (other lane's start) |
| CM3 | CM2 fixture; dx +196 (raw 6.9) | **7** (line nearer) |
| CM4 | CM2, Snap **off** | 6.6 |
| CM5 | CM2, Snap on, `altKey: true` on move and up | 6.6 |
| CM6 | CM2, Snap off, `altKey: true` | **6.7** (Alt enables grid + edges) |
| CM7 | CM2, Snap on, division 0.25 | **6.5** (tie 0.1 / 0.1 → grid) |
| CM8 | m1 music 2–4, st1 stems 10.4–12; dx +254 with `y = STEMS_LANE_Y` | m1 on stems at **8.4**; Undo `გადატანა ხაზზე — სტემები`; status `გადატანა ხაზზე — სტემები: start 00:08.400.` |
| CM9 | m1 music 2–4, s1 sfx 2.05–3; dx +40, `y = STEMS_LANE_Y`, `shiftKey: true` | m1 on stems at **2** (time lock ignores edges) |
| CM10 | m1 music 2–4, s2 sfx 2–4, st1 stems 10.4–12; click m1's header, Ctrl-click s2's header (selection 2), then drag m1 dx +254 | both start **8** (group stays grid-only in 4a; 4c will revise this case) |
| CM11 | m1 music 7.3–9.3 alone; dx +8 (raw 7.5) | **8** (own edges excluded) |
| CT1 | m1 music 7–9.3, m2 music 10.4–13; right trim dx +42 (raw 10.35) | end **10.4**; Undo `Trim — მარჯვენა კიდე`; not blocked |
| CT2 | m1 music 7–9.3, s1 sfx 9.6–11; right trim dx +16 (raw 9.7) | end **9.6** |
| CT3 | m1 music 7.3 dur 4 offset 0.6, s1 sfx 5–6.85; left trim dx −20 (raw 6.8) | start **6.85**, offset 0.15, end 11.3 |
| CT4 | m1 music 7.3 dur 4 offset 0.2, s1 sfx 5–7.05; left trim dx −9 (raw 7.075 → edge 7.05) | start **7.1** (clamped at the source start), offset 0; status exactly the existing left-trim blocked text |
| CT5 | CT2, `altKey: true` | end 9.7 |
| CT6 | m0 music 2–6.85, m1 music 7.3 dur 4 offset 0.6; left trim dx −20 | start **6.85** (touches m0), not blocked |
| CC1 | m1 music 7–10, Snap off; body `pointerDown` at time 8.4, then `pointerCancel` at the same x | transport position **unchanged** (as before the press); range null; Undo unchanged |
| CC2 | the same with `pointerUp` | position 8.4 (existing seek) |

Plus §0.3 SL10, SL11, SL7b, SL7c in `grid-snap-loop-drop.test.tsx`.

**Red/green** (scratch copy outside `store/` with the 3 snapshot sources):
1. Expected on the snapshots: `grid-edges.test.ts` fails as a whole (the exports do not exist) — record it. Mounted file — **red:** CM1, CM2, CM6, CM8, CT1, CT2, CT3, CT6, CC1; **green:** CM3, CM4, CM5, CM7, CM9, CM10, CM11, CT4, CT5, CC2. SL10, SL11, SL7b, SL7c are **green** on the snapshot (the product is already correct; they are guards) — prove them with mutations (n) and (o). Explain every difference → `a-round-52/red-run.txt`.
2. Green run → `a-round-52/green-run.txt`.

**A's mutations** (scratch copy outside `store/`; remove the `node_modules` junction with `cmd /c rmdir` only; `MSYS_NO_PATHCONV=1`) → `a-round-52/mutations.txt`:

| # | Mutation | Must fail |
|---|---|---|
| (a) | helpers return the grid line only | CM1, CM2, CT1, CE1 |
| (b) | move drops end-touch candidates | CM1, CM8, CE2 |
| (c) | move drops start-touch candidates | CM2, CE2 |
| (d) | ties → edge wins | CM7, CE1 |
| (e) | own clip edges not excluded | CM11, CE3 |
| (f) | edges used with Snap off (no Alt) | CM4 |
| (g) | Alt with Snap on keeps edges | CM5, CT5 |
| (h) | candidates `< 0` not dropped | CE2 |
| (i) | `pointercancel` still seeks | CC1 |
| (j) | group move uses edges | CM10 |
| (k) | `clipEdgeTimes` skips the video lane | CE3 |
| (l) | Shift time lock uses edges | CM9 |
| (m) | edges taken only from the clip's own lane | CM2, CT2, CT3 |
| (n) | `finishLoopGesture` re-runs the move sample on `pointerup` (release x and Alt) | SL10, SL11 |
| (o) | brace move unsnapped (round-51 move hunk reverted) | SL7b |

If any survives, strengthen the test (never the code) and report it.

**Test rules:** no `any`, no `@ts-ignore`, no type assertions (`instanceof` guards), no comments; exact strings from the source or rendered output; no snapshot tests; no fake timers.

### 2.3 After the code

- **Self-check:** the frozen suites of §4.8, then the full `npx vitest run` → **87 files / 1461 + your new `it` count, 0 failures**.
- **Biome:** read-only `npx biome check ./app` → ≤ 5 errors, each a CRLF-only `format` error on the baseline list; warnings ≤ 218; 1 info. `npx biome check` on `grid.ts`, `ArrangementClip.tsx`, the 3 test files → 0 diagnostics.
- **Review:** run the `code-reviewer` agent on the diff. If your session cannot spawn subagents, say so; root runs it. Report findings and dispositions; **Architecture notes** go to B (`a-round-52.md` §5), not into the code.
- **Browser smoke** (one run, gstack, fresh state under `a-round-52/`; not a PASS claim): `/studio-lab` 1440×900 loads; REAL `g`; console clean apart from the known `/api/cart`. Drags are C's (GSTACK-NO-MOUSE).
- **`/check`:** `npm run verify` → exit 0. Do not run `npm run test:e2e:smoke` (root only).

## 3. File ownership (exact; nothing else may change)

### 3.1 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `app/lib/arrangement/grid.ts` | A | §0.2 (3 new exports) |
| `app/components/arrangement/ArrangementClip.tsx` | A | §0.2 only |
| `app/lib/arrangement/__tests__/grid-snap-loop-drop.test.tsx` | A | §0.3 append only |
| `app/lib/arrangement/__tests__/grid-edges.test.ts` | A | new |
| `app/lib/arrangement/__tests__/grid-snap-clip-edges.test.tsx` | A | new |
| `docs/implementation/2026/quarter-IV/048-studio-lab-grid-snap-stage-4a.md` | A | new (§3.3) |
| `../tmp/studio-real-loop/a-round-52.md`, `a-round-52/` | A | report, gate output, own browse state |
| `../tmp/studio-real-loop/c-round-52.md`, `c-round-52.json`, `c-round-52/` | C | report, runs, shots, gates, own browse state |

**Expected `git status --short` at the end:** case (A): the 11 baseline paths plus `?? app/lib/arrangement/__tests__/grid-edges.test.ts`, `?? app/lib/arrangement/__tests__/grid-snap-clip-edges.test.tsx`, `?? docs/implementation/2026/quarter-IV/048-studio-lab-grid-snap-stage-4a.md` (the 3 owned existing files are already in the 11). Case (B): ` M` for `ArrangementClip.tsx`, `grid.ts`, `grid-snap-loop-drop.test.tsx` plus the 3 `??` lines. The frozen list must stay all OK; root's changes meanwhile are recorded as foreign and not touched.

### 3.2 Frozen this round

- Everything in `b-round-51-r52-tree-sha256.txt`, and everything else under `store/` — including `StudioWorkspace.tsx`, `ArrangementLane.tsx`, `ArrangementLoopBrace.tsx`, `ArrangementRuler.tsx`, `ArrangementContext.tsx`, `model.ts`, `selection.ts`, `loop.ts`, `library.ts` and every other test file.
- **Forbidden to modify** (C checks the first four by sha256 against `protected-baseline.json`): `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`; `app/lib/auth.ts`, `app/lib/__tests__/bug-hunting/**`, `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`; `components/studio/**`, `components/ui/**`, `components/layout/**`, `components/animations/**`; `root.tsx`, `entry.server.tsx`, `entry.client.tsx`, `app/styles/**`, `lib/sfx-*`, `app/routes/**`; firebase/R2/auth/purchase code; `public/**`, `package.json`, the lockfile, `.claude/**`, `AGENTS.md`, `CLAUDE.md`, `.agents/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `.husky/**`, `scripts/**`, `e2e/**`; the playwright and vitest configs, `../backend/**`, env/config files, the sitemap, `app/data/studio-lab-demo.ts`; the other roles' files under `../tmp/studio-real-loop/`, and root's `../tmp/studio-remote-reconcile/**` and `../tmp/studio-root-r49/**`.
- **Also not allowed:** new dependencies or installs; deleting files or tests; git commit, stash, checkout, push or deploy; reverting earlier work (the uncommitted rounds 50–51 are work to keep); in-place mutation of `store/` files for experiments; killing processes you did not start; starting or stopping the dev server; `npm run format`.

### 3.3 Doc 048

`docs/implementation/2026/quarter-IV/048-studio-lab-grid-snap-stage-4a.md`, per `TEMPLATE.md` and `GEORGIAN_DOCS.md`. Header: date; status `Round 52 — D-29z17; C-ის შემოწმებას ელოდება`; the project. Sections: **კონტექსტი** (FB-13, 4a after 3b; the 4a/4b/4c split); **მიდგომა** (E1–E5, §0.4); **არქიტექტურა** (one Mermaid diagram: `pointermove` → `resolveSnapStep` → `clipEdgeTimes(before)` → `snapMoveStartToGridOrEdges` / `snapTimeToGridOrEdges` → `moveClip` / `planClipLaneMove` / `trimClip*` → preview; `pointercancel` → no seek); **შეცვლილი ფაილები**; **პრობლემები და გადაწყვეტები**; **ტესტირება** (incl. the REAL-mouse (PW) method note); **the §4.9 Ableton table**; **TODO** (4b, 4c, C-R51-01 probe, C-R51-02, R52-T). Docs 001–047 are frozen.

## 4. Acceptance (C)

**Viewport and setup:** 1440×900, and 1280×720 where named; fresh load. **Layout L52** = L51: the demo video at 0–6.008; `სრული მიქსი` on music at 7–23; `Soft impact` (2 s) on SFX at 4–6; Master 0 dB; zoom 40 px/s. Record each fixture's exact start/end from `data-clip-start` and the status line before acting.

**Harness rules:** **REAL** = `$B click` / `$B press` / `$B select`. **REAL-mouse (PW)** = `page.mouse` / `page.keyboard` for every drag, trim and Alt case. **SYNTHETIC** (labelled) only for setup. Reads: `data-clip-start`, the status line, the Undo button title, the transport readout, `window.__c` (reads only). No source instrumentation; mutations only in a scratch copy outside `store/`. Record `node.exe` on every run.

**Checkpoint order if the session may end:** G52-2 → R52-S → R52-U → R52-EDGE → R52-TRIM → R52-PLAY → R52-REG → the rest. Write `c-round-52/checkpoint.md` as you go.

### 4.1 R52-S — static (read-only)

- `diff -u --strip-trailing-cr` each owned file against its snapshot, and `git diff`: `grid.ts` — only the 3 new exports (+ the type import); `ArrangementClip.tsx` — only `moveStartOnGrid`, its single-move call, the trim `requested` line(s), the `grid` import and the `pointercancel` condition; `grid-snap-loop-drop.test.tsx` — the 23 existing `it` blocks byte-identical, only appended helpers/`describe`. LF everywhere; no EOL churn.
- Frozen list 407 OK; protected 4/4.
- Banned content in the diff and the new tests: no `any`, `@ts-ignore`, `as` assertion, `//` comment, hardcoded colour, fake timers or snapshots; no exports beyond the 3.

### 4.2 R52-U — unit tests and mutations

- The 2 new files and the appended cases are green; A's red run matches §2.2 (or A explains each difference).
- The frozen suites of §4.8 are green.
- C re-runs (a)–(o) with its **own** mutation strings in its own scratch copy; each must fail its named test.
- **C extras:** **(p)** the move picks the nearest edge **ignoring** the grid line (edges always beat lines) → must fail CM3 or CM7; **(q)** trim edges computed from the live preview (`getArrangement()`) instead of `gesture.before` — C states whether any test can tell (single-clip trims do not move other clips, so a survivor is expected; record it as info, not a gap).

### 4.3 R52-EDGE — REAL-mouse (PW) moves on L52 (division via REAL `select`, Snap via REAL `g`)

**State between cases:** each EG / ET / REG case starts from the recorded L52 position (`Soft impact` at 4.000: Ctrl+Z back or a fresh page; record `data-clip-start` before every drag). EG-* and the R52-REG spot checks run with **no** `Slow rise` on SFX (before R52-TRIM's setup, or after removing it); otherwise its edges at ~9.4 / ~14.4 are valid targets and change the expected values.

| ID | Steps | Expected |
|---|---|---|
| EG-OFF | Snap off; drag `Soft impact` header +104 px (raw 6.6) | 6.6 ± 0.025, free |
| EG-1 | Snap on, division **10**; same drag | start **7.000** (touches the music clip's start on another lane); status `კლიპის გადატანა: start 00:07.000, …`; Undo `კლიპის გადატანა`; Ctrl+Z → 4 |
| EG-VIDEO | Snap on, division 10; drag −4 px (raw 3.9) | start **4.008**, end **6.008** = the video end; status `… start 00:04.008, …` |
| EG-LINE | Snap on, division 1; drag +212 px (raw 9.3) | **9.000** (no edge nearer) |
| EG-ALT | division 10, Snap on, Alt held through the drag | free 6.6 ± 0.025 |
| EG-ALT-ON | Snap off, division 10, Alt held | **7.000** |
| EG-CROSS | division 10, Snap on; drag `Soft impact` down to the stems lane at raw ~6.6 | ghost and commit at **7.000** on stems; status `გადატანა ხაზზე — სტემები: start 00:07.000.` (record exact) |
| EG-GROUP | division 10, Snap on; click the `Soft impact` header, Ctrl-click the music clip header (selection 2); drag `Soft impact` +104 px | PASS = both clips move by **one** grid-snapped delta (a multiple of 10 s from their starts) or both stay put with the existing group-bounds status; no clip lands on another clip's edge by edge capture. Record both starts and the status (edges for groups are 4c) |
| EG-1280 | EG-1 at 1280×720 | same |

### 4.4 R52-TRIM — REAL-mouse (PW)

Setup: Snap off; drag `Slow rise` (5 s) from the library to SFX at ~9.4 (as LD-OFF) → record its exact start S and end S + 5. Then Snap on, division 1.

| ID | Steps | Expected |
|---|---|---|
| ET-START | music clip left trim (handle centre) to raw ≈ S − 0.05 | start = **S** (exact), offset = S − 7; status `Trim — მარცხენა კიდე`-ის მიმდინარე ტექსტი (record) |
| ET-END | music clip right trim to raw ≈ S + 5 − 0.05 | end = **S + 5** |
| ET-ALT | ET-END with Alt held | free (raw ± 0.025) |
| ET-CLAMP | `Soft impact` right trim towards the music start 7 (its source is 2 s) | blocked at the source end (6.000), existing blocked text — F1 unchanged |

### 4.5 R52-PLAY — real audio

| ID | Steps | Expected |
|---|---|---|
| EP-VIDEO | Video **not** muted. After EG-VIDEO (`Soft impact` 4.008–6.008), REAL ruler click at ~3 s with division 1 → 3.000; REAL Space; `h30` source-start hook + SFX meter sampled every 25 ms | SFX source `when` ≈ 1.008 s after start, `dur 2`; SFX meter above −∞ from readout ≥ 3.99 and ≤ 4.10; the SFX source stops at 6.008 ± 0.03 while the video reaches its end |
| EP-OFF | the same with the clip moved Snap off to raw 3.9 | `when` ≈ 0.9 s (contrast) |

### 4.6 R52-REG — directly related regressions

- **REG-HYD:** fresh load at 1440×900, console 3 s → no hydration, React or `useLayoutEffect` warning; record the C-R23-01 NUL count and offsets.
- **Round 47–51 spot checks, one each:** SN-1 (Snap on 1 s, `Soft impact` +30 px → 5.000 — no edge nearer); NU-1 (REAL ArrowRight on a selected clip → 5); a stage-2 trim (SE3-like, music right trim to a line with no edge nearer); RU-1 (ruler 7.3 → 7); LB-MOVE (brace bar +10 px → whole second); LD-1 (library drop → 9.000).
- **Clip-body click:** PW click on the music body at ~8.4 with Snap on → seek 8.000 (pointerup path unchanged).
- **G toggle and division texts** unchanged; `render-budget.test.tsx` and `gesture-guard.test.tsx` green in the full run.

### 4.7 Not run this round (not PASS)

Video sync and C-R27-01 (RF3-1, RF3-2, R5-L6); the full find → add → fit video → export flow; the FB-01..FB-16 stage regression; `npm run test:e2e:smoke` (root); a real `pointercancel` in the browser (CC1 is unit-only; say so).

### 4.8 Gates and frozen suites

- **G52-1:** tsc 0; vitest = **87 files / 1461 + the new `it` count, 0 failures** (record `node.exe`; re-run a timed-out file alone and report both runs; a recurrence of C-R48-01 is recorded under that ID); build passes; Biome `./app` read-only within the baseline; the owned files 0 diagnostics; **`npm run verify` exit 0** (run it quiet, without your own PW probe in parallel).
- **G52-2:** protected 4/4 OK; frozen list all OK; `git status --short` = §3.1 for case (A) or (B); HEAD at the start and at the end (if root commits rounds 50–51 during the round, record the hash and check the commit contains exactly the 11 paths).
- **G52-3 (anonymous workspace and purchase protection), fresh browse state:** `/studio-lab` direct and via the header link shows the workspace with the demo badge; no request to `/api/studio-token`, `/api/recording-*`, `/api/download` or R2, and no `Authorization` header from workspace code (including during the drags); anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → 401; `/studio/middle-east` → "Sign in required". Known and allowed: the root `GET /api/cart`, GA consent-denied events, GTM, dev modules, the homepage Unsplash image, Google Fonts.
- **Frozen suites** (A self-check, C G52-1): the 2 new files; `grid-snap-loop-drop`; `grid-snap-position`; `grid-snap-edit`; `grid`; `grid-snap-ui`; `selection`; `model`; `gesture-guard`; `gesture-reentry`; `track-layout`; `render-budget`; `context-hygiene`; `view`; `ArrangementContext.test.ts`; `ssr-layout-effect`; `delete-selection`.

### 4.9 Ableton source and compliance (workflow addendum 2026-10-11)

**Sources:** Live 12 Reference Manual, chapter 6, `https://www.ableton.com/en/live-manual/12/arrangement-view/`, **6.7 "Moving and Resizing Clips"** and **6.10 "Using the Editing Grid"** — B's gstack capture of 2026-10-16, `b-round-46/ableton-6.7-6.10-20261016.txt` (re-read by B on 2026-10-17); the manual is labelled Version 12. No video was watched and no Live installation was used.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Clips snap to the editing grid | 6.7 "Clips snap to the editing grid" | **Confirmed** (text) | same (stage 1–2) | EG-LINE, SN-1 |
| Clips also snap to the edges of other clips | 6.7 "… as well as various objects in the Arrangement including the edges of other clips, locators and time signature changes" | **Confirmed** (text) | same for single moves and trims (4a); groups/drop in 4c | EG-1, EG-VIDEO, EG-CROSS, ET-START, ET-END |
| Snap distance and grid-vs-edge priority | 6.7 does not say | **Unconfirmed** | nearest wins; tie → grid; edges then earlier time | EG-1 vs EG-LINE |
| Which clip edge aligns (start or end) on a move | 6.7 does not say | **Unconfirmed** | either the start or the end may touch | EG-VIDEO (end), EG-1 (start) |
| Locators and time-signature changes as targets | 6.7 | **Confirmed** | **not applicable yet** — no locators (SRW-16 will reconsider) or time signatures | — |
| Grid off → no snapping | 6.10 "When the grid is off, the cursor does not snap to meter subdivisions" | **Confirmed** for subdivisions; for objects **unconfirmed** | CZABA: Snap off = fully free (user's free mode) | EG-OFF |
| Alt bypasses / temporarily enables | 6.10 | **Confirmed** (text) | applies to edges as well | EG-ALT, EG-ALT-ON, ET-ALT |
| A cancelled press does not move the playhead | — | **No source** | CZABA consistency with the ruler and the lane | CC1 (unit) |

C gives two verdicts per row: the CZABA requirement, and Ableton conformance (confirmed / deliberate difference / unconfirmed / not applicable). Never write "Ableton does it this way" for an unconfirmed row.

### 4.10 Carried, honest (not PASS, not new bugs unless they change)

- **Open C bugs:** C-R51-01 (Low → 4b probe), C-R51-02 (Low → 4b fix), C-R48-01 (Low, no recurrence in 49–51), C-R41-01 (Low, TL-Q-VIEWPORT), C-R27-01 (with RF3-1, RF3-2, R5-L6 from `root-pre-push-review.md`), C-R6-02, C-R8-01 (Tech Lead quiet Chrome), C-R23-01 + C-R38-01 (Tech Lead).
- **Open Low / info:** R26-M1, A-R34-REVIEW-RESIDUALS, DEMO-SFX-FULL-SCALE, L3-REMOVED-TRACK-TAPS, SETTRACKMIX-NAN-IDENTITY, BIOME-HOOKS-DEPS, VIDEO-CLIP-TRANSLUCENT-GRID, DETAIL-RESET-SHRINK, SHIFT-BEFORE-DOWN-NOTE, R49-OUTWARD-TRIM-SHRINK, R49-WIDE-DIVISION-RANGE, A-R51-REVIEW-BRACE-NO-RIGHT-BOUND, A-R51-REVIEW-STALE-ALT-GHOST, ABLETON-LOOP-KEYS-NOT-REQUESTED, R51-ALT-NATIVE-DRAG.
- **Root items:** commit of rounds 50 + 51 (11 paths, C ready); **ARCH-CHECKPOINT-SRW14-PREFS** (renewed at the stage-3 boundary; non-gating); ARCH-CHECKPOINT-SRW13; GSTACK-ACL; GSTACK-NO-MOUSE (pending acceptance); SRW-21; the CRLF Biome errors on the auth files; fake Bearer → 500; ENV-BROWSE-DAEMON; machine load.
- **Tech Lead manual checks:** the earlier list (R23-1, R23-2, R38-T, R35-T, R30-T, R31-T, R33-T, R34-T, TL-Q-FB05-FB11, TL-Q-VIEWPORT, R47-T, R49-T 1–3, R50-T 1–3, R51-T 1–4) and **R52-T**: (1) with a real mouse and Snap on, does a sound dragged near another clip or the video end "lock" onto it, and does it feel too strong with a 5–10 s division; (2) should the magnet also work with Snap off (Live's behaviour is unconfirmed; CZABA keeps Snap off fully free).

## 5. Commands

A pastes the real output tails into the report:

```bash
cd C:/Apps/czaba-project/store
git rev-parse HEAD
git status --short
sha256sum -c ../tmp/studio-real-loop/b-round-51-r52-tree-sha256.txt | grep -vc ': OK$'
(cd ../tmp/studio-real-loop/b-round-51-r52-snapshots && sha256sum -c SHA256SUMS.txt)
for f in app/components/arrangement/ArrangementClip.tsx app/lib/arrangement/grid.ts app/lib/arrangement/__tests__/grid-snap-loop-drop.test.tsx; do cmp -s "$f" "../tmp/studio-real-loop/b-round-51-r52-snapshots/$(basename $f)" && echo "$f same" || echo "$f changed"; done
npx vitest run app/lib/arrangement/__tests__/grid-edges.test.ts app/lib/arrangement/__tests__/grid-snap-clip-edges.test.tsx app/lib/arrangement/__tests__/grid-snap-loop-drop.test.tsx app/lib/arrangement/__tests__/grid-snap-edit.test.tsx app/lib/arrangement/__tests__/grid-snap-position.test.tsx app/lib/arrangement/__tests__/grid-snap-ui.test.tsx app/lib/arrangement/__tests__/grid.test.ts app/lib/arrangement/__tests__/selection.test.ts app/lib/arrangement/__tests__/model.test.ts app/lib/arrangement/__tests__/gesture-guard.test.tsx app/lib/arrangement/__tests__/render-budget.test.tsx
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app --diagnostic-level=error --max-diagnostics=100
npx biome check ./app
npm run verify
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
tasklist | grep -ci node.exe
```

- If a test path above does not exist, report it and run the rest. Do not create test files other than the two named in §2.2.
- C re-runs the gates itself and does not trust A's numbers.
- **Dev server and browser (C):** use the running `http://127.0.0.1:5173`; do not start or stop servers. If it is down, say so and do the offline items (G52-1/2, R52-S, R52-U).

## 6. Reports

**A → `../tmp/studio-real-loop/a-round-52.md`:** (1) the pre-flight gate and the §1.2 baseline (case A or B); (2) the red run per case, mutations (a)–(o), the green run; (3) a diff summary per file (with EOL counts); (4) the smoke result; (5) code-reviewer findings, dispositions and any **Architecture note** (for B; not acted on); (6) verbatim command tails, including `node.exe` and `npm run verify`; (7) deviations. Do not claim PASS. On a stop condition, stop and report; do not widen or narrow the change.

**C → `c-round-52.md` and `c-round-52.json`** (the usual schema). For each ID: PASS, FAIL (with a bug ID) or **not run** (with the reason, including **not run (harness)**): R52-S and the R52-U mutation table including (p) and (q); R52-EDGE, R52-TRIM, R52-PLAY with REAL / REAL-mouse (PW) / SYNTHETIC labels; R52-REG, REG-HYD, G52-1..3; the Ableton two-verdict table (§4.9); the carried items. `passed` lists only IDs C ran in this round. State **commit readiness** for root (round 52 paths, and whether rounds 50–51 were committed in between).

## 7. Next (orientation only; not this round)

- **Round 53 — stage 4b:** lane right-click division menu; narrow/widen keys (B checks Chrome's handling of Ctrl+1/2 first); C-R51-02 fix in `releaseEditFocusOnTimelinePointerDown`; C-R51-01 probe. If root answers ARCH-CHECKPOINT-SRW14-PREFS first, its approved change is planned as its own task.
- **Round 54 — stage 4c:** group-move edge snap; library-drop edge decision.
- **Then:** SRW-15 (+ stage 5; R14-G1), SRW-16 (FB-10), SRW-17 (FB-12), SRW-18 (FB-06), SRW-19 (FB-07), SRW-20; Lows; SRW-21; full regression and root review; T12.

**Loop runner:** if `run-loop.ps1` stopped on a `-RoundLimit`, restart it with `-StartRound 52 -StartPhase A` and a higher limit.
