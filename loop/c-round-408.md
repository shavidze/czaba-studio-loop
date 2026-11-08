# C round 408 — PERF-11c-iii-e-i (Lane callbacks from actions context): PASS

Evidence in `c-round-408/`. Browser: Playwright/Chromium, fresh contexts, 1440x900 and 1280x720.

| # | Row | Result |
|---|---|---|
| 1 | SOURCE-SCOPE start | claims == A's claims-end (only K1-class diffs vs planning as A4 allows); status 4 granted paths; K3 1298 rc 0; K4 rc 0 |
| 2 | PATCH-IDENTITY | patch sha 029e5f8a…; applied on `git archive HEAD`; cmp of 3 files: 0 differences |
| 3 | LANE-ACTIONS (browser) | `ok` true, no error, pageErrors [] at both viewports; mute/solo/volume-drag/pan-drag/undo-mix/active-track all pass (`lane-*.json`) |
| 4 | LEAF-PROBE (browser) | Lane `[0,12,4,4,0,0,0,4,4,4,4,4,8]` both viewports; 0 diffs vs `leaf-sketch-408.json` for every leaf; StudioWorkspace equal. 1440 attempt 1 = cold-server timeout (kept), retry passed |
| 5 | UNIT+MUTANT | 46 files, 911/911, rc 0; slowest 2010 ms. Mutants on committed scratch: 5/5 RED, pristine before/after rc 0, scratch status 0, summary identical to B's |
| 6 | AUTH (browser) | demo /studio-lab opens, auth_user null, no "Sign in required"; /studio/middle-east shows "Sign in required", 0 audio[src]; /api/studio-token no auth = 401. Fake-bearer BLOCKED (no backend) |
| 7 | DOCS | doc 261 l.4 byte-exact; 7 headings in TEMPLATE order; mutant rows match; 0 "C round N pending" |
| 8 | SOURCE-SCOPE end + L57 | claims end == start; l57-check OK |

Not measured: library drop / video import / lane drag in browser (unit-covered, per task note); export WAV not re-measured (no export path changed; gate). Gate rows (full vitest, typecheck, build, Biome, verify) are not claimed.
Lows (not bugs, for B): B-R408-PROBE-ACTIVE-TRACK-VACUOUS, A-R408-REVIEW-AC8-PAN-TITLE, TL-R408-SK-L1/L2.
