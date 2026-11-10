# C round 423 — REGRESSION part 1 (rounds 391–422). Result: FAIL (1 Medium finding)

HEAD `875ff37`, tree clean at start and end (claims-start/end equal to the planning output). A changed nothing. `browserVerified` true. Gate rows (full vitest, typecheck, build, Biome, verify) are not claimed. Ableton conformance: does not apply (regression round).

| Row | Result | Evidence (under `c-round-423/`) |
|---|---|---|
| G423-SCOPE start/end | PASS: claims equal, K1 875ff37, K2 0, K3 1321 rc 0, K4 rc 0 | claims-start.txt, claims-end.txt |
| RR-PERF (`npm run test:perf`, alone) | **FAIL**: rc 1, 4/5 specs pass; interactions spec: 17 move-components asserts exceed budget (fade, trim, video, video-trim, video-fade drags), identical in 3 reps, round 389 was at the budget edge. See bug C-R423-01 | perf-run.log, perf-results/ |
| PERF-LIB | PASS 3 files / 54 tests | (command in task) |
| R423-HELD-ENTER | PASS: ALL OK 12 cells (FOLLOW 1440 re-run once after a cold-start timeout); smoke: Space plays +1.50 s per 1.506 s, stop frozen, Follow flips once, Loop pressed, 0 errors | probe/, smoke/ |
| R423-MARKER-SEEK | PASS both vp: flag 00:09.000, second click 00:03.000, Home 00:00.000, Next 00:09.000; control Next 00:16.000; 0 errors | marker/ |
| R423-PREVIEW-LIFECYCLE | PASS: r421 16 cells and r418 14 cells all EQUAL | probe-421/, probe-418/ |
| R423-STEM-CACHE | PASS: 8 cells ALL EQUAL (production scratch build, own port) | probe-419/out |
| R423-PEAKS | PASS: real, 404 and p410 equal to rounds 412/413 (only timestamps differ) | peaks/ |
| R423-STEM-WORKER | PASS: 2 workers x throw/short equal to round 414 (audioSeek 2–3 range requests varies, as noted in 414) | worker/ |
| R423-METER | PASS: master level varies -6.8..-12.6, hold -6.4; after Stop level, hold and all track meters -inf in 6–7 ms | meter/ |
| R423-LANE | PASS: leaf probe equals r409 except known ±1 jitter on LibraryPreviewViewInner; lane actions ok true (mute, solo, volume, pan, undo, active lane) | lane/ |
| R423-VIDEO-DOCK | PASS: play drift ≤ 0.013 s, swaps/fallbacks 0, caption "1.mp4", extra equals r407. Stopped seek (own probe): ruler click at 2/5/1 s → video currentTime 2/5/1, paused, drift 0, both vp | video/stopped-seek.json |
| R423-LEAF-ACTIONS | PASS: every step state equals r404; only audio-context time and pos jitter ≤ 40 ms differ | out/leaf.json |
| R423-PEAKS-FALLBACK | PASS: failing/none/normal equal r403 (readyMs only); min-zoom probe: 200 clips, no page error | scale/ |
| R423-SCALE | PASS: 0 gap frames of 453, held clip stays mounted, pin-blur A/B as r402 | scale/ |
| R423-SCALE-EXPORT | PASS: WAV 24-bit/48 kHz/stereo, 202.704 s (2×101.352), both halves RMS 0.172, no NaN (both vp). Peak is exactly 1.0 (info) | export/scale-export.json |
| R423-SYNTH | PASS: 5 synth builds, same array, 9 sources ready, play ok | r397/ |
| R423-PREVIEW-STREAM | PASS: r393 16 cells (timing-only diffs), r395 16 cells equal, r396 18 cells equal | r393/, r395/, r396/ |
| R423-DECODE-STATUS | PASS with oracle drift: B1/B7/B8/B9/nb use decode-delay hooks that no longer apply since preview streams (S7: Preview stops transport). B2, B3 equal. Own replay: preview stream → select Full mix auto-switches; exactly one source sounding, no overlap, Stop silences all. Collection-load failure (mp3 aborted) reports honestly, nothing added. Round-392 B1/B7/B8/B9/nb rows are superseded by 393/395 (B-spec drift) | r392/b7-replay2.json, fail-preview.json |
| R423-JOURNEY (mock API :5199, stopped) | PASS both vp: product → "Try it in the Studio" → title "CZABA Studio" → Enter adds → Space 1.27 s → Stop → WAV 24-bit non-silent → "View in store" new tab, opener null | journey.json, shots/ |
| RG-SMOKE | PASS 2 passed | smoke-e2e.log |
| G423-AUTH | PASS both vp: anonymous lab opens (auth_user null); `/studio/middle-east` "Sign in required", 0 audio[src], no timeline, also with a forged localStorage auth_user; token API without header 401. Fake Bearer → 500, BLOCKED (backend unavailable) | auth/ |

## Finding for B
**C-R423-01 (Medium, regression since round 389; cause not bisected).** Committed components per drag move exceed the budgets for five drags, stopped and playing. Fade 5.9/6 (budget 4), trim 16.7/17 (15), video 11.85/15 (10/13), video-trim 14.8/17 (13/15), video-fade 4.9/5 (3). The p95 latency, graph-restart and other perf specs pass; the browser rows show the drags work. The last green perf run is round 404 (`c-round-404/perf/interactions.log`: fade 3.933, trim 14.75); no perf run exists for rounds 405–422. Files changed since then: `ArrangementVideoDock` (+591), `ArrangementContext` (+184), `ArrangementLane` (+180). Extra wrapper components from the leaf/actions split are the likely cause (hypothesis, not bisected). Perf is outside the gate. No backlog id exists for it. Suggested bounded fix-up: bisect with the interactions spec, then restore the budgets or justify raising them. Ids: see `c-round-423.json`.

## Not done / limits
- Part 2 (round 424) per task §7 is not affected; with a Medium finding the task table sends round 424 to the fix-up first.
- Min-zoom probe has no round-403 oracle; recorded only. SCALE-EXPORT second clip via Ctrl+D. The 2026-10-07 `root-pre-push-review.md` / `publication-checkpoint.json` are stale (round 3).
