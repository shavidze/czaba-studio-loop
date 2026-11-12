# C round 477: DPG-P0-3a (entrance loader + header logo, Obsidian & Brass)

**Verdict: PASS** (colour-only round; all runnable rows C1–C12 run in real Chromium or on the tree). No new bugs. Gate rows (verify, code review, publish) belong to root and are not claimed.
Evidence is in `c-round-477/`: `probe-c477.json`, `contrast.json`, `timing.txt`, `journey.json`, `mutants/`, `covering.log`, screenshots.

| # | Row | Result |
|---|---|---|
| C1 | SOURCE-SCOPE | PASS. `status.txt` shows the 6 round-476 paths only. 5 of 5 sketch sha256 OK. Protected files and `app/styles` diff = 0 |
| C2 | CLAIMS | PASS. Output byte-equal (`cmp`) to `b-round-476/claims-477-allowed-deltas.txt`; last line `L58 OK` |
| C3 | TESTS-MEAN-SOMETHING | PASS. Mutants run on my own `cp -a` copy: 12/12 RED, the summary is identical to `b-round-475/mutants/b-run/summary.txt`, 0 NOT-APPLIED |
| C4 | UNIT | PASS. 16 files, 262/262 tests. `store-entrance-loader` 50 tests, 860 ms in total, far under 50 % of the default timeout |
| C5 | HAND-OFF COLOUR | PASS at 1440×900 and 1280×720. Every non-null cover sample, the overlay, its base layer and `body` after exit are `rgb(14, 13, 12)`. HEAD control was `rgb(0, 0, 0)` |
| C6 | LIGHT/DUST/VIGNETTE | PASS. `hold.kids` and `dustBg` are identical to `probe-sketch.json` at both viewports. Dust is `oklab(0.926355 0.00167474 0.0172472 / 0.5)`. No captured overlay bg contains `255, 255, 255` |
| C7 | WORDMARK + LOGO | PASS. Loader wordmark is `rgb(201, 164, 106)`, weight 700, box 318×72 at both viewports. Header logo is `rgb(201, 164, 106)`, weight 800, on `/` and `/store`. Contrast ratioMedian 7.56 (1440) and 7.55 (1280), at least 4.5 |
| C8 | TIMING (record) | Recorded, 1440×900, 3 runs: `coverMs` 1284 / 1297 / 1292. `onAt` 472 / 443 / 407 ms, `offAt` 1756 / 1740 / 1699 ms. All inside SABA-B-13's 1450–1900 ms window |
| C9 | HEADER, two brass (record) | Recorded as DP-gate input. The logo and the active "Collections" link on `/store` are both `rgb(201, 164, 106)`. On `/` the nav links are `rgb(163, 155, 142)`. The product page also shows a brass "Sign In" button. Persistent header text lines are unchanged |
| C10 | JOURNEY | PASS at both viewports. The entrance ends, then `/products/middle-east` opens with h1 "Middle East" and a brass logo, and no loader on the product page. After Back, `/` shows no second entrance. Screenshots `j1/j2/j3-*` |
| C11 | DOC 309 | PASS. TEMPLATE headings are present in order (Georgian). l.4 is exactly `**სტატუსი:** In Progress (stage 3 of 4; C round 477 PASS)`. `D-29z1688` appears once, in the R1 entry. Row ids named in the doc exist in the tests (E1, E6, L3, L5, P1–P4, N3c) |
| C12 | AUTH | PASS. Anonymous `/studio/middle-east` shows "Sign in required" with 0 audio elements or sources. `/api/studio-token?product=middle-east&file=x` with no bearer returns 401. `/studio-lab` opens as the demo in a fresh anonymous context ("Demo collection — no sign-in required"). The real-owner path is BLOCKED (backend unavailable in cloud) |

R1 (overlay painted twice) is ruled by D-29z1688 and recorded as known; it is not a FAIL.

## Notes for B (not bugs)
- The product-page hero image has a white edge-light. It is part of the image asset and out of scope here, but it is a candidate for the DP gate's brass review.
- My first auth probe checked too early and showed "signIn false". The longer re-check confirms "Sign in required"; it was a probe timing issue and not an app issue.
- No Studio behaviour changed in this round, so no Studio rows ran apart from the demo-open check.
