# C round 463 — STORE-2b-3d-2 (dead Store CSS removal + C-R462-01): PASS

Evidence in `c-round-463/`. browserVerified=true (C7 prod 26 rows + non-vacuity, C8 dev Studio/auth, both viewports).

| Row | Result |
|---|---|
| C1 SCOPE | PASS: `c1-status.txt`, 5 M + 2 new = the 7 paths of grants-463.txt |
| C2 CLAIMS | PASS: `claims.txt` cmp-equal to claims-463-expected-after-A.txt, stderr 0 bytes; L29 grep 6 lines (`l29.txt`), all grant paths / planned |
| C3 APPLY | PASS: sha256sum -c 6 OK (`c3.txt`); ArtistBioSection and TestimonialsSection present |
| C4 COVERING | PASS: 14 files / 148 tests (`covering.log`); DC1–DC3 verbose green; GT1, GT6, LT3, LT5, LT6, LT9 present in the green files |
| C5 MUTANTS | PASS: own scratch `/tmp/c463-mut` (sketch files cmp-equal to the store); `mutants/mutants.txt` byte-identical to B's (BASE GREEN, M1–M11 RED with the listed rows) |
| C6 BUILD | PASS: HEAD eb4d6df vs TREE prod builds; `build-compare.txt` cmp-equal to B's (CSS 274 removed, 0 added); `root-chunk-diff.txt` non-equal opcodes 0, non-identifier-changes=0 |
| C7 PAGES | PASS: `pages/dead-css-pages.json`, 26 rows all within the criteria (22 rows headTree+control equal; `/` and `/no-such-page-463` headTreeDiffering ≤ 3 ≤ 6; reduced equal 26/26; removedClassEls 0/0; deadAnim 0/0; invalidSelectors 0; chunk404 empty; console errors []). Non-vacuity (`nonvacuity/`): injected h1 letter-spacing turns reduced compare false on both /store rows |
| C8 STUDIO + PROTECTION | PASS (`c8/run4.json`): at 1440 and 1280 `/studio-lab` anonymous demo opens with 1 clip, Stopped → Playing (pos ~1.46 s) → Stopped, stopHeld true; anonymous `/studio/middle-east` shows "Sign in required", audioSrc 0, media 0. Runs 1–3 hit the dev first-compile race (click timeout / NO-BODY), accepted by the task; run 4 clean. Premium auth not bypassed |
| C9 DOCS | PASS: doc 302 line 4 exact; `grep -ci pending` 0; 7 TEMPLATE headings in order; literals=0; body/TODO hold the §2.2 items; K7=0, K16=1 present; `C round N pending` grep 0 |
| C10 L57 | PASS: `l57-check.txt` |
| gate | full vitest, typecheck, build, Biome, lint, verify: gate rows, not claimed |

## C-R463-01 (Low, origin B spec) — 4 orphan keyframes remain
float, grain, fadeInUp, fadeOut (app.css:193/206/1265/1276) have no `animation:`/`animate-`/`--animate-` consumer in app (C grep: 0 each). DC2 counts a whole-word text match as consumption, so they survive; they were orphaned by this round's deletions. No visible effect (C7 deadAnim 0/0). Confirms A-R463-REVIEW-M1. For B: DC2 on animation declarations only + comment fixture, then delete the 4. Does not fail the round's acceptance (the spec's own rule defines "named").

## Ableton conformance
Not applicable (no behaviour change). Backend-blocked rows: none.

Cleanup: prod servers :5190/:5191 stopped; mock API (:5199) left running for the loop.
