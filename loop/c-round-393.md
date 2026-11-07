# C round 393: PERF-13c-i verification — PASS (browserVerified true)

Real Chromium (Playwright), http://127.0.0.1:5173/studio-lab, fresh context per row, 1440×900 and 1280×720. Probes: `c-round-393/probe.mjs`, `probe2.mjs`. Data: `rows-1440x900.json`, `rows-1280x720.json`, `rows-extra.json`, `perf-res.log`.

| Row | Result (both viewports identical unless noted) |
|---|---|
| S1 STREAM | Middle East: element src `/middle-east.mp3`, playing, currentTime 0.51 after ~650 ms; 0 decodes, 0 buffer starts; live PCM before = after `[2,5,16,16,16,16,16]`; no `Loading…` text; toggle `Stop`. PASS |
| S2 STOP | paused, no `src`, networkState 0, toggle `Preview`. PASS |
| S3 HERO | same with `/videos/hero/hero-music.mp3`. PASS |
| S4 SEEK | click at 50 %: same single element, still playing, currentTime 51.40 s, aria-valuenow 51; 0 decodes. PASS |
| S5 END | click at 98 %: `ended` after 2.7 s, toggle `Preview`, status unchanged, no second element. PASS |
| S6 | Space with Full mix placed: data-playing true, element paused/no src, toggle `Preview`. PASS |
| S7 | transport playing (verified true) then Preview: data-playing false, element plays (1.76 s). PASS (first script run had a probe bug, redone in probe2) |
| S8 UNMOUNT | exit link: recorded element paused, no src, currentTime unchanged 1 s later. PASS |
| S9 FALLBACK | media aborted: `Loading…` → `is ready.`, one decode 101.35 s, one start 101.35 s, `Stop`; second Preview creates no new element (remembered). PASS |
| S10 SYNTH | Full mix: one 16 s buffer start, 0 media elements, 0 decodes. PASS |
| S11 | delayed fallback superseded by Full mix: Loading → ready, final text not the loading text, Full mix 16 s started, 0 pageerror. PASS |
| PERF-RES | alone, rc 0: pcm-live-mib-ready 31.9 ≤ 60, decode-mib-ready 0 ≤ 0. PASS |
| AUTH | fresh no-credential context: /studio-lab opens demo; /studio/<handle> shows "Sign in required", 0 workspace; /api/studio-token GET 400, POST 405 (no token issued). PASS |
| Neighbours (both viewports) | Add after streamed preview: one 101.35 s decode, clips 3→6 locator matches (one clip); ArrowRight on wave moves 51.41→52.84; first load reaches `Demo collection ready.` PASS |
| SOURCE-SCOPE | claims start = planning + A's listed deltas; end = start; 7 status lines (5 M + 2 new), all granted; frozen manifest 0 failures; protected 11/11. PASS. K13/K15/K22 deltas absent from §7 but explained by spec/sketch (info, B spec) |
| DOC-252 | Georgian; 7 TEMPLATE headings in order; l.4 exact; PS1–PS15 each exist; cites premise-head.json. PASS |
| Covering tests | stream + demo + eviction files: 65 passed. No `as`/`any`/ts-ignore found in new test/preview.client |
| gate | full vitest/typecheck/build/biome/verify: `gate`, not claimed |

Ableton: not applicable / perf; consistent in direction (Live previews from disk), no identical-behaviour claim.
Not verified: C did not re-run A's mutants (relies on A's logs); REV-B393-M1-STALL deferred to 13c-ii per task. Bugs: none.
