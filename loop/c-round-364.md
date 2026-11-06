# C — round 364: verdict PASS (browserVerified true)

| Row | Result | Evidence |
|---|---|---|
| CLAIMS | PASS, equals A's final | c-round-364/claims.txt |
| SOURCE-SCOPE | PASS: 6 modified, 0 untracked, both patches reverse-apply, no app/ file besides render-budget.test.tsx | source-scope.txt |
| PERF-LIB | PASS 40/40 | perf-lib.log |
| MUTANT-PERFLIB (own) | Red on DC-KINDS (length 19 vs 18); scratch zoom-probe failure is a scratch artifact; scratch deleted | mutant-perflib.log |
| RB-MEMO | PASS 13/13 | render-budget.log |
| PERF (production, alone) | PASS: rc 0, complete, failures [], problems [] in 6 passes, 264 rows, 95/95, 189 EQUAL, 0 DIFF, 0 NEW, 462919 ms | perf.log, rowcmp.txt, latest-interactions.json |
| BG-RANGE 1440x900 + 1280x720 | PASS: one lane-range on video lane mid/end, 0 after name-bar reset; Insert Marker 5.000 unchanged across drag and reset (de-confounded run bgm), clip start 0.000/width 640 and Undo title unchanged | bg-*.json, bgm-*.json, screenshots |
| G364-AUTH both viewports | PASS: /studio-lab opens anonymously (auth_user null); /studio/middle-east "sign in required", 0 audio src; token GET 401, no token. Fake-bearer 500 (fails closed) listed under blocked | auth*.out |
| DOCS | PASS: l.4 byte-exact, stage heading exact, 7 `##`, pending 0, doc 168 l.4 unchanged | — |

Not run: MARKER-NONE-PLAYING-BACK (best effort). Gate rows (full vitest, build, Biome, typecheck, verify, e2e smoke) are the root gate's.

Wallclock (record rows): move-to-paint-p95 C 2.9 ms (1×), 19.1 ms (6×); deterministic values equal round 363.

## For B
- C-R364-01 (Low, deferred): doc 168 l.113/l.284 still say 16 wallclock rows; the new bullet says 18.
- A's reviewer Lows (selectedBefore, drag-time marker read) are unchanged and not blocking.
- C-R363-01 and C-R363-02 are fixed. Close them on this PASS.
