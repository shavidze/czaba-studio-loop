# A — Round 86 report (X1 + R0 + SRW-20 stage 2: MP3 and WAV + MP3)

Implementer: A (Claude Opus 5.5) · 2026-10-22 · Status: **implemented, waiting for C** (not marked done). Step checkpoints: `a-round-86/checkpoint-log.md`.

## Baseline (verified before the first edit)
- HEAD `51e024af0defc5d1774a693c7d003e4dc685299d`; `git status --short` printed 0 lines.
- Frozen list 487/487 OK.
- The 7 snapshot hashes matched (`0ccff44e`, `278b2b32`, `e5da2ea6`, `8bebf55e`, `c313ea26`, `779fff1e`, `ffmpeg.ts 0995ae78`).
- Protected files 4/4 matched `protected-baseline.json`.

## Changed files (end state: 6 M + 4 ??; hashes in `a-round-86/end-hashes.txt`; LF only, CR=0)
| File | Change |
|---|---|
| `vite.config.ts` (M) | Only the `optimizeDeps.exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util']` block, placed after `ssr`. |
| `app/components/arrangement/ArrangementExportDialog.tsx` (M) | **X1:** project radio is `disabled={isRendering}`. The range radio gets `aria-describedby` only when there is no valid range; it points to the `useId()` id on the reason span.<br>**R0:** uses `arrangementRangeRenderWindow`; the local constant and checks are removed.<br>**M1:** format radios WAV / MP3 / WAV + MP3 with testids, labels and notes. `UNAVAILABLE_REASON` and `unavailableOptions` are removed. The format resets to WAV in the same close effect as `scopeChoice`. Format radios are never disabled. The button text follows the format. The click dispatches `exportWav`, `exportMp3` or `exportMp3(w, { includeWav: true })`. |
| `app/contexts/ArrangementContext.tsx` (M) | The `exportWav` window check now calls `isValidArrangementRenderWindow`; nothing else in `exportWav` changed. New `export const ARRANGEMENT_MP3_ENCODER_LOAD_TIMEOUT_MS = 120_000`. `exportMp3` is added to the type, as a `useCallback([])`, to the value object and to the deps array. |
| `app/lib/arrangement/render-window.ts` (??) | R0: `ARRANGEMENT_RENDER_WINDOW_MIN_SECONDS`, the strict `isValidArrangementRenderWindow`, and `arrangementRangeRenderWindow`. Uses `import type` only. |
| `app/lib/arrangement/__tests__/render-window.test.ts` (??) | RW1, RW2. |
| `app/lib/arrangement/__tests__/export-mp3.test.tsx` (??) | MX1–MX11. Mocks `~/utils/ffmpeg`, `renderArrangementWav`, `video.client` (so the decoding guard is the real one) and `@ffmpeg/ffmpeg` (a stub class, so no type assertion is needed). |
| `app/lib/arrangement/__tests__/export-dialog-focus.test.tsx` (M) | Grant used: only C-R14-02. Retitled "keeps X → WAV → MP3 → WAV + MP3 → project scope → დახურვა → WAV-ის ექსპორტი … (C-R14-02)". It now has a 7-control cycle found by testid; the wrap assertions are unchanged. |
| `app/lib/arrangement/__tests__/export-range-ui.test.tsx` (M) | Grant used: only the two XU5 tests. Disabled states are now `[false,false,false,true]` with the new labels; the `UNAVAILABLE_REASON` constant is removed; the Tab list gains MP3 and WAV + MP3. XU1–XU4 are untouched and green.<br>**Note for B:** I also changed the first XU5 test's title, from "MP3 and video stay disabled…" to "WAV, MP3 and WAV + MP3 are enabled, video stays disabled…". The old title would describe the opposite of what the test asserts. The grant names a retitle only for C-R14-02; if B wants the old title back, only the title line changes. |
| `docs/implementation/2026/quarter-IV/075-…header-stacking.md` (M) | Only l.4, set to the exact required string. |
| `docs/implementation/2026/quarter-IV/076-studio-lab-mp3-export.md` (??) | New Georgian doc in the TEMPLATE sections, status `Round 86 — იმპლემენტირებულია, C-ის შემოწმებას ელოდება (D-29z51)`. |

Untouched: `app/utils/ffmpeg.ts` (`0995ae78`), `StudioContext.tsx`, all protected and auth files, and every other frozen file (487/487 OK at the end).

## What the 120 s timer covers (spec step 3)
- `await import('~/utils/ffmpeg')` and `loadFFmpeg()` are in the same `try`. An import failure therefore gives the load-failure message.
- The 120 s `Promise.race` covers **only `loadFFmpeg()`**, as the spec says. The timer is cleared in `finally`.
- The import and the conversion are not time-bounded (reviewer L3; planned for stage 3).

## Vite restart (FFMPEG-DEV-WORKER)
- Edit made at 2026-10-22T15:24:02Z. Polls: 15:24:03Z 200, 15:24:06Z 200, 15:24:08Z 200. The first request after the edit returned 200 at 15:24:03Z.
- The dev-server log was not visible to A, so the in-process restart itself was not observed directly.
- The fix itself was observed: in the Playwright smoke the worker loaded and the encoder finished. Before the fix, B's probe showed the load never settled.

## Tests actually run (speed rules: no full suite)
- `npm run typecheck`: clean.
- `npm run lint`: 0 errors, 218 warnings, 1 info. Gate 85 also had 218 warnings; none of these are in owned files.
- Scoped `npx biome check` on the 7 owned TS/TSX files: clean, no writes. `vite.config.ts` is outside Biome's `includes`.
- Targeted vitest (`a-round-86/targeted-list.txt`): **61 files / 1086 tests pass** (`a-round-86/targeted.log`, final run after the review fixes). The 61 files are the new and granted tests, `export-range.test.ts`, `graph.test.ts`, and every test that imports `ArrangementExportDialog`, `contexts/ArrangementContext` or `StudioWorkspace`.
- Before the granted test edits, exactly C-R14-02 and the two XU5 tests failed. `context-hygiene` and `render-budget` stayed green.

### Mutation proofs
Run in the scratch copy `a-round-86/mut/store` (rsync of the store without node_modules and .git; node_modules symlinked; `store/` itself was never mutated). Script: `a-round-86/scripts/mutate.py`. Summary: `a-round-86/mut/summary.txt`. Every mutation turned tests red:

| Mutation | Red tests |
|---|---|
| (a) no timeout race | MX6 |
| (b) WAV downloaded before conversion | MX5, MX6, MX7 |
| (c) MP3 filename ignores the range | MX3, MX4 |
| (d) format not reset on reopen | MX1 |
| (e) project radio disabled again | MX11, C-R14-02 |
| (f) `aria-describedby` removed | MX11 |
| (g) strict check normalises inverted windows | RW1, XU4 |
| (h) `loadFFmpeg` on dialog open | MX2, MX6, MX8, MX10 |
| (i) bitrate argument | MX2, MX4 |
| (j) timer not cleared — added after the review | MX2 |
| (k) WAV file gets the MP3 blob — added after the review | MX4 |

### Repo-wide check outside `app/`
I searched for `arrangement-export-format|ამ ეტაპზე ხელმისაწვდომი|arrangement-export-scope|WAV-ის ექსპორტი` (plus `Export` in `e2e/`) in every directory outside `app/`, `docs/`, `node_modules/` and `build/`. There were no hits, so no e2e spec asserts the dialog as it was in round 85.

### Literal-string check
Every label, note, button text, message and filename in spec §1 was checked against the source: all appear verbatim.

## A's own Playwright smoke (1440×900, :5173 — not C evidence)
Files: `a-round-86/pw/smoke.cjs`, `smoke-output.json`, screenshot `a-r86-dialog-mp3-1440.png`. State file: `a-browse.json`.
- **Steps:** warm-up load, add a clip by double-clicking a library item, then Export → MP3 → `MP3-ის ექსპორტი`.
- **Download:** `czaba-studio-lab.mp3`, 3,291,117 bytes (deleted after measuring).
- **Timing:** first export 6168 ms from click to download, including the encoder load from unpkg; a second export in the same page took 1411 ms.
- **Network:** no unpkg request before the click. After it, only `ffmpeg-core.js` and `ffmpeg-core.wasm`, and the wasm was requested once across both exports.
- **Status messages seen:** encoder loading → `MP3-ის შექმნა…` → `MP3 შეიქმნა: 01:41.352, 48 kHz · stereo.`
- **File header:** MPEG-1 Layer III, 48 kHz, stereo, with a **Xing (VBR) tag**; the first frame is 320 kbps.
- **Decode:** the page's decodeAudioData gives 101.352 s, 2 channels, 48 kHz.
- **Console:** no non-noise console errors, no hydration warning.

## Code review (actual `code-reviewer` subagent, 8.5/10, no Critical or High)
**Fixed in owned test files:**
- **M1:** clearing the timer was untested. MX2 now spies on `setTimeout`/`clearTimeout` and asserts the 120 s timer id is cleared (mutation j).
- **L5:** MX11 now switches the format to MP3 while a WAV render is pending, and asserts that only the `-range.wav` downloads and the encoder is never loaded.
- **L6:** the MX7 `both` branch now checks the exact message and that no object URLs were created. MX4 now checks the object-URL blob order `[renderedBlob, mp3Blob]` (mutation k).

**Reported, not changed** (outside this round, or behaviour the spec requires):

| ID | Finding | Where it goes |
|---|---|---|
| L1 | "Dynamic import only" is verified by grep, not by a test. Only `typeof import` and `await import` appear in `ArrangementContext.tsx`. | Covered by C's MP-NET. |
| L2 | If the component unmounts while the encoder loads or converts, files can still download later (`exportWav` has the same pattern). | Stage 3 cancel/abort. |
| L3 | The timeout does not cover the import or the conversion. | Stage 3; doc 076 TODO. |
| L4 | `optimizeDeps.exclude` also changes the dev module graph of the protected purchased Studio (dev only, not production). Purchased-Studio MP3 in dev was not checked. | Doc 076. |
| L7 | The range reason sits inside the `<label>` and is also `aria-describedby` (the spec requires both), so it may be read twice. Moving the span out of the label is an option for later. | Later option. |
| L8 | The no-sound and master-mute notes still say "WAV შეიქმნება" for MP3 formats. The spec keeps these texts unchanged. | Copy debt for B. |
| L9 | Each retry after a timeout leaks a 100 ms poller in the frozen util. | FFMPEG-LOAD-POLLER-HANG. |

**Architecture note (verbatim from code-reviewer; a proposal for B/root, not acted on):**
> Signal 1 (duplication): `ArrangementContext.tsx` l.2714–2735 repeats the guard block at l.2662–2683, l.2810–2818 repeats the anchor download at l.2689–2696, and l.2819–2821 repeats the length string at l.2697–2699. Signal 4 (new lifecycle in an existing owner): a timer lifecycle now lives in the context (l.2760). Signal 3 (repeated costly change): the export region changed in rounds 85 and 86, and stage 3 will add abort and progress state to it. My proposal: keep it as is for now. No audio-timing, gesture or Undo invariants are affected, and `useCallback([])` keeps the public `useArrangement()` shape stable. Before stage 3, give the planner one bounded task: move the render → encode → download steps into a pure `app/lib/arrangement/export-pipeline.ts`, which takes blobs and options and returns filenames, message and warning. The ref-reading guards would stay in the context, and MX2–MX9 would re-target it. Cost is medium (the mocks move) and risk is low. This is a proposal for the planner, not an instruction.
> Alternative: a pure `loadArrangementEncoderWithTimeout(importer, ms)` helper returning `'loaded' | 'failed' | 'timeout'` that owns the timer; it becomes worth it in stage 3 when cancel/progress must also cover the import and the conversion.

## B acceptance that A actually passed (unit level; no browser row is claimed)
- **Done:** X1 (MX11 + C-R14-02); R0 (RW1, RW2, XU4 green); M1 (MX1); M2 (MX2–MX10); the vite block; doc 075 l.4; doc 076; mutation proofs (a)–(i) plus (j) and (k); the targeted list; the code-review step.
- **Browser rows belong to C:** X1-PROJECT, all MP-* rows, REG-HYD, G86-3. A's smoke shows only that the MP-MP3 happy path works at 1440×900.
- **Not checked by A:**
  - the MP3-vs-WAV correlation and lag (HR-MP3-ORACLE);
  - MP-CDNFAIL and MP-TIMEOUT in a real browser;
  - the 1280×720 viewport;
  - production-build MP3 (no preview server in the cloud; A did not run `npm run build`, which is a gate row).

## Known gaps
- The header shows VBR (Xing). The UI does not claim 320 kbps; this is a conscious difference from Live's CBR 320.
- Close stays disabled while the encoder loads, for up to 120 s (the existing `isRendering` rule). Cancel comes in stage 3.
- After a timeout, a retry in the same page can hang again because the frozen util stays in its loading state. The timeout message tells the user to reload the page.

## Exact next C checks
1. **SOURCE-UNCHANGED:**
   - HEAD `51e024a`.
   - `git status --short` shows the 10 entries (6 M + 4 ??).
   - `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-85-r86-tree-sha256.txt` → 487/487.
   - `ffmpeg.ts` = `0995ae78`.
   - Protected 4/4.
   - Owned files match `a-round-86/end-hashes.txt`.
2. **T86-TARGETED:** `npx vitest run $(cat ../tmp/studio-real-loop/a-round-86/targeted-list.txt)` → 61 files / 1086 tests pass.
3. **Browser rows from task §5, at both viewports:**
   - **X1-PROJECT:** `aria-describedby` resolves to the reason id; the project radio is reachable by Tab.
   - **MP-FORMAT**
   - **MP-MP3:** HR-MP3-ORACLE lag and correlation; expect a Xing (VBR) header.
   - **MP-RANGE**
   - **MP-BOTH:** also note whether Chromium shows a multiple-downloads prompt.
   - **MP-WAV-UNCHANGED**
   - **MP-CDNFAIL**
   - **MP-TIMEOUT** (1440 only): the timer starts after the render and the import, so expect the timeout message about 120 s after the encoder-loading message appears.
   - **MP-REUSE:** A saw one wasm request.
   - **MP-OVERLOAD**
   - **MP-MUTE**
   - **MP-KEYS**
   - **MP-X3**
   - **MP-NET**
   - **REG-HYD**
   - **G86-3**
4. Optional: re-run the mutations with `python3 -I a-round-86/scripts/mutate.py`; it writes only under `a-round-86/mut/`.

## Scope
Only the files in the §1 table were edited. No commits, pushes, installs, server starts or stops, `--write` formatting, stash or reset, and no edits to protected or frozen files.
