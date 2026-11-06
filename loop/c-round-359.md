# C round 359 — C-R358-01: tempo, grid, Snap and metronome survive a Studio remount: PASS, browserVerified true

Tree: HEAD `f269022` + A's 5 files (`c-round-359/status.txt`). Dev server :5173 for browser rows; production build on :5188 for PERF. No source edited; the mutant ran in a scratch copy.

| Row | Result | Evidence |
|---|---|---|
| CLAIMS | PASS, equal to `a-round-359/claims-final.txt` | `claims.txt` |
| SOURCE-SCOPE | PASS, exactly the 5 files; `package.json` and `perf/**` untouched | `status.txt` |
| READ | PASS. Store created per provider via `useState(() => create…)`; 10 fields restored (initialisers) and saved from refs on unmount; seed effect unchanged; 0 `setStatus` in the diff | `source.diff` |
| UNIT | PASS, 79 files, 1452/1452 | `cover.log` |
| MUTANT (C's own) | Predicted WS rows stay green when `snapEnabled` is not restored. Result: 5/5 green, survived. Low coverage gap (bug C-R359-01), not a FAIL | `progress.json`, `mutant-snap.log` |
| TEMPO-REMOUNT, both viewports | PASS. After resize 1: 120 and the seed sentence ×1. After typed 100 and resize 2: 100 and ×0. JSON equal to B's sketch. HEAD contrast: ×2, then 120 and ×1 | `beh-tree-*.json`, `b-round-358/beh-sketch-*.json`, `c-round-358/beh-head-*.json` |
| SETTINGS-REMOUNT, both viewports | PASS. Snap off, division 1/8 and metronome on survive the resize. Bars ruler is present (20 px) | `settings-probe.json`, `extra.json` |
| METRONOME-AUDIO, 1440×900 | PASS. Counted `AudioBufferSourceNode.start` calls and separated click buffers (0.03 s) from clips (16 s). A = 8 clicks, B after remount = 8. Control with metronome off = 0 | `settings-probe.json` |
| CLEARED, 1440×900 | PASS. The field stays empty and no seed sentence is appended | `settings-probe.json` |
| RELOAD, 1440×900 | PASS. After typing 100 and reloading, the field is empty before adding a clip. Adding the clip seeds 120 and Snap on | `settings-probe.json` |
| VIEW-STATE (record) | After the resize Env resets to off and waveform zoom 8× resets to 1×, as B expected. Not a FAIL | `extra.json` |
| REMOUNT | PASS, equal to `c-round-358/remount3-tree.json` | `remount3-tree.json` |
| FOLLOW | PASS on texts, both viewports. 1440 is equal. At 1280 the first run was 5 px off (1452 vs 1447); two repeats gave 1447 and 1450. C358 head was 1445 against tree 1447, so this is timing jitter and not a regression. Strictly, the 4 px tolerance was exceeded once | `follow-tree-*.json`, `-r2`, `-r3` |
| PERF (production, alone) | PASS. 84/84 asserted, 0 NEW, 0 DIFF. 181 rows EQUAL against C358 (the rest are wallclock), so the new provider layer adds no commits or components | `perf-rowcmp-vs-c358.txt` |
| G359-AUTH, both viewports | Premium not bypassed. Unauthenticated GET is 401, `/studio/middle-east` shows "sign in required" with 0 audio elements, and the response body has no token. The fake-bearer request returns 500 (fails closed) because the mock backend is down. Listed under `blocked` | `auth.json` |
| DOCS | PASS. l.4 is `**სტატუსი:** Completed (C round 359 PASS)`. The 7 headings match TEMPLATE. WS1–WS5 and M-S1–M-S5 are cited. 0 files match `C round N pending` | doc 235 |

## Bug for B
- **C-R359-01 (Low, coverage):** `snapEnabled`, `gridDensity`, `secondsGridDivision` and the hand-chosen flags can be dropped from the restore without a red test. The browser SETTINGS row does not catch it either. Suggested rows: WS6 (seeded Snap on survives), WS7 (adaptive density), WS8 (Snap off before any tempo clip, remount, add a bpm clip: Snap stays off). Goes to `deferred_low_polish`.

## Gate rows (not claimed)
Full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke.

## Ableton conformance
Not applicable. This round is a state-loss fix with no Live claim.
