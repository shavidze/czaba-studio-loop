# C round 503: DPG-BUTTON-CLEANUP-2 stage 2b-3: PASS

`browserVerified` true. Source is unchanged by C. Evidence is under `c-round-503/`.

| Row | Result | Evidence |
|---|---|---|
| C0 / C14 SOURCE-SCOPE | PASS: 5 modified + 2 untracked, same at start and end; frozen checks 1, 2, 4 rc 0 | c0-status.txt, c0-frozen.txt, c14-status.txt |
| C1 REST (9 states, stubbed) | PASS: after.json equals sketch.json; only the port in `url` differs | c1-compare.txt, after/after.json |
| C2 HOVER / PRESS | PASS: hover bg rgb(217,184,127); Browse hover/press transform none (HEAD scale 1.05/0.98); press opacity 0.9; focusVisible false after a mouse press | after.json |
| C3 KEYBOARD FOCUS | PASS: solid 1px, offset 2px, focus-visible true in all 9 states. The padded crops `focus-up/scene/browse.png` show the ring. The supplied tight crops cut it off, so I re-shot them. | focus.mjs, focus-*.png |
| C4 CONTRAST | PASS: 8.32 / 10.28 everywhere | after.json |
| C5 NEIGHBOURS | PASS: notice 70/70/168, card 225/225/323, section 1445/1445/1703, scene header/next unchanged. The 375 cart and 1440 showcase screenshots were viewed: one-line labels, no overlap. | after/*.png |
| C6 CART NEIGHBOURS (stubbed) | PASS: 0 diffs vs sketch-actions and sketch-c7 | nb/ |
| C7 JOURNEY | PASS: 6/6 real clicks arrived at /store, /products/stub-track?upgrade=premium, /scenes/1; 0 diffs | after/after-journey.json, c7-compare.txt |
| C8 GREP | PASS: 100 hits; 38 solid (HEAD 104/41); builder calls 1/1/1 | |
| C9 TESTS | PASS: 12 files, 115/115, B2B3 x12 present | covering.log |
| C10 MUTANTS | PASS: M1–M16 red on expected rows; restored rc 0 | mutants.out, mutant-logs/ |
| C11 DOCS | PASS: DESIGN_SYSTEM 3 lines; doc 323 l.4 byte-equal; doc 324 7 headings and l.4 byte-equal; ledger numbers traced to head.json and sketch.json; 0 "pending" | |
| C12 PROTECTION + STUDIO | PASS: in a no-credential context `/studio/1` and `/account/downloads` show Sign in required with no owned download link; `/studio-lab` opens the demo at 1440×900 and 1280×720; protected check rc 0 | c12/, c12.out |
| C13 CLAIMS | PASS: 0 MISSING; only K2 (5/2 on the applied tree) and archive locations differ | claims.out |

**Blocked:** CART-REAL-BACKEND-503 (backend unavailable in cloud). It does not make `browserVerified` false.
**Gate rows (not claimed):** full vitest, build, biome, verify.
**Notes:**
- The first c12 run crashed on a cold route, as in round 502. It is kept as c12-cold-crash.out and replaced by a warm run (L38).
- Info, pre-existing: the shared focus ring is 1px, while the SABA-B-4 text says 1.5px.
- A-R503-CR-1: doc 324 l.4 says "C round 503 PASS", which this report now makes true.
- Scope note: the Studio find→add→fit→export WAV flow is outside this round, which only changes Store button classes. Only the premium non-bypass and the demo opening were checked.
