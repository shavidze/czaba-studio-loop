# Round 282: PERF-2. The demo synth moves off the main thread (module Web Worker), so loading `/studio-lab` no longer blocks for ~370 ms. Nothing visible changes and the sound is bit-identical

**Planned by:** B, at the round 281 → 282 planning, 2026-10-31. **Decisions:**
- D-29z658: round 281 closed (C PASS, gate 281 published `000da42`). PERF-HARNESS-DIAG-281 is **მზადაა**. GATE279-S1, B-R280-CLICK-LIVE-LANE-ID and A-R279-REVIEW-LANE-NULL are closed.
- D-29z659: the gate-281 review and A's notes are recorded. GATE281-S2 (one doc-169 sentence) is folded into this round, because doc 169 is granted anyway (§5). The other Lows are deferred. The two architecture signals are recorded and not scheduled.
- D-29z660: C-R281-01 and the L29 ruling. A doc-line reference inside a "stays as written" clause is a fact and gets a `[K#]` tag. L29 is amended in place.
- D-29z661: the PERF-2 design (§2; consults `tech-lead` and `performance-optimizer`).
- D-29z662: the harness contract (§3). Four new rows. `load.script-max` is a ceiling assert (< 100 ms). `load.commits` and `load.components` become `wallclock`. The perf-plan target is worded honestly (§1.3).
- D-29z663: code byte-identical to B's measured sketch; the equivalence contract (§4).
- D-29z664: docs. New doc 211, plus sections of docs 163 and 169 (§7).
- D-29z665: the outcome table (§12).

**Kind of round:** performance (app code + perf harness). Not a user-visible feature: no element, text, position or behaviour changes on screen (B measured that every library state matches HEAD, §1.4). By the policy (2026-10-27/28, "pure performance … rounds"), these do not apply: reference-first, the AGREE note, the YouTube request, `product-designer` and the screen budget. No new dependency (`oss-adoption.md` does not map PERF-2 to a library).

**Owner:** A (one implementer). **Verifier:** C. **Grants:** §5 and `b-round-281-r282-grants.txt`. **Frozen list:** `b-round-281-r282-tree-sha256.txt` (1139 files: every tracked file except the 6 tracked grant paths).

## Baseline: HEAD `000da42`, clean tree
`gates/gate-round-281.json` is `published`, commit `000da42` [K1]. At planning, `git status --short` was empty and `git ls-files | wc -l` was 1145 (`b-round-281/git-status-at-planning.txt`, `head-at-planning.txt`).

## 0. Read first
1. `lessons.md`, every role. Especially L11, L23, L28, L29, L34, L37 and **L38**: perf runs alone; warm up before a timed browser probe.
2. This task.
3. B's sketch: `b-round-281/sketch.diff`. Apply it with `patch -p1` from `store/`. It holds the six code files of §5, not the new test file and not the docs.

**Primitives for A:**
- `AUDIO_ARCHITECTURE.md` (the audio data path);
- `AGENT_DISCOVERABLE_CODE.md` (new names);
- `ERROR_TAXONOMY.md` (no error code is added: a worker failure falls back silently, §2.3);
- `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`;
- `GEORGIAN_DOCS.md`;
- `.claude/prompts/new-test.md` (one new test file).

## 1. What changes, and why
### 1.1 Where the load time goes today
- `getDemoStemComposition()` builds four 16 s stems at 48 kHz plus their mix. It runs synchronously inside `loadDemoSource` for the mix and the four stems [K2]. The load effect calls `loadSource` for every source in one loop [K3], so the synthesis runs in the effect's task. Then each source's `.then` computes peaks on the main thread [K4].
- **B's measurements at `000da42`:**
  - **Node** (`b-round-281/synth-node-timing.txt`, 3 runs): composition 412–413 ms; soft impact 6 ms; slow rise 24 ms.
  - **Production build, Chromium, 1440×900, LoAF with script attribution** (`loaf-head.json`, 3 runs + 1):
    - Long task 1, at about 70–110 ms: **83–131 ms**. Its LoAF has **no script over 5 ms** (parsing, style or layout before hydration). Not PERF-2's work (§1.3).
    - Long task 2: **363–367 ms**, a single script `MessagePort.onmessage` (React's scheduler running the load effect). This is the synth.
  - **C's PERF-1a run (round 281):** `load.longtask-max` 366/368/368 and `load.longtasks-over-50` 2.

### 1.2 What B's sketch measured (`b-round-281/`)
| Measurement | HEAD `000da42` | Sketch |
|---|---|---|
| Longest script in a LoAF until the collection settles | 363–367 ms (`loaf-head.json`) | 46–53 ms, `Worker.onmessage` (`loaf-sketch.json`); in PERF-1a `load.script-max` 45/59/67 (v1) and 42/49/63 (v2) |
| `load.longtask-max` (PERF-1a, [0, ready]) | 366/368/368 (C round 281) | 78–90 (v1), 77–115 (v2): the first-frame task |
| `load.settled.longtasks-over-50` | — | 1–2 |
| Settled (status ready + 200 ms quiet) | — | 1541–1667 ms |
| `load.commits` / `load.components` | 5/5/5 · 366 ×3 | **5/5/6 · 371/371/464** (v1) and 5/6/5 · 371/464/371 (v2): the worker message now races the mp3 decode |
| WAV export, pulse stem only, sha256 | `1fea093b…` at both viewports | identical (`export-head.json`, `export-sketch.json`) |
| WAV export, all 7 synth sources (7 clips, 25 056 044 bytes), sha256 | `72228706…` at both viewports | identical |
| Built worker chunk | — | `demo-synth.worker-*.js`, 1959 bytes, contains no `new Worker` (the client module is tree-shaken out) |
| **Mutant MU-SYNC-FALLBACK** (the client always takes the sync path: `b-round-281/mu-sync-fallback.diff`, `demoCompositionJob ??= synthesizeDemoCompositionInWorker();` → `demoCompositionJob ??= Promise.resolve(getDemoStemComposition());`) | — | PERF-1a **FAIL**: `assert failed load.script-max: measured median 375 [375, 376, 363], budget < 100`; with the race gone, `load.commits` 5/5/5 and `load.components` 366 ×3 (`mu-sync-fallback/`) |

### 1.3 The perf-plan target, worded honestly (D-29z662)
- The perf-plan row says "load long task < 100 ms (463–491)". PERF-2 removes the synth's task: the longest script until settled falls from 363–376 ms to 42–67 ms.
- **`load.longtask-max` stays above 100 in some passes (77–115)**, because the first-frame task (no script over 5 ms) is not the synth.
- So PERF-2 is done when `load.script-max` < 100 and the synth task is gone. It is **not** "every load long task < 100 ms".
- The first-frame task is a new signal, **PERF2-FIRST-FRAME-LONGTASK** (info; candidates PERF-11 root diet and PERF-7 fonts). It is recorded in `open_findings` and not scheduled.

### 1.4 What must not change (B's browser probe, `library-head.json` = `library-sketch.json`)
At 1440×900 and 1280×720, on the production build:
- the same 9 library items in the same order, with the same text and durations: `01:41.352`, `02:30.372`, `00:02.000`, `00:05.000`, and `00:16.000` × 5;
- Add enabled for every item;
- 96 preview-wave `rect`s for every item;
- the same status sequence: `Loading the demo collection…` → `Demo collection ready. Drag a sound onto a track, or press Enter to add it. Press ? for shortcuts.`;
- 0 page errors.

The order in which items flip from loading to ready may change (the mp3s can finish first). That is not visible in this sequence: the status is written only once, after the last source settles.

## 2. The contract (D-29z661)
### 2.1 New `app/lib/arrangement/demo-synth.client.ts`
- `DEMO_SYNTH_WORKER_STALL_TIMEOUT_MS = 10_000`.
- `DemoSynthWorkerResponse`: `{ type: 'complete'; composition: DemoStemComposition }`.
- `readDemoSynthWorkerComposition(data: unknown): DemoStemComposition | null`. It is a structural check with no `as`: `type === 'complete'`, a `mix` and four stems, each a `Float32Array` over an `ArrayBuffer`. Otherwise it returns `null`.
- `demoCompositionTransfer(composition): ArrayBuffer[]`: the five buffers (mix + four stems).
- `synthesizeDemoCompositionOffMainThread(): Promise<DemoStemComposition>`:
  - if `typeof Worker === 'undefined'` (jsdom, SSR), it resolves to `getDemoStemComposition()`;
  - otherwise it starts **one** shared job (a module-level promise, `??=`). The 5 concurrent sources and a StrictMode re-run share it, and it survives remounts like today's `cachedDemoComposition`.
- **The job:**
  - It constructs `new Worker(new URL('./demo-synth.worker.ts', import.meta.url), { type: 'module' })`. This literal must stay inline: Vite bundles a worker only for this exact pattern [K10].
  - It arms the stall timer and posts `{ type: 'synthesize' }`.
  - On a valid `complete` message it resolves with the received composition.
  - On a constructor throw, `onerror`, `onmessageerror`, a malformed message, a `postMessage` throw or the stall timer, it **falls back** to `getDemoStemComposition()` on the main thread (§2.3).
  - In every case it clears the timer, nulls the three handlers and calls `terminate()` once.

### 2.2 New `app/lib/arrangement/demo-synth.worker.ts`
`self.onmessage` builds `getDemoStemComposition()` in the worker and posts `{ type: 'complete', composition }`, with `demoCompositionTransfer(composition)` as the transfer list. Transfer, not copy: B's 1b-ii run showed no backing-store move at ready.

### 2.3 Rulings
| Topic | Ruling | Why |
|---|---|---|
| Soft impact (6 ms) and slow rise (24 ms) | **stay synchronous** on the main thread, through `demoSynths` | both are small; one job type (`tech-lead`) |
| Worker failure | **silent sync fallback**, not a failed source | the synthesis is pure and deterministic; a worker failure is infrastructure. The demo keeps working, and `load.script-max` would show the long task again (MU-SYNC-FALLBACK) |
| Abort / unmount / StrictMode | the client has **no abort wiring**: the shared job keeps running, and the effect drops results after abort: two `if (controller.signal.aborted) {` checks follow `loadSource` [K3][K21] | the aborted caller's `AudioBuffer` build is wasted work and harmless; the next mount reuses the job |
| The stereo copy in `generateDemoStereoChannels` [K19] | **not changed** this round | saves ~1 ms per source; signal **PERF2-STEREO-COPY** for PERF-5 |
| Peaks in the worker (`WeakMap` hand-off) | **not this round** | it would touch `ArrangementContext.tsx`; it belongs to PERF-5 (peaks in a worker) |
| `ArrangementContext.tsx` | **untouched** (frozen) | the change sits behind `collection.loadSource` |
| `demo-synth.ts` | **untouched** (frozen); `demo-synth.test.ts` unchanged | the generators stay pure; the worker imports them |
| Georgian text | the new files contain none | ST51 walks `app/lib/arrangement` [K18]; `strings.test.ts` names no `demo-synth` file [K22], and the client has no user-facing string, so ST4 needs no entry |

### 2.4 `app/data/studio-lab-demo.ts` (sketch)
- Import `synthesizeDemoCompositionOffMainThread` and drop the `getDemoStemComposition` import.
- `demoSynths` loses its `demo-synth-mix` entry.
- `synthesizeDemoSamples` becomes `async`: the stems and `demo-synth-mix` await the shared job; impact and rise call their generators.
- `loadDemoSource` awaits it.

Nothing else changes, and the module-level collection literal never calls the client (the route also evaluates this file during SSR).

## 3. The harness contract (D-29z662)
- **`perf/lib/instrumentation.ts`:**
  - `PerfTimedEntry` gains `scriptMax?: number`.
  - The shared observer callback [K5] reads `entry.scripts`, with no `as`: `'scripts' in entry && Array.isArray(…)`, and each script's `duration` checked to be a number.
  - It stores the longest script as `scriptMax`, only when `scripts` exists, so `longtask` and `event` entries do not get the key.
- **`perf/studio-lab.perf.spec.ts`:** `waitForCollectionReady`'s return value becomes `settledMs` [K6]. At 1× only [K17], the new `measureSettled(page, result, settledMs)` takes `snapshot(page, 0, settledMs)` and records:

| Row | Kind / mode | Value | B's sketch |
|---|---|---|---|
| `load.settled-ms` | wallclock / record | `settledMs` | 1541–1667 |
| `load.script-max` | wallclock / **assert `<` 100** | the largest `scriptMax` among the window's LoAF entries | 42–67 (HEAD 363–367; fallback 363–376) |
| `load.settled.longtask-max` | wallclock / record | the longest long task in [0, settled] | 77–115 |
| `load.settled.longtasks-over-50` | wallclock / record | the count over 50 ms | 1–2 |

  - If no LoAF entry in the window carries `scriptMax`, the pass gets the problem `harness.loaf-scripts: no long-animation-frame entry carried script timings`. A dead probe can therefore not pass as "0 ms".
- **`perf/budgets.json`:**
  - the four rows above, inserted directly after `load.components`, with the notes of the sketch;
  - `load.commits` and `load.components` change `kind` `deterministic` → `wallclock` and get the sketch's note, which cites the measured [5, 5, 6] / [371, 371, 464]. This is the L37 precedent of `load.longtasks-over-50` in round 224 [K7].
- **This is the first ceiling assert on a wallclock row** (the existing wallclock asserts are liveness floors). The median of 3 decides.
  - An environment-invalid run (cold start, overlap) is kept and replaced, at most twice (L38).
  - A leftover task under 50 ms leaves no LoAF entry. That is fine for a ceiling.

## 4. Equivalence and byte identity (D-29z663)
**Code = sketch.** The six code files must be byte-identical to `git archive 000da42` + `b-round-281/sketch.diff`. If A finds a defect in the sketch, that is a STOP (§11), not an edit: any code change moves the bytes rows, the measured numbers and the mutants.

**EQUIV, from `store/`, with `S=../tmp/studio-real-loop/b-round-281/scripts/equiv-check-r282.py`:**
| Spec | Command | Must be |
|---|---|---|
| 1a vs B's sketch | `python3 -I $S <loop>/b-round-281/v2-1a/latest.json <new latest.json>` | rc 0, 0 problems |
| 1a vs C round 281 | `python3 -I $S <loop>/c-round-281/run-1/latest.json <new> --new load.settled-ms load.script-max load.settled.longtask-max load.settled.longtasks-over-50 --reclass load.commits load.components` | rc 0, 0 problems |
| 1b-i vs C round 281 | `python3 -I $S <loop>/c-round-281/run-1/latest-interactions.json <new latest-interactions.json>` | rc 0, 0 problems (B: 0, `v1-equiv-1b-i.txt`) |
| 1b-ii vs B's sketch | `python3 -I $S <loop>/b-round-281/sketch-results/latest-resources.json <new latest-resources.json> --tol res.export.1.peak-backing-delta-mib=0.1 res.export.2.peak-backing-delta-mib=0.1 res.mem.used-ready-mib=0.1` | rc 0, 0 problems. The bytes rows must match exactly: `res.js.studio-lab.encoded-bytes` 366987, `decoded-bytes` 1162601, `res.js.home.encoded-bytes` 263571, `res.js.studio-guard.encoded-bytes` 286181 |
| 1b-ii vs C round 281 | the same, against `c-round-281/run-1/latest-resources.json`, with `--free res.mem.used-ready-mib res.js.studio-lab.encoded-bytes res.js.studio-lab.decoded-bytes res.js.home.encoded-bytes res.js.studio-guard.encoded-bytes` and the two peak `--tol` | rc 0; the "moved" lines are exactly these five rows (B: `v1-equiv-1b-ii.txt`) |

The `--tol res.mem.used-ready-mib=0.1` against the sketch is a named machine-variance allowance (5.3 ↔ 5.4, as with the peak rows, D-29z647).

## 5. Grants (exact; also in `b-round-281-r282-grants.txt`)
| Path | What may change |
|---|---|
| `app/lib/arrangement/demo-synth.client.ts` | **new**, = sketch |
| `app/lib/arrangement/demo-synth.worker.ts` | **new**, = sketch |
| `app/data/studio-lab-demo.ts` | = sketch (§2.4) |
| `perf/lib/instrumentation.ts` | = sketch (`PerfTimedEntry`, the observer callback) |
| `perf/studio-lab.perf.spec.ts` | = sketch (`measureSettled` before `runPass`; the `settledMs` line) |
| `perf/budgets.json` | = sketch (four rows; two `kind`/`note` changes) |
| `app/lib/arrangement/__tests__/demo-synth-worker.test.ts` | **new** (§6) |
| `docs/implementation/2026/quarter-IV/211-perf-demo-synth-worker.md` | **new** (§7) |
| `docs/implementation/2026/quarter-IV/163-studio-perf-harness.md` | the whole sections `### Pass-ის თანმიმდევრობა (ინტერპრეტაცია)` (step 1 names the new rows) and `## მეტრიკების განმარტება და ზღვრები` (the load rows) (L34), plus one TODO bullet [K15] |
| `docs/implementation/2026/quarter-IV/169-perf-resources-baseline.md` | the `loaf-blocking-max` row of `### Export-ის მეტრიკები` (l.37 says the instrumentation stores only `duration` [K16]; it now also stores `scriptMax`, still no `blockingDuration`), plus the TODO bullet on B-R281-RESOURCES-READY-FAILED. That bullet gains GATE281-S2's sentence: in the measured runs (MU-FAILED-OTHER 6/6), the usual result for a failed non-selected source is an abort at load |

**Not granted (frozen):**
- `app/contexts/ArrangementContext.tsx`, `app/lib/arrangement/demo-synth.ts` and every other `app/**` file;
- the existing tests (`demo-synth.test.ts`, `studio-lab-demo.test.ts`, `library-notice-ui.test.tsx`, `strings.test.ts`, `export-cancel.test.ts`, …);
- `perf/lib/*` except `instrumentation.ts`;
- the other specs, `budgets.interactions.json`, `budgets.resources.json`, `playwright.perf.config.ts`;
- `package*.json`, `e2e/**`, `.claude/**`;
- the four protected auth/purchase files (`studio.$productId.tsx`, `api.studio-token.ts`, `app/lib/auth.ts`, `AuthContext.tsx`).

A hunk outside its column is a scope FAIL.

## 6. Tests
### 6.1 New `app/lib/arrangement/__tests__/demo-synth-worker.test.ts` (vitest, jsdom)
- **Reset:** each test calls `vi.resetModules()` and imports the client (or the worker) dynamically, because the shared job is module state. No test-only export is added to the client.
- **Fake worker:** a `FakeWorker` class through `vi.stubGlobal('Worker', FakeWorker)`, as in `export-cancel.test.ts` [K11]. It records instances, the posted message, `terminate()` calls and the handlers, and has an `emit(data)`.
- Unstub after each test.

| Row | Setup → action | Expected |
|---|---|---|
| DW1 | no `Worker` global (jsdom default) | the client resolves to the **same object** as `getDemoStemComposition()` (`toBe`) |
| DW2 | FakeWorker; 5 concurrent calls | exactly **1** instance and 1 posted message `{ type: 'synthesize' }` |
| DW3 | DW2, then `emit({ type: 'complete', composition: c })` with a valid composition `c` | all 5 promises resolve to `c` (`toBe`); `terminate()` called once; `onmessage`, `onerror` and `onmessageerror` are `null` |
| DW4 | FakeWorker; call; fire `onerror` | **with fake timers and no time advanced**, after flushing microtasks the promise has resolved to `getDemoStemComposition()`'s object; `terminate()` once |
| DW5 | as DW4 with `onmessageerror` | the same |
| DW6 | `emit` of a malformed message: (a) `{ type: 'complete' }`; (b) a `pulse` that is a plain array | the same fallback, each case |
| DW7 | a FakeWorker whose constructor throws | resolves to the sync composition; no instance recorded |
| DW8 | fake timers; call; advance `DEMO_SYNTH_WORKER_STALL_TIMEOUT_MS` | fallback; `terminate()` once. Advancing 1 ms less leaves it pending |
| DW9 | after DW3, a later call | resolves to `c`; still 1 instance |
| DW10 | the worker module: spy on `window.postMessage` (jsdom: `self === window`; stub the implementation before the dynamic import), import `../demo-synth.worker`, dispatch a `MessageEvent` to `self.onmessage` | `postMessage` called once with `{ type: 'complete', composition }`. Every array equals `getDemoStemComposition()` sample by sample (a length + index loop, not `toEqual` on 768 000 floats). The transfer list holds exactly the five underlying `ArrayBuffer`s (`toBe` each) |

**Named unit mutants** (A and C each run them on a scratch copy of the final tree; each must turn the named row red):
| Id | Mutation | Red row |
|---|---|---|
| MU-U1 | `demoCompositionJob ??= …` → `demoCompositionJob = …` | DW2 (5 instances) |
| MU-U2 | `worker.onerror = () => finish(null);` → `worker.onerror = () => undefined;` | DW4 (still pending without a time advance) |
| MU-U3 | the worker posts without `{ transfer: … }` | DW10 |

### 6.2 What A runs (speed rules; L38: perf alone, nothing else running)
1. `npm run typecheck`; `npm run lint` (report the counts); Biome on the three new or changed `app/` files (L30: `perf/**` is outside Biome [K12]).
2. `npx vitest run` on the new file plus `demo-synth.test.ts`, `studio-lab-demo.test.ts`, `library-notice-ui.test.tsx`, `strings.test.ts` (B ran the last four on the sketch: 89 tests in 4 files, PASS).
3. MU-U1…3.
4. `CI=true npx playwright test --config playwright.perf.config.ts` (all three specs) once, alone. Then the §4 EQUIV commands. Report each spec's time.
5. MU-SYNC-FALLBACK: copy the final tree to a scratch folder, apply exactly the one line of `b-round-281/mu-sync-fallback.diff` to `app/lib/arrangement/demo-synth.client.ts`, then `b-round-281/scripts/run-1a.sh <scratch> <out>`, alone. The expected signal is `assert failed load.script-max` with a median ≥ 300.
6. `bash ../tmp/studio-real-loop/b-round-281/claims.sh` on a fresh `git archive 000da42` copy. It must equal `b-round-281/claims-output-at-000da42.txt` (K1 prints `(archive)` outside git).
7. The code-reviewer subagent (3+ changed files). Pass its Architecture note on.

Not A's rows: the full vitest, the build, `npm run verify` and `test:e2e:smoke` (gate rows).

## 7. Doc 211 (new) and the other doc edits
Write `docs/implementation/2026/quarter-IV/211-perf-demo-synth-worker.md` in Georgian, with English technical terms:
- l.4 is exactly `**სტატუსი:** Completed (C round 282 PASS)` (L28).
- It has the seven TEMPLATE headings in order (L26):
  - **context:** §1.1 and §1.3, including the first-frame signal;
  - **approach:** §2 and the §2.3 rulings, with the rejected options (chunked yielding: still ~413 ms of main-thread work and resumable generators; lazy on first use: the library would show 5 items without duration or waveform and the status would never be ready);
  - **architecture:** a Mermaid sequence (load effect → `loadDemoSource` → shared job → worker → transfer → `AudioBuffer`; fallback branch);
  - **changed files**;
  - **problems/solutions:** the commit race → `wallclock`; the first-frame task;
  - **testing:** DW1–DW10, MU-U1…3, A's perf numbers, EQUIV, MU-SYNC-FALLBACK and the export sha256;
  - **TODO:** PERF2-FIRST-FRAME-LONGTASK, PERF2-STEREO-COPY, peaks in the worker (PERF-5).
- Every test claim names an existing row or mutant (L26).

Docs 163 and 169: only the §5 sections.

## 8. C rows (C runs nothing else while a perf spec runs, L38)
| Row | Check |
|---|---|
| SOURCE-SCOPE | `sha256sum -c b-round-281-r282-tree-sha256.txt` rc 0 at the start and at the end; `git status` shows only §5 paths (at most 6 `M` + 4 `??`) |
| HUNK-SCOPE | the six code files are byte-identical to `git archive 000da42` + `b-round-281/sketch.diff` (`cmp`); the doc hunks are inside their §5 sections; the test file is new |
| CLAIMS | `claims.sh` on a clean `000da42` archive equals `claims-output-at-000da42.txt`; plus the L29 untagged-fact sweep over this task |
| SWEEP | SW-A on A's tree: the new names occur only in the granted files and docs; SW-B: `load.commits`/`load.components` are still consumed only by `perf/budgets.json` and `perf/studio-lab.perf.spec.ts`; SW-C: the `PerfTimedEntry`/`.loafs` consumers are unchanged in number, and 1b-i EQUIV is 0 |
| TYPECHECK | `npm run typecheck` rc 0 |
| UNIT | the five vitest files of §6.2 item 2 pass; DW1–DW10 exist by name |
| UNIT-MUTANTS | C's own MU-U1…3, each red at its row |
| PERF-RUN | the three specs, alone: `3 passed` |
| EQUIV | the five §4 commands, each with its expected result |
| SCRIPT-MAX | in C's PERF-1a: `load.script-max` is an assert PASS with a median < 100 and three samples; `load.settled-ms` ≥ `load.ready-ms` in every pass; no `harness.loaf-scripts` problem |
| SYNC-FALLBACK | C's own MU-SYNC-FALLBACK run (the exact one-line mutation of `b-round-281/mu-sync-fallback.diff`): `assert failed load.script-max`, median ≥ 300 |
| WORKER-BROWSER | **real browser, both viewports**, on C's own production build of A's tree (separate port and `cacheDir`, L38), after one untimed warm-up: (a) a `demo-synth.worker` resource request is made; (b) a LoAF observer with script attribution (like `b-round-281/scripts/loaf-probe.cjs`) shows a `Worker.onmessage` script and **no script ≥ 100 ms** from navigation start to `Demo collection ready`; (c) 0 page errors |
| LIBRARY-STATES | real browser, both viewports: the §1.4 values exactly. That is the 9 ids in order, item text, Add enabled, 96 wave `rect`s per item, and the status sequence ending in the exact ready text (L51: the final text after the last async write). Probe: `b-round-281/scripts/library-probe.cjs`; expected values: `library-head.json` |
| EXPORT-BITEXACT | real browser, both viewports: `b-round-281/scripts/export-probe.cjs` on C's build; `pulse` sha256 `1fea093b975946c800329006e1c9943560bf3ac3cb86e361f2cd4628ce033f94` and `all` (7 clips) sha256 `72228706bcc163d49bdf1d4437a4343877fd87e0f80559814ab431d83c9b574e`; 0 errors |
| SSR | `curl` on `/studio-lab` of C's production server returns 200 with the route's HTML (the route imports a `.client.ts` module through `studio-lab-demo.ts` [K20]) |
| G282-AUTH | a fresh context with no credentials, at both viewports. **`/studio-lab`:** renders the demo workspace with the badge `Demo collection — no sign-in required`, and `auth_user` is null. **`/studio/middle-east`:** shows `Sign in required`, `audio[src]` is 0, and no workspace renders. **`/api/studio-token`:** with no header → 401; with a fake bearer → not 200 and no token |
| DOC-211 | l.4 is byte-exact; the seven TEMPLATE headings are in order; each test claim names a row or mutant that exists; docs 163/169 changed only in their §5 sections; `grep -rn 'In Progress (stage' docs/implementation` = 0 [K14] |
| gate | full vitest, build, Biome, `npm run verify` and `test:e2e:smoke` are the root gate's and are not claimed |

`browserVerified` and `realVerified` are true only if PERF-RUN, SYNC-FALLBACK, WORKER-BROWSER, LIBRARY-STATES, EXPORT-BITEXACT and G282-AUTH ran in a real Chromium. Ableton conformity: does not apply (performance round).

## 9. Neighbour risk
- **Library and status.** The order in which sources settle changes (§1.4). LIBRARY-STATES and the unchanged `studio-lab-demo.test.ts` cover it.
- **Export and playback.** Every synth source must sound identical: EXPORT-BITEXACT.
- **SSR.** The client file is `.client.ts` and is only called inside `loadDemoSource`: the SSR row.
- **Other workers.** `export-wav.client.ts` and the SFX export are untouched (frozen).
- **Perf rows of other specs.** The bytes rows move by the client code (§4). 1b-i is unchanged.
- **Purchased Studio.** It uses a different collection [K20]; no protected file changes.

## 10. Lessons applied
- L23: B pre-applied the sketch and ran the four existing covering test files (89 tests, PASS), typecheck (rc 0) and Biome (0 errors after format) on a scratch copy.
- L37: the commit race made `load.commits` wallclock; B's two runs measured it.
- L29: claims block below.
- L34: doc sections granted whole.
- L38: B's perf runs ran alone.

## 11. STOP conditions (L11)
- Any code change beyond the sketch seems needed, e.g. a sketch defect found by A or by the code-reviewer.
- EQUIV gives a problem that the named allowances do not cover.
- A DW row cannot be written against the sketch as specified, or a unit mutant stays green.
- `load.script-max` median ≥ 100 in A's run, in two valid runs (L38).
- Any change is needed outside §5.

## 12. Outcome, fixed in advance (D-29z665)
| Result | Next |
|---|---|
| C PASS and the gate publishes | PERF-2 is **მზადაა**. Round 283 = REGRESSION if its planning falls on or after 2026-11-02, otherwise PERF-3 (consults first) |
| C FAIL on a test or doc row | a bounded fix-up with the same grants |
| C FAIL on SCRIPT-MAX or WORKER-BROWSER in valid runs | B re-measures before any re-dispatch (L10) |

## 13. Deliverables
- **A:** the six code files (= sketch), the new test file, doc 211 and the doc sections; `a-round-282.md` with the commands, results, mutant tables, the review and its Architecture note.
- **C:** `c-round-282.md`, `c-round-282.json`, and evidence in `c-round-282/`.

## 14. Root notes
- `app/**` changes (3 files + 1 test). The gate runs the full verify.
- ROOT-REQ-PERF-TIMEOUT stays open: B's v2 PERF-1a took 7.3 min, 49 % of 15 min.

## Claims block (L29)
Run `bash ../tmp/studio-real-loop/b-round-281/claims.sh` from `store/` at HEAD `000da42` (or on a clean archive). The expected output is `b-round-281/claims-output-at-000da42.txt`.

| Tag | Claim | Expected |
|---|---|---|
| K1 | HEAD is `000da42` | `000da42` |
| K2 | the demo collection calls `getDemoStemComposition()` synchronously | 2 lines (27, 98) |
| K3 | the load effect calls `.loadSource(source, decodeContext, controller.signal)` once, in a loop | 1 line (3874) |
| K4 | peaks are computed on the main thread with `computePeaks(…)` | 2 lines (2466, 3883) |
| K5 | the observer stores `t`, `duration` and `name` only | 1 line (196) |
| K6 | the load window ends at ready; the status wait follows | 2 lines (519, 564) |
| K7 | the five PERF-1a load rows | `longtask-max` and `longtasks-over-50` wallclock; `ready-ms` wallclock (PERF-5); `commits` and `components` deterministic; all `record` |
| K8 | `app/lib/arrangement` has one `demo-synth*` file | `demo-synth.ts` |
| K9 | importers of the demo collection or the synth (roots `app perf e2e`) | 5 files, as in the output |
| K10 | the module-worker precedent `new Worker(new URL(` | 3 lines |
| K11 | the `FakeWorker` + `vi.stubGlobal('Worker'` precedent | l.38 + 6 stubs |
| K12 | vitest and Biome include `app/**` only | 2 lines |
| K13 | the last implementation doc is 210 | `210-perf-harness-load-diagnostics.md` |
| K14 | no `In Progress (stage` line | 0 |
| K15 | doc 163 names the load rows at l.24, 70, 71 and 117 | 4 lines |
| K16 | doc 169 l.37 says the instrumentation stores only `duration` | 1 line (37) |
| K17 | load rows are recorded at 1× only (`if (!record) result.samples.clear();`) | 1 line (555) |
| K18 | ST51 walks the Studio sources | l.2760 |
| K19 | `generateDemoStereoChannels` has one caller outside tests | `studio-lab-demo.ts:142` (+ the import l.5 and the definition) |
| K20 | the demo collection is used only by `/studio-lab` | `studio-lab.tsx` l.4 and l.27 + the definition |
| K21 | the load effect has two `if (controller.signal.aborted) {` checks after `loadSource` | 2 |
| K22 | `strings.test.ts` names no `demo-synth` file | 0 |
| SW-A | the new names do not exist at HEAD (roots `app perf e2e`) | 0 |
| SW-B | consumers of `load.commits`/`load.components` (roots `app perf e2e`) | `perf/budgets.json`, `perf/studio-lab.perf.spec.ts` |
| SW-C | consumers of `PerfTimedEntry`/`.loafs` (roots `app perf e2e`) | instrumentation 9, page 1, interactions 3, studio-lab 1 |
