# C round 406 — PERF-11c-iii-d-i: PASS

browserVerified/realVerified: true. No bugs. Evidence in `c-round-406/`; machine-readable `c-round-406.json`.

| # | Row | Result | Evidence |
|---|---|---|---|
| 1 | SOURCE-SCOPE start | PASS: claims differ from planning only on A4 lines (K2,K5,K6,K6b,K7–K11), equal sketch output on K3–K11 except K1/K2/K6/K6b; status = 4 granted paths; frozen 1296 rc 0; protected rc 0 | `claims-start.txt` |
| 2 | PATCH-IDENTITY | PASS: patch (sha 60bdf24c…) applied to `git archive HEAD`; 3 files `cmp` identical to working tree | — |
| 3 | VIDEO-SYNC (browser, both viewports) | PASS: 12 samples, paused false, max \|drift\| 0.006 s (1440) / 0.011 s (1280); dock swaps 0, fallbacks 0. Recorded: no `data-video-hardseeks` attr; stopped-seek-to-2s not run (no B recipe) | `video-*.json`, `video-*.png` |
| 4 | LEAF-PROBE (both viewports) | PASS: 0 differences vs sketch, VideoDock `[0,3,1,1,1,0,1,1,1,1,1,1,2]`, 0 page errors | `leaf-c406.json` |
| 5 | UNIT+MUTANT | PASS: 8 files 180/180; 4/4 mutants RED (AC7), pristine before/after rc 0, scratch status 0, summary identical to B's | `vitest.log`, `mutants/` |
| 6 | AUTH (browser, both viewports) | PASS: `/studio-lab` auth_user null, no sign-in wall; `/studio/middle-east` "Sign in required", 0 audio[src], no workspace; `/api/studio-token?product=…&file=…` no auth → 401. Fake-bearer BLOCKED (backend unavailable) | `auth.json`, `token-noauth.txt` |
| 7 | DOCS | PASS: l.4 byte-exact; 7 headings in order; 4 mutant rows; AC7 exists; 0 "C round N pending"; only doc 259 added | — |
| 8 | SOURCE-SCOPE end + L57 | PASS: claims-end == claims-start; status unchanged (3 M + 1 ??); L57 OK | `claims-end.txt` |
| gate | full vitest/typecheck/build/Biome/verify | not run by C | gates/gate-round-406.json |

Ableton conformance: not applicable (behaviour-preserving perf/refactor).
Notes for B: A's reviewer Lows R406-CR-L1..L3 are A-reported and not C bugs; d-ii must keep `pausePlaybackWithStatus` via ref or prove its chain stable.
