# C round 514: Cookie banner focus return + mobile Close X (verdict: PASS, browserVerified true)

HEAD `4c85587`, no drift. Tree has the 3 expected paths. Browser: Playwright Chromium on a copy of A's tree (GA4 id set) at :5174, mock API :5199. Evidence is in `c-round-514/`.

| Row | Result | Evidence |
|---|---|---|
| C0 scope | PASS: 2 `M` plus untracked doc 332. Checks 1, 2 and 4 rc 0 | `c0-status.txt`, `chk1/2/4.log` |
| C1 layout (320/375/639/1280/1440) | PASS: no overlap, min gap 10.5 / 38 / 87.5 px, Close 40×40 `flex`. Banner height 122/122/102. At 1280 and 1440 Close is `display:none` and the banner, text, link, Accept and Decline boxes are within 0.5 px of HEAD. 0 page errors on the warm run | `banner2/r514.json`, `banner/banner-320.png` (X clear of the text) |
| C2 journey (1440, 1280) | PASS: `/` → Decline by keyboard → `/store` → `/products/middle-east`; consent `denied`; 0 banner buttons at each step; 0 errors | `journey/`, `journey.log` |
| C3 keyboard focus | PASS: 22 rows identical to B's sketch run. BODY 0/22. Every keyboard entry has `focusVisible` true and a solid brass outline at 0.8. Shift+Tab-from-top and privacy-nav land on "CZABA" at scrollY 0. Tab-from-before-banner lands on "Cookie Policy" with scrollY unchanged. Mid-page-never-focused lands on the logo, scrollY 2416→0 (1280) and 2833→0 (375), as pre-ruled 3. Enter and Space on Accept and Close at 375 all work. Consent is correct and the banner is gone in every row. The fresh-first-visit record shows the logo with a ring | `banner2/r514.json`, `banner/focus-*.png` |
| C4 pointer focus | PASS: logo focused, `focusVisible` false, scrollY unchanged, consent stored. `inViewport` is false (pre-ruled 2, recorded) | same files |
| C5 studio + protection | PASS: `/studio-lab` on the GA4 server has 0 banner buttons, the title "CZABA Studio — Demo collection", and workspace text. `/studio/middle-east` and `/account/downloads` show "Sign in required" with no download link (7 s wait). Unauthenticated `/api/studio-token` returns 401 with no URL. Check 2 rc 0 | `banner2/r514.json` (`studio`), `prot.mjs` output, `extra/` |
| C6 tests + mutants | PASS: covering 6 files / 99 tests rc 0, R514-F1…F9 and N3-3 present, no test ≥ 2,500 ms. M1–M15 are each red on exactly the rows in B's summary (15/15 SAME). Copy restored | `covering.log`, `mut-logs/mutants-summary.json` |
| C7 grep, scanner, lint | PASS: `<button` 0, `querySelector<` 0, scanner 50 with no CookieConsent entry, lint 171 warnings (rc 0) | `scanner.log`, `lint.log` |
| C8 doc 332 + ledger | PASS (manual): 7 headings in TEMPLATE order, l.4 byte-equal, `pending` 0, all cited row ids exist in the test file, ledger present with a source per sentence. I did not run `ledger-check.py` (its usage needs a task file) | doc 332, `a-round-514/doc-ledger.md` |
| C9 claims + L57 | PASS: the diff equals `claims-514-allowed-delta.txt` byte for byte. L57 rc 0 | `claims.diff`, `l57-check.txt` |

**Gate rows (not claimed):** full vitest suite, build, Biome-all, `npm run verify`, `test:e2e:smoke`.

## Environment notes
- The first banner run had 8 cold-Vite hydration errors (INFO-C510-COLD-HYDRATION; B's run had 4). The warm re-run had 0, with layout and focus identical to B's sketch.
- The first journey run timed out because two probes shared a cold server. The re-run alone passed.

## Unverified
- **C-R514-01 (Low, A's R1):** the stale stored element when a pointer-clicked Accept does not focus the button (Safari/iOS). Not reproducible here, because Chromium focuses clicked buttons and WebKit is not installed. The code reasoning is plausible. It goes to B as a Low (deferred, with `onBlur` clearing as the reviewer's suggestion). It does not block.
- A's R2, R3 and R6 are Low and Nit test-gap notes (no row for the `header button` fallback, F8 does not pin BODY, F9 row order). Not re-verified; B's call.

## Closing
Both bugs (B-R512-COOKIE-DISMISS-FOCUS-LOST, B-R512-COOKIE-CLOSE-OVERLAPS-TEXT) are verified fixed in the real browser. C-R205-02, SABA-Q-513 and SABA-Q-507 stay open.
