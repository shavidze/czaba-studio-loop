# C round 454 — STORE-2b-3c-1 (live teal CSS) — PASS

Real Chromium (Playwright) at 1440x900 and 1280x720. Tree `:5173`, HEAD control `db641ec` on `:5182` (own git-archive server, stopped afterwards), mock API `:5199`. Each server warmed twice. Probes run one at a time. New contexts, no credentials.

| Row | Result | Evidence |
|---|---|---|
| C1 scope | PASS: only the 4 granted paths | c1-status.txt |
| C2 claims | PASS: equals sketch output except K10 (1 files) and K12 (outside 0 inside 4); stderr empty | claims-tree.txt |
| C3 apply | PASS: `sha256sum -c` 3 OK | |
| C4 live states | PASS: ROWS 19 ALL_OK True at both viewports (HEAD control shows teal, tree none; player/card/404/palette/cart/studio digest equal; 0 page errors) | compare-1440.txt, compare-1280.txt, shots/ |
| C5 control | PASS: head-vs-head ALL_OK False | compare-self-*.txt |
| C6 scrollbar pixels | PASS: HEAD tealPx 1046 / 524; tree tealPx 0, thumbGreyPx 1030 / 508; geo equal | sb-*.json |
| C6b extras + sweep | PASS: ROWS 8 ALL_OK True both viewports; self-control fails | compare-extras-*.txt |
| C7 covering + mutants | PASS: 14 files / 134 tests; 27 mutant lines equal B's | mutants/mutants.txt |
| C8 studio + purchase | PASS: /studio-lab 1 clip, Playing posPlay 1.46 s, Stopped, stopHeld true; anonymous /studio/middle-east "Sign in required", audioSrc 0, media 0; only url and posPlay differ from HEAD | c8/ |
| C9 doc 297 | PASS: l.4 exact, 7 headings in order, 0 pending, LT1–LT6 present | |
| C10 L57 | PASS | l57-check.txt |

Not claimed (gate): full vitest, typecheck, build, Biome, verify. BLOCKED: backend-only rows and Firefox/Safari scrollbar (listed in the JSON). Visual spot check of the player crop: brass play button, no teal halo.

Bugs: none. Reviewer findings from A (M-DEAD-UNCHECKED etc.) go to B for 2b-3c-2/2b-3d; they are not behaviour defects.
