# B round 90 planning probe: WAV export peak memory on the published tree (before GATE89-S2)

- **Date:** 2026-10-22. **Tree:** HEAD `35c84036577591b62b528a271337de565033bc28`, clean (`git status` empty). Dev server `:5173` 200.
- **Tool:** `mem-probe.cjs` (B's copy of C's round-90 `lib90.cjs` setup, outputs redirected to this folder). Headless Playwright Chromium, a fresh `chromium.launch()` per run, 1440×900, `/studio-lab` anonymous.
- **Method:** 10M demo project (3 demo sources, music clip Ctrl+D ×5 = `10:08.462`). After setup: CDP `HeapProfiler.collectGarbage`, 2 s, read `VmRSS`/`VmHWM` of every `--type=renderer` process from `/proc/<pid>/status`. WAV export to done, read again. The page renderer is the one with the large RSS (the other renderer stays at 7 MB).
- **This is B planning evidence, not C acceptance.**

| Run | before RSS / HWM (MB) | after RSS / HWM (MB) | ΔHWM (MB) | export ms | WAV |
|---|---|---|---|---|---|
| 1 | 345 / 450 | 740 / 1189 | 739 | 4757 | 29 206 176 frames, 24-bit/48k/2ch, RMS 0.172436459558, full 636, peak 1 |
| 2 | 345 / 447 | 740 / 1195 | 748 | — | same frames, RMS 0.172436459557 |
| 3 | 343 / 441 | 740 / 1189 | 748 | — | same frames, RMS 0.172436459558 |

- Exact status in every run: `WAV შეიქმნა: 10:08.462, 24-bit · 48 kHz · stereo.` No console errors.
- One 10M stereo float copy = 29 206 176 × 2 × 4 B ≈ 234 MB. Expected effect of the in-place clamp: ΔHWM about 234 MB lower. Round-91 limit for C: ΔHWM ≤ 639 MB (≥ 100 MB below the smallest baseline).
- Raw: `out/mem-5-run2.json`, `out/mem-5-run3.json`, `out/mem-5.json` (= run 3); run 1 was printed to the console (numbers above). The downloaded WAVs were deleted after parsing.
