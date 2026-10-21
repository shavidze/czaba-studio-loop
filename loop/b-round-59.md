# B — Round 59 result → Round 60 dispatch (D-29z25)

Dispatcher: B · 2026-10-18 (fresh B session after C's context restart at 10:01Z) · I own only the planning artifacts. No app source was touched.

## 1. Resume state and inputs

- **State at start:**
  - `status.json` was `B_PLANNING_NEXT`, round 59.
  - No `b-round-59.md` existed and no `tasks/round-59.md` existed. `current-task.md` was the round-59 task (D-29z24).
  - The `*.before-b-round-59.*` files are the previous B's round-58 → round-59 snapshots and were left untouched.
- **Preserved before editing:**
  - `tasks/round-59.md`: a copy of the round-59 `current-task.md`, identical by `cmp`.
  - `b-round-59-pre-{current-task.md,backlog.json,feature-status.md,b-next.json}`.
  - `plan.before-b-round-59-r60.md`.
- **Read:**
  - `current-task.md` (round 59), `a-round-59.md`, `c-round-59.md` and `c-round-59.json`;
  - `backlog.json` (items, rounds, planned rounds, open findings, architecture signals);
  - `feature-status.md`, `b-next.json` and `b-round-58.md`;
  - `root-review-r50-58.md`, the appended tail of `root-pre-push-review.md`, `publication-checkpoint.json`, `root-publish/pending/r50-58-cb12805.json`;
  - `plan.md` (D-29z24, the rounds table, §10);
  - doc 044 (the group anchor rule);
  - the source: `StudioWorkspace.tsx` (menu scroll rule, digit branch, select, keydown early returns, menu mount), `ArrangementGridMenu.tsx`, `ArrangementLane.tsx` (contextmenu), the `grid-snap-menu` harness and GM10/16/17/22–24, `grid-snap-keys` GK9/GK10, and `grid.ts` `snapGroupDelta`.
- **Tree check** (`b-round-59/gates.txt`, 14:15 +04):
  - HEAD `038ed5a`; 28 status lines (case A);
  - protected files 4/4 OK;
  - `node.exe` 12;
  - **`/studio-lab` 200, `:5199` 200.**
- **Owned-file hashes:** `StudioWorkspace` `44adb8f3`, `ArrangementGridMenu` `3b8c309c`, `grid-snap-menu` `bb56ecf0`, `grid-snap-keys` `c9f82274`. They equal C's round-59 end hashes.

## 2. Round 59: what C evidenced

**C PASS, browser included, for the first time since round 51.** Only C's evidence below changes the backlog.

| Area | Evidence | Backlog effect |
|---|---|---|
| Offline | G59-2; R59-S (AST: 25 identical, 3 suffix-only literals); R59-U (a–m, q, s killed; n, n2, p survive by design); G59-1 89 / 1544, verify rc 0 on attempt 1 | 4b-2a offline PASS |
| G59-3 | anonymous `/studio-lab` direct and via the header; 0 forbidden requests; 0 `Authorization`; token 401; fake Bearer **403**; `/studio/middle-east` sign-in | the purchase-protection browser debt (since round 51) is cleared; FAKE-BEARER-403 recorded |
| KEY-* | NARROW (both sizes), WIDEN, ENDS, MOD (Shift/Alt), TYPE, SELECT (native type-ahead → C-R59-01), SNAP, PLAY (real audio tap, 0 re-schedules), MENU | 4b-2a browser PASS |
| Round-58 half | MN-DISMISS-BUTTON 1440/1280, MN-REPOSITION, MN-FOLLOW 1440/1280 | G1, G6, C-R57-PROBE-REPOSITION and A-R58-REVIEW-GM21-POSITIONSTORE closed |
| Round-57 half | MN-OPEN, MN-EDGE (bottom clamp proven at 1280 only), MN-NATIVE (event level), MN-CHOOSE, MN-SNAP, MN-KEYS, MN-DISMISS, MN-NOEDIT, R57-FOCUS, R57-PLAY, R57-LOOK | C-R51-02 closed; FOCUS-RING recorded as info |
| Carried 4a half | EG-*, SH-*, CX-VIDEO, EP-*, LN-*, ET-*, SN/NU/RU/LB/LD, REG-HYD PASS; EG-GROUP not PASS (criterion text) | C-R52-03 closed. C-R53-01 and C-R54-01/02 closed **at regression level** (V = 6.008 is whole-ms, so sub-ms stays unit-only) |
| C-R51-01 probe | blocked release: `drop` 0, `dragend.dropEffect` `none`; lane-to-lane then drop: `drop` 1, `copy` | evidence recorded; the decision is in 4c |
| New | C-R59-01 (Low), C-R59-02 (info), C-R59-03 (spec) | see §3 |

**Not run (honest, carried):**
- video sync (RF3-1, RF3-2, R5-L6 = C-R27-01);
- the full export WAV flow;
- the FB-01..16 regression;
- smoke (root);
- a real `pointercancel`;
- mid-gesture `1`/`2`.

**Corrections recorded:**
- `root-pre-push-review.md` was appended by root at 12:46 today, so my round-59 "unchanged" line was wrong;
- the fake Bearer gives 403, not 500.

## 3. B decisions (D-29z25)

1. **C-R59-01: handle `Digit1`/`Digit2` on the focused select (C's option c).**
   - **Rejected (a), moving the hint off the select:** it hides the advertisement, but Chrome keeps focus on the select after a mouse choice, so a user who knows `1` = narrow still gets the jump to 10 s.
   - **Rejected (b), blur after `onChange`:** it breaks arrow navigation on a closed select.
   - **Kept:** round 59's GK9 / KEY-SELECT was B's contract choice, not a user requirement; C filed it as a UX defect of that contract.
   - **How:**
     - a shared `stepGridDivision`;
     - the window handler is unchanged in behaviour and still returns early for `isTypingTarget(select)`, so there is no double step;
     - `aria-keyshortcuts` and the titles stay, and become truthful.
   - **Narrow grant:** GK9 is rewritten, and GK11 is added.
   - My first advisor call proposed (a); I raised the conflict and the second call agreed with (c).
2. **ROOT-R50-58-L3:** `onContextMenu` preventDefault on the menu root. The menu renders at the workspace root, so the lane's reposition handler is never reached.
3. **ROOT-R50-58-L2 = A-R58-REVIEW-HELD-PRESS-KEY-CLICK:** release on capture `keydown` (any key) and on window `blur`.
   - The trade-off is recorded: a key pressed while the dismissing press is held lets the final release click through.
   - **B pre-check:** no existing GM test has a `keyDown` between an arming press and a click. If one turns out to change, A stops.
4. **The 4b-2b tests** in the same file and lifecycle:
   - Tab → GM30, unmount → GM31; "press inside keeps the menu open" is already covered by GM22;
   - pointercancel → GM28, right-button dismiss → GM29;
   - an `afterEach` release + probe (ROOT-R50-58-L4 = A-R58-REVIEW-AFTEREACH-RELEASE);
   - the RIGHTCLICK-TRAP authoring note.
5. **C-R59-03 `closed (task wording)`:**
   - doc 044 l.23 documents the anchor rule since stage 1, and `snapGroupDelta` implements it;
   - the corrected criterion is in round 60 §0.5; the archive `tasks/round-55.md` is not edited;
   - C confirms from its existing log, read-only.
6. **C-R59-02:** info, accepted. Rule S is scroll-based; wheel-dismiss is an unrequested contract change.
7. **ROOT-R50-58-L1 is not scheduled yet:**
   - it would be a fourth source bug, over the round cap;
   - it cannot be reproduced with 4 lanes;
   - C's VSCROLL-PROBE gathers evidence by enlarging the lanes, and B schedules from that.
8. **Round-59 deviations:** D1–D4 accepted. D5 (the wrong orchestrator status) goes to root.

**Round size check:** one owner, one area (the grid control and its menu), three bugs, plus the test-only 4b-2b gaps that were already planned for round 60. Stage 4c keeps round 61, so the independent core feature is not delayed.

## 4. Scheduling

| Round | Content |
|---|---|
| 60 | SRW-14 stage 4b-2b (D-29z25), the end of stage 4b and a feature boundary |
| 61 | round-60 bugs first. Then root's ARCH answer, if any, as its own task. Then 4c: group-move edge snap (C-R52-T1), library-drop edges + the C-R51-01 decision, the INFO-R55 / SHIFT-MIDDRAG tests. ROOT-R50-58-L1 from the probe evidence. |
| then | SRW-15 (+ SRW-14 stage 5), SRW-16 (FB-10), SRW-17 (FB-12), SRW-18 (FB-06), SRW-19 (FB-07), SRW-20, the Lows, SRW-21, full regression + root review, then T12 |

Scope is unchanged, and nothing is labelled deferred. Plugins and effects, pitch, multiple video layers and audio time-stretch stay out of scope. The grid tempo is not audio stretch.

## 5. Ableton

- **Re-used source:** Live 12 Reference Manual §6.10 (B capture `b-round-46/ableton-6.7-6.10-20261016.txt`, captured 2026-10-16). No new behaviour needed `/browse` this round:
  - none of the three bugs has a Live counterpart;
  - **the select:** not applicable, because Live has no division select;
  - **a right-click on an open menu, and the dismiss-click release:** unconfirmed, with no source;
  - **the group anchor:** unconfirmed, with no source.
- The rows are in round 60 §4.8. Nowhere is "Ableton does the same" claimed.

## 6. Requests to root

1. **Servers:** keep 5173 and 5199 up through C round 60. Please also correct the orchestrator status line: it reported 5173 up while it returned 000, in rounds 58 and 59.
2. **Commit readiness (C round 59):**
   - **Rounds 50–58:** the `cb12805` bundle is ready, now with browser evidence;
   - **Round 59:** ready as its own unit (4 modified + 2 new, on top of `cb12805`);
   - **Round 60:** only after C.

   All of these are interim, not a release. The task's content baseline accepts HEAD `038ed5a`, `cb12805`, or a later root commit that includes round 59.
3. **ARCH-CHECKPOINT-SRW14-PREFS, narrowed.**
   - **Already answered:** root's 2026-10-18 verdict for the grid-menu part is recorded ("`useArrangementGridMenu` + `isFollowAutoScroll` in one bounded task; keep for now").
   - **Still open, wanted before round 61:**
     - (a) the snap-preference plumbing vs a non-history slice;
     - (b) the time-precision rule;
     - (c) A-R59's shared grid test harness.
   - **Answer format:** keep/extract, value, risk, ≤ 3 sentences each.

## 7. Commit readiness and phase boundary

- **Stage 4b closes with round 60.** Its parts 4b-1 and 4b-2a are C-verified offline and in the browser.
- **SRW-14 stays მუშავდება:** 4b-2b, 4c and stage 5 remain.
- **The project is not complete.**

## 8. Advisor

**Available.** I called it three times:
1. **After orientation, before writing:**
   - it proposed the round composition, the closures, the narrowed ARCH request and the baseline mechanics;
   - its suggestion for C-R59-01 was option (a).
2. **The reconcile call:** I raised the conflict, because only intercepting the key fixes the behaviour after a mouse choice. It agreed: use option (c), keep the attributes, add the narrow grant and the mutation list, and add the L2 pre-check.
3. **After writing:** the final check (§8.1).

## 9. Outputs

- `current-task.md` (round 60); `tasks/round-59.md` (the archive).
- `b-round-59-r60-tree-sha256.txt` (416); `b-round-59-r60-snapshots/` (4 files + `SHA256SUMS.txt`).
- `b-round-59/gates.txt`, `all-paths.txt`, `owned.txt`, `frozen-paths.txt`, `update_backlog.js`, `update_fs.js`, `next.js`, `d29z25.md`.
- `backlog.json` (version 62), `feature-status.md` and `b-next.json` (CONTINUE).
- `plan.md`: D-29z25, the rounds-table rows `59 →` and `60`, and §10.

### 8.1 Addendum — the post-write advisor call

Three precision fixes, applied to `current-task.md` (script `b-round-59/fix_task.js`):
1. **GM26** no longer uses Space. On a non-typing target, Space toggles playback (l.1169), so the "any key" half uses `Shift`. `isPlaying` must stay `false`. Enter on a button has no workspace branch (l.1363–1366).
2. **`afterEach`:** `cleanup` is imported from `@testing-library/react` and called first; `view.unmount()` is forbidden. A probe that returns `false` on the unmutated tree is a stop.
3. **GM29:** the `pointerUp` must carry an explicit `button: 2`, otherwise mutation k survives.
