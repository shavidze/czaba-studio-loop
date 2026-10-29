# Round 240: SABA-B-11b-FIX-1 — adaptive `1`/`2` count as a hand-chosen grid (GATE239-S2), and the density model is ruled and pinned (GATE239-S1 + C-R239-01, GATE239-S3)

**Planned by:** B, at the round 239 → 240 planning, 2026-10-29. **Decisions:** D-29z360…D-29z366.

**Type:** bug-fix round. It covers one Medium plus two tightly related Lows, all in one function (`stepGridDivision`) of SABA-B-11b stage 1:
- Round 239 passed C (`c-round-239.json`: 17 rows passed, `browserVerified: true`).
- Gate 239 published `d0afa64` on both remotes. Its reviewer listed two Mediums (`gates/round-239/review.md` #1 and #2).
- Under the bug gate, a Medium comes before new scope, so SABA-B-11b stage 2 waits for round 241.

**Regression and RETRO:**
- The regression round is not due. `regression-last.json` = 2026-10-27, so it is due on or after 2026-10-30, and today is 2026-10-29.
- RETRO is not due; the next one is RETRO 245.

**Read first:** `lessons.md` in full. Directly relevant:
- L10 (this task carries the ruling A asked for in `a-round-239.md` §6);
- L23 (B's pre-check, done: §0.2);
- L26 and L28 (doc 186);
- L29 (recipes B ran in Chromium: §0.3);
- L31 (timeouts);
- L33 (a regression A's change causes is a STOP);
- L49 (new: a branch that replaces a call re-applies that call's side effects).

**Not this round.** These are SABA-B-11b stage 2, round 241, unless the regression round is due by then:
- the `4` key as Snap;
- the Adaptive / Fixed and density items in the lane grid menu, plus GATE239-S4 (the mode must be readable without hover);
- "snap never lands on an invisible grid".

Also not this round:
- SABA-B-10a/10b/9/11c;
- SABA-B-7 (`awaiting_user`);
- GATE239-S5 (the title helper, `deferred_low_polish`);
- every other deferred Low;
- the purchased route `app/routes/studio.$productId.tsx` (protected; SRW-21 `deferred_user`).

## 0. Baseline and scope

**Start state:** clean tree.
- HEAD = `d0afa6409184dcab951309e7079b780a1b65366c` (gate 239 `published`).
- `git status --short --untracked-files=all` is empty (`b-round-239/git-status-at-planning.txt`, `b-round-239/head-at-planning.txt`).
- **STOP (L11)** if HEAD differs or any path is dirty. One exception: a root commit that touches only the 4 root files; re-hash those and continue.

**Frozen:** `b-round-239-r240-tree-sha256.txt`, **1,101** files. That is every tracked file except the 3 grants and the 4 root files (1,108 tracked).
- At planning, `sha256sum -c --quiet` from `store/` gives rc 0.
- Each protected auth and purchase file is in the list exactly once (checked): `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx`, `app/lib/__tests__/download-routes.test.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `app/entry.server.tsx`.
- Also frozen: `grid-divisions.ts`, `strings.ts`, `shortcuts.ts`, `grid-adaptive.test.ts`, every other grid and tempo test (including `tempo-seed-ui.test.tsx`), `ArrangementGridMenu.tsx`, `ArrangementContext.tsx`, `.claude/**`, `CLAUDE.md` and every config file.

**Root-owned, must equal HEAD:** `b-round-239-r240-root-files.txt` (`package.json`, `package-lock.json`, `vite.config.ts`, `vitest.config.ts`). Start hashes are in `b-round-239-r240-root-files-start-sha256.txt`. No dependency is needed.

### 0.1 Grants (`b-round-239-r240-grants.txt`; start hashes in `b-round-239-r240-grants-start-sha256.txt`)
| # | Path | Change |
|---|---|---|
| 1 | `app/components/arrangement/StudioWorkspace.tsx` | **The adaptive branch of `stepGridDivision` only** (HEAD l.1547–1577). Two changes: <ol><li>Move the `if (next === null) { …gridDivisionEndMessage…; return; }` block so it runs before the density loop (GATE239-S3; same behaviour, §2.2).</li><li>Add `gridHandChosenRef.current = true;` after both refusal guards (family end, density limit) and before `gridDensityRef.current = density;` (GATE239-S2).</li></ol>No other line changes: not `toggleGridTriplet`, `toggleGridMode`, `changeGridDivision`, the seed effect or the fixed branch. |
| 2 | `app/lib/arrangement/__tests__/grid-adaptive-ui.test.tsx` | Additions only, plus one title fix: <ul><li>GAU12 gains 3 statements at its end (zoom back to 40 px/s → `'5'`, mode adaptive);</li><li>new rows GAU14–GAU17 (§2.3) at the end of the describe;</li><li>the describe title's decision id `D-29z352` → `D-29z356` (GATE239-S6, trivial: D-29z352 is the round-238 closures, D-29z356 is the SABA-B-11b stage-1 decision).</li></ul>No existing `expect(` is removed or changed. |
| 3 | `docs/implementation/2026/quarter-IV/186-saba-b-11b-adaptive-grid.md` | <ul><li>l.4 exactly: `**სტატუსი:** In Progress (stage 1 of 2; C round 240 PASS)` (L28 re-dispatch rule);</li><li>`## მიდგომა`: one paragraph on the density model ruling (D-29z361);</li><li>`## პრობლემები და გადაწყვეტები`: Problem → Solution bullets for GATE239-S2, GATE239-S1/C-R239-01 (the ruling, with no code change) and GATE239-S3;</li><li>`## ტესტირება`: GAU12 (extended) and GAU14–GAU17, plus the two mutants;</li><li>`## TODO`: the stage-2 list keeps GATE239-S4.</li></ul>No other section changes. |

- **The applied diff:** grants 1 and 2 are exactly `b-round-239/precheck-scratch.diff` (110 lines). `git apply --check -p1` on the store tree gives rc 0. **A may apply it as is**, then write grant 3.
- **Read before editing:**
  - `AUDIO_ARCHITECTURE.md` (Studio file; no audio change);
  - `TESTING_QUALITY_GATES.md` and `BUG_HUNTING_TESTS.md`;
  - `GEORGIAN_DOCS.md` (doc 186);
  - `.claude/prompts/studio-feature.md`.

  No new export; no class, colour or layout change.

### 0.2 B's pre-check (L23, done)
B worked on a copy of HEAD in `/tmp/b240-scratch`, outside the repo and the loop folder, with `node_modules` symlinked.
- **Covering set** (`b-round-239/covering.txt`, **41 files**): round 239's 39 files plus both `grid-adaptive*` files. A grep of `gridHandChosen|tempo-seed|addSource('stem|data-grid-mode` in `app/**/*.test.tsx` adds no new file (it finds `grid-adaptive-ui`, `tempo-seed-ui` and `tempo-seed-search-ui`, which are already in the set).
  - Result: **41 files, 680/680 green** (676 + 4 new), rc 0 (`b-round-239/covering.log`).
- `npx tsc --noEmit` gives rc 0 (`b-round-239/tsc.log`). `npx biome check` on the 2 code and test files is clean.
- **Red proofs** (runs of `grid-adaptive-ui.test.tsx` on the scratch copy):
  - HEAD code with the new tests: GAU16 red, the other 16 green. This proves GATE239-S2 on HEAD.
  - MU-FLAG-MISSING (the new flag line deleted): GAU16 red.
  - MU-FLAG-BEFORE-GUARDS (the flag set at the top of the adaptive branch, before the guards): GAU17 red.
- **Collisions with frozen tests:** none. No frozen test pins "adaptive `1` then a seed" (the gate reviewer also found none). TU5 (`tempo-seed-ui`) chooses `0.5` in the select, which goes through `changeGridDivision` and is unchanged.
- **Timeouts (L31):** at gate 239, `grid-adaptive-ui.test.tsx` took 4,987 ms for 13 tests under `{ timeout: 15_000 }` per describe. On the scratch copy, 17 tests took 2,498 ms; the slowest was GAU6 at 516 ms. No test is near 50 %.

### 0.3 Recipes and signals (L29, run by B in Chromium)
The script is `b-round-239/probe-240.cjs`. B ran it against HEAD (`:5173`) and against the scratch build (`:5174`) at 1440×900 and 1280×720, with a fresh context per recipe and 0 page errors. Results: `probe-240-head.json` and `probe-240-scratch.json`. The first scratch attempt timed out on a cold Vite start; that attempt is environment-invalid and is kept as `probe-240-scratch-attempt1.err`.

| Recipe | HEAD | After the fix |
|---|---|---|
| `1`, then Enter on `demo-synth-mix` (120 BPM) | `adaptive 1/4`, `Snap on — grid 1/4 (G)`: **the bug**. The user's 0.5 s is replaced. | `adaptive 0.5`, Snap on, `data-bpm` 120, status ends `Snap on — grid 0.5 s (G)` |
| Control: no key, then Enter | `adaptive 1/2`, `Snap on — grid 1/2 (G)` | identical |
| C-R239-01: `1` `1`, `=`×10, `2`, `−`×10 | 0.25 → 0.1 → 0.25 → `2` | identical (the ruled model, §2.1) |

- **Signals:** these are the same as in round 239, and each renders in every state used here:
  - `[data-testid="arrangement-grid-control"]` with `data-grid-mode`, `data-grid-division` and `data-snap`;
  - the status `[data-testid="arrangement-status"]`;
  - `[data-testid="arrangement-bars-ruler"]` `data-bpm`.
- **The seed recipe:** focus the first `button` inside `[data-source-id="demo-synth-mix"]` and press Enter, then blur. Wait for `Demo collection ready` first (L48).

## 1. Why
**GATE239-S2 (Medium, a regression from round 239).** The 11a contract (`tasks/round-234.md` l.160, TU5) says: a division change that the user makes before the tempo seed is kept, and the seed does not replace it.
- At HEAD `15a0b41`, `1`/`2` went through `changeGridDivision`, which sets `gridHandChosen`.
- Since round 239, adaptive `1`/`2` change the density instead, and nothing sets the flag. So `1` (0.5 s) followed by adding a BPM asset switches the grid to the musical family. The user sees `1/4`, not their 0.5 s.
- B reproduced this in Chromium on HEAD at both viewports (§0.3).

**GATE239-S1 (gate: Medium) and C-R239-01 (C: Low): a ruling, not a code fix (D-29z361).** Both say that after a key press at a clamped family end, a zoom back shows a wider grid than the user's net key count.
- **The fix the gate reviewer proposed does not change the behaviour.** That fix was `effective = base − indexOf(current)`, then `density = clamp(effective + step)`. B compared it with A's loop in `b-round-239/eq.mjs` and `eq2.mjs`:
  - the seconds family, plus the straight and triplet families at 60, 90, 120 and 174 BPM;
  - 0.5…320 px/s;
  - every density;
  - both directions.

  `eq2.mjs` ran 19,710 cases (9 family lines × 2,190) and `eq.mjs` ran 960 more (seconds only, coarser zoom steps), with **0 differences** in both. Under the proposed formula, the reviewer's own scenario still gives 5 s.
- **No model satisfies both goals at a clamped end.** The two goals are "every key press moves the visible grid one step" and "zooming back shows the net key count".
  - Example: at 320 px/s with density −2, the seconds family is clamped at 0.1 s. Levels −2, −1 and 0 all show 0.1 s.
  - So an absolute level model makes the first one or two `2` presses visibly do nothing. Round 239's reviewer rated exactly that as Medium #2, and A fixed it.
- **Ruling:** the density is re-anchored to the visible pick on each press, which is A's model as shipped. Each press moves the visible grid by exactly one step, or it gives the family-end text or the density-limit text. The stored density describes what is on screen relative to the zoom base, which is also what the stage-2 menu's checked density item will show.
- C-R239-01 and GATE239-S1 close as **by design** once GAU12, GAU14 and GAU15 pin the zoom-back values and C sees them in the browser.
- Live's manual does not describe a density at a clamped end (§3), so Saba is asked once: **SABA-Q-11B-DENSITY-MODEL** (L44, non-blocking).

**GATE239-S3 (Low, owned code, cheap):** the family-end check runs after the loop, so at a family end the loop runs for nothing. Moving the check before the loop changes no outcome (the same simulation covers the end case).

## 2. Changes

### 2.1 The density model (no code change; this is the ruling)
In adaptive mode, `1`/`2` with `current` = the visible pick work like this:
1. If `current` has no neighbour in that direction: the family-end text (`gridDivisionEndMessage`). The density and the flag stay unchanged.
2. Otherwise, the stored density steps until the visible pick changes. If that leaves −2…2: the narrowest or widest text. The density and the flag stay unchanged.
3. Otherwise: store the density, set `gridHandChosen`, and resolve. The status is `Grid: <label> (Snap on|off)`.

Zooming moves the pick with the stored density, silently (round 239, R11).

### 2.2 `stepGridDivision`, the adaptive branch (grant 1; exact code in the pre-check diff)
```ts
if (gridModeRef.current === 'adaptive') {
  if (next === null) { workspaceRef.current.setStatus(gridDivisionEndMessage(current, direction)); return; }
  const densityStep = …; let density = …;
  while (…) { density += densityStep; }
  if (density < GRID_ADAPTIVE_DENSITY_MIN || density > GRID_ADAPTIVE_DENSITY_MAX) { …adaptiveNarrowest/Widest…; return; }
  gridHandChosenRef.current = true;
  gridDensityRef.current = density;
  …unchanged…
}
```
**Why the flag is set only here:**
- **The adaptive branch of `toggleGridTriplet` stays unchanged.** It needs a tempo, and the seed runs only while there is no tempo, so a flag write there could never be observed and no mutant could prove it.
- **`toggleGridMode` (`5`) is not a hand choice.** GAU6 and task 239 §2.2 pin "the seed overrides a frozen fixed pick with 1/4". That contract does not change this round (D-29z362).

### 2.3 New and extended tests (grant 2; exact code in the pre-check diff)
| Row | Case | Expected |
|---|---|---|
| GAU12 (+3 statements) | after `1 1`, zoom 320, `1` (end), `2`, `2`: `setPxPerSecond(40)` | division `'5'`, mode adaptive (the ruled model) |
| GAU14 | C-R239-01: `1 1`, zoom 320 → `0.1`; `2` → `0.25`; `setPxPerSecond(34.359738368)` (= 320 ÷ 1.25¹⁰) | `'2'`, mode adaptive |
| GAU15 | Mirror at the widest end: `2 2` → `'5'`; zoom 0.5 → `'10'`; `1` → `'5'`, status `Grid: 5 s (Snap off)`; zoom 40 | `'0.5'` |
| GAU16 | GATE239-S2: `1` → `0.5`; then `addSource('stem-90')` | tempo `90`, mode adaptive, division `'0.5'`, status ends `Snap on — grid 0.5 s (G)` |
| GAU17 | A refused key is not a hand choice: zoom 320 → `0.1`; `1` → exact `The grid is already at its narrowest — 0.1 s (1)`; `addSource('stem-90')` | tempo `90`, mode adaptive, division `'1/32'`, status ends `Snap on — grid 1/32 (G)` |

**Mutants.** A runs them on a scratch copy outside `store/` and reports the red rows; the final files contain no mutant.
- **MU-FLAG-MISSING** (delete the new line): GAU16 red.
- **MU-FLAG-BEFORE-GUARDS** (set the flag as the first statement of the adaptive branch): GAU17 red.

### 2.4 Doc 186 (grant 3)
- l.4 byte-exact as in §0.1.
- The headings stay the 7 TEMPLATE headings, in order (L26).
- Cite only rows that exist (grep `GAU1[2-7]`).
- State the equivalence (`eq2.mjs` 19,710 cases, `eq.mjs` 960, 0 differences) and the reason the absolute level model was rejected (round-239 reviewer Medium #2).

## 3. Reference: how Ableton Live 12 does it
This is a bug-fix round, so the full reference-first table is not required (policy: "Not in scope … bug-fix"). The two points the ruling touches:

| # | Behaviour | Source | Live (status) | CZABA | C check |
|---|---|---|---|---|---|
| F1 | Narrow/widen when the grid is already at its finest or widest | [Live 12 manual 6.10](https://www.ableton.com/en/live-manual/12/arrangement-view/) (read by B and C through WebFetch on 2026-10-29): it says only that Ctrl/Cmd+1 "narrows the grid, doubling the density" and Ctrl/Cmd+2 widens it | **no reference found** for a clamped end. Live's beat grid reaches far finer values, so the clamp is rare there. | re-anchor to the visible pick (D-29z361) → SABA-Q-11B-DENSITY-MODEL | C-DENSITY-MODEL-240 |
| F2 | A tempo change does not overwrite a grid the user set | none in Live: Live has no catalogue tempo seed | n/a | the 11a contract (TU5), now also for adaptive `1`/`2` | C-HAND-240 |

**Deviations:** none new. ⚖1–⚖2 and R9 from round 239 still wait for Saba.

## 4. A: checks to run (speed rule: no full suite, no `verify`)
1. Start-state check (§0): HEAD, a clean status, and `sha256sum -c` on the frozen, root and grant-start lists.
2. Apply `b-round-239/precheck-scratch.diff`, then write grant 3.
3. `npm run typecheck` rc 0; `npx biome check` on grants 1 and 2 clean; `npm run lint` rc 0.
4. `npx vitest run $(cat ../tmp/studio-real-loop/b-round-239/covering.txt)`: 41 files, all green (680 expected). Any test above 50 % of its timeout goes at the top of the report (L32).
5. The 2 mutants (§2.3) on a scratch copy outside `store/`.
6. `code-reviewer` is **required** (3 changed files = 3+, project rule). Pass its Architecture note to B.
7. Playwright against `:5173` at both viewports: copy `b-round-239/probe-240.cjs`, do not edit it in place. Expect the "after" column of §0.3.
8. Write `a-round-240.md`: the changed hunks, the tests run with counts, the mutants, any STOP at the top.

## 5. C: acceptance
Real Chromium on `/studio-lab` at 1440×900 and 1280×720, with a fresh context per row. Wait for `Demo collection ready` first (L48).

| Row | What | Pass when |
|---|---|---|
| C-SCOPE-240 | HEAD, status, hashes | <ul><li>HEAD is `d0afa64`, and only the 3 granted paths are `M`.</li><li>`sha256sum -c` on `b-round-239-r240-tree-sha256.txt` (1,101) and on the root list gives rc 0. The 7 protected files give `git diff --quiet HEAD` rc 0.</li><li>Grant 1: every `git diff -U0` hunk lies inside `stepGridDivision`. The `+` lines are the moved end-check block and `gridHandChosenRef.current = true;`; the `-` lines are only the moved block.</li><li>Grant 2: 0 removed `expect(` lines. The only removed line is the describe title.</li></ul> |
| C-UNIT-240 | `b-round-239/covering.txt` (41 files) | All green, including GAU1–GAU17. The full suite is a gate row. |
| C-MUT-240 | MU-FLAG-MISSING and MU-FLAG-BEFORE-GUARDS, once each, on a scratch copy outside the repo | GAU16 red, then GAU17 red. The repo status is identical before and after. |
| C-HAND-240 | (a) `1`, then the `demo-synth-mix` seed. (b) `2`, then the seed. (c) A control with no key, then the seed. | <ul><li>(a): `data-bpm` 120, `adaptive`, `0.5`, Snap on, and the status ends exactly `Snap on — grid 0.5 s (G)`.</li><li>(b): `adaptive`, `2`, and the status ends `Snap on — grid 2 s (G)`.</li><li>(c): `1/2`, and the status ends `Snap on — grid 1/2 (G)`.</li><li>Both viewports, 0 page errors.</li></ul> |
| C-REFUSED-240 | `=`×10 (320 px/s) → `0.1`; `1` → the exact `The grid is already at its narrowest — 0.1 s (1)`; then the seed | `adaptive`, a straight musical division whose painted lane period is ≥ 24 px while the next finer one would be < 24 px (expected `1/16` at 120 BPM and 320 px/s), and the status ends `Snap on — grid <that label> (G)`. |
| C-DENSITY-MODEL-240 | (a) The C-R239-01 recipe: `1 1`, `=`×10, `2`, `−`×10. (b) The reviewer's recipe: `1 1`, `=`×10, `2 2`, `−`×10. (c) The mirror: `2 2`, `−`×20, `1`, `=`×20. | <ul><li>(a) ends `2`. (b) ends `5`. (c): C records the final division and checks it against §2.1, starting from the density stored after `1`.</li><li>On every `1`/`2` press in (a)–(c), the visible division moves exactly one family step, or the status shows the family-end text or the density-limit text. **No press leaves both the division and the status unchanged** (no swallowed key).</li><li>The mode stays adaptive.</li></ul> |
| C-SEED-REG-240 | Neighbours: (a) choose `0.5 s` in the select, then the seed. (b) `5`, then the seed. (c) `3` with the seed's BPM. | <ul><li>(a): `fixed 0.5` is kept (TU5).</li><li>(b): `fixed 1/4`, and the status ends `Snap on — grid 1/4 (G)` (GAU6 contract, unchanged).</li><li>(c): a triplet member, still adaptive, as in round 239.</li></ul> |
| C-GRID-REG-240 | Short re-run of C-ADAPT-SEC-239 (mount, then `=`×6) and C-DENSITY-239 (`1`×3, then `2`×5 at the load zoom) | The same divisions and exact status texts as `c-round-239.md`. The zoom is still silent: the MutationObserver count on `output[aria-live]` does not change on any zoom step. |
| C-BUDGET-240 | L39 | The persistent text lines outside the timeline match round 239: empty 85/69, demo 101/85 at 1440/1280. Nothing new is added. |
| C-REF-240 | §3 | <ul><li>Each of F1 and F2 is judged twice, against the CZABA requirement and against Live.</li><li>SABA-Q-11B-DENSITY-MODEL appears once in `backlog.json`.</li><li>**Independent check of the D-29z361 evidence:** C runs `node b-round-239/eq2.mjs` and `node b-round-239/eq.mjs` from the loop folder. Expect `diffs 0` on all 9 lines of `eq2` and on the one `eq` line. C reads the scripts and confirms two things: `rev()` is the gate reviewer's formula (`base − indexOf(current) + step`, with the ±2 refusal), and `cur()` mirrors HEAD's loop.</li></ul> |
| AN-REVIEW-240 | Doc 186 | l.4 is byte-exact. The 7 headings are in order. It cites only existing row ids. It states the ruling and the equivalence counts (19,710 + 960). |
| LAB-SMOKE-240 | `/studio-lab` | It loads. Space plays and pauses. The export WAV for the untouched demo has sha256 `1fea093b975946c800329006e1c9943560bf3ac3cb86e361f2cd4628ce033f94`, the same as rounds 237–239. 0 page errors. |
| Auth | Standing check | In a fresh context: `/studio-lab` opens anonymously with `auth_user` null. `/studio/middle-east` shows "Sign in required" with no workspace and no `audio[src]`. `/api/studio-token` with no header returns 401. |
| Purchased origin (browser) | The grid on the purchased copy | BLOCKED: backend unavailable in cloud. Grant 1 has no origin branch: grep `origin` in the grant-1 hunks = 0. |
| gate | Full vitest, typecheck, lint, build, `npm run verify`, e2e smoke | Listed as `gate`, not claimed in `passed`. |

## 6. Neighbouring behaviour that could break (C probes these first)
- **The seed after a refused key:** `gridHandChosen` must stay false after a refusal. This covers both the family end (GAU17, C-REFUSED-240) and the density limit (the third `1` at 40 px/s; the first two `1` presses were accepted, so the flag is already true there).
- **The fixed branch** of `stepGridDivision` still goes through `changeGridDivision`. `grid-snap-keys` and `grid-triplet-ui` are in the covering set.
- **The family-end text at an adaptive end** is unchanged: GAU12 pins `The grid is already at its narrowest — 0.1 s (1)`.
- **Tempo clear after an adaptive hand choice** (round-239 A §5b note: the density carries over into the seconds family): the behaviour is unchanged, and it is recorded as intended (D-29z365).

## 7. Outcomes for B's next planning
- **PASS and gate published:** GATE239-S2 and GATE239-S3 are closed. GATE239-S1 and C-R239-01 are closed by ruling (D-29z361), and GATE239-S6 is closed.
  - **Next:** if the next planning is on or after 2026-10-30, the REGRESSION round comes first. It uses the adaptive contract of C-ADAPT-*-239 and the hand-choice rule of C-HAND-240.
  - **Otherwise:** SABA-B-11b stage 2 (`4`, the menu's Adaptive/Fixed and density items with GATE239-S4, no snap on an invisible grid; it closes ABL-R-8).
- **FAIL:** a fix-up on the same grants.
- **If Saba answers** `AGREE-SABA-B-7.md` or SABA-Q-11B-*: B schedules the answer after the running stage.
