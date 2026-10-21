# CURRENT TASK — Round 68: SRW-14 stage 5a fix (FB-13) — stored-line neighbours and grid-length loop move: C-R67-01, C-R67-02, A-R67-REVIEW-L1 (D-29z33)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-20
- **Workflow:** `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09). Addenda: Ableton 2026-10-11; periodic commits 2026-10-13; behavioural reverse-engineering 2026-10-14; architecture checkpoint; user priority 2026-10-15; Loop v2 2026-10-19.
- **Decision record:** **D-29z33** in `docs/technical/studio-real-workspace/plan.md`. Rationale: `b-round-67.md`. Previous task: `tasks/round-67.md` (an exact copy).
- **Round size:** one owner (A). **Three tightly related bugs**, all in the same precision rule (§0.1(9) of round 67), with no new feature:
  - **C-R67-01** (medium): a Snap-on nudge from an off-line time skips a musical line.
  - **A-R67-REVIEW-L1** (low): the same defect in `snapGroupDelta`'s clamp branch. B reproduced both directions against the live `grid.ts`.
  - **C-R67-02** (B rates it **medium**, see "Why this round"): a loop-brace move leaves the loop end 1 ms off the musical line.
- **Why now:** C round 67 = **FAIL** (`c-round-67.md`, `c-round-67.json`, `browserVerified: true`). 27 of 28 rows PASS; GM-BRACE FAIL. The root gate skipped publication (`gates/gate-round-67.json`: `skipped`, "C taskStatus FAIL"). C bugs come before new scope.

> **Servers.** B check (2026-10-20 ~17:40 +04): `/studio-lab` **200**, `:5199/api/products` **200**, `node.exe` 7. Check both at the start of A and of C and record the result. Agents never start or stop servers.
> - **If `:5173` is down:** every browser item is "not run (environment)". The round is BLOCKED with `browserVerified: false`, and no browser row may be marked PASS.
> - **If only the backend is down:** run everything except G68-3's token rows, which are "not run (environment)".
>
> **Browse rules** (`backlog.harness_rules`, unchanged):
> - Never `$B restart`.
> - Use a **new** `BROWSE_STATE_FILE` under your own round folder.
> - After one CLI-daemon failure, use the approved `server-node.mjs` fallback with `BROWSE_PARENT_PID=0`. Record its PID and log, and stop only your own process.
> - **GSTACK-NO-MOUSE:** drags, held presses and wheel use standalone Playwright (installed chromium, fresh context, no install), labelled **REAL-mouse (PW)**. Plain clicks and typing use gstack (REAL) or PW.
> - **ENV-EXT-LOAD-HANG:** wait for `domcontentloaded`, then the workspace selector, then 4 s, and record it.
> - **INFO-R62-GEPLAY-UNDO:** record the Undo title before every Ctrl+Z.
> - **INFO-C65-HARNESS-R2-REGEX:** the forbidden-host filter must also match `r2-proxy` and `workers.dev`. Apply it to **every** page script, including the regression scripts (C round 67's `tb67reg` copy missed it).
> - **INFO-C66-METER-120BPM:** live-audio timing rows use slow tempi or a single onset.
> - **Native `<select>`:** choose a division with the lane grid menu (REAL right-click + click) or the keyboard on the focused select. `selectOption` only as a labelled secondary path.
> - **Fractional positions (C round 67, B4):** an off-line start such as 0.187 is made by a REAL-mouse (PW) Snap-off drag at the maximum zoom (320 px/s) with a fractional clientX. Read the start from `data-clip-start` before the next step.
>
> **Machine load:** record `tasklist | grep -ci node.exe` on every run.
> - **Scratch junctions:** `cmd //c mklink /J …` / `cmd //c rmdir …` with stdin from `/dev/null`.
> - **npx:** never `npx <pkg>` for a package not in `node_modules`. For TS scratch scripts use `node --experimental-strip-types`.

## Why this round

**Round 67 result: FAIL** (`c-round-67.md`):
- **Offline:** every gate passed.
  - G67-2 and R67-S passed.
  - R67-U: mutations a–o and q were killed. **p survives**: widening the in-bounds checks is invisible to the tests (info).
  - G67-1: verify rc 0, **95 / 1646**, Biome 4/218/1.
- **Browser:** these rows PASS: GM-NOBPM*, GM-OPTIONS*, GM-G1 (R14-G1), GM-90, GM-POS, GM-TRIM-RANGE, GM-DROP, GM-NUDGE, GM-GROUP, GM-KEYS*, GM-MENU*, GM-TEMPO, GM-CLEAR, GM-SNAPOFF, GM-PLAY (onset 4.671), GM-UNDO, GM-LAYOUT*, SN/TB/MT/RU-REG, REG-HYD and G67-3.
- **GM-BRACE FAIL → C-R67-02.**
- **C-R67-01:** C reproduced the reviewer's M1 in the browser.

Both bugs follow the round-67 rule as written. **They are B's spec defects, not A deviations.**

**B's reproduction against the live `grid.ts`** (`b-round-67/live-probe.ts`, read-only, `node --experimental-strip-types`):

| Call (120 BPM 1/32 = 0.0625 unless noted) | Today | Correct (nearest stored line) |
|---|---|---|
| `adjacentGridLine(0.187, 0.0625, +1)` | **0.25** | 0.188 |
| `snapGroupDelta(0, 0.1875, 0.0625, −10, 0.187)` (floor branch, A's L1) | **0** | 0.125 |
| `snapGroupDelta(0.1, −0.0697, 0.0625, −0.069, 10)` (ceil branch, **new**) | **−0.038**: the anchor lands on 0.062, which is not a stored line | −0.037: the anchor lands on line 0.063 |
| `adjacentGridLine(0.3, 60/999, +1)` | 0.36 | 0.36. The reviewer's two-candidate form would return **0.3**, i.e. stuck |

**B's offline check of the corrected rule** (`b-round-67/oracle.mjs`):
- `adjacentGridLine`: 2 520 000 whole-ms inputs (7 BPMs × 6 divisions × 0–60 s). There are **0** forward and **0** backward mismatches against a brute-force scan of stored lines; today's code has 484 forward mismatches.
- **0** results change for inputs that are already on a stored line, so GM7/GM9 stay valid.
- Loop move: 953 768 checks, 0 failures.
- Group clamp: 74 556 checks, 0 failures.

**Severity of C-R67-02.** B rates it **medium** under the project table ("edge case, incorrect behaviour"):
- the impact is 1 ms;
- the trigger is common (any body move or arrow move of a loop whose length is an odd line difference);
- the loop then really wraps 1 ms late.

**Same mechanism, ruled deliberate (not changed):** a moved clip's **end** and the **offsets** inside a group move are kept exactly in milliseconds.
- A clip's duration is media time (D-10). The stage-1 group contract keeps offsets.
- A loop's edges are grid quantities, a clip's end is not.
- GM-GROUP keeps its ±0.001 for the other clip.
- Recorded as a signal on ARCH-CHECKPOINT-SRW14-PREFS (b).

**Not in this round** (unchanged, in the backlog): stage 5b triplets (next round); the perf round (ROOT-R66-M1 + ROOT-R65-M1); the Lows batch; mutation p as a test gap (`INFO-C67-MUT-P`, Lows batch). The architecture note goes to the ARCH-CHECKPOINT request (§6).

## Baseline

Measured by B on 2026-10-20 ~17:40 +04:
- **HEAD `b5fb12b9a6334c80e34dabd9bd94b6ce4184fc00`**: round 66, published. **Round 67 is not published.** The tree carries round 67's **7 uncommitted lines**, which stay as they are and are the start of this round:
  - ` M` `app/components/arrangement/ArrangementGridMenu.tsx`, `app/components/arrangement/StudioWorkspace.tsx`, `app/lib/arrangement/grid.ts`;
  - `??` `app/lib/arrangement/grid-divisions.ts`, `app/lib/arrangement/__tests__/grid-musical.test.ts`, `app/lib/arrangement/__tests__/grid-musical-ui.test.tsx`, `docs/implementation/2026/quarter-IV/060-studio-lab-musical-grid-divisions.md`.
- **Valid start:** exactly that state. If root has since committed round 67 with identical content, the start is still valid. Anything else (other status lines, a frozen or snapshot mismatch) means: stop and report.
- **Frozen list:** `../tmp/studio-real-loop/b-round-67-r68-tree-sha256.txt`, **431** entries, 431/431 OK (run from `store/`). It covers every tracked and untracked `app/**` and `docs/implementation/**` file except the 7 owned files below. That includes `grid-divisions.ts`, `StudioWorkspace.tsx` and `ArrangementGridMenu.tsx`, which are **frozen this round**.
- **Snapshots:** `../tmp/studio-real-loop/b-round-67-r68-snapshots/` with `SHA256SUMS.txt`:

  | File | sha256 prefix | EOL (CR / LF) |
  |---|---|---|
  | `app/lib/arrangement/grid.ts` | `ea5c6942` | 0 / 222 |
  | `app/lib/arrangement/loop.ts` | `e75ff268` | 0 / 173 |
  | `app/components/arrangement/ArrangementLoopBrace.tsx` | `ef3acc31` | 0 / 260 |
  | `app/contexts/ArrangementContext.tsx` | `7914bd51` | 0 / 2906 |
  | `app/lib/arrangement/__tests__/grid-musical.test.ts` | `77ec0c0c` | 0 / 179 |
  | `app/lib/arrangement/__tests__/grid-musical-ui.test.tsx` | `5112e10b` | 0 / 552 |
  | `docs/implementation/2026/quarter-IV/060-studio-lab-musical-grid-divisions.md` | `e1aff86c` | 0 / 103 |

- **Protected files:** 4/4 OK (B re-checked).
- **Biome `./app` (read-only):** **4 errors / 218 warnings / 1 info** (the baseline CRLF list: `auth-bugs.test.ts`, `grid.test.ts`, `render-budget.test.tsx`, `app/lib/auth.ts`).
- **Vitest baseline:** **95 files / 1646** (C G67-1).
- **Line endings:** every owned file is LF. Count CR with node. Never run `biome check --write`, `format --write` or `npm run format`.

**Rules:**
- Do not revert, re-create or reformat anything. The work of rounds 47–67 stays.
- `.claude/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `AGENTS.md`, `biome.json`, `scripts/**`, the vitest/playwright configs and the agent files belong to root.
- Only root commits or pushes. Round 67 and round 68 are published together, after a C PASS of round 68.

## 0. Scope

### 0.1 Rule D-29z33: neighbours and clamps use stored lines; a loop move keeps its length in grid lines

**User sources:**
- **FB-13** (`docs/video-to-text-bugs/README.md`, `2.mp4` 05:16–07:53): clip movement and the play position follow the chosen grid consistently.
- **SRW-14** R14-G1.
- **D-10:** grid tempo is never audio stretch.

**Definitions** (unchanged from round 67):
- A step is **whole-ms** when `Math.abs(step * 1000 − Math.round(step * 1000)) < 1e-6`.
- For any other step, **stored line m** is `L(m) = Math.max(0, Math.round(m * step * 1000)) / 1000` for an index m ≥ 0. This is exactly what the musical branch of `snapTimeToGrid` returns for index m.

**What stays as it is:**
- **`snapTimeToGrid`:** the results of both branches are unchanged (GM6, GM9). The musical branch may call the new private line helper.
- **Every whole-ms step** (all seconds divisions, and e.g. 120 BPM 1/4 = 0.5): `adjacentGridLine` and `snapGroupDelta` go back to the **exact expressions of `b5fb12b`** with `GRID_TIME_TOLERANCE`. Their results are byte-identical to before.
- The `snapGroupDelta` in-bounds checks (1e-6), `snapGroupMoveDelta`, the edge helpers, `resolveGridTime`, `resolveSnapStep`, `formatGridDivision` and `adjacentGridDivision`.
- Everything in round 67's `grid-divisions.ts`, `StudioWorkspace.tsx` and `ArrangementGridMenu.tsx` (frozen).
- Clip ends and group offsets (see "Why this round").
- Snap off and Alt-bypass paths.

**Behaviour** (non-whole-ms steps only, unless noted):
1. **`adjacentGridLine(time, step, +1)`** returns the **smallest stored line strictly above** `time`: the first `L(m) > time + 1e-6` for m = `Math.floor(time / step)`, then +1, then +2. B proved that three candidates are enough when step > 1 ms; the smallest musical step is 999 BPM 1/32 = 7.5 ms.
   - **`direction −1`** returns the **largest stored line strictly below** `time`: the first `L(m) < time − 1e-6` for m = `Math.ceil(time / step)`, then −1, then −2. If m < 0 is reached first, it returns `null`.
   - **Rejected:** the code-reviewer's two-candidate form `L(k) > t ? L(k) : L(k + 1)`. It sticks at 999 BPM 1/4, t = 0.3 (returns 0.3).
2. **`snapGroupDelta`, clamp branch** (only when the snapped delta is out of bounds; the in-bounds early return is unchanged):
   - **`snapped > 0`:** let `x = anchorStart + high`. The candidate is `roundGridTime(B − anchorStart)`, where B is the **largest stored line ≤ `x + 1e-6`**. Try m = `Math.floor(x / step) + 1`, then `Math.floor(x / step)`, then `Math.floor(x / step) − 1`, and skip m < 0.
   - **Otherwise:** let `x = anchorStart + low`. B is the **smallest stored line ≥ `x − 1e-6`**. Try m = `Math.max(0, Math.ceil(x / step)) − 1`, then +1, then +2 from that start, and skip m < 0.
   - No such line → `0`. The final in-bounds check of the candidate stays (1e-6), and so does the fallback `0`.
3. **Constants:** `MUSICAL_GRID_INDEX_TOLERANCE` and `gridIndexTolerance` are **removed**, because nothing uses them any more. `isWholeMillisecondStep` stays.
4. **Loop move keeps its length in grid lines** (`loop.ts`): `moveLoop(arrangement, start, gridStep: number | null = null)`.
   - **Condition:** `gridStep !== null`, and `loop.start`, `loop.end` and `nextStart` (= `Math.max(0, start)`) are all **on a line** of `gridStep`, meaning `Math.abs(snapTimeToGrid(x, gridStep) − x) < 1e-6`.
     - **Then:** `end = snapTimeToGrid(loop.end + (nextStart − loop.start), gridStep)`. If `end − nextStart < MIN_LOOP_LENGTH − 1e-9`, use today's end instead.
     - **Otherwise:** today's rule, unchanged: `end = Math.round((nextStart + length) * 1e6) / 1e6`.
   - **Whole-ms steps:** the value is identical to today's (B: 0 differences).
   - **Callers:**
     - **Pointer move** (`ArrangementLoopBrace`): `moveLoop(before, <today's snapped start>, resolveSnapStep(snapSeconds, gridSeconds, event.altKey))`. With Alt as a bypass the step is `null`, so the length is kept in ms, as today.
     - **Keyboard move** (`ArrangementLoopBrace` → context): with Snap on, `stepLoopRange('move', target − from, snapSeconds)`. With Snap off, the 0.1 s path calls `stepLoopRange(kind, delta)` unchanged.
     - **Context:** `stepLoopRange(kind, delta, gridStep: number | null = null)` passes `gridStep` to `moveLoop` **only** for `'move'`. The `'end'`/`'start'` resize paths are unchanged.
     - Every other `moveLoop`/`stepLoopRange` caller is unchanged.

**Worked oracle** (B, `b-round-67/oracle.mjs`; `q = 60 / 90`; all `toBe` unless noted):

| Call | Result |
|---|---|
| `adjacentGridLine`, `0.0625`: (0.187, +1) · (0.187, −1) · (0.188, +1) · (0.188, −1) · (0.189, −1) · (0.126, −1) | 0.188 · 0.125 · 0.25 · 0.125 · 0.188 · 0.125 |
| `adjacentGridLine`, `q`: (1.332, +1) · (1.334, −1) · (0.001, −1) | 1.333 · 1.333 · 0 |
| `adjacentGridLine(0.3, 60 / 999, +1)` | 0.36 |
| Round-67 GM7 rows (unchanged) | 0 · 1.333 · 2 · 0.667 · `null` · 0.667 · 100.667 |
| `snapGroupDelta(0, 0.1875, 0.0625, −10, 0.187)` · `(0.1, −0.0697, 0.0625, −0.069, 10)` | 0.125 · −0.037 |
| Round-67 GM8 rows (unchanged) | −1.333 · 0.666 · 0.667 |
| `moveLoop(loop {1.333, 2.667}, s, q)`, s = 2 · 2.667 · 4.667 | end 3.333 · 4 · 6 |
| `moveLoop(loop {1.3, 2.667}, 2, q)` (an edge off-line) | {2, 3.367} |
| `moveLoop(loop {1, 3}, 2.5, 0.5)` (whole-ms step) | {2.5, 4.5} |
| `moveLoop(loop {1.333, 2.667}, 2)` (no step: today) | {2, 3.334} |
| `moveLoop(loop {0, 0.063}, 0.063, 0.0625)`: the grid end 0.125 would give 0.062 < `MIN_LOOP_LENGTH`, so the guard applies | {0.063, 0.126} |

**Rejected:**
- **Relaxing GM-BRACE to ±1 ms.** Ableton's loop brace moves "without changing its length" (§0.2). In a musical grid, the length is the line count.
- **Snapping the loop end independently.** It would change the length of a loop drawn off the grid.
- **Snapping clip ends or group offsets.** That would change audio timing (D-10).
- **Changing `snapTimeToGrid`'s results.**

### 0.2 Ableton (workflow addendum 2026-10-11)

**Sources:**
- Live 12 Reference Manual, "Arrangement View", the loop brace paragraph. Captured with gstack `/browse` on 2026-10-16: `b-round-46/ableton-arrangement-view-20261016.txt`, line 3.
- §6.10 "Using the Editing Grid": `b-round-46/ableton-6.7-6.10-20261016.txt`, line 8.
- Both are re-used; nothing was re-fetched. No video was watched and no Live installation was used.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Dragging the brace bar moves the loop **without changing its length** | Arrangement View, loop brace (line 3: "dragging the brace bar horizontally moves the loop without changing its length") | **confirmed** | The length is kept as a line count when both edges are on lines of the active step. Otherwise (off-grid loop, Snap off, Alt bypass) it is kept in ms. CZABA stores whole ms, so a musical length may differ by 1 ms between positions | GM-BRACE, GM-BRACE-ALT |
| The left/right arrow keys nudge the loop brace by the current grid | same paragraph ("nudge the loop brace … based on the current grid settings") | **confirmed** | Snap on: to the adjacent stored line, length kept as a line count. Snap off: 0.1 s (stage 3b, D-29z16) | GM-BRACE-KEYS |
| Arrow-key nudge of a clip to the adjacent grid line | — (not in the captured text) | **unconfirmed** | CZABA stage-1 rule (D-29z12): the nearest stored line strictly beyond the start | FX-M1, GM-NUDGE |
| Up/down arrows shift the brace by its length; Ctrl+arrows resize | same paragraph | **confirmed** | **not offered** (not requested; unchanged) | — |

No report may claim "Ableton does the same" for an unconfirmed row.

### 0.3 Source

| File | Change |
|---|---|
| `app/lib/arrangement/grid.ts` | **§0.1(1)–(3) only:**<br>• a private stored-line helper (e.g. `storedGridLine(index, step)`);<br>• in `adjacentGridLine`, a non-whole-ms branch per §0.1(1), with the whole-ms branch = the `b5fb12b` expressions;<br>• in `snapGroupDelta`'s clamp candidate, a non-whole-ms branch per §0.1(2), with the whole-ms branch = the `b5fb12b` expressions;<br>• remove `MUSICAL_GRID_INDEX_TOLERANCE` and `gridIndexTolerance`;<br>• `snapTimeToGrid`'s musical branch may use the helper, with identical results.<br>Every export signature is unchanged, and nothing else changes. |
| `app/lib/arrangement/loop.ts` | `moveLoop` gets the optional third parameter `gridStep: number \| null = null` and the §0.1(4) branch. It imports `snapTimeToGrid` from `./grid`. Nothing else changes. |
| `app/components/arrangement/ArrangementLoopBrace.tsx` | **Two call sites only:**<br>• `handleLoopPointerMove`'s `moveLoop(…)` gets the third argument `resolveSnapStep(snapSeconds, gridSeconds, event.altKey)`;<br>• `handleLoopKeyDown`'s Snap-on `stepLoopRange(kind, …)` gets the third argument `kind === 'move' ? snapSeconds : null`.<br>Import `resolveSnapStep`. Nothing else changes. |
| `app/contexts/ArrangementContext.tsx` | **`stepLoopRange` only:** the interface line (`stepLoopRange: (kind: 'move' \| LoopEdge, delta: number, gridStep?: number \| null) => void;`) and the callback, which takes a `gridStep: number \| null = null` parameter and passes it to `moveLoop` in the `'move'` branch. Nothing else changes: the status text, history label and blocked message stay byte-identical. |

- **Frozen:** everything else. That includes `grid-divisions.ts`, `StudioWorkspace.tsx`, `ArrangementGridMenu.tsx`, `ArrangementClip.tsx`, `ArrangementLane.tsx`, `tempo.ts`, `model.ts`, every existing test file other than the two below (including `loop.test.ts`, `grid.test.ts`, `grid-snap-*.test.tsx` and `tempo-ui.test.tsx`), and docs 001–059.
- No comments, no `any`, no type assertions, no `@ts-ignore`, no hardcoded colours. Semicolons everywhere.

### 0.4 What could be affected (C checks)

- **Whole-ms path (seconds grid, 120 BPM 1/4):** it goes back to the `b5fb12b` expressions. The frozen `grid.test.ts` and `grid-snap-*.test.tsx` stay green unchanged (SN-REG, GM-G1, LB-REG).
- **Musical nudge from a stored line:** unchanged (GM-NUDGE, GM7, GM9).
- **Loop brace:**
  - edge drags and resize keys are unchanged;
  - Snap-off keys stay at 0.1 s;
  - the history label and the status text stay the same (`Loop: …`);
  - the loop wrap during playback is unchanged apart from the 1 ms.
- **Group move:** only the clamp branch changes. In-bounds group moves are unchanged (GM-GROUP).
- **Expected suite: 95 files / 1652** (1646 + GM10–GM12 + GU12–GU14).

**Out of scope for the whole project:** plugins and effects; pitch; multiple video layers; audio time-stretch. Grid tempo is never audio stretch. `/studio-lab` stays demo-only. Purchase protection and the protected files stay unchanged.

## 1. Mandatory before acting (A)

1. **Read in full before the first edit:**
   - `.claude/rules/read-primitives.md`;
   - primitives `AGENT_DISCOVERABLE_CODE.md`, `REACT_CONTEXT.md`, `AUDIO_ARCHITECTURE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`;
   - `prompts/studio-feature.md`, `prompts/new-test.md`, `docs/implementation/TEMPLATE.md`.

   Then run the `pre-flight` skill. **Record in `a-round-68/checkpoint.md` which files you read** (round 67's checkpoint did not, and C could not verify it).
2. **Baseline before any edit:**
   - HEAD and `git status --short` (exactly the 7 round-67 lines);
   - `sha256sum -c ../tmp/studio-real-loop/b-round-67-r68-tree-sha256.txt | grep -vc ': OK$'` → 0;
   - the snapshot `SHA256SUMS.txt` and `cmp` for the 7 owned files;
   - protected 4/4; Biome 4/218/1; `node.exe`; both servers.
3. **Red run first:** add the six new tests (§2.2) before any source change and run the two test files. Expected: **GM10, GM11, GM12, GU12, GU13 and GU14 fail**, and every round-67 row stays green. Record the output, then implement.
4. Post the pre-flight gate and the red run at the top of your report.

## 2. A: the change

### 2.1 Source
Implement exactly §0.1 and §0.3.

### 2.2 Tests (append to round 67's two files; unpublished, owned by A this round)

**Rules:**
- Change no existing `it` in either file. GM1–GM9 and GU1–GU11 stay byte-identical.
- In `grid-musical-ui.test.tsx`, A may extend the local fixture builder with an optional `loop` argument. Without it, the existing GU tests must get the same arrangement as before.
- Do not import from frozen tests.

**`app/lib/arrangement/__tests__/grid-musical.test.ts`** (+3 `it`)

| ID | Must assert |
|---|---|
| GM10 adjacentGridLine off-line | Every `adjacentGridLine` oracle row in §0.1 (`toBe`), including `(0.3, 60 / 999, +1)` = 0.36. Plus a **bounded sweep**: BPM [20, 60, 90, 92.5, 120, 133.33, 999] × every musical division × every whole-ms `t` in [0, 10] s. The expected forward value is the first `L(m) > t + 1e-9` and the expected backward value is the last `L(m) < t − 1e-9` (or `null`), found by scanning m from `Math.floor(t / step) − 3` to `+ 4` (m ≥ 0). Collect the failures and `expect({ count, first: failures.slice(0, 20) }).toEqual({ count: 0, first: [] })`. About 420 000 inputs; it must stay under 2 s alone |
| GM11 snapGroupDelta clamp | the two new oracle rows (0.125, −0.037), the three round-67 GM8 rows unchanged, plus a **bounded floor sweep**. Use BPM [60, 90, 120, 133.33] × beats [1, 0.5, 0.125]; anchor `a` = 0 … 4 s in 37 ms steps; `high` = 0.001 … 3 s in 53 ms steps; `raw = high + 0.0007`; `minDelta = −a`. Count only cases where the snapped value is out of bounds. The expected value is the largest `d = roundGridTime(L(m) − a)` with `0 ≤ d ≤ high + 1e-9`, else 0. Assert in the same failures/count form |
| GM12 moveLoop grid length | Every `moveLoop` oracle row in §0.1, including the guard row, as `toEqual` on `.loop` (`enabled` preserved). Plus a sweep: step ∈ {`60/90`, `0.0625`, `60/92.5`}; k = 0 … 200; width w ∈ {1, 2, 3, 5} **with `w × step ≥ MIN_LOOP_LENGTH`**, so only w = 1 at 0.0625 is excluded, because the guard owns that case; shift d ∈ {−3, −1, 1, 2, 7} with k + d ≥ 0. Then `moveLoop({L(k), L(k+w)}, L(k+d), step).loop.end === L(k+w+d)`. Assert in the failures/count form. B: 11 011 checks, 0 failures |

**`app/lib/arrangement/__tests__/grid-musical-ui.test.tsx`** (+3 `it`, inside the existing `describe`)

| ID | Must assert |
|---|---|
| GU12 nudge from an off-line start (C-R67-01) | BPM 120, Snap off. Drag the sfx clip so its start is **0.187** (`toBeCloseTo(0.187, 9)`; choose the px delta from the harness zoom). Choose `1/32`, press `g`, and select the clip if the drag did not. Then: ArrowRight → `0.188`, ArrowRight → `0.25`, ArrowLeft → `0.188`, ArrowLeft → `0.125` (each `toBeCloseTo(…, 9)`) |
| GU13 brace pointer move (C-R67-02) | BPM 90, `1/4`, Snap on, loop `{1.333, 2.667}`. Drag the brace body by the px of +0.9 s → `live(api).arrangement.loop` start `2`, end `3.333`. Then drag again by +0.7 s with `altKey` on every pointer event (bypass) → start `2.7`, end `4.033`, i.e. the ms length 1.333 is kept. Values are `toBeCloseTo(…, 9)` |
| GU14 brace keys (C-R67-02) | Same setup. Dispatch the arrow keys **on the brace element** (`arrangement-loop-brace`). The file's `pressArrow` dispatches on `document.body`, which is the clip-nudge path, so add a brace-targeted helper. ArrowRight → `{2, 3.333}`, ArrowRight → `{2.667, 4}`, ArrowLeft → `{2, 3.333}`. Shift+ArrowRight → end `4` (resize to the next line, unchanged path). Then Snap off with `pressG()` (it dispatches on `document.body`, as in GU10) and ArrowRight on the brace → `{2.1, 4.1}` (+0.1 s, ms length kept). Assert the status `Loop: …` text after the first key equals the frozen format |

**Expected count:** vitest **95 files / 1652**. Use `toBeCloseTo(…, 9)` except where §0.1 says `toBe`; never a regex.

### 2.3 Mutation proof (A, scratch only, outside `store/`)

Use a scratch copy with a `node_modules` junction and your own vitest config, as in rounds 65–67. Run it on:
- `grid-musical.test.ts` and `grid-musical-ui.test.tsx`;
- `grid.test.ts`, `grid-edges.test.ts` and `loop.test.ts`;
- `grid-snap-ui.test.tsx`, `grid-snap-keys.test.tsx`, `grid-snap-edit.test.tsx`, `grid-snap-position.test.tsx`, `grid-snap-loop-drop.test.tsx` and `grid-snap-clip-edges.test.tsx`;
- `tempo-ui.test.tsx`.

Each mutation must fail at least the named tests. Restore after each one.

| # | Mutation | Must fail |
|---|---|---|
| a | `adjacentGridLine` non-whole-ms branch back to the round-67 0.000501 index form | GM10, GU12 |
| b | the reviewer's two-candidate form `L(k) > t + 1e-6 ? L(k) : L(k + 1)` (and its mirror) | GM10 |
| c | the floor clamp back to the round-67 index form | GM11 |
| d | the ceil clamp back to the round-67 index form | GM11 |
| e | `moveLoop` ignores `gridStep` | GM12, GU13, GU14 |
| f | `moveLoop` applies the grid end even when an edge is off-line | GM12 |
| g | the brace pointer passes `null` as the step | GU13 |
| h | `stepLoopRange` drops `gridStep` (or the brace keys do not pass it) | GU14 |
| i | the brace pointer passes `snapSeconds` instead of `resolveSnapStep(…)` (Alt ignored) | GU13 |

**Rules:**
- Write `a-round-68/mutations.txt` (command, result lines, failing test names).
- A surviving mutation → strengthen that test within §2.2.
- **Spec-assumption stop:** if a §2.2 assertion fails on the finished tree for a reason that is not an implementation bug (e.g. an oracle row is wrong), stop and report to B. Do not rewrite the assertion.

### 2.4 After the change
- **Self-check:** `npx tsc --noEmit` → 0; full `npx vitest run` → **95 / 1652, 0 failures**; `npm run build` → rc 0.
- **Biome:** read-only `npx biome check ./app` → ≤ 4 errors (only the baseline CRLF list), ≤ 218 warnings, 1 info. The 6 owned code/test files → 0 diagnostics.
- **Review:** run the real `code-reviewer` subagent on the diff against the snapshots. Put findings and dispositions in the report. Architecture notes go to B (`a-round-68.md` §6), not into code.
- **`/check`:** `npm run verify` → exit 0, quietly, with no PW probe in parallel. Do not run `npm run test:e2e:smoke` (root's).
- **Browser smoke (`:5173` up):** one load of `/studio-lab` at 1440×900.
  - Set BPM 90, choose `1/4`, turn Snap on.
  - Draw a range from 1.333 to 2.667, press Ctrl+L, focus the brace and press ArrowRight.
  - Record the loop readout. Not a PASS claim.

### 2.5 Doc 060 (amend; it is unpublished)
Add a section **„Round 68 — სიზუსტის შესწორება (D-29z33)“** to `docs/implementation/2026/quarter-IV/060-studio-lab-musical-grid-divisions.md`. Write it in Georgian, with technical terms in English. Cover:
- the two C bugs and L1 (Problem → Solution);
- the stored-line rule and why the tolerance was dropped;
- the grid-length loop move and its Ableton source;
- the deliberate clip-end/group-offset rule;
- the tests GM10–GM12 and GU12–GU14, the mutations and the gates.

Update the status line to `Round 67–68 — D-29z32, D-29z33; C-ის შემოწმებას ელოდება`. Change nothing else in doc 060.
- **Why amend instead of a new doc 061:** round 67 is unpublished and both rounds publish together as one feature stage. B records this choice in D-29z33.

## 3. File ownership (exact; nothing else may change)

### 3.1 May modify this round

| File | Who | Allowed change |
|---|---|---|
| `app/lib/arrangement/grid.ts` | A | §0.1(1)–(3) (§0.3) |
| `app/lib/arrangement/loop.ts` | A | `moveLoop` `gridStep` (§0.1(4)) |
| `app/components/arrangement/ArrangementLoopBrace.tsx` | A | the two call sites and one import (§0.3) |
| `app/contexts/ArrangementContext.tsx` | A | `stepLoopRange` interface line and callback only (§0.3) |
| `app/lib/arrangement/__tests__/grid-musical.test.ts` | A | append GM10–GM12 |
| `app/lib/arrangement/__tests__/grid-musical-ui.test.tsx` | A | append GU12–GU14; optional fixture `loop` argument |
| `docs/implementation/2026/quarter-IV/060-studio-lab-musical-grid-divisions.md` | A | §2.5 amendment |
| `../tmp/studio-real-loop/a-round-68.md`, `a-round-68/` | A | report, gate output, scratch, own browse state |
| `../tmp/studio-real-loop/c-round-68.md`, `c-round-68.json`, `c-round-68/` | C | report, runs, shots, gates, own browse state |

**Expected `git status --short` at the end: 10 lines.**
- ` M` for `grid.ts`, `loop.ts`, `ArrangementLoopBrace.tsx`, `ArrangementContext.tsx`, `ArrangementGridMenu.tsx` and `StudioWorkspace.tsx`. The last two are round 67's lines and are unchanged against the frozen list.
- `??` for `grid-divisions.ts`, the two test files and doc 060.

### 3.2 Frozen this round
- Everything in `b-round-67-r68-tree-sha256.txt` and everything else under `store/`.
- **Forbidden to modify.** C checks the first four by sha256 against `protected-baseline.json`:
  - `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
  - `app/lib/auth.ts`, `app/lib/__tests__/bug-hunting/**`, `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`;
  - `components/studio/**`, `components/ui/**`, `components/layout/**`, `components/animations/**`;
  - `root.tsx`, `entry.server.tsx`, `entry.client.tsx`, `app/styles/**`, `lib/sfx-*`, `app/routes/**`;
  - firebase, R2, auth and purchase code;
  - `public/**`, `package.json`, the lockfile;
  - `.claude/**`, `AGENTS.md`, `CLAUDE.md`, `.agents/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `.husky/**`, `scripts/**`, `e2e/**`;
  - the playwright and vitest configs, `../backend/**`, env/config files, the sitemap, `app/data/studio-lab-demo.ts`;
  - the other roles' files under `../tmp/studio-real-loop/`, and root's `../tmp/studio-remote-reconcile/**`, `../tmp/studio-root-r49/**`, `root-publish/**`.
- **Also not allowed:**
  - new dependencies or installs; deleting files or tests;
  - git commit, stash, checkout, push or deploy; reverting earlier work;
  - in-place mutation of `store/` files for experiments;
  - killing processes you did not start; starting or stopping the dev server or the backend;
  - `npm run format`;
  - deleting `playwright-report/`, `store/nul` or any `*-round-6x/scratch/` folder.

## 4. Acceptance (C)

**Checkpoint order:** G68-2 → R68-S → R68-U → G68-1 → §4.6 (browser rows) → §4.7 (regressions) → G68-3.
- Write `c-round-68/checkpoint.md` as you go.
- Check both servers at the start, after the offline items and before the report.
- `browserVerified` is `true` only if every REAL-browser row in §4.6, §4.7 and G68-3's workspace rows ran. GM-GROUP-CLAMP is best effort (see the row).

### 4.1 R68-S — static (read-only)
- **`diff -u` against the round-68 snapshots:**
  - **`grid.ts`:** only §0.1(1)–(3). Inside the whole-ms branch, the **arithmetic expressions** of `adjacentGridLine` and of `snapGroupDelta`'s candidate must equal `b5fb12b`'s (`git show b5fb12b:app/lib/arrangement/grid.ts`), with `GRID_TIME_TOLERANCE`. The new `isWholeMillisecondStep` branching around them is expected and is not a deviation. `snapTimeToGrid`'s whole-ms branch must be unchanged.
  - **`loop.ts`:** only `moveLoop` and the import.
  - **`ArrangementLoopBrace.tsx`:** only the two call sites and the import.
  - **`ArrangementContext.tsx`:** only the `stepLoopRange` interface line and callback.
  - **Test files:** the round-67 `it` blocks byte-identical, plus GM10–GM12 and GU12–GU14. A fixture-only `loop` argument is allowed.
- **Banned patterns:** no `any`, assertions, `@ts-ignore`, comments or hardcoded colours. No `.skip`, `.only`, `.todo`, `retry`, `vi.setConfig` or per-`it` numeric timeouts.
- **EOL:** LF only. **Doc 060:** the round-68 section and the new status line.

### 4.2 R68-U — unit and mutation (C's own scratch, own edits)
- **Red run:** the two test files against a scratch tree holding the round-68 **snapshots** of `grid.ts`, `loop.ts`, `ArrangementLoopBrace.tsx` and `ArrangementContext.tsx` → exactly GM10–GM12 and GU12–GU14 fail.
- **Mutations a–i:** re-run in your own scratch; each must kill its named tests.
- **C extras (info), suggested:**
  - (j) the whole-ms branch of `adjacentGridLine` also routed through the stored-line scan → record whether anything sees it. Expected: no test, because the values are equal.
  - (k) `moveLoop`'s on-line test uses `1e-3` instead of `1e-6` → GM12.
  - (l) the context passes `gridStep` for `'end'` as well → record the result.
- Record survivors as test gaps.
- **Durations:** run the two files alone. GM10, GM11 and GM12 must each stay under 2 s. A single test over 3 s is info.

### 4.3 G68-1 — gates
- tsc 0; build.
- Biome read-only `./app` within 4/218/1; the owned files 0 diagnostics.
- **vitest 95 files / 1652, 0 failures** (quiet).
- **`npm run verify` exit 0:** at most two quiet attempts, each recorded. If neither gives rc 0 → FAIL.
- Record `node.exe`.

### 4.4 G68-2 — tree
Protected 4/4 OK; frozen 431/431 OK; `git status --short` = the 10 §3.1 lines; HEAD at start and end.

### 4.5 Reading values
- **Positions:** `data-clip-start` (toFixed(3)) and the loop readout `Loop mm:ss.mmm — mm:ss.mmm` (or the brace `aria-label`).
- **Musical expectation:** `round(k × step, 3)` for the nearest line k.
- The feel of the brace with a real mouse → Tech Lead (R68-T).

### 4.6 Browser rows — fresh `/studio-lab`, 1440×900; starred rows also at 1280×720

Use one fresh page per group of rows and record which rows shared a page.

| ID | Steps | Pass |
|---|---|---|
| **FX-M1*** (C-R67-01) | C's round-67 B4 steps exactly: drop `Soft impact` on SFX, BPM `120`, Snap off, maximum zoom. REAL-mouse (PW) free drag to start **0.187**. Choose `1/32` (menu), `g`, select the clip. REAL ArrowRight, ArrowRight, ArrowLeft, ArrowLeft (record the Undo title before the first) | starts `0.188`, `0.250`, `0.188`, `0.125` |
| FX-M1-90 | BPM 90, `1/4`. Snap-off drags to **1.332** and, on a second page or after Undo, to **1.334**. Then Snap on: ArrowRight from 1.332, and ArrowLeft from 1.334 | `1.333` both times |
| **GM-BRACE*** (C-R67-02) | C's round-67 C3 steps: drop `Middle East — საჯარო preview` on music, BPM `90`, `1/4`, Snap on, range drag raw 1.2 → 2.9, Ctrl+L → `Loop 00:01.333 — 00:02.667`. REAL-mouse drag of the brace body by +0.9 s; repeat on fresh loops with +1.6 s and +3.05 s. Then a REAL-mouse end-edge drag | `2.000 — 3.333`; `2.667 — 4.000`; `4.667 — 6.000`; the end-edge drag lands on a `round(k × 2/3, 3)` line |
| GM-BRACE-ALT | a fresh `1.333 — 2.667` loop: a body drag by about +0.5 s with Alt held through the whole drag | the start is free (ms resolution) and the length stays exactly `1.334` (ms length kept, bypass) |
| GM-BRACE-KEYS | same loop, brace focused (REAL click on the brace): ArrowRight, ArrowRight, ArrowLeft; Shift+ArrowRight. Then turn Snap off with a REAL click on the Snap button, click the brace again and press ArrowRight | `2.000 — 3.333`, `2.667 — 4.000`, `2.000 — 3.333`; end `4.000`; then start +0.100 with the length unchanged. The status shows the `Loop: …` text each time |
| GM-BRACE-PLAY (real audio) | loop `2.000 — 3.333` on the music clip, Snap on; REAL Space from inside the loop and play for ≥ 6 s | the position readout wraps from ≤ `00:03.333` to ≥ `00:02.000` at least 3 times; the music meter stays non-silent across every wrap (no dropout, no stop). A 1 ms difference is not measurable by the meter: record that |
| GM-NUDGE | round 67's row (from 2.000 at 90 BPM 1/4) | `2.667`, `3.333`, `2.667`, `2.000`, `1.333` (unchanged) |
| GM-GROUP | round 67's row | the anchor on a `round(k × 2/3, 3)` line; the other clip keeps its offset (±0.001, **deliberate**, §0.1) |
| GM-GROUP-CLAMP (best effort) | BPM 120, `1/32`, Snap on, maximum zoom. With Snap off, place SFX clip A at 0.069 and a music clip B (the anchor) at 0.1, then select both (Ctrl+click). Snap on. REAL-mouse drag of B far left (past 0) | B `0.063`, A `0.032`; today's code gives B 0.062. **If the fixture cannot be built** (e.g. clip-edge snapping interferes), record "not run (fixture)" with the reason; GM11 stands as unit evidence and it does not gate `browserVerified` |
| GM-G1 (control, whole-ms) | round 67's R14-G1 row at 120 BPM 1/4 | multiples of 0.5 (unchanged) |

### 4.7 Regressions (directly related)
- **SN-REG (no BPM):** 1 s and `0.5 წმ` grid drags land on lines; the `1`/`2` end messages are unchanged.
- **LB-REG (seconds loop brace, round 51 LB-MOVE/LK-1):** no BPM, 1 s grid, Snap on. A brace body drag lands on whole seconds and keeps the length; ArrowRight moves the loop by one line with the length kept; Snap-off ArrowRight moves it by 0.1 s.
- **GM-KEYS-REG:** at 120, `1/4` → `1` ×3 → `1/32`, then the end message (unchanged).
- **REG-HYD:** no hydration warning in the console on the `/studio-lab` load.

### 4.8 G68-3 — anonymous workspace and purchase protection
- Use a fresh browse state.
- `/studio-lab`, opened directly and via the header link, shows the workspace with the demo badge.
- No requests to `/api/studio-token`, `/api/recording-*`, `/api/download` or R2 (`r2.cloudflarestorage`, `r2.dev`, `r2-proxy`, `workers.dev`), and no `Authorization` header from workspace code. This holds for every §4.6–§4.7 run.
- `/studio/middle-east` shows "Sign in required".
- Anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → **401**; a fake Bearer → **403**.
- **Known and allowed:** root `GET /api/cart`, GA consent-denied events, GTM, dev modules, the homepage Unsplash image and the homepage R2 cover image, Google Fonts.

### 4.9 Ableton
Give two verdicts for each §0.2 row: the CZABA requirement (PASS/FAIL) and the Ableton match (confirmed / deliberate difference / unconfirmed / not applicable).

### 4.10 Not run this round, and carried items (honest)
- **Not run:**
  - video sync and C-R27-01;
  - the full find → add → fit video → export flow (no export change);
  - the FB-01..FB-16 stage regression;
  - `npm run test:e2e:smoke` (root);
  - triplets (stage 5b, next).
- **Round-67 rows not re-run** because this round does not touch their code: GM-NOBPM, GM-OPTIONS, GM-90, GM-POS, GM-TRIM-RANGE, GM-DROP, GM-MENU, GM-TEMPO, GM-CLEAR, GM-SNAPOFF, GM-PLAY, GM-UNDO, GM-LAYOUT, TB/MT/RU-REG. Their round-67 PASS stands for the unchanged `grid-divisions.ts`/`StudioWorkspace.tsx`/`ArrangementGridMenu.tsx` (frozen list).
- **Tech Lead:**
  - R67-T;
  - **R68-T:** in your Chrome at 90 BPM, `1/4`, Snap on, move a loop with the mouse and the arrows. Does it keep its musical length and stay on the beats?
- **Carried (Lows batch / own tasks):** see `b-round-67.md` §6.

## 5. Commands

```bash
cd C:/Apps/czaba-project/store
git rev-parse HEAD
git status --short
sha256sum -c ../tmp/studio-real-loop/b-round-67-r68-tree-sha256.txt | grep -vc ': OK$'
(cd ../tmp/studio-real-loop/b-round-67-r68-snapshots && sha256sum -c SHA256SUMS.txt)
for f in app/lib/arrangement/grid.ts app/lib/arrangement/loop.ts app/components/arrangement/ArrangementLoopBrace.tsx app/contexts/ArrangementContext.tsx app/lib/arrangement/__tests__/grid-musical.test.ts app/lib/arrangement/__tests__/grid-musical-ui.test.tsx docs/implementation/2026/quarter-IV/060-studio-lab-musical-grid-divisions.md; do cmp -s "$f" "../tmp/studio-real-loop/b-round-67-r68-snapshots/$(basename "$f")" && echo "same $f" || echo "changed $f"; done
node -e "const fs=require('fs');for(const f of process.argv.slice(1)){const s=fs.readFileSync(f,'utf8');console.log(f,'CR',(s.match(/\r/g)||[]).length,'LF',(s.match(/\n/g)||[]).length)}" app/lib/arrangement/grid.ts app/lib/arrangement/loop.ts app/components/arrangement/ArrangementLoopBrace.tsx app/contexts/ArrangementContext.tsx
node --experimental-strip-types ../tmp/studio-real-loop/b-round-67/live-probe.ts
npx vitest run app/lib/arrangement/__tests__/grid-musical.test.ts app/lib/arrangement/__tests__/grid-musical-ui.test.tsx app/lib/arrangement/__tests__/grid.test.ts app/lib/arrangement/__tests__/loop.test.ts app/lib/arrangement/__tests__/grid-snap-loop-drop.test.tsx app/lib/arrangement/__tests__/grid-snap-keys.test.tsx --reporter=verbose
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app
npx biome check app/lib/arrangement/grid.ts app/lib/arrangement/loop.ts app/components/arrangement/ArrangementLoopBrace.tsx app/contexts/ArrangementContext.tsx app/lib/arrangement/__tests__/grid-musical.test.ts app/lib/arrangement/__tests__/grid-musical-ui.test.tsx
npm run verify
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
tasklist | grep -ci node.exe
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5173/studio-lab
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5199/api/products
```

After the change, `live-probe.ts` must print `0.188` for M1, `0.125` for L1 floor and `-0.037` for L1 ceil.

## 6. Requests to root (non-gating for A)

1. **Commit unit:** rounds 67 + 68 together, only after a C PASS of round 68. Round 67 alone is not commit-ready (C FAIL).
2. **ARCH-CHECKPOINT-SRW14-PREFS, fifth request.** Accumulated risk on one owner: the grid precision rule needed a fix round. Please run the bounded read-only frontend-architect (`store/.claude/references/architecture-checkpoint.md`) on:
   - (a) the grid/tempo preferences in `StudioWorkspace` vs one local hook. A's round-67 reviewer proposes it after 5b, with its exact surface and invariants in `a-round-67.md` §6;
   - (b) **the time-precision rule**, now "stored lines `L(m)`, nearest strictly beyond, whole-ms storage". Should one `time-precision.ts` own it for grid, loop and nudge? Include the ruled-deliberate clip-end/group-offset ms rule;
   - (c) the shared UI test harness;
   - (d) grid-menu state;
   - (e) the focus-release predicate;
   - (f) the metronome buffers in the provider.

   **Answer format:** keep/extract, value, risk, ≤ 3 sentences each. An approved change becomes its own B task. **Round 68 does not wait.**
3. **INFO-R61-FAKEBEARER-500, INFO-C65-LS-SESSION:** unchanged, root's notes.

## 7. Reports and next

**A → `../tmp/studio-real-loop/a-round-68.md`:**
1. pre-flight gate (with the files read), baseline and red run;
2. diff summary per file with EOL counts;
3. GM10–GM12 and GU12–GU14 with alone durations;
4. mutations a–i;
5. smoke;
6. code-reviewer findings, dispositions and any Architecture note;
7. verbatim command tails incl. `node.exe`, `live-probe.ts` and `npm run verify`;
8. deviations.

Do not claim PASS. On a stop condition, stop and report.

**C → `c-round-68.md` and `c-round-68.json`** (usual schema with `browserVerified`):
- each ID PASS, FAIL with a bug ID, or **not run** with the reason;
- two verdicts for the Ableton rows;
- `passed` lists only IDs run this round;
- commit readiness for rounds 67 + 68.

**Next (orientation only):**
1. C bugs from this round first.
2. **SRW-14 stage 5b:** triplets (Live 6.10 triplet mode).
3. One perf round: ROOT-R66-M1 + ROOT-R65-M1, on evidence (MT-SCRUB-INFO round 67: 0 long tasks, max gap 21.9 ms with the metronome on).
4. SRW-16 (FB-10), SRW-17 (FB-12), SRW-18 (FB-06), SRW-19 (FB-07), SRW-20, SRW-24 follow-ups.
5. The Lows batch; SRW-21; the full regression and root review; T12.
