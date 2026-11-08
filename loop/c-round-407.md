# C round 407 — PERF-11c-iii-d-ii: PASS

browserVerified/realVerified: true. No bugs. Evidence in `c-round-407/`; machine-readable `c-round-407.json`.

| # | Row | Result | Evidence |
|---|---|---|---|
| 1 | SOURCE-SCOPE start | PASS: claims differ from planning only on A4 lines; K7–K11 equal sketch output; status = 4 granted paths; frozen 1297 rc 0; protected rc 0 | `claims-start.txt` |
| 2 | PATCH-IDENTITY | PASS: patch sha 4ec62e316b8776b7 applied to `git archive HEAD`; both files `cmp` identical to working tree | — |
| 3 | STOPPED-SEEK (browser) | PASS: all 4 steps error 0, moved true, both viewports (1440 first run cold-start timeout, retry passed) | `stopped-*.json/png` |
| 4 | VIDEO-SYNC (browser) | PASS: 12 samples paused false, max drift 0.008 s (1440) / 0.013 s (1280); swaps 0, fallbacks 0; caption "1.mp4" | `playsync-*.json`, `extra-*.json` |
| 5 | LEAF-PROBE (browser) | PASS: 0 diffs vs sketch; Dock `[0,3,1,1,1,0,1,1,1,1,1,1,2]`; Caption and DockViewInner 13 zeros; 0 page errors; positive control expand → inner 0→1 | `leaf-c407.json`, `leaf-pageerr.json`, `extra-*.json` |
| 6 | UNIT+MUTANT | PASS: 16 files 360/360; 7/7 mutants RED naming DP73/74/75; pristine before/after rc 0; scratch status 0 | `vitest.log`, `mutants/summary.txt` |
| 7 | AUTH (browser) | PASS: demo opens unauthenticated; premium shows "Sign in required", 0 audio[src]; token API 401. Fake-bearer BLOCKED (no backend) | `auth.json` |
| 8 | DOCS | PASS | — |
| 9 | SOURCE-SCOPE end + L57 | PASS: claims-end == claims-start; L57 OK | `claims-end.txt`, `l57.txt` |
| gate | vitest/typecheck/build/Biome/verify | not run by C | gates/gate-round-407.json |

Ableton conformance: not applicable (behaviour-preserving perf/refactor).
Notes for B: A's reviewer Lows (mutable registry in useMemo, caption view naming, ref written in render) are A-reported, patch applied byte-for-byte, not C bugs. Floating-box drag is unit-covered only, not browser-run by C.
