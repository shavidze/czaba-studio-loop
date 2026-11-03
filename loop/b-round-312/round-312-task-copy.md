# Round 312: PERF-5a. Waveform peaks leave the main thread: a shared peaks worker fed with bounded, recycled chunks, output byte-identical, "ready" still means the bars are drawn

**Planned by:** B, at the round 311 → 312 planning, 2026-11-03.

**Decisions** (all in `backlog.json` v271 → `decisions_log_b`):
- **D-29z832: round 311 is closed.** C PASS, and gate 311 published `dfa4502`. PERF-4e is done. GATE310-M1, GATE310-L3, C-R310-01 and A-R310-REVIEW-L1 are closed.
- **D-29z833: the new worker-test Lows are deferred.** C-R311-01, A-R311-REVIEW-L4 and GATE311-L1 go to `deferred_low_polish` as one batch. They close with the next worker round that owns `r2-proxy.test.mjs`.
- **D-29z834: PERF-5 is split, and nothing is dropped.**
  - **5a** (this round): the peaks move off the main thread.
  - **5b:** the rAF/`startTransition` batching of peaks and state updates, with its own premise re-measure.
  - **The power-of-two pyramid** goes to PERF-14, where its first consumer lives.
- **D-29z835:** the mechanism rulings, the contract (§4), the test rows (§6) and the 12 mutants.
- **D-29z836:** requests and bookkeeping (§10).

**Read first:** `lessons.md`. These apply directly:
- L11: STOP.
- L23: sketch and full suite on the sketch.
- L26/L28: the doc.
- L29/L56: claims.
- L37: the premise was re-measured.
- L38: probes run alone, and a second dev server gets its own `cacheDir`.
- L49: a replaced call keeps its side effects.
- L52: asserts must be able to fail.

**L29 note:** untagged code text in this task is an expected value or a new name, not a fact about current code. Facts about `store/` carry `[K#]`.

## Baseline: HEAD `dfa4502`, clean tree
- Gate 311 published `dfa4502` on both remotes [K1]. HEAD is `dfa4502`, and `git status` is empty [K2].
- **Frozen list:** `b-round-311-r312-tree-sha256.txt`, 1,184 entries [K3]. Each of the 7 protected auth/purchase files appears once [K4].
- After A's change, `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-311-r312-tree-sha256.txt`, run from `store/`, fails only on the 2 modified paths of §5. The 5 new files of §5 are the only new files.

## 0. Why this round

### 0.1 Premise re-measured at HEAD (L37)
Measured on the dev server, Chromium 143, with a CDP CPU profile at 100 µs, fresh `/studio-lab`, 9 demo sources.
- **Main-thread inclusive time in `computePeaks`:** 55–86 ms per load over 5 loads. Single calls were 0.9 to 25.9 ms. Every call comes from the collection-load `.then` [K11].
- **No peaks worker exists:** the only worker created is `demo-synth.worker.ts` [K11].
- **Call sites:** `computePeaks` is called twice in `app/contexts/ArrangementContext.tsx`, in the video-import decode and in the collection load, and each call is followed by `setSourcePeaks` [K5][K6].
- **Not owned here:** the largest load long task (65–78 ms) is the synth worker's `onmessage` handler. `synthesizeDemoSamples` for the 2 SFX still runs on the main thread (about 20 ms). Both are recorded as a PERF-2 remainder signal (§10), not this round's scope.

**Mechanism measurement (D-29z835).** Chromium, a 5-minute 48 kHz stereo `AudioBuffer`, `b-round-311/probe/browser-copy.txt` [K20]:

| Main-thread work | Total | Largest single slice |
|---|---|---|
| `computePeaks`, today | 29.6–32.6 ms | the same (one call) |
| `copyFromChannel` into **fresh** `Float32Array`s (any chunk size) | **58–82 ms** | 1.4–63 ms |
| `copyFromChannel` into **one reused** buffer set | **5.6–9.3 ms** | 0.1–3.5 ms |
| Main-thread time-sliced compute | 43–47 ms | 3.8–6 ms |

**Ruling:** a worker fed with freshly allocated copies costs the main thread **more** than today, so the chunk buffers must be recycled; recycling is required, not optional. The worker sends each chunk's arrays back with its ack, and the client reuses them. In-flight chunks are bounded, which caps the transient memory at about 8 × 2 s of one channel (≈ 3 MB at 48 kHz).

### 0.2 What changes for the user
Nothing visible. The waveforms are byte-identical. "Demo collection ready" and every source's ready state still arrive only after that source's peaks exist, so "ready" still means the bars are drawn. The main thread stops computing peaks.

### 0.3 Consults (read-only) and rulings (D-29z835)
**performance-optimizer:**
- Stream 2 s chunks to one shared, lazily created worker that keeps a running bucket state. The result stays byte-identical because max is order-free.
- Bound the in-flight chunks and use the ack for backpressure.
- Pyramid → PERF-14.
- On worker failure, do not return to a long synchronous task.
- **Correction from B's measurement:** the consult estimated fresh-copy cost at memcpy speed and called recycling optional. §0.1 measures fresh copies at 58–82 ms per 5-min stem, so recycling is required.
- **Its proposal "mark ready immediately and let the waveform fill in later" is rejected** (see tech-lead).

**tech-lead:**
- Use `peaks.client.ts` + `peaks.worker.ts`, in the `demo-synth.client.ts` pattern, with one shared worker and job ids.
- **Keep "ready" after the peaks:** `perf/lib/page.ts` `waitForLibraryReady` waits for the preview `rect` [K23], and the context's ready consumers assume the peaks exist.
- Use a stall timeout of about 3 s, not the synth's 10 s [K21].
- Guard both call sites against abort after the await.
- Defer the batching and the pyramid.
- Keep the Worker code out of the context body.
- **It warned that 3 test files wait only 2 microtasks** [K22]. **Ruling:** the client takes a callback that runs **synchronously** when `Worker` is undefined (jsdom), so those files keep HEAD timing and need no edit. B's full suite on the sketch shows this: 235 files, 3490 tests passed [K19].

**Disagreement ruled:** "ready" after the peaks (tech-lead) wins over "ready first" (performance-optimizer), because it is the smallest observable change and it keeps the harness and test contracts.

**On worker error or stall:** the pending jobs fall back to the HEAD computation (`computePeaks` on the main thread, once per job). This is HEAD behaviour, so it cannot regress the load. A peaks failure never marks a source `error`.

### 0.4 Reference / screen budget
Not applicable. This is a pure performance round: there is no new UI, no new text, and the pixels are byte-identical (policy: performance rounds have no reference section).

## 1. Rulings on round 311 (D-29z832, D-29z833)
- **C round 311:** PASS. 12 rows passed. `browserVerified`/`realVerified` are true. 1 Low (C-R311-01, deferred). Gate 311 review: COMMIT OK, 8.5/10.
- **The worker-test Lows** C-R311-01 (= A-R311-REVIEW-L2/L3), A-R311-REVIEW-L4 and gate-311 #1 (GATE311-L1) → `deferred_low_polish`, as one batch for the next worker round. The code is correct today.
- **gate-311 #2/#3:** recorded as GATE311-I2 and GATE311-I3.
- **INFO-C311-ASSERT-MINUS-LINE:** B's round-311 wording conflicted with B's own sketch, and C ruled on the intent. L4 already says "no assertion lost; equal or stronger replacements allowed", and this task uses that wording (§3.2).
- **`tasks/round-311.md`:** archived as a byte copy of the old `current-task.md` [K15].

## 2. B's pre-check (L23)
- **Sketch** (`b-round-311/sketch/`):
  - `sketch.patch.txt`, the full diff against HEAD;
  - the files `sketch-peaks.ts.txt`, `sketch-peaks.client.ts.txt`, `sketch-peaks.worker.ts.txt` and `sketch-peaks.worker-protocol.ts.txt`;
  - the test file `sketch-peaks-worker.test.ts.txt`.
- **Results:**
  - `tsc` rc 0 (`sketch-tsc.log`).
  - Biome is clean on all 6 files.
  - **The full suite on the sketch passed: 235 files, 3490 tests** (`precheck-full.log`) [K19]. Gate 311 had 234 and 3478 [K10]. The full run was made before PW7b was added; the file has 13 rows now, and the restored mutant run passed 13/13.
  - **12 named mutants, every one red; the restored code passes 13/13** [K13] (`sketch-mutants.txt`, `mutants.py`). One equivalent mutant is recorded and dropped, with its reason.
- **Browser, on the sketch** (second dev server with its own `cacheDir`, L38; `b-round-311/probe/peaks-identity.cjs`):
  - Main-thread `computePeaks`/`accumulatePeakChunk` time is **0** (HEAD: 79 and 85.6 ms).
  - `peaks.worker.ts` is created (HEAD: none).
  - All 9 library preview waveforms are **byte-identical** to HEAD.
  - 0 page errors [K12].
- **Not sketched, and A writes it: PW11** (the context row, §6). Its red-proof is the named mutant MU-CONTEXT-BYPASS, which A runs.

## 3. Acceptance

### 3.1 A's rows
| Row | Expected |
|---|---|
| A-CLAIMS | Before editing, from the loop root, `bash b-round-311/claims-312.sh` equals `b-round-311/claims-312-head-output.txt`. A difference is a STOP |
| A-UNIT | `npx vitest run app/lib/arrangement/__tests__/peaks-worker.test.ts app/lib/arrangement/__tests__/peaks.test.ts app/lib/arrangement/__tests__/waveform-zoom.test.tsx app/lib/arrangement/__tests__/clip-gain-waveform.test.tsx app/lib/arrangement/__tests__/clip-gain-pointer-preview.test.tsx app/lib/arrangement/__tests__/content-colour-ui.test.tsx app/lib/arrangement/__tests__/demo-synth-worker.test.ts app/lib/arrangement/__tests__/collection-load-status.test.tsx app/lib/arrangement/__tests__/status-lifetime.test.tsx` passes: peaks-worker has ≥ 14 rows (PW1–PW11), and every other file passes unchanged. Report the times |
| A-MUTANTS | Run `b-round-311/sketch/mutants.py` on a scratch copy of A's tree (never in `store/`): the 12 mutants are each red on at least the rows in `sketch-mutants.txt`, and the restored code is green. Add **MU-CONTEXT-BYPASS**: in both context call sites, replace the `requestSourcePeaks(...)` call with a direct `computePeaks` and an immediate callback. It must turn PW11 red. Logs and `.patch.txt` files go under `a-round-312/` |
| A-TYPE/LINT | `npm run typecheck` rc 0. `npm run lint` rc 0 with no new finding (gate 311: 205 warnings + 1 info) |
| A-REVIEW | `code-reviewer` on the 7 paths. Ask about: byte identity (NaN, −0, fractional samples per bucket); buffer recycling and the in-flight bound; abort/cancel and late replies; worker error/stall fallback; dispose on unmount; the "ready after peaks" order; no type assertions. A Medium+ inside the grants: fix it, then re-review the changed lines (L11). A Medium+ outside the grants: STOP. The Architecture note goes to B |
| A-DOC | New `docs/implementation/2026/quarter-IV/228-perf-peaks-worker.md`, in Georgian with technical terms in English. TEMPLATE's 7 `## ` headings in order (L26). Line 4 is exactly `**სტატუსი:** In Progress (stage 1 of 2; C round 312 PASS)` (L28: PERF-5 has a stage 5b). Content: §0.1 (both tables, verbatim numbers), §0.3's rulings, §4, the rows and mutants, and what 5b and PERF-14 keep. It cites only tests that exist |

### 3.2 C's rows
C writes `c-round-312.md` and `c-round-312.json` as it goes, with the L57 fields:
- `assertsSpecified` = 14 (PW1, PW1b, PW2, PW3 ×2, PW4–PW7, PW7b, PW8–PW11);
- `mutantsRecorded` = 13 (12 + MU-CONTEXT-BYPASS);
- `mutantRedOnSketch` = 12.

Each finding carries an `origin`.

**Browser rows.** Real Chromium, under L38: nothing else runs during a probe, and a warm-up load in a browser comes first.
- C copies `b-round-311/probe/peaks-identity.cjs` into `c-round-312/` (`peaks-probe.cjs` is optional, B's per-call LoAF/profile probe).
- **HEAD side.** By the time C runs, `:5173` serves A's tree, and C must not stash. C uses B's recipe:
  1. `tar` a copy of `store/` with `node_modules`, `build` and `.git` excluded;
  2. restore HEAD's versions of the 7 §5 paths with `git show HEAD:<path>`, and delete the 5 new ones;
  3. symlink `node_modules`;
  4. add `cacheDir: '/tmp/<name>-vite-cache'` to **the copy's** `vite.config.ts`;
  5. run `npx remix vite:dev --port <≠5173> --host 127.0.0.1`.

  Only one probe runs at a time (L38). B's HEAD outputs (`b-round-311/probe/identity-head.json`) are the reference, if C's own HEAD run cannot start.

| Row | Action | Expected |
|---|---|---|
| PK-MAIN-THREAD | `node peaks-identity.cjs http://127.0.0.1:5173 <out>` on A's tree, 3 fresh loads at 1440×900 | `mainPeaksMs` is empty (0 ms in `computePeaks` and `accumulatePeakChunk`) on all 3 loads. `workers` contains `peaks.worker.ts` exactly once per load. 0 page errors. HEAD control (the same script on HEAD): `computePeaks` > 0 ms and no peaks worker. This proves the row tells the trees apart |
| PK-IDENTITY | The same runs | Each of the 9 library options' preview-wave `sha` equals HEAD's (`b-round-311/probe/identity-head.json`), and every `rects` is 96 |
| PK-CLIP-PATHS | A fresh load at **1440×900 and 1280×720**. Add every library source with Enter onto the first audio lane that accepts it. Read `d` of every `[data-testid="arrangement-clip-waveform"] path` and of the detail waveform for each selected clip | Byte-equal to the same steps on HEAD. Zoom in twice (`+`) and read again: still equal |
| PK-READY-ORDER | Fresh load. Poll every animation frame until ready | The first frame whose status reads "Demo collection ready" already has a preview-wave `rect`. No library option is enabled (Add) without its peaks. Equal to HEAD |
| PK-VIDEO | Import `store/public/videos/hero/1.mp4` (method of `c-round-303/main.cjs`) on A's tree and on HEAD, 1440×900 | The video source's audio state (`ready` or `none`) is equal to HEAD. If `ready`: its clip waveform `d` is equal to HEAD, and the status line is equal. 0 page errors |
| PK-COPY-BOUND | `addInitScript` wraps `AudioBuffer.prototype.copyFromChannel` and records `destination.length` and the duration of each call. Fresh load of A's tree | Every `destination.length` ≤ 2 × the buffer's `sampleRate`. Record the total and the max call ms per load. **No browser identity count.** Transfer detaches each array, and the ack returns new `Float32Array` objects over the same buffers, so in-page object identity cannot show recycling. Recycling's identity proof is PW4 + MU-FRESH-BUFFERS; its browser evidence is the main-thread copy time only |
| PK-ABORT | Load, then within 200 ms of the first `copyFromChannel` call navigate away to `/` and back to `/studio-lab` | No page error. The second load reaches ready with 9 identical waves. The old provider's worker is terminated (the `page.on('worker')` close event, or the worker count) |
| PK-PERF-HARNESS | `npx playwright test --config playwright.perf.config.ts perf/studio-lab.perf.spec.ts`, **alone** (L38) | The spec passes, every `assert` row is within budget, and `load.*` rows are recorded. Report `load.ready-ms`, `load.settled-ms`, `load.script-max` and `load.longtask-max` next to round 306's values (`c-round-306/perf/`). This is a trend, not a gate on wall-clock values |
| G312-AUTH | As G311-AUTH (copy `c-round-311/g311-auth.cjs`), **both viewports** | `/studio-lab`: workspace and the demo badge, `auth_user` null, 0 page errors. `/studio/middle-east`: "Sign in required", 0 `audio[src]`. `/api/studio-token` with no header → 401. No token in any body |

**Offline rows:**
- **PK-UNIT.** C re-runs A-UNIT's file list. This is C's own row, not a gate row.
- **SOURCE-SCOPE.**
  - `git status --short --untracked-files=all` lists exactly the 2 modified §5 paths and the 5 new ones. `sha256sum -c` fails only on the 2.
  - These have no diff: the 7 protected files, `perf/**`, `package.json` and `biome.json`.
  - **No assertion is lost; equal or stronger replacements are allowed** (L4). No existing test file is changed (the sketch needs none, §0.3).
- **CLAIMS.** Re-run `claims-312.sh`. After A, the values that change equal `b-round-311/claims-312-sketch-output.txt` for K5 (empty: no import, no call), K6 (`2511 3929` in the sketch; compared by content per L56, not line number), K7, K8 (adds `peaks.worker.ts`) and K9:
  - In the sketch run, K2, K10 and K16 are empty because `/tmp/b311s` is a scratch git with no gate history.
  - On A's real tree these also change, and the expected values are: **K2 → `7 dfa4502`** (2 modified + 5 untracked, as in SOURCE-SCOPE); **K16 → `1 228-perf-peaks-worker.md`**; **K17 → `1`** (doc 228's `In Progress (stage 1 of 2` line). K10 stays `234 3478`, because it reads gate 311's log.
  - If A's code differs from the sketch, A writes the values to `a-round-312/claims-after.txt` with the reason, and C checks the reason against §4.
- **TESTS-READ.** PW1–PW11 follow §6 and can fail (L52): A's mutant logs show the listed reds. C adds at least one mutant of its own, for example a pool that never empties between jobs or an off-by-one at the last chunk.
- **DOC.** Doc 228 per A-DOC.
- **Gate rows** (C does not claim them; they go under `"gate"`): full vitest, build, Biome, `npm run verify` and the e2e smoke.

`browserVerified` is true only if PK-MAIN-THREAD, PK-IDENTITY, PK-CLIP-PATHS, PK-READY-ORDER, PK-VIDEO, PK-COPY-BOUND, PK-ABORT and G312-AUTH all ran. PK-PERF-HARNESS is wanted, but it is environment-heavy: if it cannot run (a build failure for environment reasons), list it under `"notRunnableHere"` with the log; it does not make `browserVerified` false.

## 4. Contract (D-29z835)

### 4.1 `peaks.ts` (append only; `computePeaks` and every existing export byte-unchanged)
- `peakBucketCount(length, sampleRate, bucketsPerSecond)` equals `computePeaks(...).length` for every input, including 0 and invalid input.
- `accumulatePeakChunk(peaks, chunk, chunkStart, chunkLength, sampleRate, bucketsPerSecond)`:
  - It folds samples `[chunkStart, chunkStart + chunkLength)` into `peaks`, using the same bucket edges as `computePeaks`: `floor(b × sampleRate / bucketsPerSecond)`.
  - It never reads a chunk index ≥ `chunkLength`, because recycled arrays hold stale samples past the copied length.
  - Folding any chunking of a signal gives the same bytes as `computePeaks`. This includes NaN, −0 and fractional samples per bucket (22050 Hz).

### 4.2 `peaks.worker-protocol.ts` + `peaks.worker.ts`
- **Requests:** `begin {jobId, length, sampleRate, bucketsPerSecond}`, `chunk {jobId, start, length, channels}`, `end {jobId}` and `cancel {jobId}`.
- **Replies:**
  - `ack {jobId, channels}` returns the **same** arrays, with their buffers in the transfer list. It is sent for every chunk, including a stale job's chunk, so the client gets its buffers back.
  - `done {jobId, peaks}` transfers `peaks.buffer`. A cancelled or unknown job gets no `done`.
- **Pure handler:** `handlePeaksWorkerRequest(state, request, post)` is exported for unit tests. The worker file only wires it to `self`.

### 4.3 `peaks.client.ts`: `createSourcePeaksComputer()` → `{ request(buffer, signal, onPeaks), dispose() }`
- **No worker** (`typeof Worker === 'undefined'`), a failed construct, or an empty buffer: `onPeaks(computePeaks(...))` runs **synchronously**, inside `request`. This is HEAD behaviour and HEAD timing.
- **The worker path:**
  - **Worker and jobs:** one lazily created module worker per computer. Jobs run one at a time, in request order.
  - **Chunks:** each is `round(2 × sampleRate)` samples (`PEAKS_CHUNK_SECONDS = 2`), copied with `copyFromChannel` into arrays from the recycle pool.
  - **In flight:** at most `PEAKS_CHUNKS_IN_FLIGHT = 4` chunks.
  - **Recycling:** acked arrays go back to the pool, and the pool is cleared between jobs.
- **The stall timer:** `PEAKS_WORKER_STALL_TIMEOUT_MS = 3000` from the last reply. On a stall, `onerror` or `onmessageerror`:
  1. terminate the worker and release its handlers;
  2. deliver every pending job through the synchronous path, skipping aborted jobs;
  3. later requests use the synchronous path.
- **Abort:** an aborted job posts `cancel` and is dropped, and `onPeaks` is never called for it, even if `done` arrives later.
- **`dispose()`:** clears the timer, the queue and the pool, then terminates the worker.
- **Replies are read with a validator** (`readPeaksWorkerReply`), with no type assertion.

### 4.4 `ArrangementContext.tsx` (only these hunks)
- **The import:** the `computePeaks` / `PEAK_BUCKETS_PER_SECOND` import [K5] is replaced by `createSourcePeaksComputer` and its type.
- **The computer:** one is held in a ref, created lazily by a stable `requestSourcePeaks` callback and disposed on provider unmount.
- **The collection load** [K5]:
  - `setSourcePeaks`, `patchSourceState(... 'ready' ...)` and `settle(false)` move, **unchanged and in the same order**, into the callback.
  - The callback first returns when `controller.signal.aborted`.
  - The `.catch` (decode failure → `error`) is unchanged.
- **The video import** [K5]:
  - `setSourcePeaks`, `settle({audio:'ready'})` and the `syncPlayback` re-sync move, unchanged and in the same order, into the callback.
  - The callback first returns when `signal.aborted` or when the video source is no longer in `videoSourcesRef`. This is the same condition `settle` already checks.
- **The dependency arrays** gain `requestSourcePeaks`.
- **Nothing else changes in the context.**

**L49 side effects of the replaced block, ruled.** The block is "channels → `computePeaks` → `setSourcePeaks` → ready → settle/sync". Every effect is **kept**, in the same order, inside the callback:
- PW11 and PK-READY-ORDER pin "ready after peaks";
- PK-CLIP-PATHS and PK-IDENTITY pin the peaks values;
- PK-VIDEO pins the video re-sync and its status.

No effect is dropped.

### 4.5 Not in this round (kept in the backlog, D-29z834)
- **PERF-5b:** rAF/`startTransition` batching of `setSourcePeaks`. It gets its own premise measurement, because `load.commits` is a wall-clock row that races the synth worker.
- **PERF-14:** the power-of-two pyramid. Its consumer, the canvas tiles, arrives there, and 5a's reply is an object, so a level can be added later.
- **Long-stem browser scenario** (5-minute stems): the harness has no long fixture in the demo. It is covered by §0.1's measured microbenchmark and the unit rows. It goes to PERF-13's harness.
- **The PERF-2 remainder** (SFX synth on the main thread; the synth `onmessage` handler is the largest load long task): recorded as signal PERF2-REMAINDER-SFX-SYNTH.

## 5. Grants
A edits only:
1. `app/lib/arrangement/peaks.ts`: append `peakBucketCount` and `accumulatePeakChunk`. The existing lines are unchanged.
2. `app/contexts/ArrangementContext.tsx`: only the §4.4 hunks.

A creates:

3. `app/lib/arrangement/peaks.client.ts`;
4. `app/lib/arrangement/peaks.worker-protocol.ts`;
5. `app/lib/arrangement/peaks.worker.ts`;
6. `app/lib/arrangement/__tests__/peaks-worker.test.ts`;
7. `docs/implementation/2026/quarter-IV/228-perf-peaks-worker.md`.

**Nothing else:**
- no existing test file;
- not `perf/**`, `package.json`, `biome.json`, `vite.config.ts`, or any protected file;
- no dependency change.

## 6. Specified test rows (L52)
The target file is `b-round-311/sketch/sketch-peaks-worker.test.ts.txt`. A may extend it; it must not weaken any row.

| Row | What it pins | Red-proof (mutant, `sketch-mutants.txt`) |
|---|---|---|
| PW1 | the streamed kernel equals `computePeaks` byte for byte for 48000/44100/22050/8000/96000 Hz × lengths 1/479/480/481/2205/2.37 s × 1/2/6 channels × chunk sizes 1/7/221/480/2 s/whole, with chunk arrays **padded with 1.0** past the copied length | MU-KERNEL-INIT-ZERO, MU-KERNEL-CHUNK-END |
| PW1b | NaN, −0 and −Infinity give the same bytes | MU-KERNEL-INIT-ZERO |
| PW2 | `peakBucketCount` equals `computePeaks(...).length`, including 0 and an invalid rate | — (an identity row) |
| PW3 | protocol: acks return the same arrays with their buffers transferred; a stale `jobId` chunk is acked and not folded; `done` is byte-equal and transfers `peaks.buffer`; cancel → no `done` | MU-ACK-NEW-ARRAYS, MU-KERNEL-INIT-ZERO |
| PW4 | client (a FakeWorker running the real handler): one worker; chunk count = ceil(length / 2 s); in flight ≤ 4; every copy length = 2 s; distinct arrays ≤ 8; transfer lists; result byte-equal; `dispose` terminates | MU-WORKER-PATH-DELETED, MU-FRESH-BUFFERS, MU-UNBOUNDED-INFLIGHT, MU-ACK-NEW-ARRAYS, MU-KERNEL-CHUNK-END, MU-DISPOSE-NO-TERMINATE |
| PW5 | the worker's reply object itself reaches `onPeaks` (`toBe` a marker array) | MU-WORKER-PATH-DELETED |
| PW6 | with no `Worker`, `onPeaks` runs before `request` returns, with `computePeaks`'s bytes | — (HEAD timing guard) |
| PW7 | abort → `cancel` posted, no callback, the next job still runs | MU-NO-CANCEL, MU-PARALLEL-JOBS |
| PW7b | an abort after `end` is posted drops the late `done` | MU-ABORT-DELIVERS |
| PW8 | `onerror` → every pending job is delivered by the synchronous path, the worker is terminated, and the next request is synchronous with no new worker | MU-NO-FALLBACK-ON-ERROR, MU-PARALLEL-JOBS |
| PW9 | no reply for 3000 ms → fallback; at 2999 ms → nothing yet | MU-NO-STALL, MU-NO-FALLBACK-ON-ERROR |
| PW10 | jobs run in request order, one `begin` at a time | MU-PARALLEL-JOBS |
| **PW11 (A writes)** | context: with `globalThis.Worker` stubbed by a fake that answers `done` with a marker array, an `ArrangementProvider` over a 1-source collection (fake buffer with `copyFromChannel`) ends with `sourcePeaks.get(id)` **being** the marker, and the source `ready` only after `done` (it is not ready before the fake replies) | **MU-CONTEXT-BYPASS** (A runs it) |

### 6.1 Changed contracts
None. No existing test file changes, and no assert is removed.

## 7. A's order of work
1. A-CLAIMS.
2. `peaks.ts`, the protocol and the worker.
3. The client, then the test file PW1–PW10, run until green.
4. The context hunks, then PW11, then A-UNIT.
5. A-MUTANTS, including MU-CONTEXT-BYPASS.
6. Typecheck and lint.
7. Doc 228.
8. `code-reviewer`.
9. Write `a-round-312.md` as you go.

## 8. Neighbouring behaviour at risk (C probes)
- **Collection status and the ready line:** PK-READY-ORDER, `collection-load-status` and `status-lifetime` (a covering run).
- **Waveforms everywhere:** the lane, detail and library preview; zoom (PERF-3's quantized shapes); clip-gain redraw. PK-CLIP-PATHS, PK-IDENTITY, `waveform-zoom` and `clip-gain-waveform`.
- **Video import:** the audio-ready state and the playback re-sync (PK-VIDEO).
- **Unmount and navigation:** the worker is terminated, with no late `setState` (PK-ABORT).
- **The perf harness:** `waitForLibraryReady` and the `load.*` rows (PK-PERF-HARNESS).
- **Purchase protection:** G312-AUTH. The legacy `/studio/:productId` route does not use `ArrangementContext` and is untouched.

## 9. STOP conditions
A writes "STOP — needs B ruling" at the top of `a-round-312.md` and changes nothing else when:
- A-CLAIMS differs from the HEAD output;
- a change is needed outside §5, or in an existing test file;
- a covering test fails or rises above 50 % of its timeout (L11);
- any assert must be removed;
- a mutant stays green;
- typecheck fails, or lint has a new finding;
- the reviewer reports a Medium+ outside the grants;
- a §4 rule (chunk size, in-flight bound, stall time, "ready after peaks") would have to change. That is a STOP, not a deviation (L11, RETRO 305).

## 10. Next, and requests (D-29z836)
- **C PASS + gate:** PERF-5a is done. PERF-5 stays in progress until 5b.
- **Next:** **REGRESSION** if the round-313 planning falls on or after **2026-11-05** [K14]. Otherwise **PERF-5b**, with its own premise measurement: commits per load with peaks async, deterministic or not. If 5b shows no HEAD-red deterministic row, B closes it on evidence and moves to PERF-7.
- **RETRO** at round 320.
- **For Saba** (unchanged): SABA-Q-WORKER-DEPLOYED and SABA-Q-PERF4-STUDIO-CACHE.
- **For root:**
  - ROOT-REQ-VERIFY-WORKER-TESTS (the R2 worker `node --test`) and ROOT-REQ-VITEST-PERF-INCLUDE are still open and non-blocking.
  - No new checkpoint request: three are open and non-blocking. The new peaks orchestration sits in `peaks.client.ts`, and the context gains about 20 lines, per tech-lead.
- **Signals (not scheduled):**
  - **PERF2-REMAINDER-SFX-SYNTH:** main-thread SFX synth (~20 ms) and the synth `onmessage` handler (65–78 ms long task).
  - **SOURCE-PEAKS-NEVER-PRUNED:** tech-lead: `sourcePeaks` entries are only added. Unverified, so it is a hypothesis; check it in PERF-13.

## 11. Commit readiness
After C PASS and the gate, root publishes the 2 modified paths and the 5 new files. There is no deploy step.

## 12. Claims (L29 + L56)
`bash b-round-311/claims-312.sh` from the loop root. Outputs:
- `b-round-311/claims-312-head-output.txt` (HEAD);
- `b-round-311/claims-312-sketch-output.txt` (sketch, `CLAIMS_STORE=/tmp/b311s`).

| Tag | Claim | Expected at HEAD |
|---|---|---|
| K1 | gate 311 published `dfa4502` | `published dfa4502` |
| K2 | clean tree, HEAD | `0 dfa4502` |
| K3 | frozen entries | `1184` |
| K4 | each protected file appears once | `1 1 1 1 1 1 1` |
| K5 | in `ArrangementContext.tsx`: the line of the `computePeaks` import; `computePeaks(` call lines | `137 2492 3909` |
| K6 | `setSourcePeaks(` call lines in `ArrangementContext.tsx` | `2493 3910` |
| K7 | `peaks.client.ts`, `peaks.worker.ts`, `peaks.worker-protocol.ts` and the test file exist | `0 0 0 0` (sketch `1 1 1 1`) |
| K8 | workers under `app/lib/arrangement/` | `demo-synth.worker.ts export-wav.worker.ts` (sketch adds `peaks.worker.ts`) |
| K9 | `app/**/__tests__` + `perf/**` files that match `computePeaks\|sourcePeaks\|setSourcePeaks` (SWEEP) | `5` at HEAD (sketch `6`, adding peaks-worker) |
| K10 | gate-311 `verify.log` files and tests | `234 3478` |
| K11 | B's HEAD probe: main-thread `computePeaks` ms; peaks worker count | from `probe/identity-head.json` |
| K12 | sketch probe: main-thread peaks entries; peaks worker; waves equal | `0 1 9/9` |
| K13 | sketch mutant lines; restored 13 passed; mutants with 0 red | `12 1 0` |
| K14 | last regression date | `2026-11-02` |
| K15 | the round-311 archive equals the copy | `archive-equal-311` |
| K16 | doc 228 absent; the last doc | `0 227-perf-r2-worker-range-guard.md` |
| K17 | `In Progress (stage` hits in `docs/implementation` (L28) | `0` |
| K18 | every cited `b-round-311/` artifact exists (L56) | `done` |
| K19 | `precheck-full.log` summary | `235 3490` |
| K20 | `browser-copy.txt` holds the computePeaks, reused-copy and fresh-copy numbers | `1` |
| K21 | `DEMO_SYNTH_WORKER_STALL_TIMEOUT_MS = 10_000` in `demo-synth.client.ts` | `1` |
| K22 | 2-microtask `flushLoads` in `waveform-zoom.test.tsx` and `clip-gain-waveform.test.tsx` | `1 1` |
| K23 | `waitForLibraryReady` in `perf/lib/page.ts` polls the preview-wave `rect` | `1` |
