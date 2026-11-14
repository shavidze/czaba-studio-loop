# C round 502: cart layout (3 bugs) — PASS, browserVerified true

Source: store HEAD 3bb55d4 + A's 3 files (1 modified, 2 untracked; identical at start and end, `c-round-502/c0-status.txt`, `c13-status.txt`). Frozen checks 1, 2 and 4 rc 0 before and after. Real Chromium (Playwright) against http://127.0.0.1:5173; all cart rows are -STUBBED (`page.route`), so they prove the client path only. Evidence: `c-round-502/`, JSON: `c-round-502.json` (L57 OK).

| Row | Result | Evidence |
|---|---|---|
| C0/C13 SOURCE-SCOPE | PASS | status files equal; checks rc 0 |
| C1 LAYOUT (4 states × 6 vp) | PASS | `compare-502.py` RESULT PASS, identical to `compare-sketch.txt`; 375: column 155/482/339 px (HEAD 47/0), title and Remove hit-test true; `lg` rows LG-EQUAL |
| C2 PHONE ACTIONS | PASS | `after/after-actions.json` == sketch; removeClicked true (HEAD false); anon Checkout → Sign in, 0 POSTs; signed in → 1 POST |
| C3 SHORT-SCREEN WHEEL | PASS | 18/18 `inView`+`hit` true; equals sketch for afterWheel and tab; Tab reaches Checkout with outline solid in 6/6; screenshots viewed (1366×600: Checkout fully visible, ring not cut) |
| C4 ITEMS WHEEL | PASS | 1280×720 st 366, 1440×900 st 186, lastVisible true, lenisPrevent true (HEAD st 0, false) |
| C5 BELOW-LG wheel+touch | PASS | equals sketch (525 at 375, 277 at 768); HEAD 171 |
| C6 EMPTY CART | PASS | JSON equal to `head-empty.json` |
| C7 JOURNEY 375 (mock API) | PASS | equals `sketch-c7.json`, errors [] |
| C8 TESTS | PASS | 3 files 54/54, CML1–CML4 present |
| C9 MUTANTS | PASS | M1–M15 RED on expected rows, restored rc 0 |
| C10 DOCS | PASS | 7 headings, l.4 byte-equal, numbers (47/79/155, 0→339, 7 px, 501→442) traced to probe JSON, 0 "C round N pending" |
| C11 CLAIMS | PASS | 0 MISSING; only K2 differs (3 on applied tree, expected) |
| C12 PROTECTION + STUDIO | PASS | fresh no-credential context at 1440×900 and 1280×720: `/studio/1` and `/account/downloads` "Sign in required", no download link; `/studio-lab` opens the demo, no auth bypass for premium |

Gate rows (not claimed): full vitest, build, Biome, verify. Blocked: real cart backend (unavailable in cloud) — does not affect browserVerified.

Bugs: none. Info for B: first cold runs of two scripts crashed (Vite reload) and were replaced by warm runs (L38); Checkout focus ring measures 1px (pre-existing shared style vs SABA-B-4's 1.5px); at 375 px the Order Summary card looks ~8 px wider than item cards (screenshot only, cosmetic Low candidate); A's Lows stand as deferred.
Studio audio/video flow and Ableton conformance: not in scope this round.
