# C — Round 342 (REGRESSION-ROUND-2026-11-05, part 3): PASS

HEAD 99a5912, clean tree, 11/11 protected, 0/1239 tree failures at start and end. A changed nothing. Real Chromium via Playwright on :5173; mock API on :5199 (mock data is client-path evidence only). Details in `c-round-342.json` (`observations`); outputs in `c-round-342/{tools,out,shots,wk,t258}`.

| # | Row | Result |
|---|---|---|
| 1 | SOURCE-SCOPE start | PASS |
| 2 | R342-WK-GUARD | PASS — c341 proxy JSON came from the same probe; equals c311 modulo timestamps |
| 3 | R342-WK-HEAD-CONTROL | PASS — re-run, equals c311 headctl (500 h1g1 ×3; 200 h0g2c1; 200 h1g2c0), differs from row 2 |
| 4 | R342-RS-1280 | PASS with notes — s186/187/188/190 at 1280 run (3 env-invalid attempts replaced). Diffs: timings, fonts self-hosted, scroll-state y offset. Contrast: independent measure 3.41:1 for Gift Cards paragraph over gold lettering = known Low C-R186-02 (round 186: 2.59) |
| 5 | R342-RS-MAP | PASS — c341 logs equal c301 logs normalised; sc-tree-1280 tabs 27 matches round 258 (c301 had 26) |
| 6 | R342-RG22-NARROW | PASS — identical to c301 rg22n.json |
| 7 | R342-RP301 | recorded — identical except the one-time "Drag a clip by its name bar…" hint |
| 8 | R342-RP-BUILT | recorded — C301-01 unchanged (BODY then arrangement-exit); fold keeps selection; status race not reproducible with natural triggers (no flicker/dup); C331-01 reproduces at 1280 panel-open |
| 9 | R342-POSCTL | recorded — valid=false both viewports (no splice: starts=1); new oracle |
| 10 | R342-PRICE | PASS — c288 replay equals accepted a.json (base URL only), known equals c301; free-pack only $0.00; priceless shows "Price unavailable", aria-disabled; std mock restored (health 200) |
| 11 | G342-AUTH | PASS — Sign in required, 0 audio[src]; 401/400/403; no token in bodies; /studio-lab anonymous with demo badge |
| 12 | SOURCE-SCOPE end | PASS |

Bugs: none new. Medium+: 0. Known Lows unchanged (C-R186-02, C-R301-01, C-R331-01). Gate rows (full vitest, typecheck, build, Biome, verify, RR-OSS) are not claimed. `browserVerified` true. B may set `regression-last.json` (round 342) per the outcome table.

Limits: rows 2 and 5 rest on round-341 browser outputs on the same unchanged HEAD (as the task allowed); RP-SAME-TEXT-RACE / GATE328-S1 exact triggers are not reachable from the page, so absence of the race is not proven.
