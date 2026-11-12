# C round 457: FAIL (STOPPED, routed to B)

A stopped on A-R457-REVIEW-M1, an unruled Medium. This is the short route (L22), so C ran only SOURCE-SCOPE, CLAIMS, APPLY, the covering tests, a replay of A's probe and the purchase-protection smoke.

| Row | Result | Evidence |
|---|---|---|
| C1 SOURCE-SCOPE | PASS: the 6 grant paths; doc 298 diff vs db95f40 is l.4 only | c1-status.txt |
| C2 CLAIMS | PASS: head clone output equals `claims-457-head-output.txt`; tree output equals `claims-457-expected-after-A.txt`; stderr is empty | claims-head.txt, claims-tree.txt |
| C3 APPLY | PASS: 4 OK | — |
| C4 COVERING | PASS: 4 files / 27 tests | covering.log |
| Probe replay | **Bug reproduced**: P1, P2, P4b and P5 miss the leaf with `unfollowed=[]`; P3 and P4 are the controls. Equals A's output | probe-replay.txt |
| C7 browser (Chromium, 1440 and 1280) | PASS: 1 clip, Playing with posPlay 00:01.471, then Stopped (stopHeld true). Anonymous `/studio/middle-east` shows "Sign in required" with audioSrc 0 and media 0, so the purchase gate is not bypassed | c12-tree.json |
| C5, C6, C8, C9, C10 | Not run (short route) | — |

## Bug
**A-R457-REVIEW-M1 (Medium, origin B spec).** The walker resolves `'~/lib/u/'` and `'~/lib/u/index'` to the sibling `lib/u.ts` before `lib/u/index.ts`. TypeScript resolves them to `u/index.ts` (A measured this with `tsc`; C did not re-measure). The directory barrel's leaves are never reached, so a mounted file can read as unmounted, and LT9 stays green. P4b and P5 are two more fail-open forms of the same class.
- Exposure today: latent. `app/` has one sibling pair (`lib/utils.ts` and `lib/utils/index.ts`) and no importer uses a directory specifier.
- B decision needed: an LT9 invariant with an allow-list entry for that pair, or a directory-only resolution flag; also P4b and P5.
- The ruling text "`resolveSpecifier` can only add matches" is contradicted by P1 and P2. The same sentence is in doc 299.

Gate rows (full vitest, typecheck, build, Biome, verify) are not claimed.
