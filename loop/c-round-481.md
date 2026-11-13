# C round 481: B-R478-DEAD-MUSIC-LINK (account.orders half) — PASS

Browser: Playwright Chromium, 1440×900 and 1280×720, script `c-round-481/c481.mjs`, output `c481-out.json`, screenshots `c-round-481/*.png`. First run timed out on cold dev-server optimisation (not a bug); warmed and re-ran.

| Row | Result | Evidence |
|---|---|---|
| C1 SOURCE-SCOPE | PASS: exactly 3 granted paths; frozen manifest rc 0; protected list rc 0; diff is the one `href` line | `git status`, claims K7–K9 |
| C2 CLAIMS | PASS: K1 bbb3193; K2 href-music 0 / href-store 1 / label 1 / router-Link 0; K5 AO1 AO2; K10 0; no MISSING | `claims.txt` |
| C3 TESTS | PASS: 2/2 on tree; M1 on own scratch copy → 2 failed on AssertionError (`/music` vs `/store`), no crash | `vitest-tree.log`, `vitest-M1.log` |
| C4 BROWSER (C4-STUBBED-1) | PASS at both viewports: href `/store`; Tab-focused (12 Tabs), focusVisible true, outline `solid 1px` brass /0.8, offset 2px, 0 dialogs; Enter → `/store`, title "Store \| CZABA - Cinematic Sound Collections", h1 "Curated Sound Collections", marker gone (full load); first Tab → `A / CZABA`. Rest style rgb(201,164,106) / rgb(14,13,12) / 500 16px / radius 12px / box 151×50 at y727 (x 645 @1440, 565 @1280) = HEAD baseline | `c481-out.json` c4, `empty-*`, `focus-*`, `landed-*` png |
| C5 GUARD | PASS: unstubbed `/account/orders` → "Sign in required", 0 Browse Music links, both viewports | c5 |
| C6 AUTH/STUDIO | PASS: `/studio/middle-east` anon → "Sign in required", 0 audio src; `/api/studio-token` no bearer → 401; `/studio-lab` opens as "CZABA Studio — Demo collection", no sign-in wall, timeline elements present. Premium auth not bypassed. Real-owner path BLOCKED (backend unavailable in cloud) | c6, `studiolab-*.png` |
| C7 PROTECTED HALF (record) | `/account/downloads` stubbed empty renders "No products yet"; Browse Music href `/music` (expected; ROOT-REQ-DOWNLOADS-MUSIC-LINK). Not a FAIL | `c7-out.txt`, `downloads-*.png` |
| C8 DOC 312 | PASS: l.4 exact; TEMPLATE headings in order; D-29z1709/10/11 and ROOT-REQ-DOWNLOADS-MUSIC-LINK named; cited AO1/AO2 exist | grep |
| gate | not claimed | root |

Bugs: none. The finding stays open for the protected `/music` link in `account.downloads.tsx`.
