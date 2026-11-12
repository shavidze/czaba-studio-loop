# C round 472: STORE-2c-1 fix-up (C-R471-01), full verification

**Verdict: FAIL.** The product and the test fix are correct and verified in a real browser. One Medium documentation bug (C-R472-01) remains, which A also stopped on. A-R472-REVIEW-M1 is confirmed. `browserVerified` true (every runnable row ran).

Method: two scratch production builds (HEAD `5cd9645` via `git archive`, TREE = HEAD + `git diff`), served by `remix-serve` on 3101/3102, mock API on :5199, Playwright Chromium (b-round-470 probes plus own scripts in `c-round-472/tests/`). Builds and node_modules links were removed after the run (L60). Evidence: `analysis.txt`, `probe1.json`, `probe2.json`, `rows.json`, `keep.json`, `glyph/`, `shots/`, `mutants-c.txt`, `vitest-4files.log`.

| Row | Result | Evidence |
|---|---|---|
| C1 | PASS | `analysis.txt`: 24/24 body starts `"Instrument Sans"`, h1 platform font Instrument Sans, `.font-mono` Plex Mono on `/`, `/store`, `/gift-cards`; HEAD body Inter |
| C2 | PASS | TREE 0 inter/playfair woff2, all 200. HEAD inter on 24/24, playfair on all except `/studio/middle-east` |
| C3 | PASS | 0 overflow, 0 new clipped. Heading growths exactly the three R-471-2 (375: `/about` h1 2→3, `/` h3 1→2, `/about` "Sounds Delivered" 1→2); |
| C3b | PASS | TREE CLS max 0.0216 (1280 product, gift-cards); HEAD max 0.0221 |
| C3c | PASS | long title 3/3/4 lines same as HEAD, 0 overflow |
| C4 | PASS with limits | Limited badges 1 line, scroll=client width; "Free Samples" present; LeadMagnet auto-opens, focus inside, Tab gives 1px brass outline (`keep.json`); `/about` stats intact. **Limits:** the home TestimonialsSection is not mounted by any route and SpecialOffers shows no text on the mock data, on HEAD as well as TREE, so those two are unverifiable here and unchanged |
| C5 | PASS | `shots/tree-home-h1.png`, `tree-store-h1.png` clean, no smear; computed weights 700 / 600; only faces 400/500/600 load |
| C6 | PASS | tree glyph run: Instrument Sans 10, Noto Sans Georgian 7, DejaVu 2 (arrows). No notdef boxes. `<kbd>` chips (↑↓ ↵ Esc) now Instrument Sans (HEAD Inter): recorded for 2c-3 |
| C7 | PASS | `/studio-lab` anonymous, demo, 108 Instrument Sans / 51 Plex Mono at 1440, 107/51 at 1280, identical to HEAD |
| C8 | PASS / BLOCKED part | "Sign in required", Instrument Sans, 0 audio src, 0 audio requests; stub path BLOCKED (backend) |
| C9 | PASS | store → product → CTA → `/studio-lab?preview=middle-east`, `shots/j1..j3` |
| C10 | PASS | 126 passed; mutants equal B's summary (`mutants-c.txt`) |
| C11 | PASS | 3 paths; app.css sha d3af7582d8199712; test file = TREE + sketch-472; protected rc 0 |
| **C12** | **FAIL** | l.4 exact, 7 headings in order, 0 "ელოდება", 0 `pending`, 0 "C5 ამოწმებს", no "round 471" on l.94/l.106, FN4/FN6/R-471-1…3/D-29z1662 cited. **But l.79 states the round-471 FN4 behaviour (whole file, obsidian included), which is false after sketch-472 and contradicts l.88/l.95.** l.78 and l.90 are also stale (see C-R472-01) |
| C13 | PASS / BLOCKED part | token 401 (no bearer), 403 (fake bearer): premium not bypassed; real-owner path BLOCKED |
| C14 | PASS | claims diff only K1/K4/K9 as expected, `L58 OK` |

## Bug C-R472-01 (Medium, origin B grant scope, a doc line that was not in the grant)
Doc 306 l.78–79 and l.90 still describe round 471's FN4/FN6. Proposed fix, as A suggested: one grant covering l.78, l.79, l.90, with l.79 saying FN4 reads only the store `@theme {` block and pins the exact R-471-1 values. No source change is needed. After that fix and a C re-check of C12, STORE-2c-1 can close. The 2c-1 work itself needs no re-run (app.css and test unchanged).

## For B
- Next round: doc-only fix-up with explicit grant of l.4, l.48, l.78, l.79, l.90, l.94, l.106 (A's re-dispatch note). Tests and browser rows would not need repeating beyond C11/C12/C14 if the tree sha stays.
- Home testimonials/SpecialOffers keep-list rows cannot be seen in the cloud mock (pre-existing, same on HEAD); keep as open evidence for a mock-data enabled check.
- Gate rows not claimed.
