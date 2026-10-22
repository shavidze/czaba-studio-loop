# CURRENT TASK — Round 86: X1 = C-R85-L2 + GATE85-S2 (Export scope radios) + SRW-20 stage 2 — MP3 and WAV + MP3 (R20-X2, R20-X3 re-check) (D-29z51)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-22
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, plus the LOOP POLICY, Loop v2, cloud-runner and speed rules in your prompt. Those rules win over older text.
- **Previous task:** `tasks/round-85.md` (exact copy; sha256 `7b5037d3…`). Rationale: `b-round-85.md`. Decision record: D-29z51 in `docs/technical/studio-real-workspace/plan.md`.
- **Round size:** first **X1** (two Low findings on the same two scope radios, fixed under the same frozen-test grant that MP3 needs anyway), then **one feature stage, SRW-20 stage 2** (MP3 and WAV + MP3). The small `render-window.ts` helper and the `vite.config.ts` line are prerequisites of stage 2, not separate work. One owner (A).
- **SRW-20 stages, nothing deferred or shrunk:** stage 1 range export — **C PASS, published `51e024a`**; **stage 2 (this round)** MP3 + WAV + MP3 with a clear error and no file when the encoder cannot load (R20-X2) and a re-check of R20-X3; stage 3 encoding off the main thread with progress and cancel on a 5-minute project (R20-X4).

## Why this round
- **C round 85: PASS, `browserVerified=true`, `realVerified=true`** (17 rows, both viewports). Gate 85 published `51e024af0defc5d1774a693c7d003e4dc685299d` to both remotes. C-R84-M1 is closed. XR-PASTEND is not reachable from the UI (unit XR4 covers it). The fake-Bearer 403 sub-check stays BLOCKED (backend unavailable in cloud).
- **C bugs (both Low), handled first:**
  - **C-R85-L2** — with no valid range the project scope radio is checked **and disabled**. A did that only to keep the frozen C-R14-02 test (exactly 4 enabled controls). Enabling MP3 needs that same test amended, so the project radio is fixed in the same grant → **X1**. The gate-85 reviewer's #2 (the disabled range radio's reason is not linked for screen readers) is on the same element → also **X1**.
  - **C-R85-L1** — Escape does not cancel a clip drag. **Ruled not a contract** (D-29z51 R1): "then Escape" in the round-85 M1-GHOST row was B's assumption; no pointer gesture in the workspace cancels on Escape; Live behaviour is unconfirmed; the user never asked for it. Recorded as signal ESCAPE-CANCEL-GESTURE. **Not part of this round.**
- **B experiment (`b-round-85/probe/PROBE-SUMMARY.md`) — confirmed fact:** under the Vite dev server the ffmpeg.wasm worker (`node_modules/.vite/deps/worker.js`) fails with `ERR_FAILED` and `loadFFmpeg()` **never settles** (no reject), so an MP3 export would hang forever. A scratch Vite 5.4.21 with `optimizeDeps.exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util']` loaded the core from unpkg in 3.2 s; the same scratch without the exclude (control) reproduced the failure. **Inference (C confirms):** the same exclude in `store/vite.config.ts` fixes `/studio-lab`. unpkg.com is reachable from the runner's Chromium.
- No Critical/High C bug is open. **Regression round:** `regression-last.json` = 2026-10-21 → due on/after **2026-10-24**; not due today (2026-10-22).

## Baseline (measured by B, 2026-10-22)
- **HEAD `51e024af0defc5d1774a693c7d003e4dc685299d`** (gate 85). `git status --short` prints **0 lines**.
- **Frozen list:** `../tmp/studio-real-loop/b-round-85-r86-tree-sha256.txt`, **487** entries, **487/487 OK** (`cd store && sha256sum -c --quiet ../tmp/studio-real-loop/b-round-85-r86-tree-sha256.txt`). It covers every tracked and untracked `app/**` and `docs/implementation/**` file except the 5 owned existing files below. Frozen examples: `app/utils/ffmpeg.ts`, `graph.client.ts`, `schedule.ts`, `StudioWorkspace.tsx`, `ArrangementLane.tsx`, `master-ui.test.tsx`, `export-dialog-focus-restore.test.tsx`, `export-range.test.ts`, `graph.test.ts`, `clip-fades.test.ts`, `clip-gain.test.tsx`, `track-pan.test.tsx`.
- **Snapshots:** `../tmp/studio-real-loop/b-round-85-r86-snapshots/` (`SHA256SUMS.txt`). All LF, CR=0:

  | File | sha256 prefix | lines |
  |---|---|---|
  | `app/components/arrangement/ArrangementExportDialog.tsx` | `0ccff44e` | 411 |
  | `app/contexts/ArrangementContext.tsx` | `278b2b32` | 3107 |
  | `app/lib/arrangement/__tests__/export-dialog-focus.test.tsx` | `e5da2ea6` | 674 |
  | `app/lib/arrangement/__tests__/export-range-ui.test.tsx` | `8bebf55e` | 497 |
  | `docs/implementation/2026/quarter-IV/075-studio-lab-range-export-and-header-stacking.md` | `c313ea26` | 118 |
  | `vite.config.ts` | `779fff1e` | 26 |
  | `app/utils/ffmpeg.ts` (frozen, reference only) | `0995ae78` | 123 |

- **Protected files:** 4/4 OK (`protected-baseline.json`). The auth files are never touched. `app/utils/ffmpeg.ts` is imported by the protected purchased Studio (`StudioContext.tsx`), so it is **frozen**: do not edit it.
- **Servers:** `:5173/studio-lab` returns 200 (`env-status.json`). Backend `:5199` unavailable, as expected. Never start or stop servers (see the `vite.config.ts` note in §1 for the automatic restart).
- **Do not change the repository state:** never stash, reset, checkout, clean or re-create anything; a mismatch (another HEAD, non-empty status, a changed frozen file) means stop and report; never run `biome check --write`, `format --write`, `npm run format` or `check:fix` (format new files through stdin to stdout); run mutation proofs in a scratch copy (`a-round-86/mut/`), never in `store/`.

## 1. What changes (A)

### Today (B read the source at `51e024a`)
- `ArrangementExportDialog.tsx`: the WAV format radio is `checked readOnly` with no state (l.205–211); MP3 is a disabled entry in `unavailableOptions` with `UNAVAILABLE_REASON` (l.16–18, 228–239); the video option is disabled with `VIDEO_RENDER_REASON` (l.240–246). The scope radios (l.253–307) are both `disabled={!hasValidRange || isRendering}`; the range reason span has a testid but no id. The window rule is local (`EXPORT_RANGE_MIN_SECONDS`, l.22, 71–78). The export button is always `WAV-ის ექსპორტი` and calls `exportWav` (l.396–405). `scopeChoice` resets to null in an effect when the dialog closes (l.119–123).
- `ArrangementContext.tsx`: `exportWav(renderWindow?)` (l.2654–2711) has the guards (Web Audio, empty project, video sound decoding), then an inline window check with the literal `0.001`, then render → download → message. It is exposed in the context type (l.315) and in the value objects (l.2929, l.3024).
- `app/utils/ffmpeg.ts` (frozen): `loadFFmpeg()` loads the core from `https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm` (~31 MB wasm) and caches the instance; a concurrent caller polls `isLoaded` forever if the first load fails, and a load whose worker never starts never rejects. `convertWavToMp3(wavBlob, bitrate = '320k')` runs `-codec:a libmp3lame -b:a 320k -q:a 0` (with `-q:a` LAME runs in VBR mode, so the result is not guaranteed CBR) and returns an `audio/mpeg` Blob.
- Frozen tests that lock this dialog: `export-dialog-focus.test.tsx` C-R14-02 (l.531–563: exactly X → format radio → დახურვა → WAV-ის ექსპორტი enabled), `enabledFormatRadio` (l.204: the first enabled radio), the render-time focus tests (l.435–491: focus stays on the WAV radio while rendering, so **the format radios must not become disabled while rendering**), `export-dialog-focus-restore.test.tsx` HD1–HD3, `master-ui.test.tsx` DONE_MESSAGE, `export-range-ui.test.tsx` XU1–XU5 (XU4 rejects an **inverted** window `{9, 4}` in `exportWav`). The button name `WAV-ის ექსპორტი` is looked up in about six test files.

### X1 — C-R85-L2 + GATE85-S2 (first)
- The **project** scope radio is enabled whenever no export is rendering (`disabled={isRendering}`), and checked whenever the range scope is not active.
- The **range** scope radio keeps `disabled` when there is no valid range (or while rendering). When there is no valid range, it carries `aria-describedby` pointing to the reason span; give that span an `id` from React `useId()` (keep its testid). With a valid range the radio has no `aria-describedby`.
- Nothing else about the scope radios changes (labels, defaults, reset on close, round-85 texts).

### R0 — shared render-window rule (prerequisite; GATE85-S3)
New pure module `app/lib/arrangement/render-window.ts` (no DOM, no client-only imports; the type comes from `graph.client.ts` by `import type`):
- `ARRANGEMENT_RENDER_WINDOW_MIN_SECONDS = 0.001`;
- `isValidArrangementRenderWindow(window)` — **strict**: finite start and end, `start >= 0`, `end − start >= 0.001`. An inverted window is invalid (XU4 must stay green).
- `arrangementRangeRenderWindow(range)` — for the dialog: `null`/`undefined` → `null`; otherwise `{ start: min, end: max }` if that passes the strict check, else `null`.
- The dialog uses `arrangementRangeRenderWindow` (replacing its local constant and checks); `exportWav` and `exportMp3` use `isValidArrangementRenderWindow`. Messages stay byte-identical.

### SRW-20 stage 2 — MP3 and WAV + MP3 (R20-X2)
**Dialog (M1):**
- Format radios, `name="arrangement-export-format"`, in this DOM order: **WAV** (unchanged label `WAV · 24-bit · 48 kHz · stereo` and its unchanged graph note), **MP3** (`data-testid="arrangement-export-format-mp3"`, label `MP3 · 48 kHz · stereo`, note `LAME (ffmpeg.wasm) — encoder პირველ MP3 ექსპორტზე CDN-იდან იტვირთება (~31 MB)`), **WAV + MP3** (`data-testid="arrangement-export-format-both"`, label `WAV + MP3 · ორი ფაილი`, note `იგივე მიქსი ორ ფაილად — ან ორივე შეიქმნება, ან არცერთი`), then the **unchanged disabled video option**. Give the WAV radio `data-testid="arrangement-export-format-wav"`.
- `UNAVAILABLE_REASON` and `unavailableOptions` are removed (nothing is "not available at this stage" any more except video, which keeps its own reason). The round-84 video-fades line is unchanged.
- **Default WAV on every open** (reset on close, in the same place as `scopeChoice`). The format radios stay **enabled while rendering**; a change during a render does not affect the running export.
- Export button text: WAV → `WAV-ის ექსპორტი` (byte-identical), MP3 → `MP3-ის ექსპორტი`, WAV + MP3 → `WAV + MP3 ექსპორტი`; while rendering `მიმდინარეობს…` (unchanged). Disabled conditions unchanged.
- Click: WAV → `exportWav(window?)` exactly as today; MP3 → `exportMp3(window?)`; WAV + MP3 → `exportMp3(window?, { includeWav: true })`. The window is passed only in range scope (as in round 85).
- Scope texts (description, loop/no-sound/master-mute notes) stay as in round 85 for every format.

**Context (M2) — `exportMp3(renderWindow?: ArrangementRenderWindow, options?: { includeWav?: boolean }): Promise<void>`**, added to the context type and both value objects:
1. The same three guards as `exportWav`, in the same order and with the same messages; then the strict window check with the same `მონაკვეთი არასწორია — ფაილი არ შეიქმნა.` message. No render, no encoder load, no download on any of them.
2. `phase: 'rendering'`, message `რენდერი და 24-bit WAV-ის შექმნა…`; render with the unchanged `renderArrangementWav` (2 arguments without a window, 3 with one).
3. Message `MP3 encoder იტვირთება (ffmpeg.wasm, პირველად ~31 MB)…`; `await import('~/utils/ffmpeg')` (**dynamic import only**; no static import, nothing loaded at mount or on WAV export), then `loadFFmpeg()` raced against `ARRANGEMENT_MP3_ENCODER_LOAD_TIMEOUT_MS = 120_000` (exported constant; clear the timer when the race settles).
   - load rejects (or the dynamic import fails) → `phase: 'error'`, message exactly `MP3 encoder ვერ ჩაიტვირთა (ffmpeg.wasm, unpkg CDN) — ფაილი არ შეიქმნა. შეამოწმე ინტერნეტი და სცადე თავიდან, ან აირჩიე WAV.`
   - timeout → `phase: 'error'`, message exactly `MP3 encoder 120 წამში ვერ ჩაიტვირთა — ფაილი არ შეიქმნა. გადატვირთე გვერდი და სცადე თავიდან, ან აირჩიე WAV.` (A hung load keeps the frozen util in its loading state, so a retry in the same page can wait again; the message says to reload. This is honest, not a fix of the util.)
4. Message `MP3-ის შექმნა…`; `convertWavToMp3(wavBlob)` with **one argument** (the util's default). A rejection → `phase: 'error'`, message `MP3-ის შექმნა ვერ მოხერხდა — ფაილი არ შეიქმნა. {error.message}` (same shape as the existing render error).
5. **Both or none.** Downloads happen only after the MP3 Blob exists: with `includeWav`, first the WAV (`czaba-studio-lab.wav` / `czaba-studio-lab-range.wav`, the rendered Blob unchanged), then the MP3; otherwise only the MP3. MP3 names: `czaba-studio-lab.mp3` / `czaba-studio-lab-range.mp3`. Use the existing anchor + `revokeObjectURL` pattern for each file.
6. Done message, with `{len}` built exactly as the WAV message builds it (`მონაკვეთი {a} — {b} ({x} წმ)` or the project length) and the existing master-mute suffix:
   - MP3: `MP3 შეიქმნა: {len}, 48 kHz · stereo.{suffix}`
   - WAV + MP3: `WAV და MP3 შეიქმნა: {len}, WAV 24-bit · 48 kHz · stereo, MP3 48 kHz · stereo.{suffix}`
   - The overload warning comes from the WAV render's `peak` / `clippedSamples` through the existing `formatExportOverloadWarning`.
7. Any other render failure → the existing `ექსპორტი ვერ მოხერხდა — ფაილი არ შეიქმნა. {msg}` message. Never a "done" state without a file.
- `exportWav` behaviour, messages, filenames and the 2-argument call stay byte-identical (only its window check now calls the helper).

**Build config (FFMPEG-DEV-WORKER):** in `vite.config.ts` add exactly
```ts
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
  },
```
inside `defineConfig({ … })` (after `ssr`), nothing else. Vite restarts the dev server by itself when its config changes. Do not start or stop anything. After the edit, poll `http://127.0.0.1:5173/studio-lab` for up to 120 s; if it does not return 200, **stop and report** (environment, root). Record in `a-round-86.md` the restart time and the first request that returned 200.

**Docs:**
- **doc 075 l.4** → exactly:

    ```text
    **სტატუსი:** Round 85 — C PASS (`browserVerified`), გამოქვეყნდა `51e024a`
    ```

  No other change to doc 075.
- New doc `docs/implementation/2026/quarter-IV/076-studio-lab-mp3-export.md` (Georgian, TEMPLATE sections). Status `Round 86 — იმპლემენტირებულია, C-ის შემოწმებას ელოდება (D-29z51)`. Record: X1; the render-window helper; the format radios; the `exportMp3` flow, messages and timeout; both-or-none; the dev-worker cause and the `optimizeDeps` fix (cite B's probe); why `ffmpeg.ts` stays frozen (FFMPEG-LOAD-POLLER-HANG); VBR vs Live's CBR 320 and the leading silence; production build MP3 not verified in the cloud; stage 3 plan; and that the dialog's Close stays disabled while the encoder loads (up to 120 s, the existing `isRendering` rule) until stage 3 adds cancel.

### Files (exact grants)
| File | Grant |
|---|---|
| `vite.config.ts` | the `optimizeDeps.exclude` block only |
| `app/components/arrangement/ArrangementExportDialog.tsx` | X1, R0 use, M1 |
| `app/contexts/ArrangementContext.tsx` | `exportWav` window check via R0; new `exportMp3` + its type, constant and value-object entries. Nothing else |
| `app/lib/arrangement/render-window.ts` | **new** (R0) |
| `app/lib/arrangement/__tests__/render-window.test.ts` | **new** |
| `app/lib/arrangement/__tests__/export-mp3.test.tsx` | **new** (dialog + context; `~/utils/ffmpeg` and `renderArrangementWav` mocked) |
| `app/lib/arrangement/__tests__/export-dialog-focus.test.tsx` | **frozen-test grant:** only the C-R14-02 test (l.531–563), its body **and its `it()` title** (retitle it to the new order): the expected cycle becomes X → WAV radio → MP3 radio → WAV + MP3 radio → project scope radio → დახურვა → WAV-ის ექსპორტი (no range in that mount). Keep its wrap assertions. Nothing else in the file |
| `app/lib/arrangement/__tests__/export-range-ui.test.tsx` | **frozen-test grant:** only the two XU5 tests (l.433–497): format disabled-state/labels become `[false, false, false, true]` with the new labels, the `UNAVAILABLE_REASON` constant may go, and the tab list gains the MP3 and WAV + MP3 radios. XU1–XU4 must stay unchanged and green |
| `docs/implementation/2026/quarter-IV/075-…header-stacking.md` | l.4 only |
| `docs/implementation/2026/quarter-IV/076-studio-lab-mp3-export.md` | **new** |

Expected end state: **6 M + 4 ??**. Everything else is frozen (the 487-entry list, plus `vite.config.ts` outside the block). If any other frozen test turns red, **stop and report**; do not edit it.

### Required tests (behavioural; IDs for C to cite)
`render-window.test.ts`:
- **RW1** strict validity: valid `{4, 9}`, `{0, 0.001}`; invalid every XU4 window (`{5,5}`, `{5,5.0005}`, `{9,4}`, `{-1,4}`, `{0,∞}`, `{NaN,4}`).
- **RW2** range → window: `null`/`undefined` → null; `{9, 4}` → `{4, 9}`; `{5, 5.0009}` → null; NaN/negative → null; the constant is 0.001.

`export-mp3.test.tsx` (workspace or provider + dialog harness like `export-range-ui.test.tsx`; `vi.mock('~/utils/ffmpeg')` with controllable `loadFFmpeg` / `convertWavToMp3`; anchor-click spy for filenames):
- **MX1** formats: WAV checked by default with the unchanged label; MP3 and WAV + MP3 enabled with the exact labels/notes; video disabled with its unchanged reason; the text `ამ ეტაპზე ხელმისაწვდომი არ არის` is absent; button text per format; close + reopen → WAV again.
- **MX2** MP3, project: renderer called once with 2 args; `loadFFmpeg` once; `convertWavToMp3` called with exactly `[renderedBlob]`; downloads `['czaba-studio-lab.mp3']`; exact done message; the overload warning equals `formatExportOverloadWarning` of the mocked peak.
- **MX3** MP3, range 4–9: renderer 3 args `{start: 4, end: 9}`; downloads `['czaba-studio-lab-range.mp3']`; exact range message.
- **MX4** WAV + MP3: one render; downloads exactly `['czaba-studio-lab.wav', 'czaba-studio-lab.mp3']` in that order (and the `-range` pair with a range); exact message.
- **MX5** load rejects: exact load message, `phase: 'error'`, **no download** (MP3 and WAV + MP3), `convertWavToMp3` not called, Close enabled; a second click with a resolving load succeeds.
- **MX6** load never settles (fake timers): still `rendering` at 119 999 ms; exact timeout message at 120 000 ms; no download.
- **MX7** conversion rejects: exact conversion message with the error text; no download (WAV + MP3 included).
- **MX8** guards and invalid window: empty project, video decoding, Web Audio unavailable, and every XU4 window → the same messages as `exportWav`; no render, no `loadFFmpeg`.
- **MX9** master mute: the MP3 and WAV + MP3 messages end with the existing master-mute suffix.
- **MX10** lazy encoder: mounting the workspace, opening the dialog and a WAV export never call `loadFFmpeg` or `convertWavToMp3`.
- **MX11** X1: no range → project radio enabled and checked, range radio disabled with `aria-describedby` equal to the reason span's `id`; with a range both enabled and the range radio has no `aria-describedby`; while rendering both scope radios are disabled and the format radios are not.

### Mutation proofs (scratch copy `a-round-86/mut/`; each must turn at least one listed test red)
(a) no timeout race → MX6. (b) WAV downloaded before the MP3 conversion → MX5/MX7. (c) MP3 filename ignores the range → MX3. (d) format not reset on reopen → MX1. (e) project radio disabled again with no range → MX11 and C-R14-02. (f) `aria-describedby` removed → MX11. (g) strict check normalises inverted windows → RW1/XU4. (h) `loadFFmpeg` called on dialog open → MX10. (i) `convertWavToMp3` given a bitrate argument → MX2.

## 2. Pre-flight for A
- **Primitives:** `AGENT_DISCOVERABLE_CODE.md`, `AUDIO_ARCHITECTURE.md`, `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `REACT_CONTEXT.md`, `API_ERROR_HANDLING.md` (error display), `ERROR_TAXONOMY.md` (no new code required; say so), `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`. Prompts `studio-feature.md`, `new-test.md`; skills `ffmpeg-wasm`, `web-audio-api`.
- **Verify the baseline before the first edit:** HEAD, 0-line status, 487/487, snapshots, protected 4/4, LF/CR.
- **Grep before coding:** every caller of `exportWav`; every test that counts enabled dialog controls or reads `arrangement-export-format` radios, `UNAVAILABLE_REASON` or the MP3 text; every test that renders `ArrangementExportDialog` or mocks `ArrangementContext` values (a new context field may need to exist in hand-built context mocks — if a frozen test builds the context value by hand and breaks, stop and report). B found the sites listed under "Today".
- **Checks (speed rules):** `npm run typecheck`, `npm run lint`, scoped `biome check` on owned files (no `--write`); targeted vitest: the three new files, the two granted tests, `master-ui.test.tsx`, `export-dialog-focus-restore.test.tsx`, `export-range.test.ts`, `graph.test.ts`, and every test that imports `ArrangementExportDialog`, `ArrangementContext` or `StudioWorkspace`. List them in `a-round-86/targeted-list.txt`. Not the full suite.
- **A's own Playwright smoke at 1440×900** (not C evidence; warm-up load; integer coordinates): one MP3 project export after the config restart, confirming the encoder loads and an `.mp3` downloads. Record load time and file size.
- **Code-reviewer** (3+ files) and pass its Architecture note to B verbatim.

## 3. File ownership (exact)
- **A** owns only the §1 Files table. **C** owns `c-round-86*`. **B** owns the planning artifacts. Root owns gates, commits and pushes.
- Protected (never edited): `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx`, `app/lib/__tests__/download-routes.test.ts`, the auth files (`app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `app/lib/firebase.client.ts`), and for this loop `app/contexts/StudioContext.tsx` and `app/utils/ffmpeg.ts`.
- `/studio-lab` stays the public **demo-only** workspace: demo badge, no purchased audio, no token/R2 requests. The only new third-party request is the ffmpeg core from `unpkg.com`, and only after an MP3 export click. User video stays local; nothing is uploaded.

## 4. Ableton source table
**Source:** Live 12 Reference Manual, "Managing Files and Sets", §5.1.3.2 "Encoding Options", `https://www.ableton.com/en/live-manual/12/managing-files-and-sets/`, fetched by B on 2026-10-22 with curl, stored as untrusted text in `b-round-84/web/managing-files.txt` (l.200–236). Live version: 12 (manual).

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| PCM and MP3 can be rendered | §5.1.3.2 Encode PCM / Encode MP3 | Confirmed (text) | Same: WAV and MP3 | MP-MP3 |
| MP3 alone or together with a PCM file | §5.1.3.2 ("on its own or in conjunction with a PCM-based file") | Confirmed (text) | Same idea: format choice WAV / MP3 / WAV + MP3. **Conscious simplification:** one radio instead of two toggles | MP-BOTH |
| MP3 is CBR 320 kbps | §5.1.3.2 | Confirmed (text) | **Conscious difference:** the frozen shared ffmpeg command (LAME, `-q:a 0`) gives VBR; the UI does not claim 320 kbps; C reads the header and reports | MP-MP3 |
| A small amount of silence is added at the start of an MP3 | §5.1.3.2 | Confirmed (text) | Same class of behaviour (LAME encoder delay); not trimmed; C records the lag | MP-MP3 |
| Render range from the time selection applies to every format | §5.1.3.1 | Confirmed (text, round 85) | Same: scope applies to WAV, MP3 and WAV + MP3 | MP-RANGE |
| Clear error and no file when the encoder cannot load | — | Not applicable (Live encodes locally) | CZABA requirement (R20-X2, plan D-11 risk row) | MP-CDNFAIL, MP-TIMEOUT |
| Project scope radio / reason link | — | Not applicable | Generic accessibility | X1-PROJECT |

## 5. C acceptance (real browser, Playwright Chromium on Linux, **both 1440x900 and 1280x720** unless the row says otherwise, `/studio-lab` anonymous, real `page.mouse` and keyboard)
**Setup per session:** check `env-status.json` and that `:5173/studio-lab` returns 200 (the config change restarts Vite once); one warm-up load; demo audio as loaded; no video unless the row says so. **Harness rules:** HR-C-R84-L1 (≤ 1 LSB in WAV comparisons is jitter, report counts); **HR-MP3-ORACLE** — decode MP3s with the page `AudioContext`; compare with the same-state WAV after the best lag (search ±4096 frames at 48 kHz); record the lag and the normalised correlation; never compare MP3 sample-exactly. The 0.99 correlation bound is a B estimate, not a measured value: a result in 0.98–0.99 is reported with the numbers and triaged by B (not a FAIL); below 0.98 is a FAIL. Delete exported files after measuring; keep hashes and stats.

| ID | Action | Pass evidence |
|---|---|---|
| X1-PROJECT (C-R85-L2, GATE85-S2) | No range: open Export; Tab through the dialog; read the accessibility tree / attributes. Then with a 4–9 range | No range: project radio **enabled and checked** and reachable by Tab; range radio disabled; its `aria-describedby` resolves to the reason text. With a range: range default (as round 85), no `aria-describedby` on it |
| MP-FORMAT | Open Export; inspect the format radios; switch each; close and reopen | WAV / MP3 / WAV + MP3 enabled with the exact labels and notes; video disabled with the unchanged reason; no `ამ ეტაპზე ხელმისაწვდომი არ არის`; button text follows the format; reopen → WAV |
| MP-MP3 (R20-X2, primary) | MP3, project scope | Download `czaba-studio-lab.mp3`; frame header 48 kHz stereo (report VBR/CBR and bitrate from the header); decodes; duration within 0.1 s of `projectEnd`; correlation ≥ 0.99 with the project WAV after the best lag (report the lag); exact done message; the encoder load time is reported |
| MP-RANGE | Range 4–9 s (Snap 1 s), MP3 | `czaba-studio-lab-range.mp3`; duration 5.0 ± 0.1 s; correlation ≥ 0.99 with the range WAV; exact range message |
| MP-BOTH | WAV + MP3, project scope (both viewports) and range scope (one viewport) | Exactly two downloads (`.wav` then `.mp3`, matching names); the WAV equals a plain WAV export of the same state (≤ 1 LSB, HR-C-R84-L1) and has the round-85 frame count; the MP3 passes the MP-MP3 checks; exact message. Report whether Chromium asked about multiple downloads |
| MP-WAV-UNCHANGED | WAV project and range exports after the change | Same frame counts, filenames and messages as round 85 (`ceil(projectEnd × 48000)`, 240000 for 4–9) |
| MP-CDNFAIL | Fresh context; `page.route('**/unpkg.com/**', route => route.abort())`; MP3 export; then WAV + MP3; then a WAV export; then `page.unroute` and MP3 again | MP3 and WAV + MP3: the exact load-failure message (`role=alert`), **zero downloads**; Close enabled; the WAV export still works; after unroute the MP3 export succeeds in the same page |
| MP-TIMEOUT (1440x900 only) | Fresh context; route unpkg requests that never answer; MP3 export | Still rendering ("encoder იტვირთება…") at 60 s; the exact timeout message at 120 s ± 5 s; zero downloads; Close works afterwards |
| MP-REUSE | After a successful MP3, export MP3 again in the same page | No second request for `ffmpeg-core.wasm`; second export completes; report both durations |
| MP-OVERLOAD | Mute music, Master +6 dB; range over the loud span; export MP3 | The overload warning text equals the WAV export's warning for the same state |
| MP-MUTE | Master mute; MP3 export | Message ends with the master-mute suffix; decoded MP3 is silent (max \|x\| ≤ 1e-3) |
| MP-KEYS | Keyboard only: open Export with Enter; Tab to the format group; arrow to MP3; Tab to the button; Enter | Focus never leaves the dialog; the button reads `MP3-ის ექსპორტი`; an `.mp3` downloads; focus returns to Export after closing |
| MP-X3 (R20-X3 re-check) | With and without a video clip | Video option disabled with the unchanged reason; with a video fade the round-84 line still shows; downloads are only `.wav` / `.mp3` |
| MP-NET | All sessions | No unpkg request before the first MP3/WAV + MP3 click (page load and WAV exports make none); then only `ffmpeg-core.js` / `ffmpeg-core.wasm` from `unpkg.com`; no studio-token/R2/download request; 0 auth headers |
| REG-HYD | All sessions | No hydration / `useLayoutEffect` warning, no non-noise console error |
| G86-3 | Purchase protection | `/studio/middle-east` anonymous → sign-in required, no workspace; `/api/studio-token?…` anonymous → 401; header link opens `/studio-lab` with the demo badge; fake-Bearer 403 → BLOCKED if the backend is unavailable |
| T86-TARGETED | A's `a-round-86/targeted-list.txt` | All pass |
| SOURCE-UNCHANGED | Start = end | HEAD `51e024a`, 6 M + 4 ??, frozen 487/487, A's end hashes, protected 4/4, `app/utils/ffmpeg.ts` = `0995ae78` |

- **Gate rows** (`gate`, not claimed by C): full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke. **Production MP3** (built bundle) cannot be checked in the cloud (no preview server): C lists it as not run, not as PASS.
- **Ableton match:** reported separately from PASS (confirmed / conscious difference / unconfirmed / not applicable), using §4.
- **Neighbour behaviour that could break:** the WAV path and its messages; the round-85 scope defaults; the dialog's focus trap and focus return; the frozen render-time focus behaviour (WAV radio stays focusable while rendering). **Known and intended (not a new bug):** Close stays disabled while an MP3 export renders and loads the encoder (up to 120 s, the existing `isRendering` rule); cancel arrives in stage 3. Playwright Chromium delivers two scripted downloads (B probe `dl2-output.txt`); a real-Chrome multiple-downloads prompt is Tech Lead R86-T, not a C row.

## 6. Mutation-proof table for C (optional, read-only)
C may re-run A's mutations (a)–(i) in a scratch copy, never in `store/`.

## 7. After this round
- **Round 87:** a **regression round** if its planning falls on or after 2026-10-24 (one short browser check per done / c_pass item at both viewports, `npm run test:e2e:smoke`; A fixes only what C finds; gate-85 #6 row-boundary handles is one of its rows). Otherwise **SRW-20 stage 3** (worker encoding, progress, cancel; R20-X4).
- **Then:** the Lows batch (C-R84-L1, GATE85-S1/S4/S5, A-R85-REVIEW-L1, SRW18-KEYBOARD-FADES, fade-handle Lows) → SRW-21 → full regression → T12 → VISUAL-A-OBSIDIAN.
- The architecture checkpoint request (`b-round-83-checkpoint-request.md`, addenda q12 and q13) is with root and does not block this round.
