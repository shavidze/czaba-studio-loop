# C round 220 — PERF-16b-i verification (legacy MP3 facade on the shared LAME encoder + C-R219-01)

**Verdict: PASS**. One Low finding: **C-R220-01**. The literal PERF-RUN-220 criterion was **not met**, so that row is not in `passed`. `browserVerified` = `realVerified` = true. LEGACY-UI-220 is BLOCKED (backend unavailable in cloud).

Environment: cloud runner, Playwright Chromium (headless), dev server `http://127.0.0.1:5173` (env-status: store 200). I did not edit any app source. All evidence is in `c-round-220/`.

## Rows

| Row | Result | Evidence |
|---|---|---|
| SCOPE-220 (start + end) | PASS | HEAD `c54a534`. Exactly 8 `M` (the grants) and 2 `??` (the new files). Frozen `sha256sum -c` rc 0 at start and end, so StudioContext and ArrangementContext are byte-identical. I also hashed the lock and 3 grants at the start, and they were unchanged at the end (`scope-start.txt`, `start-sha256.txt`). |
| UNIT-220 | PASS | The 13 files from §2: 255/255 (`unit-run.txt`). The licence test with `CI=true`: 63/63 (`tl-ci.txt`). LF1–LF5, ME10–ME12, TL8 and all 10 §1.5 TL1 rows exist. TL5's `existsSync(NOTICES_PATH)` is at l.364, before the awaited `toMatchFileSnapshot` at l.365. |
| REDPROOF-220 | PASS | See "Red-proof" below. |
| NOTICES-220 | PASS | See "Notices" below. |
| FACADE-REAL-220 (1440×900 and 1280×720, fresh context each) | PASS | See "Facade in real Chromium" below. |
| LAB-MP3-220 (1440, dev) | PASS | See "Lab MP3 export" below. |
| STUDIO-SMOKE-220 (WAV) | PASS | See "WAV smoke" below. |
| BUNDLE-220 | PASS | See "Bundle" below. |
| PERF-RUN-220 | **NOT MET (C-R220-01, Low)** | See "PERF-RUN-220" below. |
| SOURCE-GREP-220 | PASS | `grep -rn "@ffmpeg/\|unpkg" app --include=*.ts --include=*.tsx`, excluding `__tests__`, gives **0 hits** (`source-grep.txt`). The §1.9 (a) precondition for 16b-ii is met. |
| LEGACY-UI-220 | BLOCKED | Backend unavailable in cloud. FACADE-REAL-220 exercises the same `convertWavToMp3` in real Chromium. |
| G220-3 (1440×900 and 1280×720, fresh contexts) | PASS | See "Auth guard" below. |
| AN-REVIEW-220 | PASS | See "Docs" below. |
| gate | not claimed | Full vitest, verify, build gate and e2e smoke belong to root. |

### Red-proof
- **A's mutants (a)–(h):** each turns its named row red, and each log ends `match=yes` or `removed: yes`. A's extra mutant (i) (`import()` before validation) turns LF2 red.
- **(1) Spellings probe.** I re-ran it against the new module, with 5 extra ids (`probe/spellings.log`):
  - copyleft: `GPLv3`, `GPLv2`, `GPL2`, `AGPLv3`, `MIT AND GPLv2`, `GPLv2+`;
  - clean: `(MIT OR GPLv3)`, `Proprietary`, `SSPL-1.0`, `BUSL-1.1`, `LGPLv3`, `LGPL-2.1-only`;
  - unknown: `LicenseRef-Proprietary` and `licenseref-foo`.
- **(2) GPLv3 lock copy.** A lock copy with `zz-gplv3-probe@1.0.0` set to `license: "GPLv3"` makes TL4 fail with `{classification: copyleft, license: GPLv3, name: zz-gplv3-probe}`.
- **(3) LicenseRef lock copy.** The same entry with `LicenseRef-Foo` makes TL4 fail as `unknown`.
- **Expected collateral reds.** On both probe locks, TL4-anchors and TL5 also go red. That is expected: the extra runtime package changes the rendered notices. It is not a finding.
- **Control.** The control (the real lock through the same redirect plugin) gives 63/63.
- **Lock unchanged.** The repo lock sha256 `faa35ab2…` is the same before and after. The probes used a vite transform plugin and lock copies in `c-round-220/probe/`.

### Notices
- **Diff.** `git diff c54a534 -- THIRD_PARTY_NOTICES.md` has only two parts: the intro paragraph (3 lines reflowed, the §1.5 S3 wording) and the removed "Run-time downloads" section (`notices.diff`).
- **Independent check.** `c-round-219/notices-indep.cjs` gives 563 table rows and header 563. It finds 0 missing, 0 extra, 0 licence mismatches and 0 bad links, the order is correct, and 0 dependencies are missing.
- **Table.** The `| …` table lines are byte-identical to `c54a534`.
- **Removed and kept names.** There are 0 `unpkg` and 0 `@ffmpeg/core` hits. The `@ffmpeg/ffmpeg` and `@ffmpeg/util` rows are present.

### Facade in real Chromium
The script is `c-round-220/facade.cjs`, with results in `facade/facade-*.json` and screenshots. On `/studio-lab` it runs `import('/app/utils/ffmpeg.ts')` in the page and builds a 5 s, 48 kHz, stereo, 16-bit, 440 Hz sine WAV in the page.

- **Exports and the first call.** The runtime exports are `["convertWavToMp3"]`. The first call, `'256k'`, rejects with `Unsupported MP3 bitrate: 256k`. It made **0 requests**, so no `mp3-encoder.client` chunk was requested before the first valid call. Page load requested no encoder chunk either.
- **Encoder load.** The first valid call requested `/app/lib/arrangement/mp3-encoder.client.ts`, `@mediabunny_mp3-encoder.js` and `mediabunny.js`, all same-origin.
- **Frame walk.** I frame-walked every result with the round-218 parser. The results are the same at both viewports:

  | Call | Audio frames | Layer | Sample rate, mode | kbps | Xing | Frame time | Walk end | Decoded |
  |---|---|---|---|---|---|---|---|---|
  | `'128k'` | 210 | MPEG-1 L III | 48 kHz joint stereo | 128 | 1 frame at 56 | 5.04 s | EOF | 2 ch, 5.04 s, −12.22 dBFS |
  | `'192k'` | 210 | same | same | 192 | 1 at 56 | 5.04 s | EOF | 2 ch, −12.03 dBFS |
  | `'320k'` | 210 | same | same | 320 | 1 at 56 | 5.04 s | EOF | 2 ch, −11.77 dBFS |
  | no argument | 210 | same | same | 320 | 1 at 56 | 5.04 s | EOF | 2 ch, −11.77 dBFS |

- **Signal check.** The source sine (amplitude 12000/32768) is −11.73 dBFS RMS, so the decoded levels are consistent.
- **Blob type.** Every result Blob has type `audio/mpeg`.
- **Errors and network.** There were 0 page errors. Between the first call and the last result there were 0 off-origin requests and 0 unpkg or ffmpeg requests.

### Lab MP3 export
- **Invalid attempts.**
  - Attempt 1: a cold first load on the fresh dev server. The Add button was not enabled within 120 s (`exports/warmup1-invalid-cold-load-timeout.log`).
  - Attempt 2: the page navigated after the Export MP3 click. This was the Vite dep re-optimise reload (`exports/warmup2-invalid-vite-reload.log`). It served as the HR-MP3-WARMUP warm-up.
- **Measured run (attempt 3).**
  - Flow: Add, Export, MP3, Export MP3 through real mouse clicks.
  - File: `czaba-studio-lab.mp3`.
  - Frames: all 4224 audio frames are 320 kbps, 48 kHz, joint stereo, plus 1 Xing frame at 56 kbps. The walk ends at EOF.
  - Duration: 101.376 s, inside [101.352, 101.452]. The dialog shows "MP3 created: 01:41.352".
  - Decoded: 2 ch, RMS −15.29 dBFS. That is identical to round 219 (Δ 0.00 dB).
  - Page: 0 page errors, 0 navigations after the click, 0 off-origin requests. The demo badge is on and `auth_user` is null.
- **Evidence:** `exports/mp3-1440x900-5173.json` and the screenshots.

### WAV smoke
This ran at 1280×720 and also at 1440×900 (`g/g220.json`).
- `czaba-studio-lab.wav`: PCM, 2 ch, 48 kHz, 24-bit.
- 4,864,896 frames, which matches "WAV created: 01:41.352" exactly (frame diff 0).
- RMS −15.29 dBFS, 99.77 % non-zero.
- 0 page errors.

### Bundle
- **Own build.** I ran my own `npm run build` (rc 0, `build.log`). In `build/client` and `build/server` there are 0 hits for `unpkg.com`, `@ffmpeg`, `ffmpeg-core` and even `ffmpeg`.
- **Workers.** The only worker assets are `audio-encoder.worker`, `export-wav.worker` and `sfx-export.worker`. None of them is an ffmpeg worker.
- **Encoder chunk.** `mp3-encoder.client-DnFo_ChB.js` contains `AGFzbQ` once.
- **Manifest.** The `routes/studio.$productId` imports (21) contain no mp3, mediabunny or ffmpeg chunk (`bundle.txt`).
- **Page check on `/studio/middle-east`** (`guard-page.json`):
  - Prod (remix-serve on :5188): 0 encoder, mediabunny, ffmpeg or unpkg requests, and 0 such `modulepreload` links (42 preloads).
  - Dev (:5173): 0 encoder chunk requests and no such preload. The only regex hit was `/app/utils/ffmpeg.ts`. That is the facade module itself, statically imported by StudioContext, not an encoder chunk.
  - Both show "Sign in required" and 0 page errors.
- **Cleanup.** `build/` was removed.

### PERF-RUN-220
- **Run.** `npx playwright test --config playwright.perf.config.ts perf/studio-lab-resources.perf.spec.ts` ran once, alone. It gave rc 0, `complete: true` and `failures: []` (`perf-run-1.{log,json,rc}`).
- **Sentinels.** `latest.json` and `latest-interactions.json` were unchanged (same mtime and sha256, `sentinel-*.txt`).

| Metric | Round 218 | Round 220 | Criterion | Status |
|---|---|---|---|---|
| studio-lab scripts / third-party | 43 / 0 | **44** / 0 | unchanged 43/0 | **not met** |
| studio-lab encoded / decoded | 355211 / 1127380 | 356313 / 1127455 (+1102 / +75) | within 4096 | met |
| home scripts / third-party | 41 / 0 | 41 / 0 | unchanged | met |
| home encoded / decoded | 263092 / 825747 | 263114 / 825842 (+22 / +95) | within 4096 | met |
| guard scripts / third-party | 41 / 0 | **42** / 0 | ≤ 41 / 0 | **not met** |
| guard encoded / decoded (recorded) | 286668 / 921540 | 285596 / 915456 (−1072 / −6084) | recorded; increase = FAIL | decreased |

**Cause: C-R220-01.** I built `c54a534` in `/tmp/c220-base` and served it on :5189 next to the new build on :5188. On each page I compared the script lists (`guard-scripts.json`).
- **The difference.** Both Studio routes load one new chunk, `repeat-CagKcVTz.js` (710 B raw, 373 B gzip -9). It holds only the lucide `chevron-right` and `repeat` icons. At the base those two icons were inside `preload-helper-DeWvYgyj.js`.
- **Why.** With the `@ffmpeg/*` dynamic imports gone, Rollup partitions the chunks differently.
- **Totals.** The guard's total JS goes down (−6,084 B decoded, −2,134 B gzip in my own sum). studio-lab goes up by 75 B decoded, and home is unchanged.
- **It is not an eager load.** No encoder, mediabunny or ffmpeg chunk is requested or preloaded. So the outcome-table "eager load → fix-up" branch does not apply. No change inside the 10 grants can control this partition.
- **Status.** The literal criterion is still **not met**, and the row is not in `passed`. **B rules** whether 44 (studio-lab) and 42 (guard) become the new baseline. The task already planned to re-baseline the guard at 16b-ii from these numbers.

### Auth guard
This ran at 1440×900 and at 1280×720, in fresh contexts (`g/g220.json`, screenshots `g/g-*.png`).
- `/studio-lab` opens anonymously, with the demo badge, `auth_user` null and the workspace present.
- `/studio/middle-east` shows "Sign in required", with 0 `audio[src]`, 0 `audio` and no workspace.
- `/api/studio-token?…` with no header gives 401. With a fake Bearer it gives 500 `{"error":"Unable to prepare Studio access"}`, because there is no :5199 mock.
- **No token is issued.** Premium auth is not bypassed.

### Docs
- **Doc 172.**
  - It has the 7 TEMPLATE `##` headings in order.
  - l.4 is byte-exact: `**სტატუსი:** In Progress (stage 1 of 2; C round 220 PASS)`.
  - Every cited row exists: LF1–5, ME4, ME9–12, PU5, TL1, TL4, TL5, TL6, TL8.
  - Every §2 item 9 topic is present: the facade and its map, the encoder option, the single consumer and the race (both error texts), the StudioContext freeze and progress (it matches StudioContext l.1185–1203), the notices, C-R219-01 with R-219-2..4, the drift rule TL4+TL5, and the TODOs (16b-ii, the rename, progress).
- **`studio-audio-pipeline.md`.**
  - The `git diff` hunks are at l.5, 273, 282, 316 (§7), 424 (§10) and 521, 542, 555, 565 (§12). All are inside the granted sections.
  - The file has 0 `loadFFmpeg`, `31MB`, `unpkg`, `CDN`, `FFW` or `FFmpeg` hits.
- **Mermaid.** I fetched mermaid 11.17.2 with `npm pack` into `/tmp` (no repo change, since removed). I ran `mermaid.parse` in a Chromium page. All 13 blocks parse: the 12 in the pipeline doc, including §7 (sequence), §10 and §12 (flowchart), and doc 172's sequence diagram (`mermaid-parse.json`).
- **Other test diffs.**
  - `export-progress-ui.test.tsx` changes only by the `loadFFmpeg` removal (import, mock key, const, reset, PU5 expectation). PU5 still asserts that ArrangementContext has no `utils/ffmpeg` and no `@ffmpeg/`.
  - In `mp3-encoder.test.ts` and `third-party-licenses.test.ts` the only removed lines are the 2 node imports (widened) and the old TL6 row (ruled). There is no churn on existing rows.

## Findings
- **C-R220-01 (Low, spec-baseline):** studio-lab and guard JS script counts rose by 1 (44/42 vs 43/41) because of a chunk split (`repeat-*.js`, the lucide icons out of `preload-helper`). Bytes are within budget, and the guard went down. It is not an eager load. B to re-baseline or rule.
- **Info, not a bug** (A disclosed it, and my probe confirms it): `GPLv` and `GPL.3` classify as clean. No lock spelling uses them.
- **Info:** on a fresh machine the first `/studio-lab` load can exceed 120 s (cold Vite). HR-MP3-WARMUP should allow a second goto.

## Ableton conformance
Not applicable on every row. This is a perf/refactor round (task §4), and the UI is unchanged.

## For B
- PERF-16b-i is code-complete and C-verified, except PERF-RUN-220's literal script-count criterion (C-R220-01).
- The 16b-ii precondition (a) is met: SOURCE-GREP gives 0 hits.
- LEGACY-UI-220 stays as open evidence for a later backend-enabled check.
