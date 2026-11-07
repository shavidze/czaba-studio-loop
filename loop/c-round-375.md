# C round 375: PERF-11c-iii-b — PASS (0 bugs)

Source untouched: 7 status lines, frozen/protected/sketch sha checks rc 0 at start and end. Claims match (K2=7, K14 doc 242: 1, no MISSING). Assert counts 160/16, 71/14, 526/74 equal to the sketch.

| Row | Result | Evidence |
|---|---|---|
| UNIT | PASS 140 files / 2198 tests; shuffle seed 42 2 files / 30 tests | unit-covering.log, unit-shuffle.log |
| MUTANTS-TREE | PASS 10/10 red with the same failing ids as B's logs; files restored | mutants/ |
| PERF-INTERACT | PASS: zoom.1 53 (6x too), zoom.30 140, start 11, click 38; 189 deterministic rows equal B's sketch values; 0 FAIL | perf-interact.log |
| PERF-RESOURCES | PASS, export-1-produced assert PASS | perf-resources.log |
| LEAF-PROBE | PASS at both viewports: Library/Preview views and wrappers 0 on zoom in/out, lane mute, Ctrl+Z; preview start renders preview view 12x. HEAD: 1/1 (1280). HEAD 1440 first run cold timeout (env-invalid) | leaf-A.json, leaf-HEAD.json |
| LIB-KEYS/MENU/PREVIEW/LAYOUT | PASS A == HEAD both viewports (Add disabled on Video lane with the stated title, enabled on Music; drag add 0→1; notice dismiss persists; collapse focus hand-off; separator 288→336; focus returns to search, not BODY). Two flakes only: activeElement after ArrowDown alternates between trees run to run; preview cursor text differs by timing | rows-A3.json, rows-HEAD3.json |
| G375-AUTH | PASS: fresh context `/studio-lab` shows workspace, auth_user null; `/studio/middle-east` shows Sign in required, 0 workspace, 0 audio[src]; `/api/studio-token` no token 401, no token leaked. Fake bearer gives 500 fail-closed: blocked (no backend) | auth.json, token-*.txt |
| STUDIO-SMOKE | PASS: Enter add, play position 00:01.462 after 1.5 s, name-bar drag to lane below with "Undo: Move to track — Stems", Ctrl+Z restores; Master Mute toggles and Ctrl+Z restores | rows-A3.json, master.json |
| DOCS | PASS: l.4 byte-exact, 7 headings, named rows exist, 0 pending hits | |

Caveat: my first rows run used wrong preview/clock selectors and errored identically on both trees (vacuous); fixed and rerun (A3/HEAD3). Gate rows (full suite, build, verify, smoke e2e) are for root. A's reported Lows (RB-LEAF3 per-step, prev-only undefined key) remain B's decision, not bugs.
