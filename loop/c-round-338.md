# C round 338: PERF-DRAG-PREVIEW c3-ii verification

**Verdict: PASS.** 0 bugs. browserVerified true. Base bbc281f, A's tree (16 files), source untouched by C.

| Row | Result |
|---|---|
| CLAIMS | PASS - claims-338.sh equals A's claims-final; vs sketch output differs only in K2 (bbc281f 16), K16 (0 2 7 11 0) and K23 (3 1 0 1), all the documented A values; start==end (c-round-338/claims-start.txt, claims-end.txt) |
| SOURCE-SCOPE | PASS - 16 entries (14 M, 2 ??); git apply -R --check of the 3 B patches rc 0; expect( counts equal HEAD in 5 probe files, drag-preview-render 286->310 (DP49/DP50 added, none removed); no diff in app/routes or perf/lib; protected 11 OK |
| UNIT | PASS - covering list on a scratch copy twice: 18 files, 446 tests, rc 0 both; DP49, DP50, DP5b once each, CL1-CL4 once each (c-round-338/unit-1.log, unit-2.log) |
| MUTANT | PASS - 6/6 B mutants red on named rows (MU-WS-SUB/CLIP-GUARD/GUARD-V2/LANE-ALL -> DP49, MU-REFUSAL -> DP50, MU-CLEAR -> DP5b+DP49); own mutant (Object.is guard removed in setDrag), predicted CL1 red and DP49 green: only CL1 red (own-mutant.log). Copies deleted |
| PERF | PASS - production build, spec alone, rc 0, complete true, failures [], 193 rows, 43/43 asserted pass, 131 EQUAL, 8 DIFF exactly the expected rows and values (58.969->24.906 lane x4, 24.267->22.8 same-lane x4), 0 NEW, ids-equal 193, liveness [1,1,1] at 1x and 6x, move-restarts 0, release-commits 1 |
| CROSS-NAMES | PASS - dev probe both viewports: A cross-lane moves 5/5/5/5 with provider and workspace false, hooks []; enter [101]; release [106] hooks [0,16]; HEAD (second dev server, own cacheDir) 87x4, hooks [0,35], enter [101,91], release hooks [0,16,35]; both equal b-round-337 refs |
| CROSS-BEHAVIOUR | PASS - compare.py BEHAVIOUR-DIFFS 0 at 1440x900 and 1280x720 (27 SAME each): ghosts, source dimmed, hints, Shift hint, release on target, Undo title, Ctrl+Z, Esc no-cancel as HEAD; screenshots c-round-338/shots/mid-drag-A-*.png |
| G338-AUTH | PASS - fresh anonymous contexts both viewports: /studio-lab workspace + demo badge, auth_user null; /studio/middle-east Sign in required, 0 audio[src]; /api/studio-token no header 401, fake bearer 500 (no token), bare 400. First run timed out on cold compile of /studio/middle-east (env-invalid, replaced after warm-up) |
| STUDIO-SMOKE-338 | PASS - both viewports: add clip, Play, real analyser tap peak 0.30 before drag, 0.11-0.34 during an 8-step cross-lane drag by name bar, playing stays true, AudioBufferSource starts 1 -> 1 (no graph restart); release on Stems start 2.550, Undo title 'Undo: Move to track - Stems', playback continues, Space stops; export WAV 24-bit/48k stereo, 4987296 frames = 103.902 s = 2.55 + 101.352, 0 non-finite, rms -15.4 dB; 0 page errors |
| DOCS | PASS - doc 232 l.4 byte-exact, 7 TEMPLATE headings in order, c3-ii section present, DP49/DP50/CL1-4 exist as it(); doc 168 diff only l.87 and l.111 inside ## metrics |

Gate rows (not claimed by C): full vitest, build, Biome, typecheck, npm run verify, e2e smoke. typecheck/lint were run by A (rc 0).

Notes: Ableton conformance n/a. A's reviewer Lows are B candidates. Environment: first G338-AUTH and first probe runs failed on cold dev-server compile; replaced after warm-up (L38), originals kept in c-round-338/*.log. Artifacts: c-round-338/.
