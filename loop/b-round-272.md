# B: round 272 → 273 planning (2026-10-30, D-29z597…D-29z600)

**Decision: CONTINUE.** Round 273 is **SYS-6 STATUS-LIFETIME, stage 2 of 3**.
- **Task:** `current-task.md`.
- **Grants:** `b-round-272-r273-grants.txt`.
- **Baseline:** HEAD `b288be7`. `gates/gate-round-272.json` is `published` and its commit is `b288be7`; the gate's `head` field `66b570a` is the pre-commit HEAD. The tree is clean.

## 1. Inputs read
- **Context:** `context/active-summary.md` (head only), `lessons.md` (59 lines) and `b-round-271.md`. Specific ids were looked up in `backlog.json` and `feature-status.md` with grep or Python.
- **Round 272:** `current-task.md`, archived as **`tasks/round-272.md`**. The archive did not exist before; it was copied with no-clobber, so nothing was overwritten.
- **Reports:** `a-round-272.md`, `c-round-272.md` and `c-round-272.json`.
- **Gate:** `gates/gate-round-272.json` and `gates/round-272/review.md` (8/10, COMMIT OK, 4 findings plus an Architecture note).
- **Source:** `ArrangementContext.tsx` (`writeInsertMarker`, `setRange`, `startPlaybackAt`, `togglePlayback`, `describeSpaceStart`, `playFrom`, `seekTo`, `beginPointerGesture`, `formatArrangementTime`), `playback-start.ts`, `status-announcement.ts`, the `StudioWorkspace` stop effect and live region, the `ArrangementClip` range gesture, and the playback strings.
- **Regression date:** `regression-last.json` says 2026-10-30 (round 258). The next regression is due on or after 2026-11-02, so it is **not due**.
- **Advisor:** available, consulted before the contract and at the final review.
- **Project subagents:** not consulted. This is a bug round with no new feature, so neither the reference-first section nor `product-designer` applies.

## 2. Round 272 result (D-29z597)
- **C PASS:** 20 rows at both viewports, `browserVerified` and `realVerified` true.
  - The single FAIL row, LT-RANGE-OWN-STATUS, is the pre-existing **C-R272-01**. It comes from B's false §3.7 premise ("setting a range writes its own status"), not from A's work. HEAD showed the same.
- **Gate 272:** published `b288be7` on both remotes. `verify.log` shows 3272 tests.
- **Closed** on C's independent browser evidence, and removed from `deferred_low_polish` (L7): **B-R253-STALE-PLAYING-STATUS-RESIDUAL**, **C-R253-01** and **C-R254-OBS-01**. SYS-6 stage 1 is done.
- **Section 0** (a strip or flag click from a stopped text now gives the true playing text) is accepted. Round 273 pins it as LT12.
- **Every browser row ran.** No browser half is pending.

## 3. Gate-272 and C/A notes (D-29z598)
**Gate findings**
| Finding | Ruling |
|---|---|
| **S1, Medium (late read)** | GATE272-S1-LATE-READ, dispatched in round 273 with an explicit ruling and pin rows |
| **S2, Low (render-time ref)** | dispatched in 273; owned code, near-zero cost |
| **S3, Low (selection past-end refusal goes stale)** | B reproduced it at `b288be7` at both viewports; dispatched in 273 |
| **S4, Low (clamp)** | **closed, not reproducible:** `formatArrangementTime` already clamps (l.598) |
| **Architecture note** | signal **GATE272-ARCH-STATUS-TAG**, plus a checkpoint request (§5) |

**C notes**
- C-R272-01 is dispatched in 273.
- INFO-C272-K11: the PB rows are renamed to PBS in 273.
- INFO-C272-MUTANT-MAP: LT10 is frozen byte-identical, and M-STOP-EXACT stays in the mutant table.

**A's reviewer Lows, moved to `deferred_low_polish`**
- A-R272-REVIEW-SEL-AT-END-WORDING;
- A-R272-REVIEW-TEXTS-OUTSIDE-T;
- A-R272-REVIEW-KIND-NAME.

`deferred_low_polish` is now 464 (461 − 3 closed + 3 A Lows + 3 dispatched gate/C Lows).

## 4. Round 273 plan (D-29z599)
**One owner, one root cause.** Transport texts that name a start point are not re-derived when the start point changes through anything other than `writeInsertMarker`: a Space start, a range write, a gesture release, or Home after a selection refusal.

**The ruling on GATE272-S1:** a function-form update describes the state **at the end of the action** (late read).
- **Rejected: snapshot-at-write.** It would break Home-with-range, because `placeInsertMarker` writes the marker before clearing the range, and it would break `playFrom`.
- **Pinned by:** LT12, LT13 and LT8's end step.

**The rules:**
- **Rule P:** `Playing from <t>.` replaces a stopped T text on a successful start, and only that text.
- **Rule R:** `setRange` re-derives a stopped T text, but only when no gesture is active.
- **Rule G:** a gesture release re-derives it.
- **Classifier:** gains the `playing-from` kind and the selection past-end forms.
- **`describeSpaceStartRef`** is removed.

**Rejected alternatives:**
- *Reuse `insertMarkerWhilePlaying` on start:* it is false with a selection or with the marker at the end.
- *Write on every start:* it would clobber clip-added, Loop and `followResumed`.
- *Rule R without the gesture guard:* it would announce once per pixel of a drag.

**Round-size rule:** the old D-29z596 stage-2 plan bundled the transport class with the edit-result and announcement class (6+ items). It is now split: stage 2 is 1 Medium + 2 related Lows on one owner; stage 3 (round 274) is C-R271-01, GATE270-S2 (premise probe first), INFO-C248 and the doc statuses.

**B's pre-check (L23)**, all files in `b-round-272/`:
- **Sketch:** `sketch.diff`, on a `git archive` scratch with a private `node_modules`.
  - `tsc` rc 0, and Biome is clean.
  - **Full vitest: 3269/3272.** The 3 failures are exactly the granted collisions: ST12, PB8 and LT8 l.326.
- **Browser** (`probe-r273.cjs`, HEAD on :5173 against the sketch on :5186, at 1440×900 and 1280×720, 0 page errors, 20 runs):
  - HEAD reproduces C-R272-01, B-R272-STOPPED-TEXT-WHILE-PLAYING and GATE272-S3;
  - the sketch fixes all three;
  - the strip-click and clip-added controls are identical to HEAD;
  - there are 0 status mutations during a range drag.
- **Range paths:** the probe's 2→5 s drag runs through the clip-body range path (`ArrangementClip`), and the 17→18 s drag through the lane-background path (`StudioWorkspace`). Both are covered.
- **The scratch server** has been stopped. `store/` is untouched (`git status` is empty).

**New signal:** B-R273-PLAYING-TEXT-WITH-RANGE (a hypothesis, not probed). While playing with a selection, `insertMarkerWhilePlaying` says "Space plays from here". B probes it at stage-3 planning.

## 5. Order, checkpoint and lessons (D-29z600)
**Order:**
1. Round 273: SYS-6 stage 2.
2. Round 274: SYS-6 stage 3.
3. SYS-5.
4. STUDIO-PERFORMANCE.

REGRESSION goes first on or after 2026-11-02, re-checked at every planning. RETRO 275 holds.

**Checkpoint:** `b-round-272-checkpoint-request.md` asks root for a bounded frontend-architect ruling: keep text-as-state, or switch to a typed tag.
- **Trigger:** the classifier grows on the same owner in every stage.
- It is non-blocking, with a deadline of SYS-6 close.

**Lessons:** no Saba-found issue this round, so `lessons.md` is unchanged (59 lines). C-R272-01 itself came from an unprobed B premise, which is already L29's "premises about code" claim type. Retro candidate: **RC-R272-UNPROBED-PREMISE**. The §3.7 premise was a ruling with no K-tag; B now tags rulings as claims too.

## 6. Not COMPLETE, not BLOCKED
**Not COMPLETE.** Still to do:
- SYS-6 stages 2 and 3, then SYS-5;
- STUDIO-PERFORMANCE and SYS-1..3;
- STORE-2b..5 (the direction gate);
- REVIEW-RECOMMENDATIONS and T12-ADVANCED;
- the phase-2 entries (PHASE2-VIDEO-SCORING is gated on the user's go-ahead);
- 464 deferred Lows;
- the Medium GATE271-S1, which is `awaiting_user`.

**Not BLOCKED.** Nothing external is missing.

**Ready for commit:** nothing new. Round 272 is published (`b288be7`).

## 7. Artifacts
**`b-round-272/`:**
- `probe-r273.cjs`, `probe-r273-{head,sketch}.json` and `shots/`;
- `sketch.diff` and `precheck-vitest.{json,log}`;
- `run-*.log` and `scratch-server.log`;
- pre-edit copies: `backlog.before.json`, `feature-status-before.md` and `b-next-before.json`.

**Updated:**
- `backlog.json` (version 237);
- `feature-status.md`;
- `current-task.md`;
- `b-next.json`;
- `tasks/round-272.md` (the archive).

**New:** `b-round-272-r273-grants.txt` and `b-round-272-checkpoint-request.md`.

## 4a. Corrections after the advisor's final review
- **LT16 was probed** on the sketch and on HEAD with a new scenario, `spaceCtrlLeft`, at both viewports with 0 page errors (`probe-r273-*.json`). After `Playing from 00:04.000.` and Ctrl+← while playing, Follow stays `on` and the text is the plain `insertMarkerWhilePlaying('00:00.000')`. The task row now cites this. The M-NO-KIND-FROM killers are named: PBS9, LT16 and LT14's Stop step. The scratch server has been stopped again.
- **§3.3 rules the non-gesture range writers:**
  - 17 context `setRange(` calls [K23] plus the Detail panel commit; all are discrete;
  - the key-repeat paths (l.1988, l.2008) clear an already-null range, a same-text function update with no sequence bump.
- **§3.8 rules Rule G after an edit that changes the project end.** The re-derived text, for example a past-end refusal after a trim, is expected and allowed.
- **Retro candidate RC-R272-UNPROBED-PREMISE** is recorded in `backlog.json` `retro_candidates`.
