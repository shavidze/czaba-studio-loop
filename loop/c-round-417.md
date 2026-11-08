# C round 417 — SYS-CLOCK-DETERMINISM (test-only): PASS

browserVerified true. HEAD 344a59f; 5 test files modified + doc 268. Evidence in `c-round-417/`.

| # | Row | Result | Evidence |
|---|---|---|---|
| 1 | Source scope + claims start | PASS: equals A's claims-end; stderr 0 bytes; K14 lists 7 ids, none NOT-FOUND (C-R416-CLAIMS-K22-ARCHIVE fixed); frozen 1311 rc 0; protected rc 0; K2b 0 | `claims-start.out/.err` |
| 2 | Patch identity + unit | PASS: sketch applied to `git archive HEAD` scratch is cmp-identical to all 5 working files; vitest 5 files 63/63. Diff = 16 hunks in the named rows/afterEach/SF destructuring (inspected, not tool-checked) | `vitest-a2.log` |
| 3 | Mutants | PASS: HEAD-base scratch, 12 lines equal to B's summary (same order); loaded replicate (2 busy loops) 63/63 | `b416copy/mutants/summary.txt`, `vitest-loaded.log` |
| 4 | IM24 browser | PASS at 1440x900 and 1280x720: playing Ctrl+Right visits 2.000, 6.000, then 16.000 and stops; polled Stopped; next press shows "No more markers after the insert marker", insert marker 16.000, stays stopped | `browser.json`, `shots/after-final-press-*.png` |
| 5 | Play/stop smoke | PASS both: 1.062 s position per ~1.12 s wall; frozen after stop; 0 page errors | `browser.json` |
| 6 | Auth | PASS both: demo opens with auth_user null; `/studio/middle-east` "Sign in required", 0 audio[src]; token API 401. Fake-bearer path BLOCKED (no backend) | `browser.json`, `shots/auth-premium-*.png` |
| 7 | Doc 268 | PASS: l.4 byte-exact; 7 headings in TEMPLATE order; mutant block contains the 12 lines; 442, 6,784,880, 1,000, 50 ms, source path, 6 ids present | — |
| 8 | Scope end + L57 | PASS: end claims == start claims; runtime/helper diff empty; l57-check OK | `claims-end.out`, `l57-check.txt` |

gate rows (full vitest, typecheck, build, Biome, verify): not run by C. Ableton conformance: does not apply.

## Findings (both Low, B spec; neither blocks)
- **C-R417-L58-SKETCH-REVIEW-MISSING:** no `b-round-416/sketch-review.md`, claims has no l58 call (as A said; repeat of round 415).
- **C-R417-BW5-HOIST-FRAGILE:** confirms A's M1 as latent: with the getters read once (hoist) and the full build restored, BW5 stays green (151 ms). My mutant was crude (BW2/BW3 went red for reasons I can't attribute), so I only claim the latent weakness. Today MU-BW5-FULLBUILD is red on the sketch. B should rule: add a read-independent work signal.

Not verified: A's L1 (IM24 `advance(0.05)` no-op), not run. For B: ruling-2 text (IM24 uses the shared helper) per A.
