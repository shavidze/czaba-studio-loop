# C round 394: verdict FAIL (A STOP unresolved; one reproducible Medium)

Browser: Playwright/Chromium, fresh context per row, 1440x900 and 1280x720. Evidence: `c-round-394/` (`rows.mjs`, `rows-*.json`, `auth.json`, `perf-results/resources.log`, `R1-*.png`).

## Context
A stopped with a STOP (A-R394-REVIEW-M1-SEEK-BEFORE-PLAYING) and no B ruling exists. Tree = the 3 grants, A's work otherwise complete. I ran the rows on that tree and also probed the STOP in a real browser (A had only jsdom).

## Results
| Row | Result | Evidence |
|---|---|---|
| R1 STALL-FALLBACK (HOLD, no click) | PASS both VPs | fallback 8369 / 8362 ms; Loading -> ready; 1 decode, 1 start of 101.35; PCM +101.35; requests `media`,`fetch`; 0 after fallback |
| **R1b HOLD + wave click at 3.5 s (new probe)** | **FAIL both VPs** | no fallback after 23.6 s; toggle Stop; src kept; t=4.99; 0 decode/start. Bug C-R394-01 |
| R2 EXTERNAL-PAUSE | PASS | toggle Preview, no src, networkState 0, status unchanged, 0 decodes/starts |
| R3 NORMAL-20S + seek | PASS | one element playing, Stop, 0 decodes, PCM unchanged, status unchanged |
| R4 END | PASS | Preview, no src, 0 decodes; order `pause` then `ended` (browser fact) |
| R5 ABORT | PASS | Loading -> ready, 1 decode/start 101.35, Stop; second Preview: still 1 element |
| R6 STOP | PASS | Preview, no src, 20 s later still Preview, 0 decodes |
| R7 PLAY-STOPS-PREVIEW | PASS | data-playing true, element paused no src, 0 decodes after 20 s |
| PERF-RES | PASS | pcm-live-mib-ready 31.9 <= 60; decode-mib 0 <= 0 |
| AUTH | PASS | /studio-lab demo opens; /studio/<handle> shows "Sign in required", no workspace; /api/studio-token GET 400, POST 405 (no bypass) |
| SOURCE-SCOPE | PASS | claims at start = A's claims-end (diff only the §7 facts vs planning output); frozen 1284 OK, 0 failures; protected 11/11; 3 files modified |
| DOC-252 | PASS (structure) | Georgian, 7 headings, l.4 exact; cited ids PS1-PS24 exist |
| gate | not claimed | full vitest/typecheck/build/verify belong to root gate |

jsdom-only (not in passed/blocked): PS21(b), PS22, PS23, relying on A's mutant logs (not re-run by C).
Ableton: consistent in direction (interrupted browser preview stops; a click restarts); status not applicable / perf.

## Bug C-R394-01 (Medium, B spec / same as A's STOP)
Steps: HOLD route; select Middle East; click Preview; ~3.5 s later click the wave; wait. Expected: fallback to decode as in R1. Actual: stuck on Stop forever (23.6 s observed, both VPs); the "moved time wins" rule disables the watchdog because the seek moved `currentTime` before `playing`, and nothing re-arms it. This is the REV-B393-M1-STALL symptom reachable by an ordinary click, so that finding is not closed. Browser-confirmed; A's reasoning (option a: restart an armed timer after a seek, re-reading armedAt; add PS25 + mutant) fits.

## For B
Rule on option (a)/(b). Recommended (a); C rerun needs R1b as a binding row (expect fallback ~8 s after the seek). Also A's two Low test-assert gaps (PS22) and the PS21(a) listener-removal gap.

## Why FAIL
The round's main bug (stall recovery) still fails on a reachable path, and A's STOP is unresolved; doc l.4 "C round 394 PASS" cannot stand.
