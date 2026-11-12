# C round 459: SABA-B-13 Store entrance cover. Verdict FAIL

`browserVerified` true (real Chromium, prod builds HEAD :5190 and tree :5191, dev :5173, mock API). Firefox/Safari are not testable in the cloud.
Evidence: `c-round-459/` (matrix/summary.txt, matrix/repeats.txt, r1-c.txt, console-c.txt, c12-covered-1440.png, c12-tree.json, mutants.txt, claims-tree.txt). JSON: `c-round-459.json`.

## Why FAIL
**C-R459-01 (Medium, origin B spec): regression vs HEAD.** With a hydration mismatch (a node inserted into `<body>` before hydration, as extensions do), HEAD still plays the entrance (`overlaySeen` true). The tree does not play it at all (`overlaySeen` false, the React-owned `<style>` is replaced, `czaba_entrance_seen` already set). Reproduced by C with A's `r1-repro.mjs` (`r1-c.txt`). A's STOP is correct. The fix is in the hash-pinned files, so B must re-dispatch (typed `window.__czabaEntrance` handshake plus a node-replacement test). The 20 mutants do not cover this.

## Rows
| Row | Result |
|---|---|
| C1 scope | PASS: 5 grant paths; root.tsx `2 0` with the two ruled lines |
| C2 claims | PASS for the claims (tree equals expected-after-A, stderr empty); L29 grep not run |
| C3 hashes | PASS 4 OK |
| C4 | PASS covering 11 files / 201 tests; mutants identical (20 lines) |
| C5 first frame | PASS: tree `firstPaintedLum` 0, firstCovered <= fp, gaps 0 in all 4 fresh rows; HEAD lum 13.2-13.5 and firstCovered > fp |
| C6 duration | NOT MET: CPU1 fresh/clientnav remFC 1466-1558 OK; CPU4 remStart 1912-1927 OK; but 1440 cpu4 logo/tag 574/383, 599/399, 634/439 (fresh) and 482/250 (clientnav, then 675/455 and 687/467). C-R459-02 (Low, noisy) |
| C7 no cover | PASS: reload and rm, both viewports and CPUs, no black samples, state null |
| C8 failsafe | PASS: blockjs/delayjs remFC 1267-1419; delayjs `expired`, logo 0 |
| C9 skip | NOT MET as written: Esc/Tab 83-362 ms, `skipped`, focus A, click CPU4 556-582 ms OK. 1440 cpu1 click50 311-373 > 300 (C-R459-03, likely probe latency) |
| C10 arrive | PASS: tree remFC 1402-1452, logo >= 741, state null; HEAD plays |
| C11 | Partial: hydration 0 in 3 fresh + 3 reload on dev; SSR warning grep not run |
| C12 | PASS: rgb(0,0,0), z 60, fixed; screenshot shows no header |
| C13 | PASS: /studio-lab 1 clip, Playing/Stopped, stopHeld true at both viewports; anonymous /studio/middle-east shows "Sign in required" with 0 audio/media (an early "NO-BODY" at 1440 was a first-load race; recheck on dev, HEAD prod and tree prod was clean) |
| C14 | PASS: doc 300 l.3/l.4 exact, 7 headings in order, 0 `pending`, E1-E14+E8b, Tailwind/Android/TLM present; lessons.md 60 lines, "first painted frame" present. Note: l.4 says "Completed (C round 459 PASS)" and is untrue until a PASS |
| C15 | PASS rc 0 (`c-round-459/l57-check.txt`) |
| Gate rows | not claimed |

## For B
- Re-dispatch with the R1 fix, with a regression test and a mutant for the node-replacement case.
- A's Lows R2 (listeners self-timeout), R3, R8 are worth bundling.
- Revisit the C6 floors under 4x CPU (the 600/400 thresholds sit on the noise edge) and the C9 click probe (issue the click without the boundingBox round trip).
- Saba's check must use a fresh tab.
