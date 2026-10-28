# A round 218 — PERF-16a: lab MP3 export through mediabunny + LAME

No STOP. HEAD `13c7805e5c0fdf2772e51195e693061e7e46aea3` is root's `chore(deps): add mediabunny@1.62.1 @mediabunny/mp3-encoder@1.62.1 …`. It sits directly on `8873ece` and changes only `package.json` and `package-lock.json`. Both packages are installed at 1.62.1.

## 1. Changed files (only the 4 grants + doc 170)
`git status --short --untracked-files=all` at handover:
```
 M app/lib/arrangement/__tests__/mp3-encoder.test.ts
 M app/lib/arrangement/__tests__/strings.test.ts
 M app/lib/arrangement/mp3-encoder.client.ts
 M app/lib/arrangement/strings.ts
?? docs/implementation/2026/quarter-IV/170-perf-16a-mp3-mediabunny.md
```
Scope checks:
- The frozen check `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-217-r218-tree-sha256.txt` gave rc 0, at the start and again at the end.
- `git diff --stat 8873ece HEAD -- package.json package-lock.json` shows only root's commit (2 files, +50).

### `mp3-encoder.client.ts`, rewritten
**Exports.** Unchanged: `ArrangementMp3Encoder`, `loadArrangementMp3Encoder(): Promise<ArrangementMp3Encoder>` and `resetArrangementMp3Encoder(): void`. `ARRANGEMENT_MP3_CORE_BASE_URL` is removed. No other export was added: the ME9 scanner lives in the test file.

**APIs used, with the line each relies on:**

| API | Typing line |
|---|---|
| `Input({formats, source})` | `mediabunny.d.ts` l.2409 / l.2611–2615 |
| `Input.dispose()` | l.2498 |
| `BlobSource(blob)` | l.623–629 (cache l.637–638) |
| `BufferTarget.buffer` | l.669–674 |
| `Output({format, target})` | l.3737 / l.3862 |
| `Mp3OutputFormat` | l.3512 |
| `Conversion.init` | l.1000 |
| `Conversion.onProgress` | l.973 |
| `Conversion.isValid` | l.982 |
| `Conversion.discardedTracks` | l.989 (reasons l.1578ff) |
| `Conversion.execute` | l.1011 |
| `Conversion.cancel` | l.1016 |
| `ConversionAudioOptions.codec` / `quality` | l.1039 / l.1041 |
| `ConversionOptions.audio` | l.1198 |
| `Quality` | l.4126 (`bitrate` l.4194) |
| `WAVE` | l.5479 |
| `registerMp3Encoder` | `@mediabunny/mp3-encoder/dist/modules/src/index.d.ts` (the last line); `src/index.ts` l.256–263 |

**CBR.** LAME is CBR because the bridge sets only `lame_set_brate` and never `lame_set_VBR`: `lame-bridge.c` l.19, and LAME's default is vbr_off. The browser confirms it (§3).

**Semantics:**
- **Load and registration.** Registration happens inside the first load, after one microtask and a generation check. It is unconditional, with no `canEncodeAudio` guard.
- **Loaded state.** The module flag is "loaded for generation N", and reset clears it.
- **Encode.** One Conversion per `encode()`, with the exact config of §1.5. `onProgress` is set before `execute()`.
- **Invalid conversion.** When `isValid` is false, the encode rejects with the discard reasons and never calls `execute()`.
- **Cleanup.** `input.dispose()` runs in a `finally`. A null buffer rejects.
- **No full-size copy.** The code calls no `arrayBuffer`, `bytes`, `text` or `Response`.
- **Generation checks.** Before the `Input` is built, which covers stale encoders, and again after `Conversion.init` and after `execute()`.
- **Reset.** It increments the generation, sets `isCancelled` on each in-flight run, calls `cancel()` once per run (fire-and-forget, `.catch`) and clears the set.

### Strings
- `strings.ts` and `strings.test.ts`: exactly the three values of §1.7. Biome joined `mp3FormatNote` onto one line, because it now fits in 100 columns.
- B's L23 grep, re-run (`grep -rlnE "Loading the MP3 encoder|unpkg CDN|from a CDN|ffmpeg\.wasm|31 MB" app e2e perf docs/technical`), hits exactly the 3 listed files:
  - `strings.ts`;
  - `strings.test.ts`;
  - `docs/technical/diagrams/studio-audio-pipeline.md`, which 16b owns.
- `ARRANGEMENT_MP3_CORE_BASE_URL` has 0 hits in `app`, `e2e` and `perf`.

## 2. Tests actually run
- **`npx vitest run` on the 8 covering files:** 8/8 files and 129/129 tests pass. File: `a-round-218-cover-files.txt` (same content in `a-round-218-cover.txt`).

  | File | Time, A round 218 | Gate 217 `verify.log` |
  |---|---|---|
  | `mp3-encoder` (14 tests) | 216 ms (60–83 ms in other runs) | 58 ms |
  | `strings` | 76 ms | 135 ms |
  | `export-mp3` (the slowest) | 2,718 ms | 2,845 ms |
  | `export-cancel-ui` | 2,153 ms | 2,195 ms |
  | `collection-load-status` | 2,292 ms | 2,705 ms |
  | `export-dialog-hold-enter` | 1,803 ms | 1,808 ms |
  | `export-progress-ui` | 924 ms | 1,498 ms |
  | `video-import-status-ui` | 117 ms | 171 ms |

  Every file is far below 50 % of the vitest default timeout (5 s per test). The highest is `export-mp3` at 2,845 ms, gate 217's time for the whole file. No STOP under L31/L32.
- **Typecheck and lint:** `npm run typecheck` rc 0. `npm run lint` rc 0. Biome on the 4 owned paths: no fixes, no diagnostics.
- **Rows:** ME1, ME2, ME3(a), ME3(b) ×2 (during execute, and during `Conversion.init`, added after the review), ME3(c), ME3(d), ME4, ME5, ME6, ME7 (execute, init and null buffer), ME8 and ME9 ×2 (the repo scan, and the scanner's self-test on a `/tmp` copy of real `strings.ts` with bare, named, static-client and type-only variants).
- **Mutants.** Each ran on the owned files only. Backups are in `a-round-218/mutants/*.orig.ts`, the logs in `a-round-218/mutants/<name>.log`, and the files were restored and checked with `sha256sum -c` (OK).

  | Mutant | Named row that failed | Failing tests |
  |---|---|---|
  | (a) `128_000` | ME4 | 1 |
  | (b) registration at module top level | ME1 (also ME2, ME3(a), ME3(c)) | 4 |
  | (c) `await wav.arrayBuffer()` before `Input` | ME8: "expected vi.fn() to not be called" (jsdom Blob has no native arrayBuffer, so other rows fail too) | 10 |
  | (d) `import 'mediabunny'` prepended to a `/tmp` copy of the real `ArrangementExportDialog.tsx` and injected into the ME9 file list | ME9 | 1 |
  | (e) stale-generation check removed | ME3(c) | 1 |
  | (f, extra) post-init generation check removed | ME3(b), the `Conversion.init` row | 1 |

  Nothing hung.

## 3. Real browser (Playwright Chromium, dev `http://127.0.0.1:5173`)
Script: `a-round-218/mp3-smoke.cjs`. Output: `a-round-218/smoke/*.json` and `*.png`. Storage state: `a-browse.json`. The script adds the demo clip with the real mouse, chooses MP3, exports and captures the download.

**Run 1 (1440).** Vite re-optimised the deps after `mediabunny` was first imported. On the first goto that caused "Invalid hook call" and a hydration error (the React duplicate during re-optimise). After the Export click the page reloaded: a `framenavigated` after the export, and the dep `?v=` hashes changed from 650c0f3d/55465c56 to 95e79353. No download. This is environmental, as §2 predicted. Log: `smoke/a218-1440x900-run1-vite-reoptimise.json`.

**Runs 2 (1440×900) and 3 (1280×720).** Identical results:

| Check | Result |
|---|---|
| Download | `czaba-studio-lab.mp3`, 4,055,208 B; dialog `MP3 created: 01:41.352, 48 kHz · stereo.` |
| Leading metadata frame | Xing frame, header `fffa4464`, 56 kbps, 168 B. Reported separately. |
| Audio frames | 4,224 frames, all MPEG-1 Layer III, 320 kbps, 48 kHz. First audio header `FF FB E4 64`. |
| Duration from frames | 4,224 × 1152 / 48000 = 101.376 s, inside [101.352, 101.452]. The parse ends exactly at EOF. |
| `decodeAudioData` | 101.376 s, 2 ch, RMS −15.29 dBFS (round-217 WAV: −15.29). Non-zero fraction 0.997. |
| Status sequence | `Rendering and creating a 24-bit WAV…` → `Loading the MP3 encoder (LAME)…` → `Creating MP3…` |
| Requests after the Export click | 10, all from the page origin, plus 1 `blob:` (the LAME worker). 0 third-party, 0 `unpkg`/`ffmpeg` URLs, 0 navigations. |
| Workers | `page.workers()` is 0 before, and 0 blob workers 2 s after the export |
| Page errors | 0 (the only console errors are the known cloud cart errors) |

**Joint stereo.** Every audio frame has channel mode `01`, joint stereo, which is LAME's default for stereo at 320 kbps. It is still 2-channel stereo. C's MP3-REAL row says "stereo", so C/B should accept joint stereo explicitly or rule on it. A did not force plain stereo: the ruled config has no such option.

**Not run by A** (C's rows): MP3-CANCEL, MP3-BOTH, MP3-RANGE, DIALOG-COPY's line measurement, the PROD server rows, PERF-RUN-218, G218-3 and STUDIO-SMOKE-218.

## 4. Production bundle (`npm run build` rc 0; log `a-round-218/build.log`)
The module source has not changed since this build; only the test and the doc changed afterwards.

| Chunk | Raw | Gzip |
|---|---|---|
| `build/client/assets/mp3-encoder.client-D2bNsprj.js` (the only chunk with mediabunny/LAME/`WebAssembly`/`registerEncoder`) | 687,512 B | 227,410 B (`gzip -9`; Vite reports 227.06 kB) |

- The total is far below the ≤ 1 MiB budget.
- `studio-lab-BgXhQ6m3.js` matches "mediabunny" only inside the `mp3FormatNote` text.
- **Manifest deviation:** `build/client/.vite/manifest.json` **does not exist** in this build, because the Remix Vite plugin does not keep it. I used Remix's `build/client/assets/manifest-f8812613.js` instead:
  - the `routes/studio-lab` module + its 17 `imports`, the root and the entry: `staticHasEncoder false`;
  - the only reference is `import("./mp3-encoder.client-D2bNsprj.js")` in `studio-lab-*.js`, through `__vite__mapDeps`;
  - evidence: `a-round-218/manifest-check.txt`.

  B and C need to use the same method.

## 5. Code review (code-reviewer subagent, run for real; score 8.5/10)
**Fixed in the owned files:**
- **Medium:** there was no test for a reset while `Conversion.init` is pending. Added a ME3(b) row, red-proven by mutant (f).
- **Low:** the init-reject → dispose path was untested. Added to ME7.
- **Low:** ME9's context assertion could match the type-only `typeof import`. It now uses a `(?<!typeof\s)` runtime-import regex.
- **Low:** the ME8 title claimed more than it tests. Reworded: our code does not read the Blob, and the fake `BlobSource` does not read either.
- **Low, doc 170:**
  - the cancel error type (`ConversionCanceledError` or a reset Error);
  - the upstream `registered` flag is set before `registerEncoder`, so a real failed registration cannot be retried and the user must reload;
  - why `exportCancelledEncoder` is still true (the LAME worker is created per Conversion);
  - the microtask before registration is mainly a test window;
  - a CSP `worker-src blob:` TODO.

**Not fixed (for B):**
- **Low:** the post-execute generation check (l.67) is untested. The fake's `cancel()` always rejects `execute`.
- **Low, product copy:** the UI copy names libraries ("LAME (mediabunny)"). B ruled this exact text.

**Architecture note (for B/root; not a task):**
> `mp3EncoderGeneration` and `mp3EncoderRuns` are module-wide, so `resetArrangementMp3Encoder()` cancels every in-flight encode, whoever started it. That is safe only because `ArrangementContext.tsx:3399` allows one export at a time. Keep it for 16a. Before 16b moves `StudioContext` → `utils/ffmpeg.ts` onto this encoder, either scope cancellation per caller (a per-call signal) or document the single-consumer invariant and test that one consumer's reset does not cancel another's encode.

## 6. Known gaps and what C should check first
1. **MP3-CANCEL.** In A's runs the encode took about 4 s in total, so cancelling during `Creating MP3 · N%` may need the three-clip project. A did not measure the post-cancel worker count; mediabunny's `close()` → `terminate()` is assumed.
2. **The dev re-optimise reload.** It already happened once on this server, so C will probably not see it again. A's run-1 log is the evidence (an info finding for 16b).
3. **PROD-BUNDLE.** Use Remix's `manifest-*.js` (§4), not `.vite/manifest.json`, which is absent.
4. **Joint-stereo ruling.** See §3.
5. **Not run by A.** The full suite, `npm run verify`, the e2e smoke and the perf spec are gate or C rows.

## 7. Acceptance criteria A truly passed (A side only)
- §1.1 API kept, §1.3 imports (ME9), §1.4 registration (ME1, mutant b), §1.5 config and no full-size copy (ME4–ME8, mutants a/c), §1.6 reset, cancel and stale (ME3 a–d, mutants e/f) and §1.7 strings plus the L23 grep.
- Scope checks, typecheck, lint and the 8 covering files.
- A's real-browser smoke at both viewports (header, frame count, duration, RMS, no third-party requests, 0 blob workers).
- Bundle ≤ 1 MiB gzip and dynamic-only (method deviation in §4).
- Doc 170: 7 headings in order; l.4 byte-exact; the bundle numbers above; cites only existing rows.

The whole PERF-16 is **not** complete: 16b remains, and C round 218 has not run yet.
