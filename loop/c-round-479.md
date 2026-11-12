# C round 479 — DPG-FOOTER-LINKS: PASS

browserVerified/realVerified: true (Playwright Chromium, 1440×900 and 1280×720, `localhost:5173`). Source not touched by C. Evidence is in `c-round-479/` (`nav.json`, `misc.json`, `claims.txt`, `vitest.log`, `mut-*.txt`, `scripts/`, screenshots).

| Row | Result | Evidence |
|---|---|---|
| C1 SOURCE-SCOPE | PASS: 12 status lines, exactly the granted paths | `claims.txt` K7, K8=0 |
| C2 CLAIMS | PASS: K1 `75a6028`; K2 `0/9`; K3 five lines `0/1`; K4 `0/0`; K5 exists + 5 files; K6/K9 ok; K10 explained in a-round-479 (link-focus.test.tsx) | `claims.txt` |
| C3 TESTS | PASS: 10 files, 162 tests, 0 failed; 0 removed `expect(` lines in the 2 edited test files | `vitest.log` |
| C4 TESTS MEAN SOMETHING | PASS (own scratch copy): (a) 21 red, (b) 3, (c) 2, (d) 11, (e) 1, (f whole guard) 5; partial guard removal that keeps the button check: 4. Real tree 48/48 before and after | `mut-*.txt` |
| C5 NO RELOAD, SCROLL TOP | PASS at both viewports: `/faq`→Support, `/`→Support, `/faq`→FAQ (same route). Path correct, marker alive, `scrollY` 0 at 400 ms and 3 s. Baseline control: B's `nav-final-5173.json` (not re-run by C) | `nav.json` |
| C6 FOCUS START | PASS at both: keyboard Enter on Support and on `/faq` Contact Us, and mouse click: activeElement BODY, no tabindex, body not `:focus-visible`, first Tab = `a[href="/"]`, marker alive | `nav.json` |
| C7 NO JUMP-BACK | PASS: one wheel step 171 px (1440, Support) and 200 px elsewhere, ≤ 250 | `nav.json` |
| C8 EVERY TARGET | PASS: 9 footer links reach their href, marker alive, titles correct. Privacy→Cookie Policy, FAQ→Hire Us ok. Terms→`/license` shows 404 (title "404 - Page Not Found"): B-R478-DEAD-LICENSE-LINK, not a FAIL. Home "Browse the Collection" (`viewAllLink`) → `/store`, marker alive, first Tab = logo | `nav.json`, `misc.json`, `c8-license-404.png` |
| C9 MODIFIER | PASS at both: Ctrl+click, Ctrl+Enter, middle-click each open one new `/faq` page; current page keeps path, `scrollY`, marker, focus stays on `A /faq` | `nav.json` |
| C10 COOKIE BANNER | PASS, with a caveat: the :5173 server has no GA id so the banner never renders there. I ran a second dev server on :5175 with a dummy `VITE_GA4_MEASUREMENT_ID` and its own cacheDir. Banner Privacy link (`data-discover="true"`) → `/privacy`, marker alive, Accept and Decline still present, no consent stored. Both viewports | `misc.json`, `c10-banner-*.png` |
| C11 AUTH | PASS: `/studio/middle-east` anonymous shows "Sign in required", 0 audio src; `/api/studio-token…` no bearer returns 401; `/studio-lab` opens as the demo ("Demo collection — no sign-in required"). Both viewports. Real-owner path BLOCKED (backend unavailable in cloud) | `misc.json`, `c11-*.png` |
| C12 DOC 311 | PASS: TEMPLATE headings (context, approach, architecture, files, problems, testing, TODO), l.4 exact, D-29z1697/98/99 named, cited test ids exist | grep |
| C13 LEADMAGNET (record) | Recorded: on `/` at 76 % scroll, client nav to `/faq` via footer; popup opened on `/faq` 2.2 s later (timer from page load keeps running across client nav). `/faq` is not an excluded route, so not a bug. Not compared with HEAD | `misc.json`/c13 run, `c13-after.png` |
| gate | not claimed | root |

No bugs. Nothing found that blocks. Observation for B only: LeadMagnet's 8 s timer now survives footer client navigation (before, a reload restarted it); not a defect under the current rules, and the popup is still excluded on products/cart/checkout (not tested here).
