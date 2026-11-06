# C round 374 — PERF-11c-iii-a (Master strip + closed Export dialog leaves)

**Verdict: PASS.** 0 bugs. `browserVerified` and `realVerified` true. Evidence is under `c-round-374/`; the machine-readable result is `c-round-374.json` (L57 check: `c-round-374/l57-check.txt`, exit 0).

| Row | Result | Evidence |
|---|---|---|
| SOURCE-SCOPE | PASS | 8 status lines at start and end; frozen rc 0; protected rc 0 (`scope.txt`) |
| CLAIMS | PASS | equals the sketch output except K2=8, K16 doc 241 = 1; 0 MISSING (`claims.txt`) |
| SKETCH-EQUAL | PASS | 7/7 OK |
| ASSERT-COUNT | PASS | 52/14, 86/23, 140/15 = `expect-counts-374.txt` |
| UNIT | PASS | 140 files, 2195/2195 tests (`unit.json`); shuffle seed 42: 46/46; slowest CP12a 6.5 s of 30 s |
| MUTANTS-TREE | PASS | 6/6 red with B's failing ids (`mutants/`) |
| PERF-INTERACT | PASS | run twice. zoom.1 = 67, zoom.30 = 154, start/stop 11/11, click 38; 19/19 release rows equal sketch values (`release-compare.json`); HEAD values 73/160 not seen |
| PERF-RESOURCES | PASS | passes; `res.harness.export-1-produced` PASS |
| MASTER-BROWSER | PASS | A = HEAD copy at both viewports, every step (`master-A.json`, `master-HEAD.json`) |
| EXPORT-DIALOG-BROWSER | PASS | names, focus, Tabs, formats equal; focus returns to Export (not BODY) after Escape and keyboard open; WAV valid (`exp-A.json`, `exp-HEAD.json`) |
| STATUS-LT12-BROWSER | PASS | all texts and `data-playing` equal HEAD and B's v2 record (`lt12-A.json`, `lt12-HEAD.json`) |
| G374-AUTH | PASS | `/studio-lab` loads with `auth_user` null; `/studio/middle-east` = "Sign in required", 0 workspace, 0 `audio[src]`; token endpoint 401; no token in bodies (`auth.json`). Premium auth is not bypassed |
| STUDIO-SMOKE-374 | PASS | play >= 1 s; lane drag + Undo title; hold ArrowRight; equal HEAD (`smoke-A.json`) |
| DOCS | PASS | l.4 exact; headings in order; named files/tests exist |

**Blocked (not pass):** fake-bearer token request returns the fail-closed 500 because there is no backend in the cloud.

**Gate rows (not claimed):** full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke.

**Notes for B (no bugs):**
- RB-LEAF1 cannot detect a revert of the Master site in StudioWorkspace; only PERF-INTERACT counts do (code-reviewer L4). Consider the extra assertion in a later round.
- Smoke script drags Music -> Stems, so the move text names Stems; round 373 recorded SFX. Same form, equal on HEAD.
- Master ArrowDown x2 = two undo steps, and Export needs ~80 Tabs from body; both equal HEAD, unchanged by this round.
