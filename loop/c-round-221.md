# C round 221 — PERF-16b-ii verification (`@ffmpeg/*` removed; notices, TL9, docs)

**Verdict: PASS.** `browserVerified` = `realVerified` = true. All 5 browser rows ran in Playwright Chromium at 1440×900 and 1280×720. 13 rows passed. DEPS-221 is not met on its literal wording only: an empty `node_modules/@ffmpeg/` directory remains (C-R221-01, Low, B to rule). LEGACY-OWNERSHIP-221 is BLOCKED because the backend is unavailable in the cloud. Gate rows are not claimed.

Ableton conformance: not applicable on every row (dependency-removal, test and docs round; task §4).

Environment: HEAD `521eb27` (root's deps commit, parent `c4e6c9d`). The dev server (`remix vite:dev`, :5173) started at 06:51:01, after the commit time 06:50:56. The :5199 mock was not running. `env-status.json` round 221, store 200. Evidence lives under `c-round-221/`.

## Rows

| Row | Result | Evidence |
|---|---|---|
| SCOPE-221 (start + end) | PASS | <ul><li>HEAD `521eb27` "chore(deps): remove @ffmpeg/ffmpeg @ffmpeg/util (root, OSS plan approved by Saba)", directly on `c4e6c9d`; `--stat` shows only `package.json` (2) and `package-lock.json` (32).</li><li>Tree: the 8 grants `M` and doc 173 `??`.</li><li>Frozen `sha256sum -c`: rc 0 at start and end.</li><li>`vite.config.ts`, `package*.json`: identical to HEAD; no `root-grant-r221-vite.json`.</li><li>`root-deps-done.json` has the `521eb27` entry.</li><li>No `build/` or `test-results/` left.</li></ul>`scope-start.txt`, `scope-end.txt` |
| DEPS-221 | **NOT MET (literal)**: C-R221-01 | <ul><li>The diff is exactly B's scratch result: 2 `package.json` lines, 2 root dependency lines and the 3 `node_modules/@ffmpeg/{ffmpeg,types,util}` lock entries.</li><li>`npm ls`: `(empty)`.</li><li>`require.resolve` gives MODULE_NOT_FOUND for all 3.</li><li>**But `node_modules/@ffmpeg/` exists as an empty directory** (mtime 06:50, left by root's uninstall).</li></ul>`deps.txt` |
| UNIT-221 | PASS | <ul><li>`CI=true` run of the 5 files: 115/115, rc 0.</li><li>TL9a–d at l.516, 521, 527 and 534, all green.</li></ul>`unit-run.txt` |
| REDPROOF-221 | PASS | <ul><li>A's logs: (a) TL9b red, naming the 3 keys (collateral TL5, TL9c); (b) TL9a red (TL6); (c) only TL5; (d) TL9d.</li><li>**C's own probe** (Vite transform redirects the lock read to `/tmp`-style copies under `probe/`; the repo lock is never edited):<ul><li>an identical-copy control gives 67/67;</li><li>the copy with `node_modules/@ffmpeg/core` GPL-2.0-or-later turns TL9b red (`['node_modules/@ffmpeg/core']`) and TL4 red with `classification: copyleft`; collateral TL4-anchors, TL5, TL6 and TL9c.</li></ul></li><li>Repo lock sha256 unchanged.</li></ul>`probe/` |
| NOTICES-221 | PASS | <ul><li>The diff is only `(563)` → `(560)` plus the 3 `@ffmpeg/*` rows removed.</li><li>The independent checker gives 560 rows: 0 missing, 0 extra, 0 licence mismatches, 0 bad links, order OK.</li><li>0 `@ffmpeg` in the file.</li></ul>`notices.diff`, `notices-indep.json` |
| SOURCE-GREP-221 | PASS | <ul><li>0 hits in `app/` (non-test).</li><li>The docs have 5 hits, each a path with the legacy note: `studio.md:45`, `:417`, `:627`, `debug-studio.md:101`, `02-audio-studio-system.md:247`.</li><li>0 `loadFFmpeg`, `FFmpeg.wasm`, `@ffmpeg`, `3–5MB` or `31 MB`.</li></ul>`source-grep.txt` |
| LEGACY-UI-STUBBED-221 | PASS (4/4 runs) | See below. |
| LEGACY-OWNERSHIP-221 | BLOCKED | Backend unavailable in cloud. |
| LAB-MP3-221 | PASS | <ul><li>`czaba-studio-lab.mp3`: 4224 audio frames plus a Xing frame, all 320 kbps, 48 kHz, joint stereo; the walk ends at EOF.</li><li>Duration 101.376 s, inside [101.352, 101.452].</li><li>Decoded: 2 ch, RMS −15.29 dBFS (round 220: −15.29).</li><li>0 page errors, 0 navigations, 0 off-origin requests, 0 unpkg.</li><li>The encoder chunk was not loaded on page load.</li><li>Run 3 was measured. Run 1 hit the cold-load 120 s timeout and run 2 a Vite dep-optimisation reload; both are invalid warm-ups, as in round 220.</li></ul>`exports/` |
| STUDIO-SMOKE-221 | PASS | <ul><li>WAV at 1280: PCM, 2 ch, 48 kHz, 24-bit.</li><li>4,864,896 frames = "WAV created 01:41.352" × 48 000 (diff 0).</li><li>RMS −15.29, non-zero fraction 0.9977, 0 page errors.</li><li>Repeated at both viewports inside G221: diff 0.</li></ul>`exports/wav-1280x720-5173.json`, `g/g221.json` |
| DEV-START-221 | PASS | <ul><li>The dev log is not available (stdout is a pipe of PID 3061).</li><li>Browser console on `/studio-lab` at both viewports: 0 `optimizeDeps` or `ffmpeg` lines.</li><li>`/studio-lab` → 200.</li><li>The Vite dep cache (`node_modules/.vite/deps`, `_metadata.json`) has 0 ffmpeg entries.</li></ul>`g/g221.json`, `an/cited-and-cache.txt` |
| BUNDLE-221 | PASS | <ul><li>`npm run build` rc 0.</li><li>0 files with `ffmpeg`, `unpkg.com` or `@ffmpeg` in `build/client` and `build/server`.</li><li>`mp3-encoder.client-DnFo_ChB.js` has `AGFzbQ` ×1.</li><li>The `routes/studio.$productId` manifest (21 imports) and `studio-lab` (18) import no encoder, mediabunny or ffmpeg chunk.</li><li>`build/` removed.</li></ul>`bundle.txt`, `build.log` |
| PERF-RUN-221 | PASS | <ul><li>rc 0, `complete` true, `failures []`.</li><li>Every `res.js.*` median is **identical** to round 220: studio-lab 356313/1127455 B with 44 scripts, home 263114/825842 B with 41, guard 285596/915456 B with 42; third-party 0 on each.</li><li>The sentinels `latest.json` and `latest-interactions.json` were untouched.</li><li>`test-results/` removed.</li></ul>`perf-run-1.{log,json,rc}`, `sentinel-*.txt` |
| G221-3 | PASS (both viewports) | <ul><li>`/studio-lab` anonymous: 200, demo badge, `auth_user` null, workspace present.</li><li>`/studio/middle-east`: "Sign in required", 0 `audio[src]`, 0 `audio`.</li><li>Token with no header → 401; fake Bearer → 500 "Unable to prepare Studio access" (no :5199 mock).</li><li>No token issued. 0 page errors.</li></ul>`g/` |
| AN-REVIEW-221 | PASS | See below. |
| gate | not claimed | — |

### LEGACY-UI-STUBBED-221 (own script `c221-legacy.cjs`)
- **Setup.** A fresh context per run, real mouse.
  - A fake `auth_user` is set by an init script.
  - `context.route` stubs answer on :5199: OPTIONS 204, profile, downloads (`middle-east`), cart, everything else 404, with CORS echoing the Origin.
  - `studio-token` is stubbed.
  - The R2 proxy returns synthetic 4 s, 48 kHz, stereo, 16-bit sines at 220 + 55·n Hz, one per stem.

| Run | File | Audio frames | Bitrate | Format | Walk | Decoded | Page errors | Off-origin in export window |
|---|---|---|---|---|---|---|---|---|
| Low 1440×900 | `Middle East-export.mp3` | 168 + Xing | 128 ×168 | MPEG-1/III, 48 kHz, joint stereo | EOF | 2 ch, 4.032 s, −10.92 dBFS | 0 | 0 |
| Medium 1440×900 | same | 168 + Xing | 192 ×168 | same | EOF | 2 ch, −10.74 | 0 | 0 |
| High 1440×900 | same | 168 + Xing | 320 ×168 | same | EOF | 2 ch, −10.48 | 0 | 0 |
| High 1280×720 | same | 168 + Xing | 320 ×168 | same | EOF | 2 ch, −10.48 | 0 | 0 |

- **Export window.** The requests are only same-origin: the worker, `mp3-encoder.client.ts` and `.vite/deps` `mediabunny` / `@mediabunny_mp3-encoder`. This is the lazy, same-origin load the docs now claim. There are 0 unpkg requests.
- **Fonts at page load.** `fonts.googleapis.com` and `fonts.gstatic.com` are requested at page load only, not in any export window.
- **Recorded, pre-existing (B-R220-LEGACY-EXPORT-NO-STEMS, round 222):** in all 4 runs, the initial checked count was **0 of 10** and "Export Audio" was disabled. "Select All" gives 10/10. This matches B's value, so it is not news. Screenshots: `legacy/{Low,Medium,High}-1440x900-dialog-initial.png`, `legacy/High-1280x720-dialog-initial.png`.
- **What this proves.** The client export path runs through the real dialog in real Chromium. **It proves nothing about ownership or auth** (LEGACY-OWNERSHIP-221 is BLOCKED).
- **Info.** The first Low run timed out at 180 s on the cold `/studio/middle-east` route. That run is invalid and was re-run. HR-MP3-WARMUP covers `/studio-lab` only.

### AN-REVIEW-221
- **Doc 173:**
  - the 7 TEMPLATE `##` headings are in order;
  - l.4 is byte-exact `**სტატუსი:** Completed (C round 221 PASS)`;
  - it covers the deps commit made by root (`521eb27`), the 3 lock entries, the notices diff, TL9, the doc sweep and the kept-mentions table, VITE-EXCLUDE-STALE, the C-R220-01 baseline, LEGACY-UI-STUBBED-221 with its "does not prove ownership" note, and all 4 TODOs (plus VITE).
- **Rows doc 173 cites all exist:** TL5 l.398, TL6 l.407/417, TL8 l.485/491, TL9a–d l.516–534, the 4 covering files and `mp3-encoder.client.ts` (`an/cited-and-cache.txt`).
- **Doc 172:** `git diff` shows only l.4, byte-exact.
- **Hunks:** the checker places all 28 `-U0` hunk lines in the 5 granted docs inside the granted sections; old-side lines are checked against the old headings. A mutant that drops `## Dependencies` flags 4 lines. Evidence: `an/hunks.cjs`, `hunks.json`, `hunks-mutant.txt`.
- **Granted sections:** 0 `loadFFmpeg`, `FFmpeg.wasm` or `@ffmpeg`.
- **Mermaid:** parsed with C's own mermaid 11.17.2 pack (`/tmp/c221-mermaid`) in Chromium. 9/9 blocks parse: all 6 in `02-audio-studio-system.md`, doc 173's block and 2 in `learning/README.md` (`an/mermaid-parse.json`). The Export Pipeline keeps its ids and edges; only labels changed.
- **Claims checked against the code:**
  - `convertWavToMp3(wavBlob: Blob, bitrate: string = '320k')` with a throw on other values (`app/utils/ffmpeg.ts` l.8–12);
  - the `StudioContext` mapping low/medium/high → 128k/192k/320k (l.1188–1190);
  - `OfflineAudioContext` mixdown (l.1117);
  - mediabunny and mp3-encoder 1.62.1, both MPL-2.0 in the lock; `wavesurfer.js` `^7.12.1` (docs say `^7.x`).
- **Signature deviation.** A's doc uses the real signature instead of the task's union type. That is correct and not a finding.

## Findings for B
- **C-R221-01 (Low; B to rule): an empty `node_modules/@ffmpeg/` directory.**
  - Measured: 0 entries, mtime 06:50 (root's `npm uninstall`). The packages are unresolvable and `npm ls` is empty. `node_modules` is gitignored, and no committed file produces the directory.
  - DEPS-221's wording, "No `node_modules/@ffmpeg` directory", is literally not met; its intent, "packages not installed", is met.
  - Not A's: A was forbidden deletions and reported it. C did not remove it either, to keep the evidence.
  - A fresh `npm ci` would not create it.
  - B should either re-word the criterion as "no installed `@ffmpeg` package" or ask root to `rmdir` it. It does not affect the published tree.
- **A-R221-REVIEW-L1 (Low, carried from A's reviewer):** old non-ffmpeg errors remain inside granted sections: React v19 vs `^18.3.1`, Firebase v10 vs `^12.6.0`, and "Shopify Hydrogen" (not a dependency). This is outside the round's scope; suggest `deferred_low_polish`.
- **Recorded, not new:** B-R220-LEGACY-EXPORT-NO-STEMS, initial 0/10, for round 222.
- **Root, still open:** VITE-EXCLUDE-STALE (`b-round-220-root-request-vite.md`) and the §1.4 `.claude/**` / `.codex/**` proposal.
