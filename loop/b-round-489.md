# B round 489 → 490 planning (2026-11-13)

**Decision: CONTINUE.** Round 490 is the fix-up of round 489 (`current-task.md`).

## Inputs read
- `context/active-summary.md`; `gates/gate-round-489.json`: `skipped`, "C taskStatus FAIL". Nothing was published, so the baseline stays `73f994d` (gate 488) with round 489's v3 uncommitted in the store tree (4 paths, byte-equal to `b-round-488/sketch-489/`).
- `current-task.md` (round 489), `a-round-489.md` (STOP), `c-round-489.md`, `c-round-489.json` (FAIL; `browserVerified` true), `lessons.md`. IDs in `backlog.json` were looked up by id, not read whole.
- `regression-last.json`: 2026-11-13, round 484, so no REGRESSION is due until 2026-11-16. RETRO at 495.

## Backlog changes (evidence-based only)
- **Nothing becomes done.** Round 489 is C FAIL. SABA-B-17-ENTRANCE-3-4S, B-R489-ENTRANCE-SLOW-FIRST-VISIT-EXPIRED and B-R489-ENTRANCE-WHEEL-SCROLLS-UNDER-COVER stay `dispatched`. Their status cites C's green browser rows as evidence, not as a PASS (V2).
- **New Medium A-R489-REVIEW-NONZOOM-CLASSIFY,** with `confirmedBy` C-R489-A-STOP-NONZOOM-TEST-GAP (L7: no duplicate id). It is ruled and fixed in round 490.
- **Lows:**
  - E8D-LITERAL is fixed in v4.
  - L3-CLASS goes to `deferred_low_polish`, because it needs a component change.
  - DOC-STATUS is closed under L28.
  - TL-R490-F7, a real pinch whose first move carries one touch, is added to TLM-R489-TOUCH-SWIPE.
- **Environment:** C-R489-ENV-K17-WEBM-GITIGNORED is closed as an environment finding, with root request ROOT-REQ-LOOP-WEBM-EVIDENCE.
- **Architecture:**
  - SIG-R489-ENTRANCE-ZOOM-RULE-TWICE is recorded as a signal only, not a task.
  - ARCH-CHECKPOINT-ENTRANCE-LOADING (`b-round-489/checkpoint-request-entrance.md`) goes to root after round 490 passes, at the feature boundary.
  - The ARCH-CHECKPOINT-ACCOUNT-PROFILE deadline moves to before round 492 planning.
- **Order:** 490 fix-up, then 491 B-R487-PROFILE-EDITOR-NARROW-OVERFLOW, then 492 B-R488-PASSWORD-MODAL-DIALOG.
- **Decisions:** D-29z1747 … D-29z1751. The board is updated in `feature-status.md`.
- **Lesson:** L52 gains "classifier rows dispatch the real event". `lessons.md` stays at 60 lines (before: `b-round-489/lessons-before-490.md`).

## Sketch v4 (delta on v3)
- **Delta:** `b-round-489/sketch-490-v3-to-v4.patch.txt` (sha in `sketch-490.sha256`), with the full file set in `b-round-489/sketch-490/`. `EntranceCover.tsx` and `SpotlightLoader.tsx` are byte-equal to v3.
- **What it changes:**
  - `dispatchScrollGesture` sends a real `WheelEvent` (`deltaY` 100) and a one-touch `TouchEvent`.
  - `dispatchZoomGesture(type, deltaY = 100)`; S3 and E8e run ctrl+wheel with both delta signs.
  - E8d uses `ENTRANCE_FAILSAFE_MS + ENTRANCE_EXIT_MS`.
  - Doc 316: l.4 is set for round 490, and the probe lines are corrected.
- **Checked on the scratch** (`/tmp/b490-scratch` = `73f994d` + v3 + v4):
  - covering 4 files / 94 tests;
  - typecheck rc 0, lint rc 0, scoped Biome with the 3 known warnings;
  - 30 mutants (`b-round-489/mutants/`), all red, the first 22 equal to round 489's;
  - the full suite: 293 files / 4294 tests, rc 0 (`b-round-489/precheck-full-490.log`).
  - The patch also applies cleanly on a fresh clone of `73f994d` + v3 (K9 `====`).
- **tech-lead** (`b-round-489/sketch-review.md`):
  - `6b8f5f36…`: APPROVE WITH CHANGES (F1 Medium, sign-keyed survivor → fixed; F2 → L28; F3 → fixed; F7 → TLM).
  - `6541b85b…`: APPROVE with Low F1b (mirror survivor) → fixed.
  - `9280c737…`: **APPROVE** (no new Medium+). This is the dispatched sha; L58 check OK.

## Advisor
Available and consulted before the sketch: it set the delta-on-v3 approach, the byte-equal components, the C15 playback half, C8t, the webm root request and the archive-first order. Consulted again at the end. In response:
- the remaining classifier survivors are ruled as Low;
- C15's playback timing is now a `record` with an observed reference (`c-round-482/jn/journey.json`), keeping `Playing`/clock > 0 as the assert;
- C13 cites the PNG stills instead of the ignored `.webm`;
- the backlog was diffed against the before-copy: 61 keys, no list lost an id;
- the round-489 line in `feature-status.md` is marked C FAIL.

## Claims
- `b-round-489/claims-490.sh`, with outputs `claims-490-planning-output.txt` (store tree) and `claims-490-sketch-output.txt` (scratch). Both have empty stderr. They differ only on K4, K5, K5b, K6, K9 and K13, as the delta intends.

## Store tree
Unchanged by B; `git status` equals `b-round-489/store-status-start.txt`. All work ran in `/tmp` clones.
