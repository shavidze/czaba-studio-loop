# B probe — round 87 planning (SRW-20 stage 3), 2026-10-22

Environment: cloud runner, Playwright Chromium headless, `http://127.0.0.1:5173/studio-lab` (Vite dev), HEAD `971141d`, clean tree. Scripts in this folder; outputs `*-output.json`. Not C evidence.

## P1 — synthetic 300 s render + WAV encode (`probe.cjs`)
`{"renderMs":642,"clampMs":89,"encodeMs":251,"bytes":86400044,"suspends":19,"longTasks":[],"maxFrameGapMs":349}`
- Fact: an `OfflineAudioContext` 300 s render with 19 `suspend(t)` points scheduled before `startRendering()` resolved all 19 and completed (each resumed with `ctx.resume()`).
- Fact: the clamp loop + `encodeSfxWav` run synchronously on the main thread: about 340 ms in one block (max rAF gap 349 ms). The `longtask` observer reported nothing in headless mode, so rAF gaps are the usable measure.

## P2 — real UI, 5-minute project (`probe-ui2.cjs`, uses C's round-86 setup helpers read-only)
- Setup: C's `X.setup` (music 0.35 s + 101.352 s, stems 2 s + 16 s, sfx 4 s + 2 s) → project 01:41.702. **Click the music clip once, press Ctrl+D twice** → the Export dialog shows `მთელი პროექტი · 00:00.000 — 05:04.406`.
- 101.702 s project WAV export (`probe-ui2-output.json`, first run where Shift-click selection did not duplicate): 351 ms, max rAF gap **201 ms**, frames 4 881 696.
- 304.406 s project WAV export (`probe-ui3-output.json`): 855 ms click→download, frames 14 611 488, max rAF gap **445 ms** (next gaps 57, 48, 46 ms), overload warning `+1.7 dBFS — 498 sample`.
- Inference: the main-thread block grows linearly with length (clamp + measure + 24-bit encode). This is what stage 3 must move off the main thread.

## P3 — 300 s MP3 conversion via the frozen util (`probe-mp3.cjs`)
`loadMs 4586, convMs 1797, mp3 2 668 845 B, progress events 6 (t≈133/627/1127/1627/1792 ms; progress 0 → 0.264 → 0.578 → 0.892 → 1), top rAF gaps 44/32/18 ms`
- Fact: ffmpeg.wasm 0.12 already runs `exec` in its own worker; during conversion the main thread stayed responsive (max gap 44 ms).
- Fact: the FFmpeg instance's `progress` event fires about every 500 ms with `progress` 0..1 for WAV → MP3.
- Fact (source read, `node_modules/@ffmpeg/ffmpeg/dist/esm/classes.js` 0.12.15): a `{ signal }` abort only rejects the pending promise (l.74-76); only `terminate()` (l.186-198) stops the worker. After `terminate()` the instance needs `load()` again. The frozen `app/utils/ffmpeg.ts` caches the instance with `isLoaded = true` and never resets it, and a hung load leaves `isLoading = true` with a 100 ms poller that never stops (GATE86-S1).

## Conclusions used in the round-87 task
1. "Encoding off the main thread" means the clamp, overload measurement and 24-bit WAV encoding. MP3 encoding is already in ffmpeg's worker.
2. R20-X4 threshold: the max rAF gap during a 5-minute export must be ≤ 150 ms. This is a B estimate. Baseline is 445 ms at `971141d`; normal headless gaps are about 45–57 ms. 150–250 ms is reported and triaged by B; above 250 ms is a FAIL.
3. Progress needs three sources: render (`suspend` points), WAV encoding (worker messages), MP3 (ffmpeg `progress` event).
4. Cancel (stage 3b) and a retry after a timeout need an encoder that can `terminate()` and reset. The frozen util can do neither, so the lab gets its own encoder module, starting in stage 3a (load/reset/progress); 3b adds abort.
