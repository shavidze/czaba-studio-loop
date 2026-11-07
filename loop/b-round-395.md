# B round 395 → 396 planning

**Date:** 2026-11-07. **Decisions:** D-29z1351 … D-29z1354 (`backlog.json` v363). **Advisor:** available. I consulted it after orientation and before writing anything; its effects are listed in `advisor_used_by_B`. `tech-lead` reviewed the sketch twice.

## Inputs (read as data)
- **`c-round-395.json`:** taskStatus **PASS**, `browserVerified` true, `realVerified` true, 0 bugs.
  - R1b (the binding row): 8287 / 8283 ms.
  - R1–R7, PERF-RES, AUTH, SOURCE-SCOPE and DOC-252 also passed.
  - The gate rows are not claimed.
- **`a-round-395.md`:** no STOP. Reviewer Lows L1 (seek re-entrancy) and L2 (no row for a throw while the timer is armed). No new architecture note.
- **`gates/gate-round-395.json`:** `published`, commit `cf81dff`, on both remotes. So the baseline for round 396 is `cf81dff`, and the tree is clean.
- **`gates/round-395/review.md`:** Lows only (the `currentTime` read in `handleError`; the iOS pause interruption; the others are confirmations). One architecture note: consider a `createStreamPreview` factory after 13c-ii-b.

## Backlog changes (only from independent C evidence plus the gate)
- **Done (D-29z1351):**
  - the stage PERF-13c-ii-a;
  - REV-B393-M1-STALL, GATE393-M1-SYNC-THROW (jsdom rows), A-R393-REVIEW-M1-EXTERNAL-PAUSE, A-R393-SKETCH-L4-EXTERNAL-PAUSE;
  - C-R394-01, A-R394-REVIEW-L1-PS22-ASSERTS, A-R394-REVIEW-L2-PS21A-LISTENER-REMOVAL.
- **New (D-29z1353 / D-29z1354):**
  - Scheduled for round 396: TL-B395-SKETCH-M2-CROSSORIGIN (Medium, found on B's sketch), A-R395-REVIEW-L2-THROW-WHILE-ARMED and B-R395-DOC248-STATUS (an L28 miss from round 392).
  - Moved to `deferred_low_polish`: A-R395-REVIEW-L1-SEEK-REENTRANT, GATE395-L1-CURRENTTIME-READ, GATE395-L3-IOS-PAUSE-INTERRUPTION, B-R395-PURCHASED-DUP-URL and B-R395-PERF-RESTORE-CATCH.
  - Recorded as signals, not scheduled: GATE395-ARCH-STREAM-FACTORY (joins ARCH-CHECKPOINT-PREVIEW-AFTER-13C) and TL-B395-SRW21-MEMO-ADAPTER (input for SRW-21-PLAN).
- **Scripts:** `b-round-395/update-backlog.py` and `update-backlog-2.py` (each has a `.done` marker), and `update-feature-status.py` (inline, `.done`).
- **Pre-edit copies:** `b-round-395/*-before-396.*`.
- **Archive:** `tasks/round-395.md` is archived as a copy.

## Rulings (D-29z1352): PERF-13c-ii-b
1. **Purchased `previewUrl`:** the adapter reads its stem Map. No provider change.
2. **Seek key:** it stays the URL, because the adapter returns an identical string per source for the collection's lifetime. A-R393-REVIEW-L6 is closed by this ruling, and PV2 pins it. I chose this as the smallest honest behaviour: it keeps `ArrangementContext.tsx` untouched just before the architecture checkpoint on that region.
3. **Fallback memory:** it lives as long as the collection object, with no timer. Row PS27 pins it, and GATE393-L4 closes when round 396 passes.
4. **Cache:** the stream path writes no cache. SIG-R393-PREVIEW-NO-CACHE-WARM is ruled this way.
5. **`crossOrigin = 'anonymous'`:** the stream element now uses it (a `tech-lead` Medium on the sketch), so its credentials match the decode fetch.
6. **Purchased browser half: BLOCKED "no mount point: SRW-21 deferred_user".** I tried the L36 stub approach first. No route or page builds the purchased collection (K14), so there is nothing to stub.
7. **Perf rows asserted from B's production sketch:** 1 / 0 / 0. With the fix removed (mutant MU-396-DEMO-NO-STREAM) they read 0 / 37.1 / 1, red on all three.

## Evidence before dispatch (L23, L56, L58)
- **Sketch:** `b-round-395/sketch-396.patch.txt`, sha `91c5d730…`. It applies to `cf81dff`. `tech-lead` review 1 was on sha `236287d1` and found 2 Mediums, both fixed. Review 2, the delta review on the dispatched sha, found no Medium or higher (`sketch-review.md`).
- **Static checks and tests:** `tsc` rc 0; scoped Biome rc 0; full suite 258 files / 3832 tests, rc 0; covering set 19 files / 314 tests, rc 0 (LRS4 2046 ms under its 15 s timeout).
- **Unit mutants:** 7/7 red, and the pristine run is rc 0 before and after (`mutants/summary.txt`).
- **Perf:**
  - Sketch run: `perf-sketch.log` and `perf-sketch-latest-resources.json`. Every row equals C round 395 except `mem-polls-1.6x` (18 → 20, a poll count; its assert passes).
  - Mutant run: `mutants/perf-MU-396-DEMO-NO-STREAM.log`.
- **Browser, on a scratch dev server at :5174** (its own Vite cacheDir; stopped afterwards, and :5173 still answers 200):
  - C's rows R1b, R1, R3, R2 and R6 give the same values as C's round-395 run;
  - the new row R8 shows `crossOrigin` `anonymous` while the preview streams, with 0 decodes (`probe/`).
- **Claims:** `claims-396.sh`. Its planning output and its output on the sketch are saved, and they differ only in the §7 facts (7 lines).
- **Manifests:** frozen manifest `r396-frozen-sha256.txt` (1279 entries, 0 failures); protected files 11/11.

## Next task
Round 396 is PERF-13c-ii-b (`current-task.md`). It has 8 grants: 2 source lines, 2 test files, 2 perf files, doc 252 (Completed) and doc 248 (l.4 only).

## Queue and checks
- **Regression:** not due. `regression-last.json` says 2026-11-07, round 390; the next one is due at the first planning on or after 2026-11-10.
- **RETRO:** round 400.
- **Architecture:** this is the PERF-13c feature boundary. The bounded `frontend-architect` checkpoint request `b-round-393/root-request-arch-checkpoint-preview.md` becomes due for root once round 396 passes C. I have not refiled it. Its signals now include GATE395-ARCH-STREAM-FACTORY and A-R394-ARCH-STREAM-WATCHDOG-UNIT. It does not block PERF-13d.
- **After 396:** PERF-13d → PERF-14 → PERF-15 (PERF-12b and PERF-11c-iii-d/e are `awaiting_user`). Then SYS-1…3, STEM-LANES and the rest of the queue, unchanged.
- **Ready for commit:** round 395's work is already published (`cf81dff`). Round 396 publishes after C PASS and the gate.
- **Uncertain contract choices:** the seek key stays the URL, and the fallback lives with the collection object. Both are recorded with D-29z1352 and argued above.
