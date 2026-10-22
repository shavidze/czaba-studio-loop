# A — Round 87 report: SRW-20 stage 3a (WAV worker, export progress, lab MP3 encoder) — D-29z52

Implementer: A (Claude Opus 5.5) · Date: 2026-10-22 · Task: `current-task.md` (round 87). Nothing committed or pushed. No servers were started or stopped (I used the existing `:5173`).

## Baseline (verified before the first edit)
- HEAD `971141d67a1dd33da8f1165de1d895bd62b4e022`; `git status --short` printed 0 lines.
- Frozen list 490/490 OK. All 8 snapshot hashes matched. Protected files 4/4 OK.
- jsdom has no `Worker`: EW4 asserts `typeof Worker === 'undefined'`, so the frozen direct-render tests take the main-thread path.

## End state
- **7 M + 10 ??** (exactly the §1 Files table). Frozen list 490/490 OK at the end. HEAD unchanged.
- Protected files unchanged: `app/utils/ffmpeg.ts` = `0995ae78`, plus the 4 protected routes/tests. `StudioContext.tsx` is not modified.
- End hashes: `a-round-87/end-hashes.txt`. Checkpoint log: `a-round-87/checkpoint.md`.

### Changed files
| File | Change |
|---|---|
| `app/lib/arrangement/export-wav.ts` (new, pure, relative imports only) | `measureExportOverload` moved here unchanged, with `ExportOverloadReport`. Adds `encodeArrangementWav(channels, sampleRate, onProgress?)` (measure → clamp → `encodeSfxWav`) and the worker message types |
| `app/lib/arrangement/export-wav.worker.ts` (new) | Posts progress at most once per whole percent. Posts `complete` with `bytes` transferred, or `error` |
| `app/lib/arrangement/export-wav.client.ts` (new) | `encodeArrangementWavOffMainThread`: uses the main thread only when `Worker` is undefined. Otherwise one module worker per export, channel buffers transferred, `terminate()` on complete/error/onerror/onmessageerror. A constructor or `postMessage` throw rejects with `WAV-ის ჩაწერა ვერ მოხერხდა (worker).` |
| `app/lib/arrangement/export-progress.ts` (new, pure) | Phase types, `arrangementRenderSuspendFrames`, `createArrangementExportProgressStore`, `formatArrangementExportProgress` |
| `app/lib/arrangement/mp3-encoder.client.ts` (new) | `ARRANGEMENT_MP3_CORE_BASE_URL`, `loadArrangementMp3Encoder` (one shared in-flight promise, cached on success, terminate + clear on failure), `resetArrangementMp3Encoder` (generation counter; checked after each `toBlobURL` and before `load`), core blob URLs revoked in `finally`. `encode` uses the byte-identical 9-arg command, the exit code checked, `off` and `deleteFile` in `finally` |
| `app/lib/arrangement/graph.client.ts` | Re-exports `measureExportOverload` / `ExportOverloadReport`. Adds `ArrangementRenderOptions`. `renderArrangementWav(…, renderWindow?, renderOptions?)`: suspend progress (19 quantum frames, microtask-wrapped, rejections swallowed, `resume()` always follows a resolved `suspend`), `onProgress('render', 1)` after render, `.slice()` channel copies → worker encode. The literal return line is kept, and the renderer is still the last function |
| `app/contexts/ArrangementContext.tsx` | `exportProgress` store (`useState` initialiser) in the type and in both value-object places (object + deps). Both exports pass `{ onProgress }` as the 4th argument (`undefined` window for project scope) and clear progress in `finally`. `exportMp3`: `load`/null, then `mp3`/0, then encoder progress. The 120 s timer starts before `import('~/lib/arrangement/mp3-encoder.client')`. Timeout and load failure call `resetArrangementMp3Encoder()`. A late module after the timeout resets and starts no load. No `~/utils/ffmpeg` import anymore. Messages, filenames and order are unchanged |
| `app/components/arrangement/ArrangementExportDialog.tsx` | Progress label + `<progress>` (indeterminate: no `value` for `load`), read via `useSyncExternalStore`, rendered only while `rendering` and the store is non-null |
| `__tests__/export-wav.test.ts` (new) | EW1–EW7 (EW7 = worker module itself: whole-percent throttle, bytes transfer, error branch) |
| `__tests__/export-progress.test.ts` (new) | PR1–PR3 |
| `__tests__/mp3-encoder.test.ts` (new) | ME1–ME6 (+ blob-URL revoke, + reset during core download → `toBlobURL` once, `load` never called) |
| `__tests__/export-progress-ui.test.tsx` (new) | PU1–PU5 |
| `__tests__/export-mp3.test.tsx` (grant) | see the changed-`it()` list below |
| `__tests__/export-range-ui.test.tsx` (grant) | only l.278/354/397/410: `toHaveLength(2)` → `calls[0]?.[2]` `toBeUndefined()` |
| `__tests__/metronome-ui.test.tsx` (grant) | only l.464: `expect(onCall?.[2]).toBeUndefined()` |
| `docs/…/076-studio-lab-mp3-export.md` | l.4 only, the exact text from the task |
| `docs/…/077-studio-lab-export-progress-and-worker.md` (new) | Georgian, TEMPLATE sections, all §1 items |

### `export-mp3.test.tsx` — every change
- **Module-level:**
  - Removed the `@ffmpeg/ffmpeg` and `~/utils/ffmpeg` mocks/imports. Added a `~/lib/arrangement/mp3-encoder.client` mock (`loadArrangementMp3Encoder`, `resetArrangementMp3Encoder`) and `encodeMock`.
  - Mocks renamed: `loadFFmpegMock` → `loadEncoderMock`, `convertWavToMp3Mock` → `encodeMock`.
  - In `beforeEach`, load resolves `{ encode: encodeMock }`.
- **MX2:** l.383 → `calls[0]?.[2]` undefined + `typeof calls[0]?.[3]?.onProgress === 'function'`. `convertWavToMp3Mock.mock.calls[0]).toEqual([renderedBlob])` → `encodeMock.mock.calls[0]?.[0]).toBe(renderedBlob)` + `typeof calls[0]?.[1] === 'function'`. (The encoder now gets a progress callback, so a 1-element `toEqual` could not hold.)
- **MX3:** l.403 `toHaveLength(3)` removed. The `toStrictEqual({ start: 4, end: 9 })` line stays, plus the `onProgress` check.
- **MX4:** l.414/415 changed the same way as MX2.
- **MX5, MX6, MX7, MX8, MX10, MX11:** renamed mocks only. MX5 and MX6 resolve/hang through `loadEncoderMock`. MX6 additionally asserts `resetEncoderMock` was called once after the timeout (new assertion, same meaning). The messages, filenames, download order, call counts and 119 999 / 120 000 ms timing are unchanged.
- **MX1, MX9:** unchanged.

## Checks actually run
- `npm run typecheck`: clean.
- `npm run lint`: 0 errors and 218 warnings repo-wide. I measured that count only after my edits, not at baseline. Scoped `biome lint` on the 15 owned code files: 0 diagnostics, so none of the 218 are in my files.
- Scoped `npx biome check <15 owned code files>` (no `--write`): clean. I formatted my own files through `biome format --stdin-file-path` (stdin → stdout).
- **Targeted vitest:** `a-round-87/targeted-list.txt` (70 files: the 4 new and 3 granted files, the listed frozen ones, and every test importing `graph.client`, `ArrangementExportDialog`, `contexts/ArrangementContext` or `StudioWorkspace`). Result: **70 files / 1195 tests passed** (`a-round-87/targeted-run.log`). I did not run the full suite (speed rules).
- **Mutation proofs:** scratch copy `a-round-87/mut/store` (`mutate.py`, results in `mut/mutation-results*.json`). (a)–(k) all **RED**:
  - (a) EW1/EW4/EW6;
  - (b) EW5;
  - (c) EW5;
  - (d) PR1;
  - (e) PU1/PU3 (+ frozen export-range-ui);
  - (f) PU4 — it first *survived*: the dialog hides the bar on `error`, so only the store kept the stale value. I added `exportProgress.getProgress()` null assertions to both PU4 timeout tests, and after that it is RED;
  - (g) PU4;
  - (h) PU4;
  - (i) ME4;
  - (j) ME5;
  - (k) ME3.
  - The reviewer-fix mutations are all RED too: resume skipped on a throwing callback → EW6; no generation check between the downloads → ME3; constructor outside `try` → EW5; no revoke → ME1.
- **A's own Playwright smoke** (not C evidence). Chromium, 1440×900, `:5173/studio-lab`, warm-up load first, real mouse/keyboard. Recipe: drop music 0.35, stems 2, sfx 4, click the music clip, Ctrl+D ×2. Dialog: `მთელი პროექტი · 00:00.000 — 05:04.406`. Script: `a-round-87/pw/smoke.cjs`, outputs `smoke-output.json`, `-2`, `-3`, `-4`, state file `a-browse.json`.

| Run | WAV max rAF gap (top 5) | MP3 max rAF gap (top 5) |
|---|---|---|
| 1 (before reviewer fixes) | 126 (126,125,98,78,74) | **177** (177,135,119,100,90) |
| 2 (before reviewer fixes) | 131 | 132 |
| 3 (final code) | 137 (137,95,91,85,71) | 94 (94,87,87,84,77) |
| 4 (final code, monotonicity check) | 135 (135,127,72,71,70) | 120 (120,96,88,82,80) |

  - The baseline at `971141d` was 445 ms (B). One of the three MP3 runs (177 ms) fell in B's 150–250 triage band. In run 2 the big gaps sat in the render phase (~0.6 s) and at the end of the WAV phase (~1.3–1.4 s: Blob build / `wav.arrayBuffer()` on the main thread). These are inferences from timestamps, not profiled.
  - **WAV:** `czaba-studio-lab.wav`, RIFF 2 ch / 48 000 / 24-bit, **14 611 488 frames**, 87 668 972 bytes. sha256 `64aa7efb…` (run 1). Message exact, overload warning `+1.7 dBFS — 498 sample`.
  - **MP3:** `czaba-studio-lab.mp3`, **9 903 165 bytes**, decoded 304.406 s / 2 ch / 48 kHz. First export with encoder load ~10.3–10.6 s. A second MP3 in the same page took 7.0 s with **no second `.wasm` request** (1 total).
  - **Workers:** the `export-wav.worker.ts?worker_file&type=module` worker is same-origin, one per export (wav, mp3, mp3-reuse), and none before the first click. The ffmpeg worker `@ffmpeg/ffmpeg/dist/esm/worker.js` starts only for the MP3.
  - **Progress labels (HR-PROGRESS-like MutationObserver):**
    - WAV: `რენდერი` (20 distinct values) → `WAV-ის ჩაწერა` (101).
    - MP3: `რენდერი` (20) → `WAV-ის ჩაწერა` (101) → `MP3 encoder-ის ჩატვირთვა…` (no `value` attribute) → `MP3-ის შექმნა` (12).
    - Label percent = `floor(value×100)` in every record. Absent after done. `<progress>` never focused.
    - Status sequence: `რენდერი და 24-bit WAV-ის შექმნა…` → `MP3 encoder იტვირთება (ffmpeg.wasm, პირველად ~31 MB)…` → `MP3-ის შექმნა…` → done (round-86 strings).
  - **Network:** unpkg requests only after the MP3 click (`ffmpeg-core.js`, `ffmpeg-core.wasm`). 0 studio-token / R2 / download requests, 0 auth headers.
  - **Console:** 0 non-noise console errors/warnings, 0 pageerrors.

## code-reviewer (actual subagent run, 8/10, no Critical/High)
**Fixed in this round** (each covered by a new test and a RED mutation):
- M1: Worker constructor throw → exact message.
- M2: a throwing progress callback skipped `resume()`, which could hang the render.
- M3: the generation was checked only after both downloads, so `ffmpeg-core.wasm` could still start after a reset. Doc 077 overclaim corrected.
- L4: core blob URLs were never revoked.
- Medium test gap: the worker module was untested → EW7, inside the granted `export-wav.test.ts`.

**Not changed (reported for B/C):**
- L5: a failed conversion leaves the cached encoder in place (same as the frozen util). Proposed for 3b with Cancel.
- L6: the label stays at `რენდერი · 100%` while the worker measures and clamps before `encodeSfxWav` reports. Spec-conformant.
- L7: the store does not enforce non-decreasing values within a phase. In smoke run 4 I checked every observed record per phase: render 20, wav 101 and mp3 13 records, **0 decreases** in each. That covers one run only, so C's PX-PHASES check still matters.
- L8: the fallback path throws synchronously inside a Promise-returning function. Harmless: the only caller is async.
- Low: PU tests depend on order. Only the first PU4 opens the delayed-import gate, so running PU2 alone with `-t` hangs until its timeout.
- Low: there is no MP3-path render-failure progress test (the code's outer `finally` covers it).
- Info: the unpkg core has no SRI (pre-existing).

**Architecture note (verbatim from code-reviewer, for B; a proposal only, nothing extracted):**
> Signals 3 and 4: `/home/runner/czaba-project/store/app/contexts/ArrangementContext.tsx:2726-2881`. `exportMp3` was changed in rounds 85, 86 and 87, and 3b will change it again; this round added a timer, a dynamic import and an encoder reset to the provider. Keep it for now: it is one lifecycle, the scope is frozen, and the tests pass. Proposal for the planner (not a finding for this round): after 3b, at the q14 checkpoint, a bounded task to move the MP3 export orchestration (timer, import, reset, and 3b's abort) into a `lib/arrangement/` module, with the `useArrangement()` shape and PU/MX tests unchanged.

## Pre-flight / primitives
- **Primitives read:** AGENT_DISCOVERABLE_CODE, AUDIO_ARCHITECTURE, FORWARDREF_COMPONENT, TAILWIND_FIRST, DESIGN_TOKENS, REACT_CONTEXT, API_ERROR_HANDLING, ERROR_TAXONOMY, SKELETON_LOADING, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS.
- **Prompts and skills read:** studio-feature, new-service, new-test, `ffmpeg-wasm`, `web-audio-api`, `pre-flight`.
- **ERROR_TAXONOMY:** no new error code is needed. The ranges are backend codes, and the user-facing strings are unchanged apart from the specified worker message.
- **Tailwind:** tokens only (`text-xs text-muted`, `h-2 w-full accent-brand`, following the `SfxSceneExport` precedent).

## B acceptance — what I can truthfully mark
**Passed (A-side, offline/unit):**
- EW1–EW6 (+EW7), PR1–PR3, ME1–ME6, PU1–PU5.
- Mutations (a)–(k).
- Typecheck, lint, scoped Biome, targeted list (T87-TARGETED from A's side).
- SOURCE-UNCHANGED from A's side (HEAD, 7 M + 10 ??, frozen 490/490, protected, `ffmpeg.ts` = `0995ae78`).

**Not claimed (C's browser rows):**
- PX-WAV5, PX-MP35, PX-PHASES, PX-WORKER, PX-WAV-SAME, PX-MP3-SAME, PX-BOTH, PX-REUSE, PX-CDNFAIL, PX-RETRY, PX-RANGE-SHORT, PX-KEYS, PX-X3, PX-NET, REG-HYD, G87-3.
- My smoke only touches PX-WAV5/PX-MP35/PX-PHASES/PX-WORKER/PX-REUSE at 1440 and is not C evidence.
- Not run by me at all: 1280×720, WAV + MP3, range, CDN failure, the 120 s retry, keyboard, video, purchase protection.
- Gate rows (full suite, build, verify, e2e smoke, production-bundle worker/MP3) belong to root.

## Known gaps / risks for C
- MP3 max rAF gap varied 94–177 ms across my 4 runs (one in the 150–250 triage band). WAV ran 126–137 ms.
- The production build was not run (A speed rules; the build is a gate row). Dev-server worker loading was confirmed. The worker uses `new URL('./export-wav.worker.ts', import.meta.url)`, the same pattern as the published `sfx-export`.
- L7 above: MP3 progress monotonicity is not enforced in code. It was observed monotonic in run 4.

## Exact next C checks (suggested order)
1. PX-WORKER + PX-WAV5 at both viewports (5M recipe; report the rAF top 5).
2. PX-MP35 in a fresh page + PX-PHASES. Check MP3 values never decrease (reviewer L7), and that the `load` record has no `value` attribute.
3. PX-REUSE (no second `.wasm`), PX-BOTH (1440), PX-RANGE-SHORT.
4. PX-CDNFAIL, then PX-RETRY at 1440 (timeout 120 s ± 5 after the loading message; then the second MP3 completes in the same page).
5. PX-WAV-SAME / PX-MP3-SAME (101.702 s), PX-KEYS, PX-X3 (1280), PX-NET, REG-HYD, G87-3, SOURCE-UNCHANGED (end hashes in `a-round-87/end-hashes.txt`).

## Scope completed
SRW-20 stage 3a as specified (W, P, E, docs) is implemented, and the A-side checks pass. R20-X4 is **not** complete: Cancel, abort on unmount, the WAV + MP3 note and GATE86-S2 are stage 3b. The backlog is not complete.
