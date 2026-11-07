# C round 395: PERF-13c-ii-a fix-up, verdict PASS (browser-verified)

Tree: HEAD 1091b9e + 3 modified grant files (K2 `1091b9e 3`). Playwright Chromium, fresh context per row, 1440×900 and 1280×720, server warmed first (L38).
Evidence: `c-round-395/` (rows-*.json, log-*.txt, R1 screenshots, perf-results/, auth.json, claims-start/end.txt).

| Row | Result |
|---|---|
| **R1b SEEK-DURING-STALL** (bug C-R394-01) | PASS both viewports. Status `Loading…` → `“Middle East — public preview” is ready.`; 1 decode (101.35 s); 1 buffer start (101.35 s); toggle `Stop`; element has no `src`. Wave click → buffer start: **8287 ms (1440) / 8283 ms (1280)**, inside 7.5–11 s. `timeAfterSeek` 4.99 (matches B's sketch 8296/8300 ms). Before the fix: stuck Stop for 23.6 s. |
| R1 STALL-FALLBACK | PASS: 8352 ms both; 1 decode, 1 start, Stop, no src; live PCM +101.35 only. |
| R2 EXTERNAL-PAUSE | PASS: toggle `Preview`, no src, 0 decodes. |
| R3 NORMAL-20S (seek while playing) | PASS: element playing at 14.9 s, src kept, 0 decodes, 0 starts, no fallback text, PCM unchanged. Seek after `playing` does not arm the watchdog. |
| R4 END, R5 ABORT, R6 STOP, R7 PLAY-STOPS-PREVIEW | PASS: identical to round-394 values on every compared field (dec, starts, toggle, after2, dataPlaying) at both viewports. R6: `Preview` and 0 decodes 20 s after Stop. |
| PERF-RES (alone) | PASS: `pcm-live-mib-ready` 31.9 (≤60), `pcm-live-decode-mib-ready` 0 (≤0); `perf-results/`. |
| AUTH (fresh context, no credentials) | PASS: `/studio-lab` opens the demo; `/studio/some-premium-handle` shows "Sign in required", no workspace; `/api/studio-token` GET 400, POST 405 (refused). Premium not bypassed. |
| SOURCE-SCOPE | PASS: claims at start = end. Diff against planning output is only the §7 facts (K8 seek-restart/restart-field/progress-uses-restart 1, K10 25/PS26, K11 l.4, K18 no). K2 3 files, K3 11, K4 0 failures/1284, K9 unchanged. |
| DOC-252 | PASS: Georgian; 7 headings, none added; l.4 exact; title `(rounds 393–395)`; `round 394 PASS` count 0; seek-restart rule present (l.61–62); cited PS/MU ids exist. |
| gate | full vitest, typecheck, build, Biome, verify: not claimed (gate row). |

jsdom side check (informational, not in passed): `library-preview-stream.test.tsx` 25/25; A's mutants 15 RED, 0 survived.

No bugs. Caveats: R1b's 8.3 s fallback is by design (8000 ms watchdog); Ableton alignment is "consistent in direction", status not applicable / perf. Round-394 rows were re-run on this unpublished tree; they are evidence for gate 395, not a publication.
