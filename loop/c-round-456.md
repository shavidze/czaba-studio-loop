# C round 456 — STORE-2b-3c-2a: FAIL (STOPPED, routed to B)

A stopped on A-R456-REVIEW-M1 (Medium). By lesson L22 an unruled Medium STOP is a short FAIL; C ran the short route and reproduced the bug independently.

## Rows
| Row | Result | Evidence |
|---|---|---|
| C1 SOURCE-SCOPE | PASS: exactly the 5 grants; doc 298 diff is one line | c-round-456/c1-status.txt |
| C2 CLAIMS | PASS: clone at db95f40 equals the planning output; tree equals the sketch output except K2 dirty=5 and K10 (expected) | claims-head.txt, claims-tree.txt, stderr 0 bytes |
| C3 APPLY | PASS: 3 OK | sha256sum -c |
| C4 COVERING | PASS: 4 files / 26 tests; LT1–LT8 and GS1–GS4 each passed (in a scratch with the sketch) | covering.log |
| C5 MUTANTS | NOT RUN (short route) | — |
| C6 | expect( counts live-teal 55 and glow-shadow 21, as saved; no per-pair assert map written | — |
| C7 STUDIO+PURCHASE | PASS in a fresh browser context, 1440 and 1280: 1 clip, Playing posPlay 1.471 s, Stopped, stopHeld true; anonymous /studio/middle-east shows "Sign in required", audioSrc 0, media 0 | c12-tree.json |
| C8 DOCS | PASS | — |
| C9 L57 | see c-round-456/l57-check.txt | — |

## Bug A-R456-REVIEW-M1 (Medium, origin B spec) — confirmed
`reachableScripts` marks `components/animations/ScrollReveal.tsx` unreachable (raw 288, comment-stripped 289) although `routes/_index.tsx:39` imports it through the barrel. The cause is the comment inside `export { … }` at `animations/index.ts` l.7–20, which `IMPORT_STATEMENT` cannot match. The failure is in the unsafe direction for LT7's "unmounted" verdicts. It has no effect today: none of the 4 dead consumers flips. The fix (strip comments in the walker, add an LT8 commented-barrel fixture) is outside what A may edit, so B must rule and re-dispatch.
Evidence: flip-probe-c.log.

## For B
Ruling on M1. Pass criteria for a re-dispatch: a comment-tolerant matcher plus the LT8 fixture. Then rerun C5 (mutants) and write the C6 assert map. The doc 299 walker sentence is overstated until then.
