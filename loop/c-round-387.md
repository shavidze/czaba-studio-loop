# C round 387 — verdict FAIL (1 Medium bug, unruled by B)

Real Chromium (Playwright), http://127.0.0.1:5173/studio-lab, 1440x900 and 1280x720. Evidence: `c-round-387/`.

| Row | Result |
|---|---|
| SOURCE-SCOPE | PASS: 5 status lines exactly (2 patched, 2 new tests, doc 250); frozen and protected manifests rc 0 (`source-scope.txt`) |
| PATCH-EQUAL | PASS: 4 files identical to `b-round-386/sketch-files` |
| CLAIMS | PASS: diff vs sketch output only K10 (doc 250 now exists), K15, K16 (allowed) |
| BROWSER-M2-FLOW both | PASS: errors [], play1 thrown 1 leaked 0 scheduleFailed clock frozen; play2 thrown 2 leaked 0; play3 playingFrom, clock advancing, leaked 2; commit thrown 3 clips 3 scheduleFailed frozen; afterStop leaked 0 (`flow-*.json`). First run at 1440 hit a cold-start timeout (listbox option); rerun clean |
| BROWSER-M1-NEIGHBOUR both | PASS: thrown 1, errors [], clock frozen, statusHasScheduleFailed, replayStatusPlayingFrom true, StillFailed false (`m1-*.json`) |
| EXPORT-EQUAL | PASS: sha256 `06aeb3de…e9fd` equals HEAD/sketch; WAV 24-bit stereo 48 kHz, 32.0 s (`export-c387.wav`) |
| G387-AUTH both | PASS: auth_user null; /studio/middle-east "Sign in required", 0 audio[src]; token API 401 without token. Fake bearer: blocked (backend unavailable in cloud) |
| STUDIO-SMOKE both | PASS: Enter adds clip, Play advances, Stop freezes clock, Export dialog opens, Esc closes, 0 page errors |
| UNIT | partial: the 2 new files 15/15 pass; 65-file set not rerun by C |
| MUTANTS | NOT RUN by C; A reports 15/15 |
| DOCS | Partial: l.4 exact, no "pending" hits, headings present; l.4 claims PASS though the round is FAIL |

## Bug C-R387-01 (Medium, = A-R387-REVIEW-M1) — reproduced in the browser
Loop-pump failure (injected `start()` throw) stops playback and shows the failure status, but the meters stay frozen at -19.8 dB (still after 1.5 s). A normal Stop gives -inf. Both viewports; no page errors, no sound, clock correct. Cause per A's reviewer: `tick` samples meters and re-queues a frame after the pump stopped playback. Scripts: `meter-freeze.mjs`, `meter-control.mjs`. B can downgrade to Low (failure-only cosmetic) if it rules so; a one-line guard plus a meter-floor row would fix it.

## Notes
- Side effect: running `c-round-386/auth-smoke.mjs` in place (it hardcodes its output dir) overwrote `c-round-386/auth-smoke.json` and its screens with equivalent round-387 data. I then used a copy writing to `c-round-387/`. Do not treat 386's file as original.
- A's lower findings L-a…L-f are for B; not verified by C.
- Gate rows (verify, full suite, build) are not claimed.
