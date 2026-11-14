# C round 500 — DPG-BUTTON-CLEANUP-2 stage 2b-1 (re-dispatch)

**Verdict: PASS** (browserVerified true). Source untouched by C; frozen checks 1, 2, 4 rc 0 at start and end (`c-round-500/frozen-c0.log`).

| Row | Result | Evidence |
|---|---|---|
| C0 | PASS: 6 modified + 2 untracked, checks 1/2/4 rc 0 | frozen-c0.log |
| C1 REST (1440/1280/375) | PASS: 30 rows equal oracle; only diffs: `type="button"` on ROOT-ERR-TRY, ROUTE-ERR-TRY (expected) and press-opacity animation noise | after/after-on.json, after-off.json |
| C2 HOVER | PASS primary rgb(217,184,127); ghost bg rgb(29,26,23) text rgb(236,230,218) | after json |
| C3 FOCUS | PASS keyboard :focus-visible true, outline solid 1px offset 2px brass 0.8; press fv false, outline none; ring seen in 4 crops | after-*-focus-*.png |
| C4 STACK 375 | PASS denied pair 179×48 stacked; root pair 343×48 stacked; one-line labels | after-REC-DENIED-pair-375.png |
| C5 CONTRAST | PASS 8.32 / 7.06 rest, hover ≥10.28 | json |
| C6 NAV | PASS equal head oracle; Try Again reload (full load true), Go Home `/` full load, /store Try again → /store. One first-run `eval-failed` for ROOT-ERR-HOME was a navigation race; 2 reruns True | after-nav-*.json, after-nav-r1/r2 |
| C7 JOURNEY | PASS paths /cart → /store → /cart, no console errors | after-nav-on.json |
| C8 GREP | PASS 109 hits; 44 solid; builder calls 2,1,1 | — |
| C9 TESTS | PASS 14 files 138/138, SE1 present | covering.log |
| C10 MUTANTS | PASS N1–4, N6–9 RED; N5 APPLY-FAILED (expected); N5b, N10–N18 RED on named rows | mutants-499.out, mutants-500.out |
| C11 DOCS | PASS DESIGN_SYSTEM 2 hunks, doc 320 l.4 only, doc 321 l.4 byte-exact, 7 headings, 0 `pending`, 11/11 class tokens found. Full doc-ledger number trace not redone line by line | c11-diff.txt, doc321-tokens.txt |
| C12 CLAIMS | PASS no MISSING; only K2 differs (6 vs 5, expected) | claims.out |
| C13 | PASS fresh no-credential contexts at both viewports: /studio/1 and /account/downloads show "Sign in required", no product download link (only nav /free-downloads); /studio-lab opens demo "no sign-in required". Premium not bypassed | c13/ |
| C14 | PASS see L57 check | l57-check.txt |

**Gate rows (not claimed):** full vitest, build, Biome, verify.
**Bugs:** none. A's Lows carried to B in JSON `forB`.
**Not covered:** Studio audio/video/export (out of scope this round).
