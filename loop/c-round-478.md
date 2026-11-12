# C round 478: DPG-P0-3b (design reference docs in Obsidian & Brass). Verdict PASS

Docs-only round, HEAD 10791ac. Evidence is in `c-round-478/` (`claims.txt`, `browser.json`, `home-*.png`, `studio-lab-*.png`, `tools/`). Gate (full verify, code review, publish) is root's.

| # | Row | Result |
|---|---|---|
| C1 | SOURCE-SCOPE | PASS. 16 status lines: 11 under docs/design, direction-decision.md, docs 307-309 modified, 310 new. K9 = 0. |
| C2 | CLAIMS | PASS. Own run of claims-478.sh: K2 `hits=27 residual=27 unexpected=0 residual_changed=0`, K3 `FAILS 0`, K4 0, K6 all "Completed (C round 478 PASS)", K7 True, K8 0, K9 0, K10 0 x4, K11 0, K12 13 of 13, K13 yes x4, K14 section 1 / sources 4/3 / 0 / 0, K15 0, K16 1, K17 16, K20 0, K21 0, K22 0, K23 13 2. |
| C3 | MUTANTS | PASS. On a copy of the tree: (a) brand `#13d9cc` gave K3 FAILS 2 (and K2 unexpected=1); (b) teal rgba back on an awwwards line gave K2 unexpected=1; (c) one residual line deleted in wcag-audit.md gave residual_changed=1. After restoring, K2/K3 are green again. Real tree untouched. |
| C4 | VALUES TRUE | PASS. Chromium `getComputedStyle` on `/` at 1440 and 1280: brand #c9a46a, brand-hover #d9b87f, background #0e0d0c, surface #161412, foreground #ece6da, muted #a39b8e. DESIGN_SYSTEM.md (lines 733-735, 706, 709, 1029...) and design-tokens.json agree (K3 compares all three docs against app.css, and the browser values match app.css). |
| C5 | WCAG | PASS. All 10 ratios recomputed with my own formula are within 0.01 (e.g. 8.323 vs 8.32, 10.275 vs 10.28, 5.384 vs 5.38). |
| C6 | REASONING SOURCED | PASS. Section "რატომ Obsidian & Brass?" cites both files by path. The brand-vision quote ("ერთი მკვეთრი აქცენტი (ოქროსფერი/ელექტრული ლურჯი)") and "dark theme + gold accent" grep verbatim; "--color-accent/--color-buy equal brand" is true in app.css (l.86-87). No teal/orange/glow words in the section. |
| C7 | DOC 310 | PASS. TEMPLATE headings in order (K7), l.4 exact, D-29z1692/3/4 named, no test ids claimed (no vitest covers docs). |
| C8 | EMISSION | PASS. 0 arbitrary-value class candidates added; 0 removed. |
| C9 | AUTH + STUDIO | PASS in a fresh context, both viewports. `/studio/middle-east` anonymous: "Sign in required", 0 audio src. `/api/studio-token?...` with no bearer: 401. `/studio-lab` opens as the demo ("CZABA Studio — Demo collection — no sign-in required"). Premium auth is not bypassed. Real-owner path BLOCKED (backend unavailable in cloud). |
| C10 | HOME | PASS. Header logo span `rgb(201, 164, 106)` at 1440 and 1280 (the wrapping anchor is foreground colour; the wordmark span is brass, as in round 477 C7). body background `rgb(14, 13, 12)`. |
| C11 | Extra (record) | Low C-R478-01: DESIGN_SYSTEM.md l.139-140 and 783/787 still say foreground "94% lightness" and muted "55% lightness"; live values are about 89% and 60%. Not hex, so no checker flags it. Deferred Low. |

Notes for B: `--color-info` blue and fonts stay with P1 as planned. regression-last.json is 2026-11-10, so the next planning has the REGRESSION round due on or after 2026-11-13. DPG P0 awaits the DP gate; I do not claim it passed.
