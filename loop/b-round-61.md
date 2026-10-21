# B — Round 61 result → Round 62 dispatch (D-29z27)

Dispatcher: B · 2026-10-19 · I own only the planning artifacts. No app source was touched.

## 1. Resume state and inputs

- **State at start:**
  - `status.json` was `B_PLANNING_NEXT`, round 61.
  - No `b-round-61.md` and no `tasks/round-61.md` existed.
  - `current-task.md` was the round-61 task (D-29z26).
  - `b-round-61-result.json` (0 bytes) and `status.json` belong to the loop runner; I did not touch them.
- **Preserved before editing:**
  - `tasks/round-61.md`: a copy of the round-61 `current-task.md`, identical by `cmp`;
  - `b-round-61-pre-{current-task.md,backlog.json,feature-status.md,b-next.json}`;
  - `plan.before-b-round-61-r62.md`;
  - `b-round-61-checkpoint.md` (resume aid).
- **Read:**
  - round 61: `current-task.md`, `a-round-61.md`, `c-round-61.md`, `c-round-61.json`;
  - `backlog.json` (SRW-14 stages, open findings, planned rounds); `feature-status.md`; `b-next.json`; `b-round-60.md`; `root-claude-checkpoint.md`;
  - `plan.md` (D-29z17–D-29z26);
  - `root-pre-push-review.md` and `publication-checkpoint.json`. Their mtimes are unchanged since round 60, and their items are carried in §4.9 of the new task.
- **Source:**
  - `grid.ts` (all);
  - `ArrangementClip.tsx` (l.90–130, the move handler l.355–520, `finishGesture`);
  - `selection.ts` (`groupMoveBounds`, `moveClips`, `planClipLaneMove`);
  - `ArrangementLane.tsx` (the library drop, l.160–260);
  - `grid-snap-clip-edges.test.tsx` (the harness and every `it`);
  - `view.ts` (`clampTimelineZoom`: 0.5–320).
- **Evidence:**
  - C's round-55 probe source `c-round-55/scratch/mut/…/c-probe-r55.test.tsx` l.744–766 and `c-round-55/runs/probes.txt`;
  - `b-round-46/ableton-6.7-6.10-20261016.txt`;
  - the user transcript `docs/video-to-text-bugs/transcripts/2.srt` 05:08–08:02.
- **Tree check** (`b-round-61/gates.txt`, ~11:15 +04):
  - HEAD `038ed5a`; 30 status lines (case A);
  - protected 4/4 OK; the round-61 frozen list has 0 non-OK;
  - `node.exe` 13;
  - **`/studio-lab` 200, `:5199` 000.**

## 2. Round 61: what C evidenced

**C PASS, no bugs.** Only C's evidence below changes the backlog.

| Area | Evidence | Backlog effect |
|---|---|---|
| Offline | G61-2 (case A, 30 lines; frozen 418; protected 4/4); R61-S (same-reference keydown add/remove, AST 35/35 + GM32–GM35); R61-U (a–f, r60 g/h/i, r58 a/d, r59 k killed); G61-1 (tsc 0; Biome 5/218/1; 89 / 1556; verify rc 0 on attempt 1) | fix-up offline PASS |
| Browser | MN-EDGE-FOCUS, MN-CONTEXT, MN-REPEAT, VSCROLL-CLOSE (1440 and 1280); MN-ITEM-PRESS, MN-KEY-RELEASE, MN-FOLLOW (+ overflow extra), MN-DISMISS-BUTTON, MN-KEYS, SEL-KEYS | **C-R60-01, C-R60-02, ROOT-R50-58-L1 closed** |
| Tests | GM35 kills f | **A-R60-REVIEW-BLUR-CAPTURE-TEST closed** |
| G61-3 | anonymous `/studio-lab`; 0 forbidden requests; token 401; fake Bearer 403 (10-18) / **500 (10-19, backend down)**; `/studio/middle-east` asks to sign in | purchase protection holds (fail-closed); INFO-R61-FAKEBEARER-500 → root |
| Info | xspan, xleak, A's CLOSEST-SCOPE and FOLLOW-AUTOSCROLL-DUP | recorded, not scheduled |

**Stage 4b is complete.** Not run (honest, carried):
- video sync (RF3-1, RF3-2, R5-L6 = C-R27-01);
- the full find → add → fit video → export flow with WAV checks;
- the FB-01..16 regression;
- smoke (root's).

**Not testable headless:** OS auto-repeat timing, a real Alt-Tab, popup-open keys, Ctrl/Cmd+digit, real-layout Shift+1.

## 3. B decisions (D-29z27)

1. **No C bug pre-empts, so the next feature starts.**
   - Round 61 was the last menu-only round (D-29z26 boundary). SRW-14 stage 4c is next.
   - **4c is split, not cut:**
     - **4c-1 (round 62)** — group moves (`grid.ts` + `ArrangementClip.tsx`);
     - **4c-2 (round 63)** — library drops (`ArrangementLane.tsx`, a different gesture and test file).

     Basis: the round-size rule ("one feature") and the 4a precedent (D-29z17).
   - The INFO-R55 and SHIFT-MIDDRAG tests go into 4c-1: the plan already tied them to `grid-snap-clip-edges.test.tsx` (D-29z24).
2. **Rule G — the smallest honest group behaviour:**
   - **Anchor only:** only the dragged clip touches edges (C-R59-03 anchor rule, doc 044 l.23).
   - **Exclusions:** every member is removed from the candidate clips. Today's `clipEdgeTargets` excludes one id, so the call filters `gesture.before.clips` to non-members. No signature change.
   - **Lane rule:** on the anchor's placement lane (mirrors l.435).
   - **Grid win:** byte-identical to today (the ms delta). This keeps PG-GROUP's sub-ms member behaviour.
   - **Edge win:** a whole-µs delta (the CM12/CM16 lesson).
   - **Out-of-bounds edge:** today's `snapGroupDelta` fallback. A clamp would silently butt a non-anchor member against its neighbour.
   - **Rejected:** member edges, the clamp, and ms rounding of an edge delta.
3. **Test oracles were taken from the code and from C's evidence, not from memory** (advisor point 4):
   - every fixture's distances were computed against `snapTimeToGrid`, `clipEdgeTargets`, `groupMoveBounds` and `snapGroupDelta`;
   - CG4's fixture tells the fallback (7) apart from a clamp (7.3);
   - CE8's tie uses binary-exact values (6.375 vs 6 / 6.75);
   - CM17 uses 30 px/s, which the zoom clamp allows;
   - CM9f–CM9h use C's probe values verbatim;
   - CM10's status format is C's PG-GROUP probe line, which matches `finishGesture` l.592–594.
4. **C-R51-01 → closed by design (D-29z27-D), no code.**
   - The refusal is shown during the gesture.
   - The user transcript (`2.srt` 05:16–07:53: divisions, Snap, free placement, Ctrl toggle) asks for no post-release status.
   - Same pattern as the accepted INFO-R55-REFUSAL-STATUS-ON-RELEASE.
   - A fix would touch 3 files for an unrequested Low.
   - LD-BLOCK is re-run as a regression in 4c-2.
5. **C's round-61 deviation (browser rows run with the backend down): accepted, with a limit.**
   - The fake-Bearer 403 was verified only on 10-18, so G62-3 re-checks it with the backend up.
   - If the backend is still down, those rows are "not run (environment)" and are not counted as PASS.
6. **Rulings on A's round-61 deviations:** D1–D4 are accepted. D4: `a-round-61/scratch/` stays; removing it is root's call.

**Round size check:**
- one owner and one feature (group-edge snap);
- ~15 source lines in two files;
- 13 new `it` + 1 rewritten → 89 / 1569.

4c-2 keeps the full drop scope at round 63.

## 4. Scheduling

| Round | Content |
|---|---|
| 62 | SRW-14 stage 4c-1 (D-29z27): group-move anchor edges + C-R52-T1 + INFO-R55 + SHIFT-MIDDRAG |
| 63 | SRW-14 stage 4c-2: library-drop ghost and start on clip edges (same G1/G2 rules; dragged duration; lane rule on the drop lane; null source → grid only; video lane refused); LD-BLOCK regression. **Stage 4 closes.** |
| then | SRW-15 (+ SRW-14 stage 5), SRW-16 (FB-10), SRW-17 (FB-12), SRW-18 (FB-06), SRW-19 (FB-07), SRW-20, the batched Lows (incl. the grid-menu batch), SRW-21, full regression + root review, then T12 |

**Scope is unchanged and nothing is labelled deferred.**
- Plugins and effects, pitch, multiple video layers and audio time-stretch stay out of scope.
- Grid tempo is not audio stretch.

## 5. Ableton

**Source:** Live 12 manual §6.7 and §6.10 (B capture `b-round-46/ableton-6.7-6.10-20261016.txt`, re-read 2026-10-19).
- "Clips snap to the editing grid, as well as … the edges of other clips" is **confirmed** for dragging a clip.
- **Unconfirmed (no source):**
  - which clip of a multi-selection snaps;
  - the out-of-bounds fallback;
  - distance and priority.
- **Confirmed (§6.10):** Alt bypasses snapping.
- No video was watched and no Live installation was used. A new `/browse` was not needed: the manual sections are already captured and say nothing more about selections.
- Nowhere is "Ableton does the same" claimed for the unconfirmed rows.

## 6. Requests to root

1. **Start the backend `:5199` before A** and keep both servers up through C round 62.
2. **Commit readiness** (interim, not a release; via root's publisher flow only):
   - `cb12805` (rounds 50–58), round 59, round 60 and **round 61** are each C-ready;
   - round 62 only after C;
   - `root-claude-checkpoint.md` says the publisher has never run; starting it is the user's action.
3. **ARCH-CHECKPOINT-SRW14-PREFS, re-requested.** (a)(b)(c) have no recorded answer. For (d), root answered "keep for now" in `root-review-r50-58.md` (2026-10-18); it is re-raised only because of A-R61-ARCH-FOLLOW-AUTOSCROLL-DUP. Questions:
   - (a) the snap-preference plumbing;
   - (b) one time-precision rule (round 62 adds a ms/µs boundary);
   - (c) the shared test harness;
   - (d) `useArrangementGridMenu` + `isFollowAutoScroll`.

   **Non-gating; 4c does not wait.**
4. **INFO-R61-FAKEBEARER-500** is root's decision. `api.studio-token.ts` is protected.

## 7. Phase boundary

- SRW-14 stays **მუშავდება**: 4c-1, 4c-2 and stage 5 remain.
- **The project is not complete.**
- **Not BLOCKED:** nothing external is missing. The backend restart is root's routine action, and `/studio-lab` works without the backend.

## 8. Advisor

**Available** (the tool answered). Called after orientation, before writing. It contributed:
- the bookkeeping list;
- the ruling on the backend-down deviation and its limit;
- the 4c split;
- four design points (the member exclusion set, the anchor-only rule, bounds vs `{requested, allowed}`, µs precision);
- "read the fixtures before writing numbers";
- the C-R51-01 transcript check;
- the checkpoint file.

A second call after writing is recorded in §8.1.

### 8.1 Addendum — the post-write advisor call

- **Kill chains:** every CE/CG/CM kill chain was traced against `grid.ts`, `selection.ts` and `finishGesture`. None is broken; the counts 41 / 9 / 1569 add up.
- **Fixed:** the ARCH request claimed that root had never answered. It had: (d) was answered "keep for now" in `root-review-r50-58.md`. The wording is corrected in the task §6.3, here and in the backlog.
- **Added:** a Tech Lead line in `feature-status.md` for the C-R51-01 design closure, which can be overturned as a separate small task.
- **Recorded, not changed:** the G3 corner GROUP-SUBMS-GRID-EDGE.
  - What happens: an edge exactly on the winning grid line takes the ms path, so a sub-ms anchor can be refused where the µs path would join.
  - It is today's behaviour.
  - Option (i) was chosen: a known limitation in the task §0.1, doc 055's TODO and the backlog. I did not widen the rule without a test.
- **Script:** `b-round-61/fix_final.js`.

## 9. Outputs

- **Task files:** `current-task.md` (round 62); `tasks/round-61.md` (archive).
- **Baseline:**
  - `b-round-61-r62-tree-sha256.txt` (418);
  - `b-round-61-r62-snapshots/` (4 files + `SHA256SUMS.txt`).
- **`b-round-61/` scripts and gate output:**
  - `gates.txt`, `all-paths.txt`, `owned.txt`, `frozen-paths.txt`;
  - `fix_task.js`;
  - `update_backlog.js`;
  - `update_fs.js` (plus an inline restore of the round-60 history block);
  - `update_plan.js` (preserves `plan.md`'s 14 bare-LF lines);
  - `fix_final.js` (the post-advisor fixes).
- **Planning state:** `backlog.json` (version 64), `feature-status.md`, `b-next.json` (CONTINUE).
- **`plan.md`:** D-29z27, rows `61 →` / `62` / `63`, and the §10 status lines.
