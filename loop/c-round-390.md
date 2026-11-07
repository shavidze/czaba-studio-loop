# C round 390 — REGRESSION-2026-11-08 part 2

**taskStatus PASS**; browserVerified True.

Regression part 2 on HEAD 11ca746 (A changed nothing): the two carried rows (R390-VIDEO-SOUND, R390-WAV-3CLIP-LEN) pass at both viewports; the round-340 §4d, §4c, §4b/§4 and §3 rows were replayed in real Chromium against the round-341/342 and c301 oracles with 0 behavioural regressions; 0 bugs. Four older probes needed harness lookups (see observations).

| Row | Result | Evidence / note |
|---|---|---|
| SOURCE-SCOPE-start | PASS | HEAD 11ca746, status empty, K3 11 OK, K4 0 failures `out/claims-start.txt` |
| MOCK-START | PASS | mock-api PID 3773 on :5199, /api/products 200 `mock.pid` |
| R390-VIDEO-SOUND | PASS | both viewports: before move sound 0.31-4.03 s (peak 0.50); moved to 3.000 s (grid-snapped, not 2.25) silent 0.5-2.6 s (level 0), sound from 3.13 s, peak 0.503; Undo returns start to 0.000 and sound from 0.30 s; pageErrors []. Also pk-video-sound (held decoding level 0, ready 0.50) PASS at 1440 `out/vsound-1440x900.json, out/vsound-1280x720.json, out/pkvid-1440.json` |
| R390-WAV-3CLIP-LEN | PASS | both viewports: dialog 00:00.000-00:48.000; RIFF/WAVE PCM 24-bit 48 kHz 2ch, 2304000 frames = 48.000 s; 99.98% non-zero, peak 0.297; sha256 37c56490… equals round 389 (1440 and 1280) `out/det-1440-0.wav, out/export-det-*.json` |
| R340-WAVEFORM | PASS | wd 0 diffs vs round 341 (both vp); video-wave 0 diffs; trim-end only clip-id differences `out/wd-*.json, out/video-*.json, out/trimend-*.json` |
| R340-SHOWN-READERS | PASS | shown-probe 0 diffs vs 341, both vp `out/shown-*.json` |
| R340-PROJECT-END | PASS | end-bound-probe 0 diffs vs 341 `out/end-bound.json` |
| R340-OVERVIEW-METER | PASS | overview markup keys equal; only live meter dB drift ≤0.7 dB (real-time meters). Void sub-check not run (D-29z1068) `out/ovr-*.json` |
| R340-FADE-STATUS/DRAG-A (rows.mjs head) | PASS | normalised diff vs 341: only loop position samples jitter and tmp path; WAV sha 453d1a04…c567 equal at both vp `rows/rows-head390.json` |
| R340-CROSS-LANE | PASS | stopped + while playing (Space, data-playing true before and after), both vp: behaviour fields equal c-round-338 oracle; ghosts on stems lane, Undo 'Move to track — Stems', track music→stems→(undo)music, pageErrors [] `out/cross-playing-*.json, out/cross-stopped-*.json` |
| R340-GROUP-MOVE | PASS | both vp: behaviour fields equal b-round-338 oracle after dropping counts; Undo 'Move (2)'; pageErrors [] `out/group-*.json` |
| R340-DETAIL-TEXT | PASS | detail-n.json 0 diffs vs 341 `out/b3/detail-n.json` |
| R340-SELECTION | PASS | c324 rows-n/group-n 0 diffs vs 341 (both vp) `out/b2/rows-n.json, out/b2/group-n.json` |
| R340-RANGE | PASS | c320 rows at 1440, 1280, 1280-reload: only playhead 1 px / 0.01% translate jitter; wave-n 0 diffs; R-EXPORT at 1440 covered by rows-head sha equality `out/b2/` |
| R340-FADE-STATUS / DRAG-A / c325 / c328 | PASS | r325/r328 rows-n only position jitter (≤0.012 s) vs 341; WAV sha equal `out/b4/r325, out/b4/r328` |
| R340-PEAKS | PASS | pk-load, pk-video-sound (held decoding level 0, released 0.50), cold-start equal to 341 within timing; waveforms after Demo collection ready `out/b3/pkload-*.json, pkvid-*.json, out/b4/cold-1440.json` |
| R340-PERF3D | PASS | scroll-after-crossing (same shape: 29 rewrites, maxStepRewrites 1, loafMax 0, msMax 33.8 vs 33.3), visible-d 0 diffs both vp `out/b3/scroll-*.json, visd-*.json` |
| R340-RESCHEDULE (CONT-1, CONT-30, ENDED, NO-CHANGE) | PASS | CONT-1/CONT-30 both vp 3 runs: starts unchanged (1 / 30), valid, ratioToBaseMax 0.056-0.061, zeroRun 0, errors 0; ENDED (onended-probe) identical to 341; NO-CHANGE = posctl record (see R390-POSCTL) `out/b3/cont-*.json, onended.log` |
| R340-WORKER-R2 | PASS | local worker proxy r2-proxy.js: proxy-throw and head-control 0 diffs vs c-round-311; proxy-short equal except the final step's JSON capture (log flush race; server log line present, 304 h0g2c2 identical) `wk/*.json, wk/*-server.log` |
| R340-FONTS | PASS | FONT-NET 0 Google requests, FONT-PRELOAD 2 CORS preloads (dev and scratch prod build on :5192, woff2 under /assets/); font-bytes equal baseline; FONT-PIXEL retired. Known Low C-R341-02 (preload warning after client nav) reproduces unchanged `out/fonts/` |
| R340-NAME | PASS | main.cjs equal to 341 (home 'CZABA Studio', nav 'Studio', narrow title); budget/budget2 equal `out/b3/name.log` |
| R340-HINT | PASS | hint-main: only the status sequence differs (hint+tempo posted in one update, final string exact); once per page load, video-first no hint on video add, undo/second add no hint `tools/hint/main.json` |
| R340-JOURNEY | PASS | product → 'Try it in the Studio' (/studio-lab?preview=middle-east, title 'CZABA Studio — Demo collection') → Enter adds 1 clip → Space plays (clock 1.56-1.57 s) → Stop → Export WAV in same page: dialog 00:00.000—01:41.352, file 4864896 frames = 101.352 s, 24-bit/48k/2ch, non-silent 99.77 %, 0 NaN, sha 5fadd97a… (equal both vp) → View in store new tab opener null; errors []; screenshots per step `out/journey-full.json, shots/journey-*.png, out/b3/journey301.json` |
| R390-POSCTL | RECORDED | 3 runs per vp, valid=false in all (no splice in capture, starts=1, playing false) = oracle c-round-342 valid=false `out/b3/posctl.json` |
| R390-ESC-DRAG | RECORDED | Esc during a clip drag does not cancel: drag continues and release commits (start 0.000→5.000, Undo 'Move clip'), both vp. Same as round 389; signal ESCAPE-CANCEL-GESTURE, not a finding `out/escdrag-*.json` |
| R390-RP-BUILT | RECORDED | RP-C301-01 and RP-C331-01 equal to c-round-342; RP-FOLD-SELECTION ids only; RP-STATUS-RACE timestamps only `out/rp-*.json` |
| R390-RP301 | RECORDED | rp301 equal to c-round-342 (0 diffs) `out/rp301.json` |
| RR-OSS single file | RECORDED | single file third-party-licenses.test.ts 70/70 recorded only; the full licence suite is a gate row (not claimed) `out/b4/oss.log` |
| SA-19 | CARRIED | awaiting_user `—` |
| SOURCE-SCOPE-end | PASS | HEAD 11ca746, status empty (0 lines), K3 11 OK, K4 0 failures/1284; git status clean after smoke too `out/claims-end.txt` |
| R301-MASTER | PASS | c262 layout + audio-keys: layout-n 0 diffs; audio-keys booleans equal, dB within meter jitter (≤0.4 dB) `t301/r262/` |
| R301-CONTRACTS | PASS | cc.mjs log 0 diffs vs 341 (both vp, Control/Meta) `t301/r264/cc.log` |
| R301-BG-RANGE | PASS | rounds 265/266/270 probes replayed (t301x): 0 significant diffs vs c-round-301 after normalising the one-time name-bar hint and ids; split-selection 0 diffs `t301x/r265,r266,r270` |
| R301-HIDDEN-GRID-BG | PASS | hgbg + hgbg-music logs 0 diffs vs 341, flags true `t301/hgbg/` |
| R301-ALTGR | PASS | c268 log 0 diffs vs 341 `t301/r268/br.log` |
| R301-TAPER | PASS | 1440 exports: -15.003 / -29.999 / -44.999 dB at 25/50/75 % (±0.5), analysis JSON 0 diffs vs 341; UI drag (ui.log) 0 diffs both vp `t301/r269/exp/analysis-1440x900.json` |
| R301-REL-SNAP | PASS | c271-ui equal to 341 (timing/hints only) `t301/r271/` |
| R301-STATUS-LIFETIME | PASS | c274 equal to 341; rounds 272/273 probes replayed: 0 significant diffs vs c-round-301 `t301/r274, t301x/r272, r273` |
| R301-DISABLED | PASS | c276 0 'pass=false'; c278 all rows pass=true except 'perf' (an old/new predicate A-B probe) pass=false at both vp, identical to 341 — recorded, not an acceptance of the disabled-control behaviour `t301/r276, r278` |
| R301-WORKER | PASS | library-probe 0 diffs; worker runs in Worker; Pulse export sha256 1fea093b…3f94 (4 608 044 B) and all-7 export equal to round 282/341, both vp `t301/r282, r283` |
| R301-PERF3 | PASS | ruler in/out + flip + flip120 probes: step arrays/flip counts identical to 341 (only event-timing ms vary, 16 vs 24 ms); run with nothing else running `t301/perf3/out/` |
| R301-NAMES | PASS | r289 and r291 probes: English names, group headings; r289 probe 0 diffs, r291 differs from the c301 oracle by the CZABA Studio name/hint only `t301/r289, t301x/r291` |
| R301-NARROW | PASS | c293 log equal to 341 (B-NARROW-*, B-BOUNDARY 899/900; B-DESK-SAME reference image stale per round 341 lookup) `t301/r293/` |
| R301-LOAF | PASS (provoked) | natural idle LoAF entries after ready = 0 (c295: entries 0-2, withScripts 0); a provoked 140 ms rAF busy loop in real Chromium produced a LoAF entry with a non-empty scripts[] (FrameRequestCallback, 139 ms) at both vp, so the observer path is live. Harness-validity only; no natural long frame to attribute `out/loaf.json, t301/r295/` |
| R301-LINK | PASS | c296 + c297/298/299 replayed: 0 significant diffs vs c-round-301 except blob ids/timing; mock API `t301/r296, t301x/r297,r298,r299` |
| R301-MENU | PASS | r300 rows/audio equal to 341 `t301/r300/` |
| R301-JOURNEY | COVERED | covered by R340-JOURNEY (not run twice)  |
| R301-PRICE | PASS | mock-c288 replay: probe n2 equals accepted c-round-288 a.json (base URL only); product-probe known 0 diffs vs c301; priceless 'Price unavailable', free-pack $0; standard mock restarted, health 200. Mock = client path only `t301x/r288/probe/n2.json, out/price/` |
| RG-01..24, RG-T1..T4B (both vp, RG-03 1440) | PASS (with adaptations) | 64 result files: all checks true except 3 known adaptations — RG-03 video follow → RG-03-mute variant all true; RG-04 resume → rg04-258 variant equals 341; RG-06 plain-drag marquee false because since SABA-B-11c a plain background drag is a time selection: Ctrl+drag marquee variant true both vp (as round 301). RG-18 needs STEM=demo-stem-pad (default now pulse → rising false for rhythmic source = env-invalid): pad rerun all true, export sha equal 341. RG-22 narrow equal c342 `t258/out/, t258/logs/` |
| R390-RS / §4 / §4.S (RV, RR, RS, t203/204/205, s186-s195) | PASS | rows compared with 341 (0 diff vs c301 in 341): RV-STATIC/RV-M/RV-FADER/marker/env/focus/chrome equal modulo clip ids and timing; RV-M-1440 attempt 1 env-invalid (hydration 'Invalid hook call' on /studio/middle-east, not reproducible in 4 loads), attempt 2 0 diffs; s186 1440 attempt 1 crash (clip-empty screenshot, known env), attempt 2 ok, 1280 guarded run ok; rs2a rerun after guest195, 0 diffs; s187/s188/s190 timing only; t203/t204/t205 equal `t258/` |
| §4b rows (items 200–257: c241-c257, r246, r247, homedrag, grid258, mp3, facade, legacy) | PASS | all equal modulo timing; r250 splitPlaying single-instant rms probe flake (series max 0.148, sound continues) and c218 mp3 Add-wait adaptation (4 055 208 B mp3, no page errors) — see invalidRuns `t258/logs/, out/mp3/, t258/r250series/` |
| RR-PERF | CARRIED | round 389, same HEAD 11ca746 (c-round-389/perf-results, 4 files; drag-lane-live and drag-group-live present)  |
| PERF-LIB | CARRIED | round 389, same HEAD 11ca746 (3 files / 54 tests)  |
| NO-SHIFT-203 | CARRIED | no reference server started (needs a second server / reference build; single-dev-server rule D-29z1057)  |
| RG-SMOKE | PASS | npm run test:e2e:smoke alone: 2 passed (4.5 s), rc 0; git status stays clean `out/smoke.log` |
| G390-AUTH | PASS | both vp: /studio-lab anonymous → workspace + demo badge, auth_user null; /studio/middle-east → 'Sign in required', audio[src]=0; /api/studio-token no header 401, bare 400, fake Bearer 403 (mock); no token in any body. SRW-21 stays deferred_user `out/g390-auth.json` |
| RR-OSS full licence suite | GATE | not claimed by C (single file third-party-licenses.test.ts 70/70 only) `out/b4/oss.log` |
| Gate rows | GATE | full vitest, typecheck, build, Biome, npm run verify: gate rows, not claimed (gates/gate-round-390.json)  |

## Bugs
none

## Observations
- INFO-C390-ESC-DRAG (signal, not a finding): Esc during a clip drag does not cancel; the drag continues and the release commits (start 0.000 → 5.000, Undo 'Move clip'), both viewports. Same as round 389. Waits for a Live source and Saba (ESCAPE-CANCEL-GESTURE / C-R85-L1).
- INFO-C390-C341-02 (known Low C-R341-02, unchanged): 'preloaded but not used' warnings for instrument-sans / ibm-plex-mono after client-side navigation product page → Studio, on dev and on a scratch production build.
- INFO-C390-RV-M-HYDRATION-GLITCH: one run of rvm.cjs (RV-M-1440 attempt 1, during the long chain) saw 'Invalid hook call … Cannot read properties of null (reading useState)' + a hydration error on /studio/middle-east and an empty body. Not reproduced in 4 fresh loads (mepage.cjs) nor in attempt 2 (0 diffs). Most likely a Vite dev dependency re-optimisation reload while other probes ran; kept as an unreproduced signal, no Medium evidence.
- INFO-C390-HARNESS-DRIFT (for B, harness not app): four older probes no longer match the current UI/content and were adapted as lookups — (1) rows1.cjs RG-06 plain-drag marquee (a plain background drag is a time selection since SABA-B-11c; Ctrl+drag variant passes, as round 301 did); (2) rows5.cjs RG-18 default stem is now demo-stem-pulse (rhythmic) so the 'strictly rising RMS' check fails; STEM=demo-stem-pad restores the 341 sha; (3) c250-s9.cjs splitPlaying samples one instant of a pulsing source (pass flips with ±20 ms phase; the 24-sample series max is 0.148 at both vp); (4) c218-mp3.cjs waits for a non-disabled Add, which is soft-disabled (aria-disabled) until 'Demo collection ready' — it timed out at the Add→clip wait in two runs. B should fold these four into the permanent probes.
- INFO-C390-VIDEO-SNAP: R390-VIDEO-SOUND dragged the video clip by 120 px and it landed at 3.000 s (grid-snapped), not the 2.25 s of round 389; the expectation (silence before the new start, ≥ 20 dB above floor inside, original start after Undo) was checked against the real landing position.
- INFO-C390-LOAF: natural LoAF entries on an idle Studio are 0; the observer yields a non-empty scripts[] only when a long frame is provoked (done with a 140 ms rAF busy loop).
- Mock data proves the client path only; the standard mock was started by C (PID 3773), stopped for the PRICE swap, and restarted (PID 54264) and stopped at the end. The scratch production build (/tmp/r390-build, port 5192) was removed after the font and preload rows.
- No file in store/ was touched; no commit; ENV: single dev server on :5173.
