# CURRENT TASK — Round 66: SRW-15 stage 2 (FB-09) — metronome click on every beat during playback, aligned with the bars ruler, **never in the export** (D-29z31)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-19
- **Workflow:** `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09). Addenda: Ableton 2026-10-11; periodic commits 2026-10-13; behavioural reverse-engineering 2026-10-14; architecture checkpoint; user priority 2026-10-15; Loop v2 2026-10-19.
- **Decision record:** **D-29z31** in `docs/technical/studio-real-workspace/plan.md`. Rationale: `b-round-65.md`.
- **Round size:** one owner (A), **one feature stage** (SRW-15 stage 2): one new pure module, additive changes in `graph.client.ts`, enumerated edits in `ArrangementContext.tsx`, `ArrangementTempoRow.tsx` and `StudioWorkspace.tsx`, two new test files, doc 059.
- **Why now:** C round 65 = **PASS, `browserVerified: true`**, with no bug of any severity (`c-round-65.md`, `c-round-65.json`). Root gate round 65 = **published `3e55c5c`** on both remotes (`loop-v2/gates/gate-round-65.json`). SRW-15 stage 1 is closed on C evidence. The next dependency-ordered unimplemented scope is SRW-15 stage 2, the metronome (R15-T2). SRW-14 stage 5 (musical divisions) follows it.

> **Servers.** B check (2026-10-19 ~17:30 +04): `/studio-lab` **200**, `:5199/api/products` **200**, `node.exe` 7. Check both at the start of A and of C and record the result. Agents never start or stop servers.
> - **If `:5173` is down:** every browser item is "not run (environment)"; the round is BLOCKED with `browserVerified: false`; no browser row may be marked PASS.
> - **If only the backend is down:** run everything except G66-3's token rows ("not run (environment)").
>
> **Browse rules** (`backlog.harness_rules`, unchanged): never `$B restart`; a **new** `BROWSE_STATE_FILE` under your own round folder; after one CLI-daemon failure use the approved `server-node.mjs` fallback with `BROWSE_PARENT_PID=0` (record PID/log, stop only your own process). **GSTACK-NO-MOUSE:** drags, held presses and wheel use standalone Playwright (installed chromium, fresh context, no install), labelled **REAL-mouse (PW)**. Plain clicks and typing use gstack (REAL) or PW. **ENV-EXT-LOAD-HANG:** wait for `domcontentloaded`, the workspace selector, then 4 s; record it. **INFO-R62-GEPLAY-UNDO:** record the Undo title before every Ctrl+Z. **INFO-C65-HARNESS-R2-REGEX:** the forbidden-host filter must also match `r2-proxy` and `workers.dev`.
> **Machine load:** record `tasklist | grep -ci node.exe` on every run. **Scratch junctions:** `cmd //c mklink /J …` / `cmd //c rmdir …` with stdin from `/dev/null`. **npx:** never `npx <pkg>` for a package not in `node_modules` (C-R63-NPX-CACHE); for TS scratch scripts use `node --experimental-strip-types`.

## Why this round

**Round 65 result:** PASS. Offline: G65-2 (6 lines), R65-S, R65-U (red run 2 files; a–n + C extras p, q, r, s killed), G65-1 (verify rc 0, **91 / 1605**, Biome 4/218/1). Browser: every §4.6 TB row (starred at both viewports), TB-NOSTRETCH with four byte-identical WAVs (sha256 `525958b4f0a721f9059b092ece6652538dcf6d8469cbb1f7e2707eb554e97ec6`, 5 200 896 frames, first audible 4.000 s), LB-LOADING-REG, RU-REG, REG-HYD, G65-3 (401/403).

**B rulings on the round-65 info notes (no code):**
- **INFO-C65-SPEC-999.5 — adopted.** A's `'999.5'` in T3 and U5 is now part of the spec lists (the regex already rejects `1000`, so only 999.01–999.99 exercise the 999 bound). Recorded in D-29z31.
- **INFO-C65-SELECT-FOCUS** (no unit test for the focused grid `<select>` path) → Lows batch.
- **INFO-C65-RU-DBLCLICK-MISS** (1/9, not reproduced), **INFO-C65-RB-FLAKE** (scratch under load), **INFO-C65-ONSET-EDGE** (meter sampling) → watch. The onset note shapes §4.6: the beat-timing rows use a slow tempo so that beat spacing is far above the meter's sampling jitter.
- **INFO-C65-LS-SESSION** (`czaba_session_id`, root cart) → root.
- **INFO-C65-HARNESS-R2-REGEX** → applied to the harness rules above.

**Root review round 65** (`loop-v2/gates/round-65/review.md`, COMMIT OK, 8.5/10), routed by B:
- **Medium #1 — bars-strip beat density** (`tempo.ts:61-84`): recorded as **ROOT-R65-M1-BEAT-DENSITY**, not scheduled in this round. The proposed fix (no beats under 16 px) does not bound the worst case: the mark count grows with the timeline width (600 s × 320 px/s ≈ 192 000 px → ~12 000 marks even at 16 px), so a real fix needs viewport culling, which is its own task. In practice the demo timeline is ~110 s. C measures the actual cost as the info row **BD-INFO** (§4.6) so that the task can be sized on evidence.
- **Low #2** (16 px input, `ring-1`) → R65-T / Lows batch. **Low #3** (`aria-invalid`): `arrangement-status` already has `aria-live="polite"` (StudioWorkspace l.1758), so the reviewer's condition is met; closed as not a defect. **Low #4** (commit on window blur), **Low #5** (IME `isComposing`), **Low #6** (doc 058 status line, U12 before U11) → Lows batch.
- **Architecture notes:** Signal 4 (`tempoBpm` is the third grid preference in StudioWorkspace) and Signal 3 (`releaseEditFocusOnTimelinePointerDown` has 6 clauses; a pure predicate could be extracted) are merged into **ARCH-CHECKPOINT-SRW14-PREFS** (a) and a new (e). Not scheduled; see §6.

## Baseline

Measured by B on 2026-10-19 ~17:30 +04:
- **HEAD `3e55c5c8bb67e50be303a8e180a0559df953c3fd`** (root gate round 65, on both remotes), `git status --short` **empty**.
- **Valid start:** that state, **or** a newer **root** commit with identical content. Anything else (a non-empty status, a frozen or snapshot mismatch) is a stop and report.
- **Frozen list:** `../tmp/studio-real-loop/b-round-65-r66-tree-sha256.txt`, **426** entries, 426/426 OK (run from `store/`). It covers every tracked and untracked `app/**` and `docs/implementation/**` file except the four existing owned files below.
- **Snapshot:** `../tmp/studio-real-loop/b-round-65-r66-snapshots/` with `SHA256SUMS.txt`:

  | File | sha256 prefix | EOL (CRLF / LF) |
  |---|---|---|
  | `app/lib/arrangement/graph.client.ts` | `a350960a` | 0 / 309 |
  | `app/contexts/ArrangementContext.tsx` | `91634d8f` | 0 / 2850 |
  | `app/components/arrangement/ArrangementTempoRow.tsx` | `f1483405` | 0 / 166 |
  | `app/components/arrangement/StudioWorkspace.tsx` | `2c4bf776` | 0 / 1832 |

- **Protected files** 4/4 OK. **Biome `./app` (read-only): 4 errors / 218 warnings / 1 info** — the 4 errors are the CRLF-only `format` errors on `auth-bugs.test.ts`, `grid.test.ts`, `render-budget.test.tsx`, `app/lib/auth.ts`. **Vitest baseline: 91 files / 1605** (root gate `verify.log`). `node.exe` 7.
- **Line endings:** every owned and new file is LF. Never run `biome check --write`, `format --write` or `npm run format`.

**Rules:** do not revert, re-create or reformat anything; the work of rounds 47–65 stays. `.claude/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `AGENTS.md`, `biome.json`, `scripts/**`, the vitest/playwright configs and the agent files belong to root. Only root commits or pushes.

## 0. Scope

### 0.1 Rule D-29z31: the metronome is a listening aid only

**User source:** `docs/video-to-text-bugs/README.md` FB-09 (`2.mp4` 00:52–01:27: bars "we definitely need"; the metronome is part of FB-09) and the backlog acceptance **R15-T2**: "Enable metronome and play → click on each beat aligned with bar lines; not present in export (C decode)". Plan **D-10**: BPM changes only the bars/beats grid and the metronome; audio is never time-stretched.

**What stays as it is (stage 1 rules, D-29z30):** the tempo is user-entered, has no default, is not in history and is fixed at 4/4; the seconds ruler, Snap, the seconds grid, the clips, the clip audio and the export do not depend on the tempo.

**Behaviour:**
1. **Toggle:** a button `მეტრონომი` in the tempo row's header cell, after `4/4` (`type="button"`, `aria-pressed`, `data-testid="arrangement-metronome-toggle"`).
   - **No tempo** (`tempoBpm === null`): the button is `disabled`, `aria-pressed="false"`, `title="მეტრონომი — ჯერ მიუთითე BPM"`.
   - **With a tempo:** enabled; `title="მეტრონომი — კლიკი ყოველ დარტყმაზე დაკვრისას (4/4, ტაქტის პირველი დარტყმა უფრო ხმამაღლა). Master-ის ხმა და Mute მასზეც მოქმედებს. ექსპორტში არ შედის."`.
   - Default: **off**. Not in history (a listening preference like Snap and the tempo). No keyboard shortcut.
   - Pressed styling mirrors the existing Snap toggle's pressed/unpressed token classes (read them in `ArrangementTransport.tsx` or wherever the Snap button lives; tokens only).
2. **Status:** turning it on writes `მეტრონომი ჩართულია — {fmt} BPM, 4/4: კლიკი ყოველ დარტყმაზე, ტაქტის პირველზე უფრო ხმამაღლა. ექსპორტში არ შედის.` (`{fmt}` = `formatTempoBpm`); turning it off writes `მეტრონომი გამორთულია.`.
3. **Clearing the tempo turns the metronome off** (no hidden state). The status stays the frozen `tempoStatusMessage(null)`; the button becomes disabled and unpressed. Setting a tempo again does **not** re-enable it. A tempo change while it is on keeps it on; the status is the frozen `tempoStatusMessage(next)`.
4. **Click plan** — pure function `planMetronomeClicks(bpm, from, until): MetronomeClick[]`, `MetronomeClick = { when: number; offset: number; duration: number; accent: boolean }`:
   - beat `k` (k ≥ 0) is at `time = (k * 60) / bpm` (**the expression order is normative**, M2 uses `toBe`), **computed from the index, never accumulated**;
   - included when `time ≥ from − ARRANGEMENT_EPS` and `time < until − ARRANGEMENT_EPS` (`ARRANGEMENT_EPS` from `./model`, 1e-4);
   - `when = max(time, from)`, `offset = when − time`, `duration = min(METRONOME_CLICK_SECONDS − offset, until − when)`;
   - `accent = k % 4 === 0` (bar downbeat in 4/4, i.e. at every bar mark of the stage-1 ruler);
   - `[]` when `bpm` is not finite or ≤ 0, or `until ≤ from`; sorted by `when`.
   - Consequence: a seek to 2.01 s at 120 BPM does **not** play the 10 ms tail of the click at 2.0; the next click is at 2.5.
5. **Click sound** — pure `generateMetronomeClickSamples(sampleRate, accent): Float32Array`: length `Math.round(METRONOME_CLICK_SECONDS × sampleRate)` with `METRONOME_CLICK_SECONDS = 0.03`; sample `i` = `peak × sin(2π f i / sampleRate) × exp(−i / (0.005 × sampleRate))`; accent `f = 1600`, `peak = 0.5`; beat `f = 1000`, `peak = 0.25`. Exported constants `METRONOME_ACCENT_FREQUENCY_HZ`, `METRONOME_BEAT_FREQUENCY_HZ`, `METRONOME_ACCENT_PEAK`, `METRONOME_BEAT_PEAK`.
6. **Routing (graph):** click sources → one metronome `GainNode` (gain 1) → the schedule's **master gain**. So Master volume and Master mute apply, the **master meter shows the clicks** (this is what C can measure), the track meters, track volume, track mute/solo and pan do **not** affect it. Recorded difference from Live's Preview/Cue volume (§0.2).
7. **Scheduling (live playback only):** wherever a graph is planned, the clicks are planned for the same window with the same `from`/`startAt`:
   - **no loop:** `planMetronomeClicks(bpm, from, projectEnd(arrangement))` together with the first plan (upfront, like the clips);
   - **loop iteration 0:** `planMetronomeClicks(bpm, from, loop.end)`; **every refilled iteration:** `planMetronomeClicks(bpm, timing.from, timing.until)` appended with `timing.from`/`timing.startAt` exactly like `planLoopIteration` (sample-continuous wraps);
   - click `i` starts at `startAt + (when − from)` with `source.start(that, offset, duration)`;
   - seek, scrub, edit-resync and play all go through `startGraph`, so the clicks follow automatically.
8. **Mid-playback changes:** turning the metronome on/off or changing the tempo while it is on, during playback, forces one resync (`syncPlayback(present, undefined, true)`), the same path an edit uses. The clips continue through the existing handoff; the clicks restart from the live position.
9. **Export:** `renderArrangementWav` is **not changed** and never receives the metronome. With the metronome on, the WAV is byte-identical to the WAV with it off.
10. **Frozen test fakes constrain the implementation (hard rule):** every frozen UI test file has a `FakeAudioContext` without `createBuffer`/`createOscillator` and a `FakeAudioBuffer` without `copyToChannel`. Therefore:
    - the click buffers are created **lazily**, only when a graph is planned with the metronome on (never in `ensureAudioContext`), with `new AudioBuffer({ length, numberOfChannels: 1, sampleRate: ctx.sampleRate })` + `copyToChannel(samples, 0)`, cached per `AudioContext` (reset when the context is closed on unmount);
    - `ScheduleAudioContext` gets **no new member**; `ApplyScheduleOptions.metronome` is **optional**; without it `applySchedule` creates exactly the same nodes as today (no extra gain node).

**Worked oracle** (B, by hand from rule 4; `toBeCloseTo(…, 9)` unless noted):

| Call | Result |
|---|---|
| `(120, 0, 4)` | 8 clicks at 0, 0.5 … 3.5; accents at 0 and 2; every offset 0, every duration 0.03 |
| `(90, 0, 8)` | 12 clicks, `when` = `(k × 60) / 90` for k = 0…11 (**`toBe`** exact); accents at k = 0, 4, 8 (0, 2.666…, 5.333…); 8.0 is excluded (8 < 8 − 1e-4 is false) |
| `(40, 2, 5)` | 2 clicks: 3.0 (k = 2) and 4.5 (k = 3), neither an accent |
| `(120, 2.25, 3.1)` | 2 clicks: 2.5 and 3.0, offset 0 (no tail of 2.0) |
| `(120, 2.00005, 3)` | first click: `when` 2.00005, `offset` 0.00005 (`toBeCloseTo(…, 9)`), `duration` 0.02995, accent `true` (k = 4); then 2.5 |
| `(120, 0, 3.51)` | 8 clicks; the last (3.5) has `duration` 0.01 (`toBeCloseTo(…, 9)`) |
| `(92.5, 0, 60)` | 93 clicks (k = 0…92), every `when` **`toBe`** `(k × 60) / 92.5`; the last is 59.675675… |
| `(0, 0, 4)`, `(NaN, 0, 4)`, `(Infinity, 0, 4)`, `(-1, 0, 4)`, `(120, 3, 3)`, `(120, 4, 3)` | `[]` |

**Rejected:**
- **Click outside the master (Live's Preview/Cue path):** C has no audio capture in a real browser; the master meter is the only REAL observable of live audio. A click that bypasses it could not be evidenced at all. CZABA has no cue output.
- **Metronome as synthetic clips on a synthetic track:** a soloed track would silence it (`isTrackAudible`) and it would leak into track meters, the model and history.
- **A lookahead horizon for non-loop clicks:** the clips are planned upfront today; the clicks follow the same rule. Bound: at 120 BPM a 110 s demo project is 220 click nodes; the worst case (999 BPM, 10 min) is ~10 000 nodes per (re)schedule. Recorded as **METRONOME-UPFRONT-NODES** (info); C measures play-start latency at 120 BPM (MT-PERF-INFO). A horizon is a follow-up only on evidence.
- **Count-in, a click-sound choice, a metronome volume control, a rhythm setting, "only while recording":** not requested; CZABA has no recording.
- **Tempo/metronome in the arrangement model or history:** same reason as D-29z30 R5.

### 0.2 Ableton (workflow addendum 2026-10-11)

**Sources** (B, gstack `/browse`, 2026-10-19; Live 12 Reference Manual; no video watched, no Live installation used):
- §19.4 "Recording in Sync" and §19.4.1 "Metronome Settings", `https://www.ableton.com/en/live-manual/12/recording-new-clips/` → `b-round-65/metronome-excerpt-20261019.txt` (full page text `b-round-65/recording-new-clips-20261019.txt`).
- §3.1 "The Control Bar" ("Tempo Settings and Metronome" section) → `b-round-64/live-concepts-20261019.txt` (re-used).

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| A metronome switch sits with the tempo controls and ticks when Play is pressed | §19.4 ("activated via its Control Bar switch and will begin ticking when the Play button is pressed"); §3.1 | **confirmed** | toggle in the tempo row's header cell (the tempo row is CZABA's tempo area, D-29z30); clicks only during playback | MT-ON, MT-BEATS, MT-OFF |
| Metronome volume is set with the Preview Volume knob, separate from the Master | §19.4 ("To adjust the metronome volume, use the mixer's Preview Volume knob") | **confirmed** | **deliberate difference:** fixed level through the Master gain; Master volume/mute apply and the master meter shows it (§0.1(6), verifiability) | MT-MASTER |
| Tick interval "Auto" follows the time signature's denominator | §19.4.1 | **confirmed** | 4/4 fixed → a click every quarter note (matches Auto in 4/4) | MT-BEATS, M1–M3 |
| Count-in, tick sound choice, rhythm setting, "Enable Only While Recording" | §19.4.1, §19.6 | **confirmed** (they exist) | **not offered** (simplification; CZABA has no recording) | — (recorded) |
| The downbeat tick is accented | — (not in the captured text) | **unconfirmed** | CZABA: accent (1600 Hz, −6 dBFS) on beat 1 of each bar, 1000 Hz −12 dBFS on the others, so bar alignment is audible and measurable | MT-BEATS (accent levels) |
| The metronome is not in exported audio | — (export not in the captured sections) | **unconfirmed** | CZABA requirement R15-T2 | MT-EXPORT |
| The metronome needs a tempo | — (Live always has a tempo) | **not applicable** | disabled until the user sets a BPM; clearing the BPM turns it off | MT-DISABLED, MT-CLEAR |

Nowhere may a report claim "Ableton does the same" for the unconfirmed or not-applicable rows.

### 0.3 Source

| File | Change |
|---|---|
| `app/lib/arrangement/metronome.ts` (**new**) | Pure. Exports `METRONOME_CLICK_SECONDS`, the four frequency/peak constants, type `MetronomeClick`, `planMetronomeClicks`, `generateMetronomeClickSamples`, `metronomeStatusMessage(bpm: number \| null): string` (on text for a number, off text for `null`), `METRONOME_NEEDS_TEMPO_TITLE`, `METRONOME_TITLE`. Imports only from `./model` (`ARRANGEMENT_EPS`) and `./tempo` (`formatTempoBpm`, `TEMPO_BEATS_PER_BAR`). |
| `app/lib/arrangement/graph.client.ts` | **additive only:** `ApplyScheduleOptions.metronome?: { accent: TBuffer; beat: TBuffer; clicks: readonly MetronomeClick[] }`; `ScheduleHandle.appendClicks(clicks, from, startAt): void`; click sources in their **own** list (not in `sources`, so `setClipGain` and `activeSourceCount` are unchanged); the metronome gain node is created only when `options.metronome` is given and connects to `master`; `stop(when)` stops every not-yet-ended click source **with the same `when`** (the retired-graph handoff passes a future `stopAt`; ignoring it would cut clicks early or double them after every resync), `disconnect()` disconnects the click sources and that node; click sources set `onended` and `appendClicks` prunes ended ones, as `appendPlan` does; `appendClicks` after `disconnect` or without a metronome is a no-op. `renderArrangementWav`, `measureExportOverload`, `formatExportOverloadWarning`, `ScheduleAudioContext` and every existing member are byte-unchanged. |
| `app/contexts/ArrangementContext.tsx` | **enumerated edits only:** (1) imports; (2) `metronomeBpmRef = useRef<number \| null>(null)` and a lazily filled click-buffer cache ref (§0.1(10)); (3) in `startGraph`, `options.metronome` from §0.1(7) when `metronomeBpmRef.current !== null`; (4) in `fillLoopIterations`' append callback, `handle.appendClicks(planMetronomeClicks(bpm, timing.from, timing.until), timing.from, timing.startAt)` when the bpm is non-null; (5) `setMetronomeBpm(next: number \| null)` (`useCallback`): non-finite or ≤ 0 → `null`; same value → no-op; else store it and, if playing, `syncPlayback(historyRef.current.present, undefined, true)`; (6) `setMetronomeBpm` in `ArrangementContextValue` and in the `useMemo` value + deps; (7) the unmount cleanup resets the click-buffer cache. Nothing else; no metronome **state** in the context value (no re-render on toggle). |
| `app/components/arrangement/ArrangementTempoRow.tsx` | **additive:** props `metronomeOn: boolean`, `onMetronomeToggle: () => void`; the §0.1(1) button after `4/4`. The strip, the input, its handlers and the `memo` strip component are unchanged. |
| `app/components/arrangement/StudioWorkspace.tsx` | **enumerated edits only:** (1) `const [metronomeOn, setMetronomeOn] = useState(false);` next to `tempoBpm`; (2) `toggleMetronome` (`useCallback`): no-op when `tempoBpm === null`; else flips the state and writes `metronomeStatusMessage(next ? tempoBpm : null)`; (3) in `changeTempo`, `next === null` also sets `metronomeOn` false; (4) one `useEffect` that calls the context's `setMetronomeBpm(metronomeOn && tempoBpm !== null ? tempoBpm : null)`; (5) the two new props on `<ArrangementTempoRow>`; (6) import lines. The §0.1(10) focus guard and everything else unchanged. |

- **Frozen:** everything else, including `tempo.ts`, `loop.ts`, `schedule.ts`, `model.ts`, `types/arrangement.ts`, `ArrangementRuler.tsx`, `ArrangementTransport.tsx`, every existing test file and docs 001–058.
- No comments, no `any`, no type assertions, no `@ts-ignore`, no hardcoded colours; semicolons everywhere; Tailwind tokens only.

### 0.4 What could be affected (C checks)

- **Clip playback and handoff:** `startGraph`/`fillLoopIterations` are shared by every playback path. With the metronome off, the graph must be node-for-node the same as today (M11, the existing graph/master/loop/render-budget tests unchanged and green).
- **Frozen test fakes** (§0.1(10)): a non-lazy buffer creation would crash frozen UI tests; mutation (k) proves the laziness.
- **Master meter and export overload:** the click adds to the master level during live playback only; the export overload report is unchanged (export never has clicks).
- **Header cell layout:** 224 px now holds `BPM`, the input, `4/4` and the button; the button must be fully visible, the cell must not overflow, the chrome height must stay 64 px (MT-LAYOUT).
- **Keyboard:** after a click on the button, Space must still toggle playback (the existing keydown/keyup Space handling prevents button activation) and must not toggle the metronome.
- **Render budget:** the context value gains one stable callback; the existing `render-budget.test.tsx` stays green unchanged.
- **Expected suite: 93 files / 1626** (1605 + 11 in `metronome.test.ts` + 10 in `metronome-ui.test.tsx`).

**Out of scope for the whole project:** plugins and effects; pitch; multiple video layers; audio time-stretch. Grid tempo is never audio stretch. `/studio-lab` stays demo-only; purchase protection and the protected files stay unchanged.

## 1. Mandatory before acting (A)

1. **Read in full before the first edit:** `.claude/rules/read-primitives.md`; primitives `AGENT_DISCOVERABLE_CODE.md`, `FORWARDREF_COMPONENT.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `REACT_CONTEXT.md`, `AUDIO_ARCHITECTURE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`; `prompts/studio-feature.md`, `prompts/new-test.md`, `docs/implementation/TEMPLATE.md`; the `web-audio-api` skill. Then run the `pre-flight` skill. Optionally ask `studio-specialist` (read-only) about the click routing and lazy buffers; record the answer, do not widen scope.
2. **Baseline before any edit:** HEAD and `git status --short` (empty); `sha256sum -c ../tmp/studio-real-loop/b-round-65-r66-tree-sha256.txt | grep -vc ': OK$'` → 0; the snapshot `SHA256SUMS.txt` and `cmp` for the four owned files; protected 4/4; Biome 4/218/1; `node.exe`; both servers.
3. **Red run first:** write both test files before any source file, and run them. Expected: **both files fail** (`../metronome` does not resolve, or every test fails). Record the output. Then implement.
4. Post the pre-flight gate and the red run at the top of your report.

## 2. A: the change

### 2.1 Source
Implement exactly §0.1 and §0.3.

### 2.2 Tests

**`app/lib/arrangement/__tests__/metronome.test.ts`** (new, LF; 11 `it`). M9–M11 use a deterministic fake context written in this file (fixed `currentTime`, recording `connect` targets and `start` arguments); no browser APIs.

| ID | Must assert |
|---|---|
| M1 120 BPM | `planMetronomeClicks(120, 0, 4)` = the oracle row (8 clicks, `when`, `accent`, offsets 0, durations 0.03) |
| M2 index, not accumulation | `(90, 0, 8)`: 12 clicks, `when` **`toBe`** `(k × 60) / 90`; accents k = 0, 4, 8; and `(92.5, 0, 60)`: 93 clicks, every `when` **`toBe`** `(k × 60) / 92.5` |
| M3 window | `(40, 2, 5)` → 3.0, 4.5, no accent; `(120, 2.25, 3.1)` → 2.5, 3.0 with offset 0 |
| M4 EPS start | `(120, 2.00005, 3)`: first `when` 2.00005, `offset` 0.00005, `duration` 0.02995, accent `true` |
| M5 truncation | `(120, 0, 3.51)`: last duration 0.01 |
| M6 empty | every `[]` row of the oracle |
| M7 click samples | at 48 000: both lengths 1440; sample 0 is 0; max \|x\| within `[0.9 × peak, peak]` for accent (0.5) and beat (0.25); \|last sample\| < 0.002; the accent's dominant period ≈ 30 samples (1600 Hz) vs ≈ 48 (1000 Hz): count sign changes in the first 480 samples (≈ 32 vs ≈ 20, ± 2) |
| M8 messages | `metronomeStatusMessage(40)` = `მეტრონომი ჩართულია — 40 BPM, 4/4: კლიკი ყოველ დარტყმაზე, ტაქტის პირველზე უფრო ხმამაღლა. ექსპორტში არ შედის.`; `(92.5)` contains `92.5 BPM`; `(null)` = `მეტრონომი გამორთულია.`; the two titles verbatim (§0.1(1)) |
| M9 graph routing | `applySchedule` with `metronome: { accent, beat, clicks: planMetronomeClicks(120, 1, 3) }`, `from` 1, `startAt` 10: 4 click sources start at 10.0, 10.5, 11.0, 11.5 with `(offset, duration)` as planned; accent buffer only for `when` 2; every click source connects to one node X; X connects to the master gain (the node connected to `destination`); X is not a track gain, panner or track tap; no clip source connects to X |
| M10 append, stop, disconnect | `appendClicks(planMetronomeClicks(120, 2, 3), 2, 20)` starts 2 more at 20, 20.5; `stop(21)` calls `stop(21)` on every not-yet-ended click source and `stop()` calls `stop` on every click source; `activeSourceCount()` counts clips only (same value with and without clicks); after `disconnect()` every click source and X are disconnected and `appendClicks` starts nothing |
| M11 no metronome = no change | without `options.metronome`: `createGain` count = 1 + tracks (as today), no extra source; `appendClicks` is a no-op |

**`app/lib/arrangement/__tests__/metronome-ui.test.tsx`** (new, LF; 10 `it`; one `describe` with `{ timeout: 15_000 }`). Build the harness from `tempo-ui.test.tsx` (fake audio classes, `@remix-run/react` mock, mount pattern) and spy on `applySchedule`/`renderArrangementWav` with `vi.mock('~/lib/arrangement/graph.client', …importOriginal…)` as `master-ui.test.tsx` does (both frozen). Your `FakeAudioBuffer` adds `copyToChannel`; your `FakeSource.start` records its arguments. Fixture: the `tempo-ui` collection and clips (music 0/8, sfx 4/2; project end 8).

| ID | Must assert |
|---|---|
| UI1 disabled without tempo | toggle `disabled`, `aria-pressed` `false`, title `METRONOME_NEEDS_TEMPO_TITLE`; Play → the last `applySchedule` options have no `metronome` |
| UI2 on + play | set BPM 120 (type + Enter), click the toggle → `aria-pressed` `true`, status `metronomeStatusMessage(120)`; Play → `options.metronome.clicks` deep-equals `planMetronomeClicks(120, 0, 8)` (16 clicks) and `options.from` 0 |
| UI3 off while playing | while playing with it on, click the toggle → status `metronomeStatusMessage(null)`; exactly one new `applySchedule` call whose options have no `metronome` (forced resync) |
| UI4 on while playing | playing with it off, seek to 3.2 (`seekTo` via the api), click the toggle → one new `applySchedule` call; its clicks equal `planMetronomeClicks(120, from, 8)` with that call's `options.from` (first `when` ≥ `from`) |
| UI5 tempo change while on | playing with it on at 120, type 60 + Enter → one new `applySchedule` call with `planMetronomeClicks(60, from, 8)`; status `tempoStatusMessage(60)`; toggle still pressed |
| UI6 clear turns it off | on at 120, clear the field + Enter → toggle `disabled`, `aria-pressed` `false`; set 120 again → still `false`; Play → no `metronome` |
| UI7 loop iterations | loop 2–5 (set via the api's loop/range methods), BPM 40, on, Play from 2 → the first call's clicks equal `planMetronomeClicks(40, 2, 5)`; advance the fake clock past the horizon and run the pump (fake timers, `AUDIO_PUMP_INTERVAL_MS` = 200) → the handle's `appendClicks` was called with `planMetronomeClicks(40, 2, 5)`, `from` 2 and `startAt` = first `startAt` + 3 (one loop length later) |
| UI8 not in history | toggling on and off leaves the Undo title and `live(api).arrangement` deep-equal; Ctrl+Z after toggling does not change `aria-pressed` |
| UI9 export unaffected | with it on at 120, `exportWav()` → `renderArrangementWav` called with exactly 2 arguments; the first deep-equals the arrangement; the buffers map has the same keys as with it off (no click buffer) |
| UI10 Space after a click on the toggle | click the toggle (focus stays on the button), `keyDown`/`keyUp` Space on the button → playback starts (`isPlaying` true) and `aria-pressed` is unchanged |

**Expected count:** vitest **93 files / 1626**. Times: `toBeCloseTo(…, 9)` except the two **`toBe`** rows; never a regex.

### 2.3 Mutation proof (A, scratch only, outside `store/`)

Scratch copy with a `node_modules` junction and your own vitest config, as in round 65. Run on `metronome.test.ts`, `metronome-ui.test.tsx`, `graph.test.ts`, `master-ui.test.tsx`, `loop.test.ts`, `tempo-ui.test.tsx`, `grid-snap-ui.test.tsx`, `render-budget.test.tsx`. Each mutation must fail at least the named tests; restore after each one.

| # | Mutation | Must fail |
|---|---|---|
| a | accent on every beat | M1 |
| b | `when` accumulated (`t += 60 / bpm`) | M2 |
| c | EPS removed (`time ≥ from`) | M4 |
| d | no truncation at `until` (duration always 0.03 − offset) | M5 |
| e | metronome gain connected to `destination` instead of the master | M9 |
| f | click sources connected to the first track gain | M9 |
| g | click sources pushed into `sources` (counted) | M10 |
| h | metronome gain created even without `options.metronome` | M11 |
| i | `setMetronomeBpm` never resyncs while playing | UI3, UI4, UI5 |
| j | clearing the tempo keeps the metronome on | UI6 |
| k | click buffers created eagerly in `ensureAudioContext` | at least one frozen UI test file that presses Play (e.g. `master-ui`, `grid-snap-ui`) |
| l | loop refill without `appendClicks` | UI7 |
| m | toggle enabled without a tempo | UI1 |
| n | toggle writes no status | UI2 |
| o | `renderArrangementWav` given the click buffers (a third argument or extra map keys) | UI9 |
| p | click sources ignore the `when` of `stop(when)` (stop immediately) or are skipped by it | M10 |

**Rules:** write `a-round-66/mutations.txt` (command, result lines, failing test names). A surviving mutation → strengthen that test within §2.2; no tests outside the list. **Spec-assumption stop:** if a §2.2 assertion fails on the finished tree for a reason that is not an implementation bug (e.g. the oracle is wrong), stop and report to B; do not rewrite the assertion.

### 2.4 After the change
- **Self-check:** `npx tsc --noEmit` → 0; full `npx vitest run` → **93 / 1626, 0 failures**; `npm run build` → rc 0.
- **Biome:** read-only `npx biome check ./app` → ≤ 4 errors (only the baseline CRLF list), ≤ 218 warnings, 1 info; the 7 owned code/test files → 0 diagnostics.
- **Review:** run the real `code-reviewer` subagent on the diff; findings and dispositions in the report. Architecture notes go to B (`a-round-66.md` §6), not into code.
- **`/check`:** `npm run verify` → exit 0, quietly, no PW probe in parallel. Do not run `npm run test:e2e:smoke` (root's).
- **Browser smoke (`:5173` up):** one load of `/studio-lab` at 1440×900 and one at 1280×720; set BPM 40, turn the metronome on; screenshot; record whether the button text is fully visible in the header cell (`button.getBoundingClientRect().right ≤ cell.right` and `cell.scrollWidth === cell.clientWidth`). If it is clipped at either size, reduce the header cell's `gap-1.5` to `gap-1` (the only allowed layout change) and re-measure; report it. Not a PASS claim.

### 2.5 Doc 059
New `docs/implementation/2026/quarter-IV/059-studio-lab-metronome.md`. Georgian, technical terms in English, per `TEMPLATE.md` and `GEORGIAN_DOCS.md`. Sections: date, status (`Round 66 — D-29z31; C-ის შემოწმებას ელოდება`), changed project; context (FB-09, R15-T2, D-10, D-29z30); approach (§0.1, the oracle, the rejected list); architecture (Mermaid: click sources → metronome gain → master → destination + master tap; export path without clicks); changed files; problems and solutions; testing (red run, M1–M11, UI1–UI10, mutations a–p, gates); Ableton (§0.2 table); TODO (SRW-14 stage 5 musical divisions; METRONOME-UPFRONT-NODES; ARCH-CHECKPOINT-SRW14-PREFS (a)). Docs 001–058 are frozen.

## 3. File ownership (exact; nothing else may change)

### 3.1 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `app/lib/arrangement/metronome.ts` | A | new (§0.3) |
| `app/lib/arrangement/graph.client.ts` | A | additive (§0.3) |
| `app/contexts/ArrangementContext.tsx` | A | the seven enumerated edits (§0.3) |
| `app/components/arrangement/ArrangementTempoRow.tsx` | A | additive props + button (§0.3); `gap-1.5` → `gap-1` only under §2.4's smoke rule |
| `app/components/arrangement/StudioWorkspace.tsx` | A | the six enumerated edits (§0.3) |
| `app/lib/arrangement/__tests__/metronome.test.ts` | A | new (§2.2) |
| `app/lib/arrangement/__tests__/metronome-ui.test.tsx` | A | new (§2.2) |
| `docs/implementation/2026/quarter-IV/059-studio-lab-metronome.md` | A | new (§2.5) |
| `../tmp/studio-real-loop/a-round-66.md`, `a-round-66/` | A | report, gate output, scratch, own browse state |
| `../tmp/studio-real-loop/c-round-66.md`, `c-round-66.json`, `c-round-66/` | C | report, runs, shots, gates, own browse state |

**Expected `git status --short` at the end (from the empty start): 8 lines** — ` M` for `graph.client.ts`, `ArrangementContext.tsx`, `ArrangementTempoRow.tsx`, `StudioWorkspace.tsx` and `??` for `metronome.ts`, the two test files and doc 059. If root committed in between with identical content, the rule is the same: no path outside §3.1 may appear or change, and the frozen list stays 426/426 OK.

### 3.2 Frozen this round
- Everything in `b-round-65-r66-tree-sha256.txt` and everything else under `store/`.
- **Forbidden to modify** (C checks the first four by sha256 against `protected-baseline.json`): `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`; `app/lib/auth.ts`, `app/lib/__tests__/bug-hunting/**`, `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`; `components/studio/**`, `components/ui/**`, `components/layout/**`, `components/animations/**`; `root.tsx`, `entry.server.tsx`, `entry.client.tsx`, `app/styles/**`, `lib/sfx-*`, `app/routes/**`; firebase, R2, auth and purchase code; `public/**`, `package.json`, the lockfile; `.claude/**`, `AGENTS.md`, `CLAUDE.md`, `.agents/**`, `.codex/**`, `.kilo/**`, `.github/**`, `vercel.json`, `.husky/**`, `scripts/**`, `e2e/**`; the playwright and vitest configs, `../backend/**`, env/config files, the sitemap, `app/data/studio-lab-demo.ts`; the other roles' files under `../tmp/studio-real-loop/`, and root's `../tmp/studio-remote-reconcile/**`, `../tmp/studio-root-r49/**`, `root-publish/**`.
- **Also not allowed:** new dependencies or installs; deleting files or tests; git commit, stash, checkout, push or deploy; reverting earlier work; in-place mutation of `store/` files for experiments; killing processes you did not start; starting or stopping the dev server or the backend; `npm run format`; deleting `playwright-report/`, `store/nul` or any `*-round-6x/scratch/` folder.

## 4. Acceptance (C)

**Checkpoint order:** G66-2 → R66-S → R66-U → G66-1 → §4.6 (metronome browser rows) → §4.7 (regressions) → G66-3. Write `c-round-66/checkpoint.md` as you go. Check both servers at the start, after the offline items and before the report. `browserVerified` is `true` only if every REAL-browser row in §4.6, §4.7 and G66-3's workspace rows ran (BD-INFO and MT-PERF-INFO are info rows and do not gate).

### 4.1 R66-S — static (read-only)
- **`diff -u` against the snapshots:** `graph.client.ts` additive only (no existing line changed except where a new optional field/branch is inserted; `renderArrangementWav` and `ScheduleAudioContext` byte-identical); `ArrangementContext.tsx` only the seven §0.3 edits; `ArrangementTempoRow.tsx` only the new props and button (plus `gap-1` if A reported the smoke rule); `StudioWorkspace.tsx` only the six §0.3 edits.
- **`metronome.ts`:** pure; imports only `./model` and `./tempo`; `when` computed from the index; no DOM or Web Audio.
- **Laziness:** no `AudioBuffer`/`copyToChannel` call reachable from `ensureAudioContext`; the cache is reset on unmount.
- **Export:** `renderArrangementWav` has no metronome reference; `exportWav` passes no click buffer.
- **Context value:** no metronome state in it (only the `setMetronomeBpm` callback).
- **Banned patterns:** no `any`, assertions, `@ts-ignore`, comments or hardcoded colours; no `.skip`, `.only`, `.todo`, `retry`, `vi.setConfig` or per-`it` numeric timeouts.
- **Literals:** the UI strings match §0.1 byte for byte; no character outside Georgian, ASCII and `„“—·…–`.
- **EOL:** every owned file LF. **Doc 059** has the §2.5 sections; docs 001–058 unchanged (frozen list).

### 4.2 R66-U — unit and mutation (C's own scratch, own edits)
- **Red run:** the two new test files against a scratch tree without `metronome.ts` and with the four snapshot files → both files fail.
- **Mutations a–p:** re-run in your own scratch; each must kill its named tests. **C extras (info), suggested:** (p) accent on `k % 4 === 1` → M1/M4; (q) `when` not clamped to `from` (`when = time`) → M4; (r) the forced resync replaced by a plain `syncPlayback(present)` (no `force`) → UI3–UI5. Record survivors as test gaps.
- **Durations:** run the two new files alone and record them; a single test over 3 s is info.

### 4.3 G66-1 — gates
tsc 0; build; Biome read-only `./app` within 4/218/1, owned files 0 diagnostics; **vitest 93 files / 1626, 0 failures** (quiet); **`npm run verify` exit 0** (at most two quiet attempts, each recorded; neither rc 0 → FAIL); record any `Test timed out` with file, test and ms; record `node.exe`.

### 4.4 G66-2 — tree
Protected 4/4 OK; frozen 426/426 OK; `git status --short` matches §3.1 (8 lines from the empty start); HEAD at start and end.

### 4.5 Not run, or not testable
- `:5173` down → every browser row "not run (environment)", `browserVerified: false`.
- The click's sound quality and loudness by ear → Tech Lead (R66-T).
- Live audio is measured through the **master meter** (`arrangement-master-meter` `data-level-db`), sampled every ≤ 20 ms with REAL playback (Space or the Play button). A "rise" is a sample at least 10 dB above the previous sample. Times are read from the transport position readout at the same sample (record both clocks). Tolerance ± 0.15 s per click (INFO-C65-ONSET-EDGE).

### 4.6 Metronome browser rows — fresh `/studio-lab`, 1440×900, then the starred rows at 1280×720

**Meter fixture F-SILENT** (built once by a REAL-mouse (PW) drop, with no BPM): `Soft impact` on SFX at **≥ 20 s** (scroll or zoom out first; record its start). From 0 to that start the project is silent, so every master-meter rise there is a click. **Export fixture F-R65**: `Soft impact` on SFX at 4 and `Middle East — საჯარო preview` on music at 7 (round 65's TB-NOSTRETCH fixture).

| ID | Steps | Pass |
|---|---|---|
| **MT-DISABLED*** | fresh page | the toggle reads `მეტრონომი`, is disabled, `aria-pressed="false"`, title `მეტრონომი — ჯერ მიუთითე BPM`; screenshot |
| **MT-ON*** | type `40`, Enter; REAL click on the toggle | status verbatim `მეტრონომი ჩართულია — 40 BPM, 4/4: კლიკი ყოველ დარტყმაზე, ტაქტის პირველზე უფრო ხმამაღლა. ექსპორტში არ შედის.`; `aria-pressed="true"`; the enabled title verbatim |
| **MT-BEATS (real audio)** | F-SILENT, BPM 40, metronome on; REAL Space from 0; sample the master meter for 13 s | rises at 0, 1.5, 3 … 12 (9 rises, ± 0.15 s), **no other rise**; the rises at 0, 6 and 12 (the bar marks `1`, `2`, `3` of the bars ruler) peak ≥ 4 dB higher than the other six; the master readout shows no `Clip` |
| MT-OFF | same fixture, metronome off, REAL Space from 0 for 8 s | no rise; the master meter stays at the floor until the Soft impact start |
| MT-LOOP | F-SILENT, BPM 40, on; a loop brace 2–5 s (REAL-mouse (PW) on the loop row, or Ctrl+L on a 2–5 range); Space from 2; ≥ 3 wraps | per iteration rises at timeline positions 3.0 and 4.5 only; no rise at the wrap (2.0 is not a beat at 40 BPM) |
| MT-SEEK | F-SILENT, BPM 40, on, playing; REAL click on the seconds ruler at ~7.0 | the next rises are at 7.5 and 9.0 (± 0.15) |
| MT-LIVE-TOGGLE | F-SILENT, BPM 40; REAL Space from 0 with it off; REAL click on the toggle at ~3.7 s; REAL click again (off) at ~8 s | rises begin at the next beat after the click (4.5) and stop after the off click (no rise after it); the position readout never jumps backwards |
| MT-TEMPO-CHANGE | playing with it on at 40, REAL click into the BPM field, type `60`, Enter | the rise spacing becomes 1.0 s (rises at whole seconds) within one beat; the status is `ტემპი 60 BPM · 4/4 — …`; the toggle stays pressed |
| MT-MASTER | playing with it on at 40: REAL click Master mute → no rise while muted; unmute → rises return; then mute/solo the SFX track → rises unchanged | as stated |
| MT-CLEAR | with it on, empty the field + Enter | status `ტემპი წაიშალა — …`; the toggle disabled and unpressed; set `40` again → still unpressed; Space → no rise |
| **MT-EXPORT (real audio)** | F-R65; (a) metronome off: Export → WAV, save, sha256, frames; (b) BPM 120, metronome on: export again | the two WAVs are **byte-identical**; record whether they also equal round 65's `525958b4…` (secondary; a different fixture placement explains a difference, a click in the WAV does not); decode (b): every sample before frame 192000 (4.000 s) is exactly 0 (that stretch is silent in F-R65; at 120 BPM a click would sit at 0, 0.5 … 3.5 s) — any click in the export is a **High** bug |
| MT-UNDO | toggle on and off | the Undo button title is unchanged; Ctrl+Z (title recorded before it) does not change the toggle |
| **MT-KEYS*** | REAL click on the toggle (it keeps focus), then REAL Space, Space | playback starts and stops; `aria-pressed` unchanged; then `g` toggles Snap |
| **MT-LAYOUT*** | at both viewports, with no BPM, with BPM 40 and with it on | the button is fully visible (`right ≤ cell.right`, `cell.scrollWidth === cell.clientWidth`); BPM input and `4/4` still visible; chrome height 64 px; lane heights and the detail panel as round 65 (c-round-65.md §5 TB-LAYOUT); no horizontal page overflow; screenshots |
| MT-PERF-INFO (info) | F-R65, BPM 120, on; REAL Space ×5 | record the time from the keydown to the first position-readout change, against the same with it off (info for METRONOME-UPFRONT-NODES) |
| BD-INFO (info) | BPM 999; zoom to the maximum (REAL `=` presses); record the `arrangement-bars-mark` count and the duration of one zoom step (PW `performance.now()` around the key press until the readout changes) | info for ROOT-R65-M1-BEAT-DENSITY; not gating |

### 4.7 Regressions (directly related)
- **TB-REG:** BPM 90 → bars `2` at `2.666667 × Z` px; TB-SECONDS (seconds ticks identical); TB-ESC; TB-KEYS (typing `g12 ` stays text).
- **PLAY-REG:** with it off, F-R65 REAL Space from 3 s: the SFX track meter onset at 4.0 s (± 0.15), as round 65.
- **RU-REG:** seconds-ruler click seeks, ruler drag zooms, double-click Fit.
- **REG-HYD:** no hydration warning in the console on `/studio-lab` load.

### 4.8 G66-3 — anonymous workspace and purchase protection
Fresh browse state. `/studio-lab` directly and via the header link shows the workspace with the demo badge; no requests to `/api/studio-token`, `/api/recording-*`, `/api/download`, R2 (`r2.cloudflarestorage`, `r2.dev`, `r2-proxy`, `workers.dev`) and no `Authorization` header from workspace code (every §4.6–§4.7 run included); `/studio/middle-east` shows "Sign in required"; anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → **401**, fake Bearer → **403** (backend down → "not run (environment)"). Known and allowed: root `GET /api/cart`, GA consent-denied events, GTM, dev modules, the homepage Unsplash image and the homepage R2 cover image, Google Fonts.

### 4.9 Ableton
Two verdicts for each §0.2 row: CZABA requirement (PASS/FAIL) and Ableton match (confirmed / deliberate difference / unconfirmed / not applicable). MT-EXPORT and MT-MASTER are the rows to verify hardest.

### 4.10 Not run this round, and carried items (honest)

**Not run this round:** video sync and C-R27-01 (RF3-1, RF3-2, R5-L6); the full find → add → fit video → export flow (only MT-EXPORT's exports run); the FB-01..FB-16 stage regression; `npm run test:e2e:smoke` (root); the round 57–61 menu browser re-run.

**Root review round 65:** routed in "Why this round" above (ROOT-R65-M1-BEAT-DENSITY measured by BD-INFO; Lows #2, #4, #5, #6 → Lows batch; #3 closed; architecture signals → §6).

**Open C items:** C-R41-01 (TL-Q-VIEWPORT). **Tech Lead:** C-R27-01, C-R6-02, C-R8-01 (quiet Chrome); C-R23-01 + C-R38-01.

**Open Low / info (Lows batch unless Medium+):** R26-M1, A-R34-REVIEW-RESIDUALS, DEMO-SFX-FULL-SCALE, L3-REMOVED-TRACK-TAPS, SETTRACKMIX-NAN-IDENTITY, BIOME-HOOKS-DEPS, VIDEO-CLIP-TRANSLUCENT-GRID, DETAIL-RESET-SHRINK, SHIFT-BEFORE-DOWN-NOTE; rounds 49–55 Lows; GROUP-SUBMS-GRID-EDGE, A-R63-REVIEW-OOB-HIDES-REACHABLE-EDGE, INFO-R62-CROSS-FLOAT, INFO-R62-GEPLAY-UNDO, ENV-EXT-LOAD-HANG, C-R63-NPX-CACHE; A-R64-REVIEW-BLOCKED-EDGE-WIN, A-R64-REVIEW-SD5-EDGE; the grid-menu batch; ROOT-R64-L2…L6; ROOT-R65-L2/L4/L5/L6; INFO-C65-SELECT-FOCUS; A-R65 tempo-hint anchoring (the empty-strip hint scrolls off when the view is scrolled right).

**`root-pre-push-review.md`** (appended 2026-10-19 with the round-65 gate line): video sync RF3-1, RF3-2, R5-L6 (C-R27-01) open; R5-L3 partial; R5-L5, R5-E1, R6-S2, R6-S3 unit-only; **M1** (loop refill rAF-only → a hidden tab goes silent; note: a 200 ms `setInterval` pump now also refills, `AUDIO_PUMP_INTERVAL_MS`, so M1 needs re-measurement before any work); **M2** (per-frame position re-render; partly addressed by the position store); Lows L1–L4, L6–L8. **`publication-checkpoint.json`**: SRW-21 (purchased loader hardcodes `middle-east`); portable instruction paths; the SRW-23 scrollbar check at both viewports; SRW-11/12 library and stems parity; T12 continuation.

**Tech Lead manual checks:** the earlier list (… R57-T … R65-T), plus **R66-T:** on `/studio-lab` in your Chrome with headphones, set BPM 90, turn the metronome on and play — a click on every beat, louder on each bar number of the bars row; is the click level and sound acceptable against the music? Export — no click in the file.

## 5. Commands

```bash
cd C:/Apps/czaba-project/store
git rev-parse HEAD
git status --short
sha256sum -c ../tmp/studio-real-loop/b-round-65-r66-tree-sha256.txt | grep -vc ': OK$'
(cd ../tmp/studio-real-loop/b-round-65-r66-snapshots && sha256sum -c SHA256SUMS.txt)
for f in app/lib/arrangement/graph.client.ts app/contexts/ArrangementContext.tsx app/components/arrangement/ArrangementTempoRow.tsx app/components/arrangement/StudioWorkspace.tsx; do cmp -s "$f" "../tmp/studio-real-loop/b-round-65-r66-snapshots/$(basename "$f")" && echo "same $f" || echo "changed $f"; done
npx vitest run app/lib/arrangement/__tests__/metronome.test.ts app/lib/arrangement/__tests__/metronome-ui.test.tsx app/lib/arrangement/__tests__/graph.test.ts app/lib/arrangement/__tests__/master-ui.test.tsx app/lib/arrangement/__tests__/render-budget.test.tsx --reporter=verbose
npx tsc --noEmit
npx vitest run
npm run build
npx biome check ./app
npx biome check app/lib/arrangement/metronome.ts app/lib/arrangement/graph.client.ts app/contexts/ArrangementContext.tsx app/components/arrangement/ArrangementTempoRow.tsx app/components/arrangement/StudioWorkspace.tsx app/lib/arrangement/__tests__/metronome.test.ts app/lib/arrangement/__tests__/metronome-ui.test.tsx
npm run verify
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
tasklist | grep -ci node.exe
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5173/studio-lab
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5199/api/products
```

C re-runs the gates itself and uses the running `http://127.0.0.1:5173`.

## 6. Requests to root (non-gating for A)

1. **Commit units:** round 65 is published (`3e55c5c`, both remotes). Round 66 only after C.
2. **ARCH-CHECKPOINT-SRW14-PREFS — third request, now with the audio consumer.** Round 66 keeps `tempoBpm` and the new `metronomeOn` as non-history `useState` in `StudioWorkspace` and pushes the effective BPM into `ArrangementContext` through one setter (`setMetronomeBpm`, stored in a ref; no context state). This is the smallest form that does not prejudge your answer. Please run the bounded read-only frontend-architect (`store/.claude/references/architecture-checkpoint.md`) on: (a) view/edit preferences (`snapEnabled`, `gridSeconds`, `tempoBpm`, `metronomeOn`, `followMode`) in StudioWorkspace vs a small non-history preferences hook/slice, and whether the tempo should live next to the audio engine now that the metronome consumes it; (b) one time-precision rule (A-R62-ARCH-PRECISION-BOUNDARY + the round-64 `time-precision.ts` proposal); (c) the shared UI test harness (every UI test file copies the fake audio classes; round 66 adds one more with `copyToChannel`); (d) grid-menu state in StudioWorkspace (round-64 Signal 4); (e) **new:** `releaseEditFocusOnTimelinePointerDown` has 6 clauses — extract a pure predicate with a unit test? (round-65 Signal 3). **Answer format:** keep/extract, value, risk, ≤ 3 sentences each. An approved change becomes its own B task. **Round 66 does not wait** (two earlier requests are unanswered; waiting would delay an independent core feature indefinitely).
3. **INFO-R61-FAKEBEARER-500** (backend unreachable → 500 instead of 403/503; `api.studio-token.ts` protected): root's decision. **INFO-C65-LS-SESSION** (`czaba_session_id` on anonymous `/studio-lab`, root cart): root's note.

## 7. Reports and next

**A → `../tmp/studio-real-loop/a-round-66.md`:** (1) pre-flight gate, baseline and red run; (2) diff summary per file with EOL counts; (3) M1–M11 and UI1–UI10 with alone durations; (4) mutations a–p; (5) smoke + screenshots + the header-cell measurement; (6) code-reviewer findings, dispositions and any Architecture note; (7) verbatim command tails incl. `node.exe` and `npm run verify`; (8) deviations. Do not claim PASS. On a stop condition, stop and report.

**C → `c-round-66.md` and `c-round-66.json`** (usual schema with `browserVerified`): each ID PASS, FAIL with a bug ID, or **not run** with the reason; two verdicts for the Ableton rows; `passed` lists only IDs run this round; commit readiness for round 66.

**Next (orientation only):** C bugs from this round first; then **SRW-14 stage 5** (musical grid divisions from the BPM — bar, 1/2 … 1/32 — R14-G1: 1/4 at 120 BPM → 0.5 s multiples; seconds divisions stay when there is no BPM); then SRW-16 (FB-10 markers), SRW-17 (FB-12), SRW-18 (FB-06), SRW-19 (FB-07), SRW-20, SRW-24 follow-ups; ROOT-R65-M1-BEAT-DENSITY on BD-INFO evidence; the Lows batch; SRW-21; full regression and root review; T12.
