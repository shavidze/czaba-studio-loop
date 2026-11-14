# C round 513: DPG-BUTTON-CLEANUP-2-NONBRAND N3 (cookie banner) — PASS

Verdict: **PASS**, 0 bugs, `browserVerified` true. Ran in a copy of `store/` (GA4 set, own Vite cacheDir, port 5174) with mock API on :5199; both stopped, copy deleted. Evidence in `c-round-513/` (`banner/n3.json`, `journey/journey.json`, `studio.json`, `covering.log`, `mut-logs/`, `claims.diff`, `l57-check.txt`).

| Row | Result | Evidence |
|---|---|---|
| C0 scope | PASS: 2 `M` + untracked doc 331 only; frozen checks 1, 2, 4 rc 0 | `c0-status.txt`, `chk*.log` |
| C1 rest 1440/1280/375 | PASS: `banner/n3.json` is byte-identical to B's sketch run at all 3 viewports (order Decline, Accept, Close; pill 9999px, 600, bg rgb(29,26,23), 34 px high, widths 78/75; Close display:none at 1440/1280, 32×32 at 375). Close box overlaps "Privacy" at 375 (see crop `banner/banner-375.png`) = pre-ruled, same as HEAD, recorded not failed | `banner/rest-*`, `banner-*.png` |
| C2 hover/press | PASS: both buttons hover to rgb(36,33,30)/border rgb(46,42,38); press opacity 0.9, no outline, focus-visible false | `n3.json` |
| C3 keyboard | PASS: Tab order Decline, Accept (+Close at 375), each focus-visible with solid 1px brass 0.8, offset 2px; crop not clipped | `focus-*.png` |
| C4 actions | PASS: Enter Decline → denied, Enter Accept → granted, click Close (375) → denied; 0 Accept buttons after each. focusAfter BODY, first Tab CZABA = HEAD (pre-ruled) | `n3.json` |
| C5 journey | PASS at 1440 and 1280: `/` → Decline by keyboard → `/store` → `/products/middle-east`; consent denied, 0 banner buttons, 0 errors | `journey/` |
| C6 Studio + protection | PASS: `/studio-lab` opens the demo with no credentials and no banner (GA4 set), 0 errors; `/studio/middle-east` and `/account/downloads` show "Sign in required", only link is public `/free-downloads`; `GET /api/studio-token` unauthenticated → 401, no URL. Premium auth not bypassed. Check 2 rc 0 | `studio.json` |
| C7 tests + mutants | PASS: covering 6 files / 88 tests, N3-1…N3-6 present, slowest 173 ms; mutants M1–M13 all red on exactly the same rows as B's summary | `covering.log`, `mut-logs/` |
| C8 grep/scanner/lint | PASS: `<button` count 0; scanner 50 hits, no CookieConsent entry; lint 171 warnings; typecheck rc 0 | `n3.json`, `lint.log`, `tsc.log` |
| C9 doc 331 | PASS: 7 TEMPLATE headings in order, l.4 byte-equal, 0 "pending", cited row ids exist, ledger present | doc, `a-round-513/doc-ledger.md` |
| C10 claims + L57 | PASS: claims diff equals the allowed delta (it is the same diff, inverted direction), 0 MISSING; L57 OK | `claims.diff`, `l57-check.txt` |

Ableton conformance: not applicable (Store cookie banner). Gate rows (not claimed): full vitest, build, Biome-all, `npm run verify`, `test:e2e:smoke`.

Note for B: the `studio` section of A/B's `n3-banner.mjs` showed hydration errors on first cold run (known cold-Vite behaviour, INFO-C510-COLD-HYDRATION); a warm re-run (`studio.mjs`) had 0 errors. Pre-ruled items B-R512-COOKIE-DISMISS-FOCUS-LOST and B-R512-COOKIE-CLOSE-OVERLAPS-TEXT still reproduce as expected (round 514). `chainHeadGateRunGreen` is null: that is the root gate's field.
