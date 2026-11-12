# C round 462: STORE-2b-3d-1 (6 dead Store modules deleted)

Verdict: PASS with 1 Low bug (C-R462-01, B spec). browserVerified/realVerified true (C7 + C8 in real Chromium, 1440x900 and 1280x720). Gate rows (full vitest, typecheck, build, Biome, lint, verify) not claimed.
A's K23 STOP is a claim-value STOP (L22): full run done.

| Row | Result | Evidence |
|---|---|---|
| C1 scope | PASS: 6 D, 8 M, doc 301 new = grants-462.txt | git status |
| C2 claims | PASS: only K23 differs (`292 293 294 296 297 301` vs expected `...297`). Cause: B's placeholder doc lacked line 4; A's doc has the required line. B spec, info. stderr 0 B. L29 17 lines = B's | claims.txt, l29.txt |
| C3 apply | PASS: 8 OK, 6 absent, ArtistBio + Testimonials present | |
| C4 covering | PASS: 6 files / 77 tests | covering.log |
| C5 mutants | PASS: mutants.txt identical to B's (BASE GREEN, M1-M9 RED) | mutants/mutants.txt |
| C6 build vs HEAD | Server 0 diff lines, 101 JS chunks none differ, fingerprints 0, control 1. **CSS differs**: removed=0 (expected 12). Cause confirmed by experiment: doc 301 names the 12 class strings and Tailwind v4 scans docs/*.md; the tree without doc 301 is byte-identical to B's build-compare. No live element affected. Judged benign, Low bug C-R462-01 | build-compare.txt, build-compare-nodoc.txt |
| C7 store pages (prod) | PASS: 12/12 rows headTreeEqual, controlHeadHeadEqual, equal status/h1/freeSamples, tokenEls 0, chunk404 empty, no console errors | pages/store-pages.json |
| C8 Studio + protection | PASS (3rd run; run1 dev compile crash, run2 NO-BODY race, both documented): /studio-lab anonymous opens demo, 1 clip, Playing then Stopped, stopHeld true at both viewports; /studio/middle-east anonymous "Sign in required", audioSrc 0, media 0 (premium not bypassed) | c8/run3.json, run1/2 |
| C9 docs | PASS: line 4 exact, pending 0, headings in TEMPLATE order, 6 files/permission/four kept/GT6/TL-R462-L1/12 utilities named, TODO lists 2b-3d-2, L2, L3. But l.112 claim that the 12 utilities leave the bundle is false for the shipped tree (C-R462-01) | doc 301 |
| C10 L57 | see l57-check.txt | |

Bug C-R462-01 (Low, B spec): doc 301 contains the literal class strings, so the dead utilities stay in CSS (775 B). Fix later: reword doc to avoid the literal tokens (or state the bundle effect accurately), or carry into 2b-3d-2. Does not block.

Not verified: Studio audio graph/WAV export (no Studio code changed). Servers 5190/5191 stopped; mock API on :5199 left running by C.
