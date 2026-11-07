# C round 389 — REGRESSION part 1 (rounds 343–388), Playwright Chromium on dev :5173

SOURCE-SCOPE start and end: HEAD `11ca746`, status empty, protected 11/11 OK, tree sha list 0 failures. A changed nothing. Evidence is in `c-round-389/` (scripts in `tools/`, logs in `logs/`, comparisons use `tools/jdiff.py` against the original round's JSON). Dev server on :5173 only; prod build served briefly on :5189/:5190 for heap and export-trunc rows, stopped after. Mock API started once for the journey, PID stopped.

| Row | Result | Evidence |
|---|---|---|
| G389-AUTH (both vp) | PASS: `/studio-lab` anon opens the workspace, `auth_user` null; `/studio/middle-east` "Sign in required", 0 `audio[src]`; `/api/studio-token` no header → 401, no token. Fake Bearer: BLOCKED (backend unavailable in cloud) | auth-smoke.json |
| R389-SCHED-FAIL | PASS: loop on, Play, meters move; injected `start()` throw: thrown 1, `could not be scheduled` text, all 5 meters `-inf` (2 samples), pageErrors []. Control: normal Stop floors meters, thrown 0. M2 flow: play1/2 thrown + scheduleFailed + clock 0 frozen, leaked 0; play3 plays; afterStop leaked 0 (equals round 388) | meter-*.json, mc-*.json, m2-1440.json |
| R389-RESYNC-METER | PASS: 1.5 s main-thread block, same end state: stopped, status, meters `-inf` twice, errors []. Re-run with a second clock read 800 ms later: 00:01.182 → 00:01.182 at both viewports (frozen) | resync-*.json |
| R389-EDIT-THROW | PASS: edit during the armed throw keeps the clip (clips 2) with Undo "Add — Middle East" enabled, scheduleFailed, clock frozen, next clean Play plays | m1b-*.json |
| R389-DECODE-CACHE | PASS: refusal "has not loaded yet", 2nd Space starts audio (both scenarios); evict: one stop on the evicted preview, live `[2,5,16,16,16,16,16]`, Add live, Undo removes it (== round 384 except nothing); BROWSER-L2-OK/FAIL both vp equal round 386; HEAP-RETAINERS-PROD 1440 prod build live `[2,5,16,16,16,16,16]`, 0 `baseQueue` | playrefuse.json, evict-b2-count.json, pwp-*.json, heap-1440*.json |
| R389-WAV-STREAM | PASS: both vp RIFF/WAVE 24-bit 48 kHz stereo, 32 s, peak 0.297, 0 NaN, 99.98% non-zero; 1440 two exports of a 3-clip project have equal sha256; dialog closes on Esc, no page error | logs/export*.log, export-det.json |
| R389-LEAVES | PASS: Stems group mute/solo/fold; master drag −20.0 dB and dblclick reset 0.0 dB; Export Esc → focus back on Export; library select/Preview/Add; Play/Stop/Back/Follow; loop create and both brace ends dragged (03:45–11:875); marker add/rename/delete; 0 page errors | leaves.json, browser.json, brace.json, misc.json |
| R389-STATUS | PASS (note): texts equal round 373 (add, Play, Stop, drag unchanged; post-release "Move clip: …"). **Esc during a clip drag does not cancel the drag** (release still commits "Move clip: start 00:02.500"); round 373's own row used Ctrl+Z during the drag. Known and ruled earlier (backlog C-R85-L1 low, ESCAPE-CANCEL-GESTURE info; round 338 "Esc no-cancel as HEAD"); not a regression | misc.json |
| R389-LAZY | PASS: 0 signalr requests, direct and via `/` → `/studio-lab`; no route-level fade on `/studio-lab` (4 frames, one IMG at opacity 0.95–0.97, ≈40 ms); home route fades as before; control nav `/` → `/free-downloads` fades. Log `logs/nav.log` | misc.json |
| R389-STEM-CACHE | PASS: cold/warm/blocked/clear at both vp: warm = conditional 304; blocked reopen ready; clear re-fetches; export after cached load non-silent 101.352 s, == round 368 | cache-*.json, export-trunc.json |
| R389-RANGE-BG, SELECT-TRANSPORT | PASS: 0 diffs vs rounds 364 / 362 (ids and clock only) | bg-*.json, playstop-*.json |
| R389-PLAY-STORE | PASS: follow/marker 0 diffs; Follow scrolls 0→1178; settings survive remount 0 diffs; narrow state "The Studio works on a computer"; its status text no longer repeats the Tempo sentence (lookup: later change) | follow-*.json, settings-probe.json, narrow.json |
| R389-VIDEO-DRAG | PASS (both vp): move 0→2.25 s with Undo; trim/fade probe equal round 350 (only blob URLs differ) | flow log, video350.json |
| R389-FADERS-ICONS | PASS: faders 0 diffs of 165, icons outerHTML 0 diffs of 24 | faders.json, vis/ |
| R389-GROUP-MOVE | PASS: both clips +2.85 s, Undo "Move (2)", restored. collapsed variant 1440/1280 moves and Undo `Move (2)`; Stems-folded overview bar shifts after the move (`logs/ovf.log`, geometry check) | group-*.json |
| R389-JOURNEY | PASS (mock API): product → "Try it in the Studio" → `?preview=middle-east`, title "CZABA Studio", Enter adds, Space plays to 1.271, Stop, "View in store" new tab opener null. WAV export is shown by R389-WAV-STREAM, not inside the journey | journey.json, shots/ |
| RR-PERF | PASS: rc 0, 4 passed (16.8 m), 218 assert rows PASS, 0 non-PASS, 4 files `complete` true | logs/perf.log, perf-results/ |
| PERF-LIB | PASS: 3 files / 54 tests | logs/perflib.log |
| RG-SMOKE | PASS: 2 passed | logs/smoke.log |
Gate rows (not claimed): full vitest, typecheck, build, Biome, verify.

Bugs: none. Open questions for B: (1) Esc does not cancel a clip drag; decide whether any Esc-cancel is intended (no Ableton claim made). (2) Video sound after the move was not re-asserted. (3) Lookups: master.mjs :5180 removed; /Pulse/ option regex; narrow status text; journey rebuilt from round 300 (round-340 script not found), WAV export not spliced into it; resync-meter and m1b are derived scripts; cache.mjs base must be the /studio-lab URL. L57 fields all null (no sketch, no A change); `l57-check.txt`, `claims-389-c.txt` equal at start and end.
