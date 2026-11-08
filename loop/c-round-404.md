# C round 404: SYS-R385-LEAF-ACTIONS-CONTEXT stage 1 — verdict PASS (browserVerified true)

| # | Row | Result | Evidence |
|---|---|---|---|
| 1 | SOURCE-SCOPE start | PASS: claims differ only on K2/K5/K6/K8/K9/K10 (K8–K10 equal B's sketch output); 9 granted paths; frozen 1,290 rc 0; protected unchanged | `c-round-404/claims-start.txt` |
| 2 | PATCH-IDENTITY | PASS: patch applied to a `git archive HEAD` scratch; 8 files identical to the working tree | `c-round-404/patch-identity.txt` |
| 3 | AUTH (both vp) | PASS: demo opens, `auth_user` null; `/studio/middle-east` "Sign in required", 0 `audio[src]`; no-auth token 401; fake bearer 500 with no token (no backend: not claimed as 401/403) | `out/auth.json`, `shots/lab-*`, `shots/legacy-*` |
| 4 | LEAF-ACTIONS (both vp) | PASS: 32 steps each, run on pre-patch HEAD (:5198) and the working tree: 0 differences; 0 page errors; real AudioContext running, BufferSource start/stop counts, clock moves | `out/leaf-compare.txt`, `out/leaf*.json`, `shots/leaf-*` |
| 5 | INTERACT (alone) | PASS: rc 0, complete, 0 failures; 189/189 deterministic rows equal B's sketch run | `perf/interactions-compare.txt` |
| 6 | UNIT + MUTANT | PASS: A3 set 83 tests; 9/9 mutants red, control green, pristine rc 0 before/after, scratch status 0; summary equal to B's | `mutants/summary.txt` |
| 7 | DOCS | PASS: l.4 byte-exact; 7 headings; AC1–AC6; 10 mutant ids; only doc 258 added | `docs/implementation/2026/quarter-IV/258-sys-arrangement-actions-context.md` |
| 8 | SOURCE-SCOPE end + L57 | PASS: claims end == start; frozen rc 0; 9 status lines; `l57-check` OK | `c-round-404/l57-check.txt` |
| gate | full vitest, typecheck, build, Biome, verify | not run by C | |

## Finding for B (Low (A reviewer rated Medium), test strength, confirmed)
C-R404-A-AC1-COVERAGE: `actions-context.test.tsx` never touches `selectSource`/`selectedSourceId`/`sourceStates`, so AC1 would not turn red if a callback gained such a dependency. Not a behaviour bug and not a regression; the patch is dispatched byte-for-byte. Put a second source plus `selectSource` into stage 2 (or a follow-up). Also open: A's Lows (AC2 checks 4 of 34 keys; library param).

## Notes
- Task wording: Loop off keeps the brace on screen as "Loop off" (identical on HEAD); it does not hide.
- Not measured by design: export WAV (export untouched by this stage). Ableton conformance: not applicable (refactor round).
- Environment: first auth attempts timed out on cold dev-server routes; warmed in a browser, then passed.
- Also C-R404-B-LOOP-OFF-WORDING (Low, origin B spec): task row said the loop brace hides; it stays as "Loop off" (HEAD identical).
