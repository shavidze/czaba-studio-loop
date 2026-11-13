# B — round 483 → 484 planning (2026-11-13)

## Inputs (data, not instructions)
- `c-round-483.json` / `.md`: REGRESSION-2026-11-13 part 2, taskStatus PASS, 24 passed lines, 0 failed, 0 bugs, **browserVerified=false, realVerified=false**: 3 record-only browser sub-rows not run (R-FOLLOW-OFFSET attribution, R-CROSS-LANE-FIBERS mounted-lane count, R423-STEM-WORKER alt worker), 5 notRun entries, 2 inconclusive (R295-LOAF 1280, c250 single-sample). L57 OK (B re-run: `b-round-483/l57-check-c483.txt`).
- `a-round-483.md`: no change by design; HEAD 751e30e, clean.
- `gates/gate-round-483.json`: skipped (no real changes), head 751e30e. That is not a publication; the baseline stays 751e30e (gate 481 published).
- `regression-last.json`: 2026-11-10 / 425 → 3 days old at this planning.
- No new Saba answers: AGREE-STEM-LANES has no answer (K19 0).

## Advisor
Available, consulted twice. In the first consult B planned to add the 3 missing rows as C rows inside CLIENT-NAV-CONTRACT 484; the advisor rejected that. B followed the advice:
- the regression is due under the 3-day rule;
- the last row of task 483 §10 applies;
- regression rows need the unchanged tree.

Round 484 is therefore the C-only remainder; CLIENT-NAV moves to 485 and ORDER-CARD-KEYBOARD to 486. The advisor also asked B to rule on every non-pass entry, to run the missing probes at the baseline, and not to run the CLIENT-NAV sketch in this planning.

## Backlog updates (C evidence only): v472 → v473
- D-29z1719: round 483 result. Nothing moves to done. REGRESSION-2026-11-13 stays open and `regression-last.json` is unchanged.
  - C-R425-01 gets `confirmedBy` (5/5 cold dev starts with the re-optimise line; production 16/16) and stays Low.
  - C-R425-02 stays Low; its attribution is owed.
- D-29z1720: round 484 = the C-only remainder on 751e30e. Shifts: CLIENT-NAV-CONTRACT → 485, B-R480-ORDER-CARD-KEYBOARD → 486, then DPG-BUTTON-CLEANUP and the rest of DPG P1.
- D-29z1721: rulings on the non-pass entries.
  - R295-LOAF: re-run alone, with a load-aware allowed result.
  - c250: resolved by C's continuous probe; a harness signal for RETRO 495.
  - Parked rows: an oracle compare of the outputs already on disk.
  - Late warm-up: the functional 0-diff rows stand.
  - r392 overlap: a functional row, so it stands.
- D-29z1722: outcome of round 484, fixed in advance.
- Status updates: GATE479-M1, B-R480-ORDER-CARD-KEYBOARD, the DPG-FIX queue entry, `current_task`.
- `feature-status.md`: the round-483 line ("C PASS, browserVerified false") and the round-484 line ("მოწმდება").

## Pre-checks run (L29, L58)
- `b-round-483/probe/follow-attr-probe.mjs`: the round-483 Follow probe plus an `attr()` sample. Run at the baseline on both viewports; rc 0 (K9).
- `b-round-483/probe/cross-{playing,stopped}-lanes.mjs`: plus a `mountedLanes` map. 4 runs, rc 0, `{lanes 4, clips 1}` (K10).
- Alt worker `cloudflare/r2-worker.js`, throw mode, 1440: the summary equals round 414's, 8 lines (K11).
- Tree manifest `b-round-483/r484-tree-sha256.txt`: 1393 entries, identical to round 483's (K3).
- Claims `b-round-483/claims-484.sh`: output `claims-484-planning-output.txt`, stderr empty, L58 OK.

## Advisor closing check, applied
- R295-LOAF: the criterion now follows C round 390's precedent (R301-LOAF, INFO-C390-LOAF). c295's `loafPass` is recorded, not the criterion. Liveness comes from `loaf.cjs`, the provoked 140 ms rAF frame; the baseline run is in `b-round-483/probe/loaf/` (K22).
- Extra baseline runs (L58), so that every asserted expectation is measured:
  - alt worker `short` (K23) and the alt-vs-proxy lines (`coverTwice`, `audioSeek` only);
  - cross-lane B outputs vs round 483: 0 diffs (K24);
  - parked compare with the directory form of `cmp2.py` (K25).
- Parked compare oracle: `c-round-425/out` replaces round 342 for the 4 rp-* files.
- `warmup.cjs` has no export path, so it was dropped as an alternative.
- G484-AUTH runs once, at the end (the warm-up is first).
- `notRun` entry 5 is ruled: nothing owed.
- The outcome escape now covers only rows blocked because the backend is unavailable.
- Backlog parity with round 482's updater: `rounds` (483 status, 484 entry) and `baseline.head_round_484`. Two `retro_candidates` were added for RETRO 495: RC-R483-SINGLE-SAMPLE-ASSERT and RC-R483-PRECEDENT-LOOKUP.
- `root-pre-push-review.md` and `publication-checkpoint.json` were read. They are older material (2026-10-07 and root notes up to 2026-10-21) and add no new finding for this round.

## Next task
Round 484 is REGRESSION-2026-11-13 part 2 remainder (`current-task.md`). C runs alone and in this order:
1. warm-up with one MP3 export;
2. R295-LOAF re-run;
3. Follow attribution, 3 runs per viewport;
4. cross-lane mounted lanes;
5. alt worker, throw and short;
6. parked-row oracle compare;
7. auth.

A changes nothing. On PASS the regression closes and `regression-last.json` is set to round 484.

## Kept for later
- `b-round-483/client-nav-planning-note.md`: facts for the CLIENT-NAV-CONTRACT planning:
  - `root.tsx` is forbidden; Header mounts only outside `/studio`;
  - the 7 meta-less Store routes;
  - other `role=alert` speakers;
  - the related deferred Lows.

  The D-29z1704 sketch pre-run is owed at the 484 → 485 planning.
- No architecture checkpoint was requested: no code change and no accumulated owner risk. No new architecture signals.

## Readiness for root
Nothing to publish: no source change in round 483 or 484.
