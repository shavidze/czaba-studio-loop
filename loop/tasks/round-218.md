# CURRENT TASK — Round 218: PERF-16a — the Studio lab's MP3 export through mediabunny + LAME (no ffmpeg.wasm, no CDN)

Decisions:
- **D-29z220:** round 217 closed. C PASS, browserVerified and realVerified true, 0 bugs. Gate 217 published `8873ece` (rounds 215–217). PERF-1b-ii is done.
- **D-29z221:** PERF-16 is split into **16a** (this round: the lab encoder) and **16b** (the legacy `/studio/:productId` path and the removal of `@ffmpeg/*`). The full PERF-16 scope is unchanged. The order of the dependency requests is fixed in §0.2.
- **D-29z222:** the rulings for 16a, in §1.

Planned by B on 2026-10-28. Dispatcher: B. Implementer: A. Verifier: C. Consulted before dispatch: `tech-lead` and `performance-optimizer` (read-only; summary in `b-round-217.md` §4), plus the advisor.

**Read first:**
- `lessons.md`. L3, L10, L11, L12, L23, L26, L28, L29, L30, L31, L32 and L33 apply.
- `/home/runner/czaba-project/docs/technical/performance/oss-adoption.md` (the PERF-16 row and the baseline rule) and `perf-plan.md` l.42.
- Project primitives: `AUDIO_ARCHITECTURE.md`, `AGENT_DISCOVERABLE_CODE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, and `.claude/prompts/new-test.md`.
- The installed typings, after root's deps commit:
  - `node_modules/mediabunny/dist/mediabunny.d.ts`;
  - `node_modules/@mediabunny/mp3-encoder/dist/modules/src/index.d.ts`.

  Cite the line you rely on for every API you use.

## Baseline
- **Expected HEAD:** a root commit `chore(deps): add mediabunny@1.62.1 @mediabunny/mp3-encoder@1.62.1 (root, OSS plan approved by Saba)`.
  - It sits directly on `8873ecec52219041efc181524d529a6dc279a80b` (gate 217).
  - It changes only `package.json` and `package-lock.json`.
  - `package.json` `dependencies` then holds `"mediabunny": "1.62.1"` and `"@mediabunny/mp3-encoder": "1.62.1"`. `@ffmpeg/ffmpeg` and `@ffmpeg/util` are still present.
  - B filed the request this planning: `root-deps-request.json` `{"add": ["mediabunny", "@mediabunny/mp3-encoder"], "remove": []}`. `cloud/run.sh` applies it at the start of the next job, before phase A. `root-deps-done.json` then records it.
- **STOP rule (L11):** if any of these holds, A writes `STOP — needs root: mediabunny not installed` at the top of `a-round-218.md` and changes nothing. A never installs packages.
  - HEAD is `8873ece` itself.
  - The deps commit is missing.
  - `node_modules/mediabunny/package.json` is not version 1.62.1.
- **Working tree at planning:** clean. `b-round-217/git-status-at-planning.txt` is empty.
- **Frozen:** 1,059 files in `b-round-217-r218-tree-sha256.txt`.
  - These are every tracked file at `8873ece`, minus the 4 grants and minus `package.json` and `package-lock.json` (root's deps commit changes those two).
  - From `store/`, run `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-217-r218-tree-sha256.txt`. B checked it: rc 0.
- **Grants:** `b-round-217-r218-grants.txt` (4 files).
  - Start hashes: `b-round-217-r218-granted-start-sha256.txt`.
  - Start copies: `b-round-217/r218-granted-start/`.
- **New files:** `b-round-217-r218-new-files.txt` (1 file: doc 170).
- **Protected as always:**
  - the auth and purchase files: `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`;
  - `.claude/**`, `CLAUDE.md`, `package*.json`, `vite.config.ts` and every other config file;
  - `perf/**` (the specs and the budgets);
  - **frozen for this round:** `app/contexts/ArrangementContext.tsx` and `app/components/arrangement/ArrangementExportDialog.tsx`;
  - `app/utils/ffmpeg.ts` and `app/contexts/StudioContext.tsx` (16b owns these two).

## 0. Why this round, and the order
### 0.1 Why
- Round 217 passed, and the planning date (2026-10-28) is before 2026-10-30, so the regression is not due. The pre-fixed outcome (`tasks/round-217.md` §5) makes round 218 PERF-16.
- **Today:**
  - The lab's first MP3 export downloads the ffmpeg core (~31 MB) from `unpkg.com` (`mp3-encoder.client.ts` l.4 and l.62–75).
  - It copies the whole WAV into a full-size `ArrayBuffer` and the ffmpeg file system (l.28).
  - MP3 export has never been browser-verified in the cloud.
- **After:**
  - The LAME wasm ships inside our own lazily loaded chunk: MPL-2.0 wrapper, LGPL LAME.
  - The WAV Blob is read in slices through `BlobSource`, so no full-size WAV `ArrayBuffer` is made.
  - Nothing loads from a third-party host.
  - The export dialog, its progress, cancel, the file names and the two-file "WAV + MP3" flow stay exactly as they are.

### 0.2 Dependency sequence (D-29z221)
1. **Round 218 (16a):** add `mediabunny` and `@mediabunny/mp3-encoder` (requested now). `@ffmpeg/*` stays installed, because `app/utils/ffmpeg.ts` (used by `StudioContext.tsx` l.25) still imports it.
2. **OSS-LIC:** right after the first new dependency lands, so round 219. If the regression is due at that planning (on or after 2026-10-30), the regression goes first.
3. **16b:** the legacy `convertWavToMp3` path moves onto the same encoder. `app/utils/ffmpeg.ts` is rewritten to delegate and keeps its used exports. It is not deleted: deletion needs Saba (CLAUDE.md), per the tech-lead consult. `export-progress-ui.test.tsx` l.21/54 is updated there.
   - Only after 16b's C PASS does B file `{"add": [], "remove": ["@ffmpeg/ffmpeg", "@ffmpeg/util"]}`.
   - B then asks root for a one-line grant on `vite.config.ts` l.27 (`optimizeDeps.exclude` of the two `@ffmpeg` packages), in the same commit as the uninstall.
   - `docs/technical/diagrams/studio-audio-pipeline.md` l.273/318/521/542 is updated in 16b.

## 1. Rulings (D-29z222). Required.
1. **The module API stays byte-compatible.** `mp3-encoder.client.ts` keeps exactly these exports, with the same signatures:
   - `ArrangementMp3Encoder` (`encode(wav: Blob, onProgress?: (fraction: number) => void): Promise<Blob>`);
   - `loadArrangementMp3Encoder(): Promise<ArrangementMp3Encoder>`;
   - `resetArrangementMp3Encoder(): void`.

   `ARRANGEMENT_MP3_CORE_BASE_URL` is removed. Grep proof: its only users are the module and `mp3-encoder.test.ts`. No other export is added unless a test needs it; if one is, A lists it.

   **Why:** six test files mock this module. `ArrangementContext.tsx` (frozen) consumes it at l.3411–3536: the dynamic import, the 120 s load timeout, the reset on abort (l.3413–3415, 3445) and on failure (l.3489, 3515), and `raceArrangementExportAbort`. None of those change.
2. **The context's timeout and load-failed branches stay, now narrower.** Loading becomes a near-instant registration. So the 120 s timeout and `encoderLoadFailed` can now fire only when the dynamic-import chunk fails, or when `registerMp3Encoder` throws. This is recorded on purpose: nobody removes those branches later. Doc 170 states it.
3. **Imports.** `mp3-encoder.client.ts` may import `mediabunny` and `@mediabunny/mp3-encoder` statically, because the module itself is reached only by the dynamic `import()` in the context.
   - **No other file under `app/`** may import either package as a value.
   - A type-only `typeof import('~/lib/arrangement/mp3-encoder.client')` stays allowed: it is erased.
   - The `.client.ts` suffix keeps the module out of the SSR bundle.
   - Test row ME9 locks this (§2).
4. **Registration.** `registerMp3Encoder()` is called **unconditionally**, once, inside the first `loadArrangementMp3Encoder()`, never at module evaluation. It is idempotent upstream (a `registered` flag in `@mediabunny/mp3-encoder` `src/index.ts` l.256–257); keep a module flag as well.

   **Why not the README's `if (!(await canEncodeAudio('mp3')))`?**
   - That guard hands the export to a browser's native MP3 encoder where one exists, so the encoder and the output would differ between browsers. The CZABA requirement is one predictable file: CBR 320 kbps, which matches Ableton (§4).
   - Registered custom encoders take precedence when they support the config, so registering unconditionally means LAME everywhere.
   - `canEncodeAudio` needs WebCodecs, which jsdom does not have. The guard would make the tests depend on the environment.
5. **Encode.** One `Conversion` per `encode()` call:
   - `input`: `new Input({ formats: [WAVE], source: new BlobSource(wav) })`.
   - `output`: `new Output({ format: new Mp3OutputFormat(), target: new BufferTarget() })`.
   - `audio`: `{ codec: 'mp3', quality: new Quality({ bitrate: 320_000 }) }`. Do not use the deprecated `bitrate` field. Keep the input's sample rate and channel count (48 kHz stereo from our WAV writer).
   - **Before `execute()`:**
     - Set `conversion.onProgress`. It forwards `progress` clamped to [0, 1] and ignores non-finite values (as ME5 does today).
     - **If `isValid` is false**, reject with an `Error` whose message names the discard reason(s) from `discardedTracks`, and do not call `execute()`.
   - **The result** is `new Blob([target.buffer], { type: 'audio/mpeg' })`. A null buffer rejects.
   - `input.dispose()` runs in a `finally`.
   - **No full-size WAV copy:** the encode path never calls `wav.arrayBuffer()`, `wav.bytes()`, `wav.text()` or `new Response(wav)`. `BlobSource` reads slices into a bounded cache (`mediabunny.d.ts` l.637–638, 8 MiB by default). Doc 170 states exactly this, and not "zero bytes copied". ME8 locks it.
6. **Reset, cancel and stale encoders.**
   - **Reset.** `resetArrangementMp3Encoder()` bumps the generation and calls `cancel()` on every in-flight `Conversion`. The pending `encode()` then rejects, with `ConversionCanceledError` or whatever cancel produces.
     - The context already swallows errors after an abort, so no user-facing error appears; C checks this.
     - A cancelled run emits no further `onProgress` calls.
   - **Stale encoders.** An `ArrangementMp3Encoder` object returned before a reset rejects any later `encode()` with an `Error`, and starts no Conversion. (ffmpeg did this only by accident, through `terminate()`.)
   - **Loading again.** A later `loadArrangementMp3Encoder()` works again. A load that resolves after a reset does not mark the module loaded for the newer generation (today's ME3 property).
   - **Workers.** Worker cleanup is mediabunny's job: `close()` → `worker.terminate()` (`mp3-encoder` `src/index.ts` l.155–156). C measures it (MP3-CANCEL).
   - **Known upstream leak.** The bundle calls `URL.createObjectURL` for its worker and never revokes it: one small blob URL per encoder init. Record it in doc 170 as known upstream info. It is not a FAIL.
7. **Strings.** Exactly these three values in `studioExportStrings` change; every other string is unchanged.

   | Key | Old (`strings.ts`) | New |
   |---|---|---|
   | `mp3FormatNote` (l.19–20) | `LAME (ffmpeg.wasm) — the encoder loads from a CDN on the first MP3 export (~31 MB)` | `LAME (mediabunny) — 320 kbps CBR; the encoder loads with the first MP3 export` |
   | `encoderLoading` (l.54) | `Loading the MP3 encoder (ffmpeg.wasm, ~31 MB the first time)…` | `Loading the MP3 encoder (LAME)…` |
   | `encoderLoadFailed` (l.55–56) | `The MP3 encoder failed to load (ffmpeg.wasm, unpkg CDN) — no file was created. Check your internet connection and try again, or choose WAV.` | `The MP3 encoder failed to load — no file was created. Reload the page and try again, or choose WAV.` |

   - `exportCancelledEncoder` ("…will load again on the next MP3 export.") stays. It is still true: after a reset, the next export loads and registers again.
   - **L23 collision grep, run by B:** `grep -rlnE "Loading the MP3 encoder|unpkg CDN|from a CDN|ffmpeg\.wasm|31 MB" app e2e perf docs/technical` hits 3 files:
     - `app/lib/arrangement/strings.ts`;
     - `app/lib/arrangement/__tests__/strings.test.ts`;
     - `docs/technical/diagrams/studio-audio-pipeline.md` (the legacy path, 16b).

     Every other export test mocks the module and reads `studioExportStrings` by key. A re-runs the same grep. A hit outside these three is a STOP.
   - Each new string is shorter than the old one, so the dialog note cannot gain a line (row DIALOG-COPY).

## 2. A: the files you own. Everything else is frozen.
| Path | Allowed edits |
|---|---|
| `app/lib/arrangement/mp3-encoder.client.ts` | A full rewrite per §1.1–§1.6. No `any`, no `@ts-ignore`, no type assertions (`as`), and semicolons everywhere (CLAUDE.md). No comments except a TODO. |
| `app/lib/arrangement/__tests__/mp3-encoder.test.ts` | A rewrite. `vi.mock('mediabunny')` and `vi.mock('@mediabunny/mp3-encoder')` with hoisted fakes (jsdom has no Worker; the real encode is C's browser row). Keep the `describe` title and add `PERF-16a` to it. The rows are listed below. |
| `app/lib/arrangement/strings.ts` | The three values in §1.7 only. |
| `app/lib/arrangement/__tests__/strings.test.ts` | The three expected values that match §1.7 (current l.104, l.138, l.140). Nothing else. |
| **new** `docs/implementation/2026/quarter-IV/170-perf-16a-mp3-mediabunny.md` | Per `docs/implementation/TEMPLATE.md`, with all 7 `##` headings in TEMPLATE order (the C-R216-01 lesson). <ul><li>l.4 is exactly `**სტატუსი:** In Progress (stage 1 of 2; C round 218 PASS)` (L28).</li><li>A before/after Mermaid flow under `## არქიტექტურა`.</li><li>The bundle numbers A measured.</li><li>The §1.2 narrowing and the §1.5 copy wording.</li><li>The licence note: LAME is LGPL, inside the MPL-2.0 `@mediabunny/mp3-encoder`. OSS-LIC follows.</li><li>The 16b handoff list (§0.2).</li><li>It cites only test rows that exist (L26).</li></ul> |

**Test rows (`mp3-encoder.test.ts`).** Each row id appears in its `it()` title.
- **ME1:** concurrent `loadArrangementMp3Encoder()` calls share one load. `registerMp3Encoder` is called exactly once across two loads and an encode. Nothing is registered at import time: import the module, then assert 0 calls.
- **ME2:** a load that rejects (make the fake `registerMp3Encoder` throw once) clears the in-flight load. The next call then registers again and resolves.
- **ME3:**
  - **(a) reset during a pending load:** the late resolution does not populate the newer generation, and the next call loads fresh.
  - **(b) reset during an `encode()`:** it calls `cancel()` on that Conversion exactly once, the encode rejects, and a progress event the fake fires after the cancel reaches no `onProgress`.
  - **(c) a stale encoder:** an encoder obtained before a reset rejects a new `encode()` and constructs no Conversion.
  - **(d) a reset with nothing in flight:** it is a no-op and does not throw.
- **ME4:** the exact Conversion config.
  - `Input` gets `formats: [WAVE]` and a `BlobSource` constructed with **the same Blob instance**.
  - `Output` gets `Mp3OutputFormat` and `BufferTarget`.
  - `audio.codec === 'mp3'`, and `Quality` is constructed with `{ bitrate: 320000 }`.
  - The result is a Blob of type `audio/mpeg` with the fake target's bytes.
  - `input.dispose()` is called on success.
- **ME5:** progress values are forwarded clamped to [0, 1], and NaN and Infinity are ignored. `onProgress` is set before `execute()` is called.
- **ME6:** `isValid === false` rejects with a message that contains the fake discard reason, and `execute()` is never called.
- **ME7:** an `execute()` rejection propagates, and `dispose()` still runs. A null `target.buffer` after `execute()` rejects.
- **ME8 (no full-size copy):** call `encode()` with a Blob whose `arrayBuffer`, `bytes`, `stream` and `text` are spies. Our code calls none of them (the fake `BlobSource` does not read). Define the spies on the instance (`Object.defineProperty`), not with `spyOn` on `Blob.prototype`: `bytes` may not exist in the runner's Node.
- **ME9 (import boundary, a repo scan):**
  - Under `app/`, outside `__tests__`, the only file whose source has a value import of `mediabunny` or `@mediabunny/…` is `app/lib/arrangement/mp3-encoder.client.ts`. The patterns are `from ['"](mediabunny|@mediabunny/[^'"]+)['"]`, a bare `import ['"]…['"]`, and `import\(['"](mediabunny|@mediabunny/)`.
  - Every reference to `mp3-encoder.client` outside `__tests__` is either `import('~/lib/arrangement/mp3-encoder.client')` or a `typeof import(…)` type query.
  - The source of `mp3-encoder.client.ts` contains no `@ffmpeg` and no `unpkg`.
  - Red-proof is a named mutant (L23): a scratch copy of a real `app/` file with a static `import 'mediabunny'` makes ME9 fail. Do it in `/tmp` or with an injected file list; never edit a frozen file.

**Self-checks before handover.** Not the full suite.
- **Scope:**
  - `sha256sum -c` of the frozen list at the start and at the end: rc 0.
  - `git diff --stat 8873ece HEAD -- package.json package-lock.json` shows only root's deps commit.
- `npm run typecheck`: rc 0. `npm run lint`: rc 0 (Biome covers `app/**`).
- **Covering tests:** `npx vitest run app/lib/arrangement/__tests__/mp3-encoder.test.ts app/lib/arrangement/__tests__/strings.test.ts app/lib/arrangement/__tests__/export-mp3.test.tsx app/lib/arrangement/__tests__/export-progress-ui.test.tsx app/lib/arrangement/__tests__/export-cancel-ui.test.tsx app/lib/arrangement/__tests__/export-dialog-hold-enter.test.tsx app/lib/arrangement/__tests__/collection-load-status.test.tsx app/lib/arrangement/__tests__/video-import-status-ui.test.tsx`
  - All must pass.
  - The last six mock the module, so a failure there means the API seam broke. That is a STOP (L32/L33).
  - Report each file's time against its timeout (L31/L32), next to `gates/round-217/verify.log`, which lists all 8 files: 58 ms to 2,845 ms (`export-mp3.test.tsx`), well under 50 % of the vitest default.
- **Mutants.** Each must fail its row, on a scratch copy only:
  - (a) `bitrate: 128_000` fails ME4.
  - (b) registration moved to module top level fails ME1.
  - (c) `await wav.arrayBuffer()` added to encode fails ME8.
  - (d) the ME9 import mutant.
  - (e) the stale-generation check removed fails ME3(c).
- **A real MP3 in a real browser** (A's own smoke; C repeats it independently):
  - On the dev server, at 1440×900: add the demo clip, choose MP3 and Export.
  - Report the file size, the first audio frame header (`FF FB`, MPEG-1 Layer III, 320 kbps, 48 kHz, stereo; a leading Xing/Info frame is reported separately) and the frame count.
  - Your dev server started before mediabunny was imported, so Vite will probably re-optimise and reload the page on the first MP3 export. That is environmental, not a STOP: record it, then repeat the export once.
- **Bundle (production):** run `npm run build`, then report:
  - every client chunk under `build/client/assets` that holds the LAME bundle or mediabunny (for example, grep for `lame_` or `Mp3OutputFormat`), with raw and gzip bytes;
  - the sum of their gzip bytes, which must be **≤ 1 MiB** (perf-plan l.42);
  - proof from `build/client/.vite/manifest.json` that none of these chunks is in the `/studio-lab` route's static `imports` graph, only under `dynamicImports`.

  The build rewrites the shared `build/` folder (GATE206-S5). Do not run it while a perf spec runs.
- **Code-reviewer:** required (4 code/test files + a doc, so 3 or more files). Hand its Architecture note to B; it is not a task.

## 3. C: rows
**Setup.**
- **Browser and servers:**
  - Use Playwright Chromium.
  - The dev server is `http://127.0.0.1:5173`.
  - The PROD rows run on a production server: `npm run build && PORT=5188 npx remix-serve build/server/index.js`. Do not run it at the same time as the perf spec, which uses port 5188 too.
  - Do not run the full vitest suite or `npm run verify`.
- **First-navigation note (fact, C rounds 216 and 217):** twice, the first navigation after a perf run timed out. Do one warm-up `goto('/studio-lab')` before measuring. If a run is still invalid for an environment reason, rerun it; that is not a FAIL.
- **Dev reload watch (performance-optimizer consult):** during each dev MP3 export, capture the dev server log, count `framenavigated` events on the main frame after the Export click, and watch for 504 "Outdated Optimize Dep" responses.
  - If Vite re-optimises (`new dependencies optimized` or `optimized dependencies changed. reloading`) on the first MP3 export, or the page navigates mid-export, record it with the time. Then repeat the export.
  - A dev-only reload is an info finding for 16b, not a PASS blocker. The PROD rows decide the production behaviour.

| Row | What C does | PASS when |
|---|---|---|
| **SCOPE-218** (start + end) | <ul><li>`git log -2 --format='%H %s'`;</li><li>`git show --stat HEAD`;</li><li>`git status --short --untracked-files=all`;</li><li>`sha256sum -c` of the 1,059-file list;</li><li>a diff of each grant against `b-round-217/r218-granted-start/`.</li></ul> | <ul><li>HEAD is the root `chore(deps): add mediabunny@1.62.1 @mediabunny/mp3-encoder@1.62.1 …` commit, directly on `8873ece`, changing only `package.json` and `package-lock.json`.</li><li>Status shows only the 4 grants (M) and doc 170 (??).</li><li>Frozen rc 0.</li></ul> |
| **STRINGS-218** | Diff `strings.ts` and `strings.test.ts` against the start copies. Re-run B's L23 grep. | <ul><li>Exactly the three values of §1.7 changed, in both files.</li><li>The grep hits only the three listed files.</li></ul> |
| **API-218** | Read `mp3-encoder.client.ts`. Run `npx vitest run` on the 8 files in A's covering list. | <ul><li>The three exports keep their names and signatures, and `ARRANGEMENT_MP3_CORE_BASE_URL` is gone.</li><li>The file has no `@ffmpeg`, no `unpkg`, no `arrayBuffer(` and no `as` type assertion.</li><li>Registration happens inside the load.</li><li>All 8 files pass.</li><li>ME1–ME9 exist by id, ME3 with (a)–(d).</li></ul> |
| **REDPROOF-218** | Read A's five mutant logs. Add C's own mutant on a `/tmp` copy: the encode drops `input.dispose()`. | A's (a)–(e) and C's mutant each fail the named row (C's: ME4 or ME7). Nothing hangs. |
| **MP3-REAL** (browser, both viewports, dev) | In a fresh context, add the demo clip with the real mouse, choose MP3, Export, and capture the download. | <ul><li>`czaba-studio-lab.mp3` arrives, and the dialog shows the MP3 done message.</li><li>**Every audio frame header** is MPEG-1 Layer III, 320 kbps, 48 kHz and stereo. CBR means every audio frame has the same bitrate. `Mp3OutputFormat` writes a leading Xing/Info metadata frame by default (`xingHeader: true`); C excludes it from these checks and reports it separately.</li><li>The audio frame count × 1152 / 48000 lies in [101.352, 101.452] s ("created 01:41.352" plus 0.10 s).</li><li>In the page, `decodeAudioData` of the file gives a duration in the same window. The audio is not all zeros. Its RMS is within ±1.0 dB of the WAV export of the same mix (round 217: −15.29 dBFS).</li><li>0 page errors.</li></ul> |
| **MP3-NET** (browser, dev and PROD) | Record every request from the click on Export to the done message. Also record the long tasks over 50 ms in the MP3 phase (record only, no budget). | <ul><li>0 requests to any host other than the page origin, apart from the known cloud cart errors.</li><li>No URL contains `unpkg` or `ffmpeg`.</li><li>The status `Loading the MP3 encoder (LAME)…` or the progress label `Loading MP3 encoder…` appears before `Creating MP3`, or the load is too fast to see. C says which.</li></ul> |
| **MP3-CANCEL** (browser, 1440, dev) | Start an MP3 export and click Cancel during `Creating MP3 · N%`. If encoding is too fast to catch, use a longer project (three demo clips end to end). Then run a second MP3 export to completion. | <ul><li>The message is `Export cancelled — no file was created. The MP3 encoder will load again on the next MP3 export.`, with no error text and no download.</li><li>Within 2 s after the cancel, and again after the completed export, there are 0 workers whose `worker.url()` starts with `blob:`. The LAME worker is the only blob-URL worker; the WAV worker uses `new URL(…, import.meta.url)` and is terminated per export (`export-wav.client.ts` l.32/46). Also report the total `page.workers().length` before and after. No LAME worker leaks.</li><li>The second export gives a valid MP3, with headers as in MP3-REAL.</li></ul> |
| **MP3-BOTH** (browser, 1280, dev) | Choose `WAV + MP3 · two files` and export. | <ul><li>`czaba-studio-lab.wav` arrives, as in round 217: PCM 24-bit, 48 kHz, 2 ch, 4,864,896 frames.</li><li>`czaba-studio-lab.mp3` arrives and passes the MP3-REAL checks.</li><li>The "both" done message shows.</li></ul> |
| **MP3-RANGE** (browser, 1440, dev) | Make a time selection of about 2–5 s on the clip, choose Time selection + MP3, and export. | <ul><li>`czaba-studio-lab-range.mp3` arrives.</li><li>Its frame duration lies in [L, L + 0.10] s, where L is the selection length the dialog showed.</li><li>It is not silent.</li></ul> |
| **DIALOG-COPY** (browser, both viewports) | Open Export, choose MP3 and screenshot the note. Read the status line during loading. | <ul><li>The note reads exactly the new `mp3FormatNote`.</li><li>Its box has no more lines than the old text had, with no overflow or clipping. Measure the old text in the live dialog: `page.evaluate` sets the note element's `textContent` to the old `mp3FormatNote`, C measures the line count and height, then restores the new text (L3). Never stash or edit the tree.</li><li>No string on screen says CDN, 31 MB or ffmpeg.</li></ul> |
| **PROD-BUNDLE** | On the production build, repeat A's manifest and chunk check independently. Open `/studio-lab` and record the scripts it loads before any export. | <ul><li>The mediabunny/LAME chunk(s) total ≤ 1 MiB gzip.</li><li>None of them is fetched when `/studio-lab` loads; they are fetched only after Export MP3.</li><li>One MP3 export on PROD passes the MP3-REAL header check at 1440.</li></ul> |
| **PERF-RUN-218** | Run `npx playwright test --config playwright.perf.config.ts perf/studio-lab-resources.perf.spec.ts` once, alone, with sentinels as in round 217. Compare with `c-round-217/perf-run-1.json`. | <ul><li>rc 0, `complete`, `failures []`.</li><li>Every deterministic median equals round 217's, except the `res.js.*.encoded-bytes` and `res.js.*.decoded-bytes` rows. Those may differ by at most 4,096 bytes each, because the strings got shorter and the chunk hashes changed. A jump the size of the LAME bundle would mean an eager load.</li><li>Every `res.js.*.scripts` and `*.third-party-scripts` median is unchanged: studio-lab 43/0, home 41/0, guard 42/0.</li></ul> |
| **G218-3** (browser) | Fresh contexts at 1440×900 and 1280×720: <ul><li>`/studio-lab` anonymous;</li><li>`/studio/middle-east`;</li><li>`/api/studio-token?product=middle-east&file=stem1.wav`, with no header and with a fake Bearer.</li></ul> | <ul><li>`/studio-lab` opens anonymously with the demo badge.</li><li>`/studio/middle-east` shows "Sign in required" with 0 `audio[src]`.</li><li>No header → 401.</li><li>Fake Bearer → 403 with the `:5199` mock, or 500 without it.</li><li>**No token is issued.**</li></ul> |
| **STUDIO-SMOKE-218** (browser, both viewports) | The round-217 WAV smoke: add the demo clip, Export WAV, capture the download. | <ul><li>`czaba-studio-lab.wav`: PCM, 2 ch, 48 kHz, 24-bit.</li><li>Its length matches "WAV created" within 1 frame.</li><li>The audio is not all zeros.</li><li>0 page errors.</li></ul> |
| **AN-REVIEW-218** | Read doc 170. | <ul><li>All 7 TEMPLATE `##` headings appear in order.</li><li>l.4 is exactly `**სტატუსი:** In Progress (stage 1 of 2; C round 218 PASS)`.</li><li>Every cited test row exists (L26).</li><li>The bundle numbers match PROD-BUNDLE within 1 %.</li><li>§1.2, §1.5's copy wording, the licence note and the 16b handoff are present.</li></ul> |
| **gate** | Full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke, and the perf specs at the gate. | Not claimed by C. |

**`browserVerified`:** every browser row runs in the cloud: MP3-REAL, MP3-NET, MP3-CANCEL, MP3-BOTH, MP3-RANGE, DIALOG-COPY, PROD-BUNDLE, PERF-RUN-218, G218-3 and STUDIO-SMOKE-218. If any one does not run, the flag is false and PERF-16a is not done.

## 4. Reference: how Ableton Live 12 does it
This is mostly a performance and dependency round, but the MP3 format and the dialog copy are user-visible.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| MP3 format | [Live 12 manual §5.1.3.3 "Encoding Options"](https://www.ableton.com/en/live-manual/12/managing-files-and-sets/), read by B with WebFetch on 2026-10-28 | "Enable this option to render a CBR 320 kbps MP3 file." | **Same:** CBR 320 kbps (LAME). | MP3-REAL: every frame is 320 kbps. |
| MP3 next to PCM | same section | Encode MP3 is an option alongside the PCM render. | An existing CZABA difference, not changed here: the format radio offers WAV, MP3 or `WAV + MP3 · two files`. | MP3-BOTH |
| Encoder download | none (Live is a desktop app with nothing to download) | — | Ours loads a lazy chunk from our own origin, with no CDN. | MP3-NET, PROD-BUNDLE |

- **Deviations:** none new.
- **Ableton conformance for C:** "confirmed" for the 320 kbps CBR row, "not applicable" for the encoder download.

## 5. Adjacent behaviour that could break
- **The six export test files mock this module.** An API drift breaks them, which is the reason for §1.1.
- **The two-file flow and the range file name.** The two-file flow (`includeWav`) and the range file name come from the frozen context. MP3-BOTH and MP3-RANGE cover them.
- **Cancel during MP3.**
  - The context calls reset on abort.
  - A cancel must not leave a running LAME worker.
  - A cancelled run must not move the progress bar.
  - The next export must work.
- **The load timeout and the load-failed path.** The 120 s timeout and the encoder-load-failed path are unchanged code, now narrower (§1.2).
- **Production chunking.** A value import of mediabunny anywhere else would put the library into the `/studio-lab` load. ME9, PROD-BUNDLE and PERF-RUN-218's script count cover this.
- **The legacy `/studio/:productId` MP3 path** (StudioContext → `utils/ffmpeg.ts`). It is untouched and stays on ffmpeg until 16b. Its browser check needs a signed-in purchase, so it is backend-blocked in the cloud.

## 6. Outcome, fixed in advance
| C result | B at round-219 planning |
|---|---|
| PASS, and planning on or after 2026-10-30 | Round 219 = **REGRESSION** (including the MP3-REAL check), then OSS-LIC, then 16b. |
| PASS, and planning before 2026-10-30 | Round 219 = **OSS-LIC** (third-party notices + the GPL/AGPL licence test), then 16b. |
| A's STOP on the missing deps commit | Root inspects. B re-dispatches 16a unchanged once the commit exists. |
| An MP3 row fails (wrong bitrate, silence, leak, error on cancel) | A bounded fix-up of the failing rows, inside the same grants. |
| PERF-RUN-218 or PROD-BUNDLE shows an eager load (the script count changes, or the bytes jump > 4 KiB) | Fix-up: the import boundary. |
| G218-3 or STUDIO-SMOKE-218 finds Medium+ | A bounded fix-up first. A Low goes to `deferred_low_polish`. |

## 7. Publication
- After C PASS, root gates this tree: root's deps commit is already on master, plus the 4 grants and doc 170.
- Suggested commit message: "perf(studio): PERF-16a lab MP3 export through mediabunny + LAME (no ffmpeg.wasm/CDN; 320 kbps CBR; BlobSource, no full-size WAV copy)".
- **Root reviewer, please cover:**
  - the cancel, reset and stale-encoder semantics against `ArrangementContext.tsx` l.3411–3536;
  - the import boundary;
  - the licence note in doc 170.
- Still pending with root, non-blocking: the frontend-architect checkpoint (D-29z195) and `b-round-215-root-request-l28.md`. ROOT-R216-LATE-SPEC-REVIEW is closed: gate 217's review (`gates/round-217/review.md`) covered the four late spec changes.
