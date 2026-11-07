# C round 383 — PERF-13b-i fix (partial verification)

Verdict: **BLOCKED / incomplete** — no bug found in the rows that ran, but required rows did not run, so no PASS and browserVerified=false.

## Ran (real Chromium via Playwright, dev server 5173; evidence in `c-round-383/`)
- SOURCE-SCOPE: 11 status lines; frozen and protected sha256 rc 0 (start and end).
- SWEEP (C read the source): helper `storeSourcePeaks` l.768, callers l.2844 and l.4307, the only updater-form setter is in the helper; reset uses `deleteMany` (l.4264), `clear()` has 0 provider hits.
- UNIT: cache 8/8 (DC8), eviction-ui 15/15 (EV10). `unit.log`.
- HEAP-RETAINERS dev 1440x900, 2 runs: live `[2,5,16,16,16,16,16]`, 0 `baseQueue` paths. `heap-dev-*.json`.
- HEAP-MUTANT: on a `cp` copy with the inline updater restored, live = `[…,150.37]` with a `baseQueue` path (red); first run was cold (`[]`, discarded). Restored; store untouched.
- EVICT / EVICT-B2 (both viewports, `b2.json`): hero not live at ready; library Stop releases 101.35 s; Add live; Undo gone; Redo live. Transport Stop leaves the preview playing and the buffer live (HEAD parity, observation).
- EXPORT (both viewports, `exp383.json`): sha256 `5fadd97a…8202`, 29,189,420 bytes, 24-bit/48 kHz stereo, 101.352 s, no non-finite samples, evicted after Undo.
- G383-AUTH (both viewports, `auth.json`): anonymous `/studio-lab` opens the demo, `auth_user` null; `/studio/middle-east` shows "Sign in required" with 0 audio sources; `/api/studio-token` without a token returns 400 (task expected 401; no token leaked, not a bypass).
- DOCS: l.4 exact, headings in TEMPLATE order, DC8/EV10/MU-383 named, 0 "pending" leftovers.

## Not run (reason: time) — keeps this from PASS
Production-build heap probe, PERF-RES, PLAY-REFUSE, the 19 unit mutants, covering-hit tests / C-DEMO / perf lib, the `stop()` call count in EVICT-B2 (only live buffers measured), the 1280x720 heap live list, the L57 fields check, and a line-by-line CLAIMS explanation.

## For B
Re-run only the not-run rows next C pass; nothing needs A unless they fail.
