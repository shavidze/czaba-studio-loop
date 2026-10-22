# CURRENT TASK — Round 87: SRW-20 stage 3a — WAV encoding off the main thread, export progress for every phase, lab-owned MP3 encoder (R20-X4 part 1) (D-29z52)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-22
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, plus the LOOP POLICY, Loop v2, cloud-runner and speed rules in your prompt. Those rules win over older text.
- **Previous task:** `tasks/round-86.md` (exact copy; sha256 `d292bf2f…`). Rationale: `b-round-86.md`. Decision record: D-29z52 in `docs/technical/studio-real-workspace/plan.md`.
- **Round size:** one feature stage, **SRW-20 stage 3a**, with one owner (A). No C bug is open from round 86.
- **SRW-20 stages, nothing deferred or shrunk:**
  - Stage 1 (range export): C PASS, published `51e024a`.
  - Stage 2 (MP3, WAV + MP3): C PASS, published `971141d`.
  - **Stage 3a (this round):** WAV encoding moves off the main thread; every phase reports progress; the lab gets its own MP3 encoder that can reset after a timeout.
  - **Stage 3b (next feature round):** Cancel in every phase, abort on unmount, the WAV + MP3 delivery note, and GATE86-S2.
  - R20-X4 ("5-minute project: UI stays responsive, progress updates, cancel works") is complete only after 3b.

## Why this round
- **C round 86: PASS, `browserVerified=true`, `realVerified=true`.** 18 rows at both viewports; MP-TIMEOUT ran at 1440 only, as specified. Gate 86 published `971141d67a1dd33da8f1165de1d895bd62b4e022` to both remotes; review 8.5/10, COMMIT OK. R20-X2 passes and R20-X3 passes again. The fake-Bearer 403 sub-check stays BLOCKED (backend unavailable in cloud). Production-bundle MP3 was not run (no preview server).
- **Regression round:** `regression-last.json` = 2026-10-21, so the next one is due on or after **2026-10-24**. It is not due today (2026-10-22).
- **B probe (`b-round-86/probe/PROBE-SUMMARY.md`), confirmed facts at `971141d`:**
  - (P2) In the real `/studio-lab` UI, a 5-minute project is one click on the music clip + **Ctrl+D twice**, which gives `00:00.000 — 05:04.406`. Its WAV export blocks the main thread for one **445 ms** frame gap. Normal gaps are 45–57 ms. The 101.702 s project gives a 201 ms gap.
  - (P1) The block is the clamp loop, the overload measurement and `encodeSfxWav`, all on the main thread. The `OfflineAudioContext` render itself does not block. `suspend(t)` points scheduled before `startRendering()` all resolve.
  - (P3) MP3 conversion already runs inside ffmpeg.wasm's own worker: 300 s took 1.8 s, with a max gap of 44 ms. The FFmpeg instance fires `progress` events (0→1) about every 500 ms.
  - (source, `@ffmpeg/ffmpeg` 0.12.15 `classes.js` l.65-77, 186-198) `{ signal }` only rejects the pending promise; only `terminate()` stops the worker.
  - The frozen `app/utils/ffmpeg.ts` never resets after a hung load (GATE86-S1: `isLoading` stays true and the poller leaks), so a retry after the 120 s timeout hangs again.
- **Decision (D-29z52 R3):** `/studio-lab` gets its own MP3 encoder module. It uses the same `@ffmpeg/*` packages, the same unpkg core and the byte-identical ffmpeg command. It can terminate and reset, and it removes its progress listener.
  - `app/utils/ffmpeg.ts` stays **frozen**: the protected purchased Studio (`StudioContext.tsx`) imports it, and that Studio cannot be verified in the cloud (backend unavailable).
  - The util's own leak stays an open finding for its owner (FFMPEG-LOAD-POLLER-HANG / GATE86-S1, purchased path).
  - The duplication is recorded as signal FFMPEG-UTIL-UNIFY (SRW-21).

## Baseline (measured by B, 2026-10-22)
- **HEAD `971141d67a1dd33da8f1165de1d895bd62b4e022`** (gate 86). `git status --short` prints **0 lines**.
- **Frozen list:** `../tmp/studio-real-loop/b-round-86-r87-tree-sha256.txt`, **490** entries, **490/490 OK**. Check it with `cd store && sha256sum -c --quiet ../tmp/studio-real-loop/b-round-86-r87-tree-sha256.txt`.
  - It covers every tracked `app/**` and `docs/implementation/**` file, plus `vite.config.ts`, except the 7 owned existing files below.
  - Frozen examples: `app/utils/ffmpeg.ts`, `app/lib/sfx-edit.ts`, `app/lib/arrangement/meter.ts`, `render-window.ts`, `StudioWorkspace.tsx`, `export-dialog-focus.test.tsx`, `export-dialog-focus-restore.test.tsx`, `master-ui.test.tsx`, `graph.test.ts`, `master.test.ts`, `meter.test.ts`, `clip-fades.test.ts`, `envelope.test.ts`, `clip-gain.test.tsx`, `track-pan.test.tsx`, `export-range.test.ts`, `render-budget.test.tsx`, `context-hygiene.test.tsx`.
- **Snapshots:** `../tmp/studio-real-loop/b-round-86-r87-snapshots/` (`SHA256SUMS.txt`). All files are LF, CR=0:

  | File | sha256 prefix | lines |
  |---|---|---|
  | `app/lib/arrangement/graph.client.ts` | `e1111909` | 477 |
  | `app/contexts/ArrangementContext.tsx` | `afcecf17` | 3234 |
  | `app/components/arrangement/ArrangementExportDialog.tsx` | `fa343799` | 462 |
  | `app/lib/arrangement/__tests__/export-mp3.test.tsx` | `38b597a2` | 669 |
  | `app/lib/arrangement/__tests__/export-range-ui.test.tsx` | `435c292d` | 499 |
  | `app/lib/arrangement/__tests__/metronome-ui.test.tsx` | `2c73426a` | 493 |
  | `docs/implementation/2026/quarter-IV/076-studio-lab-mp3-export.md` | `4e8366a9` | 111 |
  | `app/utils/ffmpeg.ts` (frozen, reference only) | `0995ae78` | 123 |

- **Protected files:** 4/4 OK (`protected-baseline.json`). Never touch the auth files, `app/contexts/StudioContext.tsx` or `app/utils/ffmpeg.ts`.
- **Servers:** `:5173/studio-lab` returns 200 (`env-status.json`). Backend `:5199` is unavailable, as expected. Never start or stop servers. `vite.config.ts` is frozen this round.
- **Do not change the repository state:**
  - Never stash, reset, checkout, clean or re-create anything.
  - A mismatch (another HEAD, a non-empty status, a changed frozen file) means stop and report.
  - Never run `biome check --write`, `format --write`, `npm run format` or `check:fix`. Format new files through stdin to stdout.
  - Run mutation proofs in a scratch copy (`a-round-87/mut/`), never in `store/`.

## 1. What changes (A)

### Today (B read the source at `971141d`)
- **`graph.client.ts` `renderArrangementWav`** (l.430–477):
  - Builds one `OfflineAudioContext` and `applySchedule(…)`.
  - After `startRendering()` it runs `measureExportOverload(raw)`, a clamp loop with `MAX_24BIT_SAMPLE` / −1 and `encodeSfxWav` (from `~/lib/sfx-edit`), all on the main thread.
  - It returns `{ blob, peak, clippedSamples }`.
  - `measureExportOverload` (l.400–418) and `formatExportOverloadWarning` are exported and imported by tests.
- **`ArrangementContext.tsx`:**
  - `exportWav` (l.2660–2709) calls `renderArrangementWav(arrangement, buffersRef.current[, renderWindow])`.
  - `exportMp3` (l.2711–2836) does `await import('~/utils/ffmpeg')`, then `loadFFmpeg()` raced against `ARRANGEMENT_MP3_ENCODER_LOAD_TIMEOUT_MS` (the timer starts **after** the import), then `encoder.convertWavToMp3(rendered.blob)`.
  - The status messages are `რენდერი და 24-bit WAV-ის შექმნა…` → `MP3 encoder იტვირთება (ffmpeg.wasm, პირველად ~31 MB)…` → `MP3-ის შექმნა…`.
- **Precedent for a worker in this repo** (published, works in the production build): `app/lib/sfx-export.ts` (pure) + `sfx-export.worker.ts` + `sfx-export.client.ts`. The client uses `new Worker(new URL('./sfx-export.worker.ts', import.meta.url), { type: 'module' })`, transfers buffers and handles `onerror`/`onmessageerror`.
- **Precedent for progress UI:** the `<progress>` in `app/components/recordings/SfxSceneExport.tsx:189` (`max="1"`, `className="h-2 w-full accent-brand"`).
- **Frozen tests that lock this code. Read them before coding:**
  - **Source-text tests:**
    - `clip-fades.test.ts` l.472–478 and `envelope.test.ts` l.574–580 slice `graph.client.ts` from `export async function renderArrangementWav` **to the end of the file**. That slice must not contain `pan`, `setTrackGain` or `setClipGain`, so no code after `renderArrangementWav` may contain the substring `pan` (e.g. `span`, `expand`, `panel`).
    - `track-pan.test.tsx` l.444–460 requires the function body (up to the first `\n}\n`) to contain `return { blob: new Blob([bytes], { type: 'audio/wav' }), ...report };`, `applySchedule(ctx, planSchedule(arrangement, 0)`, `tracks: arrangement.tracks,` and `clipGains: clipLinearGains(arrangement)`, and to contain no `pan`.
    - `graph.test.ts` l.384–393 requires `new OfflineAudioContext`, both `applySchedule(ctx, planSchedule(…` calls, and no `setTrackGain`.
    - `clip-gain.test.tsx` l.495–501 requires `clipGains: clipLinearGains(arrangement)`.
  - **Behaviour tests:** `graph.test.ts`, `master.test.ts` and `meter.test.ts` call `renderArrangementWav` / `measureExportOverload` directly from `graph.client`, with fake `OfflineAudioContext` classes (no `suspend`) and **no `Worker` global**.
  - **Exact state shapes:** `export-range-ui.test.tsx` and `export-mp3.test.tsx` assert `exportState` with `toEqual({ phase, message[, warning] })`, so **progress must not live in `exportState`**.
  - **Call shapes:** `export-range-ui.test.tsx` l.278/354/397/410, `export-mp3.test.tsx` l.383/403/414 and `metronome-ui.test.tsx` l.464 assert the renderer call `toHaveLength(2)` / `toHaveLength(3)`. These are granted below.
  - **Focus during a render:** `export-dialog-focus.test.tsx` l.428–472 asserts that during a render Close and the export button are disabled, focus goes to the trap / stays on an enabled format radio, and Tab from the trap goes to the Modal's X. A new non-focusable `<progress>` keeps all of that.

### W — WAV encoding off the main thread
**New pure module `app/lib/arrangement/export-wav.ts`** (no DOM, no client-only imports; it may import `./meter` and `~/lib/sfx-edit`):
- Move `measureExportOverload` (with its `ExportOverloadReport` type) here **unchanged**. `graph.client.ts` re-exports it under the same name so every importer and test keeps working.
- `encodeArrangementWav(channels: readonly Float32Array[], sampleRate: number, onProgress?: (fraction: number) => void): { bytes: ArrayBuffer; peak: number; clippedSamples: number }` does exactly what `renderArrangementWav` does today after `startRendering()`:
  1. the report from the raw channels;
  2. the clamp to `[−1, MAX_24BIT_SAMPLE]` into new `Float32Array`s;
  3. `encodeSfxWav({ sampleRate, channels: clamped }, onProgress)`.
  The output bytes must be **byte-identical** to today's path.

**New worker `app/lib/arrangement/export-wav.worker.ts`:**
- It receives `{ channels, sampleRate }` and runs `encodeArrangementWav`.
- It posts `{ type: 'progress', fraction }` at most once per whole percent.
- It ends with `{ type: 'complete', bytes, peak, clippedSamples }` (transfer `bytes`) or `{ type: 'error', message }`.
- Same shape as `sfx-export.worker.ts`.

**New client `app/lib/arrangement/export-wav.client.ts`:** `encodeArrangementWavOffMainThread(channels, sampleRate, onProgress?) → Promise<{ bytes; peak; clippedSamples }>`.
- When `typeof Worker === 'undefined'` (vitest/jsdom/node), it returns the result of `encodeArrangementWav` on the calling thread. That keeps every frozen direct-render test byte-identical. In the browser it always uses the worker.
- Worker path:
  - `new Worker(new URL('./export-wav.worker.ts', import.meta.url), { type: 'module' })`, one worker per export;
  - transfer the channel buffers;
  - `terminate()` on complete, error, `onerror` and `onmessageerror`;
  - any failure rejects with `new Error('WAV-ის ჩაწერა ვერ მოხერხდა (worker).')`, which the existing context catch shows as `ექსპორტი ვერ მოხერხდა — ფაილი არ შეიქმნა. WAV-ის ჩაწერა ვერ მოხერხდა (worker).`
- Never fall back silently to the main thread after a worker failure.

**`renderArrangementWav(arrangement, buffers, renderWindow?, options?: ArrangementRenderOptions)`:**
- `ArrangementRenderOptions = { onProgress?: (phase: 'render' | 'wav', fraction: number) => void }`. It is exported from `graph.client.ts` (or from `export-progress.ts`, see P).
- The OfflineAudioContext setup and both `applySchedule` calls stay as they are.
- **Render progress:** only when `options?.onProgress` exists and `typeof ctx.suspend === 'function'`.
  - Before `startRendering()`, schedule `ctx.suspend(frame / sampleRate)` for each frame from `arrangementRenderSuspendFrames(length)` (P).
  - Each resolution calls `onProgress('render', frame / length)` and then `ctx.resume()`. Swallow rejections of both `suspend` and `resume` (`.catch(() => undefined)`).
  - Wrap every scheduled call as `Promise.resolve().then(() => ctx.suspend(t))` (and the same for `resume`), so a synchronous throw or a non-Promise return from a fake or an unusual context can never escape before `startRendering()`.
  - Read `FakeAudioContext` / `ControlledOfflineAudioContext` in `export-dialog-focus.test.tsx` (l.~40–87) and `export-dialog-focus-restore.test.tsx` (l.~50–60) before coding. B saw `resume()` but no `suspend()` there; those frozen tests run the real renderer and must stay green.
  - After `startRendering()` resolves, call `onProgress('render', 1)`.
  - Without `onProgress`, call no `suspend` at all, as today.
- **After the render:**
  - Copy each channel (`rendered.getChannelData(i).slice()`; never transfer the AudioBuffer's own memory).
  - `await encodeArrangementWavOffMainThread(copies, rendered.sampleRate, fraction => options?.onProgress?.('wav', fraction))`.
  - Build the result with the literal line `return { blob: new Blob([bytes], { type: 'audio/wav' }), ...report };`, where `report` is `{ peak, clippedSamples }`.
- Keep `renderArrangementWav` the **last function in the file**. Put new helpers above it, or keep everything after it free of `pan` / `setTrackGain` / `setClipGain`.

### P — progress model and store
**New pure module `app/lib/arrangement/export-progress.ts`:**
- `type ArrangementExportProgressPhase = 'render' | 'wav' | 'load' | 'mp3'`.
- `interface ArrangementExportProgress { phase: ArrangementExportProgressPhase; fraction: number | null }`. `null` means indeterminate and is used only for `load`.
- `arrangementRenderSuspendFrames(length: number, steps = 20): number[]`:
  - for `k = 1 … steps − 1`, compute `Math.floor((length * k) / steps / 128) * 128`;
  - keep the frames with `0 < frame < length`, unique and ascending;
  - non-finite or non-positive `length` → `[]`.
- `createArrangementExportProgressStore()` follows the `position-store.ts` pattern: `{ getProgress, setProgress, subscribeProgress }`.
  - `setProgress(next: ArrangementExportProgress | null)` notifies only when the phase changes, when null-ness changes, or when `Math.floor(fraction * 100)` changes.
  - Fractions are clamped to [0, 1]; a non-finite fraction is ignored.
- `formatArrangementExportProgress(progress)` returns the label:
  - `render` → `რენდერი · {p}%`
  - `wav` → `WAV-ის ჩაწერა · {p}%`
  - `load` → `MP3 encoder-ის ჩატვირთვა…`
  - `mp3` → `MP3-ის შექმნა · {p}%`
  - `{p}` is `Math.floor(fraction * 100)`.

**Context:**
- One store per provider, stable for the provider's life (`useState(() => create…)[0]` or a ref).
- Exposed as `exportProgress: ArrangementExportProgressStore` in `ArrangementContextValue` and in **both** value objects.
- Progress updates must **not** re-render the provider or `useArrangement()` consumers.
- `exportWav` and `exportMp3` pass the same 4th argument, `{ onProgress: (phase, fraction) => store.setProgress({ phase, fraction }) }`.
  - Project scope calls `renderArrangementWav(arrangement, buffers, undefined, options)`; range scope calls `renderArrangementWav(arrangement, buffers, renderWindow, options)`.
  - The messages stay byte-identical; `exportWav`'s messages, filenames and flow are otherwise unchanged.
- `exportMp3` sets `{ phase: 'load', fraction: null }` when it shows the encoder-loading message, `{ phase: 'mp3', fraction: 0 }` at `MP3-ის შექმნა…`, then the encoder's progress.
- `setProgress(null)` runs on **every** way out of both functions (done, every error, the timeout). The guard paths never set any progress.

**Dialog:**
- Only while `exportState.phase === 'rendering'` and the store value is not null, render right after the status message `<p>`:
  - `<p className="text-xs text-muted" data-testid="arrangement-export-progress-label">{formatArrangementExportProgress(progress)}</p>`;
  - `<progress data-testid="arrangement-export-progress" aria-label="ექსპორტის პროგრესი" max={1} value={…} className="h-2 w-full accent-brand" />`.
- `value` is the fraction for determinate phases. For `load`, **omit the `value` attribute** (indeterminate).
- Read the store with `useSyncExternalStore(store.subscribeProgress, store.getProgress, () => null)`.
- No other dialog change: the format and scope radios, texts, the Close rule and the button rules stay as they are. The `<progress>` element is not focusable.

### E — lab-owned MP3 encoder (`app/lib/arrangement/mp3-encoder.client.ts`, new)
**Exports:**
- `ARRANGEMENT_MP3_CORE_BASE_URL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'`;
- `interface ArrangementMp3Encoder { encode(wav: Blob, onProgress?: (fraction: number) => void): Promise<Blob> }`;
- `loadArrangementMp3Encoder(): Promise<ArrangementMp3Encoder>`;
- `resetArrangementMp3Encoder(): void`.

**Load:**
- `new FFmpeg()` (from `@ffmpeg/ffmpeg`, static import inside this module only).
- `coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, 'text/javascript')`, `wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, 'application/wasm')` (from `@ffmpeg/util`), then `ffmpeg.load({ coreURL, wasmURL })`.
- **One shared in-flight promise** for concurrent callers (no polling). The instance is cached after success.
- On failure: `terminate()` the instance, clear the cache and the in-flight promise, rethrow.
- `resetArrangementMp3Encoder()` terminates the current (loaded or loading) instance and clears both. Use a generation counter: a load that settles after a reset must **not** repopulate the cache.

**`encode(wav, onProgress)`:**
1. `writeFile('input.wav', new Uint8Array(await wav.arrayBuffer()))`.
2. `on('progress', handler)`. The handler forwards a finite `progress` clamped to [0, 1].
3. `exec(['-i', 'input.wav', '-codec:a', 'libmp3lame', '-b:a', '320k', '-q:a', '0', 'output.mp3'])`. This is **byte-identical** to the frozen util's command. A non-zero exit code throws `new Error(`ffmpeg exit code ${code}`)`.
4. `readFile('output.mp3')` → `new Blob([…], { type: 'audio/mpeg' })`, using the frozen util's string/Uint8Array handling.
5. In `finally`, call `off('progress', handler)` and try to `deleteFile` both paths, ignoring delete errors.

**Context `exportMp3` changes (nothing else):**
- At the encoder-loading message, **start the 120 s timer first**. Then race `import('~/lib/arrangement/mp3-encoder.client').then(m => m.loadArrangementMp3Encoder())` against it. The timer now covers the import and the load (reviewer GATE86-S3, first half).
- Timeout → `resetArrangementMp3Encoder()` (through the imported module, if the import finished), then the **unchanged** timeout message. A later retry in the same page loads fresh.
- Load or import failure → also reset (when the module exists), then the **unchanged** load-failure message.
- Conversion: `encoder.encode(rendered.blob, fraction => store.setProgress({ phase: 'mp3', fraction }))`. A rejection gives the unchanged conversion-failure message. The conversion has no fixed time limit. Its duration grows with the project length, and Cancel arrives in stage 3b. Record this in doc 077.
- **Late module after the timeout:** keep a `timedOut` flag in the closure. If the encoder module arrives after the timeout fired, the continuation must not start a load. It calls `resetArrangementMp3Encoder()` and returns, so no 31 MB request starts after the timeout message. PU4 asserts this.
- Keep a dynamic import only: no static import of the encoder module or `@ffmpeg/*` in the context. The context no longer imports `~/utils/ffmpeg`.
- `ARRANGEMENT_MP3_ENCODER_LOAD_TIMEOUT_MS`, all messages, filenames, both-or-none and the download order stay unchanged.

**Docs:**
- **doc 076 l.4** becomes exactly:

    ```text
    **სტატუსი:** Round 86 — C PASS (`browserVerified`), გამოქვეყნდა `971141d`
    ```

  No other change to doc 076.
- New doc `docs/implementation/2026/quarter-IV/077-studio-lab-export-progress-and-worker.md`, in Georgian with the TEMPLATE sections. Status: `Round 87 — იმპლემენტირებულია, C-ის შემოწმებას ელოდება (D-29z52)`. Record:
  - B's probe numbers (445 ms baseline);
  - the worker trio and the main-thread fallback rule (only when `Worker` is undefined);
  - the render `suspend` progress;
  - the progress store (why it is not in `exportState`);
  - the lab encoder: why the frozen util is not used, the same command, reset after a timeout, the timer that covers the import;
  - that conversion has no fixed limit until Cancel (3b);
  - VBR as in round 86;
  - production build not verified in the cloud;
  - the 3b plan.

### Files (exact grants)
| File | Grant |
|---|---|
| `app/lib/arrangement/graph.client.ts` | W: the `renderArrangementWav` options, suspend progress and worker encoding; `measureExportOverload` moves out and is re-exported. Nothing else |
| `app/lib/arrangement/export-wav.ts` | **new** (pure) |
| `app/lib/arrangement/export-wav.worker.ts` | **new** |
| `app/lib/arrangement/export-wav.client.ts` | **new** |
| `app/lib/arrangement/export-progress.ts` | **new** (pure) |
| `app/lib/arrangement/mp3-encoder.client.ts` | **new** |
| `app/contexts/ArrangementContext.tsx` | `exportWav` / `exportMp3` (4th renderer argument, progress, encoder module, timer start), the progress store, its type member and the value-object entries. Nothing else |
| `app/components/arrangement/ArrangementExportDialog.tsx` | the progress label + `<progress>` only |
| `app/lib/arrangement/__tests__/export-wav.test.ts` | **new** |
| `app/lib/arrangement/__tests__/export-progress.test.ts` | **new** |
| `app/lib/arrangement/__tests__/mp3-encoder.test.ts` | **new** |
| `app/lib/arrangement/__tests__/export-progress-ui.test.tsx` | **new** |
| `app/lib/arrangement/__tests__/export-mp3.test.tsx` | **frozen-test grant:** re-target the encoder mocks from `~/utils/ffmpeg` / `@ffmpeg/ffmpeg` to `~/lib/arrangement/mp3-encoder.client` (`loadArrangementMp3Encoder`, `resetArrangementMp3Encoder`, an `encode` mock). Change the three call-shape lines l.383/403/414 to `calls[0]?.[2]` undefined / `toStrictEqual({ start: 4, end: 9 })`, plus `typeof calls[0]?.[3]?.onProgress === 'function'`. Every MX1–MX11 assertion on messages, filenames, download order, call counts, the 119 999 / 120 000 ms timing, mutation targets and the X1 attributes keeps its meaning. Report every changed `it()` |
| `app/lib/arrangement/__tests__/export-range-ui.test.tsx` | **frozen-test grant:** only l.278, 354, 397, 410 (`toHaveLength(2)` → `calls[0]?.[2]` is `undefined`) |
| `app/lib/arrangement/__tests__/metronome-ui.test.tsx` | **frozen-test grant:** only l.464 (`expect(onCall).toHaveLength(2)` → `expect(onCall?.[2]).toBeUndefined()`) |
| `docs/implementation/2026/quarter-IV/076-studio-lab-mp3-export.md` | l.4 only |
| `docs/implementation/2026/quarter-IV/077-studio-lab-export-progress-and-worker.md` | **new** |

Expected end state: **7 M + 10 ??**. Everything else is frozen (the 490-entry list).
- If any other frozen test turns red, **stop and report**; do not edit it. Grep first for further `toHaveLength` / `toHaveBeenCalledWith` on the renderer and for hand-built context values. Any hit outside the grants means stop and report.
- If the worker does not load under the Vite dev server in your smoke (no `export-wav.worker` request, or a worker error), stop and report with the console output. Do not change `vite.config.ts`.

### Required tests (behavioural; IDs for C to cite)
`export-wav.test.ts`:
- **EW1** byte identity: for channels containing values above 1, below −1, exactly `MAX_24BIT_SAMPLE`, −1, NaN and random values, `encodeArrangementWav` bytes equal an oracle that copies today's inline lines (measure, clamp, `encodeSfxWav`). The report equals `measureExportOverload(raw)`.
- **EW2** `measureExportOverload` imported from `graph.client` and from `export-wav` is the same function.
- **EW3** progress is non-decreasing and ends at 1.
- **EW4** client fallback: with no `Worker` global, the client returns the same bytes as EW1.
- **EW5** client worker path with a fake `Worker` (`vi.stubGlobal`):
  - the URL ends with `export-wav.worker.ts` and `type` is `'module'`;
  - the posted channel buffers are in the transfer list;
  - progress messages are forwarded;
  - `complete` resolves and terminates;
  - `error` / `onerror` / `onmessageerror` each reject with the exact message and terminate.
- **EW6** `renderArrangementWav` with a fake `OfflineAudioContext` that has `suspend`/`resume`:
  - with `onProgress`, `suspend` is called before `startRendering` at exactly `arrangementRenderSuspendFrames(length)/48000`;
  - `onProgress('render', …)` fractions are non-decreasing and end at 1, then the `'wav'` phase follows;
  - without `onProgress`, `suspend` is never called;
  - with a context that has no `suspend`, rendering still works;
  - a rejecting `suspend` does not fail the render.

`export-progress.test.ts`:
- **PR1** `arrangementRenderSuspendFrames`: quantum multiples, unique and ascending, `0 < f < length`. Check 14 611 488 → 19 frames; 240 000 → 19; 240 → `[128]`; 0 / NaN / −5 → `[]`.
- **PR2** store notifications: equal percent → no notify; percent change, phase change and null → notify; clamping; non-finite ignored.
- **PR3** label strings, exactly as in §1 P.

`mp3-encoder.test.ts` (mock `@ffmpeg/ffmpeg` with a controllable class and `@ffmpeg/util` `toBlobURL`):
- **ME1** load uses `toBlobURL` with the two unpkg URLs and MIME types. Two concurrent calls make one `load`; a later call reuses the cached instance.
- **ME2** load rejects → `terminate` called, the next call builds a new `FFmpeg`.
- **ME3** `reset` during a pending load → `terminate`; the late resolution does not repopulate the cache; the next call builds a new instance.
- **ME4** `encode` passes the exact 9-argument command, returns an `audio/mpeg` Blob, and deletes both files.
- **ME5** progress is forwarded and clamped, non-finite values are ignored, and `off` is called with the same handler on success and on failure.
- **ME6** a non-zero exit code rejects with `ffmpeg exit code N`.

`export-progress-ui.test.tsx` (workspace or provider + dialog; `renderArrangementWav` mocked so the test can call the passed `onProgress`; the encoder module mocked):
- **PU1** WAV export: the progress elements are absent before the click. During the render, `onProgress('render', 0.5)` shows the label `რენდერი · 50%` and `<progress value=0.5>`; then the `'wav'` label. After done, both are absent. `exportState` equals exactly `{ phase: 'done', message }` (no progress field).
- **PU2** MP3: the load phase shows `MP3 encoder-ის ჩატვირთვა…` and a `<progress>` **without** a `value` attribute; the mp3 phase shows `MP3-ის შექმნა · {p}%`. Error, timeout and done each clear the progress.
- **PU3** progress updates do not re-render the provider: the `useArrangement()` value identity (or a consumer render counter) is unchanged across 10 `onProgress` calls.
- **PU4** the timeout covers the import: with fake timers and an encoder import that never resolves, the exact timeout message appears at 120 000 ms. If that import then resolves, `loadArrangementMp3Encoder` is **not** called and `resetArrangementMp3Encoder` is. With the module loaded and a never-settling load, `resetArrangementMp3Encoder` is called once on timeout; a second export calls `loadArrangementMp3Encoder` again and succeeds.
- **PU5** the context never imports `~/utils/ffmpeg`: no `loadFFmpeg` mock call across an MP3 export. Also check by source grep that `ArrangementContext.tsx` contains no `utils/ffmpeg` and only a dynamic `import('~/lib/arrangement/mp3-encoder.client')`.

### Mutation proofs (scratch copy `a-round-87/mut/`; each must turn at least one listed test red)
- (a) clamp before measure → EW1.
- (b) worker path with no buffers in the transfer list → EW5.
- (c) no `terminate` on error → EW5.
- (d) suspend frames not multiples of 128 → PR1/EW6.
- (e) progress stored in `exportState` → PU1 (and frozen `toEqual`s).
- (f) `setProgress(null)` missing on the timeout path → PU2.
- (g) timer started after the import → PU4.
- (h) no reset on timeout → PU4.
- (i) bitrate argument changed → ME4.
- (j) `off` not called on failure → ME5.
- (k) a late load after reset repopulates the cache → ME3.

## 2. Pre-flight for A
- **Primitives:** `AGENT_DISCOVERABLE_CODE.md`, `AUDIO_ARCHITECTURE.md`, `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `REACT_CONTEXT.md`, `API_ERROR_HANDLING.md` (error display), `ERROR_TAXONOMY.md` (no new code required; say so), `SKELETON_LOADING.md` (progress state), `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`.
- **Prompts and skills:** prompts `studio-feature.md`, `new-service.md`, `new-test.md`; skills `ffmpeg-wasm`, `web-audio-api`.
- **Verify the baseline before the first edit:** HEAD, 0-line status, 490/490, the snapshots, protected 4/4, LF/CR.
- **Confirm the fallback environment on the first test run:** `vitest.config.ts` uses `environment: 'jsdom'`. Assert or log that `typeof Worker === 'undefined'` there, so the frozen direct-render tests (`graph.test.ts`, `master.test.ts`, …) take the main-thread path. If `Worker` exists, stop and report.
- **Imports inside the worker chain:** use relative imports (`./export-wav`, `./meter`, `../sfx-edit`) in `export-wav.ts` and `export-wav.worker.ts`, not the `~` alias. That keeps alias resolution out of the worker bundle in dev and in the gate's build.
- **Checks (speed rules):**
  - `npm run typecheck`, `npm run lint`, and a scoped `biome check` on the owned files (no `--write`).
  - Targeted vitest: the 4 new test files and the 3 granted files, plus `graph.test.ts`, `master.test.ts`, `meter.test.ts`, `clip-fades.test.ts`, `envelope.test.ts`, `clip-gain.test.tsx`, `track-pan.test.tsx`, `export-range.test.ts`, `render-budget.test.tsx`, `context-hygiene.test.tsx`, and every test that imports `graph.client`, `ArrangementExportDialog`, `contexts/ArrangementContext` or `StudioWorkspace`.
  - List the targeted files in `a-round-87/targeted-list.txt`. Do not run the full suite.
- **A's own Playwright smoke at 1440×900** (not C evidence; warm-up load; integer coordinates). On the 5-minute project (B's recipe: music clip + Ctrl+D ×2), run one WAV export and one MP3 export. Record:
  - the max rAF gap;
  - the `export-wav.worker` request;
  - the sequence of progress labels;
  - the frame count;
  - the MP3 size.
- **Code-reviewer** (3+ files): pass its Architecture note to B verbatim.

## 3. File ownership (exact)
- **A** owns only the §1 Files table. **C** owns `c-round-87*`. **B** owns the planning artifacts. Root owns gates, commits and pushes.
- **Protected (never edited):** `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx`, `app/lib/__tests__/download-routes.test.ts`, the auth files (`app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `app/lib/firebase.client.ts`), and for this loop `app/contexts/StudioContext.tsx` and `app/utils/ffmpeg.ts`.
- **`/studio-lab`** stays the public **demo-only** workspace: demo badge, no purchased audio, no token/R2 requests.
  - The only third-party requests are the ffmpeg core from `unpkg.com`, and only after an MP3 click.
  - The new worker script is same-origin.
  - User video stays local; nothing is uploaded.

## 4. Ableton source table
**Source:** Live 12 Reference Manual, "Managing Files and Sets", `https://www.ableton.com/en/live-manual/12/managing-files-and-sets/`. B fetched it with curl on 2026-10-22 and stored it as untrusted text in `b-round-84/web/managing-files.txt`: §5.1.3.4 at l.248 and §5.1.3.5 at l.262–283. Live version: 12 (manual).

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| A progress bar appears in the export dialog while rendering | §5.1.3.5 Real-Time Rendering ("a progress bar appears in the dialog"); §5.1.3.4 video | Confirmed (text) for real-time and video rendering. **Unconfirmed** for ordinary offline audio rendering (not stated in the captured text) | Same idea: a progress bar in the Export dialog for every export | PX-PHASES |
| The progress bar resets for each pass | §5.1.3.4 ("the progress bar in the dialog resets for each individual pass") | Confirmed (text), for multi-pass video encoders | Same class: the bar restarts per phase (render → WAV → encoder load → MP3) and the label names the phase. Conscious adaptation to CZABA's phases | PX-PHASES |
| Cancel stops the process and deletes any partial file | §5.1.3.5 | Confirmed (text), for real-time rendering | **Stage 3b** (next feature round): Cancel, no file. Not in this round | — |
| Rendering does not freeze the application UI | — | Not stated | CZABA requirement R20-X4 (user/plan); our worker is our architecture, not Live's internals | PX-WAV5, PX-MP35 |
| MP3 encoding settings | §5.1.3.2 (round 86) | Confirmed: CBR 320 | Unchanged from round 86 (VBR by the same command, conscious difference) | PX-MP3-SAME |

## 5. C acceptance (real browser, Playwright Chromium on Linux, **both 1440x900 and 1280x720** unless the row says otherwise, `/studio-lab` anonymous, real `page.mouse` and keyboard)
**Setup per session:**
- Check `env-status.json` and that `:5173/studio-lab` returns 200. Do one warm-up load.
- Use the round-86 demo setup (music 0.35 s + 101.352 s, stems, sfx).
- **5-minute project (5M):** click the music clip once, then press Ctrl+D twice. The Export dialog must read `მთელი პროექტი · 00:00.000 — 05:04.406`; record the actual value.
- No video unless the row says so.
- Run route probes (`/`, `/studio/…`) in a separate session **before or after**, never in parallel with an export session. The first dev visit of a non-lab route re-optimizes deps and reloads open tabs (C round 86 env note).

**Harness rules:**
- **HR-C-R84-L1:** ≤ 1 LSB is jitter; report the counts.
- **HR-MP3-ORACLE:** as in round 86.
- **HR-RAF:** install a rAF gap recorder before the click; report the max gap and the top 5 gaps for the click→download window. Do not use CPU throttling for threshold rows.
- **HR-PROGRESS:** use a MutationObserver (attributes + childList + characterData, subtree) on the dialog. Record every change of `[data-testid=arrangement-export-progress]` (`value` present/absent and its value) and of `-progress-label` text, with timestamps.

Delete exported files after measuring; keep the hashes and stats.

| ID | Action | Pass evidence |
|---|---|---|
| PX-WAV5 (R20-X4, primary) | 5M, WAV export (project scope) | `czaba-studio-lab.wav`, 24-bit/48k/2ch, frames `ceil(304.406 × 48000)` (B: 14 611 488); exact WAV message; **max rAF gap ≤ 150 ms** (baseline 445 ms at `971141d`; a result of 150–250 ms is reported with the numbers and triaged by B, not a FAIL; above 250 ms is a FAIL) |
| PX-MP35 (R20-X4) | 5M, MP3 export in a fresh page (includes the first encoder load) | `czaba-studio-lab.mp3`; decoded duration within 0.1 s of 304.406; HR-MP3-ORACLE correlation ≥ 0.99 on two windows (report the lag); exact MP3 message; **max rAF gap ≤ 150 ms** over the whole export (same triage band) |
| PX-PHASES | Observe the PX-MP35 and PX-WAV5 exports (HR-PROGRESS) | Labels appear in phase order. **render:** ≥ 3 distinct non-decreasing `value`s with label `რენდერი · {p}%`. **wav:** ≥ 2 distinct values, `WAV-ის ჩაწერა · {p}%`. **load:** first MP3 in the page; `MP3 encoder-ის ჩატვირთვა…` and no `value` attribute. **mp3:** ≥ 2 distinct values, `MP3-ის შექმნა · {p}%`. Within a phase the values never decrease. Label percent = `floor(value × 100)`. Absent before the click and after done. The status message sequence is byte-identical to round 86 |
| PX-WORKER | `page.on('worker')` during the PX-WAV5 / PX-MP35 exports | A worker whose URL contains `export-wav.worker` starts after each export click (one per export) and not before; it is same-origin |
| PX-WAV-SAME | 101.702 s project WAV (project) and range 4–9 WAV | Same filenames, frame counts (4 881 696; 240 000), header and messages as round 86. In the overload warning, the **peak dB equals round 86**; the clipped-sample **count is reported, not asserted** (it varies with setup/jitter: B saw 1325 and 498, C round 86 saw 470). **Within the same session and state**, the WAV-only export and the WAV of a WAV + MP3 export give identical warning text. Report sha256 against c-round-86's recorded hashes; if they differ, report the ≤ 1 LSB counts (HR-C-R84-L1) |
| PX-MP3-SAME | 101.702 s project MP3 | VBR (Xing) header as round 86, 48 kHz stereo; decoded 101.702 s ± 0.1; correlation ≥ 0.99; exact message |
| PX-BOTH (1440) | WAV + MP3, project scope | Exactly `.wav` then `.mp3`; frames 4 881 696; exact both-message; progress shows render → wav → (load) → mp3 |
| PX-REUSE | A second MP3 in the same page | No second `ffmpeg-core.wasm` request; the load phase is absent or brief; report both durations |
| PX-CDNFAIL | `page.route('**/unpkg.com/**', abort)`: MP3, then WAV + MP3, then WAV; then `unroute` and MP3 | Exact load-failure message (`role=alert`), 0 downloads, Close enabled, progress cleared; the WAV export still works; after unroute, MP3 succeeds in the same page |
| PX-RETRY (GATE86-S1; 1440 only) | unpkg requests never answer; MP3 export; after the timeout, `unroute`; MP3 again in the same page | Timeout message exact at 120 s ± 5 s after the encoder-loading message; 0 downloads; progress cleared. **The second MP3 completes** (`.mp3` downloads, exact message). In round 86 a retry would hang |
| PX-RANGE-SHORT | Range 4–9 s: WAV and MP3 | Downloads as round 86; progress appears and clears; no `pageerror` / unhandled rejection |
| PX-KEYS | Keyboard only: open Export with Enter, choose MP3 with arrows, Tab to the button, Enter; during the render press Tab 3 times | Focus never leaves the dialog; the `<progress>` never takes focus; `.mp3` downloads; Escape after done returns focus to Export |
| PX-X3 (1280 only) | With a video clip | Video option disabled with the unchanged reason; downloads only `.wav` / `.mp3` |
| PX-NET | All sessions | No unpkg request before the first MP3 / WAV + MP3 click (page load and WAV exports make none); then only `ffmpeg-core.js` / `ffmpeg-core.wasm`; the worker script is same-origin; no studio-token / R2 / download request; 0 auth headers |
| REG-HYD | All sessions | No hydration / `useLayoutEffect` warning, no non-noise console error (errors C induces with `route.abort` are reported as induced) |
| G87-3 | Purchase protection | `/studio/middle-east` anonymous → sign-in required, no workspace; `/api/studio-token?…` anonymous → 401; the header link opens `/studio-lab` with the demo badge; fake-Bearer 403 → BLOCKED if the backend is unavailable |
| T87-TARGETED | A's `a-round-87/targeted-list.txt` | All pass |
| SOURCE-UNCHANGED | Start = end | HEAD `971141d`, 7 M + 10 ??, frozen 490/490, A's end hashes, protected 4/4, `app/utils/ffmpeg.ts` = `0995ae78` |

- **Gate rows** (`gate`, not claimed by C): full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke. **Production MP3 / worker in the built bundle** cannot be checked in the cloud (no preview server). C lists it as not run, not as PASS. B asks root to try it at gate 87.
- **Ableton match:** reported separately from PASS (confirmed / conscious difference / unconfirmed / not applicable), using §4.
- **Neighbour behaviour that could break:**
  - WAV bytes (worker vs main thread);
  - the round-85/86 scope and format defaults;
  - the dialog's focus trap and focus return;
  - the overload warning;
  - MP3 output (same command).
- **Known and intended (not a new bug):** Close stays disabled while rendering (the existing `isRendering` rule); Cancel arrives in stage 3b. A conversion has no fixed time limit until then.

## 6. Mutation-proof table for C (optional, read-only)
C may re-run A's mutations (a)–(k) in a scratch copy, never in `store/`.

## 7. After this round
- **Round 88:**
  - If its planning falls on or after **2026-10-24**: a **regression round**. One short browser check per done / c_pass item at both viewports, plus `npm run test:e2e:smoke`; A fixes only what C finds. GATE85-S6 (row-boundary handles) is one of its rows.
  - Otherwise: **SRW-20 stage 3b**. Cancel in every phase (render: stop resuming the suspended context; WAV: terminate the worker; load and MP3: `resetArrangementMp3Encoder`), no file, an exact cancelled message, then a working next export. Also abort on unmount (A-R86 L2) and the WAV + MP3 delivery note (GATE86-S2). That completes R20-X4.
- **Then:** the Lows batch → SRW-21 → full regression → T12 → VISUAL-A-OBSIDIAN.
- **Architecture:** checkpoint request q14 (`b-round-83-checkpoint-request.md`) asks root for the bounded frontend-architect checkpoint at the SRW-20 feature boundary (after 3b). It does not block this round.
