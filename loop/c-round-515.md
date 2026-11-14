# C round 515: PASS (browserVerified true)
Cookie banner: pointer dismissal from keyboard-opening fields, focus cleared on blur. Evidence in `c-round-515/`.

| Row | Result | Evidence |
|---|---|---|
| C0 scope | PASS: 3 paths (2 M + doc 333); frozen checks 1, 2, 4 rc 0; doc 332 unchanged | shell |
| C1 pointer/field | PASS: P1 (375 tap, 1280 click) → logo, focusVisible false, scrollY same; P3 textarea → logo, value "abc"; P3 select stays SELECT; P2 simulated no-focus click → logo (simulation, not Safari); 0 errors; JSON equals B's `r515.json` | `c1/`, `c1.log` |
| C1 record | Tab after P1 at 1280 lands on "Collections"; consent granted | `tab-after-p1.txt` |
| C2 round-514 equivalence | PASS on warm run: 22 focus rows + 5-width layout equal B's; BODY 0/22. Cold first run showed 4 Vite hydration errors identical to B's own record (INFO-C510-COLD-HYDRATION) | `c2/`, `c2w/` |
| C3 journey | PASS at 1440 and 1280: Decline → /store → /products/middle-east, consent denied, 0 banner buttons, 0 errors | `c3-*.log` |
| C4 Studio/protection | PASS: /studio-lab in a fresh context, no credentials: 0 banner buttons, title "CZABA Studio — Demo collection", workspace text. /studio/middle-east and /account/downloads "Sign in required", no download link; token API 401 | `c2w/r514.json`, `prot.txt`, `token.txt` |
| C5 tests/mutants | PASS: 6 files / 112 tests, R515-T1…T7 + R514-F8 present, slowest <200 ms; M1–M11 red on the same rows as B (summary JSON equal) | `covering.log`, `mut-logs/` |
| C6 | PASS: `<button` 0, `onBlur={handleBannerBlur}` 1, scanner 50 (no CookieConsent), lint 171 warnings | shell |
| C7 doc 333 | PASS: 7 headings, l.4 exact, `pending` 0, all row ids exist | shell |
| C8 claims/L57 | PASS: diff equals allowed delta; L57 rc 0 | `claims.out`, `l57-check.txt` |

Gate rows (not claimed): full vitest, build, Biome-all, verify, e2e smoke.
No new bugs. C-R514-01 stays open for real Safari; GATE514-M1's phone keyboard half is manual (TLM-R515-PHONE-KEYBOARD).
For B: code-reviewer's proposal to add selector test rows (no-type input, `contenteditable=""`, `plaintext-only`) is coverage only.
