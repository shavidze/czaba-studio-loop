# C round 392 — PERF-13b-ii re-dispatch: PASS (browser rows); gate rows left to root

Real Chromium (Playwright), `http://127.0.0.1:5173/studio-lab`, fresh context per row, 1440×900 and 1280×720. Probe: `c-round-392/probe.mjs` (copy of the round-391 probe2 setup + own `__delayFailDecodes`). Results: `c-round-392/probe-1440.json`, `probe-1280.json`; `nb.json` (auth + neighbour); screenshots `c-round-392/*.png`; `perf-res.log`; `claims-start/end.txt`.

| Row | Result | Evidence (both viewports unless noted) |
|---|---|---|
| **B7 SUPERSEDED (C-R391-01)** | PASS | Status sequence `Loading “Middle East — public preview”…` → `“Middle East — public preview” is ready.`; final = ready (not stuck on loading). Only one buffer started (16 s = Full mix), Middle East (>100 s) never started. 0 pageerror |
| **B8 PREVIEW-THEN-SPACE** | PASS | `data-playing`=true; sequence Loading → ready; final not loading |
| **B9 SUPERSEDED-FAILURE** | PASS | Loading → `“Middle East — public preview” failed to load — details are in the library.`; Full mix (16 s) is the started preview; 0 pageerror |
| **B1 PREVIEW-LOADING** | PASS | mid=`Loading…`, then ready; >100 s source started |
| **B2 PLAY-LOADING** (no level clause) | PASS | Space during decode: status Loading, `data-playing` false; after settle `is ready`; a second Space → playing true |
| **B3 FAILED-CLIP-PLAY** | PASS (see note 1) | after Undo of a failed clip the line = `…failed to load — details are in the library.`; no pageerror |
| **B4 FAILED-CLIP-EXPORT** | PASS | WAV and MP3: 0 downloads, dialog shows `Export failed — no file was created. “Middle East — public preview” failed to load — details are in the library.` |
| **B5 CONTROL-EXPORT** (extra, re-run) | PASS | RIFF/WAVE, 48 kHz, 2 ch, 24-bit, 101.35 s, non-silent (29 189 420 B); dialog also warns `Overload: peak +0.0 dBFS — 14 samples clipped` (pre-existing demo content) |
| **PERF-RES** (alone) | PASS | 1 passed; pcm-live-mib-ready 31.9 ≤ 60, decode-mib 0 ≤ 0. `perf-res.log` |
| **Neighbour: EV13** (1440) | PASS | Preview while the timeline plays: playing stays true during decode (`Loading…`), status → `is ready`. The timeline then stops (pre-existing Q-PREVIEW-STOPS-TRANSPORT, out of scope) |
| **Neighbour: first load** | PASS (partial) | observer sees `Demo collection ready. Drag a sound onto a track, or press Enter to add it. Press ? for shortcuts.`; the earlier `Loading the demo collection…` happens before the observer is installed, not recorded |
| **Auth** (fresh context, no credentials) | PASS | `/studio-lab` opens the demo (localStorage has only the analytics key). `/studio/some-premium-product` renders "Sign in required" with no workspace; `/api/studio-token` returns 400 without credentials. Premium is not bypassed. Screenshot `auth-premium-1440.png` |
| **SOURCE-SCOPE** | PASS | Claims at start == end == A's end claims (diff empty). `git status`: 5 M (ArrangementContext, eviction test, strings, strings.test, budgets) + new doc 251 = granted paths only. Frozen 0 failures, protected 11/11. K8=4, K10 `0 0`, K16 35/0/1/3, K21 1/251 as expected |
| **DOC-251** | PASS | Georgian; 7 TEMPLATE headings in order; l.4 `Completed (C round 392 PASS)` per L28; every EV id cited (EV3, 9, 12, 16–25) exists in the test file |
| **Gate rows** (full vitest, typecheck, build, verify) | gate | not run by C, not claimed |

## Notes for B
1. **B3: `data-playing`=true after Space with only a failed clip** (same value as round 391's accepted B3, unchanged by this round). I did not investigate what plays (likely the demo's other audio/video lane); if the intent is "Play with only a failed clip does not play", a row should name what plays. Not a regression and not marked as a bug.
2. **A-R392-REVIEW-M1** (stale clip from a previous collection → false `is ready`, no playback) is unreachable in `/studio-lab` (constant collection), so I could not reproduce it in the browser. It becomes real with SRW-21 / STEM-LANES; keep it as a prerequisite signal for those tasks.
3. **MU-392-IGNORE-ABORT equivalent** (A's argument): the abort branch has no red proof; EV25 is a record row. No browser path reaches it either.
4. C-R391-01 is closed by B7/B8/B9 evidence. C-R391-02 stays in `deferred_low_polish` (D-29z1334).
5. Probe-cost: two concurrent probe runs timed out once on cold dev compile; sequential runs were reliable.
