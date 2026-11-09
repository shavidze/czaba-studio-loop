# B round 422 → 423 planning (2026-11-09)

**Decision: CONTINUE.** Next is round 423: REGRESSION-2026-11-10 part 1, a C-only browser sweep of rounds 391–422 (`current-task.md`). A changes nothing.

**Advisor:** available. Consulted after orientation, and its advice was followed: plan the regression now (midnight UTC boundary), take the baseline from the gate commit and not from `context/head-sha.txt`, read the gate review, preserve first, and record SYS-2 stage 2's sizing without building it. A second call was made before close. It found six gaps, and all are fixed. K12 no longer looks up a closed id, and it is compared by "every id located". Three rows now cite their source row instead of a paraphrase. K8 now also checks every cited oracle folder and the shared `c-round-382/lib.mjs`. The three scripts that hard-code an output path in their own round folder have that change named in their rows. The conflicting order sentence in §5 is reworded. SA-4's audio-graph half is tagged on R423-METER. `date -u` at close: Mon Nov 9 23:09:58 UTC 2026. STEM-LANES was re-checked: `user-review/AGREE-STEM-LANES.md` has no answer, and the workflow file records no Saba answer for it.
**Consults:** none. In a regression round no behaviour changes, so no reference, `product-designer` or perf design applies.

## 1. Round 422 is accepted, from C's evidence only (D-29z1475)
- **C PASS** (`c-round-422.json`): 8 rows passed, 0 bugs, `browserVerified` and `realVerified` true. The fake-bearer row is BLOCKED (backend unavailable in the cloud) and stays as open backend evidence.
- **L57 check:** OK (`b-round-422/l57-check-c422.txt`).
- **Gate 422 published `875ff37`** on both remotes (verify: 264 files, 3,957 tests). The gate JSON's `head` field (`4786c13`) and `context/head-sha.txt` are stale. The round-423 baseline is `875ff37`.
- **Closed:** GATE107-S1-MARKER-FLAG-HELD-ENTER, on C row 3 (MU-FLAG → HE6) and row 4 (FLAG cells ALL OK).
- **Still open:** A-R107-SWEEP-HELD-ENTER-TOOLBAR. The transport part (HE1–HE5) is done; the rest goes to SYS-2 stage 2.
- **New Lows → `deferred_low_polish`:** both have origin `B spec`, because the defect is in B's dispatched sketch.
  - A-R422-REVIEW-L1-ONKEYDOWN-SPREAD-ORDER.
  - A-R422-REVIEW-L2-HE4-HE5-PREVENTED-ONLY, with `confirmedBy` gate suggestion 3.
- **Gate suggestion 1** (the flag guard sits before the target check) is the accepted TL-R422-01. It gets no new id (L7).
- **Architecture:** the gate's Architecture note, gate suggestion 2 and A's For-B note (fold Export's inline guard into the helper) become one signal, SIG-R422-REPEAT-SAFE-BUTTON-PROPS. It is decided inside SYS-2 stage 2a; it is not a separate task.
- **Archive:** `tasks/round-422.md` is byte-identical to the round-422 task (K11).
- **Old root files:** `root-pre-push-review.md` and `publication-checkpoint.json` date from rounds 3–65. They hold no open finding that is not already in the backlog.

## 2. Why the regression now (D-29z1476)
- `regression-last` is 2026-11-07 (round 390). The clock at planning read 2026-11-09 22:57 UTC: 2 days, with the 3-day trigger about an hour away. A and C run round 423 on 2026-11-10.
- The rule is a floor, not a prohibition. Precedent: round 389 opened one day early (D-29z1311).
- D-29z1472 and D-29z1474 had already placed the regression at round 423.
- A SYS-2 stage 2 dispatch could not have been built before midnight anyway: it needs a sketch, mutants, a full-suite pre-check, a browser probe and a review.
- Rounds 391–422 changed shared infrastructure: preview streaming, lane virtualization, the actions context, precomputed peaks, the stem cache and the key guards.

## 3. The regression plan (D-29z1477)
- **Part 1 = round 423:** one short browser check per item finished in rounds 391–422 (17 R423 rows), plus RR-PERF, PERF-LIB, RG-SMOKE and G423-AUTH.
  - Every scope addition is named (L6):
    - SA-1: REG-14BII-EXPORT-UNMOUNTED;
    - SA-2: frames200 and pin-blur-group;
    - SA-3: peaks-fallback in failing mode;
    - SA-4: export WAV;
    - SA-5: fake-bearer, BLOCKED;
    - SA-6: marker seek.
  - Every cited script exists (K8).
- **New recipe R423-MARKER-SEEK, run by B at the baseline** (L29; `b-round-422/probe/head/`):
  - Marker at 00:09.000, then a ruler click to 00:03.000, then Home, then Next marker: the clock reads 00:09.000.
  - Control without a marker: Next goes to 00:16.000, so the row tells the two cases apart.
  - The ruler box (1,840 px) runs past the viewport, so the probe clicks at fixed offsets inside it.
- **Part 2 = round 424:** the round-390 template, on the same baseline.
- **`regression-last.json`** is updated only when part 2 closes.
- **The outcome table is fixed in the task's §7.**

## 4. SYS-2 stage 2 sizing (D-29z1478; recorded, not dispatched)
About 40 sites remain across about 12 files, which does not fit one round. Split by owner; nothing is dropped:
- **2a:** the controls of the lane, group header, master and tempo row (metronome), plus the decision on SIG-R422-REPEAT-SAFE-BUTTON-PROPS and A-R422-REVIEW-L1.
- **2b:**
  - library;
  - video dock;
  - detail panel;
  - grid menu;
  - marker menu;
  - export dialog;
  - shortcut sheet;
  - narrow screen;
  - workspace footer;
  - held Escape on the marker editor.

Fit stays excluded (TH5).

## 5. Architecture checkpoints
- **New signal:** SIG-R422-REPEAT-SAFE-BUTTON-PROPS. It is low-risk and folded into stage 2a.
- **No new checkpoint request.**
- **Still requested of root:** ARCH-CHECKPOINT-PREVIEW-AFTER-13C and ARCH-CHECKPOINT-STEM-LANES.

## 6. Order after this round
1. 423: regression part 1.
2. 424: regression part 2, or a fix-up per §7.
3. STEM-LANES, as soon as Saba answers.
4. Otherwise: SYS-2 stage 2a, then 2b, then SYS-1, then SYS-3.
5. STORE-2b…5 (`direction-decision.md` exists).
6. REVIEW-RECOMMENDATIONS.
7. T12-ADVANCED.
8. Phase 2 (skip rule).

The next RETRO is round 435.

## 7. Why not COMPLETE or BLOCKED
- **Not COMPLETE.** Still open:
  - the regression;
  - SYS-1…3;
  - STEM-LANES;
  - STORE-REDESIGN 2b–5;
  - REVIEW-RECOMMENDATIONS;
  - T12-ADVANCED;
  - the phase-2 entries;
  - the parked PERF remainders;
  - SRW-21 (`deferred_user`);
  - every deferred Low.
- **Not BLOCKED.** Round 423 runs in the cloud. Only the fake-bearer row needs the backend.

## Files written by B
- `current-task.md` (round 423)
- `tasks/round-422.md` (archive)
- `b-next.json`
- `backlog.json` (v399, via `b-round-422/update-backlog.py` + `.done`)
- `feature-status.md`
- `b-round-422/*`:
  - claims and their planning output;
  - the tree manifest;
  - the marker-seek probe and its baseline;
  - before-copies;
  - the checkpoint;
  - the regression entry dump.

`lessons.md` is unchanged (60 lines). No new failure class appeared.
