# CURRENT TASK — Round 71: ROOT-R66-M1 (SRW-15 perf) — horizon-based metronome clicks without a loop (D-29z36)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-21
- **Workflow:** `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09), with these addenda: Ableton 2026-10-11, periodic commits 2026-10-13, behavioural reverse-engineering 2026-10-14, architecture checkpoint, user priority 2026-10-15, Loop v2 2026-10-19.
- **Decision record:** **D-29z36** in `docs/technical/studio-real-workspace/plan.md`. Rationale: `b-round-70.md`. Previous task: `tasks/round-70.md` (an exact copy).
- **Round size:** one Medium bug (ROOT-R66-M1-METRONOME-HORIZON) with one owner (A), plus two one-line doc status fixes (DOC-059-STATUS-LINE, ROOT-R70-L6).
- **Why now:**
  - C round 70 was a **PASS** with `browserVerified: true` and no bugs (`c-round-70.md`, `c-round-70.json`).
  - Root published it as **`2be45df`** on both remotes (`gates/gate-round-70.json`: `published`), which closes ROOT-R65-M1.
  - ROOT-R66-M1 is the last open reviewer Medium. `b-round-69.md` §4 scheduled it as round 71.

> **Servers.** B checked on 2026-10-21 at 17:19 +04: `/studio-lab` **200**, `:5199/api/products` **200**, 11 `node.exe` processes. A and C each check both servers at the start of their phase and record the result. Agents never start or stop servers.
> - **If `:5173` is down:** mark every browser item "not run (environment)" and set `browserVerified: false`. No browser row may be marked PASS.
> - **If only the backend is down:** run everything except G71-3's token rows. Mark those rows "not run (environment)".
>
> **Browse rules** (`backlog.harness_rules`, unchanged):
> - Never use `$B restart`. Use a **new** `BROWSE_STATE_FILE` under your own round folder.
> - After one CLI-daemon failure, switch to the approved `server-node.mjs` fallback with `BROWSE_PARENT_PID=0`. Record its PID and log, and stop only your own process.
> - **GSTACK-NO-MOUSE:** drags, held presses and the wheel use standalone Playwright (installed chromium, fresh context, no install). Label these **REAL-mouse (PW)**. Plain clicks and typing can use gstack (REAL) or PW.
> - **ENV-EXT-LOAD-HANG:** wait for `domcontentloaded`, then for the workspace selector, then 4 s. Record it.
> - **INFO-R62-GEPLAY-UNDO:** record the Undo title before every Ctrl+Z.
> - **INFO-C65-HARNESS-R2-REGEX:** the forbidden-host filter must match `r2-proxy` and `workers.dev` in **every** page script.
> - **INFO-C69-METER-POST-ACCENT (applies this round):** detect metronome onsets as a rise of ≥ 3 dB to ≥ −15 dB, with a 0.25 s refractory period. Fix the detector before the run and record it.
>
> **Machine load:** record `tasklist | grep -ci node.exe` on every run. Create and remove scratch junctions with `cmd //c mklink /J …` and `cmd //c rmdir …`, with stdin from `/dev/null`. Never run `npx <pkg>` for a package that is not in `node_modules`.

## Why this round

**Round 70 result: PASS** (`c-round-70.md`). C ran every row and every starred row at both viewports: G70-1/2/3, R70-S, R70-U (mutations a–k killed), BR-COUNT*, BR-SCROLL*, BR-ZOOM, BR-FOLLOW, BR-RESIZE, BR-90*, BR-LOOK*, TB-REG, RU-REG, TR-RULER-REG and REG-HYD. The DOM now holds 96–144 marks (it was 2215), and the zoom step takes a median 25.8 ms (it was 69–107 ms).

**The defect (ROOT-R66-M1, `gates/round-66/review.md` #1).** Without a loop, `startGraph` (`ArrangementContext.tsx` ~753–763) plans every click from `from` to `projectEnd(arrangement)` in one go, with one `AudioBufferSourceNode` per click.
- Every resync creates the whole set again: Play, seek, schedule-key change, metronome toggle, tempo change, and the scrub reschedule every 100 ms (`SCRUB_RESCHEDULE_INTERVAL`).
- A retired graph stays alive for 250 ms, so during a scrub about three graphs exist at once.
- Example: the 133 s demo timeline at 999 BPM is ~2200 click nodes per resync, or ~22 000 per second of scrubbing.
- The loop path already refills each iteration through `appendClicks`. **Fix: plan clicks only up to a horizon ahead of the audio clock, and refill from `pumpPlaybackAudio`**, as the reviewer proposed.
- C's round-67 MT-SCRUB-INFO measured nothing because it ran at 120 BPM on a short project. This round measures the worst case (MH-NODES, MH-SCRUB-PERF).

## Baseline

Measured by B on 2026-10-21 at 17:19 +04:
- **HEAD `2be45dfea67f8289c77c83c9db47612d34f7c29f`** (round 70, published on both remotes; `gates/gate-round-70.json` `commit`). `git status --short` is **empty**.
- **Valid start:** exactly that state. If root has committed something newer that changes none of the owned or frozen files, record it and continue. Anything else (a dirty tree, a frozen-file or snapshot mismatch) means stop and report.
- **Frozen list:** `../tmp/studio-real-loop/b-round-70-r71-tree-sha256.txt`, **439** entries, 439/439 OK (run from `store/`). It covers every tracked `app/**` and `docs/implementation/**` file except the 5 owned files below. These are **frozen**:
  - `graph.client.ts`, `loop.ts`, `transport.ts`;
  - `metronome.test.ts`, `graph.test.ts`, `loop.test.ts`;
  - every tempo file and every grid file.
- **Snapshots:** `../tmp/studio-real-loop/b-round-70-r71-snapshots/`, with `SHA256SUMS.txt`:

  | File | sha256 prefix | EOL (CR / LF) |
  |---|---|---|
  | `app/lib/arrangement/metronome.ts` | `fc127d80` | 0 / 73 |
  | `app/contexts/ArrangementContext.tsx` | `8488f001` | 0 / 2906 |
  | `app/lib/arrangement/__tests__/metronome-ui.test.tsx` | `d28c64be` | 0 / 468 |
  | `docs/implementation/2026/quarter-IV/059-studio-lab-metronome.md` | `b11052f8` | 0 / 118 |
  | `docs/implementation/2026/quarter-IV/062-studio-lab-bars-ruler-window.md` | `ce5caa15` | 0 / 109 |

- **Protected files:** 4/4 OK (B re-checked).
- **Biome on `./app` (read-only):** **4 errors / 218 warnings / 1 info** (`b-round-70/biome-full.txt`).
- **Vitest baseline:** **99 files / 1683 tests** (`gates/round-70/verify.log`).
- **Line endings:** every owned file is LF. Count CR with node. Never run `biome check --write`, `format --write` or `npm run format`.

**Rules:**
- Do not revert, re-create or reformat anything. The work of rounds 47–70 stays.
- Root owns `.claude/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `AGENTS.md`, `biome.json`, `scripts/**`, the vitest/playwright configs and the agent files.
- Only root commits or pushes.

## 0. Scope

### 0.1 Rule D-29z36: horizon-based metronome clicks without a loop

**Sources:**
- reviewer finding ROOT-R66-M1 (Medium, perf; `gates/round-66/review.md` #1);
- user scope FB-09 (SRW-15 metronome, D-29z31: listening only, never in the export).

**What the user hears does not change.** A click sounds on every beat between the play position and the project end, with the same sound, the same accents and the same times. Only *when* the source nodes are created changes.

**(1) Pure additions in `metronome.ts`** (all additive; every existing export and its behaviour unchanged):
- `export const METRONOME_SCHEDULE_HORIZON_SECONDS = 2;`
  - Rationale: Chrome clamps timers in a hidden tab to about 1 s. The 200 ms audio-pump interval therefore still runs well inside a 2 s horizon. It is the same value as the context's private `LOOP_SCHEDULE_HORIZON`.
- `planMetronomeClicks(bpm, from, until, soundUntil?: number)` gets an optional 4th parameter:
  - **Omitted:** byte-identical output for every input. The frozen M1–M11 stay green unchanged, and so does the loop path, which keeps cutting clicks at `loop.end`.
  - **Given:** the **selection** of beats is unchanged. A beat is selected when its time `t` satisfies `t ≥ from − ARRANGEMENT_EPS` and `t < until − ARRANGEMENT_EPS`. Only the duration changes: `duration = Math.min(METRONOME_CLICK_SECONDS − offset, soundUntil − when)`. A click selected just before a chunk boundary therefore plays its full 30 ms, capped only at `soundUntil` (the project end).
  - If `soundUntil` is not finite or `soundUntil < until`, treat it as omitted. No new `NaN` path.
- `export interface MetronomeHorizonState { bpm: number; from: number; startAt: number; end: number; nextFrom: number }`
- `export function nextMetronomeChunk(state, now, horizon, lateMargin): { from: number; until: number } | null` (pure). It mirrors `refillLoopIterations`, in audio-clock time:
  1. If `state.nextFrom ≥ state.end − ARRANGEMENT_EPS`, return `null` (done).
  2. `chunkCtx = state.startAt + (state.nextFrom − state.from)`. If `chunkCtx > now + horizon`, return `null` (not due yet).
  3. `a = state.nextFrom`.
     - **Late rule:** if `chunkCtx < now + lateMargin`, set `a = state.from + (now + lateMargin − state.startAt)`.
     - In words: skip forward, so the missed beats are **dropped**. They are never started in the past, which would be a burst.
  4. If `a ≥ state.end − ARRANGEMENT_EPS`, return `null`.
  5. Otherwise return `{ from: a, until: Math.min(state.end, a + horizon) }`.

**(2) `ArrangementContext.tsx`:**
- New ref `metronomeHorizonRef = useRef<MetronomeHorizonState | null>(null)`.
- **In `startGraph`**, when `metronomeBpm !== null`, the click buffers exist and there is **no active loop**:
  - The initial clicks are `planMetronomeClicks(bpm, from, Math.min(end, from + METRONOME_SCHEDULE_HORIZON_SECONDS), end)`, with `end = projectEnd(arrangement)`.
  - After `handleRef.current = handle`, set `metronomeHorizonRef.current = { bpm, from, startAt, end, nextFrom: Math.min(end, from + METRONOME_SCHEDULE_HORIZON_SECONDS) }`.
  - `from` and `startAt` must be **exactly the pair passed to `applySchedule`** for that handle. Never recompute them from the anchor at pump time.
  - In every other case (metronome off, active loop), set the ref to `null`.
  - The **loop branch is unchanged:** `planMetronomeClicks(bpm, from, loop.end)` with no 4th argument, plus `fillLoopIterations`.
- **New `fillMetronomeHorizon()`** (`useCallback`, `[]`):
  - It reads `ctx`, `handleRef.current` and the state.
  - Loop: `chunk = nextMetronomeChunk(state, ctx.currentTime, METRONOME_SCHEDULE_HORIZON_SECONDS, LOOP_LATE_MARGIN)`. While `chunk` is not `null`:
    - call `handle.appendClicks(planMetronomeClicks(state.bpm, chunk.from, chunk.until, state.end), state.from, state.startAt)`;
    - set `state.nextFrom = chunk.until`.
  - A late chunk **never** calls `syncPlayback` or `resyncLoopRef`. Only clicks are dropped; the clips are already scheduled.
- **Call sites:**
  - `pumpPlaybackAudio` calls it after `fillLoopIterations` handling and before `releaseRetiredGraphs`;
  - `startGraph` calls it after `fillLoopIterations()`.
- **`stopGraph` sets the ref to `null`.** Every `startGraph` call replaces it. That covers seek, scrub reschedule, tempo change, metronome toggle and edit resync. A retired handle never receives appended clicks.
- No new timer, listener or interval. `pumpPlaybackAudio` already runs from the rAF tick and from the 200 ms `audioPumpTimerRef` interval.
- No change to `graph.client.ts`. `appendClicks` already exists, purges ended click sources and maps `startAt + (click.when − from)`.

**Unchanged:** audio clip scheduling (`planSchedule` still covers the clips to the end), the loop path, the export (no metronome), the status texts and titles, the toggle, history, and the click sound and level.

**Rejected:**
- **Snapping chunk boundaries to beat times.** It works only while the click (30 ms) is shorter than the beat (60 ms at 999 BPM). It also hides the boundary rule in floating-point beat arithmetic. The `soundUntil` cap is explicit and testable.
- **Resync on a late chunk, as the loop path does.** That re-anchors every clip only to recover clicks. Dropping the missed clicks is the smallest honest behaviour, and audio clips are unaffected.
- **Moving `createMetronomeBuffers` out of the provider** (reviewer Signal 1). It stays an ARCH (f) signal, not this round.

### 0.2 Ableton (workflow addendum 2026-10-11)

**Sources:** Live 12 Reference Manual §19.4 / §19.4.1 and §3.1, captured with gstack `/browse` on 2026-10-19 (`b-round-65/metronome-excerpt-20261019.txt`, `b-round-64/live-concepts-20261019.txt`). Re-used; nothing was re-fetched. No video was watched and no Live installation was used.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| The metronome ticks on every beat while playing | §19.4 ("will begin ticking when the Play button is pressed"); §19.4.1 Auto interval | **confirmed** (round 66) | Unchanged: 4/4, a click on every quarter note to the project end | MT-BEATS, MH-END |
| How Live schedules click audio internally | — | **not applicable** (internal; no visible or audible behaviour) | CZABA plans a 2 s horizon and refills it | MH-NODES, MH-SCRUB-PERF |

No report may claim "Ableton does the same" for the scheduling technique.

### 0.3 Source

| File | Change |
|---|---|
| `app/lib/arrangement/metronome.ts` | **Additive**, §0.1 (1) |
| `app/contexts/ArrangementContext.tsx` | §0.1 (2) only: the import, the ref, the non-loop branch of `startGraph`, `fillMetronomeHorizon`, two call sites, and the `stopGraph` reset |
| `app/lib/arrangement/__tests__/metronome-ui.test.tsx` | **Narrow grant, §2.2a** |
| `app/lib/arrangement/__tests__/metronome-horizon.test.ts` | **new**, §2.2b |
| `app/lib/arrangement/__tests__/metronome-horizon-ui.test.tsx` | **new**, §2.2c. Copy only the harness helpers you need from `metronome-ui.test.tsx`; do not import from test files |
| `docs/implementation/2026/quarter-IV/063-studio-lab-metronome-horizon.md` | **new**, §2.5 |
| `docs/implementation/2026/quarter-IV/059-studio-lab-metronome.md` | **two edits only**, §2.5 |
| `docs/implementation/2026/quarter-IV/062-studio-lab-bars-ruler-window.md` | **status line only**, §2.5 |

- **Frozen:** everything else, including `graph.client.ts`, `loop.ts`, `transport.ts`, `tempo.ts`, `StudioWorkspace.tsx`, `ArrangementTempoRow.tsx`, `metronome.test.ts`, `graph.test.ts`, `loop.test.ts`, every other test file and docs 001–058, 060, 061.
- No comments, no `any`, no type assertions, no `@ts-ignore`, no hardcoded colours. Semicolons everywhere.

### 0.4 What could be affected (C checks)

- **The audible click grid:** beats across chunk boundaries (MT-BEATS, MH-LONG), after a seek (MT-SEEK), on a tempo change (MT-TEMPO-CHANGE), on a live toggle (MT-LIVE-TOGGLE), and at the project end (MH-END).
- **Loop playback:** the loop path is unchanged (MT-LOOP).
- **Scrub:** clicks resume on the grid after release (MH-SCRUB). Node creation is bounded (MH-NODES, MH-SCRUB-PERF).
- **Export:** still no click (MT-EXPORT-REG).
- **Expected suite: 101 files / 1683 + the new `it` count** (A records the exact number; the granted UI2/UI4/UI5/UI10 keep their `it` count).

**Out of scope for the whole project:** plugins and effects; pitch; multiple video layers; audio time-stretch. Grid tempo is never audio stretch. `/studio-lab` stays demo-only. Purchase protection and the protected files stay unchanged.

## 1. Mandatory before acting (A)

1. **Read in full before the first edit:**
   - `.claude/rules/read-primitives.md`;
   - the primitives `AGENT_DISCOVERABLE_CODE.md`, `REACT_CONTEXT.md`, `AUDIO_ARCHITECTURE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`;
   - `prompts/studio-feature.md`, `prompts/new-test.md` and `docs/implementation/TEMPLATE.md`.

   Then run the `pre-flight` skill. **Record in `a-round-71/checkpoint.md` which files you read.**
2. **Baseline before any edit:**
   - HEAD and `git status --short` (empty);
   - `sha256sum -c ../tmp/studio-real-loop/b-round-70-r71-tree-sha256.txt | grep -vc ': OK$'` → 0;
   - the snapshot `SHA256SUMS.txt`, and `cmp` for the 5 owned existing files;
   - protected files 4/4; Biome 4/218/1; `node.exe` count; both servers.
3. **Red run first:**
   - Write the two new test files and the §2.2a grant before any source change, then run them.
   - **Expected:** the run fails (the missing export, 16 clicks instead of 4, no appends). Record the output, then implement.
   - The frozen `metronome.test.ts`, `graph.test.ts` and `loop.test.ts` stay green on the baseline. Record that.
4. Post the pre-flight gate and the red run at the top of your report.

## 2. A: the change

### 2.1 Source
Implement exactly §0.1 and §0.3.

### 2.2 Tests

**(a) Grant: `metronome-ui.test.tsx`, these assertions only.** Test names, `it` count, the harness and every other line stay unchanged.

| Test | Lines today | New expectation |
|---|---|---|
| UI2 | 310–316 | `expected = planMetronomeClicks(120, 0, Math.min(PROJECT_END, METRONOME_SCHEDULE_HORIZON_SECONDS), PROJECT_END)`; `toHaveLength(4)` for `expected` and for `clickStarts`. The `startAt` / `startAt + 0.5` checks are unchanged |
| UI4 | 349 | `planMetronomeClicks(120, options.from, Math.min(PROJECT_END, options.from + METRONOME_SCHEDULE_HORIZON_SECONDS), PROJECT_END)` |
| UI5 | 362 | the same with 60 BPM |
| UI10 | 464–466 | the same as UI2, with `from` 0 |
| imports | line 21 area | add `METRONOME_SCHEDULE_HORIZON_SECONDS` to the existing `metronome` import |

UI2's original meaning (a click on **every** beat to the end) moves to HU2, which proves it over the whole playback.

**(b) New `app/lib/arrangement/__tests__/metronome-horizon.test.ts`** (pure; 5 `it`):

| ID | Must assert |
|---|---|
| MH1 default | For the frozen M1–M6 inputs and (999, 0, 133): `planMetronomeClicks(b, f, u)` `toEqual` `planMetronomeClicks(b, f, u, u)`, and `toEqual` the result with `soundUntil` = `NaN` / `Infinity` / `u − 1` (treated as omitted) |
| MH2 chunk invariant | For BPM [40, 60, 90, 92.5, 120, 133.33, 999], `end` [8, 133], and chunk boundaries from (i) `k·2` s, (ii) exact beat times, (iii) beat times ± `ARRANGEMENT_EPS / 2`, (iv) beat + 0.02 (inside a click): concatenating `planMetronomeClicks(b, c_i, c_{i+1}, end)` over the chunks gives the same number of clicks as `planMetronomeClicks(b, 0, end)`. For each click: the beat time `when − offset` is equal within 1e-9; `accent` is equal; the audible end `when + duration` is equal within 1e-9. No beat appears twice. Report failures as `toEqual({ count: 0, first: [] })` |
| MH3 cap | 120 BPM, chunk [0, 2) with `soundUntil` 8: the click at 1.5 has `duration` `METRONOME_CLICK_SECONDS`. Without `soundUntil`, a chunk [0, 1.51) gives the click at 1.5 a duration of 0.01 (old behaviour kept). With `soundUntil` = `until` = 3.51 and beat 3.5, the duration is 0.01 (the project end still cuts) |
| MH4 chunk rules | `nextMetronomeChunk` with `{bpm 120, from 10, startAt 100, end 60, nextFrom 12}`, horizon 2, late 0.02: `now` 99.9 → `null` (chunk ctx 102 > 101.9); `now` 100.5 → `{12, 14}`; `now` 103 (late; chunk ctx 102 < 103.02) → `{ from: 13.02, until: 15.02 }` (`toBeCloseTo(…, 9)`); `nextFrom` 59 at `now` 148 (chunk ctx 149, not late) → `{59, 60}`; `nextFrom` 59 at `now` 149 (late) → `{ from: 59.02, until: 60 }`; `nextFrom` 60 → `null`; `nextFrom` 59 at `now` 152 (late skip to 62.02 ≥ `end`) → `null` |
| MH5 no burst | Simulate the context loop with a random `now` sequence (seeded; jumps 0.01–5 s) on (999, from 0, startAt 1, end 133): every appended click satisfies `startAt + (when − from) ≥ now + lateMargin − 1e-9` at its append time. The union of appended beats is a subset of the full plan, with no duplicates. Every beat that was never skipped is present (beats inside the skipped intervals are absent) |

**(c) New `app/lib/arrangement/__tests__/metronome-horizon-ui.test.tsx`** (mounted provider and `StudioWorkspace`; one `describe` with `{ timeout: 15_000 }`):
- **Fixture:** a 60 s music clip (`end` 60).
- **Fake timers:** UI7's fake timers (`setInterval`, `Date`, …). `FakeAudioContext.currentTime` follows `Date`, and the 200 ms pump runs through `vi.advanceTimersByTime`. rAF is stubbed and never runs.
- **Recording:** `FakeSource.start` records `currentTime` at call time.
- **Spies:** spy `appendClicks` on each created handle, via `applyScheduleMock.mock.results`.

| ID | Must assert |
|---|---|
| HU1 initial | 120 BPM, on, Play from 0: `options.metronome.clicks` `toEqual` `planMetronomeClicks(120, 0, 2, 60)` (4). Click sources started = 4 |
| HU2 every beat once | Advance in 200 ms steps to 61 s. The union of all click starts on the live handle, mapped to the timeline by `start − startAt + from`, equals the beat times of `planMetronomeClicks(120, 0, 60)` exactly once each (120 beats, within 1e-9), with the same accents. No click source starts before the `currentTime` at its call. After the last chunk (until = 60), advancing to 63 s gives no further `appendClicks` (rAF is stubbed, so the transport's end-stop does not run here; the browser's end-stop is MH-END) |
| HU3 seek | While playing at ~5 s, `seekTo(30.2)` → a new graph whose initial clicks equal `planMetronomeClicks(120, from, from + 2, 60)`. Advance 3 s: the **old** handle's `appendClicks` count is unchanged, and the new handle's appended beats continue from `from + 2` |
| HU4 late | 120 BPM, playing at ~4 s (by then the schedule reaches timeline 8: chunks are due 2 s ahead, so up to 4 s is planned). Record the last appended beat `B`. Move `Date` by **5 s** (more than the 4 s maximum schedule-ahead) **without** firing timers (`vi.setSystemTime`), then advance 200 ms. Every newly appended click starts ≥ `currentTime + 0.02 − 1e-9` at its call; no beat in `(B, now + 0.02)` is appended (at ~4 s → ~9.2: beats 8.0, 8.5, 9.0 absent; 9.5 onward present); `applyScheduleMock` call count unchanged (no resync). A 3 s jump would **not** be late and is not this test |
| HU5 stop and off | (a) Stop, then advance 5 s → no `appendClicks` on any handle. (b) Turn the metronome off while playing → one resync without `metronome`; advancing 5 s gives no `appendClicks` |
| HU6 tempo | On at 120, playing: commit `60` → one resync. The new graph's initial clicks and later appends are 60 BPM beats only, continuing to the end |
| HU7 end | Seek to 57, Play: the beats 57.0 … 59.5 sound exactly once. The click at 59.5 has duration 0.03 (not cut by a chunk). Nothing is planned at or after 60 |
| HU8 scrub bound | 999 BPM on, playing: 20 consecutive `seekTo` calls at different positions → every graph's initial `metronome.clicks.length` ≤ `ceil(2 · 999 / 60) + 1` = 35 (on the old code it would be thousands) |

**Rules:**
- No `.skip`, `.only`, `.todo`, retries or per-`it` timeouts.
- Compare times with `toBe`/`toEqual`/`toBeCloseTo(…, 9)` against the pure function's own output. No hand-rounded constants except MH4's literal state and HU8's bound.

### 2.3 Mutation proof (A, scratch only, outside `store/`)

Use a scratch copy with a `node_modules` junction and your own vitest config, as in rounds 65–70. Run on the two new files plus `metronome-ui.test.tsx`, `metronome.test.ts`, `graph.test.ts` and `loop.test.ts`. Restore after each mutation.

| # | Mutation | Must fail |
|---|---|---|
| a | initial non-loop clicks planned to `end` (old behaviour) | HU1, HU8, UI2 |
| b | `fillMetronomeHorizon` never called from the pump | HU2 |
| c | `soundUntil` ignored | MH2, MH3, HU2 or HU7 |
| d | the refill uses `ctx.currentTime` instead of the stored `startAt` | HU2 |
| e | late rule removed (chunk from `nextFrom` even when late) | MH4, MH5, HU4 |
| f | a late chunk calls `resyncLoopRef.current()` | HU4 |
| g | the ref is not reset in `startGraph` on seek (old state kept) | HU3 |
| h | the ref is not cleared in `stopGraph` | HU5 |
| i | `nextFrom` is not advanced (double append) | HU2 |
| j | `until` is not capped at `end` | MH4, HU7 |
| k | the horizon state is also set in the loop branch | UI7 (frozen) or a new loop row |
| l | selection uses `t ≥ from` (no EPS) | MH2 |

Write `a-round-71/mutations.txt` with the command, the result lines and the failing test names. If a mutation survives, strengthen that test within §2.2.

**Spec-assumption stop:** stop and report to B if a §2.2 assertion fails on the finished tree for a reason that is not an implementation bug. Examples: a wrong MH4 literal, a frozen test that conflicts with §0.1, or fake timers that cannot drive the pump. Never edit a frozen test, and never edit lines outside the §2.2a grant.

### 2.4 After the change
- **Self-check:** `npx tsc --noEmit` → 0; full `npx vitest run` → **101 files, 0 failures** (record the test count); `npm run build` → rc 0.
- **Biome:** read-only `npx biome check ./app` → ≤ 4 errors (only the baseline CRLF list), ≤ 218 warnings, 1 info. The 5 owned code/test files → 0 diagnostics.
- **Review:** run the real `code-reviewer` subagent on the diff against the snapshots. Put findings and dispositions in the report. Architecture notes go to B (`a-round-71.md` §6), not into code.
- **`/check`:** `npm run verify` → exit 0, run quietly with no PW probe in parallel. Do not run `npm run test:e2e:smoke` (that is root's).
- **Browser smoke (`:5173` up):** one load of `/studio-lab` at 1440×900. Set BPM 40, turn the metronome on, press Space for 5 s, and record whether the master meter moves. This is not a PASS claim.

### 2.5 Docs
- **New `docs/implementation/2026/quarter-IV/063-studio-lab-metronome-horizon.md`** per `TEMPLATE.md`, in Georgian with technical terms in English.
  - Status line: `Round 71 — D-29z36; C-ის შემოწმებას ელოდება`.
  - Cover: the context (ROOT-R66-M1, node counts), the horizon and late rules and why snap/resync were rejected, the files, MH1–MH5 / HU1–HU8, the grant, the mutations and gates, and a TODO (the ARCH (f) `createMetronomeBuffers` signal).
- **Doc 059, two edits only:**
  1. the status line → `Round 66 — D-29z31; C PASS (round 66), გამოქვეყნდა b5fb12b`;
  2. one sentence directly after item 7 ("დაგეგმვა", line 29): from round 71, clicks without a loop are planned 2 s ahead and refilled (doc 063).
- **Doc 062, status line only** → `Round 70 — D-29z35; C PASS (round 70), გამოქვეყნდა 2be45df`.

## 3. File ownership (exact; nothing else may change)

### 3.1 May modify this round

| File | Who | Allowed change |
|---|---|---|
| `app/lib/arrangement/metronome.ts` | A | §0.1 (1) |
| `app/contexts/ArrangementContext.tsx` | A | §0.1 (2) |
| `app/lib/arrangement/__tests__/metronome-ui.test.tsx` | A | the §2.2a grant only |
| `app/lib/arrangement/__tests__/metronome-horizon.test.ts` | A | new, MH1–MH5 |
| `app/lib/arrangement/__tests__/metronome-horizon-ui.test.tsx` | A | new, HU1–HU8 |
| `docs/implementation/2026/quarter-IV/063-studio-lab-metronome-horizon.md` | A | new |
| `docs/implementation/2026/quarter-IV/059-studio-lab-metronome.md` | A | the two §2.5 edits |
| `docs/implementation/2026/quarter-IV/062-studio-lab-bars-ruler-window.md` | A | the status line |
| `../tmp/studio-real-loop/a-round-71.md`, `a-round-71/` | A | report, gate output, scratch, own browse state |
| `../tmp/studio-real-loop/c-round-71.md`, `c-round-71.json`, `c-round-71/` | C | report, runs, shots, gates, own browse state |

**Expected `git status --short` at the end: 8 lines.**
- ` M` for `metronome.ts`, `ArrangementContext.tsx`, `metronome-ui.test.tsx`, doc 059 and doc 062;
- `??` for the two new test files and doc 063.

### 3.2 Frozen this round
- Everything in `b-round-70-r71-tree-sha256.txt`, and everything else under `store/`.
- **Forbidden to modify.** C checks the first four by sha256 against `protected-baseline.json`:
  - `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
  - `app/lib/auth.ts`, `app/lib/__tests__/bug-hunting/**`, `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`;
  - `components/studio/**`, `components/ui/**`, `components/layout/**`, `components/animations/**`;
  - `root.tsx`, `entry.server.tsx`, `entry.client.tsx`, `app/styles/**`, `lib/sfx-*`, `app/routes/**`;
  - firebase, R2, auth and purchase code; `public/**`, `package.json`, the lockfile;
  - `.claude/**`, `AGENTS.md`, `CLAUDE.md`, `.agents/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `.husky/**`, `scripts/**`, `e2e/**`;
  - the playwright and vitest configs, `../backend/**`, env/config files, the sitemap, `app/data/studio-lab-demo.ts`;
  - the other roles' files under `../tmp/studio-real-loop/`, and root's `../tmp/studio-remote-reconcile/**`, `../tmp/studio-root-r49/**` and `root-publish/**`.
- **Also not allowed:**
  - new dependencies or installs; deleting files or tests;
  - git commit, stash, checkout, push or deploy; reverting earlier work;
  - in-place mutation of `store/` files for experiments;
  - killing processes you did not start; starting or stopping the dev server or the backend;
  - `npm run format`;
  - deleting `playwright-report/`, `store/nul` or any `*-round-6x/scratch/` or `*-round-7x/scratch/` folder.

## 4. Acceptance (C)

**Checkpoint order:** G71-2 → R71-S → R71-U → G71-1 → §4.6 (browser rows) → §4.7 (regressions) → G71-3.
- Write `c-round-71/checkpoint.md` as you go.
- Check both servers at the start, after the offline items, and before the report.
- `browserVerified` is `true` only if every REAL-browser row in §4.6, §4.7 and G71-3's workspace rows ran.

### 4.1 R71-S — static (read-only)

`diff -u` against the round-71 snapshots must show:
- **`metronome.ts`:** additive only (the constant, the optional 4th parameter, the interface and `nextMetronomeChunk`). The 3-argument path is unchanged.
- **`ArrangementContext.tsx`:** only the §0.1 (2) items. The loop branch keeps the 3-argument `planMetronomeClicks(…, loop.end)`. The `from`/`startAt` stored in the state are the same variables passed to `applySchedule`.
- **`metronome-ui.test.tsx`:** only the §2.2a lines and the import.
- **Docs:** doc 059 has exactly the two edits; doc 062 has only its status line.

Also check:
- No new timer, interval, listener or `AudioContext` in the owned files.
- **Banned patterns:**
  - no `any`, assertions, `@ts-ignore`, comments or hardcoded colours;
  - no `.skip`, `.only`, `.todo`, `retry`, `vi.setConfig` or per-`it` numeric timeouts;
  - the new test files do not import from other test files.
- **EOL:** LF only. **Doc 063** exists with the TEMPLATE sections and the status line.

### 4.2 R71-U — unit and mutation (C's own scratch, own edits)
- **Red run:** run the two new files and the granted `metronome-ui.test.tsx` against a scratch tree holding the round-71 **snapshots** of `metronome.ts` and `ArrangementContext.tsx`. They must fail; record how.
- **Mutations a–l** in your own scratch. Each must kill its named tests.
- **C extras (info), suggested:**
  - (m) the horizon is 0.25 s instead of 2 (do the HU rows notice?);
  - (n) the late margin is 0;
  - (o) `soundUntil` is applied in the loop branch too (frozen UI7 / M-tests).
- Record survivors as test gaps.
- **Durations:** run the two files alone 3 times and record.

### 4.3 G71-1 — gates
- tsc 0; build.
- Biome read-only on `./app` within 4/218/1; the 5 owned code/test files at 0 diagnostics.
- **Vitest 101 files, 0 failures** (quiet; record the count).
- **`npm run verify` exit 0.** At most two quiet attempts, each recorded. If neither returns rc 0 → FAIL.
- Record the `node.exe` count.

### 4.4 G71-2 — tree
Protected 4/4 OK; frozen 439/439 OK; `git status --short` = the 8 §3.1 lines; HEAD recorded at start and end.

### 4.5 Fixtures and reading values
- **F-SILENT** (rounds 66/69): a REAL-mouse (PW) drop of `Soft impact` on SFX at **≥ 20 s**, with no BPM. From 0 to its start the project is silent, so every master-meter rise there is a click.
- **F-LONG-SILENT (new):**
  - REAL-mouse (PW) drop of `Middle East` on the music lane at 1 s, giving a 133 s timeline;
  - then a REAL click on the music track's **Mute** (and the SFX Mute, if it holds a clip).
  - Track mutes do not mute the metronome (round 66 MT-MASTER), so every master-meter rise is a click.
  - Record the project end from the timeline/status.
- **Onsets:** use the INFO-C69-METER-POST-ACCENT detector (≥ 3 dB rise to ≥ −15 dB, 0.25 s refractory), fixed before each run. Tolerance ± 0.15 s.
- **Node count:** a PW `addInitScript` that wraps `AudioContext.prototype.createBufferSource` (and `BaseAudioContext.prototype`, if that is where it lives) with a counter and timestamped log on `window`. Label it **instrumentation (PW)**. It does not change app code.
- **Timing:** PerformanceObserver `longtask` and the max frame gap, as in MT-SCRUB-INFO.

### 4.6 Browser rows — fresh `/studio-lab` at 1440×900; starred rows also at 1280×720

| ID | Steps | Pass |
|---|---|---|
| **MT-BEATS*** (real audio) | F-SILENT, BPM 40, metronome on; REAL Space from 0; sample the master meter for 13 s | rises at 0, 1.5, 3 … 12 (9 rises, ± 0.15 s) and **no other rise**. The beats at 6.0 and 12.0 fall after several refills. The accents at 0, 6 and 12 are ≥ 4 dB higher than the others |
| **MH-LONG** (real audio) | F-LONG-SILENT, BPM 60, on; REAL Space from 0; sample 30 s | a rise at every whole second 0…29 (30 rises, ± 0.15 s), none missing, **no other rise**; accents every 4 s |
| **MH-END** (real audio) | F-LONG-SILENT, BPM 40, on; REAL Alt-click the ruler (or Home + keys) to a position `p` about 6 s before the project end; record `p` and the end; REAL Space | rises at every beat `k × 1.5` in `[p, end)` (± 0.15 s), **none at or after the end**; the transport stops at the end by itself; the position readout ends at the project end |
| MT-SEEK (real audio) | F-SILENT, BPM 40, on, playing; REAL click on the seconds ruler at ~7.0 | the next rises are at 7.5 and 9.0 (± 0.15) |
| MT-TEMPO-CHANGE (real audio) | playing with it on at 40: REAL click into the BPM field, type `60`, Enter | the rise spacing becomes 1.0 s (rises on whole seconds) within one beat; the toggle stays pressed |
| MT-LIVE-TOGGLE (real audio) | F-SILENT, BPM 40; REAL Space from 0 with it off; REAL click on the toggle at ~3.7 s; REAL click again (off) at ~8 s | rises start at the next beat (4.5) and stop after the off click |
| **MH-SCRUB** (real audio) | F-LONG-SILENT, BPM 60, on, playing from 0; at ~3 s a REAL-mouse (PW) drag of the playhead handle to ~20 s over ~2 s, then release | after release, rises resume on whole seconds (± 0.15 s) for ≥ 5 s; no burst (no two rises < 0.5 s apart) |
| **MH-NODES*** (instrumentation (PW)) | F-LONG-SILENT, BPM `999`, on; REAL Space from 0; count `createBufferSource` calls from the keydown to +0.5 s, then to +3 s | **≤ 120** in the first 0.5 s (expected ≈ 70: the initial 2 s chunk plus the next one, 34 clicks each, plus the clips; the old code ≈ 2200: `133 × 999 / 60` clicks plus the clips); ≤ 200 by +3 s; record both numbers. Also record the same counts with the metronome **off** |
| MH-SCRUB-PERF (instrumentation (PW)) | F-LONG-SILENT, BPM 999, on, playing; a 5 s REAL-mouse (PW) playhead-handle scrub back and forth | record `createBufferSource` calls during the scrub, the number of resync bursts (calls grouped by gaps ≥ 30 ms) and calls per burst; **pass: total ≤ 5000 and ≤ 80 per burst** (expected ≈ 68 per resync: the initial 2 s chunk plus one refill, 34 each, plus the clips; the old code ≈ 2200 per resync, ≈ 110 000 total). Also record longtasks and the max frame gap, against the same scrub with the metronome off |

### 4.7 Regressions (directly related)
- **MT-LOOP (real audio):** F-SILENT, BPM 40, on, a loop brace 2–5 s, Space from 2, ≥ 3 wraps. Each iteration has rises at 3.0 and 4.5 only, and none at the wrap.
- **MT-EXPORT-REG:**
  - F-SILENT, metronome off: Export → WAV. Then BPM 120, metronome on: export again.
  - The two WAVs must be equal under the export comparison rule (frames, NaN, header, full-scale count and RMS, or max |delta| ≤ 1 LSB; byte identity is never the oracle).
  - Every sample before the Soft impact start is 0. Any click in the export is a **High** bug.
- **MT-OFF:** F-SILENT, metronome off, Space from 0 for 8 s → no rise.
- **REG-HYD:** no hydration warning on the `/studio-lab` load.

### 4.8 G71-3 — anonymous workspace and purchase protection
- Use a fresh browse state. `/studio-lab`, opened directly and via the header link, shows the workspace with the demo badge.
- In every §4.6–§4.7 run there must be:
  - no request to `/api/studio-token`, `/api/recording-*`, `/api/download` or R2 (`r2.cloudflarestorage`, `r2.dev`, `r2-proxy`, `workers.dev`);
  - no `Authorization` header from workspace code.
- `/studio/middle-east` shows "Sign in required". Anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → **401**; a fake Bearer → **403**.
- **Known and allowed:** root `GET /api/cart`, GA consent-denied events, GTM, dev modules, the homepage Unsplash image, the homepage R2 cover image and Google Fonts.

### 4.9 Ableton
Give two verdicts for each §0.2 row: the CZABA requirement (PASS/FAIL), and the Ableton match (confirmed / deliberate difference / unconfirmed / not applicable).

### 4.10 Not run this round, and carried items (honest)
- **Not run:**
  - a hidden-tab late pump in the browser ("not run (environment)"; HU4 and MH4/MH5 cover the rule);
  - video sync and C-R27-01;
  - the bars ruler rows (not touched);
  - the FB-01..FB-16 stage regression;
  - `npm run test:e2e:smoke` (root's).
- **Tech Lead:**
  - R65-T … R70-T are unchanged.
  - **R71-T:** in your Chrome, with the metronome on at a fast tempo, play a long project and scrub. Do the clicks stay steady, and is there ever a missing or doubled click?
- **Carried (Lows batch / own tasks):** see `b-round-70.md` §6.

## 5. Commands

```bash
cd C:/Apps/czaba-project/store
git rev-parse HEAD
git status --short
sha256sum -c ../tmp/studio-real-loop/b-round-70-r71-tree-sha256.txt | grep -vc ': OK$'
(cd ../tmp/studio-real-loop/b-round-70-r71-snapshots && sha256sum -c SHA256SUMS.txt)
for f in app/lib/arrangement/metronome.ts app/contexts/ArrangementContext.tsx app/lib/arrangement/__tests__/metronome-ui.test.tsx docs/implementation/2026/quarter-IV/059-studio-lab-metronome.md docs/implementation/2026/quarter-IV/062-studio-lab-bars-ruler-window.md; do cmp -s "$f" "../tmp/studio-real-loop/b-round-70-r71-snapshots/$(basename "$f")" && echo "same $f" || echo "changed $f"; done
node -e "const fs=require('fs');for(const f of process.argv.slice(1)){const s=fs.readFileSync(f,'utf8');console.log(f,'CR',(s.match(/\r/g)||[]).length,'LF',(s.match(/\n/g)||[]).length)}" app/lib/arrangement/metronome.ts app/contexts/ArrangementContext.tsx app/lib/arrangement/__tests__/metronome-ui.test.tsx
npx vitest run app/lib/arrangement/__tests__/metronome-horizon.test.ts app/lib/arrangement/__tests__/metronome-horizon-ui.test.tsx app/lib/arrangement/__tests__/metronome-ui.test.tsx app/lib/arrangement/__tests__/metronome.test.ts app/lib/arrangement/__tests__/graph.test.ts app/lib/arrangement/__tests__/loop.test.ts --reporter=verbose
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app
npx biome check app/lib/arrangement/metronome.ts app/contexts/ArrangementContext.tsx app/lib/arrangement/__tests__/metronome-ui.test.tsx app/lib/arrangement/__tests__/metronome-horizon.test.ts app/lib/arrangement/__tests__/metronome-horizon-ui.test.tsx
npm run verify
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
tasklist | grep -ci node.exe
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5173/studio-lab
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5199/api/products
```

## 6. Requests to root (non-gating for A)

1. **Commit unit:** round 71 alone, after a C PASS. ROOT-R66-M1 then closes on C evidence.
2. **ARCH-CHECKPOINT-SRW14-PREFS** (seventh request) is still open.
   - Round 70's reviewers added the timeline-trio plumbing signal: `getTimelineView`, `getTimelineViewportPx` and `subscribeTimelineScroll` are now passed to three consumers. Both reviewers said "keep until a fourth consumer".
   - Bounded read-only frontend-architect review per `store/.claude/references/architecture-checkpoint.md`. Answer keep/extract, value and risk in ≤ 3 sentences each.
   - An approved change becomes its own B task. **Round 71 does not wait.**
3. **INFO-R61-FAKEBEARER-500 and INFO-C65-LS-SESSION:** unchanged; these are root's notes.
4. **Phase 2 (root note, 2026-10-20):** B has recorded it. PHASE2-VIDEO-SCORING is not planned while Phase 1 and T12 are open. When they finish, B's decision will be **BLOCKED: "phase 2 awaiting user go-ahead"**.

## 7. Reports and next

**A → `../tmp/studio-real-loop/a-round-71.md`:**
1. the pre-flight gate (with the files read), the baseline and the red run;
2. a diff summary per file, with EOL counts;
3. MH1–MH5, HU1–HU8 and the granted UI2/UI4/UI5/UI10, with alone durations;
4. mutations a–l;
5. the smoke;
6. code-reviewer findings, dispositions and any Architecture note;
7. verbatim command tails, including `node.exe` and `npm run verify`;
8. deviations.

Do not claim PASS. On a stop condition, stop and report.

**C → `c-round-71.md` and `c-round-71.json`** (the usual schema, with `browserVerified`):
- each ID is PASS, FAIL with a bug ID, or **not run** with the reason;
- two verdicts for each Ableton row;
- `passed` lists only IDs run this round;
- state commit readiness.

**Next (orientation only):**
1. C bugs from this round first.
2. **SRW-16 (FB-10) named markers/locators** (the next unimplemented FB in dependency order), stage 1.
3. Then SRW-17 (FB-12), SRW-18 (FB-06), SRW-19 (FB-07), SRW-20, and the SRW-24 follow-ups.
4. The Lows batch (including ROOT-R70-L1..L5 and the tempo-window test gaps); SRW-21; the full regression and root review; T12. After that, Phase 2 waits for the user.
