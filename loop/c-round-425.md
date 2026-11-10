# C round 425 — REGRESSION-2026-11-10 part 2 (HEAD f6c76f4, A changed nothing)

REGRESSION part 2 on HEAD f6c76f4 (A changed nothing, store clean at start and end). All rows of task sections 3-7 ran in real Chromium (Playwright) at 1440x900 and 1280x720 against the dev server :5173 (+ scratch production build :5189 for HEAP, export-trunc, fonts-prod and RVM-prod) with the standard mock API on :5199. No Critical/High/Medium finding. One Low finding (C-R425-01, dev-server cold-load glitch, production clean) and several lookups for B. RR-PERF carried (not run, per task). Gate rows (full vitest, typecheck, build, Biome, verify, RR-OSS) are not claimed. Premium auth is not bypassed (anonymous /studio-lab opens only the demo workspace; the purchased route stays behind Sign in required; the token API returns 401/400/403).


| Row | Result | Evidence |
|---|---|---|
| G425-SCOPE start/end | PASS | claims-start.txt, claims-end.txt (only allowed K12 archive move and K18 mock port differ); store clean (0 lines), HEAD f6c76f4, protected 11/11, tree K3 equal |
| PERF-LIB | PASS 3 files / 54 tests | perf-lib.log |
| R425-LANE-REBASE | PASS: 0 gap frames (461 / 464), held clip stays mounted, pin-blur A/B equal r423 (ids only), peaks real/404/p410 equal r423 (timestamps; 1440 real beginsWhileHeld 7 vs 2 = timing snapshot, total 7 both) | scale/, peaks/ |
| R425-VIDEO-SOUND | PASS both vp (beeps substitute, then real tone fixture): silent before the moved start 3.000, onset 3.09 s, Undo returns to original onset | out/vsound-*.json, out/vsound-tone-*.json, out/b3/pkvid-*.json |
| R425-WAV-3CLIP-LEN | PASS both vp: RIFF/WAVE PCM 24-bit 48 kHz stereo, 2,304,000 frames = 48.000 s = dialog end, 99.98 % non-zero, peak 0.297, 0 NaN, sha256 37c56490... equal to r389/r390 | out/exportlen-*.log, out/det-*.wav |
| R425-RVM-FRESH | FINDING C-R425-01 (Low): 1 empty body in 12 dev loads, 0 in 8 production loads | out/rvm-*.json |
| R425-NOSHIFT-BOXES | RECORDED (no pass/fail): product, store, AuthModal before/after empty submit boxes + screenshots | noshift/ |
| R389-SCHED-FAIL / RESYNC-METER / EDIT-THROW | PASS: meters -inf after throw, clock frozen, normal Stop floors meters, edit kept, next Play plays; 0 page errors (clock/meter jitter only) | t389/out/meter-*, mc-*, resync-*, m1-*, m1b-*, m2-1440.json |
| R389-DECODE-CACHE | PASS under D-29z1486: refusal text 'Loading' then second Space plays; preview audible, one play(), stops on Play; b7-replay2 0 diffs; HEAP prod [2,5,16,16,16,16,16]; EVICT stop-count pin recorded | t389/out/playrefuse.json, pwp-*, evict-b2-count.json, heap-1440.json, prev-*.json, r392/b7-replay2.json |
| R389-WAV-STREAM | PASS: 32 s, 24-bit 48 kHz stereo, peak 0.297, 0 NaN, 99.98 % non-zero, sha equal; dialog closes on Esc | t389/logs/export-wav.log, export-det.json |
| R389-LEAVES / STATUS / LAZY | PASS: leaves, brace, misc 0 diffs apart from clock jitter; Esc-drag does not cancel (signal); 0 signalr requests, no route fade on /studio-lab | t389/out/leaves.json, brace.json, misc.json, browser.json |
| R389-STEM-CACHE | PASS: cold/warm 304 conditional/blocked reopen ready/clear refetch at both vp; export-trunc prod equal r389 (playback peaks jitter) | t389/out/cache-*.json, export-trunc.json |
| R389-RANGE-BG / SELECT-TRANSPORT / PLAY-STORE | PASS: bg, playstop 0 diffs; follow scroll constant 2-5 px offset (lookup); narrow, settings 0 diffs | t389/out/bg-*, playstop-*, follow-*, narrow.json, settings-probe.json |
| R389-VIDEO-DRAG / FADERS-ICONS / GROUP-MOVE | PASS: move 0 -> 2.25 + Undo, video350 equal modulo blob ids; faders 0 diffs, icons 0 diffs; Move (2) via data-clip-count probe | t389/out/flow-*, video350.json, faders.json, vis/, c-round-425/out/group2-*.json |
| R340-WAVEFORM ... R340-NAME (b1-b4 batches) | PASS: values equal oracle except the attributed third-decimal waveform diff (0 diffs with peaks 404); timing/meter jitter only | out/b2, b3, b4, out/_cmp-main.json |
| R340-WORKER-R2 | PASS: proxy-throw 0 diffs, headctl-throw 0 diffs, proxy-short equal (one extra log line) | wk/ |
| R340-FONTS | PASS: dev and prod 0 third-party / 0 render-blocking, font bytes sha equal to r390 prod, 2 CORS preloads; known Low C-R341-02 unchanged | out/fonts/, out/preload-warn.json |
| R340-HINT / JOURNEY | PASS: hint once per load; journey product -> Try it -> Enter -> Space -> Stop -> Export 101.352 s sha 5fadd97a... equal, new tab opener null | tools/hint/main.json, out/journey-full.json |
| R301 rows (t301 b5-b7, t301x replays, taper, price) | PASS: 0 behavioural diffs; TAPER exports -15.003 / -29.999 / -44.999 dB (+-0.5), silence section exact; r288 + known price probes 0 diffs on the c288 mock; standard mock restarted, health 200 | t301/, t301x/, out/price/ |
| RG-01..24, RG-T1..T4B, §4/§4.S, §4b (run-s3, run-s4, run-4b) | PASS with the harness adaptations in lookups; 280 logs, 222 byte-equal after normalisation, the rest examined (timing, ids, stale predicates) | t258/logs, t258/*/logs |
| R425-POSCTL / ESC-DRAG / RP301 / RP-BUILT | RECORDED, equal to oracles | out/b3/posctl.json, out/escdrag-*.json, out/rp-*.json |
| RG-SMOKE | PASS 2 passed (8.7 s) | out/smoke.log |
| G425-AUTH | PASS (see passed list); fake Bearer 403 via mock only | out/g390-auth.json |

## Bugs
- **C-R425-01** (low): Load 0 only: empty body, console 'Invalid hook call' + 'Cannot read properties of null (reading useState)' + hydration error. 11 other dev loads (3 later loads, 4 at 1280, 4 in a repeat run) and 8/8 loads on the scratch production build were clean. Same signature was seen once in round 390 (INFO-C390-RV-M-HYDRATION-GLITCH).

## Observations
- INFO-C425-ESC-DRAG: signal only (see carried).
- INFO-C425-LOAF-ATTR: the c295 harness reported natural LoAF entries 5 / 3 with scripts of 56-60 ms at 1440 (oracle 0 / 0); tools/loaf-attr.cjs (observer from document start, 8 s idle after 'Demo collection ready', 3 runs per viewport) shows 0 LoAF entries after ready in 6/6 runs and 2-3 entries before ready (during load). So no idle jank after ready; load-time scripts are somewhat longer than in round 390 (dev server, cloud CPU about 15-25 % slower on every ms field). Evidence out/loaf-attr-*.json. For B to watch, not a finding.
- INFO-C425-DEV-REOPT: the Vite dev server re-optimises deps on first use of a late dependency (mp3 encoder) and reloads the page; probes that hit that moment fail (RG-20-1440 attempt 1). The oracle dev server had the dep cached. Production is unaffected. Suggest the next regression starts with one warm-up MP3 export on the dev server (or root pre-warms deps).
- INFO-C425-VIDEO-FIXTURE: media/c315-tone-440.webm no longer existed; vsound-beeps.cjs used media/beeps-6s-vp9-opus.webm first (beeps at source 0.05+n s: moved clip 3.000 s, first beep at 3.12, silent before, Undo returns to the original), then pk-video-sound.cjs regenerated the vp8 tone and the real vsound.cjs ran with it: before-start level 0 at both vp; from start+0.3 s level 0.500-0.503; onset 3.09 s after move to 3.000, 0.307 s after Undo (= initial 0.31 s). tone fixture is under c-round-425/tools/media/ for the next regression. A MediaRecorder file made with vp9+timeslice cannot be opened by the app ('browser could not open this video'): fixture note only.
- INFO-C425-BASELINE-PINS: HEAP-RETAINERS-PROD live counts [2,5,16,16,16,16,16] equal the pre-391 pin; EVICT 'one stop() on the evicted preview' now sees 0 stops (preview streams through a media element, round 393): recorded for B to re-pin, the asserted part (Add plays live, Undo removes it, live counts) is equal.
- INFO-C425-STREAMING-PREVIEW (D-29z1486 ruling): library preview sounds before the decode ends. With the stream free: one play() call, audio element advances (currentTime 0.67 -> 3.51 in 2.8 s, readyState 4, volume 1, not muted), button reads Stop; Play stops it (paused, one play() only); b7-replay2 (c-round-423) 0 diffs. With the mp3 request held 4 s: no sound while the network holds it (readyState 0), as expected. The old pwp 'decode failure injected -> failed to load text' oracle no longer applies because preview does not decode.
- INFO-C425-PRICE-AUTH-MOCK: mock data proves the client path only.

## Lookups
- HARNESS: DOM clip counts are virtualised (rounds 408-424): group-probe clipCount 1 vs 2, cont-30 'clips 3 vs starts 30' (valid:false by harness predicate), release/scroll probes 'clips 1 vs 30'. Behaviour re-checked with a data-clip-count based probe (tools/group2.cjs): 'Move (2): 2 clips moved 00:03.000 to the right', Undo 'Move (2)', restores 0.000, both vp. cont-30 starts stay 30 (unchanged), valid-by-starts, ratioToBaseMax 0.048-0.056 (oracle 0.056-0.061), errors [].
- WAVEFORM path data differs in the third decimal and clipWave hashes differ vs round 390 (wd/trimend/ovr/visd/rows-n wave rows). Attribution: precomputed demo peaks (peaksUrl, PERF-15, rounds ~409-413). Proof: wd-nopeaks (tools/wd-nopeaks.mjs, /peaks/*.json answered 404) gives 0 diffs vs c-round-390 wd-1440.
- Refusal copy: 'has not loaded yet' became 'Loading ...' in rounds 391/392 (C-R391-01 fix); the second Space still starts audio (startsAfterSecondSpace [150.37]).
- R340-CROSS-LANE: dev-fiber 'rendered' counts per commit are 44 vs 40 (cross-enter) and 67 vs 63 (release) vs the round-390 oracle, both vp, all behaviour fields equal. Attributed to round 424 (lane subscribes to the drag stores); B should confirm +4 is intended since 424 aimed to reduce commits.
- R389-PLAY-STORE follow probe: scrollLeft after Follow is 5 px (1280) / 2 px (1440) larger than the round-389 oracle, constant per viewport on both samples (layout, not jitter). Not attributed to a named round; B to rule.
- RG-20-1440 attempt 1 failed with 'Execution context was destroyed' at the MP3 step (dev dep re-optimisation, see INFO-C425-DEV-REOPT); replacement attempt 1 PASS true.
- c320-1440 R-EXPORT step rc=1 (export dialog overlay intercepts the click) exactly as in round 390; covered by rows-head WAV sha equality and R425-WAV-3CLIP-LEN (sha 37c56490... equal to r389/r390 at both vp).
- HARNESS-DRIFT (D-29z1485): RG-06 plain-drag marquee false (Ctrl+drag variant true), RG-18 STEM=demo-stem-pad, c250-s9 splitPlaying (series, filter '^splitPlaying': pass true both vp, rmsSeries max 0.127 / 0.112 vs oracle 0.148 / 0.155), c218-mp3 add waits for ready (tools/c218-mp3-ready.cjs, MP3 created 01:41.352 48 kHz stereo 4,055,208 B, equal to round 390 except exportMs 4142 vs 2507). An unfiltered c250-series run (my misuse) reports stale-predicate rows false (budget, splitRefusal, titles, nRangeSplit): not the sanctioned run, whose r250.log has 0 false.
- s186 gift card / s195 rs2a needed their own prerequisites (mock products present; guest195 json before rs2a); reruns equal the round-390 results (rs2a 0 diffs).
- R301-LOAF / c295 and r282 worker-n show higher loaf/ready numbers than 390 (cloud CPU); see INFO-C425-LOAF-ATTR.
- r300 audio 'starts' arrays are empty after Preview/Esc/Right because previews no longer use AudioBufferSource (streaming media element, round 393); the asserted booleans are equal.
- R301-NAMES / pxdiff B-DESK-SAME diff 716 -> 1068 px: reference image stale per round 341 lookup (unchanged class).

## Invalid runs
- frames200 1440 attempt 1: cold-start 'Demo collection ready' wait timed out at 120 s (log c-round-425/scale/frames-1440x900.attempt1-coldstart.log); replacement attempt PASS.
- cache.mjs x2 (batch2): started with the site root instead of /studio-lab, context closed at the 400 s timeout; reran with the oracle's base: PASS.
- RG-20-1440 attempt 1 (dev dep re-optimisation) -> PASS on rerun.
- c207 x2, rs2a x2, dur-1440 attempt 1: output directories missing in my copied tree; fixed (mkdir) and rerun: PASS / 0 diffs.
- pk-video-sound/vsound with the original fixture: file missing; regenerated (see INFO-C425-VIDEO-FIXTURE).
- wk proxy rows attempt 1: ran without R2_STRICT=1 R2_SWAP=1; rerun with them: proxy-throw 0 diffs, headctl 0 diffs, proxy-short one extra server log entry vs oracle (the known log-flush race, now captured).
- c250-series unfiltered run: wrong scope, rerun with the splitPlaying filter.

## Not run

## Blocked
- fake Bearer on /api/studio-token with a real backend: backend unavailable in cloud (the mock answers 403, so the client path passes; this does not make browserVerified false)

## Carried
- RR-PERF: C round 424, code equal to f6c76f4 (b-round-424/rrperf-carry-proof.txt); npm run test:perf not run
- NO-SHIFT-203: retired D-29z1485 (R425-NOSHIFT-BOXES recorded instead, noshift/boxes-*.json)
- SA-19: awaiting_user, not run
- R425-POSCTL: recorded, valid=false in all 6 runs (= c-round-342 oracle valid=false)
- R425-ESC-DRAG: signal only, Esc does not cancel a clip drag (start 0 -> 3.75 mid, 5.000 after release, Undo 'Move clip'), both vp, same as rounds 389/390
- R425-RP301 / R425-RP-BUILT: recorded, 0 diffs vs c-round-342 oracles (ids only)

## Gate rows (not claimed)
- full vitest
- typecheck
- build
- Biome
- npm run verify
- RR-OSS full licence suite

## Next steps for B
- Outcome table row 1 applies: no Medium+ finding. regression-last.json = {date: 2026-11-10, round: 425}; round 426 = STEM-LANES if Saba answered AGREE-STEM-LANES.md, otherwise SYS-2 stage 2a.
- Rule on C-R425-01 (Low; dev-server cold load, prod clean) and put it in deferred_low_polish unless you rate a cold-dev empty auth-guard page Medium.
- Re-pin the EVICT stop-count (0 stops now) and keep HEAP pin [2,5,16,16,16,16,16] as verified on f6c76f4.
- Rule on the +4 dev-fiber render count in cross-lane enter/release (round 424) and the 2-5 px Follow scrollLeft offset.
- Next regression: start with a dev warm-up MP3 export, use tools/media fixtures and the corrected copies in c-round-425/{tools,t258,t301,t301x,wk,t389} (some result JSONs copied from round 390 are stale files there: delete result files before running, or compare mtime).
