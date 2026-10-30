# B: round 270 → 271 planning (2026-10-30, D-29z586…D-29z591)

**Decision: CONTINUE.** Round 271 = **SABA-B-11c stage 2**: relative snap of clip drags, Saba's option (a). It is the last stage of SABA-B-9-10-11-TRANSPORT-GRID and closes F1-ABSOLUTE-SNAP and R49-T part (1). Task: `current-task.md`. Grants: `b-round-270-r271-grants.txt`.

## 1. Inputs read
- `context/active-summary.md` (head) and `lessons.md` in full. Specific ids were grepped in `backlog.json` and `feature-status.md`.
- `current-task.md` (round 270), archived as `tasks/round-270.md`. `cmp` shows it identical; the archive did not exist before, so nothing was overwritten.
- `a-round-270.md`, `c-round-270.md`, `c-round-270.json` and `b-round-269.md`.
- `gates/gate-round-270.json`: **published**, commit `4b912a9` on both remotes. That commit is the round-271 baseline, with a clean tree.
- `gates/round-270/review.md`, which is triaged in §3.
- `regression-last.json`: 2026-10-30, round 258. The next regression is due on or after 2026-11-02, so it is not due now.
- `user-review/questions-11c.md`, the policy section "Saba's answers, 2026-10-30", `reference/ableton-live-measurements-2026-10-30.md` (no snap-offset measurement) and `reference/youtube/SABA-B-9-10-11-transcripts.md` (riOD 2:22).
- The Live 12 manual, Arrangement View §6.7, §6.9 and §6.10, fetched on 2026-10-30.
- **Advisor:** available, and consulted before the design. All of its points were followed:
  - scope the stage to drags and make the nudge a Saba question plus a Live measurement;
  - rule on every other snap caller;
  - make the no-way-back case a Saba question;
  - run the changed-meaning sweep and fix the Snap title;
  - justify the tolerance with a mutant;
  - consult `product-designer`;
  - rewrite the test names;
  - check headroom and the multi-stage doc l.4;
  - triage gate 270.

## 2. Round 270 result (D-29z586)
- **C PASS:** 16 rows, `browserVerified` and `realVerified` true, 0 bugs.
- **Gate 270 published `4b912a9`.**
- **Closed** on that independent evidence:
  - GATE266-S1;
  - B-R269-DETAIL-ALLTRACKS-DROP;
  - GATE266-S4;
  - B-R266-CLIPS-SPLIT-COPY;
  - the superseded signal B-R265-DETAIL-RANGE-CLAMP (L7).

## 3. Gate-270 review and C/A notes (D-29z589)
- **To `deferred_low_polish`** (the list now holds 455):
  - S1 → GATE270-S1-ONE-FIELD-MESSAGE (= INFO-C270-ONE-FIELD-EDIT = A reviewer M-1);
  - S2 → GATE270-S2-REPEAT-ANNOUNCE, also noted as a SYS-6 class candidate;
  - S3 → GATE270-S3-EDIT-ALLTRACKS;
  - S5 → GATE270-S5-DP1-TOGGLE-ASSERT;
  - C270-GUARD-NO-ONCLIP (C's surviving extra mutant);
  - A-R270-REVIEW-L3-ALLTRACKS-OTHER-LANE.
- **Other items:**
  - S1 and S3 are also attached to LATER-DETAIL-LANE-RANGE-EDIT (Saba).
  - S4: intended behaviour, no entry.
  - A's L-2 is consistent with the contract and gets no entry.
- **Architecture note** → signal GATE270-ARCH-DETAIL-RANGE-APPLY (keep; optional pure helper). Not scheduled.
- **INFO-C270-BS3-ID** → retro candidate RC-R270-TEST-ID-COLLISION. Round 271 grep-checks its new row ids (K9).

## 4. Round 271 plan (D-29z587, D-29z588)
**Repro at HEAD `4b912a9`** (both viewports, 0 page errors). Steps: the demo clip on Music at 10.000, grid 1 s, 40 px/s, G, then Alt-drag to 10.300.

| Step | HEAD | Sketch |
|---|---|---|
| 5 px jitter | **10.000** + an Undo entry (F1) | 10.300, "nothing changed" |
| +1.2 s, twice | 11.000, 12.000 | 11.300, 12.300 |
| cross-lane +1.2 s | ghost / landing 13.000 | 13.300 |
| left trim +0.75 s | 14.000 | 14.000 (unchanged) |
| ArrowRight from 10.300 | 11.000 | 11.000 (unchanged) |
| group (with a stems clip at 15.000) +1.2 s | 12.000 / 16.700 | 11.300 / 16.000 |

Evidence: `b-round-270/probe-relative-snap-{head,sketch}.json` and `probe-group-nudge-{head,sketch}.json`.

**The contract:**
- **Off the grid** (more than 0.5 ms from a stored line):
  - the grid candidate is the stored line (base + k) plus the offset, rounded once, so there is no drift on musical steps;
  - the lowest start is the offset itself;
  - the edges compete exactly as today;
  - a group moves by whole divisions, and a blocked group stops at the last whole step.
- **On the grid:** unchanged.
- **Unchanged, each with a reason:** nudge, trim, ranges, loop brace, library drop and markers.
- **Title:** "Snap on — clips follow the grid (G)".

**This changes how saved projects behave** (recorded as D-29z587): an off-grid clip dragged with Snap on no longer jumps to the nearest line.

**Rejected:**
- a relative nudge in the same round: 5 more rewrites, a grant in `StudioWorkspace.tsx`, and no Saba answer;
- snapping back to 0: a new mechanism;
- an on-screen indicator for the relative mode: screen budget.

**Reference:**
- §6.7 confirms grid plus edge snapping.
- The off-grid offset has **no reference**: the manual sections §6.7, §6.9 and §6.10, the expert's round-264 consult and the riOD video are all silent. Saba's decision is the authority.
- The manual's two bypass modifiers (§6.7 vs §6.10) differ. That is noted as a data point only.

**Pre-check (L23), all files in `b-round-270/`:**
- `sketch.diff`: 435 lines. `tsc` rc 0, and Biome is clean.
- **Collisions:** with the code sketch only, 168 files gave exactly 7 failures, all granted rewrites. The final sketch passes 2519/2519.
- **Mutants:** all 8 are red. The first M-EDGE-OFF and M-ABSOLUTE-GROUP versions were too weak; B fixed both, and RS3's second step was moved away from a neighbour edge.
- **Browser:** HEAD on :5173 and the sketch on :5184, with its own Vite cache. The scratch server has been stopped.
- `store/` is untouched (`git status` empty).

## 5. Consults, Saba questions and lessons (D-29z590)
- **`product-designer`** (new user-visible behaviour), adopted:
  - the one-rule framing;
  - nothing new on screen;
  - the title wording;
  - the drift-free formula (RU5, RU7, M-DRIFT);
  - its six rows, mapped to C rows RS-B-*.
- **Its view:** a mixed drag and nudge is acceptable for one round while Saba is asked.
- **`ableton-arrangement-expert`:** not re-consulted. Its round-264 UNKNOWN stands, and the manual was re-fetched.
- **Saba questions** (`awaiting_user`, not blocking): SABA-Q-11C-NUDGE and SABA-Q-11C-REALIGN, in `user-review/questions-11c-stage2.md` (Georgian).
- **Root request:** LIVE-MEAS-11C-OFFSET, in `user-review/live-checks.md`.
- **No new lesson:** there was no Saba-found issue. `lessons.md` is unchanged at 59 lines.

## 6. Order and checkpoint (D-29z591)
- **Order:**
  - 271: SABA-B-11c stage 2;
  - 272: SYS-6 STATUS-LIFETIME;
  - REGRESSION goes first on or after 2026-11-02;
  - RETRO at 275.
- **No `frontend-architect` checkpoint:** `grid.ts` gains pure helpers, and `ArrangementClip.tsx` changes one import and one call. There is no repeated-owner streak.

## 7. Not COMPLETE, not BLOCKED
- **Not COMPLETE:**
  - SABA-B-11c stage 2 is not implemented, and F1-ABSOLUTE-SNAP (Medium) is open;
  - unimplemented scope: SYS-5/6, STUDIO-PERFORMANCE, SYS-1..3, STORE-2b..5, REVIEW-RECOMMENDATIONS, T12-ADVANCED and the phase-2 entries (PHASE2-VIDEO-SCORING stays gated on the user go-ahead);
  - 455 deferred Lows, which must be fixed before final acceptance.
- **Not BLOCKED:** nothing external is missing. The Saba questions do not block round 271.
- **Ready for commit:** nothing new. Round 270 is already published (`4b912a9`). Root publishes round 271 after C PASS and the gate.

## 8. Artifacts
- **`b-round-270/`:**
  - probes: `probe-relative-snap.mjs` and `probe-group-nudge.mjs`, with their `*-head.json` and `*-sketch.json` results and `shots/`;
  - pre-check: `sketch.diff`, `precheck-collisions.txt`, `precheck-folder.txt`, `precheck-typecheck.txt`, `precheck-biome.txt`, `mutants.py`, `mutants.txt`, `scratch-server*.log`;
  - pre-edit copies: `backlog.before.json`, `feature-status-before.md`, `lessons-before.md`, `b-next-before.json`, `current-task-before.md`.
- **Updated:**
  - `backlog.json` (version 235);
  - `feature-status.md`;
  - `current-task.md`;
  - `b-next.json`;
  - `tasks/round-270.md` (archive);
  - `user-review/questions-11c-stage2.md` and `user-review/live-checks.md`, both new.
