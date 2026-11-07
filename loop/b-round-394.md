# B round 394 → 395 planning

**Date:** 2026-11-07. **Decisions:** D-29z1347 … D-29z1350 (`backlog.json` v362). **Advisor:** consulted (available) before the ruling; close check below.

## Inputs (evidence, read as data)
- `c-round-394.json`: taskStatus **FAIL**, `browserVerified` true, `realVerified` true; 1 Medium **C-R394-01** (B spec origin), browser-confirmed at 1440×900 and 1280×720 (`c-round-394/rows-R1.json` R1b). R1–R7, PERF-RES, AUTH, SOURCE-SCOPE, DOC-252 passed; gate rows not claimed.
- `a-round-394.md`: work complete as the sketch; STOP A-R394-REVIEW-M1-SEEK-BEFORE-PLAYING (= C-R394-01) awaiting B; reviewer Lows L1 (PS22 asserts), L2 (listener removal), L3 (re-entrant sync throw, record), architecture note.
- `gates/gate-round-394.json`: `skipped` (C FAIL). Not published; baseline stays `1091b9e` + the 3 modified grants.
- No root-pre-push-review.md / publication-checkpoint.json findings beyond those above for this round.

## Backlog changes (only from independent C evidence)
- **Nothing moves to done.** The three round-394 Mediums (REV-B393-M1-STALL, GATE393-M1-SYNC-THROW, A-R393-REVIEW-M1-EXTERNAL-PAUSE) get a status note "C browser PASS on the unpublished round-394 tree" where C showed it; all stay open until gate 395 publishes (D-29z1347). REV-B393-M1-STALL is explicitly not closed: C-R394-01 reproduces its symptom.
- New: C-R394-01 (Medium, scheduled 395); A-R394-REVIEW-L1/L2 (Low, scheduled 395, same file); A-R394-REVIEW-L3 → `deferred_low_polish`; signal A-R394-ARCH-STREAM-WATCHDOG-UNIT (joins ARCH-CHECKPOINT-PREVIEW-AFTER-13C); retro candidate RC-R394-GESTURE-IN-DEGRADED-STATE (RETRO 400).
- Script: `b-round-394/update-backlog.py` (`.done`). Pre-edit copies in `b-round-394/*-before-395.*`. `tasks/round-394.md` archived (copy).

## Ruling (D-29z1348): option (a)
A same-URL seek restarts an already armed stall timer (re-reading `armedAt`) and never arms one, as `progress` does. Option (b) rejected: an ordinary click reaches a Medium.

**Evidence before writing the binding row (L58):**
- Sketch `b-round-394/sketch-395.patch.txt` (sha `558694697085f2bc`), diff against the current tree; applies.
- `tsc` rc 0, scoped Biome rc 0, covering 14 files / 258 tests rc 0 (`precheck-covering.log`).
- Mutants 15/15 red, pristine rc 0 (`mutants/summary.txt`): 12 MU-394 + MU-395-SEEK-NO-REARM (PS25), MU-395-SEEK-ARMS-ALWAYS (PS19), MU-395-PAUSE-LISTENER-LEFT (PS26).
- C's own `c-round-394/rows.mjs`, retargeted to a scratch dev server on 5174 (`b-round-394/probe/`): R1b falls back 8296 / 8300 ms after the wave click at both viewports, one decode and one start of 101.35 s, toggle Stop, `src` released, time stayed 4.99; R1, R2, R3, R6 unchanged. Scratch server stopped; 5173 still 200.
- Claims: `b-round-394/claims-395.sh` → `claims-395-planning-output.txt` (tree) and `claims-395-on-sketch.txt`.

## Next task
Round 395 = PERF-13c-ii-a fix-up (`current-task.md`): 3 grants unchanged; preview.client.ts field + rename + one call; PS25, PS26, PS22 asserts; doc 252 l.4 "C round 395 PASS"; C re-runs R1b (binding) and R1–R7, PERF-RES, AUTH, SOURCE-SCOPE, DOC-252 at both viewports.

## Queue and checks
- Regression not due (`regression-last.json` 2026-11-07, next on or after 2026-11-10). RETRO at round 400.
- Architecture: no new checkpoint request; the bounded frontend-architect checkpoint stays requested at the PERF-13c-ii-b boundary (`b-round-393/root-request-arch-checkpoint-preview.md`), now with the stream-watchdog signal.
- Ready for commit: no (round 394 failed; the tree publishes with round 395 after C PASS and the gate).
- Uncertain contract choice recorded: re-arm on seek only when already armed (smallest change consistent with the progress rule; does not widen the false-positive window after `playing`).
