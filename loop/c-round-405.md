# C round 405: SYS-R385-LEAF-ACTIONS-CONTEXT stage 2 of 2

**Verdict: PASS** (`browserVerified` true). Evidence in `c-round-405/` (out/, shots/, mutants/, tools/). Gate rows (full vitest, typecheck, build, Biome, verify) not run by C.

| # | Row | Result |
|---|---|---|
| 1 | SOURCE-SCOPE start | PASS. Claims differ from planning only on K2/K5/K6/K6b/K7–K13 (`out/claims-planning-vs-start.diff`); 7 status lines = the 7 grants; frozen 1292 rc 0; protected rc 0 |
| 2 | PATCH-IDENTITY | PASS. Patch (sha256 c64a5589ed319464) applied to a `git archive HEAD` scratch; 6 files byte-identical to the working tree (`out/patch-identity.txt`) |
| 3 | AUTH (1440×900, 1280×720) | PASS. Demo `/studio-lab`: `auth_user` null, workspace + demo badge, no "Sign in required". `/studio/middle-east`: "Sign in required", 0 `audio[src]`, no workspace. `/api/studio-token` without auth: 401. Fake bearer: 500, no token (backend unavailable) — BLOCKED, not claimed (`out/auth.json`). First auth run timed out on a cold dev route (environment); passed after warm-up |
| 4 | STUDIO-SMOKE (both viewports) | PASS. 32 steps × 2 (`out/leaf.json`, `shots/`): Enter / Add button adds a clip (+1), Undo works; Play moves the clock with a `running` AudioContext, Stop halts it; Master Mute aria-pressed true→false; library preview starts/stops (previewing marker 1→0, buffer sources start 2 / stop 2); 0 page errors. 0 differences against the round-404 working-tree run of the same script |
| 5 | UNIT + MUTANT | PASS. A3 set: 6 files, 85/85 (`out/vitest-a3.log`). Mutants on `/tmp/c405-scratch`: 14/14 RED, gap mutants' must-stay-green lists empty, pristine before/after rc 0 on 5 files, scratch status 0. `mutants/summary.txt` is identical to B's. The four comparator mutants (GH2 ×2, RB-LEAF3 ×2) are red, so GATE371-L2 and GATE375-L2 are closed per D-29z1399 |
| 6 | DOCS | PASS. Doc 258 l.4 byte-exact; 7 headings in order; summary block verbatim; AC7 (actions-context:320), FP0 (fader-pointer-preview:470), GH5 (selection-wrappers-render:472) exist; 0 `C round N pending`; only doc 258 changed |
| 7 | SOURCE-SCOPE end + L57 | PASS. Claims at end equal claims at start; K7–K13 equal B's sketch output; `l57-check` OK (`out/l57-check.txt`) |

## Findings
- **C-R405-GH5-NOT-G1-VACUOUS** (low, test strength; origin A reviewer, dispatched test). `selection-wrappers-render.test.tsx:490` `expect(muted[0].id).not.toBe('g1')` can never fail, because `groups.ts:336` defaults `groupId` to `crypto.randomUUID()`. The live `groupHeaderIds` assertion is proven by MU-405-GH5-RECORDER. A and the reviewer rated it Medium; C rates it Low (patch dispatched byte-for-byte, no behaviour impact, 14/14 mutants red). For B: assert `muted[0].name === 'Group 2'` or compare with the folded group's id.
- A's Low items (meter-ui name count, AC7 two-tick timing) are not C bugs.

## Not verified / blocked
- Fake-bearer token path: backend unavailable in cloud (BLOCKED).
- Ableton conformance: not applicable (test-only plus one parameter rename).
- Gate rows: left to the root gate.
