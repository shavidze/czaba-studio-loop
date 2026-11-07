# Round 397: PERF-13d. The five synth demo buffers are built in five tasks from one shared array

**Planned by:** B, at the round 396 → 397 planning, 2026-11-07 (`b-round-396.md`).
**Decisions:** D-29z1355 … D-29z1358 (`backlog.json` v364, `decisions_log_b`).
**Type:** final stage of PERF-13 (performance). No new screen element and no new behaviour a user must learn. What the user hears does not change (channel hashes equal HEAD, §6 BUF-HASH).

**Read first:**
- `lessons.md` in full. Most relevant here: L11, L23, L26, L28, L29, L31, L37, L38, L49, L51, L56, L57, L58, L59.
- This file. Open `tasks/round-396.md` only to look up a row.
- **Claims:** `b-round-396/claims-397.sh`, run from the loop root.
  - Planning output: `b-round-396/claims-397-planning-output.txt`.
  - Output on B's sketch: `b-round-396/claims-397-on-sketch.txt`.
  - A runs the claims before editing. C runs them at SOURCE-SCOPE start (must equal the planning output) and at the end (only the §7 facts may differ).

## Baseline: `4f28bff`, clean tree
- Gate 396 is `published`, commit `4f28bff` on both remotes [K1]. HEAD is `4f28bff` with 0 modified files [K2].
- Protected files: 11/11 [K3]. Frozen manifest `b-round-396/r397-frozen-sha256.txt`: 1284 entries, 0 failures [K4]. It covers every tracked file except the 3 tracked grants.
- Grants: `b-round-396/grants-397.txt` (§4).

## 0. Why this round
- C round 396 PASS, `browserVerified` true, 0 bugs [K7]. Gate 396 published it. PERF-13c is done (all three stages).
- **No open C bug.** Every open Critical/High/Medium is manual-only, `awaiting_user` or `open_root` (2026-10-23 rule).
- Regression is not due: the last one was 2026-11-07, round 390 [K5]; the next is due on or after 2026-11-10. RETRO is at round 400.
- PERF-13d is the last stage of PERF-13 and the next dependency-ordered item in STUDIO-PERFORMANCE. PERF-12b and PERF-11c-iii-d/e are `awaiting_user`.
- **Premise re-measured at HEAD (L37).** B's probe (`b-round-396/probe/premise.cjs`, dev server, CPU 6×) found one 187 ms long task that holds all five 768000-sample synth buffer builds (`b-round-396/probe/head-6x-1.json`). The ten `copyToChannel` calls take 7–12 ms each. B's row probe found the same at both viewports, three runs each: 135–185 ms, 5 builds in one long task [K16]. R314-DEMO-BUFFER-LONGTASK-6X is therefore confirmed, and its cause is known: the five loads resume from one awaited worker promise, so they run in one task.

## 1. Rulings (B)

### D-29z1356: scope of PERF-13d
1. **One shared array for both channels (PERF2-STEREO-COPY).**
   - `loadDemoSource` builds `new AudioBuffer({ numberOfChannels: 2, length: samples.length, sampleRate: DEMO_SYNTH_SAMPLE_RATE })` and calls `buffer.copyToChannel(samples, 0)` and `buffer.copyToChannel(samples, 1)` [K8].
   - `copyToChannel` copies into the buffer's own storage, so both calls may read the same array. This removes five 3 MB `Float32Array` copies per load [K9 `copy-ctor`].
   - `generateDemoStereoChannels` is deleted from `demo-synth.ts`; its only importer is `studio-lab-demo.ts` and no test imports it [K10]. L23 deleted-export rule: `npm run typecheck` is an A row.
   - This alone does not shorten the task by much: the ten `copyToChannel` calls stay. Item 2 is what splits it.
2. **One build per task on the worker path (R314-DEMO-BUFFER-LONGTASK-6X).**
   - `synthesizeDemoSamples(sourceId, signal)` takes the abort signal. For the mix and the four stems, after `await synthesizeDemoCompositionOffMainThread()`, it awaits `yieldToNextTask()` (a `setTimeout(resolve, 0)` promise), then calls `signal.throwIfAborted()`, then returns the samples [K8].
   - Timers run in the order they were set, so the five builds run in five tasks.
   - **The two generated SFX (Soft impact, Slow rise) get no yield.** Their arrays are 96000 and 240000 samples (1–4 ms per copy at 6×). B's first sketch applied the yield to them as well, and the full suite then failed NG5b and NG5c in `studio-narrow-gate-ui.test.tsx`, which wait one microtask for Soft impact to be ready (`b-round-396/precheck-full-v1-yield-all.log`, 2 FAIL [K18]). There is no value in changing those tests for a 1–4 ms build. Row SB6 pins this choice.
   - **`setTimeout`, not `scheduler.yield`:** `scheduler.yield` is not in every browser the Studio supports; a feature-detect adds a branch with no row that could fail. Recorded, not a STOP.
3. **Abort.** An abort that lands while a worker-path build waits for its task rejects with `signal.reason` and builds nothing (SB5).
   - Both consumers ignore a settled load once their signal is aborted [K11]: the collection effect (`controller.signal.aborted`) and the re-decode path (`signal.aborted`). Synth sources are not evictable (`canReloadSource` is true only for the two URL sources), so the re-decode path never reaches them today.
   - HEAD ignored the signal on the synth path and built the buffer anyway. The new rejection reaches no user-visible state.
4. **Mono is rejected.** Each track runs gain into a `StereoPannerNode`. A mono input is panned with the equal-power law (about −3 dB per side at pan 0); a stereo input with equal channels passes through at pan 0. Peaks and the WAV export also read the channel count. Keeping 2 channels keeps the sound identical (BUF-HASH).
5. **Status (L51).** No status write is added or moved. Per-source `ready` and the final text `Demo collection ready. Drag a sound onto a track, or press Enter to add it. Press ? for shortcuts.` [K22] are written only after every source settles. The yield delays the five builds by one task each; the final text and its order stay. Row BUF-STATUS checks the final text at 6×.
6. **Perf harness: no new row.** No existing `load.*` row isolates these builds. They are recorded at 1× only, where the five builds take about 30 ms in total, under the 50 ms long-task line; `load.settled.longtask-max` also holds the first-frame task. The deterministic evidence is the browser probe (§6 BUF-TASKS), which C runs with B's script. `perf/studio-lab.perf.spec.ts` is an affected check: its one assert row `load.script-max` (< 100) must still pass, and the `load.*` rows are recorded next to B's sketch run [K20].

### D-29z1357: notes from round 396, placed
- Gate-396 Lows go to `deferred_low_polish`: GATE396-L1-CORS-DEPLOY and GATE396-L2-SIGNED-URL-STRING (both also inputs to SRW-21-PLAN), and GATE396-I4-PREVIEW-ELEMENT-IDENTITY (info). The gate's third Low (restore in `finally` hides the real error) has the same root cause as B-R395-PERF-RESTORE-CATCH. Its evidence is merged into that id (L7); no new id.
- A-R396-REVIEW-DOC248-TODO (doc 248's TODO still lists PERF-13b-ii) and C-R396-NOTE-PS29-TITLE go to `deferred_low_polish`. A changes no line for them.
- The gate-396 Architecture note (GATE396-ARCH-STREAM-FACTORY) joins ARCH-CHECKPOINT-PREVIEW-AFTER-13C, which is now due. Root runs it; it does not block this round (§8).

### Side effects of the code this round touches (L49)
| Effect | Ruling |
|---|---|
| Five worker-path builds each wait one timer task | Intended (item 2). Ready order is by settle count, not by source order |
| An aborted worker-path load now rejects instead of resolving | Intended (item 3). Both consumers ignore it [K11] |
| `generateDemoStereoChannels` export removed | Intended (item 1). No importer outside the two source files [K10] |
| `load.commits` and `ready-ms` (record rows) may shift slightly | Accepted; recorded, not asserted |
| Generated SFX path | Unchanged; SB6 pins it |

### Ruling lines (L4)
- **Worker path vs SFX path:** only the worker path yields. SB4 and SB6 bind it.
- **Status line:** this round writes none.

## 2. Reference
- This is a performance round, so the policy exempts it from the full reference section and the `product-designer` consult.
- **Ableton:** `not applicable / perf`. Nothing a user sees or hears changes.
- **Screen budget (L39):** nothing new is visible.

## 3. What A changes
Apply `b-round-396/sketch-397.patch.txt` (sha256 `4db03d5ace7a6b76…` [K17]; `git apply --check` passes on the tree). It covers the 3 code and test paths. The docs are A's.

1. **`app/data/studio-lab-demo.ts`:** items 1–3 of §1 only: the import of `generateDemoStereoChannels` removed, `yieldToNextTask`, `synthesizeDemoSamples(sourceId, signal)` with the worker-path yield and abort check, and the two-call buffer build.
2. **`app/lib/arrangement/demo-synth.ts`:** delete `generateDemoStereoChannels` only.
3. **`app/data/__tests__/studio-lab-demo-synth-buffer.test.ts`** (new): rows SB1–SB6 as in the sketch.
4. **`docs/implementation/2026/quarter-IV/253-perf-demo-synth-buffers.md`** (new, Georgian, the 7 TEMPLATE headings in order):
   - l.4 byte-exact: `**სტატუსი:** Completed (C round 397 PASS)`;
   - the premise numbers and their files (`b-round-396/probe/head-6x-1.json`, `rows-summary.txt`), the five rulings of §1 and why (mono rejected, SFX not yielded, `setTimeout` not `scheduler.yield`);
   - the rows SB1–SB6 and the mutants of §5; the browser rows with B's sketch numbers;
   - TODO: the generated SFX still build in the effect task (1–4 ms at 6×, no row needed); cite only ids that exist (L26).
5. **`docs/implementation/2026/quarter-IV/247-perf-pcm-live-baseline.md`** (L28, final PERF-13 stage):
   - l.4 byte-exact: `**სტატუსი:** Completed (C round 397 PASS)`;
   - its `## TODO / შემდეგი ნაბიჯები` section only: item 4 (13d) marked done with a pointer to doc 253. No other line changes.

**B's sketch evidence:**
- `tsc` rc 0, scoped Biome rc 0 (`b-round-396/sketch-tsc.log`, `sketch-biome.log`).
- Full suite on the sketch: 259 files, 3847 tests, rc 0 (`b-round-396/precheck-full.log`) [K18].
- Covering set: see K19 (`b-round-396/precheck-covering.log`).
- Unit mutants 7/7 red, pristine rc 0 [K15].
- Browser probe HEAD vs sketch [K16]. Perf spec on the sketch [K20].
- `tech-lead` reviewed the sketch; the reviewed sha equals the dispatched one (`b-round-396/sketch-review.md`) [K17].

**No `as`, `any` or `@ts-ignore`.** A deviation from §1's semantics is a STOP (L11).

**Forbidden:**
- every path outside the grants, in particular `ArrangementContext.tsx`, `collection.ts`, `demo-synth.client.ts`, `demo-synth.worker.ts`, `studio-narrow-gate-ui.test.tsx`, `perf/**` and `types/arrangement.ts`;
- the global forbidden files and actions, the protected files and `package.json`;
- commit, push, stash, checkout, deploy and dev-server restarts.

## 4. Grants (`b-round-396/grants-397.txt`)
- `app/data/studio-lab-demo.ts`
- `app/lib/arrangement/demo-synth.ts`
- `app/data/__tests__/studio-lab-demo-synth-buffer.test.ts` (new)
- `docs/implementation/2026/quarter-IV/253-perf-demo-synth-buffers.md` (new)
- `docs/implementation/2026/quarter-IV/247-perf-pcm-live-baseline.md` (l.4 and the TODO section only)

## 5. A: tests
Row ids are binding. Each row names the mutant that must turn it red. A runs the unit mutants on a scratch copy outside `store/` with B's runner: `python3 -I b-round-396/mutants/run.py <scratch-root> a-round-397/mutants` (never omit the second argument). B's result is `b-round-396/mutants/summary.txt`.

| Row | Sequence | Expected | Mutant (red) |
|---|---|---|---|
| **SB1** (×5, worker sources) | Mocked composition (8-sample ramps); load one source | One buffer: 2 channels, length = samples, 48000 Hz; `copyToChannel` channels `[0, 1]`, both calls receive the composition array itself (`toBe`) | MU-397-SECOND-COPY, MU-397-MONO, MU-397-SKIP-RIGHT, MU-397-WRONG-STEM |
| **SB2** (×2, generated SFX) | Load Soft impact / Slow rise | 2 channels; length = generated length; both calls receive one array; channel 0 equals a fresh generation | MU-397-SECOND-COPY, MU-397-MONO, MU-397-SKIP-RIGHT |
| **SB3** (×5) | Load one worker source | Channel 0 and channel 1 equal the source value for value | MU-397-MONO, MU-397-SKIP-RIGHT, MU-397-WRONG-STEM |
| **SB4** | `setTimeout` stubbed to queue; start all 5 worker loads; flush microtasks; run the queued callbacks one at a time | 0 buffers before the first callback; 5 callbacks queued; exactly one more buffer after each callback; all 5 resolve | MU-397-NO-YIELD |
| **SB5** | Fake timers; start the bass load; flush; abort; advance one timer | Rejects with `signal.reason`; 0 buffers built | MU-397-NO-YIELD, MU-397-NO-ABORT-CHECK |
| **SB6** | `setTimeout` stubbed to queue; load both SFX; flush microtasks | 0 timers queued; 2 buffers built; both resolve | MU-397-YIELD-ALL |

DL1–DL8, DL-VAL, DL-EN, DL-BPM and PS15 in `studio-lab-demo.test.ts` are unchanged and stay green. No assert anywhere is removed or weakened.

**Collision rows (L23):**
- The covering set is `b-round-396/covering-files.txt` (16 files): every test file under `app/**`, `perf/**` and `e2e/**` that names `studio-lab-demo`, `demo-synth`, `routes/studio-lab`, `generateDemoStereoChannels` or `loadDemoSource`, plus the new file.
- Fake-timer suites that load the real demo collection: none [K14]. The UI suites that render the route stub the worker with a promise that never resolves.
- **Timeout headroom (L31):** see K19 for the slowest covering test against its timeout.

**A also runs:**
- `npm run typecheck`, `npm run lint`, and scoped `npx biome check` on the 3 `app/**` paths;
- `npx vitest run` on the covering set;
- the claims script at start and end;
- the `code-reviewer` (5 files changed).

A reviewer Medium whose fix falls outside §1 is a STOP (L11). A does not run the full suite, `verify`, the build, the perf spec or a browser.

**A's report, `a-round-397.md`:** the changed lines; each command with its rc and a log path under `a-round-397/`; the mutant logs; any deviation from the sketch; the reviewer's notes (Architecture notes go to B as signals).

## 6. C: browser rows
Run at 1440×900 and 1280×720 on `http://127.0.0.1:5173/studio-lab`, with a fresh context per run. Load `/studio-lab` once untimed in a browser first (L38).
- **Probe:** copy `b-round-396/probe/rows.cjs` into `c-round-397/` and run `node rows.cjs http://127.0.0.1:5173 6 <out.json> <viewport>`. It records every 768000-sample `AudioBuffer`, the arrays its two `copyToChannel` calls received, the long tasks that hold a build, the channel hashes, the final status and a short play of a Pulse clip.
- B's runs: `b-round-396/probe/head-6x-*.json` (HEAD) and `sketch-6x-*.json` (sketch), summary `rows-summary.txt` [K16].

| Row | Steps | PASS when |
|---|---|---|
| **PERF-LOAD** (run alone, first) | `npx playwright test --config playwright.perf.config.ts perf/studio-lab.perf.spec.ts`; results to `c-round-397/perf-results/` | The spec's `failures` are empty; `load.script-max` passes (< 100). **Record:** every `load.*` median next to B's sketch run (K20) |
| **BUF-TASKS** | 3 runs per viewport at CPU 6× | Every run: `synthBuilds` 5; `maxSynthBuildsPerLongtask` ≤ 1 (B's sketch: 0 ×6, and 1 in one extra 1280 run; HEAD: 5 in every run, 135–185 ms); `pageErrors` empty |
| **BUF-SAME-ARRAY** | Same runs | `sameArrayBuilds` 5 in every run (HEAD 0) |
| **BUF-HASH** | Same runs | `hashes` equals the HEAD string in `b-round-396/probe/head-6x-hash.json` and, per build, `hash0` = `hash1` (the sound is unchanged) |
| **BUF-STATUS** | Same runs | `status` is exactly `Demo collection ready. Drag a sound onto a track, or press Enter to add it. Press ? for shortcuts.` (same as HEAD) |
| **BUF-PLAY** | Same runs (`play` field) | `clips` 1 and `playing` `"true"` after adding Pulse with Enter and pressing Space |
| **AUTH** | Fresh context, no credentials | `/studio-lab` opens the demo; `/studio/<premium handle>` shows sign-in with no workspace; `/api/studio-token` without credentials is refused (4xx) |
| **SOURCE-SCOPE** | Claims at start and end; `git status`; `sha256sum -c` on `b-round-396/r397-frozen-sha256.txt` and `b-round-318/protected-sha256.txt` | Start equals the planning output. End: only the 5 grants changed (2 new); K4 0 failures; K3 11; K11 unchanged; only the §7 facts differ |
| **DOCS** | Read doc 253 and doc 247 | Doc 253: Georgian; the 7 TEMPLATE headings in order; l.4 exact as in §3; every cited row and mutant id exists; cited files exist. Doc 247: `git diff` touches l.4 and the TODO section only. `grep -rln 'In Progress (stage' docs/implementation` gives 3 files. `grep -rn 'C round [0-9]* pending' docs/implementation` gives 0 hits |
| **gate** | Full vitest, typecheck, build, Biome, verify | Marked `gate`; not claimed in `passed` |

- **jsdom-only note** (not in `passed`/`blocked`, no effect on `browserVerified`): SB5 (an abort timed inside the yield cannot be placed reliably in a browser), relying on A's `a-round-397/mutants/summary.txt`.
- **Ableton:** `not applicable / perf`.
- **All L57 fields in `c-round-397.json`:**
  - `manifestPaths` = `b-round-396/r397-frozen-sha256.txt`, `b-round-318/protected-sha256.txt`;
  - `missingPaths`, `countMismatches`, `claimCheckMinutes`;
  - an `origin` per finding;
  - `assertsSpecified`, `mutantsRecorded`;
  - `mutantRedOnSketch` = `b-round-396/mutants/summary.txt`;
  - `mutantRedOnTree`;
  - `gateChecksNamed`, `gateChecksRunOnSketch` (`b-round-396/precheck-full.log`, `precheck-covering.log`);
  - `chainHeadGateRunGreen` (gate 396 published `4f28bff`);
  - `affectedChecksNamed`, `affectedChecksRunOnSketch` (`b-round-396/perf-sketch-load.log`, `b-round-396/probe/rows-summary.txt`, `b-round-396/probe/sketch-6x-*.json`);
  - `progressFile`, `stopSignal`.
- **Before hand-off:** run `tools/l57-check.py`. Run PERF-LOAD alone first, then the probe runs. Write `c-round-397/progress.json` after each row (L59).

## 7. Claims that may change during the round
Taken from `diff b-round-396/claims-397-planning-output.txt b-round-396/claims-397-on-sketch.txt`, plus the docs:
CLAIMS_DELTA_PLACEHOLDER

Every other fact must equal the planning output, including K11 (the consumers) and K14.

## 8. Out of scope (recorded, not dropped)
- **Architecture checkpoint, now due:** ARCH-CHECKPOINT-PREVIEW-AFTER-13C (`b-round-393/root-request-arch-checkpoint-preview.md`), together with ARCH-CHECKPOINT-DECODE-REGION. New signal: GATE396-ARCH-STREAM-FACTORY (gate reviewer: keep; extract only if a fourth round touches `playLibraryPreviewStream`). Root runs it; it does not block PERF-13d, which touches neither region.
- **Deferred Lows** (§1, D-29z1357).
- **Purchased preview browser half:** still open evidence on SRW-21 (BLOCKED "no mount point: SRW-21 deferred_user" in C round 396).
- **Next:** PERF-14 → PERF-15 (PERF-12b and PERF-11c-iii-d/e are `awaiting_user`). The regression round is due at the first planning on or after 2026-11-10. RETRO is at round 400.
