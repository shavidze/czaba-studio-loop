# B round-85 planning probe: ffmpeg.wasm under Vite dev (2026-10-22, Playwright Chromium, Linux runner)
1. Real app (:5173, store HEAD 51e024a, no source change): page.evaluate import('/app/utils/ffmpeg.ts') -> loadFFmpeg()
   => never settles (150 s race timeout); request FAILED /node_modules/.vite/deps/worker.js?worker_file&type=module net::ERR_FAILED.
   Evidence: ffprobe.cjs, ffprobe-output.txt.
2. Scratch Vite 5.4.21 (:5191, own root/cacheDir, store untouched), FFmpeg.load from unpkg core 0.12.6:
   - optimizeDeps.exclude ['@ffmpeg/ffmpeg','@ffmpeg/util'] -> 'loaded' in 3198 ms.
   - control (no exclude) -> timeout 60 s, FAILED .../deps/worker.js (same symptom as 1).
   Evidence: vite.probe.config.mjs, vite.control.config.mjs, p2.cjs, control-output.txt.
Confirmed fact: dep pre-bundling breaks the ffmpeg worker URL in dev, and loadFFmpeg hangs (no rejection) when the worker fails.
Inference (not yet observed in the Remix app): adding the same exclude to store/vite.config.ts fixes /studio-lab.
unpkg.com is reachable from the runner's Chromium.
Both scratch servers were stopped; :5173 stayed 200 throughout.
3. Two scripted downloads (dl2.cjs, dl2-output.txt): on /studio-lab, two blob anchors clicked 1 s apart after an await, with and without a preceding real click
   -> Playwright Chromium delivered both download events in both modes. Real desktop Chrome may still ask "download multiple files" -> Tech Lead R86-T.
