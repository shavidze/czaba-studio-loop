# C round 485: CLIENT-NAV-CONTRACT — verdict PASS (browserVerified true)

Source read-only; HEAD 751e30e + A's 14 uncommitted paths. Claims at start and at end are identical (`c-round-485/claims-end.txt`); the tree did not change during C.
Browser: Playwright Chromium, fresh contexts, 1440×900 and 1280×720. Dev server warmed first; no Vite reload in the runs.

| Row | Result | Evidence |
|---|---|---|
| C-SCOPE | PASS | claims diff vs planning = only the allowed deltas (K2 14 paths, K3 rc1, K5 4 routes, K12 1/1, K12b 1×6, K13 1, K15 13/13); K17 `L58 OK`; K18 no NOT-FOUND |
| C-APPLY | PASS | K15 13 of 13 equal to `b-round-484/sketch-485/`; A listed no sketch change |
| RA-ATTRS | PASS | `ann-*.json` step 0: 1 region, polite, atomic true, role null, class sr-only, box 1×1 |
| RA-INITIAL | PASS | full load `/` and `/studio-lab`: region '' and observer log only `['']` |
| RA-BROWSER | PASS | all 16 steps' region text == B's `sketch-final-*.json` and == `document.title`; repeated `/support` produced no change; both viewports |
| RA-TITLES | PASS | full load titles of the 6 routes equal §1 and region '' (`extra/*.json` fullLoadTitles); client nav of `/account/orders` → "My Orders \| CZABA", `/account/reset/x/y` → "Reset Your Password \| CZABA" (not "Account") |
| RA-STUDIO | PASS | `/faq`→`/studio-lab`: "CZABA Studio — Demo collection"; exit "CZABA" link → "CZABA \| Premium Cinematic Sound Design"; one region (count 1) |
| RA-TAB | PASS | footer FAQ click: region "FAQ \| CZABA"; Tab → header CZABA link, focusVisible true, outline solid 1px brass α0.8 |
| RA-REPEAT | PASS | `repeat.json`: "Account \| CZABA␠" (last code 160), then "Account \| CZABA" (65), then "FAQ \| CZABA" |
| RA-SPEAKERS | PASS | grep (line numbers ignored) = 20 HEAD lines + the one RouteAnnouncer.tsx line |
| RA-VISUAL | PASS | `extra/c485-*.json` equals B's sketch JSON on all 77 fields at both viewports; differs from HEAD only in the 6 titles/ann and studio announcerCount 0→1; no region in Tab stops. Screenshots `c-round-485/extra/*.png` (not pixel-diffed; DOM metrics/box sizes equal) |
| STUDIO-485 | PASS | wrapper/header boxes, scroll sizes equal HEAD; Space on empty project → "Nothing to play — add a clip from the library first."; announcerCount 1 |
| LF-RUNTIME | PASS | 7 covering files / 93 tests pass (`vitest.log`); 12 mutants re-run from a scratch copy: all red on their expected row (`mutants-summary.txt`). I checked the expected row only, not the full red-row sets of `red-rows.txt` |
| LF-FOOTER | PASS | plain click → BODY, no body tabindex; Ctrl+click → A "Support"; same as HEAD |
| G485-AUTH | PASS | fresh no-credential context: `/studio-lab` opens demo (auth_user null); `/studio/middle-east` "Sign in required", 0 `audio[src]`; both viewports (`auth.json`, screenshots) |
| Doc 313 | PASS | 7 headings in TEMPLATE order; l.31 narrowed to match the `/studio/:productId` silence; TODOs present |
| gate | not claimed | verify/full suite/build belong to the root gate |

## Findings
- No new bug from C.
- Known, ruled gap (A-found, B ruling l.31): client nav into `/studio/:productId` is silent (protected file, no meta). Routed to root as B-R485-STUDIO-PRODUCT-TITLE, plus ROOT-REQ-DOWNLOADS-TITLE. Not a FAIL.
- A's Biome count note: 16→16 warnings (task said 14→14), non-blocking, unchanged by the patch.
- Not exercised: the Studio find→add→fit video→export flow. This round does not touch Studio logic (only the RouteTransition wrapper), so only wrapper/status/auth rows were checked. No claim about export here.
- Screen-reader half (NVDA/VoiceOver) stays Tech Lead row TLM-R485-SR-ROUTE-ANNOUNCE; the live-region contract is verified in a real browser, real speech is not.
- Ableton: not applicable (Store navigation).
