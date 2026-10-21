# CURRENT TASK — Round 53: finish SRW-14 stage 4a (FB-13). Exact sub-millisecond edges (C-R52-02), the lane rule (C-R52-03), GS3/GS13 (C-R52-01), and the round-52 browser acceptance that never ran

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-17
- Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09). Addenda: Ableton 2026-10-11; periodic commits 2026-10-13; behavioural reverse-engineering 2026-10-14; architecture checkpoint; user priority 2026-10-15 Grid/Snap.
- Decision record: **D-29z18** in `docs/technical/studio-real-workspace/plan.md`. Rationale: `b-round-52.md`.
- Round size: **three tightly coupled bugs**. They share one root cause (the candidate rule in `grid.ts`) and one owner, and they finish a feature stage that is not yet done. There is no new feature. Stage 4b moves to round 54 and 4c to round 55; nothing is cut.

> **Environment (root, not BLOCKED):** `http://127.0.0.1:5173` was **down** for C's whole round-52 session, and again at B's measurement (16:15 +04, `b-round-52/gates.txt`: `000`).
> - **Root must start it before C runs.** No agent starts or stops it.
> - If it is still down when C starts, C does the offline items (G53-1, G53-2, R53-S, R53-U) and records every browser ID as **not run (environment)**.
>
> **Browse rules** (`backlog.harness_rules`):
> - Never run `$B restart`. Use a **new** `BROWSE_STATE_FILE` under your own round folder.
> - After **one** CLI-daemon failure, use the approved `server-node.mjs` fallback, started from `tmp/studio-real-loop/` with `BROWSE_PARENT_PID=0`. Record the PID and log, and stop only your own process.
> - **GSTACK-NO-MOUSE:** every clip drag, trim and Alt case uses standalone Playwright (installed chromium, fresh context, no install). Label it **REAL-mouse (PW)**. This is still a deviation pending root/user acceptance. Plain clicks and key presses use gstack (REAL).
> - **Fixture rule:** keep move targets out of the 8 px trim zones; trims start at the trim-handle centre.
>
> **Machine load:** record `tasklist | grep -ci node.exe` on every A and C run. If a test times out under load, re-run that file alone and report both runs.
>
> **Scratch junctions** (A-R52 incident): create and remove `node_modules` junctions with `cmd //c mklink /J …` / `cmd //c rmdir …` and stdin from `/dev/null`. Do **not** export `MSYS_NO_PATHCONV=1` for these `cmd` calls.

## Why this round

**Round 52 result** (`c-round-52.md`, `c-round-52.json`): **C FAIL.**
- **PASS:** R52-S, G52-2. The red run reproduced, and mutations (a)–(q) were killed ((q) is an expected survivor and info only). **C-R51-T1 is closed.**
- **C-R52-01 (Medium, gate):** D-29z17 E2 contradicts the frozen stage-1 tests GS3 and GS13. A 15 px nudge now butt-joins the neighbour (8.5 instead of 8), so `npm run verify` exits 1.
  - C and A agree this is a spec conflict, not an A defect.
  - B reproduced it: `b-round-52/vitest-focus.txt` gives 2 failed / 41 passed.
- **C-R52-02 (Medium):** a clip whose length is not a whole millisecond cannot butt-join a same-lane neighbour.
  - Edges and lengths are rounded to whole ms. The rounded candidate overlaps by up to 0.5 ms, and `moveClip` (EPS 1e-4) refuses it.
  - A start-touch after a neighbour ending at 6.0004 is not rescued either.
  - This affects real decoded and purchased audio, because library drops keep the raw `buffer.duration`.
- **C-R52-03 (Low):** a candidate that always overlaps can still win. On the clip's own lane, "end on another clip's end" and "start on another clip's start" always overlap, and when one of them is nearest it shows the blocked text where stage 1 moved freely.
- **C-R52-T1 (Low, test gap):** this belongs to stage 4c (round 55).
- **No browser ID ran** (dev server down). Purchase protection was not re-verified in round 52.

**What round 53 delivers (user `2.srt` 07:00–07:53: "it must jump onto it and lock"):**
- A dragged clip or trim edge locks **exactly** onto another clip's edge, including real audio whose length is not a whole millisecond.
- Candidates that can never fit on the lane are not offered, so a nearer impossible target no longer blocks a placement that stage 1 allowed.
- The magnet keeps its strength (no radius). GS3/GS13 now document it.
- C runs the complete round-52 browser acceptance (edges, trims, real audio, regressions, anonymous workspace and purchase protection) against the corrected rule.

## Baseline

Measured by B on 2026-10-17 at 16:15 +04 (`b-round-52/gates.txt`, `tsc.txt`, `vitest-focus.txt`).

**Content baseline** (rounds 50–52 are uncommitted). One of these must hold:
- **(A)** HEAD is `038ed5a45f94596a264c14c4ec834607cb407948`, and `git status --short` lists **exactly** these 14 paths:
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
- **(B)** HEAD is one or more newer **root** commits on top of `038ed5a`, whose combined stat contains exactly those 14 paths, and `git status --short` is empty. Root was asked **not** to commit before round-53 C PASS; this case is only tolerated.

In both cases:
- **Frozen list:** `../tmp/studio-real-loop/b-round-52-r53-tree-sha256.txt` → **407**, all OK (run from `store/`). It contains every tracked and untracked `app/**` and `docs/implementation/**` file except the 6 owned files below.
- **Snapshots:** `../tmp/studio-real-loop/b-round-52-r53-snapshots/`, with `SHA256SUMS.txt` inside:

  | File | sha256 prefix | LF lines | `it` |
  |---|---|---|---|
  | `grid.ts` | `708c0f5e` | 140 | — |
  | `ArrangementClip.tsx` | `9362b12b` | 687 | — |
  | `grid-edges.test.ts` | `15335d73` | 38 | 3 |
  | `grid-snap-clip-edges.test.tsx` | `77a868bd` | 573 | 20 |
  | `grid-snap-ui.test.tsx` | `6dd5d8d8` | 731 | 20 |
  | doc `048-…-stage-4a.md` | `34c2cbfa` | 108 | — |

- **Root-commit tolerance (case B):** if root edits docs 046/047/048 while committing, a `sha256sum -c` mismatch confined to docs 046/047 is root's. Record it as foreign (with the new hash) and continue. A mismatch in doc 048 or under `app/**`, or a root commit with any path beyond the 14, is a stop.
- Anything else (another HEAD, extra paths, a snapshot or frozen mismatch) → **stop and report**.

**Other measurements:**
- protected files 4/4 OK;
- tsc 0;
- focused vitest on `grid-edges` + `grid-snap-clip-edges` + `grid-snap-ui`: **2 failed (GS3, GS13) / 41 passed**;
- full vitest = C's G52-1: **87 files / 1488, 2 failed** (GS3, GS13);
- Biome `./app` **5 / 218 / 1**. The 5 errors are all CRLF-only `format` errors on `StudioWorkspace.tsx`, `grid.test.ts`, `render-budget.test.tsx`, `app/lib/auth.ts` and `auth-bugs.test.ts`;
- `node.exe` 9.

**Line endings:** all 6 owned files are **LF**.
- Count EOLs with node (`/\r\n/g` vs `/\n/g`).
- Diff with `diff -u --strip-trailing-cr` against the snapshots.
- `StudioWorkspace.tsx` (CRLF) is **not** owned.
- Never run `npx biome check --write` on a file you do not own.

**Rules:**
- Do not revert, re-create or reformat anything. Rounds 47–52 stay as they are, apart from the hunks named in §2.
- `.claude/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `AGENTS.md`, `biome.json`, `scripts/**` and the agent files belong to root.
- Only root commits or pushes.

## 0. Scope

### 0.1 Rule D-29z18 (replaces D-29z17 E2/E3 candidate sets; E1, E4, E5 unchanged)

**s** is the effective step from `resolveSnapStep(...)`, unchanged. When `s === null`, moves and trims stay free, exactly as today.

**R1 — comparison and value (C-R52-02):**
- The winner is the candidate with the smallest `Math.round(Math.abs(candidate − raw) * 1e6)`, in whole **microseconds**.
- On an equal value, the **grid line** wins. Between edge candidates, the **earlier** time wins (edges sorted ascending, strict `<`).
- Candidates with `Math.round(candidate * 1e6) < 0` are dropped.
- The returned value is the **exact** winning candidate:
  - the grid line from `snapTimeToGrid(raw, s)`;
  - the edge `e` as stored;
  - `e − duration` with the exact `duration`.
  - Nothing is rounded to milliseconds.

**R2 — edge lists (C-R52-02):** `clipEdgeTimes(clips, excludeClipId)` returns the **exact** starts and ends (`start + duration`) of every clip except the excluded one.
- Sort ascending.
- Drop a value whose `Math.round(v * 1e6)` equals that of the previously kept value. The first (smallest) exact value is kept.

**R3 — lane rule (C-R52-03).** The **placement lane** is:
- for a single move, `hoverTrackId` (the target lane; for a same-lane move, the clip's own lane);
- for a trim, the clip's own lane.

On the placement lane, the dragged clip's **start** may touch only another clip's **end**, and its **end** may touch only another clip's **start**. On every other lane, both edges of every clip remain targets for both the start and the end, as in round 52.
- **Move:** start candidates `startEdges`; end candidates `endEdges − duration`.
- **Left trim (start):** `startEdges`.
- **Right trim (end):** `endEdges`.

**Unchanged:**
- E1: exclude the dragged clip itself; the video clip counts.
- E4: group moves, the Shift time lock, range, ruler, playhead, drop, brace and nudge.
- E5: `moveClip` / `planClipLaneMove` / `trimClip*` still decide overlap and clamp; snap first, then clamp (F1).
- No pixel radius (§0.4).

### 0.2 Source

**`app/lib/arrangement/grid.ts` (LF).** Everything above `clipEdgeTimes` (snapshot l.1–87) stays byte-identical.
- `clipEdgeTimes`: body per R2. The signature is unchanged.
- The private helper (`nearestGridOrEdgeMs` or a renamed private helper): R1. It stays unexported.
- `snapTimeToGridOrEdges(time, step, edges)`: signature unchanged; R1.
- `snapMoveStartToGridOrEdges(start, duration, step, edges, endEdges: readonly number[] = edges)`: the optional 5th parameter is the only signature change. Start candidates are `edges`; end-touch candidates are `endEdges − duration`. Called with 4 arguments, it behaves as round 52 except for R1. This keeps CE1–CE3 valid.
- **One new export:** `clipEdgeTargets(clips: readonly ArrangementClip[], excludeClipId: string, laneTrackId: string): { startEdges: number[]; endEdges: number[] }`, per R3, built on `clipEdgeTimes`:
  - `startEdges` = `clipEdgeTimes` of the other-lane clips ∪ the exact ends of the lane clips;
  - `endEdges` = `clipEdgeTimes` of the other-lane clips ∪ the exact starts of the lane clips;
  - each list sorted and µs-deduplicated per R2.
- The name is fixed (the tests import it). No other export and no other change.

**`app/components/arrangement/ArrangementClip.tsx` (LF):**
- the `grid` import: add `clipEdgeTargets`, and drop `clipEdgeTimes` if it is no longer used;
- `moveStartOnGrid(start, delta, duration, snapStep, startEdges, endEdges)`: the free branch is byte-identical;
- the single-move call: `clipEdgeTargets(gesture.before.clips, original.id, hoverTrackId)`;
- the trim `requested`: `clipEdgeTargets(gesture.before.clips, original.id, original.trackId)` → `startEdges` for `trimStart`, `endEdges` for `trimEnd`.
- **No other hunk.** The `pointercancel` guard, the group branch, `groupDeltaOnGrid`, the range branches, `beginGesture`, the JSX and the props stay byte-identical. No new prop, state, effect or status text.

### 0.3 C-R52-01 — `grid-snap-ui.test.tsx` (narrow grant, `backlog.narrow_grants` round 53)

Only the **titles and bodies of GS3 and GS13** may change. `DEFAULT_CLIPS` (m1 music 7–11; m2 music 12.5–14.5; v1 video 0–2; s1 sfx 4.3–5.3), every helper and every other `it` stay byte-identical.

**GS3** — new title: `GS3 G turns Snap on without history; a drag lands on the 1 s grid; a sub-half drag locks onto a nearer clip edge`.
- The lines up to and including the first drag (`dx: 37` → 8, `'8.000'`) are unchanged.
- Second drag `[{ dx: 15 }]` from 8: raw 8.375. Grid 8 is 375 000 µs away; m1's end on m2's start, 12.5 − 4 = **8.5**, is 125 000 µs away. Expected:
  - `start` 8.5;
  - `dataset.clipStart` `'8.500'`;
  - `undoAll(api)` → **2**;
  - after Undo, start **7**.

**GS13** — new title: `GS13 a snapped move never overlaps a neighbour; the clip keeps its last free place`. The same `pointerId` 6 and `pressG()`.
1. `pointerDown` the header at clientX 100.
2. `pointerMove` to **156** (raw 8.4). Grid 8 is 0.4 away and the end-touch 8.5 is 0.1 away → start **8.5**, and the status is **not** `MOVE_BLOCKED_STATUS`.
3. `pointerMove` to **176** (raw 8.9). Grid 9 is 0.1 away and wins over 8.5 (0.4). Every other candidate is farther: v1/s1 give 0, 2, 4.3, 5.3, 0.3 and 1.3, and the same-lane start-touch is 14.5. Line 9 overlaps (9 + 4 > 12.5) → the status is `MOVE_BLOCKED_STATUS` and the start stays **8.5**.
4. `pointerUp` at 176 → start 8.5, `start + duration ≤ m2.start`, and `undoAll` → **1**.

### 0.4 B decisions (D-29z18)

- **C-R52-01 → option (a), no radius.**
  - The user asked that the sound "jump onto it and lock". A radius would weaken the requested magnet without the user's approval.
  - Live 6.7 does not state a distance.
  - GS3/GS13 now document FB-13.
  - Whether the magnet feels too strong stays with the Tech Lead (R52-T(1)).
- **C-R52-02 → microseconds, exact value.**
  - Whole-ms comparison cannot rescue C's P1s case: the 6.0004 edge and the 6.0 line round to the same millisecond, so the grid wins the tie and overlaps.
  - Microseconds are finer than `ARRANGEMENT_EPS` (100 µs) and remain an integer comparison, so decimal ties such as CM7 (0.1 vs 0.1) stay exact ties.
  - Residual (accepted, not a gap): an edge within 1 µs of a line counts as a tie and the line wins.
  - `model.ts` is not changed.
- **C-R52-03 → lane rule, not "nearest placeable".**
  - The two removed candidate kinds can never fit on the placement lane.
  - A "nearest placeable" search would move the model's overlap check into `grid.ts` and could jump far across clips.
  - The same rule also fixes A-R52's reviewer Low: a same-lane right trim whose nearest candidate was the neighbour's end clamped with the blocked text.
- **Ableton:** no new source. 6.7 confirms that clips snap to the edges of other clips. It does not say anything about distance, precision or which edge pairs count. R1–R3 are CZABA decisions (§4.9).

### 0.5 Not in this round (scheduled)

- **Round 54 — stage 4b:**
  - the lane right-click division menu;
  - narrow/widen keys (B first checks Chrome's handling of Ctrl+1/2: CTRL-DIGIT-BROWSER-RESERVED);
  - the C-R51-02 fix;
  - the C-R51-01 probe.
- **Round 55 — stage 4c:** group-move edges (tests with start-touch and end-touch targets: C-R52-T1) and the library-drop decision.
- **Then:** SRW-15 (+ stage 5), SRW-16..20, the Lows, SRW-21, full regression and root review, T12.

**Out of scope for the whole project:** plugins and effects; pitch; multiple video layers; audio time-stretch. Grid tempo (SRW-15) is never audio stretch.

**What could be affected (C checks):**
- single moves with Snap off / Alt;
- R47 move snapping where no edge is nearer;
- the cross-lane ghost and its refusals;
- trim blocking texts and the F1 clamp;
- group moves (must stay grid-only);
- clip-body click seek and the `pointercancel` no-seek;
- the status texts of moves to sub-ms starts;
- render cost and SSR/hydration.

## 1. Mandatory before acting (A)

1. **Read in full before the first edit:**
   - `.claude/rules/read-primitives.md`;
   - the primitives `AGENT_DISCOVERABLE_CODE.md`, `AUDIO_ARCHITECTURE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`;
   - `prompts/studio-feature.md`, `prompts/new-test.md` and `docs/implementation/TEMPLATE.md`.

   Then run the `pre-flight` skill.
2. **Baseline before any edit:**
   - HEAD and `git status --short` → case (A) or (B);
   - `sha256sum -c ../tmp/studio-real-loop/b-round-52-r53-tree-sha256.txt | grep -vc ': OK$'` → 0;
   - `cmp` each of the 6 owned files with its snapshot, and `(cd ../tmp/studio-real-loop/b-round-52-r53-snapshots && sha256sum -c SHA256SUMS.txt)`;
   - protected files 4/4; the Biome numbers; `node.exe`.
3. **Read:**
   - `grid.ts` (all);
   - `ArrangementClip.tsx` l.90–110 and l.360–560;
   - `model.ts`: `moveClip`, `trimClipStart`, `trimClipEnd`, `ARRANGEMENT_EPS` (read-only);
   - `selection.ts`: `planClipLaneMove`, `findClipPlacementConflict` (read-only);
   - the harnesses of `grid-snap-clip-edges.test.tsx` and `grid-snap-ui.test.tsx`;
   - `c-round-52.md` §6 (C's probes P1m, P1c, P1s, P2m).
4. Post the pre-flight gate at the top of your report.

## 2. A: the change

### 2.1 Source

Exactly §0.2:
- no comments, no `any`, no type assertions, no `@ts-ignore`;
- semicolons;
- no reformatting of unrelated lines;
- one new export, `clipEdgeTargets`.

### 2.2 Tests

**`grid-edges.test.ts` (append only; CE1–CE3 byte-identical):**

| ID | Call | Expected |
|---|---|---|
| CE4 | `snapMoveStartToGridOrEdges(8.35, 2.0004, 1, [10.4])`; `snapMoveStartToGridOrEdges(6.05, 2, 1, [6.0004])`; `snapTimeToGridOrEdges(9.7, 1, [9.6004])`; `snapTimeToGridOrEdges(9.25, 0.5, [9])` | `toBeCloseTo(8.3996, 9)`; `toBeCloseTo(6.0004, 9)` (49 600 µs beats the line's 50 000); `toBeCloseTo(9.6004, 9)`; **9.5** (exact tie → grid) |
| CE5 | `clipEdgeTargets([m0 music 2–4, m2 music 6–7, s1 sfx 3–5, v video 0–6.008], 'm0', 'music')`; and the same with lane `'sfx'` | music: `startEdges` `[0, 3, 5, 6.008, 7]`, `endEdges` `[0, 3, 5, 6, 6.008]`; sfx: `startEdges` `[0, 5, 6, 6.008, 7]`, `endEdges` `[0, 3, 6, 6.008, 7]` |
| CE6 | `clipEdgeTimes([a music 2 dur 2.0004, b sfx 4.000400001 dur 1], 'x')` (b's start differs from a's end by about 1e-9: a different double with the same µs key) | length **3**; elements `toBeCloseTo` 2, 4.0004, 5.0004 (6 digits); the first element ≥ 4 equals a's exact end `2 + 2.0004` (the smallest exact value is kept) |

**`grid-snap-clip-edges.test.tsx` (append only; existing `it` and helpers byte-identical).** Settings: 40 px/s, Snap on 1 s.

| ID | Fixture → action | Expected |
|---|---|---|
| CM12 | (C-R52-02, P1m) m1 music 2 dur **2.0004**; m2 music 10.4 dur 2.6. Header drag dx +254 (raw 8.35) | m1 start `toBeCloseTo(8.3996, 9)`; m1 end ≤ m2 start + 1e-9; status ≠ the move-blocked text, and equals the rendered `კლიპის გადატანა: start …` string (A records it verbatim and asserts it); Undo `კლიპის გადატანა` |
| CM13 | (P1s) m0 music 2 dur **4.0004**; m1 music 9 dur 2. Drag m1 dx −118 (raw 6.05) | m1 start `toBeCloseTo(6.0004, 9)`; not blocked; Undo `კლიპის გადატანა` |
| CM14 | (C-R52-03, P2m) m1 music 2 dur 4; m2 music 12 dur 0.5. One sample dx +256 (raw 8.4) | start **8** (8.5 = end on m2's end is not a candidate); status `კლიპის გადატანა: start 00:08.000, length 00:04.000, source offset 00:00.000.`; Undo `კლიპის გადატანა` |
| CM15 | m1 music 2 dur 2; st1 stems 10 dur 0.5. dx +256 with `y = STEMS_LANE_Y` (raw 8.4) | m1 on stems at **8** (the placement lane is stems, so 8.5 = end on st1's end is excluded); Undo `გადატანა ხაზზე — სტემები`; status `გადატანა ხაზზე — სტემები: start 00:08.000.` |
| CT7 | m1 music 7 dur 2.3; m2 music 9.6 dur 0.1. Right trim dx +15 (raw 9.675) | end **9.6**; status ≠ `TRIM_END_BLOCKED`; Undo `Trim — მარჯვენა კიდე` (9.7 = m2's end is excluded) |
| CT8 | m1 music 7 dur 2.3; m2 music **9.6004** dur 1. Right trim dx +16 (raw 9.7) | end `toBeCloseTo(9.6004, 9)`; status ≠ `TRIM_END_BLOCKED` |

**`grid-snap-ui.test.tsx`:** GS3 and GS13 exactly as in §0.3.

**Red/green.** Work in a scratch copy outside `store/` that holds the 6 snapshot files plus your new tests.
1. **Red run.** On the snapshots, expect:
   - **red:** CE4 (rows 1–3), CE5 (`clipEdgeTargets` is not a function), CE6, CM12, CM13, CM14, CM15, CT7, CT8;
   - **green:** CE1–CE3, CM1–CM11 (incl. CM9b), CT1–CT6, CC1–CC2, the new GS3 and the new GS13. The last two describe behaviour that round 52 already has; they are guards.

   Explain every difference → `a-round-53/red-run.txt`.
2. **Green run** → `a-round-53/green-run.txt`.

**A's mutations** (scratch copy only) → `a-round-53/mutations.txt`:

| # | Mutation | Must fail |
|---|---|---|
| (a) | distances compared in whole **milliseconds** | CE4 (6.0004 row), CM13 |
| (b) | the winner returned rounded to ms | CE4, CM12, CT8 |
| (c) | lane rule removed (lane clips give both edges to both lists) | CE5, CM14, CM15, CT7 |
| (d) | lane rule applied to every lane | CE5, CM2 |
| (e) | the move uses `original.trackId` instead of `hoverTrackId` | CM15 |
| (f) | trims use the unfiltered `clipEdgeTimes` | CT7 |
| (g) | `clipEdgeTimes` returns ms-rounded values | CE6, CT8 |
| (h) | de-duplication by exact equality instead of the µs key | CE6 (length 4) |
| (r1) | edge list not sorted (round 52) | CE2 |

If a mutation survives, strengthen the test, never the code, and report it.

**Test rules:**
- no `any`, `@ts-ignore`, type assertions (`instanceof` guards) or comments;
- exact strings taken from the source or the rendered output;
- no snapshot tests, no fake timers.

### 2.3 After the code

- **Self-check:** run the frozen suites of §4.8, then the full `npx vitest run` → **87 files / 1497 (1488 + 9 new `it`), 0 failures**.
- **Biome:**
  - read-only `npx biome check ./app` → ≤ 5 errors, each a CRLF-only `format` error on the baseline list; warnings ≤ 218; 1 info;
  - `npx biome check` on the 5 owned code/test files → 0 diagnostics.
- **Review:** run the `code-reviewer` agent on the diff. If your session cannot spawn subagents, say so; root then runs it. Report the findings and your dispositions. **Architecture notes** go to B (`a-round-53.md` §5), not into the code.
- **Browser smoke** (one run, gstack, fresh state under `a-round-53/`; this is not a PASS claim):
  - only if the dev server is up;
  - `/studio-lab` at 1440×900 loads;
  - a REAL `g` press works **after** the demo status reads ready;
  - the console is clean apart from the known `/api/cart`.
- **`/check`:** `npm run verify` → exit 0, run quiet (no PW probe in parallel). Do not run `npm run test:e2e:smoke` (root only).

## 3. File ownership (exact; nothing else may change)

### 3.1 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `app/lib/arrangement/grid.ts` | A | §0.2 |
| `app/components/arrangement/ArrangementClip.tsx` | A | §0.2 only |
| `app/lib/arrangement/__tests__/grid-edges.test.ts` | A | append CE4–CE6 |
| `app/lib/arrangement/__tests__/grid-snap-clip-edges.test.tsx` | A | append CM12–CM15, CT7, CT8 (and helpers below the existing ones if needed) |
| `app/lib/arrangement/__tests__/grid-snap-ui.test.tsx` | A | **narrow grant:** GS3 and GS13 titles and bodies only (§0.3) |
| `docs/implementation/2026/quarter-IV/048-studio-lab-grid-snap-stage-4a.md` | A | status line → `Round 52–53 — D-29z17, D-29z18; C-ის შემოწმებას ელოდება`; append a section `Round 53 — შესწორებები (D-29z18)` (§3.3); earlier text unchanged |
| `../tmp/studio-real-loop/a-round-53.md`, `a-round-53/` | A | report, gate output, own browse state |
| `../tmp/studio-real-loop/c-round-53.md`, `c-round-53.json`, `c-round-53/` | C | report, runs, shots, gates, own browse state |

**Expected `git status --short` at the end:** the same 14 lines as in case (A), and no new path. All 6 owned files already appear in the 14. Case (B): ` M` for exactly the 6 owned files. The frozen list must stay all OK.

### 3.2 Frozen this round

- Everything in `b-round-52-r53-tree-sha256.txt`, and everything else under `store/`. That includes:
  - `grid-snap-loop-drop.test.tsx`, `grid-snap-edit.test.tsx`, `grid-snap-position.test.tsx`;
  - `StudioWorkspace.tsx`, `ArrangementLane.tsx`, `ArrangementLoopBrace.tsx`, `ArrangementRuler.tsx`, `ArrangementContext.tsx`;
  - `model.ts`, `selection.ts`, `loop.ts`, `library.ts`, and every other test file.
- **Forbidden to modify** (C checks the first four by sha256 against `protected-baseline.json`):
  - `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
  - `app/lib/auth.ts`, `app/lib/__tests__/bug-hunting/**`, `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`;
  - `components/studio/**`, `components/ui/**`, `components/layout/**`, `components/animations/**`;
  - `root.tsx`, `entry.server.tsx`, `entry.client.tsx`, `app/styles/**`, `lib/sfx-*`, `app/routes/**`;
  - firebase/R2/auth/purchase code;
  - `public/**`, `package.json`, the lockfile;
  - `.claude/**`, `AGENTS.md`, `CLAUDE.md`, `.agents/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `.husky/**`, `scripts/**`, `e2e/**`;
  - the playwright and vitest configs, `../backend/**`, env/config files, the sitemap, `app/data/studio-lab-demo.ts`;
  - docs 001–047;
  - the other roles' files under `../tmp/studio-real-loop/`, and root's `../tmp/studio-remote-reconcile/**` and `../tmp/studio-root-r49/**`.
- **Also not allowed:**
  - new dependencies or installs;
  - deleting files or tests;
  - git commit, stash, checkout, push or deploy;
  - reverting earlier work (the uncommitted rounds 50–52 are work to keep);
  - in-place mutation of `store/` files for experiments;
  - killing processes you did not start;
  - starting or stopping the dev server;
  - `npm run format`.

### 3.3 Doc 048, round-53 section

Write it per `TEMPLATE.md` and `GEORGIAN_DOCS.md`, in Georgian, with technical terms in English.
- **Context:** C-R52-01/02/03.
- **Approach:** R1–R3 and §0.4, including the rejected radius and "nearest placeable".
- **Architecture:** one Mermaid diagram — `pointermove` → `resolveSnapStep` → `clipEdgeTargets(before, id, placement lane)` → µs nearest → exact value → `moveClip` / `planClipLaneMove` / `trimClip*`.
- **Changed files.**
- **Problems and solutions.**
- **Testing:** include the REAL-mouse (PW) method note.
- **Ableton rows:** add the §4.9 rows.
- **TODO:** 4b, 4c (C-R52-T1), R52-T.

## 4. Acceptance (C)

**Viewport and setup:** 1440×900, and 1280×720 where named; fresh load.

**Layout L52:**
- the demo video at 0 → V, where **V = the exact video-clip end** read from `window.__c` before acting (about 6.008);
- `სრული მიქსი` on music at 7–23;
- `Soft impact` (2 s) on SFX at 4–6;
- Master 0 dB; zoom 40 px/s.

Record each fixture's exact `start`/`duration` from `window.__c` (and `data-clip-start`) and the status line before acting.

**Harness rules:**
- **REAL** = `$B click` / `$B press` / `$B select`.
- **REAL-mouse (PW)** = `page.mouse` / `page.keyboard`, for every drag, trim and Alt case.
- **SYNTHETIC** (labelled) is allowed only for setup.
- Reads: `data-clip-start`, the status line, the Undo button title, the transport readout, `window.__c` (reads only).
- No source instrumentation. Mutations only in a scratch copy outside `store/`.
- Record `node.exe` on every run.

**Checkpoint order if the session may end:** G53-2 → R53-S → R53-U → G53-1 → R52-EDGE → R53-LANE → R52-TRIM → R52-PLAY → R52-REG → G53-3 → the rest. Write `c-round-53/checkpoint.md` as you go.

### 4.1 R53-S — static (read-only)

- `diff -u --strip-trailing-cr` each owned file against its snapshot, and `git diff`:
  - **`grid.ts`:** snapshot l.1–87 byte-identical; `clipEdgeTimes` and the private helper rewritten per R1/R2; the bodies of `snapTimeToGridOrEdges` / `snapMoveStartToGridOrEdges` changed, plus only the optional 5th parameter in their signatures; **one** new export, `clipEdgeTargets`.
  - **`ArrangementClip.tsx`:** only the import, `moveStartOnGrid`, the single-move call and the trim `requested`.
  - **The 2 appended test files:** the existing `it` blocks are byte-identical.
  - **`grid-snap-ui.test.tsx`:** only the GS3 and GS13 blocks differ.
  - **Doc 048:** the status line and an appended section.
- LF everywhere, with no EOL churn.
- Frozen list 407 OK; protected files 4/4.
- Banned content in the diff and the new tests: no `any`, `@ts-ignore`, `as` assertion, `//` comment, hardcoded colour, fake timers or snapshots.

### 4.2 R53-U — unit tests and mutations

- The appended cases, GS3 and GS13 are green. A's red run matches §2.2, or A explains each difference.
- The frozen suites of §4.8 are green, **including the whole `grid-snap-ui.test.tsx` (20/20)**.
- C re-runs (a)–(h) and (r1) with its **own** mutation strings in its own scratch copy; each must fail its named tests.
- **C extras:**
  - **(i)** the round-52 cancel guard is removed → CC1 must still fail;
  - **(j)** a ±500 µs tie window (an edge within 500 µs of the line's distance counts as a tie, so the line wins) → CM13 and CE4 row 2 must fail (49 600 vs 50 000 µs);
  - **(k)** the group branch is given `clipEdgeTargets` → CM10 must fail.
- **C probe re-run:** re-run your round-52 scratch probes P1m, P1c, P1s, P2m and P2 against the round-53 tree. Record each result:
  - P1m → about 8.3996, not blocked;
  - P1s → 6.0004, not blocked;
  - P2m/P2 → 8 with the normal status.

### 4.3 G53-1 — gates

- tsc 0.
- vitest = **87 files / 1497, 0 failures**. Record `node.exe`. Re-run a file that timed out alone and report both runs; a recurrence of C-R48-01 is recorded under that ID.
- build passes.
- Biome `./app` read-only, within the baseline; the owned files have 0 diagnostics.
- **`npm run verify` exit 0**, run quiet.

### 4.4 R52-EDGE — REAL-mouse (PW) moves on L52 (carried from round 52; division via REAL `select`, Snap via REAL `g`)

**State between cases:**
- Every case starts from `Soft impact` at 4.000: undo with Ctrl+Z or use a fresh page, and record `start` before every drag.
- EG-* **and the R52-REG spot checks (§4.8)** run with **no** `Slow rise` on SFX: before the R53-LANE/R52-TRIM setup, or on a fresh page. Otherwise its edges (~9.4 / ~14.4) are valid targets, and LD-1's drop at 9 would overlap it and be refused (a false FAIL).
- With Snap on, press `g` only **after** the demo status reads ready (A-R52 smoke).

| ID | Steps | Expected |
|---|---|---|
| EG-OFF | Snap off; drag the `Soft impact` header +104 px (raw 6.6) | 6.6 ± 0.025, free |
| EG-1 | Snap on, division **10**; same drag | start **7.000** (touches the music clip's start on another lane); status `კლიპის გადატანა: start 00:07.000, …`; Undo `კლიპის გადატანა`; Ctrl+Z → 4 |
| EG-VIDEO | Snap on, division 10; drag −4 px (raw 3.9) | start = **V − 2** exactly (`|start − (V − 2)| < 1e-6` from `window.__c`); end = **V** (touches the video end on another lane); record the status verbatim |
| EG-LINE | Snap on, division 1; drag +212 px (raw 9.3) | **9.000** (no edge nearer) |
| EG-ALT | division 10, Snap on, Alt held through the drag | free 6.6 ± 0.025 |
| EG-ALT-ON | Snap off, division 10, Alt held | **7.000** |
| EG-CROSS | division 10, Snap on; drag `Soft impact` down to the empty stems lane at raw ~6.6 | ghost and commit at **7.000** on stems (music is another lane); status `გადატანა ხაზზე — სტემები: start 00:07.000.` (record it exactly) |
| EG-GROUP | division 10, Snap on; click the `Soft impact` header, Ctrl-click the music clip header (selection 2), then drag `Soft impact` +104 px | both clips move by **one** grid-snapped delta (a multiple of 10 s), or both stay put with the existing group-bounds status; no edge capture. Record both starts and the status |
| EG-1280 | EG-1 at 1280×720 | same as EG-1 |

### 4.5 R53-LANE — same-lane rule in the browser (new; REAL-mouse (PW))

**Setup:** Snap off; drag `Slow rise` (5 s) from the library to SFX at ~9.4 (as LD-OFF). Record its exact start **S** and duration **D** (D = 5). Then Snap on, division 1.

| ID | Steps | Expected |
|---|---|---|
| LN-TOUCH | Drag the `Soft impact` header so that raw start ≈ S − 2 − 0.1 (dx = round((S − 2.1 − 4) × 40)) | start = **S − 2** exactly (end touches `Slow rise` on the same lane; the grid line and the music start are farther); not blocked; Ctrl+Z |
| LN-AFTER | Drag `Soft impact` so that raw start ≈ S + D + 0.1 | start = **S + D** exactly (start touches `Slow rise`'s end); Ctrl+Z |
| LN-SHORT (C-R52-03) | Before dragging, confirm that 16–17 s is inside the visible timeline (scroll if not), and record the exact S and Ls **before** computing any dx. (1) Snap off: right-trim `Soft impact` to an end of ≈ 4.5 and record its exact length Ls (≈ 0.5). (2) Snap on, division 1: move `Soft impact` to start 16 (raw ≈ 16.1) → record 16.000. (3) Drag the `Slow rise` header so that raw start ≈ 16 − D + 0.4 = 11.4 | `Slow rise` start **11.000**, end **16.000** (it touches `Soft impact`); status = the normal move text, **not** the move-blocked text. The excluded candidate 16 + Ls − 5 ≈ 11.5 would have blocked under round 52. Record the arithmetic with the exact S, Ls and raw; Ctrl+Z back to the setup |

Sub-ms lengths (C-R52-02) are **unit-only** this round: the demo SFX are whole seconds. If C finds a real asset with a sub-ms duration in `/studio-lab`, also run LN-TOUCH with it and report the result.

### 4.6 R52-TRIM — REAL-mouse (PW) (carried)

Use the same `Slow rise` setup as §4.5, with `Soft impact` back at 4–6. Snap on, division 1.

| ID | Steps | Expected |
|---|---|---|
| ET-START | music clip left trim (handle centre) to raw ≈ S − 0.05 | start = **S** exactly; offset = S − 7; record the status text |
| ET-END | music clip right trim to raw ≈ S + D − 0.05 | end = **S + D** exactly |
| ET-ALT | ET-END with Alt held | free (raw ± 0.025) |
| ET-CLAMP | `Soft impact` right trim towards the music start, 7 (its source is 2 s) | blocked at the source end (6.000) with the existing blocked text; F1 unchanged |

### 4.7 R52-PLAY — real audio (carried)

| ID | Steps | Expected |
|---|---|---|
| EP-VIDEO | Video **not** muted. After EG-VIDEO (`Soft impact` at V − 2 to V), do a REAL ruler click at ~3 s with division 1 → 3.000, then REAL Space. Sample the `h30` source-start hook and the SFX meter every 25 ms | SFX source `when` ≈ (V − 2 − 3) s after the start, `dur 2`; the SFX meter is above −∞ from a readout ≥ (V − 2) − 0.02 and ≤ (V − 2) + 0.10; the SFX source stops at V ± 0.03 while the video reaches its end |
| EP-OFF | The same with the clip moved Snap off to raw 3.9 | `when` ≈ 0.9 s (contrast) |

### 4.8 R52-REG — directly related regressions (carried)

- **REG-HYD:** fresh load at 1440×900, console for 3 s → no hydration, React or `useLayoutEffect` warning. Record the C-R23-01 NUL count and offsets.
- **Spot checks, one each:**
  - SN-1: Snap on 1 s, `Soft impact` +30 px → 5.000. Line 5 and the end-touch 7 − 2 = 5 coincide.
  - NU-1: REAL ArrowRight on a selected clip → 5.
  - A stage-2 trim (SE3-like): music right trim to a line with no edge nearer.
  - RU-1: ruler 7.3 → 7.
  - LB-MOVE: brace bar +10 px → a whole second.
  - LD-1: library drop → 9.000.
- **Clip-body click:** PW click on the music body at ~8.4 with Snap on → seek 8.000.
- **G toggle and division texts** are unchanged. `render-budget.test.tsx` and `gesture-guard.test.tsx` are green in the full run.
- **Frozen suites** (A self-check, C G53-1):
  - `grid-edges`, `grid-snap-clip-edges`, `grid-snap-ui`, `grid-snap-loop-drop`, `grid-snap-position`, `grid-snap-edit`;
  - `grid`, `selection`, `model`, `gesture-guard`, `gesture-reentry`, `track-layout`, `render-budget`, `context-hygiene`, `view`;
  - `ArrangementContext.test.ts`, `ssr-layout-effect`, `delete-selection`.

### 4.9 G53-2, G53-3 and the Ableton table

- **G53-2:**
  - protected files 4/4 OK;
  - the frozen list all OK;
  - `git status --short` = §3.1 for case (A) or (B);
  - HEAD at the start and at the end.
- **G53-3 (anonymous workspace and purchase protection), fresh browse state:**
  - `/studio-lab`, opened directly and via the header link, shows the workspace with the demo badge;
  - no request to `/api/studio-token`, `/api/recording-*`, `/api/download` or R2, and no `Authorization` header from workspace code, including during the drags;
  - anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → 401;
  - `/studio/middle-east` → "Sign in required".
  - Known and allowed: the root `GET /api/cart`, GA consent-denied events, GTM, dev modules, the homepage Unsplash image, Google Fonts.

**Ableton (workflow addendum 2026-10-11).**
- Source: Live 12 Reference Manual, chapter 6, `https://www.ableton.com/en/live-manual/12/arrangement-view/`, sections **6.7** and **6.10**.
- B's gstack capture is `b-round-46/ableton-6.7-6.10-20261016.txt`; B re-read it on 2026-10-17.
- No video was watched and no Live installation was used.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Clips snap to the editing grid | 6.7 | **Confirmed** (text) | same | EG-LINE, SN-1 |
| Clips snap to the edges of other clips | 6.7 "… including the edges of other clips …" | **Confirmed** (text) | single moves and trims (4a); groups/drop in 4c | EG-1, EG-VIDEO, EG-CROSS, LN-TOUCH, LN-AFTER, ET-START, ET-END |
| Snap distance / grid-vs-edge priority | 6.7 does not say | **Unconfirmed** | nearest wins (µs), tie → grid, then the earlier edge; no radius (D-29z18) | EG-1 vs EG-LINE; GS3 |
| Exactness of the lock (sub-ms) | — | **No source** | CZABA: the exact edge value (C-R52-02) | CM12, CM13, CT8 (unit) |
| Which edge pairs count on the same lane | 6.7 does not say | **Unconfirmed** | CZABA: start→end and end→start only on the placement lane; all pairs on other lanes (C-R52-03) | LN-SHORT, CM14, CM15, CT7 |
| Grid off → no snapping | 6.10 | **Confirmed** for subdivisions; **unconfirmed** for objects | Snap off = fully free | EG-OFF |
| Alt bypasses / temporarily enables | 6.10 | **Confirmed** (text) | also applies to edges | EG-ALT, EG-ALT-ON, ET-ALT |
| Locators / time-signature targets | 6.7 | **Confirmed** | **not applicable yet** (SRW-16) | — |

C gives two verdicts per row: the CZABA requirement, and Ableton conformance (confirmed / deliberate difference / unconfirmed / not applicable). Never write "Ableton does it this way" for an unconfirmed row.

### 4.10 Not run this round, and carried items (honest)

**Not run (not PASS):**
- video sync and C-R27-01 (RF3-1, RF3-2, R5-L6 from `root-pre-push-review.md`);
- the full find → add → fit video → export flow;
- the FB-01..FB-16 stage regression;
- `npm run test:e2e:smoke` (root);
- a real `pointercancel` in the browser (CC1 is unit-only).

**Open C bugs:**
- C-R51-01 (Low → round 54 probe), C-R51-02 (Low → round 54 fix);
- C-R52-T1 (→ round 55);
- C-R48-01, C-R41-01 (TL-Q-VIEWPORT);
- C-R27-01, C-R6-02, C-R8-01 (Tech Lead, quiet Chrome);
- C-R23-01 + C-R38-01 (Tech Lead).

**Open Low / info:**
- R26-M1, A-R34-REVIEW-RESIDUALS, DEMO-SFX-FULL-SCALE, L3-REMOVED-TRACK-TAPS, SETTRACKMIX-NAN-IDENTITY, BIOME-HOOKS-DEPS;
- VIDEO-CLIP-TRANSLUCENT-GRID, DETAIL-RESET-SHRINK, SHIFT-BEFORE-DOWN-NOTE, R49-OUTWARD-TRIM-SHRINK, R49-WIDE-DIVISION-RANGE;
- A-R51-REVIEW-BRACE-NO-RIGHT-BOUND, A-R51-REVIEW-STALE-ALT-GHOST, ABLETON-LOOP-KEYS-NOT-REQUESTED, R51-ALT-NATIVE-DRAG;
- A-R52-REVIEW-VIDEO-DRAG-EDGES, A-R52-REVIEW-EDGES-PER-MOVE.

**Root items:**
- **ENV-DEV-SERVER-DOWN-R52** (restart before C);
- **do not commit rounds 50–52 before round-53 C PASS**; then commit rounds 50–53 together;
- ARCH-CHECKPOINT-SRW14-PREFS (wanted before round 54; non-gating), ARCH-CHECKPOINT-SRW13;
- GSTACK-ACL, GSTACK-NO-MOUSE;
- SRW-21 (the purchased loader hardcodes `middle-east`, an inherited limitation; `publication-checkpoint.json` followupReview);
- portable paths in the instruction files (followupReview);
- the CRLF Biome errors on the auth files; fake Bearer → 500; ENV-BROWSE-DAEMON; machine load.

**Tech Lead manual checks:**
- the earlier list: R23-1, R23-2, R38-T, R35-T, R30-T, R31-T, R33-T, R34-T, TL-Q-FB05-FB11, TL-Q-VIEWPORT, R47-T, R49-T 1–3, R50-T 1–3, R51-T 1–4;
- **R52-T:**
  1. With a real mouse: does the edge magnet feel right, or too strong? With nearest-wins, a 15 px nudge next to a neighbour butt-joins it (GS3).
  2. Should the magnet also work with Snap off?

## 5. Commands

A pastes the real output tails into the report:

```bash
cd C:/Apps/czaba-project/store
git rev-parse HEAD
git status --short
sha256sum -c ../tmp/studio-real-loop/b-round-52-r53-tree-sha256.txt | grep -vc ': OK$'
(cd ../tmp/studio-real-loop/b-round-52-r53-snapshots && sha256sum -c SHA256SUMS.txt)
for f in app/lib/arrangement/grid.ts app/components/arrangement/ArrangementClip.tsx app/lib/arrangement/__tests__/grid-edges.test.ts app/lib/arrangement/__tests__/grid-snap-clip-edges.test.tsx app/lib/arrangement/__tests__/grid-snap-ui.test.tsx docs/implementation/2026/quarter-IV/048-studio-lab-grid-snap-stage-4a.md; do cmp -s "$f" "../tmp/studio-real-loop/b-round-52-r53-snapshots/$(basename $f)" && echo "$f same" || echo "$f changed"; done
npx vitest run app/lib/arrangement/__tests__/grid-edges.test.ts app/lib/arrangement/__tests__/grid-snap-clip-edges.test.tsx app/lib/arrangement/__tests__/grid-snap-ui.test.tsx app/lib/arrangement/__tests__/grid-snap-loop-drop.test.tsx app/lib/arrangement/__tests__/grid-snap-edit.test.tsx app/lib/arrangement/__tests__/grid-snap-position.test.tsx app/lib/arrangement/__tests__/grid.test.ts app/lib/arrangement/__tests__/selection.test.ts app/lib/arrangement/__tests__/model.test.ts app/lib/arrangement/__tests__/gesture-guard.test.tsx app/lib/arrangement/__tests__/render-budget.test.tsx
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app --diagnostic-level=error --max-diagnostics=100
npx biome check ./app
npm run verify
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
tasklist | grep -ci node.exe
```

- If a test path above does not exist, report it and run the rest. Do not create test files.
- C re-runs the gates itself and does not trust A's numbers.
- **Dev server and browser (C):** use the running `http://127.0.0.1:5173`; do not start or stop servers. If it is down, say so and do the offline items.

## 6. Reports

**A → `../tmp/studio-real-loop/a-round-53.md`:**
1. the pre-flight gate and the §1.2 baseline (case A or B);
2. the red run per case, mutations (a)–(h) and (r1), and the green run;
3. a diff summary per file, with EOL counts;
4. the smoke result;
5. code-reviewer findings, dispositions and any **Architecture note** (for B; not acted on);
6. verbatim command tails, including `node.exe` and `npm run verify`;
7. deviations.

Do not claim PASS. On a stop condition, stop and report; do not widen or narrow the change.

**C → `c-round-53.md` and `c-round-53.json`** (the usual schema). Give each ID one of:
- PASS;
- FAIL, with a bug ID;
- **not run**, with the reason (including **not run (harness)** and **not run (environment)**).

Cover:
- R53-S, and R53-U with the mutation table, (i)–(k) and the probe re-run;
- G53-1;
- R52-EDGE, R53-LANE, R52-TRIM and R52-PLAY, each with its REAL / REAL-mouse (PW) / SYNTHETIC label;
- R52-REG, REG-HYD, G53-2 and G53-3;
- the Ableton two-verdict table;
- the carried items.

`passed` lists only IDs that C ran in this round. State **commit readiness** for root: whether rounds 50–53 together are ready.

## 7. Next (orientation only; not this round)

- **Round 54 — stage 4b:**
  - the lane right-click division menu (user 07:00; Live 6.10 context menu);
  - narrow/widen keys (Chrome's Ctrl+digit handling is checked first);
  - the C-R51-02 fix in `releaseEditFocusOnTimelinePointerDown`;
  - the C-R51-01 probe.
  - If root answers ARCH-CHECKPOINT-SRW14-PREFS first, its approved change is planned as its own task.
- **Round 55 — stage 4c:** group-move edges (start- and end-touch targets, C-R52-T1) and the library-drop edge decision.
- **Then:** SRW-15 (+ stage 5; R14-G1), SRW-16 (FB-10), SRW-17 (FB-12), SRW-18 (FB-06), SRW-19 (FB-07), SRW-20; the Lows; SRW-21; full regression and root review; T12.

**Loop runner:** if `run-loop.ps1` stopped on a `-RoundLimit`, restart it with `-StartRound 53 -StartPhase A` and a higher limit.
