# Studio performance: findings and task outline (for B to detail)

**Date:** 2026-10-26 · **Status:** approved by Saba · **Queue entry:** `STUDIO-PERFORMANCE`, after REVIEW-RECOMMENDATIONS and before T12-ADVANCED.

A performance audit (by the performance-optimizer agent, outside the loop) measured `/studio-lab` on a production build in headless Chromium at store master `cc207d6`. The full report stays private with Saba. This page carries the measured findings and the task outline. **B, consulting `performance-optimizer` and `tech-lead`, re-checks each finding in the current code and writes each PERF task in full detail** (exact files and lines, contract, acceptance rows, verification) before it is dispatched. Treat every line reference below as approximate. Never weaken an existing behaviour contract to reach a number.

## Measured baseline (production build, fast desktop CPU, no throttling)

- **Playback is already good:** 0 React commits and 0 long tasks during 6 s of playback, frame p95 16.7 ms. Scroll p95 is 16.8 ms. **Do not rewrite the playback engine.** `positionStore` and the imperative position writers are correct as they are.
- **Load:** a 463–491 ms main-thread long task before "ready". The demo synth runs synchronously in a React effect (generateDemoPad/Lead/Pulse/Bass about 420 ms in total), plus `computePeaks` at 22–30 ms per 2-minute file. "Ready" arrives at 2.3–2.5 s.
- **Memory:** 140 MB of ArrayBuffer/AudioBuffer after load (V8 heap 5 MB). Every library source is decoded up front at 48 kHz float32. Estimate: 8 stems × 5 min ≈ 0.9 GB.
- **WAV export (04:11, 7 clips):** 2.3 s, +161 MB peak, a 123 ms main-thread long task. One OfflineAudioContext holds the whole length, and the main thread copies with `getChannelData().slice()`.
- **Interaction:** the single large ArrangementContext value (~110 fields) re-renders about 105 components on play/pause, zoom steps and each range-drag move. A clip click takes up to 144 ms (Event Timing). Zoom keydown is p50 56 / max 88 ms with 30 clips. The waveform SVG path is rebuilt on every zoom step. There is no clip virtualization (about 28 DOM elements per clip).
- **Bundle:** studio-lab transfers 328 KB of JS. Firebase auth, signalr and framer-motion load from root on every page. ffmpeg is code-split, but its ~31 MB core loads from unpkg at runtime. Google Fonts load render-blocking.
- **Cache:** the arrangement Studio has no persistent audio cache. The older IndexedDB cache is used only by the legacy `/studio/:productId` route, and the `indexeddb-cache` skill does not match that code. R2 studio responses do not support revalidation or ranges, so stems are downloaded again on every open.
- **Not measured:** MP3 export, because unpkg is unreachable in the cloud.

## Recommendations and non-goals

- Do: move heavy work to Web Workers (peaks, encoders, the demo synth); chunk the offline export; precompute peaks server-side (BBC audiowaveform, a backend task outside this repo); cache compressed stems in OPFS with an IndexedDB index (never decoded PCM); split the context and use `useSyncExternalStore` selectors; quantize the waveform resolution; virtualize clips.
- Don't (for now): an AudioWorklet engine rewrite; COOP/COEP site-wide (it breaks the Firebase popup and the third-party embeds, and ffmpeg is single-thread so nothing needs it); WebCodecs decode.

## Task outline (value ÷ effort order; 1 round = one loop round)

| id | What | Target (baseline) | Rounds |
|---|---|---|---|
| PERF-1 | Perf harness: a Playwright perf spec on the production build with JSON budgets (long tasks, LoAF, Event Timing, CDP heap, commit counter); median of 3 runs | prints and checks every baseline below | 1 |
| PERF-2 | Demo synth lazy or in a worker | load long task < 100 ms (463–491) | 1 |
| PERF-3 | Zoom without rebuilding waveform paths (quantized resolution + viewBox scaling); memo the envelope | zoom keydown p95 < 50 ms with 30 clips; ≤ 1 commit per step | 1 |
| PERF-4 | R2 worker: ETag → 304, Range → 206 on previews, immutable hashed keys, stable studio asset URLs (auth outside the URL); purchased files stay `private` | worker unit tests: 304, 206 + Content-Range, headers | 1 |
| PERF-5 | Peaks in a worker (chunked copyFromChannel + transfer); batch the peaks/state updates (rAF + startTransition) | main-thread peaks ≤ 5 ms per stem (22–30); load long tasks > 50 ms = 0 | 1–2 |
| PERF-6 | Self-host the ffmpeg core (same origin or R2, immutable) | MP3 export testable in the cloud; 0 third-party requests | 1 |
| PERF-7 | Self-host fonts with preload (Georgian subset) | 0 render-blocking third-party requests; FCP − DCL < 150 ms | 1 |
| PERF-8 | Range and selection in an external store with selectors | range drag ≤ 15 components per move (~104) | 2 |
| PERF-9 | Stem cache v2: OPFS + IndexedDB index, hash or ETag keys, LRU, estimate()/persist(), quota handling; migrate or retire the old cache; fix the skill doc | second open: 0 stem network bytes; ready ≤ 50 % of cold | 2 |
| PERF-10 | Split the context: stable actions + separate state stores | play/pause ≤ 20 components (105); clip click < 80 ms (144) | 2 |
| PERF-11 | Root diet on `/studio*`: dynamic firebase import, lazy signalr, no framer-motion page transition | studio-lab JS ≤ 230 KB (328) | 2 |
| PERF-12 | Chunked export (30 s windows) with a streaming WAV writer in the worker; no main-thread `.slice()` | export long tasks > 50 ms = 0 (123 ms); peak ≤ 40 MB (+161); bit-exact vs full render | 2 |
| PERF-13 | Lazy decode + a memory budget (LRU); library previews stream | backing store at ready ≤ 60 MB (140) | 2 |
| PERF-14 | Clip virtualization + multi-resolution peaks | 200 clips: ≤ 2000 DOM elements; zoom p95 < 50 ms | 2 |
| PERF-15 | Precomputed peaks loader (backend audiowaveform; worker fallback) | waveform visible before decode | 2 + backend |
| PERF-16 | MP3 via a small streaming LAME wasm in place of ffmpeg (check the licence) | encoder ≤ 1 MB (~31 MB); 0 WAV copies | 2 |

## Verification in the cloud loop

- Production build + `remix-serve` with Playwright's Chromium. Gate on deterministic metrics: commit and component counts, bytes, the number of long tasks over 50 or 100 ms, DOM element counts, backing-store MB. Wall-clock ms is a trend with a ±30 % margin. Fixtures (sine or noise 5-minute stems) are generated at test time and never committed.
- Known harness gotcha: Playwright `context.route()` interception left `/studio-lab` stuck on "Loading…". Avoid interception in the perf harness.
- Safari support versions and storage quotas in the recommendations must be checked against MDN or caniuse before the task relies on them.
- The R2 worker and backend tasks (PERF-4, PERF-15) touch deploy and security: list the exact header changes in the task and keep purchased assets private. PERF-15 needs the .NET backend, so the loop writes its client side and a backend handoff note only.
