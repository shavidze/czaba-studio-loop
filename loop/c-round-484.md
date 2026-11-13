# C round 484: REGRESSION part 2 remainder (browser half of round 483)

Baseline HEAD `751e30e`, tree clean at start and end. Dev server :5173, Playwright Chromium, fresh anonymous contexts. Result: **PASS**, 0 bugs, `browserVerified` true. The gate rows (full vitest, typecheck, build, Biome, verify, RR-OSS) belong to root.

| Row | Result | Evidence |
|---|---|---|
| G484-SCOPE start/end | PASS: HEAD 751e30e, status 0, claims output identical to the planning output (K18 matched after the mock was stopped) | claims-start.txt, claims-end.txt |
| R-DEV-WARMUP | PASS: MP3 export to the end (4,055,208 B, 320 kbps CBR, 4224 frames, 48 kHz, "MP3 created: 01:41.352"), 0 errors. First attempt hit a cold dev server (120 s wait timed out); deps mtime moved 06:03:35 → 06:04:28 → 06:08:20 → 06:12:44 (last change inside the first c295 attempt), stable afterwards | warmup.txt, out/warm/, invalid-runs.txt |
| R295-LOAF-RERUN | PASS: c295 `observerError` null, `authPass` true (`loafPass` false, recorded only); provoked frame: 147 ms / 1 script (1440), 154 ms / 1 script (1280) | t301/r295/c295.json, out/loaf-c390.json |
| R-FOLLOW-OFFSET-ATTR | PASS: 3 valid runs × 2 viewports, behaviour fields equal round 483; C-R425-02 stays Low | out/follow/ |
| R-CROSS-LANE-FIBERS-LANES | PASS: 4 files, 0 diffs; mountedLanes {4 lanes, 1 clip} on every label | out/cross/ |
| R423-STEM-WORKER-ALT | PASS: throw = r414; short differs only in `audioSeek` count (2 vs 3); vs proxy only `coverTwice` + `audioSeek` count | worker414/ (tools byte-identical to the c-round-483 copies) |
| R425-PARKED-COMPARE | PASS: 4 of 6 files 0 diffs; fold-selection 16 diffs = 8 random ids + 8 Detail texts (all 8 checked: round-436 rename + slice window); posctl 6 record diffs, `valid` false in every run (old r342 also false), seams 0; ESC-drag signal intact | parked-compare.txt |
| G484-AUTH | PASS: demo opens anonymously (workspace + badge, `auth_user` null); `/studio/middle-east` "Sign in required", 0 `audio[src]`; token API 401 / 400, fake Bearer 403, no token in any body | out/g484-auth.json |
| Carried | round-483 PASS lines, RR-PERF, PERF-LIB, RG-SMOKE, c250 splitPlaying, R425-RVM-FRESH | — |

## R-FOLLOW-OFFSET-ATTR attribution (plain words)
Round 389's `play1.sl` is 1178 (1440) and 1447 (1280). Now: 1440 → 1178, 1180, 1182 (0, +2, +4 px); 1280 → 1445, 1450, 1450 (−2, +3, +3 px). The offset against round 389 is therefore small (≤ 4 px) and **varies from run to run**; it is not a constant. It is **not a layout width delta**: `clientWidth` (1142 / 982), `laneHeaderWidth` (224), `scrollerLeft` (288) and `scrollWidth` (11191) are identical in all six runs. `sl + playheadXInScroller` is 2005.06 in five runs and 2002.98 in one, so the playhead is at the same content position; only the scroll position moves by a few pixels. The cause of that few-pixel scroll variation is a **hypothesis** (follow-scroll quantisation), not tested. The behaviour fields (play0 playing/follow, manual dashed + status, stop status) were asserted equal to round 483 in all six files. `playheadXInScroller` is 823–827 (1440) and 555–560 (1280), inside [0, `clientWidth`], so C-R425-02 stays Low.

## Invalid runs (2 of the allowed replacements used)
1. Warm-up attempt 1: cold dev server. A later attempt was also cut by my own shell timeout (environment-invalid); attempt 3 completed.
2. c295 attempt 1: timed out at the legacy route during a dev dependency re-optimisation (mtime 06:12:44); the page re-probed fine; attempt 2 valid.
