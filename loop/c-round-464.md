# C round 464 — verdict PASS (browserVerified true)

Evidence in `c-round-464/`. Gate rows (full suite, verify, build, lint) not claimed.

| Row | Result |
|---|---|
| C1 scope | exactly 3 paths (`c1-status.txt`) |
| C2 claims | cmp-equal to expected-after-A, stderr 0 (`claims.txt`) |
| C3 apply | sha256 2 OK |
| C4 covering | 14 files / 149 tests green; DC1–DC4 present (`covering.log`) |
| C5 mutants | byte-identical to B's (BASE green, M1–M9 red on listed rows) (`mutants/mutants.txt`) |
| C6 build vs HEAD | `build-compare.txt` cmp-equal; root-chunk `non-identifier-changes=0`; built keyframes = HEAD minus fadeInUp, fadeOut, float, grain |
| C7 pages (prod, Chromium) | 26/26 rows pass all conditions (`pages/dead-css-pages.json`); consoleErrorsTree empty; nonvacuity: both /store rows deadAnimTree 1, reducedHeadTreeEqual false (`nonvac.log`) |
| C8 Studio+protection (dev, fresh contexts, no credentials) | 1440 and 1280: demo opens anonymously, 1 clip, Stopped→Playing (pos 1.462)→Stopped, stopHeld true; `/studio/middle-east` shows "Sign in required", audioSrc 0, media 0 — premium not bypassed (`c8/final.json`). Attempt 1 partial output (dev compile race), attempt 2 full. |
| C9 docs | l.4 exact, pending 0, 7 headings, no keyframes/animate-/animation: text, 3 ids named, custom-property limit named |
| C10 L57 | see json |

No bugs. Notes for B: A's code-reviewer Lows L4 (named-utility suffix read as keyframes name) and L5 (vacuous JSX-comment negative fixture) are fail-silent/test-strength on sketch-pinned code — keep as deferred Lows alongside TL-R464-L1/L2. Ableton conformance: n/a (no behaviour change). Scratch builds' node_modules symlinks removed.
