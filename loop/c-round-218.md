# C round 218 — PERF-16a verification (lab MP3 export through mediabunny + LAME)

**Verdict: PASS**, with 1 spec-baseline finding for B (C-R218-01, low).
- `browserVerified` and `realVerified` are true: every browser row of the task ran in the cloud.
- PERF-RUN-218 ran but is **not** in `passed`: its literal criterion "guard 42" is not met. The cause is benign and proven (§3).
- Gate rows (full suite, verify, e2e smoke, gate perf) are not claimed.

**Method.** Playwright Chromium 143.0.7499.4, a fresh context per run, no credentials. Storage state: `c-browse.json`. A's claims were not trusted; every number below comes from C's own runs.

**Evidence.** All under `c-round-218/`:
- `checkpoint.md`;
- `cover.log`;
- `mutant/`;
- `g218.cjs`, `shots/g218.json` and its screenshots;
- `c218-mp3.cjs`, `mp3/*.json` and `mp3/*.png` (18 screenshots);
- `build.log` and `base-build.log`;
- `perf-run-1.{log,json,rc}`, `perf-compare.txt` and `sentinel-*.txt`;
- `guard-scripts.{cjs,txt}`;
- `grants-end-sha256.txt`.

## 1. Rows
| Row | Result | Evidence and key numbers |
|---|---|---|
| SCOPE-218 (start + end) | PASS | <ul><li>HEAD is `13c7805` `chore(deps): add mediabunny@1.62.1 @mediabunny/mp3-encoder@1.62.1 …`. Its parent is `8873ece`, and it changes only `package.json` and `package-lock.json` (+50).</li><li>Status: 4 M (the grants) and 1 ?? (doc 170).</li><li>Frozen 1,059-file list: rc 0 at the start and at the end.</li><li>Every grant start copy equals the `granted-start-sha256` list.</li><li>`node_modules/mediabunny` is 1.62.1.</li><li>HEAD is unchanged at the end. The end hashes of the grants are in `grants-end-sha256.txt`.</li></ul> |
| STRINGS-218 | PASS | <ul><li>`strings.diff`: exactly `mp3FormatNote`, `encoderLoading` and `encoderLoadFailed` changed, in both files, to the §1.7 values.</li><li>The L23 grep hits only `strings.ts`, `strings.test.ts` and `docs/technical/diagrams/studio-audio-pipeline.md`.</li></ul> |
| API-218 | PASS | <ul><li>The three exports and their signatures are unchanged.</li><li>`ARRANGEMENT_MP3_CORE_BASE_URL` has 0 hits in app, e2e and perf.</li><li>The module has no `@ffmpeg`, no `unpkg`, no `arrayBuffer(` and no ` as `.</li><li>`registerMp3Encoder()` is called only inside the load (l.85–89).</li><li>The 8 covering files pass: 129/129. The slowest is `export-mp3` at 2,734 ms, against 2,845 ms at gate 217. Every per-test time is well under 50 % of 5 s; the longest single test is MX10 at 782 ms.</li><li>Rows ME1–ME9 exist by id, including ME3(a)–(d).</li></ul> |
| REDPROOF-218 | PASS | <ul><li>A's logs: (a) fails ME4, (b) ME1, (c) ME8 (plus others), (d) ME9, (e) ME3(c), (f) ME3(b)-init.</li><li>**C's own mutant**, on a `/tmp` copy redirected by a vite resolve plugin (the source file was untouched, `sha256 -c` OK): drop `input.dispose()`. Result: rc 1, failing ME4, ME7, ME3(b)×2 and ME6.</li><li>Control: the same harness with an unmodified copy gives 14/14. Nothing hung.</li></ul> |
| MP3-REAL (dev, 1440 + 1280) | PASS | <ul><li>`czaba-studio-lab.mp3`, 4,055,208 B. The dialog shows `MP3 created: 01:41.352, 48 kHz · stereo.`</li><li>C's own frame walk: 1 leading Xing frame (`fffa4464`, 56 kbps, 168 B, reported separately), then **4,224 audio frames, every one MPEG-1 Layer III, 320 kbps, 48 kHz, joint stereo**, padding 0 and no CRC. The walk ends exactly at EOF.</li><li>4,224 × 1152 / 48000 = **101.376 s**, inside [101.352, 101.452].</li><li>`decodeAudioData`: 101.376 s, 2 ch, RMS **−15.29 dBFS**. C's own WAV export of the same mix today is also −15.29, so Δ = 0.00 dB. The non-zero fraction is 0.9974.</li><li>0 page errors.</li></ul> |
| MP3-NET (dev + PROD) | PASS | <ul><li>From the Export click to done: 0 off-origin requests and 0 `unpkg`/`ffmpeg` URLs, in 6 dev runs and 2 PROD runs.</li><li>PROD requests after the click: `export-wav.worker-*.js`, `mp3-encoder.client-D2bNsprj.js` and one `blob:` worker.</li><li>A MutationObserver logged the status sequence: `Loading MP3 encoder…` (progress label) and then `Loading the MP3 encoder (LAME)…` are **visible before `Creating MP3`**, for about 60–100 ms (for example at 750 → 773 → 848 ms after the click).</li><li>Long tasks over 50 ms after the click: 0 in every run (the encode runs in the worker). Recorded only.</li></ul> |
| MP3-CANCEL (dev, 1440) | PASS | <ul><li>Cancel was clicked with the real mouse while the label read `Creating MP3 · 0%`. The encode had reached 4 %, and the cancel message appeared at +1,099 ms.</li><li>The message is exactly `Export cancelled — no file was created. The MP3 encoder will load again on the next MP3 export.` There is no failed/error text and 0 downloads.</li><li>No `Creating MP3 · N%` appeared after the cancel. The progress element was gone at 0 s and at 2 s.</li><li>A `blob:` worker was observed before the cancel. **0 blob workers 2 s after the cancel**, and `page.workers()` was 0 before and after.</li><li>The second export completed with a valid MP3: 4,224 frames, all 320 kbps, 48 kHz, EOF, RMS −15.29. A blob worker was seen during it, and 0 remained 2 s after.</li></ul> |
| MP3-BOTH (dev, 1280) | PASS | <ul><li>`WAV and MP3 created: 01:41.352, …`</li><li>`czaba-studio-lab.wav`: PCM, 24-bit, 48 kHz, 2 ch, **4,864,896 frames**, RMS −15.29.</li><li>`czaba-studio-lab.mp3` passes the same checks as MP3-REAL.</li></ul> |
| MP3-RANGE (dev, 1440) | PASS | <ul><li>A real-mouse drag in the clip body (the range zone) made the selection. The dialog shows `Time selection · 00:01.025 — 00:04.025 (3.000 s)`, so L = 3.000.</li><li>`czaba-studio-lab-range.mp3`: 126 audio frames, all 320 kbps, 48 kHz, EOF. That is **3.024 s**, inside [3.000, 3.100]; decoded 3.024 s.</li><li>RMS −22.25 dBFS and non-zero fraction 0.9966, so it is not silent.</li></ul> |
| DIALOG-COPY (1440 + 1280) | PASS | <ul><li>The note `<span>` reads exactly the new `mp3FormatNote`.</li><li>New text: 2 lines (Range client rects), 32 px high, 443 px wide. Old text, swapped into the live element: also 2 lines, 32 px. The restore was verified.</li><li>No overflow on the note or its parent.</li><li>The body text never contained CDN, 31 MB, ffmpeg or unpkg, idle or at any status change during an export.</li></ul> |
| PROD-BUNDLE | PASS | <ul><li>C's own `npm run build` (rc 0).</li><li>The only client chunk with mediabunny/LAME (`WebAssembly`, `mediabunny`) is `mp3-encoder.client-D2bNsprj.js`: 687,512 B raw, **227,410 B gzip −9** (227,880 B at gzip −6), ≤ 1 MiB. The server build has a 0.16 kB stub.</li><li>`build/client/.vite/manifest.json` is absent, confirmed independently. C used Remix `manifest-f8812613.js`, the same method deviation as A. `routes/studio-lab` + 17 imports + root + entry hold no encoder. `studio-lab-*.js` has only `import("./mp3-encoder.client-D2bNsprj.js")`, and "mediabunny" appears there only in the note text.</li><li>Live PROD on :5188: `/studio-lab` loads **43 scripts, none the encoder**. The encoder chunk is fetched only after Export MP3.</li><li>The PROD MP3 at 1440 passes every MP3-REAL check.</li><li>`worker-BAOIWoxA.js` is the legacy ffmpeg worker, which 16b owns.</li></ul> |
| PERF-RUN-218 | **not passed (C-R218-01)** | <ul><li>Ran alone: rc 0, `complete`, `failures []`, 79 s.</li><li>30 deterministic medians equal round 217. The 6 byte rows are within 4,096 B (largest \|Δ\| 761).</li><li>Scripts: studio-lab 43/0 and home 41/0 are unchanged; **studio-guard 42 → 41** (with `js-studio-guard-seen` 42 → 41), [41,41,41].</li><li>Sentinels `latest.json` and `latest-interactions.json` (mtime 2026-10-01, 19 B) had the same mtime, size and sha after the run. C removed them afterwards.</li></ul> |
| G218-3 (1440 + 1280) | PASS | <ul><li>`/studio-lab` opens anonymously with the demo badge and `auth_user` null.</li><li>`/studio/middle-east` shows "Sign in required" with 0 `audio[src]` and 0 `audio`.</li><li>Token with no header: 401. With a fake Bearer: 500 (the :5199 mock is not running). **No token issued.**</li></ul> |
| STUDIO-SMOKE-218 (1440 + 1280) | PASS | <ul><li>`czaba-studio-lab.wav`: PCM, 2 ch, 48 kHz, 24-bit, 4,864,896 frames.</li><li>`WAV created: 01:41.352`, frame difference 0.</li><li>RMS −15.29 and non-zero fraction 0.9977.</li><li>0 page errors.</li></ul> |
| AN-REVIEW-218 | PASS | <ul><li>All 7 TEMPLATE `##` headings, in order.</li><li>l.4 is byte-exact.</li><li>Cited rows ME1–ME9 and ME3(a)–(d) exist.</li><li>The bundle numbers 687,512 / 227,410 equal C's measurement (0 %).</li><li>§1.2 narrowing, §1.5 "not zero bytes copied" wording, the licence note (LAME LGPL inside MPL-2.0 `@mediabunny/mp3-encoder`; `mediabunny` MPL-2.0 confirmed in its package.json) and the 16b handoff are all present.</li></ul> |
| gate | not claimed | — |

## 2. Ableton conformance
| Behaviour | Result |
|---|---|
| MP3 is CBR 320 kbps (Live 12 manual §5.1.3.3) | **Confirmed**: every audio frame is 320 kbps. |
| MP3 next to PCM | Known existing difference (the WAV + MP3 radio), unchanged. |
| Encoder download | Not applicable. Ours comes from our own origin, with no CDN. |

The CZABA requirement is met. The joint-stereo channel mode is LAME's default; Live's manual does not state a channel mode, so that part is unconfirmed.

## 3. Finding for B
**C-R218-01 (low; a spec-baseline finding, not a product defect; close it by ruling, do not defer it).** The PERF-RUN-218 criterion expects "guard 42/0". The measured value is 41/0, deterministic, with guard encoded bytes −761.

**Proof.** C built `8873ece` from a `git archive` in `/tmp/c218-base` (the repo was untouched) and served both builds:
- At baseline, the guard loaded `index-CKxerpgD.js` (5,627 B, the `@ffmpeg/ffmpeg` class code). The old `mp3-encoder.client` chunk and `studio._productId` shared it.
- In the new build, `mp3-encoder.client` no longer imports `@ffmpeg`, so Rollup inlined that code into the guard's chunks.
- The static route graphs are identical: studio.$productId 38, studio-lab 40, index 38.

This is not an eager load. No change inside the grants can restore 42 without breaking API-218.

**Suggested ruling:** the guard baseline becomes 41/0, and the next comparison uses `c-round-218/perf-run-1.json`. 16b will move it again when `@ffmpeg/*` leaves. The §6 "fix-up: import boundary" outcome does not apply: there is nothing to fix.

## 4. Info for B (not bugs)
- **Joint stereo.** Every audio frame is mode `01`, and decoding gives 2 channels. C accepted it as "stereo"; please state it in later MP3 criteria.
- **Dev re-optimise.** `node_modules/.vite/deps` already held mediabunny when C started. Across the 6 dev runs: 0 navigations after Export and 0 HTTP 504 responses. A's run-1 log is the only evidence of the reload. Info for 16b.
- **`encoderLoadTimeout`.** It still says "Check your internet connection". It is outside the three §1.7 strings; for 16b/B.
- **Legacy `/studio/:productId` MP3 path.** It is untouched, and it is BLOCKED (backend unavailable in the cloud).
- **Root reviewer.** A's Architecture note stands: module-wide reset cancels every in-flight encode; this is safe only with one export at a time.
