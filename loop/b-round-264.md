# B — round 264 → 265 planning

**Date:** 2026-10-30. **Role:** B (planning artifacts only; no app source touched; `store/` is clean at `2ea196e`). **Decisions:** D-29z552…D-29z558.

**Advisor:** available. I consulted it once after orientation, before writing, and once after the artifacts were written. **Project subagents:** `ableton-arrangement-expert` (Live 12 reference, §4) and `flow-sage` (marquee modifier, §4).

## 1. Inputs read
- **Archive:** `tasks/round-264.md` is an exact copy of the old `current-task.md` (`cmp` equal); nothing was deleted. Before-copies are in `b-round-264/`: `backlog-before-265.json`, `feature-status-before-265.md` and `b-next-before-265.json`.
- **A:** `a-round-264.md`, no STOP:
  - 2 new files;
  - 47/47 targeted tests;
  - M1 turned every Meta half red, and M2 turned MS3 red;
  - typecheck and lint rc 0.
- **C:** `c-round-264.md` and `c-round-264.json` = **PASS**, 13 rows, `browserVerified` and `realVerified` true, 0 bugs. GATE244-S4 was reproduced as observed evidence, as planned. The platform halves are under `notRunHere`.
- **Gate:** `gates/gate-round-264.json` = **published**, commit `2ea196e20e6c3b9099db519f807eaa4a1d95a48a` on both remotes. **This is the baseline for round 265.** HEAD is `2ea196e`, and the tree is clean (`b-round-264/head-at-planning.txt`).
- **Gate review** (`gates/round-264/review.md`): 9/10, with 4 suggestions and an Architecture note. Triage is in §5.
- **Regression:** `regression-last.json` gives round 258, 2026-10-30. The next one is due on or after 2026-11-02, so it is not due. **RETRO:** round 275.
- **Saba:** no answer file is new. `AGREE-SABA-B-7.md` has no answer, `retro-260` §12 is unanswered (R49-T included), and SABA-Q-9-* stay `awaiting_user`.

## 2. Backlog updates (only from C's evidence; D-29z552)
Applied exactly per `tasks/round-264.md` §4, PASS row:
- **L46-CONTRACT-CHECKS → done.**
- **GATE232-S2, TLM-R232-MAC, TLM-R228-META-KEYS, TLM-R233-SR-ORDER and TLM-R232-ALTGR-WIN:** "contract half verified (C round 264); platform half open_tech_lead_manual". Non-blocking.
- **GATE244-S4** stays `deferred_low_polish` with the new field `cloud_repro_c264`.
- **Rounds:** round 264 → done, round 265 → dispatched.
- **`feature-status.md`:** a new round line, plus the GATE232-S2, SABA-B-9-10-11 and RETRO-260 systemic rows.

## 3. Why round 265 = SABA-B-11c stage 1 (D-29z553)
- The pre-fixed outcome table names it for a planning before 2026-11-02.
- No Critical, High or Medium finding with a cloud repro was open at the start of this planning. GATE264-S2 was found during it (§5).
- **Split:**
  - **Stage 1** contains only what Saba already approved: a time selection on the empty background and no clamp to one clip. Moving the marquee follows from that.
  - **Stage 2 (relative snap)** has no Live source. Under L44 it is `awaiting_user` (R49-T, restated in `user-review/questions-11c.md`). It is not dispatched with a planner-chosen rule.
- **The ruler-click bullet** of review §4.3 is already covered by SABA-B-11a stage 2 and SABA-B-10a.
- **Nothing shrunk or relabelled:** stage 2 stays in the queue. The marquee (SRW-06 R6-S2) stays reachable.

## 4. Reference research and consults
- **Live 12 manual, Arrangement View**, fetched by B with WebFetch on 2026-10-30. Quoted:
  - 6.9: a background click places the insert marker; a click-drag "selects a timespan"; a drag "in the clip's waveform … allows you to select time within the clip";
  - 6.7: "Clips snap to the editing grid …";
  - 6.10: grid snap and the Alt/Cmd bypass.

  The manual describes no marquee. The page beyond character 100000 was not read; the sections cited are in the part read.
- **`ableton-arrangement-expert`** (it used the saved captures `b-round-71/ableton-*-20261021.txt`):
  - **Q1** (off-grid offset): UNKNOWN.
  - **Q2** (marquee): UNKNOWN. [SC] 42.9 has "Add Items to a Selection: Shift click or drag" and "Ctrl click".
  - **Q3** (are the clips selected?): inference only.
  - **Q4** (clamp at the clip edge): UNKNOWN. "within the clip" describes where the drag starts.
  - **Q5:** Shift-click across tracks is confirmed; a vertical drag is UNKNOWN.
  - **Q6:** snap is confirmed; the edges snapping is an inference.

  Its recommendation was to treat Q1, Q2 and Q4 as CZABA decisions. Q4 is Saba's ("no clamp"), and Q1 and Q2 go to Saba.
- **`flow-sage`:** recommends **Ctrl/Cmd+drag** for the marquee.
  - It reuses Ctrl's existing additive meaning (l.2073; the clip Ctrl-click toggle).
  - It keeps Shift free for Live's Shift-click extend.
  - A fresh marquee costs one background click.
  - **Biggest risk:** users used to the marquee press Delete on a time selection. Mitigation: Undo, plus the visible range readout. Suggested experiment, not run: 5–8 users, select-and-delete with the old build and the new one.
- **YouTube:** root's `reference/youtube/SABA-B-9-10-11-transcripts.md`, riOD 1:37: a time range over one or several tracks. That is deviation D2.

## 5. B's pre-checks (L23, L29, L50)
- **Browser baselines** at HEAD, both viewports, 0 page errors:
  - `probe-11c` (the first run was invalid: the 101 s clip filled the viewport, so the drags hit the clip; it was rerun with the clip at 10 s):
    - in-clip range clamped to "00:10.000 — 00:12.500";
    - a plain background drag draws a marquee;
    - Shift and Ctrl drags also draw a marquee;
    - a click places the insert marker;
    - from the search field, focus ends on BODY;
    - a single-lane range renders only inside a clip.
  - `probe-grid`: Snap off, grid 1 s, no BPM, 40 px/s; in-clip "00:12.500 — 00:20.000", then Delete gives clips `["10.000","20.000"]`.
  - `probe-sheet`: 48 rows, one scroller, no horizontal overflow.
- **Scratch sketch** (`tmp/b265-scratch`, outside `store/`; diff `b-round-264/sketch.diff`; typecheck clean). All 167 arrangement and component test files were run:
  - sketch v1 (Shift or Ctrl marquee): 4 red: SP13, UC10b, TG9 and SE8. SC1 went red under the sheet rows.
  - Adding only `ctrlKey: true` kept SP13, UC10b and TG9 green (63/63).
  - Final sketch (Ctrl/Cmd only + rewrites + final sheet rows): only SE8 and SC1 are red, and both are planned rewrites (`precheck-final-sketch-vitest.txt`).
- **Other test roots:**
  - `perf/studio-lab-interactions.perf.spec.ts` pins `rangeElements === 0` for an in-clip drag. Hence the binding rule "a range inside one clip renders as today".
  - `e2e/**` has no hits.
  - No other `__tests__` root imports the changed components, except the store theme and focus-ring scans, which do not depend on this behaviour.
- **Copy sweep:** two hints name only the old ways to select time: `rangeMissingReason` l.24 and the loop `needsSelection` l.289. Both stay true, so the copy is not changed this round (`strings.ts` is not granted). They are recorded as the deferred Low B-R264-RANGE-HOW-COPY (D-29z557, D-29z558).
- **L50 counts:** 20, 13 and 25. They are ruled in §2.6 of the task. The changed renders are non-focusable, and the focus outcome equals HEAD.

- **After the second advisor review:**
  - **Range bound:** its source is now named as the `timelineSeconds` prop source (K23), not the DOM width. In jsdom the DOM width would be 0.
  - **BG-INTO-CLIP / BG-EMPTY-DELETE:** the expected values were confirmed by running the real `deleteRangeKeepingGap` on the scratch copy (`b-round-264/probe-delete-range.test.ts.txt`, K24): window 1–15 over a clip at 10 s gives start 15 and offset 5; an empty window returns the same object.

## 6. Gate-264 review triage (D-29z558)
- **Suggestion 2 → GATE264-S2, Medium.** B reproduced it in cloud Chromium (`b-round-264/probe-altgr-edit.json`): a synthetic AltGr+Z runs Undo, AltGr+E splits, and AltGr+L reaches the loop handler. All three are prevented. It is not in round 265 (one feature per round). It is the next bug round, unless REGRESSION is due first.
- **Suggestion 1 + Architecture note → signal GATE264-ARCH-TEST-HELPER.** Round 265's new test file already uses `createWorkspaceTestEnvironment`.
- **Suggestion 3 → GATE264-S3,** `deferred_low_polish` (now 437 entries).
- **Suggestion 4:** no action (the formatter's output).

## 7. Saba questions (L43, L44)
`user-review/questions-11c.md` (Georgian):
- SABA-Q-11C-MARQUEE (D1);
- SABA-Q-11C-MULTILANE (D2);
- R49-T, restated with the expert's "no source".

The first two are `awaiting_user` in `open_findings`, with defaults implemented. Stage 2 waits.

## 8. Architecture
- `StudioWorkspace.tsx` (3,215 lines) is granted again. The existing non-blocking checkpoint requests already cover its handler and focus structure: ARCH-CHECKPOINT-TRANSPORT-POSITIONS and its addenda, and ARCH-CHECKPOINT-STUDIOWORKSPACE-FOCUS.
- **No new root request this planning.** 11c is not at its feature boundary (stage 2 is pending). The background-gesture code is a contained branch of an existing handler.
- If A's reviewer raises a structural note on the background or clip gesture handlers, B adds it as an addendum at the 11c boundary.

## 9. Commit readiness
Round 264 is published. Round 265 is commit-ready only after C PASS and the root gate.

## 10. Not COMPLETE, not BLOCKED
- **Open scope:**
  - SABA-B-11c (stage 1 dispatched, stage 2 `awaiting_user`);
  - GATE264-S2;
  - SYS-5 and SYS-6;
  - SABA-B-7 (awaiting Saba);
  - STUDIO-PERFORMANCE;
  - STORE-2b…5;
  - REVIEW-RECOMMENDATIONS;
  - T12-ADVANCED;
  - the phase-2 entries;
  - the 437 deferred Lows.
- **Nothing external is missing** for round 265.
