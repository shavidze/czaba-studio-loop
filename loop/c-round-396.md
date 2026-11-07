# C round 396 — PERF-13c-ii-b (stage 3 of 3): PASS, browserVerified true, 0 bugs

Real Chromium (Playwright) on http://127.0.0.1:5173/studio-lab at 1440×900 and 1280×720, fresh context per row. Evidence: `c-round-396/` (rows-*.json, log-*.txt, perf-results/, auth.json, claims-*.txt).

| Row | Result | Evidence |
|---|---|---|
| SOURCE-SCOPE | PASS. Claims at start differ from planning output only in the §7 facts. Claims at end equal A's `claims-end.txt`. `git status` = the 8 grants. Frozen manifest 0 failures (1279 OK), protected 11 OK. K14: only `collection.ts` builds the purchased adapter. | claims-start/end.txt, k14.txt |
| PERF-RES (alone, first) | PASS. `res.harness.preview-stream-playing` 1 (≥1); `pcm-live-preview-delta-mib` 0 (≤0); `pcm-live-preview-decode-count` 0 (≤0); `pcm-live-mib-ready` 31.9 (≤60); `pcm-live-decode-mib-ready` 0 (≤0); failures `[]`; 27/27 asserts pass. All other `res.mem.pcm-*` = C395 = B sketch (31.9 / 7 / 0 / 69 / 8 / 37.1). `mem-polls` counts differ slightly (8/14/19/32 vs C395 9/17/18/34), asserts pass. | perf-results/latest-resources.json, run.log |
| R8 CROSSORIGIN | PASS both viewports: `crossOrigin` = `anonymous`, playing (paused false, t 3.95 s), 0 decodes, 0 buffer starts, toggle `Stop`. Same as B sketch. | rows-R8.json |
| R1b | PASS: fallback, 1 decode + 1 start of 101.35 s; click → start 8.28 s (window 7.5–11) | rows-R1b.json |
| R1 | PASS: 101.35 s decode/start once, no further requests after fallback | rows-R1.json |
| R2, R4, R5, R6, R7 | PASS, values identical to C round 395 (R2 hasSrc false/Preview; R4 Preview; R5 fallback then re-preview; R6 stops and stays Preview; R7 Space plays, preview stops, 0 decodes) | rows-R2/4/5/6/7.json |
| R3 | PASS: 0 decodes, 0 starts, element playing at 14.91 s | rows-R3.json |
| AUTH | PASS: fresh context no credentials opens demo (arrangement-status present); `/studio/some-premium-handle` shows "Sign in required", no workspace; `/api/studio-token` GET 400, POST 405 | auth.json |
| DOCS | PASS: doc 252 Georgian, 7 TEMPLATE headings in order, l.1 `(rounds 393–396)`, l.4 exact, 0 `pending`, 4 `In Progress (stage` files, doc 248 diff = 1 line (l.4). Cited PV/PS/MU ids exist in tests/mutant logs; D-ids and cited files exist. | git diff, grep |
| PURCHASED-PREVIEW-BROWSER | BLOCKED "no mount point: SRW-21 deferred_user" (does not set browserVerified false) | k14.txt |
| gate | full vitest, typecheck, build, Biome, verify — not claimed | gates/gate-round-396.json |

C also re-ran collection.test.ts + library-preview-stream.test.tsx: 49 passed (jsdom-only rows PV1, PV2, PS27, PS28 rely on A's mutants).

Ableton: not applicable / perf (consistent in direction with Live preview not loading into the Set).
Note (Low, not a bug): PS29 title wording "credential-free" per A's note. L57 check: OK.
