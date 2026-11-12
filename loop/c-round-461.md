# C round 461 — SABA-B-13 test hardening: PASS

Verdict: PASS, 0 bugs. browserVerified/realVerified true (C7 + C8 ran in real Chromium). Gate rows (full vitest, typecheck, build, Biome, lint, verify) not claimed.

| Row | Result | Evidence |
|---|---|---|
| C1 scope | PASS: only the 2 grant paths modified; no diff vs ffd0c7c in app/components or app/root.tsx | c-round-461/c1-c3.txt |
| C2 claims | PASS: output identical to claims-461-expected-after-A.txt, stderr empty; L29 hits are grant paths / commands | claims.out, claims.err, l29.txt |
| C3 apply sha | PASS 1 OK | c1-c3.txt |
| C4 covering | PASS 3 files / 62 tests; 0 "Hydration failed"; E1b, E9, E21, E21b, E20, E20b listed passed | covering.log |
| C5 mutants | PASS: own scratch (ffd0c7c + sketch), whole file; mutants.txt byte-identical to B's (BASE/BASE-ALL GREEN, M1–M10 RED, targets included); E21 (l.716) before E20 (l.741) | mutants/mutants.txt |
| C6 tripwire | PASS: doc 300 l.121 labels E21b a React tripwire without a source mutant | doc 300 |
| C7 browser anchor | PASS: prod build :5191 + mock API. inject x2: overlaySeen, styleReplaced, curState live. fresh 1440: firstPaintedLum 0, firstCovered 103 <= fp 208, gapsWhileCovered 0 (same as C r460) | r1-1.txt, r1-2.txt, fresh-1440.json |
| C8 studio+protection | PASS at 1440 and 1280, incognito, no credentials: /studio-lab opens demo, 1 clip, Playing→Stopped, stopHeld true; anonymous /studio/middle-east shows "Sign in required", audioSrc 0, media 0 (premium not bypassed) | c8.json |
| C9 docs | PASS: l.4 exact; pending count 0; 'C round N pending' 0 hits; 7 headings in order; round-461 paragraph names E1b/E9/E20/E20b/E21/E21b, REVIEW-1/-6/-7 and the three production gaps; TODO lists REVIEW-2/-4/-5, GATE460-2 | doc 300 |
| C10 L57 | L57 OK rc 0 | c-round-461/l57-check.txt |

Not run: Firefox/Safari (blocked, RETRO 465 deadline); optional A-R460-REVIEW-4 probe. No app source edited by C.
